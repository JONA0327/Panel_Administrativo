import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const Products = forwardRef((props, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [submitError, setSubmitError] = useState(null);
  const [subfolders, setSubfolders] = useState([]);

  // Product to show in the description modal
  const [infoProduct, setInfoProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    suggestedInfo: '',
    keywords: [],
    price: '',
    currency: 'USD',
    image: '',
    imageFile: null,
    subfolderId: ''
  });

  const [currentKeyword, setCurrentKeyword] = useState('');

  const productCatalog = {
    '4Life Transfer Factor': [
      'TF Plus Tri-Factor Formula',
      'TF Avanzado Tri-Factor',
      'TF RioVida Stix Tri-Factor',
      'TF RioVida Liquido Tri-Factor',
      'TF RioVida BURST Tri-Factor',
      'TF BCV – Cardio',
      'TF Belle Vie',
      'TF Classic',
      'TF Collagen',
      'TF FeelRite',
      'TF Glucoach',
      'TF Glutamine Prime',
      'TF Immune Boost',
      'TF Immune Spray',
      'TF KBU',
      'TF Lung',
      'TF MalePro',
      'TF Masticable',
      'TF Metabolite',
      'TF Recall',
      'TF Reflexion',
      'TF Renewal',
      'TF Rite Start Kids & Teens',
      'TF Rite Start Men',
      'TF Rite Start Women',
      'TF Sleep Rite',
      'TF Vista'
    ],
    '4Life Elements': ['Gold Factor', 'Zinc Factor'],
    '4Life Transform': [
      'TF Burn',
      'TF Man',
      'TF Woman',
      'Pro TF Proteína Hidrolizada',
      'TF PreZoom',
      'TF ReNuvo',
      'TF ShapeRite'
    ],
    'Enummi Cuidado Personal': [
      'Enummi Cuidado Personal',
      'Enummi Desodorante',
      'Enummi Jabón de Manos',
      'Enummi Loción Corporal',
      'Enummi Pasta Dental'
    ],
    'Äkwä Cuidado de Piel': [
      'äKwä Fist Wave',
      'äKwä Lavapure',
      'äKwä Glacier Glow',
      'äKwä Precious Pool',
      'äKwä Royal Bath',
      'äKwä Ripple Refine',
      'äKwä RainBurst',
      'äKwä Life C'
    ],
    'Bienestar Fundamental': [
      'Ácidos Grasos Esenciales',
      'BioGenistein Ultra',
      'Cal Mag Complex',
      'Calostro Fortificado',
      'Fibro AMJ',
      'Flex 4Life',
      'Gurmar',
      'Inner Sun',
      'Life C',
      'Multiplex',
      'Músculo Skeletal',
      'PBGS+ Antioxidante',
      'Stress Formula'
    ],
    'Energía & Nutrición': ['Energy Go Stix', 'Nutra Start Blue'],
    'Digest 4Life': [
      'Alove Vera',
      'Enzimas Digestivas',
      'Fibre System Plus',
      'Phytolax',
      'Pre/O Biotics',
      'Super Detox',
      'Tea 4Life'
    ]
  };

  const categories = Object.keys(productCatalog);
  const productOptions =
    formData.category && productCatalog[formData.category]
      ? productCatalog[formData.category]
      : [];
  const currencies = ['USD', 'EUR', 'MXN', 'COP', 'ARS'];
  const subfolderMap = Object.fromEntries(subfolders.map(sf => [sf.folderId, sf.name]));

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then(async res => {
        if (res.status === 403) {
          alert('No autorizado');
          return [];
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || err.message || 'Failed to load products');
        }
        return res.json();
      })
      .then(data => setProducts(data))
      .catch(err => console.error(err));

    fetch(`${API_URL}/config/subfolders`)
      .then(async res => {
        if (res.status === 403) {
          alert('No autorizado');
          return [];
        }
        return res.json();
      })
      .then(setSubfolders)
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
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: e.target.result,
          imageFile: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addKeyword = () => {
    if (currentKeyword.trim() && !formData.keywords.includes(currentKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, currentKeyword.trim()]
      }));
      setCurrentKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      suggestedInfo: '',
      keywords: [],
      price: '',
      currency: 'USD',
      image: '',
      imageFile: null,
      subfolderId: ''
    });
    setCurrentKeyword('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || '',
      suggestedInfo: product.suggestedInfo || '',
      keywords: Array.isArray(product.keywords) ? product.keywords : [],
      price: product.price != null ? product.price : '',
      currency: product.currency || 'USD',
      image: product.image || '',
      imageFile: null,
      subfolderId: product.subfolderId || ''
    });
    setCurrentKeyword('');
  };

  const openInfoModal = (product) => {
    setInfoProduct(product);
  };

  const closeInfoModal = () => {
    setInfoProduct(null);
  };

  useImperativeHandle(ref, () => ({
    openAddModal
  }));

const handleSubmit = (e) => {
  e.preventDefault();
  setSubmitError(null); // Limpia cualquier error previo
  setIsSaving(true);

  fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...formData,                         // Incluye todos los campos del formulario
      price: parseFloat(formData.price),  // Convierte price a número
      subfolderId: formData.subfolderId || undefined
    })
  })
    .then(async res => {
      if (res.status === 403) {
        alert('No autorizado');
        throw new Error('Forbidden');
      }
      if (!res.ok) {
        // Lee el JSON del error y construye un mensaje claro
        const payload = await res.json().catch(() => ({}));
        const msg = payload.error || payload.details || payload.message || 'Error al crear producto';
        throw new Error(msg);
      }
      return res.json();
    })
    .then(product => {
      // Almacena el nuevo producto y cierra el modal
      setProducts(prev => [...prev, product]);
      setIsSaving(false);
      alert('Producto agregado');
      closeModal();
    })
    .catch(err => {
      console.error('Failed to create product:', err);
      setSubmitError(err.message); // Muestra el mensaje devuelto por el backend
      setIsSaving(false);
    });
};

const handleUpdate = (e) => {
  e.preventDefault();
  if (!editingProduct) return;
  setSubmitError(null);
  setIsSaving(true);

    const payload = {
      suggestedInfo: formData.suggestedInfo,
      keywords: formData.keywords,
      price: parseFloat(formData.price),
      currency: formData.currency,
    };
    if (formData.image && formData.image.startsWith('data:')) {
      payload.image = formData.image;
    }

  fetch(`${API_URL}/products/${editingProduct._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
      .then(async res => {
        if (res.status === 403) {
          alert('No autorizado');
          throw new Error('Forbidden');
        }
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          const msg = payload.error || payload.details || payload.message || 'Error al actualizar producto';
          throw new Error(msg);
        }
        return res.json();
      })
      .then(updated => {
        setProducts(prev => prev.map(p => (p._id === updated._id ? updated : p)));
        setIsSaving(false);
        alert('Producto actualizado');
        closeModal();
      })
      .catch(err => {
        console.error('Failed to update product:', err);
        setSubmitError(err.message);
        setIsSaving(false);
      });
};

  const deleteProduct = (productId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      fetch(`${API_URL}/products/${productId}`, { method: 'DELETE' })
        .then(res => {
          if (res.status === 403) {
            alert('No autorizado');
            return;
          }
          setProducts(prev => prev.filter(product => product._id !== productId));
        })
        .catch(err => console.error(err));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      suggestedInfo: '',
      keywords: [],
      price: '',
      currency: 'USD',
      image: '',
      imageFile: null,
      subfolderId: ''
    });
    setCurrentKeyword('');
  };

  return (
    <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 overflow-y-auto min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
                Gestión de Productos
              </h1>
              <p className="text-slate-600 text-xl font-medium">
                Administra tu catálogo de productos con estilo moderno
              </p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 flex items-center space-x-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Crear Producto</span>
          </button>
        </div>
        {submitError && (
          <div className="text-red-600 mb-4">{submitError}</div>
        )}

        {/* Products Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-105 cursor-pointer"
              onClick={() => openInfoModal(product)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="mb-6">
                <img
                  src={product.localImage ? `${API_URL}${product.localImage}` : product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                />
              </div>
                <div className="space-y-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-900">{product.name}</h3>
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs rounded-full font-bold border border-emerald-200">
                    {product.category}
                  </span>
                </div>
                  <div className="flex flex-wrap gap-2">
                  {Array.isArray(product.keywords)
                    ? product.keywords.map((keyword, index) => (
                        <span
                          key={index}
                            className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg font-medium border border-slate-200"
                        >
                          #{keyword}
                        </span>
                      ))
                    : null}
                </div>
                {product.subfolderId && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <p className="text-xs text-slate-500 font-medium">{subfolderMap[product.subfolderId] || product.subfolderId}</p>
                    </div>
                )}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <span className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {product.currency} ${product.price}
                  </span>
                    <div className="flex space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(product);
                      }}
                        className="text-blue-600 hover:text-blue-700 font-bold text-sm transition-colors duration-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProduct(product._id);
                      }}
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-800">Crear Nuevo Producto</h2>
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
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    name="name"
                    list="product-name-list"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ej: Vitamina D3"
                    required
                  />
                  <datalist id="product-name-list">
                    {productOptions.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                  {productOptions.length > 0 && (
                    <ul className="mt-2 list-disc list-inside text-sm text-slate-600">
                      {productOptions.map((name) => (
                        <li key={name}>{name}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Categoría
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Información Sugerida */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Información Sugerida
                  </label>
                  <textarea
                    name="suggestedInfo"
                    value={formData.suggestedInfo}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Describe los beneficios del producto..."
                    required
                  />
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Palabras Clave
                  </label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={currentKeyword}
                      onChange={(e) => setCurrentKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Agregar palabra clave"
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        #{keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Precio y Moneda */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Precio
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Moneda
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {currencies.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
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
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Carpeta principal</option>
                      {subfolders.map((sf) => (
                        <option key={sf.folderId} value={sf.folderId}>{sf.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Imagen */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Imagen del Producto
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Subir archivo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="text-center text-slate-400 text-sm">O</div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">URL de imagen</label>
                      <input
                        type="url"
                        name="image"
                        value={formData.imageFile ? '' : formData.image}
                        onChange={handleInputChange}
                        disabled={formData.imageFile}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-100"
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>
                  </div>
                  {formData.image && (
                    <div className="mt-3">
                      <p className="text-sm text-slate-600 mb-2">Vista previa:</p>
                      <img
                        src={formData.image}
                        alt="Vista previa"
                        className="w-32 h-32 object-cover rounded-lg border border-slate-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
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
                    disabled={isSaving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>Crear Producto</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingProduct && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-800">Editar Producto</h2>
                  <button
                    onClick={closeModal}
                    className="text-slate-400 hover:text-slate-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-6">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    disabled
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-100"
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Categoría
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    disabled
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-100"
                  />
                </div>

                {/* Información Sugerida */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Información Sugerida
                  </label>
                  <textarea
                    name="suggestedInfo"
                    value={formData.suggestedInfo}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Describe los beneficios del producto..."
                    required
                  />
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Palabras Clave
                  </label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={currentKeyword}
                      onChange={(e) => setCurrentKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Agregar palabra clave"
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        #{keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Precio y Moneda */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Precio
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Moneda
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {currencies.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Imagen */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Imagen del Producto
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Subir archivo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="text-center text-slate-400 text-sm">O</div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">URL de imagen</label>
                      <input
                        type="url"
                        name="image"
                        value={formData.imageFile ? '' : formData.image}
                        onChange={handleInputChange}
                        disabled={formData.imageFile}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-100"
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>
                  </div>
                  {formData.image && (
                    <div className="mt-3">
                      <p className="text-sm text-slate-600 mb-2">Vista previa:</p>
                      <img
                        src={formData.image}
                        alt="Vista previa"
                        className="w-32 h-32 object-cover rounded-lg border border-slate-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
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
                    disabled={isSaving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>Guardar Cambios</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Description Modal */}
        {infoProduct && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-800">{infoProduct.name}</h2>
                  <button onClick={closeInfoModal} className="text-slate-400 hover:text-slate-600 text-2xl">✕</button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <img
                  src={infoProduct.localImage ? `${API_URL}${infoProduct.localImage}` : infoProduct.image}
                  alt={infoProduct.name}
                  className="w-full h-52 object-cover rounded-xl"
                />
                <p className="text-slate-600 whitespace-pre-line">{infoProduct.suggestedInfo}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
});

export default Products;