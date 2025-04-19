const express = require('express');
const Model = require('../models/Model');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to check JWT
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

// Upload model (for demo: send as base64 string)
router.post('/upload', authenticateToken, async (req, res) => {
  const { name, modelData } = req.body;
  const model = await Model.create({ userId: req.user.userId, name, modelData });
  res.json({ message: 'Model uploaded', modelId: model._id });
});

// List all models for the logged-in user
router.get('/list', authenticateToken, async (req, res) => {
  const models = await Model.find({ userId: req.user.userId });
  res.json(models);
});

// Retrieve a specific model by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const model = await Model.findOne({ _id: req.params.id, userId: req.user.userId });
  if (!model) return res.status(404).json({ message: 'Model not found' });
  res.json(model);
});


module.exports = router;
