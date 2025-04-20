require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

mongoose.connect(process.env.MONGO_URI);

app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/model', require('./routes/model'));
app.use('/api/ai', require('./routes/ai'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((err, req, res, next) => {
  res.status(500).json({ message: 'Unexpected error', details: err.message });
});

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
