import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function AdminUsers() {
  const [users, setUsers] = useState([]);

  const load = () => {
    apiFetch(`${API_URL}/auth/users`)
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error);
  };

  useEffect(load, []);

  const approve = id => {
    apiFetch(`${API_URL}/auth/approve/${id}`, { method: 'PATCH' })
      .then(res => res.json())
      .then(() => load())
      .catch(console.error);
  };

  const toggleDisable = (id, disabled) => {
    apiFetch(`${API_URL}/auth/disable/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disabled: !disabled })
    })
      .then(res => res.json())
      .then(() => load())
      .catch(console.error);
  };

  return (
    <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-pink-50/30 to-rose-50/30 overflow-y-auto min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                Gestión de Usuarios
              </h1>
              <p className="text-slate-600 text-xl font-medium">Administra usuarios y permisos del sistema</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
        {users.map(u => (
            <div key={u._id} className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">{u.name ? u.name[0].toUpperCase() : 'U'}</span>
                  </div>
            <div>
                    <p className="font-bold text-slate-800 text-xl group-hover:text-slate-900">{u.name} ({u.email})</p>
                    <p className="text-sm text-slate-600 font-medium">{u.country}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        u.approved 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {u.approved ? 'Aprobado' : 'Pendiente'}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        u.disabled 
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {u.disabled ? 'Deshabilitado' : 'Activo'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    className={`${u.disabled ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-red-500 to-pink-500'} text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1`}
                    onClick={() => toggleDisable(u._id, u.disabled)}
                  >
                    {u.disabled ? 'Habilitar' : 'Deshabilitar'}
                  </button>
                  {!u.approved && (
                    <button
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
                      onClick={() => approve(u._id)}
                    >
                      Aprobar
                    </button>
                  )}
                </div>
              </div>
            </div>
        ))}
        </div>
      </div>
    </main>
  );
}

export default AdminUsers;
