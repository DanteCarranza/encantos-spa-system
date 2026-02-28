import React, { useState } from 'react'
import { FiCalendar, FiClock, FiUser, FiDollarSign, FiMoreVertical, FiX, FiEdit, FiStar } from 'react-icons/fi'
import CancelBookingModal from '../booking/CancelBookingModal'
import RescheduleBookingModal from '../booking/RescheduleBookingModal'
import RatingModal from '../booking/RatingModal'
import './BookingCard.css'

const BookingCard = ({ booking, onUpdate }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)

  const getStatusInfo = (estado) => {
    const statusMap = {
      pendiente: { label: 'Pendiente', color: '#f59e0b', bg: '#fef3c7' },
      confirmada: { label: 'Confirmada', color: '#10b981', bg: '#d1fae5' },
      completada: { label: 'Completada', color: '#3b82f6', bg: '#dbeafe' },
      cancelada: { label: 'Cancelada', color: '#ef4444', bg: '#fee2e2' },
      en_curso: { label: 'En Curso', color: '#8b5cf6', bg: '#ede9fe' },
      no_asistio: { label: 'No Asistió', color: '#64748b', bg: '#f1f5f9' }
    }
    return statusMap[estado] || statusMap.pendiente
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (price) => {
    return `S/ ${parseFloat(price).toFixed(2)}`
  }

  const statusInfo = getStatusInfo(booking.estado)

  const handleSuccess = () => {
    setShowCancelModal(false)
    setShowRescheduleModal(false)
    setShowRatingModal(false)
    onUpdate()
  }

  return (
    <>
      <div className="booking-card-item">
        <div className="booking-card-header">
          <div className="booking-card-status" style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
            {statusInfo.label}
          </div>
          <div className="booking-card-code">{booking.codigo}</div>
          <div className="booking-card-actions">
            <button className="btn-menu" onClick={() => setShowMenu(!showMenu)}>
              <FiMoreVertical />
            </button>
            {showMenu && (
              <div className="booking-menu">
                {booking.puede_valorar && (
                  <button onClick={() => { setShowRatingModal(true); setShowMenu(false); }}>
                    <FiStar /> Valorar
                  </button>
                )}
                {booking.puede_reprogramar && (
                  <button onClick={() => { setShowRescheduleModal(true); setShowMenu(false); }}>
                    <FiEdit /> Reprogramar
                  </button>
                )}
                {booking.puede_cancelar && (
                  <button className="danger" onClick={() => { setShowCancelModal(true); setShowMenu(false); }}>
                    <FiX /> Cancelar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="booking-card-body">
          <h3 className="booking-service-name">{booking.servicio_nombre}</h3>

          <div className="booking-info-grid">
            <div className="booking-info-item">
              <FiCalendar />
              <div>
                <span className="info-label-small">Fecha</span>
                <span className="info-value-small">{formatDate(booking.fecha_reserva)}</span>
              </div>
            </div>

            <div className="booking-info-item">
              <FiClock />
              <div>
                <span className="info-label-small">Hora</span>
                <span className="info-value-small">{booking.hora_inicio} - {booking.hora_fin}</span>
              </div>
            </div>

            {booking.terapeuta_nombre && (
              <div className="booking-info-item">
                <FiUser />
                <div>
                  <span className="info-label-small">Terapeuta</span>
                  <span className="info-value-small">{booking.terapeuta_nombre}</span>
                </div>
              </div>
            )}

            <div className="booking-info-item">
              <FiDollarSign />
              <div>
                <span className="info-label-small">Precio</span>
                <span className="info-value-small">{formatPrice(booking.precio_servicio)}</span>
              </div>
            </div>
          </div>

          {booking.saldo_pendiente > 0 && (
            <div className="booking-pending-payment">
              <span>Saldo pendiente: {formatPrice(booking.saldo_pendiente)}</span>
            </div>
          )}

          {booking.valoracion && (
            <div className="booking-rating">
              <span>Tu valoración:</span>
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < booking.valoracion ? 'star filled' : 'star'}>
                    ★
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CancelBookingModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        booking={booking}
        onSuccess={handleSuccess}
      />

      <RescheduleBookingModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        booking={booking}
        onSuccess={handleSuccess}
      />

      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        booking={booking}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default BookingCard