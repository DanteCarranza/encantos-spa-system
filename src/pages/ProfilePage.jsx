import React, { useState, useEffect } from 'react'
import { 
  FiUser, 
  FiCalendar, 
  FiDollarSign, 
  FiSettings,
  FiEdit,
  FiCamera,
  FiLogOut,
  FiBarChart2
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import profileService from '../services/profileService'
import myBookingsService from '../services/myBookingsService'
import EditProfileModal from '../components/profile/EditProfileModal'
import ChangePasswordModal from '../components/profile/ChangePasswordModal'
import BookingCard from '../components/profile/BookingCard'
import Swal from 'sweetalert2'
import './ProfilePage.css'

const ProfilePage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('perfil')
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [bookings, setBookings] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [creditos, setCreditos] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [bookingsFilter, setBookingsFilter] = useState('all')

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    if (activeTab === 'citas') {
      loadBookings()
    } else if (activeTab === 'estadisticas') {
      loadEstadisticas()
    } else if (activeTab === 'creditos') {
      loadCreditos()
    }
  }, [activeTab, bookingsFilter])

  const loadProfile = async () => {
    setLoading(true)
    const result = await profileService.getPerfil()
    setLoading(false)

    if (result.success) {
      setProfile(result.data)
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el perfil',
        confirmButtonColor: '#d946ef'
      })
    }
  }

  const loadBookings = async () => {
    const result = await myBookingsService.getMisReservas(bookingsFilter)
    if (result.success) {
      setBookings(result.data)
    }
  }

  const loadEstadisticas = async () => {
    const result = await profileService.getEstadisticas()
    if (result.success) {
      setEstadisticas(result.data)
    }
  }

  const loadCreditos = async () => {
    const result = await profileService.getCreditos()
    if (result.success) {
      setCreditos(result.data)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validar tamaño
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'warning',
        title: 'Archivo muy grande',
        text: 'La imagen no debe superar 5MB',
        confirmButtonColor: '#d946ef'
      })
      return
    }

    // Subir
    Swal.fire({
      title: 'Subiendo imagen...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    const result = await profileService.subirAvatar(file)

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: '¡Foto actualizada!',
        text: 'Tu foto de perfil ha sido actualizada',
        confirmButtonColor: '#d946ef'
      })
      loadProfile()
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.message || 'No se pudo subir la imagen',
        confirmButtonColor: '#d946ef'
      })
    }
  }

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Tendrás que volver a iniciar sesión',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d946ef'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
        navigate('/login')
      }
    })
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (price) => {
    return `S/ ${parseFloat(price || 0).toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner-large"></div>
        <p>Cargando perfil...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="profile-error">
        <p>No se pudo cargar el perfil</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header con Avatar */}
        <div className="profile-header">
          <div className="profile-header-bg"></div>
          <div className="profile-header-content">
            <div className="avatar-section">
              <div className="avatar-wrapper">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.nombre_completo} className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder">
                    {profile.nombre_completo.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                )}
                <label htmlFor="avatar-upload" className="avatar-upload-btn">
                  <FiCamera />
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <div className="profile-info">
                <h1 className="profile-name">{profile.nombre_completo}</h1>
                <p className="profile-email">{profile.email}</p>
                <div className="profile-badges">
                  <span className="badge">Cliente desde {new Date(profile.fecha_registro).getFullYear()}</span>
                  {profile.puntos_fidelidad > 0 && (
                    <span className="badge badge-gold">⭐ {profile.puntos_fidelidad} puntos</span>
                  )}
                </div>
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              <FiLogOut />
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-icon primary">
              <FiCalendar />
            </div>
            <div className="stat-content">
              <span className="stat-value">{profile.estadisticas.total_citas}</span>
              <span className="stat-label">Citas Totales</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon success">
              <FiBarChart2 />
            </div>
            <div className="stat-content">
              <span className="stat-value">{profile.estadisticas.citas_completadas}</span>
              <span className="stat-label">Completadas</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon warning">
              <FiDollarSign />
            </div>
            <div className="stat-content">
              <span className="stat-value">{formatPrice(profile.estadisticas.total_gastado)}</span>
              <span className="stat-label">Total Invertido</span>
            </div>
          </div>
          
          {profile.estadisticas.valoracion_promedio && (
            <div className="stat-card">
              <div className="stat-icon gold">
                ⭐
              </div>
              <div className="stat-content">
                <span className="stat-value">{profile.estadisticas.valoracion_promedio}</span>
                <span className="stat-label">Valoración Promedio</span>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'perfil' ? 'active' : ''}`}
            onClick={() => setActiveTab('perfil')}
          >
            <FiUser />
            Mi Información
          </button>
          <button
            className={`tab-btn ${activeTab === 'citas' ? 'active' : ''}`}
            onClick={() => setActiveTab('citas')}
          >
            <FiCalendar />
            Mis Citas
          </button>
          <button
            className={`tab-btn ${activeTab === 'creditos' ? 'active' : ''}`}
            onClick={() => setActiveTab('creditos')}
          >
            <FiDollarSign />
            Mis Créditos
          </button>
          <button
            className={`tab-btn ${activeTab === 'estadisticas' ? 'active' : ''}`}
            onClick={() => setActiveTab('estadisticas')}
          >
            <FiBarChart2 />
            Estadísticas
          </button>
          <button
            className={`tab-btn ${activeTab === 'configuracion' ? 'active' : ''}`}
            onClick={() => setActiveTab('configuracion')}
          >
            <FiSettings />
            Configuración
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {/* Tab: Mi Información */}
          {activeTab === 'perfil' && (
            <div className="tab-panel">
              <div className="panel-header">
                <h2>Información Personal</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowEditModal(true)}>
                  <FiEdit />
                  Editar
                </button>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Nombre Completo</span>
                  <span className="info-value">{profile.nombre_completo}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{profile.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Teléfono</span>
                  <span className="info-value">{profile.telefono}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Fecha de Nacimiento</span>
                  <span className="info-value">{profile.fecha_nacimiento ? formatDate(profile.fecha_nacimiento) : 'No especificada'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Género</span>
                  <span className="info-value">{profile.genero || 'No especificado'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Distrito</span>
                  <span className="info-value">{profile.distrito || 'No especificado'}</span>
                </div>
              </div>

              {profile.direccion && (
                <div className="info-section">
                  <h3>Dirección</h3>
                  <p>{profile.direccion}</p>
                </div>
              )}

              {profile.preferencias && (
                <div className="info-section">
                  <h3>Preferencias de Servicio</h3>
                  <div className="preferences-grid">
                    {profile.preferencias.servicio_favorito_nombre && (
                      <div className="pref-item">
                        <span className="pref-label">Servicio Favorito:</span>
                        <span className="pref-value">{profile.preferencias.servicio_favorito_nombre}</span>
                      </div>
                    )}
                    {profile.preferencias.terapeuta_preferido_nombre && (
                      <div className="pref-item">
                        <span className="pref-label">Terapeuta Preferido:</span>
                        <span className="pref-value">{profile.preferencias.terapeuta_preferido_nombre}</span>
                      </div>
                    )}
                    {profile.preferencias.horario_preferido && (
                      <div className="pref-item">
                        <span className="pref-label">Horario Preferido:</span>
                        <span className="pref-value">{profile.preferencias.horario_preferido}</span>
                      </div>
                    )}
                  </div>

                  {(profile.preferencias.alergias || profile.preferencias.condiciones_medicas) && (
                    <div className="medical-info">
                      {profile.preferencias.alergias && (
                        <div className="medical-item">
                          <strong>Alergias:</strong>
                          <p>{profile.preferencias.alergias}</p>
                        </div>
                      )}
                      {profile.preferencias.condiciones_medicas && (
                        <div className="medical-item">
                          <strong>Condiciones Médicas:</strong>
                          <p>{profile.preferencias.condiciones_medicas}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab: Mis Citas */}
          {activeTab === 'citas' && (
            <div className="tab-panel">
              <div className="panel-header">
                <h2>Historial de Citas</h2>
                <div className="filter-buttons">
                  <button
                    className={`filter-btn ${bookingsFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setBookingsFilter('all')}
                  >
                    Todas
                  </button>
                  <button
                    className={`filter-btn ${bookingsFilter === 'pendiente' ? 'active' : ''}`}
                    onClick={() => setBookingsFilter('pendiente')}
                  >
                    Pendientes
                  </button>
                  <button
                    className={`filter-btn ${bookingsFilter === 'confirmada' ? 'active' : ''}`}
                    onClick={() => setBookingsFilter('confirmada')}
                  >
                    Confirmadas
                  </button>
                  <button
                    className={`filter-btn ${bookingsFilter === 'completada' ? 'active' : ''}`}
                    onClick={() => setBookingsFilter('completada')}
                  >
                    Completadas
                  </button>
                </div>
              </div>

              <div className="bookings-list">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking}
                      onUpdate={loadBookings}
                    />
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <h3>No tienes citas</h3>
                    <p>Reserva tu próximo servicio de spa</p>
                    <button className="btn btn-primary" onClick={() => navigate('/servicios')}>
                      Ver Servicios
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

       {/* Tab: Mis Créditos */}
       {activeTab === 'creditos' && (
            <div className="tab-panel">
              <div className="panel-header">
                <h2>Mis Créditos Disponibles</h2>
              </div>

              {creditos ? (
                <>
                  <div className="credits-summary">
                    <div className="credit-total-card">
                      <div className="credit-icon">💰</div>
                      <div className="credit-info">
                        <span className="credit-label">Total Disponible</span>
                        <span className="credit-amount">{formatPrice(creditos.total_disponible)}</span>
                      </div>
                    </div>
                    <div className="credit-info-box">
                      <p>Estos créditos se generan por cancelaciones y pueden usarse en futuras reservas.</p>
                      <p className="text-muted">Los créditos tienen una validez de 6 meses desde su generación.</p>
                    </div>
                  </div>

                  {creditos.creditos.length > 0 ? (
                    <div className="credits-list">
                      {creditos.creditos.map((credito) => (
                        <div key={credito.id} className="credit-card">
                          <div className="credit-card-header">
                            <div className="credit-card-icon">🎫</div>
                            <div className="credit-card-info">
                              <span className="credit-card-amount">{formatPrice(credito.monto_disponible)}</span>
                              <span className="credit-card-label">Disponible</span>
                            </div>
                          </div>
                          <div className="credit-card-body">
                            <div className="credit-detail">
                              <span className="detail-label">Motivo:</span>
                              <span className="detail-value">{credito.motivo}</span>
                            </div>
                            {credito.monto_usado > 0 && (
                              <div className="credit-detail">
                                <span className="detail-label">Usado:</span>
                                <span className="detail-value">{formatPrice(credito.monto_usado)}</span>
                              </div>
                            )}
                            <div className="credit-detail">
                              <span className="detail-label">Vence:</span>
                              <span className="detail-value expiry">
                                {new Date(credito.fecha_vencimiento).toLocaleDateString('es-PE')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">💳</div>
                      <h3>No tienes créditos</h3>
                      <p>Los créditos se generan al cancelar reservas con anticipación</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="loading-content">
                  <div className="spinner-small"></div>
                  <p>Cargando créditos...</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Estadísticas */}
          {activeTab === 'estadisticas' && (
            <div className="tab-panel">
              <div className="panel-header">
                <h2>Mis Estadísticas</h2>
              </div>

              {estadisticas ? (
                <>
                  {/* Resumen General */}
                  <div className="stats-grid">
                    <div className="stats-card">
                      <div className="stats-icon primary">
                        <FiCalendar />
                      </div>
                      <div className="stats-content">
                        <span className="stats-value">{estadisticas.resumen.total_reservas}</span>
                        <span className="stats-label">Total de Reservas</span>
                      </div>
                    </div>

                    <div className="stats-card">
                      <div className="stats-icon success">
                        ✓
                      </div>
                      <div className="stats-content">
                        <span className="stats-value">{estadisticas.resumen.completadas}</span>
                        <span className="stats-label">Completadas</span>
                      </div>
                    </div>

                    <div className="stats-card">
                      <div className="stats-icon warning">
                        ⏱️
                      </div>
                      <div className="stats-content">
                        <span className="stats-value">{estadisticas.resumen.proximas}</span>
                        <span className="stats-label">Próximas Citas</span>
                      </div>
                    </div>

                    <div className="stats-card">
                      <div className="stats-icon danger">
                        ✕
                      </div>
                      <div className="stats-content">
                        <span className="stats-value">{estadisticas.resumen.canceladas}</span>
                        <span className="stats-label">Canceladas</span>
                      </div>
                    </div>
                  </div>

                  {/* Servicio Favorito */}
                  {estadisticas.servicio_favorito && (
                    <div className="favorite-service-card">
                      <h3>Tu Servicio Favorito</h3>
                      <div className="favorite-service-content">
                        <div className="favorite-icon">⭐</div>
                        <div className="favorite-info">
                          <span className="favorite-name">{estadisticas.servicio_favorito.nombre}</span>
                          <span className="favorite-count">
                            Lo has usado {estadisticas.servicio_favorito.veces_usado} {estadisticas.servicio_favorito.veces_usado === 1 ? 'vez' : 'veces'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gasto por Mes */}
                  {estadisticas.gasto_por_mes && estadisticas.gasto_por_mes.length > 0 && (
                    <div className="monthly-spending">
                      <h3>Historial de Gastos (Últimos 6 meses)</h3>
                      <div className="spending-chart">
                        {estadisticas.gasto_por_mes.map((mes) => {
                          const maxTotal = Math.max(...estadisticas.gasto_por_mes.map(m => m.total))
                          const height = (mes.total / maxTotal) * 100
                          
                          return (
                            <div key={mes.mes} className="spending-bar-wrapper">
                              <div className="spending-bar-container">
                                <div 
                                  className="spending-bar"
                                  style={{ height: `${height}%` }}
                                  title={`${formatPrice(mes.total)} - ${mes.citas} citas`}
                                >
                                  <span className="spending-value">{formatPrice(mes.total)}</span>
                                </div>
                              </div>
                              <span className="spending-label">
                                {new Date(mes.mes + '-01').toLocaleDateString('es-PE', { month: 'short' })}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Total Invertido */}
                  <div className="total-invested-card">
                    <div className="invested-icon">💎</div>
                    <div className="invested-content">
                      <span className="invested-label">Total Invertido en tu Bienestar</span>
                      <span className="invested-amount">{formatPrice(estadisticas.resumen.total_gastado)}</span>
                    </div>
                  </div>

                  {estadisticas.resumen.ultima_cita && (
                    <div className="last-visit">
                      <p>Tu última visita fue el {formatDate(estadisticas.resumen.ultima_cita)}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="loading-content">
                  <div className="spinner-small"></div>
                  <p>Cargando estadísticas...</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Configuración */}
          {activeTab === 'configuracion' && (
            <div className="tab-panel">
              <div className="panel-header">
                <h2>Configuración de Cuenta</h2>
              </div>

              {/* Seguridad */}
              <div className="config-section">
                <h3>Seguridad</h3>
                <div className="config-item">
                  <div className="config-item-info">
                    <span className="config-item-title">Contraseña</span>
                    <span className="config-item-desc">Cambia tu contraseña regularmente para mantener tu cuenta segura</span>
                  </div>
                  <button className="btn btn-secondary" onClick={() => setShowPasswordModal(true)}>
                    Cambiar Contraseña
                  </button>
                </div>
              </div>

              {/* Notificaciones */}
              <div className="config-section">
                <h3>Preferencias de Notificación</h3>
                <div className="config-item">
                  <div className="config-item-info">
                    <span className="config-item-title">Email</span>
                    <span className="config-item-desc">Recibe recordatorios y confirmaciones por email</span>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={profile.preferencias_notificacion?.email || false}
                      onChange={(e) => {
                        const newPrefs = {
                          ...profile.preferencias_notificacion,
                          email: e.target.checked
                        }
                        handleUpdateNotifications(newPrefs)
                      }}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="config-item">
                  <div className="config-item-info">
                    <span className="config-item-title">WhatsApp</span>
                    <span className="config-item-desc">Recibe notificaciones por WhatsApp</span>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={profile.preferencias_notificacion?.whatsapp || false}
                      onChange={(e) => {
                        const newPrefs = {
                          ...profile.preferencias_notificacion,
                          whatsapp: e.target.checked
                        }
                        handleUpdateNotifications(newPrefs)
                      }}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="config-item">
                  <div className="config-item-info">
                    <span className="config-item-title">SMS</span>
                    <span className="config-item-desc">Recibe recordatorios por mensaje de texto</span>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={profile.preferencias_notificacion?.sms || false}
                      onChange={(e) => {
                        const newPrefs = {
                          ...profile.preferencias_notificacion,
                          sms: e.target.checked
                        }
                        handleUpdateNotifications(newPrefs)
                      }}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              {/* Marketing */}
              <div className="config-section">
                <h3>Marketing</h3>
                <div className="config-item">
                  <div className="config-item-info">
                    <span className="config-item-title">Ofertas y Promociones</span>
                    <span className="config-item-desc">Recibe ofertas especiales y promociones exclusivas</span>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={profile.acepta_marketing || false}
                      onChange={(e) => handleUpdateMarketing(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              {/* Zona de Peligro */}
              <div className="config-section danger-zone">
                <h3>Zona de Peligro</h3>
                <div className="config-item">
                  <div className="config-item-info">
                    <span className="config-item-title">Eliminar Cuenta</span>
                    <span className="config-item-desc">Elimina permanentemente tu cuenta y todos tus datos</span>
                  </div>
                  <button className="btn btn-danger" onClick={handleDeleteAccount}>
                    Eliminar Cuenta
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onSuccess={() => {
          setShowEditModal(false)
          loadProfile()
        }}
      />

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => setShowPasswordModal(false)}
      />
    </div>
  )

  // Funciones auxiliares del componente
  async function handleUpdateNotifications(newPrefs) {
    const result = await profileService.actualizarInformacion({
      preferencias_notificacion: newPrefs
    })

    if (result.success) {
      setProfile({
        ...profile,
        preferencias_notificacion: newPrefs
      })
      Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: 'Preferencias de notificación actualizadas',
        timer: 2000,
        showConfirmButton: false
      })
    }
  }

  async function handleUpdateMarketing(value) {
    const result = await profileService.actualizarInformacion({
      acepta_marketing: value
    })

    if (result.success) {
      setProfile({
        ...profile,
        acepta_marketing: value
      })
      Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: 'Preferencias actualizadas',
        timer: 2000,
        showConfirmButton: false
      })
    }
  }

  function handleDeleteAccount() {
    Swal.fire({
      title: '⚠️ Eliminar Cuenta',
      html: `
        <p>Esta acción es <strong>irreversible</strong>.</p>
        <p>Se eliminarán todos tus datos, historial y créditos.</p>
        <br>
        <p>Escribe <strong>ELIMINAR</strong> para confirmar:</p>
      `,
      input: 'text',
      inputPlaceholder: 'Escribe ELIMINAR',
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      preConfirm: (text) => {
        if (text !== 'ELIMINAR') {
          Swal.showValidationMessage('Debes escribir ELIMINAR exactamente')
          return false
        }
        return true
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Pedir contraseña
        Swal.fire({
          title: 'Confirma tu contraseña',
          input: 'password',
          inputPlaceholder: 'Ingresa tu contraseña',
          showCancelButton: true,
          confirmButtonText: 'Eliminar Cuenta',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#ef4444',
          preConfirm: async (password) => {
            const result = await profileService.eliminarCuenta(password, 'ELIMINAR')
            if (!result.success) {
              Swal.showValidationMessage(result.message)
              return false
            }
            return true
          }
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              icon: 'success',
              title: 'Cuenta Eliminada',
              text: 'Tu cuenta ha sido eliminada exitosamente',
              confirmButtonColor: '#d946ef'
            }).then(() => {
              localStorage.removeItem('authToken')
              localStorage.removeItem('userData')
              navigate('/')
            })
          }
        })
      }
    })
  }
}

export default ProfilePage