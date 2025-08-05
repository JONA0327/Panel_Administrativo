import React from 'react';

function Sidebar({ currentView, setCurrentView, isAdmin, email, onLogout }) {

  const entries = [
    { name: 'Dashboard', icon: '🏠', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Productos', icon: '📦', gradient: 'from-emerald-500 to-teal-500' },
    { name: 'Paquetes', icon: '🎁', gradient: 'from-purple-500 to-violet-500' },
    { name: 'Índice de Enfermedades', icon: '🏥', gradient: 'from-red-500 to-pink-500' },
    { name: 'Testimonios', icon: '💬', gradient: 'from-orange-500 to-amber-500' },
    { name: 'Conversaciones', icon: '💭', gradient: 'from-indigo-500 to-blue-500' },
    { name: 'Actividades', icon: '📊', gradient: 'from-green-500 to-emerald-500' },
    { name: 'InfoUsers', icon: '🧑‍💼', gradient: 'from-fuchsia-500 to-pink-500' },
  ];

  if (isAdmin) {
    entries.push(
      { name: 'BD', icon: '🗄️', gradient: 'from-slate-500 to-gray-500' },
      { name: 'Configuración', icon: '⚙️', gradient: 'from-yellow-500 to-orange-500' },
      { name: 'Usuarios', icon: '👥', gradient: 'from-pink-500 to-rose-500' }
    );
  }

  const userInfo = { role: isAdmin ? 'Admin' : 'Invitado', email };

  return (
    <aside className="bg-gradient-to-b from-white via-slate-50 to-slate-100 shadow-2xl w-80 p-6 border-r border-slate-200/50 backdrop-blur-xl flex flex-col min-h-screen">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">M</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              MediPanel
            </h2>
            <p className="text-sm text-slate-500 font-medium">Panel Administrativo</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 mb-8 overflow-y-auto">
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.name}>
              <button 
                onClick={() => setCurrentView(entry.name)}
                className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 flex items-center space-x-4 group relative overflow-hidden ${
                  currentView === entry.name
                    ? `bg-gradient-to-r ${entry.gradient} text-white shadow-xl shadow-${entry.gradient.split('-')[1]}-500/25 scale-105` 
                    : 'text-slate-700 hover:bg-white/80 hover:shadow-lg hover:scale-102 hover:text-slate-900'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  currentView === entry.name 
                    ? 'bg-white/20 backdrop-blur-sm' 
                    : 'bg-slate-100 group-hover:bg-slate-200'
                }`}>
                  <span className="text-xl">{entry.icon}</span>
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-sm">{entry.name}</span>
                </div>
                <div className={`transition-all duration-300 ${
                  currentView === entry.name 
                    ? 'text-white/80 translate-x-1' 
                    : 'text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                {/* Active indicator */}
                {currentView === entry.name && (
                  <div className="absolute left-0 top-0 w-1 h-full bg-white/30 rounded-r-full"></div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="mt-auto flex-shrink-0">
        <div className="bg-gradient-to-br from-white/80 to-slate-50/80 backdrop-blur-sm rounded-3xl border border-white/50 p-6 shadow-xl">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">{(userInfo.role || 'U')[0]}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-lg">{userInfo.role}</p>
              <p className="text-sm text-slate-500 truncate font-medium">{userInfo.email}</p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

