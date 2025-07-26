import React, { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`${API_URL}/activities`)
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(err => console.error('Error fetching activities:', err))
      .finally(() => setLoading(false));
  }, []);

  const deleteActivity = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
      apiFetch(`${API_URL}/activities/${id}`, { method: 'DELETE' })
        .then(() => {
          setActivities(prev => prev.filter(a => a._id !== id));
        })
        .catch(err => console.error('Error deleting activity:', err));
    }
  };

  if (loading) {
    return (
      <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Cargando actividades...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/30 overflow-y-auto min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                Todas las Actividades
              </h1>
              <p className="text-slate-600 text-xl font-medium">Historial completo de acciones en el sistema</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {activities.map(activity => (
            <div key={activity._id} className="group flex items-start space-x-4 p-6 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-4 h-4 rounded-full mt-1 bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg"></div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-slate-800 group-hover:text-slate-900">{activity.action}</p>
                <p className="text-sm text-slate-500 font-medium">
                  {new Date(activity.createdAt).toLocaleString()} -{' '}
                  {activity.user?.name || activity.user?.email || 'Desconocido'}
                </p>
              </div>
              <button
                onClick={() => deleteActivity(activity._id)}
                className="text-red-600 hover:text-red-700 font-bold text-sm transition-colors duration-200 px-4 py-2 rounded-xl hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Activities;
