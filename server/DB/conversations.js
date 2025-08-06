const mongoose = require('mongoose');

const { normalizePhone } = require('../utils/normalizePhone');

const conversationSchema = new mongoose.Schema({
  sessionId: String,
  phone: String,
  messages: [mongoose.Schema.Types.Mixed]
}, { timestamps: true });

conversationSchema.pre('save', function (next) {
  if (this.phone) {
    this.phone = normalizePhone(this.phone);
  }
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema, 'conversaciones');
