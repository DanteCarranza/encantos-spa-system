import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  FiHome, 
  FiPackage, 
  FiShoppingBag, 
  FiUsers, 
  FiSettings,
  FiMenu,
  FiX,
  FiLogOut,
  FiBarChart,
  FiCalendar,
  FiDollarSign,
  FiFolder,
  FiFileText,
  FiArrowLeft 
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import './AdminLayout.css'

const AdminLayout = () => {
  //const { user, logout } = useAuth()
  const [user, setUser] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const [sidebarOpen, setSidebarOpen] = useState(true)
  

  const menuItems = [
   /* { path: '/admin', icon: FiBarChart, label: 'Dashboard' },
    { path: '/admin/productos', icon: FiPackage, label: 'Servicios' },
    { path: '/admin/pedidos', icon: FiShoppingBag, label: 'Pedidos' },
    { path: '/admin/citas', icon: FiCalendar, label: 'Citas' }, // NUEVO
    { path: '/admin/usuarios', icon: FiUsers, label: 'Usuarios' },
    { path: '/admin/configuracion', icon: FiSettings, label: 'Configuración' },*/

    { path: '/admin/spa/dashboard', icon: FiBarChart, label: 'Dashboard' },
    { path: '/admin/spa/usuarios', icon: FiUsers, label: 'Usuarios' },
    { path: '/admin/spa/categorias',icon: FiFolder , label: 'Categorías' },

  { path: '/admin/spa/productos', icon: FiPackage, label: 'Servicios' },
  { path: '/admin/spa/pedidos', icon: FiShoppingBag, label: 'Citas' },
  { path: '/admin/spa/devoluciones', icon: FiArrowLeft, label: 'Devoluciones' },

 
  { path: '/admin/spa/terapeutas', icon: FiUsers, label: 'Terapeutas' },
  { path: '/admin/spa/terapeutas2', icon: FiUsers, label: 'Gestión de Terapeutas' },

 /*{ path: '/admin/spa/citas', icon: FiCalendar, label: 'Citas' },*/

  { path: '/admin/spa/horarios', icon: FiCalendar, label: 'Horarios'  },

  { path: '/admin/spa/facturacion', icon: FiFileText, label: 'Facturación' },
 
  { path: '/admin/spa/reportes', icon: FiDollarSign, label: 'Reportes' },
  /*  { path: '/admin/spa/configuracion', icon: FiSettings, label: 'Configuración' },*/
  { path: '/admin/spa/reclamaciones', icon: FiFileText, label: 'Reclamaciones' }

  ]

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }


  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('tokenExpiration');
    navigate('/login');
  };


  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Admin Panel</h2>
          <button className="sidebar-close" onClick={toggleSidebar}>
            <FiX />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>






        <div className="sidebar-footer">


        <Link to="/admin" className="sidebar-link">
            <FiCalendar />
            {sidebarOpen && <span>Volver al Selector</span>}
          </Link>


          <Link 
            to="/" 
            className="sidebar-link"
            onClick={() => setIsSidebarOpen(false)}
          >
            <FiHome />
            <span>Volver al sitio</span>
          </Link>
          <button className="sidebar-link logout" onClick={handleLogout}>
            <FiLogOut />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}

      {/* Contenido principal */}
      <div className="admin-main">
        {/* Header del admin */}
        <header className="admin-header">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <FiMenu />
          </button>
          
          <div className="admin-header-content">
            <h1 className="page-title">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Admin'}
            </h1>
            
            <div className="admin-user">
              <div className="admin-user-info">
              <span className="admin-user-name">{user?.nombre_completo || 'Admin'}</span>
                <span className="admin-user-role">Administrador</span>
              </div>
              <div className="admin-avatar">
              {user?.nombre_completo ? user.nombre_completo.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AD'}
              </div>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout