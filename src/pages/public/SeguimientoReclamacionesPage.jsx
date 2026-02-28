import React, { useState } from 'react'
import { FiSearch, FiFileText, FiClock, FiCheckCircle, FiAlertCircle, FiX, FiCalendar, FiUser, FiMail, FiPhone } from 'react-icons/fi'
import reclamacionesService from '../../services/reclamacionesService'
import Swal from 'sweetalert2'
import './SeguimientoReclamacionesPage.css'

const SeguimientoReclamacionesPage = () => {
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [reclamacion, setReclamacion] = useState(null)
  const [notFound, setNotFound] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()

    if (!codigo.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Código Requerido',
        text: 'Por favor ingrese su código de seguimiento',
        confirmButtonColor: '#dc2626'
      })
      return
    }

    setLoading(true)
    setNotFound(false)
    setReclamacion(null)

    try {
      const result = await reclamacionesService.consultarReclamacion(codigo.trim())

      if (result.success) {
        setReclamacion(result.data)
      } else {
        setNotFound(true)
        Swal.fire({
          icon: 'error',
          title: 'No Encontrado',
          text: 'No se encontró ninguna reclamación con ese código',
          confirmButtonColor: '#dc2626'
        })
      }
    } catch (error) {
      console.error('Error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error de conexión. Por favor intente nuevamente.',
        confirmButtonColor: '#dc2626'
      })
    } finally {
      setLoading(false)
    }
  }

  const getEstadoInfo = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return {
          icon: <FiClock />,
          color: '#f59e0b',
          bg: '#fef3c7',
          text: 'Pendiente de Revisión',
          description: 'Su reclamación ha sido recibida y está en espera de revisión por nuestro equipo.'
        }
      case 'EN_PROCESO':
        return {
          icon: <FiAlertCircle />,
          color: '#3b82f6',
          bg: '#dbeafe',
          text: 'En Proceso',
          description: 'Estamos analizando su caso y trabajando en una solución.'
        }
      case 'RESUELTO':
        return {
          icon: <FiCheckCircle />,
          color: '#16a34a',
          bg: '#dcfce7',
          text: 'Resuelto',
          description: 'Su reclamación ha sido resuelta. Revise nuestra respuesta a continuación.'
        }
      case 'CERRADO':
        return {
          icon: <FiX />,
          color: '#6b7280',
          bg: '#f3f4f6',
          text: 'Cerrado',
          description: 'Este caso ha sido cerrado.'
        }
      default:
        return {
          icon: <FiFileText />,
          color: '#9ca3af',
          bg: '#f9fafb',
          text: estado,
          description: ''
        }
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysElapsed = (dateString) => {
    const now = new Date()
    const created = new Date(dateString)
    const diff = Math.floor((now - created) / (1000 * 60 * 60 * 24))
    return diff
  }

  const resetSearch = () => {
    setCodigo('')
    setReclamacion(null)
    setNotFound(false)
  }

  return (
    <div className="seguimiento-page">
      <div className="seguimiento-container">
        {/* Header */}
        <div className="seguimiento-header">
          <div className="header-icon-large">
            <FiSearch />
          </div>
          <h1>Seguimiento de Reclamaciones</h1>
          <p className="header-subtitle">
            Consulte el estado de su reclamación ingresando su código de seguimiento
          </p>
        </div>

        {/* Search Form */}
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <FiFileText className="input-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Ej: REC-2026-00001"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                maxLength={20}
              />
            </div>
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Buscando...
                </>
              ) : (
                <>
                  <FiSearch />
                  Buscar Reclamación
                </>
              )}
            </button>
          </form>

          <div className="search-hint">
            <FiAlertCircle />
            <p>
              El código de seguimiento le fue enviado por correo electrónico cuando registró su reclamación.
            </p>
          </div>
        </div>

        {/* Results */}
        {reclamacion && (
          <div className="result-section">
            {/* Status Card */}
            <div className="status-card" style={{ borderColor: getEstadoInfo(reclamacion.estado).color }}>
              <div className="status-header">
                <div className="status-icon" style={{ 
                  backgroundColor: getEstadoInfo(reclamacion.estado).bg,
                  color: getEstadoInfo(reclamacion.estado).color 
                }}>
                  {getEstadoInfo(reclamacion.estado).icon}
                </div>
                <div className="status-info">
                  <h2 className="status-title">{getEstadoInfo(reclamacion.estado).text}</h2>
                  <p className="status-description">{getEstadoInfo(reclamacion.estado).description}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="timeline-card">
              <h3 className="section-title">
                <FiClock />
                Línea de Tiempo
              </h3>
              <div className="timeline">
                <div className="timeline-item completed">
                  <div className="timeline-marker">
                    <FiCheckCircle />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">Reclamación Registrada</div>
                    <div className="timeline-date">{formatDate(reclamacion.fecha_creacion)}</div>
                    <div className="timeline-days">Hace {getDaysElapsed(reclamacion.fecha_creacion)} días</div>
                  </div>
                </div>

                {reclamacion.estado === 'EN_PROCESO' && (
                  <div className="timeline-item active">
                    <div className="timeline-marker">
                      <FiAlertCircle />
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">En Análisis</div>
                      <div className="timeline-date">En proceso</div>
                      <div className="timeline-days">Nuestro equipo está trabajando en su caso</div>
                    </div>
                  </div>
                )}

                {reclamacion.fecha_respuesta && (
                  <div className="timeline-item completed">
                    <div className="timeline-marker">
                      <FiCheckCircle />
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">Respuesta Enviada</div>
                      <div className="timeline-date">{formatDate(reclamacion.fecha_respuesta)}</div>
                      <div className="timeline-days">
                        Tiempo de respuesta: {getDaysElapsed(reclamacion.fecha_creacion) - getDaysElapsed(reclamacion.fecha_respuesta)} días
                      </div>
                    </div>
                  </div>
                )}

                {!reclamacion.fecha_respuesta && (
                  <div className="timeline-item pending">
                    <div className="timeline-marker">
                      <FiClock />
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">Esperando Respuesta</div>
                      <div className="timeline-date">
                        {15 - getDaysElapsed(reclamacion.fecha_creacion) > 0 
                          ? `Respuesta estimada en ${15 - getDaysElapsed(reclamacion.fecha_creacion)} días`
                          : 'Procesando respuesta'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="details-grid">
              <div className="detail-card">
                <div className="detail-icon">
                  <FiFileText />
                </div>
                <div className="detail-content">
                  <div className="detail-label">Código</div>
                  <div className="detail-value code">{reclamacion.codigo_reclamo}</div>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-icon">
                  <FiUser />
                </div>
                <div className="detail-content">
                  <div className="detail-label">Titular</div>
                  <div className="detail-value">{reclamacion.nombre} {reclamacion.primer_apellido}</div>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-icon">
                  <FiCalendar />
                </div>
                <div className="detail-content">
                  <div className="detail-label">Tipo</div>
                  <div className="detail-value">
                    {reclamacion.tipo_reclamo === 'RECLAMACION' ? '📋 Reclamación' : '💬 Queja'}
                  </div>
                </div>
              </div>
            </div>

            {/* Response */}
            {reclamacion.respuesta && (
              <div className="response-card">
                <h3 className="section-title">
                  <FiCheckCircle />
                  Nuestra Respuesta
                </h3>
                <div className="response-date">
                  Respondido el {formatDate(reclamacion.fecha_respuesta)}
                </div>
                <div className="response-content">
                  {reclamacion.respuesta}
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="contact-card">
              <h3 className="section-title">
                <FiMail />
                ¿Necesita más información?
              </h3>
              <p className="contact-text">
                Si tiene alguna consulta adicional sobre su reclamación, puede contactarnos:
              </p>
              <div className="contact-methods">
                <div className="contact-item">
                  <FiPhone />
                  <span>+51 913 516 004</span>
                </div>
                <div className="contact-item">
                  <FiMail />
                  <span>contacto@encantos.pe</span>
                </div>
              </div>
            </div>

            {/* New Search Button */}
            <div className="action-buttons">
              <button className="btn-new-search" onClick={resetSearch}>
                <FiSearch />
                Buscar Otra Reclamación
              </button>
            </div>
          </div>
        )}

        {/* Info Cards */}
        {!reclamacion && !loading && (
          <div className="info-cards">
            <div className="info-card">
              <div className="info-card-icon">
                <FiFileText />
              </div>
              <h3>¿Dónde encuentro mi código?</h3>
              <p>
                El código de seguimiento le fue enviado por correo electrónico cuando registró su reclamación.
                Revise su bandeja de entrada y spam.
              </p>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <FiClock />
              </div>
              <h3>Tiempo de Respuesta</h3>
              <p>
                Responderemos su reclamación en un plazo máximo de 15 días calendario, pudiendo extenderse
                hasta 30 días según la complejidad del caso.
              </p>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <FiCheckCircle />
              </div>
              <h3>Notificaciones</h3>
              <p>
                Le notificaremos por correo electrónico cuando su reclamación sea actualizada o respondida.
              </p>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="seguimiento-footer">
          <p>
            <strong>Instituto Nacional de Defensa de la Competencia y de la Protección de la Propiedad Intelectual (INDECOPI)</strong>
          </p>
          <p>Calle La Prosa 104, San Borja - Lima, Perú</p>
          <p>Teléfono: (01) 224-7777 / 0800-4-4040 (línea gratuita)</p>
          <p>Sitio web: <a href="https://www.indecopi.gob.pe" target="_blank" rel="noopener noreferrer">www.indecopi.gob.pe</a></p>
        </div>
      </div>
    </div>
  )
}

export default SeguimientoReclamacionesPage