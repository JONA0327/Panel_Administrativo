import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';      // ← aquí importas Tailwind
import App from './App';
import { handleApiError } from './utils/api';

// Inyecta token de autenticación en todas las peticiones fetch
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await originalFetch(url, { ...options, headers });

  await handleApiError(response);

  return response;
};


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
