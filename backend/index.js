// editing your file
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

console.log('=== ENVIRONMENT VARIABLES LOADED ===');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('JWT Secret:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('Email User:', process.env.EMAIL_USER ? 'Set' : 'Not set');
console.log('USDA API Key:', process.env.USDA_API_KEY ? 'Set' : 'Not set');
console.log('====================================');

// Import routes
import authRoutes from './src/routes/auth.js';
import dietRoutes from './src/routes/diet.js';

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Your Vite frontend URL
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/diet', dietRoutes);

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is running!',
        timestamp: new Date().toISOString()
    });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
    console.log('❌ MongoDB connection error:', err.message);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log('❌ Unhandled Rejection at:', promise, 'reason:', err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`🥗 Diet API: http://localhost:${PORT}/api/diet`);
    console.log(`❤️ Health Check: http://localhost:${PORT}/health`);
});


//changing the file to commit again to check
