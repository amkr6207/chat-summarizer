import express from 'express';
import Conversation from '../models/Conversation.js';
import { protect } from '../middleware/auth.js';
import aiService from '../services/aiService.js';

const router = express.Router();

// @route   POST /api/chat
// @desc    Send a message and get AI response
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { conversationId, message, provider, model } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message content is required'
            });
        }

        const aiProvider = provider || req.user.preferences.defaultAIProvider || 'openai';
        let conversation;

        // Get or create conversation
        if (conversationId) {
            conversation = await Conversation.findOne({
                _id: conversationId,
                userId: req.user._id
            });

            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message: 'Conversation not found'
                });
            }
        } else {
            // Create new conversation
            conversation = new Conversation({
                userId: req.user._id,
                title: 'New Conversation',
                aiProvider,
                model: model || 'gpt-3.5-turbo',
                messages: []
            });
        }

        // Add user message
        conversation.messages.push({
            role: 'user',
            content: message,
            timestamp: new Date()
        });

        // Prepare messages for AI
        const messages = conversation.messages.map(m => ({
            role: m.role,
            content: m.content
        }));

        // Get AI response
        const aiResponse = await aiService.sendMessage(aiProvider, messages, conversation.model);

        // Add AI response to conversation
        conversation.messages.push({
            role: 'assistant',
            content: aiResponse.content,
            timestamp: new Date(),
            metadata: aiResponse.metadata
        });

        // Auto-generate title if needed
        conversation.autoGenerateTitle();

        // Save conversation
        await conversation.save();

        res.status(200).json({
            success: true,
            data: {
                conversation: {
                    id: conversation._id,
                    title: conversation.title,
                    messages: conversation.messages,
                    aiProvider: conversation.aiProvider,
                    model: conversation.model
                },
                response: aiResponse.content
            }
        });

    } catch (error) {
        console.error('Chat error:', error);

        // Provide more specific error messages
        let errorMessage = 'Error processing chat message';

        // Check for specific error types
        if (error.message) {
            if (error.message.includes('API key not configured')) {
                errorMessage = `${error.message}. Please configure your API keys in the backend environment variables.`;
            } else if (error.message.includes('quota') || error.message.includes('limit')) {
                errorMessage = `API quota or rate limit exceeded: ${error.message}`;
            } else if (error.message.includes('401') || error.message.includes('authentication')) {
                errorMessage = `Authentication failed: ${error.message}. Please check your API key.`;
            } else if (error.message.includes('model')) {
                errorMessage = `Model error: ${error.message}`;
            } else {
                errorMessage = error.message;
            }
        }

        res.status(500).json({
            success: false,
            message: errorMessage,
            error: error.message
        });
    }
});

// @route   GET /api/chat/conversations
// @desc    Get all conversations for user
// @access  Private
router.get('/conversations', protect, async (req, res) => {
    try {
        const { page = 1, limit = 20, search, archived } = req.query;

        const query = { userId: req.user._id };

        if (archived !== undefined) {
            query.isArchived = archived === 'true';
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const conversations = await Conversation.find(query)
            .sort({ lastMessageAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-messages'); // Don't include messages in list view

        const count = await Conversation.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                conversations,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count
            }
        });

    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching conversations',
            error: error.message
        });
    }
});

// @route   GET /api/chat/conversations/:id
// @desc    Get a specific conversation
// @access  Private
router.get('/conversations/:id', protect, async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { conversation }
        });

    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching conversation',
            error: error.message
        });
    }
});

// @route   PUT /api/chat/conversations/:id
// @desc    Update conversation (title, tags, archive)
// @access  Private
router.put('/conversations/:id', protect, async (req, res) => {
    try {
        const { title, tags, isArchived } = req.body;

        const conversation = await Conversation.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        if (title) conversation.title = title;
        if (tags) conversation.tags = tags;
        if (isArchived !== undefined) conversation.isArchived = isArchived;

        await conversation.save();

        res.status(200).json({
            success: true,
            message: 'Conversation updated successfully',
            data: { conversation }
        });

    } catch (error) {
        console.error('Update conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating conversation',
            error: error.message
        });
    }
});

// @route   DELETE /api/chat/conversations/:id
// @desc    Delete a conversation
// @access  Private
router.delete('/conversations/:id', protect, async (req, res) => {
    try {
        const conversation = await Conversation.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Conversation deleted successfully'
        });

    } catch (error) {
        console.error('Delete conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting conversation',
            error: error.message
        });
    }
});

export default router;
