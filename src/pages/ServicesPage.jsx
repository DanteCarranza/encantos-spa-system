import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FiClock,
  FiDollarSign,
  FiCalendar,
  FiStar,
  FiCheckCircle,
  FiArrowRight,
  FiAward,
  FiHeart,
  FiUsers,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi'
import './ServicesPage.css'
import './ServicesCategories.css'
import servicesService from '../services/servicesService'

const ServicesPage = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const servicesPerPage = 9

  const [categories, setCategories] = useState([
    { id: 'all', nombre: 'Todos los Servicios', slug: 'all', icono: '✨' }
  ])

  useEffect(() => {
    loadCategories()
    loadServices()
  }, [categoryFilter])
  
  useEffect(() => {
    loadCategories()
  }, [])

  // Reset a página 1 cuando cambia la categoría
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter]);



  const loadCategories = async () => {
    try {
      const result = await servicesService.getCategories({ activo: 1 })
      
      if (result.success && result.data) {
        const mappedCategories = result.data.map(cat => ({
          id: cat.id,
          nombre: cat.nombre,
          slug: cat.slug,
          icono: cat.icono
        }))
        
        // Agregar "Todos los Servicios" al inicio
        setCategories([
          { id: 'all', nombre: 'Todos los Servicios', slug: 'all', icono: '✨' },
          ...mappedCategories
        ])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }


  const loadServices = async () => {
    setLoading(true);
    
    try {
      const result = await servicesService.getServices({
        categoria: categoryFilter
      });
      
      if (result.success) {
        const mappedServices = result.data.map(service => ({
          id: service.id,
          nombre: service.nombre,
          descripcion: service.descripcion_larga || service.descripcion,
          categoria: service.categoria_slug,
          duracion: service.duracion,
          precio: service.precio,
          imagen_url: service.imagen_url || `https://via.placeholder.com/600x400/d946ef/ffffff?text=${encodeURIComponent(service.nombre)}`,
          beneficios: service.beneficios || [],
          popular: service.popular,
          destacado: service.destacado
        }));
        
        setServices(mappedServices);
      } else {
        console.error('Error al cargar servicios:', result.message);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar servicios
  const filteredServices = services.filter(service => {
    return categoryFilter === 'all' || service.categoria === categoryFilter
  })

  // Calcular paginación
  const indexOfLastService = currentPage * servicesPerPage
  const indexOfFirstService = indexOfLastService - servicesPerPage
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService)
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage)

  // Cambiar de página
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
    // Scroll suave hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatPrice = (price) => {
    return `S/ ${price.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="services-loading">
        <div className="spinner-large"></div>
        <p>Cargando servicios...</p>
      </div>
    )
  }

  return (
    <div className="services-page">
      {/* Hero Section */}
      <section className="services-hero">
        <div className="services-hero-overlay"></div>
        <div className="floating-bubble bubble-1"></div>
        <div className="floating-bubble bubble-2"></div>
        <div className="floating-bubble bubble-3"></div>

        <div className="services-hero-content">
          <div className="hero-badge">
            <FiHeart />
            <span>Nuestros Servicios</span>
          </div>
          <h1 className="services-hero-title">Servicios de Belleza y Bienestar</h1>
          <p className="services-hero-subtitle">
            Tratamientos profesionales diseñados para tu relajación y cuidado personal
          </p>
          <Link to="/reservar-cita" className="hero-cta-button">
            <FiCalendar />
            Reservar Ahora
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="spa-categories-wrapper">
  <div className="spa-categories-container">
    <div className="spa-categories-scroll">
      {categories.map(cat => (
        <button
          key={cat.id}
          className={`spa-category-chip ${categoryFilter === cat.slug ? 'active' : ''}`}
          onClick={() => setCategoryFilter(cat.slug)}
        >
          <span className="spa-category-chip-icon">{cat.icono}</span>
          <span className="spa-category-chip-label">{cat.nombre}</span>
        </button>
      ))}
    </div>
  </div>
</section>

      {/* Services Grid */}
      <section className="services-grid-section">
        <div className="services-container">
          {/* Contador de resultados */}
          <div className="services-count">
            Mostrando {indexOfFirstService + 1}-{Math.min(indexOfLastService, filteredServices.length)} de {filteredServices.length} servicios
          </div>

          <div className="services-grid">
            {currentServices.map(service => (
              <div key={service.id} className="service-card">
                {service.popular && (
                  <div className="service-badge popular">
                    <FiStar />
                    Popular
                  </div>
                )}
                {service.destacado && (
                  <div className="service-badge featured">
                    <FiAward />
                    Destacado
                  </div>
                )}

                <div className="service-image">
                  <img src={service.imagen_url} alt={service.nombre} />
                  <div className="service-overlay">
                    <Link to="/reservar-cita" className="btn-reserve">
                      <FiCalendar />
                      Reservar Ahora
                    </Link>
                  </div>
                </div>

                <div className="service-body">
                  <h3 className="service-name">{service.nombre}</h3>
                  <p className="service-description">{service.descripcion}</p>

                  <div className="service-info">
                    <div className="info-item">
                      <FiClock />
                      <span>{service.duracion} minutos</span>
                    </div>
                    <div className="info-item price">
                      <FiDollarSign />
                      <span>{formatPrice(service.precio)}</span>
                    </div>
                  </div>

                  <div className="service-benefits">
                    <h4>Beneficios:</h4>
                    <ul>
                      {service.beneficios.slice(0, 3).map((beneficio, index) => (
                        <li key={index}>
                          <FiCheckCircle />
                          {beneficio}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link to="/reservar-cita" className="btn-book-service">
                    Reservar Cita
                    <FiArrowRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <button
                className="pagination-btn pagination-prev"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <FiChevronLeft />
                Anterior
              </button>

              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                    onClick={() => paginate(number)}
                  >
                    {number}
                  </button>
                ))}
              </div>

              <button
                className="pagination-btn pagination-next"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-section">
        <div className="services-container">
          <div className="section-header-center">
            <h2>¿Por Qué Elegirnos?</h2>
            <p>Compromiso con tu bienestar y belleza</p>
          </div>

          <div className="why-choose-grid">
            <div className="why-card">
              <div className="why-icon">
                <FiAward />
              </div>
              <h3>Profesionales Certificados</h3>
              <p>Terapeutas con años de experiencia y capacitación continua</p>
            </div>

            <div className="why-card">
              <div className="why-icon">
                <FiHeart />
              </div>
              <h3>Productos Premium</h3>
              <p>Utilizamos solo las mejores marcas y productos naturales</p>
            </div>

            <div className="why-card">
              <div className="why-icon">
                <FiUsers />
              </div>
              <h3>Atención Personalizada</h3>
              <p>Cada tratamiento se adapta a tus necesidades específicas</p>
            </div>

            <div className="why-card">
              <div className="why-icon">
                <FiStar />
              </div>
              <h3>Ambiente Exclusivo</h3>
              <p>Instalaciones modernas diseñadas para tu máxima relajación</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>¿Lista para una Experiencia Única?</h2>
          <p>Reserva tu cita hoy y déjanos cuidar de ti</p>
          <Link to="/reservar-cita" className="cta-button">
            <FiCalendar />
            Reservar Mi Cita
          </Link>
        </div>
      </section>
    </div>
  )
}

export default ServicesPage