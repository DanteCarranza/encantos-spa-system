import React, { useState, useEffect } from 'react'
import { 
  FiTrendingUp,
  FiTarget,
  FiDollarSign,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiSave,
  FiX,
  FiPlus,
  FiTrash2,
  FiBarChart2,
  FiCalendar,
  FiArrowUp,
  FiArrowDown,
  FiActivity,
  
} from 'react-icons/fi'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import Swal from 'sweetalert2'
import aulaVirtualService from '../../services/aulaVirtualService'
import './MetasPage.css'

const MetasPage = () => {
  const [loading, setLoading] = useState(true)
  const [metas, setMetas] = useState({
    meta_mensual: 0,
    ingresos_actuales: 0,
    proyeccion: 0,
    porcentaje_cumplimiento: 0,
    dias_restantes: 0,
    promedio_diario_necesario: 0,
    promedio_diario_actual: 0,
    estado: 'en_riesgo' // en_riesgo | en_camino | cumplida
  })
  
  const [metasPorCurso, setMetasPorCurso] = useState([])
  const [historico, setHistorico] = useState([])
  const [cursos, setCursos] = useState([])
  
  // Modal editar meta
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMeta, setEditingMeta] = useState({ mensual: 0 })
  
  // Modal nueva meta por curso
  const [showNewCursoMetaModal, setShowNewCursoMetaModal] = useState(false)
  const [newCursoMeta, setNewCursoMeta] = useState({
    curso_id: '',
    meta_mensual: 0,
    mes: new Date().toISOString().slice(0, 7) // YYYY-MM
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    
    // Cargar meta mensual general
    const metaResult = await aulaVirtualService.getMetaMensual()
    if (metaResult.success) {
      setMetas(metaResult.data)
    }
    
    // Cargar metas por curso
    const metasCursoResult = await aulaVirtualService.getMetasPorCurso()
    if (metasCursoResult.success) {
      setMetasPorCurso(metasCursoResult.data || [])
    }
    
    // Cargar histórico (últimos 6 meses)
    const historicoResult = await aulaVirtualService.getHistoricoMetas()
    if (historicoResult.success) {
      setHistorico(historicoResult.data || [])
    }
    
    // Cargar cursos
    const cursosResult = await aulaVirtualService.getCourses()
    if (cursosResult.success) {
      setCursos(cursosResult.data || [])
    }
    
    setLoading(false)
  }

  const handleEditMeta = () => {
    setEditingMeta({ mensual: metas.meta_mensual })
    setShowEditModal(true)
  }

  const handleSaveMeta = async () => {
    if (parseFloat(editingMeta.mensual) <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La meta debe ser mayor a 0',
        confirmButtonColor: '#3b82f6'
      })
      return
    }

    const result = await aulaVirtualService.updateMetaMensual({
      meta_mensual: parseFloat(editingMeta.mensual)
    })

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Meta Actualizada',
        text: 'La meta mensual se actualizó exitosamente',
        confirmButtonColor: '#3b82f6'
      })
      setShowEditModal(false)
      loadData()
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.message || 'No se pudo actualizar la meta',
        confirmButtonColor: '#3b82f6'
      })
    }
  }

  const handleNewCursoMeta = () => {
    setNewCursoMeta({
      curso_id: '',
      meta_mensual: 0,
      mes: new Date().toISOString().slice(0, 7)
    })
    setShowNewCursoMetaModal(true)
  }

  const handleSaveCursoMeta = async () => {
    if (!newCursoMeta.curso_id || parseFloat(newCursoMeta.meta_mensual) <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Completa todos los campos correctamente',
        confirmButtonColor: '#3b82f6'
      })
      return
    }

    const result = await aulaVirtualService.createMetaCurso(newCursoMeta)

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Meta Creada',
        text: 'La meta por curso se creó exitosamente',
        confirmButtonColor: '#3b82f6'
      })
      setShowNewCursoMetaModal(false)
      loadData()
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.message || 'No se pudo crear la meta',
        confirmButtonColor: '#3b82f6'
      })
    }
  }

  const handleDeleteCursoMeta = async (metaId) => {
    const confirm = await Swal.fire({
      icon: 'question',
      title: '¿Eliminar meta?',
      text: 'Esta acción no se puede deshacer',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b'
    })

    if (!confirm.isConfirmed) return

    const result = await aulaVirtualService.deleteMetaCurso(metaId)

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Meta Eliminada',
        confirmButtonColor: '#3b82f6'
      })
      loadData()
    }
  }

  // Calcular color según estado
  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'cumplida': return '#10b981'
      case 'en_camino': return '#f59e0b'
      case 'en_riesgo': return '#ef4444'
      default: return '#64748b'
    }
  }

  const getEstadoTexto = (estado) => {
    switch(estado) {
      case 'cumplida': return 'Meta Cumplida'
      case 'en_camino': return 'En Camino'
      case 'en_riesgo': return 'En Riesgo'
      default: return 'Sin Meta'
    }
  }

  const getEstadoIcon = (estado) => {
    switch(estado) {
      case 'cumplida': return <FiCheckCircle />
      case 'en_camino': return <FiClock />
      case 'en_riesgo': return <FiAlertCircle />
      default: return <FiActivity />
    }
  }

  // Datos para gráficos
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  const dataProyeccion = [
    { name: 'Ingresos Actuales', value: metas.ingresos_actuales },
    { name: 'Proyección Restante', value: Math.max(0, metas.proyeccion - metas.ingresos_actuales) }
  ]


  const handleDeleteMetaMensual = async () => {
    const confirm = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar meta mensual?',
      text: 'Se eliminará la meta del mes actual. Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b'
    })
  
    if (!confirm.isConfirmed) return
  
    const result = await aulaVirtualService.deleteMetaMensual()
  
    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Meta Eliminada',
        text: 'La meta mensual se eliminó exitosamente',
        confirmButtonColor: '#3b82f6'
      })
      loadData()
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.message || 'No se pudo eliminar la meta',
        confirmButtonColor: '#3b82f6'
      })
    }
  }

  
  return (
    <div className="metas-page">
      <div className="metas-container">
        {/* Hero Header */}
        <div className="metas-hero">
          <div className="hero-content-metas">
            <div className="hero-text-metas">
              <h1>Dashboard de Metas</h1>
              <p>Monitorea y gestiona tus objetivos de ingresos mensuales</p>
            </div>
            <div className="hero-icon-metas">
              <FiTarget />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-metas">
            <div className="spinner-large-metas"></div>
            <p>Cargando metas...</p>
          </div>
        ) : (
          <>
            {/* Alerta de Estado */}
            {metas.meta_mensual > 0 && (
              <div className={`alerta-estado ${metas.estado}`}>
                <div className="alerta-icon">
                  {getEstadoIcon(metas.estado)}
                </div>
                <div className="alerta-content">
                  <h3>{getEstadoTexto(metas.estado)}</h3>
                  {metas.estado === 'cumplida' && (
                    <p>¡Felicitaciones! Has alcanzado tu meta mensual de ingresos</p>
                  )}
                  {metas.estado === 'en_camino' && (
                    <p>Vas por buen camino. Mantén el ritmo para alcanzar tu meta</p>
                  )}
                  {metas.estado === 'en_riesgo' && (
                    <p>⚠️ Atención: Necesitas incrementar el ritmo de ventas. Promedio diario necesario: S/ {metas.promedio_diario_necesario.toFixed(2)}</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
  <button className="btn-edit-meta" onClick={handleEditMeta}>
    <FiEdit2 />
    Editar Meta
  </button>
  <button className="btn-delete-meta-mensual" onClick={handleDeleteMetaMensual}>
    <FiTrash2 />
    Eliminar Meta
  </button>
</div>
              </div>
            )}

            {/* KPIs Principales */}
            <div className="metas-kpis">
              <div className="kpi-meta grande">
                <div className="kpi-meta-header">
                  <div className="kpi-meta-icon">
                    <FiTarget />
                  </div>
                  <span className="kpi-meta-label">Meta Mensual</span>
                </div>
                <div className="kpi-meta-value">
                  S/ {parseFloat(metas.meta_mensual || 0).toFixed(2)}
                </div>
                {metas.meta_mensual === 0 && (
                  <button className="btn-definir-meta" onClick={handleEditMeta}>
                    <FiPlus />
                    Definir Meta
                  </button>
                )}
              </div>

              <div className="kpi-meta">
                <div className="kpi-meta-header">
                  <div className="kpi-meta-icon green">
                    <FiDollarSign />
                  </div>
                  <span className="kpi-meta-label">Ingresos Actuales</span>
                </div>
                <div className="kpi-meta-value">
                  S/ {parseFloat(metas.ingresos_actuales || 0).toFixed(2)}
                </div>
                <div className="kpi-meta-sub">
                  Promedio diario: S/ {metas.promedio_diario_actual.toFixed(2)}
                </div>
              </div>

              <div className="kpi-meta">
                <div className="kpi-meta-header">
                  <div className="kpi-meta-icon blue">
                    <FiTrendingUp />
                  </div>
                  <span className="kpi-meta-label">Proyección</span>
                </div>
                <div className="kpi-meta-value">
                  S/ {parseFloat(metas.proyeccion || 0).toFixed(2)}
                </div>
                <div className="kpi-meta-sub">
                  {metas.proyeccion >= metas.meta_mensual ? (
                    <span className="positive">
                      <FiArrowUp />
                      Por encima de la meta
                    </span>
                  ) : (
                    <span className="negative">
                      <FiArrowDown />
                      Por debajo de la meta
                    </span>
                  )}
                </div>
              </div>

              <div className="kpi-meta">
                <div className="kpi-meta-header">
                  <div className="kpi-meta-icon orange">
                    <FiClock />
                  </div>
                  <span className="kpi-meta-label">Días Restantes</span>
                </div>
                <div className="kpi-meta-value">
                  {metas.dias_restantes}
                </div>
                <div className="kpi-meta-sub">
                  Necesitas: S/ {metas.promedio_diario_necesario.toFixed(2)}/día
                </div>
              </div>
            </div>

            {/* Gráfico de Cumplimiento */}
            <div className="metas-charts-grid">
              {/* Progreso Circular */}
              <div className="chart-card-metas">
                <div className="chart-header-metas">
                  <h3>
                    <FiTarget />
                    Progreso de la Meta
                  </h3>
                </div>
                <div className="chart-body-metas">
                  <div className="progress-circular-wrapper">
                    <div className="progress-circular">
                      <svg viewBox="0 0 200 200">
                        <circle
                          cx="100"
                          cy="100"
                          r="90"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="20"
                        />
                        <circle
                          cx="100"
                          cy="100"
                          r="90"
                          fill="none"
                          stroke={getEstadoColor(metas.estado)}
                          strokeWidth="20"
                          strokeDasharray={`${(metas.porcentaje_cumplimiento / 100) * 565.48} 565.48`}
                          strokeLinecap="round"
                          transform="rotate(-90 100 100)"
                          style={{ transition: 'stroke-dasharray 1s ease' }}
                        />
                      </svg>
                      <div className="progress-text">
                        <span className="progress-value">{metas.porcentaje_cumplimiento.toFixed(1)}%</span>
                        <span className="progress-label">Cumplido</span>
                      </div>
                    </div>
                  </div>
                  <div className="progress-details">
                    <div className="progress-detail-item">
                      <span>Meta:</span>
                      <span className="bold">S/ {parseFloat(metas.meta_mensual).toFixed(2)}</span>
                    </div>
                    <div className="progress-detail-item">
                      <span>Alcanzado:</span>
                      <span className="bold green">S/ {parseFloat(metas.ingresos_actuales).toFixed(2)}</span>
                    </div>
                    <div className="progress-detail-item">
                      <span>Falta:</span>
                      <span className="bold orange">S/ {Math.max(0, metas.meta_mensual - metas.ingresos_actuales).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráfico de Proyección */}
              <div className="chart-card-metas">
                <div className="chart-header-metas">
                  <h3>
                    <FiBarChart2 />
                    Proyección vs Meta
                  </h3>
                </div>
                <div className="chart-body-metas">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: 'Meta', valor: metas.meta_mensual },
                      { name: 'Actual', valor: metas.ingresos_actuales },
                      { name: 'Proyección', valor: metas.proyeccion }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        formatter={(value) => `S/ ${value.toFixed(2)}`}
                        contentStyle={{ 
                          background: 'white', 
                          border: '2px solid #e2e8f0', 
                          borderRadius: '8px' 
                        }}
                      />
                      <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                        <Cell fill="#8b5cf6" />
                        <Cell fill="#10b981" />
                        <Cell fill="#3b82f6" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Histórico de Cumplimiento */}
            <div className="historico-section">
              <div className="section-header-metas">
                <h2>
                  <FiCalendar />
                  Histórico de Cumplimiento (Últimos 6 Meses)
                </h2>
              </div>
              <div className="chart-card-metas full-width">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={historico}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="mes" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      formatter={(value) => `S/ ${value.toFixed(2)}`}
                      contentStyle={{ 
                        background: 'white', 
                        border: '2px solid #e2e8f0', 
                        borderRadius: '8px' 
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="meta" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      name="Meta"
                      dot={{ fill: '#8b5cf6', r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ingresos" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Ingresos"
                      dot={{ fill: '#10b981', r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Metas por Curso */}
            <div className="metas-curso-section">
              <div className="section-header-metas">
                <h2>
                  <FiTarget />
                  Metas por Curso
                </h2>
                <button className="btn-nueva-meta-curso" onClick={handleNewCursoMeta}>
                  <FiPlus />
                  Nueva Meta
                </button>
              </div>

              {metasPorCurso.length === 0 ? (
                <div className="empty-metas-curso">
                  <FiTarget />
                  <h3>No hay metas por curso</h3>
                  <p>Define metas específicas para cada curso</p>
                  <button className="btn-create-first" onClick={handleNewCursoMeta}>
                    <FiPlus />
                    Crear Primera Meta
                  </button>
                </div>
              ) : (
                <div className="metas-curso-grid">
                  {metasPorCurso.map(meta => {
                    const porcentaje = meta.meta_mensual > 0 
                      ? (meta.ingresos_actuales / meta.meta_mensual * 100) 
                      : 0
                    
                    let estado = 'en_riesgo'
                    if (porcentaje >= 100) estado = 'cumplida'
                    else if (porcentaje >= 70) estado = 'en_camino'

                    return (
                      <div key={meta.id} className={`meta-curso-card ${estado}`}>
                        <div className="meta-curso-header">
                          <h4>{meta.curso_nombre}</h4>
                          <button 
                            className="btn-delete-meta"
                            onClick={() => handleDeleteCursoMeta(meta.id)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>

                        <div className="meta-curso-progress">
                          <div className="progress-bar-wrapper">
                            <div 
                              className="progress-bar-fill"
                              style={{ 
                                width: `${Math.min(porcentaje, 100)}%`,
                                background: getEstadoColor(estado)
                              }}
                            ></div>
                          </div>
                          <span className="progress-percentage">{porcentaje.toFixed(1)}%</span>
                        </div>

                        <div className="meta-curso-stats">
                          <div className="meta-curso-stat">
                            <span>Meta:</span>
                            <span className="value">S/ {parseFloat(meta.meta_mensual).toFixed(2)}</span>
                          </div>
                          <div className="meta-curso-stat">
                            <span>Actual:</span>
                            <span className="value green">S/ {parseFloat(meta.ingresos_actuales).toFixed(2)}</span>
                          </div>
                          <div className="meta-curso-stat">
                            <span>Falta:</span>
                            <span className="value orange">
                              S/ {Math.max(0, meta.meta_mensual - meta.ingresos_actuales).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className={`meta-curso-badge ${estado}`}>
                          {getEstadoIcon(estado)}
                          {getEstadoTexto(estado)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

       
       {/* Modal: Editar Meta Mensual */}
       {showEditModal && (
          <div className="modal-overlay-metas" onClick={() => setShowEditModal(false)}>
            <div className="modal-content-metas" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-metas">
                <h2>
                  <FiTarget />
                  Definir Meta Mensual
                </h2>
                <button className="btn-close-metas" onClick={() => setShowEditModal(false)}>
                  <FiX />
                </button>
              </div>

              <div className="modal-body-metas">
                <div className="form-group-metas">
                  <label>Meta de Ingresos Mensuales (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingMeta.mensual}
                    onChange={(e) => setEditingMeta({ mensual: e.target.value })}
                    placeholder="Ej: 10000.00"
                    className="input-metas"
                  />
                  <p className="help-text">
                    Define cuánto deseas facturar este mes. El sistema calculará automáticamente 
                    tu progreso, proyección y promedio diario necesario.
                  </p>
                </div>

                <div className="modal-actions">
                  <button className="btn-cancel-metas" onClick={() => setShowEditModal(false)}>
                    <FiX />
                    Cancelar
                  </button>
                  <button className="btn-save-metas" onClick={handleSaveMeta}>
                    <FiSave />
                    Guardar Meta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Nueva Meta por Curso */}
        {showNewCursoMetaModal && (
          <div className="modal-overlay-metas" onClick={() => setShowNewCursoMetaModal(false)}>
            <div className="modal-content-metas" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-metas">
                <h2>
                  <FiPlus />
                  Nueva Meta por Curso
                </h2>
                <button className="btn-close-metas" onClick={() => setShowNewCursoMetaModal(false)}>
                  <FiX />
                </button>
              </div>

              <div className="modal-body-metas">
                <div className="form-group-metas">
                  <label>Curso *</label>
                  <select
                    value={newCursoMeta.curso_id}
                    onChange={(e) => setNewCursoMeta(prev => ({ ...prev, curso_id: e.target.value }))}
                    className="input-metas"
                  >
                    <option value="">Seleccionar curso...</option>
                    {cursos.map(curso => (
                      <option key={curso.id} value={curso.id}>
                        {curso.fullname}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-metas">
                  <label>Meta de Ingresos (S/) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCursoMeta.meta_mensual}
                    onChange={(e) => setNewCursoMeta(prev => ({ ...prev, meta_mensual: e.target.value }))}
                    placeholder="Ej: 5000.00"
                    className="input-metas"
                  />
                </div>

                <div className="form-group-metas">
                  <label>Mes</label>
                  <input
                    type="month"
                    value={newCursoMeta.mes}
                    onChange={(e) => setNewCursoMeta(prev => ({ ...prev, mes: e.target.value }))}
                    className="input-metas"
                  />
                </div>

                <div className="modal-actions">
                  <button className="btn-cancel-metas" onClick={() => setShowNewCursoMetaModal(false)}>
                    <FiX />
                    Cancelar
                  </button>
                  <button className="btn-save-metas" onClick={handleSaveCursoMeta}>
                    <FiSave />
                    Crear Meta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MetasPage