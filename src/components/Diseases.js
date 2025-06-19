import React, { useState } from 'react';

function Diseases() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [diseases, setDiseases] = useState([
    {
      id: 1,
      name: 'Deficiencia de Vitamina D',
      information: 'La deficiencia de vitamina D puede causar debilidad ósea, fatiga y problemas del sistema inmune.',
      suggestedPackage: {
        id: 1,
        name: 'Pack Inmunidad',
        products: [
          { id: 1, name: 'Vitamina D3', dosage: '1 cápsula diaria con el desayuno' },
          { id: 2, name: 'Omega 3', dosage: '2 cápsulas diarias con las comidas' }
        ]
      }
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    information: '',
    selectedPackage: null,
    dosages: {}
  });

  const availablePackages = [
    {
      id: 1,
      name: 'Pack Inmunidad',
      products: [
        { id: 1, name: 'Vitamina D3', image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=300' },
        { id: 2, name: 'Omega 3', image: 'https://images.pexels.com/photos/3683081/pexels-photo-3683081.jpeg?auto=compress&cs=tinysrgb&w=300' }
      ]
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePackageSelection = (packageData) => {
    setFormData(prev => ({
      ...prev,
      selectedPackage: packageData,
      dosages: {}
    }));
  };

  const handleDosageChange = (productId, dosage) => {
    setFormData(prev => ({
      ...prev,
      dosages: {
        ...prev.dosages,
        [productId]: dosage
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newDisease = {
      id: diseases.length + 1,
      name: formData.name,
      information: formData.information,
      suggestedPackage: {
        ...formData.selectedPackage,
        products: formData.selectedPackage.products.map(product => ({
          ...product,
          dosage: formData.dosages[product.id] || ''
        }))
      }
    };
    setDiseases(prev => [...prev, newDisease]);
    closeModal();
  };

  const deleteDisease = (diseaseId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta enfermedad?')) {
      setDiseases(prev => prev.filter(disease => disease.id !== diseaseId));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: '',
      information: '',
      selectedPackage: null,
      dosages: {}
    });
  };

  return (
    <main className="flex-1 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-y-auto min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
              Índice de Enfermedades 🏥
            </h1>
            <p className="text-slate-600 text-lg">
              Gestiona enfermedades y sus tratamientos sugeridos
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex items-center space-x-2"
          >
            <span className="text-lg">➕</span>
            <span>Añadir Enfermedad</span>
          </button>
        </div>

        {/* Diseases Grid */}
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {diseases.map((disease) => (
            <div key={disease.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{disease.name}</h3>
                <p className="text-sm text-slate-600 mb-4">{disease.information}</p>
                
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-slate-700 mb-3">Paquete Sugerido: {disease.suggestedPackage.name}</h4>
                  <div className="space-y-3">
                    {disease.suggestedPackage.products.map((product) => (
                      <div key={product.id} className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                        <img
                          src={product.image || 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=300'}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{product.name}</p>
                          <p className="text-sm text-slate-500">{product.dosage}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Editar
                  </button>
                  <button 
                    onClick={() => deleteDisease(disease.id)}
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-slate-800">Añadir Nueva Enfermedad</h2>
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
                    Nombre de la Enfermedad
                  </label>
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

                {/* Información */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Información de la Enfermedad
                  </label>
                  <textarea
                    name="information"
                    value={formData.information}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                    placeholder="Describe la enfermedad, síntomas, causas..."
                    required
                  />
                </div>

                {/* Selección de Paquete */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Paquete Sugerido
                  </label>
                  <div className="grid gap-3">
                    {availablePackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${
                          formData.selectedPackage?.id === pkg.id
                            ? 'border-red-500 bg-red-50'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                        onClick={() => handlePackageSelection(pkg)}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-800">{pkg.name}</h4>
                          <div className={`w-5 h-5 rounded-full border-2 ${
                            formData.selectedPackage?.id === pkg.id
                              ? 'bg-red-500 border-red-500'
                              : 'border-slate-300'
                          }`}>
                            {formData.selectedPackage?.id === pkg.id && (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex -space-x-2 mt-2">
                          {pkg.products.map((product) => (
                            <img
                              key={product.id}
                              src={product.image}
                              alt={product.name}
                              className="w-8 h-8 rounded-full border-2 border-white object-cover"
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dosificación */}
                {formData.selectedPackage && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Dosificación de Productos
                    </label>
                    <div className="space-y-4">
                      {formData.selectedPackage.products.map((product) => (
                        <div key={product.id} className="bg-slate-50 p-4 rounded-xl">
                          <div className="flex items-center space-x-3 mb-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <h5 className="font-medium text-slate-800">{product.name}</h5>
                          </div>
                          <input
                            type="text"
                            value={formData.dosages[product.id] || ''}
                            onChange={(e) => handleDosageChange(product.id, e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            placeholder="Ej: 1 cápsula diaria con el desayuno"
                            required
                          />
                        </div>
                      ))}
                    </div>
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
                    disabled={!formData.selectedPackage}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Añadir Enfermedad
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