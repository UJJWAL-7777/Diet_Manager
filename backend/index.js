import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

console.log('=== ENVIRONMENT VARIABLES LOADED ===');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('USDA API Key:', process.env.USDA_API_KEY ? 'Set' : 'Not set');
console.log('Nutritionix App ID:', process.env.NUTRITIONIX_APP_ID ? 'Set' : 'Not set');
console.log('====================================');

// Import routes AFTER environment variables
import authRoutes from './src/routes/auth.js';
import dietRoutes from './src/routes/diet.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/diet', dietRoutes); // Add diet routes

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.log('❌ MongoDB connection error:', err));

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Diet Planner API available at http://localhost:${PORT}/api/diet`);
});