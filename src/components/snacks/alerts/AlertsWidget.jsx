import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiAlertTriangle,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiX,
  FiChevronRight,
  FiPackage,
  FiClock,
  FiTrendingUp
} from 'react-icons/fi'
import alertsService from '../../../services/snacks/alertsService'
import './AlertsWidget.css'

const AlertsWidget = ({ onAlertsUpdate }) => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState({})
  const [widgetMinimized, setWidgetMinimized] = useState(false) // Minimizado por defecto
  const navigate = useNavigate()

  useEffect(() => {
    loadAlerts()
    
    // Recargar alertas cada 5 minutos
    const interval = setInterval(loadAlerts, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const loadAlerts = async () => {
    try {
      const result = await alertsService.getAlertsSummary()
      
      if (result.success) {
        setAlerts(result.data)
        
        // Notificar al componente padre del total de alertas
        if (onAlertsUpdate) {
          const totalCriticas = result.data.filter(a => 
            a.nivel === 'ERROR' || a.nivel === 'WARNING'
          ).length
          onAlertsUpdate(totalCriticas)
        }
      }
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAlertClick = (alert) => {
    if (alert.accion) {
      navigate(alert.accion)
    }
  }

  const toggleCollapse = (tipo) => {
    setCollapsed(prev => ({
      ...prev,
      [tipo]: !prev[tipo]
    }))
  }

  const getAlertIcon = (nivel) => {
    switch(nivel) {
      case 'ERROR':
        return <FiAlertCircle />
      case 'WARNING':
        return <FiAlertTriangle />
      case 'SUCCESS':
        return <FiCheckCircle />
      default:
        return <FiInfo />
    }
  }

  const getAlertColor = (nivel) => {
    switch(nivel) {
      case 'ERROR':
        return '#ef4444'
      case 'WARNING':
        return '#f59e0b'
      case 'SUCCESS':
        return '#10b981'
      default:
        return '#3b82f6'
    }
  }

  if (loading) {
    return (
      <div className="alerts-widget">
        <div className="alerts-loading">
          <div className="spinner"></div>
          <p>Cargando alertas...</p>
        </div>
      </div>
    )
  }

  if (alerts.length === 0) {
    return null // No mostrar nada si no hay alertas
  }

  // Vista minimizada
  if (widgetMinimized) {
    const totalCriticas = alerts.filter(a => a.nivel === 'ERROR' || a.nivel === 'WARNING').length
    
    return (
      <div className="alerts-widget-minimized" onClick={() => setWidgetMinimized(false)}>
        <div className="minimized-content">
          <div className="minimized-icon">
            <FiAlertTriangle />
          </div>
          <div className="minimized-info">
            <h3>{alerts.length} Alerta{alerts.length > 1 ? 's' : ''} Activa{alerts.length > 1 ? 's' : ''}</h3>
            <p>
              {totalCriticas > 0 && `${totalCriticas} requieren atención`}
              {totalCriticas === 0 && 'Todo bajo control'}
            </p>
          </div>
          <div className="minimized-badges">
            {alerts.map((alert, idx) => (
              <span 
                key={idx}
                className="alert-mini-badge"
                style={{ backgroundColor: getAlertColor(alert.nivel) }}
                title={alert.titulo}
              >
                {alert.total}
              </span>
            ))}
          </div>
          <div className="expand-button">
            <FiChevronRight />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="alerts-widget">
      <div className="alerts-header">
        <h2>
          <FiAlertTriangle />
          Alertas Activas
        </h2>
        <div className="alerts-header-actions">
          <span className="alerts-count">{alerts.length}</span>
          <button 
            className="btn-minimize"
            onClick={() => setWidgetMinimized(true)}
            title="Minimizar"
          >
            <FiX />
          </button>
        </div>
      </div>

      <div className="alerts-list">
        {alerts.map((alert, index) => (
          <div 
            key={index} 
            className={`alert-item ${alert.nivel.toLowerCase()}`}
            style={{ borderLeftColor: getAlertColor(alert.nivel) }}
          >
            <div className="alert-header" onClick={() => toggleCollapse(alert.tipo)}>
              <div className="alert-icon" style={{ color: getAlertColor(alert.nivel) }}>
                {getAlertIcon(alert.nivel)}
              </div>
              
              <div className="alert-content">
                <h3>{alert.titulo}</h3>
                <p>{alert.mensaje}</p>
              </div>

              <div className="alert-actions">
                {alert.items && alert.items.length > 0 && (
                  <span className="alert-badge">{alert.total}</span>
                )}
                <button 
                  className="btn-collapse"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleCollapse(alert.tipo)
                  }}
                >
                  <FiChevronRight className={collapsed[alert.tipo] ? '' : 'rotated'} />
                </button>
              </div>
            </div>

            {!collapsed[alert.tipo] && alert.items && alert.items.length > 0 && (
              <div className="alert-details">
                {alert.tipo === 'STOCK_BAJO' && (
                  <div className="stock-list">
                    {alert.items.map((item, idx) => (
                      <div key={idx} className="stock-item">
                        <div className="stock-info">
                          <span className="stock-code">{item.codigo}</span>
                          <span className="stock-name">{item.nombre}</span>
                        </div>
                        <div className="stock-values">
                          <span className="stock-current">Stock: {item.stock_actual}</span>
                          <span className="stock-min">Mín: {item.stock_minimo}</span>
                          <span className="stock-missing">Faltan: {item.faltante}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {alert.tipo === 'PRODUCTOS_VENCIDOS' && (
                  <div className="expired-list">
                    {alert.items.map((item, idx) => (
                      <div key={idx} className="expired-item">
                        <div className="expired-info">
                          <span className="expired-code">{item.codigo}</span>
                          <span className="expired-name">{item.nombre}</span>
                        </div>
                        <div className="expired-date">
                          <FiClock />
                          <span className={item.dias_restantes <= 3 ? 'critical' : ''}>
                            {item.dias_restantes === 0 ? 'Hoy' : 
                             item.dias_restantes === 1 ? 'Mañana' : 
                             `${item.dias_restantes} días`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {alert.tipo === 'CIERRE_CAJA_PENDIENTE' && (
                  <div className="cash-info">
                    {alert.items.map((item, idx) => (
                      <div key={idx} className="cash-item">
                        <p><strong>Usuario:</strong> {item.usuario}</p>
                        <p><strong>Apertura:</strong> {new Date(item.fecha_apertura).toLocaleString('es-PE')}</p>
                        <p><strong>Tiempo abierta:</strong> {item.horas_abiertas} horas</p>
                        <p><strong>Monto inicial:</strong> S/ {parseFloat(item.monto_inicial).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {alert.tipo === 'META_VENTAS' && (
                  <div className="sales-goal">
                    {alert.items.map((item, idx) => {
                      // Convertir a números
                      const ventaActual = parseFloat(item.venta_actual) || 0
                      const meta = parseFloat(item.meta) || 0
                      const porcentaje = parseFloat(item.porcentaje) || 0
                      const faltante = parseFloat(item.faltante) || 0
                      
                      return (
                        <div key={idx} className="sales-item">
                          <div className="sales-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill"
                                style={{ 
                                  width: `${Math.min(porcentaje, 100)}%`,
                                  backgroundColor: getAlertColor(alert.nivel)
                                }}
                              />
                            </div>
                            <span className="progress-label">{porcentaje.toFixed(1)}%</span>
                          </div>
                          <div className="sales-values">
                            <span>Vendido: S/ {ventaActual.toFixed(2)}</span>
                            <span>Meta: S/ {meta.toFixed(2)}</span>
                            {faltante > 0 && (
                              <span className="sales-missing">Faltan: S/ {faltante.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {alert.accion && (
                  <button 
                    className="btn-action"
                    onClick={() => handleAlertClick(alert)}
                  >
                    Ver detalles
                    <FiChevronRight />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AlertsWidget