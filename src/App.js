import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Packages from './components/Packages';
import Diseases from './components/Diseases';
import Testimonials from './components/Testimonials';

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