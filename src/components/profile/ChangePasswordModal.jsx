import React, { useState } from 'react'
import { FiX, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import profileService from '../../services/profileService'
import Swal from 'sweetalert2'
import './ProfileModals.css'

const ChangePasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    password_actual: '',
    password_nuevo: '',
    password_confirmar: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    actual: false,
    nuevo: false,
    confirmar: false
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validaciones
    if (!formData.password_actual) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Ingresa tu contraseña actual',
        confirmButtonColor: '#d946ef'
      })
      return
    }

    if (formData.password_nuevo.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña muy corta',
        text: 'La nueva contraseña debe tener al menos 6 caracteres',
        confirmButtonColor: '#d946ef'
      })
      return
    }

    if (formData.password_nuevo !== formData.password_confirmar) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseñas no coinciden',
        text: 'La nueva contraseña y su confirmación deben ser iguales',
        confirmButtonColor: '#d946ef'
      })
      return
    }

    if (formData.password_actual === formData.password_nuevo) {
      Swal.fire({
        icon: 'warning',
        title: 'Misma contraseña',
        text: 'La nueva contraseña debe ser diferente a la actual',
        confirmButtonColor: '#d946ef'
      })
      return
    }

    setLoading(true)
    const result = await profileService.cambiarPassword(
      formData.password_actual,
      formData.password_nuevo
    )
    setLoading(false)

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: '¡Contraseña Actualizada!',
        text: 'Tu contraseña ha sido cambiada exitosamente',
        confirmButtonColor: '#d946ef'
      })
      setFormData({
        password_actual: '',
        password_nuevo: '',
        password_confirmar: ''
      })
      onSuccess()
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.message || 'No se pudo cambiar la contraseña',
        confirmButtonColor: '#d946ef'
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon primary">
            <FiLock />
          </div>
          <h2 className="modal-title">Cambiar Contraseña</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="password-info-box">
            <p>Tu contraseña debe tener al menos 6 caracteres.</p>
            <p className="text-muted">Usa una combinación de letras, números y símbolos para mayor seguridad.</p>
          </div>

          <div className="form-group">
            <label htmlFor="password_actual">Contraseña Actual *</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.actual ? 'text' : 'password'}
                id="password_actual"
                name="password_actual"
                value={formData.password_actual}
                onChange={handleChange}
                className="form-input"
                placeholder="Ingresa tu contraseña actual"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => toggleShowPassword('actual')}
              >
                {showPasswords.actual ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password_nuevo">Nueva Contraseña *</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.nuevo ? 'text' : 'password'}
                id="password_nuevo"
                name="password_nuevo"
                value={formData.password_nuevo}
                onChange={handleChange}
                className="form-input"
                placeholder="Ingresa tu nueva contraseña"
                required
                minLength="6"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => toggleShowPassword('nuevo')}
              >
                {showPasswords.nuevo ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {formData.password_nuevo && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className={`strength-fill ${
                      formData.password_nuevo.length < 6 ? 'weak' :
                      formData.password_nuevo.length < 8 ? 'medium' : 'strong'
                    }`}
                    style={{
                      width: `${Math.min(100, (formData.password_nuevo.length / 12) * 100)}%`
                    }}
                  ></div>
                </div>
                <span className="strength-text">
                  {formData.password_nuevo.length < 6 ? 'Débil' :
                   formData.password_nuevo.length < 8 ? 'Media' : 'Fuerte'}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password_confirmar">Confirmar Nueva Contraseña *</label>
            <div className="password-input-wrapper">
              <input
                type={showPasswords.confirmar ? 'text' : 'password'}
                id="password_confirmar"
                name="password_confirmar"
                value={formData.password_confirmar}
                onChange={handleChange}
                className="form-input"
                placeholder="Confirma tu nueva contraseña"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => toggleShowPassword('confirmar')}
              >
                {showPasswords.confirmar ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {formData.password_confirmar && (
              <div className="password-match">
                {formData.password_nuevo === formData.password_confirmar ? (
                  <span className="match-success">✓ Las contraseñas coinciden</span>
                ) : (
                  <span className="match-error">✗ Las contraseñas no coinciden</span>
                )}
              </div>
            )}
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Cambiando...
              </>
            ) : (
              <>
                <FiLock />
                Cambiar Contraseña
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChangePasswordModal