import React from 'react';

function Sidebar() {
  const entries = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'Productos', icon: '📦' },
    { name: 'Paquetes', icon: '🎁' },
    { name: 'Índice de Enfermedades', icon: '🏥' },
    { name: 'Testimonios', icon: '💬' },
    { name: 'Configuración', icon: '⚙️' },
  ];

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
          {entries.map((entry, index) => (
            <li key={entry.name}>
              <button className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center space-x-3 group ${
                index === 0 
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <span className="text-lg">{entry.icon}</span>
                <span className="font-medium">{entry.name}</span>
                <span className={`ml-auto transition-transform duration-200 ${
                  index === 0 ? 'text-white' : 'text-gray-400 group-hover:translate-x-1'
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
            <span className="text-white font-semibold">A</span>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Admin</p>
            <p className="text-sm text-gray-500">admin@medipanel.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;