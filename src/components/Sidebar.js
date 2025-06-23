import React from 'react';

function Sidebar({ currentView, setCurrentView }) {
  const entries = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'Productos', icon: '📦' },
    { name: 'Paquetes', icon: '🎁' },
    { name: 'Índice de Enfermedades', icon: '🏥' },
    { name: 'Testimonios', icon: '💬' },
    { name: 'Actividades', icon: '📋' },
    { name: 'BD', icon: '🗄️' },
    { name: 'Configuración', icon: '⚙️' },
  ];

  const admin = { name: 'Admin', email: 'admin@medipanel.com' };

  return (
    <aside className="bg-white shadow-xl w-72 p-6 border-r border-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          MediPanel
        </h2>
        <p className="text-sm text-gray-500 mt-1">Panel Administrativo</p>
      </div>
      
      <nav>
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.name}>
              <button 
                onClick={() => setCurrentView(entry.name)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center space-x-3 group ${
                  currentView === entry.name
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{entry.icon}</span>
                <span className="font-medium">{entry.name}</span>
                <span className={`ml-auto transition-transform duration-200 ${
                  currentView === entry.name ? 'text-white' : 'text-gray-400 group-hover:translate-x-1'
                }`}>
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">{(admin.name || 'A')[0]}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-800">{admin.name || 'Admin'}</p>
            <p className="text-sm text-gray-500">{admin.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;