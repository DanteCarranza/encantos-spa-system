import React, { useState, useEffect } from 'react'
import { 
  FiBookOpen, 
  FiUsers, 
  FiDollarSign, 
  FiEye,
  FiCalendar,
  FiTrendingUp,
  FiAlertCircle,
  FiX,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiActivity
} from 'react-icons/fi'
import aulaVirtualService from '../../services/aulaVirtualService'
import './CursosPage.css'

const CursosPage = () => {
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCurso, setSelectedCurso] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos') // todos | activos | inactivos
  const [sortBy, setSortBy] = useState('nombre') // nombre | estudiantes | ingresos
  const [viewMode, setViewMode] = useState('grid') // grid | list

  useEffect(() => {
    loadCursos()
  }, [])

  const loadCursos = async () => {
    setLoading(true)
    const result = await aulaVirtualService.getCourses()
    
    if (result.success) {
      setCursos(result.data || [])
    }
    setLoading(false)
  }

  const handleViewDetail = async (curso) => {
    const result = await aulaVirtualService.getCourseDetail(curso.id)
    
    if (result.success) {
      setSelectedCurso(result.data)
      setShowDetailModal(true)
    }
  }

  // Filtrar y ordenar cursos
  const filteredCursos = cursos
    .filter(curso => {
      // Filtro de búsqueda
      const searchLower = searchTerm.toLowerCase()
      const matchSearch = !searchTerm || 
        curso.fullname?.toLowerCase().includes(searchLower) ||
        curso.shortname?.toLowerCase().includes(searchLower)
      
      // Filtro de estado
      const matchEstado = filterEstado === 'todos' ||
        (filterEstado === 'activos' && curso.visible == 1) ||
        (filterEstado === 'inactivos' && curso.visible == 0)
      
      return matchSearch && matchEstado
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'nombre':
          return a.fullname.localeCompare(b.fullname)
        case 'estudiantes':
          return parseInt(b.total_estudiantes || 0) - parseInt(a.total_estudiantes || 0)
        case 'ingresos':
          return parseFloat(b.ingresos_totales || 0) - parseFloat(a.ingresos_totales || 0)
        default:
          return 0
      }
    })

  // Calcular estadísticas
  const stats = {
    total: cursos.length,
    activos: cursos.filter(c => c.visible == 1).length,
    totalEstudiantes: cursos.reduce((sum, c) => sum + parseInt(c.total_estudiantes || 0), 0),
    totalIngresos: cursos.reduce((sum, c) => sum + parseFloat(c.ingresos_totales || 0), 0),
    totalPagos: cursos.reduce((sum, c) => sum + parseInt(c.total_pagos || 0), 0),
    totalPendiente: cursos.reduce((sum, c) => sum + parseFloat(c.pendientes_totales || 0), 0)
  }

  return (
    <div className="cursos-page-v2">
      <div className="cursos-container-v2">
        {/* Hero Header */}
        <div className="cursos-hero">
          <div className="hero-content-cursos">
            <div className="hero-text-cursos">
              <h1>Gestión de Cursos</h1>
              <p>Administra y monitorea todos los cursos del aula virtual</p>
            </div>
            <div className="hero-icon-cursos">
              <FiBookOpen />
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="cursos-stats-dashboard">
          <div className="stat-card-cursos blue">
            <div className="stat-icon-cursos">
              <FiBookOpen />
            </div>
            <div className="stat-content-cursos">
              <span className="stat-value-cursos">{stats.total}</span>
              <span className="stat-label-cursos">Total Cursos</span>
              <span className="stat-sub-cursos">{stats.activos} activos</span>
            </div>
          </div>

          <div className="stat-card-cursos purple">
            <div className="stat-icon-cursos">
              <FiUsers />
            </div>
            <div className="stat-content-cursos">
              <span className="stat-value-cursos">{stats.totalEstudiantes}</span>
              <span className="stat-label-cursos">Total Estudiantes</span>
              <span className="stat-sub-cursos">Matriculados</span>
            </div>
          </div>

          <div className="stat-card-cursos green">
            <div className="stat-icon-cursos">
              <FiDollarSign />
            </div>
            <div className="stat-content-cursos">
              <span className="stat-value-cursos">S/ {stats.totalIngresos.toFixed(2)}</span>
              <span className="stat-label-cursos">Ingresos Totales</span>
              <span className="stat-sub-cursos">{stats.totalPagos} pagos</span>
            </div>
          </div>

          <div className="stat-card-cursos orange">
            <div className="stat-icon-cursos">
              <FiAlertCircle />
            </div>
            <div className="stat-content-cursos">
              <span className="stat-value-cursos">S/ {stats.totalPendiente.toFixed(2)}</span>
              <span className="stat-label-cursos">Total Pendiente</span>
              <span className="stat-sub-cursos">Por cobrar</span>
            </div>
          </div>
        </div>

        {/* Filtros y Controles */}
        <div className="cursos-controls">
          <div className="search-filter-section">
            {/* Búsqueda */}
            <div className="search-box-cursos">
              <FiSearch />
              <input
                type="text"
                placeholder="Buscar por nombre o código de curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtros */}
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filterEstado === 'todos' ? 'active' : ''}`}
                onClick={() => setFilterEstado('todos')}
              >
                Todos ({stats.total})
              </button>
              <button 
                className={`filter-btn ${filterEstado === 'activos' ? 'active' : ''}`}
                onClick={() => setFilterEstado('activos')}
              >
                Activos ({stats.activos})
              </button>
              <button 
                className={`filter-btn ${filterEstado === 'inactivos' ? 'active' : ''}`}
                onClick={() => setFilterEstado('inactivos')}
              >
                Inactivos ({stats.total - stats.activos})
              </button>
            </div>
          </div>

          <div className="sort-view-section">
            {/* Ordenamiento */}
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="nombre">Ordenar por Nombre</option>
              <option value="estudiantes">Ordenar por Estudiantes</option>
              <option value="ingresos">Ordenar por Ingresos</option>
            </select>

            {/* Vista Grid/List */}
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Vista en cuadrícula"
              >
                <FiGrid />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Vista en lista"
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>

      
      
      {/* Cursos Grid/List */}
      {loading ? (
          <div className="loading-cursos-v2">
            <div className="spinner-large-cursos"></div>
            <p>Cargando cursos...</p>
          </div>
        ) : filteredCursos.length === 0 ? (
          <div className="empty-cursos-v2">
            <FiBookOpen />
            <h3>No hay cursos</h3>
            <p>No se encontraron cursos con los filtros seleccionados</p>
          </div>
        ) : (
          <div className={`cursos-container-view ${viewMode}`}>
            {filteredCursos.map(curso => (
              viewMode === 'grid' ? (
                // VISTA GRID
                <div key={curso.id} className="curso-card-v2">
                  <div className="curso-card-header">
                    <div className="curso-icon-large">
                      <FiBookOpen />
                    </div>
                    <div className="curso-badges">
                      <span className={`status-badge-curso ${curso.visible == 1 ? 'active' : 'inactive'}`}>
                        {curso.visible == 1 ? (
                          <>
                            <FiCheckCircle />
                            Activo
                          </>
                        ) : (
                          <>
                            <FiClock />
                            Inactivo
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="curso-card-body">
                    <h3 className="curso-title">{curso.fullname}</h3>
                    <p className="curso-codigo">
                      <FiAward />
                      <strong>Código:</strong> {curso.shortname}
                    </p>
                             </div>

                  <div className="curso-metrics">
                    <div className="metric-item">
                      <div className="metric-icon blue">
                        <FiUsers />
                      </div>
                      <div className="metric-content">
                        <span className="metric-value">{curso.total_estudiantes || 0}</span>
                        <span className="metric-label">Estudiantes</span>
                      </div>
                    </div>
                    <div className="metric-item">
                      <div className="metric-icon green">
                        <FiDollarSign />
                      </div>
                      <div className="metric-content">
                        <span className="metric-value">
                          S/ {parseFloat(curso.ingresos_totales || 0).toFixed(2)}
                        </span>
                        <span className="metric-label">Ingresos</span>
                      </div>
                    </div>
                    <div className="metric-item">
                      <div className="metric-icon purple">
                        <FiActivity />
                      </div>
                      <div className="metric-content">
                        <span className="metric-value">{curso.total_pagos || 0}</span>
                        <span className="metric-label">Pagos</span>
                      </div>
                    </div>
                  </div>

                  {parseFloat(curso.pendientes_totales || 0) > 0 && (
                    <div className="pendiente-alert">
                      <FiAlertCircle />
                      <span>Pendiente: S/ {parseFloat(curso.pendientes_totales).toFixed(2)}</span>
                    </div>
                  )}

                  <button 
                    className="btn-view-detail-v2"
                    onClick={() => handleViewDetail(curso)}
                  >
                    <FiEye />
                    Ver Detalle Completo
                  </button>
                </div>
              ) : (
                // VISTA LISTA
                <div key={curso.id} className="curso-list-item">
                  <div className="list-item-left">
                    <div className="curso-icon-list">
                      <FiBookOpen />
                    </div>
                    <div className="curso-info-list">
                      <h3>{curso.fullname}</h3>
                      <p className="curso-codigo-list">
                        <strong>Código:</strong> {curso.shortname}
                      </p>
                      <span className={`status-badge-list ${curso.visible == 1 ? 'active' : 'inactive'}`}>
                        {curso.visible == 1 ? '✅ Activo' : '⏸️ Inactivo'}
                      </span>
                    </div>
                  </div>

                  <div className="list-item-stats">
                    <div className="stat-list-item">
                      <FiUsers />
                      <div>
                        <span className="stat-list-value">{curso.total_estudiantes || 0}</span>
                        <span className="stat-list-label">Estudiantes</span>
                      </div>
                    </div>
                    <div className="stat-list-item">
                      <FiDollarSign />
                      <div>
                        <span className="stat-list-value">S/ {parseFloat(curso.ingresos_totales || 0).toFixed(2)}</span>
                        <span className="stat-list-label">Ingresos</span>
                      </div>
                    </div>
                    <div className="stat-list-item">
                      <FiActivity />
                      <div>
                        <span className="stat-list-value">{curso.total_pagos || 0}</span>
                        <span className="stat-list-label">Pagos</span>
                      </div>
                    </div>
                    {parseFloat(curso.pendientes_totales || 0) > 0 && (
                      <div className="stat-list-item alert">
                        <FiAlertCircle />
                        <div>
                          <span className="stat-list-value">S/ {parseFloat(curso.pendientes_totales).toFixed(2)}</span>
                          <span className="stat-list-label">Pendiente</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    className="btn-view-list"
                    onClick={() => handleViewDetail(curso)}
                  >
                    <FiEye />
                    Ver Detalle
                  </button>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Modal Mejorado: Detalle del Curso */}
      {showDetailModal && selectedCurso && (
        <div className="modal-overlay-curso" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content-curso-v2" onClick={(e) => e.stopPropagation()}>
            {/* Header del Modal */}
            <div className="modal-header-curso">
              <div className="header-title-curso">
                <FiBookOpen />
                <h2>Detalle del Curso</h2>
              </div>
              <button className="btn-close-curso" onClick={() => setShowDetailModal(false)}>
                <FiX />
              </button>
            </div>

            {/* Body del Modal */}
            <div className="modal-body-curso">
              {/* Información General */}
              <div className="detail-section-curso">
                <h3>
                  <FiBookOpen />
                  Información General
                </h3>
                <div className="detail-grid-curso">
                  <div className="detail-item-curso full-width">
                    <span className="label-curso">Nombre del Curso:</span>
                    <span className="value-curso strong">{selectedCurso.fullname}</span>
                  </div>
                  <div className="detail-item-curso">
                    <span className="label-curso">Código:</span>
                    <span className="value-curso">{selectedCurso.shortname}</span>
                  </div>
                  <div className="detail-item-curso">
                    <span className="label-curso">Estado:</span>
                    <span className={`value-curso ${selectedCurso.visible == 1 ? 'green' : 'red'}`}>
                      {selectedCurso.visible == 1 ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                  </div>
                  <div className="detail-item-curso">
                    <span className="label-curso">Fecha de Creación:</span>
                    <span className="value-curso">
                      {aulaVirtualService.formatDate(selectedCurso.timecreated)}
                    </span>
                  </div>
                </div>

                {selectedCurso.summary && (
                  <div className="detail-item-curso full-width">
                    <span className="label-curso">Descripción:</span>
                    <div className="description-box">
                      {selectedCurso.summary}
                    </div>
                  </div>
                )}
              </div>

              {/* Resumen Financiero */}
              {selectedCurso.resumen_financiero && (
                <div className="detail-section-curso">
                  <h3>
                    <FiDollarSign />
                    Resumen Financiero
                  </h3>
                  <div className="financial-cards">
                    <div className="financial-card blue">
                      <FiActivity />
                      <div>
                        <span className="financial-label">Total Pagos</span>
                        <span className="financial-value">
                          {selectedCurso.resumen_financiero.total_pagos || 0}
                        </span>
                      </div>
                    </div>
                    <div className="financial-card green">
                      <FiDollarSign />
                      <div>
                        <span className="financial-label">Ingresos Totales</span>
                        <span className="financial-value">
                          S/ {parseFloat(selectedCurso.resumen_financiero.ingresos_totales || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="financial-card teal">
                      <FiCheckCircle />
                      <div>
                        <span className="financial-label">Total Abonado</span>
                        <span className="financial-value">
                          S/ {parseFloat(selectedCurso.resumen_financiero.total_abonado || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="financial-card orange">
                      <FiAlertCircle />
                      <div>
                        <span className="financial-label">Pendiente</span>
                        <span className="financial-value">
                          S/ {parseFloat(selectedCurso.resumen_financiero.total_pendiente || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Estudiantes Matriculados */}
              {selectedCurso.estudiantes && selectedCurso.estudiantes.length > 0 && (
                <div className="detail-section-curso">
                  <h3>
                    <FiUsers />
                    Estudiantes Matriculados ({selectedCurso.estudiantes.length})
                  </h3>
                  <div className="estudiantes-grid">
                    {selectedCurso.estudiantes.slice(0, 12).map((estudiante, index) => (
                      <div key={index} className="estudiante-card-modal">
                        <div className="estudiante-avatar-modal">
                          {estudiante.fullname?.charAt(0) || 'E'}
                        </div>
                        <div className="estudiante-info-modal">
                          <p className="estudiante-nombre-modal">{estudiante.fullname}</p>
                          <p className="estudiante-email-modal">{estudiante.email}</p>
                          <p className="estudiante-fecha-modal">
                            <FiCalendar />
                            {aulaVirtualService.formatDate(estudiante.fecha_matricula)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedCurso.estudiantes.length > 12 && (
                    <p className="more-info-modal">
                      + {selectedCurso.estudiantes.length - 12} estudiantes más
                    </p>
                  )}
                </div>
              )}

              {/* Últimos Pagos */}
              {selectedCurso.pagos && selectedCurso.pagos.length > 0 && (
                <div className="detail-section-curso">
                  <h3>
                    <FiDollarSign />
                    Últimos Pagos Registrados ({selectedCurso.pagos.length})
                  </h3>
                  <div className="pagos-timeline-modal">
                    {selectedCurso.pagos.slice(0, 8).map((pago, index) => (
                      <div key={index} className="pago-timeline-item">
                        <div className="timeline-marker-pago"></div>
                        <div className="timeline-content-pago">
                          <div className="pago-header-timeline">
                            <span className="pago-estudiante-timeline">{pago.estudiante}</span>
                            <span className={`pago-estado-timeline ${pago.estado}`}>
                              {pago.estado === 'pagado' && '✅ Pagado'}
                              {pago.estado === 'pendiente' && '⏳ Pendiente'}
                              {pago.estado === 'parcial' && '🔄 Parcial'}
                            </span>
                          </div>
                          <div className="pago-details-timeline">
                            <span className="pago-monto-timeline">
                              S/ {parseFloat(pago.monto_total).toFixed(2)}
                            </span>
                            <span className="pago-fecha-timeline">
                              <FiCalendar />
                              {aulaVirtualService.formatDate(pago.fecha_pago)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedCurso.pagos.length > 8 && (
                    <p className="more-info-modal">
                      + {selectedCurso.pagos.length - 8} pagos más
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CursosPage