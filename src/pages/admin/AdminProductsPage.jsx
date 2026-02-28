import React, { useState, useEffect } from 'react'
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiX,
  FiClock,
  FiDollarSign,
  FiTag,
  FiEye,
  FiEyeOff,
  FiTrendingUp,
  FiImage,
  FiSave,
  FiUpload
} from 'react-icons/fi'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Swal from 'sweetalert2'
import './AdminProductsPage.css'

const AdminProductsPage = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'masajes',
    duracion: 60,
    precio: 0,
    activo: true,
    imagen_url: ''
  })
  const [errors, setErrors] = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const categories = [
    { value: 'masajes', label: 'Masajes', icon: '💆‍♀️' },
    { value: 'faciales', label: 'Faciales', icon: '✨' },
    { value: 'corporales', label: 'Corporales', icon: '🌸' },
    { value: 'unas', label: 'Uñas', icon: '💅' },
    { value: 'depilacion', label: 'Depilación', icon: '🪒' },
    { value: 'otros', label: 'Otros', icon: '🎀' }
  ]

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    setLoading(true)
    
    // Simular carga de datos
    setTimeout(() => {
      setServices([
        {
          id: 1,
          nombre: 'Masaje Relajante',
          descripcion: 'Masaje de cuerpo completo con aceites esenciales para aliviar el estrés y la tensión muscular',
          categoria: 'masajes',
          duracion: 60,
          precio: 120.00,
          activo: true,
          reservas_mes: 45,
          ingresos_mes: 5400,
          imagen_url: ''
        },
        {
          id: 2,
          nombre: 'Facial Rejuvenecedor',
          descripcion: 'Tratamiento facial anti-edad con productos premium para revitalizar la piel',
          categoria: 'faciales',
          duracion: 90,
          precio: 150.00,
          activo: true,
          reservas_mes: 38,
          ingresos_mes: 5700,
          imagen_url: ''
        },
        {
          id: 3,
          nombre: 'Manicure & Pedicure',
          descripcion: 'Cuidado completo de manos y pies con esmaltado permanente',
          categoria: 'unas',
          duracion: 75,
          precio: 80.00,
          activo: true,
          reservas_mes: 52,
          ingresos_mes: 4160,
          imagen_url: ''
        },
        {
          id: 4,
          nombre: 'Masaje de Piedras Calientes',
          descripcion: 'Terapia con piedras volcánicas calientes para relajación profunda',
          categoria: 'masajes',
          duracion: 90,
          precio: 180.00,
          activo: true,
          reservas_mes: 25,
          ingresos_mes: 4500,
          imagen_url: ''
        },
        {
          id: 5,
          nombre: 'Depilación Láser',
          descripcion: 'Depilación permanente con tecnología láser de última generación',
          categoria: 'depilacion',
          duracion: 45,
          precio: 200.00,
          activo: true,
          reservas_mes: 30,
          ingresos_mes: 6000,
          imagen_url: ''
        },
        {
          id: 6,
          nombre: 'Tratamiento Corporal',
          descripcion: 'Exfoliación e hidratación corporal profunda con productos naturales',
          categoria: 'corporales',
          duracion: 120,
          precio: 220.00,
          activo: true,
          reservas_mes: 16,
          ingresos_mes: 3520,
          imagen_url: ''
        },
        {
          id: 7,
          nombre: 'Reflexología',
          descripcion: 'Masaje terapéutico en puntos de presión de los pies',
          categoria: 'masajes',
          duracion: 45,
          precio: 90.00,
          activo: false,
          reservas_mes: 0,
          ingresos_mes: 0,
          imagen_url: ''
        }
      ])
      setLoading(false)
    }, 800)
  }


  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB máximo
        Swal.fire({
          icon: 'error',
          title: 'Archivo muy grande',
          text: 'La imagen no debe superar 5MB',
          confirmButtonColor: '#f59e0b'
        })
        return
      }
  
      setImageFile(file)
      
      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    document.getElementById('imagen-upload').value = ''
  }


  const getCategoryInfo = (categoria) => {
    return categories.find(c => c.value === categoria) || categories[0]
  }

  const formatPrice = (price) => {
    return `S/ ${price.toFixed(2)}`
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleOpenModal = (service = null) => {
    if (service) {
      setSelectedService(service)
      setFormData({
        nombre: service.nombre,
        descripcion: service.descripcion,
        categoria: service.categoria,
        duracion: service.duracion,
        precio: service.precio,
        activo: service.activo,
        imagen_url: service.imagen_url || ''
      })
    } else {
      setSelectedService(null)
      setFormData({
        nombre: '',
        descripcion: '',
        categoria: 'masajes',
        duracion: 60,
        precio: 0,
        activo: true,
        imagen_url: ''
      })
    }
    setErrors({})
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedService(null)
    setFormData({
      nombre: '',
      descripcion: '',
      categoria: 'masajes',
      duracion: 60,
      precio: 0,
      activo: true,
      imagen_url: ''
    })
    setErrors({})
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria'
    }
    
    if (formData.duracion <= 0) {
      newErrors.duracion = 'La duración debe ser mayor a 0'
    }
    
    if (formData.precio <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      const serviceData = new FormData()
      
      // Agregar todos los campos
      serviceData.append('nombre', formData.nombre)
      serviceData.append('descripcion', formData.descripcion)
      serviceData.append('duracion', formData.duracion)
      serviceData.append('precio', formData.precio)
      serviceData.append('categoria', formData.categoria)
      serviceData.append('activo', formData.activo)
      
      // Agregar imagen si hay una nueva
      if (imageFile) {
        serviceData.append('imagen', imageFile)
      }
      
      // Si estamos editando, mantener la imagen anterior si no hay nueva
      if (selectedService && !imageFile && selectedService.imagen_url) {
        serviceData.append('imagen_url_actual', selectedService.imagen_url)
      }
      
      if (selectedService) {
        // Actualizar servicio
        serviceData.append('id', selectedService.id)
        
        // Aquí llamarías a tu servicio API cuando lo tengas
        // const result = await servicesService.updateService(selectedService.id, serviceData)
        
        setServices(prev => prev.map(s => 
          s.id === selectedService.id 
            ? { 
                ...s, 
                ...formData,
                imagen_url: imagePreview || s.imagen_url 
              }
            : s
        ))
        
        Swal.fire({
          icon: 'success',
          title: '¡Servicio Actualizado!',
          text: 'El servicio se ha actualizado correctamente',
          confirmButtonColor: '#d946ef'
        })
      } else {
        // Crear nuevo servicio
        const newService = {
          id: services.length + 1,
          ...formData,
          imagen_url: imagePreview,
          reservas_mes: 0,
          ingresos_mes: 0
        }
        
        setServices(prev => [newService, ...prev])
        
        Swal.fire({
          icon: 'success',
          title: '¡Servicio Creado!',
          text: 'El nuevo servicio se ha creado correctamente',
          confirmButtonColor: '#d946ef'
        })
      }
      
      handleCloseModal()
    } catch (error) {
      console.error('Error guardando servicio:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al guardar el servicio'
      })
    }
  }


  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      codigo: '',
      categoria_id: '',
      precio_compra: '',
      precio_venta: '',
      stock_actual: '',
      stock_minimo: '',
      activo: 1
    })
    setEditingProduct(null)
    setImageFile(null)
    setImagePreview(null)
  }



  const handleEdit = (product) => {
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion,
      codigo: product.codigo,
      categoria_id: product.categoria_id,
      precio_compra: product.precio_compra,
      precio_venta: product.precio_venta,
      stock_actual: product.stock_actual,
      stock_minimo: product.stock_minimo,
      activo: product.activo
    })
    setEditingProduct(product)
    
    // Cargar imagen existente
    if (product.imagen_url) {
      setImagePreview(product.imagen_url)
    }
    
    setShowModal(true)
  }


  const handleDelete = (service) => {
    setSelectedService(service)
    setShowConfirm(true)
  }

  const confirmDelete = () => {
    setServices(prev => prev.filter(s => s.id !== selectedService.id))
    
    Swal.fire({
      icon: 'success',
      title: '¡Servicio Eliminado!',
      text: 'El servicio se ha eliminado correctamente',
      confirmButtonColor: '#d946ef'
    })
    
    setShowConfirm(false)
    setSelectedService(null)
  }

  const toggleStatus = (service) => {
    setServices(prev => prev.map(s => 
      s.id === service.id 
        ? { ...s, activo: !s.activo }
        : s
    ))
    
    Swal.fire({
      icon: 'success',
      title: 'Estado Actualizado',
      text: `El servicio ahora está ${!service.activo ? 'activo' : 'inactivo'}`,
      confirmButtonColor: '#d946ef',
      timer: 2000
    })
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || service.categoria === categoryFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && service.activo) ||
                         (statusFilter === 'inactive' && !service.activo)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const stats = {
    total: services.length,
    active: services.filter(s => s.activo).length,
    inactive: services.filter(s => !s.activo).length,
    totalRevenue: services.reduce((sum, s) => sum + s.ingresos_mes, 0)
  }

  if (loading) {
    return (
      <div className="admin-products-loading">
        <div className="spinner-large"></div>
        <p>Cargando servicios...</p>
      </div>
    )
  }

  return (
    <div className="admin-products-page">
      {/* Header */}
      <div className="products-header">
        <div>
          <h1 className="products-title">Gestión de Servicios</h1>
          <p className="products-subtitle">Administra los servicios de tu spa</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FiPlus />
          Nuevo Servicio
        </button>
      </div>

      {/* Stats */}
      <div className="products-stats">
        <div className="stat-box">
          <div className="stat-icon total">
            <FiTag />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Servicios</div>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon active">
            <FiEye />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Activos</div>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon inactive">
            <FiEyeOff />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.inactive}</div>
            <div className="stat-label">Inactivos</div>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon revenue">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatPrice(stats.totalRevenue)}</div>
            <div className="stat-label">Ingresos del Mes</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="products-filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Buscar servicios..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="filter-group">
          <FiFilter />
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="services-grid">
        {filteredServices.map(service => {
          const categoryInfo = getCategoryInfo(service.categoria)
          
          return (
            <div key={service.id} className={`service-card ${!service.activo ? 'inactive' : ''}`}>
              <div className="service-card-header">
                <div className="service-category-badge">
                  <span className="category-icon">{categoryInfo.icon}</span>
                  <span className="category-label">{categoryInfo.label}</span>
                </div>
                <div className="service-status">
                  {service.activo ? (
                    <span className="status-badge active">
                      <FiEye /> Activo
                    </span>
                  ) : (
                    <span className="status-badge inactive">
                      <FiEyeOff /> Inactivo
                    </span>
                  )}
                </div>
              </div>

              <div className="service-card-body">
                <h3 className="service-name">{service.nombre}</h3>
                <p className="service-description">{service.descripcion}</p>

                <div className="service-details">
                  <div className="detail-item">
                    <FiClock />
                    <span>{service.duracion} min</span>
                  </div>
                  <div className="detail-item price">
                    <FiDollarSign />
                    <span>{formatPrice(service.precio)}</span>
                  </div>
                </div>

                {service.activo && (
                  <div className="service-stats">
                    <div className="stat-item">
                      <FiTrendingUp />
                      <span>{service.reservas_mes} reservas</span>
                    </div>
                    <div className="stat-item revenue">
                      <span>{formatPrice(service.ingresos_mes)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="service-card-footer">
                <button
                  className={`btn-icon ${service.activo ? 'success' : 'warning'}`}
                  onClick={() => toggleStatus(service)}
                  title={service.activo ? 'Desactivar' : 'Activar'}
                >
                  {service.activo ? <FiEye /> : <FiEyeOff />}
                </button>
                <button
                  className="btn-icon primary"
                  onClick={() => handleOpenModal(service)}
                  title="Editar"
                >
                  <FiEdit2 />
                </button>
                <button
                  className="btn-icon danger"
                  onClick={() => handleDelete(service)}
                  title="Eliminar"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No se encontraron servicios</h3>
          <p>Intenta con otros filtros o crea un nuevo servicio</p>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedService ? 'Editar Servicio' : 'Nuevo Servicio'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="service-form">
          <div className="form-grid">
            <div className="form-group form-full">
              <label className="form-label">Nombre del Servicio *</label>
              <input
                type="text"
                name="nombre"
                className={`form-input ${errors.nombre ? 'error' : ''}`}
                placeholder="Ej: Masaje Relajante"
                value={formData.nombre}
                onChange={handleChange}
              />
              {errors.nombre && <span className="form-error">{errors.nombre}</span>}
            </div>

            <div className="form-group form-full">
              <label className="form-label">Descripción *</label>
              <textarea
                name="descripcion"
                className={`form-input form-textarea ${errors.descripcion ? 'error' : ''}`}
                placeholder="Describe el servicio en detalle..."
                value={formData.descripcion}
                onChange={handleChange}
                rows={4}
              />
              {errors.descripcion && <span className="form-error">{errors.descripcion}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Categoría *</label>
              <select
                name="categoria"
                className="form-input"
                value={formData.categoria}
                onChange={handleChange}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Duración (minutos) *</label>
              <input
                type="number"
                name="duracion"
                className={`form-input ${errors.duracion ? 'error' : ''}`}
                placeholder="60"
                value={formData.duracion}
                onChange={handleChange}
                min="1"
              />
              {errors.duracion && <span className="form-error">{errors.duracion}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Precio (S/) *</label>
              <input
                type="number"
                name="precio"
                className={`form-input ${errors.precio ? 'error' : ''}`}
                placeholder="120.00"
                value={formData.precio}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
              {errors.precio && <span className="form-error">{errors.precio}</span>}
            </div>

            <div className="form-group form-full">
  <label className="form-label">Imagen del Producto (Opcional)</label>
  <div className="image-upload-container">
    <input
      type="file"
      id="imagen-upload"
      accept="image/*"
      onChange={handleImageChange}
      style={{ display: 'none' }}
    />
    <label htmlFor="imagen-upload" className="upload-button">
      <FiUpload />
      Seleccionar Imagen
    </label>
    {imagePreview && (
      <div className="image-preview">
        <img src={imagePreview} alt="Preview" />
        <button
          type="button"
          className="remove-image"
          onClick={handleRemoveImage}
        >
          <FiX />
        </button>
      </div>
    )}
  </div>
</div>

            <div className="form-group form-full">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                />
                <span>Servicio activo (visible para clientes)</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
              <FiX />
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <FiSave />
              {selectedService ? 'Actualizar' : 'Crear'} Servicio
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Eliminar Servicio"
        message={`¿Estás seguro de que deseas eliminar el servicio "${selectedService?.nombre}"? Esta acción no se puede deshacer.`}
        type="danger"
      />
    </div>
  )
}

export default AdminProductsPage