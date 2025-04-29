const express = require('express');
const multer = require('multer');
const Model = require('../models/Model');
const auth = require('../middleware/auth');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadId = req.uploadId || uuidv4();
    req.uploadId = uploadId;
    const dir = path.join(__dirname, '../uploads', uploadId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage });

/**
 * @route   POST /model/upload
 * @desc    Upload 3D models
 */
router.post('/upload', auth, upload.array('models', 10), async (req, res) => {
  const mainFile = req.files.find(f => f.originalname.endsWith('.gltf') || f.originalname.endsWith('.glb'));
  if (!mainFile) return res.status(400).json({ message: 'No .gltf or .glb file uploaded' });

  const model = await Model.create({
    userId: req.user.id,
    uploadId: req.uploadId,
    mainFile: mainFile.originalname,
    originalName: mainFile.originalname,
    edited: false,
  });

  res.status(201).json({ modelId: model._id, uploadId: req.uploadId, mainFile: mainFile.originalname });
});

/**
 * @route   GET /model/list
 * @desc    List all models for a user
 */
router.get('/list', auth, async (req, res) => {
  const models = await Model.find({ userId: req.user.id });
  res.json(models);
});

/**
 * @route   GET /model/file/:uploadId/:filename
 * @desc    Serve uploaded files
 */
router.get('/file/:uploadId/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.params.uploadId, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Not found');
  }
});

/**
 * @route   DELETE /model/:id
 * @desc    Delete a model and its files
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);
    if (!model) return res.status(404).json({ message: "Model not found" });

    if (model.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete files from filesystem
    const dir = path.join(__dirname, '../uploads', model.uploadId);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true });
    }

    await model.deleteOne();
    res.json({ message: "Model deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting model" });
  }
});

/**
 * @route   PUT /model/:id/rename
 * @desc    Rename a model
 */
router.put('/:id/rename', auth, async (req, res) => {
  const { newName } = req.body;
  if (!newName || newName.trim() === "") {
    return res.status(400).json({ message: "New name is required" });
  }

  try {
    const model = await Model.findById(req.params.id);
    if (!model) return res.status(404).json({ message: "Model not found" });

    if (model.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    model.originalName = newName.trim();
    await model.save();

    res.json({ message: "Model renamed successfully", model });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error renaming model" });
  }
});

module.exports = router;
