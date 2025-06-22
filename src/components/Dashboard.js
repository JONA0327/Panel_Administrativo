import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function Dashboard({ onAddProduct, onAddPackage, onAddTestimonial }) {
  const [stats, setStats] = useState({
    productCount: 0,
    packageCount: 0,
    diseaseCount: 0,
    testimonialCount: 0
  });

  useEffect(() => {
    fetch(`${API_URL}/dashboard/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error('Error fetching dashboard stats:', err));
  }, []);

  const cards = [
    {
      title: 'Productos',
      value: stats.productCount,
      change: '',
      positive: true,
      icon: '📦',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Paquetes',
      value: stats.packageCount,
      change: '',
      positive: true,
      icon: '🎁',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Índice de Enfermedades',
      value: stats.diseaseCount,
      change: '',
      positive: true,
      icon: '🦠',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Testimonios',
      value: stats.testimonialCount,
      change: '',
      positive: true,
      icon: '💬',
      color: 'from-orange-500 to-amber-500'
    }
  ];

  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/activities?limit=10`)
      .then(res => res.json())
      .then(setActivities)
      .catch(err => console.error('Error fetching activities:', err));
  }, []);

  return (
    <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Bienvenido de vuelta 👋
          </h1>
          <p className="text-slate-600 text-lg">
            Aquí tienes un resumen de tu panel administrativo
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {cards.map((card) => (
            <div key={card.title} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/90">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center text-white text-xl shadow-lg`}>
                  {card.icon}
                </div>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  card.positive 
                    ? 'text-emerald-700 bg-emerald-100' 
                    : 'text-red-700 bg-red-100'
                }`}>
                  {card.change}
                </span>
              </div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-slate-800">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Actividad Reciente</h2>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity._id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50/50 transition-colors">
                  <div className="w-2 h-2 rounded-full mt-2 bg-blue-500"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{activity.action}</p>
                    <p className="text-xs text-slate-500">{new Date(activity.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">
              Ver toda la actividad →
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Acciones Rápidas</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Agregar Producto', icon: '➕', color: 'from-blue-500 to-cyan-500', onClick: onAddProduct },
              { name: 'Crear Paquete', icon: '🎁', color: 'from-green-500 to-emerald-500', onClick: onAddPackage },
              { name: 'Subir Testimonio', icon: '💬', color: 'from-purple-500 to-pink-500', onClick: onAddTestimonial },
            ].map((action) => (
              <button
                key={action.name}
                onClick={action.onClick}
                className="p-4 rounded-xl border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 hover:shadow-md group bg-white/50 hover:bg-white/70"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center text-white mb-3 mx-auto group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <p className="text-sm font-medium text-slate-700">{action.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;