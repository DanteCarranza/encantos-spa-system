import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FiTrendingUp,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiPackage,
  FiShoppingBag,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCitas: 156,
    totalClientes: 89,
    ingresosMes: 34500,
    serviciosActivos: 12,
    citasHoy: 8,
    citasPendientes: 15
  })

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'cita', user: 'María González', service: 'Masaje Relajante', time: 'Hace 10 min' },
    { id: 2, type: 'cliente', user: 'Ana Rodríguez', action: 'Se registró', time: 'Hace 25 min' },
    { id: 3, type: 'cita', user: 'Lucía Martínez', service: 'Facial Rejuvenecedor', time: 'Hace 1 hora' }
  ])

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Bienvenida a tu centro de control</p>
        </div>
        <div className="dashboard-actions">
          <select className="period-select">
            <option>Esta Semana</option>
            <option>Este Mes</option>
            <option>Este Año</option>
          </select>
          <button className="btn btn-primary">
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card highlight">
          <div className="stat-icon">
            <FiCalendar />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Citas</div>
            <div className="stat-value">{stats.totalCitas}</div>
            <div className="stat-change positive">
              <FiArrowUp /> 12.5%
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <div className="stat-label">Ingresos Totales</div>
            <div className="stat-value">S/ {stats.ingresosMes.toLocaleString()}</div>
            <div className="stat-change positive">
              <FiArrowUp /> 8.3%
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            <FiUsers />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Clientes</div>
            <div className="stat-value">{stats.totalClientes}</div>
            <div className="stat-change positive">
              <FiArrowUp /> 5.2%
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <FiPackage />
          </div>
          <div className="stat-content">
            <div className="stat-label">Servicios Activos</div>
            <div className="stat-value">{stats.serviciosActivos}</div>
            <div className="stat-change neutral">
              Sin cambios
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="quick-stat-card">
          <div className="quick-stat-icon">
            <FiCalendar />
          </div>
          <div className="quick-stat-content">
            <div className="quick-stat-value">{stats.citasHoy}</div>
            <div className="quick-stat-label">Citas Hoy</div>
          </div>
        </div>

        <div className="quick-stat-card">
          <div className="quick-stat-icon">
            <FiShoppingBag />
          </div>
          <div className="quick-stat-content">
            <div className="quick-stat-value">{stats.citasPendientes}</div>
            <div className="quick-stat-label">Citas Pendientes</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Actividad Reciente</h2>
          <Link to="/admin/spa/citas" className="section-link">
            Ver todas
          </Link>
        </div>

        <div className="activity-list">
          {recentActivity.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className={`activity-icon ${activity.type}`}>
                {activity.type === 'cita' ? <FiCalendar /> : <FiUsers />}
              </div>
              <div className="activity-content">
                <div className="activity-user">{activity.user}</div>
                <div className="activity-details">
                  {activity.service || activity.action}
                </div>
              </div>
              <div className="activity-time">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2 className="section-title">Acciones Rápidas</h2>
        <div className="quick-actions">
          <Link to="/admin/spa/citas" className="quick-action-card">
            <FiCalendar />
            <span>Ver Citas</span>
          </Link>
          <Link to="/admin/spa/productos" className="quick-action-card">
            <FiPackage />
            <span>Gestionar Servicios</span>
          </Link>
          <Link to="/admin/spa/usuarios" className="quick-action-card">
            <FiUsers />
            <span>Ver Clientes</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard