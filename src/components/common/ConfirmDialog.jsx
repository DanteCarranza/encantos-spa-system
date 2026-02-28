import React from 'react'
import Modal from './Modal'
import { FiAlertCircle } from 'react-icons/fi'
import './ConfirmDialog.css'

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message = '¿Estás seguro de que deseas continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger' // danger, warning, info
}) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>
            {cancelText}
          </button>
          <button 
            className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <div className={`confirm-dialog-content confirm-${type}`}>
        <FiAlertCircle className="confirm-icon" />
        <p className="confirm-message">{message}</p>
      </div>
    </Modal>
  )
}

export default ConfirmDialog