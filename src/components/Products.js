import React, { useState, useEffect } from 'react';

function Products() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    suggestedInfo: '',
    keywords: [],
    price: '',
    currency: 'USD',
    image: '',
    imageFile: null
  });

  const [currentKeyword, setCurrentKeyword] = useState('');

  const productCatalog = {
    '4Life Transfer Factor': [
      'TF Plus Tri-Factor Formula',
      'TF Regular Tri-Factor',
      'TF RioVida Tri-Factor',
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

  useEffect(() => {
    fetch('http://localhost:4000/products')
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || err.message || 'Failed to load products');
        }
        return res.json();
      })
      .then(data => setProducts(data))
      .catch(err => console.error(err));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:4000/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...formData,
        price: parseFloat(formData.price)
      })
    })
      .then(async res => {
        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(error.message || 'Error creating product');
        }
        return res.json();
      })
      .then(product => {
        setProducts(prev => [...prev, product]);
        closeModal();
      })
      .catch(err => {
        console.error('Failed to create product:', err);
      });
  };

  const deleteProduct = (productId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      fetch(`http://localhost:4000/products/${productId}`, { method: 'DELETE' })
        .then(() => {
          setProducts(prev => prev.filter(product => product._id !== productId));
        })
        .catch(err => console.error(err));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: '',
      category: '',
      suggestedInfo: '',
      keywords: [],
      price: '',
      currency: 'USD',
      image: '',
      imageFile: null
    });
    setCurrentKeyword('');
  };

  return (
    <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
              Gestión de Productos 📦
            </h1>
            <p className="text-slate-600 text-lg">
              Administra tu catálogo de productos
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex items-center space-x-2"
          >
            <span className="text-lg">➕</span>
            <span>Crear Nuevo Producto</span>
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div key={product._id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-xl"
                />
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{product.name}</h3>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    {product.category}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{product.suggestedInfo}</p>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(product.keywords)
                    ? product.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md"
                        >
                          #{keyword}
                        </span>
                      ))
                    : null}
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xl font-bold text-slate-800">
                    {product.currency} ${product.price}
                  </span>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      Editar
                    </button>
                    <button 
                      onClick={() => deleteProduct(product._id)}
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
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Crear Producto
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

export default Products;