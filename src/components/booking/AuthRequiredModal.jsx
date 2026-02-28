import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiX, FiLock, FiUser, FiHeart } from 'react-icons/fi'
import './AuthRequiredModal.css'

const AuthRequiredModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleLogin = () => {
    onClose()
    navigate('/login', { state: { from: '/reservar' } })
  }

  const handleRegister = () => {
    onClose()
    navigate('/registro', { state: { from: '/reservar' } })
  }

  return (
    <div className="modal-overlay-auth" onClick={onClose}>
      <div className="modal-content-auth" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-auth" onClick={onClose}>
          <FiX />
        </button>

        {/* Decorative Elements */}
        <div className="auth-modal-decoration">
          <div className="sparkle sparkle-1">✨</div>
          <div className="sparkle sparkle-2">💫</div>
          <div className="sparkle sparkle-3">⭐</div>
        </div>

        {/* Icon */}
        <div className="auth-modal-icon">
          <FiHeart />
        </div>

        {/* Content */}
        <div className="auth-modal-content">
          <h2 className="auth-modal-title">
            ¡Queremos conocerte mejor! 💜
          </h2>
          <p className="auth-modal-description">
            Para brindarte la mejor experiencia y mantener el registro de tus citas, 
            necesitamos que crees una cuenta o inicies sesión.
          </p>

          {/* Benefits */}
          <div className="auth-benefits">
            <div className="benefit-item">
              <div className="benefit-icon">✓</div>
              <span>Historial de todas tus citas</span>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">✓</div>
              <span>Reprogramación fácil y rápida</span>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">✓</div>
              <span>Información guardada para futuras reservas</span>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">✓</div>
              <span>Acceso a promociones exclusivas</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="auth-modal-actions">
            <button className="btn-auth-primary" onClick={handleRegister}>
              <FiUser />
              Crear Cuenta
            </button>
            <button className="btn-auth-secondary" onClick={handleLogin}>
              <FiLock />
              Ya tengo cuenta
            </button>
          </div>

          <p className="auth-modal-footer">
            ¡Es rápido y gratuito! 💝
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthRequiredModal