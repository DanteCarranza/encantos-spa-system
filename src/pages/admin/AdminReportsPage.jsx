import React, { useState, useEffect } from 'react'
import {
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiUsers,
  FiCreditCard,
  FiDownload,
  FiRefreshCw,
  FiAlertCircle,
  FiCheck
} from 'react-icons/fi'
import paymentsService from '../../services/paymentsService'
import { formatPrice } from '../../utils/helpers'
import './AdminReportsPage.css'
import Modal from '../../components/common/Modal'
import Swal from 'sweetalert2'


const AdminReportsPage = () => {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ingresos')
  
  // Filtros de fecha
  const [fechaInicio, setFechaInicio] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  )
  const [fechaFin, setFechaFin] = useState(
    // Último día del mes actual
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  )
  
  // Datos de reportes
  const [ingresosDiarios, setIngresosDiarios] = useState([])
  const [pendientes, setPendientes] = useState([])
  const [ingresosTerapeutas, setIngresosTerapeutas] = useState([])
  const [ingresosMetodos, setIngresosMetodos] = useState([])

  const [showPayTherapistModal, setShowPayTherapistModal] = useState(false)
const [selectedTherapist, setSelectedTherapist] = useState(null)


const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('efectivo')
const [numeroOperacion, setNumeroOperacion] = useState('')


const formatPrice = (price) => {
  return `S/ ${parseFloat(price || 0).toFixed(2)}`
}

  useEffect(() => {
    loadReports()
  }, [fechaInicio, fechaFin])

  const loadReports = async () => {
    setLoading(true)
    
    const [ingresos, pend, terapeutas, metodos] = await Promise.all([
      paymentsService.getIngresosDiarios(fechaInicio, fechaFin),
      paymentsService.getPendientes(),
      paymentsService.getIngresosPorTerapeuta(fechaInicio, fechaFin),
      paymentsService.getIngresosPorMetodo(fechaInicio, fechaFin)
    ])

    if (ingresos.success) setIngresosDiarios(ingresos.data)
    if (pend.success) setPendientes(pend.data)
    if (terapeutas.success) setIngresosTerapeutas(terapeutas.data)
    if (metodos.success) setIngresosMetodos(metodos.data)
    
    setLoading(false)
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }



  const handleConfirmTherapistPayment = async () => {
    // Validar número de operación si no es efectivo
    if (selectedPaymentMethod !== 'efectivo' && !numeroOperacion.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Ingresa el número de operación',
        confirmButtonColor: '#d946ef'
      })
      return
    }
  
    Swal.fire({
      title: '¿Confirmar pago?',
      html: `
        <p>Método: <strong>${selectedPaymentMethod.toUpperCase()}</strong></p>
        <p>Monto: <strong>${formatPrice(selectedTherapist.comision_terapeuta)}</strong></p>
        ${numeroOperacion ? `<p>Nro Op: <strong>${numeroOperacion}</strong></p>` : ''}
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d946ef',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const paymentData = new FormData()
          paymentData.append('pagar_terapeuta', 'true')
          paymentData.append('terapeuta_id', selectedTherapist.terapeuta_id)
          paymentData.append('periodo_inicio', fechaInicio)
          paymentData.append('periodo_fin', fechaFin)
          paymentData.append('metodo_pago', selectedPaymentMethod)
          paymentData.append('fecha_pago', new Date().toISOString().split('T')[0])
          
          if (numeroOperacion) {
            paymentData.append('numero_operacion', numeroOperacion)
          }
          
          const result = await paymentsService.createPayment(paymentData)
          
          if (!result.success) {
            throw new Error(result.message || 'Error al registrar pago')
          }
          
          return result
        } catch (error) {
          Swal.showValidationMessage(`Error: ${error.message}`)
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: '¡Pago Registrado!',
          html: `El pago ha sido registrado exitosamente.`,
          confirmButtonColor: '#d946ef'
        })
        setShowPayTherapistModal(false)
        setNumeroOperacion('')
        setSelectedPaymentMethod('efectivo')
        loadReports()
      }
    })
  }


  const exportToPDF = async () => {
    try {
      // Cargar jsPDF si no está cargado
      if (!window.jspdf) {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
        script.onload = () => generatePDF()
        document.head.appendChild(script)
      } else {
        generatePDF()
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo generar el PDF',
        confirmButtonColor: '#d946ef'
      })
    }
  }
  
  const generatePDF = () => {
    const { jsPDF } = window.jspdf
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.setTextColor(217, 70, 239)
    doc.text('Encantos SPA', 105, 20, { align: 'center' })
    
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text('Reporte Financiero', 105, 30, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Período: ${fechaInicio} al ${fechaFin}`, 105, 38, { align: 'center' })
    
    let yPos = 50
    
    // Resumen de totales
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('Resumen General', 20, yPos)
    yPos += 10
    
    doc.setFontSize(10)
    doc.text(`Ingresos Totales: ${formatPrice(totalIngresos)}`, 20, yPos)
    yPos += 6
    doc.text(`Citas Atendidas: ${totalCitas}`, 20, yPos)
    yPos += 6
    doc.text(`Pagos Pendientes: ${formatPrice(totalPendiente)}`, 20, yPos)
    yPos += 6
    doc.text(`Ticket Promedio: ${formatPrice(promedioTicket)}`, 20, yPos)
    yPos += 15
    
    // Tabla según el tab activo
    switch (activeTab) {
      case 'ingresos':
        generateIngresosDiariosPDF(doc, yPos)
        break
      case 'pendientes':
        generatePendientesPDF(doc, yPos)
        break
      case 'terapeutas':
        generateTerapeutasPDF(doc, yPos)
        break
      case 'metodos':
        generateMetodosPDF(doc, yPos)
        break
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Página ${i} de ${pageCount} - Generado el ${new Date().toLocaleDateString('es-PE')}`,
        105,
        290,
        { align: 'center' }
      )
    }
    
    doc.save(`reporte-financiero-${fechaInicio}-${fechaFin}.pdf`)
    
    Swal.fire({
      icon: 'success',
      title: 'PDF Generado',
      text: 'El reporte se ha descargado correctamente',
      confirmButtonColor: '#d946ef',
      timer: 2000
    })
  }
  
  const generateIngresosDiariosPDF = (doc, startY) => {
    doc.setFontSize(12)
    doc.text('Ingresos por Día', 20, startY)
    startY += 10
    
    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    
    // Headers
    const headers = ['Fecha', 'Citas', 'Efectivo', 'Yape', 'Transf.', 'Tarjeta', 'Total']
    const colWidths = [35, 20, 25, 25, 25, 25, 25]
    let xPos = 20
    
    headers.forEach((header, i) => {
      doc.text(header, xPos, startY)
      xPos += colWidths[i]
    })
    
    startY += 7
    doc.setFont(undefined, 'normal')
    
    // Rows
    ingresosDiarios.forEach((item) => {
      if (startY > 270) {
        doc.addPage()
        startY = 20
      }
      
      xPos = 20
      const fecha = new Date(item.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })
      
      doc.text(fecha, xPos, startY)
      xPos += colWidths[0]
      doc.text(String(item.total_citas), xPos, startY)
      xPos += colWidths[1]
      doc.text(`S/ ${parseFloat(item.efectivo).toFixed(2)}`, xPos, startY)
      xPos += colWidths[2]
      doc.text(`S/ ${parseFloat(item.yape).toFixed(2)}`, xPos, startY)
      xPos += colWidths[3]
      doc.text(`S/ ${parseFloat(item.transferencia).toFixed(2)}`, xPos, startY)
      xPos += colWidths[4]
      doc.text(`S/ ${parseFloat(item.tarjeta).toFixed(2)}`, xPos, startY)
      xPos += colWidths[5]
      doc.setFont(undefined, 'bold')
      doc.text(`S/ ${parseFloat(item.total_ingresos).toFixed(2)}`, xPos, startY)
      doc.setFont(undefined, 'normal')
      
      startY += 7
    })
  }
  
  const generatePendientesPDF = (doc, startY) => {
    doc.setFontSize(12)
    doc.text('Pagos Pendientes', 20, startY)
    startY += 10
    
    doc.setFontSize(8)
    doc.setFont(undefined, 'bold')
    
    doc.text('Código', 20, startY)
    doc.text('Cliente', 45, startY)
    doc.text('Servicio', 85, startY)
    doc.text('Fecha', 120, startY)
    doc.text('Precio', 145, startY)
    doc.text('Saldo', 170, startY)
    
    startY += 7
    doc.setFont(undefined, 'normal')
    
    pendientes.forEach((item) => {
      if (startY > 270) {
        doc.addPage()
        startY = 20
      }
      
      doc.text(item.codigo.substring(0, 15), 20, startY)
      doc.text(item.nombre_cliente.substring(0, 20), 45, startY)
      doc.text(item.servicio_nombre.substring(0, 20), 85, startY)
      doc.text(new Date(item.fecha_reserva).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }), 120, startY)
      doc.text(`S/ ${parseFloat(item.precio_servicio).toFixed(2)}`, 145, startY)
      doc.setFont(undefined, 'bold')
      doc.text(`S/ ${parseFloat(item.saldo_pendiente).toFixed(2)}`, 170, startY)
      doc.setFont(undefined, 'normal')
      
      startY += 7
    })
    
    // Total
    startY += 5
    doc.setFont(undefined, 'bold')
    doc.text(`Total Pendiente: ${formatPrice(totalPendiente)}`, 20, startY)
  }
  
  const generateTerapeutasPDF = (doc, startY) => {
    doc.setFontSize(12)
    doc.text('Ingresos por Terapeuta', 20, startY)
    startY += 10
    
    doc.setFontSize(8)
    doc.setFont(undefined, 'bold')
    
    doc.text('Terapeuta', 20, startY)
    doc.text('Citas', 80, startY)
    doc.text('Ingresos', 105, startY)
    doc.text('Comisión', 135, startY)
    doc.text('Para SPA', 165, startY)
    
    startY += 7
    doc.setFont(undefined, 'normal')
    
    ingresosTerapeutas.forEach((item) => {
      if (startY > 270) {
        doc.addPage()
        startY = 20
      }
      
      doc.text(item.terapeuta.substring(0, 30), 20, startY)
      doc.text(String(item.total_citas), 80, startY)
      doc.text(`S/ ${parseFloat(item.total_ingresos).toFixed(2)}`, 105, startY)
      doc.text(`S/ ${parseFloat(item.comision_terapeuta).toFixed(2)}`, 135, startY)
      doc.text(`S/ ${parseFloat(item.para_spa).toFixed(2)}`, 165, startY)
      
      startY += 7
    })
    
    // Totales
    startY += 5
    doc.setFont(undefined, 'bold')
    doc.text('TOTALES:', 20, startY)
    doc.text(
      `S/ ${ingresosTerapeutas.reduce((sum, t) => sum + t.total_ingresos, 0).toFixed(2)}`,
      105,
      startY
    )
    doc.text(
      `S/ ${ingresosTerapeutas.reduce((sum, t) => sum + t.comision_terapeuta, 0).toFixed(2)}`,
      135,
      startY
    )
    doc.text(
      `S/ ${ingresosTerapeutas.reduce((sum, t) => sum + t.para_spa, 0).toFixed(2)}`,
      165,
      startY
    )
  }
  
  const generateMetodosPDF = (doc, startY) => {
    doc.setFontSize(12)
    doc.text('Distribución por Método de Pago', 20, startY)
    startY += 10
    
    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    
    doc.text('Método', 20, startY)
    doc.text('Transacciones', 70, startY)
    doc.text('Monto Total', 120, startY)
    doc.text('Promedio', 160, startY)
    
    startY += 7
    doc.setFont(undefined, 'normal')
    
    const totalGeneral = ingresosMetodos.reduce((sum, m) => sum + m.total_monto, 0)
    
    ingresosMetodos.forEach((item) => {
      const porcentaje = totalGeneral > 0 ? (item.total_monto / totalGeneral * 100).toFixed(1) : 0
      const promedio = item.total_transacciones > 0 ? item.total_monto / item.total_transacciones : 0
      
      doc.text(item.metodo_pago.toUpperCase(), 20, startY)
      doc.text(String(item.total_transacciones), 70, startY)
      doc.text(`S/ ${parseFloat(item.total_monto).toFixed(2)}`, 120, startY)
      doc.text(`S/ ${promedio.toFixed(2)} (${porcentaje}%)`, 160, startY)
      
      startY += 7
    })
  }




  const totalIngresos = ingresosDiarios.reduce((sum, item) => sum + item.total_ingresos, 0)
  const totalCitas = ingresosDiarios.reduce((sum, item) => sum + item.total_citas, 0)
  const totalPendiente = pendientes.reduce((sum, item) => sum + item.saldo_pendiente, 0)
  const promedioTicket = totalCitas > 0 ? totalIngresos / totalCitas : 0


  const handlePagarTerapeuta = (therapist) => {
    setSelectedTherapist(therapist)
    setShowPayTherapistModal(true)
  }


  if (loading) {
    return (
      <div className="admin-reports-loading">
        <div className="spinner-large"></div>
        <p>Cargando reportes...</p>
      </div>
    )
  }

  return (
    <div className="admin-reports-page">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h1 className="reports-title">Reportes Financieros</h1>
          <p className="reports-subtitle">Análisis de ingresos y pagos</p>
        </div>
        <div className="reports-actions">
          <button className="btn btn-outline" onClick={loadReports}>
            <FiRefreshCw />
            Actualizar
          </button>
          <button className="btn btn-outline" onClick={exportToPDF}>
  <FiDownload />
  Exportar PDF
</button>
        </div>
      </div>

      {/* Filtros de Fecha */}
      <div className="date-filters">
        <div className="filter-item">
          <label>Fecha Inicio</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="date-input"
          />
        </div>
        <div className="filter-item">
          <label>Fecha Fin</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="date-input"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="reports-stats">
        <div className="stat-card-reports stat-primary">
          <div className="stat-icon-reports">
            <FiDollarSign />
          </div>
          <div className="stat-content-reports">
            <div className="stat-value-reports">{formatPrice(totalIngresos)}</div>
            <div className="stat-label-reports">Ingresos Totales</div>
          </div>
        </div>

        <div className="stat-card-reports stat-success">
          <div className="stat-icon-reports">
            <FiCalendar />
          </div>
          <div className="stat-content-reports">
            <div className="stat-value-reports">{totalCitas}</div>
            <div className="stat-label-reports">Citas Atendidas</div>
          </div>
        </div>

        <div className="stat-card-reports stat-warning">
          <div className="stat-icon-reports">
            <FiAlertCircle />
          </div>
          <div className="stat-content-reports">
            <div className="stat-value-reports">{formatPrice(totalPendiente)}</div>
            <div className="stat-label-reports">Pagos Pendientes</div>
          </div>
        </div>

        <div className="stat-card-reports stat-info">
          <div className="stat-icon-reports">
            <FiTrendingUp />
          </div>
          <div className="stat-content-reports">
            <div className="stat-value-reports">{formatPrice(promedioTicket)}</div>
            <div className="stat-label-reports">Ticket Promedio</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="reports-tabs">
        <button
          className={`tab-btn ${activeTab === 'ingresos' ? 'active' : ''}`}
          onClick={() => setActiveTab('ingresos')}
        >
          <FiDollarSign /> Ingresos Diarios
        </button>
        <button
          className={`tab-btn ${activeTab === 'pendientes' ? 'active' : ''}`}
          onClick={() => setActiveTab('pendientes')}
        >
          <FiAlertCircle /> Pagos Pendientes
        </button>
        <button
          className={`tab-btn ${activeTab === 'terapeutas' ? 'active' : ''}`}
          onClick={() => setActiveTab('terapeutas')}
        >
          <FiUsers /> Por Terapeuta
        </button>
        <button
          className={`tab-btn ${activeTab === 'metodos' ? 'active' : ''}`}
          onClick={() => setActiveTab('metodos')}
        >
          <FiCreditCard /> Por Método de Pago
        </button>
      </div>

      {/* Content */}
      <div className="reports-content">
        {/* Tab: Ingresos Diarios */}
        {activeTab === 'ingresos' && (
          <div className="report-table-container">
            <h3 className="table-title">Ingresos por Día</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Citas</th>
                  <th>Efectivo</th>
                  <th>Yape</th>
                  <th>Transferencia</th>
                  <th>Tarjeta</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {ingresosDiarios.map((item, index) => (
                  <tr key={index}>
                    <td>{formatDate(item.fecha)}</td>
                    <td>{item.total_citas}</td>
                    <td>{formatPrice(item.efectivo)}</td>
                    <td>{formatPrice(item.yape)}</td>
                    <td>{formatPrice(item.transferencia)}</td>
                    <td>{formatPrice(item.tarjeta)}</td>
                    <td className="total-cell">{formatPrice(item.total_ingresos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

{/* Tab: Pagos Pendientes */}
{activeTab === 'pendientes' && (
          <div className="report-table-container">
            <h3 className="table-title">
              Citas con Saldo Pendiente
              <span className="badge-count">{pendientes.length}</span>
            </h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Fecha Cita</th>
                  <th>Terapeuta</th>
                  <th>Precio Total</th>
                  <th>Adelanto</th>
                  <th>Saldo Pendiente</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pendientes.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="code-badge">{item.codigo}</span>
                    </td>
                    <td>
                      <div className="client-cell-report">
                        <div className="client-name-report">{item.nombre_cliente}</div>
                        <div className="client-contact-report">{item.telefono_cliente}</div>
                      </div>
                    </td>
                    <td>{item.servicio_nombre}</td>
                    <td>{formatDate(item.fecha_reserva)} - {item.hora_inicio}</td>
                    <td>{item.terapeuta_nombre || 'Sin asignar'}</td>
                    <td>{formatPrice(item.precio_servicio)}</td>
                    <td>{formatPrice(item.adelanto_pagado)}</td>
                    <td className="saldo-cell">{formatPrice(item.saldo_pendiente)}</td>
                    <td>
                      <span className={`status-badge-report ${item.estado}`}>
                        {item.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan="7" className="text-right"><strong>Total Pendiente:</strong></td>
                  <td className="total-cell" colSpan="2">
                    <strong>{formatPrice(totalPendiente)}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
            
            {pendientes.length === 0 && (
              <div className="empty-state-report">
                <div className="empty-icon-report">✅</div>
                <h3>¡Todo al día!</h3>
                <p>No hay pagos pendientes en este momento</p>
              </div>
            )}
          </div>
        )}

   {/* Tab: Por Terapeuta */}
{activeTab === 'terapeutas' && (
  <div className="report-table-container">
    <h3 className="table-title">Ingresos por Terapeuta (Comisión 40%)</h3>
    <table className="report-table">
      <thead>
        <tr>
          <th>Terapeuta</th>
          <th>Especialidad</th>
          <th>Citas</th>
          <th>Ingresos</th>
          <th>Comisión (40%)</th>
          <th>Para el Spa (60%)</th>
          <th>Estado Pago</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {ingresosTerapeutas.map((item) => (
          <tr key={item.terapeuta_id}>
            <td>
              <div className="therapist-cell-report">
                <div className="therapist-avatar-report">
                  {item.terapeuta.charAt(0)}
                </div>
                <span className="therapist-name-report">{item.terapeuta}</span>
              </div>
            </td>
            <td>{item.especialidad}</td>
            <td className="center-cell">{item.total_citas}</td>
            <td className="amount-cell">{formatPrice(item.total_ingresos)}</td>
            <td className="commission-cell">{formatPrice(item.comision_terapeuta)}</td>
            <td className="spa-cell">{formatPrice(item.para_spa)}</td>
            <td>
              {item.estado_pago_terapeuta === 'pagado' ? (
                <div className="payment-status-cell">
                  <span className="payment-badge paid">
                    <FiCheck /> Pagado
                  </span>
                  {item.fecha_pago_terapeuta && (
                    <div className="payment-date">
                      {new Date(item.fecha_pago_terapeuta).toLocaleDateString('es-PE')}
                    </div>
                  )}
                </div>
              ) : (
                <span className="payment-badge pending">
                  <FiAlertCircle /> Pendiente
                </span>
              )}
            </td>
            <td>
              {item.estado_pago_terapeuta !== 'pagado' && (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handlePagarTerapeuta(item)}
                >
                  <FiDollarSign /> Pagar
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="total-row">
          <td colSpan="3"><strong>Totales:</strong></td>
          <td className="total-cell">
            <strong>{formatPrice(ingresosTerapeutas.reduce((sum, t) => sum + t.total_ingresos, 0))}</strong>
          </td>
          <td className="total-cell">
            <strong>{formatPrice(ingresosTerapeutas.reduce((sum, t) => sum + t.comision_terapeuta, 0))}</strong>
          </td>
          <td className="total-cell">
            <strong>{formatPrice(ingresosTerapeutas.reduce((sum, t) => sum + t.para_spa, 0))}</strong>
          </td>
          <td colSpan="2"></td>
        </tr>
      </tfoot>
    </table>
    
    {ingresosTerapeutas.length === 0 && (
      <div className="empty-state-report">
        <div className="empty-icon-report">👥</div>
        <h3>Sin datos</h3>
        <p>No hay citas completadas con terapeuta asignado en este período</p>
      </div>
    )}
  </div>
)}

        {/* Tab: Por Método de Pago */}
        {activeTab === 'metodos' && (
          <div className="payment-methods-report">
            <h3 className="table-title">Distribución por Método de Pago</h3>
            
            <div className="methods-grid">
              {ingresosMetodos.map((item) => {
                const totalGeneral = ingresosMetodos.reduce((sum, m) => sum + m.total_monto, 0)
                const porcentaje = totalGeneral > 0 ? (item.total_monto / totalGeneral * 100).toFixed(1) : 0
                
                const iconMap = {
                  efectivo: '💵',
                  yape: '📱',
                  transferencia: '🏦',
                  tarjeta: '💳'
                }
                
                return (
                  <div key={item.metodo_pago} className="method-card">
                    <div className="method-icon-large">
                      {iconMap[item.metodo_pago] || '💰'}
                    </div>
                    <div className="method-info">
                      <h4 className="method-name">{item.metodo_pago.toUpperCase()}</h4>
                      <div className="method-stats">
                        <div className="method-amount">{formatPrice(item.total_monto)}</div>
                        <div className="method-transactions">
                          {item.total_transacciones} transacciones
                        </div>
                      </div>
                      <div className="method-percentage">
                        <div className="percentage-bar">
                          <div 
                            className="percentage-fill"
                            style={{ width: `${porcentaje}%` }}
                          ></div>
                        </div>
                        <span className="percentage-text">{porcentaje}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tabla Detallada */}
            <div className="methods-table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Método</th>
                    <th>Transacciones</th>
                    <th>Monto Total</th>
                    <th>Promedio por Transacción</th>
                    <th>% del Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ingresosMetodos.map((item) => {
                    const totalGeneral = ingresosMetodos.reduce((sum, m) => sum + m.total_monto, 0)
                    const porcentaje = totalGeneral > 0 ? (item.total_monto / totalGeneral * 100).toFixed(1) : 0
                    const promedio = item.total_transacciones > 0 ? item.total_monto / item.total_transacciones : 0
                    
                    return (
                      <tr key={item.metodo_pago}>
                        <td>
                          <span className="method-badge">{item.metodo_pago}</span>
                        </td>
                        <td className="center-cell">{item.total_transacciones}</td>
                        <td className="amount-cell">{formatPrice(item.total_monto)}</td>
                        <td className="amount-cell">{formatPrice(promedio)}</td>
                        <td className="center-cell">
                          <span className="percentage-badge">{porcentaje}%</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {ingresosMetodos.length === 0 && (
              <div className="empty-state-report">
                <div className="empty-icon-report">💳</div>
                <h3>Sin datos</h3>
                <p>No hay registros de pagos en este período</p>
              </div>
            )}
          </div>
        )}
      </div>




{/* Modal de Pago a Terapeuta */}
<Modal
  isOpen={showPayTherapistModal}
  onClose={() => {
    setShowPayTherapistModal(false)
    setNumeroOperacion('')
    setSelectedPaymentMethod('efectivo')
  }}
  title="Registrar Pago a Terapeuta"
  size="medium"
>
  {selectedTherapist && (
    <div className="pay-therapist-modal">
      {/* Header */}
      <div className="therapist-payment-info">
        <h4>{selectedTherapist.terapeuta}</h4>
        <p className="therapist-specialty">{selectedTherapist.especialidad}</p>
        
        {/* Resumen compacto */}
        <div className="payment-info-compact">
          <div className="info-compact-item">
            <span className="info-compact-label">Período</span>
            <span className="info-compact-value">{fechaInicio} al {fechaFin}</span>
          </div>
          <div className="info-compact-item">
            <span className="info-compact-label">Citas</span>
            <span className="info-compact-value">{selectedTherapist.total_citas} completadas</span>
          </div>
          <div className="info-compact-item">
            <span className="info-compact-label">Ingresos</span>
            <span className="info-compact-value">{formatPrice(selectedTherapist.total_ingresos)}</span>
          </div>
          <div className="info-compact-item">
            <span className="info-compact-label">Comisión (40%)</span>
            <span className="info-compact-value highlight">{formatPrice(selectedTherapist.comision_terapeuta)}</span>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="payment-form-simple">
        <div className="form-group">
          <label>Método de Pago *</label>
          <select 
            className="form-select"
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
          >
            <option value="efectivo">💵 Efectivo</option>
            <option value="transferencia">🏦 Transferencia Bancaria</option>
            <option value="yape">📱 Yape</option>
          </select>
        </div>
        
        {selectedPaymentMethod !== 'efectivo' && (
          <div className="form-group">
            <label>Número de Operación *</label>
            <input
              type="text"
              className="form-input"
              value={numeroOperacion}
              onChange={(e) => setNumeroOperacion(e.target.value)}
              placeholder="Ej: 123456789"
            />
          </div>
        )}
        
        <button 
          className="btn btn-primary btn-block"
          onClick={handleConfirmTherapistPayment}
        >
          <FiCheck /> Confirmar Pago de {formatPrice(selectedTherapist.comision_terapeuta)}
        </button>
      </div>
    </div>
  )}
</Modal>






    </div>



  )




}

export default AdminReportsPage