const express = require('express');
const Model = require('../models/Model');
const auth = require('../middleware/auth');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const router = express.Router();


// --------------------
// Route: POST /ai/chat
// Description: GPT chatbot (non-edit reasoning)
// --------------------
router.post('/chat',  async (req, res) => {
  try {
    const { messages } = req.body; // <-- get full conversation history

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'messages array is required' });
    }

    const openaiRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: messages, // <-- send the full history
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = openaiRes.data.choices[0].message.content;
    res.json({ response: reply });
  } catch (err) {
    console.error('Chat error:', err.response?.data || err.message);
    res.status(500).json({ message: 'OpenAI error', details: err.message });
  }
});


module.exports = router;
