import React from 'react';


function Sidebar() {
  const entries = [
    'Productos',
    'Paquetes',
    'Índice de Enfermedades',
    'Testimonios',
    'Configuración',
  ];
  return (
    <aside className="bg-gradient-to-b from-blue-600 to-blue-800 text-white w-60 p-6 rounded-r-3xl shadow-lg">
      <ul className="space-y-3">
        {entries.map((entry) => (
          <li key={entry} className="cursor-pointer text-sm md:text-base px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center">
            <span className="mr-2">➔</span>
            {entry}
          </li>
        ))}
      </ul>
    </aside>

  );
}

export default Sidebar;
