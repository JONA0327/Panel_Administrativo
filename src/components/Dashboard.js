import React from 'react';


function Dashboard() {
  const cards = [
    { title: 'Productos', value: 128 },
    { title: 'Usuarios', value: 512 },
    { title: 'Ventas', value: '$12k' },
    { title: 'Visitas', value: '1.2k' },
  ];
  return (
    <main className="flex-1 p-10 overflow-y-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Bienvenido al Panel Administrativo
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-sm text-gray-500">{card.title}</p>
            <p className="text-2xl font-semibold text-gray-700 mt-2">{card.value}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Dashboard;
