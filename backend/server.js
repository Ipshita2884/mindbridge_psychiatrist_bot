// server.js - PRODUCTION READY WITH ADVANCED FEATURES
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const quizRoutes        = require('./routes/quiz');
const adminRoutes       = require('./routes/admin');
const psychiatristRoutes = require('./routes/psychiatrist');
const medicalRoutes     = require('./routes/medical');

app.use('/api/quiz',         quizRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/psychiatrist', psychiatristRoutes);
app.use('/api/medical',      medicalRoutes);
// ============================================
// MIDDLEWARE SETUP
// ============================================

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('📦 Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// CORS Configuration - Allow multiple origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8085',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8085',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            console.log('❌ CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Body parser middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// ============================================
// DATABASE CONNECTION TEST
// ============================================
const testDatabaseConnection = async () => {
    try {
        const db = require('./config/database');
        const connection = await db.getConnection();
        await connection.ping();
        connection.release();
        console.log('✅ MySQL Database connected successfully');
        console.log('📊 Database:', process.env.DB_NAME);
        return true;
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
        console.error('⚠️  Make sure MySQL is running and credentials are correct');
        return false;
    }
};

// Test database connection on startup
testDatabaseConnection();

// ============================================
// IMPORT ROUTES
// ============================================
const authRoutes = require('./routes/auth');
const stressRoutes = require('./routes/stress');
const reminderRoutes = require('./routes/reminders');
const therapyRoutes = require('./routes/therapy');
const gameRoutes = require('./routes/games');
const chatRoutes = require('./routes/chat');
const userRoutes = require('./routes/user');
const medicalRoutesImport = require('./routes/medical');

// ============================================
// ROUTE REGISTRATION
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/stress', stressRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/therapy', therapyRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user', userRoutes);

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get('/health', async (req, res) => {
    const dbStatus = await testDatabaseConnection();
    
    res.json({ 
        status: dbStatus ? 'OK' : 'DEGRADED',
        message: 'MindCare AI Backend is running',
        database: dbStatus ? 'Connected' : 'Disconnected',
        version: '1.0.0',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'MindCare AI API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                verify: 'GET /api/auth/verify'
            },
            user: {
                profile: 'GET /api/user/profile',
                updateProfile: 'PUT /api/user/profile'
            },
            stress: {
                log: 'POST /api/stress/log',
                history: 'GET /api/stress/history',
                current: 'GET /api/stress/current'
            }
        }
    });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 Not Found Handler
app.use((req, res) => {
    console.log('❌ 404 - Route not found:', req.method, req.path);
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.path}`,
        availableEndpoints: [
            '/health',
            '/api/auth/register',
            '/api/auth/login',
            '/api/user/profile',
            '/api/stress/log'
        ]
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: err.errors
        });
    }
    
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS policy: Origin not allowed'
        });
    }
    
    // Generic error response
    res.status(err.status || 500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n👋 SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log('\n=================================');
    console.log('🚀 MindCare AI Backend Started');
    console.log('=================================');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`💚 Health: http://localhost:${PORT}/health`);
    console.log(`📖 API Docs: http://localhost:${PORT}/`);
    console.log('=================================\n');
    console.log('📡 Listening for requests...\n');
});

// Handle server startup errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use!`);
        console.log('💡 Try: kill -9 $(lsof -ti:' + PORT + ')');
        process.exit(1);
    } else {
        console.error('❌ Server error:', error);
        process.exit(1);
    }
});

module.exports = app;
