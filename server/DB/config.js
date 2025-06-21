const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  driveFolderId: String
});

module.exports = mongoose.model('Config', configSchema);
