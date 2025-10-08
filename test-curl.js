const { exec } = require('child_process');
const fs = require('fs');

async function testWithCurl() {
  console.log('🧪 Testing API with curl...');
  
  const testData = {
    studentName: "Test User",
    studentEmail: "test@example.com",
    score: 85,
    analysis: {
      readinessBand: "Good",
      overallAssessment: "You show good potential for study abroad.",
      strengths: ["Strong academic foundation"],
      weaknesses: ["Cultural adaptability"],
      specificRecommendations: ["Improve cultural awareness", "Practice English"]
    }
  };

  // Write test data to file
  fs.writeFileSync('test-data.json', JSON.stringify(testData));
  
  console.log('📄 Test data written to test-data.json');
  console.log('📡 Testing API route...');
  
  // Use curl to test the API
  const curlCommand = `curl -X POST http://localhost:3000/api/generate-pdf -H "Content-Type: application/json" -d @test-data.json -o test-api-output.pdf -w "HTTP Status: %{http_code}\\nResponse Time: %{time_total}s\\n"`;
  
  exec(curlCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Curl test failed:', error.message);
      return;
    }
    
    console.log('📊 Curl output:', stdout);
    if (stderr) console.log('📊 Curl stderr:', stderr);
    
    // Check if PDF was created
    if (fs.existsSync('test-api-output.pdf')) {
      const stats = fs.statSync('test-api-output.pdf');
      console.log('✅ PDF file created, size:', stats.size, 'bytes');
      
      if (stats.size > 0) {
        console.log('🎉 API test PASSED! PDF generated successfully.');
      } else {
        console.log('❌ PDF file is empty (0 bytes)');
      }
    } else {
      console.log('❌ PDF file was not created');
    }
  });
}

testWithCurl();

