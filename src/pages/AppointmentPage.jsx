import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiMail, 
  FiPhone,
  FiMessageSquare,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import appointmentService from '../services/appointmentService'
import Swal from 'sweetalert2'
import './AppointmentPage.css'

const AppointmentPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    fecha: '',
    hora: '',
    tipo_servicio: '',
    mensaje: ''
  })

  const [errors, setErrors] = useState({})

  const servicios = [
    { value: 'asesoria_general', label: 'Asesoría General' },
    { value: 'consulta_producto', label: 'Consulta de Producto' },
    { value: 'soporte_tecnico', label: 'Soporte Técnico' },
    { value: 'ventas', label: 'Información de Ventas' },
    { value: 'otros', label: 'Otros' }
  ]

  useEffect(() => {
    if (formData.fecha) {
      loadAvailableSlots(formData.fecha)
    }
  }, [formData.fecha])

  const loadAvailableSlots = async (date) => {
    setLoadingSlots(true)
    const result = await appointmentService.getAvailableSlots(date)
    if (result.success) {
      setAvailableSlots(result.data)
    } else {
      // Si no hay backend, usar horarios de ejemplo
      const slots = generateExampleSlots()
      setAvailableSlots(slots)
    }
    setLoadingSlots(false)
  }

  const generateExampleSlots = () => {
    const slots = []
    const hours = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']
    hours.forEach(hour => {
      slots.push({
        hora: hour,
        disponible: Math.random() > 0.3 // 70% disponibles
      })
    })
    return slots
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

  const validateStep1 = () => {
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

    if (!formData.tipo_servicio) {
      newErrors.tipo_servicio = 'Selecciona un tipo de servicio'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}

    if (!formData.fecha) {
      newErrors.fecha = 'Selecciona una fecha'
    }

    if (!formData.hora) {
      newErrors.hora = 'Selecciona un horario'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep2()) return

    setLoading(true)

    try {
      const result = await appointmentService.createAppointment(formData)

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Cita Reservada!',
          text: 'Tu cita ha sido agendada exitosamente. Te enviaremos un correo de confirmación.',
          confirmButtonText: 'Ver Mis Citas'
        }).then(() => {
          if (isAuthenticated) {
            navigate('/perfil?tab=citas')
          } else {
            navigate('/')
          }
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'No se pudo agendar la cita'
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al agendar la cita'
      })
    } finally {
      setLoading(false)
    }
  }

  // Obtener fecha mínima (hoy)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Obtener fecha máxima (3 meses adelante)
  const getMaxDate = () => {
    const today = new Date()
    const maxDate = new Date(today.setMonth(today.getMonth() + 3))
    return maxDate.toISOString().split('T')[0]
  }

  return (
    <div className="appointment-page">
      <div className="appointment-hero">
        <div className="container">
          <h1 className="appointment-page-title">Reservar Cita</h1>
          <p className="appointment-page-subtitle">
            Agenda una asesoría personalizada con nuestros expertos
          </p>
        </div>
      </div>

      <div className="container">
        <div className="appointment-container">
          {/* Sidebar de Información */}
          <div className="appointment-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-title">¿Por qué reservar una cita?</h3>
              <ul className="sidebar-benefits">
                <li>
                  <FiCheck className="benefit-icon" />
                  <span>Asesoría personalizada y gratuita</span>
                </li>
                <li>
                  <FiCheck className="benefit-icon" />
                  <span>Expertos con más de 10 años de experiencia</span>
                </li>
                <li>
                  <FiCheck className="benefit-icon" />
                  <span>Recomendaciones adaptadas a tus necesidades</span>
                </li>
                <li>
                  <FiCheck className="benefit-icon" />
                  <span>Modalidad presencial o virtual</span>
                </li>
              </ul>
            </div>

            <div className="sidebar-card">
              <h3 className="sidebar-title">Horarios de Atención</h3>
              <div className="schedule-info">
                <div className="schedule-row">
                  <span>Lunes - Viernes</span>
                  <strong>9:00 AM - 6:00 PM</strong>
                </div>
                <div className="schedule-row">
                  <span>Sábados</span>
                  <strong>10:00 AM - 2:00 PM</strong>
                </div>
                <div className="schedule-row">
                  <span>Domingos</span>
                  <strong>Cerrado</strong>
                </div>
              </div>
            </div>

            <div className="sidebar-card info-card">
              <FiAlertCircle className="info-icon" />
              <p className="info-text">
                Si necesitas cancelar o reprogramar tu cita, por favor hazlo con 
                al menos 24 horas de anticipación.
              </p>
            </div>
          </div>

          {/* Formulario de Reserva */}
          <div className="appointment-form-container">
            {/* Progress Steps */}
            <div className="progress-steps">
              <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                <div className="step-number">
                  {step > 1 ? <FiCheck /> : '1'}
                </div>
                <div className="step-label">Información Personal</div>
              </div>
              <div className="progress-line"></div>
              <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">Fecha y Horario</div>
              </div>
            </div>

            {/* Step 1: Información Personal */}
            {step === 1 && (
              <form className="appointment-form">
                <h2 className="form-section-title">Información Personal</h2>

                <div className="form-group">
                  <label htmlFor="nombre" className="form-label">
                    Nombre Completo *
                  </label>
                  <div className="input-wrapper">
                    <FiUser className="input-icon" />
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      className={`form-input ${errors.nombre ? 'error' : ''}`}
                      placeholder="Juan Pérez"
                      value={formData.nombre}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.nombre && (
                    <span className="form-error">{errors.nombre}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Correo Electrónico *
                    </label>
                    <div className="input-wrapper">
                      <FiMail className="input-icon" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className={`form-input ${errors.email ? 'error' : ''}`}
                        placeholder="correo@ejemplo.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.email && (
                      <span className="form-error">{errors.email}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="telefono" className="form-label">
                      Teléfono *
                    </label>
                    <div className="input-wrapper">
                      <FiPhone className="input-icon" />
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        className={`form-input ${errors.telefono ? 'error' : ''}`}
                        placeholder="999999999"
                        value={formData.telefono}
                        onChange={handleChange}
                        maxLength={9}
                      />
                    </div>
                    {errors.telefono && (
                      <span className="form-error">{errors.telefono}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="tipo_servicio" className="form-label">
                    Tipo de Servicio *
                  </label>
                  <select
                    id="tipo_servicio"
                    name="tipo_servicio"
                    className={`form-input ${errors.tipo_servicio ? 'error' : ''}`}
                    value={formData.tipo_servicio}
                    onChange={handleChange}
                  >
                    <option value="">Selecciona un servicio</option>
                    {servicios.map(servicio => (
                      <option key={servicio.value} value={servicio.value}>
                        {servicio.label}
                      </option>
                    ))}
                  </select>
                  {errors.tipo_servicio && (
                    <span className="form-error">{errors.tipo_servicio}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="mensaje" className="form-label">
                    Mensaje (Opcional)
                  </label>
                  <div className="input-wrapper">
                    <FiMessageSquare className="input-icon textarea-icon" />
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      className="form-input form-textarea"
                      placeholder="Cuéntanos brevemente sobre qué te gustaría hablar..."
                      value={formData.mensaje}
                      onChange={handleChange}
                      rows={4}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={handleNext}
                  >
                    Continuar
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Fecha y Horario */}
            {step === 2 && (
              <form className="appointment-form" onSubmit={handleSubmit}>
                <h2 className="form-section-title">Selecciona Fecha y Horario</h2>

                <div className="form-group">
                  <label htmlFor="fecha" className="form-label">
                    Fecha de la Cita *
                  </label>
                  <div className="input-wrapper">
                    <FiCalendar className="input-icon" />
                    <input
                      type="date"
                      id="fecha"
                      name="fecha"
                      className={`form-input ${errors.fecha ? 'error' : ''}`}
                      value={formData.fecha}
                      onChange={handleChange}
                      min={getMinDate()}
                      max={getMaxDate()}
                    />
                  </div>
                  {errors.fecha && (
                    <span className="form-error">{errors.fecha}</span>
                  )}
                </div>

                {formData.fecha && (
                  <div className="form-group">
                    <label className="form-label">
                      Horarios Disponibles *
                    </label>
                    {loadingSlots ? (
                      <div className="loading-slots">
                        <div className="spinner"></div>
                        <p>Cargando horarios disponibles...</p>
                      </div>
                    ) : (
                      <div className="time-slots-grid">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.hora}
                            type="button"
                            className={`time-slot ${
                              formData.hora === slot.hora ? 'selected' : ''
                            } ${!slot.disponible ? 'disabled' : ''}`}
                            onClick={() => slot.disponible && handleChange({ 
                              target: { name: 'hora', value: slot.hora } 
                            })}
                            disabled={!slot.disponible}
                          >
                            <FiClock />
                            {slot.hora}
                            {!slot.disponible && <span className="slot-status">No disponible</span>}
                          </button>
                        ))}
                      </div>
                    )}
                    {errors.hora && (
                      <span className="form-error">{errors.hora}</span>
                    )}
                  </div>
                )}

                {/* Resumen */}
                {formData.fecha && formData.hora && (
                  <div className="appointment-summary">
                    <h3 className="summary-title">Resumen de tu Cita</h3>
                    <div className="summary-item">
                      <FiUser />
                      <div>
                        <span className="summary-label">Nombre:</span>
                        <span className="summary-value">{formData.nombre}</span>
                      </div>
                    </div>
                    <div className="summary-item">
                      <FiMail />
                      <div>
                        <span className="summary-label">Email:</span>
                        <span className="summary-value">{formData.email}</span>
                      </div>
                    </div>
                    <div className="summary-item">
                      <FiCalendar />
                      <div>
                        <span className="summary-label">Fecha:</span>
                        <span className="summary-value">
                          {new Date(formData.fecha + 'T00:00:00').toLocaleDateString('es-PE', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="summary-item">
                      <FiClock />
                      <div>
                        <span className="summary-label">Hora:</span>
                        <span className="summary-value">{formData.hora}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleBack}
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                        Reservando...
                      </>
                    ) : (
                      <>
                        <FiCheck />
                        Confirmar Reserva
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentPage