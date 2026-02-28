import React from 'react'
import './Loading.css'

const Loading = ({ fullScreen = false, message = 'Cargando...' }) => {
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className="loading-content">
          <div className="spinner-large"></div>
          <p className="loading-message">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="loading-container">
      <div className="spinner"></div>
      {message && <p className="loading-text">{message}</p>}
    </div>
  )
}

export default Loading