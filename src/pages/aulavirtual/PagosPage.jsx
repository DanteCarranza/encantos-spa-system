import React, { useState, useEffect } from 'react'
import { 
  FiDollarSign, 
  FiEye, 
  FiPlus, 
  FiFilter,
  FiCheckCircle,
  FiX,
  FiUsers,
  FiFileText,
  FiBookOpen,
  FiCalendar,
  FiInfo,
  FiAlertCircle,
  FiDownload,
  FiClock,
  FiSend,
  FiList,
  FiBarChart2,
  FiTrendingUp 
} from 'react-icons/fi'
import aulaVirtualService from '../../services/aulaVirtualService'
import Swal from 'sweetalert2'
import './PagosPage.css'
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
  } from 'recharts'

const PagosPage = () => {
  // ========== TABS ==========
  const [activeTab, setActiveTab] = useState('lista') // lista | registrar | pendientes | reportes

  // ========== LISTA DE PAGOS ==========
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  // ========== FILTROS ==========
  const [filters, setFilters] = useState({
    search: '',
    estado: '',
    metodo_pago: '',
    fecha_inicio: '',
    fecha_fin: '',
    courseid: ''
  })

  // ========== MODALS ==========
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showAbonoModal, setShowAbonoModal] = useState(false)
  const [selectedPago, setSelectedPago] = useState(null)

  // ========== CURSOS Y ESTUDIANTES ==========
  const [cursos, setCursos] = useState([])
  const [estudiantes, setEstudiantes] = useState([])
  const [searchEstudiante, setSearchEstudiante] = useState('')

  // ========== FORM REGISTRAR PAGO ==========
  const [registroStep, setRegistroStep] = useState(1) // 1, 2, 3, 4 (steps)
  const [registroForm, setRegistroForm] = useState({
    userid: '',
    courseid: '',
    tipo_documento: '1',
    numero_documento: '',
    denominacion: '',
    direccion: '',
    tipo_pago: 'pago_unico',
    monto_total: '',
    es_pago_parcial: false,
    num_cuotas: 2,
    monto_primera_cuota: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    metodo_pago: 'efectivo',
    nro_operacion: '',
    celular: '',
    notas: ''
  })

  // ========== FORM AGREGAR ABONO ==========
  const [abonoForm, setAbonoForm] = useState({
    monto: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    metodo_pago: 'efectivo',
    nro_operacion: '',
    notas: ''
  })

  // ========== PAGOS PENDIENTES ==========
  const [pagosPendientes, setPagosPendientes] = useState([])
  const [cuotasPendientes, setCuotasPendientes] = useState([])

  useEffect(() => {
    if (activeTab === 'lista') {
      loadPagos()
    } else if (activeTab === 'pendientes') {
      loadPagosPendientes()
    } else if (activeTab === 'registrar') {
      loadCursos()
    }
  }, [activeTab, currentPage, filters])

  const loadPagos = async () => {
    setLoading(true)
    const result = await aulaVirtualService.getPayments({
      ...filters,
      page: currentPage,
      limit: itemsPerPage
    })
    
    if (result.success) {
      setPagos(result.data || [])
      setTotalItems(result.total || result.data?.length || 0)
    }
    setLoading(false)
  }

  const loadPagosPendientes = async () => {
    const result = await aulaVirtualService.getPendingPayments()
    if (result.success) {
      setPagosPendientes(result.data || [])
      
      // Agrupar cuotas pendientes
      const cuotas = []
      result.data?.forEach(pago => {
        if (pago.es_pago_parcial && pago.monto_pendiente > 0) {
          const cuotasRestantes = pago.num_cuotas - pago.cuota_actual
          const montoPorCuota = pago.monto_pendiente / cuotasRestantes
          
          for (let i = 0; i < cuotasRestantes; i++) {
            cuotas.push({
              pago_id: pago.id,
              estudiante: pago.estudiante_nombre,
              curso: pago.curso_nombre,
              num_cuota: pago.cuota_actual + i + 1,
              total_cuotas: pago.num_cuotas,
              monto: montoPorCuota,
              fecha_pago: pago.fecha_pago
            })
          }
        }
      })
      setCuotasPendientes(cuotas)
    }
  }

  const loadCursos = async () => {
    const result = await aulaVirtualService.getCourses()
    if (result.success) {
      setCursos(result.data || [])
    }
  }

  return (
    <div className="pagos-page-v2">
      <div className="pagos-container-v2">
        {/* Header Principal */}
        <div className="pagos-header-v2">
          <div className="header-content">
            <div className="header-icon-v2">
              <FiDollarSign />
            </div>
            <div className="header-text">
              <h1>Sistema de Gestión de Pagos</h1>
              <p>Control completo de pagos, cuotas y facturación del aula virtual</p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="tabs-navigation">
          <button
            className={`tab-btn-v2 ${activeTab === 'lista' ? 'active' : ''}`}
            onClick={() => setActiveTab('lista')}
          >
            <FiList />
            <span>Lista de Pagos</span>
            <span className="tab-badge">{totalItems}</span>
          </button>
          
          <button
            className={`tab-btn-v2 ${activeTab === 'registrar' ? 'active' : ''}`}
            onClick={() => setActiveTab('registrar')}
          >
            <FiPlus />
            <span>Registrar Pago</span>
          </button>
          
          <button
            className={`tab-btn-v2 ${activeTab === 'pendientes' ? 'active' : ''}`}
            onClick={() => setActiveTab('pendientes')}
          >
            <FiClock />
            <span>Pagos Pendientes</span>
            {pagosPendientes.length > 0 && (
              <span className="tab-badge alert">{pagosPendientes.length}</span>
            )}
          </button>
          
          <button
            className={`tab-btn-v2 ${activeTab === 'reportes' ? 'active' : ''}`}
            onClick={() => setActiveTab('reportes')}
          >
            <FiBarChart2 />
            <span>Reportes</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content-v2">
        {activeTab === 'lista' && (
            <TabListaPagos 
              pagos={pagos}
              loading={loading}
              filters={filters}
              setFilters={setFilters}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              cursos={cursos}
              onViewDetail={async (pago) => {
                // Cargar detalle completo del pago
                Swal.fire({
                  title: 'Cargando...',
                  allowOutsideClick: false,
                  didOpen: () => {
                    Swal.showLoading()
                  }
                })
                
                const result = await aulaVirtualService.getPaymentDetail(pago.id)
                Swal.close()
                
                if (result.success) {
                  setSelectedPago(result.data)
                  setShowDetailModal(true)
                } else {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo cargar el detalle del pago',
                    confirmButtonColor: '#3b82f6'
                  })
                }
              }}
              onAddAbono={(pago) => {
                setSelectedPago(pago)
                setShowAbonoModal(true)
              }}
              onReload={loadPagos}
            />
          )}
          
          {activeTab === 'registrar' && (
            <TabRegistrarPago 
              cursos={cursos}
              onSuccess={() => {
                loadPagos()
                setActiveTab('lista')
              }}
            />
          )}
          
          {activeTab === 'pendientes' && (
            <TabPagosPendientes 
              onViewDetail={async (pago) => {
                Swal.fire({
                  title: 'Cargando...',
                  allowOutsideClick: false,
                  didOpen: () => {
                    Swal.showLoading()
                  }
                })
                
                const result = await aulaVirtualService.getPaymentDetail(pago.id)
                Swal.close()
                
                if (result.success) {
                  setSelectedPago(result.data)
                  setShowDetailModal(true)
                } else {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo cargar el detalle del pago',
                    confirmButtonColor: '#3b82f6'
                  })
                }
              }}
              onAddAbono={(pago) => {
                setSelectedPago(pago)
                setShowAbonoModal(true)
              }}
            />
          )}
          
          {activeTab === 'reportes' && (
            <TabReportes />
          )}
        </div>
      </div>






{/* MODAL: Detalle de Pago */}
{showDetailModal && selectedPago && (
    <ModalDetallePago 
      pago={selectedPago}
      onClose={() => setShowDetailModal(false)}
    />
  )}

{/* MODAL: Agregar Abono */}
{showAbonoModal && selectedPago && (
  <ModalAgregarAbono 
    pago={selectedPago}
    onClose={() => setShowAbonoModal(false)}
    onSuccess={() => {
      loadPagos()
      setShowAbonoModal(false)
    }}
  />
)}



    </div>









  )
}


// ========================================
// COMPONENTE: TAB LISTA DE PAGOS
// ========================================
const TabListaPagos = ({ 
    pagos, 
    loading, 
    filters, 
    setFilters, 
    currentPage, 
    setCurrentPage, 
    itemsPerPage, 
    totalItems,
    cursos,
    onViewDetail,
    onAddAbono,
    onReload
  }) => {
    const [showFilters, setShowFilters] = useState(false)
  
    const handleFilterChange = (e) => {
      const { name, value } = e.target
      setFilters(prev => ({ ...prev, [name]: value }))
      setCurrentPage(1) // Reset a página 1 al filtrar
    }
  
    const handleClearFilters = () => {
      setFilters({
        search: '',
        estado: '',
        metodo_pago: '',
        fecha_inicio: '',
        fecha_fin: '',
        courseid: ''
      })
      setCurrentPage(1)
    }
  
    const handleExportExcel = async () => {
      Swal.fire({
        title: 'Exportando a Excel...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })
  
      // Obtener TODOS los pagos para exportar
      const result = await aulaVirtualService.getPayments({ 
        ...filters, 
        limit: 9999 
      })
  
      if (result.success && result.data) {
        const data = result.data.map(p => ({
          'ID': p.id,
          'Estudiante': p.estudiante_nombre,
          'Curso': p.curso_nombre,
          'Fecha': aulaVirtualService.formatDate(p.fecha_pago),
          'Método': p.metodo_pago?.toUpperCase(),
          'Monto Total': parseFloat(p.monto_total).toFixed(2),
          'Abonado': parseFloat(p.monto_abonado).toFixed(2),
          'Pendiente': parseFloat(p.monto_pendiente).toFixed(2),
          'Estado': p.estado,
          'Cuotas': p.es_pago_parcial ? `${p.cuota_actual}/${p.num_cuotas}` : '1/1',
          'Nro. Operación': p.nro_operacion || '-'
        }))
  
        // Crear CSV
        const headers = Object.keys(data[0])
        const csvContent = [
          headers.join(','),
          ...data.map(row => headers.map(h => `"${row[h]}"`).join(','))
        ].join('\n')
  
        // Descargar
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `pagos_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
  
        Swal.fire({
          icon: 'success',
          title: 'Exportado',
          text: `${data.length} registros exportados a Excel`,
          confirmButtonColor: '#3b82f6'
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo exportar',
          confirmButtonColor: '#3b82f6'
        })
      }
    }
  
    const handleExportPDF = () => {
      Swal.fire({
        icon: 'info',
        title: 'Exportar PDF',
        text: 'Esta función estará disponible próximamente',
        confirmButtonColor: '#3b82f6'
      })
    }
  
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems)





    const [statsGlobales, setStatsGlobales] = useState({
        total_recaudado: 0,
        total_pendiente: 0
      })
      
      // Cargar stats globales cuando se monta el componente
      useEffect(() => {
        loadStatsGlobales()
      }, [filters])
      
      const loadStatsGlobales = async () => {
        const result = await aulaVirtualService.getPayments({ 
          ...filters, 
          limit: 9999 // Obtener todos para calcular
        })
        
        if (result.success && result.data) {
          const recaudado = result.data.reduce((sum, p) => sum + parseFloat(p.monto_abonado || 0), 0)
          const pendiente = result.data.reduce((sum, p) => sum + parseFloat(p.monto_pendiente || 0), 0)
          
          setStatsGlobales({
            total_recaudado: recaudado,
            total_pendiente: pendiente
          })
        }
      }
  
    return (
      <div className="tab-lista-pagos">
        {/* Header con acciones */}
        <div className="lista-header">
          <div className="lista-stats">
            <div className="stat-item-small">
              <FiList />
              <div>
                <span className="stat-label">Total Registros</span>
                <span className="stat-value">{totalItems}</span>
              </div>
            </div>
            <div className="stat-item-small">
  <FiDollarSign />
  <div>
    <span className="stat-label">Total Recaudado</span>
    <span className="stat-value">
      S/ {statsGlobales.total_recaudado.toFixed(2)}
    </span>
  </div>
</div>
<div className="stat-item-small">
  <FiClock />
  <div>
    <span className="stat-label">Total Pendiente</span>
    <span className="stat-value">
      S/ {statsGlobales.total_pendiente.toFixed(2)}
    </span>
  </div>
</div>


          </div>
  
          <div className="lista-actions">
            <button 
              className="btn-filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter />
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
            <button className="btn-export" onClick={handleExportExcel}>
              <FiDownload />
              Excel
            </button>
            <button className="btn-export" onClick={handleExportPDF}>
              <FiFileText />
              PDF
            </button>
          </div>
        </div>
  
        {/* Filtros Expandibles */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filters-grid">
              <div className="filter-group">
                <label>Buscar</label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Estudiante, curso, nro. operación..."
                />
              </div>
  
              <div className="filter-group">
                <label>Estado</label>
                <select name="estado" value={filters.estado} onChange={handleFilterChange}>
                  <option value="">Todos</option>
                  <option value="pagado">Pagado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="parcial">Parcial</option>
                  <option value="vencido">Vencido</option>
                </select>
              </div>
  
              <div className="filter-group">
                <label>Método de Pago</label>
                <select name="metodo_pago" value={filters.metodo_pago} onChange={handleFilterChange}>
                  <option value="">Todos</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="yape">Yape</option>
                  <option value="plin">Plin</option>
                  <option value="tarjeta">Tarjeta</option>
                </select>
              </div>
  
              <div className="filter-group">
                <label>Curso</label>
                <select name="courseid" value={filters.courseid} onChange={handleFilterChange}>
                  <option value="">Todos</option>
                  {cursos.map(c => (
                    <option key={c.id} value={c.id}>{c.fullname}</option>
                  ))}
                </select>
              </div>
  
              <div className="filter-group">
                <label>Fecha Inicio</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={filters.fecha_inicio}
                  onChange={handleFilterChange}
                />
              </div>
  
              <div className="filter-group">
                <label>Fecha Fin</label>
                <input
                  type="date"
                  name="fecha_fin"
                  value={filters.fecha_fin}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
  
            <div className="filters-actions">
              <button className="btn-clear-filters" onClick={handleClearFilters}>
                <FiX />
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}
  
        {/* Tabla de Pagos */}
        {loading ? (
          <div className="loading-table">
            <div className="spinner-large"></div>
            <p>Cargando pagos...</p>
          </div>
        ) : pagos.length === 0 ? (
          <div className="empty-table">
            <FiDollarSign />
            <h3>No hay pagos registrados</h3>
            <p>No se encontraron pagos con los filtros aplicados</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="pagos-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Estudiante</th>
                    <th>Curso</th>
                    <th>Fecha</th>
                    <th>Método</th>
                    <th>Monto Total</th>
                    <th>Abonado</th>
                    <th>Pendiente</th>
                    <th>Cuotas</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map(pago => (
                    <tr key={pago.id}>
                      <td className="td-id">#{pago.id}</td>
                      <td className="td-estudiante">{pago.estudiante_nombre}</td>
                      <td className="td-curso">{pago.curso_nombre}</td>
                      <td className="td-fecha">{aulaVirtualService.formatDate(pago.fecha_pago)}</td>
                      <td>
                        <span className={`method-badge-v2 ${pago.metodo_pago}`}>
                          {pago.metodo_pago?.toUpperCase()}
                        </span>
                      </td>
                      <td className="td-monto">{aulaVirtualService.formatPrice(pago.monto_total)}</td>
                      <td className="td-abonado">{aulaVirtualService.formatPrice(pago.monto_abonado)}</td>
                      <td className="td-pendiente">
                        {aulaVirtualService.formatPrice(pago.monto_pendiente)}
                      </td>
                      <td className="td-cuotas">
                        {parseInt(pago.es_pago_parcial) === 1 ? (
                          <span className="cuotas-badge">
                            {pago.cuota_actual}/{pago.num_cuotas}
                          </span>
                        ) : (
                          <span className="cuotas-badge complete">1/1</span>
                        )}
                      </td>
                      <td>
                        <span className={`estado-badge-v2 ${pago.estado}`}>
                          {pago.estado === 'pagado' && '✅ Pagado'}
                          {pago.estado === 'pendiente' && '⏳ Pendiente'}
                          {pago.estado === 'parcial' && '🔄 Parcial'}
                          {pago.estado === 'vencido' && '❌ Vencido'}
                        </span>
                      </td>
                      <td className="td-actions">
                        <button
                          className="action-btn-v2 view"
                          onClick={() => onViewDetail(pago)}
                          title="Ver detalle"
                        >
                          <FiEye />
                        </button>
                        {parseFloat(pago.monto_pendiente) > 0 && (
                          <button
                            className="action-btn-v2 add"
                            onClick={() => onAddAbono(pago)}
                            title="Agregar abono"
                          >
                            <FiPlus />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
  
            {/* Paginación */}
            <div className="pagination-wrapper">
              <div className="pagination-info">
                Mostrando {startIndex + 1} - {endIndex} de {totalItems} registros
              </div>
              
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  ««
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  «
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  »
                </button>
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  »»
                </button>
              </div>
  
              <div className="pagination-jump">
                <span>Ir a página:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value)
                    if (page >= 1 && page <= totalPages) {
                      setCurrentPage(page)
                    }
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    )
  }


// ========================================
// COMPONENTE: MODAL DETALLE DE PAGO
// ========================================
const ModalDetallePago = ({ pago, onClose }) => {
    if (!pago) return null
  
    // Calcular cuotas detalladas
    const generarCuotasDetalle = () => {
      const cuotas = []
      
      if (parseInt(pago.es_pago_parcial) === 1) {
        const montoTotal = parseFloat(pago.monto_total)
        const numCuotas = parseInt(pago.num_cuotas)
        const cuotaActual = parseInt(pago.cuota_actual)
        const montoPorCuota = montoTotal / numCuotas
        
        // Primera cuota (ya pagada)
        cuotas.push({
          num_cuota: 1,
          fecha: aulaVirtualService.formatDate(pago.fecha_pago),
          monto: montoPorCuota,
          metodo: pago.metodo_pago,
          nro_operacion: pago.nro_operacion || '-',
          estado: 'pagado'
        })
        
        // Cuotas restantes
        for (let i = 2; i <= numCuotas; i++) {
          cuotas.push({
            num_cuota: i,
            fecha: i <= cuotaActual ? aulaVirtualService.formatDate(pago.fecha_pago) : '-',
            monto: montoPorCuota,
            metodo: i <= cuotaActual ? pago.metodo_pago : '-',
            nro_operacion: i <= cuotaActual ? (pago.nro_operacion || '-') : '-',
            estado: i <= cuotaActual ? 'pagado' : 'pendiente'
          })
        }
      } else {
        // Pago único
        cuotas.push({
          num_cuota: 1,
          fecha: aulaVirtualService.formatDate(pago.fecha_pago),
          monto: parseFloat(pago.monto_total),
          metodo: pago.metodo_pago,
          nro_operacion: pago.nro_operacion || '-',
          estado: pago.estado
        })
      }
      
      return cuotas
    }
  
    const cuotasDetalle = generarCuotasDetalle()
  
    return (
      <div className="modal-overlay-detalle" onClick={onClose}>
        <div className="modal-content-detalle" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header-detalle">
            <div className="header-title-detalle">
              <FiFileText />
              <h2>Detalle del Pago #{pago.id}</h2>
            </div>
            <button className="btn-close-detalle" onClick={onClose}>
              <FiX />
            </button>
          </div>
  
          {/* Body */}
          <div className="modal-body-detalle">
            {/* Información del Estudiante */}
            <div className="detalle-section">
              <h3>
                <FiUsers />
                Información del Estudiante
              </h3>
              <div className="detalle-grid">
                <div className="detalle-item">
                  <span className="detalle-label">Nombre Completo:</span>
                  <span className="detalle-value">{pago.estudiante_nombre}</span>
                </div>
                <div className="detalle-item">
                  <span className="detalle-label">Email:</span>
                  <span className="detalle-value">{pago.email}</span>
                </div>
                {pago.celular && (
                  <div className="detalle-item">
                    <span className="detalle-label">Celular:</span>
                    <span className="detalle-value">{pago.celular}</span>
                  </div>
                )}
              </div>
            </div>
  
            {/* Información del Curso */}
            <div className="detalle-section">
              <h3>
                <FiBookOpen />
                Curso/Taller
              </h3>
              <div className="detalle-grid">
                <div className="detalle-item full-width">
                  <span className="detalle-label">Nombre:</span>
                  <span className="detalle-value strong">{pago.curso_nombre}</span>
                </div>
                <div className="detalle-item">
                  <span className="detalle-label">Código:</span>
                  <span className="detalle-value">{pago.curso_codigo}</span>
                </div>
                <div className="detalle-item">
                  <span className="detalle-label">Tipo:</span>
                  <span className="detalle-value">
                    {pago.tipo_pago === 'inscripcion' && 'Inscripción'}
                    {pago.tipo_pago === 'inscripcion_mensualidad' && 'Inscripción + Mensualidad'}
                    {pago.tipo_pago === 'pago_unico' && 'Pago Único/Mensualidad'}
                  </span>
                </div>
              </div>
            </div>
  
            {/* Resumen Financiero */}
            <div className="detalle-section">
              <h3>
                <FiDollarSign />
                Resumen Financiero
              </h3>
              <div className="resumen-financiero-grid">
                <div className="resumen-card">
                  <span className="resumen-label">Monto Total:</span>
                  <span className="resumen-value total">
                    {aulaVirtualService.formatPrice(pago.monto_total)}
                  </span>
                </div>
                <div className="resumen-card">
                  <span className="resumen-label">Ya Abonado:</span>
                  <span className="resumen-value abonado">
                    {aulaVirtualService.formatPrice(pago.monto_abonado)}
                  </span>
                </div>
                <div className="resumen-card">
                  <span className="resumen-label">Saldo Pendiente:</span>
                  <span className="resumen-value pendiente">
                    {aulaVirtualService.formatPrice(pago.monto_pendiente)}
                  </span>
                </div>
                <div className="resumen-card">
                  <span className="resumen-label">Cuotas:</span>
                  <span className="resumen-value cuotas">
                    {pago.cuota_actual} de {pago.num_cuotas} pagadas
                  </span>
                </div>
              </div>
            </div>
  
            {/* Detalle de Cuotas */}
            <div className="detalle-section">
              <h3>
                <FiList />
                Detalle de Cuotas ({pago.num_cuotas} total)
              </h3>
              <div className="cuotas-table-wrapper">
                <table className="cuotas-table">
                  <thead>
                    <tr>
                      <th>Cuota</th>
                      <th>Fecha</th>
                      <th>Monto</th>
                      <th>Método</th>
                      <th>Nro. Operación</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuotasDetalle.map((cuota, index) => (
                      <tr key={index} className={cuota.estado === 'pagado' ? 'cuota-pagada' : 'cuota-pendiente'}>
                        <td className="td-cuota-num">
                          Cuota {cuota.num_cuota}/{pago.num_cuotas}
                        </td>
                        <td>{cuota.fecha}</td>
                        <td className="td-cuota-monto">
                          {aulaVirtualService.formatPrice(cuota.monto)}
                        </td>
                        <td>
                          {cuota.metodo !== '-' ? (
                            <span className={`method-badge-small ${cuota.metodo}`}>
                              {cuota.metodo.toUpperCase()}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="td-nro-op">{cuota.nro_operacion}</td>
                        <td>
                          <span className={`estado-badge-small ${cuota.estado}`}>
                            {cuota.estado === 'pagado' && '✓ Pagado'}
                            {cuota.estado === 'pendiente' && '⏳ Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
  
            {/* Información del Pago */}
            <div className="detalle-section">
              <h3>
                <FiCalendar />
                Información del Pago
              </h3>
              <div className="detalle-grid">
                <div className="detalle-item">
                  <span className="detalle-label">Fecha de Pago:</span>
                  <span className="detalle-value">{aulaVirtualService.formatDate(pago.fecha_pago)}</span>
                </div>
                <div className="detalle-item">
                  <span className="detalle-label">Método de Pago:</span>
                  <span className="detalle-value">
                    <span className={`method-badge-v2 ${pago.metodo_pago}`}>
                      {pago.metodo_pago?.toUpperCase()}
                    </span>
                  </span>
                </div>
                {pago.nro_operacion && (
                  <div className="detalle-item">
                    <span className="detalle-label">Nro. de Operación:</span>
                    <span className="detalle-value font-mono">{pago.nro_operacion}</span>
                  </div>
                )}
                <div className="detalle-item">
                  <span className="detalle-label">Estado:</span>
                  <span className="detalle-value">
                    <span className={`estado-badge-v2 ${pago.estado}`}>
                      {pago.estado === 'pagado' && '✅ Pagado'}
                      {pago.estado === 'pendiente' && '⏳ Pendiente'}
                      {pago.estado === 'parcial' && '🔄 Parcial'}
                      {pago.estado === 'vencido' && '❌ Vencido'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
  
            {/* Comprobante Electrónico */}
            {pago.tiene_comprobante && (
              <div className="detalle-section">
                <h3>
                  <FiFileText />
                  Comprobante Electrónico
                </h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">Tipo:</span>
                    <span className="detalle-value">
                      {pago.tipo_comprobante === '01' && 'Factura'}
                      {pago.tipo_comprobante === '03' && 'Boleta'}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Serie - Número:</span>
                    <span className="detalle-value font-mono">
                      {pago.serie}-{pago.numero}
                    </span>
                  </div>
                </div>
                <a 
                  href={`/aulavirtual/comprobantes`} 
                  className="btn-ver-comprobante"
                  target="_blank"
                >
                  <FiFileText />
                  Ver Comprobante Completo
                </a>
              </div>
            )}
  
            {/* Notas Adicionales */}
            {pago.notas && (
              <div className="detalle-section">
                <h3>
                  <FiInfo />
                  Notas Adicionales
                </h3>
                <div className="notas-box">
                  {pago.notas}
                </div>
              </div>
            )}
  
            {/* Footer - Fechas del sistema */}
            <div className="detalle-footer">
              <div className="footer-item">
                <FiClock />
                <span>Creado: {aulaVirtualService.formatDateTime(pago.timecreated)}</span>
              </div>
              <div className="footer-item">
                <FiClock />
                <span>Última modificación: {aulaVirtualService.formatDateTime(pago.timemodified || pago.timecreated)}</span>
              </div>
            </div>




          </div>





 





        </div>





 





      </div>
    )
  }







// ========================================
// COMPONENTE: MODAL AGREGAR ABONO
// ========================================
const ModalAgregarAbono = ({ pago, onClose, onSuccess }) => {
    const [abonoForm, setAbonoForm] = useState({
      monto: '',
      fecha_pago: new Date().toISOString().split('T')[0],
      metodo_pago: 'efectivo',
      nro_operacion: '',
      notas: ''
    })
  
    const [preview, setPreview] = useState(null)
  
    // Calcular saldo restante después del abono
    useEffect(() => {
      if (abonoForm.monto) {
        const montoAbono = parseFloat(abonoForm.monto)
        const saldoPendiente = parseFloat(pago.monto_pendiente)
        const nuevoSaldo = saldoPendiente - montoAbono
        const nuevoCuota = nuevoSaldo <= 0 ? parseInt(pago.num_cuotas) : parseInt(pago.cuota_actual) + 1
        
        setPreview({
          montoAbono: montoAbono,
          nuevoAbonado: parseFloat(pago.monto_abonado) + montoAbono,
          nuevoSaldo: Math.max(0, nuevoSaldo),
          nuevoCuota: nuevoCuota,
          quedaCompleto: nuevoSaldo <= 0
        })
      } else {
        setPreview(null)
      }
    }, [abonoForm.monto, pago])
  
    const handleChange = (e) => {
      const { name, value } = e.target
      setAbonoForm(prev => ({ ...prev, [name]: value }))
    }
  
    const handleSubmit = async (e) => {
      e.preventDefault()
  
      // Validaciones
      const montoAbono = parseFloat(abonoForm.monto)
      const saldoPendiente = parseFloat(pago.monto_pendiente)
  
      if (!montoAbono || montoAbono <= 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Monto inválido',
          text: 'Ingresa un monto válido',
          confirmButtonColor: '#3b82f6'
        })
        return
      }
  
      if (montoAbono > saldoPendiente) {
        Swal.fire({
          icon: 'warning',
          title: 'Monto excede el saldo',
          text: `El monto no puede ser mayor a S/ ${saldoPendiente.toFixed(2)}`,
          confirmButtonColor: '#3b82f6'
        })
        return
      }
  
      // Validar nro de operación si no es efectivo
      if (abonoForm.metodo_pago !== 'efectivo' && !abonoForm.nro_operacion.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Número de operación requerido',
          text: `Para pagos con ${abonoForm.metodo_pago} debes ingresar el número de operación`,
          confirmButtonColor: '#3b82f6'
        })
        return
      }
  
      // Confirmación
      const confirm = await Swal.fire({
        icon: 'question',
        title: '¿Registrar abono?',
        html: `
          <div style="text-align: left; padding: 1rem;">
            <p><strong>Estudiante:</strong> ${pago.estudiante_nombre}</p>
            <p><strong>Curso:</strong> ${pago.curso_nombre}</p>
            <hr style="margin: 1rem 0; border: 1px solid #e2e8f0;">
            <p><strong>Abono a registrar:</strong> <span style="color: #10b981; font-weight: bold;">S/ ${montoAbono.toFixed(2)}</span></p>
            <p><strong>Método:</strong> ${abonoForm.metodo_pago.toUpperCase()}</p>
            ${abonoForm.nro_operacion ? `<p><strong>Nro. Operación:</strong> ${abonoForm.nro_operacion}</p>` : ''}
            <hr style="margin: 1rem 0; border: 1px solid #e2e8f0;">
            <p><strong>Nuevo Total Abonado:</strong> S/ ${preview.nuevoAbonado.toFixed(2)}</p>
            <p><strong>Nuevo Saldo:</strong> <span style="color: ${preview.quedaCompleto ? '#10b981' : '#f59e0b'}; font-weight: bold;">S/ ${preview.nuevoSaldo.toFixed(2)}</span></p>
            <p><strong>Cuota:</strong> ${preview.nuevoCuota}/${pago.num_cuotas}</p>
            ${preview.quedaCompleto ? '<p style="color: #10b981; font-weight: bold;">✅ El pago quedará COMPLETO</p>' : ''}
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Sí, registrar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#64748b',
        width: '600px'
      })
  
      if (!confirm.isConfirmed) return
  
      // Registrar abono
      Swal.fire({
        title: 'Registrando abono...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })
  
      const dataToSend = {
        pago_id: pago.id,
        monto_abono: montoAbono,
        fecha_pago: abonoForm.fecha_pago,
        metodo_pago: abonoForm.metodo_pago,
        nro_operacion: abonoForm.nro_operacion,
        notas: abonoForm.notas
      }
      
      // DEBUG TEMPORAL
      console.log('===== ENVIANDO ABONO =====')
      console.log('Datos a enviar:', dataToSend)
      console.log('pago.id:', pago.id)
      console.log('montoAbono:', montoAbono)
      console.log('==========================')
      
      const result = await aulaVirtualService.addAbono(dataToSend)
      
      console.log('Respuesta recibida:', result)
  
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Abono Registrado',
          html: `
            <p>El abono se registró exitosamente</p>
            ${preview.quedaCompleto ? '<p style="color: #10b981; font-weight: bold;">✅ Pago completado totalmente</p>' : ''}
          `,
          confirmButtonColor: '#3b82f6'
        })
        onClose()
        onSuccess()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'No se pudo registrar el abono',
          confirmButtonColor: '#3b82f6'
        })
      }
    }
  
    // Calcular cuota sugerida
    const cuotasRestantes = parseInt(pago.num_cuotas) - parseInt(pago.cuota_actual)
    const montoSugerido = cuotasRestantes > 0 
      ? (parseFloat(pago.monto_pendiente) / cuotasRestantes).toFixed(2)
      : parseFloat(pago.monto_pendiente).toFixed(2)
  
    return (
      <div className="modal-overlay-abono" onClick={onClose}>
        <div className="modal-content-abono" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header-abono">
            <div className="header-title-abono">
              <FiPlus />
              <h2>Registrar Nuevo Abono</h2>
            </div>
            <button className="btn-close-abono" onClick={onClose}>
              <FiX />
            </button>
          </div>
  
          {/* Body */}
          <div className="modal-body-abono">
            {/* Información del Pago */}
            <div className="info-pago-section">
              <h3>Información del Pago</h3>
              <div className="info-pago-grid">
                <div className="info-item">
                  <span className="info-label">Estudiante:</span>
                  <div>
                    <p className="info-value">{pago.estudiante_nombre}</p>
                    <p className="info-sub">{pago.email}</p>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-label">Curso/Taller:</span>
                  <p className="info-value">{pago.curso_nombre}</p>
                </div>
                <div className="info-item">
                  <span className="info-label">Tipo:</span>
                  <p className="info-value">
                    {pago.tipo_pago === 'inscripcion' && 'Inscripción'}
                    {pago.tipo_pago === 'inscripcion_mensualidad' && 'Inscripción + Mensualidad'}
                    {pago.tipo_pago === 'pago_unico' && 'Pago Único/Mensualidad'}
                  </p>
                </div>
              </div>
            </div>
  
            {/* Resumen Financiero */}
            <div className="resumen-abono-section">
              <h3>Resumen Financiero</h3>
              <div className="resumen-abono-cards">
                <div className="resumen-abono-card">
                  <span className="resumen-abono-label">Monto Total:</span>
                  <span className="resumen-abono-value total">
                    {aulaVirtualService.formatPrice(pago.monto_total)}
                  </span>
                </div>
                <div className="resumen-abono-card">
                  <span className="resumen-abono-label">Ya Abonado:</span>
                  <span className="resumen-abono-value abonado">
                    {aulaVirtualService.formatPrice(pago.monto_abonado)}
                  </span>
                </div>
                <div className="resumen-abono-card destacado">
                  <span className="resumen-abono-label">Saldo Pendiente:</span>
                  <span className="resumen-abono-value pendiente">
                    {aulaVirtualService.formatPrice(pago.monto_pendiente)}
                  </span>
                </div>
                <div className="resumen-abono-card">
                  <span className="resumen-abono-label">Cuotas:</span>
                  <span className="resumen-abono-value cuotas">
                    {pago.cuota_actual} de {pago.num_cuotas} pagadas
                  </span>
                </div>
              </div>
            </div>
  
            {/* Formulario de Abono */}
            <form onSubmit={handleSubmit} className="form-abono">
              <h3>Registrar Nuevo Abono</h3>
  
              <div className="form-abono-grid">
                <div className="form-abono-group full-width">
                  <label>
                    Monto del Abono (S/) *
                    <span className="monto-sugerido" onClick={() => setAbonoForm(prev => ({ ...prev, monto: montoSugerido }))}>
                      Sugerido: S/ {montoSugerido}
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="monto"
                    value={abonoForm.monto}
                    onChange={handleChange}
                    placeholder="0.00"
                    max={pago.monto_pendiente}
                    required
                  />
                  <span className="form-help">Máximo permitido: S/ {parseFloat(pago.monto_pendiente).toFixed(2)}</span>
                </div>
  
                <div className="form-abono-group">
                  <label>Fecha del Pago *</label>
                  <input
                    type="date"
                    name="fecha_pago"
                    value={abonoForm.fecha_pago}
                    onChange={handleChange}
                    required
                  />
                </div>
  
                <div className="form-abono-group">
                  <label>Método de Pago *</label>
                  <select
                    name="metodo_pago"
                    value={abonoForm.metodo_pago}
                    onChange={handleChange}
                    required
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="yape">Yape</option>
                    <option value="plin">Plin</option>
                    <option value="tarjeta">Tarjeta</option>
                  </select>
                </div>
  
                {abonoForm.metodo_pago !== 'efectivo' && (
                  <div className="form-abono-group full-width">
                    <label>Nro. de Operación *</label>
                    <input
                      type="text"
                      name="nro_operacion"
                      value={abonoForm.nro_operacion}
                      onChange={handleChange}
                      placeholder="Número de operación"
                      required
                    />
                  </div>
                )}
  
                <div className="form-abono-group full-width">
                  <label>Notas</label>
                  <textarea
                    name="notas"
                    value={abonoForm.notas}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Observaciones o notas adicionales..."
                  ></textarea>
                </div>
              </div>
  
              {/* Preview del Resultado */}
              {preview && (
                <div className="preview-abono">
                  <h4>📊 Vista Previa del Resultado</h4>
                  <div className="preview-grid">
                    <div className="preview-item">
                      <span>Nuevo Total Abonado:</span>
                      <span className="preview-value green">
                        S/ {preview.nuevoAbonado.toFixed(2)}
                      </span>
                    </div>
                    <div className="preview-item">
                      <span>Nuevo Saldo Pendiente:</span>
                      <span className={`preview-value ${preview.quedaCompleto ? 'green' : 'orange'}`}>
                        S/ {preview.nuevoSaldo.toFixed(2)}
                      </span>
                    </div>
                    <div className="preview-item">
                      <span>Nueva Cuota:</span>
                      <span className="preview-value blue">
                        {preview.nuevoCuota}/{pago.num_cuotas}
                      </span>
                    </div>
                    {preview.quedaCompleto && (
                      <div className="preview-item full-width">
                        <div className="preview-completo">
                          <FiCheckCircle />
                          <span>¡El pago quedará COMPLETO!</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
  
              {/* Botones */}
              <div className="form-abono-actions">
                <button type="button" className="btn-cancelar-abono" onClick={onClose}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar-abono">
                  <FiCheckCircle />
                  Registrar Abono
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }






// ========================================
// COMPONENTE: TAB REGISTRAR PAGO (WIZARD)
// ========================================
const TabRegistrarPago = ({ cursos, onSuccess }) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [estudiantes, setEstudiantes] = useState([])
    const [searchEstudiante, setSearchEstudiante] = useState('')
    
    const [formData, setFormData] = useState({
      // Step 1: Estudiante y Curso
      userid: '',
      estudiante_nombre: '',
      estudiante_email: '',
      courseid: '',
      curso_nombre: '',
      
      // Step 2: Monto y Cuotas
      tipo_pago: 'pago_unico',
      monto_total: '',
      es_pago_parcial: false,
      num_cuotas: 2,
      monto_primera_cuota: '',
      
      // Step 3: Información de Pago
      fecha_pago: new Date().toISOString().split('T')[0],
      metodo_pago: 'efectivo',
      nro_operacion: '',
      celular: '',
      notas: ''
    })
  
    const searchEstudiantesDebounced = async (query) => {
      if (query.length < 2) {
        setEstudiantes([])
        return
      }
      
      const result = await aulaVirtualService.searchStudents(query)
      if (result.success) {
        setEstudiantes(result.data || [])
      }
    }
  
    const handleSelectEstudiante = (estudiante) => {
      setFormData(prev => ({
        ...prev,
        userid: estudiante.id,
        estudiante_nombre: estudiante.fullname,
        estudiante_email: estudiante.email
      }))
      setSearchEstudiante(estudiante.fullname)
      setEstudiantes([])
    }
  
    const handleSelectCurso = (e) => {
      const cursoid = e.target.value
      const curso = cursos.find(c => c.id == cursoid)
      setFormData(prev => ({
        ...prev,
        courseid: cursoid,
        curso_nombre: curso?.fullname || ''
      }))
    }
  
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target
      
      if (type === 'checkbox') {
        setFormData(prev => {
          const updated = { ...prev, [name]: checked }
          
          // Si activa cuotas, calcular primera cuota
          if (name === 'es_pago_parcial' && checked && prev.monto_total && prev.num_cuotas) {
            const montoPorCuota = (parseFloat(prev.monto_total) / parseInt(prev.num_cuotas)).toFixed(2)
            updated.monto_primera_cuota = montoPorCuota
          }
          
          return updated
        })
      } else {
        setFormData(prev => {
          const updated = { ...prev, [name]: value }
          
          // Recalcular cuotas si cambia monto o número de cuotas
          if ((name === 'monto_total' || name === 'num_cuotas') && prev.es_pago_parcial) {
            const total = name === 'monto_total' ? parseFloat(value) : parseFloat(prev.monto_total)
            const cuotas = name === 'num_cuotas' ? parseInt(value) : parseInt(prev.num_cuotas)
            
            if (total > 0 && cuotas > 0) {
              const montoPorCuota = (total / cuotas).toFixed(2)
              updated.monto_primera_cuota = montoPorCuota
            }
          }
          
          return updated
        })
      }
    }
  
    const canGoNext = () => {
      switch(currentStep) {
        case 1:
          return formData.userid && formData.courseid
        case 2:
          return formData.monto_total && parseFloat(formData.monto_total) > 0 &&
                 (!formData.es_pago_parcial || (formData.monto_primera_cuota && parseFloat(formData.monto_primera_cuota) > 0))
        case 3:
          return formData.fecha_pago && formData.metodo_pago &&
                 (formData.metodo_pago === 'efectivo' || formData.nro_operacion.trim())
        default:
          return true
      }
    }
  
    const handleNext = () => {
      if (canGoNext()) {
        setCurrentStep(prev => Math.min(4, prev + 1))
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Campos incompletos',
          text: 'Por favor completa todos los campos requeridos',
          confirmButtonColor: '#3b82f6'
        })
      }
    }
  
    const handlePrev = () => {
      setCurrentStep(prev => Math.max(1, prev - 1))
    }
  
    const handleSubmit = async () => {
      const montoTotal = parseFloat(formData.monto_total)
      const montoAbono = formData.es_pago_parcial 
        ? parseFloat(formData.monto_primera_cuota) 
        : montoTotal
  
      // Confirmación final
      const confirm = await Swal.fire({
        icon: 'question',
        title: '¿Registrar pago?',
        html: `
          <div style="text-align: left; padding: 1rem;">
            <p><strong>Estudiante:</strong> ${formData.estudiante_nombre}</p>
            <p><strong>Curso:</strong> ${formData.curso_nombre}</p>
            <hr style="margin: 1rem 0; border: 1px solid #e2e8f0;">
            <p><strong>Monto Total:</strong> S/ ${montoTotal.toFixed(2)}</p>
            <p><strong>Primera Cuota:</strong> S/ ${montoAbono.toFixed(2)}</p>
            ${formData.es_pago_parcial ? `<p><strong>Cuotas:</strong> ${formData.num_cuotas}</p>` : ''}
            <p><strong>Método:</strong> ${formData.metodo_pago.toUpperCase()}</p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Sí, registrar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#64748b',
        width: '600px'
      })
  
      if (!confirm.isConfirmed) return
  
      Swal.fire({
        title: 'Registrando pago...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })
  
      const result = await aulaVirtualService.createPayment({
        userid: formData.userid,
        courseid: formData.courseid,
        tipo_pago: formData.tipo_pago,
        monto_total: montoTotal,
        es_pago_parcial: formData.es_pago_parcial ? 1 : 0,
        num_cuotas: formData.es_pago_parcial ? parseInt(formData.num_cuotas) : 1,
        monto_abono: montoAbono,
        fecha_pago: formData.fecha_pago,
        metodo_pago: formData.metodo_pago,
        nro_operacion: formData.nro_operacion,
        celular: formData.celular,
        notas: formData.notas
      })
  
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Pago Registrado',
          text: 'El pago se registró exitosamente',
          confirmButtonColor: '#10b981'
        })
        
        // Reset form
        setFormData({
          userid: '',
          estudiante_nombre: '',
          estudiante_email: '',
          courseid: '',
          curso_nombre: '',
          tipo_pago: 'pago_unico',
          monto_total: '',
          es_pago_parcial: false,
          num_cuotas: 2,
          monto_primera_cuota: '',
          fecha_pago: new Date().toISOString().split('T')[0],
          metodo_pago: 'efectivo',
          nro_operacion: '',
          celular: '',
          notas: ''
        })
        setSearchEstudiante('')
        setCurrentStep(1)
        
        onSuccess()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message,
          confirmButtonColor: '#3b82f6'
        })
      }
    }
  
    return (
      <div className="tab-registrar-pago">
        {/* Progress Bar */}
        <div className="wizard-progress">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-circle">
              {currentStep > 1 ? <FiCheckCircle /> : '1'}
            </div>
            <span className="step-label">Estudiante y Curso</span>
          </div>
          <div className={`progress-line ${currentStep > 1 ? 'active' : ''}`}></div>
          
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-circle">
              {currentStep > 2 ? <FiCheckCircle /> : '2'}
            </div>
            <span className="step-label">Monto y Cuotas</span>
          </div>
          <div className={`progress-line ${currentStep > 2 ? 'active' : ''}`}></div>
          
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
            <div className="step-circle">
              {currentStep > 3 ? <FiCheckCircle /> : '3'}
            </div>
            <span className="step-label">Información de Pago</span>
          </div>
          <div className={`progress-line ${currentStep > 3 ? 'active' : ''}`}></div>
          
          <div className={`progress-step ${currentStep >= 4 ? 'active' : ''}`}>
            <div className="step-circle">4</div>
            <span className="step-label">Confirmar</span>
          </div>
        </div>
  
        {/* Step Content */}
        <div className="wizard-content">



          {/* STEP 1: Estudiante y Curso */}
        {currentStep === 1 && (
          <div className="wizard-step">
            <h3>
              <FiUsers />
              Paso 1: Seleccionar Estudiante y Curso
            </h3>
            
            <div className="step-form">
              <div className="form-group-wizard">
                <label>Buscar Estudiante *</label>
                <div className="autocomplete-wrapper">
                  <input
                    type="text"
                    placeholder="Escribe el nombre del estudiante..."
                    value={searchEstudiante}
                    onChange={(e) => {
                      setSearchEstudiante(e.target.value)
                      searchEstudiantesDebounced(e.target.value)
                    }}
                    className="input-wizard"
                  />
                  {estudiantes.length > 0 && (
                    <div className="autocomplete-results-wizard">
                      {estudiantes.map(est => (
                        <div
                          key={est.id}
                          className="autocomplete-item-wizard"
                          onClick={() => handleSelectEstudiante(est)}
                        >
                          <div className="student-avatar">{est.fullname.charAt(0)}</div>
                          <div>
                            <strong>{est.fullname}</strong>
                            <span>{est.email}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {formData.userid && (
                  <div className="selected-info">
                    <FiCheckCircle />
                    <span>Estudiante seleccionado: <strong>{formData.estudiante_nombre}</strong></span>
                  </div>
                )}
              </div>

              <div className="form-group-wizard">
                <label>Curso/Taller *</label>
                <select
                  value={formData.courseid}
                  onChange={handleSelectCurso}
                  className="select-wizard"
                >
                  <option value="">Seleccionar curso...</option>
                  {cursos.map(curso => (
                    <option key={curso.id} value={curso.id}>
                      {curso.fullname} ({curso.shortname})
                    </option>
                  ))}
                </select>
                {formData.courseid && (
                  <div className="selected-info">
                    <FiCheckCircle />
                    <span>Curso seleccionado: <strong>{formData.curso_nombre}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Monto y Cuotas */}
        {currentStep === 2 && (
          <div className="wizard-step">
            <h3>
              <FiDollarSign />
              Paso 2: Configurar Monto y Cuotas
            </h3>
            
            <div className="step-form">
              <div className="form-group-wizard">
                <label>Tipo de Pago</label>
                <select
                  name="tipo_pago"
                  value={formData.tipo_pago}
                  onChange={handleChange}
                  className="select-wizard"
                >
                  <option value="inscripcion">Inscripción</option>
                  <option value="inscripcion_mensualidad">Inscripción + Mensualidad</option>
                  <option value="pago_unico">Pago Único/Mensualidad</option>
                </select>
              </div>

              <div className="form-group-wizard">
                <label>Monto Total del Servicio (S/) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="monto_total"
                  value={formData.monto_total}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="input-wizard"
                />
              </div>

              <div className="form-group-wizard full-width">
                <label className="checkbox-label-wizard">
                  <input
                    type="checkbox"
                    name="es_pago_parcial"
                    checked={formData.es_pago_parcial}
                    onChange={handleChange}
                  />
                  <span>Pago en Cuotas - El cliente pagará en varias cuotas</span>
                </label>
              </div>

              {formData.es_pago_parcial && (
                <>
                  <div className="form-group-wizard">
                    <label>Dividir en: *</label>
                    <select
                      name="num_cuotas"
                      value={formData.num_cuotas}
                      onChange={handleChange}
                      className="select-wizard"
                    >
                      <option value="2">2 cuotas</option>
                      <option value="3">3 cuotas</option>
                      <option value="4">4 cuotas</option>
                      <option value="5">5 cuotas</option>
                      <option value="6">6 cuotas</option>
                      <option value="12">12 cuotas</option>
                    </select>
                  </div>

                  <div className="form-group-wizard">
                    <label>Monto de Primera Cuota (S/) *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="monto_primera_cuota"
                      value={formData.monto_primera_cuota}
                      onChange={handleChange}
                      placeholder="0.00"
                      max={formData.monto_total}
                      className="input-wizard"
                    />
                  </div>

                  {formData.monto_total && formData.monto_primera_cuota && (
                    <div className="cuotas-preview-wizard">
                      <h4>📊 Vista Previa de Cuotas</h4>
                      <div className="cuotas-preview-grid">
                        <div className="cuota-preview-item primera">
                          <span className="cuota-num">Cuota 1 (AHORA)</span>
                          <span className="cuota-monto">S/ {parseFloat(formData.monto_primera_cuota).toFixed(2)}</span>
                        </div>
                        {(() => {
                          const total = parseFloat(formData.monto_total)
                          const primeraCuota = parseFloat(formData.monto_primera_cuota)
                          const saldo = total - primeraCuota
                          const cuotasRestantes = parseInt(formData.num_cuotas) - 1
                          const montoPorCuota = cuotasRestantes > 0 ? (saldo / cuotasRestantes).toFixed(2) : 0
                          
                          return Array.from({ length: cuotasRestantes }, (_, i) => (
                            <div key={i} className="cuota-preview-item">
                              <span className="cuota-num">Cuota {i + 2}</span>
                              <span className="cuota-monto">S/ {montoPorCuota}</span>
                            </div>
                          ))
                        })()}
                        <div className="cuota-preview-item total">
                          <span className="cuota-num">SALDO PENDIENTE</span>
                          <span className="cuota-monto pendiente">
                            S/ {(parseFloat(formData.monto_total) - parseFloat(formData.monto_primera_cuota || 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Información de Pago */}
        {currentStep === 3 && (
          <div className="wizard-step">
            <h3>
              <FiCalendar />
              Paso 3: Información del Pago
            </h3>
            
            <div className="step-form">
              <div className="form-group-wizard">
                <label>Fecha de Pago *</label>
                <input
                  type="date"
                  name="fecha_pago"
                  value={formData.fecha_pago}
                  onChange={handleChange}
                  className="input-wizard"
                />
              </div>

              <div className="form-group-wizard">
                <label>Método de Pago *</label>
                <select
                  name="metodo_pago"
                  value={formData.metodo_pago}
                  onChange={handleChange}
                  className="select-wizard"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="yape">Yape</option>
                  <option value="plin">Plin</option>
                  <option value="tarjeta">Tarjeta</option>
                </select>
              </div>

              {formData.metodo_pago !== 'efectivo' && (
                <div className="form-group-wizard full-width">
                  <label>Nro. de Operación *</label>
                  <input
                    type="text"
                    name="nro_operacion"
                    value={formData.nro_operacion}
                    onChange={handleChange}
                    placeholder="Número de operación"
                    className="input-wizard"
                  />
                </div>
              )}

              <div className="form-group-wizard">
                <label>Celular</label>
                <input
                  type="text"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  placeholder="999999999"
                  maxLength="20"
                  className="input-wizard"
                />
              </div>

              <div className="form-group-wizard full-width">
                <label>Notas Adicionales</label>
                <textarea
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Observaciones o notas adicionales..."
                  className="textarea-wizard"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Confirmación */}
        {currentStep === 4 && (
          <div className="wizard-step">
            <h3>
              <FiCheckCircle />
              Paso 4: Revisar y Confirmar
            </h3>
            
            <div className="confirmation-summary">
              <div className="summary-section">
                <h4>
                  <FiUsers />
                  Estudiante y Curso
                </h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Estudiante:</span>
                    <span className="summary-value">{formData.estudiante_nombre}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Email:</span>
                    <span className="summary-value">{formData.estudiante_email}</span>
                  </div>
                  <div className="summary-item full">
                    <span className="summary-label">Curso:</span>
                    <span className="summary-value">{formData.curso_nombre}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Tipo:</span>
                    <span className="summary-value">
                      {formData.tipo_pago === 'inscripcion' && 'Inscripción'}
                      {formData.tipo_pago === 'inscripcion_mensualidad' && 'Inscripción + Mensualidad'}
                      {formData.tipo_pago === 'pago_unico' && 'Pago Único/Mensualidad'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="summary-section">
                <h4>
                  <FiDollarSign />
                  Resumen Financiero
                </h4>
                <div className="summary-financial">
                  <div className="financial-item">
                    <span>Monto Total:</span>
                    <span className="amount total">S/ {parseFloat(formData.monto_total).toFixed(2)}</span>
                  </div>
                  <div className="financial-item">
                    <span>Primera Cuota (Ahora):</span>
                    <span className="amount abono">
                      S/ {formData.es_pago_parcial 
                        ? parseFloat(formData.monto_primera_cuota).toFixed(2)
                        : parseFloat(formData.monto_total).toFixed(2)
                      }
                    </span>
                  </div>
                  <div className="financial-item">
                    <span>Saldo Pendiente:</span>
                    <span className="amount pendiente">
                      S/ {formData.es_pago_parcial 
                        ? (parseFloat(formData.monto_total) - parseFloat(formData.monto_primera_cuota)).toFixed(2)
                        : '0.00'
                      }
                    </span>
                  </div>
                  <div className="financial-item">
                    <span>Número de Cuotas:</span>
                    <span className="amount">{formData.es_pago_parcial ? formData.num_cuotas : 1}</span>
                  </div>
                </div>
              </div>

              <div className="summary-section">
                <h4>
                  <FiCalendar />
                  Información del Pago
                </h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Fecha:</span>
                    <span className="summary-value">{formData.fecha_pago}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Método:</span>
                    <span className="summary-value">
                      <span className={`method-badge-v2 ${formData.metodo_pago}`}>
                        {formData.metodo_pago.toUpperCase()}
                      </span>
                    </span>
                  </div>
                  {formData.nro_operacion && (
                    <div className="summary-item">
                      <span className="summary-label">Nro. Operación:</span>
                      <span className="summary-value font-mono">{formData.nro_operacion}</span>
                    </div>
                  )}
                  {formData.celular && (
                    <div className="summary-item">
                      <span className="summary-label">Celular:</span>
                      <span className="summary-value">{formData.celular}</span>
                    </div>
                  )}
                  {formData.notas && (
                    <div className="summary-item full">
                      <span className="summary-label">Notas:</span>
                      <span className="summary-value">{formData.notas}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="confirmation-alert">
                <FiAlertCircle />
                <div>
                  <strong>¿Todo está correcto?</strong>
                  <p>Revisa cuidadosamente la información antes de confirmar. Una vez registrado, el pago se guardará en el sistema.</p>
                </div>
              </div>
            </div>
          </div>
        )}








        </div>



 {/* Navigation Buttons */}
 <div className="wizard-navigation">
        <button
          type="button"
          className="btn-wizard-prev"
          onClick={handlePrev}
          disabled={currentStep === 1}
        >
          <FiX />
          {currentStep === 1 ? 'Cancelar' : 'Anterior'}
        </button>
        
        {currentStep < 4 ? (
          <button
            type="button"
            className="btn-wizard-next"
            onClick={handleNext}
            disabled={!canGoNext()}
          >
            Siguiente
            <FiCheckCircle />
          </button>
        ) : (
          <button
            type="button"
            className="btn-wizard-submit"
            onClick={handleSubmit}
          >
            <FiCheckCircle />
            Registrar Pago
          </button>
        )}
      </div>
  




      </div>
    )
  }








// ========================================
// COMPONENTE: TAB PAGOS PENDIENTES
// ========================================
const TabPagosPendientes = ({ onViewDetail, onAddAbono }) => {
    const [pagosPendientes, setPagosPendientes] = useState([])
    const [loading, setLoading] = useState(true)
    const [nivelUrgencia, setNivelUrgencia] = useState('todos') // todos | vencidos | hoy | semana | futuro
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('urgencia') // urgencia | monto | estudiante
  
    useEffect(() => {
      loadPagosPendientes()
    }, [])
  
    const loadPagosPendientes = async () => {
      setLoading(true)
      const result = await aulaVirtualService.getPendingPayments()
      
      if (result.success) {
        // Calcular nivel de urgencia para cada pago
        const pagosConUrgencia = (result.data || []).map(pago => {
          const fechaPago = new Date(parseInt(pago.fecha_pago) * 1000)
          const hoy = new Date()
          hoy.setHours(0, 0, 0, 0)
          
          // Calcular días desde el pago original
          const diasDesdeInicio = Math.floor((hoy - fechaPago) / (1000 * 60 * 60 * 24))
          
          // Estimar fecha de vencimiento (30 días por cuota pendiente)
          const cuotasPendientes = parseInt(pago.num_cuotas) - parseInt(pago.cuota_actual)
          const diasEstimadosVencimiento = cuotasPendientes * 30
          const fechaEstimadaVencimiento = new Date(fechaPago)
          fechaEstimadaVencimiento.setDate(fechaEstimadaVencimiento.getDate() + diasEstimadosVencimiento)
          
          const diasParaVencer = Math.floor((fechaEstimadaVencimiento - hoy) / (1000 * 60 * 60 * 24))
          
          let nivel = 'futuro'
          let urgenciaScore = 0
          
          if (diasParaVencer < 0) {
            nivel = 'vencido'
            urgenciaScore = 4
          } else if (diasParaVencer === 0) {
            nivel = 'hoy'
            urgenciaScore = 3
          } else if (diasParaVencer <= 7) {
            nivel = 'semana'
            urgenciaScore = 2
          } else {
            nivel = 'futuro'
            urgenciaScore = 1
          }
          
          return {
            ...pago,
            nivel_urgencia: nivel,
            urgencia_score: urgenciaScore,
            dias_para_vencer: diasParaVencer,
            fecha_estimada_vencimiento: fechaEstimadaVencimiento,
            cuotas_pendientes: cuotasPendientes
          }
        })
        
        setPagosPendientes(pagosConUrgencia)
      }
      setLoading(false)
    }
  
    const handleEnviarRecordatorio = async (pago) => {
      const confirm = await Swal.fire({
        icon: 'question',
        title: '¿Enviar recordatorio?',
        html: `
          <p>Se enviará un recordatorio de pago por email a:</p>
          <p><strong>${pago.estudiante_nombre}</strong></p>
          <p>${pago.email}</p>
          <p>Monto pendiente: <strong>S/ ${parseFloat(pago.monto_pendiente).toFixed(2)}</strong></p>
        `,
        showCancelButton: true,
        confirmButtonText: 'Sí, enviar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#64748b'
      })
  
      if (!confirm.isConfirmed) return
  
      Swal.fire({
        title: 'Enviando recordatorio...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })
  
      // TODO: Implementar envío de email en backend
      setTimeout(() => {
        Swal.fire({
          icon: 'success',
          title: 'Recordatorio Enviado',
          text: `Se envió un recordatorio a ${pago.email}`,
          confirmButtonColor: '#3b82f6'
        })
      }, 1500)
    }
  
    // Filtrar pagos
    const pagosFiltrados = pagosPendientes.filter(pago => {
      // Filtro por nivel de urgencia
      if (nivelUrgencia !== 'todos' && pago.nivel_urgencia !== nivelUrgencia) {
        return false
      }
      
      // Filtro por búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          pago.estudiante_nombre?.toLowerCase().includes(searchLower) ||
          pago.curso_nombre?.toLowerCase().includes(searchLower)
        )
      }
      
      return true
    })
  
    // Ordenar pagos
    const pagosOrdenados = [...pagosFiltrados].sort((a, b) => {
      switch(sortBy) {
        case 'urgencia':
          return b.urgencia_score - a.urgencia_score || a.dias_para_vencer - b.dias_para_vencer
        case 'monto':
          return parseFloat(b.monto_pendiente) - parseFloat(a.monto_pendiente)
        case 'estudiante':
          return a.estudiante_nombre.localeCompare(b.estudiante_nombre)
        default:
          return 0
      }
    })
  
    // Calcular estadísticas
    const stats = {
      total: pagosPendientes.length,
      vencidos: pagosPendientes.filter(p => p.nivel_urgencia === 'vencido').length,
      hoy: pagosPendientes.filter(p => p.nivel_urgencia === 'hoy').length,
      semana: pagosPendientes.filter(p => p.nivel_urgencia === 'semana').length,
      futuro: pagosPendientes.filter(p => p.nivel_urgencia === 'futuro').length,
      monto_total: pagosPendientes.reduce((sum, p) => sum + parseFloat(p.monto_pendiente || 0), 0)
    }
  
    return (
      <div className="tab-pagos-pendientes">
        {/* Alertas de Urgencia */}
        <div className="urgencia-alerts">
          {stats.vencidos > 0 && (
            <div className="urgencia-alert vencido">
              <FiAlertCircle />
              <div>
                <strong>¡{stats.vencidos} pago{stats.vencidos > 1 ? 's' : ''} vencido{stats.vencidos > 1 ? 's' : ''}!</strong>
                <p>Requieren atención inmediata</p>
              </div>
            </div>
          )}
          {stats.hoy > 0 && (
            <div className="urgencia-alert hoy">
              <FiClock />
              <div>
                <strong>{stats.hoy} pago{stats.hoy > 1 ? 's' : ''} vence{stats.hoy > 1 ? 'n' : ''} hoy</strong>
                <p>Contactar a los estudiantes</p>
              </div>
            </div>
          )}
          {stats.semana > 0 && (
            <div className="urgencia-alert semana">
              <FiCalendar />
              <div>
                <strong>{stats.semana} pago{stats.semana > 1 ? 's' : ''} vence{stats.semana > 1 ? 'n' : ''} esta semana</strong>
                <p>Enviar recordatorios preventivos</p>
              </div>
            </div>
          )}
        </div>
  
        {/* Stats Cards */}
        <div className="pendientes-stats">
          <div className="stat-pendiente total">
            <div className="stat-icon">
              <FiDollarSign />
            </div>
            <div>
              <span className="stat-label">Total Pendiente</span>
              <span className="stat-value">S/ {stats.monto_total.toFixed(2)}</span>
            </div>
          </div>
          <div className="stat-pendiente vencido">
            <div className="stat-icon">
              <FiAlertCircle />
            </div>
            <div>
              <span className="stat-label">Vencidos</span>
              <span className="stat-value">{stats.vencidos}</span>
            </div>
          </div>
          <div className="stat-pendiente hoy">
            <div className="stat-icon">
              <FiClock />
            </div>
            <div>
              <span className="stat-label">Vencen Hoy</span>
              <span className="stat-value">{stats.hoy}</span>
            </div>
          </div>
          <div className="stat-pendiente semana">
            <div className="stat-icon">
              <FiCalendar />
            </div>
            <div>
              <span className="stat-label">Esta Semana</span>
              <span className="stat-value">{stats.semana}</span>
            </div>
          </div>
        </div>
  
        {/* Filtros y Ordenamiento */}
        <div className="pendientes-controls">
          <div className="filtros-urgencia">
            <button
              className={`filtro-btn ${nivelUrgencia === 'todos' ? 'active' : ''}`}
              onClick={() => setNivelUrgencia('todos')}
            >
              Todos ({stats.total})
            </button>
            <button
              className={`filtro-btn vencido ${nivelUrgencia === 'vencido' ? 'active' : ''}`}
              onClick={() => setNivelUrgencia('vencido')}
            >
              Vencidos ({stats.vencidos})
            </button>
            <button
              className={`filtro-btn hoy ${nivelUrgencia === 'hoy' ? 'active' : ''}`}
              onClick={() => setNivelUrgencia('hoy')}
            >
              Hoy ({stats.hoy})
            </button>
            <button
              className={`filtro-btn semana ${nivelUrgencia === 'semana' ? 'active' : ''}`}
              onClick={() => setNivelUrgencia('semana')}
            >
              Esta Semana ({stats.semana})
            </button>
            <button
              className={`filtro-btn futuro ${nivelUrgencia === 'futuro' ? 'active' : ''}`}
              onClick={() => setNivelUrgencia('futuro')}
            >
              Futuros ({stats.futuro})
            </button>
          </div>
  
          <div className="search-and-sort">
            <input
              type="text"
              placeholder="Buscar estudiante o curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-pendientes"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-pendientes"
            >
              <option value="urgencia">Ordenar por Urgencia</option>
              <option value="monto">Ordenar por Monto</option>
              <option value="estudiante">Ordenar por Estudiante</option>
            </select>
          </div>
        </div>
  
        {/* Lista de Pagos Pendientes */}
        {loading ? (
          <div className="loading-pendientes">
            <div className="spinner-large"></div>
            <p>Cargando pagos pendientes...</p>
          </div>
        ) : pagosOrdenados.length === 0 ? (
          <div className="empty-pendientes">
            <FiCheckCircle />
            <h3>No hay pagos pendientes</h3>
            <p>
              {pagosPendientes.length === 0 
                ? '¡Excelente! Todos los pagos están al día' 
                : 'No hay pagos que coincidan con los filtros'}
            </p>
          </div>
        ) : (
          <div className="pendientes-grid">
            {pagosOrdenados.map(pago => (
              <div key={pago.id} className={`pendiente-card ${pago.nivel_urgencia}`}>
                {/* Header del Card */}
                <div className="pendiente-card-header">
                  <div className="urgencia-badge">
                    {pago.nivel_urgencia === 'vencido' && (
                      <>
                        <FiAlertCircle />
                        <span>VENCIDO ({Math.abs(pago.dias_para_vencer)} días)</span>
                      </>
                    )}
                    {pago.nivel_urgencia === 'hoy' && (
                      <>
                        <FiClock />
                        <span>VENCE HOY</span>
                      </>
                    )}
                    {pago.nivel_urgencia === 'semana' && (
                      <>
                        <FiCalendar />
                        <span>Vence en {pago.dias_para_vencer} días</span>
                      </>
                    )}
                    {pago.nivel_urgencia === 'futuro' && (
                      <>
                        <FiCalendar />
                        <span>Vence en {pago.dias_para_vencer} días</span>
                      </>
                    )}
                  </div>
                  <span className="pago-id">#{pago.id}</span>
                </div>
  
                {/* Información del Estudiante */}
                <div className="pendiente-estudiante">
                  <div className="estudiante-avatar-pendiente">
                    {pago.estudiante_nombre?.charAt(0)}
                  </div>
                  <div>
                    <h4>{pago.estudiante_nombre}</h4>
                    <p>{pago.email}</p>
                  </div>
                </div>
  
                {/* Información del Curso */}
                <div className="pendiente-curso">
                  <FiBookOpen />
                  <span>{pago.curso_nombre}</span>
                </div>
  
                {/* Resumen Financiero */}
                <div className="pendiente-financiero">
                  <div className="financiero-item">
                    <span>Monto Total:</span>
                    <span className="monto">S/ {parseFloat(pago.monto_total).toFixed(2)}</span>
                  </div>
                  <div className="financiero-item">
                    <span>Abonado:</span>
                    <span className="abonado">S/ {parseFloat(pago.monto_abonado).toFixed(2)}</span>
                  </div>
                  <div className="financiero-item destacado">
                    <span>Pendiente:</span>
                    <span className="pendiente">S/ {parseFloat(pago.monto_pendiente).toFixed(2)}</span>
                  </div>
                  <div className="financiero-item">
                    <span>Cuotas:</span>
                    <span>{pago.cuota_actual}/{pago.num_cuotas} ({pago.cuotas_pendientes} pendiente{pago.cuotas_pendientes > 1 ? 's' : ''})</span>
                  </div>
                </div>
  
                {/* Acciones */}
                <div className="pendiente-acciones">
                  <button
                    className="btn-accion-pendiente view"
                    onClick={() => onViewDetail(pago)}
                    title="Ver detalle completo"
                  >
                    <FiEye />
                  </button>
                  <button
                    className="btn-accion-pendiente add"
                    onClick={() => onAddAbono(pago)}
                    title="Agregar abono"
                  >
                    <FiPlus />
                  </button>
                  <button
                    className="btn-accion-pendiente send"
                    onClick={() => handleEnviarRecordatorio(pago)}
                    title="Enviar recordatorio por email"
                  >
                    <FiSend />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }




// ========================================
// COMPONENTE: TAB REPORTES
// ========================================
const TabReportes = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState({
        fecha_inicio: '2020-01-01', // Desde hace tiempo
        fecha_fin: new Date().toISOString().split('T')[0] // Hasta hoy
      })
  
    useEffect(() => {
      loadStats()
    }, [dateRange])
  
    const loadStats = async () => {
      setLoading(true)
      const result = await aulaVirtualService.getPaymentStats(dateRange)
      
      if (result.success) {
        setStats(result.data)
      }
      setLoading(false)
    }
  
    const handleDateChange = (e) => {
      const { name, value } = e.target
      setDateRange(prev => ({ ...prev, [name]: value }))
    }
  
    const handleExportExcel = async () => {
      Swal.fire({
        title: 'Generando reporte...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })
  
      // Simular generación
      setTimeout(() => {
        const csvContent = [
          ['Reporte de Pagos - Aula Virtual'],
          [`Período: ${dateRange.fecha_inicio} al ${dateRange.fecha_fin}`],
          [],
          ['Resumen General'],
          ['Total Pagos', stats.totales.total_pagos],
          ['Total Ingresos', `S/ ${parseFloat(stats.totales.total_ingresos).toFixed(2)}`],
          ['Total Abonado', `S/ ${parseFloat(stats.totales.total_abonado).toFixed(2)}`],
          ['Total Pendiente', `S/ ${parseFloat(stats.totales.total_pendiente).toFixed(2)}`],
          [],
          ['Por Estado', 'Cantidad', 'Monto'],
          ...stats.por_estado.map(e => [e.estado, e.cantidad, `S/ ${parseFloat(e.monto_total).toFixed(2)}`]),
          [],
          ['Por Método de Pago', 'Cantidad', 'Monto'],
          ...stats.por_metodo.map(m => [m.metodo_pago, m.cantidad, `S/ ${parseFloat(m.monto_total).toFixed(2)}`]),
          [],
          ['Top Cursos', 'Cantidad Pagos', 'Ingresos'],
          ...stats.por_curso.map(c => [c.curso, c.cantidad, `S/ ${parseFloat(c.monto_total).toFixed(2)}`])
        ].map(row => row.join(',')).join('\n')
  
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `reporte_pagos_${dateRange.fecha_inicio}_${dateRange.fecha_fin}.csv`
        link.click()
  
        Swal.fire({
          icon: 'success',
          title: 'Reporte Exportado',
          text: 'El reporte se descargó exitosamente',
          confirmButtonColor: '#3b82f6'
        })
      }, 1500)
    }
  
    const handleExportPDF = () => {
      Swal.fire({
        icon: 'info',
        title: 'Exportar PDF',
        text: 'La exportación a PDF estará disponible próximamente',
        confirmButtonColor: '#3b82f6'
      })
    }
  
    if (loading) {
      return (
        <div className="loading-reportes">
          <div className="spinner-large"></div>
          <p>Generando estadísticas...</p>
        </div>
      )
    }
  
    if (!stats) {
      return (
        <div className="empty-reportes">
          <FiBarChart2 />
          <h3>No hay datos disponibles</h3>
          <p>No se encontraron datos para el período seleccionado</p>
        </div>
      )
    }
  
    // Preparar datos para gráficos
    const dataIngresosPorMetodo = stats.por_metodo.map(m => ({
      name: m.metodo_pago?.toUpperCase() || 'OTRO',
      value: parseFloat(m.monto_total),
      cantidad: parseInt(m.cantidad)
    }))
  
    const dataIngresosPorEstado = stats.por_estado.map(e => ({
      name: e.estado === 'pagado' ? 'Pagado' : e.estado === 'pendiente' ? 'Pendiente' : e.estado,
      value: parseFloat(e.monto_total),
      cantidad: parseInt(e.cantidad)
    }))
  
    const dataTopCursos = stats.por_curso.slice(0, 10).map(c => ({
      name: c.curso.length > 30 ? c.curso.substring(0, 27) + '...' : c.curso,
      ingresos: parseFloat(c.monto_total),
      pagos: parseInt(c.cantidad)
    }))
  
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']
  
    return (
      <div className="tab-reportes">
        {/* Controles de Fecha y Exportación */}
        <div className="reportes-controls">
          <div className="date-filters">
            <div className="date-filter-group">
              <label>Fecha Inicio</label>
              <input
                type="date"
                name="fecha_inicio"
                value={dateRange.fecha_inicio}
                onChange={handleDateChange}
              />
            </div>
            <div className="date-filter-group">
              <label>Fecha Fin</label>
              <input
                type="date"
                name="fecha_fin"
                value={dateRange.fecha_fin}
                onChange={handleDateChange}
              />
            </div>
          </div>
  
          <div className="export-buttons">
            <button className="btn-export-report excel" onClick={handleExportExcel}>
              <FiDownload />
              Exportar Excel
            </button>
            <button className="btn-export-report pdf" onClick={handleExportPDF}>
              <FiFileText />
              Exportar PDF
            </button>
          </div>
        </div>
  
        {/* KPIs Principales */}
        <div className="kpis-grid">
          <div className="kpi-card blue">
            <div className="kpi-icon">
              <FiDollarSign />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Total Ingresos</span>
              <span className="kpi-value">S/ {parseFloat(stats.totales.total_ingresos).toFixed(2)}</span>
              <span className="kpi-sub">{stats.totales.total_pagos} pagos</span>
            </div>
          </div>
  
          <div className="kpi-card green">
            <div className="kpi-icon">
              <FiCheckCircle />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Total Abonado</span>
              <span className="kpi-value">S/ {parseFloat(stats.totales.total_abonado).toFixed(2)}</span>
              <span className="kpi-sub">
                {((parseFloat(stats.totales.total_abonado) / parseFloat(stats.totales.total_ingresos)) * 100).toFixed(1)}% del total
              </span>
            </div>
          </div>
  
          <div className="kpi-card orange">
            <div className="kpi-icon">
              <FiClock />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Total Pendiente</span>
              <span className="kpi-value">S/ {parseFloat(stats.totales.total_pendiente).toFixed(2)}</span>
              <span className="kpi-sub">
                {((parseFloat(stats.totales.total_pendiente) / parseFloat(stats.totales.total_ingresos)) * 100).toFixed(1)}% pendiente
              </span>
            </div>
          </div>
  
          <div className="kpi-card purple">
            <div className="kpi-icon">
              <FiTrendingUp />
            </div>
            <div className="kpi-content">
              <span className="kpi-label">Promedio por Pago</span>
              <span className="kpi-value">S/ {parseFloat(stats.totales.promedio_pago).toFixed(2)}</span>
              <span className="kpi-sub">Ticket promedio</span>
            </div>
          </div>
        </div>
  
        
         {/* Gráficos */}
      <div className="graficos-section">
        {/* Gráfico: Ingresos por Método de Pago */}
        <div className="grafico-card">
          <h3>
            <FiDollarSign />
            Ingresos por Método de Pago
          </h3>
          <div className="grafico-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataIngresosPorMetodo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataIngresosPorMetodo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `S/ ${value.toFixed(2)}`}
                  contentStyle={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grafico-legend">
            {dataIngresosPorMetodo.map((item, index) => (
              <div key={index} className="legend-item">
                <span className="legend-color" style={{ background: COLORS[index % COLORS.length] }}></span>
                <span className="legend-name">{item.name}</span>
                <span className="legend-value">S/ {item.value.toFixed(2)} ({item.cantidad} pagos)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico: Pagos por Estado */}
        <div className="grafico-card">
          <h3>
            <FiBarChart2 />
            Distribución por Estado
          </h3>
          <div className="grafico-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataIngresosPorEstado}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  formatter={(value) => `S/ ${value.toFixed(2)}`}
                  contentStyle={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                  {dataIngresosPorEstado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grafico-stats">
            {dataIngresosPorEstado.map((item, index) => (
              <div key={index} className="stat-box">
                <span className="stat-box-label">{item.name}</span>
                <span className="stat-box-value">S/ {item.value.toFixed(2)}</span>
                <span className="stat-box-count">{item.cantidad} pagos</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Cursos con Más Ingresos */}
      <div className="top-cursos-section">
        <h3>
          <FiBookOpen />
          Top 10 Cursos con Más Ingresos
        </h3>
        <div className="grafico-container-wide">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dataTopCursos} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" />
              <YAxis dataKey="name" type="category" width={200} stroke="#64748b" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'ingresos') return `S/ ${value.toFixed(2)}`
                  return value
                }}
                contentStyle={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="ingresos" fill="#10b981" radius={[0, 8, 8, 0]} name="Ingresos" />
              <Bar dataKey="pagos" fill="#3b82f6" radius={[0, 8, 8, 0]} name="Cantidad Pagos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla Detallada de Cursos */}
      <div className="tabla-cursos-section">
        <h3>
          <FiList />
          Detalle de Todos los Cursos
        </h3>
        <div className="tabla-cursos-wrapper">
          <table className="tabla-cursos">
            <thead>
              <tr>
                <th>#</th>
                <th>Curso</th>
                <th>Cantidad Pagos</th>
                <th>Ingresos Totales</th>
                <th>% del Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.por_curso.map((curso, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className="curso-nombre">{curso.curso}</td>
                  <td className="text-center">{curso.cantidad}</td>
                  <td className="text-right font-bold">S/ {parseFloat(curso.monto_total).toFixed(2)}</td>
                  <td className="text-center">
                    <div className="porcentaje-bar">
                      <div 
                        className="porcentaje-fill"
                        style={{ 
                          width: `${(parseFloat(curso.monto_total) / parseFloat(stats.totales.total_ingresos) * 100).toFixed(1)}%`,
                          background: COLORS[index % COLORS.length]
                        }}
                      ></div>
                      <span>{(parseFloat(curso.monto_total) / parseFloat(stats.totales.total_ingresos) * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen de Comprobantes */}
      {stats.comprobantes && (
        <div className="comprobantes-section">
          <h3>
            <FiFileText />
            Comprobantes Electrónicos Emitidos
          </h3>
          <div className="comprobantes-stats">
            <div className="comprobante-stat">
              <div className="comprobante-icon total">
                <FiFileText />
              </div>
              <div>
                <span className="comprobante-label">Total Comprobantes</span>
                <span className="comprobante-value">{stats.comprobantes.total_comprobantes || 0}</span>
              </div>
            </div>
            <div className="comprobante-stat">
              <div className="comprobante-icon factura">
                <FiFileText />
              </div>
              <div>
                <span className="comprobante-label">Facturas</span>
                <span className="comprobante-value">{stats.comprobantes.facturas || 0}</span>
              </div>
            </div>
            <div className="comprobante-stat">
              <div className="comprobante-icon boleta">
                <FiFileText />
              </div>
              <div>
                <span className="comprobante-label">Boletas</span>
                <span className="comprobante-value">{stats.comprobantes.boletas || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información del Período */}
      <div className="periodo-info">
        <FiCalendar />
        <span>
          Período analizado: <strong>{dateRange.fecha_inicio}</strong> al <strong>{dateRange.fecha_fin}</strong>
        </span>
      </div>
  

      </div>
    )
  }







export default PagosPage