import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function Register({ onRegistered, onShowLogin }) {
  const [form, setForm] = useState({
    email: '',
    id4life: '',
    name: '',
    password: '',
    confirmPassword: '',
    country: '',
    line: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    const { confirmPassword, ...submitData } = form;

    fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitData)
    })
      .then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Error al registrar usuario');
        }
        return res.json();
      })
      .then(() => {
        setSuccess(true);
        setTimeout(() => {
          if (onRegistered) onRegistered();
        }, 2000);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Registro Exitoso!</h2>
            <p className="text-slate-600 mb-6">
              Tu cuenta ha sido creada correctamente. Serás redirigido al login en unos segundos.
            </p>
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-3xl text-white font-bold">M</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            MediPanel
          </h1>
          <p className="text-slate-600">Crear Nueva Cuenta</p>
        </div>

        {/* Register Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Registro</h2>
            <p className="text-slate-600">Completa los datos para crear tu cuenta</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <span className="text-red-500 text-lg">⚠️</span>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                  placeholder="Tu nombre"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  ID 4Life
                </label>
                <input
                  type="text"
                  name="id4life"
                  value={form.id4life}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                  placeholder="ID 4Life"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                placeholder="tu@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  País
                </label>
                <input
                  type="text"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                  placeholder="Tu país"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Línea
                </label>
                <input
                  type="text"
                  name="line"
                  value={form.line}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                  placeholder="Línea"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creando cuenta...</span>
                </>
              ) : (
                <>
                  <span>Crear Cuenta</span>
                  <span className="text-lg">→</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              ¿Ya tienes una cuenta?{' '}
              <button
                onClick={onShowLogin}
                className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
                disabled={isLoading}
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            © 2024 MediPanel. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;