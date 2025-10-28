require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

console.log('📍 Connecting to MongoDB Atlas...');

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas successfully!');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  console.log('⚠️  Falling back to in-memory storage for development');
});

// Monitor MongoDB connection
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose disconnected from MongoDB');
});

// Routes
console.log('📍 Registering auth routes...');
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes registered at /api/auth');

// Health Check Route
app.get('/', (req, res) => {
    res.json({ 
      message: 'Todo App API is running!',
      database: mongoose.connection.readyState === 1 ? 'MongoDB Atlas Connected' : 'MongoDB Disconnected'
    });
});

// Test route to verify routing works
app.get('/api/test', (req, res) => {
    res.json({ message: 'API routing works!' });
});

// 404 handler for debugging
app.use((req, res) => {
    console.log('❌ Route not found:', req.method, req.path);
    res.status(404).json({ 
        error: 'Route not found',
        method: req.method,
        path: req.path 
    });
});

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server Started at http://localhost:${PORT}`);
    console.log('📝 Running with MongoDB Atlas');
    console.log('📋 Available routes:');
    console.log('   GET  /');
    console.log('   GET  /api/test');
    console.log('   POST /api/auth/signup');
    console.log('   POST /api/auth/login');
    console.log('   GET  /api/auth/me');
});

// Handle server errors
server.on('error', (error) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please free up the port or use a different one.`);
    }
});

// Prevent process from exiting
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⚠️  Shutting down gracefully...');
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
});
