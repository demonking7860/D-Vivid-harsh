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
        
        // Check if API key is available
        const apiKey = process.env.PERPLEXITY_API_KEY;
        if (!apiKey) {
          console.error('❌ PERPLEXITY_API_KEY not found in environment variables');
          throw new Error('PERPLEXITY_API_KEY not configured');
        }
        console.log('✅ PERPLEXITY_API_KEY found:', apiKey.substring(0, 10) + '...');
        console.log('🔑 Full API key length:', apiKey.length);
        
        // Prepare the prompts - Enhanced with comprehensive evaluation philosophy
          const systemPrompt = `You are an expert psychometric evaluator specializing in study-abroad readiness assessment for Indian students.
    
    You analyze psychometric test responses using the Comprehensive Study Abroad Assessment Framework, which uses a weighted multi-factor scoring model.
    
    EVALUATION PHILOSOPHY:
    Every multiple-choice answer maps to latent constructs:
    - Financial planning ability, budgeting confidence, risk management, cost awareness
    - Academic readiness: GPA consistency, test prep, language skills
    - Career clarity: goal alignment, program relevance, decision maturity
    - Personal & cultural readiness: adaptability, independence, social integration
    - Practical readiness: visa/document prep, tech skills, safety planning
    - Support system: family consensus, emotional resilience, backup plans
    
    SCORING METHODOLOGY:
    Each response uses a 5-point scale:
    - Response A (Strongly Agree/Very Confident) = 5 (Excellent readiness)
    - Response B (Agree/Confident) = 4 (Above average readiness)
    - Response C (Neutral/Unsure) = 3 (Moderate readiness)
    - Response D (Disagree/Weak) = 2 (Below readiness threshold)
    - Response E (Strongly Disagree/Not Ready) = 1 (Significant gap)
    
    Each dimension contributes to one of six readiness dimensions with specific weights:
    1. Financial Planning - 25% weight (Budgeting, funding confidence, risk management, cost awareness)
    2. Academic Readiness - 20% weight (GPA consistency, test prep, language skills)
    3. Career & Goal Alignment - 20% weight (Career clarity, program relevance, decision maturity)
    4. Personal & Cultural Readiness - 15% weight (Adaptability, independence, social integration)
    5. Practical Readiness - 10% weight (Visa/document prep, tech skills, safety planning)
    6. Support System - 10% weight (Family consensus, emotional resilience, backup plan)
    
    COMPREHENSIVE READINESS INDEX (CRI) CALCULATION:
    CRI = Σ(Score_i × Weight_i) for all 6 dimensions
    The CRI ranges from 0-100, providing an overall readiness assessment.
    
    READINESS LEVELS:
    90-100: Excellent (Ready to apply immediately, 0-3 months prep)
    80-89: Very Good (Minor preparation needed, 3-6 months prep)
    70-79: Good (Prepare before next cycle, 6-9 months prep)
    60-69: Satisfactory (Strengthen weak areas, 9-12 months prep)
    50-59: Needs Improvement (Major readiness gaps, 12-18 months prep)
    <50: Low Readiness (Reassess plan/delay, >18 months prep)
    
    COUNTRY-FIT MATRIX LOGIC:
    
    ALGORITHM FOR COUNTRY RECOMMENDATIONS:
    
    For each country, calculate match score based on dimension scores:
    
    1. Financial Planning score:
       - < 60: Favor Germany, Canada, Ireland, UAE (lower costs)
       - >= 60: Any country acceptable
    
    2. Academic Readiness score:
       - < 70: Suggest mid-tier universities in any country
       - >= 70: Competitive universities accessible
    
    3. Personal & Cultural Readiness score:
       - < 60: Favor UK, Australia, USA, Canada (large Indian communities)
       - >= 60: Any country suitable
    
    4. Practical Readiness score:
       - < 60: Avoid USA (complex visa), prefer straightforward processes
       - >= 60: Any country manageable
    
    5. Support System score:
       - < 60: Prioritize countries with strong student support services
       - >= 60: Any country
    
    Calculate match percentage as weighted average (0-100):
    - Strong dimension alignment = +20 points
    - Moderate alignment = +10 points
    - Weak alignment = -10 points
    - Critical mismatches = -20 points
    
    Consider countries: Canada, Australia, UK, Germany, USA, Singapore, Ireland, Netherlands, UAE.
    
    IMPORTANT FOR COUNTRY REASONING:
    - Format the "reasoning" field as 3-5 concise, single-line bullet points
    - Each bullet should be ONE sentence only (max 80-100 characters per bullet)
    - Each bullet should cite specific dimensions and scores (e.g., "High financial readiness (75%) matches moderate costs")
    - Use simple, clear sentences separated by periods
    - Do NOT write as a single paragraph - write as separate, short sentences that will be converted to bullets
    - Keep each point focused, scannable, and concise
    - Examples:
      * "Moderate tuition costs align with student's financial readiness (65%)"
      * "Strong Indian community supports cultural integration"
      * "Straightforward visa process matches practical readiness score"
    
    IMPORTANT: Ensure recommendations align with student's actual readiness level. Don't recommend highly competitive options if CRI is low.
    
    You must provide:
    1. Detailed analysis of each dimension's specific constructs
    2. Concrete, actionable recommendations tailored to Indian study-abroad context
    3. Country-specific fit assessment based on student's profile
    4. Timeline-based preparation roadmap
    
    Output ONLY valid JSON in the specified format. Be specific, data-driven, and practical.`

          const userPrompt = `DETAILED PSYCHOMETRIC ASSESSMENT REQUEST

    STUDENT INFORMATION:
    Name: ${studentData.userName}
    Email: ${studentData.userEmail || 'Not provided'}
    Phone: ${studentData.userPhone || 'Not provided'}

    TEST PERFORMANCE BY DIMENSION:
    ${studentData.topicScoresArray.map(topic => {
      const frameworkMapping: { [key: string]: { name: string; weight: number; constructs: string[] } } = {
        // Original survey section names (for backward compatibility)
        'Academic Readiness': { 
          name: 'Academic Readiness', 
          weight: 20, 
          constructs: ['GPA consistency', 'Standardized test prep', 'English language proficiency', 'Subject mastery'] 
        },
        'Cultural Adaptability': { 
          name: 'Personal & Cultural Readiness', 
          weight: 15, 
          constructs: ['Cultural openness', 'Cross-cultural communication', 'Independence', 'Emotional resilience'] 
        },
        'Career Clarity': { 
          name: 'Career & Goal Alignment', 
          weight: 20, 
          constructs: ['Career goal clarity', 'Program relevance', 'Decision maturity', 'Long-term planning'] 
        },
        'Study Abroad Readiness': { 
          name: 'Practical Readiness', 
          weight: 10, 
          constructs: ['Visa process understanding', 'Document preparation', 'Technology skills', 'Safety awareness'] 
        },
        // Actual section names from Ultra Quick Survey questions
        'Career & Goal Alignment': { 
          name: 'Career & Goal Alignment', 
          weight: 20, 
          constructs: ['Career goal clarity', 'Program relevance', 'Decision maturity', 'Long-term planning'] 
        },
        'Personal & Cultural Readiness': { 
          name: 'Personal & Cultural Readiness', 
          weight: 15, 
          constructs: ['Cultural openness', 'Cross-cultural communication', 'Independence', 'Emotional resilience'] 
        },
        'Practical Readiness': { 
          name: 'Practical Readiness', 
          weight: 10, 
          constructs: ['Visa process understanding', 'Document preparation', 'Technology skills', 'Safety awareness'] 
        },
        'Support System': { 
          name: 'Support System', 
          weight: 10, 
          constructs: ['Family consensus', 'Financial backing', 'Emotional support', 'Backup plans'] 
        },
        'Financial Planning': { 
          name: 'Financial Planning', 
          weight: 25, 
          constructs: ['Budgeting skills', 'Funding sources', 'Loan awareness', 'Cost management'] 
        }
      };
      
      const dimension = frameworkMapping[topic.name] || { name: topic.name, weight: 0, constructs: [] };
      const score = Math.round((topic.correct/topic.total)*100);
      return `• ${dimension.name} (Weight: ${dimension.weight}%): ${score}%\n  Constructs: ${dimension.constructs.join(', ')}\n  Interpretation: ${score >= 90 ? 'Excellent' : score >= 80 ? 'Very Good' : score >= 70 ? 'Good' : score >= 60 ? 'Satisfactory' : 'Needs Improvement'}`;
    }).join('\n\n')}

    AGGREGATE PERFORMANCE:
    Raw Overall Score: ${studentData.overallScore}/100
    
    CRITICAL ANALYSIS REQUIREMENTS:
    
    1. DIMENSION-BY-DIMENSION BREAKDOWN:
    For each of the 6 dimensions, provide:
    - Specific strengths observed (cite the constructs that scored well)
    - Specific gaps identified (cite the constructs that need improvement)
    - Realistic risk assessment for that dimension in international education context
    
    2. COMPREHENSIVE READINESS INDEX (CRI) CALCULATION:
    Calculate: CRI = (Financial Planning × 0.25) + (Academic Readiness × 0.20) + (Career Alignment × 0.20) + (Personal & Cultural × 0.15) + (Practical Readiness × 0.10) + (Support System × 0.10)
    This gives the weighted CRI score (0-100 range).
    
    3. READINESS LEVEL & TIMELINE:
    Based on CRI, determine:
    - Specific readiness level (Excellent/Very Good/Good/Satisfactory/Needs Improvement/Low)
    - Recommended preparation timeline
    - Key milestones to achieve before applying
    
    4. COUNTRY-FIT ANALYSIS:
    For top 3 countries, provide:
    - Match percentage (0-100%)
    - Reasoning: Provide 3-5 concise, single-line bullet points (ONE sentence each, max 80-100 chars). Each bullet should cite specific dimensions and scores. Format as simple sentences separated by periods, NOT as a paragraph.
    - Potential challenges for this student in that country
    - Specific universities or programs to consider
    
    5. ACTIONABLE RECOMMENDATIONS:
    Provide specific, actionable steps:
    - Immediate actions (next 1-3 months)
    - Short-term goals (3-6 months)
    - Medium-term preparation (6-12 months)
    - Long-term development (12+ months)
    
    OUTPUT FORMAT (CRITICAL - Return ONLY valid JSON, no markdown, no code blocks, no explanations):
    You MUST return ONLY valid JSON. Do NOT include markdown code blocks, do NOT include explanations before or after the JSON. Return ONLY the JSON object.
    
    IMPORTANT JSON RULES:
    - All strings must be properly escaped (use \\" for quotes inside strings)
    - No trailing commas
    - All numbers must be actual numbers, not strings
    - All property names must be in double quotes
    - No comments in JSON
    - Ensure all brackets and braces are properly closed
    
    {
      "Student Name": "${studentData.userName}",
      "Student Email": "${studentData.userEmail || ''}",
      "Student Phone": "${studentData.userPhone || ''}",
      "Scores": {
        "Financial Planning": ${studentData.topicScoresArray.find(t => t.name === 'Financial Planning')?.correct || 0},
        "Academic Readiness": ${studentData.topicScoresArray.find(t => t.name === 'Academic Readiness')?.correct || 0},
        "Career Alignment": ${studentData.topicScoresArray.find(t => t.name === 'Career & Goal Alignment')?.correct || studentData.topicScoresArray.find(t => t.name === 'Career Alignment')?.correct || 0},
        "Personal & Cultural": ${studentData.topicScoresArray.find(t => t.name === 'Personal & Cultural Readiness')?.correct || 0},
        "Practical Readiness": ${studentData.topicScoresArray.find(t => t.name === 'Practical Readiness')?.correct || 0},
        "Support System": ${studentData.topicScoresArray.find(t => t.name === 'Support System')?.correct || 0}
      },
      "Overall Readiness Index": <calculated CRI score as number>,
      "Readiness Level": "<determined level>",
      "Preparation Timeline": "<timeline estimate>",
      "Strengths": "<detailed paragraph citing specific constructs - escape all quotes with \\">",
      "Gaps": "<detailed paragraph citing specific weaknesses and risks - escape all quotes with \\">",
      "Recommendations": "<3-5 specific, actionable recommendations with timeline - escape all quotes with \\">",
      "Country Fit (Top 3)": [
        {"country": "<name>", "match": <number 0-100>, "reasoning": "<3-5 concise single-line bullets (ONE sentence each, max 80-100 chars per bullet) explaining why this country fits, citing specific dimensions and scores - escape all quotes with \\">", "challenges": "<specific challenges based on weak dimensions - escape all quotes with \\">", "universities": "<realistic university names - escape all quotes with \\">"},
        {"country": "<name>", "match": <number 0-100>, "reasoning": "<3-5 concise single-line bullets (ONE sentence each, max 80-100 chars per bullet) explaining why this country fits, citing specific dimensions and scores - escape all quotes with \\">", "challenges": "<specific challenges based on weak dimensions - escape all quotes with \\">", "universities": "<realistic university names - escape all quotes with \\">"},
        {"country": "<name>", "match": <number 0-100>, "reasoning": "<3-5 concise single-line bullets (ONE sentence each, max 80-100 chars per bullet) explaining why this country fits, citing specific dimensions and scores - escape all quotes with \\">", "challenges": "<specific challenges based on weak dimensions - escape all quotes with \\">", "universities": "<realistic university names - escape all quotes with \\">"}
      ]
    }
    
    REMEMBER: Return ONLY the JSON object above, nothing else. No markdown, no code blocks, no explanations.`

        console.log('🌐 Calling Perplexity API...');
          const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.perplexity.ai",
            timeout: 27000, // 27 second timeout (below 30s Amplify SSR limit)
            maxRetries: 2,
          });

          // Use Perplexity Sonar models (sonar-pro as primary)
        const models = ["sonar"];
          
          let completion: any = null;
        let lastError: any = null;
        
          for (const model of models) {
            try {
              console.log(`🔄 Trying model: ${model}`);
              
              const modelPromise = openai.chat.completions.create({
                model: model,
                messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
                ],
                temperature: 0.3,
                max_tokens: 3400  // Reduced to speed up responses
              });
              
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Model timeout')), 25000)
              );
              
              completion = await Promise.race([modelPromise, timeoutPromise]);
              console.log(`✅ Success with model: ${model}`);
              break;
            } catch (modelError: any) {
            console.error(`❌ Model ${model} failed:`, modelError.message);
            lastError = modelError;
              continue;
            }
          }
          
          if (!completion) {
          throw new Error(`All models failed. Last error: ${lastError?.message || 'Unknown error'}`);
        }

        const generatedText = completion.choices[0]?.message?.content || '';
        if (!generatedText) {
          throw new Error('Empty response from LLM');
        }
        
        console.log('✅ LLM API success!');
          console.log('📝 Generated text length:', generatedText.length);
          console.log('📝 Generated text preview:', generatedText.substring(0, 200) + '...');
          console.log('📝 Full generated text:', generatedText);
          
        // Parse the JSON response from LLM
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          console.error('❌ No JSON found in LLM response');
          console.error('📝 Full response:', generatedText);
          throw new Error('No JSON found in LLM response');
        }
        
        let jsonString = jsonMatch[0];
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
            const repairedJson = repairIncompleteJson(jsonString);
            console.log('🔄 Repaired JSON length:', repairedJson.length);
            llmResult = JSON.parse(repairedJson);
            console.log('✅ Successfully parsed repaired LLM response');
          } catch (repairError: any) {
            console.error('❌ Failed to parse even after repair:', repairError.message);
            
            // Last resort: try to extract a minimal valid JSON with just essential fields
            try {
              console.log('🔄 Attempting to extract minimal valid JSON...');
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
        
        // Validate that essential fields exist
        if (!llmResult['Student Name'] && !llmResult['studentName']) {
          throw new Error('LLM response missing required field: Student Name');
        }
        if (!llmResult['Scores'] && !llmResult['scores']) {
          throw new Error('LLM response missing required field: Scores');
        }
        if (!llmResult['Overall Readiness Index']) {
          throw new Error('LLM response missing required field: Overall Readiness Index');
        }
        if (!llmResult['Readiness Level']) {
          throw new Error('LLM response missing required field: Readiness Level');
        }
        if (!llmResult['Strengths']) {
          throw new Error('LLM response missing required field: Strengths');
        }
        if (!llmResult['Gaps']) {
          throw new Error('LLM response missing required field: Gaps');
        }
        if (!llmResult['Recommendations']) {
          throw new Error('LLM response missing required field: Recommendations');
        }

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
