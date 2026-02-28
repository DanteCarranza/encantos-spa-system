import React, { useState, useEffect } from 'react'
import {
  FiUsers,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiDollarSign,
  FiCalendar,
  FiPhone,
  FiMail,
  FiCreditCard,
  FiMapPin,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiSave,
  FiEye,
  FiUpload 
} from 'react-icons/fi'
import Modal from '../../components/common/Modal'
import Swal from 'sweetalert2'
import { formatPrice } from '../../utils/helpers'
import './TherapistsManagementPage.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encantos.pe/spa/backend/api'

const TherapistsManagementPage = () => {
  const [loading, setLoading] = useState(true)
  const [therapists, setTherapists] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showPaymentsModal, setShowPaymentsModal] = useState(false)
  const [editingTherapist, setEditingTherapist] = useState(null)
  const [selectedTherapist, setSelectedTherapist] = useState(null)
  const [therapistPayments, setTherapistPayments] = useState([])
  const [activeTab, setActiveTab] = useState('personal') // personal, bancaria, pagos

  const [formData, setFormData] = useState({
    nombre_completo: '',
    dni: '',
    fecha_nacimiento: '',
    telefono: '',
    email: '',
    direccion: '',
    fecha_ingreso: '',
    especialidad: '',
    descripcion: '',
    cuenta_bancaria: '',
    banco: '',
    tipo_cuenta: 'ahorros',
    cci: '',
    contacto_emergencia: '',
    telefono_emergencia: '',
    notas_admin: '',
    activo: 1
  })

  const [photoFile, setPhotoFile] = useState(null)
const [photoPreview, setPhotoPreview] = useState(null)

  useEffect(() => {
    loadTherapists()
  }, [])

  const loadTherapists = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      
      const response = await fetch(`${API_BASE_URL}/therapists.php?action=list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const data = await response.json()
      if (data.success) {
        setTherapists(data.data)
      }
    } catch (error) {
      console.error('Error loading therapists:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTherapistPayments = async (therapistId) => {
    try {
      const token = localStorage.getItem('authToken')
      
      const response = await fetch(
        `${API_BASE_URL}/therapists.php?action=payments&terapeuta_id=${therapistId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      
      const data = await response.json()
      if (data.success) {
        setTherapistPayments(data.data)
      }
    } catch (error) {
      console.error('Error loading payments:', error)
    }
  }

  const handleOpenModal = (therapist = null) => {
    if (therapist) {
      setEditingTherapist(therapist)
      setFormData({
        nombre_completo: therapist.nombre_completo || '',
        dni: therapist.dni || '',
        fecha_nacimiento: therapist.fecha_nacimiento || '',
        telefono: therapist.telefono || '',
        email: therapist.email || '',
        direccion: therapist.direccion || '',
        fecha_ingreso: therapist.fecha_ingreso || '',
        especialidad: therapist.especialidad || '',
        descripcion: therapist.descripcion || '',
        cuenta_bancaria: therapist.cuenta_bancaria || '',
        banco: therapist.banco || '',
        tipo_cuenta: therapist.tipo_cuenta || 'ahorros',
        cci: therapist.cci || '',
        contacto_emergencia: therapist.contacto_emergencia || '',
        telefono_emergencia: therapist.telefono_emergencia || '',
        notas_admin: therapist.notas_admin || '',
        activo: therapist.activo
      })
      setPhotoPreview(therapist.foto_url || null)
    setPhotoFile(null)
  } else {
      setEditingTherapist(null)
      setFormData({
        nombre_completo: '',
        dni: '',
        fecha_nacimiento: '',
        telefono: '',
        email: '',
        direccion: '',
        fecha_ingreso: new Date().toISOString().split('T')[0],
        especialidad: '',
        descripcion: '',
        cuenta_bancaria: '',
        banco: '',
        tipo_cuenta: 'ahorros',
        cci: '',
        contacto_emergencia: '',
        telefono_emergencia: '',
        notas_admin: '',
        activo: 1
      })
      setPhotoPreview(null)
      setPhotoFile(null)
    }
    setShowModal(true)
    setActiveTab('personal')
  }

  const handleViewPayments = async (therapist) => {
    setSelectedTherapist(therapist)
    await loadTherapistPayments(therapist.id)
    setShowPaymentsModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('authToken')
      const url = editingTherapist
        ? `${API_BASE_URL}/therapists.php?action=update&id=${editingTherapist.id}`
        : `${API_BASE_URL}/therapists.php?action=create`
      
      const formDataToSend = new FormData()
      
      // Agregar todos los campos
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key] || '')
      })
      
      // AGREGAR LA FOTO SI EXISTE
      if (photoFile) {
        formDataToSend.append('foto', photoFile)
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      })
      
      const data = await response.json()
      
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: editingTherapist ? 'Terapeuta Actualizado' : 'Terapeuta Creado',
          text: data.message,
          confirmButtonColor: '#d946ef',
          timer: 2000
        })
        setShowModal(false)
        loadTherapists()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message,
          confirmButtonColor: '#d946ef'
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar terapeuta',
        confirmButtonColor: '#d946ef'
      })
    }
  }

  const handleDelete = async (therapist) => {
    const result = await Swal.fire({
      title: '¿Eliminar terapeuta?',
      text: `¿Estás seguro de eliminar a ${therapist.nombre_completo}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    })
    
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('authToken')
        
        const response = await fetch(
          `${API_BASE_URL}/therapists.php?action=delete&id=${therapist.id}`,
          {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          }
        )
        
        const data = await response.json()
        
        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'Terapeuta eliminado correctamente',
            confirmButtonColor: '#d946ef',
            timer: 2000
          })
          loadTherapists()
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al eliminar terapeuta',
          confirmButtonColor: '#d946ef'
        })
      }
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo muy grande',
          text: 'La foto no debe superar 5MB',
          confirmButtonColor: '#d946ef'
        })
        return
      }
      
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'Formato inválido',
          text: 'Solo se permiten imágenes',
          confirmButtonColor: '#d946ef'
        })
        return
      }
      
      setPhotoFile(file)
      
      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
  }



  const calculateAntiguedad = (fechaIngreso) => {
    if (!fechaIngreso) return 'N/A'
    
    const inicio = new Date(fechaIngreso)
    const hoy = new Date()
    
    const años = hoy.getFullYear() - inicio.getFullYear()
    const meses = hoy.getMonth() - inicio.getMonth()
    
    if (años === 0) {
      return `${meses} ${meses === 1 ? 'mes' : 'meses'}`
    } else if (meses < 0) {
      return `${años - 1} ${años - 1 === 1 ? 'año' : 'años'}, ${12 + meses} meses`
    } else {
      return `${años} ${años === 1 ? 'año' : 'años'}${meses > 0 ? `, ${meses} meses` : ''}`
    }
  }

  if (loading) {
    return (
      <div className="therapists-management-loading">
        <div className="spinner-large"></div>
        <p>Cargando terapeutas...</p>
      </div>
    )
  }

  return (
    <div className="therapists-management-page">
      {/* Header */}
      <div className="tm-header">
        <div>
          <h1 className="tm-title">
            <FiUsers /> Gestión de Terapeutas
          </h1>
          <p className="tm-subtitle">
            Administra la información completa de tu equipo
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FiPlus /> Nuevo Terapeuta
        </button>
      </div>

      {/* Lista de Terapeutas */}
      <div className="tm-grid">
        {therapists.map((therapist) => (
          <div key={therapist.id} className="tm-card">
            <div className="tm-card-header">
              <div className="tm-avatar">
                {therapist.foto_url ? (
                  <img src={therapist.foto_url} alt={therapist.nombre_completo} />
                ) : (
                  <div className="tm-avatar-placeholder">
                    {therapist.nombre_completo.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                )}
                <div className={`tm-status ${therapist.activo ? 'active' : 'inactive'}`}>
                  {therapist.activo ? <FiCheckCircle /> : <FiX />}
                </div>
              </div>
              
              <div className="tm-info">
                <h3>{therapist.nombre_completo}</h3>
                <span className="tm-specialty">{therapist.especialidad}</span>
              </div>
            </div>

            <div className="tm-card-body">
              {therapist.dni && (
                <div className="tm-detail">
                  <FiCreditCard className="tm-icon" />
                  <span>DNI: {therapist.dni}</span>
                </div>
              )}
              
              {therapist.telefono && (
                <div className="tm-detail">
                  <FiPhone className="tm-icon" />
                  <span>{therapist.telefono}</span>
                </div>
              )}
              
              {therapist.email && (
                <div className="tm-detail">
                  <FiMail className="tm-icon" />
                  <span>{therapist.email}</span>
                </div>
              )}
              
              {therapist.fecha_ingreso && (
                <div className="tm-detail">
                  <FiCalendar className="tm-icon" />
                  <span>Antigüedad: {calculateAntiguedad(therapist.fecha_ingreso)}</span>
                </div>
              )}
            </div>

            <div className="tm-card-footer">
              <button
                className="tm-btn tm-btn-view"
                onClick={() => handleViewPayments(therapist)}
              >
                <FiDollarSign /> Pagos
              </button>
              <button
                className="tm-btn tm-btn-edit"
                onClick={() => handleOpenModal(therapist)}
              >
                <FiEdit2 /> Editar
              </button>
              <button
                className="tm-btn tm-btn-delete"
                onClick={() => handleDelete(therapist)}
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      {therapists.length === 0 && (
        <div className="tm-empty">
          <FiUsers className="tm-empty-icon" />
          <h3>No hay terapeutas registrados</h3>
          <p>Comienza agregando tu primer terapeuta</p>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <FiPlus /> Agregar Terapeuta
          </button>
        </div>
      )}

      {/* Modal de Edición/Creación */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTherapist ? 'Editar Terapeuta' : 'Nuevo Terapeuta'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="tm-form">
          {/* Tabs */}
          <div className="tm-tabs">
            <button
              type="button"
              className={`tm-tab ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              Información Personal
            </button>
            <button
              type="button"
              className={`tm-tab ${activeTab === 'bancaria' ? 'active' : ''}`}
              onClick={() => setActiveTab('bancaria')}
            >
              Información Bancaria
            </button>
            <button
              type="button"
              className={`tm-tab ${activeTab === 'adicional' ? 'active' : ''}`}
              onClick={() => setActiveTab('adicional')}
            >
              Información Adicional
            </button>
          </div>

          {/* Tab Content: Personal */}
          {activeTab === 'personal' && (
  <div className="tm-tab-content">
    {/* Foto de Perfil */}
    <div className="tm-form-group">
      <label>Foto de Perfil</label>
      <div className="tm-photo-upload">
        <div className="tm-photo-preview">
          {photoPreview ? (
            <>
              <img src={photoPreview} alt="Preview" />
              <button
                type="button"
                className="tm-photo-remove"
                onClick={removePhoto}
              >
                <FiX />
              </button>
            </>
          ) : (
            <div className="tm-photo-placeholder">
              <FiUsers />
              <span>Sin foto</span>
            </div>
          )}
        </div>
        <div className="tm-photo-actions">
          <input
            type="file"
            id="photo-upload"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="photo-upload" className="btn btn-secondary">
            <FiUpload /> {photoPreview ? 'Cambiar Foto' : 'Subir Foto'}
          </label>
          <small className="tm-photo-hint">
            JPG, PNG o WEBP. Máximo 5MB
          </small>
        </div>
      </div>
    </div>



              <div className="tm-form-row">
                <div className="tm-form-group">
                  <label>Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre_completo}
                    onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                  />
                </div>
                
                <div className="tm-form-group">
                  <label>DNI *</label>
                  <input
                    type="text"
                    required
                    maxLength="8"
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  />
                </div>
              </div>

              <div className="tm-form-row">
                <div className="tm-form-group">
                  <label>Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                  />
                </div>
                
                <div className="tm-form-group">
                  <label>Fecha de Ingreso *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_ingreso}
                    onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                  />
                </div>
              </div>

              <div className="tm-form-row">
                <div className="tm-form-group">
                  <label>Teléfono *</label>
                  <input
                    type="tel"
                    required
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
                
                <div className="tm-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="tm-form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
              </div>

              <div className="tm-form-group">
                <label>Especialidad *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Masajista, Esteticista, etc."
                  value={formData.especialidad}
                  onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                />
              </div>

              <div className="tm-form-group">
                <label>Descripción</label>
                <textarea
                  rows="3"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>

              <div className="tm-form-group">
                <label className="tm-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked ? 1 : 0 })}
                  />
                  <span>Terapeuta activo</span>
                </label>
              </div>
            </div>
          )}

          {/* Tab Content: Bancaria */}
          {activeTab === 'bancaria' && (
            <div className="tm-tab-content">
              <div className="tm-form-group">
                <label>Banco</label>
                <select
                  value={formData.banco}
                  onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                >
                  <option value="">Seleccionar banco</option>
                  <option value="BCP">BCP - Banco de Crédito del Perú</option>
                  <option value="BBVA">BBVA</option>
                  <option value="Interbank">Interbank</option>
                  <option value="Scotiabank">Scotiabank</option>
                  <option value="BanBif">BanBif</option>
                  <option value="Pichincha">Pichincha</option>
                  <option value="Yape">Yape</option>
                  <option value="Plin">Plin</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="tm-form-row">
                <div className="tm-form-group">
                  <label>Tipo de Cuenta</label>
                  <select
                    value={formData.tipo_cuenta}
                    onChange={(e) => setFormData({ ...formData, tipo_cuenta: e.target.value })}
                  >
                    <option value="ahorros">Ahorros</option>
                    <option value="corriente">Corriente</option>
                  </select>
                </div>
                
                <div className="tm-form-group">
                  <label>Número de Cuenta</label>
                  <input
                    type="text"
                    value={formData.cuenta_bancaria}
                    onChange={(e) => setFormData({ ...formData, cuenta_bancaria: e.target.value })}
                  />
                </div>
              </div>

              <div className="tm-form-group">
                <label>CCI (Código de Cuenta Interbancaria)</label>
                <input
                  type="text"
                  maxLength="20"
                  value={formData.cci}
                  onChange={(e) => setFormData({ ...formData, cci: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Tab Content: Adicional */}
          {activeTab === 'adicional' && (
            <div className="tm-tab-content">
              <h4>Contacto de Emergencia</h4>
              
              <div className="tm-form-group">
                <label>Nombre del Contacto</label>
                <input
                  type="text"
                  value={formData.contacto_emergencia}
                  onChange={(e) => setFormData({ ...formData, contacto_emergencia: e.target.value })}
                />
              </div>

              <div className="tm-form-group">
                <label>Teléfono de Emergencia</label>
                <input
                  type="tel"
                  value={formData.telefono_emergencia}
                  onChange={(e) => setFormData({ ...formData, telefono_emergencia: e.target.value })}
                />
              </div>

              <div className="tm-form-group">
                <label>Notas Administrativas</label>
                <textarea
                  rows="4"
                  placeholder="Notas internas visibles solo para administradores"
                  value={formData.notas_admin}
                  onChange={(e) => setFormData({ ...formData, notas_admin: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="tm-form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              <FiX /> Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <FiSave /> {editingTherapist ? 'Actualizar' : 'Crear'} Terapeuta
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Pagos */}
      <Modal
        isOpen={showPaymentsModal}
        onClose={() => setShowPaymentsModal(false)}
        title={`Historial de Pagos - ${selectedTherapist?.nombre_completo}`}
        size="large"
      >
        {selectedTherapist && (
          <div className="tm-payments-modal">
            <div className="tm-payments-summary">
              <div className="tm-payment-stat">
                <div className="tm-payment-stat-icon">
                  <FiDollarSign />
                </div>
                <div>
                  <div className="tm-payment-stat-label">Total Pagado</div>
                  <div className="tm-payment-stat-value">
                    {formatPrice(therapistPayments.reduce((sum, p) => sum + parseFloat(p.comision_40 || 0), 0))}
                  </div>
                </div>
              </div>
              
              <div className="tm-payment-stat">
                <div className="tm-payment-stat-icon success">
                  <FiCheckCircle />
                </div>
                <div>
                  <div className="tm-payment-stat-label">Pagos Realizados</div>
                  <div className="tm-payment-stat-value">{therapistPayments.length}</div>
                </div>
              </div>
            </div>

            <div className="tm-payments-table">
              <table>
                <thead>
                  <tr>
                    <th>Período</th>
                    <th>Citas</th>
                    <th>Ingresos</th>
                    <th>Comisión</th>
                    <th>Método</th>
                    <th>Fecha Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {therapistPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td>
                        {new Date(payment.periodo_inicio).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                        {' - '}
                        {new Date(payment.periodo_fin).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td>{payment.total_citas}</td>
                      <td>{formatPrice(payment.total_ingresos)}</td>
                      <td className="tm-payment-amount">{formatPrice(payment.comision_40)}</td>
                      <td>
                        <span className="tm-payment-method">
                          {payment.metodo_pago}
                        </span>
                      </td>
                      <td>{new Date(payment.fecha_pago).toLocaleDateString('es-PE')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {therapistPayments.length === 0 && (
                <div className="tm-payments-empty">
                  <FiAlertCircle />
                  <p>No hay pagos registrados</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default TherapistsManagementPage