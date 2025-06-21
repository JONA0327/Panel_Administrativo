const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: String,
  description: String,
  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  totalPrice: Number
});

module.exports = mongoose.model('Package', packageSchema);
