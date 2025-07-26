import React, { useState, useEffect, useRef } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function Database() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionData, setCollectionData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const [stats, setStats] = useState({});
  const fileInputRef = useRef(null);

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

  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setImportLoading(true);
      const text = await file.text();
      const backup = JSON.parse(text);
      const resp = await fetch(`${API_URL}/database/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backup)
      });
      if (!resp.ok) throw new Error('Failed to import backup');
      alert('Respaldo importado exitosamente');
      loadCollections();
      loadDatabaseStats();
    } catch (err) {
      alert(`Error al importar respaldo: ${err.message}`);
    } finally {
      setImportLoading(false);
      e.target.value = '';
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
    <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-gray-50/30 to-slate-100/30 overflow-y-auto min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-500 via-gray-600 to-slate-700 rounded-3xl flex items-center justify-center shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                Gestión de Base de Datos
              </h1>
              <p className="text-slate-600 text-xl font-medium">
                Administra MongoDB y crea respaldos con seguridad
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={createBackup}
              disabled={backupLoading}
              className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {backupLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Crear Respaldo</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={importLoading}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Importando...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
                  </svg>
                  <span>Importar Respaldo</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Database Stats */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Colecciones</span>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v2a2 2 0 002 2m0 0h14m-14 0a2 2 0 002 2v2a2 2 0 01-2 2M5 9V7a2 2 0 012-2h10a2 2 0 012 2v2M5 9h14" />
                  </svg>
                </div>
            </div>
              <p className="text-4xl font-black text-slate-800">{collections.length}</p>
            </div>
          </div>
          
          <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Documentos</span>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
            </div>
              <p className="text-4xl font-black text-slate-800">
              {collections.reduce((total, col) => total + (col.count || 0), 0)}
            </p>
            </div>
          </div>

          <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tamaño Total</span>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
            </div>
              <p className="text-4xl font-black text-slate-800">
              {formatBytes(stats.dataSize || 0)}
            </p>
            </div>
          </div>

          <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Estado</span>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
            </div>
              <p className="text-2xl font-black text-green-600">Conectado</p>
            </div>
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