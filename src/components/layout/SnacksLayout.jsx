import React, { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  FiMenu,
  FiX,
  FiHome,
  FiPackage,
  FiShoppingCart,
  FiDollarSign,
  FiTrendingUp,
  FiLogOut,
  FiShoppingBag,
  FiCreditCard,
  FiGrid,
  FiTruck,
  FiAlertTriangle 
} from 'react-icons/fi'
import './SnacksLayout.css'

const SnacksLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { path: '/admin/snacks/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/admin/snacks/categorias', icon: FiGrid, label: 'Categorías' },
    { path: '/admin/snacks/productos', icon: FiPackage, label: 'Productos' },
    { path: '/admin/snacks/pos', icon: FiShoppingCart, label: 'Punto de Venta', disabled: false },
    { path: '/admin/snacks/caja', icon: FiDollarSign, label: 'Caja', disabled: false },
    { path: '/admin/snacks/billetera', icon: FiCreditCard, label: 'Billetera Digital' }, 
    { path: '/admin/snacks/proveedores', icon: FiTruck, label: 'Proveedores' },
    { path: '/admin/snacks/compras', icon: FiShoppingBag, label: 'Compras' },
    { path: '/admin/snacks/mermas', icon: FiAlertTriangle, label: 'Mermas' }, 
    { path: '/admin/snacks/reportes', icon: FiTrendingUp, label: 'Reportes', disabled: false }
  ]

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('tokenExpiration')
    navigate('/login')
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="snacks-layout">
      {/* Sidebar */}
      <aside className={`snacks-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <FiShoppingBag />
            </div>
            {sidebarOpen && (
              <div className="logo-text">
                <h2>Snacks</h2>
                <span>Panel Admin</span>
              </div>
            )}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.disabled ? '#' : item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
                onClick={(e) => item.disabled && e.preventDefault()}
              >
                <Icon className="nav-icon" />
                {sidebarOpen && (
                  <>
                    <span className="nav-label">{item.label}</span>
                    {item.disabled && <span className="soon-badge">Pronto</span>}
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <Link to="/admin" className="footer-button">
            <FiHome />
            {sidebarOpen && <span>Volver al Selector</span>}
          </Link>
          <button onClick={handleLogout} className="footer-button logout">
            <FiLogOut />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`snacks-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Outlet />
      </main>
    </div>
  )
}

export default SnacksLayout