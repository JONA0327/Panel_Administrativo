const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema({
  name: String,
  description: String,
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
  dosages: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      dosage: String
    }
  ]
});

module.exports = mongoose.model('Disease', diseaseSchema);
