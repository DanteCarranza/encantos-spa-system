import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiPackage,
  FiDollarSign,
  FiAlertCircle,
  FiShoppingCart,
  FiTrendingUp,
  FiLock,
  FiUnlock,
  FiCreditCard,
  FiAlertTriangle 
} from 'react-icons/fi'
import productsService from '../../../services/snacks/productsService'
import reportsService from '../../../services/snacks/reportsService'
import cashService from '../../../services/snacks/cashService'
import walletService from '../../../services/snacks/walletService'
import './SnacksDashboard.css'
import AlertsWidget from '../../../components/snacks/alerts/AlertsWidget'

const SnacksDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProductos: 0,
    productosActivos: 0,
    valorInventario: 0,
    stockBajo: 0
  })
  const [cashStatus, setCashStatus] = useState(null)
  const [walletBalance, setWalletBalance] = useState(null)
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [alertCount, setAlertCount] = useState(0)


  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Cargar estadísticas de productos
      const productsResult = await productsService.getProducts()
      if (productsResult.success) {
        const products = productsResult.data
        const activos = products.filter(p => p.activo === 1)
        const valorTotal = products.reduce((sum, p) => 
          sum + (p.stock_actual * p.precio_venta), 0
        )
        const stockBajo = products.filter(p => 
          p.stock_actual <= p.stock_minimo && p.activo === 1
        )

        setStats({
          totalProductos: products.length,
          productosActivos: activos.length,
          valorInventario: valorTotal,
          stockBajo: stockBajo.length
        })

        setLowStockProducts(stockBajo.slice(0, 5))
      }

      // Cargar estado de caja
      const cashResult = await cashService.getCashStatus()
      if (cashResult.success) {
        setCashStatus(cashResult.data)
      }

      // Cargar saldo de billetera
      const walletResult = await walletService.getBalance()
      if (walletResult.success) {
        setWalletBalance(walletResult.data)
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return `S/ ${parseFloat(amount || 0).toFixed(2)}`
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
    <div className="snacks-dashboard">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="banner-content">
          <div className="banner-icon">🍔</div>
          <div className="banner-text">
            <h1>¡Bienvenido al Panel de Snacks!</h1>
            <p>Gestiona tu inventario, ventas y caja de forma rápida y sencilla</p>
          </div>
        </div>
        <div className="banner-illustration">
          <div className="floating-emoji">🍔</div>
        </div>
      </div>



      <div className="dashboard-header">
        <h1>Dashboard de Snacks</h1>
        {alertCount > 0 && (
          <div className="alert-indicator">
            <FiAlertTriangle />
            {alertCount} alerta{alertCount > 1 ? 's' : ''} activa{alertCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Widget de Alertas */}
      <AlertsWidget onAlertsUpdate={setAlertCount} />





      {/* Main Stats */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FiPackage />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Productos</div>
            <div className="stat-value">{stats.totalProductos}</div>
            <div className="stat-footer">
              {stats.productosActivos} activos
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <div className="stat-label">Valor Inventario</div>
            <div className="stat-value">{formatCurrency(stats.valorInventario)}</div>
            <div className="stat-footer">
              Stock total valorizado
            </div>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">
            <FiAlertCircle />
          </div>
          <div className="stat-content">
            <div className="stat-label">Stock Bajo</div>
            <div className="stat-value">{stats.stockBajo}</div>
            <div className="stat-footer">
              Requiere reposición
            </div>
          </div>
        </div>

        <div className={`stat-card ${cashStatus?.abierta ? 'info' : 'warning'}`}>
          <div className="stat-icon">
            {cashStatus?.abierta ? <FiUnlock /> : <FiLock />}
          </div>
          <div className="stat-content">
            <div className="stat-label">Caja del Día</div>
            <div className="stat-value">
              {cashStatus?.abierta 
                ? formatCurrency(cashStatus.caja?.ventas_total)
                : formatCurrency(0)
              }
            </div>
            <div className="stat-footer">
              {cashStatus?.abierta ? 'Caja abierta' : 'Caja cerrada'}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      {cashStatus?.abierta && (
        <div className="secondary-stats">
          <div className="secondary-stat">
            <div className="secondary-icon">💵</div>
            <div className="secondary-content">
              <div className="secondary-label">Efectivo</div>
              <div className="secondary-value">{formatCurrency(cashStatus.caja?.ventas_efectivo)}</div>
            </div>
          </div>

          <div className="secondary-stat">
            <div className="secondary-icon">📱</div>
            <div className="secondary-content">
              <div className="secondary-label">Yape/Plin</div>
              <div className="secondary-value">{formatCurrency(cashStatus.caja?.ventas_yape)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Balance */}
      {walletBalance && (
        <div className="wallet-banner">
          <div className="wallet-icon">
            <FiCreditCard />
          </div>
          <div className="wallet-info">
            <div className="wallet-label">Billetera Digital</div>
            <div className="wallet-value">{formatCurrency(walletBalance.saldo_actual)}</div>
          </div>
          <button 
            className="wallet-btn"
            onClick={() => navigate('/admin/snacks/billetera')}
          >
            Ver Detalles
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="section-title">Acciones Rápidas</h2>
        <div className="actions-grid">
          <button 
            className="action-card"
            onClick={() => navigate('/admin/snacks/productos')}
          >
            <div className="action-icon primary">
              <FiPackage />
            </div>
            <div className="action-content">
              <div className="action-title">Gestionar Productos</div>
              <div className="action-description">Ver, crear y editar inventario</div>
            </div>
            <div className="action-arrow">→</div>
          </button>

          <button 
            className="action-card"
            onClick={() => navigate('/admin/snacks/pos')}
          >
            <div className="action-icon success">
              <FiShoppingCart />
            </div>
            <div className="action-content">
              <div className="action-title">Punto de Venta</div>
              <div className="action-description">Registrar ventas rápido</div>
            </div>
            <div className="action-arrow">→</div>
          </button>

          <button 
            className="action-card"
            onClick={() => navigate('/admin/snacks/caja')}
          >
            <div className="action-icon warning">
              <FiDollarSign />
            </div>
            <div className="action-content">
              <div className="action-title">Gestión de Caja</div>
              <div className="action-description">Apertura y cierre de caja</div>
            </div>
            <div className="action-arrow">→</div>
          </button>

          <button 
            className="action-card"
            onClick={() => navigate('/admin/snacks/reportes')}
          >
            <div className="action-icon info">
              <FiTrendingUp />
            </div>
            <div className="action-content">
              <div className="action-title">Reportes</div>
              <div className="action-description">Ventas y estadísticas</div>
            </div>
            <div className="action-arrow">→</div>
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="low-stock-section">
          <div className="section-header">
            <h2 className="section-title">
              <FiAlertCircle />
              Productos con Stock Bajo
            </h2>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/admin/snacks/productos')}
            >
              Ver todos
            </button>
          </div>

          <div className="low-stock-list">
            {lowStockProducts.map(product => (
              <div key={product.id} className="low-stock-item">
                <div className="product-icon">⚠️</div>
                <div className="product-info">
                  <div className="product-name">{product.nombre}</div>
                  <div className="product-stock">
                    Stock: <strong>{product.stock_actual}</strong> / Mínimo: {product.stock_minimo}
                  </div>
                </div>
                <div className="stock-badge danger">
                  Bajo
                </div>
              </div>
            ))}
          </div>

          {lowStockProducts.length === 0 && (
            <div className="empty-low-stock">
              <div className="success-icon">✅</div>
              <p>¡Todo bien! No hay productos con stock bajo</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SnacksDashboard