import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const Packages = forwardRef(({ products }, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [packages, setPackages] = useState([]);
  const [editingPackage, setEditingPackage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedProducts: []
  });

  const [availableProducts, setAvailableProducts] = useState([]);
  const [suggestMessage, setSuggestMessage] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/packages`)
      .then(res => res.json())
      .then(setPackages)
      .catch(err => console.error('Failed to load packages', err));
  }, []);

  useEffect(() => {
    if (!formData.name) {
      setAvailableProducts([]);
      setSuggestMessage('');
      return;
    }
    fetch(`${API_URL}/packages/suggested`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: formData.name })
    })
      .then(res => res.json())
      .then(data => {
        setAvailableProducts(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length === 0) {
          setSuggestMessage('No se encontraron productos sugeridos.');
        } else {
          setSuggestMessage('');
        }
      })
      .catch(err => {
        console.error('Failed to load suggested products', err);
        setAvailableProducts([]);
        setSuggestMessage('Error al obtener productos sugeridos.');
      });
  }, [formData.name]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleProductSelection = (product) => {
    setFormData(prev => {
      const isSelected = prev.selectedProducts.some(p => (p._id || p.id) === (product._id || product.id));
      if (isSelected) {
        return {
          ...prev,
          selectedProducts: prev.selectedProducts.filter(p => (p._id || p.id) !== (product._id || product.id))
        };
      } else {
        return {
          ...prev,
          selectedProducts: [...prev.selectedProducts, product]
        };
      }
    });
  };

  const calculateTotalPrice = () => {
    return formData.selectedProducts.reduce((total, product) => total + product.price, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      name: formData.name,
      description: formData.description,
      productIds: formData.selectedProducts.map(p => p._id || p.id)
    };
    if (editingPackage) {
      fetch(`${API_URL}/packages/${editingPackage._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(updated => {
          setPackages(prev => prev.map(p => (p._id === updated._id ? updated : p)));
          setIsSaving(false);
          alert('Paquete actualizado');
          closeModal();
        })
        .catch(err => {
          console.error('Failed to update package', err);
          setIsSaving(false);
        });
    } else {
      fetch(`${API_URL}/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(pkg => {
          setPackages(prev => [...prev, pkg]);
          setIsSaving(false);
          alert('Paquete agregado');
          closeModal();
        })
        .catch(err => {
          console.error('Failed to create package', err);
          setIsSaving(false);
        });
    }
  };

  const deletePackage = (packageId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este paquete?')) {
      fetch(`${API_URL}/packages/${packageId}`, { method: 'DELETE' })
        .then(() => {
          setPackages(prev => prev.filter(pkg => pkg._id !== packageId));
        })
        .catch(err => console.error('Failed to delete package', err));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
    setFormData({
      name: '',
      description: '',
      selectedProducts: []
    });
  };

  const openAddModal = () => {
    setEditingPackage(null);
    setFormData({ name: '', description: '', selectedProducts: [] });
    setIsModalOpen(true);
  };

  useImperativeHandle(ref, () => ({
    openAddModal
  }));

  return (
    <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
              Gestión de Paquetes 🎁
            </h1>
            <p className="text-slate-600 text-lg">
              Crea y administra paquetes de productos
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex items-center space-x-2"
          >
            <span className="text-lg">➕</span>
            <span>Crear Nuevo Paquete</span>
          </button>
        </div>

        {/* Packages Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg._id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="mb-4">
                <div className="flex -space-x-2 mb-3">
                  {pkg.products.slice(0, 3).map((product, index) => (
                    <img
                      key={product._id}
                      src={product.localImage ? `${API_URL}${product.localImage}` : product.image}
                      alt={product.name}
                      className="w-12 h-12 rounded-full border-2 border-white object-cover"
                      style={{ zIndex: pkg.products.length - index }}
                    />
                  ))}
                  {pkg.products.length > 3 && (
                    <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-semibold text-slate-600">
                      +{pkg.products.length - 3}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{pkg.name}</h3>
                <p className="text-sm text-slate-600 mb-3">{pkg.description}</p>
                <div className="space-y-1 mb-4">
                  {pkg.products.map((product) => (
                    <div key={product._id} className="flex justify-between text-xs text-slate-500">
                      <span>{product.name}</span>
                      <span>{product.currency} ${product.price}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-xl font-bold text-slate-800">
                    USD ${pkg.totalPrice.toFixed(2)}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingPackage(pkg);
                        setFormData({
                          name: pkg.name,
                          description: pkg.description,
                          selectedProducts: pkg.products
                        });
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => deletePackage(pkg._id)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-800">{editingPackage ? 'Editar Paquete' : 'Crear Nuevo Paquete'}</h2>
                  <button
                    onClick={closeModal}
                    className="text-slate-400 hover:text-slate-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nombre del Paquete
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Ej: Pack Inmunidad"
                    required
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    placeholder="Describe los beneficios del paquete..."
                    required
                  />
                </div>

                {/* Selección de Productos */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Productos del Paquete
                  </label>
                  <div className="grid gap-3 max-h-60 overflow-y-auto">
                    {availableProducts.map((product) => (
                      <div
                        key={product._id}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${
                          formData.selectedProducts.some(p => (p._id || p.id) === (product._id || product.id))
                            ? 'border-green-500 bg-green-50'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                        onClick={() => toggleProductSelection(product)}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.localImage ? `${API_URL}${product.localImage}` : product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{product.name}</h4>
                            <p className="text-sm text-slate-500">{product.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-800">{product.currency} ${product.price}</p>
                            <div className={`w-5 h-5 rounded-full border-2 ${
                              formData.selectedProducts.some(p => (p._id || p.id) === (product._id || product.id))
                                ? 'bg-green-500 border-green-500'
                                : 'border-slate-300'
                            }`}>
                              {formData.selectedProducts.some(p => (p._id || p.id) === (product._id || product.id)) && (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {suggestMessage && (
                      <p className="text-center text-sm text-slate-500">{suggestMessage}</p>
                    )}
                  </div>
                </div>

                {/* Total Price */}
                {formData.selectedProducts.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700">Precio Total:</span>
                      <span className="text-2xl font-bold text-green-600">
                        USD ${calculateTotalPrice().toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {formData.selectedProducts.length} producto(s) seleccionado(s)
                    </p>
                  </div>
                )}

                {/* Botones */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                      disabled={isSaving || formData.selectedProducts.length === 0 || (formData.name && availableProducts.length === 0)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>{editingPackage ? 'Guardar Cambios' : 'Crear Paquete'}</>
                      )}
                    </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
});

export default Packages;
