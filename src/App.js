import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Packages from './components/Packages';
import Diseases from './components/Diseases';
import Testimonials from './components/Testimonials';
import Database from './components/Database';
import Settings from './components/Settings';

function App() {
  const [currentView, setCurrentView] = useState('Dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Productos':
        return <Products />;
      case 'Paquetes':
        return <Packages />;
      case 'Índice de Enfermedades':
        return <Diseases />;
      case 'Testimonios':
        return <Testimonials />;
      case 'BD':
        return <Database />;
      case 'Configuración':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      {renderCurrentView()}
    </div>
  );
}

export default App;