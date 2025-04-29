const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const router = express.Router();

const upload = multer();

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const imageBuffer = req.file.buffer;

    if (!prompt || !imageBuffer) {
      return res.status(400).json({ message: "Missing prompt or image" });
    }

    // 🧹 Prepare FormData to send to OpenAI
    const formData = new FormData();
    formData.append('model', 'gpt-image-1');
    formData.append('prompt', prompt);
    formData.append('image', imageBuffer, {
      filename: 'capture.png',
      contentType: 'image/png'
    });

    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/images/edits',
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API}`,
          ...formData.getHeaders(), // ✅ Important to set multipart headers correctly
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    const editedBase64 = openaiResponse.data.data[0]?.b64_json;
    if (!editedBase64) {
      throw new Error("No image returned from OpenAI");
    }

    res.json({ image: editedBase64 });
  } catch (err) {
    console.error('OpenAI Edit error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Edit error', details: err.response?.data || err.message });
  }
});

module.exports = router;
