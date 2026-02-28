import React, { useState, useEffect } from 'react'
import {
  FiShoppingBag,
  FiPlus,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiPackage,
  FiCalendar,
  FiDollarSign,
  FiCheck,
  FiX,
  FiSearch,
  FiFilter,
  FiTruck,
  FiFileText,
  FiClock ,
  FiAlertCircle 
} from 'react-icons/fi'
import purchasesService from '../../../services/snacks/purchasesService'
import suppliersService from '../../../services/snacks/suppliersService'
import { snacksProductsService } from '../../../services/snacks/productsService'
import Modal from '../../../components/common/Modal'
import ConfirmDialog from '../../../components/common/ConfirmDialog'
import Swal from 'sweetalert2'
import './PurchasesPage.css'

const ESTADOS = [
  { value: 'PENDIENTE', label: 'Pendiente', color: '#f59e0b' },
  { value: 'RECIBIDA', label: 'Recibida', color: '#10b981' },
  { value: 'PARCIAL', label: 'Parcial', color: '#3b82f6' },
  { value: 'CANCELADA', label: 'Cancelada', color: '#ef4444' }
]

const TIPOS_COMPROBANTE = [
  { value: 'FACTURA', label: 'Factura' },
  { value: 'BOLETA', label: 'Boleta' },
  { value: 'TICKET', label: 'Ticket' },
  { value: 'NOTA_DEBITO', label: 'Nota de Débito' },
  { value: 'NOTA_CREDITO', label: 'Nota de Crédito' }
]

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState(null)
  const [dateRange, setDateRange] = useState({
    desde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0]
  })
  const [filterSupplier, setFilterSupplier] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [formData, setFormData] = useState({
    proveedor_id: '',
    fecha_compra: new Date().toISOString().split('T')[0],
    tipo_comprobante: 'FACTURA',
    numero_comprobante: '',
    estado: 'PENDIENTE',
    fecha_pago: '',
    metodo_pago: '',
    observaciones: '',
    actualizar_precio: false,
    items: []
  })
  const [currentItem, setCurrentItem] = useState({
    producto_id: '',
    cantidad: '',
    precio_compra: ''
  })
  const [errors, setErrors] = useState({})




  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'S/ 0.00'
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(amount)
  }
  
  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }




   // Función para ver detalle de compra
   const handleViewDetail = async (purchase) => {
    try {
      const result = await purchasesService.getPurchaseById(purchase.id)
      if (result.success) {
        setSelectedPurchase(result.data) // ✅ Debe incluir los items
        setShowDetailModal(true)
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar detalle'
      })
    }
  }

  // Función para eliminar compra
  const handleDelete = (purchase) => {
    setSelectedPurchase(purchase)
    setShowConfirm(true)
  }

  // Función para confirmar eliminación
  const confirmDelete = async () => {
    if (!selectedPurchase) return

    try {
      const result = await purchasesService.deletePurchase(selectedPurchase.id)
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Compra Eliminada!',
          text: `La compra ${selectedPurchase.numero_compra} ha sido eliminada correctamente`,
          confirmButtonColor: '#f59e0b',
          timer: 3000
        })
        
        setShowConfirm(false)
        loadPurchases()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'No se pudo eliminar la compra'
        })
      }
    } catch (error) {
      console.error('Error deleting purchase:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al eliminar la compra'
      })
    }
  }

  // Función para actualizar estado de compra
  const handleUpdateStatus = async (purchase, newStatus) => {
    try {
      const result = await purchasesService.updatePurchaseStatus(purchase.id, newStatus)
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Estado Actualizado!',
          text: `La compra ha sido marcada como ${newStatus === 'RECIBIDA' ? 'recibida' : newStatus.toLowerCase()}`,
          confirmButtonColor: '#f59e0b',
          timer: 3000
        })
        
        loadPurchases()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'No se pudo actualizar el estado'
        })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al actualizar el estado'
      })
    }
  }



  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadPurchases()
  }, [dateRange, filterSupplier, filterStatus])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [suppliersResult, productsResult] = await Promise.all([
        suppliersService.getSuppliers(false),
        snacksProductsService.getProducts()
      ])
  
      if (suppliersResult.success) {
        setSuppliers(suppliersResult.data)
      }
  
      if (productsResult.success) {
        console.log('Products loaded:', productsResult.data)
        // ❌ ANTES: const activeProducts = productsResult.data.filter(p => p.activo === 1)
        // ✅ AHORA: Mostrar todos (incluso inactivos)
        setProducts(productsResult.data)
        console.log('Products set:', productsResult.data)
      }
  
      await loadPurchases()
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPurchases = async () => {
    try {
      const result = await purchasesService.getPurchases(
        dateRange.desde,
        dateRange.hasta,
        filterSupplier || null,
        filterStatus || null
      )

      if (result.success) {
        setPurchases(result.data)
      }
    } catch (error) {
      console.error('Error loading purchases:', error)
    }
  }

  const handleOpenModal = () => {
    setSelectedPurchase(null) // ✅ IMPORTANTE: Limpiar selección
    setFormData({
      proveedor_id: '',
      fecha_compra: new Date().toISOString().split('T')[0],
      tipo_comprobante: 'FACTURA',
      numero_comprobante: '',
      estado: 'PENDIENTE',
      fecha_pago: '',
      metodo_pago: '',
      observaciones: '',
      actualizar_precio: true,
      items: []
    })
    setCurrentItem({
      producto_id: '',
      cantidad: '',
      precio_compra: ''
    })
    setErrors({})
    setShowModal(true)
  }

  const loadPurchaseDetails = async (id) => {
    try {
      const result = await purchasesService.getPurchaseById(id)
      if (result.success) {
        const compra = result.data
        setFormData({
          proveedor_id: compra.proveedor_id,
          fecha_compra: compra.fecha_compra,
          tipo_comprobante: compra.tipo_comprobante,
          numero_comprobante: compra.numero_comprobante || '',
          estado: compra.estado,
          fecha_pago: compra.fecha_pago || '',
          metodo_pago: compra.metodo_pago || '',
          observaciones: compra.observaciones || '',
          actualizar_precio: false,
          items: compra.items || []
        })
      }
    } catch (error) {
      console.error('Error loading purchase details:', error)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedPurchase(null)
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

  const handleItemChange = (e) => {
    const { name, value } = e.target
    setCurrentItem(prev => ({
      ...prev,
      [name]: value
    }))
  
    // Auto-cargar precio de compra del producto
    if (name === 'producto_id' && value) {
      const product = products.find(p => p.id === parseInt(value))
      console.log('Selected product:', product) // ← DEBUG
      if (product && product.precio_compra) {
        setCurrentItem(prev => ({
          ...prev,
          precio_compra: product.precio_compra
        }))
      }
    }
  }

  const handleAddItem = () => {
    if (!currentItem.producto_id || !currentItem.cantidad || !currentItem.precio_compra) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Complete todos los campos del producto',
        confirmButtonColor: '#f59e0b'
      })
      return
    }

    const product = products.find(p => p.id === parseInt(currentItem.producto_id))
    
    // Verificar si el producto ya existe
    const existingIndex = formData.items.findIndex(
      item => item.producto_id === parseInt(currentItem.producto_id)
    )

    if (existingIndex >= 0) {
      // Actualizar cantidad
      const newItems = [...formData.items]
      newItems[existingIndex].cantidad = parseFloat(currentItem.cantidad)
      newItems[existingIndex].precio_compra = parseFloat(currentItem.precio_compra)
      setFormData(prev => ({ ...prev, items: newItems }))
    } else {
      // Agregar nuevo item
      setFormData(prev => ({
        ...prev,
        items: [
          ...prev.items,
          {
            producto_id: parseInt(currentItem.producto_id),
            producto: product.nombre,
            producto_codigo: product.codigo,
            cantidad: parseFloat(currentItem.cantidad),
            precio_compra: parseFloat(currentItem.precio_compra)
          }
        ]
      }))
    }

    // Limpiar formulario de item
    setCurrentItem({
      producto_id: '',
      cantidad: '',
      precio_compra: ''
    })
  }

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const calculateTotal = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + (item.cantidad * item.precio_compra),
      0
    )
    const igv = subtotal * 0.18
    const total = subtotal + igv
    return { subtotal, igv, total }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.proveedor_id) {
      newErrors.proveedor_id = 'Selecciona un proveedor'
    }

    if (!formData.fecha_compra) {
      newErrors.fecha_compra = 'Selecciona una fecha'
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Agrega al menos un producto'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log('Selected Purchase:', selectedPurchase) // ← DEBUG
  console.log('Form Data:', formData) // ← DEBUG
  
    if (!validateForm()) return
  
    try {
      const purchaseData = {
        ...formData,
        items: formData.items.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_compra: item.precio_compra
        }))
      }
  
      let result
      // ✅ ASEGÚRATE DE QUE ESTA CONDICIÓN SEA CORRECTA
      if (selectedPurchase && selectedPurchase.id) {
        // ACTUALIZAR compra existente
        result = await purchasesService.updatePurchase(selectedPurchase.id, purchaseData)
      } else {
        // CREAR nueva compra
        result = await purchasesService.createPurchase(purchaseData)
      }
  
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: selectedPurchase ? '¡Compra Actualizada!' : '¡Compra Registrada!',
          html: `
            <div style="text-align: left;">
              <p><strong>Número:</strong> ${result.data.numero_compra}</p>
              <p><strong>Total:</strong> S/ ${calculateTotal().total.toFixed(2)}</p>
            </div>
          `,
          confirmButtonColor: '#3b82f6',
          timer: 3000
        })
  
        handleCloseModal()
        loadPurchases()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message
        })
      }
    } catch (error) {
      console.error('Error submitting purchase:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar la compra'
      })
    }
  }

 
const totals = calculateTotal()

return (
  <div className="purchases-page">
    {/* Header */}
    <div className="purchases-header">
      <div>
        <h1 className="page-title">
          <FiShoppingBag />
          Gestión de Compras
        </h1>
        <p className="page-subtitle">Registra compras y actualiza inventario</p>
      </div>

      <button className="btn btn-primary" onClick={handleOpenModal}>
        <FiPlus />
        Nueva Compra
      </button>
    </div>

    {/* Stats */}
    <div className="purchases-stats">
      <div className="stat-card primary">
        <div className="stat-icon">
          <FiShoppingBag />
        </div>
        <div className="stat-content">
          <div className="stat-value">{purchases.length}</div>
          <div className="stat-label">Total Compras</div>
        </div>
      </div>

      <div className="stat-card success">
        <div className="stat-icon">
          <FiCheck />
        </div>
        <div className="stat-content">
          <div className="stat-value">
            {purchases.filter(p => p.estado === 'RECIBIDA').length}
          </div>
          <div className="stat-label">Recibidas</div>
        </div>
      </div>

      <div className="stat-card warning">
        <div className="stat-icon">
          <FiClock />
        </div>
        <div className="stat-content">
          <div className="stat-value">
            {purchases.filter(p => p.estado === 'PENDIENTE').length}
          </div>
          <div className="stat-label">Pendientes</div>
        </div>
      </div>

      <div className="stat-card info">
        <div className="stat-icon">
          <FiDollarSign />
        </div>
        <div className="stat-content">
          <div className="stat-value">
            {formatCurrency(purchases.reduce((sum, p) => sum + parseFloat(p.total || 0), 0))}
          </div>
          <div className="stat-label">Total Invertido</div>
        </div>
      </div>
    </div>

    {/* Filters */}
    <div className="purchases-filters">
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
        <FiTruck />
        <select value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)}>
          <option value="">Todos los proveedores</option>
          {suppliers.map(supplier => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.razon_social}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-select">
        <FiFilter />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(estado => (
            <option key={estado.value} value={estado.value}>
              {estado.label}
            </option>
          ))}
        </select>
      </div>
    </div>

    {/* Purchases Table */}
    <div className="purchases-table-container">
      <table className="purchases-table">
        <thead>
          <tr>
            <th>Número</th>
            <th>Fecha</th>
            <th>Proveedor</th>
            <th>Comprobante</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map(purchase => (
            <tr key={purchase.id}>
              <td className="code">{purchase.numero_compra}</td>
              <td>{formatDate(purchase.fecha_compra)}</td>
              <td>
                <div className="supplier-cell">
                  <strong>{purchase.proveedor}</strong>
                  <small>{purchase.proveedor_codigo}</small>
                </div>
              </td>
              <td>
                {purchase.tipo_comprobante}
                {purchase.numero_comprobante && (
                  <span className="comprobante-num"> {purchase.numero_comprobante}</span>
                )}
              </td>
              <td className="amount">{formatCurrency(purchase.total)}</td>
              <td>
  <span 
    className={`status-badge ${purchase.estado ? purchase.estado.toLowerCase() : ''}`}
    style={{ 
      backgroundColor: `${ESTADOS.find(e => e.value === purchase.estado)?.color}20`,
      color: ESTADOS.find(e => e.value === purchase.estado)?.color
    }}
  >
    {ESTADOS.find(e => e.value === purchase.estado)?.label || purchase.estado || 'Sin estado'}
  </span>
</td>
              <td>
                <div className="table-actions">
                  <button
                    className="btn-icon info"
                    onClick={() => handleViewDetail(purchase)}
                    title="Ver detalle"
                  >
                    <FiEye />
                  </button>

                  {purchase.estado === 'PENDIENTE' && (
                    <button
                      className="btn-icon success"
                      onClick={() => handleUpdateStatus(purchase, 'RECIBIDA')}
                      title="Marcar como recibida"
                    >
                      <FiCheck />
                    </button>
                  )}

                  {purchase.estado !== 'RECIBIDA' && (
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDelete(purchase)}
                      title="Eliminar"
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

      {purchases.length === 0 && (
        <div className="empty-state">
          <FiShoppingBag />
          <p>No hay compras en el período seleccionado</p>
        </div>
      )}
    </div>

   



      {/* Modal Nueva Compra */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Nueva Compra"
        size="large"
      >
        <form onSubmit={handleSubmit} className="purchase-form">
          {/* Información General */}
          <div className="form-section">
            <h3 className="section-title">Información General</h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Proveedor *</label>
                <select
                  name="proveedor_id"
                  className={`form-input ${errors.proveedor_id ? 'error' : ''}`}
                  value={formData.proveedor_id}
                  onChange={handleChange}
                  autoFocus
                >
                  <option value="">Seleccionar proveedor</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.razon_social}
                    </option>
                  ))}
                </select>
                {errors.proveedor_id && (
                  <span className="form-error">{errors.proveedor_id}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Fecha de Compra *</label>
                <input
                  type="date"
                  name="fecha_compra"
                  className={`form-input ${errors.fecha_compra ? 'error' : ''}`}
                  value={formData.fecha_compra}
                  onChange={handleChange}
                />
                {errors.fecha_compra && (
                  <span className="form-error">{errors.fecha_compra}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tipo de Comprobante</label>
                <select
                  name="tipo_comprobante"
                  className="form-input"
                  value={formData.tipo_comprobante}
                  onChange={handleChange}
                >
                  {TIPOS_COMPROBANTE.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Número de Comprobante</label>
                <input
                  type="text"
                  name="numero_comprobante"
                  className="form-input"
                  placeholder="001-0001234"
                  value={formData.numero_comprobante}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select
                  name="estado"
                  className="form-input"
                  value={formData.estado}
                  onChange={handleChange}
                >
                  {ESTADOS.map(estado => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
                <small className="form-hint">
                  {formData.estado === 'RECIBIDA' && '⚠️ Se actualizará el stock automáticamente'}
                </small>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="actualizar_precio"
                    checked={formData.actualizar_precio}
                    onChange={handleChange}
                  />
                  <span>Actualizar precios de compra</span>
                </label>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="form-section">
            <h3 className="section-title">Productos</h3>

            <div className="add-item-form">
              <div className="item-form-row">
                <div className="form-group">
                <select
  name="producto_id"
  className="form-input"
  value={currentItem.producto_id}
  onChange={handleItemChange}
>
  <option value="">Seleccionar producto</option>
  {products.map(product => (
    <option key={product.id} value={product.id}>
      {product.codigo} - {product.nombre}
    </option>
  ))}
</select>
                </div>

                <div className="form-group">
                  <input
                    type="number"
                    name="cantidad"
                    className="form-input"
                    placeholder="Cantidad"
                    min="0.01"
                    step="0.01"
                    value={currentItem.cantidad}
                    onChange={handleItemChange}
                  />
                </div>

                <div className="form-group">
                  <input
                    type="number"
                    name="precio_compra"
                    className="form-input"
                    placeholder="Precio S/"
                    min="0.01"
                    step="0.01"
                    value={currentItem.precio_compra}
                    onChange={handleItemChange}
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleAddItem}
                >
                  <FiPlus />
                  Agregar
                </button>
              </div>
            </div>

            {errors.items && (
              <div className="form-error-banner">
                <FiAlertCircle />
                {errors.items}
              </div>
            )}

            {/* Lista de items */}
            <div className="items-list">
              {formData.items.map((item, index) => (
                <div key={index} className="item-row">
                  <div className="item-info">
                    <div className="item-code">{item.producto_codigo}</div>
                    <div className="item-name">{item.producto_nombre}</div>
                  </div>
                  <div className="item-qty">
                    {item.cantidad} unid.
                  </div>
                  <div className="item-price">
                    {formatCurrency(item.precio_compra)}
                  </div>
                  <div className="item-subtotal">
                    {formatCurrency(item.subtotal)}
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <FiX />
                  </button>
                </div>
              ))}

              {formData.items.length === 0 && (
                <div className="empty-items">
                  <FiPackage />
                  <p>No hay productos agregados</p>
                </div>
              )}
            </div>

            {/* Totales */}
            {formData.items.length > 0 && (
              <div className="totals-summary">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <strong>{formatCurrency(totals.subtotal)}</strong>
                </div>
                <div className="total-row">
                  <span>IGV (18%):</span>
                  <strong>{formatCurrency(totals.igv)}</strong>
                </div>
                <div className="total-row grand-total">
                  <span>TOTAL:</span>
                  <strong>{formatCurrency(totals.total)}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div className="form-section">
            <h3 className="section-title">Observaciones</h3>
            <textarea
              name="observaciones"
              className="form-input"
              placeholder="Notas adicionales sobre la compra..."
              rows="3"
              value={formData.observaciones}
              onChange={handleChange}
            />
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
              <FiCheck />
              Registrar Compra
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detalle */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detalle de Compra"
        size="large"
      >
       
       
       
       
       
       
       
       {selectedPurchase && (
  <div className="purchase-detail">
    <div className="detail-header">
      <div className="detail-info">
        <h2>{selectedPurchase.numero_compra || 'N/A'}</h2>
        <span 
          className={`status-badge ${selectedPurchase?.estado ? selectedPurchase.estado.toLowerCase() : 'sin-estado'}`}
          style={{ 
            backgroundColor: `${ESTADOS.find(e => e.value === selectedPurchase?.estado)?.color}20`,
            color: ESTADOS.find(e => e.value === selectedPurchase?.estado)?.color || '#6b7280'
          }}
        >
          {ESTADOS.find(e => e.value === selectedPurchase?.estado)?.label || selectedPurchase?.estado || 'Sin estado'}
        </span>
      </div>
      <div className="detail-amount">
        <div className="amount-label">Total</div>
        <div className="amount-value">{formatCurrency(selectedPurchase?.total)}</div>
      </div>
    </div>

    <div className="detail-grid">
      <div className="detail-item">
        <label>Proveedor:</label>
        <span>{selectedPurchase.proveedor || 'No especificado'}</span>
      </div>
      <div className="detail-item">
        <label>Fecha:</label>
        <span>{formatDate(selectedPurchase.fecha_compra)}</span>
      </div>
      <div className="detail-item">
        <label>Comprobante:</label>
        <span>{selectedPurchase.tipo_comprobante || 'SIN COMPROBANTE'} {selectedPurchase.numero_comprobante || ''}</span>
      </div>
      <div className="detail-item">
        <label>Usuario:</label>
        <span>{selectedPurchase.usuario || 'No especificado'}</span>
      </div>
    </div>

   
    <div className="detail-items">
  <h3>Productos</h3>
  {selectedPurchase.items && selectedPurchase.items.length > 0 ? (
    <table className="detail-table">
      <thead>
        <tr>
          <th>Código</th>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        {selectedPurchase.items.map((item, index) => (
          <tr key={index}>
            <td className="code">{item.producto_codigo}</td>
            <td>{item.producto}</td>
            <td className="text-center">{item.cantidad}</td>
            <td className="text-right">{formatCurrency(item.precio_compra)}</td>
            <td className="text-right">{formatCurrency(item.subtotal)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <div className="empty-items">
      <FiPackage />
      <p>No hay productos en esta compra</p>
    </div>
  )}
</div>

{selectedPurchase.observaciones && (
  <div className="detail-notes">
    <h3>Observaciones</h3>
    <p>{selectedPurchase.observaciones}</p>
  </div>
)}


    <div className="detail-totals">
      <div className="total-row">
        <span>Subtotal:</span>
        <strong>{formatCurrency(selectedPurchase.subtotal)}</strong>
      </div>
      <div className="total-row">
        <span>IGV:</span>
        <strong>{formatCurrency(selectedPurchase.igv)}</strong>
      </div>
      <div className="total-row grand-total">
        <span>TOTAL:</span>
        <strong>{formatCurrency(selectedPurchase.total)}</strong>
      </div>
    </div>

    
  </div>
)}








      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Eliminar Compra"
        message={`¿Estás seguro de eliminar la compra "${selectedPurchase?.numero_compra}"? Esta acción no se puede deshacer.`}
        type="danger"
      />




   
  </div>


)
}

export default PurchasesPage