const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  console.log('🧪 Testing API Route...');
  
  const testData = {
    studentName: "Test User",
    studentEmail: "test@example.com",
    studentClass: "12",
    studentSchool: "Test School",
    score: 85,
    maxScore: 100,
    totalTime: 30,
    topics: [
      { name: "Academic Readiness", correct: 2, total: 3 },
      { name: "Career & Goal Alignment", correct: 2, total: 3 }
    ],
    careerInterests: [
      { name: "Technology & Innovation", score: 8 },
      { name: "Business & Management", score: 7 }
    ],
    aptitudeScores: [
      { name: "Academic Readiness", score: 8 },
      { name: "Cultural Adaptability", score: 7 }
    ],
    skills: [
      { name: "Language Learning", score: 85 },
      { name: "Financial Planning", score: 80 }
    ],
    academicRecommendations: ["Advanced Mathematics", "English Literature"],
    examRecommendations: ["IELTS", "SAT"],
    upskillingRecommendations: ["Communication Skills", "Leadership"],
    extracurricularRecommendations: ["Student Council", "Debate Club"],
    analysis: {
      readinessBand: "Good",
      overallAssessment: "You show good potential for study abroad with some areas for improvement.",
      strengths: ["Strong academic foundation", "Good communication skills"],
      weaknesses: ["Cultural adaptability", "Financial planning"],
      specificRecommendations: [
        "Improve cultural awareness",
        "Develop financial planning skills",
        "Practice English conversation",
        "Join international student groups"
      ]
    }
  };

  try {
    console.log('📡 Sending request to /api/generate-pdf...');
    const response = await fetch('http://localhost:3001/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const buffer = await response.buffer();
      console.log('✅ PDF generated successfully, size:', buffer.length, 'bytes');
      
      if (buffer.length > 0) {
        const fs = require('fs');
        fs.writeFileSync('api-test-output.pdf', buffer);
        console.log('✅ API test PDF saved as api-test-output.pdf');
        console.log('🎉 API test PASSED!');
      } else {
        console.log('❌ PDF buffer is empty');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API request failed:', response.status, errorText);
    }

  } catch (error) {
    console.error('❌ API test FAILED:', error.message);
  }
}

// Run the test
testAPI();
