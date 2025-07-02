import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function Login({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Error al iniciar sesión');
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
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  };

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
          <p className="text-slate-600">Panel Administrativo</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Iniciar Sesión</h2>
            <p className="text-slate-600">Accede a tu cuenta para continuar</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <span className="text-red-500 text-lg">⚠️</span>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                placeholder="tu@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <span className="text-lg">→</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              ¿No tienes una cuenta?{' '}
              <button
                onClick={onShowRegister}
                className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
                disabled={isLoading}
              >
                Regístrate aquí
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

export default Login;