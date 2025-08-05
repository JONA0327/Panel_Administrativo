// server/index.js
const { Readable } = require('stream');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Config = require('./DB/config');
const Product = require('./DB/productos');
const Package = require('./DB/packages');
const Disease = require('./DB/diseases');
const Testimonial = require('./DB/testimonials');
const Activity = require('./DB/activities');
const User = require('./DB/users');
const Conversation = require('./DB/conversations');
const { getInfoUsers } = require('./DB/infoUsers');
const { MongoClient, ObjectId } = require('mongodb');
const infoUsersCollection = 'InfoUsers';

const app = express();
app.use(cors());
app.use(express.json({ limit: '500mb' }));

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'panelAdmin123456';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;

async function logActivity(action, details, userId) {
  try {
    await Activity.create({ action, details, user: userId });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
}

async function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    if (user.disabled) return res.status(403).json({ error: 'User disabled' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function approvedOnly(req, res, next) {
  if (!req.user?.approved) {
    return res.status(403).json({ error: 'User not approved' });
  }
  next();
}

function adminOnly(req, res, next) {
  if (req.user?.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
}
const imageCacheDir = path.join(__dirname, 'image_cache');
if (!fs.existsSync(imageCacheDir)) {
  fs.mkdirSync(imageCacheDir, { recursive: true });
}
app.use('/images', express.static(imageCacheDir));

const videoCacheDir = path.join(__dirname, 'video_cache');
if (!fs.existsSync(videoCacheDir)) {
  fs.mkdirSync(videoCacheDir, { recursive: true });
}
app.use('/videos', express.static(videoCacheDir));

// Carga de credenciales de Google Drive
const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
let driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;
let testimonialsFolderId = process.env.GOOGLE_DRIVE_TESTIMONIALS_FOLDER_ID || null;
let driveAccessToken = null;
let driveTokenExp = 0;
let drive;
let serviceAccountCreds = null;

const serviceAccountPathExists = serviceAccountPath && fs.existsSync(serviceAccountPath);
if (serviceAccountPathExists) {
  try {
    serviceAccountCreds = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  } catch (err) {
    console.warn('⚠️ Error leyendo GOOGLE_SERVICE_ACCOUNT_PATH:', err.message);
  }
} else if (serviceAccountJson) {
  try {
    serviceAccountCreds = JSON.parse(serviceAccountJson);
  } catch (err) {
    console.warn('⚠️ Error parsing GOOGLE_SERVICE_ACCOUNT_JSON:', err.message);
  }
}

function initDrive() {
  if (driveAccessToken) {
    const oauth = new google.auth.OAuth2();
    oauth.setCredentials({ access_token: driveAccessToken });
    drive = google.drive({ version: 'v3', auth: oauth });
  } else if (serviceAccountCreds) {
    const auth = serviceAccountPathExists
      ? new google.auth.GoogleAuth({
          keyFile: serviceAccountPath,
          scopes: ['https://www.googleapis.com/auth/drive']
        })
      : new google.auth.GoogleAuth({
          credentials: serviceAccountCreds,
          scopes: ['https://www.googleapis.com/auth/drive']
        });
    drive = google.drive({ version: 'v3', auth });
  } else {
    drive = null;
    console.warn(
      '⚠️ No se encontró un token de Drive ni credenciales de Google Drive.'
    );
  }
}

// Conexión a MongoDB y carga inicial de configuración
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB connected');

  // Carga desde la DB el driveFolderId y testimonialsFolderId si existen
  const cfg = await Config.findOne();
  if (cfg && cfg.driveFolderId) {
    driveFolderId = cfg.driveFolderId;
    console.log(`🗂️  Drive folder cargado desde DB. Folder ID: ${driveFolderId}`);
  } else {
    console.warn('⚠️ Google Drive configurado pero NO hay carpeta. Usa POST /config/drive-folder para establecerla.');
  }
  if (cfg && cfg.testimonialsFolderId) {
    testimonialsFolderId = cfg.testimonialsFolderId;
    console.log(`🗂️  Testimonials folder cargado desde DB. Folder ID: ${testimonialsFolderId}`);
  }
  if (cfg && cfg.driveAccessToken) {
    driveAccessToken = cfg.driveAccessToken;
    driveTokenExp = cfg.driveTokenExp || 0;
  }

  // Initialize Drive client using token or service account
  initDrive();

  // Si tenemos drive y carpeta, compartimos la carpeta con la cuenta de servicio
  if (drive && driveFolderId && serviceAccountCreds) {
    try {
      const serviceEmail = serviceAccountCreds.client_email;
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

  if (drive && testimonialsFolderId && serviceAccountCreds) {
    try {
      const serviceEmail = serviceAccountCreds.client_email;
      await drive.permissions.create({
        fileId: testimonialsFolderId,
        requestBody: {
          role: 'writer',
          type: 'user',
          emailAddress: serviceEmail
        }
      });
      console.log(`✅ Carpeta ${testimonialsFolderId} compartida con ${serviceEmail} como Editor`);
    } catch (err) {
      console.warn('⚠️ No se pudo compartir la carpeta de testimonios con la cuenta de servicio:', err.message);
    }
  }

  // Ensure admin account exists
  if (ADMIN_EMAIL) {
    let adminUser = await User.findOne({ email: ADMIN_EMAIL });
    if (!adminUser) {
      const hash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);
      adminUser = await User.create({
        email: ADMIN_EMAIL,
        name: 'Admin',
        passwordHash: hash,
        approved: true
      });
      console.log(`✅ Admin user ${ADMIN_EMAIL} creado`);
    }
  }
})
.catch(err => console.error('❌ MongoDB connection error:', err));

// ===== NUEVAS RUTAS PARA GESTIÓN DE BASE DE DATOS =====

// Obtener lista de colecciones
app.get('/database/collections', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    const collectionsWithStats = await Promise.all(
      collections.map(async (collection) => {
        try {
          const stats = await db.collection(collection.name).stats();
          return {
            name: collection.name,
            count: stats.count || 0,
            size: stats.size || 0,
            avgObjSize: stats.avgObjSize || 0
          };
        } catch (err) {
          return {
            name: collection.name,
            count: 0,
            size: 0,
            avgObjSize: 0
          };
        }
      })
    );

    res.json(collectionsWithStats);
  } catch (err) {
    console.error('Error fetching collections:', err);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Obtener estadísticas de la base de datos
app.get('/database/stats', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const stats = await db.stats();
    res.json({
      dataSize: stats.dataSize || 0,
      storageSize: stats.storageSize || 0,
      indexSize: stats.indexSize || 0,
      collections: stats.collections || 0,
      objects: stats.objects || 0
    });
  } catch (err) {
    console.error('Error fetching database stats:', err);
    res.status(500).json({ error: 'Failed to fetch database stats' });
  }
});

// Obtener conteos para el tablero principal
app.get('/dashboard/stats', async (req, res) => {
  try {
    const [productCount, packageCount, diseaseCount, testimonialCount] =
      await Promise.all([
        Product.countDocuments(),
        Package.countDocuments(),
        Disease.countDocuments(),
        Testimonial.countDocuments()
      ]);
    res.json({ productCount, packageCount, diseaseCount, testimonialCount });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.post('/activities', async (req, res) => {
  const { action, details } = req.body;
  try {
    const activity = await Activity.create({ action, details });
    res.status(201).json(activity);
  } catch (err) {
    console.error('Error logging activity:', err);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

app.get('/activities', async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name email');
    res.json(activities);
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

app.delete('/activities/:id', async (req, res) => {
  try {
    const act = await Activity.findByIdAndDelete(req.params.id);
    if (!act) return res.status(404).json({ error: 'Activity not found' });
    res.json({ message: 'Activity deleted' });
  } catch (err) {
    console.error('Error deleting activity:', err);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

// Obtener datos de una colección específica
app.get('/database/collections/:name/data', async (req, res) => {
  try {
    const { name } = req.params;
    const db = mongoose.connection.db;
    const collection = db.collection(name);
    
    // Limitar a 50 documentos para evitar sobrecarga
    const documents = await collection.find({}).limit(50).toArray();
    res.json(documents);
  } catch (err) {
    console.error('Error fetching collection data:', err);
    res.status(500).json({ error: 'Failed to fetch collection data' });
  }
});

// Eliminar una colección
app.delete('/database/collections/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const db = mongoose.connection.db;
    
    // Verificar que la colección existe
    const collections = await db.listCollections({ name }).toArray();
    if (collections.length === 0) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    await db.collection(name).drop();
    res.json({ message: `Collection ${name} deleted successfully` });
  } catch (err) {
    console.error('Error deleting collection:', err);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
});

// Crear respaldo de la base de datos
app.post('/database/backup', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    const backup = {
      timestamp: new Date().toISOString(),
      database: db.databaseName,
      collections: {}
    };
    
    // Exportar cada colección
    for (const collection of collections) {
      const collectionName = collection.name;
      const documents = await db.collection(collectionName).find({}).toArray();
      backup.collections[collectionName] = documents;
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="database-backup-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(backup);
  } catch (err) {
    console.error('Error creating backup:', err);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// ===== FIN DE RUTAS DE BASE DE DATOS =====

// InfoUsers routes
app.get('/info-users', auth, async (req, res) => {
  try {
    const users = await getInfoUsers();
    res.json(users);
  } catch (err) {
    console.error('Error fetching InfoUsers:', err);
    res.status(500).json({ error: 'Failed to fetch InfoUsers' });
  }
});

app.patch('/info-users/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    
    await client.connect();
    const db = client.db('admin');
    const collection = db.collection('InfoUsers');
    
    const result = await collection.updateOne(
      { _id: new require('mongodb').ObjectId(id) },
      { $set: updateData }
    );
    
    await client.close();
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating InfoUser:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/info-users/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    
    await client.connect();
    const db = client.db('admin');
    const collection = db.collection('InfoUsers');
    
    const result = await collection.deleteOne(
      { _id: new require('mongodb').ObjectId(id) }
    );
    
    await client.close();
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting InfoUser:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ----- Rutas de autenticación -----
app.post('/auth/register', async (req, res) => {
  const { email, id4life, name, password, country, line } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({ email, id4life, name, passwordHash: hash, country, line, approved: false });
    res.status(201).json({ id: user._id });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(400).json({ error: 'Failed to register user' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  try {
    let user = await User.findOne({ email });

    if (!user && email === ADMIN_EMAIL) {
      const hash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);
      user = await User.create({
        email: ADMIN_EMAIL,
        name: 'Admin',
        passwordHash: hash,
        approved: true
      });
    }

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.disabled) return res.status(403).json({ error: 'User disabled' });
    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, approved: user.approved, isAdmin: user.email === ADMIN_EMAIL });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/auth/pending', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ approved: false });
    res.json(users);
  } catch (err) {
    console.error('Error fetching pending users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/auth/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.patch('/auth/disable/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (typeof req.body.disabled === 'boolean') {
      user.disabled = req.body.disabled;
    } else {
      user.disabled = !user.disabled;
    }
    await user.save();
    await logActivity('User disabled toggled', user.email, req.user?._id);
    res.json({ message: 'User updated', disabled: user.disabled });
  } catch (err) {
    console.error('Error disabling user:', err);
    res.status(500).json({ error: 'Failed to disable user' });
  }
});

app.patch('/auth/approve/:id', auth, adminOnly, async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.driveFolderId) {
      const folderName = user.name || user.email;
      try {
        user.driveFolderId = await createUserFolder(folderName);
      } catch (err) {
        console.error('Error creating user folder:', err);
      }
    }
    user.approved = true;
    await user.save();
    await logActivity('User approved', user.email, req.user?._id);
    res.json({ message: 'User approved', driveFolderId: user.driveFolderId });
  } catch (err) {
    console.error('Error approving user:', err);
    res.status(500).json({ error: 'Failed to approve user' });
  }
});

// ----- Fin autenticación -----

// Todas las rutas siguientes requieren usuario autenticado y aprobado
app.use(auth);
app.use(approvedOnly);

// Crear carpeta raíz en Drive y compartirla con la cuenta de servicio
app.post('/config/create-root-folder', adminOnly, async (req, res) => {
  if (!drive) {
    return res.status(500).json({ error: 'Drive not configured' });
  }
  try {
    const name = (req.body?.name && String(req.body.name).trim()) || 'MediPanel_Storage';
    const response = await drive.files.create({
      requestBody: { name, mimeType: 'application/vnd.google-apps.folder' },
      fields: 'id'
    });
    const folderId = response.data.id;

    if (serviceAccountCreds) {
      try {
        await drive.permissions.create({
          fileId: folderId,
          requestBody: {
            role: 'writer',
            type: 'user',
            emailAddress: serviceAccountCreds.client_email
          }
        });
      } catch (err) {
        console.warn('⚠️ No se pudo compartir la carpeta con la cuenta de servicio:', err.message);
      }
    }

    const cfg = await Config.findOneAndUpdate(
      {},
      { driveFolderId: folderId },
      { new: true, upsert: true }
    );
    driveFolderId = cfg.driveFolderId;
    const link = `https://drive.google.com/drive/folders/${folderId}`;
    res.status(201).json({ folderId, link });
    await logActivity('Config updated', 'Root folder created', req.user?._id);
  } catch (err) {
    console.error('Error creating root folder:', err);
    res.status(500).json({ error: 'Failed to create folder', details: err.message });
  }
});

// Endpoint para configurar carpeta de Drive
app.post('/config/drive-folder', adminOnly, async (req, res) => {
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
    if (drive && serviceAccountCreds) {
      try {
        const serviceEmail = serviceAccountCreds.client_email;
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
    await logActivity('Config updated', 'Drive folder set', req.user?._id);
  } catch (err) {
    console.error('Error saving Drive folder config:', err);
    res.status(500).json({ error: 'Failed to save config' });
  }
});

// Obtener carpeta actual de Drive
app.get('/config/drive-folder', adminOnly, (req, res) => {
  res.json({ folderId: driveFolderId });
});

// Obtener token de Google Drive
app.get('/config/drive-token', adminOnly, (req, res) => {
  res.json({ token: driveAccessToken, exp: driveTokenExp });
});

// Guardar token de Google Drive
app.post('/config/drive-token', adminOnly, async (req, res) => {
  const { token, exp } = req.body || {};
  try {
    const cfg = await Config.findOneAndUpdate(
      {},
      { driveAccessToken: token || '', driveTokenExp: exp || 0 },
      { new: true, upsert: true }
    );
    driveAccessToken = cfg.driveAccessToken;
    driveTokenExp = cfg.driveTokenExp;
    initDrive();
    res.json({ message: 'Drive token updated' });
  } catch (err) {
    console.error('Error saving Drive token:', err);
    res.status(500).json({ error: 'Failed to save token' });
  }
});

// Configurar carpeta de Drive para testimonios
app.post('/config/testimonials-folder', adminOnly, async (req, res) => {
  const { folderId } = req.body;
  if (!folderId || typeof folderId !== 'string') {
    return res.status(400).json({ error: 'Folder ID required' });
  }
  try {
    const cfg = await Config.findOneAndUpdate(
      {},
      { testimonialsFolderId: folderId },
      { new: true, upsert: true }
    );
    testimonialsFolderId = cfg.testimonialsFolderId;

    if (drive && serviceAccountCreds) {
      try {
        const serviceEmail = serviceAccountCreds.client_email;
        await drive.permissions.create({
          fileId: testimonialsFolderId,
          requestBody: { role: 'writer', type: 'user', emailAddress: serviceEmail }
        });
        console.log(`✅ Carpeta ${testimonialsFolderId} compartida con ${serviceEmail} como Editor`);
      } catch (err) {
        console.warn('⚠️ No se pudo compartir la carpeta de testimonios con la cuenta de servicio:', err.message);
        return res.status(500).json({ error: 'Failed to share folder with service account', details: err.message });
      }
    }

    res.json({ message: 'Testimonials folder configured', folderId: testimonialsFolderId });
    await logActivity('Config updated', 'Testimonials folder set', req.user?._id);
  } catch (err) {
    console.error('Error saving testimonials folder config:', err);
    res.status(500).json({ error: 'Failed to save config' });
  }
});

app.get('/config/testimonials-folder', adminOnly, (req, res) => {
  res.json({ folderId: testimonialsFolderId });
});

// Obtener el email de la cuenta de servicio
app.get('/config/service-account', adminOnly, (req, res) => {
  if (!serviceAccountCreds) {
    return res.status(404).json({ error: 'Service account not configured' });
  }
  return res.json({ email: serviceAccountCreds.client_email || null });
});

// Crear subcarpeta en la carpeta principal de Drive
app.post('/config/subfolders', adminOnly, async (req, res) => {
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
    if (serviceAccountCreds) {
      try {
        const serviceEmail = serviceAccountCreds.client_email;
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
    await logActivity('Config updated', `Subfolder ${name.trim()} created`, req.user?._id);
  } catch (err) {
    console.error('Error creating subfolder:', err);
    res.status(500).json({ error: 'Failed to create subfolder', details: err.message });
  }
});

// Obtener subcarpetas guardadas
app.get('/config/subfolders', adminOnly, async (req, res) => {
  try {
    const cfg = await Config.findOne();
    res.json(cfg?.subfolders || []);
  } catch (err) {
    console.error('Error fetching subfolders:', err);
    res.status(500).json({ error: 'Failed to fetch subfolders', details: err.message });
  }
});

// Eliminar una subcarpeta registrada y opcionalmente su carpeta en Drive
app.delete('/config/subfolders/:id', adminOnly, async (req, res) => {
  const { id } = req.params;
  try {
    await Config.updateOne({}, { $pull: { subfolders: { folderId: id } } });

    if (drive) {
      try {
        await drive.files.delete({ fileId: id });
      } catch (err) {
        console.warn('⚠️  Error deleting Drive subfolder:', err.message);
      }
    }

    await logActivity('Config updated', `Subfolder ${id} deleted`, req.user?._id);
    res.json({ message: 'Subfolder deleted' });
  } catch (err) {
    console.error('Error deleting subfolder:', err);
    res.status(500).json({ error: 'Failed to delete subfolder', details: err.message });
  }
});

async function createUserFolder(name) {
  if (!drive || !driveFolderId) throw new Error('Drive not configured');
  const fileMetadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [driveFolderId]
  };
  const resp = await drive.files.create({ requestBody: fileMetadata, fields: 'id' });
  const folderId = resp.data.id;
  if (serviceAccountCreds) {
    try {
      const serviceEmail = serviceAccountCreds.client_email;
      await drive.permissions.create({
        fileId: folderId,
        requestBody: { role: 'writer', type: 'user', emailAddress: serviceEmail }
      });
    } catch (err) {
      console.warn('⚠️ No se pudo compartir la carpeta de usuario:', err.message);
    }
  }
  return folderId;
}


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

// ----- Video helpers -----
async function uploadVideo(dataUrl, parentId = testimonialsFolderId) {
  if (!drive) throw new Error('Google Drive not configured');

  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error('Invalid video data');
  const mimeType = match[1];
  const buffer = Buffer.from(match[2], 'base64');

  const bufferStream = new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    }
  });

  const fileMetadata = {
    name: `testimonial-${Date.now()}`,
    mimeType,
    ...(parentId ? { parents: [parentId] } : {})
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: { mimeType, body: bufferStream },
    fields: 'id'
  });

  const fileId = response.data.id;
  await drive.permissions.create({ fileId, requestBody: { role: 'reader', type: 'anyone' } });

  return { url: `https://drive.google.com/uc?id=${fileId}`, fileId };
}

async function deleteVideoFromDrive(fileId) {
  if (!drive || !fileId) return;
  try {
    await drive.files.delete({ fileId });
  } catch (err) {
    console.error('Error deleting video from Drive:', err.message);
  }
}

async function getLocalVideo(fileId) {
  if (!fileId) return null;
  const existing = fs.readdirSync(videoCacheDir).find(f => f.startsWith(`${fileId}.`));
  if (existing) return `/videos/${existing}`;
  if (!drive) return null;
  try {
    const meta = await drive.files.get({ fileId, fields: 'mimeType' });
    const mime = meta.data.mimeType || '';
    const ext = mime.split('/').pop() || 'mp4';
    const filePath = path.join(videoCacheDir, `${fileId}.${ext}`);
    const driveRes = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
    await new Promise((resolve, reject) => {
      const dest = fs.createWriteStream(filePath);
      driveRes.data.on('error', reject).pipe(dest);
      dest.on('finish', resolve).on('error', reject);
    });
    return `/videos/${fileId}.${ext}`;
  } catch (err) {
    console.error('Error downloading video:', err.message);
    return null;
  }
}

function deleteLocalVideo(fileId) {
  if (!fileId) return;
  fs.readdirSync(videoCacheDir).forEach(f => {
    if (f.startsWith(`${fileId}.`)) {
      try {
        fs.unlinkSync(path.join(videoCacheDir, f));
      } catch (err) {
        console.error('Error deleting cached video:', err.message);
      }
    }
  });
}

async function packageWithProducts(pkg) {
  const products = await Promise.all(
    pkg.productIds.map(async id => {
      const p = await Product.findById(id);
      if (!p) return null;
      const fileId = p.fileId || extractFileId(p.image);
      const localImage = await getLocalImage(fileId);
      return { ...p.toObject(), localImage };
    })
  );
  return { ...pkg.toObject(), products: products.filter(Boolean) };
}

async function diseaseWithDetails(disease) {
  const pkg = disease.packageId
    ? await Package.findById(disease.packageId)
    : null;
  const populatedPackage = pkg ? await packageWithProducts(pkg) : null;
  const populatedDosages = await Promise.all(
    (disease.dosages || []).map(async d => {
      const product = await Product.findById(d.productId);
      if (!product) return null;
      const fileId = product.fileId || extractFileId(product.image);
      const localImage = await getLocalImage(fileId);
      return { product: { ...product.toObject(), localImage }, dosage: d.dosage };
    })
  );
  return {
    ...disease.toObject(),
    package: populatedPackage,
    dosages: populatedDosages.filter(Boolean)
  };
}

// CRUD de productos

// Obtener productos con imagenes locales
// Obtener productos con imágenes locales
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    const withLocal = await Promise.all(
      products.map(async p => {
        const fileId     = p.fileId || extractFileId(p.image);
        const localImage = await getLocalImage(fileId);
        return { ...p.toObject(), localImage };
      })
    );
    return res.json(withLocal);
  } catch (err) {
    console.error('Error fetching products:', err);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});  // <- Cierre correcto de GET /products

// Sugerir productos según título usando DeepSeek
app.post('/packages/suggested', async (req, res) => {
  const { title } = req.body || {};
  if (!title) {
    return res.status(400).json({ error: 'Title required' });
  }

  // 1) Obtén todos los keywords de la BD
  let allowedKeywords = [];
  try {
    allowedKeywords = await Product.distinct('keywords');
    if (!Array.isArray(allowedKeywords)) allowedKeywords = [];
  } catch (err) {
    console.error('Error fetching allowed keywords:', err);
  }

  // 2) Prepara el prompt
  const systemPrompt = `
You are a product-matching assistant.
Given an input title and a list of ALLOWED KEYWORDS,
you must extract which of those keywords are relevant to the title.
Return a VALID JSON ARRAY of those matching keywords.
`;
  const userPrompt = `
Title: "${title}"
Allowed keywords: ${allowedKeywords.join(', ')}
`;

  // 3) Llama a DeepSeek
  let detected = [];
  try {
    const baseUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com';
    const dsUrl   = `${baseUrl}/chat/completions`;
    const resp    = await axios.post(
      dsUrl,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt.trim() },
          { role: 'user',   content: userPrompt.trim() }
        ],
        stream: false
      },
      {
        headers: {
          'Content-Type':  'application/json',
          Authorization:   `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );

    //  Limpia fences ```json ... ``` si vienen
    let content = resp.data.choices?.[0]?.message?.content || '';
    content = content
      .trim()
      .replace(/^```(?:json)?\r?\n/, '')
      .replace(/\r?\n```$/, '');

    detected = JSON.parse(content);
    if (!Array.isArray(detected)) detected = [];
  } catch (err) {
    console.error('DeepSeek API error:', err.response?.status, err.message);
  }

  // 4) Filtra tus productos por keywords detectados
  try {
    let products = await Product.find();
    if (detected.length) {
      const lowered = detected.map(k => k.toLowerCase());
      products = products.filter(p =>
        Array.isArray(p.keywords) &&
        p.keywords.some(kw => lowered.includes(kw.toLowerCase()))
      );
    }

    const withLocal = await Promise.all(
      products.map(async p => {
        const fileId     = p.fileId || extractFileId(p.image);
        const localImage = await getLocalImage(fileId);
        return { ...p.toObject(), localImage };
      })
    );
    res.json(withLocal);
  } catch (err) {
    console.error('Error suggesting products:', err);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});  // <- Cierre correcto de POST /packages/suggested


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
        const parentId = req.body.subfolderId || req.user?.driveFolderId || driveFolderId;
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
    await logActivity('Product created', product.name, req.user?._id);
    const localImage = await getLocalImage(
      product.fileId || extractFileId(product.image)
    );
    res.status(201).json({ ...product.toObject(), localImage });
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
        const parentId = req.body.subfolderId || existing.subfolderId || req.user?.driveFolderId || driveFolderId;
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
    await logActivity('Product updated', product.name, req.user?._id);
    const localImage = await getLocalImage(
      product.fileId || extractFileId(product.image)
    );
    res.json({ ...product.toObject(), localImage });
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

    await logActivity('Product deleted', product.name, req.user?._id);

    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(400).json({ error: 'Failed to delete product', details: err.message });
  }
});

// CRUD de paquetes

app.get('/packages', async (req, res) => {
  try {
    const pkgs = await Package.find();
    const populated = await Promise.all(pkgs.map(packageWithProducts));
    res.json(populated);
  } catch (err) {
    console.error('Error fetching packages:', err);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

app.post('/packages', async (req, res) => {
  try {
    const { name, description, productIds = [] } = req.body;
    const products = await Product.find({ _id: { $in: productIds } });
    const totalPrice = products.reduce((s, p) => s + (p.price || 0), 0);
    const pkg = new Package({ name, description, productIds, totalPrice });
    await pkg.save();
    await logActivity('Package created', pkg.name, req.user?._id);
    const populated = await packageWithProducts(pkg);
    res.status(201).json(populated);
  } catch (err) {
    console.error('Error creating package:', err);
    res.status(400).json({ error: 'Failed to create package', details: err.message });
  }
});

app.put('/packages/:id', async (req, res) => {
  try {
    const { name, description, productIds } = req.body;
    const updateData = { name, description };
    if (productIds) {
      updateData.productIds = productIds;
      const products = await Product.find({ _id: { $in: productIds } });
      updateData.totalPrice = products.reduce((s, p) => s + (p.price || 0), 0);
    }
    const pkg = await Package.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    await logActivity('Package updated', pkg.name, req.user?._id);
    const populated = await packageWithProducts(pkg);
    res.json(populated);
  } catch (err) {
    console.error('Error updating package:', err);
    res.status(400).json({ error: 'Failed to update package', details: err.message });
  }
});

app.delete('/packages/:id', async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    res.json({ message: 'Package deleted' });
  } catch (err) {
    console.error('Error deleting package:', err);
    res.status(400).json({ error: 'Failed to delete package', details: err.message });
  }
});

// CRUD de enfermedades

app.get('/diseases', async (req, res) => {
  try {
    const list = await Disease.find();
    const populated = await Promise.all(list.map(diseaseWithDetails));
    res.json(populated);
  } catch (err) {
    console.error('Error fetching diseases:', err);
    res.status(500).json({ error: 'Failed to fetch diseases' });
  }
});

app.post('/diseases', async (req, res) => {
  try {
    const { name, description, packageId, dosages = [] } = req.body;
    const disease = new Disease({ name, description, packageId, dosages });
    await disease.save();
    await logActivity('Disease created', disease.name, req.user?._id);
    const populated = await diseaseWithDetails(disease);
    res.status(201).json(populated);
  } catch (err) {
    console.error('Error creating disease:', err);
    res.status(400).json({ error: 'Failed to create disease', details: err.message });
  }
});

app.get('/diseases/:id', async (req, res) => {
  try {
    const disease = await Disease.findById(req.params.id);
    if (!disease) return res.status(404).json({ error: 'Disease not found' });
    const populated = await diseaseWithDetails(disease);
    res.json(populated);
  } catch (err) {
    console.error('Error fetching disease:', err);
    res.status(400).json({ error: 'Failed to fetch disease', details: err.message });
  }
});

app.put('/diseases/:id', async (req, res) => {
  try {
    const { name, description, packageId, dosages } = req.body;
    const updateData = { name, description, packageId, dosages };
    const disease = await Disease.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!disease) return res.status(404).json({ error: 'Disease not found' });
    await logActivity('Disease updated', disease.name, req.user?._id);
    const populated = await diseaseWithDetails(disease);
    res.json(populated);
  } catch (err) {
    console.error('Error updating disease:', err);
    res.status(400).json({ error: 'Failed to update disease', details: err.message });
  }
});

app.delete('/diseases/:id', async (req, res) => {
  try {
    const disease = await Disease.findByIdAndDelete(req.params.id);
    if (!disease) return res.status(404).json({ error: 'Disease not found' });
    await logActivity('Disease deleted', disease.name, req.user?._id);
    res.json({ message: 'Disease deleted' });
  } catch (err) {
    console.error('Error deleting disease:', err);
    res.status(400).json({ error: 'Failed to delete disease', details: err.message });
  }
});

// AI helpers for diseases

app.post('/diseases/describe', async (req, res) => {
  const { title } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Title required' });

  const systemPrompt = `You are a medical writer. Given the name of a disease, provide a short description in Spanish.`;
  const userPrompt = `Disease: "${title}"`;
  try {
    const baseUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com';
    const dsUrl = `${baseUrl}/chat/completions`;
    const resp = await axios.post(
      dsUrl,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt.trim() },
          { role: 'user', content: userPrompt.trim() }
        ],
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );
    let content = resp.data.choices?.[0]?.message?.content || '';
    content = content.trim().replace(/^```(?:json|text)?\r?\n/, '').replace(/\r?\n```$/, '');
    res.json({ description: content });
  } catch (err) {
    console.error('DeepSeek API error:', err.response?.status, err.message);
    res.status(500).json({ error: 'Failed to generate description' });
  }
});

app.post('/diseases/recommend-package', async (req, res) => {
  const { title } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Title required' });

  try {
    const pkgs = await Package.find();
    const names = pkgs.map(p => p.name);
    const systemPrompt = `You are a medical assistant. From the following packages choose the one that best matches the provided disease. If none match, reply with 'none'. Reply only with the package name or 'none'.`;
    const userPrompt = `Disease: "${title}"\nPackages: ${names.join(', ')}`;
    const baseUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com';
    const dsUrl = `${baseUrl}/chat/completions`;
    const resp = await axios.post(
      dsUrl,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt.trim() },
          { role: 'user', content: userPrompt.trim() }
        ],
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );
    let content = resp.data.choices?.[0]?.message?.content || '';
    content = content.trim().replace(/^```(?:json|text)?\r?\n/, '').replace(/\r?\n```$/, '').toLowerCase();
    const match = pkgs.find(p => content.includes(p.name.toLowerCase()));
    if (match) {
      const populated = await packageWithProducts(match);
      return res.json([populated]);
    }
    const all = await Promise.all(pkgs.map(packageWithProducts));
    res.json(all);
  } catch (err) {
    console.error('Error recommending package:', err);
    res.status(500).json({ error: 'Failed to recommend package' });
  }
});

// ----- CRUD de testimonios -----
app.get('/testimonials', async (req, res) => {
  try {
    const list = await Testimonial.find();
    const populated = await Promise.all(
      list.map(async t => {
        const fileId = t.fileId || extractFileId(t.video);
        const localVideo = await getLocalVideo(fileId);
        return { ...t.toObject(), localVideo };
      })
    );
    res.json(populated);
  } catch (err) {
    console.error('Error fetching testimonials:', err);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

app.post('/testimonials', async (req, res) => {
  try {
    if (
      req.body.video &&
      typeof req.body.video === 'string' &&
      req.body.video.startsWith('data:')
    ) {
      const parentId = req.body.subfolderId || req.user?.driveFolderId || testimonialsFolderId;
      const uploaded = await uploadVideo(req.body.video, parentId);
      req.body.video = uploaded.url;
      req.body.fileId = uploaded.fileId;
    }
    const testimonial = new Testimonial(req.body);
    await testimonial.save();
    await logActivity('Testimonial created', testimonial.name, req.user?._id);
    const localVideo = await getLocalVideo(testimonial.fileId || extractFileId(testimonial.video));
    res.status(201).json({ ...testimonial.toObject(), localVideo });
  } catch (err) {
    console.error('Error creating testimonial:', err);
    res.status(400).json({ error: 'Failed to create testimonial', details: err.message });
  }
});

app.put('/testimonials/:id', async (req, res) => {
  try {
    const existing = await Testimonial.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Testimonial not found' });

    const updateData = { name: req.body.name, associatedProducts: req.body.associatedProducts };
    if (req.body.subfolderId !== undefined) updateData.subfolderId = req.body.subfolderId;

    if (
      req.body.video &&
      typeof req.body.video === 'string' &&
      req.body.video.startsWith('data:')
    ) {
      if (existing.fileId) await deleteVideoFromDrive(existing.fileId);
      const parentId = req.body.subfolderId || existing.subfolderId || req.user?.driveFolderId || testimonialsFolderId;
      const uploaded = await uploadVideo(req.body.video, parentId);
      updateData.video = uploaded.url;
      updateData.fileId = uploaded.fileId;
    } else if (req.body.video !== undefined) {
      updateData.video = req.body.video;
    }

    const updated = await Testimonial.findByIdAndUpdate(req.params.id, updateData, { new: true });
    await logActivity('Testimonial updated', updated.name, req.user?._id);
    const localVideo = await getLocalVideo(updated.fileId || extractFileId(updated.video));
    res.json({ ...updated.toObject(), localVideo });
  } catch (err) {
    console.error('Error updating testimonial:', err);
    res.status(400).json({ error: 'Failed to update testimonial', details: err.message });
  }
});

app.delete('/testimonials/:id', async (req, res) => {
  try {
    const t = await Testimonial.findByIdAndDelete(req.params.id);
    if (!t) return res.status(404).json({ error: 'Testimonial not found' });
    const fileId = t.fileId || extractFileId(t.video);
    await deleteVideoFromDrive(fileId);
    deleteLocalVideo(fileId);
    await logActivity('Testimonial deleted', t.name, req.user?._id);
    res.json({ message: 'Testimonial deleted' });
  } catch (err) {
    console.error('Error deleting testimonial:', err);
    res.status(400).json({ error: 'Failed to delete testimonial', details: err.message });
  }
});

app.get('/testimonials/:id/video', async (req, res) => {
  try {
    const t = await Testimonial.findById(req.params.id);
    if (!t) return res.status(404).json({ error: 'Testimonial not found' });
    const fileId = t.fileId || extractFileId(t.video);
    if (!fileId) return res.status(404).json({ error: 'Video not available' });
    if (!drive) return res.status(500).json({ error: 'Drive not configured' });
    const driveRes = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
    res.setHeader('Content-Type', driveRes.headers['content-type'] || 'application/octet-stream');
    driveRes.data.pipe(res);
  } catch (err) {
    console.error('Error streaming video:', err);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// ----- Conversaciones -----
app.get('/conversations', async (req, res) => {
  try {
    const convs = await Conversation.find({}, { messages: 0 });
    res.json(convs);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

app.get('/conversations/:id', async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    const data = conv.toObject();
    if (!Array.isArray(data.messages)) data.messages = [];
    res.json(data);
  } catch (err) {
    console.error('Error fetching conversation:', err);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

app.delete('/conversations/:id', async (req, res) => {
  try {
    const conv = await Conversation.findByIdAndDelete(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    res.json({ message: 'Conversation deleted' });
  } catch (err) {
    console.error('Error deleting conversation:', err);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// Arrancar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;