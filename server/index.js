const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const geminiRouter = require('./gemini');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', geminiRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Handle SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`🤖 Robot Server running on port ${PORT}`);
    console.log(`📍 Local: http://localhost:${PORT}`);
});

module.exports = app;