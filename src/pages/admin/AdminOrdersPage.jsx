import React, { useState, useEffect } from 'react'
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiPhone,
  FiMail,
  FiDollarSign,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiCreditCard,
  FiUserCheck,
  FiUsers,
  FiArrowLeft,
  FiPlus
} from 'react-icons/fi'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import adminBookingsService from '../../services/adminBookingsService'
import Swal from 'sweetalert2'
import './AdminOrdersPage.css'
import PaymentModal from '../../components/admin/PaymentModal'
import paymentsService from '../../services/paymentsService'
import reservaTerapeutasService from '../../services/reservaTerapeutasService'
import refundsService from '../../services/refundsService'
import { formatPrice, formatDateLong, formatDateOnly } from '../../utils/helpers'
import SmartDropdown from '../../components/common/SmartDropdown'

const AdminOrdersPage = () => {
  const [appointments, setAppointments] = useState([])
  const [therapists, setTherapists] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('fecha_desc')
  const [expandedRow, setExpandedRow] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showVoucherModal, setShowVoucherModal] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [selectedTherapist, setSelectedTherapist] = useState(null)

  const [selectedTherapists, setSelectedTherapists] = useState([]) // Array de terapeutas seleccionados
  const [therapistCommissions, setTherapistCommissions] = useState({}) // { terapeutaId: porcentaje }
  const [assignedTherapists, setAssignedTherapists] = useState([]) // Terapeutas ya asignados a la reserva


  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPaymentAppointment, setSelectedPaymentAppointment] = useState(null)

  const [showRefundModal, setShowRefundModal] = useState(false)
const [refundAppointment, setRefundAppointment] = useState(null)
const [refundData, setRefundData] = useState({
  monto_devuelto: '',
  metodo_devolucion: 'efectivo',
  numero_operacion: '',
  motivo: '',
  fecha_devolucion: new Date().toISOString().split('T')[0],
  notas: ''
})
const [refundVoucher, setRefundVoucher] = useState(null)


const [showCreateModal, setShowCreateModal] = useState(false)
const [services, setServices] = useState([])
const [createFormData, setCreateFormData] = useState({
  servicio_id: '',
  nombre_cliente: '',
  email_cliente: '',
  telefono_cliente: '',
  tipo_documento: 'DNI',  
  numero_documento: '',
  fecha_reserva: '',
  hora_inicio: '',
  notas: '',
  metodo_pago: 'efectivo',
  numero_operacion: '',
  monto_adelanto: '',
  terapeutas: [] 
})
const [createErrors, setCreateErrors] = useState({})
const [selectedServiceForCreate, setSelectedServiceForCreate] = useState(null)


const loadServices = async () => {
  try {
    const response = await fetch('https://encantos.pe/spa/backend/api/services.php')
    const data = await response.json()
    if (data.success) {
      setServices(data.data)
    }
  } catch (error) {
    console.error('Error loading services:', error)
  }
}


  useEffect(() => {
    loadAppointments()
    loadTherapists()
    loadServices()
  }, [])

  const loadAppointments = async () => {
    setLoading(true)
    const result = await adminBookingsService.getBookings()
    
    if (result.success) {
      setAppointments(result.data)
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las reservas',
        confirmButtonColor: '#d946ef'
      })
    }
    
    setLoading(false)
  }





// Agregar después de los otros useEffect
useEffect(() => {
  const handleClickOutside = (event) => {
    const openDropdowns = document.querySelectorAll('.dropdown-actions.open')
    openDropdowns.forEach(dropdown => {
      if (!dropdown.contains(event.target)) {
        dropdown.classList.remove('open')
      }
    })
  }

  document.addEventListener('click', handleClickOutside)
  return () => {
    document.removeEventListener('click', handleClickOutside)
  }
}, [])



  const handleOpenCreateModal = () => {
    setCreateFormData({
      servicio_id: '',
      nombre_cliente: '',
      email_cliente: '',
      telefono_cliente: '',
      dni_cliente: '',
      fecha_reserva: '',
      hora_inicio: '',
      notas: '',
      metodo_pago: 'efectivo',
      numero_operacion: '',
      monto_adelanto: '',
      terapeutas: []
    })
    setCreateErrors({})
    setSelectedServiceForCreate(null)
    setShowCreateModal(true)
  }


// Validar y formatear número de documento según tipo
const validateDocumento = (tipo, numero) => {
  // Limpiar el número (solo dígitos)
  const cleaned = numero.replace(/\D/g, '')
  
  switch(tipo) {
    case 'DNI':
      return cleaned.slice(0, 8)
    case 'RUC':
      return cleaned.slice(0, 11)
    case 'CE':
      return cleaned.slice(0, 12)
    case 'PASAPORTE':
      return numero.toUpperCase().slice(0, 12) // Permite letras y números
    default:
      return cleaned
  }
}

// Obtener longitud esperada del documento
const getDocumentoLength = (tipo) => {
  switch(tipo) {
    case 'DNI':
      return 8
    case 'RUC':
      return 11
    case 'CE':
      return 12
    case 'PASAPORTE':
      return 12
    default:
      return 8
  }
}

// Obtener placeholder del documento
const getDocumentoPlaceholder = (tipo) => {
  switch(tipo) {
    case 'DNI':
      return '12345678'
    case 'RUC':
      return '20123456789'
    case 'CE':
      return '001234567890'
    case 'PASAPORTE':
      return 'ABC123456'
    default:
      return 'Número de documento'
  }
}


  
const handleCreateFormChange = (e) => {
  const { name, value } = e.target
  
  if (name === 'tipo_documento') {
    setCreateFormData(prev => ({
      ...prev,
      tipo_documento: value,
      numero_documento: ''
    }))
  } else if (name === 'numero_documento') {
    const validated = validateDocumento(createFormData.tipo_documento, value)
    setCreateFormData(prev => ({
      ...prev,
      numero_documento: validated
    }))
  } else if (name === 'servicio_id') {
    // ← AL SELECCIONAR SERVICIO, CALCULAR 40% AUTOMÁTICAMENTE
    const servicioSeleccionado = services.find(s => s.id === parseInt(value))
    const adelantoSugerido = servicioSeleccionado ? (servicioSeleccionado.precio * 0.4).toFixed(2) : ''
    
    setCreateFormData(prev => ({
      ...prev,
      servicio_id: value,
      monto_adelanto: adelantoSugerido  // ← AUTO-LLENAR CON 40%
    }))
  } else if (name === 'monto_adelanto' && selectedServiceForCreate) {
    const monto = parseFloat(value) || 0
    const precioServicio = selectedServiceForCreate.precio
    
    if (monto <= precioServicio) {
      setCreateFormData(prev => ({
        ...prev,
        monto_adelanto: value
      }))
    }
  } else {
    setCreateFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  if (createErrors[name]) {
    setCreateErrors(prev => ({
      ...prev,
      [name]: ''
    }))
  }
}
  
  const validateCreateForm = () => {
    const errors = {}
    
    if (!createFormData.servicio_id) errors.servicio_id = 'Selecciona un servicio'
    if (!createFormData.nombre_cliente.trim()) errors.nombre_cliente = 'El nombre es requerido'

    if (createFormData.email_cliente.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(createFormData.email_cliente)) {
        errors.email_cliente = 'Email no válido'
      }
    }

    //if (!createFormData.email_cliente.trim()) errors.email_cliente = 'El email es requerido'
    if (!createFormData.telefono_cliente.trim()) errors.telefono_cliente = 'El teléfono es requerido'
    if (createFormData.telefono_cliente.length !== 9) errors.telefono_cliente = 'Debe tener 9 dígitos'
    
     // Validar documento según tipo
  const expectedLength = getDocumentoLength(createFormData.tipo_documento)
  if (!createFormData.numero_documento.trim()) {
    errors.numero_documento = 'Ingrese el número de documento'
  } else if (createFormData.tipo_documento !== 'PASAPORTE' && 
             createFormData.numero_documento.length !== expectedLength) {
    errors.numero_documento = `Debe tener ${expectedLength} dígitos`
  }


    if (!createFormData.fecha_reserva) errors.fecha_reserva = 'La fecha es requerida'
   // if (!createFormData.hora_inicio) errors.hora_inicio = 'La hora es requerida'
    
    setCreateErrors(errors)
    return Object.keys(errors).length === 0
  }


  const handleDropdownPosition = (e) => {
    const button = e.currentTarget
    const dropdown = button.closest('.dropdown-actions')
    const rect = button.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    
    if (spaceBelow < 300) {
      dropdown.classList.add('dropup')
    } else {
      dropdown.classList.remove('dropup')
    }
  }


  
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateCreateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos requeridos',
        confirmButtonColor: '#d946ef'
      })
      return
    }
    
    try {
      setLoading(true)
      
      // Calcular estado de pago
      const montoAdelanto = parseFloat(createFormData.monto_adelanto) || 0
      const precioServicio = selectedServiceForCreate?.precio || 0
      
      const formData = new FormData()
      formData.append('servicio_id', createFormData.servicio_id)
      formData.append('nombre', createFormData.nombre_cliente)
      formData.append('email', createFormData.email_cliente)
      formData.append('telefono', createFormData.telefono_cliente)
      
      // ← AGREGAR TIPO Y NÚMERO DE DOCUMENTO
      formData.append('tipo_documento', createFormData.tipo_documento)
      formData.append('numero_documento', createFormData.numero_documento)
      
      formData.append('fecha', createFormData.fecha_reserva)
      formData.append('hora', createFormData.hora_inicio)
      formData.append('notas', createFormData.notas)
      formData.append('metodo_pago', createFormData.metodo_pago)
      formData.append('numero_operacion', createFormData.numero_operacion)
      formData.append('monto_adelanto', createFormData.monto_adelanto)
      formData.append('manual', 'true')
      
      const response = await fetch('https://encantos.pe/spa/backend/api/admin-bookings.php', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        // ← MENSAJE CON ESTADO DE PAGO
        const estadoPago = result.data.estado_pago || 'pendiente'
        const mensajePago = estadoPago === 'pagado' 
          ? '<p style="color: #16a34a; font-weight: 600; margin-top: 0.5rem;">✓ Pago completo registrado</p>'
          : montoAdelanto > 0
          ? `<p style="color: #f59e0b; font-weight: 600; margin-top: 0.5rem;">⚠ Adelanto registrado: ${formatPrice(montoAdelanto)}</p>`
          : '<p style="color: #6b7280; font-weight: 600; margin-top: 0.5rem;">ℹ️ Pendiente de pago</p>'
        
        Swal.fire({
          icon: 'success',
          title: '¡Cita Creada!',
          html: `
            <p>Código de reserva: <strong>${result.data.codigo}</strong></p>
            <p>Se ha registrado la cita exitosamente</p>
            ${mensajePago}
          `,
          confirmButtonColor: '#d946ef'
        })
        
        setShowCreateModal(false)
        loadAppointments()
        
        if (createFormData.terapeutas && createFormData.terapeutas.length > 0) {
          for (const t of createFormData.terapeutas) {
            await reservaTerapeutasService.addTerapeutaToReserva({
              reserva_id: result.data.id,
              terapeuta_id: t.terapeuta_id,
              porcentaje_comision: t.porcentaje_comision
            })
          }
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'No se pudo crear la cita',
          confirmButtonColor: '#d946ef'
        })
      }
    } catch (error) {
      console.error('Error creating appointment:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al crear la cita',
        confirmButtonColor: '#d946ef'
      })
    } finally {
      setLoading(false)
    }
  }







  const loadTherapists = async () => {
    const result = await adminBookingsService.getTherapists()
    if (result.success) {
      setTherapists(result.data)
    }
  }

  const getStatusInfo = (estado) => {
    const statusMap = {
      pendiente: {
        label: 'Pendiente',
        class: 'warning',
        icon: FiClock,
        color: '#f59e0b'
      },
      confirmada: {
        label: 'Confirmada',
        class: 'success',
        icon: FiCheckCircle,
        color: '#10b981'
      },
      en_curso: {
        label: 'En Curso',
        class: 'info',
        icon: FiRefreshCw,
        color: '#3b82f6'
      },
      completada: {
        label: 'Completada',
        class: 'completed',
        icon: FiCheck,
        color: '#8b5cf6'
      },
      cancelada: {
        label: 'Cancelada',
        class: 'error',
        icon: FiXCircle,
        color: '#ef4444'
      },
      devuelto: {
        label: 'Devuelto',
        class: 'cancelled',
        icon: FiAlertCircle,
        color: '#ec4899'
      },
      no_asistio: {
        label: 'No Asistió',
        class: 'cancelled',
        icon: FiAlertCircle,
        color: '#f97316'
      }
    }
    return statusMap[estado] || statusMap.pendiente
  }

  const getPaymentStatusInfo = (estado) => {
    const statusMap = {
      pendiente: { label: 'Pendiente', class: 'warning' },
      pagado: { label: 'Pagado', class: 'success' },
      cancelado: { label: 'Cancelado', class: 'error' }
    }
    return statusMap[estado] || statusMap.pendiente
  }

  const formatPrice = (price) => {
    return `S/ ${parseFloat(price).toFixed(2)}`
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateTimeStr) => {
    return new Date(dateTimeStr).toLocaleString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleStatusChange = async (appointment, newStatus) => {
    // Validaciones previas
    if (newStatus === 'completada') {
      // Si el estado de pago es "pagado", permitir completar directamente
      if (appointment.estado_pago === 'pagado') {
        proceedWithStatusChange(appointment, newStatus)
        return
      }
      
      // Si no está pagado, verificar montos
      const totalPagado = parseFloat(appointment.monto_adelanto || 0) + 
                         parseFloat(appointment.total_pagado || 0)
      const precioTotal = parseFloat(appointment.precio_servicio)
      
      if (totalPagado < precioTotal) {
        const faltaPagar = precioTotal - totalPagado
        Swal.fire({
          icon: 'error',
          title: 'No se puede completar',
          html: `
            <p>Esta reserva aún tiene saldo pendiente.</p>
            <p><strong>Falta pagar: S/ ${faltaPagar.toFixed(2)}</strong></p>
            <p>Registre el pago completo antes de marcar como completada.</p>
          `,
          confirmButtonColor: '#d946ef'
        })
        return
      }
    }
    
    // Si se cancela y tiene pagos, verificar devolución
    if (newStatus === 'cancelada') {
      const totalPagado = parseFloat(appointment.monto_adelanto || 0) + 
                         parseFloat(appointment.total_pagado || 0)
      
      if (totalPagado > 0) {
        // Verificar si ya tiene devolución
        const refundsResult = await refundsService.getRefunds(appointment.id)
        
        if (refundsResult.success && refundsResult.data.length > 0) {
          const totalDevuelto = refundsResult.data.reduce((sum, r) => sum + parseFloat(r.monto_devuelto), 0)
          
          if (totalDevuelto < totalPagado) {
            Swal.fire({
              icon: 'warning',
              title: 'Devolución pendiente',
              html: `
                <p>Esta reserva tiene pagos registrados.</p>
                <p><strong>Total pagado: S/ ${totalPagado.toFixed(2)}</strong></p>
                <p><strong>Total devuelto: S/ ${totalDevuelto.toFixed(2)}</strong></p>
                <p>¿Desea procesar la devolución ahora?</p>
              `,
              showCancelButton: true,
              confirmButtonText: 'Procesar Devolución',
              cancelButtonText: 'Cancelar de todos modos',
              confirmButtonColor: '#d946ef',
              cancelButtonColor: '#6b7280'
            }).then((result) => {
              if (result.isConfirmed) {
                handleOpenRefundModal(appointment)
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                proceedWithStatusChange(appointment, newStatus)
              }
            })
            return
          }
        } else {
          // No tiene devoluciones registradas
          Swal.fire({
            icon: 'warning',
            title: 'Procesar devolución',
            html: `
              <p>Esta reserva tiene pagos registrados.</p>
              <p><strong>Total pagado: S/ ${totalPagado.toFixed(2)}</strong></p>
              <p>Debe procesar la devolución antes de cancelar.</p>
            `,
            showCancelButton: true,
            confirmButtonText: 'Procesar Devolución',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d946ef'
          }).then((result) => {
            if (result.isConfirmed) {
              handleOpenRefundModal(appointment)
            }
          })
          return
        }
      }
    }
    
    // Proceder con el cambio de estado
    proceedWithStatusChange(appointment, newStatus)
  }
  
  const proceedWithStatusChange = async (appointment, newStatus) => {
    const statusLabels = {
      pendiente: 'Pendiente',
      confirmada: 'Confirmada',
      en_curso: 'En Curso',
      completada: 'Completada',
      cancelada: 'Cancelada',
      no_asistio: 'No Asistió'
    }
    
    const result = await Swal.fire({
      title: '¿Cambiar estado?',
      html: `
        <p>Estado actual: <strong>${statusLabels[appointment.estado]}</strong></p>
        <p>Nuevo estado: <strong>${statusLabels[newStatus]}</strong></p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d946ef'
    })
    
    if (result.isConfirmed) {
      try {
        // 🔥 CORRECCIÓN: Objeto plano, no anidado
        const updateData = { 
          id: appointment.id,      // ✅ Número directo
          estado: newStatus        // ✅ String directo
        }
        
        console.log('Enviando datos:', updateData) // Debug
        
        const response = await adminBookingsService.updateBooking(updateData)
        
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Estado actualizado',
            text: `La reserva ahora está: ${statusLabels[newStatus]}`,
            confirmButtonColor: '#d946ef',
            timer: 2000
          })
          loadAppointments()
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.message || 'No se pudo actualizar el estado',
            confirmButtonColor: '#d946ef'
          })
        }
      } catch (error) {
        console.error('Error completo:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al actualizar el estado',
          confirmButtonColor: '#d946ef'
        })
      }
    }
  }



  const handleOpenRefundModal = (appointment) => {
    const totalPagado = parseFloat(appointment.monto_adelanto || 0) + 
                       parseFloat(appointment.total_pagado || 0)
    
    setRefundAppointment(appointment)
    setRefundData({
      monto_devuelto: totalPagado.toFixed(2),
      metodo_devolucion: 'efectivo',
      numero_operacion: '',
      motivo: 'Cancelación de servicio',
      fecha_devolucion: new Date().toISOString().split('T')[0],
      notas: ''
    })
    setRefundVoucher(null)
    setShowRefundModal(true)
  }
  
  const handleRefundSubmit = async (e) => {
    e.preventDefault()
    
    if (!refundData.monto_devuelto || parseFloat(refundData.monto_devuelto) <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Monto inválido',
        text: 'Ingrese un monto válido a devolver',
        confirmButtonColor: '#d946ef'
      })
      return
    }
    
    if (refundData.metodo_devolucion !== 'efectivo' && !refundData.numero_operacion.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Número de operación',
        text: 'Ingrese el número de operación de la devolución',
        confirmButtonColor: '#d946ef'
      })
      return
    }
    
    try {
      const formData = new FormData()
      formData.append('reserva_id', refundAppointment.id)
      formData.append('monto_devuelto', refundData.monto_devuelto)
      formData.append('metodo_devolucion', refundData.metodo_devolucion)
      formData.append('numero_operacion', refundData.numero_operacion)
      formData.append('motivo', refundData.motivo)
      formData.append('fecha_devolucion', refundData.fecha_devolucion)
      formData.append('notas', refundData.notas)
      
      if (refundVoucher) {
        formData.append('comprobante', refundVoucher)
      }
      
      const result = await refundsService.createRefund(formData)
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Devolución Procesada',
          html: `
            <p>Se devolvió: <strong>S/ ${refundData.monto_devuelto}</strong></p>
            ${result.data.estado_actualizado === 'devuelto' ? 
              '<p class="text-success">La reserva fue marcada como <strong>DEVUELTO</strong></p>' : 
              '<p>Estado de reserva: <strong>' + refundAppointment.estado.toUpperCase() + '</strong></p>'
            }
          `,
          confirmButtonColor: '#d946ef'
        })
        
        setShowRefundModal(false)
        loadAppointments() // Recargar para ver el nuevo estado
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'No se pudo registrar la devolución',
          confirmButtonColor: '#d946ef'
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al procesar la devolución',
        confirmButtonColor: '#d946ef'
      })
    }
  }




  const handleAssignTherapist = async (appointment) => {
    setSelectedAppointment(appointment)
    setSelectedTherapist(appointment.terapeuta_id)
  
    const result = await reservaTerapeutasService.getTerapeutasByReserva(appointment.id)
    if (result.success && result.data) {
      setAssignedTherapists(result.data)
  
      const ids = result.data.map(t => t.terapeuta_id)
      setSelectedTherapists(ids)
  
      // FORZAR STRING en las keys
      const comisiones = {}
      result.data.forEach(t => {
        comisiones[String(t.terapeuta_id)] = parseFloat(t.porcentaje_comision)
      })
      setTherapistCommissions(comisiones)
    } else {
      setAssignedTherapists([])
      setSelectedTherapists([])
      setTherapistCommissions({})
    }
  
    setShowAssignModal(true)
  }

  const confirmAssignTherapist = async () => {
    if (selectedTherapists.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona al menos un terapeuta',
        confirmButtonColor: '#d946ef'
      })
      return
    }
  
    // Validar que todos tengan comisión asignada
    for (const id of selectedTherapists) {
      if (!therapistCommissions[id] || therapistCommissions[id] <= 0) {
        Swal.fire({
          icon: 'error',
          title: 'Error en comisiones',
          text: 'Todos los terapeutas seleccionados deben tener una comisión mayor a 0%',
          confirmButtonColor: '#d946ef'
        })
        return
      }
    }
  
    // Validar que la suma no exceda 100%
    const totalComision = getTotalCommission()
    if (totalComision > 100) {
      Swal.fire({
        icon: 'error',
        title: 'Comisiones exceden 100%',
        html: `La suma de comisiones es <strong>${totalComision.toFixed(2)}%</strong>.<br>Debe ser máximo 100%`,
        confirmButtonColor: '#d946ef'
      })
      return
    }
  
    try {
      // Obtener terapeutas actuales
      const currentResult = await reservaTerapeutasService.getTerapeutasByReserva(selectedAppointment.id)
      const currentTherapists = currentResult.success && currentResult.data ? currentResult.data : []
      const currentIds = currentTherapists.map(t => t.terapeuta_id)
      
      // Terapeutas a agregar
      const toAdd = selectedTherapists.filter(id => !currentIds.includes(id))
      
      // Terapeutas a remover
      const toRemove = currentTherapists.filter(t => !selectedTherapists.includes(t.terapeuta_id))
      
      // Terapeutas a actualizar (cambió comisión)
      const toUpdate = currentTherapists.filter(t => {
        if (!selectedTherapists.includes(t.terapeuta_id)) return false
        const newCommission = therapistCommissions[t.terapeuta_id]
        return parseFloat(t.porcentaje_comision) !== newCommission
      })
  
      // Agregar nuevos
      for (const terapeutaId of toAdd) {
        await reservaTerapeutasService.addTerapeutaToReserva({
          reserva_id: selectedAppointment.id,
          terapeuta_id: terapeutaId,
          porcentaje_comision: therapistCommissions[terapeutaId]
        })
      }
  
      // Remover deseleccionados
      for (const therapist of toRemove) {
        await reservaTerapeutasService.removeTerapeutaFromReserva(therapist.id)
      }
  
      // Actualizar comisiones
      for (const therapist of toUpdate) {
        await reservaTerapeutasService.updateTerapeutaComision(
          therapist.id,
          therapistCommissions[therapist.terapeuta_id]
        )
      }
  
      // Confirmar cita si estaba pendiente
      if (selectedAppointment.estado === 'pendiente') {
        await adminBookingsService.updateBooking(selectedAppointment.id, {
          estado: 'confirmada'
        })
      }
  
      Swal.fire({
        icon: 'success',
        title: 'Terapeutas Asignados',
        text: `${selectedTherapists.length} terapeuta(s) asignado(s) correctamente`,
        confirmButtonColor: '#d946ef',
        timer: 2000
      })
  
      loadAppointments()
      setShowAssignModal(false)
      
    } catch (error) {
      console.error('Error asignando terapeutas:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo completar la asignación',
        confirmButtonColor: '#d946ef'
      })
    }
  }

  const handleDelete = (appointment) => {
    setSelectedAppointment(appointment)
    setConfirmAction({ type: 'delete' })
    setShowConfirm(true)
  }

  const handleViewVoucher = (appointment) => {
    setSelectedAppointment(appointment)
    setShowVoucherModal(true)
  }


  const handleRegisterPayment = (appointment) => {
    setSelectedPaymentAppointment(appointment)
    setShowPaymentModal(true)
  }
  
  const handlePaymentSuccess = () => {
    loadAppointments()
    setShowPaymentModal(false)
    setSelectedPaymentAppointment(null)
  }



  const confirmActionHandler = async () => {
    if (confirmAction.type === 'status') {
      const result = await adminBookingsService.updateBooking(
        selectedAppointment.id,
        { estado: confirmAction.newStatus }
      )

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Estado Actualizado',
          text: `La cita ahora está ${confirmAction.newStatus}`,
          confirmButtonColor: '#d946ef',
          timer: 2000
        })
        loadAppointments()
      }
    } else if (confirmAction.type === 'delete') {
      const result = await adminBookingsService.deleteBooking(selectedAppointment.id)

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Cita Eliminada',
          text: 'La cita ha sido eliminada correctamente',
          confirmButtonColor: '#d946ef',
          timer: 2000
        })
        loadAppointments()
      }
    }

    setShowConfirm(false)
    setSelectedAppointment(null)
    setConfirmAction(null)
  }

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailModal(true)
  }

  const exportToCSV = () => {
    const headers = [
      'Código', 'Cliente', 'Email', 'Teléfono', 'Servicio', 'Terapeuta',
      'Fecha', 'Hora', 'Duración', 'Precio Total', 'Adelanto (40%)', 'Estado', 
      'Estado Pago', 'Nro Operación', 'Método Pago'
    ]
    
    const rows = filteredAppointments.map(apt => [
      apt.codigo,
      apt.nombre_cliente,
      apt.email_cliente,
      apt.telefono_cliente,
      apt.servicio_nombre,
      apt.terapeuta_nombre || 'Sin asignar',
      apt.fecha_reserva,
      apt.hora_inicio,
      apt.duracion + ' min',
      apt.precio_servicio,
      apt.monto_adelanto || 0,
      apt.estado,
      apt.estado_pago,
      apt.numero_operacion || '',
      apt.metodo_pago
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `citas_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    Swal.fire({
      icon: 'success',
      title: 'Exportado',
      text: 'El archivo CSV se ha descargado correctamente',
      confirmButtonColor: '#d946ef',
      timer: 2000
    })
  }

  const filteredAppointments = appointments
    .filter(apt => {
      const matchesSearch = 
        apt.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.email_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.telefono_cliente.includes(searchTerm) ||
        apt.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.servicio_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (apt.numero_operacion && apt.numero_operacion.includes(searchTerm))

      const matchesStatus = statusFilter === 'all' || apt.estado === statusFilter
      const matchesPayment = paymentStatusFilter === 'all' || apt.estado_pago === paymentStatusFilter

      const today = new Date().toISOString().split('T')[0]
      const matchesDate = 
        dateFilter === 'all' ||
        (dateFilter === 'today' && apt.fecha_reserva === today) ||
        (dateFilter === 'upcoming' && apt.fecha_reserva >= today) ||
        (dateFilter === 'past' && apt.fecha_reserva < today)

      return matchesSearch && matchesStatus && matchesPayment && matchesDate
    })
    .sort((a, b) => {
      if (sortBy === 'fecha_desc') {
        return new Date(b.fecha_reserva + ' ' + b.hora_inicio) - new Date(a.fecha_reserva + ' ' + a.hora_inicio)
      } else if (sortBy === 'fecha_asc') {
        return new Date(a.fecha_reserva + ' ' + a.hora_inicio) - new Date(b.fecha_reserva + ' ' + b.hora_inicio)
      } else if (sortBy === 'precio_desc') {
        return b.precio_servicio - a.precio_servicio
      } else if (sortBy === 'precio_asc') {
        return a.precio_servicio - b.precio_servicio
      }
      return 0
    })

  const stats = {
    total: appointments.length,
    pendiente: appointments.filter(a => a.estado === 'pendiente').length,
    confirmada: appointments.filter(a => a.estado === 'confirmada').length,
    completada: appointments.filter(a => a.estado === 'completada').length,
    cancelada: appointments.filter(a => a.estado === 'cancelada').length,
    totalRevenue: appointments
      .filter(a => a.estado === 'completada')
      .reduce((sum, a) => sum + parseFloat(a.precio_servicio), 0),
    totalAdelantos: appointments
      .filter(a => a.monto_adelanto)
      .reduce((sum, a) => sum + parseFloat(a.monto_adelanto), 0)
  }



  const toggleTherapistSelection = (terapeutaId) => {
    const key = String(terapeutaId)
    const isCurrentlySelected = selectedTherapists.includes(terapeutaId)
  
    if (isCurrentlySelected) {
      // Remover
      setSelectedTherapists(prev => prev.filter(id => id !== terapeutaId))
      setTherapistCommissions(prev => {
        const updated = { ...prev }
        delete updated[key]
        return updated
      })
    } else {
      // Agregar con 40% por defecto
      setSelectedTherapists(prev => [...prev, terapeutaId])
      setTherapistCommissions(prev => ({
        ...prev,
        [key]: prev[key] !== undefined ? prev[key] : 40.00
      }))
    }
  }
  
  const updateTherapistCommission = (key, valor) => {
    const strKey = String(key)
    if (valor === '' || valor === '-') {
      setTherapistCommissions(prev => ({ ...prev, [strKey]: valor }))
      return
    }
    const parsed = parseFloat(valor)
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      setTherapistCommissions(prev => ({ ...prev, [strKey]: parsed }))
    }
  }

  const getTotalCommission = () => {
    return selectedTherapists.reduce((sum, id) => {
      const key = String(id)
      const val = therapistCommissions[key]
      return sum + (parseFloat(val) || 0)
    }, 0)
  }



  // Pagination
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + itemsPerPage)

  if (loading) {
    return (
      <div className="admin-orders-loading">
        <div className="spinner-large"></div>
        <p>Cargando citas...</p>
      </div>
    )
  }

  return (
    <div className="admin-orders-page">
      {/* Header */}
      <div className="orders-header">
        <div>
          <h1 className="orders-title">Gestión de Citas</h1>
          <p className="orders-subtitle">Administra todas las reservas del spa</p>
        </div>
        <div className="orders-actions">

        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
      <FiPlus /> Nueva Cita
    </button>

          <button className="btn btn-outline" onClick={loadAppointments}>
            <FiRefreshCw />
            Actualizar
          </button>
          <button className="btn btn-outline" onClick={exportToCSV}>
            <FiDownload />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="orders-stats">
        <div className="stat-card-orders stat-total">
          <div className="stat-icon-orders">
            <FiCalendar />
          </div>
          <div className="stat-content-orders">
            <div className="stat-value-orders">{stats.total}</div>
            <div className="stat-label-orders">Total Citas</div>
          </div>
        </div>

        <div className="stat-card-orders stat-pending">
          <div className="stat-icon-orders">
            <FiClock />
          </div>
          <div className="stat-content-orders">
            <div className="stat-value-orders">{stats.pendiente}</div>
            <div className="stat-label-orders">Pendientes</div>
          </div>
        </div>

        <div className="stat-card-orders stat-confirmed">
          <div className="stat-icon-orders">
            <FiCheckCircle />
          </div>
          <div className="stat-content-orders">
            <div className="stat-value-orders">{stats.confirmada}</div>
            <div className="stat-label-orders">Confirmadas</div>
          </div>
        </div>

        <div className="stat-card-orders stat-completed">
          <div className="stat-icon-orders">
            <FiCheck />
          </div>
          <div className="stat-content-orders">
            <div className="stat-value-orders">{stats.completada}</div>
            <div className="stat-label-orders">Completadas</div>
          </div>
        </div>

        <div className="stat-card-orders stat-cancelled">
          <div className="stat-icon-orders">
            <FiXCircle />
          </div>
          <div className="stat-content-orders">
            <div className="stat-value-orders">{stats.cancelada}</div>
            <div className="stat-label-orders">Canceladas</div>
          </div>
        </div>

        <div className="stat-card-orders stat-revenue">
          <div className="stat-icon-orders">
            <FiDollarSign />
          </div>
          <div className="stat-content-orders">
            <div className="stat-value-orders">{formatPrice(stats.totalRevenue)}</div>
            <div className="stat-label-orders">Ingresos</div>
          </div>
        </div>

        <div className="stat-card-orders stat-advance">
          <div className="stat-icon-orders">
            <FiCreditCard />
          </div>
          <div className="stat-content-orders">
            <div className="stat-value-orders">{formatPrice(stats.totalAdelantos)}</div>
            <div className="stat-label-orders">Adelantos</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="orders-filters">
        <div className="search-box-orders">
          <FiSearch />
          <input
            type="text"
            placeholder="Buscar por cliente, email, código, nro operación..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="filters-row">
          <div className="filter-group-orders">
            <FiFilter />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select-orders"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="en_curso">En Curso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
              <option value="no_asistio">No Asistió</option>
            </select>
          </div>

          <div className="filter-group-orders">
            <FiCreditCard />
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="filter-select-orders"
            >
              <option value="all">Estado de pago</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className="filter-group-orders">
            <FiCalendar />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-select-orders"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="upcoming">Próximas</option>
              <option value="past">Pasadas</option>
            </select>
          </div>

          <div className="filter-group-orders">
            <span>Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select-orders"
            >
              <option value="fecha_desc">Fecha (más reciente)</option>
              <option value="fecha_asc">Fecha (más antigua)</option>
              <option value="precio_desc">Precio (mayor)</option>
              <option value="precio_asc">Precio (menor)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-info">
        Mostrando <strong>{paginatedAppointments.length}</strong> de <strong>{filteredAppointments.length}</strong> citas
      </div>

      {/* Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Fecha & Hora</th>
              <th>Terapeuta</th>
              <th>Precio</th>
              <th>Pago</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
          {paginatedAppointments.map((appointment, index) => {
  const statusInfo = getStatusInfo(appointment.estado)
  const paymentInfo = getPaymentStatusInfo(appointment.estado_pago)
  const StatusIcon = statusInfo.icon
  const isExpanded = expandedRow === appointment.id

              return (
                <React.Fragment key={appointment.id}>
                  <tr className={`table-row ${isExpanded ? 'expanded' : ''}`}>
                    <td>
                      <div className="code-cell">
                        <span className="code-text">{appointment.codigo}</span>
                      </div>
                    </td>
                    <td>
                      <div className="client-cell">
                        <div className="client-avatar">
                          {appointment.nombre_cliente.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="client-info">
                          <div className="client-name">{appointment.nombre_cliente}</div>
                          <div className="client-email">{appointment.email_cliente}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="service-cell">
                        {appointment.servicio_nombre}
                        <span className="duration-badge">{appointment.duracion} min</span>
                      </div>
                    </td>
                    <td>
                      <div className="datetime-cell">
                        <div className="date-text">
                          <FiCalendar />
                          {formatDateLong(appointment.fecha_reserva)}
                        </div>
                        <div className="time-text">
                          <FiClock />
                          {appointment.hora_inicio}
                        </div>
                      </div>
                    </td>
                    <td>
  <div className="therapist-cell">
    {appointment.terapeutas_nombres ? (
      <div className="therapist-list-cell">
        <div className="therapist-names">
          <FiUser />
          <span>{appointment.terapeutas_nombres}</span>
        </div>
        <button
          className="btn-manage-therapists"
          onClick={() => handleAssignTherapist(appointment)}
          title="Gestionar terapeutas"
        >
          <FiEdit2 />
          Gestionar ({appointment.total_terapeutas})
        </button>
      </div>
    ) : appointment.terapeuta_nombre ? (
      <div className="therapist-list-cell">
        <div className="therapist-names">
          <FiUser />
          <span>{appointment.terapeuta_nombre}</span>
        </div>
        <button
          className="btn-manage-therapists"
          onClick={() => handleAssignTherapist(appointment)}
          title="Gestionar terapeutas"
        >
          <FiEdit2 />
          Gestionar
        </button>
      </div>
    ) : (
      <button
        className="btn-assign-therapist"
        onClick={() => handleAssignTherapist(appointment)}
      >
        <FiUserCheck />
        Asignar
      </button>
    )}
  </div>
</td>
                    <td>
                      <div className="price-cell">
                        <div className="price-total">{formatPrice(appointment.precio_servicio)}</div>
                        {appointment.monto_adelanto && (
                          <div className="price-advance">
                            Adelanto: {formatPrice(appointment.monto_adelanto)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="payment-cell">
                        <span className={`payment-badge ${paymentInfo.class}`}>
                          {paymentInfo.label}
                        </span>
                        {appointment.voucher_url && (
                          <button
                            className="btn-view-voucher"
                            onClick={() => handleViewVoucher(appointment)}
                            title="Ver voucher"
                          >
                            <FiImage />
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge-table ${statusInfo.class}`}>
                        <StatusIcon />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>
  <div className="actions-cell">
    <button
      className="btn-action view"
      onClick={() => handleViewDetails(appointment)}
      title="Ver detalles"
    >
      <FiEye />
    </button>
    <button
      className="btn-action expand"
      onClick={() => setExpandedRow(isExpanded ? null : appointment.id)}
      title={isExpanded ? 'Contraer' : 'Expandir'}
    >
      {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
    </button>
    
    {/* REEMPLAZAR TODO ESTO: */}
    <SmartDropdown>
      {/* Asignar terapeuta solo si no tiene ninguno */}
      {!appointment.terapeuta_id && !appointment.terapeutas_nombres && (
        <button 
          className="dropdown-smart-item"
          onClick={() => handleAssignTherapist(appointment)}
        >
          <FiUserCheck /> Asignar Terapeuta
        </button>
      )}

      {/* Registrar pago si hay saldo pendiente */}
      {appointment.saldo_pendiente > 0 && appointment.estado !== 'cancelada' && (
        <button 
          className="dropdown-smart-item"
          onClick={() => handleRegisterPayment(appointment)}
        >
          <FiCreditCard /> Registrar Pago
        </button>
      )}

      {/* Botón de Devolución */}
      {(parseFloat(appointment.monto_adelanto || 0) + parseFloat(appointment.total_pagado || 0) > 0) && 
 !['completada', 'cancelada', 'devuelto'].includes(appointment.estado) && (
        <button 
          className="dropdown-smart-item variant-warning"
          onClick={() => handleOpenRefundModal(appointment)}
        >
          <FiArrowLeft /> Procesar Devolución
        </button>
      )}
      
      {/* Estados: Pendiente → Confirmada */}
      {appointment.estado === 'pendiente' && (
        <button 
          className="dropdown-smart-item variant-success"
          onClick={() => handleStatusChange(appointment, 'confirmada')}
        >
          <FiCheck /> Confirmar
        </button>
      )}
      
      {/* Estados: Confirmada → En Curso */}
      {appointment.estado === 'confirmada' && (
        <button 
          className="dropdown-smart-item"
          onClick={() => handleStatusChange(appointment, 'en_curso')}
        >
          <FiRefreshCw /> En Curso
        </button>
      )}
      
      {/* Estados: En Curso o Confirmada → Completada */}
      {(appointment.estado === 'en_curso' || appointment.estado === 'confirmada') && (
        <button 
          className="dropdown-smart-item variant-success"
          onClick={() => handleStatusChange(appointment, 'completada')}
        >
          <FiCheckCircle /> Completar
        </button>
      )}
      
      {/* Cancelar (excepto si ya está cancelada o completada) */}
      {appointment.estado !== 'cancelada' && appointment.estado !== 'completada' && (
        <button 
          className="dropdown-smart-item"
          onClick={() => handleStatusChange(appointment, 'cancelada')}
        >
          <FiX /> Cancelar
        </button>
      )}
      
      {/* No Asistió (solo desde confirmada) */}
      {appointment.estado === 'confirmada' && (
        <button 
          className="dropdown-smart-item"
          onClick={() => handleStatusChange(appointment, 'no_asistio')}
        >
          <FiAlertCircle /> No Asistió
        </button>
      )}
      
      {/* Eliminar siempre disponible */}
      <button 
        className="dropdown-smart-item variant-danger"
        onClick={() => handleDelete(appointment)}
      >
        <FiTrash2 /> Eliminar
      </button>
    </SmartDropdown>
  </div>
</td>
                  </tr>

                  {isExpanded && (
                    <tr className="expanded-row">
                      <td colSpan="9">
                        <div className="expanded-content">
                          <div className="expanded-grid">
                            <div className="expanded-section">
                              <h4><FiUser /> Información del Cliente</h4>
                              <div className="info-grid">
                                <div className="info-item">
                                  <FiUser />
                                  <div>
                                    <span className="info-label">Nombre</span>
                                    <span className="info-value">{appointment.nombre_cliente}</span>
                                  </div>
                                </div>
                                <div className="info-item">
                                  <FiMail />
                                  <div>
                                    <span className="info-label">Email</span>
                                    <span className="info-value">{appointment.email_cliente}</span>
                                  </div>
                                </div>
                                <div className="info-item">
                                  <FiPhone />
                                  <div>
                                    <span className="info-label">Teléfono</span>
                                    <span className="info-value">{appointment.telefono_cliente}</span>
                                  </div>
                                  
                                </div>


                                <div className="info-item">
                                 
                                  <FiCreditCard />
                  <div>
                    <span className="info-label">DNI</span>
                    <span className="info-value">{appointment.dni_cliente}</span>
                  </div>
                                </div>

                              </div>
                            </div>

                            <div className="expanded-section">
                              <h4><FiCreditCard /> Información de Pago</h4>
                              <div className="info-grid">
                                <div className="info-item">
                                  <span className="info-label">Método</span>
                                  <span className="info-value">{appointment.metodo_pago || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                  <span className="info-label">Estado Pago</span>
                                  <span className={`info-value badge-${paymentInfo.class}`}>
                                    {paymentInfo.label}
                                  </span>
                                </div>
                                <div className="info-item">
                                  <span className="info-label">Nro Operación</span>
                                  <span className="info-value">{appointment.numero_operacion || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                  <span className="info-label">Precio Total</span>
                                  <span className="info-value price-highlight">{formatPrice(appointment.precio_servicio)}</span>
                                </div>
                                <div className="info-item">
                                  <span className="info-label">Adelanto (40%)</span>
                                  <span className="info-value">{formatPrice(appointment.monto_adelanto || 0)}</span>
                                </div>
                                <div className="info-item">
                                  <span className="info-label">Saldo Pendiente</span>
                                  <span className="info-value">
                                    {formatPrice(appointment.precio_servicio - (appointment.monto_adelanto || 0))}
                                  </span>
                                </div>
                              </div>
                              {appointment.voucher_url && (
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => handleViewVoucher(appointment)}
                                >
                                  <FiImage /> Ver Voucher
                                </button>
                              )}
                            </div>
                          </div>

                          {appointment.notas && (
                            <div className="expanded-section">
                              <h4><FiAlertCircle /> Notas del Cliente</h4>
                              <p className="notes-text">{appointment.notas}</p>
                            </div>
                          )}

                          {appointment.notas_internas && (
                            <div className="expanded-section">
                              <h4><FiAlertCircle /> Notas Internas</h4>
                              <p className="notes-text internal">{appointment.notas_internas}</p>
                            </div>
                          )}

                          <div className="expanded-section">
                            <h4><FiClock /> Información Adicional</h4>
                            <div className="info-grid">
                              <div className="info-item">
                                <span className="info-label">Código de Reserva</span>
                                <span className="info-value">{appointment.codigo}</span>
                              </div>
                              <div className="info-item">
                                <span className="info-label">Fecha de Creación</span>
                                <span className="info-value">{formatDateTime(appointment.fecha_creacion)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>

        {paginatedAppointments.length === 0 && (
          <div className="empty-state-orders">
            <div className="empty-icon-orders">📅</div>
            <h3>No se encontraron citas</h3>
            <p>Intenta con otros filtros de búsqueda</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-orders">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal de Detalles */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detalles de la Cita"
        size="large"
      >
        {selectedAppointment && (
          <div className="appointment-detail-modal">
            <div className="detail-header">
              <div className="detail-code">
                <FiCalendar />
                <span>{selectedAppointment.codigo}</span>
              </div>
              <span className={`status-badge-modal ${getStatusInfo(selectedAppointment.estado).class}`}>
                {React.createElement(getStatusInfo(selectedAppointment.estado).icon)}
                {getStatusInfo(selectedAppointment.estado).label}
              </span>
            </div>

            <div className="detail-sections">
              <div className="detail-section">
                <h3><FiUser /> Cliente</h3>
                <div className="detail-info">
                  <div className="detail-row">
                    <span className="detail-label">Nombre:</span>
                    <span className="detail-value">{selectedAppointment.nombre_cliente}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedAppointment.email_cliente}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Teléfono:</span>
                    <span className="detail-value">{selectedAppointment.telefono_cliente}</span>
                  </div>

                  {selectedAppointment.dni_cliente && (
      <div className="detail-row">
        <span className="detail-label">DNI:</span>
        <span className="detail-value">{selectedAppointment.dni_cliente}</span>
      </div>
    )}

                </div>
              </div>

              <div className="detail-section">
                <h3><FiCalendar /> Servicio</h3>
                <div className="detail-info">
                  <div className="detail-row">
                    <span className="detail-label">Servicio:</span>
                    <span className="detail-value">{selectedAppointment.servicio_nombre}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Terapeuta:</span>
                    <span className="detail-value">{selectedAppointment.terapeuta_nombre || 'Sin asignar'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Duración:</span>
                    <span className="detail-value">{selectedAppointment.duracion} minutos</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3><FiCreditCard /> Pago</h3>
                <div className="detail-info">
                  <div className="detail-row">
                    <span className="detail-label">Precio Total:</span>
                    <span className="detail-value price">{formatPrice(selectedAppointment.precio_servicio)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Adelanto (40%):</span>
                    <span className="detail-value">{formatPrice(selectedAppointment.monto_adelanto || 0)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Saldo Pendiente:</span>
                    <span className="detail-value">
                      {formatPrice(selectedAppointment.precio_servicio - (selectedAppointment.monto_adelanto || 0))}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Método de Pago:</span>
                    <span className="detail-value">{selectedAppointment.metodo_pago || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Estado de Pago:</span>
                    <span className={`detail-value badge-${getPaymentStatusInfo(selectedAppointment.estado_pago).class}`}>
                      {getPaymentStatusInfo(selectedAppointment.estado_pago).label}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Nro de Operación:</span>
                    <span className="detail-value">{selectedAppointment.numero_operacion || 'N/A'}</span>
                  </div>
                </div>
                {selectedAppointment.voucher_url && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleViewVoucher(selectedAppointment)}
                  >
                    <FiImage /> Ver Voucher
                  </button>
                )}
              </div>

              <div className="detail-section">
                <h3><FiClock /> Fecha y Hora</h3>
                <div className="detail-info">
                  <div className="detail-row">
                    <span className="detail-label">Fecha:</span>
                    <span className="detail-value">{formatDateLong(selectedAppointment.fecha_reserva)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Hora de Inicio:</span>
                    <span className="detail-value">{selectedAppointment.hora_inicio}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Hora de Fin:</span>
                    <span className="detail-value">{selectedAppointment.hora_fin}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Registrado:</span>
                    <span className="detail-value">{formatDateTime(selectedAppointment.fecha_creacion)}</span>
                  </div>
                </div>
              </div>

              {selectedAppointment.notas && (
                <div className="detail-section">
                  <h3><FiAlertCircle /> Notas del Cliente</h3>
                  <div className="notes-box">
                    {selectedAppointment.notas}
                  </div>
                </div>
              )}

              {selectedAppointment.notas_internas && (
                <div className="detail-section">
                  <h3><FiAlertCircle /> Notas Internas</h3>
                  <div className="notes-box internal">
                    {selectedAppointment.notas_internas}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowDetailModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      
     {/* Modal de Asignar Terapeuta */}
{/* Modal de Asignar Terapeutas - NUEVO */}
<Modal
  isOpen={showAssignModal}
  onClose={() => setShowAssignModal(false)}
  title="Asignar Terapeutas"
  size="large"
>
  {selectedAppointment && (
    <div className="tam-wrapper">

      {/* Info de la cita */}
      <div className="tam-booking-card">
        <div className="tam-booking-row">
          <div className="tam-booking-field">
            <span className="tam-booking-label">Cliente</span>
            <span className="tam-booking-value">{selectedAppointment.nombre_cliente}</span>
          </div>
          <div className="tam-booking-field">
            <span className="tam-booking-label">Servicio</span>
            <span className="tam-booking-value">{selectedAppointment.servicio_nombre}</span>
          </div>
          <div className="tam-booking-field">
            <span className="tam-booking-label">Fecha</span>
            <span className="tam-booking-value">
              {formatDateLong(selectedAppointment.fecha_reserva)} · {selectedAppointment.hora_inicio}
            </span>
          </div>
          <div className="tam-booking-field">
            <span className="tam-booking-label">Precio Total</span>
            <span className="tam-booking-value tam-price">{formatPrice(selectedAppointment.precio_servicio)}</span>
          </div>
        </div>
      </div>

      {/* Barra de progreso de comisiones */}
      <div className="tam-commission-bar-wrapper">
        <div className="tam-commission-bar-header">
          <span className="tam-commission-bar-title">
            <FiDollarSign />
            Distribución de Comisiones
          </span>
          <span className={`tam-commission-bar-total ${
            getTotalCommission() > 100 ? 'tam-over' :
            getTotalCommission() === 100 ? 'tam-full' : 'tam-partial'
          }`}>
            {getTotalCommission().toFixed(1)}% / 100%
          </span>
        </div>
        <div className="tam-commission-track">
          <div
            className={`tam-commission-fill ${
              getTotalCommission() > 100 ? 'tam-fill-over' :
              getTotalCommission() === 100 ? 'tam-fill-full' : 'tam-fill-partial'
            }`}
            style={{ width: `${Math.min(getTotalCommission(), 100)}%` }}
          />
          {[25, 50, 75].map(mark => (
            <div key={mark} className="tam-track-mark" style={{ left: `${mark}%` }}>
              <span>{mark}%</span>
            </div>
          ))}
        </div>
        <div className="tam-commission-hint">
          {getTotalCommission() > 100 && (
            <span className="tam-hint-error">
              <FiAlertCircle /> Excede el 100% en {(getTotalCommission() - 100).toFixed(1)}%
            </span>
          )}
          {getTotalCommission() < 100 && (
            <span className="tam-hint-warning">
              Disponible: {(100 - getTotalCommission()).toFixed(1)}%
              · {formatPrice(selectedAppointment.precio_servicio * (100 - getTotalCommission()) / 100)}
            </span>
          )}
          {getTotalCommission() === 100 && (
            <span className="tam-hint-success">
              <FiCheckCircle /> Comisiones al 100% — todo distribuido
            </span>
          )}
        </div>
      </div>

      {/* Lista terapeutas */}
      <div className="tam-section-label">
        <FiUsers />
        Selecciona uno o más terapeutas
      </div>

      <div className="tam-therapist-list">
        {therapists.map(therapist => {
          const isSelected = selectedTherapists.includes(therapist.id)
          const key = String(therapist.id)
          const pct = therapistCommissions[key] !== undefined
            ? parseFloat(therapistCommissions[key]) || 0
            : 40
          const monto = (parseFloat(selectedAppointment.precio_servicio) * pct) / 100

          return (
            <div
              key={therapist.id}
              className={`tam-therapist-row ${isSelected ? 'tam-therapist-selected' : ''}`}
            >
              {/* Botón toggle - solo esta zona selecciona/deselecciona */}
              <button
                type="button"
                className="tam-therapist-toggle"
                onClick={() => toggleTherapistSelection(therapist.id)}
              >
                <div className={`tam-check-box ${isSelected ? 'tam-checked' : ''}`}>
                  {isSelected && <FiCheck />}
                </div>
                <div className="tam-therapist-avatar">
                  {therapist.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="tam-therapist-meta">
                  <span className="tam-therapist-name">{therapist.nombre}</span>
                  <span className="tam-therapist-spec">{therapist.especialidad}</span>
                </div>
                <div className="tam-therapist-rating">
                  ⭐ {therapist.rating || '5.0'}
                </div>
              </button>

              {/* Zona comisión - completamente separada del toggle */}
              {isSelected && (
                <div
                  className="tam-commission-zone"
                  onClickCapture={(e) => e.stopPropagation()}
                  onMouseDownCapture={(e) => e.stopPropagation()}
                  onPointerDownCapture={(e) => e.stopPropagation()}
                >
                  <div className="tam-commission-label">Comisión</div>
                  <div className="tam-commission-control">
                    <input
                      type="number"
                      className="tam-pct-input"
                      min="0"
                      max="100"
                      step="0.5"
                      value={pct}
                      onChange={(e) => updateTherapistCommission(key, e.target.value)}
                      onFocus={(e) => e.target.select()}
                    />
                    <span className="tam-pct-symbol">%</span>
                  </div>
                  <div className="tam-commission-monto">{formatPrice(monto)}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Resumen */}
      {selectedTherapists.length > 0 && (
        <div className="tam-summary">
          <div className="tam-summary-title">
            <FiCheckCircle />
            Resumen
          </div>
          <div className="tam-summary-rows">
            {selectedTherapists.map(id => {
              const t = therapists.find(x => x.id === id)
              const key = String(id)
              const pct = parseFloat(therapistCommissions[key]) || 0
              const monto = (selectedAppointment.precio_servicio * pct) / 100
              return (
                <div key={id} className="tam-summary-row">
                  <span className="tam-summary-name">{t?.nombre}</span>
                  <span className="tam-summary-pct">{pct.toFixed(1)}%</span>
                  <span className="tam-summary-monto">{formatPrice(monto)}</span>
                </div>
              )
            })}
          </div>
          <div className="tam-summary-footer">
            <span>Total comisiones</span>
            <span className={`tam-summary-total ${getTotalCommission() > 100 ? 'tam-over' : ''}`}>
              {getTotalCommission().toFixed(1)}%
              <em>{formatPrice(selectedAppointment.precio_servicio * getTotalCommission() / 100)}</em>
            </span>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="tam-actions">
        <button
          type="button"
          className="tam-btn-cancel"
          onClick={() => setShowAssignModal(false)}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="tam-btn-confirm"
          onClick={confirmAssignTherapist}
          disabled={selectedTherapists.length === 0 || getTotalCommission() > 100}
        >
          <FiUserCheck />
          Asignar {selectedTherapists.length > 0
            ? `${selectedTherapists.length} terapeuta${selectedTherapists.length !== 1 ? 's' : ''}`
            : 'terapeutas'
          }
        </button>
      </div>

    </div>
  )}
</Modal>





{/* Modal de Devolución */}
<Modal
  isOpen={showRefundModal}
  onClose={() => setShowRefundModal(false)}
  title="Procesar Devolución"
  size="medium"
>
  {refundAppointment && (
    <form onSubmit={handleRefundSubmit} className="refund-modal">
      {/* Info de la reserva */}
      <div className="refund-info-card">
        <h4>Información de la Reserva</h4>
        <div className="refund-info-grid">
          <div className="refund-info-item">
            <span className="label">Código:</span>
            <span className="value">{refundAppointment.codigo}</span>
          </div>
          <div className="refund-info-item">
            <span className="label">Cliente:</span>
            <span className="value">{refundAppointment.nombre_cliente}</span>
          </div>
          <div className="refund-info-item">
            <span className="label">Servicio:</span>
            <span className="value">{refundAppointment.servicio_nombre}</span>
          </div>
          <div className="refund-info-item">
            <span className="label">Total pagado:</span>
            <span className="value highlight">
              S/ {(parseFloat(refundAppointment.monto_adelanto || 0) + 
                   parseFloat(refundAppointment.total_pagado || 0)).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Formulario de devolución */}
      <div className="refund-form">
        <div className="form-group">
          <label>Monto a Devolver *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className="form-input"
            value={refundData.monto_devuelto}
            onChange={(e) => setRefundData({ ...refundData, monto_devuelto: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Método de Devolución *</label>
          <select
            className="form-select"
            value={refundData.metodo_devolucion}
            onChange={(e) => setRefundData({ ...refundData, metodo_devolucion: e.target.value })}
            required
          >
            <option value="efectivo">💵 Efectivo</option>
            <option value="transferencia">🏦 Transferencia Bancaria</option>
            <option value="yape">📱 Yape</option>
            <option value="plin">📱 Plin</option>
          </select>
        </div>

        {refundData.metodo_devolucion !== 'efectivo' && (
          <div className="form-group">
            <label>Número de Operación *</label>
            <input
              type="text"
              className="form-input"
              value={refundData.numero_operacion}
              onChange={(e) => setRefundData({ ...refundData, numero_operacion: e.target.value })}
              placeholder="Ej: 123456789"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Fecha de Devolución *</label>
          <input
            type="date"
            className="form-input"
            value={refundData.fecha_devolucion}
            onChange={(e) => setRefundData({ ...refundData, fecha_devolucion: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Motivo *</label>
          <textarea
            className="form-textarea"
            rows="3"
            value={refundData.motivo}
            onChange={(e) => setRefundData({ ...refundData, motivo: e.target.value })}
            placeholder="Cancelación de servicio, insatisfacción, etc."
            required
          />
        </div>

        <div className="form-group">
          <label>Comprobante de Devolución</label>
          <input
            type="file"
            className="form-input"
            accept="image/*,.pdf"
            onChange={(e) => setRefundVoucher(e.target.files[0])}
          />
          <small className="form-hint">Opcional: Captura o PDF del comprobante</small>
        </div>

        <div className="form-group">
          <label>Notas Adicionales</label>
          <textarea
            className="form-textarea"
            rows="2"
            value={refundData.notas}
            onChange={(e) => setRefundData({ ...refundData, notas: e.target.value })}
            placeholder="Información adicional sobre la devolución"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="modal-actions">
        <button 
          type="button" 
          className="btn btn-secondary"
          onClick={() => setShowRefundModal(false)}
        >
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          <FiCheck /> Registrar Devolución
        </button>
      </div>
    </form>
  )}
</Modal>







{/* Modal de Crear Cita Manual */}
<Modal
  isOpen={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  title="Crear Cita Manual"
  size="large"
>
  <form onSubmit={handleCreateSubmit} className="create-booking-form">
    <div className="create-form-grid">
      {/* Columna Izquierda: Servicio y Cliente */}
      <div className="create-form-section">
        <h3><FiCalendar /> Servicio</h3>
        
        <div className="form-group">
          <label>Servicio *</label>
          <select
            name="servicio_id"
            value={createFormData.servicio_id}
            onChange={handleCreateFormChange}
            className={`form-select ${createErrors.servicio_id ? 'error' : ''}`}
          >
            <option value="">Seleccionar servicio</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.nombre} - {formatPrice(service.precio)} ({service.duracion} min)
              </option>
            ))}
          </select>
          {createErrors.servicio_id && <span className="form-error">{createErrors.servicio_id}</span>}
        </div>

        {selectedServiceForCreate && (
          <div className="service-preview-card">
            <h4>{selectedServiceForCreate.nombre}</h4>
            <div className="service-preview-details">
              <span>💰 {formatPrice(selectedServiceForCreate.precio)}</span>
              <span>⏱️ {selectedServiceForCreate.duracion} min</span>
              <span>📂 {selectedServiceForCreate.categoria_nombre}</span>
            </div>
          </div>
        )}

        <h3><FiUser /> Datos del Cliente</h3>
        
        <div className="form-group">
          <label>Nombre Completo *</label>
          <input
            type="text"
            name="nombre_cliente"
            value={createFormData.nombre_cliente}
            onChange={handleCreateFormChange}
            className={`form-input ${createErrors.nombre_cliente ? 'error' : ''}`}
            placeholder="Nombre completo del cliente"
          />
          {createErrors.nombre_cliente && <span className="form-error">{createErrors.nombre_cliente}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email_cliente"
              value={createFormData.email_cliente}
              onChange={handleCreateFormChange}
              className={`form-input ${createErrors.email_cliente ? 'error' : ''}`}
              placeholder="cliente@email.com"
            />
            {createErrors.email_cliente && <span className="form-error">{createErrors.email_cliente}</span>}
          </div>

          <div className="form-group">
            <label>Teléfono *</label>
            <input
              type="tel"
              name="telefono_cliente"
              value={createFormData.telefono_cliente}
              onChange={handleCreateFormChange}
              className={`form-input ${createErrors.telefono_cliente ? 'error' : ''}`}
              placeholder="999999999"
              maxLength={9}
            />
            {createErrors.telefono_cliente && <span className="form-error">{createErrors.telefono_cliente}</span>}
          </div>
        </div>

       
       

{/* ← SECCIÓN ACTUALIZADA */}
<div className="form-row">
  <div className="form-group">
    <label>Tipo de Documento *</label>
    <select
      name="tipo_documento"
      value={createFormData.tipo_documento}
      onChange={handleCreateFormChange}
      className="form-select"
    >
      <option value="DNI">DNI</option>
      <option value="RUC">RUC</option>
      <option value="CE">Carné de Extranjería</option>
      <option value="PASAPORTE">Pasaporte</option>
    </select>
  </div>

  <div className="form-group">
    <label>Número de Documento *</label>
    <input
      type="text"
      name="numero_documento"
      value={createFormData.numero_documento}
      onChange={handleCreateFormChange}
      className={`form-input ${createErrors.numero_documento ? 'error' : ''}`}
      placeholder={getDocumentoPlaceholder(createFormData.tipo_documento)}
      maxLength={getDocumentoLength(createFormData.tipo_documento)}
    />
    {createErrors.numero_documento && <span className="form-error">{createErrors.numero_documento}</span>}
    <small className="form-hint">
      {createFormData.tipo_documento === 'DNI' && '8 dígitos'}
      {createFormData.tipo_documento === 'RUC' && '11 dígitos'}
      {createFormData.tipo_documento === 'CE' && 'Hasta 12 caracteres'}
      {createFormData.tipo_documento === 'PASAPORTE' && 'Hasta 12 caracteres'}
    </small>
  </div>
</div>



      </div>

      {/* Columna Derecha: Fecha, Hora y Pago */}
      <div className="create-form-section">
        <h3><FiClock /> Fecha y Hora</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Fecha *</label>
            <input
              type="date"
              name="fecha_reserva"
              value={createFormData.fecha_reserva}
              onChange={handleCreateFormChange}
              className={`form-input ${createErrors.fecha_reserva ? 'error' : ''}`}
              //min={new Date().toISOString().split('T')[0]}
            />
            {createErrors.fecha_reserva && <span className="form-error">{createErrors.fecha_reserva}</span>}
          </div>

          <div className="form-group">
            <label>Hora de Inicio</label>
            <input
              type="time"
              name="hora_inicio"
              value={createFormData.hora_inicio}
              onChange={handleCreateFormChange}
              className={`form-input ${createErrors.hora_inicio ? 'error' : ''}`}
            />
            {createErrors.hora_inicio && <span className="form-error">{createErrors.hora_inicio}</span>}
          </div>
        </div>

        <h3><FiCreditCard /> Información de Pago</h3>
        
        <div className="form-group">
          <label>Método de Pago</label>
          <select
            name="metodo_pago"
            value={createFormData.metodo_pago}
            onChange={handleCreateFormChange}
            className="form-select"
          >
            <option value="efectivo">💵 Efectivo</option>
            <option value="yape">📱 Yape</option>
            <option value="plin">📱 Plin</option>
            <option value="transferencia">🏦 Transferencia</option>
            <option value="tarjeta">💳 Tarjeta</option>
          </select>
        </div>

        {createFormData.metodo_pago !== 'efectivo' && (
          <div className="form-group">
            <label>Número de Operación</label>
            <input
              type="text"
              name="numero_operacion"
              value={createFormData.numero_operacion}
              onChange={handleCreateFormChange}
              className="form-input"
              placeholder="123456789"
            />
          </div>
        )}

<div className="form-group">
  <label>Monto de Pago</label>
  <input
    type="number"
    step="0.01"
    name="monto_adelanto"
    value={createFormData.monto_adelanto}
    onChange={handleCreateFormChange}
    className="form-input"
    placeholder="0.00"
    max={selectedServiceForCreate?.precio}
  />
  <small className="form-hint">
    Precio total: {selectedServiceForCreate ? formatPrice(selectedServiceForCreate.precio) : 'S/ 0.00'}
    {selectedServiceForCreate && (
      <span style={{ color: '#d946ef', fontWeight: '600' }}>
        {' | '}Adelanto 40%: {formatPrice(selectedServiceForCreate.precio * 0.4)}
      </span>
    )}
  </small>
  
  {/* Indicador de estado de pago */}
  {createFormData.monto_adelanto && selectedServiceForCreate && (
    <div style={{ marginTop: '0.5rem' }}>
      {parseFloat(createFormData.monto_adelanto) >= selectedServiceForCreate.precio ? (
        <span style={{ color: '#16a34a', fontWeight: '600', fontSize: '0.875rem' }}>
          ✓ Pago completo
        </span>
      ) : parseFloat(createFormData.monto_adelanto) > 0 ? (
        <span style={{ color: '#f59e0b', fontWeight: '600', fontSize: '0.875rem' }}>
          ⚠ Adelanto parcial ({((parseFloat(createFormData.monto_adelanto) / selectedServiceForCreate.precio) * 100).toFixed(0)}%)
        </span>
      ) : null}
    </div>
  )}
</div>

        <div className="form-group">
          <label>Notas</label>
          <textarea
            name="notas"
            value={createFormData.notas}
            onChange={handleCreateFormChange}
            className="form-textarea"
            rows={3}
            placeholder="Notas adicionales..."
          />
        </div>
      </div>
    </div>

    <div className="modal-actions">
      <button 
        type="button" 
        className="btn btn-secondary"
        onClick={() => setShowCreateModal(false)}
      >
        <FiX /> Cancelar
      </button>
      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="spinner-inline" />
            Creando...
          </>
        ) : (
          <>
            <FiCheck /> Crear Cita
          </>
        )}
      </button>
    </div>
  </form>
</Modal>












      {/* Modal de Voucher */}
      <Modal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        title="Voucher de Pago"
        size="medium"
      >
        {selectedAppointment && selectedAppointment.voucher_url && (
          <div className="voucher-modal">
            <div className="voucher-info">
              <div className="voucher-detail">
                <span className="voucher-label">Código:</span>
                <span className="voucher-value">{selectedAppointment.codigo}</span>
              </div>
              <div className="voucher-detail">
                <span className="voucher-label">Cliente:</span>
                <span className="voucher-value">{selectedAppointment.nombre_cliente}</span>
              </div>
              <div className="voucher-detail">
                <span className="voucher-label">Nro Operación:</span>
                <span className="voucher-value">{selectedAppointment.numero_operacion}</span>
              </div>
              <div className="voucher-detail">
                <span className="voucher-label">Monto:</span>
                <span className="voucher-value price">{formatPrice(selectedAppointment.monto_adelanto)}</span>
              </div>
            </div>

            <div className="voucher-image-container">
              <img 
                src={selectedAppointment.voucher_url} 
                alt="Voucher de pago" 
                className="voucher-image"
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowVoucherModal(false)}>
                Cerrar
              </button>
              <a 
                href={selectedAppointment.voucher_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <FiDownload /> Descargar
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmActionHandler}
        title={confirmAction?.type === 'delete' ? 'Eliminar Cita' : 'Cambiar Estado'}
        message={
          confirmAction?.type === 'delete'
            ? `¿Estás seguro de eliminar la cita ${selectedAppointment?.codigo}?`
            : `¿Confirmas cambiar el estado a "${confirmAction?.newStatus}"?`
        }
        type={confirmAction?.type === 'delete' ? 'danger' : 'warning'}
      />
  
  

  <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        reservation={selectedPaymentAppointment}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}




export default AdminOrdersPage