import React, { useState } from 'react';

import GoogleDriveAuth from './GoogleDriveAuth';

function Settings() {
  const [isDriveConnected, setIsDriveConnected] = useState(false);

  return (
    <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-yellow-50/30 to-orange-50/30 overflow-y-auto min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                Configuración
              </h1>
              <p className="text-slate-600 text-xl font-medium">
                Administra el sistema y conecta servicios externos
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {/* Google Drive Integration */}
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-800">Integración con Google Drive</h2>
            </div>
            <GoogleDriveAuth onAuthenticated={setIsDriveConnected} />
          </div>



          {/* System Information */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-800">Información del Sistema</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2 text-lg">Versión</h4>
                <p className="text-slate-600 font-medium">v1.0.0</p>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2 text-lg">Base de Datos</h4>
                <p className="text-slate-600 font-medium">MongoDB</p>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2 text-lg">Estado del Servidor</h4>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg animate-pulse"></div>
                  <span className="text-slate-600 font-medium">Activo</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2 text-lg">Google Drive</h4>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full shadow-lg ${isDriveConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-slate-600 font-medium">{isDriveConnected ? 'Conectado' : 'Desconectado'}</span>
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