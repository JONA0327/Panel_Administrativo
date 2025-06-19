import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';

function App() {
  const [currentView, setCurrentView] = useState('Dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Productos':
        return <Products />;
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