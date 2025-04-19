const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const router = express.Router();

// JWT middleware (reuse from Phase 1)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// AI prompt endpoint
router.post('/prompt', authenticateToken, async (req, res) => {
  const { prompt } = req.body;
  const user = await User.findById(req.user.userId);
  if (!user || user.credits < 1) return res.status(403).json({ message: 'Not enough credits' });

  try {
    // Example: Use OpenAI API (replace with open-source model as needed)
    const aiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    }, {
      headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` }
    });

    user.credits -= 1;
    await user.save();

    res.json({ response: aiRes.data.choices[0].message.content, credits: user.credits });
  } catch (err) {
    res.status(500).json({ message: 'AI error', error: err.toString() });
  }
});

module.exports = router;
