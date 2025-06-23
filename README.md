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
REACT_APP_API_URL=http://localhost:4000
MONGODB_URI=<mongodb_uri>
GOOGLE_SERVICE_ACCOUNT_PATH=<path_to_service_account_json>
# Optional default folder where product images will be uploaded
# If not provided, the folder can be configured at runtime from the UI
GOOGLE_DRIVE_FOLDER_ID=<drive_folder_id>
# Optional folder for testimonial videos
GOOGLE_DRIVE_TESTIMONIALS_FOLDER_ID=<drive_folder_id>
```

`REACT_APP_API_URL` configures the base URL for API requests. If omitted, the
application defaults to `http://localhost:4000`.

When a folder is chosen in the interface, its ID is sent to the backend using
the `/config/drive-folder` endpoint so the server knows where to upload product
images. The chosen ID is stored in MongoDB so it persists across server restarts.
You can query the current value using the `GET /config/drive-folder` endpoint.
This allows the destination to be changed without updating `.env`.

After configuring a new folder the backend automatically shares it with the
service account defined by `GOOGLE_SERVICE_ACCOUNT_PATH`. A message similar to:

```
✅ Carpeta <id> compartida con <service_email> como Editor
```

will appear in the server logs confirming the folder is ready to use.

Make sure the Google account that creates the Drive folder grants **edit**
permission to the service account either manually or from the front‑end when
selecting the folder. If the service account is not shared on the folder,
backend requests to create subfolders or upload images will fail with `File not
found` errors.

If you modify `.env` while the development server is running, restart the React
server so the new values are loaded.

## Server

The backend API lives in the `server/` folder. To run it locally you need Node.js
dependencies installed and a MongoDB instance running. Set the `MONGODB_URI`
environment variable if you want to use a custom database URL. Drive uploads
require `GOOGLE_SERVICE_ACCOUNT_PATH` pointing to your service account JSON file
and you may optionally define `GOOGLE_DRIVE_FOLDER_ID` and
`GOOGLE_DRIVE_TESTIMONIALS_FOLDER_ID` to select default upload folders for
product images and testimonial videos. If these variables are omitted, the
folders can be selected through the application and sent to the backend using
the configuration endpoints.

### Subfolders

The configuration model includes an optional `subfolders` array. New subfolders
are created through the `/config/subfolders` endpoint which only requires the
`name`; the server generates the `folderId` and `link` and stores them in this
array. Existing deployments will continue to work without changes. To start
using subfolders simply ensure your `Config` document has the array present. For
example:

```bash
db.configs.updateOne({}, { $set: { subfolders: [] } })
```
Subfolders should then be created from the UI or by calling the endpoint; the
server will handle storing the generated ID and link.

```bash
cd server
npm install           # install server dependencies
npm run dev           # start with nodemon
```

The server listens on port `4000` by default.

### Serving product images

Images uploaded to Google Drive can be retrieved through the new endpoint:

```http
GET /products/:id/image
```

It streams the file from Drive using the stored `fileId` (or extracting the ID
from the `image` field if `fileId` is missing). The response includes the proper
`Content-Type` header so it can be used directly as the `src` of an `<img>` tag.

### Testimonial videos

Testimonials are stored in their own collection and accept an uploaded video or
a direct URL. Videos uploaded as Base64 data are stored in the Drive folder
configured via the `/config/testimonials-folder` endpoint. The local server keeps
a cached copy under `server/video_cache` and exposes it under `/videos`.

New API routes:

```http
POST   /testimonials
GET    /testimonials
PUT    /testimonials/:id
DELETE /testimonials/:id
GET    /testimonials/:id/video  # Streams the file from Drive
```

Environment variable `GOOGLE_DRIVE_TESTIMONIALS_FOLDER_ID` can define the
default upload folder. The folder ID may also be configured at runtime via the
`POST /config/testimonials-folder` endpoint and queried with
`GET /config/testimonials-folder`.

### Production build

Generate the optimized React bundle and let the Node server handle it:

```bash
npm run build
NODE_ENV=production node server/index.js
```

When `NODE_ENV` is `production`, the server serves the files from the `build/`
directory so the frontend and backend run together under the same process.

