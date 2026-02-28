import React, { useState, useEffect } from 'react'
import { 
  FiFileText,
  FiDownload,
  FiCalendar,
  FiDollarSign,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiUsers,
  FiFilter,
  FiX,
  FiTrendingUp,
  FiBarChart2,
  FiPieChart
} from 'react-icons/fi'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import Swal from 'sweetalert2'
import aulaVirtualService from '../../services/aulaVirtualService'
import './ReportesPage.css'

const ReportesPage = () => {
  const [loading, setLoading] = useState(false)
  const [activeReport, setActiveReport] = useState('ingresos') // ingresos | vencidos | flujo | comprobantes
  
  // Filtros generales
  const [filters, setFilters] = useState({
    fecha_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fecha_fin: new Date().toISOString().split('T')[0],
    curso: '',
    estudiante: '',
    metodo_pago: '',
    estado: ''
  })

  // Datos de reportes
  const [reporteIngresos, setReporteIngresos] = useState({
    resumen: {
      total_ingresos: 0,
      total_abonado: 0,
      total_pendiente: 0,
      total_pagos: 0
    },
    detalle: [],
    por_metodo: [],
    por_curso: []
  })
  
  const [reporteVencidos, setReporteVencidos] = useState({
    resumen: {
      total_vencidos: 0,
      monto_total_vencido: 0,
      estudiantes_unicos: 0,
      promedio_dias_vencidos: 0
    },
    pagos: []
  })
  
  const [reporteFlujo, setReporteFlujo] = useState({
    resumen: {
      total_ingresos: 0,
      total_egresos: 0,
      saldo_neto: 0
    },
    movimientos: []
  })
  
  const [reporteComprobantes, setReporteComprobantes] = useState({
    resumen: {
      total_comprobantes: 0,
      total_facturas: 0,
      total_boletas: 0,
      monto_total: 0
    },
    por_tipo: [],
    comprobantes: []
  })

  // Datos para filtros
  const [cursos, setCursos] = useState([])
  const [estudiantes, setEstudiantes] = useState([])

  useEffect(() => {
    loadFilterData()
  }, [])

  useEffect(() => {
    loadCurrentReport()
  }, [activeReport, filters])

  const loadFilterData = async () => {
    const cursosResult = await aulaVirtualService.getCourses()
    if (cursosResult.success) {
      setCursos(cursosResult.data || [])
    }

    const estudiantesResult = await aulaVirtualService.getStudents({ limit: 500 })
    if (estudiantesResult.success) {
      setEstudiantes(estudiantesResult.data || [])
    }
  }

  const loadCurrentReport = async () => {
    setLoading(true)

    switch(activeReport) {
      case 'ingresos':
        await loadReporteIngresos()
        break
      case 'vencidos':
        await loadReporteVencidos()
        break
      case 'flujo':
        await loadReporteFlujo()
        break
      case 'comprobantes':
        await loadReporteComprobantes()
        break
      default:
        break
    }

    setLoading(false)
  }

  const loadReporteIngresos = async () => {
    const result = await aulaVirtualService.getReporteIngresos(filters)
    if (result.success) {
      // Asegurar que los datos numéricos sean números
      const dataProcesada = {
        ...result.data,
        resumen: {
          total_ingresos: parseFloat(result.data.resumen?.total_ingresos || 0),
          total_abonado: parseFloat(result.data.resumen?.total_abonado || 0),
          total_pendiente: parseFloat(result.data.resumen?.total_pendiente || 0),
          total_pagos: parseInt(result.data.resumen?.total_pagos || 0)
        },
        por_metodo: (result.data.por_metodo || []).map(item => ({
          metodo: item.metodo,
          total: parseFloat(item.total || 0),
          cantidad: parseInt(item.cantidad || 0)
        })),
        por_curso: (result.data.por_curso || []).map(item => ({
          curso: item.curso,
          total: parseFloat(item.total || 0),
          cantidad: parseInt(item.cantidad || 0)
        })),
        detalle: (result.data.detalle || []).map(item => ({
          ...item,
          monto_total: parseFloat(item.monto_total || 0),
          monto_abonado: parseFloat(item.monto_abonado || 0),
          monto_pendiente: parseFloat(item.monto_pendiente || 0)
        }))
      }
      setReporteIngresos(dataProcesada)
    }
  }

  const loadReporteVencidos = async () => {
    const result = await aulaVirtualService.getReporteVencidos(filters)
    if (result.success) {
      const dataProcesada = {
        resumen: {
          total_vencidos: parseInt(result.data.resumen?.total_vencidos || 0),
          monto_total_vencido: parseFloat(result.data.resumen?.monto_total_vencido || 0),
          estudiantes_unicos: parseInt(result.data.resumen?.estudiantes_unicos || 0),
          promedio_dias_vencidos: parseFloat(result.data.resumen?.promedio_dias_vencidos || 0)
        },
        pagos: (result.data.pagos || []).map(item => ({
          ...item,
          monto_total: parseFloat(item.monto_total || 0),
          monto_pendiente: parseFloat(item.monto_pendiente || 0),
          dias_vencidos: parseInt(item.dias_vencidos || 0)
        }))
      }
      setReporteVencidos(dataProcesada)
    }
  }

  const loadReporteFlujo = async () => {
    const result = await aulaVirtualService.getReporteFlujo(filters)
    if (result.success) {
      const dataProcesada = {
        resumen: {
          total_ingresos: parseFloat(result.data.resumen?.total_ingresos || 0),
          total_egresos: parseFloat(result.data.resumen?.total_egresos || 0),
          saldo_neto: parseFloat(result.data.resumen?.saldo_neto || 0)
        },
        movimientos: (result.data.movimientos || []).map(item => ({
          ...item,
          ingreso: parseFloat(item.ingreso || 0),
          egreso: parseFloat(item.egreso || 0),
          saldo: parseFloat(item.saldo || 0)
        }))
      }
      setReporteFlujo(dataProcesada)
    }
  }

  const loadReporteComprobantes = async () => {
    const result = await aulaVirtualService.getReporteComprobantes(filters)
    if (result.success) {
      const dataProcesada = {
        resumen: {
          total_comprobantes: parseInt(result.data.resumen?.total_comprobantes || 0),
          total_facturas: parseInt(result.data.resumen?.total_facturas || 0),
          total_boletas: parseInt(result.data.resumen?.total_boletas || 0),
          monto_total: parseFloat(result.data.resumen?.monto_total || 0)
        },
        por_tipo: (result.data.por_tipo || []).map(item => ({
          tipo: item.tipo,
          cantidad: parseInt(item.cantidad || 0),
          monto: parseFloat(item.monto || 0)
        })),
        comprobantes: (result.data.comprobantes || []).map(item => ({
          ...item,
          monto: parseFloat(item.monto || 0)
        }))
      }
      setReporteComprobantes(dataProcesada)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const clearFilters = () => {
    setFilters({
      fecha_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      fecha_fin: new Date().toISOString().split('T')[0],
      curso: '',
      estudiante: '',
      metodo_pago: '',
      estado: ''
    })
  }

  // Exportación Excel
  const exportToExcel = () => {
    let data = []
    let filename = ''

    switch(activeReport) {
      case 'ingresos':
        if (!reporteIngresos) return
        data = reporteIngresos.detalle.map(item => ({
          'Fecha': item.fecha,
          'Estudiante': item.estudiante,
          'Curso': item.curso,
          'Método': item.metodo_pago,
          'Monto Total': item.monto_total,
          'Abonado': item.monto_abonado,
          'Pendiente': item.monto_pendiente,
          'Estado': item.estado
        }))
        filename = `Reporte_Ingresos_${filters.fecha_inicio}_${filters.fecha_fin}.xlsx`
        break

      case 'vencidos':
        if (!reporteVencidos) return
        data = reporteVencidos.pagos.map(item => ({
          'Estudiante': item.estudiante,
          'Curso': item.curso,
          'Fecha Vencimiento': item.fecha_pago,
          'Días Vencidos': item.dias_vencidos,
          'Monto Total': item.monto_total,
          'Pendiente': item.monto_pendiente,
          'Teléfono': item.telefono || 'N/A',
          'Email': item.email
        }))
        filename = `Reporte_Vencidos_${new Date().toISOString().split('T')[0]}.xlsx`
        break

      case 'flujo':
        if (!reporteFlujo) return
        data = reporteFlujo.movimientos.map(item => ({
          'Fecha': item.fecha,
          'Tipo': item.tipo,
          'Concepto': item.concepto,
          'Ingreso': item.ingreso || 0,
          'Egreso': item.egreso || 0,
          'Saldo': item.saldo
        }))
        filename = `Reporte_Flujo_Caja_${filters.fecha_inicio}_${filters.fecha_fin}.xlsx`
        break

      case 'comprobantes':
        if (!reporteComprobantes) return
        data = reporteComprobantes.comprobantes.map(item => ({
          'Fecha': item.fecha,
          'Tipo': item.tipo_comprobante,
          'Serie-Número': item.numero_comprobante,
          'Cliente': item.cliente,
          'RUC/DNI': item.documento,
          'Monto': item.monto,
          'Estado': item.estado
        }))
        filename = `Reporte_Comprobantes_${filters.fecha_inicio}_${filters.fecha_fin}.xlsx`
        break

      default:
        return
    }

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte")
    XLSX.writeFile(workbook, filename)

    Swal.fire({
      icon: 'success',
      title: 'Reporte Exportado',
      text: 'El archivo Excel se descargó correctamente',
      confirmButtonColor: '#3b82f6'
    })
  }

  // Exportación PDF
  const exportToPDF = () => {
    const doc = new jsPDF()
    let title = ''
    let tableColumn = []
    let tableRows = []

    switch(activeReport) {
      case 'ingresos':
        if (!reporteIngresos) return
        title = 'Reporte de Ingresos'
        tableColumn = ['Fecha', 'Estudiante', 'Curso', 'Método', 'Total', 'Abonado', 'Pendiente']
        tableRows = reporteIngresos.detalle.map(item => [
          item.fecha,
          item.estudiante,
          item.curso,
          item.metodo_pago,
          `S/ ${parseFloat(item.monto_total).toFixed(2)}`,
          `S/ ${parseFloat(item.monto_abonado).toFixed(2)}`,
          `S/ ${parseFloat(item.monto_pendiente).toFixed(2)}`
        ])
        break

      case 'vencidos':
        if (!reporteVencidos) return
        title = 'Reporte de Pagos Vencidos'
        tableColumn = ['Estudiante', 'Curso', 'Vencimiento', 'Días', 'Pendiente']
        tableRows = reporteVencidos.pagos.map(item => [
          item.estudiante,
          item.curso,
          item.fecha_pago,
          item.dias_vencidos,
          `S/ ${parseFloat(item.monto_pendiente).toFixed(2)}`
        ])
        break

      case 'comprobantes':
        if (!reporteComprobantes) return
        title = 'Reporte de Comprobantes'
        tableColumn = ['Fecha', 'Tipo', 'Número', 'Cliente', 'Monto']
        tableRows = reporteComprobantes.comprobantes.map(item => [
          item.fecha,
          item.tipo_comprobante,
          item.numero_comprobante,
          item.cliente,
          `S/ ${parseFloat(item.monto).toFixed(2)}`
        ])
        break

      default:
        return
    }

    doc.setFontSize(16)
    doc.text(title, 14, 15)
    doc.setFontSize(10)
    doc.text(`Período: ${filters.fecha_inicio} al ${filters.fecha_fin}`, 14, 22)
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 27)

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 8 }
    })

    doc.save(`${title.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)

    Swal.fire({
      icon: 'success',
      title: 'Reporte Exportado',
      text: 'El archivo PDF se descargó correctamente',
      confirmButtonColor: '#3b82f6'
    })
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  
  return (
    <div className="reportes-page">
      <div className="reportes-container">
        {/* Hero Header */}
        <div className="reportes-hero">
          <div className="hero-content-reportes">
            <div className="hero-text-reportes">
              <h1>Reportes Personalizados</h1>
              <p>Genera reportes detallados con filtros avanzados</p>
            </div>
            <div className="hero-icon-reportes">
              <FiFileText />
            </div>
          </div>
        </div>

        {/* Tabs de Reportes */}
        <div className="reportes-tabs">
          <button
            className={`tab-reporte ${activeReport === 'ingresos' ? 'active' : ''}`}
            onClick={() => setActiveReport('ingresos')}
          >
            <FiDollarSign />
            Ingresos por Rango
          </button>
          <button
            className={`tab-reporte ${activeReport === 'vencidos' ? 'active' : ''}`}
            onClick={() => setActiveReport('vencidos')}
          >
            <FiAlertCircle />
            Pagos Vencidos
          </button>
          <button
            className={`tab-reporte ${activeReport === 'flujo' ? 'active' : ''}`}
            onClick={() => setActiveReport('flujo')}
          >
            <FiTrendingUp />
            Flujo de Caja
          </button>
          <button
            className={`tab-reporte ${activeReport === 'comprobantes' ? 'active' : ''}`}
            onClick={() => setActiveReport('comprobantes')}
          >
            <FiFileText />
            Comprobantes
          </button>
        </div>

        {/* Filtros */}
        <div className="reportes-filtros">
          <div className="filtros-row">
            <div className="filter-item">
              <label>Fecha Inicio</label>
              <input
                type="date"
                name="fecha_inicio"
                value={filters.fecha_inicio}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>

            <div className="filter-item">
              <label>Fecha Fin</label>
              <input
                type="date"
                name="fecha_fin"
                value={filters.fecha_fin}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>

            {activeReport !== 'comprobantes' && (
              <div className="filter-item">
                <label>Curso</label>
                <select
                  name="curso"
                  value={filters.curso}
                  onChange={handleFilterChange}
                  className="filter-input"
                >
                  <option value="">Todos los cursos</option>
                  {cursos.map(curso => (
                    <option key={curso.id} value={curso.id}>
                      {curso.fullname}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeReport === 'ingresos' && (
              <>
                <div className="filter-item">
                  <label>Estudiante</label>
                  <select
                    name="estudiante"
                    value={filters.estudiante}
                    onChange={handleFilterChange}
                    className="filter-input"
                  >
                    <option value="">Todos los estudiantes</option>
                    {estudiantes.map(est => (
                      <option key={est.id} value={est.id}>
                        {est.fullname}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-item">
                  <label>Método de Pago</label>
                  <select
                    name="metodo_pago"
                    value={filters.metodo_pago}
                    onChange={handleFilterChange}
                    className="filter-input"
                  >
                    <option value="">Todos los métodos</option>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="YAPE">Yape</option>
                    <option value="PLIN">Plin</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="TARJETA">Tarjeta</option>
                  </select>
                </div>

                <div className="filter-item">
                  <label>Estado</label>
                  <select
                    name="estado"
                    value={filters.estado}
                    onChange={handleFilterChange}
                    className="filter-input"
                  >
                    <option value="">Todos los estados</option>
                    <option value="pagado">Pagado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="parcial">Parcial</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="filtros-actions">
            {(filters.curso || filters.estudiante || filters.metodo_pago || filters.estado) && (
              <button className="btn-clear-filtros" onClick={clearFilters}>
                <FiX />
                Limpiar Filtros
              </button>
            )}
            <button className="btn-export excel" onClick={exportToExcel}>
              <FiDownload />
              Exportar Excel
            </button>
            <button className="btn-export pdf" onClick={exportToPDF}>
              <FiDownload />
              Exportar PDF
            </button>
          </div>
        </div>

        {/* Contenido de Reportes */}
        {loading ? (
          <div className="loading-reportes">
            <div className="spinner-large-reportes"></div>
            <p>Generando reporte...</p>
          </div>
        ) : (
          <>
            {/* REPORTE: INGRESOS POR RANGO */}
            {activeReport === 'ingresos' && (
              <div className="reporte-content">
                {/* KPIs */}
                <div className="reporte-kpis">
                  <div className="kpi-reporte green">
                    <div className="kpi-reporte-icon">
                      <FiDollarSign />
                    </div>
                    <div>
                      <span className="kpi-reporte-label">Total Ingresos</span>
                      <span className="kpi-reporte-value">
                        S/ {parseFloat(reporteIngresos.resumen.total_ingresos || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="kpi-reporte blue">
                    <div className="kpi-reporte-icon">
                      <FiCheckCircle />
                    </div>
                    <div>
                      <span className="kpi-reporte-label">Total Abonado</span>
                      <span className="kpi-reporte-value">
                        S/ {parseFloat(reporteIngresos.resumen.total_abonado || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="kpi-reporte orange">
                    <div className="kpi-reporte-icon">
                      <FiClock />
                    </div>
                    <div>
                      <span className="kpi-reporte-label">Total Pendiente</span>
                      <span className="kpi-reporte-value">
                        S/ {parseFloat(reporteIngresos.resumen.total_pendiente || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="kpi-reporte purple">
                    <div className="kpi-reporte-icon">
                      <FiBarChart2 />
                    </div>
                    <div>
                      <span className="kpi-reporte-label">Total Pagos</span>
                      <span className="kpi-reporte-value">
                        {reporteIngresos.resumen.total_pagos || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gráficos */}
                <div className="reportes-charts-grid">
                  {/* Ingresos por Método de Pago */}
                  <div className="chart-reporte">
  <h3>Ingresos por Método de Pago</h3>
  {reporteIngresos.por_metodo && reporteIngresos.por_metodo.length > 0 ? (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={reporteIngresos.por_metodo}
          dataKey="total"
          nameKey="metodo"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={(entry) => `${entry.metodo}: S/ ${entry.total.toFixed(2)}`}
        >
          {reporteIngresos.por_metodo.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `S/ ${parseFloat(value).toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  ) : (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
      <p>No hay datos disponibles</p>
    </div>
  )}
</div>

                  {/* Ingresos por Curso */}
                  <div className="chart-reporte">
  <h3>Top 10 Cursos por Ingresos</h3>
  {reporteIngresos.por_curso && reporteIngresos.por_curso.length > 0 ? (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={reporteIngresos.por_curso.slice(0, 10)}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="curso" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip formatter={(value) => `S/ ${parseFloat(value).toFixed(2)}`} />
        <Bar dataKey="total" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
      <p>No hay datos disponibles</p>
    </div>
  )}
</div>
                </div>

                {/* Tabla Detallada */}
                <div className="tabla-reporte">
                  <h3>Detalle de Pagos ({reporteIngresos.detalle.length})</h3>
                  <div className="tabla-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Estudiante</th>
                          <th>Curso</th>
                          <th>Método</th>
                          <th>Monto Total</th>
                          <th>Abonado</th>
                          <th>Pendiente</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reporteIngresos.detalle.map((pago, index) => (
                          <tr key={index}>
                            <td>{pago.fecha}</td>
                            <td>{pago.estudiante}</td>
                            <td>{pago.curso}</td>
                            <td>
                              <span className={`badge-metodo ${pago.metodo_pago.toLowerCase()}`}>
                                {pago.metodo_pago}
                              </span>
                            </td>
                            <td>S/ {parseFloat(pago.monto_total).toFixed(2)}</td>
                            <td className="text-green">S/ {parseFloat(pago.monto_abonado).toFixed(2)}</td>
                            <td className="text-orange">S/ {parseFloat(pago.monto_pendiente).toFixed(2)}</td>
                            <td>
                              <span className={`badge-estado ${pago.estado}`}>
                                {pago.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* REPORTE: PAGOS VENCIDOS */}
            {activeReport === 'vencidos' && (
              <div className="reporte-content">
                {/* KPIs */}
                <div className="reporte-kpis">
                  <div className="kpi-reporte red">
                    <div className="kpi-reporte-icon">
                      <FiAlertCircle />
                    </div>
                    <div>
                      <span className="kpi-reporte-label">Pagos Vencidos</span>
                      <span className="kpi-reporte-value">
                        {reporteVencidos.resumen.total_vencidos || 0}
                      </span>
                    </div>
                  </div>

                  <div className="kpi-reporte orange">
                    <div className="kpi-reporte-icon">
                      <FiDollarSign />
                    </div>
                    <div>
                      <span className="kpi-reporte-label">Monto Total Vencido</span>
                      <span className="kpi-reporte-value">
                        S/ {parseFloat(reporteVencidos.resumen.monto_total_vencido || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="kpi-reporte purple">
                    <div className="kpi-reporte-icon">
                      <FiUsers />
                    </div>
                    <div>
                      <span className="kpi-reporte-label">Estudiantes Afectados</span>
                      <span className="kpi-reporte-value">
                        {reporteVencidos.resumen.estudiantes_unicos || 0}
                      </span>
                    </div>
                  </div>

                  <div className="kpi-reporte blue">
                    <div className="kpi-reporte-icon">
                      <FiClock />
                    </div>
                    <div>
                      <span className="kpi-reporte-label">Promedio Días Vencidos</span>
                      <span className="kpi-reporte-value">
                        {Math.round(reporteVencidos.resumen.promedio_dias_vencidos || 0)} días
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tabla de Vencidos */}
                <div className="tabla-reporte">
                  <h3>Detalle de Pagos Vencidos ({reporteVencidos.pagos.length})</h3>
                  <div className="tabla-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Estudiante</th>
                          <th>Email</th>
                          <th>Teléfono</th>
                          <th>Curso</th>
                          <th>Fecha Vencimiento</th>
                          <th>Días Vencidos</th>
                          <th>Monto Pendiente</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reporteVencidos.pagos.map((pago, index) => (
                          <tr key={index} className={pago.dias_vencidos > 30 ? 'urgente' : ''}>
                            <td>{pago.estudiante}</td>
                            <td>{pago.email}</td>
                            <td>{pago.telefono || 'N/A'}</td>
                            <td>{pago.curso}</td>
                            <td>{pago.fecha_pago}</td>
                            <td>
                              <span className={`badge-dias ${pago.dias_vencidos > 30 ? 'critico' : 'warning'}`}>
                                {pago.dias_vencidos} días
                              </span>
                            </td>
                            <td className="text-red font-bold">
                              S/ {parseFloat(pago.monto_pendiente).toFixed(2)}
                            </td>
                            <td>
                              <button 
                                className="btn-accion-tabla"
                                onClick={() => {
                                  Swal.fire({
                                    icon: 'info',
                                    title: 'Enviar Recordatorio',
                                    text: 'Función disponible próximamente',
                                    confirmButtonColor: '#3b82f6'
                                  })
                                }}
                              >
                                Recordar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* REPORTE: FLUJO DE CAJA */}
            {activeReport === 'flujo' && (
              <div className="reporte-content">
                {/* KPIs */}
                <div className="reporte-kpis">
                  <div className="kpi-reporte green">
                    <div className="kpi-reporte-icon">
                      <FiTrendingUp />
                    </div>
                    <div>
                      <span className="kpi-reporte-label">Total Ingresos</span>
                      <span className="kpi-reporte-value">
                        S/ {parseFloat(reporteFlujo.resumen.total_ingresos || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="kpi-reporte red">
                    <div className="kpi-reporte-icon">
                      <FiTrendingUp style={{ transform: 'rotate(180deg)' }} />
                    </div>
                    <div>
                      <span className="kpi-reporte-label">Total Egresos</span>
                      <span className="kpi-reporte-value">
                        S/ {parseFloat(reporteFlujo.resumen.total_egresos || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="kpi-reporte blue">
                    <div className="kpi-reporte-icon">
                      <FiDollarSign />
                    </div>
                    <div>
                      <span className="kpi-reporte-label">Saldo Neto</span>
                      <span className="kpi-reporte-value">
                        S/ {parseFloat(reporteFlujo.resumen.saldo_neto || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gráfico de Flujo */}
                <div className="chart-reporte full-width">
                  <h3>Flujo de Caja en el Tiempo</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={reporteFlujo.movimientos || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis />
                      <Tooltip formatter={(value) => `S/ ${value.toFixed(2)}`} />
                      <Legend />
                      <Line type="monotone" dataKey="ingreso" stroke="#10b981" strokeWidth={2} name="Ingresos" />
                      <Line type="monotone" dataKey="egreso" stroke="#ef4444" strokeWidth={2} name="Egresos" />
                      <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={3} name="Saldo Acumulado" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Tabla de Movimientos */}
                <div className="tabla-reporte">
                  <h3>Detalle de Movimientos ({reporteFlujo.movimientos.length})</h3>
                  <div className="tabla-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Tipo</th>
                          <th>Concepto</th>
                          <th>Ingreso</th>
                          <th>Egreso</th>
                          <th>Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reporteFlujo.movimientos.map((mov, index) => (
                          <tr key={index}>
                            <td>{mov.fecha}</td>
                            <td>
                              <span className={`badge-tipo ${mov.tipo.toLowerCase()}`}>
                                {mov.tipo}
                              </span>
                            </td>
                            <td>{mov.concepto}</td>
                            <td className="text-green">
                              {mov.ingreso > 0 ? `S/ ${mov.ingreso.toFixed(2)}` : '-'}
                            </td>
                            <td className="text-red">
                              {mov.egreso > 0 ? `S/ ${mov.egreso.toFixed(2)}` : '-'}
                            </td>
                            <td className="font-bold">S/ {mov.saldo.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

           {/* REPORTE: COMPROBANTES */}
           {activeReport === 'comprobantes' && (
              <div className="reporte-content">
                {/* KPIs */}
                <div className="reporte-kpis">
                  <div className="kpi-reporte blue">
                    <div className="kpi-reporte-icon">
                      <FiFileText />
                    </div>
                    <div>
                      <span className="kpi-reporte-label">Total Comprobantes</span>
                      <span className="kpi-reporte-value">
                        {reporteComprobantes.resumen.total_comprobantes || 0}
                      </span>
                    </div>
                  </div>

                  <div className="kpi-reporte green">
                    <div className="kpi-reporte-icon">
                      <FiCheckCircle />
                    </div>
                    <div>
                      <span className="kpi-reporte-label">Total Facturas</span>
                      <span className="kpi-reporte-value">
                        {reporteComprobantes.resumen.total_facturas || 0}
                      </span>
                    </div>
                  </div>

                  <div className="kpi-reporte purple">
                    <div className="kpi-reporte-icon">
                      <FiFileText />
                    </div>
                    <div>
                      <span className="kpi-reporte-label">Total Boletas</span>
                      <span className="kpi-reporte-value">
                        {reporteComprobantes.resumen.total_boletas || 0}
                      </span>
                    </div>
                  </div>

                  <div className="kpi-reporte orange">
                    <div className="kpi-reporte-icon">
                      <FiDollarSign />
                    </div>
                    <div>
                      <span className="kpi-reporte-label">Monto Total</span>
                      <span className="kpi-reporte-value">
                        S/ {parseFloat(reporteComprobantes.resumen.monto_total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gráficos */}
                <div className="reportes-charts-grid">
                  {/* Comprobantes por Tipo */}
                  <div className="chart-reporte">
                    <h3>Comprobantes por Tipo</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={reporteComprobantes.por_tipo || []}
                          dataKey="cantidad"
                          nameKey="tipo"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {(reporteComprobantes.por_tipo || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Montos por Tipo */}
                  <div className="chart-reporte">
                    <h3>Montos por Tipo de Comprobante</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reporteComprobantes.por_tipo || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="tipo" />
                        <YAxis />
                        <Tooltip formatter={(value) => `S/ ${value.toFixed(2)}`} />
                        <Bar dataKey="monto" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tabla de Comprobantes */}
                <div className="tabla-reporte">
                  <h3>Detalle de Comprobantes ({reporteComprobantes.comprobantes.length})</h3>
                  <div className="tabla-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Tipo</th>
                          <th>Serie-Número</th>
                          <th>Cliente</th>
                          <th>RUC/DNI</th>
                          <th>Monto</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reporteComprobantes.comprobantes.map((comp, index) => (
                          <tr key={index}>
                            <td>{comp.fecha}</td>
                            <td>
                              <span className={`badge-comprobante ${comp.tipo_comprobante.toLowerCase()}`}>
                                {comp.tipo_comprobante}
                              </span>
                            </td>
                            <td className="font-mono">{comp.numero_comprobante}</td>
                            <td>{comp.cliente}</td>
                            <td>{comp.documento}</td>
                            <td className="font-bold">S/ {parseFloat(comp.monto).toFixed(2)}</td>
                            <td>
                              <span className={`badge-estado ${comp.estado.toLowerCase()}`}>
                                {comp.estado}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn-accion-tabla"
                                onClick={() => {
                                  window.open(comp.url_pdf, '_blank')
                                }}
                              >
                                Ver PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ReportesPage