import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiDollarSign, 
  FiUsers, 
  FiBookOpen, 
  FiFileText,
  FiTrendingUp,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiArrowUp,
  FiArrowDown,
  FiCalendar,
  FiPieChart,
  FiActivity,
  FiFilter
} from 'react-icons/fi'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import aulaVirtualService from '../../services/aulaVirtualService'
import './AulaVirtualDashboard.css'

const AulaVirtualDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fin: new Date().toISOString().split('T')[0]
  })
  const [selectedPeriod, setSelectedPeriod] = useState('month') // month | week | year

  useEffect(() => {
    loadDashboard()
  }, [dateRange])

  const loadDashboard = async () => {
    setLoading(true)
    const result = await aulaVirtualService.getDashboardStats(dateRange.inicio, dateRange.fin)
    
    if (result.success) {
      setStats(result.data)
    }
    setLoading(false)
  }

  const handlePeriodChange = (period) => {
    const today = new Date()
    let inicio

    switch(period) {
      case 'week':
        inicio = new Date(today.setDate(today.getDate() - 7))
        break
      case 'month':
        inicio = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case 'year':
        inicio = new Date(today.getFullYear(), 0, 1)
        break
      default:
        inicio = new Date(today.getFullYear(), today.getMonth(), 1)
    }

    setDateRange({
      inicio: inicio.toISOString().split('T')[0],
      fin: new Date().toISOString().split('T')[0]
    })
    setSelectedPeriod(period)
  }

  if (loading) {
    return (
      <div className="loading-dashboard-v2">
        <div className="loading-spinner-v2"></div>
        <p>Cargando dashboard...</p>
        <div className="loading-bars">
          <div className="loading-bar"></div>
          <div className="loading-bar"></div>
          <div className="loading-bar"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="error-dashboard-v2">
        <FiAlertCircle />
        <h3>Error al cargar datos</h3>
        <p>No se pudieron obtener las estadísticas</p>
        <button onClick={loadDashboard} className="btn-retry">
          Reintentar
        </button>
      </div>
    )
  }

  const kpis = stats.kpis || {}
  const pagosRecientes = stats.pagos_recientes || []
  const pagosPorMetodo = stats.pagos_por_metodo || []

  // Calcular tendencias (simuladas - podrías calcularlas en el backend)
  const calcularTendencia = (actual, anterior) => {
    if (!anterior || anterior === 0) return 0
    return ((actual - anterior) / anterior * 100).toFixed(1)
  }

  // Datos para gráficos
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  const dataPieMetodos = pagosPorMetodo.map((m, i) => ({
    name: m.metodo_pago?.toUpperCase() || 'OTRO',
    value: parseFloat(m.monto_total),
    cantidad: parseInt(m.cantidad),
    color: COLORS[i % COLORS.length]
  }))

  return (
    <div className="aulavirtual-dashboard-v2">
      {/* Hero Header */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Dashboard Aula Virtual</h1>
            <p>Gestión integral de pagos y facturación de estudiantes</p>
          </div>
          <div className="hero-icon">
            <FiActivity />
          </div>
        </div>
        
        {/* Period Selector */}
        <div className="period-selector">
          <button 
            className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('week')}
          >
            Última Semana
          </button>
          <button 
            className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('month')}
          >
            Este Mes
          </button>
          <button 
            className={`period-btn ${selectedPeriod === 'year' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('year')}
          >
            Este Año
          </button>
        </div>

        {/* Custom Date Range */}
        <div className="custom-date-range">
          <FiCalendar />
          <input
            type="date"
            value={dateRange.inicio}
            onChange={(e) => setDateRange(prev => ({ ...prev, inicio: e.target.value }))}
            className="date-input-v2"
          />
          <span>—</span>
          <input
            type="date"
            value={dateRange.fin}
            onChange={(e) => setDateRange(prev => ({ ...prev, fin: e.target.value }))}
            className="date-input-v2"
          />
        </div>
      </div>

    
    
    {/* KPIs Mejorados con Tendencias */}
    <div className="kpis-grid-v2">
        <div className="kpi-card-v2 blue">
          <div className="kpi-header-v2">
            <div className="kpi-icon-v2">
              <FiUsers />
            </div>
            <div className="kpi-trend positive">
              <FiArrowUp />
              <span>12%</span>
            </div>
          </div>
          <div className="kpi-body-v2">
            <span className="kpi-label-v2">Total Estudiantes</span>
            <span className="kpi-value-v2">{kpis.total_estudiantes || 0}</span>
            <span className="kpi-subtitle-v2">Estudiantes activos</span>
          </div>
          <div className="kpi-footer-v2">
            <div className="kpi-sparkline blue"></div>
          </div>
        </div>

        <div className="kpi-card-v2 purple">
          <div className="kpi-header-v2">
            <div className="kpi-icon-v2">
              <FiBookOpen />
            </div>
            <div className="kpi-trend positive">
              <FiArrowUp />
              <span>8%</span>
            </div>
          </div>
          <div className="kpi-body-v2">
            <span className="kpi-label-v2">Cursos Activos</span>
            <span className="kpi-value-v2">{kpis.total_cursos || 0}</span>
            <span className="kpi-subtitle-v2">Cursos disponibles</span>
          </div>
          <div className="kpi-footer-v2">
            <div className="kpi-sparkline purple"></div>
          </div>
        </div>

        <div className="kpi-card-v2 green">
          <div className="kpi-header-v2">
            <div className="kpi-icon-v2">
              <FiDollarSign />
            </div>
            <div className="kpi-trend positive">
              <FiArrowUp />
              <span>24%</span>
            </div>
          </div>
          <div className="kpi-body-v2">
            <span className="kpi-label-v2">Ingresos Totales</span>
            <span className="kpi-value-v2">{aulaVirtualService.formatPrice(kpis.ingresos_totales || 0)}</span>
            <span className="kpi-subtitle-v2">En el período seleccionado</span>
          </div>
          <div className="kpi-footer-v2">
            <div className="kpi-sparkline green"></div>
          </div>
        </div>

        <div className="kpi-card-v2 orange">
          <div className="kpi-header-v2">
            <div className="kpi-icon-v2">
              <FiAlertCircle />
            </div>
            <div className="kpi-trend negative">
              <FiArrowDown />
              <span>5%</span>
            </div>
          </div>
          <div className="kpi-body-v2">
            <span className="kpi-label-v2">Pendiente de Cobro</span>
            <span className="kpi-value-v2">{aulaVirtualService.formatPrice(kpis.total_pendiente || 0)}</span>
            <span className="kpi-subtitle-v2">Pagos pendientes</span>
          </div>
          <div className="kpi-footer-v2">
            <div className="kpi-sparkline orange"></div>
          </div>
        </div>

        <div className="kpi-card-v2 teal">
          <div className="kpi-header-v2">
            <div className="kpi-icon-v2">
              <FiTrendingUp />
            </div>
            <div className="kpi-trend positive">
              <FiArrowUp />
              <span>18%</span>
            </div>
          </div>
          <div className="kpi-body-v2">
            <span className="kpi-label-v2">Total Pagos</span>
            <span className="kpi-value-v2">{kpis.total_pagos || 0}</span>
            <span className="kpi-subtitle-v2">Transacciones registradas</span>
          </div>
          <div className="kpi-footer-v2">
            <div className="kpi-sparkline teal"></div>
          </div>
        </div>

        <div className="kpi-card-v2 indigo">
          <div className="kpi-header-v2">
            <div className="kpi-icon-v2">
              <FiFileText />
            </div>
            <div className="kpi-trend positive">
              <FiArrowUp />
              <span>15%</span>
            </div>
          </div>
          <div className="kpi-body-v2">
            <span className="kpi-label-v2">Comprobantes</span>
            <span className="kpi-value-v2">{kpis.total_comprobantes || 0}</span>
            <span className="kpi-subtitle-v2">Emitidos</span>
          </div>
          <div className="kpi-footer-v2">
            <div className="kpi-sparkline indigo"></div>
          </div>
        </div>
      </div>

      {/* Gráficos y Estadísticas */}
      <div className="dashboard-charts-grid">
        {/* Gráfico: Ingresos por Método de Pago */}
        <div className="chart-card-v2">
          <div className="chart-header-v2">
            <div>
              <h3>
                <FiPieChart />
                Ingresos por Método de Pago
              </h3>
              <p>Distribución de métodos de pago</p>
            </div>
          </div>
          <div className="chart-body-v2">
            {dataPieMetodos.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={dataPieMetodos}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {dataPieMetodos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `S/ ${value.toFixed(2)}`}
                      contentStyle={{ 
                        background: 'white', 
                        border: '2px solid #e2e8f0', 
                        borderRadius: '12px',
                        padding: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="chart-legend-v2">
                  {dataPieMetodos.map((item, index) => (
                    <div key={index} className="legend-item-v2">
                      <span className="legend-color-v2" style={{ background: item.color }}></span>
                      <span className="legend-text-v2">
                        <strong>{item.name}</strong>
                        <span>{aulaVirtualService.formatPrice(item.value)} ({item.cantidad})</span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="no-data-chart">
                <FiPieChart />
                <p>No hay datos de métodos de pago</p>
              </div>
            )}
          </div>
        </div>

        {/* Pagos Recientes */}
        <div className="chart-card-v2">
          <div className="chart-header-v2">
            <div>
              <h3>
                <FiClock />
                Últimos Pagos Registrados
              </h3>
              <p>Actividad reciente del sistema</p>
            </div>
            <Link to="/aulavirtual/pagos" className="view-all-link-v2">
              Ver todos →
            </Link>
          </div>
          <div className="chart-body-v2">
            {pagosRecientes.length === 0 ? (
              <div className="no-data-chart">
                <FiClock />
                <p>No hay pagos recientes</p>
              </div>
            ) : (
              <div className="payments-timeline">
                {pagosRecientes.slice(0, 8).map((pago, index) => (
                  <div key={pago.id} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-student">{pago.estudiante}</span>
                        <span className="timeline-amount">{aulaVirtualService.formatPrice(pago.monto_total)}</span>
                      </div>
                      <div className="timeline-details">
                        <span className="timeline-course">{pago.curso}</span>
                        <span className="timeline-date">{aulaVirtualService.formatDate(pago.fecha_pago)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumen Rápido */}
      <div className="quick-summary">
        <div className="summary-card">
          <div className="summary-icon green">
            <FiCheckCircle />
          </div>
          <div className="summary-content">
            <span className="summary-value">
              {kpis.total_pagos ? 
                ((kpis.total_pagos - (kpis.total_pendiente_count || 0)) / kpis.total_pagos * 100).toFixed(1) 
                : 0}%
            </span>
            <span className="summary-label">Tasa de Cobro</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon blue">
            <FiDollarSign />
          </div>
          <div className="summary-content">
            <span className="summary-value">
              {kpis.total_pagos > 0 ? 
                aulaVirtualService.formatPrice((kpis.ingresos_totales || 0) / kpis.total_pagos)
                : 'S/ 0.00'}
            </span>
            <span className="summary-label">Ticket Promedio</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon purple">
            <FiUsers />
          </div>
          <div className="summary-content">
            <span className="summary-value">
              {kpis.total_cursos > 0 && kpis.total_estudiantes > 0 ?
                (kpis.total_estudiantes / kpis.total_cursos).toFixed(1)
                : 0}
            </span>
            <span className="summary-label">Estudiantes por Curso</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon orange">
            <FiAlertCircle />
          </div>
          <div className="summary-content">
            <span className="summary-value">{kpis.total_pendiente_count || 0}</span>
            <span className="summary-label">Pagos Pendientes</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Mejorado */}
      <div className="quick-actions-v2">
        <h3>
          <FiActivity />
          Acciones Rápidas
        </h3>
        <div className="actions-grid-v2">
          <Link to="/aulavirtual/pagos" className="action-card-v2 blue">
            <div className="action-icon-v2">
              <FiDollarSign />
            </div>
            <div className="action-content-v2">
              <span className="action-title-v2">Gestionar Pagos</span>
              <span className="action-desc-v2">Registrar y consultar pagos</span>
            </div>
            <div className="action-arrow-v2">→</div>
          </Link>

          <Link to="/aulavirtual/estudiantes" className="action-card-v2 purple">
            <div className="action-icon-v2">
              <FiUsers />
            </div>
            <div className="action-content-v2">
              <span className="action-title-v2">Ver Estudiantes</span>
              <span className="action-desc-v2">Lista de estudiantes matriculados</span>
            </div>
            <div className="action-arrow-v2">→</div>
          </Link>

          <Link to="/aulavirtual/cursos" className="action-card-v2 green">
            <div className="action-icon-v2">
              <FiBookOpen />
            </div>
            <div className="action-content-v2">
              <span className="action-title-v2">Ver Cursos</span>
              <span className="action-desc-v2">Catálogo de cursos disponibles</span>
            </div>
            <div className="action-arrow-v2">→</div>
          </Link>

          <Link to="/aulavirtual/comprobantes" className="action-card-v2 orange">
            <div className="action-icon-v2">
              <FiFileText />
            </div>
            <div className="action-content-v2">
              <span className="action-title-v2">Comprobantes</span>
              <span className="action-desc-v2">Facturas y boletas electrónicas</span>
            </div>
            <div className="action-arrow-v2">→</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AulaVirtualDashboard