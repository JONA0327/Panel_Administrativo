import React, { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

function GoogleDriveAuth({ onAuthenticated }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [folderPath, setFolderPath] = useState('');
  const [showFolderOptions, setShowFolderOptions] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    function start() {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      });
    }
    gapi.load('client:auth2', start);
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const googleUser = await gapi.auth2.getAuthInstance().signIn();
      setIsAuthenticated(true);
      setShowFolderOptions(true);
      setUserEmail(googleUser.getBasicProfile().getEmail());
      setToken(googleUser.getAuthResponse().access_token);
      if (onAuthenticated) {
        onAuthenticated(true);
      }
    } catch (err) {
      console.error('Google sign-in error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    try {
      const response = await gapi.client.drive.files.create({
        resource: {
          name: 'MediPanel_Storage',
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id,name',
      });
      const folderId = response.result.id;
      setFolderPath(`https://drive.google.com/drive/folders/${folderId}`);
      alert(`Carpeta creada exitosamente: ${response.result.name}`);
    } catch (err) {
      console.error('Error al crear la carpeta', err);
    }
  };

  const handleFolderPathSubmit = (e) => {
    e.preventDefault();
    if (folderPath.trim()) {
      alert(`Carpeta configurada: ${folderPath}`);
      setShowFolderOptions(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const auth2 = gapi.auth2.getAuthInstance();
      if (auth2) {
        await auth2.signOut();
      }
    } catch (err) {
      console.error('Error al cerrar sesión', err);
    } finally {
      setIsAuthenticated(false);
      setShowFolderOptions(false);
      setFolderPath('');
      setUserEmail('');
      setToken('');
      if (onAuthenticated) {
        onAuthenticated(false);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white">📁</span>
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            Conectar con Google Drive
          </h3>
          <p className="text-slate-600 mb-6">
            Conecta tu cuenta de Google Drive para almacenar archivos de forma segura
          </p>
          
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Iniciar sesión con Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">✓</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Google Drive Conectado</h3>
            <p className="text-sm text-slate-600">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="text-red-600 hover:text-red-700 font-medium text-sm"
        >
          Desconectar
        </button>
      </div>

      {showFolderOptions && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            <h4 className="font-semibold text-slate-700 mb-3">Configurar Carpeta de Almacenamiento</h4>
            
            <form onSubmit={handleFolderPathSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ruta de la carpeta
                </label>
                <input
                  type="text"
                  value={folderPath}
                  onChange={(e) => setFolderPath(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="/MediPanel_Storage"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Usar esta carpeta
                </button>
                <button
                  type="button"
                  onClick={handleCreateFolder}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  Crear nueva carpeta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {folderPath && !showFolderOptions && (
        <div className="bg-green-50 p-4 rounded-xl">
          <div className="flex items-center space-x-2">
            <span className="text-green-600 text-lg">📁</span>
            <div>
              <p className="font-medium text-slate-800">Carpeta configurada</p>
              <p className="text-sm text-slate-600">{folderPath}</p>
            </div>
          </div>
          <button
            onClick={() => setShowFolderOptions(true)}
            className="mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Cambiar carpeta
          </button>
        </div>
      )}
    </div>
  );
}

export default GoogleDriveAuth;
