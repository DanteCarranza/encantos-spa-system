import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  FiShoppingCart, 
  FiUser, 
  FiMenu, 
  FiX, 
  FiLogOut,
  FiSettings,
  FiPackage,
  FiSearch
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import './Header.css'

const Header = () => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [cartItemsCount, setCartItemsCount] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)

  // Cargar usuario del localStorage
useEffect(() => {
    checkUserAuth();
  }, []);
  
  const checkUserAuth = () => {
    const userData = localStorage.getItem('userData');
    const token = localStorage.getItem('authToken');
    
    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  };
  
  const isAdmin = () => {
    return user?.rol === 'admin' || user?.role === 'admin';
  };

  // Detectar scroll para cambiar estilo del header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cargar cantidad de items del carrito
  useEffect(() => {
    const loadCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
      setCartItemsCount(totalItems)
    }

    loadCartCount()

    // Escuchar cambios en el carrito
    window.addEventListener('storage', loadCartCount)
    window.addEventListener('cartUpdated', loadCartCount)

    return () => {
      window.removeEventListener('storage', loadCartCount)
      window.removeEventListener('cartUpdated', loadCartCount)
    }
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setIsUserMenuOpen(false)
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('tokenExpiration');
    
    // Actualizar estado
    setUser(null);
    setIsAuthenticated(false);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    
    // Redirigir al inicio
    navigate('/');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
    setIsUserMenuOpen(false)
  }

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo" onClick={closeMobileMenu}>
          <span className="logo-text">{import.meta.env.VITE_APP_NAME || 'Mi Tienda'}</span>
        </Link>

        {/* Navegación Desktop  */}
        <nav className="header-nav desktop-nav">
          <Link to="/" className="nav-link">Inicio</Link>
          <Link to="/servicios" className="nav-link">Servicios</Link>
          
         {/*  <Link to="/productos" className="nav-link">Productos</Link>*/}
          
           <Link to="/nosotros" className="nav-link">Nosotros</Link> 
          <Link to="/contacto" className="nav-link">Contacto</Link>
        </nav>

        {/* Acciones */}
        <div className="header-actions">
          {/* Buscador */}
          <button 
            className="header-icon-btn"
            onClick={() => navigate('/productos')}
            title="Buscar productos"
          >
            <FiSearch />
          </button>

          {/* Carrito */}
          <Link to="/carrito" className="header-icon-btn cart-btn">
            <FiShoppingCart />
            {cartItemsCount > 0 && (
              <span className="cart-badge">{cartItemsCount}</span>
            )}
          </Link>

          {/* Usuario */}
          {isAuthenticated ? (
            <div className="user-menu">
              <button 
                className="header-icon-btn user-btn"
                onClick={toggleUserMenu}
              >
                <FiUser />
                <span className="user-name">{user?.nombre_completo?.split(' ')[0] || 'Usuario'}</span>
                </button>

                {isUserMenuOpen && (
  <>
    <div className="user-menu-backdrop" onClick={() => setIsUserMenuOpen(false)} />
    <div className="user-menu-dropdown">
      <div className="user-menu-header">
        <div className="user-avatar">
          {user?.nombre_completo ? user.nombre_completo.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U'}
        </div>
        <div className="user-info">
          <p className="user-fullname">{user?.nombre_completo || 'Usuario'}</p>
          <p className="user-email">{user?.email}</p>
        </div>
      </div>

      <div className="user-menu-divider" />

      {/* Enlace a Mi Perfil */}
      <button 
        className="user-menu-item"
        onClick={() => {
          navigate('/mi-perfil')
          setIsUserMenuOpen(false)
        }}
      >
        <FiUser />
        <span>Mi Perfil</span>
      </button>

      {/* Enlace a Panel Admin (solo si es admin) */}
      {user?.rol === 'admin' && (
        <button 
          className="user-menu-item"
          onClick={() => {
            navigate('/admin/')
            setIsUserMenuOpen(false)
          }}
        >
          <FiSettings />
          <span>Panel Admin</span>
        </button>
      )}

      <div className="user-menu-divider" />

      {/* Cerrar Sesión */}
      <button 
        className="user-menu-item danger"
        onClick={handleLogout}
      >
        <FiLogOut />
        <span>Cerrar Sesión</span>
      </button>
    </div>
  </>
)}





            </div>
          ) : (
            <Link to="/login" className="btn-spa-login">
  Iniciar Sesión
</Link>
          )}

          {/* Menú hamburguesa móvil */}
          <button 
            className="header-icon-btn mobile-menu-btn"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Menú Móvil */}
      {isMobileMenuOpen && (
        <>
          <div className="mobile-menu-backdrop" onClick={closeMobileMenu} />
          <nav className="mobile-nav">
            <Link to="/" className="mobile-nav-link" onClick={closeMobileMenu}>
              Inicio
            </Link>
            <Link to="/productos" className="mobile-nav-link" onClick={closeMobileMenu}>
              Productos
            </Link>
            <Link to="/nosotros" className="mobile-nav-link" onClick={closeMobileMenu}>
              Nosotros
            </Link>
            <Link to="/seguimiento" className="nav-link">
  <FiSearch />
  Seguir mi Reserva
</Link>
            <Link to="/contacto" className="mobile-nav-link" onClick={closeMobileMenu}>
              Contacto
            </Link>

            {isAuthenticated && (
              <>
                <div className="mobile-nav-divider" />
                <Link to="/perfil" className="mobile-nav-link" onClick={closeMobileMenu}>
                  <FiUser /> Mi Perfil
                </Link>
                <Link to="/perfil?tab=pedidos" className="mobile-nav-link" onClick={closeMobileMenu}>
                  <FiPackage /> Mis Pedidos
                </Link>
                {isAdmin() && (
                  <Link to="/admin" className="mobile-nav-link" onClick={closeMobileMenu}>
                    <FiSettings /> Panel Admin
                  </Link>
                )}
                <div className="mobile-nav-divider" />
                <button className="mobile-nav-link logout-link" onClick={handleLogout}>
                  <FiLogOut /> Cerrar Sesión
                </button>
              </>
            )}

            {!isAuthenticated && (
              <>
                <div className="mobile-nav-divider" />
                <Link to="/login" className="mobile-nav-link" onClick={closeMobileMenu}>
                  Iniciar Sesión
                </Link>
                <Link to="/registro" className="mobile-nav-link" onClick={closeMobileMenu}>
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </>
      )}
    </header>
  )
}

export default Header