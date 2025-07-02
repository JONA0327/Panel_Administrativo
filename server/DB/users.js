const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  id4life: String,
  name: String,
  passwordHash: String,
  country: String,
  line: String,
  approved: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  driveFolderId: String
});

module.exports = mongoose.model('User', userSchema);
