require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

mongoose.connect(process.env.MONGO_URI);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/model', require('./routes/model'));
app.use('/api/ai', require('./routes/ai'));


app.listen(5000, () => console.log('Server running on port 5000'));
