import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function listModels() {
    try {
        if (!process.env.GOOGLE_API_KEY) {
            console.error('❌ GOOGLE_API_KEY is missing in .env');
            return;
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        // Access the model via the API directly if possible, or just try to generate content with a known model
        // The SDK doesn't have a direct 'listModels' method exposed easily on the main class in all versions, 
        // but we can try to just run a simple generation to test.

        console.log('Testing Gemini API with key:', process.env.GOOGLE_API_KEY.substring(0, 10) + '...');

        const modelsToTest = ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.0-pro', 'gemini-1.5-pro'];

        for (const modelName of modelsToTest) {
            console.log(`\nTesting model: ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello, are you working?");
                const response = await result.response;
                console.log(`✅ Success! Model ${modelName} is working.`);
                console.log('Response:', response.text());
                return; // Exit after finding a working model
            } catch (error) {
                console.error(`❌ Failed with ${modelName}:`, error.message);
            }
        }

        console.log('\n❌ All models failed. Please check your API key and billing status.');

    } catch (error) {
        console.error('Fatal error:', error);
    }
}

listModels();
