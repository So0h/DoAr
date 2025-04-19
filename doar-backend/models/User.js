const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  username: String,
  password: String // For demo only; use hashing in production!
});
module.exports = mongoose.model('User', UserSchema);
