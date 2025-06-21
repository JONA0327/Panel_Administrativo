// server/index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const { google } = require('googleapis');
require('dotenv').config();

const Config = require('./DB/config');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Load Google Drive credentials
const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
let driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;
let drive;

if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
  const auth = new google.auth.GoogleAuth({
    keyFile: serviceAccountPath,
    scopes: ['https://www.googleapis.com/auth/drive']
  });
  drive = google.drive({ version: 'v3', auth });

  // Log Drive folder status on startup
  if (driveFolderId) {
    console.log(`✅ Google Drive configurado. Folder ID: ${driveFolderId}`);
  } else {
    console.warn(`⚠️ Google Drive configurado pero NO hay carpeta. Usa POST /config/drive-folder para establecerla.`);
  }
} else {
  console.warn('⚠️ No se encontró el archivo de credenciales de Google Drive. Revisa GOOGLE_SERVICE_ACCOUNT_PATH.');
}

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    console.log('✅ MongoDB connected');
    const cfg = await Config.findOne();
    if (cfg && cfg.driveFolderId) {
      driveFolderId = cfg.driveFolderId;
      console.log(`🗂️  Drive folder cargado desde DB. Folder ID: ${driveFolderId}`);
    }
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Load Mongoose model
const Product = require('./DB/productos');

// Endpoint to configure Drive folder at runtime
app.post('/config/drive-folder', async (req, res) => {
  const { folderId } = req.body;
  if (!folderId || typeof folderId !== 'string') {
    return res.status(400).json({ error: 'Folder ID required' });
  }
  try {
    const cfg = await Config.findOneAndUpdate(
      {},
      { driveFolderId: folderId },
      { new: true, upsert: true }
    );
    driveFolderId = cfg.driveFolderId;
    console.log(`🗂️  Drive folder actualizado. Nuevo Folder ID: ${driveFolderId}`);
    res.json({ message: 'Drive folder configured', folderId: driveFolderId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save config' });
  }
});

// Retrieve current Drive folder ID
app.get('/config/drive-folder', (req, res) => {
  res.json({ folderId: driveFolderId });
});

// Helper to upload base64 image to Drive
async function uploadImage(dataUrl) {
  if (!drive) throw new Error('Google Drive not configured');
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error('Invalid image data');
  const mimeType = match[1];
  const buffer = Buffer.from(match[2], 'base64');

  const fileMetadata = {
    name: `product-${Date.now()}`,
    mimeType
  };
  if (driveFolderId) {
    fileMetadata.parents = [driveFolderId];
  }

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: { mimeType, body: buffer },
    fields: 'id'
  });

  const fileId = response.data.id;
  // Make it publicly readable
  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' }
  });

  return `https://drive.google.com/uc?id=${fileId}`;
}

// CRUD endpoints for products

// Get all products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create a new product (with optional image upload)
app.post('/products', async (req, res) => {
  try {
    if (req.body.image &&
        typeof req.body.image === 'string' &&
        req.body.image.startsWith('data:')) {
      try {
        req.body.image = await uploadImage(req.body.image);
      } catch (err) {
        return res.status(400).json({ error: 'Image upload failed', details: err.message });
      }
    }
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create product', details: err.message });
  }
});

// Update an existing product
app.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update product', details: err.message });
  }
});

// Delete a product
app.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete product', details: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
