import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPhone } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import Swal from 'sweetalert2'
import './Auth.css'

const Register = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres'
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido'
    }

    // Validar teléfono (opcional pero si se ingresa debe ser válido)
    if (formData.telefono && !/^\d{9}$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener 9 dígitos'
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Debe contener mayúsculas y minúsculas'
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const userData = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        password: formData.password
      }

      const result = await register(userData)

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Registro Exitoso!',
          text: 'Tu cuenta ha sido creada correctamente',
          timer: 2000,
          showConfirmButton: false,
          background: '#1a1333',
          color: '#fff'
        })

        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'No se pudo crear la cuenta',
          background: '#1a1333',
          color: '#fff'
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al registrarse',
        background: '#1a1333',
        color: '#fff'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      {/* Animated Background */}
      <div className="auth-background">
        <div className="auth-gradient-bg"></div>
        <div className="auth-mesh-gradient"></div>
        <div className="auth-floating-orb auth-orb-1"></div>
        <div className="auth-floating-orb auth-orb-2"></div>
        <div className="auth-floating-orb auth-orb-3"></div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">✨</div>
          <h1 className="auth-title">Crear Cuenta</h1>
          <p className="auth-subtitle">Únete a nuestra comunidad de bienestar</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Nombre */}
          <div className="form-group">
            <label htmlFor="nombre" className="form-label">
              Nombre Completo
            </label>
            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input
                type="text"
                id="nombre"
                name="nombre"
                className={`form-input ${errors.nombre ? 'error' : ''}`}
                placeholder="Tu nombre completo"
                value={formData.nombre}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            {errors.nombre && (
              <span className="form-error">{errors.nombre}</span>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Correo Electrónico
            </label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="tu@correo.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <span className="form-error">{errors.email}</span>
            )}
          </div>

          {/* Teléfono */}
          <div className="form-group">
            <label htmlFor="telefono" className="form-label">
              Teléfono <span className="optional">(Opcional)</span>
            </label>
            <div className="input-wrapper">
              <FiPhone className="input-icon" />
              <input
                type="tel"
                id="telefono"
                name="telefono"
                className={`form-input ${errors.telefono ? 'error' : ''}`}
                placeholder="987654321"
                value={formData.telefono}
                onChange={handleChange}
                disabled={loading}
                maxLength="9"
              />
            </div>
            {errors.telefono && (
              <span className="form-error">{errors.telefono}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && (
              <span className="form-error">{errors.password}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar Contraseña
            </label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="form-error">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Terms */}
          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" required />
              <span>
                Acepto los{' '}
                <Link to="/terminos" className="link-primary">
                  Términos y Condiciones
                </Link>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" />
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        {/* Benefits */}
        <div className="demo-credentials">
          <p className="demo-title">✨ Beneficios de Registrarte</p>
          <div className="demo-accounts">
            <div className="demo-account">
              <strong>🎁 Descuentos Exclusivos</strong>
              <span>Ofertas especiales para miembros</span>
            </div>
            <div className="demo-account">
              <strong>📅 Reservas Rápidas</strong>
              <span>Agenda tus citas fácilmente</span>
            </div>
            <div className="demo-account">
              <strong>⭐ Programa de Puntos</strong>
              <span>Acumula puntos en cada compra</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="link-primary">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register