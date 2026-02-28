import React, { useState, useEffect } from 'react'
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiSearch,
  FiPackage,
  FiAlertTriangle,
  FiTrendingUp,
  FiDollarSign,
  FiShoppingCart,
  FiRefreshCw,
  FiSave,
  FiX,
  FiArrowLeft,
  FiUpload,
  FiAlertCircle 
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import snacksProductsService from '../../../services/snacks/productsService'
import Modal from '../../../components/common/Modal'
import ConfirmDialog from '../../../components/common/ConfirmDialog'
import Swal from 'sweetalert2'
import './SnacksProductsPage.css'
import locationsService from '../../../services/snacks/locationsService' // ← DEBE ESTAR AQUÍ

const SnacksProductsPage = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showReplenishModal, setShowReplenishModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [replenishData, setReplenishData] = useState({
    cantidad: '',
    observaciones: ''
  })
  const [formData, setFormData] = useState({
    categoria_id: '',
    codigo: '',
    nombre: '',
    descripcion: '',
    precio_compra: '',
    precio_venta: '',
    stock_actual: '',
    stock_minimo: 5,
    unidad_medida: 'unidad',
    imagen_url: '',
    activo: 1
  })
  const [errors, setErrors] = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [locations, setLocations] = useState([])
  const [stockPorUbicacion, setStockPorUbicacion] = useState([])

  const [currentPage, setCurrentPage] = useState(1)
const [itemsPerPage, setItemsPerPage] = useState(15)

  useEffect(() => {
    loadProducts()
    loadCategories()
    loadLocations() 
  }, [])

  const loadLocations = async () => {
    try {
      const result = await locationsService.getLocations()
      if (result.success) {
        setLocations(result.data)
      }
    } catch (error) {
      console.error('Error loading locations:', error)
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      const result = await snacksProductsService.getProducts()
      if (result.success) {
        setProducts(result.data)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'No se pudieron cargar los productos'
        })
      }
    } catch (error) {
      console.error('Error loading products:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error de conexión al cargar productos'
      })
    } finally {
      setLoading(false)
    }
  }

  
  const loadCategories = async () => {
    try {
      const result = await snacksProductsService.getCategories()
      if (result.success) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
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
      activo: product.activo ? 1 : 0
    })
    setEditingProduct(product)
    
    // Cargar imagen existente
    if (product.imagen_url) {
      setImagePreview(product.imagen_url)
    }
    
    setShowModal(true)
  }
  
  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    document.getElementById('imagen-upload').value = ''
  }

  const handleOpenModal = async (product = null) => {
    // ← VALIDAR QUE HAYA UBICACIONES
    if (locations.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Cargando ubicaciones',
        text: 'Por favor espera mientras cargamos las ubicaciones...',
        confirmButtonColor: '#f59e0b'
      })
      await loadLocations()
    }
  
    if (product) {
      setSelectedProduct(product)
      setFormData({
        categoria_id: product.categoria_id,
        codigo: product.codigo,
        nombre: product.nombre,
        descripcion: product.descripcion || '',
        precio_compra: product.precio_compra,
        precio_venta: product.precio_venta,
        stock_actual: product.stock_actual,
        stock_minimo: product.stock_minimo,
        unidad_medida: product.unidad_medida,
        imagen_url: product.imagen_url || '',
        activo: product.activo
      })
      
      // Cargar stock por ubicación
      if (product.stock_ubicaciones && product.stock_ubicaciones.length > 0) {
        setStockPorUbicacion(product.stock_ubicaciones.map(u => ({
          ubicacion_id: u.ubicacion_id,
          ubicacion_nombre: u.ubicacion_nombre,
          stock: u.stock_actual,
          stock_minimo: u.stock_minimo || 5
        })))
      } else {
        // Si es producto existente sin ubicaciones, inicializar con las disponibles
        setStockPorUbicacion(locations.map(loc => ({
          ubicacion_id: loc.id,
          ubicacion_nombre: loc.nombre,
          stock: 0,
          stock_minimo: 5
        })))
      }
    } else {
      // ← PRODUCTO NUEVO
      setSelectedProduct(null)
      setFormData({
        categoria_id: '',
        codigo: '',
        nombre: '',
        descripcion: '',
        precio_compra: '',
        precio_venta: '',
        stock_actual: '',
        stock_minimo: 5,
        unidad_medida: 'unidad',
        imagen_url: '',
        activo: true
      })
      
      // ← INICIALIZAR STOCK POR UBICACIÓN CON VALIDACIÓN
      console.log('Locations disponibles:', locations) // Debug
      
      if (locations.length > 0) {
        setStockPorUbicacion(locations.map(loc => ({
          ubicacion_id: loc.id,
          ubicacion_nombre: loc.nombre,
          stock: 0,
          stock_minimo: 5
        })))
      } else {
        // Si no hay ubicaciones, mostrar alerta
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No hay ubicaciones disponibles. Por favor contacta al administrador.',
          confirmButtonColor: '#f59e0b'
        })
        return // No abrir el modal
      }
    }
    
    setErrors({})
    setImageFile(null)
    setImagePreview(null)
    setShowModal(true)
  }



  const handleStockUbicacionChange = (ubicacionId, field, value) => {
    setStockPorUbicacion(prev => prev.map(item =>
      item.ubicacion_id === ubicacionId
        ? { ...item, [field]: parseInt(value) || 0 }
        : item
    ))
  }


  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedProduct(null)
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
  
    if (!formData.categoria_id) {
      newErrors.categoria_id = 'Selecciona una categoría'
    }
  
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }
  
    if (!formData.precio_venta || parseFloat(formData.precio_venta) <= 0) {
      newErrors.precio_venta = 'El precio debe ser mayor a 0'
    }
  
    if (formData.precio_compra && parseFloat(formData.precio_compra) > parseFloat(formData.precio_venta)) {
      newErrors.precio_compra = 'El precio de compra no puede ser mayor al de venta'
    }
  
    // ← ELIMINAR validación de stock_actual
    // Ya no validamos stock_actual porque ahora es por ubicación
  
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
  
    if (!validateForm()) return
  
    // ← AGREGAR ESTE LOG PARA DEBUG
    console.log('FormData antes de enviar:', formData)
    console.log('Stock por ubicación:', stockPorUbicacion)
  
    try {
      const productData = new FormData()
      
      productData.append('categoria_id', formData.categoria_id)
      productData.append('nombre', formData.nombre)
      productData.append('descripcion', formData.descripcion || '')
      productData.append('codigo', formData.codigo || '')
      productData.append('precio_compra', parseFloat(formData.precio_compra) || 0)
      productData.append('precio_venta', parseFloat(formData.precio_venta))
      productData.append('unidad_medida', formData.unidad_medida)
      productData.append('activo', formData.activo ? 1 : 0)
      
      // ← AGREGAR stock_ubicaciones
      productData.append('stock_ubicaciones', JSON.stringify(stockPorUbicacion))
      
      // ← CALCULAR stock total
      const stockTotal = stockPorUbicacion.reduce((sum, item) => sum + (item.stock || 0), 0)
      productData.append('stock_actual', stockTotal)
      
      // ← AGREGAR LOG PARA VER QUÉ SE ENVÍA
      console.log('Stock total calculado:', stockTotal)
      console.log('Stock ubicaciones JSON:', JSON.stringify(stockPorUbicacion))
      
      const stockMinimoMax = Math.max(...stockPorUbicacion.map(item => item.stock_minimo || 5))
      productData.append('stock_minimo', stockMinimoMax)
      
      if (imageFile) {
        productData.append('imagen', imageFile)
      }
      
      if (selectedProduct) {
        productData.append('id', selectedProduct.id)
        if (!imageFile && selectedProduct.imagen_url) {
          productData.append('imagen_url_actual', selectedProduct.imagen_url)
        }
      }
  
      // ← AGREGAR LOG FINAL
      for (let pair of productData.entries()) {
        console.log(pair[0] + ': ' + pair[1])
      }
  
      let result
      if (selectedProduct) {
        result = await snacksProductsService.updateProduct(selectedProduct.id, productData)
      } else {
        result = await snacksProductsService.createProduct(productData)
      }
  
      console.log('Resultado del backend:', result) // ← LOG
  
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: selectedProduct ? '¡Producto Actualizado!' : '¡Producto Creado!',
          text: result.message,
          confirmButtonColor: '#f59e0b'
        })
        
        handleCloseModal()
        loadProducts()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'Error al guardar el producto'
        })
      }
    } catch (error) {
      console.error('Error guardando producto:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al guardar el producto'
      })
    }
  }

  const handleDelete = (product) => {
    setSelectedProduct(product)
    setConfirmAction({ type: 'delete' })
    setShowConfirm(true)
  }

  const handleToggleStatus = async (product) => {
    try {
      const result = await snacksProductsService.updateProduct(product.id, {
        activo: !product.activo
      })

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Estado Actualizado',
          text: `El producto ahora está ${!product.activo ? 'activo' : 'inactivo'}`,
          confirmButtonColor: '#f59e0b',
          timer: 2000
        })
        loadProducts()
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cambiar el estado'
      })
    }
  }

  const handleOpenReplenish = (product) => {
    setSelectedProduct(product)
    setReplenishData({
      cantidad: '',
      observaciones: ''
    })
    setShowReplenishModal(true)
  }

  const handleReplenishSubmit = async (e) => {
    e.preventDefault()

    if (!replenishData.cantidad || parseInt(replenishData.cantidad) <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ingresa una cantidad válida'
      })
      return
    }

    try {
      const result = await snacksProductsService.replenishStock(
        selectedProduct.id,
        parseInt(replenishData.cantidad),
        replenishData.observaciones
      )

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Stock Repuesto!',
          text: `Se agregaron ${replenishData.cantidad} unidades`,
          confirmButtonColor: '#f59e0b'
        })
        
        setShowReplenishModal(false)
        loadProducts()
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
        text: 'Error al reponer stock'
      })
    }
  }

  const confirmActionHandler = async () => {
    try {
      if (confirmAction.type === 'delete') {
        const result = await snacksProductsService.deleteProduct(selectedProduct.id)
        
        if (result.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Producto Eliminado!',
            text: result.message,
            confirmButtonColor: '#f59e0b',
            timer: 2000
          })
          loadProducts()
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
    setSelectedProduct(null)
    setConfirmAction(null)
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.descripcion && product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = categoryFilter === 'all' || product.categoria_id === parseInt(categoryFilter)
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && product.activo) ||
      (statusFilter === 'inactive' && !product.activo) ||
      (statusFilter === 'low_stock' && product.stock_bajo)

    return matchesSearch && matchesCategory && matchesStatus
  })

  // ← AGREGAR LÓGICA DE PAGINACIÓN
const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
const startIndex = (currentPage - 1) * itemsPerPage
const endIndex = startIndex + itemsPerPage
const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

// Resetear a página 1 cuando cambian los filtros
useEffect(() => {
  setCurrentPage(1)
}, [searchTerm, categoryFilter, statusFilter, itemsPerPage])

  const stats = {
    total: products.length,
    activos: products.filter(p => p.activo).length,
    stockBajo: products.filter(p => p.stock_bajo).length,
    valorInventario: products.reduce((sum, p) => sum + (p.precio_venta * p.stock_actual), 0)
  }

  const formatPrice = (price) => {
    return `S/ ${parseFloat(price).toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="snacks-products-loading">
        <div className="spinner-large"></div>
        <p>Cargando productos...</p>
      </div>
    )
  }

  return (
    <div className="snacks-products-page">
      {/* Header */}
      <div className="products-header">
        <div>
          <div className="breadcrumb">
            <Link to="/admin/snacks/dashboard">
              <FiArrowLeft /> Volver al Dashboard
            </Link>
          </div>
          <h1 className="products-title">
            <FiPackage />
            Gestión de Productos
          </h1>
          <p className="products-subtitle">Administra el inventario de snacks</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FiPlus />
          Nuevo Producto
        </button>
      </div>

      {/* Stats Cards */}
      <div className="products-stats">
        <div className="stat-card">
          <div className="stat-icon primary">
            <FiPackage />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Productos</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <FiShoppingCart />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.activos}</div>
            <div className="stat-label">Productos Activos</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <FiAlertTriangle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.stockBajo}</div>
            <div className="stat-label">Stock Bajo</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatPrice(stats.valorInventario)}</div>
            <div className="stat-label">Valor Inventario</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="products-filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Buscar por nombre, código o descripción..."
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
              <option key={cat.id} value={cat.id}>
                {cat.icono} {cat.nombre}
              </option>
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
            <option value="low_stock">Stock Bajo</option>
          </select>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
  Mostrando <strong>{startIndex + 1} - {Math.min(endIndex, filteredProducts.length)}</strong> de <strong>{filteredProducts.length}</strong> productos
  {filteredProducts.length !== products.length && ` (filtrados de ${products.length} totales)`}
</div>

      {/* Products Table */}
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Ubicaciones</th> 
              <th>Precio Compra</th>
              <th>Precio Venta</th>
              <th>Stock</th>
              <th>Unidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
          {paginatedProducts.map(product => (
              <tr key={product.id} className={!product.activo ? 'inactive-row' : ''}>
                <td>
                  <span className="product-code">{product.codigo}</span>
                </td>
                <td>
                  <div className="product-info">
                    {product.imagen_url ? (
                      <img src={product.imagen_url} alt={product.nombre} className="product-thumb" />
                    ) : (
                      <div className="product-thumb-placeholder">
                        <FiPackage />
                      </div>
                    )}
                    <div>
                      <div className="product-name">{product.nombre}</div>
                      {product.descripcion && (
                        <div className="product-description">{product.descripcion}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <span 
                    className="category-badge" 
                    style={{ backgroundColor: `${product.categoria_color}15`, color: product.categoria_color }}
                  >
                    {product.categoria_icono} {product.categoria_nombre}
                  </span>
                </td>
               {/* ← NUEVA COLUMNA DE UBICACIONES */}
<td>
  {product.stock_por_ubicacion ? (
    <div className="locations-cell">
      {product.stock_por_ubicacion.split(' | ').map((loc, idx) => {
        const [nombre, stock] = loc.split(': ')
        return (
          <span key={idx} className="location-tag" title={`${nombre}: ${stock} unidades`}>
            {nombre === 'Academia Encantos' && '🎓'}
            {nombre === 'SPA Encantos' && '💆'}
            {nombre === 'Almacén Central' && '📦'}
            <span className="location-name">{nombre.split(' ')[0]}</span>
            <span className="location-stock">{stock}</span>
          </span>
        )
      })}
    </div>
  ) : (
    <span className="text-muted">Sin ubicación</span>
  )}
</td>

<td className="text-muted">{formatPrice(product.precio_compra)}</td>
                <td className="text-price">{formatPrice(product.precio_venta)}</td>
                <td>
                  <div className="stock-cell">
                    <span className={`stock-badge ${product.stock_bajo ? 'low' : 'normal'}`}>
                      {product.stock_actual}
                    </span>
                    {product.stock_bajo && (
                      <button
                        className="btn-replenish"
                        onClick={() => handleOpenReplenish(product)}
                        title="Reponer stock"
                      >
                        <FiRefreshCw />
                      </button>
                    )}
                  </div>
                </td>
                <td className="text-muted">{product.unidad_medida}</td>
                <td>
                  <button
                    className={`status-toggle ${product.activo ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleStatus(product)}
                  >
                    {product.activo ? <><FiEye /> Activo</> : <><FiEyeOff /> Inactivo</>}
                  </button>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon primary"
                      onClick={() => handleOpenModal(product)}
                      title="Editar"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDelete(product)}
                      title="Eliminar"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>


        {filteredProducts.length > 0 && (
  <div className="pagination-container">
    <div className="pagination-info">
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
        <span className="per-page-label">por página</span>
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
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No se encontraron productos</h3>
            <p>Intenta con otros filtros de búsqueda o crea un nuevo producto</p>
          </div>
        )}
      </div>

      {/* Modal Create/Edit Product */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="product-form">
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
                  <option key={cat.id} value={cat.id}>
                    {cat.icono} {cat.nombre}
                  </option>
                ))}
              </select>
              {errors.categoria_id && <span className="form-error">{errors.categoria_id}</span>}
            </div>

            {/* Código */}
            <div className="form-group">
              <label className="form-label">
                Código
                <span className="text-muted"> (Opcional, se genera automático)</span>
              </label>
              <input
                type="text"
                name="codigo"
                className="form-input"
                placeholder="Ej: BEB-001"
                value={formData.codigo}
                onChange={handleChange}
              />
            </div>

            {/* Nombre */}
            <div className="form-group form-full">
              <label className="form-label">Nombre del Producto *</label>
              <input
                type="text"
                name="nombre"
                className={`form-input ${errors.nombre ? 'error' : ''}`}
                placeholder="Ej: Inca Kola 500ml"
                value={formData.nombre}
                onChange={handleChange}
              />
              {errors.nombre && <span className="form-error">{errors.nombre}</span>}
            </div>

            {/* Descripción */}
            <div className="form-group form-full">
              <label className="form-label">Descripción</label>
              <textarea
                name="descripcion"
                className="form-input"
                placeholder="Descripción del producto"
                rows="2"
                value={formData.descripcion}
                onChange={handleChange}
              />
            </div>

            {/* Precio Compra */}
            <div className="form-group">
              <label className="form-label">Precio de Compra</label>
              <input
                type="number"
                name="precio_compra"
                className={`form-input ${errors.precio_compra ? 'error' : ''}`}
                placeholder="0.00"
                min="0"
                step="0.01"
                value={formData.precio_compra}
                onChange={handleChange}
              />
              {errors.precio_compra && <span className="form-error">{errors.precio_compra}</span>}
            </div>

            {/* Precio Venta */}
            <div className="form-group">
              <label className="form-label">Precio de Venta *</label>
              <input
                type="number"
                name="precio_venta"
                className={`form-input ${errors.precio_venta ? 'error' : ''}`}
                placeholder="0.00"
                min="0"
                step="0.01"
                value={formData.precio_venta}
                onChange={handleChange}
              />
              {errors.precio_venta && <span className="form-error">{errors.precio_venta}</span>}
            </div>

         {/* ==========================================
    PASO 5: STOCK POR UBICACIÓN (AQUÍ VA)
    ========================================== */}
{/* Stock por Ubicación */}
{/* Stock por Ubicación */}
<div className="form-group form-full">
  <label className="form-label">Stock por Ubicación *</label>
  
  {stockPorUbicacion.length > 0 ? (
    <div className="stock-locations-grid">
      {stockPorUbicacion.map(item => (
        <div key={item.ubicacion_id} className="stock-location-item">
          <div className="location-header">
            <span className="location-name">{item.ubicacion_nombre}</span>
          </div>
          <div className="location-stock-inputs">
            <div className="stock-input-group">
              <label>Stock</label>
              <input
                type="number"
                min="0"
                value={item.stock}
                onChange={(e) => handleStockUbicacionChange(item.ubicacion_id, 'stock', e.target.value)}
                className="form-input-sm"
                placeholder="0"
              />
            </div>
            <div className="stock-input-group">
              <label>Mínimo</label>
              <input
                type="number"
                min="0"
                value={item.stock_minimo}
                onChange={(e) => handleStockUbicacionChange(item.ubicacion_id, 'stock_minimo', e.target.value)}
                className="form-input-sm"
                placeholder="5"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="alert alert-warning">
      <FiAlertCircle />
      <span>Cargando ubicaciones...</span>
    </div>
  )}
  
  <small className="form-hint">
    Define el stock disponible en cada ubicación
  </small>
</div>

{/* Unidad de Medida */}
<div className="form-group">
  <label className="form-label">Unidad de Medida</label>
  <select
    name="unidad_medida"
    className="form-input"
    value={formData.unidad_medida}
    onChange={handleChange}
  >
    <option value="unidad">Unidad</option>
    <option value="kg">Kilogramo (kg)</option>
    <option value="litro">Litro</option>
    <option value="paquete">Paquete</option>
    <option value="caja">Caja</option>
  </select>
</div>

            {/* URL Imagen */}
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

            {/* Estado Activo */}
            <div className="form-group form-full">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                />
                <span>Producto activo</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
              <FiX /> Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <FiSave /> {selectedProduct ? 'Actualizar' : 'Crear'} Producto
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Reponer Stock */}
      <Modal
        isOpen={showReplenishModal}
        onClose={() => setShowReplenishModal(false)}
        title="Reponer Stock"
        size="small"
      >
        <form onSubmit={handleReplenishSubmit} className="replenish-form">
          <div className="product-replenish-info">
            <FiPackage />
            <div>
              <div className="replenish-product-name">{selectedProduct?.nombre}</div>
              <div className="replenish-current-stock">
                Stock actual: <strong>{selectedProduct?.stock_actual}</strong>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Cantidad a Agregar *</label>
            <input
              type="number"
              className="form-input"
              placeholder="Ingresa la cantidad"
              min="1"
              value={replenishData.cantidad}
              onChange={(e) => setReplenishData(prev => ({ ...prev, cantidad: e.target.value }))}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Observaciones</label>
            <textarea
              className="form-input"
              placeholder="Opcional: Proveedor, factura, etc."
              rows="2"
              value={replenishData.observaciones}
              onChange={(e) => setReplenishData(prev => ({ ...prev, observaciones: e.target.value }))}
            />
          </div>

          {replenishData.cantidad && (
            <div className="new-stock-preview">
              <FiTrendingUp />
              <span>Nuevo stock: <strong>{parseInt(selectedProduct?.stock_actual || 0) + parseInt(replenishData.cantidad)}</strong></span>
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={() => setShowReplenishModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <FiRefreshCw /> Reponer Stock
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmActionHandler}
        title="Eliminar Producto"
        message={`¿Estás seguro de eliminar "${selectedProduct?.nombre}"? Esta acción no se puede deshacer.`}
        type="danger"
      />
    </div>
  )
}

export default SnacksProductsPage