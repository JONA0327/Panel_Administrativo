const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  driveFolderId: String,
  subfolders: {
    type: [{
      name: String,
      folderId: String,
      link: String
    }],
    default: []
  }
});

module.exports = mongoose.model('Config', configSchema);
