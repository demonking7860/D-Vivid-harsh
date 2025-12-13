    import { NextRequest, NextResponse } from 'next/server'
    import OpenAI from 'openai'

    interface StudentData {
      userName: string
      userEmail?: string
      userPhone?: string
      overallScore: number
      topicScoresArray: Array<{
        name: string
        correct: number
        weighted: number
        weight: number
        total: number
      }>
    }
 //fun
    // Removed LLMResponse interface - we now return data in the format expected by generate-pdf
    // The LLM is instructed to return JSON with fields matching the PDF generation requirements:
    // - "Student Name", "Student Email", "Student Phone"
    // - "Scores" object with framework names as keys
    // - "Overall Readiness Index", "Readiness Level"
    // - "Strengths", "Gaps", "Recommendations" (strings or arrays)
    // - "Country Fit (Top 3)" array

    export async function POST(request: NextRequest) {
      try {
        console.log('🔍 Analyze-results API called');
        
        let studentData: StudentData;
        try {
          studentData = await request.json();
        } catch (jsonError: any) {
          console.error('❌ Failed to parse request JSON:', jsonError);
          return NextResponse.json({ 
            error: 'Invalid JSON in request body',
            details: jsonError.message 
          }, { status: 400 });
        }
        
        console.log('📥 Received student data:', JSON.stringify(studentData, null, 2));
        
        // Validate required fields
        if (!studentData.userName) {
          console.error('❌ Missing userName in student data')
          return NextResponse.json({ error: 'Missing user name' }, { status: 400 })
        }
        
        // Sanitize and validate userName (prevent PDF injection)
        if (studentData.userName.length > 100) {
          return NextResponse.json({ error: 'Invalid user name' }, { status: 400 });
        }
        
        // Validate topicScoresArray size
        if (studentData.topicScoresArray && studentData.topicScoresArray.length > 20) {
          return NextResponse.json({ error: 'Too many topic scores' }, { status: 400 });
        }
        
        // Sanitize email and phone
        const sanitizeString = (str: string | undefined, maxLen: number): string => {
          if (!str) return '';
          return str.slice(0, maxLen).replace(/[<>]/g, '');
        };
        
        studentData.userEmail = sanitizeString(studentData.userEmail, 255);
        studentData.userPhone = sanitizeString(studentData.userPhone, 20);
        
        // Validate topicScoresArray
        if (!studentData.topicScoresArray || !Array.isArray(studentData.topicScoresArray)) {
          console.error('❌ Missing or invalid topicScoresArray in student data')
          console.error('📊 Received data:', JSON.stringify(studentData, null, 2))
          return NextResponse.json({ error: 'Missing or invalid topicScoresArray' }, { status: 400 })
        }
        
        if (studentData.topicScoresArray.length === 0) {
          console.error('❌ Empty topicScoresArray')
          return NextResponse.json({ error: 'topicScoresArray is empty' }, { status: 400 })
        }
        
        // Validate each topic score has required fields
        for (const topic of studentData.topicScoresArray) {
          if (typeof topic.correct !== 'number' || typeof topic.total !== 'number' || 
              typeof topic.weighted !== 'number' || typeof topic.weight !== 'number') {
            console.error('❌ Invalid topic score structure:', JSON.stringify(topic, null, 2))
            return NextResponse.json({ 
              error: 'Invalid topic score structure. Required: correct, total, weighted, weight (all numbers)' 
            }, { status: 400 })
          }
        }
        
        // Normalize all scores to percentages (0-100) once
        const normalizedScores: Record<string, number> = {};
        for (const t of studentData.topicScoresArray) {
          normalizedScores[t.name] = Math.round((t.correct / t.total) * 100);
        }
        
        // Map to expected dimension names (all percentages now)
        const preCalculatedScores = {
          'Financial Planning': normalizedScores['Financial Planning'] || 0,
          'Academic Readiness': normalizedScores['Academic Readiness'] || 0,
          'Career Alignment': normalizedScores['Career & Goal Alignment'] || normalizedScores['Career Alignment'] || 0,
          'Personal & Cultural': normalizedScores['Personal & Cultural Readiness'] || 0,
          'Practical Readiness': normalizedScores['Practical Readiness'] || 0,
          'Support System': normalizedScores['Support System'] || 0
        };

        // Helper to determine readiness level from score
        const determineReadinessLevel = (score: number): string => {
          if (score >= 90) return 'Excellent';
          if (score >= 80) return 'Very Good';
          if (score >= 70) return 'Good';
          if (score >= 60) return 'Satisfactory';
          if (score >= 50) return 'Needs Improvement';
          return 'Low Readiness';
        };
        
        // Deterministic timeline templates - LLM only fills rationale, code provides structure
        const timelineTemplates: Record<string, string> = {
          'Excellent': '0-3 months: Focus on application refinement. Month 1: Finalize university shortlist. Month 2: Complete applications. Month 3: Visa preparation. Risk if delayed: May miss early admission deadlines.',
          'Very Good': '3-6 months preparation. Month 1-2: Test prep if needed. Month 3-4: Applications. Month 5-6: Visa and travel. Risk if delayed: Competition increases for top programs.',
          'Good': '6-9 months preparation. Month 1-3: Address skill gaps. Month 4-6: Applications. Month 7-9: Visa and logistics. Risk if delayed: May need to defer intake.',
          'Satisfactory': '9-12 months preparation. Month 1-4: Intensive gap work. Month 5-8: Applications. Month 9-12: Final prep. Risk if delayed: Financial planning may become strained.',
          'Needs Improvement': '12-18 months preparation. Month 1-6: Foundation building. Month 7-12: Application prep. Month 13-18: Final readiness. Risk if delayed: Goals may need reassessment.',
          'Low Readiness': '18+ months recommended. Extended preparation across all dimensions before application. Risk if rushed: High likelihood of challenges abroad.'
        };
        
        const readinessLevel = determineReadinessLevel(studentData.overallScore);
        const preparationTimeline = timelineTemplates[readinessLevel];
        
        // Check if API key is available
        const apiKey = process.env.PERPLEXITY_API_KEY;
        if (!apiKey) {
          console.error('❌ PERPLEXITY_API_KEY not found in environment variables');
          throw new Error('PERPLEXITY_API_KEY not configured');
        }
        
        // Prepare the prompts - Optimized for structured output
        const systemPrompt = `You are an expert study-abroad readiness evaluator for Indian students.

INPUT: Pre-calculated dimension scores (0-100%) and weighted CRI score.
OUTPUT: Only valid JSON with STRUCTURED ARRAYS, no markdown or explanations.

COUNTRY-FIT RULES:
- Financial <60: Prefer Germany, Canada, Ireland (lower costs)
- Cultural <60: Prefer UK, Australia, USA, Canada (large Indian communities)
- Practical <60: Avoid USA (complex visa process)

COUNTRIES TO CONSIDER: Canada, Australia, UK, Germany, USA, Singapore, Ireland, Netherlands, UAE, etc.

KNOWLEDGE REQUIREMENTS:
- Use current study-abroad trends for Indian students
- Prefer commonly chosen universities
- If unsure, choose widely recognized public universities

WORD COUNT RULES (CRITICAL):
- Each Strengths insight: 20-35 words
- Each Gaps risk: 15-25 words
- Each Gaps action: 15-25 words
- Each Recommendation action: 15-25 words
- Each Recommendation outcome: 10-20 words
- Each country reasoning bullet: 15-25 words

OUTPUT FORMAT:
You MUST wrap the JSON output between these markers:
<JSON_START>
{ ...valid JSON... }
<JSON_END>

JSON RULES: No trailing commas, escape quotes with \\", numbers not strings, no markdown, arrays must be proper JSON arrays.`

        const userPrompt = `Analyze this student's study-abroad readiness:

STUDENT: ${studentData.userName}
EMAIL: ${studentData.userEmail || 'N/A'}
PHONE: ${studentData.userPhone || 'N/A'}

DIMENSION SCORES (pre-calculated percentages):
${Object.entries(preCalculatedScores).map(([name, score]) => `- ${name}: ${score}%`).join('\n')}

OVERALL CRI: ${studentData.overallScore}/100
READINESS LEVEL: ${readinessLevel}

Provide analysis wrapped in <JSON_START> and <JSON_END> markers with this EXACT structure.
IMPORTANT: Strengths, Gaps, Recommendations, and country reasoning MUST be arrays, not strings.

<JSON_START>
{
  "Student Name": "${studentData.userName}",
  "Student Email": "${studentData.userEmail || ''}",
  "Student Phone": "${studentData.userPhone || ''}",
  "Scores": {
    "Financial Planning": ${preCalculatedScores['Financial Planning']},
    "Academic Readiness": ${preCalculatedScores['Academic Readiness']},
    "Career Alignment": ${preCalculatedScores['Career Alignment']},
    "Personal & Cultural": ${preCalculatedScores['Personal & Cultural']},
    "Practical Readiness": ${preCalculatedScores['Practical Readiness']},
    "Support System": ${preCalculatedScores['Support System']}
  },
  "Overall Readiness Index": ${studentData.overallScore},
  "Readiness Level": "${readinessLevel}",
  "Preparation Timeline": "${preparationTimeline}",
  "Strengths": [
    {"dimension": "<highest scoring dimension name>", "score": <actual score>, "insight": "<20-35 words explaining WHY this dimension helps study abroad success>"},
    {"dimension": "<second highest dimension>", "score": <actual score>, "insight": "<20-35 words explaining WHY>"},
    {"dimension": "<third highest dimension>", "score": <actual score>, "insight": "<20-35 words explaining WHY>"}
  ],
  "Gaps": [
    {"dimension": "<lowest scoring dimension>", "score": <actual score>, "risk": "<15-25 words on what happens if not addressed>", "action": "<15-25 words on specific fix>"},
    {"dimension": "<second lowest dimension>", "score": <actual score>, "risk": "<15-25 words>", "action": "<15-25 words>"},
    {"dimension": "<third lowest dimension>", "score": <actual score>, "risk": "<15-25 words>", "action": "<15-25 words>"}
  ],
  "Recommendations": [
    {"priority": 1, "timeframe": "Next 30 days", "action": "<15-25 words specific action>", "outcome": "<10-20 words expected result>"},
    {"priority": 2, "timeframe": "1-3 months", "action": "<15-25 words>", "outcome": "<10-20 words>"},
    {"priority": 3, "timeframe": "3-6 months", "action": "<15-25 words>", "outcome": "<10-20 words>"},
    {"priority": 4, "timeframe": "6-9 months", "action": "<15-25 words>", "outcome": "<10-20 words>"}
  ],
  "Country Fit (Top 3)": [
    {
      "country": "<country name>",
      "match": <0-100>,
      "reasoning": [
        "<15-25 words: Financial fit based on Financial Planning score of ${preCalculatedScores['Financial Planning']}%>",
        "<15-25 words: Career outcomes and job market>",
        "<15-25 words: Cultural adaptation based on Personal & Cultural score of ${preCalculatedScores['Personal & Cultural']}%>",
        "<15-25 words: Visa process and work rights>"
      ],
      "challenges": "<specific challenges based on weak dimensions>",
      "universities": "<2-3 widely recognized university names>"
    },
    {
      "country": "<country name>",
      "match": <0-100>,
      "reasoning": [
        "<15-25 words: Financial fit>",
        "<15-25 words: Career outcomes>",
        "<15-25 words: Cultural adaptation>",
        "<15-25 words: Visa and work rights>"
      ],
      "challenges": "<challenges>",
      "universities": "<universities>"
    },
    {
      "country": "<country name>",
      "match": <0-100>,
      "reasoning": [
        "<15-25 words: Financial fit>",
        "<15-25 words: Career outcomes>",
        "<15-25 words: Cultural adaptation>",
        "<15-25 words: Visa and work rights>"
      ],
      "challenges": "<challenges>",
      "universities": "<universities>"
    }
  ]
}
<JSON_END>`;

        console.log('🌐 Calling Perplexity API...');
          const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.perplexity.ai",
          timeout: 27000,
            maxRetries: 2,
          });

        let completion: any;
        try {
              const modelPromise = openai.chat.completions.create({
            model: "sonar",
                messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
                ],
            temperature: 0.2,  // Lower for more consistent JSON
            max_tokens: 2600   // Reduced since prompts are shorter
              });
              
              const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API timeout after 25s')), 25000)
              );
              
              completion = await Promise.race([modelPromise, timeoutPromise]);
          console.log('✅ Perplexity API success');
        } catch (error: any) {
          console.error('❌ Perplexity API failed:', error.message);
          throw new Error(`Perplexity API failed: ${error.message}`);
        }

        const generatedText = completion.choices[0]?.message?.content || '';
        if (!generatedText) {
          throw new Error('Empty response from LLM');
        }
        
        console.log('✅ LLM API success!');
          console.log('📝 Generated text length:', generatedText.length);
          console.log('📝 Generated text preview:', generatedText.substring(0, 200) + '...');
          console.log('📝 Full generated text:', generatedText);
          
        // Parse the JSON response from LLM using sentinel markers
        // Telemetry variables
        let repairUsed = false;
        let fallbackUsed = false;
        let sentinelParseUsed = false;
        
        // Try sentinel-based parsing first
        const start = generatedText.indexOf('<JSON_START>');
        const end = generatedText.indexOf('<JSON_END>');
        
        let jsonString: string;
        
        if (start !== -1 && end !== -1 && end > start) {
          // Use sentinel markers
          sentinelParseUsed = true;
          jsonString = generatedText
            .slice(start + '<JSON_START>'.length, end)
            .trim();
          console.log('✅ JSON extracted using sentinel markers');
        } else {
          // Fallback to regex (for backward compatibility during transition)
          console.warn('⚠️ JSON markers not found, falling back to regex extraction');
          const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('❌ No JSON found in LLM response');
          console.error('📝 Full response:', generatedText);
          throw new Error('No JSON found in LLM response');
          }
          jsonString = jsonMatch[0];
        }
        
        console.log('📝 Extracted JSON string length:', jsonString.length);
        console.log('📝 Extracted JSON preview:', jsonString.substring(0, 500) + '...');
        
        // Function to clean and repair JSON string
        const cleanJsonString = (str: string): string => {
          // Remove trailing commas before } or ]
          str = str.replace(/,(\s*[}\]])/g, '$1');
          
          // Remove any text after the last closing brace (in case LLM added extra text)
          const lastBraceIndex = str.lastIndexOf('}');
          if (lastBraceIndex > 0 && lastBraceIndex < str.length - 1) {
            str = str.substring(0, lastBraceIndex + 1);
          }
          
          return str;
        };
        
        // Function to repair incomplete JSON by closing open braces/brackets
        const repairIncompleteJson = (str: string): string => {
          let openBraces = 0;
          let openBrackets = 0;
          let inString = false;
          let escapeNext = false;
          
          // Count open/close braces and brackets
          for (let i = 0; i < str.length; i++) {
            const char = str[i];
            
            if (escapeNext) {
              escapeNext = false;
              continue;
            }
            
            if (char === '\\') {
              escapeNext = true;
              continue;
            }
            
            if (char === '"') {
              inString = !inString;
              continue;
            }
            
            if (inString) continue;
            
            if (char === '{') openBraces++;
            else if (char === '}') openBraces--;
            else if (char === '[') openBrackets++;
            else if (char === ']') openBrackets--;
          }
          
          // Close any unclosed strings first (remove incomplete string at the end)
          if (inString) {
            // Find the last unclosed quote and remove everything after it
            const lastQuoteIndex = str.lastIndexOf('"');
            if (lastQuoteIndex > 0) {
              // Check if it's an opening quote (not escaped)
              let isEscaped = false;
              for (let i = lastQuoteIndex - 1; i >= 0 && str[i] === '\\'; i--) {
                isEscaped = !isEscaped;
              }
              if (!isEscaped) {
                str = str.substring(0, lastQuoteIndex) + '"';
              }
            }
          }
          
          // Close any unclosed arrays
          while (openBrackets > 0) {
            str += ']';
            openBrackets--;
          }
          
          // Close any unclosed objects
          while (openBraces > 0) {
            str += '}';
            openBraces--;
          }
          
          return str;
        };
        
        // Try to fix common JSON issues
        jsonString = cleanJsonString(jsonString);
        
        // Helper function to extract minimal valid JSON as fallback
        const extractMinimalJson = (str: string): any | null => {
          try {
            // Try to extract just the essential fields we can find
            const studentNameMatch = str.match(/"Student Name"\s*:\s*"([^"]+)"/);
            const studentEmailMatch = str.match(/"Student Email"\s*:\s*"([^"]*)"/);
            const studentPhoneMatch = str.match(/"Student Phone"\s*:\s*"([^"]*)"/);
            const overallIndexMatch = str.match(/"Overall Readiness Index"\s*:\s*(\d+\.?\d*)/);
            const readinessLevelMatch = str.match(/"Readiness Level"\s*:\s*"([^"]+)"/);
            
            if (studentNameMatch && overallIndexMatch) {
              // Extract scores if possible
              const scores: any = {};
              const scorePatterns = [
                { key: 'Financial Planning', pattern: /"Financial Planning"\s*:\s*(\d+)/ },
                { key: 'Academic Readiness', pattern: /"Academic Readiness"\s*:\s*(\d+)/ },
                { key: 'Career Alignment', pattern: /"Career Alignment"\s*:\s*(\d+)/ },
                { key: 'Personal & Cultural', pattern: /"Personal & Cultural"\s*:\s*(\d+)/ },
                { key: 'Practical Readiness', pattern: /"Practical Readiness"\s*:\s*(\d+)/ },
                { key: 'Support System', pattern: /"Support System"\s*:\s*(\d+)/ }
              ];
              
              scorePatterns.forEach(({ key, pattern }) => {
                const match = str.match(pattern);
                if (match) {
                  scores[key] = parseInt(match[1]);
                }
              });
              
              return {
                'Student Name': studentNameMatch[1],
                'Student Email': studentEmailMatch ? studentEmailMatch[1] : '',
                'Student Phone': studentPhoneMatch ? studentPhoneMatch[1] : '',
                'Scores': scores,
                'Overall Readiness Index': parseFloat(overallIndexMatch[1]),
                'Readiness Level': readinessLevelMatch ? readinessLevelMatch[1] : 'Unknown',
                'Preparation Timeline': 'Unable to determine - response was truncated',
                'Strengths': 'Response was truncated. Please retry the assessment.',
                'Gaps': 'Response was truncated. Please retry the assessment.',
                'Recommendations': 'Response was truncated. Please retry the assessment.',
                'Country Fit (Top 3)': []
              };
            }
            return null;
          } catch (e) {
            return null;
          }
        };
        
        let llmResult: any;
        try {
          llmResult = JSON.parse(jsonString);
          console.log('✅ Successfully parsed LLM response:', JSON.stringify(llmResult, null, 2));
        } catch (parseError: any) {
          console.error('❌ JSON parse error:', parseError.message);
          const errorPosMatch = parseError.message.match(/position (\d+)/);
          const errorPos = errorPosMatch ? parseInt(errorPosMatch[1]) : 0;
          
          if (errorPos > 0) {
            const start = Math.max(0, errorPos - 200);
            const end = Math.min(jsonString.length, errorPos + 200);
            console.error('❌ JSON string around error (position', errorPos, '):');
            console.error('❌ Context:', jsonString.substring(start, end));
            console.error('❌ Character at error position:', jsonString[errorPos], '(', jsonString.charCodeAt(errorPos), ')');
          }
          
          console.error('❌ Full JSON string:', jsonString);
          
          // Try a more aggressive fix: repair incomplete JSON
          try {
            console.log('🔄 Attempting to repair incomplete JSON...');
            repairUsed = true;
            const repairedJson = repairIncompleteJson(jsonString);
            console.log('🔄 Repaired JSON length:', repairedJson.length);
            llmResult = JSON.parse(repairedJson);
            console.log('✅ Successfully parsed repaired LLM response');
          } catch (repairError: any) {
            console.error('❌ Failed to parse even after repair:', repairError.message);
            
            // Last resort: try to extract a minimal valid JSON with just essential fields
            try {
              console.log('🔄 Attempting to extract minimal valid JSON...');
              fallbackUsed = true;
              const minimalJson = extractMinimalJson(jsonString);
              if (minimalJson) {
                llmResult = minimalJson;
                console.log('✅ Successfully extracted minimal JSON');
              } else {
                throw repairError;
              }
            } catch (minimalError: any) {
              console.error('❌ Failed to extract minimal JSON:', minimalError.message);
              throw new Error(`Failed to parse LLM JSON response: ${parseError.message}. Original error at position ${errorPos}`);
            }
          }
        }
        
        // Merge pre-calculated scores to ensure accuracy (override any LLM-generated values)
        llmResult['Student Name'] = studentData.userName;
        llmResult['Student Email'] = studentData.userEmail || '';
        llmResult['Student Phone'] = studentData.userPhone || '';
        llmResult['Scores'] = preCalculatedScores;
        llmResult['Overall Readiness Index'] = studentData.overallScore;
        llmResult['Readiness Level'] = readinessLevel;
        llmResult['Preparation Timeline'] = preparationTimeline;

        // ============= CODE-BASED STRUCTURED VALIDATION =============
        let structureValidationFailed = false;
        
        // Validate Strengths is an array with at least 3 items
        if (!Array.isArray(llmResult['Strengths']) || llmResult['Strengths'].length < 3) {
          console.warn('⚠️ Strengths validation failed - not an array or < 3 items');
          structureValidationFailed = true;
          // Create fallback structured strengths from scores
          const sortedScores = Object.entries(preCalculatedScores)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 3);
          llmResult['Strengths'] = sortedScores.map(([dim, score]) => ({
            dimension: dim,
            score: score,
            insight: `Strong performance in ${dim} (${score}%) indicates good preparation in this area, which will support your study abroad journey.`
          }));
        } else {
          // Validate each strength has required fields and word count
          for (const s of llmResult['Strengths']) {
            if (!s.dimension || !s.insight) {
              console.warn('⚠️ Strength missing dimension or insight');
            } else if (s.insight.split(' ').length < 15) {
              console.warn(`⚠️ Strength insight too short (${s.insight.split(' ').length} words): ${s.dimension}`);
            }
          }
        }
        
        // Validate Gaps is an array with at least 3 items
        if (!Array.isArray(llmResult['Gaps']) || llmResult['Gaps'].length < 3) {
          console.warn('⚠️ Gaps validation failed - not an array or < 3 items');
          structureValidationFailed = true;
          // Create fallback structured gaps from scores
          const sortedScores = Object.entries(preCalculatedScores)
            .sort(([,a], [,b]) => (a as number) - (b as number))
            .slice(0, 3);
          llmResult['Gaps'] = sortedScores.map(([dim, score]) => ({
            dimension: dim,
            score: score,
            risk: `Lower score in ${dim} (${score}%) may present challenges during your study abroad experience.`,
            action: `Focus on improving ${dim} through targeted preparation and seek guidance from your advisor.`
          }));
        } else {
          // Validate each gap has required fields
          for (const g of llmResult['Gaps']) {
            if (!g.dimension || !g.risk || !g.action) {
              console.warn('⚠️ Gap missing required fields (dimension, risk, or action)');
            }
          }
        }
        
        // Validate Recommendations is an array with at least 4 items
        if (!Array.isArray(llmResult['Recommendations']) || llmResult['Recommendations'].length < 4) {
          console.warn('⚠️ Recommendations validation failed - not an array or < 4 items');
          structureValidationFailed = true;
          // Create fallback structured recommendations
          llmResult['Recommendations'] = [
            { priority: 1, timeframe: 'Next 30 days', action: 'Schedule a consultation with D-Vivid advisor to review your assessment results', outcome: 'Personalized action plan for study abroad preparation' },
            { priority: 2, timeframe: '1-3 months', action: 'Address identified gaps in your readiness dimensions through targeted preparation', outcome: 'Improved scores in weak areas' },
            { priority: 3, timeframe: '3-6 months', action: 'Begin university research and shortlisting based on your profile', outcome: 'Clear list of target institutions' },
            { priority: 4, timeframe: '6-9 months', action: 'Prepare application materials and documentation', outcome: 'Ready to submit applications' }
          ];
        } else {
          // Validate each recommendation has required fields
          for (const r of llmResult['Recommendations']) {
            if (!r.timeframe || !r.action || !r.outcome) {
              console.warn('⚠️ Recommendation missing required fields (timeframe, action, or outcome)');
            }
          }
        }
        
        // Validate Country Fit reasoning is an array of 4 strings for each country
        if (Array.isArray(llmResult['Country Fit (Top 3)'])) {
          for (const country of llmResult['Country Fit (Top 3)']) {
            if (!Array.isArray(country.reasoning) || country.reasoning.length !== 4) {
              console.warn(`⚠️ Country reasoning not 4 bullets for ${country.country}`);
              // Convert string reasoning to array if needed
              if (typeof country.reasoning === 'string') {
                const bullets = country.reasoning.split(/\d+\)|\n|;/).filter((s: string) => s.trim().length > 10);
                country.reasoning = bullets.length >= 4 ? bullets.slice(0, 4) : [
                  `Financial fit: Aligns with your Financial Planning score of ${preCalculatedScores['Financial Planning']}%`,
                  'Career outcomes: Good job market and post-study opportunities',
                  `Cultural adaptation: Matches your Personal & Cultural score of ${preCalculatedScores['Personal & Cultural']}%`,
                  'Visa process: Reasonable visa requirements for Indian students'
                ];
              } else {
                country.reasoning = [
                  `Financial fit: Aligns with your Financial Planning score of ${preCalculatedScores['Financial Planning']}%`,
                  'Career outcomes: Good job market and post-study opportunities',
                  `Cultural adaptation: Matches your Personal & Cultural score of ${preCalculatedScores['Personal & Cultural']}%`,
                  'Visa process: Reasonable visa requirements for Indian students'
                ];
              }
            }
          }
        }
        
        if (structureValidationFailed) {
          fallbackUsed = true;
          console.warn('⚠️ Structure validation failed, fallback data used for some sections');
        }

        // Log telemetry metrics
        console.log('📊 JSON Parse Metrics:', {
          sentinelParse: sentinelParseUsed,
          repairNeeded: repairUsed,
          fallbackUsed: fallbackUsed
        });

        console.log('📤 Returning LLM result:', JSON.stringify(llmResult, null, 2))
        return NextResponse.json(llmResult)
        
      } catch (error: any) {
        console.error('❌ Error in analyze-results API:', error)
        console.error('❌ Error message:', error.message)
        console.error('❌ Error stack:', error.stack)
        return NextResponse.json({ 
          error: 'Failed to analyze results',
          details: error.message,
          stack: error.stack
        }, { status: 500 })
      }
    }
