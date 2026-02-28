import React from 'react'
import { Link } from 'react-router-dom'
import { 
  FiFacebook, 
  FiInstagram, 
  FiTwitter, 
  FiMail, 
  FiPhone, 
  FiMapPin,
  FiClock
} from 'react-icons/fi'
import './Footer.css'
import reclamacionesImg from '../../assets/reclamaciones.jpg'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Sección 1: Sobre nosotros */}
        <div className="footer-section">
          <h3 className="footer-title">
            {import.meta.env.VITE_APP_NAME || 'Mi Tienda'}
          </h3>
          <p className="footer-description">
            Tu tienda online de confianza. Ofrecemos productos de calidad 
            con los mejores precios y atención personalizada.
          </p>
          <div className="footer-social">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Facebook"
            >
              <FiFacebook />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Instagram"
            >
              <FiInstagram />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Twitter"
            >
              <FiTwitter />
            </a>

            
          </div>

          <Link to="/seguimiento" className="footer-btn footer-btn-primary">
      📋 Seguimiento de Reservas
    </Link>

        </div>

        {/* Sección 2: Enlaces rápidos */}
        <div className="footer-section">
          <h4 className="footer-subtitle">Enlaces Rápidos</h4>
          <ul className="footer-links">
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              <Link to="/productos">Productos</Link>
            </li>
            <li>
              <Link to="/nosotros">Nosotros</Link>
            </li>
            <li>
              <Link to="/contacto">Contacto</Link>
            </li>
          </ul>
        </div>

        {/* Sección 3: Información */}
     {/* Sección 3: Información */}
<div className="footer-section">
  <h4 className="footer-subtitle">Información</h4>
  <ul className="footer-links">
    <li>
      <Link to="/terminos">Términos y Condiciones</Link>
    </li>
    <li>
      <Link to="/privacidad">Política de Privacidad</Link>
    </li>
    <li>
      <Link to="/envios">Envíos y Devoluciones</Link>
    </li>
    <li>
      <Link to="/preguntas-frecuentes">Preguntas Frecuentes</Link>
    </li>
  </ul>

  {/* Botones destacados */}
  <div className="footer-cta-buttons">
   {/* <Link to="/seguimiento" className="footer-btn footer-btn-primary">
      📋 Seguimiento de Reservas
    </Link>*/}
   {/* <Link to="/libro-reclamaciones" className="footer-btn footer-btn-danger">
  📕 Libro de Reclamaciones
</Link>*/}

<Link to="/libro-reclamaciones" className="footer-btn footer-btn-reclamaciones">
            <img 
              src={reclamacionesImg} 
              alt="Libro de Reclamaciones" 
              className="reclamaciones-img"
            />
          </Link>


<Link to="/seguimiento-reclamaciones" className="footer-btn footer-btn-primary">
    📋 Seguimiento de Reclamaciones
  </Link>
  </div>
</div>

        {/* Sección 4: Contacto */}
        <div className="footer-section">
          <h4 className="footer-subtitle">Contacto</h4>
          <ul className="footer-contact">
            <li>
              <FiMapPin />
              <span>Calle Morona #605 / esquina con Moore</span>
            </li>
            <li>
              <FiPhone />
              <a href="tel:+51999999999">+51 913 516 004</a>
            </li>
            <li>
              <FiMail />
              <a href="mailto:contacto@encantos.pe">contacto@encantos.pe</a>
            </li>
            <li>
              <FiClock />
              <span>Lun - Sab: 9:00 AM - 8:00 PM</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Línea divisoria */}
      <div className="footer-divider"></div>

      {/* Copyright */}
      <div className="footer-bottom">
        <div className="footer-container">
          <p className="footer-copyright">
            © {currentYear} {import.meta.env.VITE_APP_NAME || 'Mi Tienda'}. 
            Todos los derechos reservados.
          </p>
          <div className="footer-payments">
            <span className="payment-text">Métodos de pago:</span>
            <div className="payment-icons">
              <span className="payment-icon">💳</span>
              <span className="payment-icon">🏦</span>
              <span className="payment-icon">💰</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer