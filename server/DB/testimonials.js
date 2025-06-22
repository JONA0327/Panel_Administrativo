const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: String,
  associatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  video: String,
  fileId: String,
  subfolderId: String
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
