import React, { useState, useRef } from 'react';
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
  const productsRef = useRef();
  const packagesRef = useRef();
  const testimonialsRef = useRef();

  const openAddProduct = () => {
    setCurrentView('Productos');
    setTimeout(() => productsRef.current?.openAddModal(), 0);
  };

  const openAddPackage = () => {
    setCurrentView('Paquetes');
    setTimeout(() => packagesRef.current?.openAddModal(), 0);
  };

  const openAddTestimonial = () => {
    setCurrentView('Testimonios');
    setTimeout(() => testimonialsRef.current?.openAddModal(), 0);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'Dashboard':
        return (
          <Dashboard
            onAddProduct={openAddProduct}
            onAddPackage={openAddPackage}
            onAddTestimonial={openAddTestimonial}
          />
        );
      case 'Productos':
        return <Products ref={productsRef} />;
      case 'Paquetes':
        return <Packages ref={packagesRef} />;
      case 'Índice de Enfermedades':
        return <Diseases />;
      case 'Testimonios':
        return <Testimonials ref={testimonialsRef} />;
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