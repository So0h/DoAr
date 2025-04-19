const mongoose = require('mongoose');
const ModelSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  name: String,
  modelData: String, // For demo; use file storage in production
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Model', ModelSchema);
