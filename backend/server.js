import 'dotenv/config'; // Must be first!
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import analysisRoutes from './routes/analysis.js';

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:3000', // Docker frontend
        'https://chat-summarizer-frontend-zeta.vercel.app'
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analysis', analysisRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'AI Chat Portal API is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to AI Chat Portal API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            chat: '/api/chat',
            analysis: '/api/analysis'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});



// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║   🚀 AI Chat Portal API Server Running   ║
║   📡 Port: ${PORT}                         ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}            ║
║   📝 API Docs: http://localhost:${PORT}    ║
╚═══════════════════════════════════════════╝
  `);
});

export default app;
