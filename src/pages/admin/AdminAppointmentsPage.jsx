import React, { useState, useEffect } from 'react'
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiFilter,
  FiDownload
} from 'react-icons/fi'
import appointmentService from '../../services/appointmentService'
import SearchBar from '../../components/common/SearchBar'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import EmptyState from '../../components/common/EmptyState'
import Loading from '../../components/common/Loading'
import Swal from 'sweetalert2'
import { formatDate } from '../../utils/helpers'
import './AdminAppointmentsPage.css'

const AdminAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [actionType, setActionType] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadAppointments()
    loadStats()
  }, [currentPage, search, statusFilter])

  const loadAppointments = async () => {
    setLoading(true)
    const result = await appointmentService.getAllAppointments({
      page: currentPage,
      limit: 10,
      search,
      status: statusFilter !== 'all' ? statusFilter : undefined
    })

    if (result.success) {
      setAppointments(result.data.appointments || [])
      setTotalPages(result.data.totalPages || 1)
    } else {
      // Datos de ejemplo si no hay backend
      setAppointments(generateExampleAppointments())
      setTotalPages(3)
    }
    setLoading(false)
  }

  const loadStats = async () => {
    const result = await appointmentService.getAppointmentStats()
    if (result.success) {
      setStats(result.data)
    } else {
      // Stats de ejemplo
      setStats({
        total: 45,
        pendientes: 12,
        confirmadas: 18,
        completadas: 10,
        canceladas: 5
      })
    }
  }

  const generateExampleAppointments = () => {
    const statuses = ['pendiente', 'confirmada', 'completada', 'cancelada']
    const servicios = ['Asesoría General', 'Consulta de Producto', 'Soporte Técnico', 'Ventas']
    
    return Array(10).fill(0).map((_, i) => ({
      id: i + 1,
      nombre: `Cliente ${i + 1}`,
      email: `cliente${i + 1}@example.com`,
      telefono: `99999999${i}`,
      fecha: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
      hora: `${9 + i}:00`,
      tipo_servicio: servicios[i % servicios.length],
      estado: statuses[i % statuses.length],
      mensaje: 'Necesito información sobre productos',
      created_at: new Date(Date.now() - i * 86400000).toISOString()
    }))
  }

  const handleSearch = (searchTerm) => {
    setSearch(searchTerm)
    setCurrentPage(1)
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailModal(true)
  }

  const handleStatusChange = (appointment, newStatus) => {
    setSelectedAppointment(appointment)
    setActionType(newStatus)
    setShowConfirmDialog(true)
  }

  const confirmStatusChange = async () => {
    const result = await appointmentService.updateAppointmentStatus(
      selectedAppointment.id,
      actionType
    )

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Estado Actualizado',
        text: 'El estado de la cita ha sido actualizado correctamente',
        timer: 2000,
        showConfirmButton: false
      })
      loadAppointments()
      loadStats()
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.message || 'No se pudo actualizar el estado'
      })
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pendiente: { class: 'badge-warning', label: 'Pendiente' },
      confirmada: { class: 'badge-info', label: 'Confirmada' },
      completada: { class: 'badge-success', label: 'Completada' },
      cancelada: { class: 'badge-error', label: 'Cancelada' }
    }
    const badge = badges[status] || badges.pendiente
    return <span className={`badge ${badge.class}`}>{badge.label}</span>
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Fecha', 'Hora', 'Servicio', 'Estado']
    const rows = appointments.map(apt => [
      apt.id,
      apt.nombre,
      apt.email,
      apt.telefono,
      apt.fecha,
      apt.hora,
      apt.tipo_servicio,
      apt.estado
    ])

    let csvContent = headers.join(',') + '\n'
    rows.forEach(row => {
      csvContent += row.join(',') + '\n'
    })

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `citas_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading && appointments.length === 0) {
    return <Loading fullScreen message="Cargando citas..." />
  }

  return (
    <div className="admin-appointments-page">
      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <FiCalendar />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total de Citas</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">
              <FiClock />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.pendientes}</div>
              <div className="stat-label">Pendientes</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon info">
              <FiCheckCircle />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.confirmadas}</div>
              <div className="stat-label">Confirmadas</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon success">
              <FiCheckCircle />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.completadas}</div>
              <div className="stat-label">Completadas</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="page-header">
        <SearchBar 
          onSearch={handleSearch}
          placeholder="Buscar por nombre, email o teléfono..."
        />

        <div className="header-actions">
          <div className="filter-group">
            <FiFilter />
            <select 
              className="filter-select"
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="confirmada">Confirmadas</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>

          <button className="btn btn-outline btn-sm" onClick={exportToCSV}>
            <FiDownload />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Appointments Table */}
      {appointments.length > 0 ? (
        <>
          <div className="table-container">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Contacto</th>
                  <th>Fecha y Hora</th>
                  <th>Servicio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appointment => (
                  <tr key={appointment.id}>
                    <td>#{appointment.id}</td>
                    <td>
                      <div className="client-info">
                        <FiUser className="client-icon" />
                        <span className="client-name">{appointment.nombre}</span>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div className="contact-item">
                          <FiMail />
                          <span>{appointment.email}</span>
                        </div>
                        <div className="contact-item">
                          <FiPhone />
                          <span>{appointment.telefono}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="datetime-info">
                        <div className="date">
                          <FiCalendar />
                          {formatDate(appointment.fecha)}
                        </div>
                        <div className="time">
                          <FiClock />
                          {appointment.hora}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="service-tag">{appointment.tipo_servicio}</span>
                    </td>
                    <td>
                      {getStatusBadge(appointment.estado)}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleViewDetails(appointment)}
                          title="Ver detalles"
                        >
                          <FiEye />
                        </button>

                        {appointment.estado === 'pendiente' && (
                          <button
                            className="btn-icon success"
                            onClick={() => handleStatusChange(appointment, 'confirmada')}
                            title="Confirmar"
                          >
                            <FiCheckCircle />
                          </button>
                        )}

                        {(appointment.estado === 'pendiente' || appointment.estado === 'confirmada') && (
                          <button
                            className="btn-icon danger"
                            onClick={() => handleStatusChange(appointment, 'cancelada')}
                            title="Cancelar"
                          >
                            <FiXCircle />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <EmptyState
          icon={FiCalendar}
          title="No hay citas"
          description="No se encontraron citas con los filtros seleccionados"
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Detalles de la Cita"
          size="medium"
        >
          <div className="appointment-details">
            <div className="detail-section">
              <h4 className="detail-title">Información del Cliente</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Nombre:</span>
                  <span className="detail-value">{selectedAppointment.nombre}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedAppointment.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Teléfono:</span>
                  <span className="detail-value">{selectedAppointment.telefono}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4 className="detail-title">Información de la Cita</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Fecha:</span>
                  <span className="detail-value">{formatDate(selectedAppointment.fecha)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Hora:</span>
                  <span className="detail-value">{selectedAppointment.hora}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tipo de Servicio:</span>
                  <span className="detail-value">{selectedAppointment.tipo_servicio}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Estado:</span>
                  <span className="detail-value">{getStatusBadge(selectedAppointment.estado)}</span>
                </div>
              </div>
            </div>

            {selectedAppointment.mensaje && (
              <div className="detail-section">
                <h4 className="detail-title">Mensaje del Cliente</h4>
                <p className="appointment-message">{selectedAppointment.mensaje}</p>
              </div>
            )}

            <div className="detail-section">
              <h4 className="detail-title">Información Adicional</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Fecha de Creación:</span>
                  <span className="detail-value">{formatDate(selectedAppointment.created_at, true)}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={confirmStatusChange}
          title="Confirmar Acción"
          message={`¿Estás seguro de que deseas ${actionType === 'confirmada' ? 'confirmar' : 'cancelar'} esta cita?`}
          confirmText={actionType === 'confirmada' ? 'Confirmar' : 'Cancelar Cita'}
          type={actionType === 'confirmada' ? 'info' : 'danger'}
        />
      )}
    </div>
  )
}

export default AdminAppointmentsPage