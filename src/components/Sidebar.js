import React from 'react';
import './Sidebar.css';

function Sidebar() {
  const entries = ['Productos', 'Paquetes', 'Índice de Enfermedades', 'Testimonios', 'Configuración'];
  return (
    <div className="Sidebar">
      <ul>
        {entries.map(entry => (
          <li key={entry}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
