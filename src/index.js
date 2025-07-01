import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';      // ← aquí importas Tailwind
import App from './App';

// Inyecta token de autenticación en todas las peticiones fetch
const originalFetch = window.fetch;
window.fetch = (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  return originalFetch(url, { ...options, headers });
};


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
