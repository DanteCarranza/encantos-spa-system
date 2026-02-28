import React from 'react'
import {
  FiHeart,
  FiAward,
  FiUsers,
  FiTrendingUp,
  FiStar,
  FiMapPin,
  FiClock,
  FiPhone,
  FiMail,
  FiCheckCircle
} from 'react-icons/fi'
import './AboutPage.css'
import americo from '../assets/americo.jpeg'
import jazmin from '../assets/jazmin.jpeg'
import jeremy from '../assets/jeremy.jpeg'
import maryenith from '../assets/maryenith.jpeg'


const AboutPage = () => {
  const stats = [
    {
      icon: FiUsers,
      value: '1,500+',
      label: 'Clientes Felices',
      color: '#d946ef'
    },
    {
      icon: FiAward,
      value: '10+',
      label: 'Años de Experiencia',
      color: '#06b6d4'
    },
    {
      icon: FiStar,
      value: '4.9',
      label: 'Calificación Promedio',
      color: '#fbbf24'
    },
    {
      icon: FiTrendingUp,
      value: '95%',
      label: 'Clientes Recurrentes',
      color: '#10b981'
    }
  ]

  const values = [
    {
      icon: FiHeart,
      title: 'Pasión por el Bienestar',
      description: 'Nos dedicamos con amor y compromiso a cuidar de tu salud y belleza, creando experiencias memorables.'
    },
    {
      icon: FiAward,
      title: 'Excelencia Profesional',
      description: 'Contamos con terapeutas certificados y productos de la más alta calidad para garantizar resultados excepcionales.'
    },
    {
      icon: FiUsers,
      title: 'Atención Personalizada',
      description: 'Cada cliente es único. Adaptamos nuestros tratamientos a tus necesidades específicas y preferencias.'
    },
    {
      icon: FiCheckCircle,
      title: 'Compromiso con la Calidad',
      description: 'Mantenemos los más altos estándares en todos nuestros servicios, instalaciones y productos.'
    }
  ]

  const team = [
    {
      name: 'Américo Figari',
      role: 'Estilista',
      image: americo, // ← CAMBIO AQUÍ
    specialty: 'Profesional en servicios de belleza y bienestar',
    experience: 'Experiencia en atención personalizada'
    },
    {
      name: 'Jazmín García',
      role: 'Lashista',
      image: jazmin, // ← CAMBIO AQUÍ
    specialty: 'Profesional en servicios de belleza y bienestar',
    experience: 'Experiencia en atención personalizada'
    },
    {
      name: 'Jeremy Piña',
      role: 'Asistente/Maquillador',
      image: jeremy, // ← CAMBIO AQUÍ
    specialty: 'Profesional en servicios de belleza y bienestar',
    experience: 'Experiencia en atención personalizada'
    },
    {
      name: 'Maryenith Arévalo',
      role: 'Manicurista',
      image: maryenith, // ← CAMBIO AQUÍ
    specialty: 'Profesional en servicios de belleza y bienestar',
    experience: 'Experiencia en atención personalizada'
    }
  ]

  const timeline = [
    {
      year: '2015',
      title: 'Nuestros Inicios',
      description: 'Abrimos nuestras puertas con la visión de crear un oasis de tranquilidad y bienestar en el corazón de la ciudad.'
    },
    {
      year: '2017',
      title: 'Expansión de Servicios',
      description: 'Incorporamos tratamientos innovadores y productos premium, ampliando nuestra oferta para satisfacer todas las necesidades.'
    },
    {
      year: '2019',
      title: 'Reconocimiento',
      description: 'Fuimos galardonados como el Mejor SPA de la región, reconociendo nuestra excelencia en servicio y calidad.'
    },
    {
      year: '2021',
      title: 'Renovación Total',
      description: 'Renovamos completamente nuestras instalaciones con diseño moderno y tecnología de última generación.'
    },
    {
      year: '2025',
      title: 'Presente y Futuro',
      description: 'Continuamos innovando y mejorando para ofrecer las mejores experiencias de bienestar y belleza.'
    }
  ]

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-overlay"></div>
        <div className="floating-bubble bubble-1"></div>
        <div className="floating-bubble bubble-2"></div>
        <div className="floating-bubble bubble-3"></div>

        <div className="about-hero-content">
          <div className="hero-badge">
            <FiHeart />
            <span>Sobre Nosotros</span>
          </div>
          <h1 className="about-hero-title">Nuestra Historia de Pasión y Cuidado</h1>
          <p className="about-hero-subtitle">
            Más de una década dedicados a tu bienestar, creando experiencias únicas que transforman vidas
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="about-container">
          <div className="stats-grid">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="stat-card" style={{ '--accent-color': stat.color }}>
                  <div className="stat-icon">
                    <Icon />
                  </div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="about-container">
          <div className="story-grid">
            <div className="story-image">
              <img 
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=1000&fit=crop" 
                alt="Spa Interior" 
              />
              <div className="image-decoration"></div>
            </div>
            <div className="story-content">
              <h2 className="section-title">Nuestra Esencia</h2>
              <div className="section-subtitle">Donde el lujo se encuentra con el bienestar</div>
              
              <p className="story-text">
                Desde 2015, hemos sido el refugio perfecto para quienes buscan un escape del estrés diario. 
                Nuestro spa es más que un lugar de tratamientos; es un santuario donde la belleza, 
                la relajación y el cuidado personal se unen en perfecta armonía.
              </p>

              <p className="story-text">
                Nos enorgullece ofrecer una experiencia holística que no solo embellece el exterior, 
                sino que también nutre el espíritu. Cada detalle, desde nuestras instalaciones hasta 
                la selección de productos, ha sido cuidadosamente elegido para brindarte momentos 
                inolvidables de paz y renovación.
              </p>

              <p className="story-text">
                Nuestro equipo de profesionales altamente capacitados comparte la misma pasión: 
                ayudarte a sentirte radiante, relajado y revitalizado. Utilizamos técnicas 
                tradicionales y modernas, combinadas con productos premium, para garantizar 
                resultados excepcionales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="about-container">
          <h2 className="section-title centered">Nuestros Valores</h2>
          <p className="section-subtitle centered">Los pilares que guían todo lo que hacemos</p>

          <div className="values-grid">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div key={index} className="value-card">
                  <div className="value-icon">
                    <Icon />
                  </div>
                  <h3 className="value-title">{value.title}</h3>
                  <p className="value-description">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timeline-section">
        <div className="about-container">
          <h2 className="section-title centered">Nuestra Trayectoria</h2>
          <p className="section-subtitle centered">Un viaje de crecimiento y excelencia</p>

          <div className="timeline">
            {timeline.map((item, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker">
                  <div className="timeline-dot"></div>
                  <div className="timeline-year">{item.year}</div>
                </div>
                <div className="timeline-content">
                  <h3 className="timeline-title">{item.title}</h3>
                  <p className="timeline-description">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="about-container">
          <h2 className="section-title centered">Nuestro Equipo</h2>
          <p className="section-subtitle centered">Profesionales apasionados por tu bienestar</p>

          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-image">
                  <img src={member.image} alt={member.name} />
                  <div className="team-overlay">
                    <div className="team-specialty">{member.specialty}</div>
                  </div>
                </div>
                <div className="team-info">
                  <h3 className="team-name">{member.name}</h3>
                  <p className="team-role">{member.role}</p>
                  <p className="team-experience">{member.experience}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta-section">
        <div className="about-cta-content">
          <h2 className="cta-title">¿Lista para tu Mejor Experiencia de Spa?</h2>
          <p className="cta-subtitle">
            Permítenos cuidar de ti. Reserva tu cita y descubre por qué somos el spa favorito de miles de clientes.
          </p>
          <div className="cta-buttons">
            <a href="reservar-cita" className="cta-button primary">
              Reservar Ahora
            </a>
            <a href="/contacto" className="cta-button secondary">
              Contáctanos
            </a>
          </div>
        </div>
      </section>

      
    </div>
  )
}

export default AboutPage