import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function AdminUsers() {
  const [users, setUsers] = useState([]);

  const load = () => {
    fetch(`${API_URL}/auth/users`)
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error);
  };

  useEffect(load, []);

  const approve = id => {
    fetch(`${API_URL}/auth/approve/${id}`, { method: 'PATCH' })
      .then(res => res.json())
      .then(() => load())
      .catch(console.error);
  };

  const toggleDisable = (id, disabled) => {
    fetch(`${API_URL}/auth/disable/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disabled: !disabled })
    })
      .then(res => res.json())
      .then(() => load())
      .catch(console.error);
  };

  return (
    <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto min-h-screen">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold">Usuarios</h1>
        {users.map(u => (
          <div key={u._id} className="p-4 bg-white rounded shadow flex justify-between items-center">
            <div>
              <p className="font-medium">{u.name} ({u.email})</p>
              <p className="text-sm text-gray-500">{u.country}</p>
            </div>
            <div className="space-x-2">
              <button
                className={`${u.disabled ? 'bg-blue-500' : 'bg-red-500'} text-white px-3 py-1 rounded`}
                onClick={() => toggleDisable(u._id, u.disabled)}
              >
                {u.disabled ? 'Habilitar' : 'Deshabilitar'}
              </button>
              {!u.approved && (
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded"
                  onClick={() => approve(u._id)}
                >
                  Aprobar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default AdminUsers;
