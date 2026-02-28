import React, { useState, useEffect } from 'react'
import {
  FiShoppingCart,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiSearch,
  FiDollarSign,
  FiCreditCard,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiPackage,
  FiGrid,    
  FiList 
} from 'react-icons/fi'
import snacksProductsService from '../../../services/snacks/productsService'
import salesService from '../../../services/snacks/salesService'
import Swal from 'sweetalert2'
import './POSPage.css'
import locationsService from '../../../services/snacks/locationsService'

const POSPage = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [cart, setCart] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [cashStatus, setCashStatus] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO')
  const [clientName, setClientName] = useState('')
  const [processingPayment, setProcessingPayment] = useState(false)
  const [operationNumber, setOperationNumber] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [viewMode, setViewMode] = useState('list') 
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)

  /*useEffect(() => {
    if (selectedLocation) {
      loadProductsByLocation()
    }
  }, [selectedLocation])

  useEffect(() => {
    if (selectedLocation) {
      loadProductsByLocation()
    }
  }, [selectedLocation])*/

  useEffect(() => {
    loadInitialData()
  }, [])
  
  // ← AGREGAR ESTE useEffect CON UNA BANDERA
  useEffect(() => {
    // Solo cargar productos si selectedLocation cambia DESPUÉS de la carga inicial
    if (selectedLocation && !loading) {
      loadProductsByLocation()
    }
  }, [selectedLocation])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [locationsResult, categoriesResult, cashResult] = await Promise.all([
        locationsService.getLocations(),
        snacksProductsService.getCategories(),
        salesService.getCashStatus()
      ])
  
      // Cargar ubicaciones
      if (locationsResult.success && locationsResult.data.length > 0) {
        setLocations(locationsResult.data)
        
        // Seleccionar ACADEMIA por defecto
        const defaultLocation = locationsResult.data.find(loc => loc.codigo === 'ACADEMIA')
        const locationId = defaultLocation ? defaultLocation.id : locationsResult.data[0].id
        
        setSelectedLocation(locationId)
        
        // ← CARGAR PRODUCTOS DE ESTA UBICACIÓN INMEDIATAMENTE
        const productsResult = await snacksProductsService.getProducts({ 
          activo: 1,
          ubicacion_id: locationId 
        })
        
        if (productsResult.success) {
          const availableProducts = productsResult.data.filter(p => p.stock_actual > 0)
          setProducts(availableProducts)
        }
      }
  
      // Cargar categorías
      if (categoriesResult.success) {
        setCategories(categoriesResult.data)
      }
  
      // Verificar estado de caja
      if (cashResult.success) {
        setCashStatus(cashResult.data)
        
        if (!cashResult.data.abierta) {
          showOpenCashDialog()
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar datos'
      })
    } finally {
      setLoading(false)
    }
  }



  const loadProductsByLocation = async () => {
    if (!selectedLocation) return
    
    try {
      // Opcional: mostrar indicador de carga
      const result = await snacksProductsService.getProducts({ 
        activo: 1,
        ubicacion_id: selectedLocation 
      })
  
      if (result.success) {
        const availableProducts = result.data.filter(p => p.stock_actual > 0)
        setProducts(availableProducts)
      }
    } catch (error) {
      console.error('Error loading products:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar productos de esta ubicación',
        confirmButtonColor: '#f59e0b'
      })
    }
  }

  const showOpenCashDialog = () => {
    Swal.fire({
      title: 'Apertura de Caja',
      text: 'Debes abrir la caja antes de realizar ventas',
      input: 'number',
      inputLabel: 'Monto Inicial (S/)',
      inputPlaceholder: '0.00',
      inputAttributes: {
        min: 0,
        step: 0.01
      },
      showCancelButton: true,
      confirmButtonText: 'Abrir Caja',
      confirmButtonColor: '#f59e0b',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      preConfirm: (monto) => {
        if (!monto || parseFloat(monto) < 0) {
          Swal.showValidationMessage('Ingresa un monto válido')
        }
        return monto
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await salesService.openCash(result.value)
        
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Caja Abierta!',
            text: `Monto inicial: S/ ${parseFloat(result.value).toFixed(2)}`,
            confirmButtonColor: '#f59e0b'
          })
          loadInitialData()
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.message
          })
        }
      }
    })
  }

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      if (existingItem.cantidad >= product.stock_actual) {
        Swal.fire({
          icon: 'warning',
          title: 'Stock Insuficiente',
          text: `Solo hay ${product.stock_actual} unidades disponibles`,
          confirmButtonColor: '#f59e0b'
        })
        return
      }
      
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        id: product.id,
        producto_id: product.id,
        nombre: product.nombre,
        precio_unitario: product.precio_venta,
        cantidad: 1,
        stock_disponible: product.stock_actual
      }])
    }
  }

  const updateQuantity = (productId, newQuantity) => {
    const item = cart.find(i => i.id === productId)
    
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    if (newQuantity > item.stock_disponible) {
      Swal.fire({
        icon: 'warning',
        title: 'Stock Insuficiente',
        text: `Solo hay ${item.stock_disponible} unidades disponibles`,
        confirmButtonColor: '#f59e0b'
      })
      return
    }
    
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, cantidad: newQuantity }
        : item
    ))
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const clearCart = () => {
    Swal.fire({
      title: '¿Limpiar carrito?',
      text: 'Se eliminarán todos los productos',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setCart([])
      }
    })
  }

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0)
  }

  const handleCheckout = () => {
    if (!cashStatus?.abierta) {
      Swal.fire({
        icon: 'error',
        title: 'Caja Cerrada',
        text: 'Debes abrir la caja antes de realizar ventas',
        confirmButtonColor: '#f59e0b'
      })
      return
    }

    if (cart.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Carrito Vacío',
        text: 'Agrega productos al carrito',
        confirmButtonColor: '#f59e0b'
      })
      return
    }

    setShowPaymentModal(true)
  }

  const processPayment = async () => {
    // Validar número de operación para tarjeta
    if (paymentMethod === 'TARJETA' && !cardNumber.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos Incompletos',
        text: 'Ingresa el número de operación de la tarjeta',
        confirmButtonColor: '#f59e0b'
      })
      return
    }
  
    setProcessingPayment(true)
  
    try {
      const saleData = {
        items: cart.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario
        })),
        metodo_pago: paymentMethod,
  numero_operacion: paymentMethod === 'TARJETA' ? cardNumber.trim() : 
                    paymentMethod === 'YAPE_PLIN' && operationNumber ? operationNumber.trim() : null,
  cliente_nombre: clientName.trim() || null,
  ubicacion_id: selectedLocation,
  observaciones: null,
  descuento: 0
      }
  
      const result = await salesService.createSale(saleData)
  
      if (result.success) {
        setShowPaymentModal(false)
        
        Swal.fire({
          icon: 'success',
          title: '¡Venta Exitosa!',
          html: `
  <div style="text-align: left;">
    <p><strong>Número:</strong> ${result.data.numero_venta}</p>
    <p><strong>Total:</strong> S/ ${result.data.total.toFixed(2)}</p>
    <p><strong>Método:</strong> ${paymentMethod === 'YAPE_PLIN' ? 'Yape/Plin' : paymentMethod === 'TARJETA' ? 'Tarjeta' : 'Efectivo'}</p>
    ${clientName ? `<p><strong>Cliente:</strong> ${clientName}</p>` : ''}
    ${cardNumber ? `<p><strong>Tarjeta:</strong> **** ${cardNumber}</p>` : ''}
    ${operationNumber ? `<p><strong>Operación:</strong> ${operationNumber}</p>` : ''}
  </div>
`,
          confirmButtonColor: '#f59e0b'
        })
  
        // Limpiar carrito y formulario
        setCart([])
setClientName('')
setOperationNumber('')
setCardNumber('')
setPaymentMethod('EFECTIVO')
        
        // Recargar productos (para actualizar stock)
        loadProductsByLocation() 
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'Error al procesar la venta'
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error de conexión al procesar la venta'
      })
    } finally {
      setProcessingPayment(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.categoria_id === parseInt(selectedCategory)
    
    return matchesSearch && matchesCategory
  })
  
  // ← AGREGAR ESTA LÓGICA DE PAGINACIÓN
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)
  
  // Resetear a página 1 cuando cambia la búsqueda o categoría
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, itemsPerPage])

  if (loading) {
    return (
      <div className="pos-loading">
        <div className="spinner-large"></div>
        <p>Cargando punto de venta...</p>
      </div>
    )
  }

  // CONTINÚA DESDE POSPage_Part1.jsx
// Reemplaza el final después de "if (loading)" con esto:

return (
    <div className="pos-page">
      {/* Status Bar */}
     {/* Status Bar */}
<div className="pos-status-bar">
  <div className="status-info">
    <FiShoppingCart />
    <span>Punto de Venta</span>
  </div>
  
  {/* ← NUEVO: Selector de ubicación */}
  <div className="location-selector">
    <label>Ubicación:</label>
    <select
      value={selectedLocation || ''}
      onChange={(e) => setSelectedLocation(parseInt(e.target.value))}
      className="location-select"
    >
      {locations.map(location => (
        <option key={location.id} value={location.id}>
          {location.nombre}
        </option>
      ))}
    </select>
  </div>
  
  <div className="cash-status">
    {cashStatus?.abierta ? (
      <div className="status-badge success">
        <FiCheck />
        Caja Abierta
      </div>
    ) : (
      <div className="status-badge danger">
        <FiAlertCircle />
        Caja Cerrada
      </div>
    )}
  </div>
</div>

      <div className="pos-container">
        {/* Products Section */}
        <div className="products-section">
          {/* Search and Filters */}
          <div className="pos-filters">
            <div className="search-box">
              <FiSearch />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icono} {cat.nombre}
                </option>
              ))}
            </select>


            <div className="view-toggle">
    <button
      className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
      onClick={() => setViewMode('list')}
      title="Vista de lista"
    >
      <FiList />
    </button>
    <button
      className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
      onClick={() => setViewMode('grid')}
      title="Vista de cuadrícula"
    >
      <FiGrid />
    </button>
    </div>




          </div>

          {/* Products Grid */}
          <div className={`products-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
  {viewMode === 'grid' ? (
    // VISTA DE CUADRÍCULA (actual con imágenes)
    paginatedProducts.map(product => (
      <div
        key={product.id}
        className="product-card"
        onClick={() => addToCart(product)}
      >
        {product.imagen_url ? (
          <img src={product.imagen_url} alt={product.nombre} className="product-image" />
        ) : (
          <div className="product-image-placeholder">
            <FiPackage />
          </div>
        )}
        <div className="product-info">
          <h3 className="product-name">{product.nombre}</h3>
          <div className="product-details">
            <span className="product-price">S/ {product.precio_venta.toFixed(2)}</span>
            <span className="product-stock">Stock: {product.stock_actual}</span>
          </div>
        </div>
        <button className="add-btn">
          <FiPlus />
        </button>
      </div>
    ))
  ) : (
    // VISTA DE LISTA (nueva, detallada)
    paginatedProducts.map(product => (
      <div
        key={product.id}
        className="product-list-item"
        onClick={() => addToCart(product)}
      >
        <div className="product-list-icon">
          {product.imagen_url ? (
            <img src={product.imagen_url} alt={product.nombre} />
          ) : (
            <FiPackage />
          )}
        </div>
        
        <div className="product-list-info">
          <div className="product-list-main">
            <h3 className="product-list-name">{product.nombre}</h3>
            <span className="product-list-code">{product.codigo}</span>
          </div>
          <div className="product-list-category">
            {product.categoria_nombre}
          </div>
        </div>
        
        <div className="product-list-stock">
          <span className="stock-label">Stock</span>
          <span className={`stock-value ${product.stock_actual <= 5 ? 'low' : ''}`}>
            {product.stock_actual}
          </span>
        </div>
        
        <div className="product-list-price">
          <span className="price-label">Precio</span>
          <span className="price-value">S/ {product.precio_venta.toFixed(2)}</span>
        </div>
        
        <button className="product-list-add-btn">
          <FiPlus />
          Agregar
        </button>
      </div>
    ))
  )}
</div>

{/* Paginación */}
{filteredProducts.length > 0 && (
  <div className="pagination-container">
    <div className="pagination-info">
      <span className="pagination-text">
        Mostrando {startIndex + 1} - {Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} productos
      </span>
      
      <div className="items-per-page">
        <label>Mostrar:</label>
        <select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="items-select"
        >
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>

    {totalPages > 1 && (
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          title="Primera página"
        >
          ««
        </button>
        
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          title="Anterior"
        >
          ‹
        </button>

        <div className="pagination-pages">
          {(() => {
            const pages = []
            const maxVisible = 5
            let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
            let endPage = Math.min(totalPages, startPage + maxVisible - 1)

            if (endPage - startPage < maxVisible - 1) {
              startPage = Math.max(1, endPage - maxVisible + 1)
            }

            if (startPage > 1) {
              pages.push(
                <button
                  key={1}
                  className="pagination-number"
                  onClick={() => setCurrentPage(1)}
                >
                  1
                </button>
              )
              if (startPage > 2) {
                pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>)
              }
            }

            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <button
                  key={i}
                  className={`pagination-number ${currentPage === i ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i)}
                >
                  {i}
                </button>
              )
            }

            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>)
              }
              pages.push(
                <button
                  key={totalPages}
                  className="pagination-number"
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </button>
              )
            }

            return pages
          })()}
        </div>

        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          title="Siguiente"
        >
          ›
        </button>

        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          title="Última página"
        >
          »»
        </button>
      </div>
    )}
  </div>
)}


          {filteredProducts.length === 0 && (
            <div className="empty-products">
              <FiPackage />
              <p>No se encontraron productos</p>
            </div>
          )}
        </div>

        {/* Cart Section */}
        <div className="cart-section">
          <div className="cart-header">
            <h2>
              <FiShoppingCart />
              Carrito ({cart.length})
            </h2>
            {cart.length > 0 && (
              <button className="clear-cart-btn" onClick={clearCart}>
                <FiTrash2 /> Limpiar
              </button>
            )}
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <FiShoppingCart />
                <p>Agrega productos al carrito</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <div className="item-name">{item.nombre}</div>
                    <div className="item-price">S/ {item.precio_unitario.toFixed(2)}</div>
                  </div>
                  
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                      >
                        <FiMinus />
                      </button>
                      <input
                        type="number"
                        className="qty-input"
                        value={item.cantidad}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                        min="0"
                        max={item.stock_disponible}
                      />
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                      >
                        <FiPlus />
                      </button>
                    </div>
                    
                    <div className="item-subtotal">
                      S/ {(item.precio_unitario * item.cantidad).toFixed(2)}
                    </div>
                    
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-summary">
            <div className="summary-row total">
              <span>TOTAL</span>
              <span className="total-amount">S/ {calculateTotal().toFixed(2)}</span>
            </div>
            
            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={cart.length === 0 || !cashStatus?.abierta}
            >
              <FiDollarSign />
              Procesar Pago
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
    {/* Payment Modal */}
{/* Payment Modal */}
{showPaymentModal && (
  <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
    <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>Procesar Pago</h2>
        <button
          className="modal-close"
          onClick={() => setShowPaymentModal(false)}
        >
          <FiX />
        </button>
      </div>

      <div className="modal-body">
        <div className="payment-summary">
          <div className="summary-item">
            <span>Subtotal:</span>
            <span>S/ {calculateTotal().toFixed(2)}</span>
          </div>
          <div className="summary-item total">
            <span>Total a Pagar:</span>
            <span className="total-price">S/ {calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Método de Pago *</label>
          <div className="payment-methods">
  <button
    className={`payment-method-btn ${paymentMethod === 'EFECTIVO' ? 'active' : ''}`}
    onClick={() => setPaymentMethod('EFECTIVO')}
  >
    <FiDollarSign />
    <span>Efectivo</span>
  </button>
  <button
    className={`payment-method-btn ${paymentMethod === 'YAPE_PLIN' ? 'active' : ''}`}
    onClick={() => setPaymentMethod('YAPE_PLIN')}
  >
    <FiCreditCard />
    <span>Yape / Plin</span>
  </button>
  <button
    className={`payment-method-btn ${paymentMethod === 'TARJETA' ? 'active' : ''}`}
    onClick={() => setPaymentMethod('TARJETA')}
  >
    <FiCreditCard />
    <span>Tarjeta</span>
  </button>
</div>

        </div>

        {paymentMethod === 'YAPE_PLIN' && (
  <div className="form-group slide-down">
    <label className="form-label">Nro. de Operación (Opcional)</label>
    <input
      type="text"
      className="form-input"
      placeholder="Ej: 123456789"
      value={operationNumber}
      onChange={(e) => setOperationNumber(e.target.value)}
      maxLength="50"
    />
    <small className="form-hint">Ingresa el número de operación de Yape o Plin</small>
  </div>
)}

{paymentMethod === 'TARJETA' && (
  <div className="form-group slide-down">
    <label className="form-label">Últimos 4 Dígitos / Código *</label>
    <input
      type="text"
      className="form-input"
      placeholder="Ej: 1234 o AUTH123"
      value={cardNumber}
      onChange={(e) => setCardNumber(e.target.value)}
      maxLength="20"
      required
    />
    <small className="form-hint">Ingresa los últimos 4 dígitos de la tarjeta o código de autorización</small>
  </div>
)}

        <div className="form-group">
          <label className="form-label">Nombre del Cliente (Opcional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="Nombre del cliente"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </div>
      </div>

      <div className="modal-footer">
        <button
          className="btn btn-secondary"
          onClick={() => setShowPaymentModal(false)}
          disabled={processingPayment}
        >
          Cancelar
        </button>
        <button
          className="btn btn-primary"
          onClick={processPayment}
          disabled={processingPayment}
        >
          {processingPayment ? (
            <>
              <div className="spinner-small"></div>
              Procesando...
            </>
          ) : (
            <>
              <FiCheck />
              Confirmar Venta
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}





    </div>
  )
}

export default POSPage