import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  FiHome, 
  FiDollarSign, 
  FiUsers, 
  FiBookOpen,
  FiFileText,
  FiBarChart2,
  FiArrowLeft,
  FiCalendar,
  FiTarget,
  
} from 'react-icons/fi'
import './AulaVirtualLayout.css'

const AulaVirtualLayout = () => {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div className="aulavirtual-layout">
      {/* Sidebar */}
      <aside className="aulavirtual-sidebar">
        <div className="aulavirtual-sidebar-header">
          <Link to="/admin/selector" className="aulavirtual-back-button">
            <FiArrowLeft />
          </Link>
          <div className="aulavirtual-sidebar-title">
            <h2>Aula Virtual</h2>
            <p>Gestión de Pagos</p>
          </div>
        </div>

        <nav className="aulavirtual-sidebar-nav">
          <Link 
            to="/aulavirtual/dashboard" 
            className={`aulavirtual-nav-item ${isActive('/aulavirtual/dashboard') ? 'active' : ''}`}
          >
            <FiHome />
            <span>Dashboard</span>
          </Link>
          <Link 
            to="/aulavirtual/pagos" 
            className={`aulavirtual-nav-item ${isActive('/aulavirtual/pagos') ? 'active' : ''}`}
          >
            <FiDollarSign />
            <span>Pagos</span>
          </Link>
          <Link 
            to="/aulavirtual/estudiantes" 
            className={`aulavirtual-nav-item ${isActive('/aulavirtual/estudiantes') ? 'active' : ''}`}
          >
            <FiUsers />
            <span>Estudiantes</span>
          </Link>
          <Link 
            to="/aulavirtual/cursos" 
            className={`aulavirtual-nav-item ${isActive('/aulavirtual/cursos') ? 'active' : ''}`}
          >
            <FiBookOpen />
            <span>Cursos</span>
          </Link>
          <Link 
            to="/aulavirtual/comprobantes" 
            className={`aulavirtual-nav-item ${isActive('/aulavirtual/comprobantes') ? 'active' : ''}`}
          >
            <FiFileText />
            <span>Comprobantes</span>
          </Link>
          <Link 
            to="/aulavirtual/calendario" 
            className={`aulavirtual-nav-item ${isActive('/aulavirtual/calendario') ? 'active' : ''}`}
          >
            <FiCalendar />
            <span>Calendario</span>
          </Link>

          <Link 
            to="/aulavirtual/metas" 
            className={`aulavirtual-nav-item ${isActive('/aulavirtual/metas') ? 'active' : ''}`}
          >
            <FiTarget />
            <span>Metas</span>
          </Link>

          <Link 
            to="/aulavirtual/reportes" 
            className={`aulavirtual-nav-item ${isActive('/aulavirtual/reportes') ? 'active' : ''}`}
          >
            <FiBarChart2 />
            <span>Reportes</span>
          </Link>


        </nav>
      </aside>

      {/* Main Content */}
      <main className="aulavirtual-main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AulaVirtualLayout