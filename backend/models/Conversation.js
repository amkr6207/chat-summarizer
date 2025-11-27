import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    metadata: {
        model: String,
        tokens: Number,
        provider: String
    }
}, { _id: true });

const conversationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        default: 'New Conversation',
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    messages: [messageSchema],
    aiProvider: {
        type: String,
        enum: ['openai', 'claude', 'gemini', 'lmstudio'],
        required: true,
        default: 'openai'
    },
    model: {
        type: String,
        default: 'gpt-3.5-turbo'
    },
    summary: {
        type: String,
        default: ''
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    isArchived: {
        type: Boolean,
        default: false
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient querying
conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ userId: 1, lastMessageAt: -1 });
conversationSchema.index({ tags: 1 });

// Update lastMessageAt when messages are added
conversationSchema.pre('save', function (next) {
    if (this.messages && this.messages.length > 0) {
        this.lastMessageAt = this.messages[this.messages.length - 1].timestamp;
    }
    next();
});

// Auto-generate title from first user message if still default
conversationSchema.methods.autoGenerateTitle = function () {
    if (this.title === 'New Conversation' && this.messages.length > 0) {
        const firstUserMessage = this.messages.find(msg => msg.role === 'user');
        if (firstUserMessage) {
            // Take first 50 characters of the first message
            this.title = firstUserMessage.content.substring(0, 50) +
                (firstUserMessage.content.length > 50 ? '...' : '');
        }
    }
};

// Get conversation statistics
conversationSchema.methods.getStats = function () {
    return {
        messageCount: this.messages.length,
        userMessages: this.messages.filter(m => m.role === 'user').length,
        assistantMessages: this.messages.filter(m => m.role === 'assistant').length,
        firstMessageAt: this.messages[0]?.timestamp,
        lastMessageAt: this.lastMessageAt,
        duration: this.lastMessageAt - this.messages[0]?.timestamp
    };
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
