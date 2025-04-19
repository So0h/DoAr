const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  credits: { type: Number, default: 10 } // Add this line
});
module.exports = mongoose.model('User', UserSchema);
