const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Missing fields' });
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Username taken' });
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
