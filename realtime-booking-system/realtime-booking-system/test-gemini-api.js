const axios = require('axios');
require('dotenv').config({ path: './frontend/.env' });

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyCMIFA5nM-uma3CzMOjkums_BDXJdkJ3jc';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API...');
  console.log('API Key:', GEMINI_API_KEY ? '✅ Found' : '❌ Not found');
  
  const testMessages = [
    'Tôi bị đau bụng, nên khám khoa nào?',
    'Bệnh viện làm việc giờ nào?',
    'Làm sao để đặt lịch khám?',
    'Tôi bị đau đầu và chóng mặt'
  ];

  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`\n📝 Test ${i + 1}: "${message}"`);
    
    try {
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `Bạn là trợ lý ảo của bệnh viện. Hãy trả lời câu hỏi sau bằng tiếng Việt một cách thân thiện và hữu ích: ${message}`
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (response.data && response.data.candidates && response.data.candidates[0]) {
        const aiResponse = response.data.candidates[0].content.parts[0].text;
        console.log('✅ API Response:', aiResponse);
      } else {
        console.log('❌ Invalid response structure');
      }
    } catch (error) {
      console.log('❌ API Error:', error.message);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
      }
    }
  }
}

// Chạy test
testGeminiAPI().catch(console.error);