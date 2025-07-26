import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/conversations`)
      .then(res => res.json())
      .then(data => setConversations(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching conversations:', err))
      .finally(() => setLoading(false));
  }, []);

  const openConversation = id => {
    fetch(`${API_URL}/conversations/${id}`)
      .then(res => res.json())
      .then(data => setSelected(data))
      .catch(err => console.error('Error fetching conversation:', err));
  };

  const closeModal = () => setSelected(null);

  const deleteConversation = id => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      fetch(`${API_URL}/conversations/${id}`, { method: 'DELETE' })
        .then(() => setConversations(prev => prev.filter(c => c._id !== id)))
        .catch(err => console.error('Error deleting conversation:', err));
    }
  };

  if (loading) {
    return (
      <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Cargando conversaciones...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Conversaciones 💬
          </h1>
          <p className="text-slate-600 text-lg">Historial de conversaciones</p>
        </div>

        <div className="space-y-4">
          {conversations.map(conv => (
            <div
              key={conv._id}
              onClick={() => openConversation(conv._id)}
              className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-white/20 cursor-pointer flex justify-between items-center hover:bg-white"
            >
              <div>
                <p className="font-semibold text-slate-800">{conv.sessionId || 'Sin sesión'}</p>
                <p className="text-xs text-slate-500">{conv._id}</p>
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  deleteConversation(conv._id);
                }}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Conversación</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 text-2xl">✕</button>
            </div>
            <div className="p-4 space-y-4">
              {Array.isArray(selected.messages) &&
                selected.messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`px-4 py-2 rounded-xl max-w-[80%] break-words ${
                        msg.type === 'user'
                          ? 'bg-blue-500 text-white ml-auto'
                          : 'bg-slate-200 text-slate-800 mr-auto'
                      }`}
                    >
                      {msg.text || msg.message}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Conversations;
