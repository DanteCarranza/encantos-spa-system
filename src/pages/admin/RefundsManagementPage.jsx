import React, { useState, useEffect } from 'react'
import {
  FiArrowLeft,
  FiDollarSign,
  FiCalendar,
  FiFileText,
  FiDownload,
  FiEye,
  FiUser,
  FiCreditCard
} from 'react-icons/fi'
import { formatPrice } from '../../utils/helpers'
import './RefundsManagementPage.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encantos.pe/spa/backend/api'

const RefundsManagementPage = () => {
  const [loading, setLoading] = useState(true)
  const [refunds, setRefunds] = useState([])
  const [filteredRefunds, setFilteredRefunds] = useState([])
  const [filters, setFilters] = useState({
    fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    metodo: 'todos'
  })

  useEffect(() => {
    loadRefunds()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [refunds, filters])

  const loadRefunds = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      
      // Por ahora obtenemos todas las devoluciones
      // Podrías crear un endpoint específico para listar todas
      const response = await fetch(`${API_BASE_URL}/refunds.php?action=list_all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const data = await response.json()
      if (data.success) {
        setRefunds(data.data)
      }
    } catch (error) {
      console.error('Error loading refunds:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...refunds]
    
    // Filtrar por fecha
    filtered = filtered.filter(r => {
      const fecha = new Date(r.fecha_devolucion)
      const inicio = new Date(filters.fechaInicio)
      const fin = new Date(filters.fechaFin)
      return fecha >= inicio && fecha <= fin
    })
    
    // Filtrar por método
    if (filters.metodo !== 'todos') {
      filtered = filtered.filter(r => r.metodo_devolucion === filters.metodo)
    }
    
    setFilteredRefunds(filtered)
  }

  const totalDevuelto = filteredRefunds.reduce((sum, r) => sum + parseFloat(r.monto_devuelto), 0)

  if (loading) {
    return (
      <div className="refunds-loading">
        <div className="spinner-large"></div>
        <p>Cargando devoluciones...</p>
      </div>
    )
  }

  return (
    <div className="refunds-management-page">
      {/* Header */}
      <div className="refunds-header">
        <div>
          <h1 className="refunds-title">
            <FiArrowLeft /> Gestión de Devoluciones
          </h1>
          <p className="refunds-subtitle">
            Historial completo de reembolsos procesados
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="refunds-filters">
        <div className="filter-group">
          <label>Fecha Inicio</label>
          <input
            type="date"
            value={filters.fechaInicio}
            onChange={(e) => setFilters({ ...filters, fechaInicio: e.target.value })}
          />
        </div>
        
        <div className="filter-group">
          <label>Fecha Fin</label>
          <input
            type="date"
            value={filters.fechaFin}
            onChange={(e) => setFilters({ ...filters, fechaFin: e.target.value })}
          />
        </div>
        
        <div className="filter-group">
          <label>Método</label>
          <select
            value={filters.metodo}
            onChange={(e) => setFilters({ ...filters, metodo: e.target.value })}
          >
            <option value="todos">Todos</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="yape">Yape</option>
            <option value="plin">Plin</option>
          </select>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="refunds-stats">
        <div className="refund-stat-card">
          <div className="stat-icon">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Devuelto</div>
            <div className="stat-value">{formatPrice(totalDevuelto)}</div>
          </div>
        </div>
        
        <div className="refund-stat-card">
          <div className="stat-icon">
            <FiFileText />
          </div>
          <div className="stat-content">
            <div className="stat-label">Devoluciones</div>
            <div className="stat-value">{filteredRefunds.length}</div>
          </div>
        </div>
      </div>

      {/* Tabla de devoluciones */}
      <div className="refunds-table-container">
        <table className="refunds-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Reserva</th>
              <th>Cliente</th>
              <th>Monto</th>
              <th>Método</th>
              <th>Motivo</th>
              <th>Procesado Por</th>
              <th>Comprobante</th>
            </tr>
          </thead>
          <tbody>
            {filteredRefunds.map((refund) => (
              <tr key={refund.id}>
                <td>{new Date(refund.fecha_devolucion).toLocaleDateString('es-PE')}</td>
                <td>
                  <span className="code-badge">{refund.codigo_reserva}</span>
                </td>
                <td>{refund.nombre_cliente}</td>
                <td className="amount-cell">{formatPrice(refund.monto_devuelto)}</td>
                <td>
                  <span className="method-badge">{refund.metodo_devolucion}</span>
                </td>
                <td className="motivo-cell">{refund.motivo}</td>
                <td>{refund.procesado_por_nombre}</td>
                <td>
                  {refund.comprobante_url && (
                    <a 
                      href={refund.comprobante_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="view-voucher-btn"
                    >
                      <FiEye /> Ver
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRefunds.length === 0 && (
          <div className="empty-refunds">
            <FiArrowLeft className="empty-icon" />
            <h3>No hay devoluciones</h3>
            <p>No se encontraron devoluciones en el período seleccionado</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RefundsManagementPage