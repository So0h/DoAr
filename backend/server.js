require('dotenv').config();
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');


const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: "https://www.thedoar.com",
  credentials: true,
}));

app.use(express.json({ limit: '50mb' })); // Needed for canvas image
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Parse FormData
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/model', require('./routes/model'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/generate', require('./routes/generate'));
app.use('/api/edit', require('./routes/edit')); // ✅ New Canvas snapshot -> Edit

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Unexpected server error:', err.message);
  res.status(500).json({ message: 'Unexpected server error', details: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


