const express = require('express');
const Model = require('../models/Model');
const auth = require('../middleware/auth');
const axios = require('axios');
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const router = express.Router();

router.post('/edit', auth, async (req, res) => {
  try {
    const { modelId, prompt } = req.body;
    const model = await Model.findById(modelId);
    if (!model || String(model.userId) !== req.user.id)
      return res.status(404).json({ message: 'Model not found' });

    const inputPath = path.join(__dirname, '../uploads', model.filename);
    const outputFilename = Date.now() + '-edited-' + model.filename;
    const outputPath = path.join(__dirname, '../uploads', outputFilename);

    // 1. Get Blender Python script from BlenderGPT's LLM API
    const gptRes = await axios.post(process.env.BLENDERGPT_API, {
      prompt,
      input_gltf: inputPath,
      output_gltf: outputPath
    }, { timeout: 120000 }); // 2 min timeout
    const pythonScript = gptRes.data.script;
    const scriptPath = path.join(__dirname, '../uploads', `script-${Date.now()}.py`);
    fs.writeFileSync(scriptPath, pythonScript);

    // 2. Run Blender in headless mode
    execFileSync(process.env.BLENDER_PATH, [
      '--background',
      '--python', scriptPath,
      '--', inputPath, outputPath
    ], { timeout: 120000 }); // 2 min timeout

    // 3. Save new model
    const editedModel = await Model.create({
      userId: req.user.id,
      filename: outputFilename,
      originalName: model.originalName,
      edited: true
    });
    res.json({ modelId: editedModel._id, filename: editedModel.filename });
  } catch (err) {
    if (err.response) return res.status(500).json({ message: 'BlenderGPT error', details: err.response.data });
    res.status(500).json({ message: 'Edit error', details: err.message });
  }
});

module.exports = router;
