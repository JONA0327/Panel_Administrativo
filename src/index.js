import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';      // ← aquí importas Tailwind
import App from './App';

// Inyecta token de autenticación en todas las peticiones fetch
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await originalFetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('approved');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('email');
    window.location.reload();
  }

  return response;
};


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
