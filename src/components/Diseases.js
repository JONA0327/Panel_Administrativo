import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function Diseases() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDisease, setEditingDisease] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [allPackages, setAllPackages] = useState([]);
  const [displayPackages, setDisplayPackages] = useState([]);

  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedPackage: null,
    dosages: {}
  });

    useEffect(() => {
      apiFetch(`${API_URL}/diseases`)
        .then(res => res.json())
        .then(setDiseases)
        .catch(err => console.error('Failed to load diseases', err));

      apiFetch(`${API_URL}/packages`)
        .then(res => res.json())
        .then(data => {
          setAllPackages(data);
          setDisplayPackages(data);
      })
      .catch(err => console.error('Failed to load packages', err));
  }, []);

  useEffect(() => {
    if (!formData.name) return;

      apiFetch(`${API_URL}/diseases/describe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.name })
      })
      .then(res => res.json())
      .then(data => {
        if (data.description)
          setFormData(prev => ({ ...prev, description: data.description }));
      })
      .catch(err => console.error('Failed to describe disease', err));

      apiFetch(`${API_URL}/diseases/recommend-package`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.name })
      })
      .then(res => res.json())
      .then(pkgs => {
        if (Array.isArray(pkgs)) {
          setDisplayPackages(pkgs);
          if (pkgs.length === 1) {
            setFormData(prev => ({ ...prev, selectedPackage: pkgs[0], dosages: {} }));
          }
        }
      })
      .catch(err => {
        console.error('Failed to recommend package', err);
        setDisplayPackages(allPackages);
      });
  }, [formData.name]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePackageSelection = (pkg) => {
    setFormData(prev => ({ ...prev, selectedPackage: pkg, dosages: {} }));
  };

  const handleDosageChange = (productId, dosage) => {
    setFormData(prev => ({
      ...prev,
      dosages: { ...prev.dosages, [productId]: dosage }
    }));
  };

  const openEditModal = (disease) => {
    setEditingDisease(disease);
    setFormData({
      name: disease.name,
      description: disease.description,
      selectedPackage: disease.package,
      dosages: Object.fromEntries(
        (disease.dosages || []).map(d => [d.product._id, d.dosage])
      )
    });
    setDisplayPackages(allPackages);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      name: formData.name,
      description: formData.description,
      packageId: formData.selectedPackage?._id,
      dosages: Object.entries(formData.dosages).map(([productId, dosage]) => ({
        productId,
        dosage
      }))
    };

    if (editingDisease) {
        apiFetch(`${API_URL}/diseases/${editingDisease._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(updated => {
          setDiseases(prev => prev.map(d => (d._id === updated._id ? updated : d)));
          setIsSaving(false);
          alert('Enfermedad actualizada');
          closeModal();
        })
        .catch(err => {
          console.error('Failed to update disease', err);
          setIsSaving(false);
        });
    } else {
        apiFetch(`${API_URL}/diseases`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(created => {
          setDiseases(prev => [...prev, created]);
          setIsSaving(false);
          alert('Enfermedad agregada');
          closeModal();
        })
        .catch(err => {
          console.error('Failed to create disease', err);
          setIsSaving(false);
        });
    }
  };

  const deleteDisease = (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta enfermedad?')) return;
      apiFetch(`${API_URL}/diseases/${id}`, { method: 'DELETE' })
        .then(() => setDiseases(prev => prev.filter(d => d._id !== id)))
        .catch(err => console.error('Failed to delete disease', err));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDisease(null);
    setFormData({ name: '', description: '', selectedPackage: null, dosages: {} });
    setDisplayPackages(allPackages);
  };

  return (
    <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-red-50/30 to-pink-50/30 overflow-y-auto min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 via-pink-500 to-rose-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                Índice de Enfermedades
              </h1>
              <p className="text-slate-600 text-xl font-medium">Gestiona enfermedades y tratamientos con precisión</p>
            </div>
          </div>
          <button
            onClick={() => { setIsModalOpen(true); setEditingDisease(null); }}
            className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 flex items-center space-x-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Añadir Enfermedad</span>
          </button>
        </div>

        <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2">
          {diseases.map(disease => (
            <div key={disease._id} className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-pink-500/10 to-rose-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-slate-900">{disease.name}</h3>
                  <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed">{disease.description}</p>
                {disease.package && (
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-2xl border border-red-100">
                      <h4 className="font-bold text-slate-800 mb-4 text-lg">Paquete Sugerido: {disease.package.name}</h4>
                      <div className="space-y-4">
                      {disease.dosages.map(d => (
                          <div key={d.product._id} className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm">
                          <img
                            src={d.product.localImage ? `${API_URL}${d.product.localImage}` : d.product.image}
                            alt={d.product.name}
                              className="w-12 h-12 rounded-xl object-cover shadow-md"
                          />
                          <div className="flex-1">
                              <p className="font-bold text-slate-800">{d.product.name}</p>
                              <p className="text-sm text-slate-600 font-medium">{d.dosage}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                  <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => openEditModal(disease)}
                      className="text-blue-600 hover:text-blue-700 font-bold text-sm transition-colors duration-200"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteDisease(disease._id)}
                      className="text-red-600 hover:text-red-700 font-bold text-sm transition-colors duration-200"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              </div>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-800">{editingDisease ? 'Editar Enfermedad' : 'Añadir Nueva Enfermedad'}</h2>
                  <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 text-2xl">✕</button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre de la Enfermedad</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="Ej: Deficiencia de Vitamina D"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                    placeholder="Describe la enfermedad"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Paquete Sugerido</label>
                  <div className="grid gap-3">
                    {displayPackages.map(pkg => (
                      <div
                        key={pkg._id}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${formData.selectedPackage?._id === pkg._id ? 'border-red-500 bg-red-50' : 'border-slate-300 hover:border-slate-400'}`}
                        onClick={() => handlePackageSelection(pkg)}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-800">{pkg.name}</h4>
                          <div className={`w-5 h-5 rounded-full border-2 ${formData.selectedPackage?._id === pkg._id ? 'bg-red-500 border-red-500' : 'border-slate-300'}`}>{formData.selectedPackage?._id === pkg._id && <div className="w-full h-full flex items-center justify-center"><span className="text-white text-xs">✓</span></div>}</div>
                        </div>
                        <div className="flex -space-x-2 mt-2">
                          {pkg.products.map(product => (
                            <img
                              key={product._id}
                              src={product.localImage ? `${API_URL}${product.localImage}` : product.image}
                              alt={product.name}
                              className="w-8 h-8 rounded-full border-2 border-white object-cover"
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {formData.selectedPackage && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Dosificación de Productos</label>
                    <div className="space-y-4">
                      {formData.selectedPackage.products.map(prod => (
                        <div key={prod._id} className="bg-slate-50 p-4 rounded-xl">
                          <div className="flex items-center space-x-3 mb-3">
                            <img
                              src={prod.localImage ? `${API_URL}${prod.localImage}` : prod.image}
                              alt={prod.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <h5 className="font-medium text-slate-800">{prod.name}</h5>
                          </div>
                          <input
                            type="text"
                            value={formData.dosages[prod._id] || ''}
                            onChange={e => handleDosageChange(prod._id, e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            placeholder="Ej: 1 cápsula diaria"
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex space-x-4 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors">Cancelar</button>
                  <button type="submit" disabled={isSaving || !formData.selectedPackage} className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>{editingDisease ? "Guardar Cambios" : "Añadir Enfermedad"}</>
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
}

export default Diseases;
