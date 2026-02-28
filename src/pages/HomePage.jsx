import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiCalendar,
  FiClock,
  FiCheck,
  FiStar,
  FiHeart,
  FiShield,
  FiAward,
  FiUsers,
  FiTrendingUp,
  FiMapPin,
  FiPhone,
  FiMail
} from 'react-icons/fi'
import spaService from '../services/spaService'
import { formatPrice } from '../utils/helpers'
import './HomePage.css'
import servicesService from '../services/servicesService'
import spaBienestarImg from '../assets/encantossalon.jpg'
import TrackingSection from '../components/home/TrackingSection'

const HomePage = () => {
  const [featuredServices, setFeaturedServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedServices()
  }, [])

  const loadFeaturedServices = async () => {
    setLoading(true)
    try {
      const result = await servicesService.getServices()
      
      if (result.success && result.data.length > 0) {
        // Obtener 3 servicios aleatorios
        const shuffled = [...result.data].sort(() => 0.5 - Math.random())
        const randomServices = shuffled.slice(0, 3).map(service => ({
          id: service.id,
          nombre: service.nombre,
          descripcion: service.descripcion || service.descripcion_larga || '',
          duracion: service.duracion,
          precio: service.precio,
          imagen_url: service.imagen_url || null,
          categoria: service.categoria_slug
        }))
        
        setFeaturedServices(randomServices)
      }
    } catch (error) {
      console.error('Error loading featured services:', error)
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    {
      icon: FiHeart,
      title: 'Bienestar Total',
      description: 'Cuidamos de tu cuerpo, mente y espíritu en cada sesión'
    },
    {
      icon: FiAward,
      title: 'Terapeutas Certificados',
      description: 'Profesionales especializados con años de experiencia'
    },
    {
      icon: FiShield,
      title: 'Productos Premium',
      description: 'Solo utilizamos marcas reconocidas y productos naturales'
    },
    {
      icon: FiUsers,
      title: 'Atención Personalizada',
      description: 'Cada tratamiento adaptado a tus necesidades'
    }
  ]

  const testimonials = [
    {
      name: 'María González',
      service: 'Masaje Relajante',
      rating: 5,
      comment: 'Una experiencia increíble. El ambiente es muy relajante y el personal súper profesional. ¡Volveré pronto!',
      initials: 'MG'
    },
    {
      name: 'Ana Rodríguez',
      service: 'Facial Rejuvenecedor',
      rating: 5,
      comment: 'Mi piel nunca había lucido tan radiante. Los productos que usan son de excelente calidad.',
      initials: 'AR'
    },
    {
      name: 'Lucía Martínez',
      service: 'Manicure & Pedicure',
      rating: 5,
      comment: 'Atención impecable y resultados hermosos. Es mi spa favorito en Lima.',
      initials: 'LM'
    }
  ]

  // Imágenes de servicios reales (usando gradientes elegantes como placeholder)
  const serviceImages = [
    {
      gradient: 'linear-gradient(135deg, #ffc2e2 0%, #ffa6d5 100%)',
      overlay: 'rgba(217, 70, 239, 0.2)'
    },
    {
      gradient: 'linear-gradient(135deg, #d4a5ff 0%, #c084fc 100%)',
      overlay: 'rgba(168, 85, 247, 0.2)'
    },
    {
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      overlay: 'rgba(251, 191, 36, 0.2)'
    }
  ]


// Componente auxiliar para iconos según índice
const ServiceIcon = ({ index }) => {
    const icons = [FiHeart, FiStar, FiShield]
    const Icon = icons[index] || FiHeart
    return <Icon />
  }


  return (
    <div className="home-page spa-home">
      {/* Hero Section */}
      <section className="hero-section spa-hero">
        <div className="hero-decoration-top"></div>
        <div className="hero-decoration-bottom"></div>
        
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge-wrapper">
              <span className="hero-badge">
                <FiStar /> Tu Oasis de Tranquilidad
              </span>
            </div>
            <h1 className="hero-title">
              Renueva tu Belleza
              <span className="hero-title-accent"> Natural</span>
            </h1>
            <p className="hero-subtitle">
              Descubre una experiencia única de relajación y bienestar. 
              Tratamientos personalizados que realzan tu belleza interior y exterior.
            </p>
            <div className="hero-actions">
            <Link to="/reservar-cita" className="btn-spa-glow">
            <FiCalendar />
                Reservar mi Experiencia
              </Link>
              <Link to="/servicios" className="btn btn-outline-white btn-lg">
                Ver Servicios
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="trust-badge">
                <div className="trust-badge-icon">
                  <FiTrendingUp />
                </div>
                <div className="trust-badge-info">
                  <strong>98%</strong>
                  <span>Satisfacción</span>
                </div>
              </div>
              <div className="trust-badge">
                <div className="trust-badge-icon">
                  <FiUsers />
                </div>
                <div className="trust-badge-info">
                  <strong>5,000+</strong>
                  <span>Clientas Felices</span>
                </div>
              </div>
              <div className="trust-badge">
                <div className="trust-badge-icon">
                  <FiAward />
                </div>
                <div className="trust-badge-info">
                  <strong>10+</strong>
                  <span>Años de Experiencia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="benefits-grid">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="benefit-card">
                  <div className="benefit-icon-wrapper">
                    <div className="benefit-icon">
                      <Icon />
                    </div>
                  </div>
                  <h3 className="benefit-title">{benefit.title}</h3>
                  <p className="benefit-description">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Services */}
     {/* Featured Services */}
<section className="featured-services-section">
  <div className="container">
    <div className="section-header centered">
      <span className="spa-section-badge">Nuestros Servicios</span>
      <h2 className="spa-section-title">Tratamientos Destacados</h2>
      <p className="spa-section-subtitle">
        Experiencias diseñadas para tu bienestar y belleza
      </p>
    </div>

    <div className="services-showcase">
      {loading ? (
        Array(3).fill(0).map((_, i) => (
          <div key={i} className="service-showcase-card skeleton">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
            </div>
          </div>
        ))
      ) : (
        featuredServices.map((service, index) => (
          <div 
            key={service.id} 
            className="service-showcase-card" 
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div 
              className="service-showcase-image"
              style={{
                background: service.imagen_url 
                  ? `url(${service.imagen_url}) center/cover` 
                  : serviceImages[index]?.gradient
              }}
            >
              {!service.imagen_url && (
                <>
                  <div 
                    className="service-image-overlay" 
                    style={{ background: serviceImages[index]?.overlay }}
                  ></div>
                  <div className="service-image-content">
                    <div className="service-icon-large">
                      <ServiceIcon index={index} />
                    </div>
                  </div>
                </>
              )}
              <div className="service-overlay">
                <Link to="/reservar-cita" className="btn-white btn-sm">
                  <FiCalendar />
                  Reservar Ahora
                </Link>
              </div>
            </div>
            
            <div className="service-showcase-content">
              <h3 className="service-showcase-name">{service.nombre}</h3>
              <p className="service-showcase-description">
                {service.descripcion.substring(0, 100)}
                {service.descripcion.length > 100 ? '...' : ''}
              </p>
              <div className="service-showcase-footer">
                <div className="service-showcase-duration">
                  <FiClock /> {service.duracion} min
                </div>
                <div className="service-showcase-price">
                  {formatPrice(service.precio)}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>

    <div className="section-cta">
      <Link to="/servicios" className="btn-spa-primary btn-lg">
        Ver Todos los Servicios
      </Link>
    </div>
  </div>
</section>

      {/* Booking CTA Section */}
      <section className="booking-cta-section">
        <div className="container">
          <div className="booking-cta-content">
            <div className="booking-cta-info">
              <span className="cta-badge">
                <FiCalendar /> Agenda Fácil y Rápido
              </span>
              <h2 className="cta-title">
                Tu Momento de Paz
                <br />
                <span className="cta-title-highlight">Está a un Click</span>
              </h2>
              <p className="cta-description">
                Reserva tu tratamiento en línea y selecciona el horario que mejor 
                se adapte a ti. Nuestro sistema de reservas es simple y seguro.
              </p>
              
              <ul className="cta-features">
                <li>
                  <div className="feature-check">
                    <FiCheck />
                  </div>
                  <span>Elige tu servicio favorito</span>
                </li>
                <li>
                  <div className="feature-check">
                    <FiCheck />
                  </div>
                  <span>Selecciona fecha y hora disponible</span>
                </li>
                <li>
                  <div className="feature-check">
                    <FiCheck />
                  </div>
                  <span>Confirma tu reserva al instante</span>
                </li>
                <li>
                  <div className="feature-check">
                    <FiCheck />
                  </div>
                  <span>Recibe confirmación por email</span>
                </li>
              </ul>

              <Link to="/reservar-cita" className="btn-spa-primary btn-lg">
              <FiCalendar />
                Reservar Ahora
              </Link>
            </div>

            <div className="booking-cta-visual">
              <div className="visual-card">
                <div className="visual-header">
                  <div className="visual-icon">
                    <FiClock />
                  </div>
                  <h3>Horarios Flexibles</h3>
                </div>
                <div className="schedule-list">
                  <div className="schedule-item">
                    <span>Lunes - Sabado</span>
                    <strong>9:00 AM - 8:00 PM</strong>
                  </div>
                 
                  <div className="schedule-item">
                    <span>Domingos</span>
                    <strong>Cerrado</strong>
                  </div>
                </div>
              </div>

              <div className="visual-stats">
                <div className="stat-mini">
                  <div className="stat-mini-icon">
                    <FiStar />
                  </div>
                  <div className="stat-mini-info">
                    <strong>4.9/5</strong>
                    <span>Valoración</span>
                  </div>
                </div>
                <div className="stat-mini">
                  <div className="stat-mini-icon">
                    <FiShield />
                  </div>
                  <div className="stat-mini-info">
                    <strong>100%</strong>
                    <span>Garantía</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section spa-testimonials">
  <div className="container">
  <div className="section-header centered">
  <span className="spa-section-badge">Testimonios</span>
  <h2 className="spa-section-title">Lo Que Dicen Nuestras Clientas</h2>
  <p className="spa-section-subtitle">
    Historias reales de transformación y bienestar
  </p>
</div>

    <div className="testimonials-grid">
      {testimonials.map((testimonial, index) => (
        <div key={index} className="testimonial-card-spa" style={{ animationDelay: `${index * 0.1}s` }}>
          <div className="testimonial-header">
            <div className="testimonial-avatar-large">
              {testimonial.initials}
            </div>
          </div>
          
          <div className="testimonial-rating">
            {Array(testimonial.rating).fill(0).map((_, i) => (
              <FiStar key={i} className="star-filled" />
            ))}
          </div>
          
          <p className="testimonial-comment">"{testimonial.comment}"</p>
          
          <div className="testimonial-author-info">
            <div className="testimonial-name">{testimonial.name}</div>
            <div className="testimonial-service">{testimonial.service}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* Why Choose Us */}
      <section className="why-choose-section">
        <div className="container">
          <div className="why-choose-content">
          <div className="why-choose-image">
  <div className="image-frame">
    <img 
      src={spaBienestarImg} 
      alt="Spa Bienestar" 
      className="why-choose-img"
    />
  </div>
  <div className="image-badge">
    <FiAward />
    <span>Calidad Certificada</span>
  </div>
</div>

            <div className="why-choose-info">
            <span className="spa-section-badge">Por Qué Elegirnos</span>
            <h2 className="spa-section-title">Tu Bienestar es Nuestra Prioridad</h2>
              <p className="section-description">
                En nuestro spa combinamos técnicas tradicionales con las últimas 
                innovaciones en tratamientos de belleza y bienestar. Cada visita 
                es una experiencia personalizada diseñada especialmente para ti.
              </p>

              <div className="why-features">
                <div className="why-feature">
                  <div className="why-feature-icon">
                    <FiShield />
                  </div>
                  <div className="why-feature-content">
                    <h4>Productos Premium</h4>
                    <p>Utilizamos solo marcas reconocidas y productos naturales de la más alta calidad.</p>
                  </div>
                </div>

                <div className="why-feature">
                  <div className="why-feature-icon">
                    <FiAward />
                  </div>
                  <div className="why-feature-content">
                    <h4>Ambiente Exclusivo</h4>
                    <p>Instalaciones modernas diseñadas para brindarte máxima comodidad y privacidad.</p>
                  </div>
                </div>

                <div className="why-feature">
                  <div className="why-feature-icon">
                    <FiHeart />
                  </div>
                  <div className="why-feature-content">
                    <h4>Atención Personalizada</h4>
                    <p>Cada tratamiento es adaptado a tus necesidades específicas y preferencias.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section">
        <div className="container">
          <div className="final-cta-content">
            <div className="final-cta-icon">
              <FiStar />
            </div>
            <h2 className="final-cta-title">Comienza tu Transformación Hoy</h2>
            <p className="final-cta-subtitle">
              Regálate un momento de paz y belleza. Tu primera sesión incluye una 
              consulta personalizada completamente gratis.
            </p>
            <div className="final-cta-actions">
  <Link to="/reservar-cita" className="btn-spa-white">
    <FiCalendar />
    Agendar mi Primera Cita
  </Link>
  <Link to="/contacto" className="btn btn-outline-primary btn-lg">
    <FiPhone />
    Contactar por WhatsApp
  </Link>
</div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Componente auxiliar para iconos en servicios
const Icon = ({ icon: IconComponent }) => {
  return <IconComponent />
}

export default HomePage