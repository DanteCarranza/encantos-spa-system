import React, { useState, useEffect } from 'react'
import {
  FiFileText,
  FiSearch,
  FiFilter,
  FiEye,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiSend,
  FiX,
  FiDownload,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar,
  FiDollarSign,
  FiPackage,
  FiMessageSquare,
  FiInfo,
  FiChevronRight
} from 'react-icons/fi'
import reclamacionesService from '../../services/reclamacionesService'
import Modal from '../../components/common/Modal'
import Swal from 'sweetalert2'
import './AdminReclamacionesPage.css'

const AdminReclamacionesPage = () => {
  const [reclamaciones, setReclamaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('all')
  const [tipoFilter, setTipoFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedReclamacion, setSelectedReclamacion] = useState(null)
  const [respuesta, setRespuesta] = useState('')
  const [nuevoEstado, setNuevoEstado] = useState('')
  const [processingResponse, setProcessingResponse] = useState(false)
  const [activeTab, setActiveTab] = useState('info') // info, detalle, respuesta

  useEffect(() => {
    loadReclamaciones()
  }, [])

  const loadReclamaciones = async () => {
    setLoading(true)
    try {
      const result = await reclamacionesService.getReclamaciones()
      if (result.success) {
        setReclamaciones(result.data)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'Error al cargar reclamaciones'
        })
      }
    } catch (error) {
      console.error('Error loading reclamaciones:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error de conexión'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (reclamacion) => {
    setSelectedReclamacion(reclamacion)
    setRespuesta(reclamacion.respuesta || '')
    setNuevoEstado(reclamacion.estado)
    setActiveTab('info')
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedReclamacion(null)
    setRespuesta('')
    setNuevoEstado('')
    setActiveTab('info')
  }

  const handleSubmitResponse = async () => {
    if (!respuesta.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Respuesta Vacía',
        text: 'Por favor ingrese una respuesta',
        confirmButtonColor: '#dc2626'
      })
      return
    }
  
    console.log('Enviando datos:', {
      id: selectedReclamacion.id,
      respuesta: respuesta,
      estado: nuevoEstado
    })
  
    setProcessingResponse(true)
  
    try {
      const result = await reclamacionesService.responderReclamacion(
        selectedReclamacion.id,
        respuesta,
        nuevoEstado
      )
  
      console.log('Respuesta del servidor:', result)
  
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Respuesta Enviada!',
          html: `
            <p>La respuesta ha sido registrada exitosamente.</p>
            <p style="font-size: 0.875rem; color: #6b7280; margin-top: 1rem;">
              El cliente será notificado por correo electrónico.
            </p>
          `,
          confirmButtonColor: '#dc2626'
        })
  
        handleCloseModal()
        loadReclamaciones()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'Error al enviar la respuesta'
        })
      }
    } catch (error) {
      console.error('Error completo:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error de conexión'
      })
    } finally {
      setProcessingResponse(false)
    }
  }

  const filteredReclamaciones = reclamaciones.filter(rec => {
    const matchesSearch = 
      rec.codigo_reclamo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.numero_documento.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEstado = estadoFilter === 'all' || rec.estado === estadoFilter
    const matchesTipo = tipoFilter === 'all' || rec.tipo_reclamo === tipoFilter

    return matchesSearch && matchesEstado && matchesTipo
  })

  const stats = {
    total: reclamaciones.length,
    pendientes: reclamaciones.filter(r => r.estado === 'PENDIENTE').length,
    enProceso: reclamaciones.filter(r => r.estado === 'EN_PROCESO').length,
    resueltos: reclamaciones.filter(r => r.estado === 'RESUELTO').length
  }

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'badge-warning'
      case 'EN_PROCESO': return 'badge-info'
      case 'RESUELTO': return 'badge-success'
      case 'CERRADO': return 'badge-secondary'
      default: return 'badge-secondary'
    }
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return <FiClock />
      case 'EN_PROCESO': return <FiAlertCircle />
      case 'RESUELTO': return <FiCheckCircle />
      case 'CERRADO': return <FiX />
      default: return <FiInfo />
    }
  }

  const getTipoColor = (tipo) => {
    return tipo === 'RECLAMACION' ? '#dc2626' : '#f59e0b'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysElapsed = (dateString) => {
    const now = new Date()
    const created = new Date(dateString)
    const diff = Math.floor((now - created) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (loading) {
    return (
      <div className="reclamaciones-admin-loading">
        <div className="spinner-large"></div>
        <p>Cargando reclamaciones...</p>
      </div>
    )
  }

  return (
    <div className="reclamaciones-admin-page">
      {/* Header */}
      <div className="page-header-enhanced">
        <div className="header-content">
          <div className="header-icon">
            <FiFileText />
          </div>
          <div className="header-text">
            <h1 className="page-title-enhanced">Libro de Reclamaciones</h1>
            <p className="page-subtitle-enhanced">Gestión de reclamaciones y quejas de clientes</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid-enhanced">
        <div className="stat-card-enhanced total">
          <div className="stat-header">
            <div className="stat-icon-wrapper">
              <FiFileText />
            </div>
            <span className="stat-trend">Total</span>
          </div>
          <div className="stat-value-large">{stats.total}</div>
          <div className="stat-label">Reclamaciones</div>
        </div>

        <div className="stat-card-enhanced warning">
          <div className="stat-header">
            <div className="stat-icon-wrapper">
              <FiClock />
            </div>
            <span className="stat-trend">Urgente</span>
          </div>
          <div className="stat-value-large">{stats.pendientes}</div>
          <div className="stat-label">Pendientes</div>
          <div className="stat-footer">
            Responder en 15 días
          </div>
        </div>

        <div className="stat-card-enhanced info">
          <div className="stat-header">
            <div className="stat-icon-wrapper">
              <FiAlertCircle />
            </div>
            <span className="stat-trend">En curso</span>
          </div>
          <div className="stat-value-large">{stats.enProceso}</div>
          <div className="stat-label">En Proceso</div>
        </div>

        <div className="stat-card-enhanced success">
          <div className="stat-header">
            <div className="stat-icon-wrapper">
              <FiCheckCircle />
            </div>
            <span className="stat-trend">Completado</span>
          </div>
          <div className="stat-value-large">{stats.resueltos}</div>
          <div className="stat-label">Resueltos</div>
          <div className="stat-footer">
            {stats.total > 0 ? Math.round((stats.resueltos / stats.total) * 100) : 0}% tasa resolución
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-container-enhanced">
        <div className="search-box-enhanced">
          <FiSearch />
          <input
            type="text"
            placeholder="Buscar por código, nombre o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-row-enhanced">
          <div className="filter-group-enhanced">
            <FiFilter className="filter-icon" />
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="filter-select-enhanced"
            >
              <option value="all">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="RESUELTO">Resuelto</option>
              <option value="CERRADO">Cerrado</option>
            </select>
          </div>

          <div className="filter-group-enhanced">
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="filter-select-enhanced"
            >
              <option value="all">Todos los tipos</option>
              <option value="RECLAMACION">Reclamaciones</option>
              <option value="QUEJA">Quejas</option>
            </select>
          </div>

          <button className="btn-export-enhanced">
            <FiDownload />
            Exportar
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info-enhanced">
        Mostrando <strong>{filteredReclamaciones.length}</strong> de <strong>{reclamaciones.length}</strong> reclamaciones
      </div>

      {/* Table */}
      <div className="table-container-enhanced">
        <table className="reclamaciones-table-enhanced">
          <thead>
            <tr>
              <th>Código</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Detalle</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Días</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredReclamaciones.map(rec => {
              const daysElapsed = getDaysElapsed(rec.fecha_creacion)
              const isUrgent = rec.estado === 'PENDIENTE' && daysElapsed > 10
              
              return (
                <tr key={rec.id} className={isUrgent ? 'row-urgent' : ''}>
                  <td>
                    <div className="codigo-cell-enhanced">
                      <span className="codigo-text">{rec.codigo_reclamo}</span>
                      {isUrgent && <span className="urgent-indicator">!</span>}
                    </div>
                  </td>
                  <td>
                    <div className="cliente-cell-enhanced">
                      <div className="cliente-avatar">
                        {rec.nombre.charAt(0)}{rec.primer_apellido.charAt(0)}
                      </div>
                      <div className="cliente-info">
                        <div className="cliente-nombre">
                          {rec.nombre} {rec.primer_apellido}
                        </div>
                        <div className="cliente-doc">
                          {rec.tipo_documento}: {rec.numero_documento}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="tipo-badge-enhanced"
                      style={{ 
                        backgroundColor: `${getTipoColor(rec.tipo_reclamo)}15`,
                        color: getTipoColor(rec.tipo_reclamo),
                        borderColor: getTipoColor(rec.tipo_reclamo)
                      }}
                    >
                      {rec.tipo_reclamo === 'RECLAMACION' ? 'Reclamación' : 'Queja'}
                    </span>
                  </td>
                  <td>
                    <div className="detalle-preview">
                      {rec.detalle_reclamo.substring(0, 50)}
                      {rec.detalle_reclamo.length > 50 && '...'}
                    </div>
                  </td>
                  <td className="text-muted-enhanced">{formatDate(rec.fecha_creacion)}</td>
                  <td>
                    <span className={`status-badge-enhanced ${getEstadoBadgeClass(rec.estado)}`}>
                      {getEstadoIcon(rec.estado)}
                      {rec.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`days-badge ${daysElapsed > 10 ? 'urgent' : ''}`}>
                      {daysElapsed} {daysElapsed === 1 ? 'día' : 'días'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-action-enhanced"
                      onClick={() => handleViewDetails(rec)}
                      title="Ver detalles completos"
                    >
                      <FiEye />
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredReclamaciones.length === 0 && (
          <div className="empty-state-enhanced">
            <div className="empty-icon">
              <FiFileText />
            </div>
            <h3>No se encontraron reclamaciones</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>

      {/* Modal de Detalles Mejorado */}
    {/* Modal Mejorado */}
    <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title=""
        size="xlarge"
      >
        {selectedReclamacion && (
          <div className="reclamacion-modal-enhanced">
            {/* Header del Modal */}
            <div className="modal-header-enhanced">
              <div className="modal-header-left">
                <div className="modal-icon">
                  <FiFileText />
                </div>
                <div>
                  <h2 className="modal-title">Detalle de Reclamación</h2>
                  <p className="modal-subtitle">Código: {selectedReclamacion.codigo_reclamo}</p>
                </div>
              </div>
              <div className="modal-header-right">
                <span className={`status-badge-large ${getEstadoBadgeClass(selectedReclamacion.estado)}`}>
                  {getEstadoIcon(selectedReclamacion.estado)}
                  {selectedReclamacion.estado.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="modal-tabs">
              <button
                className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                <FiUser />
                Información del Cliente
              </button>
              <button
                className={`tab-btn ${activeTab === 'detalle' ? 'active' : ''}`}
                onClick={() => setActiveTab('detalle')}
              >
                <FiMessageSquare />
                Detalle del Reclamo
              </button>
              <button
                className={`tab-btn ${activeTab === 'respuesta' ? 'active' : ''}`}
                onClick={() => setActiveTab('respuesta')}
              >
                <FiSend />
                Responder
                {!selectedReclamacion.respuesta && (
                  <span className="notification-dot"></span>
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="modal-content-enhanced">
              {/* Tab 1: Información del Cliente */}
              {activeTab === 'info' && (
                <div className="tab-content">
                  <div className="info-section">
                    <h3 className="section-title-enhanced">
                      <FiUser />
                      Datos Personales
                    </h3>
                    <div className="info-grid">
                      <div className="info-card">
                        <div className="info-icon">
                          <FiUser />
                        </div>
                        <div className="info-content">
                          <span className="info-label">Nombre Completo</span>
                          <span className="info-value">
                            {selectedReclamacion.nombre} {selectedReclamacion.primer_apellido} {selectedReclamacion.segundo_apellido}
                          </span>
                        </div>
                      </div>

                      <div className="info-card">
                        <div className="info-icon">
                          <FiFileText />
                        </div>
                        <div className="info-content">
                          <span className="info-label">Documento de Identidad</span>
                          <span className="info-value">
                            {selectedReclamacion.tipo_documento}: {selectedReclamacion.numero_documento}
                          </span>
                        </div>
                      </div>

                      <div className="info-card">
                        <div className="info-icon">
                          <FiPhone />
                        </div>
                        <div className="info-content">
                          <span className="info-label">Teléfono</span>
                          <span className="info-value">{selectedReclamacion.celular}</span>
                        </div>
                      </div>

                      <div className="info-card">
                        <div className="info-icon">
                          <FiMail />
                        </div>
                        <div className="info-content">
                          <span className="info-label">Correo Electrónico</span>
                          <span className="info-value">{selectedReclamacion.correo_electronico}</span>
                        </div>
                      </div>

                      <div className="info-card full-width">
                        <div className="info-icon">
                          <FiMapPin />
                        </div>
                        <div className="info-content">
                          <span className="info-label">Dirección</span>
                          <span className="info-value">
                            {selectedReclamacion.direccion}<br />
                            {selectedReclamacion.distrito}, {selectedReclamacion.provincia}<br />
                            {selectedReclamacion.departamento}
                          </span>
                          {selectedReclamacion.referencia && (
                            <span className="info-hint">Ref: {selectedReclamacion.referencia}</span>
                          )}
                        </div>
                      </div>

                      {selectedReclamacion.es_menor_edad && (
                        <div className="info-card alert-card">
                          <div className="info-icon alert">
                            <FiAlertCircle />
                          </div>
                          <div className="info-content">
                            <span className="info-label">Atención Especial</span>
                            <span className="info-value">Cliente menor de edad</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="info-section">
                    <h3 className="section-title-enhanced">
                      <FiCalendar />
                      Información Adicional
                    </h3>
                    <div className="timeline-info">
                      <div className="timeline-item">
                        <div className="timeline-icon">
                          <FiCalendar />
                        </div>
                        <div className="timeline-content">
                          <span className="timeline-label">Fecha de Registro</span>
                          <span className="timeline-value">{formatDateTime(selectedReclamacion.fecha_creacion)}</span>
                        </div>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-icon">
                          <FiClock />
                        </div>
                        <div className="timeline-content">
                          <span className="timeline-label">Tiempo Transcurrido</span>
                          <span className="timeline-value">
                            {getDaysElapsed(selectedReclamacion.fecha_creacion)} días
                            {getDaysElapsed(selectedReclamacion.fecha_creacion) > 10 && (
                              <span className="timeline-alert"> - ⚠️ Urgente</span>
                            )}
                          </span>
                        </div>
                      </div>
                      {selectedReclamacion.fecha_respuesta && (
                        <div className="timeline-item">
                          <div className="timeline-icon success">
                            <FiCheckCircle />
                          </div>
                          <div className="timeline-content">
                            <span className="timeline-label">Fecha de Respuesta</span>
                            <span className="timeline-value">{formatDateTime(selectedReclamacion.fecha_respuesta)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}


              {/* Tab 2: Detalle del Reclamo */}
              {activeTab === 'detalle' && (
                <div className="tab-content">
                  <div className="info-section">
                    <h3 className="section-title-enhanced">
                      <FiInfo />
                      Información del Reclamo
                    </h3>
                    <div className="info-grid">
                      <div className="info-card">
                        <div className="info-icon tipo">
                          <FiMessageSquare />
                        </div>
                        <div className="info-content">
                          <span className="info-label">Tipo de Reclamo</span>
                          <span 
                            className="tipo-badge-large"
                            style={{ 
                              backgroundColor: `${getTipoColor(selectedReclamacion.tipo_reclamo)}15`,
                              color: getTipoColor(selectedReclamacion.tipo_reclamo),
                              borderColor: getTipoColor(selectedReclamacion.tipo_reclamo)
                            }}
                          >
                            {selectedReclamacion.tipo_reclamo === 'RECLAMACION' ? '📋 Reclamación' : '💬 Queja'}
                          </span>
                        </div>
                      </div>

                      <div className="info-card">
                        <div className="info-icon">
                          <FiPackage />
                        </div>
                        <div className="info-content">
                          <span className="info-label">Tipo de Consumo</span>
                          <span className="info-value">{selectedReclamacion.tipo_consumo}</span>
                        </div>
                      </div>

                      <div className="info-card">
                        <div className="info-icon">
                          <FiCalendar />
                        </div>
                        <div className="info-content">
                          <span className="info-label">Fecha del Reclamo</span>
                          <span className="info-value">{formatDate(selectedReclamacion.fecha_reclamo)}</span>
                        </div>
                      </div>

                      {selectedReclamacion.numero_pedido && (
                        <div className="info-card">
                          <div className="info-icon">
                            <FiFileText />
                          </div>
                          <div className="info-content">
                            <span className="info-label">N° de Pedido</span>
                            <span className="info-value code">{selectedReclamacion.numero_pedido}</span>
                          </div>
                        </div>
                      )}

                      {selectedReclamacion.proveedor && (
                        <div className="info-card">
                          <div className="info-icon">
                            <FiUser />
                          </div>
                          <div className="info-content">
                            <span className="info-label">Proveedor</span>
                            <span className="info-value">{selectedReclamacion.proveedor}</span>
                          </div>
                        </div>
                      )}

                      {selectedReclamacion.monto_reclamado && (
                        <div className="info-card">
                          <div className="info-icon price">
                            <FiDollarSign />
                          </div>
                          <div className="info-content">
                            <span className="info-label">Monto Reclamado</span>
                            <span className="info-value price">
                              S/ {parseFloat(selectedReclamacion.monto_reclamado).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fechas Relacionadas */}
                  {(selectedReclamacion.fecha_compra || selectedReclamacion.fecha_consumo || selectedReclamacion.fecha_caducidad) && (
                    <div className="info-section">
                      <h3 className="section-title-enhanced">
                        <FiCalendar />
                        Fechas Relacionadas
                      </h3>
                      <div className="dates-grid">
                        {selectedReclamacion.fecha_compra && (
                          <div className="date-item">
                            <span className="date-label">📅 Fecha de Compra</span>
                            <span className="date-value">{formatDate(selectedReclamacion.fecha_compra)}</span>
                          </div>
                        )}
                        {selectedReclamacion.fecha_consumo && (
                          <div className="date-item">
                            <span className="date-label">🍽️ Fecha de Consumo</span>
                            <span className="date-value">{formatDate(selectedReclamacion.fecha_consumo)}</span>
                          </div>
                        )}
                        {selectedReclamacion.fecha_caducidad && (
                          <div className="date-item">
                            <span className="date-label">⏰ Fecha de Caducidad</span>
                            <span className="date-value">{formatDate(selectedReclamacion.fecha_caducidad)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Descripción del Producto/Servicio */}
                  <div className="info-section">
                    <h3 className="section-title-enhanced">
                      <FiPackage />
                      Descripción del Producto/Servicio
                    </h3>
                    <div className="description-box">
                      <p>{selectedReclamacion.descripcion_producto_servicio}</p>
                    </div>
                  </div>

                  {/* Detalle de la Reclamación */}
                  <div className="info-section highlight">
                    <h3 className="section-title-enhanced">
                      <FiMessageSquare />
                      Detalle de la Reclamación
                    </h3>
                    <div className="description-box highlight">
                      <p>{selectedReclamacion.detalle_reclamo}</p>
                    </div>
                  </div>

                  {/* Pedido del Cliente */}
                  <div className="info-section important">
                    <h3 className="section-title-enhanced">
                      <FiAlertCircle />
                      Pedido del Cliente
                    </h3>
                    <div className="description-box important">
                      <p>{selectedReclamacion.pedido_cliente}</p>
                    </div>
                  </div>

                  {/* Información Legal */}
                  <div className="legal-notice-box">
                    <FiInfo />
                    <div>
                      <strong>Nota Legal:</strong> Esta reclamación debe ser respondida en un plazo máximo de 15 días calendario, 
                      pudiendo extenderse hasta 30 días según la complejidad del caso.
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Respuesta */}
              {activeTab === 'respuesta' && (
                <div className="tab-content">
                  {/* Respuesta Existente */}
                  {selectedReclamacion.respuesta && selectedReclamacion.fecha_respuesta && (
                    <div className="info-section response-existing">
                      <div className="response-header-box">
                        <div className="response-icon-success">
                          <FiCheckCircle />
                        </div>
                        <div>
                          <h3 className="section-title-enhanced">Respuesta Enviada</h3>
                          <p className="response-date">
                            Respondido el {formatDateTime(selectedReclamacion.fecha_respuesta)}
                          </p>
                        </div>
                      </div>
                      <div className="response-content-box">
                        {selectedReclamacion.respuesta}
                      </div>
                    </div>
                  )}

                  {/* Formulario de Respuesta */}
                  <div className="info-section response-form">
                    <h3 className="section-title-enhanced">
                      <FiSend />
                      {selectedReclamacion.respuesta ? 'Actualizar Respuesta' : 'Nueva Respuesta'}
                    </h3>

                    <div className="form-group-enhanced">
                      <label className="form-label-enhanced">
                        <FiInfo />
                        Estado de la Reclamación *
                      </label>
                      <select
                        className="form-input-enhanced"
                        value={nuevoEstado}
                        onChange={(e) => setNuevoEstado(e.target.value)}
                      >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="EN_PROCESO">En Proceso</option>
                        <option value="RESUELTO">Resuelto</option>
                        <option value="CERRADO">Cerrado</option>
                      </select>
                      <div className="estado-descriptions">
                        <div className={`estado-desc ${nuevoEstado === 'PENDIENTE' ? 'active' : ''}`}>
                          <FiClock /> <span>Pendiente: Reclamación recibida, esperando análisis</span>
                        </div>
                        <div className={`estado-desc ${nuevoEstado === 'EN_PROCESO' ? 'active' : ''}`}>
                          <FiAlertCircle /> <span>En Proceso: Reclamación en análisis e investigación</span>
                        </div>
                        <div className={`estado-desc ${nuevoEstado === 'RESUELTO' ? 'active' : ''}`}>
                          <FiCheckCircle /> <span>Resuelto: Solución proporcionada al cliente</span>
                        </div>
                        <div className={`estado-desc ${nuevoEstado === 'CERRADO' ? 'active' : ''}`}>
                          <FiX /> <span>Cerrado: Caso finalizado</span>
                        </div>
                      </div>
                    </div>

                    <div className="form-group-enhanced">
                      <label className="form-label-enhanced">
                        <FiMessageSquare />
                        Respuesta al Cliente *
                      </label>
                      <textarea
                        className="form-textarea-enhanced"
                        rows="8"
                        placeholder="Escriba aquí la respuesta detallada que se enviará al cliente...

Ejemplo:
Estimado/a [Nombre del Cliente],

Hemos recibido su reclamacion y hemos procedido a investigar el caso.

[Explicación detallada de la situación]

[Solución propuesta]

Quedamos a su disposición para cualquier consulta adicional.

Atentamente,
[Nombre de la empresa]"
                        value={respuesta}
                        onChange={(e) => setRespuesta(e.target.value)}
                      />
                      <div className="textarea-info">
                        <span className="char-count">
                          {respuesta.length} caracteres
                        </span>
                        <span className="textarea-hint">
                          <FiMail /> Esta respuesta será enviada por correo electrónico a: {selectedReclamacion.correo_electronico}
                        </span>
                      </div>
                    </div>

                    {/* Sugerencias de Respuesta */}
                    <div className="response-templates">
                      <h4 className="templates-title">💡 Plantillas Sugeridas</h4>
                      <div className="templates-grid">
                        <button
                          className="template-btn"
                          onClick={() => setRespuesta(
`Estimado/a ${selectedReclamacion.nombre},

Hemos recibido su reclamacion y lamentamos los inconvenientes ocasionados.

Despues de investigar su caso, hemos identificado el problema y procedido a:
- [Acción tomada 1]
- [Acción tomada 2]

Como compensacion, le ofrecemos:
- [Compensación]

Quedamos a su disposicion.

Atentamente,
Encantos SPA`
                          )}
                        >
                          <FiCheckCircle />
                          Respuesta Positiva
                        </button>

                        <button
                          className="template-btn"
                          onClick={() => setRespuesta(
`Estimado/a ${selectedReclamacion.nombre},

Gracias por contactarnos. Estamos actualmente investigando su caso.

Para poder brindarle una mejor solución, necesitamos:
- [Información adicional necesaria]

Le estaremos contactando en un plazo de [X] días con una respuesta definitiva.

Atentamente,
Encantos SPA`
                          )}
                        >
                          <FiClock />
                          En Proceso
                        </button>

                        <button
                          className="template-btn"
                          onClick={() => setRespuesta(
`Estimado/a ${selectedReclamacion.nombre},

Hemos analizado cuidadosamente su reclamación.

Después de revisar la situación, debemos informarle que:
- [Explicación de la situación]

Sin embargo, como gesto de buena voluntad, le ofrecemos:
- [Alternativa propuesta]

Quedamos a su disposición.

Atentamente,
Encantos SPA`
                          )}
                        >
                          <FiAlertCircle />
                          Alternativa
                        </button>
                      </div>
                    </div>

                    {/* Información Importante */}
                    <div className="response-warning-box">
                      <FiAlertCircle />
                      <div>
                        <strong>Importante:</strong>
                        <ul>
                          <li>La respuesta se enviará automáticamente al correo del cliente</li>
                          <li>Se debe responder en un plazo máximo de 15 días calendario</li>
                          <li>El cliente recibirá una notificación con su código de seguimiento</li>
                          <li>Esta acción quedará registrada en el sistema</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Técnico */}
            <div className="modal-footer-tech">
              <div className="tech-info-grid">
                <div className="tech-info-item">
                  <span className="tech-label">IP Address:</span>
                  <span className="tech-value">{selectedReclamacion.ip_address || 'No disponible'}</span>
                </div>
                <div className="tech-info-item">
                  <span className="tech-label">User Agent:</span>
                  <span className="tech-value">{selectedReclamacion.user_agent ? selectedReclamacion.user_agent.substring(0, 80) + '...' : 'No disponible'}</span>
                </div>
                <div className="tech-info-item">
                  <span className="tech-label">ID Interno:</span>
                  <span className="tech-value">#{selectedReclamacion.id}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-actions-enhanced">
              <button
                className="btn-modal secondary"
                onClick={handleCloseModal}
                disabled={processingResponse}
              >
                <FiX />
                Cerrar
              </button>
              {activeTab === 'respuesta' && (
                <button
                  className="btn-modal primary"
                  onClick={handleSubmitResponse}
                  disabled={processingResponse || !respuesta.trim()}
                >
                  {processingResponse ? (
                    <>
                      <div className="spinner-small"></div>
                      Enviando Respuesta...
                    </>
                  ) : (
                    <>
                      <FiSend />
                      Enviar Respuesta al Cliente
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminReclamacionesPage