import React from 'react'
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi'
import './Alert.css'

const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  const icons = {
    success: <FiCheckCircle />,
    error: <FiAlertCircle />,
    warning: <FiAlertCircle />,
    info: <FiInfo />
  }

  return (
    <div className={`alert alert-${type} ${className}`}>
      <div className="alert-icon">
        {icons[type]}
      </div>
      <div className="alert-message">
        {message}
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose}>
          <FiX />
        </button>
      )}
    </div>
  )
}

export default Alert