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

module.exports = router;
