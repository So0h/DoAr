const express = require('express');
const multer = require('multer');
const Model = require('../models/Model');
const auth = require('../middleware/auth');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB limit

// Upload
router.post('/upload', auth, upload.single('model'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const model = await Model.create({
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname
    });
    res.status(201).json({ modelId: model._id, filename: model.filename });
  } catch {
    res.status(500).json({ message: 'Upload error' });
  }
});

// List
router.get('/list', auth, async (req, res) => {
  try {
    const models = await Model.find({ userId: req.user.id });
    res.json(models);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve model file
router.get('/file/:filename', auth, (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

module.exports = router;
