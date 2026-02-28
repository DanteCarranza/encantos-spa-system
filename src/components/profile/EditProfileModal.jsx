import React, { useState, useEffect } from 'react'
import { FiX, FiSave } from 'react-icons/fi'
import profileService from '../../services/profileService'
import Swal from 'sweetalert2'
import './ProfileModals.css'

const EditProfileModal = ({ isOpen, onClose, profile, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    telefono: '',
    fecha_nacimiento: '',
    genero: '',
    direccion: '',
    distrito: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile) {
      setFormData({
        nombre_completo: profile.nombre_completo || '',
        telefono: profile.telefono || '',
        fecha_nacimiento: profile.fecha_nacimiento || '',
        genero: profile.genero || '',
        direccion: profile.direccion || '',
        distrito: profile.distrito || ''
      })
    }
  }, [profile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validaciones
    if (!formData.nombre_completo.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'El nombre es requerido',
        confirmButtonColor: '#d946ef'
      })
      return
    }

    if (formData.telefono && !/^[0-9]{9}$/.test(formData.telefono)) {
      Swal.fire({
        icon: 'warning',
        title: 'Teléfono inválido',
        text: 'El teléfono debe tener 9 dígitos',
        confirmButtonColor: '#d946ef'
      })
      return
    }

    setLoading(true)
    const result = await profileService.actualizarInformacion(formData)
    setLoading(false)

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        text: 'Tu información ha sido actualizada',
        confirmButtonColor: '#d946ef'
      })
      onSuccess()
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.message || 'No se pudo actualizar la información',
        confirmButtonColor: '#d946ef'
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Editar Información Personal</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nombre_completo">Nombre Completo *</label>
              <input
                type="text"
                id="nombre_completo"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono *</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="form-input"
                placeholder="987654321"
                maxLength="9"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
              <input
                type="date"
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="genero">Género</label>
              <select
                id="genero"
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Selecciona</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
                <option value="prefiero_no_decir">Prefiero no decir</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="direccion">Dirección</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="form-input"
                placeholder="Av. Principal 123"
              />
            </div>

            <div className="form-group">
              <label htmlFor="distrito">Distrito</label>
              <input
                type="text"
                id="distrito"
                name="distrito"
                value={formData.distrito}
                onChange={handleChange}
                className="form-input"
                placeholder="Miraflores"
              />
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
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
      </div>
    </div>
  )
}

export default EditProfileModal