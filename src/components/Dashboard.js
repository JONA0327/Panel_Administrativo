import React from 'react';

function Dashboard() {
  const cards = [
    { 
      title: 'Productos', 
      value: 128, 
      change: '+12%',
      positive: true,
      icon: '📦',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      title: 'Usuarios', 
      value: 512, 
      change: '+8%',
      positive: true,
      icon: '👥',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      title: 'Ventas', 
      value: '$12,450', 
      change: '+23%',
      positive: true,
      icon: '💰',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      title: 'Visitas', 
      value: '1,234', 
      change: '-3%',
      positive: false,
      icon: '📈',
      color: 'from-orange-500 to-red-500'
    },
  ];

  const recentActivity = [
    { action: 'Nuevo producto agregado', time: 'Hace 2 minutos', type: 'success' },
    { action: 'Usuario registrado', time: 'Hace 15 minutos', type: 'info' },
    { action: 'Venta completada', time: 'Hace 1 hora', type: 'success' },
    { action: 'Error en sistema', time: 'Hace 2 horas', type: 'error' },
  ];

  return (
    <main className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bienvenido de vuelta 👋
          </h1>
          <p className="text-gray-600">
            Aquí tienes un resumen de tu panel administrativo
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {cards.map((card) => (
            <div key={card.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center text-white text-xl shadow-lg`}>
                  {card.icon}
                </div>
                <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                  card.positive 
                    ? 'text-green-700 bg-green-100' 
                    : 'text-red-700 bg-red-100'
                }`}>
                  {card.change}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chart Placeholder */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Análisis de Ventas</h2>
            <div className="h-64 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl flex items-center justify-center border-2 border-dashed border-purple-200">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-600 font-medium">Gráfico de ventas</p>
                <p className="text-sm text-gray-500">Los datos se cargarán aquí</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Actividad Reciente</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'info' ? 'bg-blue-500' :
                    'bg-red-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium">
              Ver toda la actividad →
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Acciones Rápidas</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Agregar Producto', icon: '➕', color: 'from-blue-500 to-cyan-500' },
              { name: 'Nuevo Usuario', icon: '👤', color: 'from-green-500 to-emerald-500' },
              { name: 'Ver Reportes', icon: '📋', color: 'from-purple-500 to-pink-500' },
              { name: 'Configurar', icon: '⚙️', color: 'from-orange-500 to-red-500' },
            ].map((action) => (
              <button key={action.name} className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md group">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center text-white mb-3 mx-auto group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <p className="text-sm font-medium text-gray-700">{action.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;