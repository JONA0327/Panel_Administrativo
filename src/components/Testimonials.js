import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { apiFetch } from '../utils/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const Testimonials = forwardRef((props, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [products, setProducts] = useState([]);
  const [subfolders, setSubfolders] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    associatedProducts: [],
    videoUrl: '',
    videoFile: null,
    subfolderId: ''
  });

  const productMap = Object.fromEntries(products.map(p => [p._id, p.name]));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Carga de testimonios
    apiFetch(`${API_URL}/testimonials`, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => setTestimonials(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to load testimonials', err));

    // Carga de productos
    apiFetch(`${API_URL}/products`, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to load products', err));

    // Carga de subcarpetas
    apiFetch(`${API_URL}/config/subfolders`, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => setSubfolders(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to load subfolders', err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setFormData(prev => ({
          ...prev,
          videoUrl: evt.target.result,
          videoFile: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleProductSelection = (productId) => {
    setFormData(prev => {
      const isSelected = prev.associatedProducts.includes(productId);
      return {
        ...prev,
        associatedProducts: isSelected
          ? prev.associatedProducts.filter(p => p !== productId)
          : [...prev.associatedProducts, productId]
      };
    });
  };

  const openEditModal = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name || '',
      associatedProducts: Array.isArray(testimonial.associatedProducts) ? testimonial.associatedProducts : [],
      videoUrl: testimonial.video || '',
      videoFile: null,
      subfolderId: testimonial.subfolderId || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      name: formData.name,
      associatedProducts: formData.associatedProducts,
      video: formData.videoUrl,
      subfolderId: formData.subfolderId || undefined
    };

    const url = editingTestimonial
      ? `${API_URL}/testimonials/${editingTestimonial._id}`
      : `${API_URL}/testimonials`;
    const method = editingTestimonial ? 'PUT' : 'POST';

    apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        setTestimonials(prev =>
          editingTestimonial
            ? prev.map(t => t._id === data._id ? data : t)
            : [...prev, data]
        );
        setIsSaving(false);
        closeModal();
      })
      .catch(err => {
        console.error(editingTestimonial ? 'Failed to update testimonial' : 'Failed to create testimonial', err);
        setIsSaving(false);
      });
  };

  const deleteTestimonial = (testimonialId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este testimonio?')) return;
    const token = localStorage.getItem('token');
    apiFetch(`${API_URL}/testimonials/${testimonialId}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        setTestimonials(prev => prev.filter(t => t._id !== testimonialId));
      })
      .catch(err => console.error('Failed to delete testimonial', err));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTestimonial(null);
    setFormData({
      name: '',
      associatedProducts: [],
      videoUrl: '',
      videoFile: null,
      subfolderId: ''
    });
  };

  const openAddModal = () => {
    setEditingTestimonial(null);
    setFormData({
      name: '',
      associatedProducts: [],
      videoUrl: '',
      videoFile: null,
      subfolderId: ''
    });
    setIsModalOpen(true);
  };

  useImperativeHandle(ref, () => ({ openAddModal }));

  return (
    <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/30 overflow-y-auto min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                Gestión de Testimonios
              </h1>
              <p className="text-slate-600 text-xl font-medium">
                Administra testimonios en video con estilo profesional
              </p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 flex items-center space-x-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Subir Testimonio</span>
          </button>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial._id} className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-yellow-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="mb-6">
                <video
                  src={testimonial.localVideo ? `${API_URL}${testimonial.localVideo}` : testimonial.video}
                    className="w-full h-56 object-cover rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  controls
                  poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%2364748b' text-anchor='middle' dy='.3em'%3EVideo%3C/text%3E%3C/svg%3E"
                />
              </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-slate-900">{testimonial.name}</h3>
                <div>
                    <p className="text-sm text-slate-600 mb-3 font-semibold">Productos asociados:</p>
                    <div className="flex flex-wrap gap-2">
                    {testimonial.associatedProducts.map((pid, index) => (
                        <span key={index} className="px-3 py-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 text-xs rounded-full font-bold border border-orange-200">
                        {productMap[pid] || pid}
                      </span>
                    ))}
                  </div>
                </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => openEditModal(testimonial)}
                      className="text-blue-600 hover:text-blue-700 font-bold text-sm transition-colors duration-200"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteTestimonial(testimonial._id)}
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

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-800">
                    {editingTestimonial ? 'Editar Testimonio' : 'Subir Nuevo Testimonio'}
                  </h2>
                  <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 text-2xl">
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nombre del Testimonio
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Ej: Testimonio de María García"
                    required
                  />
                </div>

                {/* Productos Asociados */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Productos Asociados
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {products.map((product) => (
                      <div
                        key={product._id}
                        className={`p-3 border rounded-xl cursor-pointer transition-all ${
                          formData.associatedProducts.includes(product._id)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                        onClick={() => toggleProductSelection(product._id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-800">{product.name}</span>
                          <div className={`w-5 h-5 rounded-full border-2 ${
                            formData.associatedProducts.includes(product._id)
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-slate-300'
                          }`}>
                            {formData.associatedProducts.includes(product._id) && (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subcarpeta */}
                {subfolders.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Subcarpeta destino
                    </label>
                    <select
                      name="subfolderId"
                      value={formData.subfolderId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">Carpeta principal</option>
                      {subfolders.map((sf) => (
                        <option key={sf.folderId} value={sf.folderId}>{sf.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Video */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Video del Testimonio
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Subir archivo de video</label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="text-center text-slate-400 text-sm">O</div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">URL del video</label>
                      <input
                        type="url"
                        name="videoUrl"
                        value={formData.videoFile ? '' : formData.videoUrl}
                        onChange={handleInputChange}
                        disabled={!!formData.videoFile}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:bg-slate-100"
                        placeholder="https://ejemplo.com/video.mp4"
                      />
                    </div>
                  </div>
                  {formData.videoUrl && (
                    <div className="mt-3">
                      <p className="text-sm text-slate-600 mb-2">Vista previa:</p>
                      <video
                        src={formData.videoUrl}
                        className="w-full h-32 object-cover rounded-lg border border-slate-200"
                        controls
                      />
                    </div>
                  )}
                </div>

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
                    disabled={isSaving || !formData.videoUrl || formData.associatedProducts.length === 0}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>{editingTestimonial ? 'Guardar Cambios' : 'Subir Testimonio'}</>
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

export default Testimonials;
