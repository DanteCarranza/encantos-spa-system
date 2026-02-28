import React, { useState, useEffect } from 'react'
import { 
  FiCalendar, 
  FiChevronLeft, 
  FiChevronRight,
  FiClock,
  FiUser,
  FiLock,
  FiUnlock,
  FiAlertCircle,
  FiX
} from 'react-icons/fi'
import scheduleService from '../../services/scheduleService'
import Swal from 'sweetalert2'
import './SchedulePage.css'

const SchedulePage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarData, setCalendarData] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [dayDetails, setDayDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockReason, setBlockReason] = useState('')

  const [showBlockHoursModal, setShowBlockHoursModal] = useState(false)
const [blockedHoursList, setBlockedHoursList] = useState([])
const [blockHoursData, setBlockHoursData] = useState({
  hora_inicio: '09:00',
  hora_fin: '10:00',
  motivo: ''
})

  useEffect(() => {
    loadCalendarData()
  }, [currentMonth])

  const loadCalendarData = async () => {
    setLoading(true)
    const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`
    const result = await scheduleService.getCalendarData(monthStr)
    
    if (result.success) {
      setCalendarData(result.data)
    }
    setLoading(false)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    setSelectedDate(null)
    setDayDetails(null)
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    setSelectedDate(null)
    setDayDetails(null)
  }

  const handleDateClick = async (date) => {
    // Convertir la fecha a string en formato YYYY-MM-DD (sin hora)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    setSelectedDate(dateStr)
    setLoading(true)
    
    const result = await scheduleService.getDayDetails(dateStr)
    if (result.success) {
      setDayDetails(result.data)
    }
    setLoading(false)
  }

  const handleBlockDay = () => {
    if (!selectedDate) return
    setShowBlockModal(true)
  }

  const confirmBlockDay = async () => {
    if (!blockReason.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Motivo requerido',
        text: 'Debes ingresar un motivo para bloquear el día',
        confirmButtonColor: '#d946ef'
      })
      return
    }

    const result = await scheduleService.blockDay(selectedDate, blockReason)
    
    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Día bloqueado',
        text: 'El día ha sido bloqueado exitosamente',
        confirmButtonColor: '#d946ef'
      })
      setShowBlockModal(false)
      setBlockReason('')
      loadCalendarData()
      handleDateClick(selectedDate)
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.message,
        confirmButtonColor: '#d946ef'
      })
    }
  }

  const handleUnblockDay = async () => {
    const confirm = await Swal.fire({
      icon: 'question',
      title: '¿Desbloquear día?',
      text: 'Los usuarios podrán reservar citas en este día',
      showCancelButton: true,
      confirmButtonText: 'Sí, desbloquear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b'
    })

    if (confirm.isConfirmed) {
      const result = await scheduleService.unblockDay(selectedDate)
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Día desbloqueado',
          confirmButtonColor: '#d946ef'
        })
        loadCalendarData()
        handleDateClick(selectedDate)
      }
    }
  }



  const handleBlockHours = () => {
    if (!selectedDate) return
    setShowBlockHoursModal(true)
    loadBlockedHours()
  }
  
  const loadBlockedHours = async () => {
    if (!selectedDate) return
    
    const result = await scheduleService.getBlockedHours(selectedDate)
    if (result.success) {
      setBlockedHoursList(result.data || [])
    }
  }
  
  const handleBlockHoursChange = (e) => {
    const { name, value } = e.target
    setBlockHoursData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const confirmBlockHours = async () => {
    if (!blockHoursData.motivo.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Motivo requerido',
        text: 'Debes ingresar un motivo para bloquear las horas',
        confirmButtonColor: '#d946ef'
      })
      return
    }
  
    if (blockHoursData.hora_inicio >= blockHoursData.hora_fin) {
      Swal.fire({
        icon: 'warning',
        title: 'Horario inválido',
        text: 'La hora de fin debe ser mayor a la hora de inicio',
        confirmButtonColor: '#d946ef'
      })
      return
    }
  
    const result = await scheduleService.blockHours(
      selectedDate,
      blockHoursData.hora_inicio + ':00',
      blockHoursData.hora_fin + ':00',
      blockHoursData.motivo
    )
    
    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Horas bloqueadas',
        text: 'Las horas han sido bloqueadas exitosamente',
        confirmButtonColor: '#d946ef'
      })
      setBlockHoursData({
        hora_inicio: '09:00',
        hora_fin: '10:00',
        motivo: ''
      })
      loadBlockedHours()
      handleDateClick(selectedDate) // Recargar detalles del día
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.message,
        confirmButtonColor: '#d946ef'
      })
    }
  }
  
  const handleUnblockHours = async (id) => {
    const confirm = await Swal.fire({
      icon: 'question',
      title: '¿Desbloquear horas?',
      text: 'Este horario volverá a estar disponible',
      showCancelButton: true,
      confirmButtonText: 'Sí, desbloquear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b'
    })
  
    if (confirm.isConfirmed) {
      const result = await scheduleService.unblockHours(id)
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Horas desbloqueadas',
          confirmButtonColor: '#d946ef'
        })
        loadBlockedHours()
        handleDateClick(selectedDate)
      }
    }
  }



  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Obtener fecha de hoy en Perú
   // Obtener fecha de hoy en Perú
const nowUTC = new Date()
const nowPeru = new Date(nowUTC.toLocaleString('en-US', { timeZone: 'America/Lima' }))
const todayPeru = new Date(nowPeru.getFullYear(), nowPeru.getMonth(), nowPeru.getDate())

    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }
  
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      
      const isToday = date.getTime() === todayPeru.getTime()
      const isPast = date < todayPeru
      
      const reservasDelDia = calendarData?.reservas_por_dia?.[dateStr]?.[0] || null
      const bloqueado = calendarData?.dias_bloqueados?.[dateStr]?.[0] || null
      
      const isSelected = selectedDate === dateStr
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''} ${bloqueado ? 'blocked' : ''}`}
          onClick={() => handleDateClick(date)}
        >
          <span className="day-number">{day}</span>
          
          {bloqueado && (
            <div className="day-indicator blocked-indicator">
              <FiLock />
            </div>
          )}
          
          {reservasDelDia && !bloqueado && (
            <div className="day-indicator reservations-indicator">
              <span>{reservasDelDia.total_reservas}</span>
            </div>
          )}
        </div>
      )
    }
  
    return days
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    
    // Si es un string, parsearlo correctamente
    if (typeof dateStr === 'string') {
      const [year, month, day] = dateStr.split('-')
      const date = new Date(year, month - 1, day)
      return date.toLocaleDateString('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    // Si es un objeto Date
    return dateStr.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false
    
    // Si ambos son strings, comparar directamente
    if (typeof date1 === 'string' && typeof date2 === 'string') {
      return date1 === date2
    }
    
    // Si uno es Date y otro string, convertir
    let d1 = date1
    let d2 = date2
    
    if (typeof date1 === 'string') {
      const [year, month, day] = date1.split('-')
      d1 = new Date(year, month - 1, day)
    }
    
    if (typeof date2 === 'string') {
      const [year, month, day] = date2.split('-')
      d2 = new Date(year, month - 1, day)
    }
    
    return d1.toDateString() === d2.toDateString()
  }
  
  const getStatusBadge = (estado) => {
    const badges = {
      pendiente: { label: 'Pendiente', color: '#f59e0b' },
      confirmada: { label: 'Confirmada', color: '#10b981' },
      completada: { label: 'Completada', color: '#3b82f6' },
      cancelada: { label: 'Cancelada', color: '#ef4444' }
    }
    return badges[estado] || badges.pendiente
  }

  return (
    <div className="schedule-page">
      <div className="schedule-container">
        {/* Header */}
        <div className="schedule-header">
          <div className="header-title">
            <FiCalendar className="header-icon" />
            <h1>Gestión de Horarios</h1>
          </div>
        </div>

        <div className="schedule-content">
          {/* Calendario */}
          <div className="calendar-section">
            {/* Month Navigator */}
            <div className="month-navigator">
              <button className="nav-btn" onClick={handlePrevMonth}>
                <FiChevronLeft />
              </button>
              <h2 className="current-month">
                {currentMonth.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
              </h2>
              <button className="nav-btn" onClick={handleNextMonth}>
                <FiChevronRight />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
              {/* Week Days Headers */}
              <div className="weekday-header">Dom</div>
              <div className="weekday-header">Lun</div>
              <div className="weekday-header">Mar</div>
              <div className="weekday-header">Mié</div>
              <div className="weekday-header">Jue</div>
              <div className="weekday-header">Vie</div>
              <div className="weekday-header">Sáb</div>

              {/* Days */}
              {renderCalendar()}
            </div>

            {/* Legend */}
            <div className="calendar-legend">
              <div className="legend-item">
                <span className="legend-dot today-dot"></span>
                <span>Hoy</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot reservations-dot"></span>
                <span>Con reservas</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot blocked-dot"></span>
                <span>Bloqueado</span>
              </div>
            </div>
          </div>

          {/* Day Details Panel */}
          {selectedDate && (
            <div className="day-details-panel">
              <div className="panel-header">
                <h3>{formatDate(selectedDate)}</h3>
                <button className="close-panel-btn" onClick={() => setSelectedDate(null)}>
                  <FiX />
                </button>
              </div>

              {loading ? (
                <div className="panel-loading">
                  <div className="spinner"></div>
                  <p>Cargando...</p>
                </div>
              ) : dayDetails ? (
                <>
                  {/* Blocked Status */}
                  {dayDetails.bloqueado ? (
                    <div className="blocked-alert">
                      <FiAlertCircle />
                      <div>
                        <strong>Día bloqueado</strong>
                        <p>{dayDetails.bloqueado.motivo}</p>
                      </div>
                      <button className="btn-unblock" onClick={handleUnblockDay}>
                        <FiUnlock />
                        Desbloquear
                      </button>
                    </div>
                  ) : (
                    <div className="block-buttons-group">
  <button className="btn-block-day full" onClick={handleBlockDay}>
    <FiLock />
    Bloquear Día Completo
  </button>
  <button className="btn-block-hours" onClick={handleBlockHours}>
    <FiClock />
    Bloquear Horas
  </button>
</div>
                  )}

                  {/* Reservations List */}
                  <div className="reservations-list">
                    <h4>
                      <FiClock />
                      Reservas del día ({dayDetails.reservas.length})
                    </h4>

                    {dayDetails.reservas.length === 0 ? (
                      <p className="no-reservations">No hay reservas para este día</p>
                    ) : (
                      dayDetails.reservas.map(reserva => (
                        <div key={reserva.id} className="reservation-item">
                          <div className="reservation-time">
                            {reserva.hora_inicio} - {reserva.hora_fin}
                          </div>
                          <div className="reservation-info">
                            <strong>{reserva.servicio_nombre}</strong>
                            <div className="reservation-meta">
                              <span>
                                <FiUser />
                                {reserva.nombre_cliente}
                              </span>
                              {reserva.terapeuta_nombre && (
                                <span>Terapeuta: {reserva.terapeuta_nombre}</span>
                              )}
                            </div>
                            <div 
                              className="reservation-status"
                              style={{ 
                                backgroundColor: getStatusBadge(reserva.estado).color + '20',
                                color: getStatusBadge(reserva.estado).color
                              }}
                            >
                              {getStatusBadge(reserva.estado).label}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Block Day Modal */}
      {showBlockModal && (
        <div className="modal-overlay" onClick={() => setShowBlockModal(false)}>
          <div className="modal-content-schedule" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-schedule">
              <h3>Bloquear Día</h3>
              <button onClick={() => setShowBlockModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body-schedule">
              <p className="modal-date">{formatDate(selectedDate)}</p>
              <label>Motivo del bloqueo:</label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Ej: Feriado, Mantenimiento, Evento especial..."
                rows="4"
              />
            </div>
            <div className="modal-footer-schedule">
              <button className="btn-cancel" onClick={() => setShowBlockModal(false)}>
                Cancelar
              </button>
              <button className="btn-confirm" onClick={confirmBlockDay}>
                <FiLock />
                Bloquear Día
              </button>
            </div>
          </div>
        </div>
      )}





{/* Block Hours Modal */}
{showBlockHoursModal && (
  <div className="modal-overlay" onClick={() => setShowBlockHoursModal(false)}>
    <div className="modal-content-schedule modal-wide" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header-schedule">
        <h3>Gestionar Horas Bloqueadas</h3>
        <button onClick={() => setShowBlockHoursModal(false)}>
          <FiX />
        </button>
      </div>
      
      <div className="modal-body-schedule modal-body-hours">
        <p className="modal-date">{formatDate(selectedDate)}</p>
        
        {/* Formulario para bloquear nuevas horas */}
        <div className="block-hours-form">
          <h4>Bloquear Nuevo Horario</h4>
          
          <div className="hours-form-grid">
            <div className="form-group-hours">
              <label>Hora Inicio</label>
              <select
                name="hora_inicio"
                value={blockHoursData.hora_inicio}
                onChange={handleBlockHoursChange}
                className="form-select-hours"
              >
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="12:00">12:00</option>
                <option value="13:00">13:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
                <option value="17:00">17:00</option>
                <option value="18:00">18:00</option>
                <option value="19:00">19:00</option>
                <option value="20:00">20:00</option>
              </select>
            </div>

            <div className="form-group-hours">
              <label>Hora Fin</label>
              <select
                name="hora_fin"
                value={blockHoursData.hora_fin}
                onChange={handleBlockHoursChange}
                className="form-select-hours"
              >
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="12:00">12:00</option>
                <option value="13:00">13:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
                <option value="17:00">17:00</option>
                <option value="18:00">18:00</option>
                <option value="19:00">19:00</option>
                <option value="20:00">20:00</option>
                <option value="21:00">21:00</option>
              </select>
            </div>
          </div>

          <div className="form-group-hours">
            <label>Motivo del bloqueo</label>
            <textarea
              name="motivo"
              value={blockHoursData.motivo}
              onChange={handleBlockHoursChange}
              placeholder="Ej: Reunión del personal, Mantenimiento..."
              rows="3"
              className="form-textarea-hours"
            />
          </div>

          <button className="btn-add-block" onClick={confirmBlockHours}>
            <FiLock />
            Bloquear Horario
          </button>
        </div>

        {/* Lista de horas bloqueadas */}
        <div className="blocked-hours-list">
          <h4>Horarios Bloqueados Actualmente</h4>
          
          {blockedHoursList.length === 0 ? (
            <p className="no-blocked-hours">No hay horarios bloqueados para este día</p>
          ) : (
            <div className="blocked-hours-items">
              {blockedHoursList.map(block => (
                <div key={block.id} className="blocked-hour-item">
                  <div className="blocked-hour-time">
                    <FiClock />
                    <span>
                      {block.hora_inicio.substring(0, 5)} - {block.hora_fin.substring(0, 5)}
                    </span>
                  </div>
                  <div className="blocked-hour-info">
                    <p className="blocked-hour-reason">{block.motivo}</p>
                    <p className="blocked-hour-meta">
                      Bloqueado por: {block.bloqueado_por} • {new Date(block.fecha_creacion).toLocaleString('es-PE')}
                    </p>
                  </div>
                  <button 
                    className="btn-unblock-hour"
                    onClick={() => handleUnblockHours(block.id)}
                  >
                    <FiUnlock />
                    Desbloquear
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="modal-footer-schedule">
        <button className="btn-cancel" onClick={() => setShowBlockHoursModal(false)}>
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}






    </div>
  )
}

export default SchedulePage