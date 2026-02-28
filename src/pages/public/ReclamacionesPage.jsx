import React, { useState } from 'react'
import { FiAlertCircle, FiCheckCircle, FiFileText, FiSend } from 'react-icons/fi'
import reclamacionesService from '../../services/reclamacionesService'
import { departamentos, provincias, distritos } from '../../utils/ubigeo'
import Swal from 'sweetalert2'
import './ReclamacionesPage.css'
import PrivacyPolicyModal from '../../components/common/PrivacyPolicyModal'  // ← AGREGAR
import CookiesPolicyModal from '../../components/common/CookiesPolicyModal' 

const ReclamacionesPage = () => {
  const [step, setStep] = useState(1) // 1: Formulario, 2: Éxito
  const [codigoGenerado, setCodigoGenerado] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    // Identificación
    nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    tipo_documento: 'DNI',
    numero_documento: '',
    celular: '',
    departamento: '',
    provincia: '',
    distrito: '',
    direccion: '',
    referencia: '',
    correo_electronico: '',
    es_menor_edad: false,
    
    // Detalle del reclamo
    tipo_reclamo: 'RECLAMACION',
    tipo_consumo: 'PRODUCTO',
    numero_pedido: '',
    fecha_reclamo: new Date().toISOString().split('T')[0],
    proveedor: 'Encantos SPA',
    monto_reclamado: '',
    descripcion_producto_servicio: '',
    fecha_compra: '',
    fecha_consumo: '',
    fecha_caducidad: '',
    detalle_reclamo: '',
    pedido_cliente: '',
    
    // Aceptación
    acepta_politicas: false
  })

  const [errors, setErrors] = useState({})
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showCookiesModal, setShowCookiesModal] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Limpiar errores
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Resetear provincia y distrito al cambiar departamento
    if (name === 'departamento') {
      setFormData(prev => ({ ...prev, provincia: '', distrito: '' }))
    }
    if (name === 'provincia') {
      setFormData(prev => ({ ...prev, distrito: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validaciones de identificación
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!formData.primer_apellido.trim()) newErrors.primer_apellido = 'El primer apellido es requerido'
    if (!formData.segundo_apellido.trim()) newErrors.segundo_apellido = 'El segundo apellido es requerido'
    if (!formData.numero_documento.trim()) newErrors.numero_documento = 'El número de documento es requerido'
    if (!formData.celular.trim()) newErrors.celular = 'El celular es requerido'
    if (!formData.departamento) newErrors.departamento = 'Seleccione un departamento'
    if (!formData.provincia) newErrors.provincia = 'Seleccione una provincia'
    if (!formData.distrito) newErrors.distrito = 'Seleccione un distrito'
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es requerida'
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.correo_electronico.trim()) {
      newErrors.correo_electronico = 'El correo es requerido'
    } else if (!emailRegex.test(formData.correo_electronico)) {
      newErrors.correo_electronico = 'Correo electrónico no válido'
    }

    // Validaciones de detalle
    if (!formData.descripcion_producto_servicio.trim()) {
      newErrors.descripcion_producto_servicio = 'La descripción es requerida'
    }
    if (!formData.detalle_reclamo.trim()) {
      newErrors.detalle_reclamo = 'El detalle del reclamo es requerido'
    }
    if (!formData.pedido_cliente.trim()) {
      newErrors.pedido_cliente = 'El pedido del cliente es requerido'
    }

    // Validar aceptación de políticas
    if (!formData.acepta_politicas) {
      newErrors.acepta_politicas = 'Debe aceptar la política de privacidad'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Datos Incompletos',
        text: 'Por favor complete todos los campos obligatorios',
        confirmButtonColor: '#dc2626'
      })
      return
    }

    setLoading(true)

    try {
      const result = await reclamacionesService.crearReclamacion(formData)

      if (result.success) {
        setCodigoGenerado(result.data.codigo_reclamo)
        setStep(2)
        
        Swal.fire({
          icon: 'success',
          title: '¡Reclamación Registrada!',
          html: `
            <p>Su reclamación ha sido registrada exitosamente.</p>
            <p><strong>Código de seguimiento:</strong></p>
            <div style="background: #f3f4f6; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
              <h2 style="color: #dc2626; margin: 0; font-size: 1.5rem;">${result.data.codigo_reclamo}</h2>
            </div>
            <p style="font-size: 0.875rem; color: #6b7280;">
              Guarde este código para consultar el estado de su reclamación.
            </p>
          `,
          confirmButtonColor: '#dc2626'
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'Error al registrar la reclamación',
          confirmButtonColor: '#dc2626'
        })
      }
    } catch (error) {
      console.error('Error:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error de conexión. Por favor intente nuevamente.',
        confirmButtonColor: '#dc2626'
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      tipo_documento: 'DNI',
      numero_documento: '',
      celular: '',
      departamento: '',
      provincia: '',
      distrito: '',
      direccion: '',
      referencia: '',
      correo_electronico: '',
      es_menor_edad: false,
      tipo_reclamo: 'RECLAMACION',
      tipo_consumo: 'PRODUCTO',
      numero_pedido: '',
      fecha_reclamo: new Date().toISOString().split('T')[0],
      proveedor: 'Encantos SPA',
      monto_reclamado: '',
      descripcion_producto_servicio: '',
      fecha_compra: '',
      fecha_consumo: '',
      fecha_caducidad: '',
      detalle_reclamo: '',
      pedido_cliente: '',
      acepta_politicas: false
    })
    setErrors({})
    setStep(1)
    setCodigoGenerado('')
  }

  if (step === 2) {
    return (
      <div className="reclamaciones-page">
        <div className="reclamaciones-container">
          <div className="success-message">
            <div className="success-icon">
              <FiCheckCircle />
            </div>
            <h2>¡Reclamación Registrada!</h2>
            <p>Su reclamación ha sido registrada exitosamente en nuestro sistema.</p>
            
            <div className="codigo-box">
              <span className="codigo-label">Código de Seguimiento:</span>
              <div className="codigo-value">{codigoGenerado}</div>
              <p className="codigo-hint">
                Guarde este código para consultar el estado de su reclamación
              </p>
            </div>

            <div className="success-info">
              <FiAlertCircle />
              <p>
                Recibirá una respuesta en un plazo máximo de <strong>15 días calendario</strong>, 
                pudiendo ampliarse hasta 30 días adicionales según la complejidad del caso.
              </p>
            </div>

            <div className="success-actions">
              <button className="btn btn-primary" onClick={resetForm}>
                <FiFileText />
                Nueva Reclamación
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reclamaciones-page">
      <div className="reclamaciones-container">
        {/* Header con logo */}
        <div className="reclamaciones-header">
          <div className="header-logo">
              </div>
          <h1>Libro de Reclamaciones</h1>
          <p className="header-subtitle">
            Conforme a lo establecido en el Código de Protección y Defensa del Consumidor
          </p>
        </div>

        <form onSubmit={handleSubmit} className="reclamaciones-form">
          {/* Sección 1: Identificación del Consumidor */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-number">1</span>
              Identificación del Consumidor Reclamante
            </h2>
            <p className="section-note">* Datos requeridos</p>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  className={`form-input ${errors.nombre ? 'error' : ''}`}
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ingrese su nombre"
                />
                {errors.nombre && <span className="error-message">{errors.nombre}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Primer Apellido *
                </label>
                <input
                  type="text"
                  name="primer_apellido"
                  className={`form-input ${errors.primer_apellido ? 'error' : ''}`}
                  value={formData.primer_apellido}
                  onChange={handleChange}
                  placeholder="Ingrese su primer apellido"
                />
                {errors.primer_apellido && <span className="error-message">{errors.primer_apellido}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Segundo Apellido *
                </label>
                <input
                  type="text"
                  name="segundo_apellido"
                  className={`form-input ${errors.segundo_apellido ? 'error' : ''}`}
                  value={formData.segundo_apellido}
                  onChange={handleChange}
                  placeholder="Ingrese su segundo apellido"
                />
                {errors.segundo_apellido && <span className="error-message">{errors.segundo_apellido}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Tipo de Documentación *
                </label>
                <select
                  name="tipo_documento"
                  className="form-input"
                  value={formData.tipo_documento}
                  onChange={handleChange}
                >
                  <option value="DNI">DNI</option>
                  <option value="CE">Carné de Extranjería</option>
                  <option value="PASAPORTE">Pasaporte</option>
                  <option value="RUC">RUC</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Número de Documentación *
                </label>
                <input
                  type="text"
                  name="numero_documento"
                  className={`form-input ${errors.numero_documento ? 'error' : ''}`}
                  value={formData.numero_documento}
                  onChange={handleChange}
                  placeholder="Ej: 12345678"
                  maxLength={formData.tipo_documento === 'DNI' ? 8 : 20}
                />
                {errors.numero_documento && <span className="error-message">{errors.numero_documento}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Celular *
                </label>
                <input
                  type="tel"
                  name="celular"
                  className={`form-input ${errors.celular ? 'error' : ''}`}
                  value={formData.celular}
                  onChange={handleChange}
                  placeholder="Ej: 987654321"
                  maxLength={9}
                />
                {errors.celular && <span className="error-message">{errors.celular}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Departamento *
                </label>
                <select
                  name="departamento"
                  className={`form-input ${errors.departamento ? 'error' : ''}`}
                  value={formData.departamento}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar departamento</option>
                  {departamentos.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
                {errors.departamento && <span className="error-message">{errors.departamento}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Provincia *
                </label>
                <select
                  name="provincia"
                  className={`form-input ${errors.provincia ? 'error' : ''}`}
                  value={formData.provincia}
                  onChange={handleChange}
                  disabled={!formData.departamento}
                >
                  <option value="">Seleccionar provincia</option>
                  {formData.departamento && provincias[formData.departamento]?.map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
                {errors.provincia && <span className="error-message">{errors.provincia}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Distrito *
                </label>
                <select
                  name="distrito"
                  className={`form-input ${errors.distrito ? 'error' : ''}`}
                  value={formData.distrito}
                  onChange={handleChange}
                  disabled={!formData.provincia}
                >
                  <option value="">Seleccionar distrito</option>
                  {formData.provincia && distritos[formData.provincia]?.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
                {errors.distrito && <span className="error-message">{errors.distrito}</span>}
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  Dirección *
                </label>
                <input
                  type="text"
                  name="direccion"
                  className={`form-input ${errors.direccion ? 'error' : ''}`}
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Ingrese su dirección completa"
                />
                {errors.direccion && <span className="error-message">{errors.direccion}</span>}
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  Referencia
                </label>
                <input
                  type="text"
                  name="referencia"
                  className="form-input"
                  value={formData.referencia}
                  onChange={handleChange}
                  placeholder="Ej: Cerca al parque, frente a..."
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  name="correo_electronico"
                  className={`form-input ${errors.correo_electronico ? 'error' : ''}`}
                  value={formData.correo_electronico}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                />
                {errors.correo_electronico && <span className="error-message">{errors.correo_electronico}</span>}
              </div>

              <div className="form-group full-width">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="es_menor_edad"
                    checked={formData.es_menor_edad}
                    onChange={handleChange}
                  />
                  <span>¿Eres menor de edad?</span>
                </label>
              </div>
            </div>
          </div>

        {/* Sección 2: Detalle del Reclamo */}
        <div className="form-section">
            <h2 className="section-title">
              <span className="section-number">2</span>
              Detalle del Reclamo y Orden del Consumidor
            </h2>
            <p className="section-note">* Datos requeridos</p>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Tipo de Reclamo *
                </label>
                <select
                  name="tipo_reclamo"
                  className="form-input"
                  value={formData.tipo_reclamo}
                  onChange={handleChange}
                >
                  <option value="RECLAMACION">Reclamación</option>
                  <option value="QUEJA">Queja</option>
                </select>
                <small className="form-hint">
                  Reclamación: Disconformidad con productos/servicios. 
                  Queja: Disconformidad con la atención.
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Tipo de Consumo *
                </label>
                <select
                  name="tipo_consumo"
                  className="form-input"
                  value={formData.tipo_consumo}
                  onChange={handleChange}
                >
                  <option value="PRODUCTO">Producto</option>
                  <option value="SERVICIO">Servicio</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  N° de Pedido
                </label>
                <input
                  type="text"
                  name="numero_pedido"
                  className="form-input"
                  value={formData.numero_pedido}
                  onChange={handleChange}
                  placeholder="Ej: ORD-2024-001"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Fecha de Reclamación/Queja
                </label>
                <input
                  type="date"
                  name="fecha_reclamo"
                  className="form-input"
                  value={formData.fecha_reclamo}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Proveedor
                </label>
                <input
                  type="text"
                  name="proveedor"
                  className="form-input"
                  value={formData.proveedor}
                  onChange={handleChange}
                  placeholder="Nombre del proveedor"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Monto Reclamado (S/.)
                </label>
                <input
                  type="number"
                  name="monto_reclamado"
                  className="form-input"
                  value={formData.monto_reclamado}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  Descripción del Producto o Servicio *
                </label>
                <textarea
                  name="descripcion_producto_servicio"
                  className={`form-input ${errors.descripcion_producto_servicio ? 'error' : ''}`}
                  value={formData.descripcion_producto_servicio}
                  onChange={handleChange}
                  placeholder="Describa el producto o servicio adquirido"
                  rows="3"
                />
                {errors.descripcion_producto_servicio && (
                  <span className="error-message">{errors.descripcion_producto_servicio}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Fecha de Compra
                </label>
                <input
                  type="date"
                  name="fecha_compra"
                  className="form-input"
                  value={formData.fecha_compra}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Fecha de Consumo
                </label>
                <input
                  type="date"
                  name="fecha_consumo"
                  className="form-input"
                  value={formData.fecha_consumo}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Fecha de Caducidad
                </label>
                <input
                  type="date"
                  name="fecha_caducidad"
                  className="form-input"
                  value={formData.fecha_caducidad}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  Detalle de la Reclamación/Queja *
                </label>
                <textarea
                  name="detalle_reclamo"
                  className={`form-input ${errors.detalle_reclamo ? 'error' : ''}`}
                  value={formData.detalle_reclamo}
                  onChange={handleChange}
                  placeholder="Describa los hechos de manera clara y detallada"
                  rows="4"
                />
                {errors.detalle_reclamo && (
                  <span className="error-message">{errors.detalle_reclamo}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  Pedido del Cliente *
                </label>
                <textarea
                  name="pedido_cliente"
                  className={`form-input ${errors.pedido_cliente ? 'error' : ''}`}
                  value={formData.pedido_cliente}
                  onChange={handleChange}
                  placeholder="Indique qué espera como solución a su reclamo"
                  rows="3"
                />
                {errors.pedido_cliente && (
                  <span className="error-message">{errors.pedido_cliente}</span>
                )}
              </div>
            </div>
          </div>

                {/* Sección 3: Información Legal */}
          <div className="form-section legal-section">
            <div className="legal-info">
              <h3>Información Importante:</h3>
              <ul>
                <li>
                  <strong>(1) Reclamación:</strong> Disconformidad relacionada con los productos o servicios.
                </li>
                <li>
                  <strong>(2) Queja:</strong> Disconformidad no relacionada con los productos o servicios; 
                  o malestar o insatisfacción con la atención al público.
                </li>
              </ul>

              <div className="legal-notice">
                <FiAlertCircle />
                <div>
                  <p><strong>Declaración Jurada:</strong></p>
                  <p>
                    Declaro que soy el titular del servicio y acepto el contenido de este formulario, 
                    declarando bajo Declaración Jurada la veracidad de los hechos descritos.
                  </p>
                </div>
              </div>

              <div className="legal-points">
                <p>* La formulación del reclamo no excluye el recurso a otros medios de resolución de controversias 
                   ni es un requisito previo para presentar una denuncia ante INDECOPI.</p>
                <p>* El proveedor debe responder a la reclamación en un plazo no superior a <strong>quince (15) días calendario</strong>, 
                   pudiendo ampliar el plazo hasta treinta (30) días más.</p>
                <p>* Con la firma de este documento, el cliente autoriza a ser contactado después de la tramitación 
                   de la reclamación para evaluar la calidad y satisfacción del proceso de atención.</p>
              </div>
            </div>

            <div className="form-group full-width">
              <label className={`checkbox-label ${errors.acepta_politicas ? 'error' : ''}`}>
                <input
                  type="checkbox"
                  name="acepta_politicas"
                  checked={formData.acepta_politicas}
                  onChange={handleChange}
                />
                <span>
                  He leído y acepto la{' '}
                  <button 
                    type="button" 
                    className="link-button"
                    onClick={() => setShowPrivacyModal(true)}
                  >
                    Política de Privacidad y Seguridad
                  </button>
                  {' '}y la{' '}
                  <button 
                    type="button" 
                    className="link-button"
                    onClick={() => setShowCookiesModal(true)}
                  >
                    Política de Cookies
                  </button>. *
                </span>
              </label>
              {errors.acepta_politicas && (
                <span className="error-message">{errors.acepta_politicas}</span>
              )}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
              disabled={loading}
            >
              Limpiar Formulario
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <FiSend />
                  Enviar Reclamación
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer con información INDECOPI */}
        <div className="reclamaciones-footer">
        <div className="footer-content">
          <p>
            <strong>Instituto Nacional de Defensa de la Competencia y de la Protección de la Propiedad Intelectual (INDECOPI)</strong>
          </p>
          <p>Calle La Prosa 104, San Borja - Lima, Perú</p>
          <p>Teléfono: (01) 224-7777 / 0800-4-4040 (línea gratuita)</p>
          <p>Sitio web: <a href="https://www.indecopi.gob.pe" target="_blank" rel="noopener noreferrer">www.indecopi.gob.pe</a></p>
        </div>
      </div>


  {/* Modales */}
  <PrivacyPolicyModal 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)} 
      />
      <CookiesPolicyModal 
        isOpen={showCookiesModal} 
        onClose={() => setShowCookiesModal(false)} 
      />


      </div>
    </div>
  )
}

export default ReclamacionesPage