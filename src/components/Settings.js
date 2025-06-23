import React, { useState } from 'react';

import GoogleDriveAuth from './GoogleDriveAuth';

function Settings() {
  const [isDriveConnected, setIsDriveConnected] = useState(false);

  return (
    <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            Configuración ⚙️
          </h1>
          <p className="text-slate-600 text-lg">
            Administra la configuración del sistema y conecta servicios externos
          </p>
        </div>

        <div className="space-y-8">
          {/* Google Drive Integration */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">Integración con Google Drive</h2>
            <GoogleDriveAuth onAuthenticated={setIsDriveConnected} />
          </div>



          {/* System Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Información del Sistema</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl">
                <h4 className="font-semibold text-slate-800 mb-1">Versión</h4>
                <p className="text-slate-600">v1.0.0</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <h4 className="font-semibold text-slate-800 mb-1">Base de Datos</h4>
                <p className="text-slate-600">MongoDB</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <h4 className="font-semibold text-slate-800 mb-1">Estado del Servidor</h4>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-slate-600">Activo</span>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <h4 className="font-semibold text-slate-800 mb-1">Google Drive</h4>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isDriveConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-slate-600">{isDriveConnected ? 'Conectado' : 'Desconectado'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Settings;