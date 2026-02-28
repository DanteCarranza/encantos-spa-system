import React, { useState, useEffect } from 'react'
import { 
  FiFileText, 
  FiPlus, 
  FiDownload, 
  FiEye,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiSettings,
  FiFilter,
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiTrendingUp
} from 'react-icons/fi'
import invoicesService from '../../services/invoicesService'
import Swal from 'sweetalert2'
import './AdminInvoicesPage.css'

const AdminInvoicesPage = () => {
  const [activeTab, setActiveTab] = useState('comprobantes') // comprobantes | generar | config
  const [comprobantes, setComprobantes] = useState([])
  const [reservasSinFacturar, setReservasSinFacturar] = useState([])
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedComprobante, setSelectedComprobante] = useState(null)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedReserva, setSelectedReserva] = useState(null)

  // Filtros
  const [filters, setFilters] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    tipo_comprobante: '',
    estado: ''
  })

  // Form para generar comprobante
  const [generateForm, setGenerateForm] = useState({
    tipo_comprobante: '2', // Boleta por defecto
    tipo_documento: '1', // DNI
    numero_documento: '',
    denominacion: '',
    direccion: '',
    email: ''
  })

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    
    if (activeTab === 'comprobantes') {
      await loadComprobantes()
    } else if (activeTab === 'generar') {
      await loadReservasSinFacturar()
    } else if (activeTab === 'config') {
      await loadConfig()
    }
    
    setLoading(false)
  }

  const loadComprobantes = async () => {
    const result = await invoicesService.getInvoices(filters)
    if (result.success) {
      setComprobantes(result.data || [])
    }
  }

  const loadReservasSinFacturar = async () => {
    const result = await invoicesService.getReservasSinFacturar()
    if (result.success) {
      setReservasSinFacturar(result.data || [])
    }
  }

  const loadConfig = async () => {
    const result = await invoicesService.getConfig()
    if (result.success) {
      setConfig(result.data)
    }
  }

  const handleViewDetail = async (comprobante) => {
    const result = await invoicesService.getInvoiceDetail(comprobante.id)
    if (result.success) {
      setSelectedComprobante(result.data)
      setShowDetailModal(true)
    }
  }

  const handleOpenGenerate = (reserva) => {
    setSelectedReserva(reserva)
    setGenerateForm({
      tipo_comprobante: '2',
      tipo_documento: '1',
      numero_documento: reserva.cliente_dni || '',
      denominacion: reserva.nombre_cliente || '',
      direccion: '',
      email: reserva.email_cliente || ''
    })
    setShowGenerateModal(true)
  }

  const handleGenerateFormChange = (e) => {
    const { name, value } = e.target
    setGenerateForm(prev => ({ ...prev, [name]: value }))
    
    // Si cambia a factura, poner RUC por defecto
    if (name === 'tipo_comprobante' && value === '1') {
      setGenerateForm(prev => ({ ...prev, tipo_documento: '6' }))
    }
    // Si cambia a boleta, poner DNI por defecto
    if (name === 'tipo_comprobante' && value === '2') {
      setGenerateForm(prev => ({ ...prev, tipo_documento: '1' }))
    }
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    
    console.log('handleGenerate ejecutado') // DEBUG
    console.log('selectedReserva:', selectedReserva) // DEBUG
    console.log('generateForm:', generateForm) // DEBUG
    
    if (!selectedReserva) {
      console.error('No hay reserva seleccionada')
      return
    }
    
    // Validaciones
    if (!generateForm.numero_documento.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'El número de documento es obligatorio',
        confirmButtonColor: '#d946ef'
      })
      return
    }
  
    if (!generateForm.denominacion.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'El nombre del cliente es obligatorio',
        confirmButtonColor: '#d946ef'
      })
      return
    }
  
    if (generateForm.tipo_comprobante === '1' && generateForm.numero_documento.length !== 11) {
      Swal.fire({
        icon: 'warning',
        title: 'RUC inválido',
        text: 'El RUC debe tener 11 dígitos',
        confirmButtonColor: '#d946ef'
      })
      return
    }
  
    if (generateForm.tipo_comprobante === '2' && generateForm.numero_documento.length !== 8) {
      Swal.fire({
        icon: 'warning',
        title: 'DNI inválido',
        text: 'El DNI debe tener 8 dígitos',
        confirmButtonColor: '#d946ef'
      })
      return
    }
  
    const confirm = await Swal.fire({
      icon: 'question',
      title: '¿Generar comprobante?',
      html: `
        <p>Se generará una <strong>${generateForm.tipo_comprobante === '1' ? 'FACTURA' : 'BOLETA'}</strong></p>
        <p><strong>Cliente:</strong> ${generateForm.denominacion}</p>
        <p><strong>Monto:</strong> S/ ${parseFloat(selectedReserva.precio_servicio).toFixed(2)}</p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, generar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d946ef',
      cancelButtonColor: '#64748b'
    })
  
    if (!confirm.isConfirmed) {
      console.log('Usuario canceló la generación')
      return
    }
  
    console.log('Iniciando generación de comprobante...') // DEBUG
  
    Swal.fire({
      title: 'Generando comprobante...',
      html: 'Enviando a SUNAT, por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })
  
    try {
      console.log('Llamando a invoicesService.generarComprobante...') // DEBUG
      
      const result = await invoicesService.generarComprobante(
        selectedReserva.id,
        generateForm.tipo_comprobante,
        {
          tipo_documento: generateForm.tipo_documento,
          numero_documento: generateForm.numero_documento,
          denominacion: generateForm.denominacion,
          direccion: generateForm.direccion,
          email: generateForm.email
        }
      )
  
      console.log('Resultado de invoicesService:', result) // DEBUG
  
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Comprobante Generado',
          html: `
            <p><strong>Serie:</strong> ${result.data.response.serie}</p>
            <p><strong>Número:</strong> ${result.data.response.numero}</p>
            <p><strong>Estado SUNAT:</strong> ${result.data.response.aceptada_por_sunat ? 'Aceptado ✅' : 'Aceptado ✅'}</p>
            <p class="text-sm">${result.data.response.sunat_description}</p>
          `,
          confirmButtonColor: '#d946ef'
        })
        setShowGenerateModal(false)
        loadReservasSinFacturar()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message,
          confirmButtonColor: '#d946ef'
        })
      }
    } catch (error) {
      console.error('Error en handleGenerate:', error) // DEBUG
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al generar el comprobante: ' + error.message,
        confirmButtonColor: '#d946ef'
      })
    }
  }

  const handleDownloadPDF = (comprobante) => {
    if (comprobante.pdf_base64) {
      invoicesService.downloadPDF(
        comprobante.pdf_base64,
        `${comprobante.serie}-${comprobante.numero}.pdf`
      )
    } else if (comprobante.enlace_pdf) {
      window.open(comprobante.enlace_pdf, '_blank')
    } else {
      Swal.fire({
        icon: 'info',
        title: 'PDF no disponible',
        text: 'El PDF aún no está disponible',
        confirmButtonColor: '#d946ef'
      })
    }
  }

  const handleAnular = async (comprobante) => {
    const confirm = await Swal.fire({
      icon: 'warning',
      title: '¿Anular comprobante?',
      html: `
        <p>¿Estás seguro de anular el comprobante <strong>${comprobante.serie}-${comprobante.numero}</strong>?</p>
        <p class="text-sm text-red-600">Esta acción no se puede deshacer</p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b'
    })

    if (confirm.isConfirmed) {
      const result = await invoicesService.anularComprobante(comprobante.id)
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Comprobante anulado',
          confirmButtonColor: '#d946ef'
        })
        loadComprobantes()
      }
    }
  }

  const getTipoComprobanteLabel = (tipo) => {
    const tipos = {
      '1': 'Factura',
      '2': 'Boleta',
      '3': 'Nota de Crédito',
      '7': 'Nota de Débito'
    }
    return tipos[tipo] || 'Desconocido'
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      aceptado: { label: 'Aceptado', color: '#10b981' },
      enviado: { label: 'Enviado', color: '#3b82f6' },
      aceptado: { label: 'Aceptado', color: '#10b981' },
      aceptado: { label: 'Aceptado', color: '#10b981' },
      anulado: { label: 'Anulado', color: '#64748b' }
    }
    return badges[estado] || badges.aceptado
  }

  const formatPrice = (price) => {
    return `S/ ${parseFloat(price).toFixed(2)}`
  }

  return (
    <div className="admin-invoices-page">
      <div className="invoices-container">
        {/* Header */}
        <div className="invoices-header">
          <div className="header-left">
            <div className="header-icon">
              <FiFileText />
            </div>
            <div>
              <h1>Facturación Electrónica</h1>
              <p>Gestión de comprobantes con Nubefact</p>
            </div>
          </div>
          
          {config && (
            <div className="ambiente-badge">
              <span className={`badge-ambiente ${config.ambiente}`}>
                {config.ambiente === 'demo' ? '🧪 MODO DEMO' : '✅ PRODUCCIÓN'}
              </span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="invoices-tabs">
          <button
            className={`tab-btn ${activeTab === 'comprobantes' ? 'active' : ''}`}
            onClick={() => setActiveTab('comprobantes')}
          >
            <FiFileText />
            Comprobantes
          </button>
          <button
            className={`tab-btn ${activeTab === 'generar' ? 'active' : ''}`}
            onClick={() => setActiveTab('generar')}
          >
            <FiPlus />
            Generar Nuevo
          </button>
          <button
            className={`tab-btn ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => setActiveTab('config')}
          >
            <FiSettings />
            Configuración
          </button>
        </div>

        {/* Content */}
        <div className="invoices-content">
          {loading ? (
            <div className="loading-invoices">
              <div className="spinner-large"></div>
              <p>Cargando...</p>
            </div>
          ) : (
            <>
              {/* TAB: Comprobantes */}
              {activeTab === 'comprobantes' && (
                <div className="comprobantes-tab">
                  {/* Filtros */}
                  <div className="filters-card">
                    <div className="filters-grid">
                      <div className="filter-group">
                        <label>Fecha Inicio</label>
                        <input
                          type="date"
                          className="filter-input"
                          value={filters.fecha_inicio}
                          onChange={(e) => setFilters(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                        />
                      </div>
                      <div className="filter-group">
                        <label>Fecha Fin</label>
                        <input
                          type="date"
                          className="filter-input"
                          value={filters.fecha_fin}
                          onChange={(e) => setFilters(prev => ({ ...prev, fecha_fin: e.target.value }))}
                        />
                      </div>
                      <div className="filter-group">
                        <label>Tipo</label>
                        <select
                          className="filter-input"
                          value={filters.tipo_comprobante}
                          onChange={(e) => setFilters(prev => ({ ...prev, tipo_comprobante: e.target.value }))}
                        >
                          <option value="">Todos</option>
                          <option value="1">Factura</option>
                          <option value="2">Boleta</option>
                        </select>
                      </div>
                      <div className="filter-group">
                        <label>Estado</label>
                        <select
                          className="filter-input"
                          value={filters.estado}
                          onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
                        >
                          <option value="">Todos</option>
                          <option value="aceptado">Aceptado</option>
                          <option value="aceptado">Aceptado</option>
                          <option value="anulado">Anulado</option>
                        </select>
                      </div>
                    </div>
                    <button className="btn-filter" onClick={loadComprobantes}>
                      <FiFilter />
                      Filtrar
                    </button>
                  </div>

                  {/* Lista de comprobantes */}
                  {comprobantes.length === 0 ? (
                    <div className="empty-state">
                      <FiFileText />
                      <h3>No hay comprobantes</h3>
                      <p>Genera tu primer comprobante electrónico</p>
                    </div>
                  ) : (
                    <div className="comprobantes-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Tipo</th>
                            <th>Serie - Número</th>
                            <th>Cliente</th>
                            <th>Fecha</th>
                            <th>Monto</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comprobantes.map(comp => (
                            <tr key={comp.id}>
                              <td>
                                <span className={`tipo-badge tipo-${comp.tipo_comprobante}`}>
                                  {getTipoComprobanteLabel(comp.tipo_comprobante)}
                                </span>
                              </td>
                              <td className="font-mono">{comp.serie}-{comp.numero}</td>
                              <td>{comp.cliente_denominacion}</td>
                              <td>{new Date(comp.fecha_creacion).toLocaleDateString('es-PE')}</td>
                              <td className="font-bold">{formatPrice(comp.total)}</td>
                              <td>
                                <span 
                                  className="estado-badge"
                                  style={{ 
                                    backgroundColor: getEstadoBadge(comp.estado).color + '20',
                                    color: getEstadoBadge(comp.estado).color
                                  }}
                                >
                                  {getEstadoBadge(comp.estado).label}
                                </span>
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button
                                    className="action-btn view"
                                    onClick={() => handleViewDetail(comp)}
                                    title="Ver detalle"
                                  >
                                    <FiEye />
                                  </button>
                                  <button
                                    className="action-btn download"
                                    onClick={() => handleDownloadPDF(comp)}
                                    title="Descargar PDF"
                                  >
                                    <FiDownload />
                                  </button>
                                  {comp.estado !== 'anulado' && (
                                    <button
                                      className="action-btn delete"
                                      onClick={() => handleAnular(comp)}
                                      title="Anular"
                                    >
                                      <FiX />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Generar Nuevo */}
              {activeTab === 'generar' && (
                <div className="generar-tab">
                  <div className="info-card">
                    <FiAlertCircle />
                    <p>Selecciona una reserva completada para generar su comprobante electrónico</p>
                  </div>

                  {reservasSinFacturar.length === 0 ? (
                    <div className="empty-state">
                      <FiCheck />
                      <h3>Todo facturado</h3>
                      <p>No hay reservas pendientes de facturar</p>
                    </div>
                  ) : (
                    <div className="reservas-grid">
                      {reservasSinFacturar.map(reserva => (
                        <div key={reserva.id} className="reserva-card">
                          <div className="reserva-header">
                            <span className="reserva-codigo">{reserva.codigo}</span>
                            <span className="reserva-fecha">
                              {new Date(reserva.fecha_reserva).toLocaleDateString('es-PE')}
                            </span>
                          </div>
                          <div className="reserva-body">
                            <h4>{reserva.servicio_nombre}</h4>
                            <div className="reserva-cliente">
                              <FiUser />
                              <span>{reserva.nombre_cliente}</span>
                            </div>
                            <div className="reserva-precio">
                              <FiDollarSign />
                              <span>{formatPrice(reserva.precio_servicio)}</span>
                            </div>
                          </div>
                          <button 
                            className="btn-generate"
                            onClick={() => handleOpenGenerate(reserva)}
                          >
                            <FiFileText />
                            Generar Comprobante
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Configuración */}
              {activeTab === 'config' && config && (
                <div className="config-tab">
                  <div className="config-card">
                    <h3>Configuración de Nubefact</h3>
                    
                    <div className="config-grid">
                      <div className="config-item">
                        <label>Ambiente</label>
                        <span className={`badge-ambiente ${config.ambiente}`}>
                          {config.ambiente === 'demo' ? 'DEMO' : 'PRODUCCIÓN'}
                        </span>
                      </div>

                      <div className="config-item">
                        <label>Serie Boletas</label>
                        <span className="config-value">{config.serie_boleta}</span>
                      </div>

                      <div className="config-item">
                        <label>Serie Facturas</label>
                        <span className="config-value">{config.serie_factura}</span>
                      </div>

                      <div className="config-item">
                        <label>Numeración Boleta</label>
                        <span className="config-value">{config.numero_boleta}</span>
                      </div>

                      <div className="config-item">
                        <label>Numeración Factura</label>
                        <span className="config-value">{config.numero_factura}</span>
                      </div>

                      <div className="config-item">
                        <label>RUC Emisor</label>
                        <span className="config-value">{config.emisor_ruc || 'No configurado'}</span>
                      </div>

                      <div className="config-item full-width">
                        <label>Razón Social</label>
                        <span className="config-value">{config.emisor_razon_social || 'No configurado'}</span>
                      </div>
                    </div>

                    <div className="config-alert">
                      <FiAlertCircle />
                      <p>Para cambiar la configuración, contacta al administrador del sistema</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal: Generar Comprobante */}
      {showGenerateModal && selectedReserva && (
        <div className="modal-overlay" onClick={() => setShowGenerateModal(false)}>
          <div className="modal-content-invoice" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Generar Comprobante Electrónico</h3>
              <button onClick={() => setShowGenerateModal(false)}>
                <FiX />
              </button>
            </div>

            <form className="modal-body" onSubmit={handleGenerate}>
              <div className="reserva-info-box">
                <h4>Datos de la Reserva</h4>
                <p><strong>Código:</strong> {selectedReserva.codigo}</p>
                <p><strong>Servicio:</strong> {selectedReserva.servicio_nombre}</p>
                <p><strong>Monto:</strong> {formatPrice(selectedReserva.precio_servicio)}</p>
              </div>

              <div className="form-group">
                <label>Tipo de Comprobante *</label>
                <select
                  name="tipo_comprobante"
                  className="form-input"
                  value={generateForm.tipo_comprobante}
                  onChange={handleGenerateFormChange}
                  required
                >
                  <option value="2">Boleta de Venta</option>
                  <option value="1">Factura</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo Doc. *</label>
                  <select
                    name="tipo_documento"
                    className="form-input"
                    value={generateForm.tipo_documento}
                    onChange={handleGenerateFormChange}
                    required
                  >
                    {generateForm.tipo_comprobante === '1' ? (
                      <option value="6">RUC</option>
                    ) : (
                      <>
                        <option value="1">DNI</option>
                        <option value="4">C.E.</option>
                        <option value="7">Pasaporte</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>Número Doc. *</label>
                  <input
                    type="text"
                    name="numero_documento"
                    className="form-input"
                    value={generateForm.numero_documento}
                    onChange={handleGenerateFormChange}
                    placeholder={generateForm.tipo_comprobante === '1' ? '20123456789' : '12345678'}
                    maxLength={generateForm.tipo_comprobante === '1' ? 11 : 8}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Razón Social / Nombre *</label>
                <input
                  type="text"
                  name="denominacion"
                  className="form-input"
                  value={generateForm.denominacion}
                  onChange={handleGenerateFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  className="form-input"
                  value={generateForm.direccion}
                  onChange={handleGenerateFormChange}
                  placeholder="Dirección fiscal"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={generateForm.email}
                  onChange={handleGenerateFormChange}
                  placeholder="correo@ejemplo.com"
                />
                <small>El comprobante se enviará automáticamente a este correo</small>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowGenerateModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <FiCheck />
                  Generar y Enviar a SUNAT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ver Detalle */}
      {showDetailModal && selectedComprobante && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content-invoice detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle del Comprobante</h3>
              <button onClick={() => setShowDetailModal(false)}>
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h4>Información General</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Tipo:</span>
                    <span>{getTipoComprobanteLabel(selectedComprobante.tipo_comprobante)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Serie - Número:</span>
                    <span className="font-mono">{selectedComprobante.serie}-{selectedComprobante.numero}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Estado:</span>
                    <span 
                      className="estado-badge"
                      style={{ 
                        backgroundColor: getEstadoBadge(selectedComprobante.estado).color + '20',
                        color: getEstadoBadge(selectedComprobante.estado).color
                      }}
                    >
                      {getEstadoBadge(selectedComprobante.estado).label}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Fecha Emisión:</span>
                    <span>{new Date(selectedComprobante.fecha_creacion).toLocaleDateString('es-PE')}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Cliente</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Documento:</span>
                    <span>{selectedComprobante.cliente_numero_documento}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="label">Razón Social:</span>
                    <span>{selectedComprobante.cliente_denominacion}</span>
                  </div>
                  {selectedComprobante.cliente_direccion && (
                    <div className="detail-item full-width">
                      <span className="label">Dirección:</span>
                      <span>{selectedComprobante.cliente_direccion}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h4>Montos</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Subtotal:</span>
                    <span>{formatPrice(selectedComprobante.total_gravada)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">IGV (18%):</span>
                    <span>{formatPrice(selectedComprobante.total_igv)}</span>
                  </div>
                  <div className="detail-item total">
                    <span className="label">TOTAL:</span>
                    <span className="font-bold">{formatPrice(selectedComprobante.total)}</span>
                  </div>
                </div>
              </div>

              {selectedComprobante.items && selectedComprobante.items.length > 0 && (
                <div className="detail-section">
                  <h4>Items</h4>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Descripción</th>
                        <th>Cant.</th>
                        <th>P. Unit.</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedComprobante.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.descripcion}</td>
                          <td>{item.cantidad}</td>
                          <td>{formatPrice(item.precio_unitario)}</td>
                          <td>{formatPrice(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedComprobante.sunat_description && (
                <div className="detail-section">
                  <h4>Respuesta SUNAT</h4>
                  <div className={`sunat-response ${selectedComprobante.aceptada_por_sunat ? 'success' : 'error'}`}>
                    {selectedComprobante.aceptada_por_sunat ? <FiCheck /> : <FiX />}
                    <p>{selectedComprobante.sunat_description}</p>
                  </div>
                </div>
              )}

              {selectedComprobante.enlace && (
                <div className="detail-section">
                  <h4>Enlaces</h4>
                  <div className="links-grid">
                    {selectedComprobante.enlace_pdf && (
                      <a href={selectedComprobante.enlace_pdf} target="_blank" rel="noopener noreferrer" className="link-btn">
                        <FiDownload />
                        Ver PDF
                      </a>
                    )}
                    {selectedComprobante.enlace_xml && (
                      <a href={selectedComprobante.enlace_xml} target="_blank" rel="noopener noreferrer" className="link-btn">
                        <FiDownload />
                        Ver XML
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminInvoicesPage