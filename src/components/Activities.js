import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/activities`)
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(err => console.error('Error fetching activities:', err))
      .finally(() => setLoading(false));
  }, []);

  const deleteActivity = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
      fetch(`${API_URL}/activities/${id}`, { method: 'DELETE' })
        .then(() => setActivities(prev => prev.filter(a => a._id !== id)))
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
    <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Todas las Actividades 📋
          </h1>
          <p className="text-slate-600 text-lg">Historial completo de acciones en el sistema</p>
        </div>

        <div className="space-y-4">
          {activities.map(activity => (
            <div key={activity._id} className="flex items-start space-x-3 p-3 rounded-lg bg-white/80 backdrop-blur-sm border border-white/20">
              <div className="w-2 h-2 rounded-full mt-2 bg-blue-500"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{activity.action}</p>
                <p className="text-xs text-slate-500">{new Date(activity.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => deleteActivity(activity._id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
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
