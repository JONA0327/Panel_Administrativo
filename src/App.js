import React, { useState, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Packages from './components/Packages';
import Diseases from './components/Diseases';
import Testimonials from './components/Testimonials';
import Database from './components/Database';
import Settings from './components/Settings';
import Activities from './components/Activities';
import Login from './components/Login';
import Register from './components/Register';
import AdminUsers from './components/AdminUsers';

function App() {
  const [currentView, setCurrentView] = useState('Dashboard');
  const productsRef = useRef();
  const packagesRef = useRef();
  const testimonialsRef = useRef();
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    approved: localStorage.getItem('approved') === '1',
    isAdmin: localStorage.getItem('isAdmin') === '1'
  });
  const [showRegister, setShowRegister] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('approved');
    localStorage.removeItem('isAdmin');
    setAuth({ token: null, approved: false, isAdmin: false });
    setShowRegister(false);
  };

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
            onViewActivities={() => setCurrentView('Actividades')}
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
      case 'Actividades':
        return <Activities />;
      case 'BD':
        return <Database />;
      case 'Configuración':
        return <Settings />;
      case 'Usuarios':
        return <AdminUsers />;
      default:
        return <Dashboard />;
    }
  };

  if (!auth.token) {
    return showRegister ? (
      <Register onRegistered={() => setShowRegister(false)} onShowLogin={() => setShowRegister(false)} />
    ) : (
      <Login onLogin={data => setAuth({ token: data.token, approved: data.approved, isAdmin: data.isAdmin })} onShowRegister={() => setShowRegister(true)} />
    );
  }

  if (!auth.approved) {
    return (
      <div className="p-8 space-y-4">
        <p>Cuenta pendiente de aprobación.</p>
        <button onClick={handleLogout} className="text-blue-500 underline">
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} isAdmin={auth.isAdmin} />
      {renderCurrentView()}
    </div>
  );
}

export default App;