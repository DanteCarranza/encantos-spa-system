import React, { useState, useEffect } from 'react'
import { 
  FiFolder, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiPackage,
  FiEye,
  FiEyeOff,
  FiX,
  FiCheck
} from 'react-icons/fi'
import categoriesService from '../../services/categoriesService'
import Swal from 'sweetalert2'
import './AdminCategoriesPage.css'

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    icono: '📁',
    orden: 0,
    activo: 1
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    const result = await categoriesService.getCategoriesWithStats()
    
    if (result.success) {
      setCategories(result.data || [])
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las categorías',
        confirmButtonColor: '#d946ef'
      })
    }
    setLoading(false)
  }

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        id: category.id,
        nombre: category.nombre,
        descripcion: category.descripcion || '',
        icono: category.icono || '📁',
        orden: category.orden || 0,
        activo: category.activo
      })
    } else {
      setEditingCategory(null)
      setFormData({
        nombre: '',
        descripcion: '',
        icono: '📁',
        orden: categories.length + 1,
        activo: 1
      })
    }
    setErrors({})
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCategory(null)
    setFormData({
      nombre: '',
      descripcion: '',
      icono: '📁',
      orden: 0,
      activo: 1
    })
    setErrors({})
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }
    
    if (!formData.icono.trim()) {
      newErrors.icono = 'El icono es obligatorio'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    const result = editingCategory
      ? await categoriesService.updateCategory(formData)
      : await categoriesService.createCategory(formData)
    
    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: editingCategory ? 'Categoría Actualizada' : 'Categoría Creada',
        text: result.message,
        confirmButtonColor: '#d946ef',
        timer: 2000
      })
      handleCloseModal()
      loadCategories()
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.message,
        confirmButtonColor: '#d946ef'
      })
    }
  }

  const handleDelete = async (category) => {
    if (category.total_servicios > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No se puede eliminar',
        text: `Esta categoría tiene ${category.total_servicios} servicio(s) asociado(s). Elimina o reasigna los servicios primero.`,
        confirmButtonColor: '#d946ef'
      })
      return
    }

    const confirm = await Swal.fire({
      icon: 'question',
      title: '¿Eliminar categoría?',
      text: `¿Estás seguro de eliminar "${category.nombre}"?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b'
    })

    if (confirm.isConfirmed) {
      const result = await categoriesService.deleteCategory(category.id)
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Eliminada',
          text: 'Categoría eliminada exitosamente',
          confirmButtonColor: '#d946ef',
          timer: 2000
        })
        loadCategories()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message,
          confirmButtonColor: '#d946ef'
        })
      }
    }
  }

  const handleToggleActive = async (category) => {
    const result = await categoriesService.updateCategory({
      ...category,
      activo: category.activo === 1 ? 0 : 1
    })

    if (result.success) {
      loadCategories()
    }
  }

  // Iconos disponibles
  const availableIcons = [
    '📁', '💅', '🦶', '👁️', '💆‍♀️', '💇‍♀️', 
    '🧖‍♀️', '💄', '✨', '🌸', '🎨', '🌺',
    '💐', '🌹', '🎀', '👗', '💎', '⭐'
  ]

  return (
    <div className="admin-categories-page">
      <div className="categories-container">
        {/* Header */}
        <div className="categories-header">
          <div className="header-left">
            <div className="header-icon">
              <FiFolder />
            </div>
            <div>
              <h1>Gestión de Categorías</h1>
              <p>Administra las categorías de tus servicios</p>
            </div>
          </div>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <FiPlus />
            Nueva Categoría
          </button>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="loading-categories">
            <div className="spinner-large"></div>
            <p>Cargando categorías...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="empty-categories">
            <div className="empty-icon">📁</div>
            <h3>No hay categorías</h3>
            <p>Crea tu primera categoría para organizar tus servicios</p>
            <button className="btn-primary" onClick={() => handleOpenModal()}>
              <FiPlus />
              Crear Categoría
            </button>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map(category => (
              <div 
                key={category.id} 
                className={`category-card ${category.activo === 0 ? 'inactive' : ''}`}
              >
                <div className="category-card-header">
                  <div className="category-icon-large">
                    {category.icono}
                  </div>
                  <div className="category-actions">
                    <button 
                      className="action-btn edit"
                      onClick={() => handleOpenModal(category)}
                      title="Editar"
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      className={`action-btn toggle ${category.activo === 1 ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleActive(category)}
                      title={category.activo === 1 ? 'Desactivar' : 'Activar'}
                    >
                      {category.activo === 1 ? <FiEye /> : <FiEyeOff />}
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDelete(category)}
                      title="Eliminar"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <div className="category-card-body">
                  <h3>{category.nombre}</h3>
                  <p className="category-description">
                    {category.descripcion || 'Sin descripción'}
                  </p>
                  
                  <div className="category-stats">
                    <div className="stat-item">
                      <FiPackage />
                      <span>{category.total_servicios} servicio{category.total_servicios !== 1 ? 's' : ''}</span>
                    </div>
                    {category.servicios_activos > 0 && (
                      <div className="stat-item active">
                        <FiCheck />
                        <span>{category.servicios_activos} activo{category.servicios_activos !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  <div className="category-meta">
                    <span className="category-orden">Orden: {category.orden}</span>
                    <span className={`category-status ${category.activo === 1 ? 'active' : 'inactive'}`}>
                      {category.activo === 1 ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content-category" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <FiX />
              </button>
            </div>

            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  className={`form-input ${errors.nombre ? 'error' : ''}`}
                  placeholder="Ej: Servicios de Manicura"
                  value={formData.nombre}
                  onChange={handleChange}
                />
                {errors.nombre && <span className="error-text">{errors.nombre}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  className="form-input"
                  placeholder="Descripción breve de la categoría"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="icono">Icono *</label>
                <div className="icon-selector">
                  {availableIcons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-option ${formData.icono === icon ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, icono: icon }))}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  id="icono"
                  name="icono"
                  className={`form-input ${errors.icono ? 'error' : ''}`}
                  placeholder="O escribe un emoji"
                  value={formData.icono}
                  onChange={handleChange}
                  maxLength={2}
                />
                {errors.icono && <span className="error-text">{errors.icono}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="orden">Orden</label>
                  <input
                    type="number"
                    id="orden"
                    name="orden"
                    className="form-input"
                    value={formData.orden}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={formData.activo === 1}
                      onChange={handleChange}
                    />
                    <span>Categoría activa</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <FiCheck />
                  {editingCategory ? 'Actualizar' : 'Crear'} Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCategoriesPage