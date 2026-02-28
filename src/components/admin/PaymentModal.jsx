import React, { useState } from 'react'
import { FiCreditCard, FiDollarSign, FiCalendar, FiUpload, FiX, FiCheck } from 'react-icons/fi'
import Modal from '../common/Modal'
import paymentsService from '../../services/paymentsService'
import Swal from 'sweetalert2'
import './PaymentModal.css'

const PaymentModal = ({ isOpen, onClose, reservation, onPaymentSuccess }) => {
  const [formData, setFormData] = useState({
    tipo_pago: 'saldo',
    monto: '',
    metodo_pago: 'efectivo',
    numero_operacion: '',
    numero_tarjeta_ultimos4: '',
    codigo_autorizacion: '',
    banco: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    notas: ''
  })

  const [voucherFile, setVoucherFile] = useState(null)
  const [voucherPreview, setVoucherPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Calcular montos
  const precioTotal = reservation?.precio_servicio || 0
  const adelantoPagado = reservation?.monto_adelanto || 0
  const saldoPendiente = precioTotal - adelantoPagado

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-completar monto según tipo de pago
    if (name === 'tipo_pago') {
      if (value === 'saldo') {
        setFormData(prev => ({ ...prev, monto: saldoPendiente.toFixed(2) }))
      } else if (value === 'completo') {
        setFormData(prev => ({ ...prev, monto: precioTotal.toFixed(2) }))
      }
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleVoucherChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo muy grande',
          text: 'El voucher no debe superar 5MB',
          confirmButtonColor: '#d946ef'
        })
        return
      }

      setVoucherFile(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setVoucherPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveVoucher = () => {
    setVoucherFile(null)
    setVoucherPreview(null)
    document.getElementById('voucher-upload-payment').value = ''
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      newErrors.monto = 'Ingrese un monto válido'
    }

    if (parseFloat(formData.monto) > saldoPendiente && formData.tipo_pago === 'saldo') {
      newErrors.monto = 'El monto excede el saldo pendiente'
    }

    if (formData.metodo_pago === 'yape' || formData.metodo_pago === 'transferencia') {
      if (!formData.numero_operacion.trim()) {
        newErrors.numero_operacion = 'Número de operación requerido'
      }
    }

    if (formData.metodo_pago === 'tarjeta') {
      if (!formData.numero_tarjeta_ultimos4.trim()) {
        newErrors.numero_tarjeta_ultimos4 = 'Últimos 4 dígitos requeridos'
      } else if (!/^\d{4}$/.test(formData.numero_tarjeta_ultimos4)) {
        newErrors.numero_tarjeta_ultimos4 = 'Deben ser 4 dígitos'
      }

      if (!formData.codigo_autorizacion.trim()) {
        newErrors.codigo_autorizacion = 'Código de autorización requerido'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)

    try {
      const paymentFormData = new FormData()
      
      paymentFormData.append('reserva_id', reservation.id)
      paymentFormData.append('tipo_pago', formData.tipo_pago)
      paymentFormData.append('monto', formData.monto)
      paymentFormData.append('metodo_pago', formData.metodo_pago)
      paymentFormData.append('fecha_pago', formData.fecha_pago)
      
      if (formData.numero_operacion) {
        paymentFormData.append('numero_operacion', formData.numero_operacion)
      }
      
      if (formData.numero_tarjeta_ultimos4) {
        paymentFormData.append('numero_tarjeta_ultimos4', formData.numero_tarjeta_ultimos4)
      }
      
      if (formData.codigo_autorizacion) {
        paymentFormData.append('codigo_autorizacion', formData.codigo_autorizacion)
      }
      
      if (formData.banco) {
        paymentFormData.append('banco', formData.banco)
      }
      
      if (formData.notas) {
        paymentFormData.append('notas', formData.notas)
      }
      
      if (voucherFile) {
        paymentFormData.append('voucher', voucherFile)
      }

      const result = await paymentsService.createPayment(paymentFormData)

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Pago Registrado!',
          html: `
            <p>El pago ha sido registrado exitosamente.</p>
            <p><strong>Saldo pendiente:</strong> S/ ${result.data.saldo_pendiente.toFixed(2)}</p>
          `,
          confirmButtonColor: '#d946ef',
          timer: 3000
        })
        
        onPaymentSuccess()
        onClose()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'No se pudo registrar el pago',
          confirmButtonColor: '#d946ef'
        })
      }
    } catch (error) {
      console.error('Error al registrar pago:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al procesar el pago',
        confirmButtonColor: '#d946ef'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!reservation) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Pago"
      size="large"
    >
      <div className="payment-modal-container">
        {/* Información de la Reserva */}
        <div className="payment-reservation-info">
          <div className="info-grid-payment">
            <div className="info-item-payment">
              <span className="label-payment">Cliente:</span>
              <span className="value-payment">{reservation.nombre_cliente}</span>
            </div>
            <div className="info-item-payment">
              <span className="label-payment">Código:</span>
              <span className="value-payment">{reservation.codigo}</span>
            </div>
            <div className="info-item-payment">
              <span className="label-payment">Servicio:</span>
              <span className="value-payment">{reservation.servicio_nombre}</span>
            </div>
            <div className="info-item-payment">
              <span className="label-payment">Precio Total:</span>
              <span className="value-payment price-total">S/ {precioTotal.toFixed(2)}</span>
            </div>
            <div className="info-item-payment">
              <span className="label-payment">Adelanto Pagado:</span>
              <span className="value-payment">S/ {adelantoPagado.toFixed(2)}</span>
            </div>
            <div className="info-item-payment highlight">
              <span className="label-payment">Saldo Pendiente:</span>
              <span className="value-payment saldo-pendiente">S/ {saldoPendiente.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Formulario de Pago */}
        <form className="payment-form" onSubmit={handleSubmit}>
          <div className="form-grid-payment">
            {/* Tipo de Pago */}
            <div className="form-group-payment">
              <label>Tipo de Pago *</label>
              <select
                name="tipo_pago"
                className="form-input-payment"
                value={formData.tipo_pago}
                onChange={handleChange}
              >
                <option value="saldo">Saldo (60% restante)</option>
                <option value="completo">Pago Completo (100%)</option>
              </select>
            </div>

            {/* Monto */}
            <div className="form-group-payment">
              <label>Monto *</label>
              <div className="input-with-icon">
                <FiDollarSign className="input-icon-payment" />
                <input
                  type="number"
                  step="0.01"
                  name="monto"
                  className={`form-input-payment ${errors.monto ? 'error' : ''}`}
                  placeholder="0.00"
                  value={formData.monto}
                  onChange={handleChange}
                />
              </div>
              {errors.monto && <span className="error-text-payment">{errors.monto}</span>}
            </div>

            {/* Método de Pago */}
            <div className="form-group-payment full-width">
              <label>Método de Pago *</label>
              <div className="payment-methods-grid">
                <div
                  className={`payment-method-option ${formData.metodo_pago === 'efectivo' ? 'selected' : ''}`}
                  onClick={() => handleChange({ target: { name: 'metodo_pago', value: 'efectivo' } })}
                >
                  <div className="payment-method-icon">💵</div>
                  <span>Efectivo</span>
                </div>
                <div
                  className={`payment-method-option ${formData.metodo_pago === 'yape' ? 'selected' : ''}`}
                  onClick={() => handleChange({ target: { name: 'metodo_pago', value: 'yape' } })}
                >
                  <div className="payment-method-icon">📱</div>
                  <span>Yape</span>
                </div>
                <div
                  className={`payment-method-option ${formData.metodo_pago === 'transferencia' ? 'selected' : ''}`}
                  onClick={() => handleChange({ target: { name: 'metodo_pago', value: 'transferencia' } })}
                >
                  <div className="payment-method-icon">🏦</div>
                  <span>Transferencia</span>
                </div>
                <div
                  className={`payment-method-option ${formData.metodo_pago === 'tarjeta' ? 'selected' : ''}`}
                  onClick={() => handleChange({ target: { name: 'metodo_pago', value: 'tarjeta' } })}
                >
                  <div className="payment-method-icon">💳</div>
                  <span>Tarjeta</span>
                </div>
              </div>
            </div>

            {/* Campos específicos según método de pago */}
            {(formData.metodo_pago === 'yape' || formData.metodo_pago === 'transferencia') && (
              <>
                <div className="form-group-payment">
                  <label>Número de Operación *</label>
                  <input
                    type="text"
                    name="numero_operacion"
                    className={`form-input-payment ${errors.numero_operacion ? 'error' : ''}`}
                    placeholder="Ej: 123456789"
                    value={formData.numero_operacion}
                    onChange={handleChange}
                  />
                  {errors.numero_operacion && <span className="error-text-payment">{errors.numero_operacion}</span>}
                </div>

                {formData.metodo_pago === 'transferencia' && (
                  <div className="form-group-payment">
                    <label>Banco</label>
                    <input
                      type="text"
                      name="banco"
                      className="form-input-payment"
                      placeholder="Ej: BCP, Interbank"
                      value={formData.banco}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </>
            )}

            {formData.metodo_pago === 'tarjeta' && (
              <>
                <div className="form-group-payment">
                  <label>Últimos 4 dígitos *</label>
                  <input
                    type="text"
                    name="numero_tarjeta_ultimos4"
                    className={`form-input-payment ${errors.numero_tarjeta_ultimos4 ? 'error' : ''}`}
                    placeholder="1234"
                    maxLength={4}
                    value={formData.numero_tarjeta_ultimos4}
                    onChange={handleChange}
                  />
                  {errors.numero_tarjeta_ultimos4 && <span className="error-text-payment">{errors.numero_tarjeta_ultimos4}</span>}
                </div>

                <div className="form-group-payment">
                  <label>Código de Autorización *</label>
                  <input
                    type="text"
                    name="codigo_autorizacion"
                    className={`form-input-payment ${errors.codigo_autorizacion ? 'error' : ''}`}
                    placeholder="ABC123"
                    value={formData.codigo_autorizacion}
                    onChange={handleChange}
                  />
                  {errors.codigo_autorizacion && <span className="error-text-payment">{errors.codigo_autorizacion}</span>}
                </div>

                <div className="form-group-payment">
                  <label>Banco</label>
                  <input
                    type="text"
                    name="banco"
                    className="form-input-payment"
                    placeholder="Banco emisor"
                    value={formData.banco}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {/* Fecha de Pago */}
            <div className="form-group-payment">
              <label>Fecha de Pago *</label>
              <div className="input-with-icon">
                <FiCalendar className="input-icon-payment" />
                <input
                  type="date"
                  name="fecha_pago"
                  className="form-input-payment"
                  value={formData.fecha_pago}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Voucher */}
            {formData.metodo_pago !== 'efectivo' && (
              <div className="form-group-payment full-width">
                <label>Voucher</label>
                <div className="voucher-upload-payment">
                  <input
                    type="file"
                    id="voucher-upload-payment"
                    accept="image/*,application/pdf"
                    onChange={handleVoucherChange}
                    style={{ display: 'none' }}
                  />
                  {!voucherPreview ? (
                    <label htmlFor="voucher-upload-payment" className="voucher-upload-btn">
                      <FiUpload />
                      Adjuntar Voucher
                    </label>
                  ) : (
                    <div className="voucher-preview-payment">
                      {voucherFile?.type.includes('pdf') ? (
                        <div className="pdf-preview">📄 {voucherFile.name}</div>
                      ) : (
                        <img src={voucherPreview} alt="Voucher" />
                      )}
                      <button
                        type="button"
                        className="remove-voucher-btn"
                        onClick={handleRemoveVoucher}
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notas */}
            <div className="form-group-payment full-width">
              <label>Notas</label>
              <textarea
                name="notas"
                className="form-input-payment"
                rows={3}
                placeholder="Observaciones adicionales..."
                value={formData.notas}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="payment-modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-inline" />
                  Registrando...
                </>
              ) : (
                <>
                  <FiCheck />
                  Registrar Pago
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default PaymentModal