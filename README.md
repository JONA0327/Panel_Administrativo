# Panel Administrativo

This project is a simple React dashboard with a sidebar and welcome screen.
It was bootstrapped using Create React App and styled with Tailwind CSS.


## Setup

1. Install dependencies
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your credentials
   ```bash
   cp .env.example .env
   # edit .env and add real values
   ```
3. Start the development server
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`.
Tailwind CSS is preconfigured so you can immediately use its utility classes.

### Google Drive

Copy `.env.example` to `.env` and set your credentials to enable Drive integration and the backend connection:

```
REACT_APP_GOOGLE_CLIENT_ID=<client_id>
REACT_APP_GOOGLE_API_KEY=<api_key>
MONGODB_URI=<mongodb_uri>
GOOGLE_SERVICE_ACCOUNT_PATH=<path_to_service_account_json>
# Optional default folder where product images will be uploaded
# If not provided, the folder can be configured at runtime from the UI
GOOGLE_DRIVE_FOLDER_ID=<drive_folder_id>
```

When a folder is chosen in the interface, its ID is sent to the backend using
the `/config/drive-folder` endpoint so the server knows where to upload product
images. The chosen ID is stored in MongoDB so it persists across server restarts.
You can query the current value using the `GET /config/drive-folder` endpoint.
This allows the destination to be changed without updating `.env`.

If you modify `.env` while the development server is running, restart the React
server so the new values are loaded.

## Server

The backend API lives in the `server/` folder. To run it locally you need Node.js
dependencies installed and a MongoDB instance running. Set the `MONGODB_URI`
environment variable if you want to use a custom database URL. Drive uploads
require `GOOGLE_SERVICE_ACCOUNT_PATH` pointing to your service account JSON file
and you may optionally define `GOOGLE_DRIVE_FOLDER_ID` to select a default
destination folder. If this variable is omitted, the folder can be selected
through the application and sent to the backend using the new configuration
endpoint.

```bash
cd server
npm install           # install server dependencies
npm run dev           # start with nodemon
```

The server listens on port `4000` by default.

