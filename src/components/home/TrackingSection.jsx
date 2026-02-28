import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiCalendar, FiClock, FiCheckCircle, FiArrowRight } from 'react-icons/fi'
import './TrackingSection.css'

const TrackingSection = () => {
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (codigo.trim()) {
      // Redirigir a la página de seguimiento con el código
      navigate(`/seguimiento?codigo=${codigo.toUpperCase()}`)
    }
  }

  return (
    <section className="tracking-section">
      <div className="tracking-container">
        <div className="tracking-content">
          {/* Lado Izquierdo: Información */}
          <div className="tracking-info">
            <div className="tracking-icon-badge">
              <FiSearch />
            </div>
            <h2 className="tracking-title">
              ¿Ya tienes una reserva?
              <span className="gradient-text">Rastrea tu cita</span>
            </h2>
            <p className="tracking-description">
              Ingresa tu código de reserva para ver el estado en tiempo real de tu cita
            </p>

            <div className="tracking-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <FiCheckCircle />
                </div>
                <div className="feature-text">
                  <strong>Estado actualizado</strong>
                  <span>Ve si tu cita está confirmada</span>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <FiCalendar />
                </div>
                <div className="feature-text">
                  <strong>Reprograma fácilmente</strong>
                  <span>Cambia la fecha si lo necesitas</span>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <FiClock />
                </div>
                <div className="feature-text">
                  <strong>Historial completo</strong>
                  <span>Revisa todos los cambios</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Formulario */}
          <div className="tracking-form-wrapper">
            <div className="tracking-form-card">
              <div className="form-header">
                <h3>Consultar Reserva</h3>
                <p>Ingresa tu código para ver el estado</p>
              </div>

              <form onSubmit={handleSubmit} className="tracking-form">
                <div className="form-group">
                  <label htmlFor="codigo">Código de Reserva</label>
                  <div className="input-with-icon">
                    <FiSearch className="input-icon" />
                    <input
                      type="text"
                      id="codigo"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                      placeholder="SPA-20260212-XXX"
                      className="form-input"
                      required
                    />
                  </div>
                  <span className="input-hint">
                    Formato: SPA-YYYY-XXXXXX
                  </span>
                </div>

                <button type="submit" className="btn-track">
                  <FiSearch />
                  Consultar Reserva
                  <FiArrowRight />
                </button>
              </form>

              <div className="form-footer">
                <p className="help-text">
                  ¿No encuentras tu código? 
                  <a href="mailto:contacto@encantos.pe"> Contáctanos</a>
                </p>
              </div>
            </div>

            {/* Ilustración decorativa */}
            <div className="tracking-illustration">
              <div className="illustration-circle circle-1"></div>
              <div className="illustration-circle circle-2"></div>
              <div className="illustration-circle circle-3"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TrackingSection