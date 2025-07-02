import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function Login({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Login failed');
        }
        return res.json();
      })
      .then(data => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('approved', data.approved ? '1' : '0');
        localStorage.setItem('isAdmin', data.isAdmin ? '1' : '0');
        localStorage.setItem('email', email);
        if (onLogin) onLogin({ ...data, email });
      })
      .catch(err => setError(err.message));
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-80 space-y-4">
        <h2 className="text-xl font-bold text-center">Iniciar Sesión</h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full border p-2 rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-500 text-white py-2 rounded" type="submit">
          Entrar
        </button>
        <button
          type="button"
          onClick={onShowRegister}
          className="w-full text-sm text-blue-500 underline"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}

export default Login;
