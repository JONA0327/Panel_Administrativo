import React, { useState, useEffect } from 'react';

function PendingApproval({ email, onLogout }) {
  const [timeWaiting, setTimeWaiting] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeWaiting(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-3xl text-white font-bold">M</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            MediPanel
          </h1>
        </div>

        {/* Pending Approval Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center">
            {/* Animated Icon */}
            <div className="relative mb-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-4xl text-white">⏳</span>
              </div>
              <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-amber-200 rounded-full animate-ping"></div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Cuenta Pendiente de Aprobación
            </h2>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-amber-800 font-medium mb-2">
                Tu cuenta está siendo revisada por un administrador
              </p>
              <p className="text-amber-700 text-sm">
                Recibirás acceso completo una vez que tu cuenta sea aprobada. 
                Este proceso puede tomar algunas horas.
              </p>
            </div>

            {/* Account Info */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-slate-800 mb-3">Información de la Cuenta</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Email:</span>
                  <span className="font-medium text-slate-800">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Estado:</span>
                  <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></div>
                    Pendiente
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tiempo esperando:</span>
                  <span className="font-medium text-slate-800">{formatTime(timeWaiting)}</span>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="text-left mb-6">
              <h3 className="font-semibold text-slate-800 mb-3">¿Qué sigue?</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">1</span>
                  </div>
                  <p className="text-slate-600 text-sm">
                    Un administrador revisará tu solicitud de registro
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">2</span>
                  </div>
                  <p className="text-slate-600 text-sm">
                    Se verificarán tus datos y credenciales
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">3</span>
                  </div>
                  <p className="text-slate-600 text-sm">
                    Recibirás acceso completo al panel administrativo
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex items-center justify-center space-x-2"
              >
                <span>🔄</span>
                <span>Verificar Estado</span>
              </button>
              
              <button
                onClick={onLogout}
                className="w-full border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>👋</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-6">
          <p className="text-slate-500 text-sm mb-2">
            ¿Necesitas ayuda? Contacta al administrador
          </p>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 p-4">
            <p className="text-slate-600 text-sm">
              Si tienes preguntas sobre tu cuenta o el proceso de aprobación, 
              puedes contactar al equipo de soporte.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            © 2024 MediPanel. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PendingApproval;