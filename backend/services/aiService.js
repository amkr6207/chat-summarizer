import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

class AIService {
    constructor() {
        // Debug: Check if env vars are loaded
        console.log('🔍 Checking AI API Keys:');
        console.log('OpenAI:', process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing');
        console.log('Anthropic:', process.env.ANTHROPIC_API_KEY ? '✅ Configured' : '❌ Missing');
        console.log('Google:', process.env.GOOGLE_API_KEY ? '✅ Configured' : '❌ Missing');

        // Initialize AI clients
        this.openai = process.env.OPENAI_API_KEY
            ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
            : null;

        this.anthropic = process.env.ANTHROPIC_API_KEY
            ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
            : null;

        this.googleAI = process.env.GOOGLE_API_KEY
            ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
            : null;

        this.lmStudioUrl = process.env.LM_STUDIO_URL || 'http://localhost:1234/v1';
    }

    /**
     * Send a message to the AI and get a response
     * @param {string} provider - AI provider (openai, claude, gemini, lmstudio)
     * @param {Array} messages - Array of message objects {role, content}
     * @param {string} model - Model name
     * @returns {Object} Response with content and metadata
     */
    async sendMessage(provider, messages, model = null) {
        try {
            switch (provider) {
                case 'openai':
                    return await this.sendOpenAIMessage(messages, model || 'gpt-3.5-turbo');
                case 'claude':
                    return await this.sendClaudeMessage(messages, model || 'claude-3-5-sonnet-20241022');
                case 'gemini':
                    // Force Gemini model if the passed model looks like an OpenAI model
                    // Using 'gemini-2.0-flash' as it is confirmed available for this key
                    const geminiModel = (model && !model.includes('gpt')) ? model : 'gemini-2.0-flash';
                    return await this.sendGeminiMessage(messages, geminiModel);
                case 'lmstudio':
                    return await this.sendLMStudioMessage(messages, model || 'local-model');
                default:
                    throw new Error(`Unsupported AI provider: ${provider}`);
            }
        } catch (error) {
            console.error(`AI Service Error (${provider}):`, error);
            throw error;
        }
    }

    async sendOpenAIMessage(messages, model) {
        if (!this.openai) {
            throw new Error('OpenAI API key not configured');
        }

        const response = await this.openai.chat.completions.create({
            model,
            messages,
            temperature: 0.7,
        });

        return {
            content: response.choices[0].message.content,
            metadata: {
                model: response.model,
                tokens: response.usage.total_tokens,
                provider: 'openai'
            }
        };
    }

    async sendClaudeMessage(messages, model) {
        if (!this.anthropic) {
            throw new Error('Anthropic API key not configured');
        }

        // Convert messages format for Claude (remove system messages, handle separately)
        const systemMessage = messages.find(m => m.role === 'system')?.content || '';
        const conversationMessages = messages
            .filter(m => m.role !== 'system')
            .map(m => ({ role: m.role, content: m.content }));

        const response = await this.anthropic.messages.create({
            model,
            max_tokens: 4096,
            system: systemMessage,
            messages: conversationMessages,
        });

        return {
            content: response.content[0].text,
            metadata: {
                model: response.model,
                tokens: response.usage.input_tokens + response.usage.output_tokens,
                provider: 'claude'
            }
        };
    }

    async sendGeminiMessage(messages, model) {
        if (!this.googleAI) {
            throw new Error('Google API key not configured');
        }

        const genModel = this.googleAI.getGenerativeModel({ model });

        // Convert messages to Gemini format
        const history = messages.slice(0, -1).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        const lastMessage = messages[messages.length - 1].content;

        const chat = genModel.startChat({ history });
        const result = await chat.sendMessage(lastMessage);
        const response = result.response;

        return {
            content: response.text(),
            metadata: {
                model,
                tokens: 0, // Gemini doesn't provide token count in the same way
                provider: 'gemini'
            }
        };
    }

    async sendLMStudioMessage(messages, model) {
        // LM Studio uses OpenAI-compatible API
        const lmStudio = new OpenAI({
            baseURL: this.lmStudioUrl,
            apiKey: 'lm-studio' // LM Studio doesn't require a real API key
        });

        const response = await lmStudio.chat.completions.create({
            model,
            messages,
            temperature: 0.7,
        });

        return {
            content: response.choices[0].message.content,
            metadata: {
                model: response.model || model,
                tokens: response.usage?.total_tokens || 0,
                provider: 'lmstudio'
            }
        };
    }

    /**
     * Generate a summary of a conversation
     * @param {string} provider - AI provider
     * @param {Array} messages - Conversation messages
     * @returns {string} Summary text
     */
    async generateSummary(provider, messages) {
        const conversationText = messages
            .map(m => `${m.role}: ${m.content}`)
            .join('\n\n');

        const summaryPrompt = [
            {
                role: 'system',
                content: 'You are a helpful assistant that creates concise summaries of conversations. Provide a brief, informative summary of the key points discussed.'
            },
            {
                role: 'user',
                content: `Please summarize this conversation:\n\n${conversationText}`
            }
        ];

        const response = await this.sendMessage(provider, summaryPrompt);
        return response.content;
    }

    /**
     * Analyze conversation and extract insights
     * @param {string} provider - AI provider
     * @param {Array} messages - Conversation messages
     * @returns {Object} Analysis with topics, sentiment, etc.
     */
    async analyzeConversation(provider, messages) {
        const conversationText = messages
            .map(m => `${m.role}: ${m.content}`)
            .join('\n\n');

        const analysisPrompt = [
            {
                role: 'system',
                content: 'You are an AI that analyzes conversations. Provide a JSON response with: main_topics (array), sentiment (positive/neutral/negative), key_points (array), and suggested_tags (array).'
            },
            {
                role: 'user',
                content: `Analyze this conversation and return JSON:\n\n${conversationText}`
            }
        ];

        const response = await this.sendMessage(provider, analysisPrompt);

        try {
            // Try to parse JSON from response
            const jsonMatch = response.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return { raw_analysis: response.content };
        } catch (error) {
            return { raw_analysis: response.content };
        }
    }

    /**
     * Query chat history with natural language
     * @param {string} provider - AI provider
     * @param {string} query - User's query
     * @param {Array} conversations - Array of conversation objects
     * @returns {string} Answer to the query
     */
    async queryHistory(provider, query, conversations) {
        // Build context from conversations
        const context = conversations.map((conv, idx) => {
            const preview = conv.messages.slice(0, 5)
                .map(m => `${m.role}: ${m.content.substring(0, 100)}`)
                .join('\n');
            return `Conversation ${idx + 1} (${conv.title}):\n${preview}\n---`;
        }).join('\n\n');

        const queryPrompt = [
            {
                role: 'system',
                content: 'You are a helpful assistant that answers questions about past conversations. Use the provided conversation history to answer the user\'s question accurately and concisely.'
            },
            {
                role: 'user',
                content: `Based on these past conversations:\n\n${context}\n\nQuestion: ${query}`
            }
        ];

        const response = await this.sendMessage(provider, queryPrompt);
        return response.content;
    }
}

// Export singleton instance
const aiService = new AIService();
export default aiService;
