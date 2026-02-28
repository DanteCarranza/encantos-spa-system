import React, { useState } from 'react'
import { FiX, FiStar } from 'react-icons/fi'
import myBookingsService from '../../services/myBookingsService'
import Swal from 'sweetalert2'
import './BookingModals.css'

const RatingModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Calificación requerida',
        text: 'Por favor selecciona una calificación',
        confirmButtonColor: '#d946ef'
      })
      return
    }

    setLoading(true)
    const response = await myBookingsService.valorarServicio(booking.id, rating, comment)
    setLoading(false)

    if (response.success) {
      Swal.fire({
        icon: 'success',
        title: '¡Gracias por tu valoración!',
        text: 'Tu opinión nos ayuda a mejorar nuestro servicio',
        confirmButtonColor: '#d946ef'
      })
      onSuccess()
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: response.message || 'No se pudo registrar la valoración',
        confirmButtonColor: '#d946ef'
      })
    }
  }

  const getRatingText = (stars) => {
    const texts = {
      1: 'Muy insatisfecho',
      2: 'Insatisfecho',
      3: 'Neutral',
      4: 'Satisfecho',
      5: '¡Excelente!'
    }
    return texts[stars] || ''
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon success">
            <FiStar />
          </div>
          <h2 className="modal-title">Valorar Servicio</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          {/* Service Info */}
          <div className="rating-service-info">
            <h3>{booking.servicio_nombre}</h3>
            {booking.terapeuta_nombre && (
              <p className="therapist-info">
                Atendido por: <strong>{booking.terapeuta_nombre}</strong>
              </p>
            )}
            <p className="service-date">
              {new Date(booking.fecha_reserva).toLocaleDateString('es-PE')} - {booking.hora_inicio}
            </p>
          </div>

          {/* Rating Stars */}
          <div className="rating-container">
            <p className="rating-question">¿Cómo fue tu experiencia?</p>
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="star-btn"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <FiStar
                    className={`star-icon ${
                      (hoverRating || rating) >= star ? 'filled' : ''
                    }`}
                  />
                </button>
              ))}
            </div>
            {(hoverRating || rating) > 0 && (
              <p className="rating-text">{getRatingText(hoverRating || rating)}</p>
            )}
          </div>

          {/* Comment */}
          <div className="form-group">
            <label>
              Cuéntanos más (opcional)
              <span className="optional-text">Tu opinión nos ayuda a mejorar</span>
            </label>
            <textarea
              className="form-textarea"
              rows="4"
              placeholder="¿Qué te gustó? ¿Qué podríamos mejorar?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength="500"
            />
            <span className="char-count">{comment.length}/500</span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={loading || rating === 0}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Enviando...
              </>
            ) : (
              <>
                <FiStar />
                Enviar Valoración
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RatingModal