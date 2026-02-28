import React, { useState, useEffect } from 'react'
import {
  FiGrid,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiSave,
  FiX,
  FiMove,
  FiPackage
} from 'react-icons/fi'
import categoriesService from '../../../services/snacks/categoriesService'
import Modal from '../../../components/common/Modal'
import ConfirmDialog from '../../../components/common/ConfirmDialog'
import Swal from 'sweetalert2'
import './CategoriesPage.css'

// Lista de emojis comunes para categorías
const EMOJI_LIST = [
  '🍔', '🍕', '🌭', '🍟', '🍿', '🥤', '☕', '🧃', 
  '🍪', '🍩', '🧁', '🍰', '🍫', '🍬', '🍭', '🍮',
  '🥪', '🌮', '🌯', '🥙', '🍱', '🍛', '🍜', '🍲',
  '🥗', '🍇', '🍎', '🍊', '🍋', '🍌', '🍉', '🍓',
  '🥐', '🥖', '🥨', '🥯', '🧀', '🍗', '🥓', '🥩',
  '🍦', '🥧', '🎂', '🍾', '🍷', '🍺', '🥂', '📦'
]

// Colores predefinidos
const COLOR_PRESETS = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4',
  '#6366f1', '#a855f7', '#d946ef', '#f43f5e', '#64748b'
]

const CategoriesPage = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [draggedItem, setDraggedItem] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    icono: '📦',
    color: '#f59e0b',
    activo: true
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const result = await categoriesService.getCategories(true)
      if (result.success) {
        setCategories(result.data)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'No se pudieron cargar las categorías'
        })
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error de conexión'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (category = null) => {
    if (category) {
      setSelectedCategory(category)
      setFormData({
        nombre: category.nombre,
        icono: category.icono,
        color: category.color,
        activo: category.activo === 1
      })
    } else {
      setSelectedCategory(null)
      setFormData({
        nombre: '',
        icono: '📦',
        color: '#f59e0b',
        activo: true
      })
    }
    setErrors({})
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedCategory(null)
    setShowEmojiPicker(false)
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

  const handleEmojiSelect = (emoji) => {
    setFormData(prev => ({ ...prev, icono: emoji }))
    setShowEmojiPicker(false)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }

    if (!formData.icono) {
      newErrors.icono = 'Selecciona un icono'
    }

    if (!formData.color) {
      newErrors.color = 'Selecciona un color'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const categoryData = {
        nombre: formData.nombre.trim(),
        icono: formData.icono,
        color: formData.color,
        activo: formData.activo ? 1 : 0
      }

      let result
      if (selectedCategory) {
        result = await categoriesService.updateCategory(selectedCategory.id, categoryData)
      } else {
        result = await categoriesService.createCategory(categoryData)
      }

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: selectedCategory ? '¡Categoría Actualizada!' : '¡Categoría Creada!',
          text: result.message,
          confirmButtonColor: '#f59e0b',
          timer: 2000
        })

        handleCloseModal()
        loadCategories()
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
        text: 'Error al guardar la categoría'
      })
    }
  }

  const handleDelete = (category) => {
    setSelectedCategory(category)
    setShowConfirm(true)
  }

  const confirmDelete = async () => {
    try {
      const result = await categoriesService.deleteCategory(selectedCategory.id)

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Categoría Eliminada!',
          text: result.message,
          confirmButtonColor: '#f59e0b',
          timer: 2000
        })
        loadCategories()
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
        text: 'Error al eliminar la categoría'
      })
    }

    setShowConfirm(false)
    setSelectedCategory(null)
  }

  const handleToggleStatus = async (category) => {
    try {
      const result = await categoriesService.updateCategory(category.id, {
        activo: category.activo === 1 ? 0 : 1
      })

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Estado Actualizado',
          text: `La categoría ahora está ${category.activo === 1 ? 'inactiva' : 'activa'}`,
          confirmButtonColor: '#f59e0b',
          timer: 2000
        })
        loadCategories()
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cambiar el estado'
      })
    }
  }

  // Drag & Drop handlers
  const handleDragStart = (e, category) => {
    setDraggedItem(category)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, targetCategory) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem.id === targetCategory.id) {
      setDraggedItem(null)
      return
    }

    // Reordenar localmente
    const newCategories = [...categories]
    const draggedIndex = newCategories.findIndex(c => c.id === draggedItem.id)
    const targetIndex = newCategories.findIndex(c => c.id === targetCategory.id)

    newCategories.splice(draggedIndex, 1)
    newCategories.splice(targetIndex, 0, draggedItem)

    // Actualizar orden local
    const updatedCategories = newCategories.map((cat, index) => ({
      ...cat,
      orden: index + 1
    }))

    setCategories(updatedCategories)

    // Actualizar en backend
    try {
      await categoriesService.updateOrder(draggedItem.id, targetIndex + 1)
    } catch (error) {
      console.error('Error updating order:', error)
      loadCategories() // Recargar si falla
    }

    setDraggedItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  if (loading) {
    return (
      <div className="categories-loading">
        <div className="spinner-large"></div>
        <p>Cargando categorías...</p>
      </div>
    )
  }

  // CONTINÚA DESDE CategoriesPage_Part1.jsx
// Reemplaza el comentario "Continúa en Parte 2..." con esto:

return (
    <div className="categories-page">
      {/* Header */}
      <div className="categories-header">
        <div>
          <h1 className="page-title">
            <FiGrid />
            Gestión de Categorías
          </h1>
          <p className="page-subtitle">Organiza y personaliza tus categorías de productos</p>
        </div>

        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FiPlus />
          Nueva Categoría
        </button>
      </div>

      {/* Stats */}
      <div className="categories-stats">
        <div className="stat-card">
          <div className="stat-icon primary">
            <FiGrid />
          </div>
          <div className="stat-content">
            <div className="stat-value">{categories.length}</div>
            <div className="stat-label">Total Categorías</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <FiEye />
          </div>
          <div className="stat-content">
            <div className="stat-value">{categories.filter(c => c.activo === 1).length}</div>
            <div className="stat-label">Activas</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <FiPackage />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {categories.reduce((sum, c) => sum + parseInt(c.total_productos || 0), 0)}
            </div>
            <div className="stat-label">Total Productos</div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="drag-drop-info">
        <FiMove />
        <span>Arrastra y suelta las categorías para reordenarlas</span>
      </div>

      {/* Categories Grid */}
      <div className="categories-grid">
        {categories.map(category => (
          <div
            key={category.id}
            className={`category-card ${category.activo === 0 ? 'inactive' : ''} ${
              draggedItem?.id === category.id ? 'dragging' : ''
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, category)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, category)}
            onDragEnd={handleDragEnd}
          >
            <div className="category-drag-handle">
              <FiMove />
            </div>

            <div 
              className="category-color-bar" 
              style={{ backgroundColor: category.color }}
            ></div>

            <div className="category-icon" style={{ color: category.color }}>
              {category.icono}
            </div>

            <div className="category-info">
              <h3 className="category-name">{category.nombre}</h3>
              <div className="category-meta">
                <span className="category-products">
                  <FiPackage />
                  {category.total_productos || 0} producto(s)
                </span>
                <span 
                  className="category-color-badge"
                  style={{ 
                    backgroundColor: `${category.color}20`,
                    color: category.color,
                    border: `2px solid ${category.color}`
                  }}
                >
                  {category.color}
                </span>
              </div>
            </div>

            <div className="category-actions">
              <button
                className={`status-toggle ${category.activo === 1 ? 'active' : 'inactive'}`}
                onClick={() => handleToggleStatus(category)}
                title={category.activo === 1 ? 'Desactivar' : 'Activar'}
              >
                {category.activo === 1 ? <FiEye /> : <FiEyeOff />}
              </button>

              <button
                className="btn-icon primary"
                onClick={() => handleOpenModal(category)}
                title="Editar"
              >
                <FiEdit2 />
              </button>

              <button
                className="btn-icon danger"
                onClick={() => handleDelete(category)}
                title="Eliminar"
                disabled={parseInt(category.total_productos) > 0}
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No hay categorías</h3>
          <p>Crea tu primera categoría para organizar tus productos</p>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <FiPlus />
            Crear Categoría
          </button>
        </div>
      )}

      {/* Modal Create/Edit */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        size="small"
      >
        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input
              type="text"
              name="nombre"
              className={`form-input ${errors.nombre ? 'error' : ''}`}
              placeholder="Ej: Bebidas, Snacks, Postres..."
              value={formData.nombre}
              onChange={handleChange}
              autoFocus
            />
            {errors.nombre && <span className="form-error">{errors.nombre}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Icono *</label>
              <div className="icon-picker">
                <button
                  type="button"
                  className="icon-preview"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <span className="icon-large">{formData.icono}</span>
                  <span className="icon-label">Cambiar</span>
                </button>
                
                {showEmojiPicker && (
                  <div className="emoji-picker">
                    <div className="emoji-grid">
                      {EMOJI_LIST.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          className={`emoji-option ${formData.icono === emoji ? 'selected' : ''}`}
                          onClick={() => handleEmojiSelect(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {errors.icono && <span className="form-error">{errors.icono}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Color *</label>
              <div className="color-picker">
                <input
                  type="color"
                  name="color"
                  className="color-input"
                  value={formData.color}
                  onChange={handleChange}
                />
                <div className="color-presets">
                  {COLOR_PRESETS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-preset ${formData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              {errors.color && <span className="form-error">{errors.color}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
              />
              <span>Categoría activa</span>
            </label>
          </div>

          <div className="form-preview">
            <div className="preview-label">Vista Previa:</div>
            <div 
              className="preview-card"
              style={{ borderColor: formData.color }}
            >
              <div 
                className="preview-icon" 
                style={{ color: formData.color }}
              >
                {formData.icono}
              </div>
              <div className="preview-name">{formData.nombre || 'Nombre de categoría'}</div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleCloseModal}
            >
              <FiX />
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <FiSave />
              {selectedCategory ? 'Actualizar' : 'Crear'} Categoría
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Eliminar Categoría"
        message={`¿Estás seguro de eliminar la categoría "${selectedCategory?.nombre}"? Esta acción no se puede deshacer.`}
        type="danger"
      />
    </div>
  )
}

export default CategoriesPage