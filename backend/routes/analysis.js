import express from 'express';
import Conversation from '../models/Conversation.js';
import { protect } from '../middleware/auth.js';
import aiService from '../services/aiService.js';

const router = express.Router();

// @route   POST /api/analysis/summarize/:conversationId
// @desc    Generate summary for a conversation
// @access  Private
router.post('/summarize/:conversationId', protect, async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            _id: req.params.conversationId,
            userId: req.user._id
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        if (conversation.messages.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot summarize empty conversation'
            });
        }

        // Generate summary
        const summary = await aiService.generateSummary(
            conversation.aiProvider,
            conversation.messages
        );

        // Save summary to conversation
        conversation.summary = summary;
        await conversation.save();

        res.status(200).json({
            success: true,
            data: { summary }
        });

    } catch (error) {
        console.error('Summarize error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating summary',
            error: error.message
        });
    }
});

// @route   POST /api/analysis/analyze/:conversationId
// @desc    Analyze a conversation for insights
// @access  Private
router.post('/analyze/:conversationId', protect, async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            _id: req.params.conversationId,
            userId: req.user._id
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        if (conversation.messages.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot analyze empty conversation'
            });
        }

        // Analyze conversation
        const analysis = await aiService.analyzeConversation(
            conversation.aiProvider,
            conversation.messages
        );

        // Auto-tag conversation if tags are suggested
        if (analysis.suggested_tags && analysis.suggested_tags.length > 0) {
            conversation.tags = [...new Set([...conversation.tags, ...analysis.suggested_tags])];
            await conversation.save();
        }

        res.status(200).json({
            success: true,
            data: { analysis }
        });

    } catch (error) {
        console.error('Analyze error:', error);
        res.status(500).json({
            success: false,
            message: 'Error analyzing conversation',
            error: error.message
        });
    }
});

// @route   POST /api/analysis/query
// @desc    Query chat history with natural language
// @access  Private
router.post('/query', protect, async (req, res) => {
    try {
        const { query, provider, limit = 10 } = req.body;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Query is required'
            });
        }

        // Get recent conversations for context
        const conversations = await Conversation.find({
            userId: req.user._id,
            isArchived: false
        })
            .sort({ lastMessageAt: -1 })
            .limit(limit);

        if (conversations.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    answer: 'You don\'t have any conversations yet. Start chatting to build your history!',
                    conversationsAnalyzed: 0
                }
            });
        }

        const aiProvider = provider || req.user.preferences.defaultAIProvider || 'openai';

        // Query the history
        const answer = await aiService.queryHistory(aiProvider, query, conversations);

        res.status(200).json({
            success: true,
            data: {
                answer,
                conversationsAnalyzed: conversations.length,
                query
            }
        });

    } catch (error) {
        console.error('Query history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error querying chat history',
            error: error.message
        });
    }
});

// @route   GET /api/analysis/insights
// @desc    Get overall insights from all conversations
// @access  Private
router.get('/insights', protect, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            userId: req.user._id
        });

        // Calculate statistics
        const totalConversations = conversations.length;
        const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
        const avgMessagesPerConv = totalConversations > 0 ? totalMessages / totalConversations : 0;

        // Get most used tags
        const tagCounts = {};
        conversations.forEach(conv => {
            conv.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        const topTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count }));

        // Provider usage
        const providerCounts = {};
        conversations.forEach(conv => {
            providerCounts[conv.aiProvider] = (providerCounts[conv.aiProvider] || 0) + 1;
        });

        // Recent activity
        const recentConversations = conversations
            .sort((a, b) => b.lastMessageAt - a.lastMessageAt)
            .slice(0, 5)
            .map(conv => ({
                id: conv._id,
                title: conv.title,
                lastMessageAt: conv.lastMessageAt,
                messageCount: conv.messages.length
            }));

        res.status(200).json({
            success: true,
            data: {
                statistics: {
                    totalConversations,
                    totalMessages,
                    avgMessagesPerConversation: Math.round(avgMessagesPerConv * 10) / 10
                },
                topTags,
                providerUsage: providerCounts,
                recentActivity: recentConversations
            }
        });

    } catch (error) {
        console.error('Get insights error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching insights',
            error: error.message
        });
    }
});

export default router;
