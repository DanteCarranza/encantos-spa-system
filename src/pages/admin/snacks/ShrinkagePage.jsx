import React, { useState, useEffect } from 'react'
import {
  FiAlertTriangle,
  FiPlus,
  FiTrash2,
  FiEye,
  FiCalendar,
  FiPackage,
  FiDollarSign,
  FiTrendingDown,
  FiFilter,
  FiX,
  FiCheck
} from 'react-icons/fi'
import shrinkageService from '../../../services/snacks/shrinkageService'
import { snacksProductsService } from '../../../services/snacks/productsService'
import Modal from '../../../components/common/Modal'
import ConfirmDialog from '../../../components/common/ConfirmDialog'
import Swal from 'sweetalert2'
import './ShrinkagePage.css'

const ShrinkagePage = () => {
  const [shrinkages, setShrinkages] = useState([])
  const [adjustmentTypes, setAdjustmentTypes] = useState([])
  const [products, setProducts] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedShrinkage, setSelectedShrinkage] = useState(null)
  const [dateRange, setDateRange] = useState({
    desde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0]
  })
  const [filterType, setFilterType] = useState('')
  const [filterProduct, setFilterProduct] = useState('')
  const [formData, setFormData] = useState({
    tipo_ajuste_id: '',
    producto_id: '',
    cantidad: '',
    motivo: '',
    fecha_ajuste: new Date().toISOString().split('T')[0],
    fecha_vencimiento: '',
    observaciones: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadShrinkages()
    loadSummary()
  }, [dateRange, filterType, filterProduct])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [typesResult, productsResult] = await Promise.all([
        shrinkageService.getAdjustmentTypes(),
        snacksProductsService.getProducts()
      ])

      if (typesResult.success) {
        setAdjustmentTypes(typesResult.data)
      }

      if (productsResult.success) {
        setProducts(productsResult.data)
      }

      await loadShrinkages()
      await loadSummary()
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadShrinkages = async () => {
    try {
      const result = await shrinkageService.getShrinkage(
        dateRange.desde,
        dateRange.hasta,
        filterType || null,
        filterProduct || null
      )

      if (result.success) {
        setShrinkages(result.data)
      }
    } catch (error) {
      console.error('Error loading shrinkages:', error)
    }
  }

  const loadSummary = async () => {
    try {
      const result = await shrinkageService.getSummary(
        dateRange.desde,
        dateRange.hasta
      )

      if (result.success) {
        setSummary(result.data)
      }
    } catch (error) {
      console.error('Error loading summary:', error)
    }
  }

  const handleOpenModal = () => {
    setFormData({
      tipo_ajuste_id: '',
      producto_id: '',
      cantidad: '',
      motivo: '',
      fecha_ajuste: new Date().toISOString().split('T')[0],
      fecha_vencimiento: '',
      observaciones: ''
    })
    setErrors({})
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setErrors({})
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Si selecciona "Vencido", mostrar campo de fecha de vencimiento
    if (name === 'tipo_ajuste_id') {
      const selectedType = adjustmentTypes.find(t => t.id === parseInt(value))
      if (selectedType?.codigo === 'VENCIDO') {
        // Auto-set fecha vencimiento a hoy si está vacía
        if (!formData.fecha_vencimiento) {
          setFormData(prev => ({
            ...prev,
            fecha_vencimiento: new Date().toISOString().split('T')[0]
          }))
        }
      }
    }

    // Auto-cargar stock actual del producto
    if (name === 'producto_id' && value) {
      const product = products.find(p => p.id === parseInt(value))
      if (product) {
        console.log('Stock disponible:', product.stock_actual)
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.tipo_ajuste_id) {
      newErrors.tipo_ajuste_id = 'Selecciona el tipo de ajuste'
    }

    if (!formData.producto_id) {
      newErrors.producto_id = 'Selecciona un producto'
    }

    if (!formData.cantidad || parseFloat(formData.cantidad) <= 0) {
      newErrors.cantidad = 'Ingresa una cantidad válida'
    }

    // Validar stock disponible para mermas
    if (formData.producto_id && formData.cantidad) {
      const product = products.find(p => p.id === parseInt(formData.producto_id))
      const selectedType = adjustmentTypes.find(t => t.id === parseInt(formData.tipo_ajuste_id))
      
      if (product && selectedType) {
        if (selectedType.tipo === 'MERMA' || selectedType.tipo === 'AJUSTE_NEGATIVO') {
          if (parseFloat(formData.cantidad) > product.stock_actual) {
            newErrors.cantidad = `Stock insuficiente. Disponible: ${product.stock_actual}`
          }
        }
      }
    }

    if (!formData.motivo?.trim()) {
      newErrors.motivo = 'El motivo es obligatorio'
    }

    if (!formData.fecha_ajuste) {
      newErrors.fecha_ajuste = 'Selecciona una fecha'
    }

    const selectedType = adjustmentTypes.find(t => t.id === parseInt(formData.tipo_ajuste_id))
    if (selectedType?.codigo === 'VENCIDO' && !formData.fecha_vencimiento) {
      newErrors.fecha_vencimiento = 'Ingresa la fecha de vencimiento'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const shrinkageData = {
        tipo_ajuste_id: parseInt(formData.tipo_ajuste_id),
        producto_id: parseInt(formData.producto_id),
        cantidad: parseFloat(formData.cantidad),
        motivo: formData.motivo.trim(),
        fecha_ajuste: formData.fecha_ajuste,
        fecha_vencimiento: formData.fecha_vencimiento || null,
        observaciones: formData.observaciones?.trim() || null
      }

      const result = await shrinkageService.createShrinkage(shrinkageData)

      if (result.success) {
        const selectedType = adjustmentTypes.find(t => t.id === parseInt(formData.tipo_ajuste_id))
        
        Swal.fire({
          icon: 'success',
          title: '¡Registro Exitoso!',
          html: `
            <div style="text-align: left;">
              <p><strong>Número:</strong> ${result.data.numero_ajuste}</p>
              <p><strong>Producto:</strong> ${result.data.producto_nombre}</p>
              <p><strong>Cantidad:</strong> ${result.data.cantidad}</p>
              <p><strong>Costo:</strong> S/ ${parseFloat(result.data.costo_total).toFixed(2)}</p>
            </div>
          `,
          confirmButtonColor: '#ef4444',
          timer: 3000
        })

        handleCloseModal()
        loadShrinkages()
        loadSummary()
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
        text: 'Error al registrar el ajuste'
      })
    }
  }

  const handleDelete = (shrinkage) => {
    setSelectedShrinkage(shrinkage)
    setShowConfirm(true)
  }

  const confirmDelete = async () => {
    try {
      const result = await shrinkageService.deleteShrinkage(selectedShrinkage.id)

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'El registro ha sido eliminado y el stock revertido',
          confirmButtonColor: '#ef4444',
          timer: 2000
        })
        loadShrinkages()
        loadSummary()
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
        text: 'Error al eliminar el registro'
      })
    }

    setShowConfirm(false)
    setSelectedShrinkage(null)
  }

  const formatCurrency = (amount) => {
    return `S/ ${parseFloat(amount || 0).toFixed(2)}`
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-PE')
  }

  const getTypeColor = (tipo) => {
    switch(tipo) {
      case 'MERMA':
        return '#ef4444'
      case 'AJUSTE_POSITIVO':
        return '#10b981'
      case 'AJUSTE_NEGATIVO':
        return '#f59e0b'
      default:
        return '#64748b'
    }
  }

  const getTypeIcon = (tipo) => {
    switch(tipo) {
      case 'MERMA':
        return <FiAlertTriangle />
      case 'AJUSTE_POSITIVO':
        return <FiPlus />
      case 'AJUSTE_NEGATIVO':
        return <FiTrendingDown />
      default:
        return <FiPackage />
    }
  }

  if (loading) {
    return (
      <div className="shrinkage-loading">
        <div className="spinner-large"></div>
        <p>Cargando registros...</p>
      </div>
    )
  }

 
return (
    <div className="shrinkage-page">
      {/* Header */}
      <div className="shrinkage-header">
        <div>
          <h1 className="page-title">
            <FiAlertTriangle />
            Control de Mermas y Ajustes
          </h1>
          <p className="page-subtitle">Registra pérdidas, productos vencidos y ajustes de inventario</p>
        </div>

        <button className="btn btn-danger" onClick={handleOpenModal}>
          <FiPlus />
          Registrar Ajuste
        </button>
      </div>

      {/* Summary Cards */}
      {summary && summary.length > 0 && (
        <div className="summary-grid">
          {summary.map((item, index) => (
            <div 
              key={index} 
              className="summary-card"
              style={{ borderColor: getTypeColor(item.tipo) }}
            >
              <div 
                className="summary-icon"
                style={{ color: getTypeColor(item.tipo) }}
              >
                {getTypeIcon(item.tipo)}
              </div>
              <div className="summary-content">
                <div className="summary-label">
                  {item.tipo === 'MERMA' ? 'Mermas' : 
                   item.tipo === 'AJUSTE_POSITIVO' ? 'Ajustes Positivos' : 
                   'Ajustes Negativos'}
                </div>
                <div className="summary-value">{item.total_registros} registros</div>
                <div className="summary-cost">{formatCurrency(item.total_costo)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="shrinkage-filters">
        <div className="date-range">
          <div className="date-input">
            <FiCalendar />
            <input
              type="date"
              value={dateRange.desde}
              onChange={(e) => setDateRange(prev => ({ ...prev, desde: e.target.value }))}
            />
          </div>
          <span>hasta</span>
          <div className="date-input">
            <FiCalendar />
            <input
              type="date"
              value={dateRange.hasta}
              onChange={(e) => setDateRange(prev => ({ ...prev, hasta: e.target.value }))}
            />
          </div>
        </div>

        <div className="filter-select">
          <FiFilter />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">Todos los tipos</option>
            {adjustmentTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-select">
          <FiPackage />
          <select value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)}>
            <option value="">Todos los productos</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.codigo} - {product.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="shrinkage-table-container">
        <table className="shrinkage-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Costo</th>
              <th>Motivo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {shrinkages.map(shrinkage => (
              <tr key={shrinkage.id}>
                <td className="code">{shrinkage.numero_ajuste}</td>
                <td>{formatDate(shrinkage.fecha_ajuste)}</td>
                <td>
                  <span 
                    className="type-badge"
                    style={{ 
                      backgroundColor: `${getTypeColor(shrinkage.tipo_ajuste_tipo)}20`,
                      color: getTypeColor(shrinkage.tipo_ajuste_tipo)
                    }}
                  >
                    {shrinkage.tipo_ajuste_nombre}
                  </span>
                </td>
                <td>
                  <div className="product-cell">
                    <strong>{shrinkage.producto_nombre}</strong>
                    <small>{shrinkage.producto_codigo}</small>
                  </div>
                </td>
                <td className="quantity">
                  {shrinkage.tipo_ajuste_tipo === 'AJUSTE_POSITIVO' ? '+' : '-'}
                  {shrinkage.cantidad}
                </td>
                <td className="amount">{formatCurrency(shrinkage.costo_total)}</td>
                <td>
                  <div className="motivo-cell">
                    {shrinkage.motivo}
                    {shrinkage.fecha_vencimiento && (
                      <small>Vencimiento: {formatDate(shrinkage.fecha_vencimiento)}</small>
                    )}
                  </div>
                </td>
                <td>
                  <div className="table-actions">
                    {formatDate(shrinkage.fecha_ajuste) === formatDate(new Date()) && (
                      <button
                        className="btn-icon danger"
                        onClick={() => handleDelete(shrinkage)}
                        title="Eliminar (solo hoy)"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {shrinkages.length === 0 && (
          <div className="empty-state">
            <FiAlertTriangle />
            <p>No hay registros en el período seleccionado</p>
          </div>
        )}
      </div>

    

      {/* Modal Registrar Ajuste */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Registrar Ajuste de Inventario"
        size="medium"
      >
        <form onSubmit={handleSubmit} className="shrinkage-form">
          <div className="form-section">
            <h3 className="section-title">Información del Ajuste</h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tipo de Ajuste *</label>
                <select
                  name="tipo_ajuste_id"
                  className={`form-input ${errors.tipo_ajuste_id ? 'error' : ''}`}
                  value={formData.tipo_ajuste_id}
                  onChange={handleChange}
                  autoFocus
                >
                  <option value="">Seleccionar tipo</option>
                  {adjustmentTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.nombre}
                    </option>
                  ))}
                </select>
                {errors.tipo_ajuste_id && (
                  <span className="form-error">{errors.tipo_ajuste_id}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Fecha *</label>
                <input
                  type="date"
                  name="fecha_ajuste"
                  className={`form-input ${errors.fecha_ajuste ? 'error' : ''}`}
                  value={formData.fecha_ajuste}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.fecha_ajuste && (
                  <span className="form-error">{errors.fecha_ajuste}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Producto *</label>
                <select
                  name="producto_id"
                  className={`form-input ${errors.producto_id ? 'error' : ''}`}
                  value={formData.producto_id}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar producto</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.codigo} - {product.nombre} (Stock: {product.stock_actual})
                    </option>
                  ))}
                </select>
                {errors.producto_id && (
                  <span className="form-error">{errors.producto_id}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Cantidad *</label>
                <input
                  type="number"
                  name="cantidad"
                  className={`form-input ${errors.cantidad ? 'error' : ''}`}
                  placeholder="0"
                  min="0.01"
                  step="0.01"
                  value={formData.cantidad}
                  onChange={handleChange}
                />
                {errors.cantidad && (
                  <span className="form-error">{errors.cantidad}</span>
                )}
                {formData.producto_id && formData.cantidad && (
                  <small className="form-hint">
                    Stock actual: {products.find(p => p.id === parseInt(formData.producto_id))?.stock_actual || 0}
                  </small>
                )}
              </div>
            </div>

            {adjustmentTypes.find(t => t.id === parseInt(formData.tipo_ajuste_id))?.codigo === 'VENCIDO' && (
              <div className="form-group">
                <label className="form-label">Fecha de Vencimiento *</label>
                <input
                  type="date"
                  name="fecha_vencimiento"
                  className={`form-input ${errors.fecha_vencimiento ? 'error' : ''}`}
                  value={formData.fecha_vencimiento}
                  onChange={handleChange}
                />
                {errors.fecha_vencimiento && (
                  <span className="form-error">{errors.fecha_vencimiento}</span>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Motivo *</label>
              <textarea
                name="motivo"
                className={`form-input ${errors.motivo ? 'error' : ''}`}
                placeholder="Describe el motivo del ajuste..."
                rows="3"
                value={formData.motivo}
                onChange={handleChange}
              />
              {errors.motivo && (
                <span className="form-error">{errors.motivo}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Observaciones</label>
              <textarea
                name="observaciones"
                className="form-input"
                placeholder="Información adicional (opcional)"
                rows="2"
                value={formData.observaciones}
                onChange={handleChange}
              />
            </div>

            {/* Preview */}
            {formData.producto_id && formData.cantidad && (
              <div className="adjustment-preview">
                <h4>Vista Previa del Ajuste</h4>
                {(() => {
                  const product = products.find(p => p.id === parseInt(formData.producto_id))
                  const adjustmentType = adjustmentTypes.find(t => t.id === parseInt(formData.tipo_ajuste_id))
                  const cantidad = parseFloat(formData.cantidad)
                  const stockActual = product?.stock_actual || 0
                  let stockNuevo = stockActual

                  if (adjustmentType?.tipo === 'MERMA' || adjustmentType?.tipo === 'AJUSTE_NEGATIVO') {
                    stockNuevo = stockActual - cantidad
                  } else if (adjustmentType?.tipo === 'AJUSTE_POSITIVO') {
                    stockNuevo = stockActual + cantidad
                  }

                  const costo = (product?.precio_compra || 0) * cantidad

                  return (
                    <>
                      <div className="preview-row">
                        <span>Producto:</span>
                        <strong>{product?.nombre}</strong>
                      </div>
                      <div className="preview-row">
                        <span>Stock Actual:</span>
                        <strong>{stockActual}</strong>
                      </div>
                      <div className="preview-row">
                        <span>Cantidad a ajustar:</span>
                        <strong className={adjustmentType?.tipo === 'AJUSTE_POSITIVO' ? 'positive' : 'negative'}>
                          {adjustmentType?.tipo === 'AJUSTE_POSITIVO' ? '+' : '-'}{cantidad}
                        </strong>
                      </div>
                      <div className="preview-row highlight">
                        <span>Stock Nuevo:</span>
                        <strong className={stockNuevo < 0 ? 'error' : ''}>{stockNuevo}</strong>
                      </div>
                      <div className="preview-row">
                        <span>Costo Total:</span>
                        <strong>{formatCurrency(costo)}</strong>
                      </div>
                    </>
                  )
                })()}
              </div>
            )}
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
            <button type="submit" className="btn btn-danger">
              <FiCheck />
              Registrar Ajuste
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Eliminar Registro"
        message={`¿Estás seguro de eliminar este registro? El stock será revertido.`}
        type="danger"
      />









    </div>
  )
}

export default ShrinkagePage