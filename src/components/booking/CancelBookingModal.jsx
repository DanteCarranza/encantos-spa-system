import React, { useState } from 'react'
import { FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import myBookingsService from '../../services/myBookingsService'
import Swal from 'sweetalert2'
import './BookingModals.css'

const CancelBookingModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const [motivo, setMotivo] = useState('')
  const [motivoPersonalizado, setMotivoPersonalizado] = useState('')
  const [loading, setLoading] = useState(false)

  const motivosPredefinidos = [
    'Cambio de planes personales',
    'Problema de salud',
    'Emergencia familiar',
    'No puedo asistir en ese horario',
    'Encontré otro servicio',
    'Otro motivo'
  ]

  const handleCancel = async () => {
    const motivoFinal = motivo === 'Otro motivo' ? motivoPersonalizado : motivo

    if (!motivoFinal) {
      Swal.fire({
        icon: 'warning',
        title: 'Motivo requerido',
        text: 'Por favor selecciona o escribe un motivo',
        confirmButtonColor: '#d946ef'
      })
      return
    }

    const result = await Swal.fire({
      title: '¿Confirmar cancelación?',
      html: `
        <p>Esta acción no se puede deshacer.</p>
        <p class="text-muted">Se generará un crédito de <strong>S/ ${booking.monto_adelanto?.toFixed(2) || '0.00'}</strong> válido por 6 meses.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, mantener reserva',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b'
    })

    if (!result.isConfirmed) return

    setLoading(true)
    const response = await myBookingsService.cancelarReserva(booking.id, motivoFinal)
    setLoading(false)

    if (response.success) {
      Swal.fire({
        icon: 'success',
        title: '¡Reserva Cancelada!',
        html: response.data.credito_generado 
          ? `
            <p>Tu reserva ha sido cancelada exitosamente.</p>
            <div class="credit-info">
              <p><strong>Crédito generado:</strong></p>
              <p class="credit-amount">S/ ${response.data.credito_generado.monto.toFixed(2)}</p>
              <p class="credit-expiry">Válido hasta: ${new Date(response.data.credito_generado.vencimiento).toLocaleDateString('es-PE')}</p>
            </div>
          `
          : '<p>Tu reserva ha sido cancelada exitosamente.</p>',
        confirmButtonColor: '#d946ef'
      })
      onSuccess()
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: response.message || 'No se pudo cancelar la reserva',
        confirmButtonColor: '#d946ef'
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon danger">
            <FiAlertCircle />
          </div>
          <h2 className="modal-title">Cancelar Reserva</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          {/* Booking Info */}
          <div className="booking-summary-card">
            <div className="summary-item">
              <span className="summary-label">Servicio:</span>
              <span className="summary-value">{booking.servicio_nombre}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Fecha:</span>
              <span className="summary-value">
                {new Date(booking.fecha_reserva).toLocaleDateString('es-PE')} - {booking.hora_inicio}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Código:</span>
              <span className="summary-value code">{booking.codigo}</span>
            </div>
          </div>

          {/* Warning */}
          <div className="alert alert-warning">
            <FiAlertCircle />
            <div>
              <strong>Política de Cancelación:</strong>
              <p>Se generará un crédito de S/ {booking.monto_adelanto?.toFixed(2) || '0.00'} válido por 6 meses para futuras reservas.</p>
            </div>
          </div>

          {/* Motivo */}
          <div className="form-group">
            <label>¿Por qué cancelas? *</label>
            <div className="motivos-grid">
              {motivosPredefinidos.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`motivo-btn ${motivo === m ? 'active' : ''}`}
                  onClick={() => setMotivo(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {motivo === 'Otro motivo' && (
            <div className="form-group">
              <label>Especifica el motivo</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Escribe el motivo de la cancelación..."
                value={motivoPersonalizado}
                onChange={(e) => setMotivoPersonalizado(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Volver
          </button>
          <button 
            className="btn btn-danger"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Cancelando...
              </>
            ) : (
              <>
                <FiAlertCircle />
                Cancelar Reserva
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CancelBookingModal