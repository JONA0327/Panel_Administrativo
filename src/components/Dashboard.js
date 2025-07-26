import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function Dashboard({ onAddProduct, onAddPackage, onAddTestimonial, onViewActivities }) {
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
      change: '+12%',
      positive: true,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      gradient: 'from-blue-500 via-blue-600 to-cyan-600',
      bgPattern: 'bg-blue-50'
    },
    {
      title: 'Paquetes',
      value: stats.packageCount,
      change: '+8%',
      positive: true,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      ),
      gradient: 'from-emerald-500 via-green-600 to-teal-600',
      bgPattern: 'bg-emerald-50'
    },
    {
      title: 'Enfermedades',
      value: stats.diseaseCount,
      change: '+15%',
      positive: true,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: 'from-purple-500 via-violet-600 to-indigo-600',
      bgPattern: 'bg-purple-50'
    },
    {
      title: 'Testimonios',
      value: stats.testimonialCount,
      change: '+23%',
      positive: true,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4" />
        </svg>
      ),
      gradient: 'from-orange-500 via-amber-600 to-yellow-600',
      bgPattern: 'bg-orange-50'
    }
  ];

  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/activities?limit=5`)
      .then(res => res.json())
      .then(setActivities)
      .catch(err => console.error('Error fetching activities:', err));
  }, []);

  return (
    <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 overflow-y-auto min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                Bienvenido de vuelta
              </h1>
              <p className="text-slate-600 text-xl font-medium">
                Gestiona tu panel administrativo con estilo moderno
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {cards.map((card) => (
            <div key={card.title} className="group relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>
              <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${card.gradient} flex items-center justify-center text-white shadow-lg`}>
                    {card.icon}
                  </div>
                  <span className={`text-sm font-bold px-4 py-2 rounded-full ${
                    card.positive 
                      ? 'text-emerald-700 bg-emerald-100 border border-emerald-200' 
                      : 'text-red-700 bg-red-100 border border-red-200'
                  }`}>
                    {card.change}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">{card.title}</h3>
                <p className="text-4xl font-black text-slate-800 mb-2">{card.value}</p>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${card.gradient} rounded-full transition-all duration-1000 ease-out`} style={{width: '75%'}}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Actividad Reciente</h2>
              </div>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={activity._id} className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50/80 transition-all duration-300 group">
                    <div className={`w-3 h-3 rounded-full mt-2 bg-gradient-to-r ${
                      index % 4 === 0 ? 'from-blue-500 to-cyan-500' :
                      index % 4 === 1 ? 'from-emerald-500 to-teal-500' :
                      index % 4 === 2 ? 'from-purple-500 to-violet-500' :
                      'from-orange-500 to-amber-500'
                    } shadow-lg`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">{activity.action}</p>
                      <p className="text-xs text-slate-500 font-medium">{new Date(activity.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={onViewActivities}
                className="w-full mt-6 text-sm text-indigo-600 hover:text-indigo-700 font-bold transition-colors duration-300 flex items-center justify-center space-x-2 py-3 rounded-2xl hover:bg-indigo-50"
              >
                <span>Ver toda la actividad</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Resumen Rápido</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Total Items</span>
                  <span className="font-bold text-slate-800">{stats.productCount + stats.packageCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Testimonios</span>
                  <span className="font-bold text-slate-800">{stats.testimonialCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Enfermedades</span>
                  <span className="font-bold text-slate-800">{stats.diseaseCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Acciones Rápidas</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                name: 'Agregar Producto', 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                ), 
                gradient: 'from-blue-500 to-cyan-500', 
                onClick: onAddProduct 
              },
              { 
                name: 'Crear Paquete', 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                ), 
                gradient: 'from-emerald-500 to-teal-500', 
                onClick: onAddPackage 
              },
              { 
                name: 'Subir Testimonio', 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ), 
                gradient: 'from-purple-500 to-violet-500', 
                onClick: onAddTestimonial 
              },
            ].map((action) => (
              <button
                key={action.name}
                onClick={action.onClick}
                className="group relative p-6 rounded-2xl border border-slate-200/50 hover:border-slate-300/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white/50 hover:bg-white/80 backdrop-blur-sm"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${action.gradient} flex items-center justify-center text-white mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {action.icon}
                  </div>
                  <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{action.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;