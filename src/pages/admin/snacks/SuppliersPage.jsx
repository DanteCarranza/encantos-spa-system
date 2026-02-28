import React, { useState, useEffect } from 'react'
import {
  FiTruck,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiPhone,
  FiMail,
  FiMapPin,
  FiUser,
  FiCreditCard,
  FiDollarSign,
  FiFileText,
  FiSearch,
  FiFilter,
  FiX
} from 'react-icons/fi'
import suppliersService from '../../../services/snacks/suppliersService'
import Modal from '../../../components/common/Modal'
import ConfirmDialog from '../../../components/common/ConfirmDialog'
import Swal from 'sweetalert2'
import './SuppliersPage.css'

const TIPOS_PROVEEDOR = [
  { value: 'DISTRIBUIDOR', label: 'Distribuidor' },
  { value: 'FABRICANTE', label: 'Fabricante' },
  { value: 'MAYORISTA', label: 'Mayorista' },
  { value: 'MINORISTA', label: 'Minorista' },
  { value: 'OTRO', label: 'Otro' }
]

const FORMAS_PAGO = [
  { value: 'CONTADO', label: 'Contado' },
  { value: 'CREDITO_15', label: 'Crédito 15 días' },
  { value: 'CREDITO_30', label: 'Crédito 30 días' },
  { value: 'CREDITO_45', label: 'Crédito 45 días' },
  { value: 'CREDITO_60', label: 'Crédito 60 días' }
]

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([])
  const [filteredSuppliers, setFilteredSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [supplierHistory, setSupplierHistory] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [formData, setFormData] = useState({
    razon_social: '',
    nombre_comercial: '',
    ruc: '',
    direccion: '',
    telefono: '',
    email: '',
    contacto_nombre: '',
    contacto_telefono: '',
    contacto_email: '',
    tipo_proveedor: 'DISTRIBUIDOR',
    forma_pago: 'CONTADO',
    banco: '',
    numero_cuenta: '',
    notas: '',
    activo: true
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadSuppliers()
  }, [])

  useEffect(() => {
    filterSuppliers()
  }, [searchTerm, filterType, suppliers])

  const loadSuppliers = async () => {
    setLoading(true)
    try {
      const result = await suppliersService.getSuppliers(true)
      if (result.success) {
        setSuppliers(result.data)
        setFilteredSuppliers(result.data)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'No se pudieron cargar los proveedores'
        })
      }
    } catch (error) {
      console.error('Error loading suppliers:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error de conexión'
      })
    } finally {
      setLoading(false)
    }
  }

  const filterSuppliers = () => {
    let filtered = [...suppliers]

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.ruc && s.ruc.includes(searchTerm)) ||
        (s.nombre_comercial && s.nombre_comercial.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtrar por tipo
    if (filterType) {
      filtered = filtered.filter(s => s.tipo_proveedor === filterType)
    }

    setFilteredSuppliers(filtered)
  }

  const handleOpenModal = (supplier = null) => {
    if (supplier) {
      setSelectedSupplier(supplier)
      setFormData({
        razon_social: supplier.razon_social,
        nombre_comercial: supplier.nombre_comercial || '',
        ruc: supplier.ruc || '',
        direccion: supplier.direccion || '',
        telefono: supplier.telefono || '',
        email: supplier.email || '',
        contacto_nombre: supplier.contacto_nombre || '',
        contacto_telefono: supplier.contacto_telefono || '',
        contacto_email: supplier.contacto_email || '',
        tipo_proveedor: supplier.tipo_proveedor,
        forma_pago: supplier.forma_pago,
        banco: supplier.banco || '',
        numero_cuenta: supplier.numero_cuenta || '',
        notas: supplier.notas || '',
        activo: supplier.activo === 1
      })
    } else {
      setSelectedSupplier(null)
      setFormData({
        razon_social: '',
        nombre_comercial: '',
        ruc: '',
        direccion: '',
        telefono: '',
        email: '',
        contacto_nombre: '',
        contacto_telefono: '',
        contacto_email: '',
        tipo_proveedor: 'DISTRIBUIDOR',
        forma_pago: 'CONTADO',
        banco: '',
        numero_cuenta: '',
        notas: '',
        activo: true
      })
    }
    setErrors({})
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedSupplier(null)
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

    if (!formData.razon_social.trim()) {
      newErrors.razon_social = 'La razón social es obligatoria'
    }

    if (formData.ruc && formData.ruc.length !== 11) {
      newErrors.ruc = 'El RUC debe tener 11 dígitos'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (formData.contacto_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contacto_email)) {
      newErrors.contacto_email = 'Email de contacto inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const supplierData = {
        ...formData,
        activo: formData.activo ? 1 : 0
      }

      let result
      if (selectedSupplier) {
        result = await suppliersService.updateSupplier(selectedSupplier.id, supplierData)
      } else {
        result = await suppliersService.createSupplier(supplierData)
      }

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: selectedSupplier ? '¡Proveedor Actualizado!' : '¡Proveedor Creado!',
          text: result.message,
          confirmButtonColor: '#f59e0b',
          timer: 2000
        })

        handleCloseModal()
        loadSuppliers()
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
        text: 'Error al guardar el proveedor'
      })
    }
  }

  const handleDelete = (supplier) => {
    setSelectedSupplier(supplier)
    setShowConfirm(true)
  }

  const confirmDelete = async () => {
    try {
      const result = await suppliersService.deleteSupplier(selectedSupplier.id)

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Proveedor Eliminado!',
          text: result.message,
          confirmButtonColor: '#f59e0b',
          timer: 2000
        })
        loadSuppliers()
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
        text: 'Error al eliminar el proveedor'
      })
    }

    setShowConfirm(false)
    setSelectedSupplier(null)
  }

  const handleToggleStatus = async (supplier) => {
    try {
      const result = await suppliersService.updateSupplier(supplier.id, {
        activo: supplier.activo === 1 ? 0 : 1
      })

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Estado Actualizado',
          text: `El proveedor ahora está ${supplier.activo === 1 ? 'inactivo' : 'activo'}`,
          confirmButtonColor: '#f59e0b',
          timer: 2000
        })
        loadSuppliers()
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cambiar el estado'
      })
    }
  }

  const handleViewHistory = async (supplier) => {
    setSelectedSupplier(supplier)
    try {
      const result = await suppliersService.getSupplierHistory(supplier.id)
      if (result.success) {
        setSupplierHistory(result.data)
        setShowHistoryModal(true)
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar historial'
      })
    }
  }

  const formatCurrency = (amount) => {
    return `S/ ${parseFloat(amount || 0).toFixed(2)}`
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-PE')
  }

  if (loading) {
    return (
      <div className="suppliers-loading">
        <div className="spinner-large"></div>
        <p>Cargando proveedores...</p>
      </div>
    )
  }


return (
    <div className="suppliers-page">
      {/* Header */}
      <div className="suppliers-header">
        <div>
          <h1 className="page-title">
            <FiTruck />
            Gestión de Proveedores
          </h1>
          <p className="page-subtitle">Administra tus proveedores y sus datos fiscales</p>
        </div>

        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FiPlus />
          Nuevo Proveedor
        </button>
      </div>

      {/* Stats */}
      <div className="suppliers-stats">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FiTruck />
          </div>
          <div className="stat-content">
            <div className="stat-value">{suppliers.length}</div>
            <div className="stat-label">Total Proveedores</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <FiEye />
          </div>
          <div className="stat-content">
            <div className="stat-value">{suppliers.filter(s => s.activo === 1).length}</div>
            <div className="stat-label">Activos</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              {formatCurrency(suppliers.reduce((sum, s) => sum + parseFloat(s.monto_total_compras || 0), 0))}
            </div>
            <div className="stat-label">Total Compras</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="suppliers-filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Buscar por razón social, código o RUC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-select">
          <FiFilter />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">Todos los tipos</option>
            {TIPOS_PROVEEDOR.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="suppliers-grid">
        {filteredSuppliers.map(supplier => (
          <div key={supplier.id} className={`supplier-card ${supplier.activo === 0 ? 'inactive' : ''}`}>
            <div className="supplier-header">
              <div className="supplier-code">{supplier.codigo}</div>
              <div className={`supplier-type ${supplier.tipo_proveedor.toLowerCase()}`}>
                {TIPOS_PROVEEDOR.find(t => t.value === supplier.tipo_proveedor)?.label}
              </div>
            </div>

            <div className="supplier-main">
              <h3 className="supplier-name">{supplier.razon_social}</h3>
              {supplier.nombre_comercial && (
                <p className="supplier-commercial">{supplier.nombre_comercial}</p>
              )}
              {supplier.ruc && (
                <p className="supplier-ruc">RUC: {supplier.ruc}</p>
              )}
            </div>

            <div className="supplier-info">
              {supplier.telefono && (
                <div className="info-item">
                  <FiPhone />
                  <span>{supplier.telefono}</span>
                </div>
              )}
              {supplier.email && (
                <div className="info-item">
                  <FiMail />
                  <span>{supplier.email}</span>
                </div>
              )}
              {supplier.direccion && (
                <div className="info-item">
                  <FiMapPin />
                  <span>{supplier.direccion}</span>
                </div>
              )}
            </div>

            <div className="supplier-stats">
              <div className="stat-item">
                <span className="stat-label">Compras:</span>
                <span className="stat-value">{supplier.total_compras || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total:</span>
                <span className="stat-value">{formatCurrency(supplier.monto_total_compras)}</span>
              </div>
              {supplier.ultima_compra && (
                <div className="stat-item">
                  <span className="stat-label">Última:</span>
                  <span className="stat-value">{formatDate(supplier.ultima_compra)}</span>
                </div>
              )}
            </div>

            <div className="supplier-actions">
              <button
                className={`status-toggle ${supplier.activo === 1 ? 'active' : 'inactive'}`}
                onClick={() => handleToggleStatus(supplier)}
                title={supplier.activo === 1 ? 'Desactivar' : 'Activar'}
              >
                {supplier.activo === 1 ? <FiEye /> : <FiEyeOff />}
              </button>

              <button
                className="btn-icon info"
                onClick={() => handleViewHistory(supplier)}
                title="Ver historial"
              >
                <FiFileText />
              </button>

              <button
                className="btn-icon primary"
                onClick={() => handleOpenModal(supplier)}
                title="Editar"
              >
                <FiEdit2 />
              </button>

              <button
                className="btn-icon danger"
                onClick={() => handleDelete(supplier)}
                title="Eliminar"
                disabled={parseInt(supplier.total_compras) > 0}
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🚚</div>
          <h3>{searchTerm || filterType ? 'No se encontraron proveedores' : 'No hay proveedores'}</h3>
          <p>{searchTerm || filterType ? 'Intenta con otros filtros' : 'Crea tu primer proveedor para comenzar'}</p>
          {!searchTerm && !filterType && (
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              <FiPlus />
              Crear Proveedor
            </button>
          )}
        </div>
      )}

      {/* Modal Create/Edit - Continúa en Parte 3... */}



 {/* Modal Create/Edit */}
 <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="supplier-form">
          {/* Información General */}
          <div className="form-section">
            <h3 className="section-title">Información General</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Razón Social *</label>
                <input
                  type="text"
                  name="razon_social"
                  className={`form-input ${errors.razon_social ? 'error' : ''}`}
                  placeholder="Nombre legal de la empresa"
                  value={formData.razon_social}
                  onChange={handleChange}
                  autoFocus
                />
                {errors.razon_social && <span className="form-error">{errors.razon_social}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Nombre Comercial</label>
                <input
                  type="text"
                  name="nombre_comercial"
                  className="form-input"
                  placeholder="Nombre con el que opera"
                  value={formData.nombre_comercial}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">RUC</label>
                <input
                  type="text"
                  name="ruc"
                  className={`form-input ${errors.ruc ? 'error' : ''}`}
                  placeholder="20XXXXXXXXX (11 dígitos)"
                  maxLength="11"
                  value={formData.ruc}
                  onChange={handleChange}
                />
                {errors.ruc && <span className="form-error">{errors.ruc}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Tipo de Proveedor</label>
                <select
                  name="tipo_proveedor"
                  className="form-input"
                  value={formData.tipo_proveedor}
                  onChange={handleChange}
                >
                  {TIPOS_PROVEEDOR.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="form-section">
            <h3 className="section-title">Información de Contacto</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  className="form-input"
                  placeholder="(01) 123-4567"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="contacto@proveedor.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Dirección</label>
              <textarea
                name="direccion"
                className="form-input"
                placeholder="Dirección completa"
                rows="2"
                value={formData.direccion}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Persona de Contacto */}
          <div className="form-section">
            <h3 className="section-title">Persona de Contacto</h3>
            
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <input
                type="text"
                name="contacto_nombre"
                className="form-input"
                placeholder="Nombre del contacto principal"
                value={formData.contacto_nombre}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Teléfono de Contacto</label>
                <input
                  type="tel"
                  name="contacto_telefono"
                  className="form-input"
                  placeholder="999 999 999"
                  value={formData.contacto_telefono}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email de Contacto</label>
                <input
                  type="email"
                  name="contacto_email"
                  className={`form-input ${errors.contacto_email ? 'error' : ''}`}
                  placeholder="contacto@ejemplo.com"
                  value={formData.contacto_email}
                  onChange={handleChange}
                />
                {errors.contacto_email && <span className="form-error">{errors.contacto_email}</span>}
              </div>
            </div>
          </div>

          {/* Información de Pago */}
          <div className="form-section">
            <h3 className="section-title">Información de Pago</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Forma de Pago</label>
                <select
                  name="forma_pago"
                  className="form-input"
                  value={formData.forma_pago}
                  onChange={handleChange}
                >
                  {FORMAS_PAGO.map(forma => (
                    <option key={forma.value} value={forma.value}>{forma.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Banco</label>
                <input
                  type="text"
                  name="banco"
                  className="form-input"
                  placeholder="Nombre del banco"
                  value={formData.banco}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Número de Cuenta</label>
              <input
                type="text"
                name="numero_cuenta"
                className="form-input"
                placeholder="1234567890123456"
                value={formData.numero_cuenta}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Notas */}
          <div className="form-section">
            <h3 className="section-title">Notas Adicionales</h3>
            
            <div className="form-group">
              <textarea
                name="notas"
                className="form-input"
                placeholder="Observaciones, condiciones especiales, etc."
                rows="3"
                value={formData.notas}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                />
                <span>Proveedor activo</span>
              </label>
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
              <FiPlus />
              {selectedSupplier ? 'Actualizar' : 'Crear'} Proveedor
            </button>
          </div>
        </form>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title={`Historial de Compras - ${selectedSupplier?.razon_social}`}
        size="large"
      >
        <div className="history-content">
          {supplierHistory.length > 0 ? (
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Fecha</th>
                    <th>Comprobante</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierHistory.map(compra => (
                    <tr key={compra.id}>
                      <td className="code">{compra.numero_compra}</td>
                      <td>{formatDate(compra.fecha_compra)}</td>
                      <td>{compra.tipo_comprobante} {compra.numero_comprobante}</td>
                      <td className="text-right">{formatCurrency(compra.total)}</td>
                      <td>
                        <span className={`status-badge ${compra.estado.toLowerCase()}`}>
                          {compra.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-history">
              <FiFileText />
              <p>No hay compras registradas para este proveedor</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Eliminar Proveedor"
        message={`¿Estás seguro de eliminar el proveedor "${selectedSupplier?.razon_social}"? Esta acción no se puede deshacer.`}
        type="danger"
      />




    </div>
  )
}

export default SuppliersPage