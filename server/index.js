const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const { google } = require('googleapis');
require('dotenv').config();

const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
let driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;
let drive;

if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
  const auth = new google.auth.GoogleAuth({
    keyFile: serviceAccountPath,
    scopes: ['https://www.googleapis.com/auth/drive']
  });
  drive = google.drive({ version: 'v3', auth });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


const Product = require('./DB/productos');

app.post('/config/drive-folder', (req, res) => {
  const { folderId } = req.body;
  if (!folderId || typeof folderId !== 'string') {
    return res.status(400).json({ error: 'Folder ID required' });
  }
  driveFolderId = folderId;
  res.json({ message: 'Drive folder configured' });
});

async function uploadImage(dataUrl) {
  if (!drive) throw new Error('Google Drive not configured');
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error('Invalid image data');
  const mimeType = match[1];
  const buffer = Buffer.from(match[2], 'base64');

  const fileMetadata = {
    name: `product-${Date.now()}`,
    mimeType,
  };
  if (driveFolderId) fileMetadata.parents = [driveFolderId];

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: { mimeType, body: buffer },
    fields: 'id'
  });

  const fileId = response.data.id;
  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' }
  });

  return `https://drive.google.com/uc?id=${fileId}`;
}

app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/products', async (req, res) => {
  try {
    if (req.body.image && typeof req.body.image === 'string' && req.body.image.startsWith('data:')) {
      try {
        req.body.image = await uploadImage(req.body.image);
      } catch (err) {
        return res.status(400).json({ error: 'Image upload failed' });
      }
    }
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create product' });
  }
});

app.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update product' });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete product' });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
