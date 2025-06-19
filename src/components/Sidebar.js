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
    <aside className="bg-blue-600 text-white w-48 p-5">
      <ul className="space-y-4">
        {entries.map((entry) => (
          <li key={entry} className="cursor-pointer hover:underline">
            {entry}
          </li>
        ))}
      </ul>
    </aside>

  );
}

export default Sidebar;
