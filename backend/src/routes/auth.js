    import express from 'express';
    import jwt from 'jsonwebtoken';
    import User from '../models/User.js';

    const router = express.Router();

    // Generate JWT Token
    const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    };

    // Register
    router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
        $or: [{ email }, { username }]
        });

        if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'User already exists with this email or username'
        });
        }

        // Create new user
        const user = new User({ username, email, password });
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
        });
    }
    });

    // Login
    router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
        return res.status(400).json({
            success: false,
            message: 'Invalid credentials'
        });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
        return res.status(400).json({
            success: false,
            message: 'Invalid credentials'
        });
        }

        // Generate token                       
        const token = generateToken(user._id);

        res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
        });
    }
    });

    // Verify Token Middleware (for protected routes)
    export const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({
        success: false,
        message: 'Invalid token'
        });
    }
    };


    // Test route (GET)
    router.get('/', (req, res) => {
    res.json({
        success: true,
        message: "Auth API is working"
    });
    });

    
    
    export default router;