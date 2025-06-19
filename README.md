# Panel Administrativo

This project is a simple React dashboard with a sidebar and welcome screen.
It was bootstrapped using Create React App and styled with Tailwind CSS.


## Setup

1. Install dependencies
   ```bash
   npm install
   ```
2. Start the development server
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`.
Tailwind CSS is preconfigured so you can immediately use its utility classes.

## Server

The backend API lives in the `server/` folder. To run it locally you need Node.js
dependencies installed and a MongoDB instance running. Set the `MONGODB_URI`
environment variable if you want to use a custom database URL.

```bash
cd server
npm install           # install server dependencies
npm run dev           # start with nodemon
```

The server listens on port `4000` by default.

