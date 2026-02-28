import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { FiSearch, FiPackage, FiClock, FiUser, FiCalendar, FiDollarSign, FiMail, FiPhone, FiCheckCircle, FiMapPin } from 'react-icons/fi'
import myBookingsService from '../services/myBookingsService'
import Swal from 'sweetalert2'
import './TrackBookingPage.css'

const TrackBookingPage = () => {
  const location = useLocation()
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const codigoFromUrl = params.get('codigo')
    if (codigoFromUrl) {
      setCodigo(codigoFromUrl)
      handleSearchWithCode(codigoFromUrl)
    }
  }, [location.search])

  const handleSearchWithCode = async (searchCodigo) => {
    setLoading(true)
    const result = await myBookingsService.buscarPorCodigo(searchCodigo.toUpperCase(), 'tracking@temp.com')
    setLoading(false)

    if (result.success) {
      setBooking(result.data)
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Reserva no encontrada',
        text: 'Verifica que el código sea correcto',
        confirmButtonColor: '#d946ef'
      })
      setBooking(null)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!codigo.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Código requerido',
        text: 'Ingresa tu código de reserva',
        confirmButtonColor: '#d946ef'
      })
      return
    }
    await handleSearchWithCode(codigo)
  }

  const getStatusColor = (estado) => {
    const colors = {
      pendiente: { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' },
      confirmada: { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
      completada: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
      cancelada: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' }
    }
    return colors[estado] || colors.pendiente
  }

  const getTimelineSteps = () => {
    if (!booking) return []

    return [
      { 
        label: 'Reserva Creada',
        icon: '📝',
        completed: true,
        date: booking.fecha_creacion
      },
      { 
        label: 'Pago Confirmado',
        icon: '💳',
        completed: ['confirmada', 'completada'].includes(booking.estado) || booking.estado_pago === 'pagado',
        date: booking.estado_pago === 'pagado' ? booking.fecha_creacion : null
      },
      { 
        label: 'Especialista Asignado',
        icon: '👤',
        completed: booking.terapeuta_id !== null,
        specialist: booking.terapeuta_nombre,
        date: booking.terapeuta_id ? booking.fecha_creacion : null
      },
      { 
        label: 'Servicio Completado',
        icon: '✓',
        completed: booking.estado === 'completada',
        date: booking.estado === 'completada' ? booking.fecha_reserva : null
      }
    ]
  }

  const formatDate = (date) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price) => `S/ ${parseFloat(price || 0).toFixed(2)}`

  const statusColor = booking ? getStatusColor(booking.estado) : null
  const timelineSteps = getTimelineSteps()

  return (
    <div className="track-page-new">
      <div className="track-container-new">
        {/* Compact Header */}
        <div className="track-header-compact">
          <h1>Seguimiento de Reserva</h1>
          <p>Ingresa tu código de reserva para rastrear el estado</p>
        </div>

        {/* Inline Search */}
        <form onSubmit={handleSearch} className="search-inline">
          <div className="search-group">
            <FiSearch />
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="SPA-2026-XXXXXX"
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
        <p className="search-hint-compact">Formato: SPA-YYYY-XXXXXX (ejemplo: SPA-2026-78E081)</p>

        {/* Results Compact */}
        {booking && (
          <div className="results-compact">
            {/* Status Banner */}
            <div className="status-banner" style={{ 
              backgroundColor: statusColor.bg, 
              borderColor: statusColor.border 
            }}>
              <div className="status-info">
                <FiCheckCircle style={{ color: statusColor.text }} />
                <span style={{ color: statusColor.text }}>
                  {booking.estado === 'completada' ? 'Servicio Completado' :
                   booking.estado === 'confirmada' ? 'Cita Confirmada' :
                   booking.estado === 'cancelada' ? 'Reserva Cancelada' : 'Reserva Pendiente'}
                </span>
              </div>
              <span className="booking-code-compact">{booking.codigo}</span>
            </div>

            {/* Main Card - Compact Layout */}
            <div className="booking-card-compact">
              {/* Service Header */}
              <div className="service-header-compact">
                <FiPackage />
                <div>
                  <h2>{booking.servicio_nombre}</h2>
                  {booking.servicio_descripcion && (
                    <p>{booking.servicio_descripcion}</p>
                  )}
                </div>
              </div>

              {/* 2 Column Layout */}
              <div className="booking-grid-compact">
                {/* Left: Timeline Compact */}
                <div className="timeline-compact">
                  <h3><FiClock /> Historial</h3>
                  <div className="steps-compact">
                    {timelineSteps.map((step, idx) => (
                      <div key={idx} className={`step-compact ${step.completed ? 'completed' : 'pending'}`}>
                        <div className="step-dot-compact">{step.icon}</div>
                        <div className="step-info-compact">
                          <strong>{step.label}</strong>
                          {step.specialist && <span className="specialist-name">→ {step.specialist}</span>}
                          {step.date && <span className="step-date-compact">{formatDate(step.date)}</span>}
                          {!step.date && <span className="step-pending-text">Pendiente</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Details Compact */}
                <div className="details-compact">
                  <h3><FiCalendar /> Detalles de la Cita</h3>
                  
                  <div className="details-list-compact">
                    <div className="detail-row">
                      <FiCalendar />
                      <div>
                        <span>FECHA</span>
                        <strong>
                          {new Date(booking.fecha_reserva).toLocaleDateString('es-PE', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </strong>
                      </div>
                    </div>

                    <div className="detail-row">
                      <FiClock />
                      <div>
                        <span>HORA</span>
                        <strong>{booking.hora_inicio} - {booking.hora_fin}</strong>
                      </div>
                    </div>

                    {booking.terapeuta_nombre && (
                      <div className="detail-row">
                        <FiUser />
                        <div>
                          <span>TERAPEUTA</span>
                          <strong>{booking.terapeuta_nombre}</strong>
                        </div>
                      </div>
                    )}

                    <div className="detail-row price-row">
                      <FiDollarSign />
                      <div>
                        <span>PRECIO TOTAL</span>
                        <strong className="price-large">{formatPrice(booking.precio_servicio)}</strong>
                        {booking.monto_adelanto > 0 && (
                          <span className="price-detail">Adelanto: {formatPrice(booking.monto_adelanto)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {booking.saldo_pendiente > 0 && (
                    <div className="alert-pending">
                      ⚠️ Saldo Pendiente: {formatPrice(booking.saldo_pendiente)}
                    </div>
                  )}

                  {/* Contact Info Inline */}
                  <div className="contact-compact">
                    <h4>Información de Contacto</h4>
                    <div className="contact-items-compact">
                      <div><FiMail /> {booking.email_cliente}</div>
                      <div><FiPhone /> {booking.telefono_cliente}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State Compact */}
        {!booking && !loading && (
          <div className="empty-compact">
            <div className="empty-icon-compact">🔍</div>
            <h3>Ingresa tu código de reserva</h3>
            <p>Podrás ver el estado y todos los detalles de tu cita</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackBookingPage