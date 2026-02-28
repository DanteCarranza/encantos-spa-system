import React, { useState, useEffect } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/es'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { 
  FiCalendar, 
  FiClock,
  FiDollarSign,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiFilter,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiBookOpen
} from 'react-icons/fi'
import Swal from 'sweetalert2'
import aulaVirtualService from '../../services/aulaVirtualService'
import './CalendarioPagosPage.css'

// Configurar moment en español
moment.locale('es')
const localizer = momentLocalizer(moment)

const CalendarioPagosPage = () => {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState('month') // month | week | day
  
  // Filtros
  const [filters, setFilters] = useState({
    estudiante: '',
    curso: '',
    estado: 'todos' // todos | pagado | pendiente | vencido
  })
  
  // Datos para filtros
  const [cursos, setCursos] = useState([])
  const [estudiantes, setEstudiantes] = useState([])
  
  // Modal
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [pagosDia, setPagosDia] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadEventos()
  }, [filters, selectedDate])

  const loadData = async () => {
    // Cargar cursos y estudiantes para filtros
    const cursosResult = await aulaVirtualService.getCourses()
    if (cursosResult.success) {
      setCursos(cursosResult.data || [])
    }

    const estudiantesResult = await aulaVirtualService.getStudents({ limit: 500 })
    if (estudiantesResult.success) {
      setEstudiantes(estudiantesResult.data || [])
    }
  }

  const loadEventos = async () => {
    setLoading(true)
    
    // Obtener pagos del mes actual
    const startOfMonth = moment(selectedDate).startOf('month').format('YYYY-MM-DD')
    const endOfMonth = moment(selectedDate).endOf('month').format('YYYY-MM-DD')
    
    const result = await aulaVirtualService.getPaymentsCalendar({
      fecha_inicio: startOfMonth,
      fecha_fin: endOfMonth,
      ...filters
    })
    
    if (result.success) {
      const eventosFormateados = result.data.map(pago => {
        const fechaPago = new Date(parseInt(pago.fecha_pago) * 1000)
        
        // Calcular si está vencido
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        const montoPendiente = parseFloat(pago.monto_pendiente || 0)
        
        let estado = 'pagado'
        let color = '#10b981' // Verde
        
        if (montoPendiente > 0) {
          if (fechaPago < hoy) {
            estado = 'vencido'
            color = '#ef4444' // Rojo
          } else {
            estado = 'pendiente'
            color = '#f59e0b' // Naranja
          }
        }
        
        return {
          id: pago.id,
          title: `${pago.estudiante_nombre} - S/ ${parseFloat(pago.monto_total).toFixed(2)}`,
          start: fechaPago,
          end: fechaPago,
          allDay: true,
          resource: {
            ...pago,
            estado,
            color
          }
        }
      })
      
      setEventos(eventosFormateados)
    }
    
    setLoading(false)
  }

  const handleSelectSlot = ({ start }) => {
    // Click en un día del calendario
    const pagosDeLaFecha = eventos.filter(evento => {
      const eventoFecha = moment(evento.start).format('YYYY-MM-DD')
      const fechaSeleccionada = moment(start).format('YYYY-MM-DD')
      return eventoFecha === fechaSeleccionada
    })
    
    if (pagosDeLaFecha.length > 0) {
      setPagosDia(pagosDeLaFecha)
      setShowDetailModal(true)
    }
  }

  const handleSelectEvent = (evento) => {
    setSelectedEvent(evento)
    setPagosDia([evento])
    setShowDetailModal(true)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const clearFilters = () => {
    setFilters({
      estudiante: '',
      curso: '',
      estado: 'todos'
    })
  }

  const exportToGoogleCalendar = () => {
    Swal.fire({
      icon: 'info',
      title: 'Exportar a Google Calendar',
      html: `
        <p>Para exportar a Google Calendar:</p>
        <ol style="text-align: left; padding-left: 2rem;">
          <li>Descarga el archivo .ics</li>
          <li>Ve a Google Calendar</li>
          <li>Click en el icono de configuración ⚙️</li>
          <li>Selecciona "Importar y exportar"</li>
          <li>Sube el archivo descargado</li>
        </ol>
      `,
      showCancelButton: true,
      confirmButtonText: 'Descargar .ics',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3b82f6'
    }).then((result) => {
      if (result.isConfirmed) {
        generarArchivoICS()
      }
    })
  }

  const generarArchivoICS = () => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Academia Encantos//Calendario de Pagos//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Pagos - Aula Virtual',
      'X-WR-TIMEZONE:America/Lima'
    ]

    eventos.forEach(evento => {
      const start = moment(evento.start).format('YYYYMMDDTHHmmss')
      const end = moment(evento.end).format('YYYYMMDDTHHmmss')
      const pago = evento.resource
      
      icsContent.push('BEGIN:VEVENT')
      icsContent.push(`DTSTART:${start}`)
      icsContent.push(`DTEND:${end}`)
      icsContent.push(`SUMMARY:${evento.title}`)
      icsContent.push(`DESCRIPTION:Estudiante: ${pago.estudiante_nombre}\\nCurso: ${pago.curso_nombre}\\nMonto: S/ ${parseFloat(pago.monto_total).toFixed(2)}\\nPendiente: S/ ${parseFloat(pago.monto_pendiente).toFixed(2)}`)
      icsContent.push(`STATUS:${pago.estado === 'pagado' ? 'CONFIRMED' : 'TENTATIVE'}`)
      icsContent.push(`UID:pago-${pago.id}@encantos.pe`)
      icsContent.push('END:VEVENT')
    })

    icsContent.push('END:VCALENDAR')

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `calendario_pagos_${moment().format('YYYY-MM')}.ics`
    link.click()

    Swal.fire({
      icon: 'success',
      title: 'Archivo Descargado',
      text: 'El archivo .ics se descargó exitosamente',
      confirmButtonColor: '#3b82f6'
    })
  }

 // Estilos personalizados para los eventos
 const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.resource.color,
      borderRadius: '8px',
      opacity: 0.9,
      color: 'white',
      border: 'none',
      display: 'block',
      fontWeight: '600',
      fontSize: '0.875rem',
      padding: '4px 8px'
    }
    return { style }
  }

  // Mensajes en español
  const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Pago',
    noEventsInRange: 'No hay pagos en este rango',
    showMore: (total) => `+ Ver más (${total})`
  }

  // Calcular estadísticas del mes
  const stats = {
    total: eventos.length,
    pagados: eventos.filter(e => e.resource.estado === 'pagado').length,
    pendientes: eventos.filter(e => e.resource.estado === 'pendiente').length,
    vencidos: eventos.filter(e => e.resource.estado === 'vencido').length,
    montoTotal: eventos.reduce((sum, e) => sum + parseFloat(e.resource.monto_total || 0), 0),
    montoPendiente: eventos.reduce((sum, e) => sum + parseFloat(e.resource.monto_pendiente || 0), 0)
  }

  return (
    <div className="calendario-pagos-page">
      <div className="calendario-container">
        {/* Hero Header */}
        <div className="calendario-hero">
          <div className="hero-content-calendario">
            <div className="hero-text-calendario">
              <h1>Calendario de Pagos</h1>
              <p>Visualiza vencimientos y pagos programados</p>
            </div>
            <div className="hero-icon-calendario">
              <FiCalendar />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="calendario-stats">
          <div className="stat-card-calendario blue">
            <div className="stat-icon-calendario">
              <FiCalendar />
            </div>
            <div className="stat-content-calendario">
              <span className="stat-value-calendario">{stats.total}</span>
              <span className="stat-label-calendario">Pagos del Mes</span>
            </div>
          </div>

          <div className="stat-card-calendario green">
            <div className="stat-icon-calendario">
              <FiCheckCircle />
            </div>
            <div className="stat-content-calendario">
              <span className="stat-value-calendario">{stats.pagados}</span>
              <span className="stat-label-calendario">Pagados</span>
            </div>
          </div>

          <div className="stat-card-calendario orange">
            <div className="stat-icon-calendario">
              <FiClock />
            </div>
            <div className="stat-content-calendario">
              <span className="stat-value-calendario">{stats.pendientes}</span>
              <span className="stat-label-calendario">Pendientes</span>
            </div>
          </div>

          <div className="stat-card-calendario red">
            <div className="stat-icon-calendario">
              <FiAlertCircle />
            </div>
            <div className="stat-content-calendario">
              <span className="stat-value-calendario">{stats.vencidos}</span>
              <span className="stat-label-calendario">Vencidos</span>
            </div>
          </div>
        </div>

        {/* Filtros y Controles */}
        <div className="calendario-toolbar">
          <div className="toolbar-filtros">
            <div className="filter-group-calendario">
              <FiUsers />
              <select 
                name="estudiante"
                value={filters.estudiante}
                onChange={handleFilterChange}
                className="filter-select-calendario"
              >
                <option value="">Todos los Estudiantes</option>
                {estudiantes.map(est => (
                  <option key={est.id} value={est.id}>
                    {est.fullname}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group-calendario">
              <FiBookOpen />
              <select 
                name="curso"
                value={filters.curso}
                onChange={handleFilterChange}
                className="filter-select-calendario"
              >
                <option value="">Todos los Cursos</option>
                {cursos.map(curso => (
                  <option key={curso.id} value={curso.id}>
                    {curso.fullname}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group-calendario">
              <FiFilter />
              <select 
                name="estado"
                value={filters.estado}
                onChange={handleFilterChange}
                className="filter-select-calendario"
              >
                <option value="todos">Todos los Estados</option>
                <option value="pagado">Pagados</option>
                <option value="pendiente">Pendientes</option>
                <option value="vencido">Vencidos</option>
              </select>
            </div>

            {(filters.estudiante || filters.curso || filters.estado !== 'todos') && (
              <button className="btn-clear-filters" onClick={clearFilters}>
                <FiX />
                Limpiar Filtros
              </button>
            )}
          </div>

          <button className="btn-export-calendar" onClick={exportToGoogleCalendar}>
            <FiDownload />
            Exportar a Google Calendar
          </button>
        </div>

        {/* Leyenda de Colores */}
        <div className="calendario-leyenda">
          <div className="leyenda-item">
            <div className="leyenda-color pagado"></div>
            <span>Pagado</span>
          </div>
          <div className="leyenda-item">
            <div className="leyenda-color pendiente"></div>
            <span>Pendiente</span>
          </div>
          <div className="leyenda-item">
            <div className="leyenda-color vencido"></div>
            <span>Vencido</span>
          </div>
        </div>

        {/* Calendario */}
        <div className="calendario-wrapper">
          {loading ? (
            <div className="loading-calendario">
              <div className="spinner-large-calendario"></div>
              <p>Cargando calendario...</p>
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={eventos}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 700 }}
              messages={messages}
              eventPropGetter={eventStyleGetter}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              view={view}
              onView={setView}
              date={selectedDate}
              onNavigate={setSelectedDate}
              views={['month', 'week', 'day']}
              components={{
                toolbar: CustomToolbar
              }}
            />
          )}
        </div>
      </div>

      {/* Modal: Pagos del Día */}
      {showDetailModal && (
        <div className="modal-overlay-calendario" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content-calendario" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-calendario">
              <h2>
                <FiCalendar />
                Pagos del {pagosDia.length > 0 && moment(pagosDia[0].start).format('DD [de] MMMM, YYYY')}
              </h2>
              <button className="btn-close-calendario" onClick={() => setShowDetailModal(false)}>
                <FiX />
              </button>
            </div>

            <div className="modal-body-calendario">
              <div className="pagos-dia-stats">
                <div className="stat-dia">
                  <FiCalendar />
                  <div>
                    <span className="stat-dia-value">{pagosDia.length}</span>
                    <span className="stat-dia-label">Pagos</span>
                  </div>
                </div>
                <div className="stat-dia">
                  <FiDollarSign />
                  <div>
                    <span className="stat-dia-value">
                      S/ {pagosDia.reduce((sum, p) => sum + parseFloat(p.resource.monto_total || 0), 0).toFixed(2)}
                    </span>
                    <span className="stat-dia-label">Total</span>
                  </div>
                </div>
                <div className="stat-dia">
                  <FiAlertCircle />
                  <div>
                    <span className="stat-dia-value">
                      S/ {pagosDia.reduce((sum, p) => sum + parseFloat(p.resource.monto_pendiente || 0), 0).toFixed(2)}
                    </span>
                    <span className="stat-dia-label">Pendiente</span>
                  </div>
                </div>
              </div>

              <div className="pagos-dia-list">
                {pagosDia.map(evento => {
                  const pago = evento.resource
                  return (
                    <div key={pago.id} className={`pago-dia-card ${pago.estado}`}>
                      <div className="pago-dia-header">
                        <div className="estudiante-info-dia">
                          <div className="estudiante-avatar-dia">
                            {pago.estudiante_nombre?.charAt(0)}
                          </div>
                          <div>
                            <h4>{pago.estudiante_nombre}</h4>
                            <p>{pago.curso_nombre}</p>
                          </div>
                        </div>
                        <span className={`estado-badge-dia ${pago.estado}`}>
                          {pago.estado === 'pagado' && <><FiCheckCircle /> Pagado</>}
                          {pago.estado === 'pendiente' && <><FiClock /> Pendiente</>}
                          {pago.estado === 'vencido' && <><FiAlertCircle /> Vencido</>}
                        </span>
                      </div>

                      <div className="pago-dia-details">
                        <div className="detail-row">
                          <span>Monto Total:</span>
                          <span className="monto-total">S/ {parseFloat(pago.monto_total).toFixed(2)}</span>
                        </div>
                        <div className="detail-row">
                          <span>Abonado:</span>
                          <span className="monto-abonado">S/ {parseFloat(pago.monto_abonado || 0).toFixed(2)}</span>
                        </div>
                        <div className="detail-row">
                          <span>Pendiente:</span>
                          <span className="monto-pendiente">S/ {parseFloat(pago.monto_pendiente || 0).toFixed(2)}</span>
                        </div>
                        {pago.es_pago_parcial == 1 && (
                          <div className="detail-row">
                            <span>Cuotas:</span>
                            <span>{pago.cuota_actual}/{pago.num_cuotas}</span>
                          </div>
                        )}
                      </div>

                      {parseFloat(pago.monto_pendiente || 0) > 0 && (
                        <button 
                          className="btn-agregar-abono-calendario"
                          onClick={() => {
                            // Aquí puedes abrir modal de agregar abono
                            Swal.fire({
                              icon: 'info',
                              title: 'Agregar Abono',
                              text: 'Función disponible desde el módulo de Pagos',
                              confirmButtonColor: '#3b82f6'
                            })
                          }}
                        >
                          <FiDollarSign />
                          Agregar Abono
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Toolbar personalizado
const CustomToolbar = (toolbar) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV')
  }

  const goToNext = () => {
    toolbar.onNavigate('NEXT')
  }

  const goToToday = () => {
    toolbar.onNavigate('TODAY')
  }

  const label = () => {
    const date = moment(toolbar.date)
    return (
      <span className="toolbar-label">
        {date.format('MMMM YYYY')}
      </span>
    )
  }

  return (
    <div className="custom-toolbar">
      <div className="toolbar-navigation">
        <button className="toolbar-btn" onClick={goToBack}>
          <FiChevronLeft />
          Anterior
        </button>
        <button className="toolbar-btn today" onClick={goToToday}>
          Hoy
        </button>
        <button className="toolbar-btn" onClick={goToNext}>
          Siguiente
          <FiChevronRight />
        </button>
      </div>

      <div className="toolbar-center">
        {label()}
      </div>

      <div className="toolbar-views">
        <button 
          className={`view-btn ${toolbar.view === 'month' ? 'active' : ''}`}
          onClick={() => toolbar.onView('month')}
        >
          Mes
        </button>
        <button 
          className={`view-btn ${toolbar.view === 'week' ? 'active' : ''}`}
          onClick={() => toolbar.onView('week')}
        >
          Semana
        </button>
        <button 
          className={`view-btn ${toolbar.view === 'day' ? 'active' : ''}`}
          onClick={() => toolbar.onView('day')}
        >
          Día
        </button>
      </div>
    </div>
  )
}

export default CalendarioPagosPage