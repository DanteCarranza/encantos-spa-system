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
  FiDollarSign,
  FiUser
} from 'react-icons/fi'
import aulaVirtualService from '../../services/aulaVirtualService'
import Swal from 'sweetalert2'
import './ComprobantesPage.css'

const ComprobantesPage = () => {
  const [activeTab, setActiveTab] = useState('comprobantes') // comprobantes | generar | config
  const [comprobantes, setComprobantes] = useState([])
  const [pagosSinFacturar, setPagosSinFacturar] = useState([])
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedComprobante, setSelectedComprobante] = useState(null)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedPago, setSelectedPago] = useState(null)

  const [filters, setFilters] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    tipo_comprobante: ''
  })

  const [generateForm, setGenerateForm] = useState({
    tipo_comprobante: '01', // Factura por defecto (único disponible)
    tipo_documento: '6', // DNI
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
      await loadPagosSinFacturar()
    } else if (activeTab === 'config') {
      await loadConfig()
    }
    
    setLoading(false)
  }

  const loadComprobantes = async () => {
    const result = await aulaVirtualService.getComprobantes(filters)
    if (result.success) {
      setComprobantes(result.data || [])
    }
  }

  const loadPagosSinFacturar = async () => {
    const result = await aulaVirtualService.getPagosSinFacturar()
    if (result.success) {
      setPagosSinFacturar(result.data || [])
    }
  }

  const loadConfig = async () => {
    const result = await aulaVirtualService.getNubefactConfig()
    if (result.success) {
      setConfig(result.data)
    }
  }

  const handleViewDetail = async (comprobante) => {
    const result = await aulaVirtualService.getComprobanteDetail(comprobante.id)
    if (result.success) {
      setSelectedComprobante(result.data)
      setShowDetailModal(true)
    }
  }

  const handleOpenGenerate = (pago) => {
    setSelectedPago(pago)
    setGenerateForm({
      tipo_comprobante: '01', // Solo factura disponible
      tipo_documento: '6',
      numero_documento: '',
      denominacion: pago.estudiante_nombre,
      direccion: '',
      email: pago.email || ''
    })
    setShowGenerateModal(true)
  }

  const handleGenerateFormChange = (e) => {
    const { name, value } = e.target
    setGenerateForm(prev => ({ ...prev, [name]: value }))
    
    if (name === 'tipo_comprobante' && value === '01') {
      setGenerateForm(prev => ({ ...prev, tipo_documento: '6' }))
    }
    if (name === 'tipo_comprobante' && value === '03') {
      setGenerateForm(prev => ({ ...prev, tipo_documento: '1' }))
    }
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    
    if (!selectedPago) return
    
    // Validaciones
    if (!generateForm.numero_documento.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'El número de documento es obligatorio',
        confirmButtonColor: '#3b82f6'
      })
      return
    }

    if (generateForm.tipo_comprobante === '01' && generateForm.numero_documento.length !== 11) {
      Swal.fire({
        icon: 'warning',
        title: 'RUC inválido',
        text: 'El RUC debe tener 11 dígitos',
        confirmButtonColor: '#3b82f6'
      })
      return
    }

    if (generateForm.tipo_comprobante === '03' && generateForm.numero_documento.length !== 8) {
      Swal.fire({
        icon: 'warning',
        title: 'DNI inválido',
        text: 'El DNI debe tener 8 dígitos',
        confirmButtonColor: '#3b82f6'
      })
      return
    }

    const confirm = await Swal.fire({
      icon: 'question',
      title: '¿Generar comprobante?',
      html: `
        <p>Se generará una <strong>${generateForm.tipo_comprobante === '01' ? 'FACTURA' : 'BOLETA'}</strong></p>
        <p><strong>Cliente:</strong> ${generateForm.denominacion}</p>
        <p><strong>Monto:</strong> S/ ${parseFloat(selectedPago.monto_total).toFixed(2)}</p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, generar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b'
    })

    if (!confirm.isConfirmed) return

    Swal.fire({
      title: 'Generando comprobante...',
      html: 'Enviando a SUNAT, por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    const result = await aulaVirtualService.generarComprobante(
      selectedPago.id,
      generateForm.tipo_comprobante,
      {
        tipo_documento: generateForm.tipo_documento,
        numero_documento: generateForm.numero_documento,
        denominacion: generateForm.denominacion,
        direccion: generateForm.direccion,
        email: generateForm.email
      }
    )

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Comprobante Generado',
        html: `
          <p><strong>Serie:</strong> ${result.data.response.serie}</p>
          <p><strong>Número:</strong> ${result.data.response.numero}</p>
          <p><strong>Estado SUNAT:</strong> ${result.data.response.aceptada_por_sunat ? 'Aceptado ✅' : 'Rechazado ❌'}</p>
          <p class="text-sm">${result.data.response.sunat_description || ''}</p>
        `,
        confirmButtonColor: '#3b82f6'
      })
      setShowGenerateModal(false)
      loadPagosSinFacturar()
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.message,
        confirmButtonColor: '#3b82f6'
      })
    }
  }

  const getTipoComprobanteLabel = (tipo) => {
    const tipos = {
      '01': 'Factura',
      '03': 'Boleta',
      '07': 'Nota de Crédito',
      '08': 'Nota de Débito'
    }
    return tipos[tipo] || 'Desconocido'
  }

  return (
    <div className="comprobantes-page">
      <div className="comprobantes-container">
        {/* Header */}
        <div className="comprobantes-header">
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
        <div className="comprobantes-tabs">
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
        <div className="comprobantes-content">
          {loading ? (
            <div className="loading-comprobantes">
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
                          value={filters.fecha_inicio}
                          onChange={(e) => setFilters(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                        />
                      </div>
                      <div className="filter-group">
                        <label>Fecha Fin</label>
                        <input
                          type="date"
                          value={filters.fecha_fin}
                          onChange={(e) => setFilters(prev => ({ ...prev, fecha_fin: e.target.value }))}
                        />
                      </div>
                      <div className="filter-group">
                        <label>Tipo</label>
                        <select
                          value={filters.tipo_comprobante}
                          onChange={(e) => setFilters(prev => ({ ...prev, tipo_comprobante: e.target.value }))}
                        >
                          <option value="">Todos</option>
                          <option value="01">Factura</option>
                          <option value="03">Boleta</option>
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
                            <th>Estudiante</th>
                            <th>Curso</th>
                            <th>Fecha</th>
                            <th>Monto</th>
                            <th>SUNAT</th>
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
                              <td className="font-bold">{comp.estudiante_nombre}</td>
                              <td>{comp.curso_nombre}</td>
                              <td>{aulaVirtualService.formatDate(comp.fecha_emision)}</td>
                              <td className="font-bold">
                                {aulaVirtualService.formatPrice(comp.monto_total)}
                              </td>
                              <td>
                                <span className={`sunat-badge ${comp.aceptada_sunat ? 'success' : 'error'}`}>
                                  {comp.aceptada_sunat ? '✅ Aceptado' : '❌ Rechazado'}
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
                                  {comp.enlace_pdf && (
                                    
                                     <a href={comp.enlace_pdf}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="action-btn download"
                                      title="Descargar PDF"
                                    >
                                      <FiDownload />
                                    </a>
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
                    <p>Selecciona un pago completado para generar su comprobante electrónico</p>
                  </div>

                  {pagosSinFacturar.length === 0 ? (
                    <div className="empty-state">
                      <FiCheck />
                      <h3>Todo facturado</h3>
                      <p>No hay pagos pendientes de facturar</p>
                    </div>
                  ) : (
                    <div className="pagos-grid">
                      {pagosSinFacturar.map(pago => (
                        <div key={pago.id} className="pago-card">
                          <div className="pago-header">
                            <span className="pago-id">#{pago.id}</span>
                            <span className="pago-fecha">
                              {aulaVirtualService.formatDate(pago.fecha_pago)}
                            </span>
                          </div>
                          <div className="pago-body">
                            <h4>{pago.curso_nombre}</h4>
                            <div className="pago-estudiante">
                              <FiUser />
                              <span>{pago.estudiante_nombre}</span>
                            </div>
                            <div className="pago-monto">
                              <FiDollarSign />
                              <span>{aulaVirtualService.formatPrice(pago.monto_total)}</span>
                            </div>
                          </div>
                          <button 
                            className="btn-generate"
                            onClick={() => handleOpenGenerate(pago)}
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
                      <p>La configuración es compartida con el módulo SPA. Los cambios se aplican a todos los módulos.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal: Generar Comprobante */}
      {showGenerateModal && selectedPago && (
        <div className="modal-overlay" onClick={() => setShowGenerateModal(false)}>
          <div className="modal-content-invoice" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Generar Comprobante Electrónico</h3>
              <button onClick={() => setShowGenerateModal(false)}>
                <FiX />
              </button>
            </div>

            <form className="modal-body" onSubmit={handleGenerate}>
              <div className="pago-info-box">
                <h4>Datos del Pago</h4>
                <p><strong>ID:</strong> #{selectedPago.id}</p>
                <p><strong>Curso:</strong> {selectedPago.curso_nombre}</p>
                <p><strong>Estudiante:</strong> {selectedPago.estudiante_nombre}</p>
                <p><strong>Monto:</strong> {aulaVirtualService.formatPrice(selectedPago.monto_total)}</p>
              </div>

              <div className="form-group">
                <label>Tipo de Comprobante *</label>
                <select
                  name="tipo_comprobante"
                  value={generateForm.tipo_comprobante}
                  onChange={handleGenerateFormChange}
                  required
                >
                     <option value="01">Factura</option>

                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo Doc. *</label>
                  <select
                    name="tipo_documento"
                    value={generateForm.tipo_documento}
                    onChange={handleGenerateFormChange}
                    required
                  >
                    {generateForm.tipo_comprobante === '01' ? (
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
                    value={generateForm.numero_documento}
                    onChange={handleGenerateFormChange}
                    placeholder={generateForm.tipo_comprobante === '01' ? '20123456789' : '12345678'}
                    maxLength={generateForm.tipo_comprobante === '01' ? 11 : 8}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Razón Social / Nombre *</label>
                <input
                  type="text"
                  name="denominacion"
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
                    <span className="label">Fecha Emisión:</span>
                    <span>{aulaVirtualService.formatDate(selectedComprobante.fecha_emision)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Estado SUNAT:</span>
                    <span className={selectedComprobante.aceptada_sunat ? 'text-green' : 'text-red'}>
                      {selectedComprobante.aceptada_sunat ? '✅ Aceptado' : '❌ Rechazado'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Estudiante</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Nombre:</span>
                    <span>{selectedComprobante.estudiante_nombre}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span>{selectedComprobante.email}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Curso</h4>
                <div className="detail-grid">
                  <div className="detail-item full-width">
                    <span className="label">Nombre:</span>
                    <span>{selectedComprobante.curso_nombre}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Monto</h4>
                <div className="detail-grid">
                  <div className="detail-item total">
                    <span className="label">TOTAL:</span>
                    <span className="font-bold">{aulaVirtualService.formatPrice(selectedComprobante.monto_total)}</span>
                  </div>
                </div>
              </div>

              {selectedComprobante.enlace_pdf && (
                <div className="detail-section">
                  <h4>Enlaces</h4>
                  <div className="links-grid">
                    <a 
                      href={selectedComprobante.enlace_pdf} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="link-btn"
                    >
                      <FiDownload />
                      Ver PDF
                    </a>
                    {selectedComprobante.enlace_xml && (
                      <a 
                        href={selectedComprobante.enlace_xml} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="link-btn"
                      >
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

export default ComprobantesPage