const fs = require('fs');
const { google } = require('googleapis');
require('dotenv').config();

function loadCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  }
  if (process.env.GOOGLE_SERVICE_ACCOUNT_PATH) {
    return JSON.parse(fs.readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_PATH, 'utf8'));
  }
  throw new Error('Service account credentials are required');
}

async function initDrive() {
  const auth = new google.auth.GoogleAuth({
    credentials: loadCredentials(),
    scopes: ['https://www.googleapis.com/auth/drive']
  });
  return google.drive({ version: 'v3', auth });
}

async function createFolder(drive, name, parentId) {
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    },
    supportsAllDrives: true,
    fields: 'id'
  });
  console.log('Created folder', res.data.id);
  return res.data.id;
}

async function listFiles(drive, parentId) {
  const res = await drive.files.list({
    driveId: process.env.GOOGLE_SHARED_DRIVE_ID,
    corpora: 'drive',
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    q: `'${parentId}' in parents and trashed=false`,
    fields: 'files(id, name, mimeType)'
  });
  console.log('Files in folder', parentId);
  for (const f of res.data.files) {
    console.log(` - ${f.name} (${f.id})`);
  }
}

(async () => {
  const driveId = process.env.GOOGLE_SHARED_DRIVE_ID;
  if (!driveId) {
    console.error('Set GOOGLE_SHARED_DRIVE_ID in your environment');
    process.exit(1);
  }

  const drive = await initDrive();

  // Create a folder in the shared drive
  const folderId = await createFolder(drive, 'demo-folder', driveId);

  // List files in the shared drive root
  await listFiles(drive, driveId);
})();
