import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiStar,
  FiArrowUp,
  FiArrowDown,
  FiEye,
  FiDownload,
  FiFilter
} from 'react-icons/fi'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import './DashboardPage.css'

const DashboardPage = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [recentAppointments, setRecentAppointments] = useState([])
  const [topServices, setTopServices] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [appointmentsData, setAppointmentsData] = useState([])
  const [servicesDistribution, setServicesDistribution] = useState([])
  const [timeFilter, setTimeFilter] = useState('week')

  useEffect(() => {
    loadDashboardData()
  }, [timeFilter])

  const loadDashboardData = async () => {
    setLoading(true)
    
    setTimeout(() => {
      setStats({
        totalAppointments: { value: 156, change: 12.5, trend: 'up' },
        totalRevenue: { value: 34500, change: 8.3, trend: 'up' },
        totalClients: { value: 89, change: 5.2, trend: 'up' },
        averageRating: { value: 4.8, change: 0.3, trend: 'up' },
        pendingAppointments: 12,
        confirmedAppointments: 28,
        completedAppointments: 98,
        cancelledAppointments: 18
      })

      // Datos para gráfico de ingresos
      setRevenueData([
        { mes: 'Ene', ingresos: 28000, gastos: 18000 },
        { mes: 'Feb', ingresos: 32000, gastos: 19000 },
        { mes: 'Mar', ingresos: 29500, gastos: 17500 },
        { mes: 'Abr', ingresos: 35000, gastos: 20000 },
        { mes: 'May', ingresos: 38000, gastos: 21000 },
        { mes: 'Jun', ingresos: 34500, gastos: 19500 }
      ])

      // Datos para gráfico de citas
      setAppointmentsData([
        { dia: 'Lun', citas: 18, completadas: 15 },
        { dia: 'Mar', citas: 22, completadas: 20 },
        { dia: 'Mié', citas: 20, completadas: 18 },
        { dia: 'Jue', citas: 25, completadas: 22 },
        { dia: 'Vie', citas: 28, completadas: 25 },
        { dia: 'Sáb', citas: 15, completadas: 14 },
        { dia: 'Dom', citas: 0, completadas: 0 }
      ])

      // Distribución de servicios
      setServicesDistribution([
        { name: 'Masajes', value: 35, color: '#d946ef' },
        { name: 'Faciales', value: 28, color: '#a855f7' },
        { name: 'Manicure', value: 20, color: '#fbbf24' },
        { name: 'Depilación', value: 12, color: '#10b981' },
        { name: 'Otros', value: 5, color: '#3b82f6' }
      ])

      setRecentAppointments([
        {
          id: 1,
          cliente: 'María González',
          servicio: 'Masaje Relajante',
          fecha: '2025-01-15',
          hora: '10:00',
          estado: 'confirmada',
          precio: 120
        },
        {
          id: 2,
          cliente: 'Ana Rodríguez',
          servicio: 'Facial Rejuvenecedor',
          fecha: '2025-01-15',
          hora: '11:30',
          estado: 'pendiente',
          precio: 150
        },
        {
          id: 3,
          cliente: 'Lucía Martínez',
          servicio: 'Manicure & Pedicure',
          fecha: '2025-01-15',
          hora: '14:00',
          estado: 'confirmada',
          precio: 80
        },
        {
          id: 4,
          cliente: 'Carmen López',
          servicio: 'Masaje de Piedras Calientes',
          fecha: '2025-01-16',
          hora: '09:00',
          estado: 'pendiente',
          precio: 180
        }
      ])

      setTopServices([
        { nombre: 'Masaje Relajante', reservas: 45, ingresos: 5400, porcentaje: 28.8, trend: 'up' },
        { nombre: 'Facial Rejuvenecedor', reservas: 38, ingresos: 5700, porcentaje: 24.4, trend: 'up' },
        { nombre: 'Manicure & Pedicure', reservas: 32, ingresos: 2560, porcentaje: 20.5, trend: 'down' },
        { nombre: 'Masaje de Piedras Calientes', reservas: 25, ingresos: 4500, porcentaje: 16.0, trend: 'up' },
        { nombre: 'Tratamiento Corporal', reservas: 16, ingresos: 3520, porcentaje: 10.3, trend: 'up' }
      ])

      setLoading(false)
    }, 1000)
  }

  const getStatusBadge = (estado) => {
    const badges = {
      pendiente: { class: 'badge-warning', icon: FiClock, label: 'Pendiente' },
      confirmada: { class: 'badge-success', icon: FiCheckCircle, label: 'Confirmada' },
      completada: { class: 'badge-info', icon: FiCheckCircle, label: 'Completada' },
      cancelada: { class: 'badge-error', icon: FiXCircle, label: 'Cancelada' }
    }
    const badge = badges[estado] || badges.pendiente
    const Icon = badge.icon
    return (
      <span className={`badge ${badge.class}`}>
        <Icon /> {badge.label}
      </span>
    )
  }

  const formatPrice = (price) => {
    return `S/ ${price.toFixed(2)}`
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {entry.name}: {formatPrice(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Cargando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Bienvenida a tu centro de control</p>
        </div>
        <div className="dashboard-actions">
          <div className="filter-group">
            <FiFilter />
            <select 
              className="filter-select"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
              <option value="year">Este Año</option>
            </select>
          </div>
          <button className="btn btn-outline">
            <FiDownload />
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-header">
            <div className="stat-icon">
              <FiCalendar />
            </div>
            <div className={`stat-trend ${stats.totalAppointments.trend}`}>
              {stats.totalAppointments.trend === 'up' ? <FiArrowUp /> : <FiArrowDown />}
              {stats.totalAppointments.change}%
            </div>
          </div>
          <div className="stat-body">
            <div className="stat-value">{stats.totalAppointments.value}</div>
            <div className="stat-label">Total Citas</div>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-header">
            <div className="stat-icon">
              <FiDollarSign />
            </div>
            <div className={`stat-trend ${stats.totalRevenue.trend}`}>
              {stats.totalRevenue.trend === 'up' ? <FiArrowUp /> : <FiArrowDown />}
              {stats.totalRevenue.change}%
            </div>
          </div>
          <div className="stat-body">
            <div className="stat-value">{formatPrice(stats.totalRevenue.value)}</div>
            <div className="stat-label">Ingresos Totales</div>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-header">
            <div className="stat-icon">
              <FiUsers />
            </div>
            <div className={`stat-trend ${stats.totalClients.trend}`}>
              {stats.totalClients.trend === 'up' ? <FiArrowUp /> : <FiArrowDown />}
              {stats.totalClients.change}%
            </div>
          </div>
          <div className="stat-body">
            <div className="stat-value">{stats.totalClients.value}</div>
            <div className="stat-label">Total Clientes</div>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-header">
            <div className="stat-icon">
              <FiStar />
            </div>
            <div className={`stat-trend ${stats.averageRating.trend}`}>
              {stats.averageRating.trend === 'up' ? <FiArrowUp /> : <FiArrowDown />}
              {stats.averageRating.change}
            </div>
          </div>
          <div className="stat-body">
            <div className="stat-value">{stats.averageRating.value}</div>
            <div className="stat-label">Valoración Promedio</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Revenue Chart */}
        <div className="chart-card revenue-chart">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Ingresos vs Gastos</h3>
              <p className="chart-subtitle">Últimos 6 meses</p>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="ingresos" 
                  stroke="#d946ef" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorIngresos)" 
                  name="Ingresos"
                />
                <Area 
                  type="monotone" 
                  dataKey="gastos" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorGastos)"
                  name="Gastos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Services Distribution */}
        <div className="chart-card distribution-chart">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Distribución de Servicios</h3>
              <p className="chart-subtitle">Por categoría</p>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={servicesDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {servicesDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {servicesDistribution.map((item, index) => (
                <div key={index} className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                  <span className="legend-name">{item.name}</span>
                  <span className="legend-value">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Bar Chart */}
      <div className="chart-card appointments-chart">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Citas por Día</h3>
            <p className="chart-subtitle">Esta semana</p>
          </div>
        </div>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="dia" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Bar dataKey="citas" fill="#d946ef" radius={[8, 8, 0, 0]} name="Total Citas" />
              <Bar dataKey="completadas" fill="#10b981" radius={[8, 8, 0, 0]} name="Completadas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="dashboard-grid">
        {/* Recent Appointments */}
        <div className="dashboard-card recent-appointments">
          <div className="card-header">
            <h2 className="card-title">
              <FiCalendar /> Próximas Citas
            </h2>
            <Link to="/admin/citas" className="card-action">
              Ver todas
            </Link>
          </div>
          <div className="card-body">
            <div className="appointments-list">
              {recentAppointments.map(appointment => (
                <div key={appointment.id} className="appointment-item">
                  <div className="appointment-main">
                    <div className="appointment-client">
                      <div className="client-avatar">
                        {appointment.cliente.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="client-info">
                        <div className="client-name">{appointment.cliente}</div>
                        <div className="client-service">{appointment.servicio}</div>
                      </div>
                    </div>
                    <div className="appointment-details">
                      <div className="appointment-datetime">
                        <FiCalendar />
                        {new Date(appointment.fecha).toLocaleDateString('es-PE', {
                          day: 'numeric',
                          month: 'short'
                        })}
                        <FiClock />
                        {appointment.hora}
                      </div>
                      <div className="appointment-price">
                        {formatPrice(appointment.precio)}
                      </div>
                    </div>
                  </div>
                  <div className="appointment-footer">
                    {getStatusBadge(appointment.estado)}
                    <button className="btn-icon-small">
                      <FiEye />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Services */}
        <div className="dashboard-card top-services">
          <div className="card-header">
            <h2 className="card-title">
              <FiTrendingUp /> Top Servicios
            </h2>
          </div>
          <div className="card-body">
            <div className="services-list">
              {topServices.map((service, index) => (
                <div key={index} className="service-item-enhanced">
                  <div className="service-rank">{index + 1}</div>
                  <div className="service-info-enhanced">
                    <div className="service-header">
                      <div className="service-name">{service.nombre}</div>
                      <div className={`service-trend ${service.trend}`}>
                        {service.trend === 'up' ? <FiArrowUp /> : <FiArrowDown />}
                      </div>
                    </div>
                    <div className="service-stats-enhanced">
                      <span className="stat-item">
                        <FiCalendar /> {service.reservas} reservas
                      </span>
                      <span className="stat-item revenue">
                        <FiDollarSign /> {formatPrice(service.ingresos)}
                      </span>
                    </div>
                    <div className="service-progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${service.porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage