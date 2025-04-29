const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.length < 10) {
      return res.status(400).json({ message: 'Prompt is too short or missing.' });
    }

    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: "gpt-image-1",
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const base64Image = openaiResponse.data.data[0].b64_json;
    if (!base64Image) {
      throw new Error("No image generated.");
    }

    res.json({ image: base64Image });
  } catch (err) {
    console.error('GPT-Image-1 generation error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Image generation error', details: err.response?.data || err.message });
  }
});

module.exports = router;
