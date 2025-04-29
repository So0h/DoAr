const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalName: { type: String, required: true },
  mainFile: { type: String, required: true }, // .gltf or .glb
  uploadId: { type: String, required: true }, // userId as string
  edited: { type: Boolean, default: false }
});

module.exports = mongoose.model('Model', modelSchema);
