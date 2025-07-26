const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  sessionId: String,
  messages: [mongoose.Schema.Types.Mixed]
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema, 'conversaciones');
