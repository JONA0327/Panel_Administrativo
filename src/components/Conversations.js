import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/conversations`)
      .then(async res => {
        if (res.status === 403) {
          alert('No autorizado');
          return [];
        }
        return res.json();
      })
      .then(data => setConversations(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching conversations:', err))
      .finally(() => setLoading(false));
  }, []);

  const openConversation = id => {
    setError(null);
    fetch(`${API_URL}/conversations/${id}`)
      .then(res => {
        if (res.status === 403) {
          alert('No autorizado');
          throw new Error('Forbidden');
        }
        if (!res.ok) throw new Error('Failed to fetch conversation');
        return res.json();
      })
      .then(data => setSelected(data))
      .catch(err => {
        console.error('Error fetching conversation:', err);
        setError('No se pudo cargar la conversación');
        setSelected({ messages: [] });
      });
  };

  const closeModal = () => {
    setSelected(null);
    setError(null);
  };

  const deleteConversation = id => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      fetch(`${API_URL}/conversations/${id}`, { method: 'DELETE' })
        .then(res => {
          if (res.status === 403) {
            alert('No autorizado');
            return;
          }
          setConversations(prev => prev.filter(c => c._id !== id));
        })
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
    <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/30 overflow-y-auto min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                Conversaciones
              </h1>
              <p className="text-slate-600 text-xl font-medium">Historial completo de conversaciones del sistema</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {conversations.map(conv => (
            <div
              key={conv._id}
              onClick={() => openConversation(conv._id)}
              className="group p-6 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/50 cursor-pointer flex justify-between items-center hover:bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              <div>
                  <p className="font-bold text-slate-800 text-lg group-hover:text-slate-900">{conv.sessionId || 'Sin sesión'}</p>
                  <p className="text-sm text-slate-500 font-medium">{conv._id}</p>
                </div>
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  deleteConversation(conv._id);
                }}
                className="text-red-600 hover:text-red-700 font-bold text-sm transition-colors duration-200 px-4 py-2 rounded-xl hover:bg-red-50"
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
              {error ? (
                <p className="text-center text-red-600">{error}</p>
              ) : Array.isArray(selected.messages) && selected.messages.length ? (
                selected.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
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
                ))
              ) : (
                <p className="text-center text-slate-500">
                  No hay mensajes para mostrar.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Conversations;
