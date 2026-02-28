import React, { useState, useEffect } from 'react'
import { 
  FiUsers, 
  FiCalendar, 
  FiDollarSign, 
  FiTrendingUp,
  FiAward,
  FiStar,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiBarChart2,
  FiPieChart
} from 'react-icons/fi'
import therapistReportsService from '../../services/therapistReportsService'
import { formatPrice } from '../../utils/helpers'
import './TherapistReportsPage.css'

const TherapistReportsPage = () => {
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState(null)
  const [topTherapists, setTopTherapists] = useState([])
  const [monthlyStats, setMonthlyStats] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [activeTab, setActiveTab] = useState('overview') // overview, attendance, earnings

  useEffect(() => {
    loadDashboardData()
  }, [selectedMonth])

  const loadDashboardData = async () => {
    setLoading(true)
    
    // Cargar datos en paralelo
    const [overviewRes, topRes, statsRes] = await Promise.all([
      therapistReportsService.getOverview(),
      therapistReportsService.getTopTherapists(selectedMonth, 5),
      therapistReportsService.getMonthlyStats()
    ])

    if (overviewRes.success) setOverview(overviewRes.data)
    if (topRes.success) setTopTherapists(topRes.data)
    if (statsRes.success) setMonthlyStats(statsRes.data)

    setLoading(false)
  }

  const handleMonthChange = (direction) => {
    const [year, month] = selectedMonth.split('-').map(Number)
    let newYear = year
    let newMonth = month + direction
  
    if (newMonth > 12) {
      newMonth = 1
      newYear++
    } else if (newMonth < 1) {
      newMonth = 12
      newYear--
    }
  
    const newMonthStr = newMonth.toString().padStart(2, '0')
    setSelectedMonth(`${newYear}-${newMonthStr}`)
  }

  const formatMonthName = (monthStr) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(year, month - 1, 1) // Restamos 1 porque los meses en JS empiezan en 0
    return date.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
  }

  const exportReport = async (type, format = 'excel') => {
    if (format === 'excel') {
      const result = await therapistReportsService.exportToExcel(type, selectedMonth)
      if (result.success) {
        // Opcional: Mostrar notificación de éxito
        console.log('Excel descargado')
      }
    } else if (format === 'pdf') {
      const result = await therapistReportsService.exportToPDF(type, selectedMonth)
      if (result.success) {
        console.log('PDF descargado')
      }
    }
  }

  if (loading) {
    return (
      <div className="therapist-reports-loading">
        <div className="spinner-large"></div>
        <p>Cargando reportes...</p>
      </div>
    )
  }

  return (
    <div className="therapist-reports-page">
      <div className="reports-container">
        {/* Header */}
        <div className="reports-header">
          <div className="header-title-section">
            <div className="header-icon">
              <FiUsers />
            </div>
            <div>
              <h1 className="reports-title">Reportes de Terapeutas</h1>
              <p className="reports-subtitle">Análisis de desempeño y ganancias</p>
            </div>
          </div>

          {/* Month Selector */}
          <div className="month-selector">
            <button className="month-nav-btn" onClick={() => handleMonthChange(-1)}>
              <FiChevronLeft />
            </button>
            <div className="month-display">
              <FiCalendar />
              <span>{formatMonthName(selectedMonth)}</span>
            </div>
            <button className="month-nav-btn" onClick={() => handleMonthChange(1)}>
              <FiChevronRight />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {/* Total Terapeutas */}
          <div className="stat-card primary">
            <div className="stat-icon">
              <FiUsers />
            </div>
            <div className="stat-content">
              <span className="stat-label">Terapeutas Activos</span>
              <span className="stat-value">{overview?.total_terapeutas || 0}</span>
            </div>
          </div>

          {/* Citas del Mes */}
          <div className="stat-card success">
            <div className="stat-icon">
              <FiCalendar />
            </div>
            <div className="stat-content">
              <span className="stat-label">Citas del Mes</span>
              <span className="stat-value">{overview?.citas_mes.total || 0}</span>
              <span className="stat-detail">
                {overview?.citas_mes.completadas || 0} completadas
              </span>
            </div>
          </div>

          {/* Ingresos */}
          <div className="stat-card warning">
            <div className="stat-icon">
              <FiDollarSign />
            </div>
            <div className="stat-content">
              <span className="stat-label">Ingresos del Mes</span>
              <span className="stat-value">{formatPrice(overview?.citas_mes.ingresos || 0)}</span>
            </div>
          </div>

          {/* Satisfacción */}
          <div className="stat-card info">
            <div className="stat-icon">
              <FiStar />
            </div>
            <div className="stat-content">
              <span className="stat-label">Satisfacción Promedio</span>
              <span className="stat-value">
                {overview?.promedio_satisfaccion || 0} <small>/5</small>
              </span>
            </div>
          </div>
        </div>

        {/* Terapeuta del Mes */}
        {overview?.terapeuta_mes && (
          <div className="therapist-of-month-card">
            <div className="card-header-special">
              <FiAward className="award-icon" />
              <h2>Terapeuta del Mes</h2>
            </div>
            <div className="therapist-of-month-content">
              <div className="therapist-avatar-large">
                {overview.terapeuta_mes.foto_url ? (
                  <img src={overview.terapeuta_mes.foto_url} alt={overview.terapeuta_mes.nombre_completo} />
                ) : (
                  <div className="avatar-placeholder-large">
                    {overview.terapeuta_mes.nombre_completo.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                )}
                <div className="avatar-badge">👑</div>
              </div>
              <div className="therapist-info-large">
                <h3>{overview.terapeuta_mes.nombre_completo}</h3>
                <p className="speciality">{overview.terapeuta_mes.especialidad}</p>
                <div className="therapist-stats-inline">
                  <div className="stat-inline">
                    <FiCalendar />
                    <span><strong>{overview.terapeuta_mes.total_citas}</strong> citas</span>
                  </div>
                  <div className="stat-inline">
                    <FiDollarSign />
                    <span><strong>{formatPrice(overview.terapeuta_mes.ingresos_generados)}</strong> generados</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="reports-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FiBarChart2 />
            Resumen General
          </button>
          <button 
            className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            <FiCalendar />
            Asistencia
          </button>
          <button 
            className={`tab-btn ${activeTab === 'earnings' ? 'active' : ''}`}
            onClick={() => setActiveTab('earnings')}
          >
            <FiDollarSign />
            Ganancias
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-tab">
              {/* Top Terapeutas */}
              <div className="top-therapists-section">
              <div className="section-header">
  <h2>
    <FiTrendingUp />
    Top 5 Terapeutas del Mes
  </h2>
  <div className="export-buttons">
    <button className="btn-export excel" onClick={() => exportReport('top', 'excel')}>
      <FiDownload />
      Excel
    </button>
    <button className="btn-export pdf" onClick={() => exportReport('top', 'pdf')}>
      <FiDownload />
      PDF
    </button>
  </div>
</div>

                <div className="top-therapists-list">
                  {topTherapists.map((therapist, index) => (
                    <div key={therapist.id} className="top-therapist-item">
                      <div className="rank-badge">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      
                      <div className="therapist-avatar-small">
                        {therapist.foto_url ? (
                          <img src={therapist.foto_url} alt={therapist.nombre_completo} />
                        ) : (
                          <div className="avatar-placeholder-small">
                            {therapist.nombre_completo.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                        )}
                      </div>

                      <div className="therapist-info-compact">
                        <h4>{therapist.nombre_completo}</h4>
                        <p>{therapist.especialidad}</p>
                      </div>

                      <div className="therapist-metrics">
                        <div className="metric-item">
                          <FiCalendar />
                          <span>{therapist.citas_completadas} citas</span>
                        </div>
                        <div className="metric-item">
                          <FiDollarSign />
                          <span>{formatPrice(therapist.ingresos_generados)}</span>
                        </div>
                        {therapist.rating_promedio && (
                          <div className="metric-item">
                            <FiStar />
                            <span>{parseFloat(therapist.rating_promedio).toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Chart */}
              <div className="monthly-chart-section">
                <div className="section-header">
                  <h2>
                    <FiPieChart />
                    Tendencia - Últimos 6 Meses
                  </h2>
                </div>

                <div className="chart-container">
                  <div className="simple-bar-chart">
                    {monthlyStats.map((stat) => {
                      const maxIngresos = Math.max(...monthlyStats.map(s => parseFloat(s.ingresos)))
                      const height = (parseFloat(stat.ingresos) / maxIngresos) * 100

                      return (
                        <div key={stat.mes} className="chart-bar-wrapper">
                          <div className="chart-bar-container">
                            <div 
                              className="chart-bar"
                              style={{ height: `${height}%` }}
                              title={`${formatPrice(stat.ingresos)} - ${stat.total_citas} citas`}
                            >
                              <span className="bar-value">{formatPrice(stat.ingresos)}</span>
                            </div>
                          </div>
                          <span className="chart-label">
                            {new Date(stat.mes + '-01').toLocaleDateString('es-PE', { month: 'short' })}
                          </span>
                          <span className="chart-sublabel">{stat.total_citas} citas</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

         {/* Attendance Tab */}
         {activeTab === 'attendance' && (
            <AttendanceTab selectedMonth={selectedMonth} exportReport={exportReport} />
          )}

          {/* Earnings Tab */}
          {activeTab === 'earnings' && (
            <EarningsTab selectedMonth={selectedMonth} exportReport={exportReport} />
          )}
        </div>
      </div>
    </div>
  )
}

// ========== ATTENDANCE TAB COMPONENT ==========
const AttendanceTab = ({ selectedMonth, exportReport }) => {
  const [loading, setLoading] = useState(true)
  const [attendanceData, setAttendanceData] = useState([])
  const [sortBy, setSortBy] = useState('total_citas')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    loadAttendanceData()
  }, [selectedMonth])

  const loadAttendanceData = async () => {
    setLoading(true)
    const result = await therapistReportsService.getAttendanceReport(selectedMonth)
    if (result.success) {
      setAttendanceData(result.data)
    }
    setLoading(false)
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const sortedData = [...attendanceData].sort((a, b) => {
    let aVal = a[sortBy]
    let bVal = b[sortBy]

    if (sortBy === 'nombre_completo') {
      aVal = aVal?.toLowerCase() || ''
      bVal = bVal?.toLowerCase() || ''
    } else {
      aVal = parseFloat(aVal) || 0
      bVal = parseFloat(bVal) || 0
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  if (loading) {
    return (
      <div className="tab-loading">
        <div className="spinner-small"></div>
        <p>Cargando reporte de asistencia...</p>
      </div>
    )
  }

  return (
    <div className="attendance-tab-content">
   <div className="tab-header">
  <h2>
    <FiCalendar />
    Reporte de Asistencia
  </h2>
  <div className="export-buttons">
    <button className="btn-export excel" onClick={() => exportReport('attendance', 'excel')}>
      <FiDownload />
      Excel
    </button>
    <button className="btn-export pdf" onClick={() => exportReport('attendance', 'pdf')}>
      <FiDownload />
      PDF
    </button>
  </div>
</div>

      <div className="attendance-table-wrapper">
        <table className="attendance-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('nombre_completo')} className="sortable">
                Terapeuta
                {sortBy === 'nombre_completo' && (
                  <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th>Especialidad</th>
              <th onClick={() => handleSort('total_citas')} className="sortable">
                Total Citas
                {sortBy === 'total_citas' && (
                  <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSort('completadas')} className="sortable">
                Completadas
                {sortBy === 'completadas' && (
                  <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSort('canceladas')} className="sortable">
                Canceladas
                {sortBy === 'canceladas' && (
                  <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSort('no_asistio')} className="sortable">
                No Asistió
                {sortBy === 'no_asistio' && (
                  <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSort('tasa_asistencia')} className="sortable">
                Tasa Asistencia
                {sortBy === 'tasa_asistencia' && (
                  <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((therapist) => {
              const tasaAsistencia = parseFloat(therapist.tasa_asistencia) || 0
              const tasaColor = tasaAsistencia >= 90 ? '#10b981' : 
                               tasaAsistencia >= 75 ? '#f59e0b' : '#ef4444'

              return (
                <tr key={therapist.id}>
                  <td className="therapist-cell">
                    <div className="therapist-info-row">
                      <div className="avatar-tiny">
                        {therapist.foto_url ? (
                          <img src={therapist.foto_url} alt={therapist.nombre_completo} />
                        ) : (
                          <div className="avatar-placeholder-tiny">
                            {therapist.nombre_completo.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                        )}
                      </div>
                      <span className="therapist-name">{therapist.nombre_completo}</span>
                    </div>
                  </td>
                  <td>
                    <span className="speciality-badge">{therapist.especialidad || 'N/A'}</span>
                  </td>
                  <td className="numeric-cell">
                    <span className="badge badge-primary">{therapist.total_citas}</span>
                  </td>
                  <td className="numeric-cell">
                    <span className="badge badge-success">{therapist.completadas}</span>
                  </td>
                  <td className="numeric-cell">
                    <span className="badge badge-warning">{therapist.canceladas}</span>
                  </td>
                  <td className="numeric-cell">
                    <span className="badge badge-danger">{therapist.no_asistio}</span>
                  </td>
                  <td className="numeric-cell">
                    <div className="progress-cell">
                      <div className="progress-bar-wrapper">
                        <div 
                          className="progress-bar-fill"
                          style={{ 
                            width: `${tasaAsistencia}%`,
                            backgroundColor: tasaColor
                          }}
                        ></div>
                      </div>
                      <span className="progress-text" style={{ color: tasaColor }}>
                        {tasaAsistencia.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {sortedData.length === 0 && (
          <div className="empty-table">
            <p>No hay datos de asistencia para este mes</p>
          </div>
        )}
      </div>

      <div className="attendance-summary">
        <div className="summary-card">
          <div className="summary-icon success">✓</div>
          <div className="summary-content">
            <span className="summary-label">Total Completadas</span>
            <span className="summary-value">
              {sortedData.reduce((sum, t) => sum + parseInt(t.completadas || 0), 0)}
            </span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon warning">⏱</div>
          <div className="summary-content">
            <span className="summary-label">Total Canceladas</span>
            <span className="summary-value">
              {sortedData.reduce((sum, t) => sum + parseInt(t.canceladas || 0), 0)}
            </span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon danger">✕</div>
          <div className="summary-content">
            <span className="summary-label">Total No Asistió</span>
            <span className="summary-value">
              {sortedData.reduce((sum, t) => sum + parseInt(t.no_asistio || 0), 0)}
            </span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon info">📊</div>
          <div className="summary-content">
            <span className="summary-label">Tasa Promedio</span>
            <span className="summary-value">
              {sortedData.length > 0 
                ? (sortedData.reduce((sum, t) => sum + parseFloat(t.tasa_asistencia || 0), 0) / sortedData.length).toFixed(1)
                : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ========== EARNINGS TAB COMPONENT ==========
const EarningsTab = ({ selectedMonth, exportReport }) => {
  const [loading, setLoading] = useState(true)
  const [earningsData, setEarningsData] = useState(null)
  const [sortBy, setSortBy] = useState('comision_terapeuta')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    loadEarningsData()
  }, [selectedMonth])

  const loadEarningsData = async () => {
    setLoading(true)
    const result = await therapistReportsService.getEarningsReport(selectedMonth)
    if (result.success) {
      setEarningsData(result.data)
    }
    setLoading(false)
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  if (loading) {
    return (
      <div className="tab-loading">
        <div className="spinner-small"></div>
        <p>Cargando reporte de ganancias...</p>
      </div>
    )
  }

  if (!earningsData) {
    return <div className="tab-error">Error cargando datos</div>
  }

  const sortedTherapists = [...earningsData.terapeutas].sort((a, b) => {
    let aVal = parseFloat(a[sortBy]) || 0
    let bVal = parseFloat(b[sortBy]) || 0

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return (
    <div className="earnings-tab-content">
     <div className="tab-header">
  <h2>
    <FiDollarSign />
    Reporte de Ganancias
  </h2>
  <div className="export-buttons">
    <button className="btn-export excel" onClick={() => exportReport('earnings', 'excel')}>
      <FiDownload />
      Excel
    </button>
    <button className="btn-export pdf" onClick={() => exportReport('earnings', 'pdf')}>
      <FiDownload />
      PDF
    </button>
  </div>
</div>

      <div className="earnings-totals">
        <div className="total-card total-primary">
          <div className="total-icon">💰</div>
          <div className="total-content">
            <span className="total-label">Ingresos Totales Generados</span>
            <span className="total-amount">{formatPrice(earningsData.totales.ingresos_generados)}</span>
          </div>
        </div>

        <div className="total-card total-warning">
          <div className="total-icon">👥</div>
          <div className="total-content">
            <span className="total-label">Comisiones Terapeutas (40%)</span>
            <span className="total-amount">{formatPrice(earningsData.totales.comisiones_pagadas)}</span>
          </div>
        </div>

        <div className="total-card total-success">
          <div className="total-icon">🏪</div>
          <div className="total-content">
            <span className="total-label">Ganancia SPA (60%)</span>
            <span className="total-amount">{formatPrice(earningsData.totales.ganancia_spa)}</span>
          </div>
        </div>
      </div>

      <div className="earnings-table-wrapper">
        <table className="earnings-table">
          <thead>
            <tr>
              <th>Terapeuta</th>
              <th onClick={() => handleSort('citas_completadas')} className="sortable">
                Citas Completadas
                {sortBy === 'citas_completadas' && (
                  <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSort('ingresos_generados')} className="sortable">
                Ingresos Generados
                {sortBy === 'ingresos_generados' && (
                  <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSort('comision_terapeuta')} className="sortable">
                Comisión Terapeuta (40%)
                {sortBy === 'comision_terapeuta' && (
                  <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th>Ganancia SPA (60%)</th>
            </tr>
          </thead>
          <tbody>
            {sortedTherapists.map((therapist) => {
              const gananciaSpa = parseFloat(therapist.ingresos_generados) - parseFloat(therapist.comision_terapeuta)
              
              return (
                <tr key={therapist.id}>
                  <td className="therapist-cell">
                    <div className="therapist-info-row">
                      <div className="avatar-tiny">
                        {therapist.foto_url ? (
                          <img src={therapist.foto_url} alt={therapist.nombre_completo} />
                        ) : (
                          <div className="avatar-placeholder-tiny">
                            {therapist.nombre_completo.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                        )}
                      </div>
                      <span className="therapist-name">{therapist.nombre_completo}</span>
                    </div>
                  </td>
                  <td className="numeric-cell">
                    <span className="badge badge-info">{therapist.citas_completadas}</span>
                  </td>
                  <td className="numeric-cell">
                    <span className="price-text primary">{formatPrice(therapist.ingresos_generados)}</span>
                  </td>
                  <td className="numeric-cell">
                    <span className="price-text warning">{formatPrice(therapist.comision_terapeuta)}</span>
                  </td>
                  <td className="numeric-cell">
                    <span className="price-text success">{formatPrice(gananciaSpa)}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="totals-row">
              <td><strong>TOTALES</strong></td>
              <td className="numeric-cell">
                <span className="badge badge-info">
                  {sortedTherapists.reduce((sum, t) => sum + parseInt(t.citas_completadas || 0), 0)}
                </span>
              </td>
              <td className="numeric-cell">
                <strong className="price-text primary">{formatPrice(earningsData.totales.ingresos_generados)}</strong>
              </td>
              <td className="numeric-cell">
                <strong className="price-text warning">{formatPrice(earningsData.totales.comisiones_pagadas)}</strong>
              </td>
              <td className="numeric-cell">
                <strong className="price-text success">{formatPrice(earningsData.totales.ganancia_spa)}</strong>
              </td>
            </tr>
          </tfoot>
        </table>

        {sortedTherapists.length === 0 && (
          <div className="empty-table">
            <p>No hay datos de ganancias para este mes</p>
          </div>
        )}
      </div>

      <div className="distribution-section">
        <h3>Distribución de Ingresos</h3>
        <div className="distribution-chart">
          <div className="distribution-bar">
            <div 
              className="distribution-segment comision"
              style={{ 
                width: `${(earningsData.totales.comisiones_pagadas / earningsData.totales.ingresos_generados) * 100}%` 
              }}
            >
              <span>Comisiones (40%)</span>
            </div>
            <div 
              className="distribution-segment ganancia"
              style={{ 
                width: `${(earningsData.totales.ganancia_spa / earningsData.totales.ingresos_generados) * 100}%` 
              }}
            >
              <span>Ganancia SPA (60%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TherapistReportsPage