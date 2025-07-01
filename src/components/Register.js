import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function Register({ onRegistered, onShowLogin }) {
  const [form, setForm] = useState({ email: '', id4life: '', name: '', password: '', country: '', line: '' });
  const [error, setError] = useState(null);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setError(null);
    fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Registration failed');
        }
        return res.json();
      })
      .then(() => {
        if (onRegistered) onRegistered();
      })
      .catch(err => setError(err.message));
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-96 space-y-3">
        <h2 className="text-xl font-bold text-center">Registro</h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input className="w-full border p-2 rounded" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input className="w-full border p-2 rounded" name="id4life" placeholder="ID 4Life" value={form.id4life} onChange={handleChange} />
        <input className="w-full border p-2 rounded" name="name" placeholder="Nombre" value={form.name} onChange={handleChange} />
        <input className="w-full border p-2 rounded" name="country" placeholder="País" value={form.country} onChange={handleChange} />
        <input className="w-full border p-2 rounded" name="line" placeholder="Línea" value={form.line} onChange={handleChange} />
        <input type="password" className="w-full border p-2 rounded" name="password" placeholder="Contraseña" value={form.password} onChange={handleChange} />
        <button className="w-full bg-blue-500 text-white py-2 rounded" type="submit">Crear Cuenta</button>
        <button type="button" onClick={onShowLogin} className="w-full text-sm text-blue-500 underline">Volver</button>
      </form>
    </div>
  );
}

export default Register;
