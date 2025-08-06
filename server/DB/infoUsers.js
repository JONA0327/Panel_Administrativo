const { MongoClient } = require('mongodb');
const config = require('./config');

// URL y nombre de la base de datos desde el archivo de configuración o variables de entorno
const dbUrl = config.MONGODB_URI || process.env.MONGODB_URI;

// Permite configurar el nombre de la base de datos mediante DB_NAME o deducirlo de la URI
const dbName =
  process.env.DB_NAME ||
  (() => {
    try {
      return dbUrl ? new URL(dbUrl).pathname.replace('/', '') : undefined;
    } catch {
      return undefined;
    }
  })() ||
  'admin';

const collectionName = 'InfoUsers';

async function getInfoUsers() {
  const client = new MongoClient(dbUrl, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const users = await collection.find({}).toArray();
    return users;
  } catch (err) {
    console.error('Error al obtener InfoUsers:', err);
    throw err;
  } finally {
    await client.close();
  }
}

// Si ejecutas este archivo directamente, muestra los usuarios en consola
if (require.main === module) {
  getInfoUsers()
    .then(users => {
      console.log('InfoUsers:', users);
    })
    .catch(err => {
      console.error('Error:', err);
    });
}

module.exports = { getInfoUsers, dbUrl, dbName };
