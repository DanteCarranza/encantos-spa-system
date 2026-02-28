import React, { useState, useEffect } from 'react'
import { 
  FiSearch, 
  FiUsers, 
  FiEye,
  FiAlertCircle,
  FiBookOpen,
  FiDollarSign,
  FiClock,
  FiMail,
  FiPhone,
  FiMapPin,
  FiDownload,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiCalendar,
  FiCheckCircle,
  FiActivity,
  FiTrendingUp,
  FiFileText
} from 'react-icons/fi'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import aulaVirtualService from '../../services/aulaVirtualService'
import './EstudiantesPage.css'

const EstudiantesPage = () => {
  // --- Estados de Datos ---
  const [estudiantes, setEstudiantes] = useState([])
  const [deudores, setDeudores] = useState([])
  const [loading, setLoading] = useState(true)
  
  // --- Estados de Filtros y Control ---
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('todos') // 'todos' | 'deudores'
  const [sortOption, setSortOption] = useState('nombreAsc')
  
  // --- Estados de Paginación ---
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)

  // --- Estados de Modal ---
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedEstudiante, setSelectedEstudiante] = useState(null)

  // --- Carga Inicial ---
  useEffect(() => {
    loadEstudiantes()
    loadDeudores()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, activeTab, sortOption])

  const loadEstudiantes = async () => {
    setLoading(true)
    const result = await aulaVirtualService.getStudents({ limit: 500 }) 
    if (result.success) {
      setEstudiantes(result.data || [])
    }
    setLoading(false)
  }

  const loadDeudores = async () => {
    const result = await aulaVirtualService.getStudentsWithDebts()
    if (result.success) {
      setDeudores(result.data || [])
    }
  }

  const handleViewDetail = async (estudiante) => {
    const result = await aulaVirtualService.getStudentDetail(estudiante.id)
    if (result.success) {
      setSelectedEstudiante(result.data)
      setShowDetailModal(true)
    }
  }

  // --- Procesamiento de Datos ---
  const getProcessedData = () => {
    let data = activeTab === 'todos' ? estudiantes : deudores;

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      data = data.filter(est => 
        (est.fullname && est.fullname.toLowerCase().includes(lowerTerm)) ||
        (est.email && est.email.toLowerCase().includes(lowerTerm)) ||
        (est.phone1 && est.phone1.includes(lowerTerm))
      );
    }

    return data.sort((a, b) => {
      switch (sortOption) {
        case 'nombreAsc':
          return (a.fullname || '').localeCompare(b.fullname || '');
        case 'nombreDesc':
          return (b.fullname || '').localeCompare(a.fullname || '');
        case 'deudaMayor':
          return (parseFloat(b.total_deuda || 0) - parseFloat(a.total_deuda || 0));
        case 'recientes':
          return (b.timecreated || 0) - (a.timecreated || 0);
        default:
          return 0;
      }
    });
  };

  const processedList = getProcessedData();

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(processedList.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calcular estadísticas
  const stats = {
    totalEstudiantes: estudiantes.length,
    conDeudas: deudores.length,
    totalRecaudado: estudiantes.reduce((sum, e) => sum + parseFloat(e.total_pagado || 0), 0),
    deudaTotal: deudores.reduce((sum, e) => sum + parseFloat(e.total_deuda || 0), 0),
    sinDeudas: estudiantes.length - deudores.length
  }

  // --- Exportación ---
  const exportToExcel = () => {
    const dataToExport = processedList.map(est => ({
      ID: est.id,
      Nombre: est.fullname,
      Email: est.email,
      Teléfono: est.phone1 || 'N/A',
      'Total Pagado': parseFloat(est.total_pagado || 0).toFixed(2),
      'Total Deuda': parseFloat(est.total_deuda || 0).toFixed(2),
      'Estado': parseFloat(est.total_deuda || 0) > 0 ? 'Con Deuda' : 'Al día'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Estudiantes");
    XLSX.writeFile(workbook, `Estudiantes_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Reporte de Estudiantes - ${activeTab.toUpperCase()}`, 14, 15);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableColumn = ["Nombre", "Email", "Teléfono", "Pagado (S/)", "Deuda (S/)"];
    const tableRows = [];

    processedList.forEach(est => {
      const row = [
        est.fullname,
        est.email,
        est.phone1 || '-',
        parseFloat(est.total_pagado || 0).toFixed(2),
        parseFloat(est.total_deuda || 0).toFixed(2)
      ];
      tableRows.push(row);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save(`Estudiantes_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div className="estudiantes-page-v2">
      <div className="estudiantes-container-v2">
        {/* Hero Header */}
        <div className="estudiantes-hero">
          <div className="hero-content-estudiantes">
            <div className="hero-text-estudiantes">
              <h1>Gestión de Estudiantes</h1>
              <p>Administra estudiantes, deudas y reportes del aula virtual</p>
            </div>
            <div className="hero-icon-estudiantes">
              <FiUsers />
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="estudiantes-stats-dashboard">
          <div className="stat-card-estudiantes blue">
            <div className="stat-icon-estudiantes">
              <FiUsers />
            </div>
            <div className="stat-content-estudiantes">
              <span className="stat-value-estudiantes">{stats.totalEstudiantes}</span>
              <span className="stat-label-estudiantes">Total Estudiantes</span>
              <span className="stat-sub-estudiantes">{stats.sinDeudas} al día</span>
            </div>
          </div>

          <div className="stat-card-estudiantes orange">
            <div className="stat-icon-estudiantes">
              <FiAlertCircle />
            </div>
            <div className="stat-content-estudiantes">
              <span className="stat-value-estudiantes">{stats.conDeudas}</span>
              <span className="stat-label-estudiantes">Con Deudas</span>
              <span className="stat-sub-estudiantes">
                {((stats.conDeudas / stats.totalEstudiantes) * 100).toFixed(1)}% del total
              </span>
            </div>
          </div>

          <div className="stat-card-estudiantes green">
            <div className="stat-icon-estudiantes">
              <FiDollarSign />
            </div>
            <div className="stat-content-estudiantes">
              <span className="stat-value-estudiantes">S/ {stats.totalRecaudado.toFixed(2)}</span>
              <span className="stat-label-estudiantes">Total Recaudado</span>
              <span className="stat-sub-estudiantes">Ingresos totales</span>
            </div>
          </div>

          <div className="stat-card-estudiantes red">
            <div className="stat-icon-estudiantes">
              <FiClock />
            </div>
            <div className="stat-content-estudiantes">
              <span className="stat-value-estudiantes">S/ {stats.deudaTotal.toFixed(2)}</span>
              <span className="stat-label-estudiantes">Deuda Total</span>
              <span className="stat-sub-estudiantes">Por cobrar</span>
            </div>
          </div>
        </div>

      
      {/* Tabs */}
      <div className="estudiantes-tabs-v2">
          <button
            className={`tab-btn-estudiantes ${activeTab === 'todos' ? 'active' : ''}`}
            onClick={() => setActiveTab('todos')}
          >
            <FiUsers />
            <span>Todos los Estudiantes</span>
            <span className="tab-badge-estudiantes">{stats.totalEstudiantes}</span>
          </button>
          <button
            className={`tab-btn-estudiantes ${activeTab === 'deudores' ? 'active' : ''}`}
            onClick={() => setActiveTab('deudores')}
          >
            <FiAlertCircle />
            <span>Con Deudas</span>
            <span className="tab-badge-estudiantes alert">{stats.conDeudas}</span>
          </button>
        </div>

        {/* Barra de Herramientas */}
        <div className="estudiantes-toolbar">
          <div className="toolbar-left">
            {/* Búsqueda */}
            <div className="search-box-estudiantes">
              <FiSearch />
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Ordenamiento */}
            <div className="sort-box-estudiantes">
              <FiFilter />
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="nombreAsc">Nombre (A - Z)</option>
                <option value="nombreDesc">Nombre (Z - A)</option>
                <option value="deudaMayor">Mayor Deuda</option>
                <option value="recientes">Más Recientes</option>
              </select>
            </div>
          </div>

          <div className="toolbar-right">
            {/* Botones de Exportación */}
            <button className="btn-export-estudiantes excel" onClick={exportToExcel}>
              <FiDownload />
              Excel
            </button>
            <button className="btn-export-estudiantes pdf" onClick={exportToPDF}>
              <FiFileText />
              PDF
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading-estudiantes-v2">
            <div className="spinner-large-estudiantes"></div>
            <p>Cargando estudiantes...</p>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="empty-estudiantes-v2">
            <FiUsers />
            <h3>No se encontraron estudiantes</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <>
            {/* Grid de Estudiantes */}
            <div className="estudiantes-grid-v2">
              {currentItems.map(estudiante => (
                <div key={estudiante.id} className="estudiante-card-v2">
                  {/* Header del Card */}
                  <div className="estudiante-card-header">
                    <div className="estudiante-avatar-v2">
                      {estudiante.fullname?.charAt(0) || 'E'}
                    </div>
                    {parseFloat(estudiante.total_deuda || estudiante.total_pendiente || 0) > 0 && (
                      <div className="badge-deuda-card">
                        <FiAlertCircle />
                      </div>
                    )}
                  </div>

                  {/* Body del Card */}
                  <div className="estudiante-card-body">
                    <h3 className="estudiante-nombre-v2">{estudiante.fullname}</h3>
                    
                    <div className="estudiante-contact">
                      <p className="email-estudiante">
                        <FiMail />
                        {estudiante.email}
                      </p>
                      {estudiante.phone1 && (
                        <p className="phone-estudiante">
                          <FiPhone />
                          {estudiante.phone1}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Métricas */}
                  <div className="estudiante-metrics">
                    <div className="metric-estudiante">
                      <div className="metric-estudiante-icon blue">
                        <FiActivity />
                      </div>
                      <div>
                        <span className="metric-estudiante-value">{estudiante.total_pagos || 0}</span>
                        <span className="metric-estudiante-label">Pagos</span>
                      </div>
                    </div>

                    <div className="metric-estudiante">
                      <div className="metric-estudiante-icon green">
                        <FiDollarSign />
                      </div>
                      <div>
                        <span className="metric-estudiante-value">
                          S/ {parseFloat(estudiante.total_pagado || 0).toFixed(2)}
                        </span>
                        <span className="metric-estudiante-label">Pagado</span>
                      </div>
                    </div>

                    {parseFloat(estudiante.total_deuda || estudiante.total_pendiente || 0) > 0 && (
                      <div className="metric-estudiante">
                        <div className="metric-estudiante-icon orange">
                          <FiAlertCircle />
                        </div>
                        <div>
                          <span className="metric-estudiante-value">
                            S/ {parseFloat(estudiante.total_deuda || estudiante.total_pendiente).toFixed(2)}
                          </span>
                          <span className="metric-estudiante-label">Deuda</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botón Ver Detalle */}
                  <button 
                    className="btn-view-estudiante"
                    onClick={() => handleViewDetail(estudiante)}
                  >
                    <FiEye />
                    Ver Detalle Completo
                  </button>
                </div>
              ))}
            </div>

            {/* Paginación Mejorada */}
            {totalPages > 1 && (
              <div className="pagination-estudiantes">
                <button 
                  className="pagination-btn-estudiantes"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <FiChevronLeft />
                  Anterior
                </button>
                
                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => {
                    if (
                      number === 1 || 
                      number === totalPages || 
                      (number >= currentPage - 1 && number <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={number}
                          className={`page-number-estudiantes ${currentPage === number ? 'active' : ''}`}
                          onClick={() => paginate(number)}
                        >
                          {number}
                        </button>
                      );
                    } else if (
                      number === currentPage - 2 || 
                      number === currentPage + 2
                    ) {
                      return <span key={number} className="pagination-dots">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button 
                  className="pagination-btn-estudiantes"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <FiChevronRight />
                </button>
              </div>
            )}
            
            <div className="pagination-info-estudiantes">
              Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, processedList.length)} de {processedList.length} estudiantes
            </div>
          </>
        )}
      </div>

      {/* Modal Mejorado: Detalle del Estudiante */}
      {showDetailModal && selectedEstudiante && (
        <div className="modal-overlay-estudiante" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content-estudiante-v2" onClick={(e) => e.stopPropagation()}>
            {/* Header del Modal */}
            <div className="modal-header-estudiante">
              <div className="header-title-estudiante">
                <div className="modal-avatar-estudiante">
                  {selectedEstudiante.fullname?.charAt(0) || 'E'}
                </div>
                <div>
                  <h2>{selectedEstudiante.fullname}</h2>
                  <p>{selectedEstudiante.email}</p>
                </div>
              </div>
              <button className="btn-close-estudiante" onClick={() => setShowDetailModal(false)}>
                <FiX />
              </button>
            </div>

            {/* Body del Modal */}
            <div className="modal-body-estudiante">
              {/* Información Personal */}
              <div className="detail-section-estudiante">
                <h3>
                  <FiUsers />
                  Información Personal
                </h3>
                <div className="detail-grid-estudiante">
                  <div className="detail-item-estudiante">
                    <span className="label-estudiante">Nombre Completo:</span>
                    <span className="value-estudiante strong">{selectedEstudiante.fullname}</span>
                  </div>
                  <div className="detail-item-estudiante">
                    <span className="label-estudiante">Email:</span>
                    <span className="value-estudiante">
                      <FiMail />
                      {selectedEstudiante.email}
                    </span>
                  </div>
                  {selectedEstudiante.phone1 && (
                    <div className="detail-item-estudiante">
                      <span className="label-estudiante">Teléfono:</span>
                      <span className="value-estudiante">
                        <FiPhone />
                        {selectedEstudiante.phone1}
                      </span>
                    </div>
                  )}
                  {selectedEstudiante.city && (
                    <div className="detail-item-estudiante">
                      <span className="label-estudiante">Ciudad:</span>
                      <span className="value-estudiante">
                        <FiMapPin />
                        {selectedEstudiante.city}
                      </span>
                    </div>
                  )}
                  <div className="detail-item-estudiante">
                    <span className="label-estudiante">Fecha de Registro:</span>
                    <span className="value-estudiante">
                      <FiCalendar />
                      {selectedEstudiante.timecreated ? aulaVirtualService.formatDate(selectedEstudiante.timecreated) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resumen Financiero */}
              {selectedEstudiante.resumen_financiero && (
                <div className="detail-section-estudiante">
                  <h3>
                    <FiDollarSign />
                    Resumen Financiero
                  </h3>
                  <div className="financial-cards-estudiante">
                    <div className="financial-card-estudiante blue">
                      <FiActivity />
                      <div>
                        <span className="financial-label-estudiante">Total Pagos</span>
                        <span className="financial-value-estudiante">
                          {selectedEstudiante.resumen_financiero.total_pagos || 0}
                        </span>
                      </div>
                    </div>
                    <div className="financial-card-estudiante green">
                      <FiCheckCircle />
                      <div>
                        <span className="financial-label-estudiante">Total Pagado</span>
                        <span className="financial-value-estudiante">
                          S/ {parseFloat(selectedEstudiante.resumen_financiero.total_abonado || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="financial-card-estudiante orange">
                      <FiAlertCircle />
                      <div>
                        <span className="financial-label-estudiante">Pendiente</span>
                        <span className="financial-value-estudiante">
                          S/ {parseFloat(selectedEstudiante.resumen_financiero.total_pendiente || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cursos Matriculados */}
              {selectedEstudiante.cursos && selectedEstudiante.cursos.length > 0 && (
                <div className="detail-section-estudiante">
                  <h3>
                    <FiBookOpen />
                    Cursos Matriculados ({selectedEstudiante.cursos.length})
                  </h3>
                  <div className="cursos-grid-estudiante">
                    {selectedEstudiante.cursos.map((curso, index) => (
                      <div key={index} className="curso-card-estudiante">
                        <div className="curso-icon-estudiante">
                          <FiBookOpen />
                        </div>
                        <div className="curso-info-estudiante">
                          <p className="curso-nombre-estudiante">{curso.fullname}</p>
                          <p className="curso-codigo-estudiante">{curso.shortname}</p>
                          <p className="curso-fecha-estudiante">
                            <FiCalendar />
                            {aulaVirtualService.formatDate(curso.fecha_matricula)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Historial de Pagos */}
              {selectedEstudiante.pagos && selectedEstudiante.pagos.length > 0 && (
                <div className="detail-section-estudiante">
                  <h3>
                    <FiDollarSign />
                    Historial de Pagos ({selectedEstudiante.pagos.length})
                  </h3>
                  <div className="pagos-timeline-estudiante">
                    {selectedEstudiante.pagos.slice(0, 8).map((pago, index) => (
                      <div key={index} className="pago-timeline-item-estudiante">
                        <div className="timeline-marker-estudiante"></div>
                        <div className="timeline-content-estudiante">
                          <div className="pago-header-estudiante">
                            <span className="pago-curso-estudiante">{pago.curso_nombre}</span>
                            <span className={`pago-estado-estudiante ${pago.estado}`}>
                              {pago.estado === 'pagado' && '✅ Pagado'}
                              {pago.estado === 'pendiente' && '⏳ Pendiente'}
                              {pago.estado === 'parcial' && '🔄 Parcial'}
                            </span>
                          </div>
                          <div className="pago-details-estudiante">
                            <span className="pago-monto-estudiante">
                              S/ {parseFloat(pago.monto_total).toFixed(2)}
                            </span>
                            <span className="pago-fecha-estudiante">
                              <FiCalendar />
                              {aulaVirtualService.formatDate(pago.fecha_pago)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedEstudiante.pagos.length > 8 && (
                    <p className="more-info-estudiante">
                      + {selectedEstudiante.pagos.length - 8} pagos más
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

export default EstudiantesPage