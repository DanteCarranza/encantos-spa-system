import React, { useState } from 'react'
import {
  FiSettings,
  FiSave,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiGlobe,
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiImage,
  FiDollarSign,
  FiCalendar,
  FiAlertCircle,
  FiBell,
  FiLock,
  FiDatabase,
  FiDownload,
  FiUpload,
  FiRefreshCw,
  FiCheckCircle
} from 'react-icons/fi'
import Swal from 'sweetalert2'
import './AdminSettingsPage.css'

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    spa_name: 'Mi Spa de Belleza',
    spa_slogan: 'Tu Oasis de Tranquilidad',
    email: 'contacto@mispa.com',
    phone: '987654321',
    address: 'Av. Principal 123, San Isidro, Lima',
    website: 'www.mispa.com',
    tax_id: '20123456789',
    logo_url: ''
  })

  // Business Hours
  const [businessHours, setBusinessHours] = useState({
    monday: { open: '09:00', close: '20:00', enabled: true },
    tuesday: { open: '09:00', close: '20:00', enabled: true },
    wednesday: { open: '09:00', close: '20:00', enabled: true },
    thursday: { open: '09:00', close: '20:00', enabled: true },
    friday: { open: '09:00', close: '20:00', enabled: true },
    saturday: { open: '10:00', close: '18:00', enabled: true },
    sunday: { open: '00:00', close: '00:00', enabled: false }
  })

  // Social Media
  const [socialMedia, setSocialMedia] = useState({
    facebook: 'https://facebook.com/mispa',
    instagram: 'https://instagram.com/mispa',
    twitter: 'https://twitter.com/mispa',
    whatsapp: '+51987654321'
  })

  // Appointment Settings
  const [appointmentSettings, setAppointmentSettings] = useState({
    min_advance_hours: 2,
    max_advance_days: 30,
    cancellation_hours: 24,
    slot_duration: 15,
    auto_confirm: false,
    require_deposit: false,
    deposit_percentage: 20
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    confirm_appointment: true,
    remind_24h: true,
    remind_2h: false,
    cancellation_notice: true,
    new_appointment_admin: true
  })

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    accept_cash: true,
    accept_card: true,
    accept_transfer: true,
    currency: 'PEN',
    tax_rate: 18
  })

  const dayLabels = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  }

  const handleGeneralChange = (e) => {
    const { name, value } = e.target
    setGeneralSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBusinessHoursChange = (day, field, value) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target
    setSocialMedia(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAppointmentChange = (e) => {
    const { name, value, type, checked } = e.target
    setAppointmentSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target
    setPaymentSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSaveSettings = async () => {
    setSaving(true)

    // Simular guardado
    setTimeout(() => {
      setSaving(false)
      Swal.fire({
        icon: 'success',
        title: '¡Configuración Guardada!',
        text: 'Los cambios se han guardado correctamente',
        confirmButtonColor: '#d946ef',
        timer: 2000
      })
    }, 1000)
  }

  const handleBackup = () => {
    Swal.fire({
      icon: 'info',
      title: 'Creando Backup',
      text: 'Generando respaldo de la base de datos...',
      confirmButtonColor: '#d946ef',
      timer: 2000
    })
  }

  const handleRestore = () => {
    Swal.fire({
      icon: 'warning',
      title: '¿Restaurar Base de Datos?',
      text: 'Esta acción sobrescribirá los datos actuales',
      showCancelButton: true,
      confirmButtonText: 'Restaurar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d946ef',
      cancelButtonColor: '#6b7280'
    })
  }

  const tabs = [
    { id: 'general', label: 'General', icon: FiSettings },
    { id: 'hours', label: 'Horarios', icon: FiClock },
    { id: 'social', label: 'Redes Sociales', icon: FiGlobe },
    { id: 'appointments', label: 'Citas', icon: FiCalendar },
    { id: 'notifications', label: 'Notificaciones', icon: FiBell },
    { id: 'payments', label: 'Pagos', icon: FiDollarSign },
    { id: 'system', label: 'Sistema', icon: FiDatabase }
  ]

  return (
    <div className="admin-settings-page">
      {/* Header */}
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Configuración</h1>
          <p className="settings-subtitle">Personaliza tu sistema de gestión</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? (
            <>
              <FiRefreshCw className="spin" />
              Guardando...
            </>
          ) : (
            <>
              <FiSave />
              Guardar Cambios
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="settings-content">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="settings-section">
            <div className="section-header-settings">
              <h2><FiSettings /> Información General</h2>
              <p>Configura la información básica de tu spa</p>
            </div>

            <div className="settings-grid">
              <div className="setting-group full">
                <label className="setting-label">Nombre del Spa *</label>
                <input
                  type="text"
                  name="spa_name"
                  className="setting-input"
                  value={generalSettings.spa_name}
                  onChange={handleGeneralChange}
                  placeholder="Mi Spa de Belleza"
                />
              </div>

              <div className="setting-group full">
                <label className="setting-label">Eslogan</label>
                <input
                  type="text"
                  name="spa_slogan"
                  className="setting-input"
                  value={generalSettings.spa_slogan}
                  onChange={handleGeneralChange}
                  placeholder="Tu Oasis de Tranquilidad"
                />
              </div>

              <div className="setting-group">
                <label className="setting-label">Email de Contacto *</label>
                <div className="input-with-icon">
                  <FiMail />
                  <input
                    type="email"
                    name="email"
                    className="setting-input"
                    value={generalSettings.email}
                    onChange={handleGeneralChange}
                    placeholder="contacto@mispa.com"
                  />
                </div>
              </div>

              <div className="setting-group">
                <label className="setting-label">Teléfono *</label>
                <div className="input-with-icon">
                  <FiPhone />
                  <input
                    type="tel"
                    name="phone"
                    className="setting-input"
                    value={generalSettings.phone}
                    onChange={handleGeneralChange}
                    placeholder="987654321"
                  />
                </div>
              </div>

              <div className="setting-group full">
                <label className="setting-label">Dirección *</label>
                <div className="input-with-icon">
                  <FiMapPin />
                  <input
                    type="text"
                    name="address"
                    className="setting-input"
                    value={generalSettings.address}
                    onChange={handleGeneralChange}
                    placeholder="Av. Principal 123, San Isidro, Lima"
                  />
                </div>
              </div>

              <div className="setting-group">
                <label className="setting-label">Sitio Web</label>
                <div className="input-with-icon">
                  <FiGlobe />
                  <input
                    type="text"
                    name="website"
                    className="setting-input"
                    value={generalSettings.website}
                    onChange={handleGeneralChange}
                    placeholder="www.mispa.com"
                  />
                </div>
              </div>

              <div className="setting-group">
                <label className="setting-label">RUC</label>
                <input
                  type="text"
                  name="tax_id"
                  className="setting-input"
                  value={generalSettings.tax_id}
                  onChange={handleGeneralChange}
                  placeholder="20123456789"
                />
              </div>

              <div className="setting-group full">
                <label className="setting-label">URL del Logo</label>
                <div className="input-with-icon">
                  <FiImage />
                  <input
                    type="text"
                    name="logo_url"
                    className="setting-input"
                    value={generalSettings.logo_url}
                    onChange={handleGeneralChange}
                    placeholder="https://ejemplo.com/logo.png"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Business Hours */}
        {activeTab === 'hours' && (
          <div className="settings-section">
            <div className="section-header-settings">
              <h2><FiClock /> Horario de Atención</h2>
              <p>Define los horarios de operación de tu spa</p>
            </div>

            <div className="hours-list">
              {Object.keys(businessHours).map(day => (
                <div key={day} className="hour-item">
                  <div className="hour-header">
                    <label className="checkbox-label-settings">
                      <input
                        type="checkbox"
                        checked={businessHours[day].enabled}
                        onChange={(e) => handleBusinessHoursChange(day, 'enabled', e.target.checked)}
                      />
                      <span className="day-name">{dayLabels[day]}</span>
                    </label>
                  </div>
                  {businessHours[day].enabled ? (
                    <div className="hour-inputs">
                      <div className="time-input-group">
                        <label>Apertura</label>
                        <input
                          type="time"
                          value={businessHours[day].open}
                          onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                          className="time-input"
                        />
                      </div>
                      <span className="time-separator">-</span>
                      <div className="time-input-group">
                        <label>Cierre</label>
                        <input
                          type="time"
                          value={businessHours[day].close}
                          onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                          className="time-input"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="closed-label">
                      <FiAlertCircle />
                      <span>Cerrado</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Media */}
        {activeTab === 'social' && (
          <div className="settings-section">
            <div className="section-header-settings">
              <h2><FiGlobe /> Redes Sociales</h2>
              <p>Configura tus perfiles en redes sociales</p>
            </div>

            <div className="settings-grid">
              <div className="setting-group">
                <label className="setting-label">Facebook</label>
                <div className="input-with-icon">
                  <FiFacebook />
                  <input
                    type="text"
                    name="facebook"
                    className="setting-input"
                    value={socialMedia.facebook}
                    onChange={handleSocialMediaChange}
                    placeholder="https://facebook.com/mispa"
                  />
                </div>
              </div>

              <div className="setting-group">
                <label className="setting-label">Instagram</label>
                <div className="input-with-icon">
                  <FiInstagram />
                  <input
                    type="text"
                    name="instagram"
                    className="setting-input"
                    value={socialMedia.instagram}
                    onChange={handleSocialMediaChange}
                    placeholder="https://instagram.com/mispa"
                  />
                </div>
              </div>

              <div className="setting-group">
                <label className="setting-label">Twitter</label>
                <div className="input-with-icon">
                  <FiTwitter />
                  <input
                    type="text"
                    name="twitter"
                    className="setting-input"
                    value={socialMedia.twitter}
                    onChange={handleSocialMediaChange}
                    placeholder="https://twitter.com/mispa"
                  />
                </div>
              </div>

              <div className="setting-group">
                <label className="setting-label">WhatsApp</label>
                <div className="input-with-icon">
                  <FiPhone />
                  <input
                    type="text"
                    name="whatsapp"
                    className="setting-input"
                    value={socialMedia.whatsapp}
                    onChange={handleSocialMediaChange}
                    placeholder="+51987654321"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Settings */}
        {activeTab === 'appointments' && (
          <div className="settings-section">
            <div className="section-header-settings">
              <h2><FiCalendar /> Configuración de Citas</h2>
              <p>Define las reglas para las reservas</p>
            </div>

            <div className="settings-grid">
              <div className="setting-group">
                <label className="setting-label">Anticipación Mínima (horas)</label>
                <input
                  type="number"
                  name="min_advance_hours"
                  className="setting-input"
                  value={appointmentSettings.min_advance_hours}
                  onChange={handleAppointmentChange}
                  min="0"
                />
                <small className="setting-help">Horas mínimas para reservar con anticipación</small>
              </div>

              <div className="setting-group">
                <label className="setting-label">Anticipación Máxima (días)</label>
                <input
                  type="number"
                  name="max_advance_days"
                  className="setting-input"
                  value={appointmentSettings.max_advance_days}
                  onChange={handleAppointmentChange}
                  min="1"
                />
                <small className="setting-help">Días máximos para reservar por adelantado</small>
              </div>

              <div className="setting-group">
                <label className="setting-label">Cancelación Anticipada (horas)</label>
                <input
                  type="number"
                  name="cancellation_hours"
                  className="setting-input"
                  value={appointmentSettings.cancellation_hours}
                  onChange={handleAppointmentChange}
                  min="0"
                />
                <small className="setting-help">Horas mínimas para cancelar sin penalización</small>
              </div>

              <div className="setting-group">
                <label className="setting-label">Duración de Ranura (minutos)</label>
                <select
                  name="slot_duration"
                  className="setting-input"
                  value={appointmentSettings.slot_duration}
                  onChange={handleAppointmentChange}
                >
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="60">60 minutos</option>
                </select>
                <small className="setting-help">Intervalo de tiempo entre horarios disponibles</small>
              </div>

              <div className="setting-group full">
                <label className="checkbox-label-settings">
                  <input
                    type="checkbox"
                    name="auto_confirm"
                    checked={appointmentSettings.auto_confirm}
                    onChange={handleAppointmentChange}
                  />
                  <span>Confirmar citas automáticamente</span>
                </label>
                <small className="setting-help">Las citas se confirman sin intervención manual</small>
              </div>

              <div className="setting-group full">
                <label className="checkbox-label-settings">
                  <input
                    type="checkbox"
                    name="require_deposit"
                    checked={appointmentSettings.require_deposit}
                    onChange={handleAppointmentChange}
                  />
                  <span>Requerir depósito para confirmar</span>
                </label>
              </div>

              {appointmentSettings.require_deposit && (
                <div className="setting-group">
                  <label className="setting-label">Porcentaje de Depósito (%)</label>
                  <input
                    type="number"
                    name="deposit_percentage"
                    className="setting-input"
                    value={appointmentSettings.deposit_percentage}
                    onChange={handleAppointmentChange}
                    min="0"
                    max="100"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="settings-section">
            <div className="section-header-settings">
              <h2><FiBell /> Notificaciones</h2>
              <p>Configura cómo y cuándo recibir notificaciones</p>
            </div>

            <div className="notification-groups">
              <div className="notification-group">
                <h3>Canales de Notificación</h3>
                <div className="notification-options">
                  <label className="checkbox-label-settings">
                    <input
                      type="checkbox"
                      name="email_notifications"
                      checked={notificationSettings.email_notifications}
                      onChange={handleNotificationChange}
                    />
                    <span>
                      <FiMail />
                      Notificaciones por Email
                    </span>
                  </label>

                  <label className="checkbox-label-settings">
                    <input
                      type="checkbox"
                      name="sms_notifications"
                      checked={notificationSettings.sms_notifications}
                      onChange={handleNotificationChange}
                    />
                    <span>
                      <FiPhone />
                      Notificaciones por SMS
                    </span>
                  </label>
                </div>
              </div>

              <div className="notification-group">
                <h3>Notificaciones a Clientes</h3>
                <div className="notification-options">
                  <label className="checkbox-label-settings">
                    <input
                      type="checkbox"
                      name="confirm_appointment"
                      checked={notificationSettings.confirm_appointment}
                      onChange={handleNotificationChange}
                    />
                    <span>Confirmación de cita</span>
                  </label>

                  <label className="checkbox-label-settings">
                    <input
                      type="checkbox"
                      name="remind_24h"
                      checked={notificationSettings.remind_24h}
                      onChange={handleNotificationChange}
                    />
                    <span>Recordatorio 24 horas antes</span>
                  </label>

                  <label className="checkbox-label-settings">
                    <input
                      type="checkbox"
                      name="remind_2h"
                      checked={notificationSettings.remind_2h}
                      onChange={handleNotificationChange}
                    />
                    <span>Recordatorio 2 horas antes</span>
                  </label>

                  <label className="checkbox-label-settings">
                    <input
                      type="checkbox"
                      name="cancellation_notice"
                      checked={notificationSettings.cancellation_notice}
                      onChange={handleNotificationChange}
                    />
                    <span>Aviso de cancelación</span>
                  </label>
                </div>
              </div>

              <div className="notification-group">
                <h3>Notificaciones a Administradores</h3>
                <div className="notification-options">
                  <label className="checkbox-label-settings">
                    <input
                      type="checkbox"
                      name="new_appointment_admin"
                      checked={notificationSettings.new_appointment_admin}
                      onChange={handleNotificationChange}
                    />
                    <span>Nueva cita registrada</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Settings */}
        {activeTab === 'payments' && (
          <div className="settings-section">
            <div className="section-header-settings">
              <h2><FiDollarSign /> Configuración de Pagos</h2>
              <p>Define los métodos de pago aceptados</p>
            </div>

            <div className="settings-grid">
              <div className="setting-group full">
                <h3>Métodos de Pago Aceptados</h3>
                <div className="payment-methods">
                  <label className="checkbox-label-settings">
                    <input
                      type="checkbox"
                      name="accept_cash"
                      checked={paymentSettings.accept_cash}
                      onChange={handlePaymentChange}
                    />
                    <span>💵 Efectivo</span>
                  </label>

                  <label className="checkbox-label-settings">
                    <input
                      type="checkbox"
                      name="accept_card"
                      checked={paymentSettings.accept_card}
                      onChange={handlePaymentChange}
                    />
                    <span>💳 Tarjeta de Crédito/Débito</span>
                  </label>

                  <label className="checkbox-label-settings">
                    <input
                      type="checkbox"
                      name="accept_transfer"
                      checked={paymentSettings.accept_transfer}
                      onChange={handlePaymentChange}
                    />
                    <span>🏦 Transferencia Bancaria</span>
                  </label>
                </div>
              </div>

              <div className="setting-group">
                <label className="setting-label">Moneda</label>
                <select
                  name="currency"
                  className="setting-input"
                  value={paymentSettings.currency}
                  onChange={handlePaymentChange}
                >
                  <option value="PEN">Soles (S/)</option>
                  <option value="USD">Dólares ($)</option>
                  <option value="EUR">Euros (€)</option>
                </select>
              </div>

              <div className="setting-group">
                <label className="setting-label">Impuesto (IGV %)</label>
                <input
                  type="number"
                  name="tax_rate"
                  className="setting-input"
                  value={paymentSettings.tax_rate}
                  onChange={handlePaymentChange}
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        )}

        {/* System Settings */}
        {activeTab === 'system' && (
          <div className="settings-section">
            <div className="section-header-settings">
              <h2><FiDatabase /> Sistema</h2>
              <p>Herramientas de mantenimiento y respaldo</p>
            </div>

            <div className="system-actions">
              <div className="system-card">
                <div className="system-card-icon backup">
                  <FiDownload />
                </div>
                <div className="system-card-content">
                  <h3>Respaldo de Base de Datos</h3>
                  <p>Crea una copia de seguridad de todos los datos del sistema</p>
                  <button className="btn btn-outline" onClick={handleBackup}>
                    <FiDownload />
                    Crear Backup
                  </button>
                </div>
              </div>

              <div className="system-card">
                <div className="system-card-icon restore">
                  <FiUpload />
                </div>
                <div className="system-card-content">
                  <h3>Restaurar Base de Datos</h3>
                  <p>Restaura el sistema desde un archivo de respaldo</p>
                  <button className="btn btn-outline" onClick={handleRestore}>
                    <FiUpload />
                    Restaurar Backup
                  </button>
                </div>
              </div>

              <div className="system-card">
                <div className="system-card-icon info">
                  <FiCheckCircle />
                </div>
                <div className="system-card-content">
                  <h3>Información del Sistema</h3>
                  <div className="system-info">
                    <div className="info-row">
                      <span>Versión:</span>
                      <strong>1.0.0</strong>
                    </div>
                    <div className="info-row">
                      <span>Último respaldo:</span>
                      <strong>15/12/2025 10:30 AM</strong>
                    </div>
                    <div className="info-row">
                      <span>Total de usuarios:</span>
                      <strong>156</strong>
                    </div>
                    <div className="info-row">
                      <span>Total de citas:</span>
                      <strong>1,248</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminSettingsPage