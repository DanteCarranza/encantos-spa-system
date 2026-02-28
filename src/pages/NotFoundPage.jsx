import React from 'react'
import { Link } from 'react-router-dom'
import { FiHome, FiArrowLeft } from 'react-icons/fi'
import './NotFoundPage.css'

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-illustration">
          <h1 className="error-code">404</h1>
          <div className="error-emoji">🔍</div>
        </div>
        
        <h2 className="not-found-title">Página no encontrada</h2>
        <p className="not-found-description">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            <FiHome />
            Ir al inicio
          </Link>
          <button 
            className="btn btn-outline" 
            onClick={() => window.history.back()}
          >
            <FiArrowLeft />
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage