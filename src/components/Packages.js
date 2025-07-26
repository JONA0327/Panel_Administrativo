import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { apiFetch } from '../utils/api';

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
      apiFetch(`${API_URL}/packages`)
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
      apiFetch(`${API_URL}/packages/suggested`, {
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
        apiFetch(`${API_URL}/packages/${editingPackage._id}`, {
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
        apiFetch(`${API_URL}/packages`, {
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
        apiFetch(`${API_URL}/packages/${packageId}`, { method: 'DELETE' })
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
    <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-purple-50/30 to-violet-50/30 overflow-y-auto min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                Gestión de Paquetes
              </h1>
              <p className="text-slate-600 text-xl font-medium">
                Crea y administra paquetes de productos con estilo
              </p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 flex items-center space-x-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Crear Paquete</span>
          </button>
        </div>

        {/* Packages Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg._id} className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-indigo-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="mb-6">
                  <div className="flex -space-x-3 mb-4">
                  {pkg.products.slice(0, 3).map((product, index) => (
                    <img
                      key={product._id}
                      src={product.localImage ? `${API_URL}${product.localImage}` : product.image}
                      alt={product.name}
                        className="w-16 h-16 rounded-2xl border-4 border-white object-cover shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                      style={{ zIndex: pkg.products.length - index }}
                    />
                  ))}
                  {pkg.products.length > 3 && (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 border-4 border-white flex items-center justify-center text-sm font-bold text-slate-600 shadow-lg">
                      +{pkg.products.length - 3}
                    </div>
                  )}
                </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-slate-900">{pkg.name}</h3>
                  <p className="text-sm text-slate-600 mb-4 font-medium">{pkg.description}</p>
                  <div className="space-y-2 mb-6">
                  {pkg.products.map((product) => (
                      <div key={product._id} className="flex justify-between text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-xl">
                        <span className="font-medium">{product.name}</span>
                        <span className="font-bold">{product.currency} ${product.price}</span>
                    </div>
                  ))}
                </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <span className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    USD ${pkg.totalPrice.toFixed(2)}
                  </span>
                    <div className="flex space-x-3">
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
                        className="text-blue-600 hover:text-blue-700 font-bold text-sm transition-colors duration-200"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => deletePackage(pkg._id)}
                        className="text-red-600 hover:text-red-700 font-bold text-sm transition-colors duration-200"
                    >
                      Eliminar
                    </button>
                  </div>
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
