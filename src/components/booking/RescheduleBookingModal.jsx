import React, { useState, useEffect } from 'react'
import { FiX, FiCalendar, FiClock, FiCheck } from 'react-icons/fi'
import myBookingsService from '../../services/myBookingsService'
import Swal from 'sweetalert2'
import './BookingModals.css'

const RescheduleBookingModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots()
    }
  }, [selectedDate])

  const loadAvailableSlots = async () => {
    setLoadingSlots(true)
    const result = await myBookingsService.getHorariosDisponibles(selectedDate, booking.servicio_id)
    setLoadingSlots(false)

    if (result.success) {
      setAvailableSlots(result.data.horarios || [])
    } else {
      setAvailableSlots([])
    }
  }

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Selecciona una nueva fecha y hora',
        confirmButtonColor: '#d946ef'
      })
      return
    }

    const result = await Swal.fire({
      title: '¿Confirmar reprogramación?',
      html: `
        <p><strong>Fecha actual:</strong></p>
        <p>${new Date(booking.fecha_reserva).toLocaleDateString('es-PE')} - ${booking.hora_inicio}</p>
        <p><strong>Nueva fecha:</strong></p>
        <p>${new Date(selectedDate).toLocaleDateString('es-PE')} - ${selectedTime}</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, reprogramar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#8b5cf6'
    })

    if (!result.isConfirmed) return

    setLoading(true)
    const response = await myBookingsService.reprogramarReserva(
      booking.id, 
      selectedDate, 
      selectedTime,
      'Reprogramación solicitada por el cliente'
    )
    setLoading(false)

    if (response.success) {
      Swal.fire({
        icon: 'success',
        title: '¡Reprogramado!',
        html: `
          <p>Tu reserva ha sido reprogramada exitosamente.</p>
          <p><strong>Nueva fecha:</strong></p>
          <p>${new Date(selectedDate).toLocaleDateString('es-PE')} - ${selectedTime}</p>
        `,
        confirmButtonColor: '#d946ef'
      })
      onSuccess()
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: response.message || 'No se pudo reprogramar la reserva',
        confirmButtonColor: '#d946ef'
      })
    }
  }

  // Generar fechas disponibles (próximos 30 días, excluyendo domingos)
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      // Excluir domingos (día 0)
      if (date.getDay() !== 0) {
        dates.push(date.toISOString().split('T')[0])
      }
    }

    return dates
  }

  const availableDates = getAvailableDates()

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon primary">
            <FiCalendar />
          </div>
          <h2 className="modal-title">Reprogramar Reserva</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          {/* Current Booking */}
          <div className="current-booking">
            <h3>Reserva Actual</h3>
            <div className="booking-summary-inline">
              <div className="inline-item">
                <FiCalendar />
                <span>{new Date(booking.fecha_reserva).toLocaleDateString('es-PE')}</span>
              </div>
              <div className="inline-item">
                <FiClock />
                <span>{booking.hora_inicio} - {booking.hora_fin}</span>
              </div>
            </div>
          </div>

          {/* New Date Selection */}
          <div className="form-group">
            <label>Nueva Fecha *</label>
            <select
              className="form-select"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setSelectedTime('')
              }}
            >
              <option value="">Selecciona una fecha</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {new Date(date + 'T00:00:00').toLocaleDateString('es-PE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="form-group">
              <label>Hora Disponible *</label>
              {loadingSlots ? (
                <div className="loading-slots">
                  <div className="spinner-small"></div>
                  <span>Cargando horarios...</span>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="time-slots-grid">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`time-slot ${selectedTime === slot ? 'active' : ''}`}
                      onClick={() => setSelectedTime(slot)}
                    >
                      <FiClock />
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-slots">
                  <p>No hay horarios disponibles para esta fecha</p>
                  <p className="text-muted">Prueba con otra fecha</p>
                </div>
              )}
            </div>
          )}

          {/* Info Alert */}
          <div className="alert alert-info">
            <FiCalendar />
            <div>
              <strong>Importante:</strong>
              <p>La reprogramación debe hacerse con al menos 12 horas de anticipación.</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleReschedule}
            disabled={loading || !selectedDate || !selectedTime}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Reprogramando...
              </>
            ) : (
              <>
                <FiCheck />
                Confirmar Reprogramación
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RescheduleBookingModal