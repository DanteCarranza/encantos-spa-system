import React from 'react'
import { FiInbox } from 'react-icons/fi'
import './EmptyState.css'

const EmptyState = ({ 
  icon: Icon = FiInbox, 
  title = 'No hay resultados', 
  description = 'No se encontraron elementos para mostrar.',
  action
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && (
        <div className="empty-state-action">
          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState