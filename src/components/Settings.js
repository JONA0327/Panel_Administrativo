import React, { useState } from 'react';
import GoogleDriveAuth from './GoogleDriveAuth';

function Settings() {
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'MediPanel',
    adminEmail: 'admin@medipanel.com',
    autoBackup: true,
    emailNotifications: true,
    darkMode: false,
    language: 'es'
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // Aquí guardarías la configuración
    alert('Configuración guardada exitosamente');
  };

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

          {/* General Settings */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Configuración General</h2>
            
            <div className="space-y-6">
              {/* Site Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nombre del Sitio
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Admin Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email del Administrador
                </label>
                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Idioma
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>

              {/* Toggle Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-slate-800">Respaldo Automático</h4>
                    <p className="text-sm text-slate-600">Crear respaldos automáticos diariamente</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('autoBackup', !settings.autoBackup)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.autoBackup ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-slate-800">Notificaciones por Email</h4>
                    <p className="text-sm text-slate-600">Recibir notificaciones importantes por email</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.emailNotifications ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-slate-800">Modo Oscuro</h4>
                    <p className="text-sm text-slate-600">Cambiar a tema oscuro</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.darkMode ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  onClick={handleSaveSettings}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
                >
                  Guardar Configuración
                </button>
              </div>
            </div>
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