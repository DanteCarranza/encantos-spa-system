import React, { useState } from 'react'
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiSend,
  FiUser,
  FiMessageSquare,
  FiFacebook,
  FiInstagram,
  FiTwitter
} from 'react-icons/fi'
import Swal from 'sweetalert2'
import './ContactPage.css'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  })

  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)

  const contactInfo = {
    email: 'contacto@mispa.com',
    phone: '+51 913 516 004',
    whatsapp: '+51 913 516 004',
    address: 'Calle Morona #605 / esquina con Moore',
    hours: {
      weekdays: 'Lunes a Viernes: 9:00 AM - 8:00 PM',
      saturday: 'Sábado: 9:00 AM - 8:00 PM',
      sunday: 'Domingo: Cerrado'
    },
    social: {
      facebook: 'https://facebook.com/mispa',
      instagram: 'https://instagram.com/mispa',
      twitter: 'https://twitter.com/mispa'
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio'
    } else if (!/^[0-9]{9}$/.test(formData.telefono)) {
      newErrors.telefono = 'Teléfono inválido (9 dígitos)'
    }

    if (!formData.asunto.trim()) {
      newErrors.asunto = 'El asunto es obligatorio'
    }

    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'El mensaje es obligatorio'
    } else if (formData.mensaje.length < 10) {
      newErrors.mensaje = 'El mensaje debe tener al menos 10 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setSending(true)

    // Simular envío
    setTimeout(() => {
      setSending(false)
      Swal.fire({
        icon: 'success',
        title: '¡Mensaje Enviado!',
        text: 'Gracias por contactarnos. Te responderemos pronto.',
        confirmButtonColor: '#d946ef',
        confirmButtonText: 'Aceptar'
      })

      // Reset form
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: ''
      })
    }, 1500)
  }

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-overlay"></div>
        <div className="floating-bubble bubble-1"></div>
        <div className="floating-bubble bubble-2"></div>
        <div className="floating-bubble bubble-3"></div>
        <div className="floating-bubble bubble-4"></div>
        
        <div className="contact-hero-content">
          <div className="hero-badge">
            <FiMail />
            <span>Contáctanos</span>
          </div>
          <h1 className="contact-hero-title">¿Tienes alguna pregunta?</h1>
          <p className="contact-hero-subtitle">
            Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="contact-content">
        <div className="contact-container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-section">
              <div className="form-header">
                <h2>Envíanos un Mensaje</h2>
                <p>Completa el formulario y nos pondremos en contacto contigo</p>
              </div>

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group-contact">
                    <label className="form-label-contact">Nombre Completo *</label>
                    <div className="input-wrapper-contact">
                      <FiUser className="input-icon-contact" />
                      <input
                        type="text"
                        name="nombre"
                        className={`form-input-contact ${errors.nombre ? 'error' : ''}`}
                        placeholder="Tu nombre completo"
                        value={formData.nombre}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.nombre && <span className="form-error-contact">{errors.nombre}</span>}
                  </div>

                  <div className="form-group-contact">
                    <label className="form-label-contact">Email *</label>
                    <div className="input-wrapper-contact">
                      <FiMail className="input-icon-contact" />
                      <input
                        type="email"
                        name="email"
                        className={`form-input-contact ${errors.email ? 'error' : ''}`}
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.email && <span className="form-error-contact">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group-contact">
                    <label className="form-label-contact">Teléfono *</label>
                    <div className="input-wrapper-contact">
                      <FiPhone className="input-icon-contact" />
                      <input
                        type="tel"
                        name="telefono"
                        className={`form-input-contact ${errors.telefono ? 'error' : ''}`}
                        placeholder="999999999"
                        value={formData.telefono}
                        onChange={handleChange}
                        maxLength={9}
                      />
                    </div>
                    {errors.telefono && <span className="form-error-contact">{errors.telefono}</span>}
                  </div>

                  <div className="form-group-contact">
                    <label className="form-label-contact">Asunto *</label>
                    <div className="input-wrapper-contact">
                      <FiMessageSquare className="input-icon-contact" />
                      <input
                        type="text"
                        name="asunto"
                        className={`form-input-contact ${errors.asunto ? 'error' : ''}`}
                        placeholder="¿En qué podemos ayudarte?"
                        value={formData.asunto}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.asunto && <span className="form-error-contact">{errors.asunto}</span>}
                  </div>
                </div>

                <div className="form-group-contact">
                  <label className="form-label-contact">Mensaje *</label>
                  <textarea
                    name="mensaje"
                    className={`form-input-contact form-textarea-contact ${errors.mensaje ? 'error' : ''}`}
                    placeholder="Escribe tu mensaje aquí..."
                    value={formData.mensaje}
                    onChange={handleChange}
                    rows={6}
                  />
                  {errors.mensaje && <span className="form-error-contact">{errors.mensaje}</span>}
                </div>

                <button 
                  type="submit" 
                  className="btn-submit-contact"
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <div className="spinner-contact"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <FiSend />
                      Enviar Mensaje
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="contact-info-section">
              <div className="info-card">
                <div className="info-card-icon">
                  <FiMapPin />
                </div>
                <div className="info-card-content">
                  <h3>Dirección</h3>
                  <p>{contactInfo.address}</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-icon">
                  <FiPhone />
                </div>
                <div className="info-card-content">
                  <h3>Teléfono</h3>
                  <p>{contactInfo.phone}</p>
                  <a 
                    href={`https://wa.me/${contactInfo.whatsapp.replace(/\s+/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-link"
                  >
                    WhatsApp: {contactInfo.phone}
                  </a>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-icon">
                  <FiMail />
                </div>
                <div className="info-card-content">
                  <h3>Email</h3>
                  <p>{contactInfo.email}</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-icon">
                  <FiClock />
                </div>
                <div className="info-card-content">
                  <h3>Horario de Atención</h3>
                  <div className="schedule-list">
                    <p>{contactInfo.hours.weekdays}</p>
                    <p>{contactInfo.hours.saturday}</p>
                    <p className="closed">{contactInfo.hours.sunday}</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="social-section">
                <h3>Síguenos en Redes Sociales</h3>
                <div className="social-links">
                  <a 
                    href={contactInfo.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link facebook"
                    aria-label="Facebook"
                  >
                    <FiFacebook />
                  </a>
                  <a 
                    href={contactInfo.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link instagram"
                    aria-label="Instagram"
                  >
                    <FiInstagram />
                  </a>
                  <a 
                    href={contactInfo.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link twitter"
                    aria-label="Twitter"
                  >
                    <FiTwitter />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <div className="map-container">
          <div className="map-overlay">
            <div className="map-info">
              <div className="map-icon">
                <FiMapPin />
              </div>
              <h3>Encuéntranos aquí</h3>
              <p>{contactInfo.address}</p>
              <a 
                href="https://maps.google.com/?q=Av.+Principal+123+San+Isidro+Lima"
                target="_blank"
                rel="noopener noreferrer"
                className="map-button"
              >
                <FiMapPin />
                Ver en Google Maps
              </a>
            </div>
          </div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.3087753840845!2d-77.03872492507487!3d-12.094167442378916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8b5d35662c7%3A0x4445d7b5d0c4d79e!2sSan%20Isidro%2C%20Lima!5e0!3m2!1ses!2spe!4v1702656789012!5m2!1ses!2spe"
            width="100%"
            height="500"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación del Spa"
          ></iframe>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="contact-container">
          <div className="faq-header">
            <h2>Preguntas Frecuentes</h2>
            <p>Encuentra respuestas rápidas a las preguntas más comunes</p>
          </div>

          <div className="faq-grid">
            <div className="faq-card">
              <div className="faq-icon">❓</div>
              <h3>¿Necesito hacer una cita?</h3>
              <p>Sí, recomendamos hacer una reserva previa para garantizar la disponibilidad de nuestros servicios y terapeutas.</p>
            </div>

            <div className="faq-card">
              <div className="faq-icon">💳</div>
              <h3>¿Qué métodos de pago aceptan?</h3>
              <p>Aceptamos efectivo, tarjetas de crédito/débito, transferencias bancarias y pagos mediante Yape o Plin.</p>
            </div>

            <div className="faq-card">
              <div className="faq-icon">⏰</div>
              <h3>¿Puedo cancelar mi cita?</h3>
              <p>Sí, puedes cancelar con al menos 24 horas de anticipación sin ningún cargo. Cancelaciones tardías pueden tener penalización.</p>
            </div>

           
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage