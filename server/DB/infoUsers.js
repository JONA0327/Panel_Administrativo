const { MongoClient } = require('mongodb');
const config = require('./config');

// URL y nombre de la base de datos desde el archivo de configuración
const dbUrl = config.MONGODB_URI || process.env.MONGODB_URI;
const dbName = 'admin'; // Cambia si tu base de datos tiene otro nombre
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

module.exports = { getInfoUsers };
