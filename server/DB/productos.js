// server/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  suggestedInfo: String,
  keywords: [String],
  price: Number,
  currency: String,
  image: String,
  fileId: String,
  subfolderId: String
});

// El tercer parámetro fuerza el nombre de colección si lo necesitas:
// module.exports = mongoose.model('Product', productSchema, 'mi_coleccion');

module.exports = mongoose.model('Product', productSchema);
