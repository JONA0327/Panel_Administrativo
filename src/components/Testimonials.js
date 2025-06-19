import React, { useState } from 'react';

function Testimonials() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testimonials, setTestimonials] = useState([
    {
      id: 1,
      name: 'Testimonio de María García',
      associatedProducts: ['Vitamina D3', 'Omega 3'],
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      videoFile: null
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    associatedProducts: [],
    videoUrl: '',
    videoFile: null
  });

  const availableProducts = [
    { id: 1, name: 'Vitamina D3' },
    { id: 2, name: 'Omega 3' },
    { id: 3, name: 'Magnesio' },
    { id: 4, name: 'Zinc' }
  ];

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
      const videoUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        videoFile: file,
        videoUrl: videoUrl
      }));
    }
  };

  const toggleProductSelection = (productName) => {
    setFormData(prev => {
      const isSelected = prev.associatedProducts.includes(productName);
      if (isSelected) {
        return {
          ...prev,
          associatedProducts: prev.associatedProducts.filter(p => p !== productName)
        };
      } else {
        return {
          ...prev,
          associatedProducts: [...prev.associatedProducts, productName]
        };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTestimonial = {
      id: testimonials.length + 1,
      name: formData.name,
      associatedProducts: formData.associatedProducts,
      videoUrl: formData.videoUrl,
      videoFile: formData.videoFile
    };
    setTestimonials(prev => [...prev, newTestimonial]);
    closeModal();
  };

  const deleteTestimonial = (testimonialId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este testimonio?')) {
      setTestimonials(prev => prev.filter(testimonial => testimonial.id !== testimonialId));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: '',
      associatedProducts: [],
      videoUrl: '',
      videoFile: null
    });
  };

  return (
    <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
              Gestión de Testimonios 💬
            </h1>
            <p className="text-slate-600 text-lg">
              Administra testimonios en video de tus clientes
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex items-center space-x-2"
          >
            <span className="text-lg">➕</span>
            <span>Subir Testimonio</span>
          </button>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="mb-4">
                <video
                  src={testimonial.videoUrl}
                  className="w-full h-48 object-cover rounded-xl"
                  controls
                  poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%2364748b' text-anchor='middle' dy='.3em'%3EVideo%3C/text%3E%3C/svg%3E"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-800">{testimonial.name}</h3>
                <div>
                  <p className="text-sm text-slate-600 mb-2">Productos asociados:</p>
                  <div className="flex flex-wrap gap-1">
                    {testimonial.associatedProducts.map((product, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Editar
                  </button>
                  <button 
                    onClick={() => deleteTestimonial(testimonial.id)}
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Eliminar
                  </button>
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
                  <h2 className="text-2xl font-bold text-slate-800">Subir Nuevo Testimonio</h2>
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
                    {availableProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`p-3 border rounded-xl cursor-pointer transition-all ${
                          formData.associatedProducts.includes(product.name)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                        onClick={() => toggleProductSelection(product.name)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-800">{product.name}</span>
                          <div className={`w-5 h-5 rounded-full border-2 ${
                            formData.associatedProducts.includes(product.name)
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-slate-300'
                          }`}>
                            {formData.associatedProducts.includes(product.name) && (
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
                        disabled={formData.videoFile}
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
                    disabled={!formData.videoUrl || formData.associatedProducts.length === 0}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Subir Testimonio
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

export default Testimonials;