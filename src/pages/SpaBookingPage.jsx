import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiMail, 
  FiPhone,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiHeart,
  FiMapPin,
  FiSearch,
  FiFilter,
  FiUpload,
  FiX
  
} from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import spaService from '../services/spaService'
import Swal from 'sweetalert2'
import { formatPrice } from '../utils/helpers'
import './SpaBookingPage.css'
import servicesService from '../services/servicesService'
import AuthRequiredModal from '../components/booking/AuthRequiredModal'
import scheduleService from '../services/scheduleService'

const SpaBookingPage = () => {
  const navigate = useNavigate()
  //const { isAuthenticated, user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)


  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState([])
  const [therapists, setTherapists] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [blockedDays, setBlockedDays] = useState([])


  const [categories, setCategories] = useState([])
const [loadingServices, setLoadingServices] = useState(true)
const [searchTerm, setSearchTerm] = useState('')
const [categoryFilter, setCategoryFilter] = useState('all')
const [currentPage, setCurrentPage] = useState(1)
const servicesPerPage = 6

  // Calendario
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    dni: '',
    servicio_id: null,
    fecha: '',
    hora: '',
    notas: '',
    // Datos de pago
    metodo_pago: 'yape',
    numero_operacion: '',
    imagen_voucher: null
  })



  
  const [errors, setErrors] = useState({
    nombre: '',
    email: '',
    telefono: '',
    dni: '',        
    numero_operacion: '',
    voucher: ''
  })


  const [voucherFile, setVoucherFile] = useState(null)
const [voucherPreview, setVoucherPreview] = useState(null)

useEffect(() => {
    loadBlockedDays()
  }, [])


  const loadBlockedDays = async () => {
    const result = await scheduleService.getBlockedDays()
    if (result.success) {
      setBlockedDays(result.data.map(d => d.fecha))
    }
  }
  
  // En la función que valida fechas disponibles, agrega:
  const isDateBlocked = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return blockedDays.includes(dateStr)
  }
  
 


// Verificar autenticación al cargar
// Verificar autenticación al cargar
useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userDataString = localStorage.getItem('userData')
    
    const authenticated = !!token
    setIsAuthenticated(authenticated)
    
    if (authenticated && userDataString) {
      try {
        const userData = JSON.parse(userDataString)
        setUser(userData)
        
        // Actualizar formData con los datos del usuario
        setFormData(prev => ({
          ...prev,
          nombre: userData.nombre_completo || '',
          email: userData.email || '',
          telefono: userData.telefono || ''
        }))
      } catch (error) {
        console.error('Error parseando userData:', error)
      }
    }
    
    // Si NO está autenticado, mostrar modal inmediatamente
    if (!authenticated) {
      setShowAuthModal(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadServices()
      loadCategories()
      loadTherapists()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (formData.servicio_id && selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0]
      setFormData(prev => ({ ...prev, fecha: dateStr }))
      loadAvailableSlots(dateStr, formData.servicio_id, null) // Sin terapeuta
    }
  }, [selectedDate, formData.servicio_id])

  const loadServices = async () => {
    setLoadingServices(true)
    const result = await servicesService.getServices({ activo: 1 })
    if (result.success) {
      setServices(result.data || [])
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los servicios',
        confirmButtonColor: '#d946ef'
      })
    }
    setLoadingServices(false)
  }

  const loadCategories = async () => {
    const result = await servicesService.getCategories()
    if (result.success) {
      setCategories(result.data || [])
    }
  }

  const loadTherapists = async () => {
    const result = await spaService.getTherapists()
    if (result.success) {
      setTherapists(result.data)
    }
  }

  const loadAvailableSlots = async (date, serviceId, therapistId) => {
    setLoadingSlots(true)
    
    try {
      const result = await spaService.getAvailableSlots(date, serviceId, therapistId)
      
      if (result.success) {
        let slots = result.data
        
        // Obtener hora actual en Perú
        const nowUTC = new Date()
        const nowPeru = new Date(nowUTC.toLocaleString('en-US', { timeZone: 'America/Lima' }))
        
        // Si la fecha seleccionada es HOY en Perú, filtrar horarios pasados
        const selectedDate = new Date(date)
        const todayPeru = new Date(nowPeru.getFullYear(), nowPeru.getMonth(), nowPeru.getDate())
        const isToday = selectedDate.getTime() === todayPeru.getTime()
        
        if (isToday) {
          const currentHourPeru = nowPeru.getHours()
          const currentMinutesPeru = nowPeru.getMinutes()
          const currentTimeInMinutes = currentHourPeru * 60 + currentMinutesPeru
          
          // Obtener duración del servicio
          const selectedServiceData = services.find(s => s.id === serviceId)
          const serviceDuration = selectedServiceData?.duracion || 60
          
          // Filtrar horarios que ya pasaron + tiempo de servicio + margen de 30 min
          slots = slots.filter(slot => {
            const [slotHour, slotMinute] = slot.hora.split(':').map(Number)
            const slotTimeInMinutes = slotHour * 60 + slotMinute
            
            // El horario debe ser al menos 30 minutos en el futuro
            // Y debe haber tiempo suficiente para completar el servicio antes de las 20:00
            const endTimeInMinutes = slotTimeInMinutes + serviceDuration
            const closingTime = 20 * 60 // 8:00 PM en minutos
            
            return slotTimeInMinutes > (currentTimeInMinutes + 30) && 
                   endTimeInMinutes <= closingTime
          })
          
          // Si no quedan horarios disponibles para hoy, mostrar mensaje
          if (slots.length === 0) {
            Swal.fire({
              icon: 'info',
              title: 'Sin horarios disponibles hoy',
              text: 'Ya no hay horarios disponibles para hoy. Por favor selecciona otra fecha.',
              confirmButtonColor: '#d946ef'
            })
            setSelectedDate(null)
            setFormData(prev => ({ ...prev, fecha: '', hora: '' }))
          }
        }
        
        setAvailableSlots(slots)
      }
    } catch (error) {
      console.error('Error loading slots:', error)
    } finally {
      setLoadingSlots(false)
    }
  }


  const handleVoucherChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo muy grande',
          text: 'El voucher no debe superar 5MB',
          confirmButtonColor: '#d946ef'
        })
        return
      }
  
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Formato no válido',
          text: 'Solo se permiten imágenes JPG o PNG',
          confirmButtonColor: '#d946ef'
        })
        return
      }
  
      setVoucherFile(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setVoucherPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleRemoveVoucher = () => {
    setVoucherFile(null)
    setVoucherPreview(null)
    setFormData(prev => ({ ...prev, imagen_voucher: null }))
    document.getElementById('voucher-upload').value = ''
  }


  // Filtrar servicios
const filteredServices = services.filter(service => {
    const matchesSearch = service.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || service.categoria_id === parseInt(categoryFilter)
    
    return matchesSearch && matchesCategory
  })
  
  // Paginación
  const indexOfLastService = currentPage * servicesPerPage
  const indexOfFirstService = indexOfLastService - servicesPerPage
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService)
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage)



  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }
  
  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value)
    setCurrentPage(1)
  }



  // Funciones del calendario
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const isDateDisabled = (date) => {
    if (!date) return true
    
    // Obtener fecha y hora actual en zona horaria de Perú (UTC-5)
    const nowUTC = new Date()
    const nowPeru = new Date(nowUTC.toLocaleString('en-US', { timeZone: 'America/Lima' }))
    
    // Fecha de hoy en Perú sin hora
    const todayPeru = new Date(nowPeru.getFullYear(), nowPeru.getMonth(), nowPeru.getDate())
    
    // Fecha del calendario sin hora
    const dateToCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    // Deshabilitar domingos
    if (dateToCheck.getDay() === 0) return true
    
    // Deshabilitar fechas pasadas
    if (dateToCheck < todayPeru) return true
    
    // NUEVO: Verificar si el día está bloqueado
    if (isDateBlocked(date)) return true
    
    // Si es HOY en Perú, verificar la hora actual
    if (dateToCheck.getTime() === todayPeru.getTime()) {
      const currentHourPeru = nowPeru.getHours()
      
      // Si ya pasaron las 6:00 PM (18:00) en Perú, deshabilitar hoy
      if (currentHourPeru >= 18) {
        return true
      }
    }
    
    return false
  }

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false
    return date1.toDateString() === date2.toDateString()
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDateSelect = (date) => {
    if (!isDateDisabled(date)) {
      setSelectedDate(date)
      setFormData(prev => ({ ...prev, hora: '' }))
    }
  }

  const handleServiceSelect = (serviceId) => {
    setFormData(prev => ({ 
      ...prev, 
      servicio_id: serviceId,
      hora: ''
    }))
    setSelectedDate(null)
  }

  const handleTherapistSelect = (therapistId) => {
    setFormData(prev => ({ 
      ...prev, 
      terapeuta_id: therapistId,
      hora: ''
    }))
  }

  const validateStep1 = () => {
    const newErrors = {}
    if (!formData.servicio_id) {
      newErrors.servicio_id = 'Selecciona un servicio'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    if (!formData.fecha) {
      newErrors.fecha = 'Selecciona una fecha'
    }
    if (!formData.hora) {
      newErrors.hora = 'Selecciona un horario'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors = {}
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    
    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es requerido'
    } else if (formData.dni.length !== 8) {
      newErrors.dni = 'Debe tener 8 dígitos'
    } else if (!/^\d{8}$/.test(formData.dni)) {
      newErrors.dni = 'El DNI debe contener solo números'
    }


    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio'
    } else if (!/^[0-9]{9}$/.test(formData.telefono)) {
      newErrors.telefono = 'Teléfono inválido (9 dígitos)'
    }
    
    // Validar pago con Yape
    if (formData.metodo_pago === 'yape') {
      if (!formData.numero_operacion.trim()) {
        newErrors.numero_operacion = 'El número de operación es obligatorio'
      } else if (formData.numero_operacion.trim().length < 6) {
        newErrors.numero_operacion = 'El número de operación debe tener al menos 6 caracteres'
      } else if (!/^[0-9]+$/.test(formData.numero_operacion.trim())) {
        newErrors.numero_operacion = 'El número de operación solo debe contener números'
      }
      
      if (!voucherFile) {
        newErrors.voucher = 'Debes adjuntar el voucher de pago'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
  
    if (!validateStep3()) return
  
    setLoading(true)
  
    try {
      // Crear FormData para enviar imagen
      const bookingFormData = new FormData()
      
      // Datos del servicio y cliente
      bookingFormData.append('servicio_id', formData.servicio_id)
      bookingFormData.append('nombre', formData.nombre)
      bookingFormData.append('email', formData.email)
      bookingFormData.append('telefono', formData.telefono)
      bookingFormData.append('dni', formData.dni) 
      bookingFormData.append('fecha', formData.fecha)
      bookingFormData.append('hora', formData.hora)
      bookingFormData.append('notas', formData.notas || '')
      
      // Datos de pago
      bookingFormData.append('metodo_pago', 'yape')
      bookingFormData.append('numero_operacion', formData.numero_operacion.trim())
      bookingFormData.append('monto_adelanto', (selectedService?.precio || 0) * 0.4)
      
      // Adjuntar voucher
      if (voucherFile) {
        bookingFormData.append('voucher', voucherFile)
      }
  
      const result = await spaService.createBooking(bookingFormData)
  
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Reserva Confirmada!',
          html: `
            <p>Tu reserva ha sido confirmada exitosamente.</p>
            <p><strong>Código de reserva:</strong> ${result.data.codigo}</p>
            <p>Te hemos enviado un correo de confirmación.</p>
          `,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#d946ef'
        }).then(() => {
          if (isAuthenticated) {
            navigate('/perfil?tab=reservas')
          } else {
            navigate('/')
          }
        })
      } else {
        // Manejo específico para número de operación duplicado
        if (result.message && result.message.includes('número de operación ya fue registrado')) {
          Swal.fire({
            icon: 'warning',
            title: 'Número de Operación Duplicado',
            html: result.message,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#f59e0b'
          })
          
          // Resaltar el campo con error
          setErrors(prev => ({
            ...prev,
            numero_operacion: 'Este número ya fue usado'
          }))
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: result.message || 'No se pudo confirmar la reserva'
          })
        }
      }
    } catch (error) {
      console.error('Error al crear reserva:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al procesar la reserva'
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedService = services.find(s => s.id === formData.servicio_id)
  const selectedTherapist = therapists.find(t => t.id === formData.terapeuta_id)

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  return (
    <div className="spa-booking-page">



<AuthRequiredModal 
        isOpen={showAuthModal} 
        onClose={() => {
          setShowAuthModal(false)
          navigate('/') // Redirigir al home si cierra sin autenticarse
        }} 
      />

      {/* Solo mostrar el contenido si está autenticado */}
      {isAuthenticated ? (
        <>
          {/* Tu contenido de reserva actual aquí */}
        </>
      ) : (
        <div className="auth-required-overlay">
          <p>Por favor, inicia sesión para continuar</p>
        </div>
      )}
   



      {/* Hero Section con efectos */}
      <div className="booking-hero">
        <div className="booking-hero-decoration"></div>
        <div className="container">
          <div className="booking-hero-content">
            <div className="booking-badge">
              <FiHeart /> Reserva tu Momento Especial
            </div>
            <h1 className="booking-hero-title">Tu Experiencia de Bienestar</h1>
            <p className="booking-hero-subtitle">
              Selecciona tu tratamiento favorito y agenda tu cita en simples pasos
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="booking-container">
          {/* Progress Steps Mejorados */}
          <div className="progress-steps-wrapper">
            <div className="progress-line-bg"></div>
            <div 
              className="progress-line-fill" 
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
            
            <div className="progress-steps">
              <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                <div className="step-circle">
                  {step > 1 ? <FiCheck /> : '1'}
                </div>
                <div className="step-info">
                  <div className="step-label">Elige tu Servicio</div>
                  <div className="step-description">Selecciona el tratamiento ideal</div>
                </div>
              </div>

              <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                <div className="step-circle">
                  {step > 2 ? <FiCheck /> : '2'}
                </div>
                <div className="step-info">
                  <div className="step-label">Fecha y Hora</div>
                  <div className="step-description">Agenda tu cita</div>
                </div>
              </div>

              <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                <div className="step-circle">3</div>
                <div className="step-info">
                  <div className="step-label">Confirmar Reserva</div>
                  <div className="step-description">Completa tus datos</div>
                </div>
              </div>
            </div>
          </div>

{/* Step 1: Servicios */}
{step === 1 && (
  <div className="booking-step step-services">
    <div className="step-header">
      <h2 className="step-title">Selecciona tu Servicio</h2>
      <p className="step-subtitle">Elige el tratamiento perfecto para ti</p>
    </div>

    {/* Búsqueda y Filtros */}
    <div className="services-filters-booking">
      <div className="search-box-booking">
        <FiSearch className="search-icon" />
        <input
          type="text"
          className="search-input-booking"
          placeholder="Buscar servicios..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="filter-box-booking">
        <FiFilter className="filter-icon" />
        <select
          className="filter-select-booking"
          value={categoryFilter}
          onChange={handleCategoryChange}
        >
          <option value="all">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>

    {/* Resultados */}
    <div className="results-info-booking">
      Mostrando <strong>{currentServices.length}</strong> de <strong>{filteredServices.length}</strong> servicios
    </div>
    
    {loadingServices ? (
      <div className="loading-services-booking">
        <div className="spinner-large"></div>
        <p>Cargando servicios...</p>
      </div>
    ) : currentServices.length === 0 ? (
      <div className="empty-services-booking">
        <div className="empty-icon">🔍</div>
        <h3>No se encontraron servicios</h3>
        <p>Intenta con otros términos de búsqueda</p>
      </div>
    ) : (
      <>
        <div className="services-grid-booking">
          {currentServices.map((service, index) => (
            <div
              key={service.id}
              className={`service-card-booking ${formData.servicio_id === service.id ? 'selected' : ''}`}
              onClick={() => handleServiceSelect(service.id)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="service-card-header">
                {service.imagen_url ? (
                  <div className="service-image-booking">
                    <img src={service.imagen_url} alt={service.nombre} />
                  </div>
                ) : (
                  <div className="service-icon-wrapper">
                    <div className="service-icon-booking">
                      {service.categoria_icono || '💆‍♀️'}
                    </div>
                  </div>
                )}
                {formData.servicio_id === service.id && (
                  <div className="service-check-badge">
                    <FiCheck />
                  </div>
                )}
              </div>
              <div className="service-card-body">
                <div className="service-category-badge">
                  {service.categoria_nombre}
                </div>
                <h3 className="service-card-name">{service.nombre}</h3>
                <p className="service-card-description">{service.descripcion}</p>
                <div className="service-card-footer">
                  <div className="service-duration-badge">
                    <FiClock /> {service.duracion} min
                  </div>
                  <div className="service-price-badge">
                    {formatPrice(service.precio)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="pagination-booking">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FiChevronLeft />
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FiChevronRight />
            </button>
          </div>
        )}
      </>
    )}

    {errors.servicio_id && (
      <div className="error-message">
        <FiHeart /> {errors.servicio_id}
      </div>
    )}

    <div className="step-actions">
      <button
        className="btn btn-primary btn-lg btn-glow"
        onClick={handleNext}
        disabled={!formData.servicio_id}
      >
        Continuar <FiChevronRight />
      </button>
    </div>
  </div>
)}

          {/* Step 2: Fecha y Hora */}
        {/* Step 2: Fecha y Hora */}
{step === 2 && (
  <div className="booking-step step-datetime">
    <div className="step-header">
      <h2 className="step-title">Selecciona Fecha y Hora</h2>
      <p className="step-subtitle">Encuentra el momento perfecto para tu visita</p>
    </div>

    {/* Calendario */}
    <div className="calendar-section-booking">
      <h3 className="section-title-small">
        <FiCalendar /> Selecciona una fecha
      </h3>
      
      <div className="calendar-card">
        <div className="calendar-header-booking">
          <button className="calendar-nav-btn" onClick={handlePrevMonth}>
            <FiChevronLeft />
          </button>
          <div className="calendar-title-booking">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>
          <button className="calendar-nav-btn" onClick={handleNextMonth}>
            <FiChevronRight />
          </button>
        </div>

        <div className="calendar-days-header-booking">
          {dayNames.map(day => (
            <div key={day} className="calendar-day-name-booking">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-grid-booking">
  {getDaysInMonth(currentMonth).map((date, index) => {
    const nowUTC = new Date()
    const nowPeru = new Date(nowUTC.toLocaleString('en-US', { timeZone: 'America/Lima' }))
    const todayPeru = new Date(nowPeru.getFullYear(), nowPeru.getMonth(), nowPeru.getDate())
    
    const isToday = date && date.getTime() === todayPeru.getTime()
    const isBlocked = date && isDateBlocked(date)
    const isDisabled = date && isDateDisabled(date)
    
    return (
      <div
        key={index}
        className={`calendar-day-booking ${!date ? 'empty' : ''} ${
          isBlocked ? 'blocked' : ''
        } ${isDisabled && !isBlocked ? 'disabled' : ''} ${
          isSameDay(date, selectedDate) ? 'selected' : ''
        } ${isToday ? 'today' : ''}`}
        onClick={() => date && !isDisabled && handleDateSelect(date)}
        title={isBlocked ? 'Día no disponible - Bloqueado' : ''}
      >
        {date ? date.getDate() : ''}
      </div>
    )
  })}
</div>
      </div>

      {errors.fecha && (
        <div className="error-message">{errors.fecha}</div>
      )}
    </div>

    {/* Horarios */}
    {selectedDate && (
      <div className="time-slots-section-booking">
        <h3 className="section-title-small">
          <FiClock /> Horarios disponibles
        </h3>
        <p className="date-selected-text">
          {selectedDate.toLocaleDateString('es-PE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </p>

        {loadingSlots ? (
          <div className="loading-slots-booking">
            <div className="spinner-booking"></div>
            <p>Cargando horarios...</p>
          </div>
        ) : (
          <div className="time-slots-grid-booking">
            {availableSlots.map((slot) => (
              <button
                key={slot.hora}
                type="button"
                className={`time-slot-booking ${
                  formData.hora === slot.hora ? 'selected' : ''
                } ${!slot.disponible ? 'disabled' : ''}`}
                onClick={() => slot.disponible && handleChange({ 
                  target: { name: 'hora', value: slot.hora } 
                })}
                disabled={!slot.disponible}
              >
                <FiClock />
                <span>{slot.hora}</span>
                {!slot.disponible && <span className="slot-badge">Ocupado</span>}
              </button>
            ))}
          </div>
        )}


{!loadingSlots && availableSlots.length === 0 && (
  <div className="no-slots-message">
    <div className="no-slots-icon">⏰</div>
    <h4>No hay horarios disponibles</h4>
    <p>
      {(() => {
        const nowUTC = new Date()
        const nowPeru = new Date(nowUTC.toLocaleString('en-US', { timeZone: 'America/Lima' }))
        const todayPeru = new Date(nowPeru.getFullYear(), nowPeru.getMonth(), nowPeru.getDate())
        const selectedDateObj = new Date(selectedDate)
        const isToday = selectedDateObj.getTime() === todayPeru.getTime()
        
        return isToday
          ? 'Ya no hay horarios disponibles para hoy. Por favor selecciona otra fecha.'
          : 'No hay horarios disponibles para esta fecha. Por favor selecciona otro día.'
      })()}
    </p>
  </div>
)}

        {errors.hora && (
          <div className="error-message">{errors.hora}</div>
        )}
      </div>
    )}

    <div className="step-actions">
      <button className="btn btn-outline" onClick={handleBack}>
        <FiChevronLeft /> Atrás
      </button>
      <button className="btn btn-primary btn-glow" onClick={handleNext}>
        Continuar <FiChevronRight />
      </button>
    </div>
  </div>
)}

          
          {/* Step 3: Confirmación */}
         
          {step === 3 && (
  <div className="booking-step step-confirmation">
    <div className="step-header">
      <h2 className="step-title">Confirma tu Reserva</h2>
      <p className="step-subtitle">Revisa los detalles y completa tu pago</p>
    </div>

    <form className="booking-form" onSubmit={handleSubmit}>
      <div className="confirmation-grid">
        {/* Columna Izquierda: Resumen */}
        <div className="confirmation-left">
          <div className="booking-summary-card-v2">
            <div className="summary-header-v2">
              <FiHeart className="summary-icon-v2" />
              <h3>Resumen de Reserva</h3>
            </div>
            
            <div className="summary-body-v2">
              <div className="summary-service-card">
                {selectedService?.imagen_url ? (
                  <img src={selectedService.imagen_url} alt={selectedService.nombre} className="summary-service-image" />
                ) : (
                  <div className="summary-service-icon">💆‍♀️</div>
                )}
                <div className="summary-service-info">
                  <h4>{selectedService?.nombre}</h4>
                  <p>{selectedService?.categoria_nombre}</p>
                </div>
              </div>

              <div className="summary-divider"></div>
              
              <div className="summary-details-list">
                <div className="summary-detail-item">
                  <FiCalendar className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Fecha</span>
                    <span className="detail-value">
                      {selectedDate?.toLocaleDateString('es-PE', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div className="summary-detail-item">
                  <FiClock className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Hora</span>
                    <span className="detail-value">{formData.hora}</span>
                  </div>
                </div>

                <div className="summary-detail-item">
                  <FiClock className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Duración</span>
                    <span className="detail-value">{selectedService?.duracion} minutos</span>
                  </div>
                </div>
              </div>

              <div className="summary-divider"></div>
              
              <div className="summary-total-v2">
                <span>Total a Pagar</span>
                <span className="total-price">{formatPrice(selectedService?.precio)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Datos y Pago */}
        <div className="confirmation-right">
          {/* Datos del Cliente */}
          <div className="client-data-card-v2">
            <h3 className="card-title-v2">
              <FiUser /> Tus Datos
            </h3>

            <div className="form-grid-v2">
              <div className="form-group-v2">
                <label htmlFor="nombre">Nombre Completo *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  className={`form-input-v2 ${errors.nombre ? 'error' : ''}`}
                  placeholder="Tu nombre completo"
                  value={formData.nombre}
                  onChange={handleChange}
                />
                {errors.nombre && <span className="form-error-v2">{errors.nombre}</span>}
              </div>

              <div className="form-group-v2">
                <label htmlFor="email">Correo Electrónico *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-input-v2 ${errors.email ? 'error' : ''}`}
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="form-error-v2">{errors.email}</span>}
              </div>

              <div className="form-group-v2">
                <label htmlFor="telefono">Teléfono *</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  className={`form-input-v2 ${errors.telefono ? 'error' : ''}`}
                  placeholder="999999999"
                  value={formData.telefono}
                  onChange={handleChange}
                  maxLength={9}
                />
                {errors.telefono && <span className="form-error-v2">{errors.telefono}</span>}
              </div>


              <div className="form-group-v2">
  <label htmlFor="dni">DNI *</label>
  <input
    type="text"
    id="dni"
    name="dni"
    className={`form-input-v2 ${errors.dni ? 'error' : ''}`}
    placeholder="12345678"
    value={formData.dni}
    onChange={handleChange}
    maxLength={8}
  />
  {errors.dni && <span className="form-error-v2">{errors.dni}</span>}
</div>

              <div className="form-group-v2 form-full-v2">
                <label htmlFor="notas">Notas Adicionales (Opcional)</label>
                <textarea
                  id="notas"
                  name="notas"
                  className="form-input-v2"
                  placeholder="¿Alguna preferencia? (alergias, zonas sensibles, etc.)"
                  value={formData.notas}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Pago con Yape */}
          <div className="payment-card-v2">
  <h3 className="card-title-v2">
    💳 Método de Pago
  </h3>

  <div className="yape-payment-section">
    <div className="yape-header">
      <div className="yape-logo">YAPE</div>
      <div className="yape-info">
        <p className="yape-number">965 685 090</p>
        <p className="yape-name">José Augusto Cabanillas</p>
      </div>
    </div>

    {/* Monto del Adelanto */}
    <div className="payment-amount-highlight">
      <h4>Adelanto Requerido (40%)</h4>
      <p className="payment-amount-value">
        {formatPrice((selectedService?.precio || 0) * 0.4)}
      </p>
      <p className="payment-amount-detail">
        Del total de {formatPrice(selectedService?.precio)}
      </p>
    </div>

    <div className="payment-instructions">
      <h4>Instrucciones de Pago:</h4>
      <ol>
        <li>Realiza el pago por <strong>Yape</strong> al número <strong>965 685 090</strong></li>
        <li>Por el monto de <strong>{formatPrice((selectedService?.precio || 0) * 0.4)}</strong> (adelanto del 40%)</li>
        <li>Toma una captura del voucher</li>
        <li>Adjunta el voucher y el número de operación</li>
      </ol>
    </div>

    <div className="form-group-v2">
      <label htmlFor="numero_operacion">Número de Operación *</label>
      <input
        type="text"
        id="numero_operacion"
        name="numero_operacion"
        className={`form-input-v2 ${errors.numero_operacion ? 'error' : ''}`}
        placeholder="Ej: 123456789"
        value={formData.numero_operacion}
        onChange={handleChange}
      />
      {errors.numero_operacion && <span className="form-error-v2">{errors.numero_operacion}</span>}
    </div>

    <div className="form-group-v2">
      <label>Voucher de Pago *</label>
      <div className="voucher-upload-section">
        <input
          type="file"
          id="voucher-upload"
          accept="image/*"
          onChange={handleVoucherChange}
          style={{ display: 'none' }}
        />
        {!voucherPreview ? (
          <label htmlFor="voucher-upload" className="voucher-upload-button">
            <FiUpload />
            Adjuntar Voucher
          </label>
        ) : (
          <div className="voucher-preview-card">
            <img src={voucherPreview} alt="Voucher" className="voucher-preview-image" />
            <button
              type="button"
              className="voucher-remove-btn"
              onClick={handleRemoveVoucher}
            >
              <FiX /> Eliminar
            </button>
          </div>
        )}
      </div>
      {errors.voucher && <span className="form-error-v2">{errors.voucher}</span>}
    </div>
  </div>
</div>
        </div>
      </div>

      <div className="step-actions step-actions-centered">
        <button type="button" className="btn btn-outline btn-lg" onClick={handleBack}>
          <FiChevronLeft /> Atrás
        </button>
        <button
          type="submit"
          className="btn btn-primary btn-lg btn-glow"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner-inline" />
              Procesando...
            </>
          ) : (
            <>
              <FiCheck />
              Confirmar Reserva
            </>
          )}
        </button>
      </div>
    </form>
  </div>
)}



        </div>
      </div>
    </div>
  )
}

export default SpaBookingPage