import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function InfoUsers() {
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [usersRes, convsRes] = await Promise.all([
        axios.get('/info-users'),
        axios.get('/conversations')
      ]);
      setUsers(usersRes.data);
      setConversations(convsRes.data);
    } catch (err) {
      setError('Error cargando datos');
    }
    setLoading(false);
  }

  function getConversationByPhone(phone) {
    return conversations.find(c => c.phone === phone);
  }

  function handleEdit(id, user) {
    setEditingId(id);
    setEditData({ ...user });
  }

  function handleChange(e) {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  }

  async function handleSave(id) {
    try {
      await axios.patch(`/info-users/${id}`, editData);
      setEditingId(null);
      fetchData();
    } catch (err) {
      setError('Error guardando cambios');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    try {
      await axios.delete(`/info-users/${id}`);
      fetchData();
    } catch (err) {
      setError('Error eliminando usuario');
    }
  }

  if (loading) return <div className="p-4">Cargando...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">InfoUsers</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Nombre</th>
              <th className="px-4 py-2 border">Teléfono</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Conversación</th>
              <th className="px-4 py-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const conv = getConversationByPhone(user.phone);
              return (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 border">
                    {editingId === user._id ? (
                      <input
                        name="name"
                        value={editData.name || ''}
                        onChange={handleChange}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      user.name
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {editingId === user._id ? (
                      <input
                        name="phone"
                        value={editData.phone || ''}
                        onChange={handleChange}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      user.phone
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {editingId === user._id ? (
                      <select
                        name="status"
                        value={editData.status || ''}
                        onChange={handleChange}
                        className="border rounded px-2 py-1 w-full"
                      >
                        <option value="iniciado">iniciado</option>
                        <option value="activo">activo</option>
                        <option value="finalizado">finalizado</option>
                      </select>
                    ) : (
                      user.status
                    )}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {conv ? (
                      <a
                        href={`#/conversations/${conv._id}`}
                        className="text-blue-600 underline"
                        title="Ver conversación"
                      >
                        {conv._id}
                      </a>
                    ) : (
                      <span className="text-gray-400">No asociada</span>
                    )}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {editingId === user._id ? (
                      <>
                        <button
                          className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                          onClick={() => handleSave(user._id)}
                        >
                          Guardar
                        </button>
                        <button
                          className="bg-gray-300 px-2 py-1 rounded"
                          onClick={() => setEditingId(null)}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="bg-yellow-400 text-white px-2 py-1 rounded mr-2"
                          onClick={() => handleEdit(user._id, user)}
                        >
                          Editar
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded"
                          onClick={() => handleDelete(user._id)}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
