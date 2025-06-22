const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  action: String,
  details: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Activity', activitySchema);
