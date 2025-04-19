const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const router = express.Router();

// Dummy user registration (for demo)
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.create({ username, password });
  res.json({ message: 'User registered', userId: user._id });
});

// Login and issue tokens
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const accessToken = jwt.sign(
    { userId: user._id, username: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '10m' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id, type: 'refresh' },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1d' }
  );

  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });

  res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24*60*60*1000 });
  res.json({ accessToken });
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies.jwt;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const stored = await RefreshToken.findOne({ token: refreshToken, userId: decoded.userId, used: false });
    if (!stored) return res.status(401).json({ message: 'Invalid refresh token' });

    // Mark old token as used
    stored.used = true;
    await stored.save();

    // Issue new tokens
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '10m' }
    );
    const newRefreshToken = jwt.sign(
      { userId: decoded.userId, type: 'refresh' },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    );
    await RefreshToken.create({
      userId: decoded.userId,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24*60*60*1000 });
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(401).json({ message: 'Token expired or invalid' });
  }
});

module.exports = router;
