import React, { useState, useEffect } from 'react'
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiSearch,
  FiFilter,
  FiDownload,
  FiSave,
  FiX,
  FiClock,
  FiDollarSign,
  FiStar,
  FiAward,
  FiImage,
  FiList
} from 'react-icons/fi'
import servicesService from '../../services/servicesService'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Swal from 'sweetalert2'
import './AdminServicesPage.css'

const AdminServicesPage = () => {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [formData, setFormData] = useState({
    categoria_id: '',
    nombre: '',
    descripcion: '',
    descripcion_corta: '',
    duracion: '',
    precio: '',
    imagen_url: '',
    popular: false,
    destacado: false,
    activo: true,
    beneficios: ['']
  })
  const [errors, setErrors] = useState({})
  const [imageFile, setImageFile] = useState(null)
const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    loadServices()
    loadCategories()
  }, [])

  const loadServices = async () => {
    setLoading(true)
    try {
      const result = await servicesService.getServices()
      if (result.success) {
        setServices(result.data)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'No se pudieron cargar los servicios'
        })
      }
    } catch (error) {
      console.error('Error loading services:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error de conexión al cargar servicios'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo muy grande',
          text: 'La imagen no debe superar 5MB',
          confirmButtonColor: '#d946ef'
        })
        return
      }
  
      setImageFile(file)
      
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

  const loadCategories = async () => {
    try {
      const result = await servicesService.getCategories()
      if (result.success) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleOpenModal = (service = null) => {
    if (service) {
      setSelectedService(service)
      setFormData({
        categoria_id: service.categoria_id,
        nombre: service.nombre,
        descripcion: service.descripcion,
        descripcion_corta: service.descripcion_corta || '',
        duracion: service.duracion,
        precio: service.precio,
       // imagen_url: service.imagen_url || '',
        popular: service.popular,
        destacado: service.destacado,
        activo: service.activo,
        beneficios: service.beneficios.length > 0 ? service.beneficios : ['']
      })
   // Limpiar preview anterior
   setImagePreview(null)
   setImageFile(null)
   
   // Cargar imagen existente
   if (service.imagen_url) {
     setImagePreview(service.imagen_url)
   }
 } else {
      setSelectedService(null)
      setFormData({
        categoria_id: '',
        nombre: '',
        descripcion: '',
        descripcion_corta: '',
        duracion: '',
        precio: '',
        imagen_url: '',
        popular: false,
        destacado: false,
        activo: true,
        beneficios: ['']
    })
    setImageFile(null)
    setImagePreview(null)
  }
  setErrors({})
  setShowModal(true)
}

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedService(null)
    setFormData({
      categoria_id: '',
      nombre: '',
      descripcion: '',
      descripcion_corta: '',
      duracion: '',
      precio: '',
      imagen_url: '',
      popular: false,
      destacado: false,
      activo: true,
      beneficios: ['']
    })
    setImageFile(null)
    setImagePreview(null)
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

  const handleBeneficioChange = (index, value) => {
    const newBeneficios = [...formData.beneficios]
    newBeneficios[index] = value
    setFormData(prev => ({
      ...prev,
      beneficios: newBeneficios
    }))
  }

  const addBeneficio = () => {
    setFormData(prev => ({
      ...prev,
      beneficios: [...prev.beneficios, '']
    }))
  }

  const removeBeneficio = (index) => {
    if (formData.beneficios.length > 1) {
      const newBeneficios = formData.beneficios.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        beneficios: newBeneficios
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.categoria_id) {
      newErrors.categoria_id = 'Selecciona una categoría'
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria'
    }

    if (!formData.duracion || formData.duracion <= 0) {
      newErrors.duracion = 'La duración debe ser mayor a 0'
    }

    if (!formData.precio || formData.precio <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0'
    }

    const beneficiosValidos = formData.beneficios.filter(b => b.trim())
    if (beneficiosValidos.length === 0) {
      newErrors.beneficios = 'Agrega al menos un beneficio'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
  
    if (!validateForm()) return
  
    try {
      const beneficiosLimpios = formData.beneficios.filter(b => b.trim())
      
      const serviceData = new FormData()
      
      serviceData.append('categoria_id', formData.categoria_id)
      serviceData.append('nombre', formData.nombre)
      serviceData.append('descripcion', formData.descripcion)
      serviceData.append('descripcion_corta', formData.descripcion_corta || '')
      serviceData.append('duracion', parseInt(formData.duracion))
      serviceData.append('precio', parseFloat(formData.precio))
      serviceData.append('popular', formData.popular ? 1 : 0)
      serviceData.append('destacado', formData.destacado ? 1 : 0)
      serviceData.append('activo', formData.activo ? 1 : 0)
      serviceData.append('beneficios', JSON.stringify(beneficiosLimpios))
      
      if (imageFile) {
        serviceData.append('imagen', imageFile)
      }
      
      if (selectedService) {
        serviceData.append('id', selectedService.id)
        serviceData.append('_method', 'PUT')
        
        if (!imageFile && selectedService.imagen_url) {
          serviceData.append('imagen_url_actual', selectedService.imagen_url)
        }
      }
  
      // DEBUG: Ver qué se está enviando
    console.log('=== DATOS A ENVIAR ===')
    console.log('selectedService:', selectedService)
    console.log('formData:', formData)
    console.log('FormData contents:')
    for (let [key, value] of serviceData.entries()) {
      console.log(key, value)
    }
    console.log('======================')

      let result
      if (selectedService) {
        result = await servicesService.updateService(selectedService.id, serviceData)
      } else {
        result = await servicesService.createService(serviceData)
      }
  
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: selectedService ? '¡Servicio Actualizado!' : '¡Servicio Creado!',
          text: result.message,
          confirmButtonColor: '#d946ef'
        })
        
        handleCloseModal()
        loadServices()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'Error al guardar el servicio'
        })
      }
    } catch (error) {
      console.error('Error guardando servicio:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al guardar el servicio'
      })
    }
  }

  const handleDelete = (service) => {
    setSelectedService(service)
    setConfirmAction({ type: 'delete' })
    setShowConfirm(true)
  }

  const handleToggleStatus = async (service) => {

    console.log('=== TOGGLE STATUS ===')
    console.log('service:', service)
    console.log('service.activo:', service.activo)
    console.log('nuevo valor:', service.activo ? 0 : 1)
    console.log('====================')
    
    try {
      const serviceData = new FormData()
      serviceData.append('id', service.id)
      serviceData.append('activo', service.activo ? 0 : 1)
      serviceData.append('_method', 'PUT')
      
      const result = await servicesService.updateService(service.id, serviceData)
  
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Estado Actualizado',
          text: `El servicio ahora está ${!service.activo ? 'activo' : 'inactivo'}`,
          confirmButtonColor: '#d946ef',
          timer: 2000
        })
        loadServices()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cambiar el estado'
      })
    }
  }

  const confirmActionHandler = async () => {
    try {
      if (confirmAction.type === 'delete') {
        const result = await servicesService.deleteService(selectedService.id)
        
        if (result.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Servicio Eliminado!',
            text: result.message,
            confirmButtonColor: '#d946ef',
            timer: 2000
          })
          loadServices()
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: result.message
          })
        }
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al procesar la acción'
      })
    }
    
    setShowConfirm(false)
    setSelectedService(null)
    setConfirmAction(null)
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.descripcion.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || service.categoria_id === parseInt(categoryFilter)
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && service.activo) ||
      (statusFilter === 'inactive' && !service.activo)

    return matchesSearch && matchesCategory && matchesStatus
  })

  const formatPrice = (price) => {
    return `S/ ${parseFloat(price).toFixed(2)}`
  }

  const stats = {
    total: services.length,
    activos: services.filter(s => s.activo).length,
    populares: services.filter(s => s.popular).length,
    destacados: services.filter(s => s.destacado).length,
    ingresos: services.reduce((sum, s) => sum + (parseFloat(s.precio) * s.total_reservas), 0)
  }

  if (loading) {
    return (
      <div className="admin-services-loading">
        <div className="spinner-large"></div>
        <p>Cargando servicios...</p>
      </div>
    )
  }

  return (
    <div className="admin-services-page">
      {/* Header */}
      <div className="services-header">
        <div>
          <h1 className="services-title">Gestión de Servicios</h1>
          <p className="services-subtitle">Administra los servicios del spa</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FiPlus />
          Nuevo Servicio
        </button>
      </div>

      {/* Stats */}
      <div className="services-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FiList />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Servicios</div>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">
            <FiEye />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.activos}</div>
            <div className="stat-label">Activos</div>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">
            <FiStar />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.populares}</div>
            <div className="stat-label">Populares</div>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">
            <FiAward />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.destacados}</div>
            <div className="stat-label">Destacados</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="services-filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Buscar servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-row">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>

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

      {/* Results */}
      <div className="results-info">
        Mostrando <strong>{filteredServices.length}</strong> de <strong>{services.length}</strong> servicios
      </div>

      {/* Services Grid */}
      <div className="services-grid">
        {filteredServices.map(service => (
          <div key={service.id} className={`service-card ${!service.activo ? 'inactive' : ''}`}>
            {service.popular && (
              <div className="service-badge popular">
                <FiStar /> Popular
              </div>
            )}
            {service.destacado && (
              <div className="service-badge featured">
                <FiAward /> Destacado
              </div>
            )}

            <div className="service-image">
              {service.imagen_url ? (
                <img src={service.imagen_url} alt={service.nombre} />
              ) : (
                <div className="service-image-placeholder">
                  <FiImage />
                  <span>Sin imagen</span>
                </div>
              )}
            </div>

            <div className="service-body">
              <div className="service-category">
                {service.categoria_icono} {service.categoria_nombre}
              </div>
              
              <h3 className="service-name">{service.nombre}</h3>
              <p className="service-description">{service.descripcion}</p>

              <div className="service-info">
                <div className="info-item">
                  <FiClock />
                  <span>{service.duracion} min</span>
                </div>
                <div className="info-item price">
                  <FiDollarSign />
                  <span>{formatPrice(service.precio)}</span>
                </div>
              </div>

              <div className="service-benefits">
                <strong>Beneficios:</strong>
                <ul>
                  {service.beneficios.slice(0, 3).map((beneficio, index) => (
                    <li key={index}>{beneficio}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="service-actions">
              <button
                className={`btn-icon ${service.activo ? 'success' : 'warning'}`}
                onClick={() => handleToggleStatus(service)}
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

            {!service.activo && (
              <div className="inactive-overlay">
                <FiEyeOff />
                <span>Inactivo</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No se encontraron servicios</h3>
          <p>Intenta con otros filtros de búsqueda</p>
        </div>
      )}

      {/* Modal Create/Edit */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedService ? 'Editar Servicio' : 'Nuevo Servicio'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="service-form">
          <div className="form-grid">
            {/* Categoría */}
            <div className="form-group">
              <label className="form-label">Categoría *</label>
              <select
                name="categoria_id"
                className={`form-input ${errors.categoria_id ? 'error' : ''}`}
                value={formData.categoria_id}
                onChange={handleChange}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icono} {cat.nombre}</option>
                ))}
              </select>
              {errors.categoria_id && <span className="form-error">{errors.categoria_id}</span>}
            </div>

            {/* Nombre */}
            <div className="form-group">
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

            {/* Duración */}
            <div className="form-group">
              <label className="form-label">Duración (minutos) *</label>
              <input
                type="number"
                name="duracion"
                className={`form-input ${errors.duracion ? 'error' : ''}`}
                placeholder="60"
                min="1"
                value={formData.duracion}
                onChange={handleChange}
              />
              {errors.duracion && <span className="form-error">{errors.duracion}</span>}
            </div>

            {/* Precio */}
            <div className="form-group">
              <label className="form-label">Precio (S/) *</label>
              <input
                type="number"
                name="precio"
                className={`form-input ${errors.precio ? 'error' : ''}`}
                placeholder="120.00"
                min="0"
                step="0.01"
                value={formData.precio}
                onChange={handleChange}
              />
              {errors.precio && <span className="form-error">{errors.precio}</span>}
            </div>

            {/* Descripción detallada */}
            <div className="form-group form-full">
              <label className="form-label">Descripción Detallada</label>
              <textarea
                name="descripcion"
                className={`form-input ${errors.descripcion ? 'error' : ''}`}
                placeholder="Descripción detallada"
                rows="2"
                value={formData.descripcion}
                onChange={handleChange}
              />
              {errors.descripcion && <span className="form-error">{errors.descripcion}</span>}
            </div>

            {/* Descripción corta */}
            <div className="form-group form-full">
              <label className="form-label">Descripción Corta *</label>
              <textarea
                name="descripcion_corta"
                className="form-input"
                placeholder="Descripción breve del servicio"
                rows="3"
                value={formData.descripcion_corta}
                onChange={handleChange}
              />
            </div>

            {/* URL de Imagen */}
            <div className="form-group form-full">
  <label className="form-label">Imagen del Servicio (Opcional)</label>
  <div className="image-upload-container">
    <input
      type="file"
      id="imagen-upload"
      accept="image/*"
      onChange={handleImageChange}
      style={{ display: 'none' }}
    />
    <label htmlFor="imagen-upload" className="upload-button">
      <FiImage />
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

            {/* Beneficios */}
            <div className="form-group form-full">
              <label className="form-label">Beneficios *</label>
              {formData.beneficios.map((beneficio, index) => (
                <div key={index} className="beneficio-input-group">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Reduce el estrés y la ansiedad"
                    value={beneficio}
                    onChange={(e) => handleBeneficioChange(index, e.target.value)}
                  />
                  {formData.beneficios.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove-beneficio"
                      onClick={() => removeBeneficio(index)}
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={addBeneficio}
              >
                <FiPlus /> Agregar Beneficio
              </button>
              {errors.beneficios && <span className="form-error">{errors.beneficios}</span>}
            </div>

            {/* Checkboxes */}
            <div className="form-group form-full">
              <div className="checkboxes-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="popular"
                    checked={formData.popular}
                    onChange={handleChange}
                  />
                  <span>Popular</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="destacado"
                    checked={formData.destacado}
                    onChange={handleChange}
                  />
                  <span>Destacado</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleChange}
                  />
                  <span>Activo</span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
              <FiX /> Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <FiSave /> {selectedService ? 'Actualizar' : 'Crear'} Servicio
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmActionHandler}
        title="Eliminar Servicio"
        message={`¿Estás seguro de eliminar el servicio "${selectedService?.nombre}"? Esta acción no se puede deshacer.`}
        type="danger"
      />
    </div>
  )
}

export default AdminServicesPage