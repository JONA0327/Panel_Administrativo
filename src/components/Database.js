import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function Database() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionData, setCollectionData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadCollections();
    loadDatabaseStats();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/database/collections`);
      if (!response.ok) throw new Error('Failed to load collections');
      const data = await response.json();
      setCollections(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDatabaseStats = async () => {
    try {
      const response = await fetch(`${API_URL}/database/stats`);
      if (!response.ok) throw new Error('Failed to load stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load database stats:', err);
    }
  };

  const loadCollectionData = async (collectionName) => {
    try {
      const response = await fetch(`${API_URL}/database/collections/${collectionName}/data`);
      if (!response.ok) throw new Error('Failed to load collection data');
      const data = await response.json();
      setCollectionData(data);
      setSelectedCollection(collectionName);
    } catch (err) {
      setError(err.message);
    }
  };

  const createBackup = async () => {
    try {
      setBackupLoading(true);
      const response = await fetch(`${API_URL}/database/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to create backup');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert('Respaldo creado y descargado exitosamente');
    } catch (err) {
      alert(`Error al crear respaldo: ${err.message}`);
    } finally {
      setBackupLoading(false);
    }
  };

  const deleteCollection = async (collectionName) => {
    try {
      const response = await fetch(`${API_URL}/database/collections/${collectionName}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete collection');
      
      setCollections(prev => prev.filter(col => col.name !== collectionName));
      if (selectedCollection === collectionName) {
        setSelectedCollection(null);
        setCollectionData([]);
      }
      setShowDeleteModal(false);
      setCollectionToDelete(null);
      alert('Colección eliminada exitosamente');
      loadDatabaseStats();
    } catch (err) {
      alert(`Error al eliminar colección: ${err.message}`);
    }
  };

  const confirmDelete = (collectionName) => {
    setCollectionToDelete(collectionName);
    setShowDeleteModal(true);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  if (loading) {
    return (
      <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Cargando información de la base de datos...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">❌</span>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error de conexión</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setError(null);
                loadCollections();
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
              Gestión de Base de Datos 🗄️
            </h1>
            <p className="text-slate-600 text-lg">
              Administra las colecciones de MongoDB y crea respaldos
            </p>
          </div>
          <button
            onClick={createBackup}
            disabled={backupLoading}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {backupLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creando...</span>
              </>
            ) : (
              <>
                <span className="text-lg">💾</span>
                <span>Crear Respaldo</span>
              </>
            )}
          </button>
        </div>

        {/* Database Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">Colecciones</span>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">{collections.length}</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">Total Documentos</span>
              <span className="text-2xl">📄</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {collections.reduce((total, col) => total + (col.count || 0), 0)}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">Tamaño Total</span>
              <span className="text-2xl">💽</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">
              {formatBytes(stats.dataSize || 0)}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">Estado</span>
              <span className="text-2xl">🟢</span>
            </div>
            <p className="text-lg font-bold text-green-600">Conectado</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Collections List */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Colecciones</h2>
              <div className="space-y-3">
                {collections.map((collection) => (
                  <div
                    key={collection.name}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedCollection === collection.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                    onClick={() => loadCollectionData(collection.name)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-slate-800">{collection.name}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(collection.name);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                        title="Eliminar colección"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="text-sm text-slate-600">
                      <p>{collection.count || 0} documentos</p>
                      <p>{formatBytes(collection.size || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Collection Data */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              {selectedCollection ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-slate-800">
                      Datos de: {selectedCollection}
                    </h2>
                    <span className="text-sm text-slate-500">
                      {collectionData.length} documentos
                    </span>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {collectionData.length > 0 ? (
                      <div className="space-y-3">
                        {collectionData.slice(0, 10).map((doc, index) => (
                          <div key={index} className="bg-slate-50 p-4 rounded-lg">
                            <div className="text-xs text-slate-500 mb-2">
                              ID: {doc._id}
                            </div>
                            <pre className="text-sm text-slate-700 whitespace-pre-wrap overflow-x-auto">
                              {JSON.stringify(
                                Object.fromEntries(
                                  Object.entries(doc).filter(([key]) => key !== '_id')
                                ),
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        ))}
                        {collectionData.length > 10 && (
                          <div className="text-center text-slate-500 text-sm py-4">
                            ... y {collectionData.length - 10} documentos más
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <span className="text-4xl mb-4 block">📭</span>
                        <p className="text-slate-600">Esta colección está vacía</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <span className="text-4xl mb-4 block">👈</span>
                  <p className="text-slate-600">
                    Selecciona una colección para ver sus datos
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="text-center mb-6">
                  <span className="text-4xl mb-4 block">⚠️</span>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    ¿Eliminar Colección?
                  </h3>
                  <p className="text-slate-600">
                    Estás a punto de eliminar la colección <strong>{collectionToDelete}</strong>.
                    Esta acción no se puede deshacer.
                  </p>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setCollectionToDelete(null);
                    }}
                    className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => deleteCollection(collectionToDelete)}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Database;