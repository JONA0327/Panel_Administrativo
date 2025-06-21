// server/index.js
const { Readable } = require('stream');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config();

const Config = require('./DB/config');
const Product = require('./DB/productos');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
const imageCacheDir = path.join(__dirname, 'image_cache');
if (!fs.existsSync(imageCacheDir)) {
  fs.mkdirSync(imageCacheDir, { recursive: true });
}
app.use('/images', express.static(imageCacheDir));

// Carga de credenciales de Google Drive
const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
let driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;
let drive;

if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
  const auth = new google.auth.GoogleAuth({
    keyFile: serviceAccountPath,
    scopes: ['https://www.googleapis.com/auth/drive']
  });
  drive = google.drive({ version: 'v3', auth });
} else {
  console.warn('⚠️ No se encontró el archivo de credenciales de Google Drive. Revisa GOOGLE_SERVICE_ACCOUNT_PATH.');
}

// Conexión a MongoDB y carga inicial de configuración
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB connected');

  // Carga desde la DB el driveFolderId si existe
  const cfg = await Config.findOne();
  if (cfg && cfg.driveFolderId) {
    driveFolderId = cfg.driveFolderId;
    console.log(`🗂️  Drive folder cargado desde DB. Folder ID: ${driveFolderId}`);
  } else {
    console.warn('⚠️ Google Drive configurado pero NO hay carpeta. Usa POST /config/drive-folder para establecerla.');
  }

  // Si tenemos drive y carpeta, compartimos la carpeta con la cuenta de servicio
  if (drive && driveFolderId && serviceAccountPath) {
    try {
      const creds = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      const serviceEmail = creds.client_email;
      await drive.permissions.create({
        fileId: driveFolderId,
        requestBody: {
          role: 'writer',
          type: 'user',
          emailAddress: serviceEmail
        }
      });
      console.log(`✅ Carpeta ${driveFolderId} compartida con ${serviceEmail} como Editor`);
    } catch (err) {
      console.warn('⚠️ No se pudo compartir la carpeta con la cuenta de servicio:', err.message);
    }
  }
})
.catch(err => console.error('❌ MongoDB connection error:', err));

// Endpoint para configurar carpeta de Drive
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

    // Compartir la carpeta con la cuenta de servicio inmediatamente
    if (drive && serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      try {
        const creds = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        const serviceEmail = creds.client_email;
        await drive.permissions.create({
          fileId: driveFolderId,
          requestBody: {
            role: 'writer',
            type: 'user',
            emailAddress: serviceEmail
          }
        });
        console.log(`✅ Carpeta ${driveFolderId} compartida con ${serviceEmail} como Editor`);
      } catch (err) {
        console.warn('⚠️ No se pudo compartir la carpeta con la cuenta de servicio:', err.message);
        return res.status(500).json({
          error: 'Failed to share folder with service account',
          details: err.message
        });
      }
    }

    res.json({ message: 'Drive folder configured', folderId: driveFolderId });
  } catch (err) {
    console.error('Error saving Drive folder config:', err);
    res.status(500).json({ error: 'Failed to save config' });
  }
});

// Obtener carpeta actual de Drive
app.get('/config/drive-folder', (req, res) => {
  res.json({ folderId: driveFolderId });
});

// Obtener el email de la cuenta de servicio
app.get('/config/service-account', (req, res) => {
  if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) {
    return res.status(404).json({ error: 'Service account not configured' });
  }
  try {
    const creds = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    return res.json({ email: creds.client_email || null });
  } catch (err) {
    console.error('Error reading service account credentials:', err);
    return res.status(500).json({ error: 'Failed to read service account' });
  }
});

// Crear subcarpeta en la carpeta principal de Drive
app.post('/config/subfolders', async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name required' });
  }
  if (!drive || !driveFolderId) {
    return res.status(500).json({ error: 'Drive not configured' });
  }
  try {
    const fileMetadata = {
      name: name.trim(),
      mimeType: 'application/vnd.google-apps.folder',
      parents: [driveFolderId]
    };
    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id'
    });
    const folderId = response.data.id;

    // Compartir la subcarpeta con la cuenta de servicio
    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      try {
        const creds = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        const serviceEmail = creds.client_email;
        await drive.permissions.create({
          fileId: folderId,
          requestBody: {
            role: 'writer',
            type: 'user',
            emailAddress: serviceEmail
          }
        });
      } catch (err) {
        console.warn('⚠️ No se pudo compartir la subcarpeta con la cuenta de servicio:', err.message);
      }
    }

    const link = `https://drive.google.com/drive/folders/${folderId}`;
    await Config.findOneAndUpdate(
      {},
      { $push: { subfolders: { name: name.trim(), folderId, link } } },
      { upsert: true }
    );

    res.status(201).json({ name: name.trim(), folderId, link });
  } catch (err) {
    console.error('Error creating subfolder:', err);
    res.status(500).json({ error: 'Failed to create subfolder', details: err.message });
  }
});

// Obtener subcarpetas guardadas
app.get('/config/subfolders', async (req, res) => {
  try {
    const cfg = await Config.findOne();
    res.json(cfg?.subfolders || []);
  } catch (err) {
    console.error('Error fetching subfolders:', err);
    res.status(500).json({ error: 'Failed to fetch subfolders', details: err.message });
  }
});

// Función corregida para subir base64 a Drive usando Readable stream
async function uploadImage(dataUrl, parentId = driveFolderId) {
  if (!drive) throw new Error('Google Drive not configured');

  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error('Invalid image data');
  const mimeType = match[1];
  const buffer   = Buffer.from(match[2], 'base64');

  const bufferStream = new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    }
  });

  const fileMetadata = {
    name: `product-${Date.now()}`,
    mimeType,
    ...(parentId ? { parents: [parentId] } : {})
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: { mimeType, body: bufferStream },
    fields: 'id'
  });

  const fileId = response.data.id;
  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' }
  });

  return {
    url: `https://drive.google.com/uc?id=${fileId}`,
    fileId
  };
}

function extractFileId(url) {
  const match = /id=([^&]+)/.exec(url || '');
  return match ? match[1] : null;
}

async function deleteImageFromDrive(fileId) {
  if (!drive || !fileId) return;
  try {
    await drive.files.delete({ fileId });
  } catch (err) {
    console.error('Error deleting image from Drive:', err.message);
  }
}

async function updateImageOnDrive(fileId, dataUrl) {
  if (!drive || !fileId) throw new Error('Google Drive not configured');

  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error('Invalid image data');
  const mimeType = match[1];
  const buffer = Buffer.from(match[2], 'base64');

  const bufferStream = new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    }
  });

  await drive.files.update({
    fileId,
    media: { mimeType, body: bufferStream }
  });

  return `https://drive.google.com/uc?id=${fileId}`;
}

async function getLocalImage(fileId) {
  if (!fileId) return null;
  const existing = fs.readdirSync(imageCacheDir).find(f => f.startsWith(`${fileId}.`));
  if (existing) {
    return `/images/${existing}`;
  }
  if (!drive) return null;
  try {
    const meta = await drive.files.get({ fileId, fields: 'mimeType' });
    const mime = meta.data.mimeType || '';
    const extMap = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif'
    };
    const ext = extMap[mime] || mime.split('/').pop() || 'bin';
    const filePath = path.join(imageCacheDir, `${fileId}.${ext}`);
    const driveRes = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );
    await new Promise((resolve, reject) => {
      const dest = fs.createWriteStream(filePath);
      driveRes.data.on('error', reject).pipe(dest);
      dest.on('finish', resolve).on('error', reject);
    });
    return `/images/${fileId}.${ext}`;
  } catch (err) {
    console.error('Error downloading image:', err.message);
    return null;
  }
}

function deleteLocalImage(fileId) {
  if (!fileId) return;
  fs.readdirSync(imageCacheDir).forEach(f => {
    if (f.startsWith(`${fileId}.`)) {
      try {
        fs.unlinkSync(path.join(imageCacheDir, f));
      } catch (err) {
        console.error('Error deleting cached image:', err.message);
      }
    }
  });
}

// CRUD de productos

app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    const withLocal = await Promise.all(
      products.map(async p => {
        const fileId = p.fileId || extractFileId(p.image);
        const localImage = await getLocalImage(fileId);
        return { ...p.toObject(), localImage };
      })
    );
    res.json(withLocal);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/products/:id/image', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const fileId = product.fileId || extractFileId(product.image);
    if (!fileId) return res.status(404).json({ error: 'Image not available' });
    if (!drive) return res.status(500).json({ error: 'Drive not configured' });

    const driveRes = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );
    res.setHeader('Content-Type', driveRes.headers['content-type'] || 'application/octet-stream');
    driveRes.data.pipe(res);
  } catch (err) {
    console.error('Error streaming image:', err);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

app.post('/products', async (req, res) => {
  try {
    if (
      req.body.image &&
      typeof req.body.image === 'string' &&
      req.body.image.startsWith('data:')
    ) {
      try {
        const parentId = req.body.subfolderId || driveFolderId;
        const uploaded = await uploadImage(req.body.image, parentId);
        req.body.image = uploaded.url;
        req.body.fileId = uploaded.fileId;
      } catch (err) {
        console.error('Error en uploadImage:', err);
        return res.status(400).json({ error: err.message });
      }
    }
    const product = new Product(req.body);
    await product.save();
    await getLocalImage(product.fileId || extractFileId(product.image));
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(400).json({ error: 'Failed to create product', details: err.message });
  }
});

app.put('/products/:id', async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const allowedFields = ['suggestedInfo', 'keywords', 'price', 'currency'];
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (
      req.body.image &&
      typeof req.body.image === 'string' &&
      req.body.image.startsWith('data:')
    ) {
      try {
        if (existing.fileId) {
          await deleteImageFromDrive(existing.fileId);
        }
        const parentId = req.body.subfolderId || existing.subfolderId || driveFolderId;
        const uploaded = await uploadImage(req.body.image, parentId);
        updateData.image = uploaded.url;
        updateData.fileId = uploaded.fileId;
      } catch (err) {
        console.error('Error updating image:', err);
        return res.status(400).json({ error: err.message });
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    await getLocalImage(product.fileId || extractFileId(product.image));
    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(400).json({ error: 'Failed to update product', details: err.message });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const fileId = product.fileId || extractFileId(product.image);
    await deleteImageFromDrive(fileId);
    deleteLocalImage(fileId);

    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(400).json({ error: 'Failed to delete product', details: err.message });
  }
});

// Arrancar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
