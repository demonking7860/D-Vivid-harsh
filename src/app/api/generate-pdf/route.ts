import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const results = await request.json()
    console.log('📄 PDF Generation - Received data:', JSON.stringify(results, null, 2))
    
    // Validate required fields
    if (!results['Student Name'] && !results.studentName) {
      console.error('❌ Missing Student Name in PDF data')
      return NextResponse.json({ error: 'Missing student name' }, { status: 400 })
    }
    
    // Launch Chromium in a serverless-friendly way on Vercel, and use Puppeteer locally
    const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME
    let browser: any

    if (isServerless) {
      // Vercel / Lambda: use puppeteer-core + @sparticuz/chromium
      const chromium = (await import('@sparticuz/chromium')).default
      const puppeteerCore = (await import('puppeteer-core')).default

  // Prefer chromium's bundled executable path for serverless; fall back to env if needed
  const chromiumPath = await chromium.executablePath()
  const executablePath = chromiumPath || process.env.PUPPETEER_EXECUTABLE_PATH

      browser = await puppeteerCore.launch({
        args: chromium.args,
        executablePath,
        headless: true,
        timeout: 30000,
      })
    } else {
      // Local dev: use full puppeteer (downloads Chrome on install)
      const puppeteer = (await import('puppeteer')).default
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ],
        timeout: 30000
      })
    }
    
    const page = await browser.newPage()
    
    // Set page timeout
    page.setDefaultTimeout(30000) // 30 second timeout
    page.setDefaultNavigationTimeout(30000)
    
    // Generate HTML content for the PDF
    const htmlContent = generateHTMLContent(results)
    console.log('📄 Generated HTML content length:', htmlContent.length)
    
    // Set viewport size to A4 dimensions
    await page.setViewport({
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
    });

    // Enable print and background colors
    await page.emulateMediaType('print');

    // Set content with better wait conditions
    await page.setContent(htmlContent, { 
      waitUntil: ['domcontentloaded', 'networkidle0'],
      timeout: 30000 
    });

    // Additional time for CSS animations and renders
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('📄 Page content loaded successfully');
    
    // Wait for any dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Generate PDF - no fallback, errors will be returned to user
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      timeout: 30000, // 30 second timeout for PDF generation
      scale: 1.0, // Ensure 100% scale
      landscape: false
    });
    
    console.log('📄 PDF generated, buffer size:', pdfBuffer.length)
    
    // Validate PDF buffer
    if (pdfBuffer.length === 0) {
      console.error('❌ PDF buffer is empty');
      await browser.close();
      return NextResponse.json({ error: 'PDF generation failed - empty buffer' }, { status: 500 });
    }
    
  await browser.close()
    
    console.log('📄 Returning PDF response with size:', pdfBuffer.length)
    
    // Return PDF as response - use Response constructor for binary data
    return new Response(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="psychometric-report-${(results['Student Name'] || results.studentName).replace(/\s+/g, '-').toLowerCase()}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}

function generateHTMLContent(results: any): string {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Get data from LLM format - no fallbacks, use actual data only
  const studentName = results['Student Name'] || results.studentName;
  const studentEmail = results['Student Email'] || results.studentEmail || results.userEmail || '';
  const studentPhone = results['Student Phone'] || results.studentPhone || results.userPhone || '';
  
  // Validate required fields
  if (!studentName) {
    throw new Error('Student Name is required');
  }
  
  // Get scores object - validate it exists
  const scoresRaw = results.scores || results.Scores || results['Scores'];
  if (!scoresRaw) {
    throw new Error('Scores data is required');
  }
  
  // Helper function to parse scores and ensure they are numbers
  const parseScore = (score: any): number => {
    if (typeof score === 'number') return Math.round(score);
    if (typeof score === 'string') {
      // Remove any % signs and non-numeric characters, then convert to number
      const cleaned = score.replace(/[^\d.]/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : Math.round(num);
    }
    return 0;
  };
  
  // Extract individual scores with parsing
  const scores = {
    'Financial Planning': parseScore(scoresRaw['Financial Planning']),
    'Academic Readiness': parseScore(scoresRaw['Academic Readiness']),
    'Career Alignment': parseScore(scoresRaw['Career Alignment']),
    'Personal & Cultural': parseScore(scoresRaw['Personal & Cultural']),
    'Practical Readiness': parseScore(scoresRaw['Practical Readiness']),
    'Support System': parseScore(scoresRaw['Support System'])
  };
  
  // Validate required scores exist and parse Overall Index
  const overallIndexRaw = results['Overall Readiness Index'] || results.overallIndex;
  if (overallIndexRaw === undefined) {
    throw new Error('Overall Readiness Index is required');
  }
  const overallIndex = parseScore(overallIndexRaw);
  
  const readinessLevel = results['Readiness Level'] || results.readinessLevel;
  if (!readinessLevel) {
    throw new Error('Readiness Level is required');
  }
  
  const strengths = results.Strengths;
  if (!strengths) {
    throw new Error('Strengths analysis is required');
  }
  
  const gaps = results.Gaps;
  if (!gaps) {
    throw new Error('Gaps analysis is required');
  }
  
  const recommendations = results.Recommendations;
  if (!recommendations) {
    throw new Error('Recommendations are required');
  }
  
  const countryFit = results['Country Fit (Top 3)'] || [];

  // Helper to format text into bullet points
  const formatToBulletPoints = (text: string | string[] | undefined) => {
    if (!text) {
      return `<li class="bullet-item">Information not available</li>`;
    }

    // Handle array input
    if (Array.isArray(text)) {
      return text.map(item => `<li class="bullet-item">${item.trim()}</li>`).join('');
    }

    // Handle string input
    if (typeof text === 'string') {
      if (text === 'No strengths identified' || text === 'No gaps identified' || text === 'No recommendations provided') {
        return `<li class="bullet-item">Information not available</li>`;
      }

      // Split by common delimiters and create bullet points
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const points = sentences.length > 1 ? sentences : text.split(/[,;]+/).filter(s => s.trim().length > 0);

      return points.map(point => {
        const cleanPoint = point.trim().replace(/^\d+\.?\s*/, ''); // Remove leading numbers
        return `<li class="bullet-item">${cleanPoint}</li>`;
      }).join('');
    }

    // Handle any other type
    return `<li class="bullet-item">Invalid input format</li>`;
  };

  // Helper to get weight for a framework
  const getFrameworkWeight = (framework: string) => {
    switch (framework) {
      case 'Financial Planning': return '25%';
      case 'Academic Readiness': return '20%';
      case 'Career Alignment': return '20%';
      case 'Personal & Cultural': return '15%';
      case 'Practical Readiness': return '10%';
      case 'Support System': return '10%';
      default: return '0%';
    }
  };

  // Helper to generate compact score card
  const generateScoreCard = (label: string, score: number | string, weight: string) => {
    // Ensure we have a clean numeric value
    let cleanScore: number;
    if (typeof score === 'number') {
      cleanScore = Math.round(score);
    } else if (typeof score === 'string') {
      // Remove % and any non-numeric characters
      const cleaned = score.replace(/[^\d.]/g, '');
      cleanScore = Math.round(parseFloat(cleaned) || 0);
    } else {
      cleanScore = 0;
    }
    
    const barClass = cleanScore >= 80 ? 'excellent' : cleanScore >= 60 ? 'good' : cleanScore >= 40 ? 'average' : 'weak';
    
    return `
      <div class="score-card">
        <h4>${label}</h4>
        <div class="score-value">${cleanScore}%</div>
        <div class="score-bar">
          <div class="score-fill ${barClass}" style="width: ${cleanScore}%"></div>
        </div>
      </div>
    `;
  };

  // Helper to generate radar chart
  const generateRadarChart = (scores: any) => {
    const categories = [
      { name: 'Financial Planning', score: parseScore(scores['Financial Planning']) },
      { name: 'Academic Readiness', score: parseScore(scores['Academic Readiness']) },
      { name: 'Career Alignment', score: parseScore(scores['Career Alignment']) },
      { name: 'Personal & Cultural', score: parseScore(scores['Personal & Cultural']) },
      { name: 'Practical Readiness', score: parseScore(scores['Practical Readiness']) },
      { name: 'Support System', score: parseScore(scores['Support System']) }
    ];
    
    return categories.map(category => `
      <div class="radar-item">
        <div class="radar-label">${category.name}</div>
        <div class="radar-score">${category.score}%</div>
      </div>
    `).join('');
  };

  // Helper to generate trend chart
  const generateTrendChart = (scores: any) => {
    const categories = [
      { name: 'Financial', score: parseScore(scores['Financial Planning']) },
      { name: 'Academic', score: parseScore(scores['Academic Readiness']) },
      { name: 'Career', score: parseScore(scores['Career Alignment']) },
      { name: 'Cultural', score: parseScore(scores['Personal & Cultural']) },
      { name: 'Practical', score: parseScore(scores['Practical Readiness']) },
      { name: 'Support', score: parseScore(scores['Support System']) }
    ];
    
    return categories.map(category => `
      <div class="trend-bar">
        <div class="trend-label">${category.name}</div>
        <div class="trend-progress">
          <div class="trend-fill" style="width: ${category.score}%"></div>
        </div>
        <div class="trend-value">${category.score}%</div>
      </div>
    `).join('');
  };

  // Helper to format description text into bullet points for country matrix
  const formatDescriptionToBullets = (text: string): string => {
    if (!text) return '<div class="country-matrix-text">Good study destination</div>';
    
    // For country matrix, we want flowing paragraph text instead of many bullets
    // Clean up the text and format as paragraphs with proper spacing
    const cleanedText = text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    // Split into sentences for better readability
    const sentences = cleanedText.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.match(/^\s*$/));
    
    // Group sentences into paragraphs (2-3 sentences per paragraph)
    let paragraphs: string[] = [];
    for (let i = 0; i < sentences.length; i += 2) {
      const paragraphSentences = sentences.slice(i, i + 2).join('. ');
      if (paragraphSentences.length > 0) {
        paragraphs.push(paragraphSentences + (paragraphSentences.endsWith('.') ? '' : '.'));
      }
    }
    
    // If we have multiple paragraphs, format them; otherwise just use the cleaned text
    if (paragraphs.length > 1) {
      return `<div class="country-matrix-text">${paragraphs.map(p => `<p>${p}</p>`).join('')}</div>`;
    } else {
      return `<div class="country-matrix-text">${cleanedText}</div>`;
    }
  };

  // Helper to generate country matrix - now supports both string and object formats
  const generateCountryMatrix = (countries: any[]) => {
    return countries.map((countryData, index) => {
      // Handle both old format (string) and new format (object)
      const country = typeof countryData === 'string' ? countryData : countryData.country;
      let matchScore = typeof countryData === 'string' ? Math.round(100 - (index * 15)) : countryData.match || 100;
      matchScore = parseScore(matchScore); // Ensure it's a number
      const description = typeof countryData === 'string' ? 'Well-suited destination for study abroad' : (countryData.reasoning || 'Good study destination');
      
      // Load the country flag SVG
      const countryFlag = loadCountryFlagSVG(country);
      
      // Format description as bullet points
      const descriptionBullets = formatDescriptionToBullets(description);
      
      return `
        <div class="country-matrix-item">
          <div class="country-matrix-rank">#${index + 1}</div>
          <div class="country-matrix-flag">${countryFlag}</div>
          <div class="country-matrix-name">${country}</div>
          <div class="country-matrix-score">${matchScore}% Match</div>
          <div class="country-matrix-desc">${descriptionBullets}</div>
        </div>
      `;
    }).join('');
  };

  // Helper function to load SVG file and convert to base64 data URI
  const loadCountryFlagSVG = (countryName: string): string => {
    // Comprehensive map of country names to SVG file codes (ISO 3166-1 alpha-2 codes)
    const countryToCodeMap: { [key: string]: string } = {
      // Major Study Abroad Destinations
      'Singapore': 'sg',
      'Ireland': 'ie',
      'Netherlands': 'nl',
      'Holland': 'nl',
      'Canada': 'ca',
      'Australia': 'au',
      'United Kingdom': 'gb',
      'UK': 'gb',
      'U.K.': 'gb',
      'U.K': 'gb',
      'Britain': 'gb',
      'Great Britain': 'gb',
      'Germany': 'de',
      'Deutschland': 'de',
      'United States': 'us',
      'USA': 'us',
      'US': 'us',
      'U.S.A': 'us',
      'U.S.A.': 'us',
      'United States of America': 'us',
      'America': 'us',
      'India': 'in',
      'United Arab Emirates': 'ae',
      'UAE': 'ae',
      'New Zealand': 'nz',
      'France': 'fr',
      'Sweden': 'se',
      'Norway': 'no',
      'Denmark': 'dk',
      'Finland': 'fi',
      'Switzerland': 'ch',
      'Austria': 'at',
      'Belgium': 'be',
      'Italy': 'it',
      'Spain': 'es',
      'Portugal': 'pt',
      'Greece': 'gr',
      'Poland': 'pl',
      'Czech Republic': 'cz',
      'Hungary': 'hu',
      'Romania': 'ro',
      'Japan': 'jp',
      'South Korea': 'kr',
      'Korea': 'kr',
      'China': 'cn',
      'Hong Kong': 'hk',
      'Taiwan': 'tw',
      'Thailand': 'th',
      'Malaysia': 'my',
      'Indonesia': 'id',
      'Philippines': 'ph',
      'Vietnam': 'vn',
      'South Africa': 'za',
      'Brazil': 'br',
      'Mexico': 'mx',
      'Argentina': 'ar',
      'Chile': 'cl',
      'Turkey': 'tr',
      'Israel': 'il',
      'Saudi Arabia': 'sa',
      'Qatar': 'qa',
      'Kuwait': 'kw',
      'Oman': 'om',
      'Bahrain': 'bh',
      'Russia': 'ru',
      'Ukraine': 'ua',
      'Belarus': 'by',
      'Estonia': 'ee',
      'Latvia': 'lv',
      'Lithuania': 'lt',
      'Slovakia': 'sk',
      'Slovenia': 'si',
      'Croatia': 'hr',
      'Serbia': 'rs',
      'Bulgaria': 'bg',
      'Cyprus': 'cy',
      'Malta': 'mt',
      'Iceland': 'is',
      'Luxembourg': 'lu',
      'Monaco': 'mc',
      'Andorra': 'ad',
      'Liechtenstein': 'li',
      'San Marino': 'sm',
      'Vatican City': 'va',
      'Vatican': 'va'
    };

    // Normalize country name (case-insensitive, handle variations)
    const normalizedCountry = countryName?.trim() || '';
    const countryCode = Object.keys(countryToCodeMap).find(key =>
      key.toLowerCase() === normalizedCountry.toLowerCase() ||
      normalizedCountry.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(normalizedCountry.toLowerCase())
    );
    
    const code = countryCode ? countryToCodeMap[countryCode] : null;
    
    // If no code found, try to extract first two letters as fallback code
    if (!code) {
      // Try to find a match by checking if any country name starts with the normalized country
      const partialMatch = Object.keys(countryToCodeMap).find(key =>
        normalizedCountry.toLowerCase().startsWith(key.toLowerCase()) ||
        key.toLowerCase().startsWith(normalizedCountry.toLowerCase())
      );
      const finalCode = partialMatch ? countryToCodeMap[partialMatch] : null;
      
      if (!finalCode) {
        // Fallback: use first two letters as country code
        const fallbackCode = normalizedCountry.substring(0, 2).toLowerCase();
        return `<svg width="70" height="45" viewBox="0 0 100 60" class="country-map" preserveAspectRatio="xMidYMid meet"><rect width="100" height="60" fill="#3498db" rx="8"/><text x="50" y="35" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${fallbackCode.toUpperCase()}</text></svg>`;
      }
      
      // Use the partial match code
      const svgPath = path.join(process.cwd(), 'svg', `${finalCode}.svg`);
      if (fs.existsSync(svgPath)) {
        try {
          const svgContent = fs.readFileSync(svgPath, 'utf-8');
          const cleanedSVG = svgContent
            .replace(/<svg([^>]*)>/, `<svg width="70" height="45" $1 class="country-map" preserveAspectRatio="xMidYMid meet">`)
            .trim();
          return cleanedSVG;
        } catch (error) {
          console.error(`Error loading SVG for ${countryName}:`, error);
        }
      }
      
      // Final fallback
      return `<svg width="70" height="45" viewBox="0 0 100 60" class="country-map" preserveAspectRatio="xMidYMid meet"><rect width="100" height="60" fill="#3498db" rx="8"/><text x="50" y="35" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${normalizedCountry.substring(0, 2).toUpperCase()}</text></svg>`;
    }

    try {
      // Get the SVG file path - adjust path based on execution context
      const svgPath = path.join(process.cwd(), 'svg', `${code}.svg`);
      
      // Read SVG file
      if (fs.existsSync(svgPath)) {
        const svgContent = fs.readFileSync(svgPath, 'utf-8');
        // Clean the SVG content and add class, width, height for styling
        // Ensure width and height are set for consistent PDF rendering
        let cleanedSVG = svgContent.trim();
        
        // Remove existing width/height attributes if present, then add our own
        cleanedSVG = cleanedSVG.replace(/\s+width="[^"]*"/gi, '');
        cleanedSVG = cleanedSVG.replace(/\s+height="[^"]*"/gi, '');
        cleanedSVG = cleanedSVG.replace(/<svg([^>]*)>/, `<svg width="70" height="45" $1 class="country-map" preserveAspectRatio="xMidYMid meet">`);
        
        // Return the SVG directly embedded in HTML
        return cleanedSVG;
      } else {
        console.warn(`SVG file not found for country: ${countryName} (code: ${code})`);
        // Fallback with proper dimensions
        return `<svg width="70" height="45" viewBox="0 0 100 60" class="country-map" preserveAspectRatio="xMidYMid meet"><rect width="100" height="60" fill="#3498db" rx="8"/><text x="50" y="35" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${normalizedCountry.substring(0, 2).toUpperCase()}</text></svg>`;
      }
    } catch (error) {
      console.error(`Error loading SVG for ${countryName}:`, error);
      // Fallback with proper dimensions
      return `<svg width="70" height="45" viewBox="0 0 100 60" class="country-map" preserveAspectRatio="xMidYMid meet"><rect width="100" height="60" fill="#3498db" rx="8"/><text x="50" y="35" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${normalizedCountry.substring(0, 2).toUpperCase()}</text></svg>`;
    }
  };

  // Helper function to load AVIF logo and convert to base64 data URI
  const loadLogoAVIF = (): string => {
    try {
      const logoPath = path.join(process.cwd(), 'logo.avif');
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        const logoBase64 = logoBuffer.toString('base64');
        return `data:image/avif;base64,${logoBase64}`;
      } else {
        console.warn('Logo file not found, using fallback SVG');
        // Return a simple SVG fallback
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODUiIGhlaWdodD0iODUiIHZpZXdCb3g9IjAgMCAzMjAgODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJsb2dvR3JhZCIgeDE9IjAiIHk1PSIwIiB4Mj0iMzIwIiB5Mj0iODAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBzdG9wLWNvbG9yPSIjMDAzQjhDIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNUJFOEI5Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHAgZD0iTTAgMCBMNzAgMCBMMzUgNjAgWiIgZmlsbD0idXJsKCNsb2dvR3JhZCkiIG9wYWNpdHk9IjAuOTUiLz48L3N2Zz4=';
      }
    } catch (error) {
      console.error('Error loading logo:', error);
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODUiIGhlaWdodD0iODUiIHZpZXdCb3g9IjAgMCAzMjAgODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJsb2dvR3JhZCIgeDE9IjAiIHk1PSIwIiB4Mj0iMzIwIiB5Mj0iODAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBzdG9wLWNvbG9yPSIjMDAzQjhDIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNUJFOEI5Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHAgZD0iTTAgMCBMNzAgMCBMMzUgNjAgWiIgZmlsbD0idXJsKCNsb2dvR3JhZCkiIG9wYWNpdHk9IjAuOTUiLz48L3N2Zz4=';
    }
  };

  // Load logo once
  const logoDataURI = loadLogoAVIF();

  // Helper to generate compact country card with country map SVG - now supports both formats
  const generateCountryCard = (countryData: any, index: number) => {
    // Handle both old format (string) and new format (object)
    const country = typeof countryData === 'string' ? countryData : countryData.country;
    let matchScore = typeof countryData === 'string' ? Math.round(100 - (index * 15)) : countryData.match || 100;
    matchScore = parseScore(matchScore); // Ensure it's a number
    const universities = typeof countryData === 'object' ? countryData.universities : '';
    
    // Load the actual SVG flag from file
    const countryMap = loadCountryFlagSVG(country);
    
    // OLD CODE REMOVED - now using SVG files from svg folder
    const countryMaps_DEPRECATED: { [key: string]: string } = {
      'Singapore': `<svg viewBox="0 0 100 60" class="country-map"><rect width="100" height="60" fill="#e74c3c" rx="8"/><text x="50" y="35" text-anchor="middle" fill="white" font-size="12" font-weight="bold">SG</text></svg>`,
      'Ireland': `<svg viewBox="0 0 100 60" class="country-map"><rect width="33" height="60" fill="#009639"/><rect x="33" width="34" height="60" fill="white"/><rect x="67" width="33" height="60" fill="#ff7900"/><text x="50" y="35" text-anchor="middle" fill="black" font-size="10" font-weight="bold">IE</text></svg>`,
      'Netherlands': `<svg viewBox="0 0 100 60" class="country-map"><rect width="100" height="20" fill="#c8102e"/><rect y="20" width="100" height="20" fill="white"/><rect y="40" width="100" height="20" fill="#003da5"/><text x="50" y="35" text-anchor="middle" fill="black" font-size="10" font-weight="bold">NL</text></svg>`,
      'Canada': `<svg viewBox="0 0 100 60" class="country-map"><rect width="25" height="60" fill="#ff0000"/><rect x="25" width="50" height="60" fill="white"/><rect x="75" width="25" height="60" fill="#ff0000"/><text x="50" y="35" text-anchor="middle" fill="red" font-size="10" font-weight="bold">🍁</text></svg>`,
      'Australia': `<svg viewBox="0 0 100 60" class="country-map"><rect width="100" height="60" fill="#012169"/><rect width="50" height="30" fill="#012169"/><text x="70" y="45" text-anchor="middle" fill="white" font-size="10" font-weight="bold">AU</text></svg>`,
      'United Kingdom': `<svg viewBox="0 0 100 60" class="country-map"><rect width="100" height="60" fill="#012169"/><path d="M0,0 L100,60 M100,0 L0,60" stroke="white" stroke-width="6"/><path d="M50,0 L50,60 M0,30 L100,30" stroke="white" stroke-width="10"/><path d="M0,0 L100,60 M100,0 L0,60" stroke="#c8102e" stroke-width="4"/><path d="M50,0 L50,60 M0,30 L100,30" stroke="#c8102e" stroke-width="6"/></svg>`,
      'Germany': `<svg viewBox="0 0 100 60" class="country-map"><rect width="100" height="20" fill="#000000"/><rect y="20" width="100" height="20" fill="#dd0000"/><rect y="40" width="100" height="20" fill="#ffce00"/><text x="50" y="35" text-anchor="middle" fill="white" font-size="10" font-weight="bold">DE</text></svg>`,
      'United States': `<svg viewBox="0 0 100 60" class="country-map"><rect width="100" height="60" fill="#b22234"/><rect y="0" width="100" height="5" fill="white"/><rect y="10" width="100" height="5" fill="white"/><rect y="20" width="100" height="5" fill="white"/><rect y="30" width="100" height="5" fill="white"/><rect y="40" width="100" height="5" fill="white"/><rect y="50" width="100" height="5" fill="white"/><rect width="40" height="35" fill="#3c3b6e"/><text x="70" y="45" text-anchor="middle" fill="white" font-size="10" font-weight="bold">US</text></svg>`,
      'India': `<svg viewBox="0 0 100 60" class="country-map"><rect width="100" height="20" fill="#ff9933"/><rect y="20" width="100" height="20" fill="white"/><rect y="40" width="100" height="20" fill="#138808"/><circle cx="50" cy="30" r="8" fill="none" stroke="#000080" stroke-width="1"/><text x="50" y="35" text-anchor="middle" fill="#000080" font-size="8" font-weight="bold">☸</text></svg>`,
      'United Arab Emirates': `<svg viewBox="0 0 100 60" class="country-map"><rect width="25" height="60" fill="#ce1126"/><rect x="25" width="75" height="20" fill="#009639"/><rect x="25" y="20" width="75" height="20" fill="white"/><rect x="25" y="40" width="75" height="20" fill="#000000"/><text x="60" y="35" text-anchor="middle" fill="red" font-size="10" font-weight="bold">AE</text></svg>`
    };
    
    // const countryMap = countryMaps_DEPRECATED[country] || `<svg viewBox="0 0 100 60" class="country-map"><rect width="100" height="60" fill="#3498db" rx="8"/><text x="50" y="35" text-anchor="middle" fill="white" font-size="10" font-weight="bold">🌍</text></svg>`;
    
    return `
      <div class="country-card">
        <div class="country-rank">#${index + 1}</div>
        <div class="country-flag">${countryMap}</div>
        <div class="country-name">${country}</div>
        <div class="country-score">${matchScore}% Match</div>
        ${universities ? `<div class="universities-section"><span class="universities-label">Universities:</span><span class="universities-list">${universities}</span></div>` : ''}
      </div>
    `;
  };

  // Helper to generate recommendation sections
  const generateRecommendationSection = (title: string, items: string[], icon: string) => `
    <div class="recommendation-section">
      <div class="recommendation-header">
        <span class="recommendation-icon">${icon}</span>
        <h4>${title}</h4>
      </div>
      <div class="recommendation-content">
        ${items.map((item, index) => `
          <div class="recommendation-item">
            <span class="item-number">${index + 1}</span>
            <span class="item-text">${item}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>D-Vivid Consultant - Study Abroad Assessment Report</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Poppins', sans-serif;
                line-height: 1.5;
                color: #333;
                background: #ffffff;
                margin: 0;
                padding: 0;
                font-size: 16px;
            }
            
            .page {
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                background: #ffffff;
                position: relative;
                padding: 0;
            }
            
            .page-break {
                page-break-before: always;
                break-before: page;
            }
            
            .country-page {
                min-height: calc(297mm - 160px);
                padding: 25px 30px 120px 30px;
                background: linear-gradient(135deg, #ffffff 0%, #f8fafb 100%);
            }
            
            .header {
                background: linear-gradient(135deg, #003B8C 0%, #1e40af 25%, #5BE49B 75%, #22c55e 100%);
                color: white;
                padding: 15px 25px;
                text-align: center;
                position: relative;
                overflow: hidden;
                height: 100px;
                min-height: 100px;
                border-radius: 16px 16px 0 0;
                box-shadow: 0 4px 15px rgba(0, 59, 140, 0.3);
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 200%;
                height: 100%;
                background: linear-gradient(45deg, 
                    transparent 30%, 
                    rgba(255,255,255,0.1) 50%, 
                    transparent 70%);
                animation: headerShine 4s ease-in-out infinite;
            }
            
            @keyframes headerShine {
                0% { left: -100%; }
                50% { left: 100%; }
                100% { left: -100%; }
            }
            
            .header-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 100%;
            }
            
            .logo-section {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .logo {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #ffffff, #f8f9fa);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 6px 20px rgba(0,0,0,0.4);
                border: 3px solid rgba(255,255,255,0.3);
                position: relative;
                z-index: 2;
            }
            
            .logo img {
                max-width: 80%;
                max-height: 80%;
            }
            
            .company-info h1 {
                font-family: 'Montserrat', sans-serif;
                font-size: 1.7em;
                font-weight: 900;
                margin: 0;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.4);
                line-height: 1.1;
                position: relative;
                z-index: 2;
                letter-spacing: 0.5px;
            }
            
            .company-info p {
                font-size: 0.85em;
                opacity: 0.95;
                margin: 3px 0 0 0;
                font-weight: 600;
                line-height: 1.2;
                position: relative;
                z-index: 2;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            }
            
            .report-title {
                text-align: center;
                flex: 1;
            }
            
            .report-title h2 {
                font-size: 1.3em;
                font-weight: 800;
                margin: 0;
                line-height: 1.2;
                padding: 0 10px;
                text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
                position: relative;
                z-index: 2;
                letter-spacing: 0.5px;
            }
            
            .report-title p {
                font-size: 0.8em;
                opacity: 0.95;
                margin: 3px 0 0 0;
                padding: 0 10px;
                position: relative;
                z-index: 2;
                font-weight: 500;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
            }
            
            .footer {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #003B8C 0%, #1e40af 50%, #5BE49B 100%);
                color: white;
                padding: 8px 20px;
                text-align: center;
                font-size: 0.9em;
                height: 50px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-radius: 0 0 16px 16px;
            }
            
            .disclaimer {
                position: absolute;
                bottom: 50px;
                left: 20px;
                right: 20px;
                background: linear-gradient(135deg, #fff9e6, #fff3cd);
                border: 2px solid #ffeaa7;
                border-left: 5px solid #fdcb6e;
                padding: 15px 25px;
                font-size: 0.9em;
                line-height: 1.5;
                color: #6c5ce7;
                font-weight: 600;
                text-align: center;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .footer-logo {
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-right: 8px;
            }
            
            .footer-logo img {
                max-width: 70%;
                max-height: 70%;
            }
            
            .content {
                padding: 20px 25px;
                max-height: calc(297mm - 160px);
                display: flex;
                flex-direction: column;
                gap: 15px;
                background: linear-gradient(135deg, #ffffff 0%, #f8fafb 100%);
                padding-bottom: 60px;
                overflow: hidden;
            }
            
            .student-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 15px;
                padding: 15px;
                background: linear-gradient(135deg, #ffffff, #f8fafb);
                border-radius: 12px;
                border: 2px solid #e9ecef;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            }
            
            .info-item {
                background: linear-gradient(135deg, #ffffff, #f0f9ff);
                padding: 20px;
                border-radius: 12px;
                border: 2px solid #e0f2fe;
                border-left: 5px solid #003B8C;
                box-shadow: 0 4px 12px rgba(0, 59, 140, 0.1);
                transition: transform 0.2s ease;
            }
            
            .info-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(0, 59, 140, 0.15);
            }
            
            .info-label {
                font-weight: 800;
                color: #003B8C;
                margin-bottom: 10px;
                font-size: 0.85em;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                display: flex;
                align-items: center;
            }
            
            .info-label::before {
                content: '▸';
                color: #5BE49B;
                margin-right: 10px;
                font-size: 1.4em;
                font-weight: bold;
            }
            
            .info-value {
                font-size: 1.3em;
                font-weight: 700;
                color: #1e40af;
                word-break: break-word;
                line-height: 1.4;
            }
            
            .overall-score {
                text-align: center;
                margin: 20px 0;
                padding: 30px 25px;
                background: linear-gradient(135deg, #003B8C 0%, #1e40af 25%, #5BE49B 75%, #22c55e 100%);
                color: white;
                border-radius: 20px;
                position: relative;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 59, 140, 0.4);
                border: 3px solid rgba(255,255,255,0.2);
            }
            
            .overall-score::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    rgba(255,255,255,0.1) 10px,
                    rgba(255,255,255,0.1) 20px
                );
                animation: shimmer 3s ease-in-out infinite;
            }
            
            @keyframes shimmer {
                0% { transform: translateX(-100%) translateY(-100%); }
                50% { transform: translateX(0%) translateY(0%); }
                100% { transform: translateX(100%) translateY(100%); }
            }
            
            .overall-score h3 {
                font-size: 3.5em;
                margin-bottom: 8px;
                font-weight: 900;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                position: relative;
                z-index: 1;
            }
            
            .overall-score p {
                font-size: 1.3em;
                opacity: 0.95;
                font-weight: 700;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
                position: relative;
                z-index: 1;
                margin-top: 5px;
            }
            
            .scores-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
                margin: 15px 0;
                padding: 15px;
                background: linear-gradient(135deg, #f8f9fa, #ffffff);
                border-radius: 16px;
                border: 2px solid #e9ecef;
            }
            
            .score-card {
                background: linear-gradient(135deg, #ffffff, #f8fafb);
                padding: 15px;
                border-radius: 12px;
                border: 2px solid #e9ecef;
                text-align: center;
                position: relative;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            }
            
            .score-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #003B8C, #5BE49B);
            }
            
            .score-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.15);
            }
            
            .score-card h4 {
                font-size: 1.1em;
                color: #003B8C;
                font-weight: 700;
                margin-bottom: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .score-value {
                font-size: 2.2em;
                font-weight: 900;
                color: #003B8C;
                margin-bottom: 8px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }
            
            .score-bar {
                height: 12px;
                background: linear-gradient(90deg, #e9ecef, #f8f9fa);
                border-radius: 6px;
                overflow: hidden;
                margin-bottom: 8px;
                position: relative;
            }
            
            .score-bar::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, 
                    rgba(255,255,255,0.2) 25%, 
                    transparent 25%, 
                    transparent 50%, 
                    rgba(255,255,255,0.2) 50%, 
                    rgba(255,255,255,0.2) 75%, 
                    transparent 75%);
                background-size: 8px 8px;
            }
            
            .score-fill {
                height: 100%;
                border-radius: 6px;
                transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
            }
            
            .score-fill::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                animation: shine 2s infinite;
            }
            
            @keyframes shine {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            
            .score-fill.excellent { background: linear-gradient(90deg, #22C55E, #16A34A); }
            .score-fill.good { background: linear-gradient(90deg, #3B82F6, #2563EB); }
            .score-fill.average { background: linear-gradient(90deg, #F59E0B, #D97706); }
            .score-fill.weak { background: linear-gradient(90deg, #EF4444, #DC2626); }
            
            .analysis-section {
                background: linear-gradient(135deg, #ffffff, #f8fafb);
                padding: 25px;
                border-radius: 16px;
                border: 3px solid #e9ecef;
                margin: 20px 0;
                box-shadow: 0 6px 20px rgba(0,0,0,0.12);
                position: relative;
                overflow: hidden;
            }
            
            .analysis-section.strengths {
                background: linear-gradient(135deg, #f0fdf4, #dcfce7);
                border-left: 6px solid #22c55e;
                border-right: 6px solid #22c55e;
            }
            
            .analysis-section.gaps {
                background: linear-gradient(135deg, #fffbeb, #fef3c7);
                border-left: 6px solid #f59e0b;
                border-right: 6px solid #f59e0b;
            }
            
            .analysis-section.recommendations {
                background: linear-gradient(135deg, #eff6ff, #dbeafe);
                border-left: 6px solid #3b82f6;
                border-right: 6px solid #3b82f6;
            }
            
            .analysis-section::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 5px;
            }
            
            .analysis-section.strengths::before {
                background: linear-gradient(90deg, #22c55e, #16a34a, #22c55e);
            }
            
            .analysis-section.gaps::before {
                background: linear-gradient(90deg, #f59e0b, #d97706, #f59e0b);
            }
            
            .analysis-section.recommendations::before {
                background: linear-gradient(90deg, #3b82f6, #2563eb, #3b82f6);
            }
            
            .analysis-section h4 {
                font-size: 1.5em;
                margin-bottom: 18px;
                font-weight: 900;
                display: flex;
                align-items: center;
                text-transform: uppercase;
                letter-spacing: 1px;
                padding: 12px 18px;
                border-radius: 8px;
                margin-left: -25px;
                margin-right: -25px;
                margin-top: -25px;
            }
            
            .analysis-section.strengths h4 {
                background: linear-gradient(135deg, #22c55e, #16a34a);
                color: white;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
            }
            
            .analysis-section.gaps h4 {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                color: white;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
            }
            
            .analysis-section.recommendations h4 {
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
            }
            
            .analysis-section h4::after {
                display: none;
            }
ییر<｜tool▁call▁begin｜>
read_file
            
            .analysis-section p {
                line-height: 1.8;
                color: #495057;
                font-size: 1.1em;
                text-align: justify;
                text-indent: 20px;
                margin-bottom: 0;
            }
            
            .bullet-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .bullet-item {
                position: relative;
                padding-left: 25px;
                margin-bottom: 12px;
                line-height: 1.6;
                color: #495057;
                font-size: 1.05em;
            }
            
            .bullet-item::before {
                content: '●';
                position: absolute;
                left: 0;
                top: 0;
                color: #5BE49B;
                font-size: 1.2em;
                font-weight: bold;
            }
            
            .strengths .bullet-item {
                background: rgba(34, 197, 94, 0.05);
                padding: 10px 15px;
                border-radius: 8px;
                margin-bottom: 10px;
                border-left: 4px solid #22c55e;
            }
            
            .strengths .bullet-item {
                padding-left: 35px;
            }
            
            .strengths .bullet-item::before {
                content: '✓';
                color: #22c55e;
                font-weight: 900;
                font-size: 1.4em;
                left: 10px;
            }
            
            .gaps .bullet-item {
                background: rgba(245, 158, 11, 0.05);
                padding: 10px 15px;
                padding-left: 35px;
                border-radius: 8px;
                margin-bottom: 10px;
                border-left: 4px solid #f59e0b;
            }
            
            .gaps .bullet-item::before {
                content: '⚠';
                color: #f59e0b;
                font-size: 1.4em;
                left: 10px;
            }
            
            .recommendations .bullet-item {
                background: rgba(59, 130, 246, 0.05);
                padding: 10px 15px;
                padding-left: 35px;
                border-radius: 8px;
                margin-bottom: 10px;
                border-left: 4px solid #3b82f6;
            }
            
            .recommendations .bullet-item::before {
                content: '→';
                color: #3b82f6;
                font-weight: bold;
                font-size: 1.4em;
                left: 10px;
            }
            
            .country-fit {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 18px;
                margin: 25px 0 50px 0;
                padding: 20px;
                background: linear-gradient(135deg, #f8f9fa, #ffffff);
                border-radius: 16px;
                border: 2px solid #e9ecef;
            }
            
            .country-card {
                background: linear-gradient(135deg, #ffffff, #f8fafb);
                padding: 20px;
                border-radius: 12px;
                text-align: center;
                border: 2px solid #e9ecef;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                position: relative;
                overflow: hidden;
                transition: transform 0.3s ease;
            }
            
            .country-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #003B8C, #5BE49B);
            }
            
            .country-card:hover {
                transform: translateY(-2px);
            }
            
            .country-rank {
                background: linear-gradient(45deg, #003B8C, #5BE49B);
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 8px auto;
                font-weight: 800;
                font-size: 1.1em;
            }
            
            .country-flag {
                margin-bottom: 10px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .country-map {
                width: 70px;
                height: 45px;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                border: 1px solid #dee2e6;
                display: block;
                margin: 0 auto;
                object-fit: contain;
            }
            
            .country-name {
                font-size: 1.2em;
                font-weight: 700;
                color: #003B8C;
                margin-bottom: 5px;
            }
            
            .country-score {
                background: linear-gradient(45deg, #5BE49B, #4ade80);
                color: white;
                padding: 4px 8px;
                border-radius: 6px;
                font-weight: 700;
                font-size: 1.0em;
            }
            
            .universities-section {
                margin-top: 12px;
                padding: 12px;
                background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                border-radius: 8px;
                border-left: 4px solid #003B8C;
                text-align: left;
            }
            
            .universities-label {
                display: block;
                font-weight: 800;
                color: #003B8C;
                font-size: 0.85em;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 6px;
            }
            
            .universities-list {
                display: block;
                color: #1e40af;
                font-size: 0.8em;
                line-height: 1.6;
                font-weight: 600;
            }
            
            .recommended-destinations-heading {
                grid-column: 1/-1;
                text-align: center;
                background: linear-gradient(135deg, #003B8C 0%, #1e40af 25%, #5BE49B 75%, #22c55e 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 15px;
                font-size: 1.8em;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 2px;
                position: relative;
                padding-bottom: 15px;
                text-shadow: none;
            }
            
            .recommended-destinations-heading::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 150px;
                height: 4px;
                background: linear-gradient(90deg, #003B8C, #5BE49B, #003B8C);
                border-radius: 2px;
            }
            
            .recommended-destinations-divider {
                grid-column: 1/-1;
                width: 150px;
                height: 3px;
                background: linear-gradient(90deg, #003B8C, #5BE49B, #003B8C);
                margin: 0 auto 25px auto;
                border-radius: 2px;
            }
            
            .charts-section {
                margin: 30px 0;
                background: linear-gradient(135deg, #ffffff, #f8fafb);
                padding: 30px;
                border-radius: 16px;
                border: 3px solid #003B8C;
                box-shadow: 0 8px 25px rgba(0, 59, 140, 0.15);
                position: relative;
                overflow: hidden;
            }
            
            .charts-section::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 5px;
                background: linear-gradient(90deg, #003B8C, #5BE49B, #003B8C);
            }
            
            .charts-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .chart-container {
                background: linear-gradient(135deg, #ffffff, #f8fafb);
                padding: 20px;
                border-radius: 12px;
                border: 2px solid #e9ecef;
                box-shadow: 0 4px 15px rgba(0,0,0,0.12);
                position: relative;
                overflow: hidden;
            }
            
            .chart-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, #003B8C, #5BE49B);
            }
            
            .chart-container.full-width {
                grid-column: 1 / -1;
            }
            
            .chart-container h4 {
                color: #003B8C;
                font-size: 1.3em;
                font-weight: 800;
                margin-bottom: 20px;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: 1px;
                position: relative;
                padding-bottom: 10px;
            }
            
            .chart-container h4::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 50px;
                height: 2px;
                background: linear-gradient(90deg, #003B8C, #5BE49B);
            }
            
            .radar-chart {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .radar-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: linear-gradient(135deg, #ffffff, #f8f9fa);
                border-radius: 8px;
                border-left: 5px solid #5BE49B;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                transition: transform 0.2s ease;
            }
            
            .radar-item:hover {
                transform: translateX(5px);
            }
            
            .radar-label {
                font-weight: 600;
                color: #333;
                font-size: 0.9em;
            }
            
            .radar-score {
                font-weight: 700;
                color: #003B8C;
                font-size: 1.1em;
            }
            
            .trend-chart {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .trend-bar {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .trend-label {
                width: 120px;
                font-size: 0.9em;
                font-weight: 600;
                color: #555;
            }
            
            .trend-progress {
                flex: 1;
                height: 24px;
                background: linear-gradient(90deg, #e9ecef, #f8f9fa);
                border-radius: 12px;
                overflow: hidden;
                position: relative;
                border: 1px solid #dee2e6;
            }
            
            .trend-progress::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 4px,
                    rgba(255,255,255,0.3) 4px,
                    rgba(255,255,255,0.3) 8px
                );
                z-index: 1;
            }
            
            .trend-fill {
                height: 100%;
                border-radius: 12px;
                background: linear-gradient(135deg, #003B8C, #1e40af, #5BE49B);
                transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                z-index: 2;
            }
            
            .trend-fill::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
                animation: progressShine 2.5s infinite;
                z-index: 3;
            }
            
            @keyframes progressShine {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            
            .trend-value {
                font-weight: 700;
                color: #003B8C;
                font-size: 0.9em;
                min-width: 40px;
                text-align: right;
            }
            
            .country-matrix {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }
            
            .country-matrix-item {
                background: linear-gradient(135deg, #ffffff, #f8fafb);
                padding: 20px;
                border-radius: 12px;
                border: 2px solid #e9ecef;
                text-align: center;
                position: relative;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            }
            
            .country-matrix-item::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 5px;
                background: linear-gradient(90deg, #003B8C, #5BE49B);
            }
            
            .country-matrix-item:hover {
                transform: translateY(-3px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.15);
            }
            
            .country-matrix-rank {
                background: linear-gradient(45deg, #003B8C, #5BE49B);
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 10px auto;
                font-weight: 800;
                font-size: 1.0em;
            }
            
            .country-matrix-flag {
                margin: 8px auto;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .country-matrix-flag .country-map {
                width: 60px;
                height: 40px;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                border: 1px solid #dee2e6;
                display: block;
                margin: 0 auto;
            }
            
            .country-matrix-name {
                font-size: 1.1em;
                font-weight: 700;
                color: #003B8C;
                margin-bottom: 8px;
            }
            
            .country-matrix-score {
                background: linear-gradient(45deg, #5BE49B, #4ade80);
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-weight: 700;
                font-size: 0.9em;
                display: inline-block;
            }
            
            .country-matrix-desc {
                font-size: 0.75em;
                color: #1e293b;
                margin-top: 12px;
                line-height: 1.5;
                background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                padding: 12px;
                border-radius: 8px;
                border-left: 4px solid #003B8C;
                text-align: left;
            }
            
            .country-matrix-text {
                color: #1e293b;
                font-size: 0.85em;
                font-weight: 500;
                line-height: 1.6;
            }
            
            .country-matrix-text p {
                margin: 0 0 8px 0;
                text-align: justify;
            }
            
            .country-matrix-text p:last-child {
                margin-bottom: 0;
            }
            
            .country-matrix-desc .bullet-list {
                list-style: none;
                padding: 0;
                margin: 8px 0 0 0;
            }
            
            .country-matrix-desc .bullet-item {
                position: relative;
                padding-left: 18px;
                margin-bottom: 5px;
                line-height: 1.4;
                color: #1e293b;
                font-size: 0.85em;
                font-weight: 700;
            }
            
            .country-matrix-desc .bullet-item::before {
                content: '▸';
                position: absolute;
                left: 4px;
                top: 1px;
                color: #003B8C;
                font-size: 1.0em;
                font-weight: bold;
            }
            
            @media print {
                body { 
                    -webkit-print-color-adjust: exact; 
                    print-color-adjust: exact;
                    margin: 0;
                    padding: 0;
                }
                .page { 
                    box-shadow: none; 
                    border: none;
                    margin: 0;
                    page-break-after: always;
                }
                .page:last-child {
                    page-break-after: auto;
                }
                .page-break {
                    page-break-before: always;
                    break-before: page;
                }
                .header, .footer, .disclaimer { 
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .header {
                    background: linear-gradient(135deg, #003B8C 0%, #1e40af 25%, #5BE49B 75%, #22c55e 100%) !important;
                }
                .footer {
                    background: linear-gradient(135deg, #003B8C 0%, #5BE49B 100%) !important;
                }
                .disclaimer {
                    background: linear-gradient(135deg, #fff9e6, #fff3cd) !important;
                    border-color: #fdcb6e !important;
                }
                * {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            }
        </style>
    </head>
    <body>
        <div class="page">
            <div class="header">
                <div class="header-content">
                    <div class="logo-section">
                        <div class="logo">
                            <img src="${logoDataURI}" alt="D-Vivid Logo"/>
                        </div>
                        <div class="company-info">
                            <h1>D-Vivid Consultant</h1>
                            <p>Your Gateway to Global Education</p>
                        </div>
                    </div>
                    <div class="report-title">
                        <h2>Study Abroad Assessment Report</h2>
                        <p>Comprehensive Readiness Index (CRI)</p>
                    </div>
                </div>
            </div>
            
            <div class="content">
                <div class="student-info">
                    <div class="info-item">
                        <div class="info-label">Student Email</div>
                        <div class="info-value">${studentEmail}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Phone Number</div>
                        <div class="info-value">${studentPhone}</div>
                    </div>
                </div>
                
                <div class="overall-score">
                    <h3>${overallIndex}%</h3>
                    <p>Overall Readiness Index: ${readinessLevel}</p>
                </div>
                
                <div class="scores-grid">
                    ${generateScoreCard('Financial Planning', scores['Financial Planning'], getFrameworkWeight('Financial Planning'))}
                    ${generateScoreCard('Academic Readiness', scores['Academic Readiness'], getFrameworkWeight('Academic Readiness'))}
                    ${generateScoreCard('Career Alignment', scores['Career Alignment'], getFrameworkWeight('Career Alignment'))}
                    ${generateScoreCard('Personal & Cultural', scores['Personal & Cultural'], getFrameworkWeight('Personal & Cultural'))}
                    ${generateScoreCard('Practical Readiness', scores['Practical Readiness'], getFrameworkWeight('Practical Readiness'))}
                    ${generateScoreCard('Support System', scores['Support System'], getFrameworkWeight('Support System'))}
                </div>

            </div>
            
            <div class="footer">
                <div style="display: flex; align-items: center;">
                    <div class="footer-logo">
                        <img src="${logoDataURI}" alt="D-Vivid Logo"/>
                    </div>
                    <span>D-Vivid Consultant - Your Gateway to Global Education</span>
                </div>
                <div>Report Generated: ${currentDate}</div>
            </div>
        </div>
        
        <!-- Page 2: Country Analysis -->
        ${countryFit.length > 0 ? `
        <div class="page page-break">
            <div class="header">
                <div class="header-content">
                    <div class="logo-section">
                        <div class="logo">
                            <img src="${logoDataURI}" alt="D-Vivid Logo"/>
                        </div>
                        <div class="company-info">
                            <h1>D-Vivid Consultant</h1>
                            <p>Your Gateway to Global Education</p>
                        </div>
                    </div>
                    <div class="report-title">
                        <h2>Country Analysis & Recommendations</h2>
                        <p>Personalized Study Destinations</p>
                    </div>
                </div>
            </div>
            
            <div class="country-page">
                <!-- 📊 DETAILED READINESS ANALYSIS -->
                <div class="charts-section">
                    <h3 style="text-align: center; color: #003B8C; margin: 25px 0; font-size: 1.8em; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; position: relative; padding-bottom: 15px;">📊 Detailed Readiness Analysis</h3>
                    <div style="width: 100px; height: 4px; background: linear-gradient(90deg, #003B8C, #5BE49B); margin: 0 auto 25px auto; border-radius: 2px;"></div>
                    <div class="charts-grid">
                        <div class="chart-container">
                            <h4>🎯 Readiness Radar Chart</h4>
                            <div class="radar-chart">
                                ${generateRadarChart(scores)}
                            </div>
                        </div>
                        <div class="chart-container">
                            <h4>📈 Performance Trends</h4>
                            <div class="trend-chart">
                                ${generateTrendChart(scores)}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 💪 KEY STRENGTHS -->
                <div class="analysis-section strengths">
                    <h4>💪 Key Strengths</h4>
                    <ul class="bullet-list">
                        ${formatToBulletPoints(strengths)}
                    </ul>
                </div>
                
                <!-- ⚠️ AREAS FOR DEVELOPMENT -->
                <div class="analysis-section gaps">
                    <h4>⚠️ Areas for Development</h4>
                    <ul class="bullet-list">
                        ${formatToBulletPoints(gaps)}
                    </ul>
                </div>
                
                <!-- 🎯 STRATEGIC RECOMMENDATIONS -->
                <div class="analysis-section recommendations">
                    <h4>🎯 Strategic Recommendations</h4>
                    <ul class="bullet-list">
                        ${formatToBulletPoints(recommendations)}
                    </ul>
                </div>
                
                <!-- 🌍 COUNTRY READINESS MATRIX -->
                <div class="chart-container full-width" style="margin: 40px 0;">
                    <h4>🌍 Country Readiness Matrix</h4>
                    <div class="country-matrix">
                        ${generateCountryMatrix(countryFit)}
                    </div>
                </div>
                
                <!--  RECOMMENDED STUDY DESTINATIONS -->
                <div class="country-fit">
                    <h4 class="recommended-destinations-heading"> 🎓 Recommended Study Destinations</h4>
                    <div class="recommended-destinations-divider"></div>
                    ${countryFit.map((countryData: any, index: number) => generateCountryCard(countryData, index)).join('')}
                </div>
            </div>
            
            <div class="disclaimer">
                <strong>⚠️ DISCLAIMER:</strong> Results are based on your inputs and benchmark data. The analysis is intended as guidance and should be interpreted as advisory, not definitive or prescriptive. This assessment provides general recommendations and should be used in conjunction with professional counseling for study abroad planning.
            </div>
            
            <div class="footer">
                <div style="display: flex; align-items: center;">
                    <div class="footer-logo">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzEpIi8+CjxwYXRoIGQ9Ik0xMiAxNkgxNlYyNEgxMlYxNloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yNCAxNkgyOFYyNEgyNFYxNloiIGZpbGw9IndoaXRlIi/+CjxwYXRoIGQ9Ik0xNiAxMkgyNFYxNkgxNlYxMloiIGZpbGw9IndoaXRlIi/+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF9saW5lYXJfMV8xIiB4MT0iMCIgeTE9IjAiIHgyPSI0MCIgeTI9IjQwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMwMDNCOEMiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNUJFOEI5Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+" alt="D-Vivid Logo"/>
                    </div>
                    <span>D-Vivid Consultant - Your Gateway to Global Education</span>
                </div>
                <div>Report Generated: ${currentDate}</div>
            </div>
        </div>
        ` : ''}
    </body>
    </html>
  `;
}