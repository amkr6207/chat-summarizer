import 'dotenv/config';
import aiService from './services/aiService.js';

async function testGroq() {
    console.log('🚀 Testing Groq Integration...');

    if (!process.env.GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY is missing in .env');
        console.log('👉 Please add your key to backend/.env');
        return;
    }

    try {
        const messages = [
            { role: 'user', content: 'Hello! Are you working correctly?' }
        ];

        console.log('📡 Sending request to Groq...');
        const response = await aiService.sendMessage('groq', messages);

        console.log('\n✅ Success! Received response:');
        console.log('----------------------------------------');
        console.log(response.content);
        console.log('----------------------------------------');
        console.log('Metadata:', response.metadata);

    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testGroq();
