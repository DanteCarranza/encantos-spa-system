import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
 FiSmile, 
  FiShoppingBag, 
  FiArrowRight,
  FiTrendingUp,
  FiUsers,
  FiPackage,
  FiLogOut,
  FiBookOpen,      
  FiFileText,     
  FiDollarSign
} from 'react-icons/fi'
import './ModuleSelectorPage.css'

const ModuleSelectorPage = () => {
  const navigate = useNavigate()
  const [hoveredModule, setHoveredModule] = useState(null)

  const modules = [
    {
      id: 'spa',
      title: 'Encantos SPA',
      description: 'Gestión completa de servicios, citas, clientes y productos del spa',
      icon: FiSmile,
      color: 'purple',
      gradient: 'linear-gradient(135deg, #d946ef 0%, #a855f7 100%)',
      features: [
        { icon: FiUsers, text: 'Gestión de Clientes' },
        { icon: FiPackage, text: 'Servicios & Productos' },
        { icon: FiTrendingUp, text: 'Reportes & Analytics' }
      ],
      path: '/admin/spa/dashboard',
      available: true
    },
    {
        id: 'snacks',
        title: 'Snacks & Comida',
        description: 'Sistema de gestión para venta de snacks, bebidas y comida rápida',
        icon: FiShoppingBag,
        color: 'orange',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        features: [
          { icon: FiShoppingBag, text: 'Catálogo de Productos' },
          { icon: FiUsers, text: 'Gestión de Pedidos' },
          { icon: FiTrendingUp, text: 'Inventario & Ventas' }
        ],
        path: '/admin/snacks/dashboard',
        available: true 
      },
      {
        id: 'aulavirtual',
        title: 'Aula Virtual',
        description: 'Gestión de pagos, facturación electrónica y reportes del aula virtual',
        icon: FiBookOpen,
        color: 'blue',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        features: [
          { icon: FiDollarSign, text: 'Gestión de Pagos' },
          { icon: FiFileText, text: 'Facturación Electrónica' },
          { icon: FiTrendingUp, text: 'Reportes & Estadísticas' }
        ],
        path: '/aulavirtual/dashboard',
        available: true
      }
  ]

  const handleModuleClick = (module) => {
    if (module.available) {
      navigate(module.path)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('tokenExpiration')
    navigate('/login')
  }

  return (
    <div className="module-selector-page">
      {/* Animated Background */}
      <div className="module-selector-bg">
        <div className="animated-gradient"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      {/* Header */}
      <header className="module-selector-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <span className="logo-text">E</span>
            </div>
            <div className="logo-info">
              <h1 className="company-name">Encantos</h1>
              <p className="company-tagline">Panel de Administración</p>
            </div>
          </div>
          
          <button className="btn-logout" onClick={handleLogout}>
            <FiLogOut />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="module-selector-content">
        <div className="selector-container">
          <div className="selector-intro">
            <h2 className="selector-title">
              Selecciona un Módulo
              <span className="title-accent">para Comenzar</span>
            </h2>
            <p className="selector-subtitle">
              Elige el sistema que deseas administrar
            </p>
          </div>

          <div className="modules-grid">
            {modules.map((module) => {
              const IconComponent = module.icon
              
              return (
                <div
                  key={module.id}
                  className={`module-card ${module.available ? 'available' : 'unavailable'} ${hoveredModule === module.id ? 'hovered' : ''}`}
                  onClick={() => handleModuleClick(module)}
                  onMouseEnter={() => setHoveredModule(module.id)}
                  onMouseLeave={() => setHoveredModule(null)}
                  style={{ '--module-gradient': module.gradient }}
                >
                  {!module.available && (
                    <div className="unavailable-badge">
                      Próximamente
                    </div>
                  )}

                  <div className="module-card-inner">
                    <div className="module-icon-wrapper">
                      <div className="module-icon" style={{ background: module.gradient }}>
                        <IconComponent />
                      </div>
                      <div className="module-icon-glow" style={{ background: module.gradient }}></div>
                    </div>

                    <div className="module-content">
                      <h3 className="module-title">{module.title}</h3>
                      <p className="module-description">{module.description}</p>

                      <div className="module-features">
                        {module.features.map((feature, index) => {
                          const FeatureIcon = feature.icon
                          return (
                            <div key={index} className="feature-item">
                              <FeatureIcon />
                              <span>{feature.text}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {module.available && (
                      <div className="module-action">
                        <button className="btn-module-enter">
                          <span>Acceder</span>
                          <FiArrowRight />
                        </button>
                      </div>
                    )}

                    {!module.available && (
                      <div className="module-action">
                        <div className="coming-soon-text">
                          <span>🚧 En Desarrollo</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="module-card-glow"></div>
                </div>
              )
            })}
          </div>

          <div className="selector-footer">
            <p className="footer-text">
              ¿Necesitas ayuda? Contacta al soporte técnico
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ModuleSelectorPage