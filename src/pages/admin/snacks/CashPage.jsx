import React, { useState, useEffect } from 'react'
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiClock,
  FiUser,
  FiCheck,
  FiX,
  FiEye,
  FiLock,
  FiUnlock,
  FiShoppingCart,
  FiAlertCircle
} from 'react-icons/fi'
import cashService from '../../../services/snacks/cashService'
import Modal from '../../../components/common/Modal'
import Swal from 'sweetalert2'
import './CashPage.css'

const CashPage = () => {
  const [cashStatus, setCashStatus] = useState(null)
  const [cashHistory, setCashHistory] = useState([])
  const [daySummary, setDaySummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showOpenModal, setShowOpenModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCash, setSelectedCash] = useState(null)
  const [openForm, setOpenForm] = useState({
    monto_inicial: '',
    observaciones: ''
  })
  const [closeForm, setCloseForm] = useState({
    monto_cierre: '',
    observaciones: ''
  })

  useEffect(() => {
    loadCashData()
  }, [])

  const loadCashData = async () => {
    setLoading(true)
    try {
      const [statusResult, historyResult, summaryResult] = await Promise.all([
        cashService.getCashStatus(),
        cashService.getCashHistory(),
        cashService.getDaySummary()
      ])

      if (statusResult.success) {
        setCashStatus(statusResult.data)
      }

      if (historyResult.success) {
        setCashHistory(historyResult.data)
      }

      if (summaryResult.success) {
        setDaySummary(summaryResult.data)
      }
    } catch (error) {
      console.error('Error loading cash data:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar datos de caja'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCash = async (e) => {
    e.preventDefault()

    if (!openForm.monto_inicial || parseFloat(openForm.monto_inicial) < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ingresa un monto inicial válido',
        confirmButtonColor: '#f59e0b'
      })
      return
    }

    try {
      const result = await cashService.openCash(
        openForm.monto_inicial,
        openForm.observaciones
      )

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Caja Abierta!',
          html: `
            <div style="text-align: left;">
              <p><strong>Monto Inicial:</strong> S/ ${parseFloat(openForm.monto_inicial).toFixed(2)}</p>
              <p><strong>Usuario:</strong> ${result.data.usuario}</p>
            </div>
          `,
          confirmButtonColor: '#f59e0b'
        })

        setShowOpenModal(false)
        setOpenForm({ monto_inicial: '', observaciones: '' })
        loadCashData()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al abrir la caja'
      })
    }
  }

  const handleCloseCash = async (e) => {
    e.preventDefault()

    if (!closeForm.monto_cierre || parseFloat(closeForm.monto_cierre) < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ingresa el monto contado',
        confirmButtonColor: '#f59e0b'
      })
      return
    }

    // Confirmación
    const confirm = await Swal.fire({
      title: '¿Cerrar Caja?',
      html: `
        <div style="text-align: left;">
          <p><strong>Efectivo Esperado:</strong> S/ ${cashStatus.caja.efectivo_esperado.toFixed(2)}</p>
          <p><strong>Monto Contado:</strong> S/ ${parseFloat(closeForm.monto_cierre).toFixed(2)}</p>
          <p><strong>Diferencia:</strong> S/ ${(parseFloat(closeForm.monto_cierre) - cashStatus.caja.efectivo_esperado).toFixed(2)}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar'
    })

    if (!confirm.isConfirmed) return

    try {
      const result = await cashService.closeCash(
        closeForm.monto_cierre,
        closeForm.observaciones
      )

      if (result.success) {
        const diferencia = result.data.diferencia
        
        Swal.fire({
          icon: diferencia === 0 ? 'success' : 'warning',
          title: '¡Caja Cerrada!',
          html: `
            <div style="text-align: left;">
              <p><strong>Total Ventas:</strong> ${result.data.cantidad_ventas}</p>
              <p><strong>Efectivo:</strong> S/ ${result.data.ventas_efectivo.toFixed(2)}</p>
              <p><strong>Yape/Plin:</strong> S/ ${result.data.ventas_yape.toFixed(2)}</p>
              <hr>
              <p><strong>Esperado:</strong> S/ ${result.data.efectivo_esperado.toFixed(2)}</p>
              <p><strong>Contado:</strong> S/ ${result.data.monto_contado.toFixed(2)}</p>
              <p style="font-size: 1.2rem; font-weight: bold; color: ${diferencia >= 0 ? '#10b981' : '#ef4444'}">
                <strong>Diferencia:</strong> S/ ${diferencia.toFixed(2)}
              </p>
            </div>
          `,
          confirmButtonColor: '#f59e0b'
        })

        setShowCloseModal(false)
        setCloseForm({ monto_cierre: '', observaciones: '' })
        loadCashData()
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cerrar la caja'
      })
    }
  }

  const handleViewDetail = async (caja) => {
    try {
      const result = await cashService.getCashDetail(caja.id)
      
      if (result.success) {
        setSelectedCash(result.data)
        setShowDetailModal(true)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el detalle'
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar detalle'
      })
    }
  }

  const formatDateTime = (datetime) => {
    if (!datetime) return '-'
    const date = new Date(datetime)
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return `S/ ${parseFloat(amount || 0).toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="cash-loading">
        <div className="spinner-large"></div>
        <p>Cargando módulo de caja...</p>
      </div>
    )
  }

  // CONTINÚA DESDE CashPage_Part1.jsx
// Reemplaza el final después de "if (loading)" con esto:

return (
    <div className="cash-page">
      {/* Header */}
      <div className="cash-header">
        <div>
          <h1 className="page-title">
            <FiDollarSign />
            Gestión de Caja
          </h1>
          <p className="page-subtitle">Apertura, cierre y control de caja</p>
        </div>

        <div className="header-actions">
          {cashStatus?.abierta ? (
            <button className="btn btn-danger" onClick={() => setShowCloseModal(true)}>
              <FiLock />
              Cerrar Caja
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowOpenModal(true)}>
              <FiUnlock />
              Abrir Caja
            </button>
          )}
        </div>
      </div>

      {/* Current Cash Status */}
      {cashStatus?.abierta && (
        <div className="current-cash-card">
          <div className="cash-card-header">
            <div className="status-badge success">
              <FiUnlock />
              Caja Abierta
            </div>
            <div className="cash-user">
              <FiUser />
              {cashStatus.caja.usuario}
            </div>
          </div>

          <div className="cash-stats-grid">
            <div className="cash-stat">
              <div className="stat-icon primary">
                <FiDollarSign />
              </div>
              <div className="stat-info">
                <div className="stat-label">Monto Inicial</div>
                <div className="stat-value">{formatCurrency(cashStatus.caja.monto_inicial)}</div>
              </div>
            </div>

            <div className="cash-stat">
              <div className="stat-icon success">
                <FiShoppingCart />
              </div>
              <div className="stat-info">
                <div className="stat-label">Ventas ({cashStatus.caja.ventas_count})</div>
                <div className="stat-value">{formatCurrency(cashStatus.caja.ventas_total)}</div>
              </div>
            </div>

            <div className="cash-stat">
              <div className="stat-icon warning">
                <FiDollarSign />
              </div>
              <div className="stat-info">
                <div className="stat-label">Efectivo</div>
                <div className="stat-value">{formatCurrency(cashStatus.caja.ventas_efectivo)}</div>
              </div>
            </div>

            <div className="cash-stat">
              <div className="stat-icon info">
                <FiTrendingUp />
              </div>
              <div className="stat-info">
                <div className="stat-label">Efectivo Esperado</div>
                <div className="stat-value highlight">{formatCurrency(cashStatus.caja.efectivo_esperado)}</div>
              </div>
            </div>
          </div>

          <div className="payment-methods-summary">
            <div className="payment-item">
              <span className="payment-label">💵 Efectivo:</span>
              <span className="payment-value">{formatCurrency(cashStatus.caja.ventas_efectivo)}</span>
            </div>
            <div className="payment-item">
              <span className="payment-label">📱 Yape/Plin:</span>
              <span className="payment-value">{formatCurrency(cashStatus.caja.ventas_yape)}</span>
            </div>
          </div>

          <div className="cash-time-info">
            <FiClock />
            <span>Apertura: {formatDateTime(cashStatus.caja.fecha_apertura)}</span>
          </div>
        </div>
      )}

      {/* Day Summary */}
      {daySummary && (
        <div className="day-summary-card">
          <h2 className="section-title">
            <FiCalendar />
            Resumen del Día
          </h2>

          <div className="summary-grid">
            <div className="summary-item">
              <div className="summary-label">Total Ventas</div>
              <div className="summary-value primary">{daySummary.ventas_count}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Efectivo</div>
              <div className="summary-value success">{formatCurrency(daySummary.efectivo)}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Yape/Plin</div>
              <div className="summary-value info">{formatCurrency(daySummary.yape)}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Total Ingresos</div>
              <div className="summary-value highlight">{formatCurrency(daySummary.total)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Cash History */}
      <div className="cash-history-section">
        <h2 className="section-title">
          <FiClock />
          Historial de Cajas
        </h2>

        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Fecha Apertura</th>
                <th>Fecha Cierre</th>
                <th>Usuario</th>
                <th>Monto Inicial</th>
                <th>Total Ventas</th>
                <th>Monto Cierre</th>
                <th>Diferencia</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cashHistory.map(caja => (
                <tr key={caja.id}>
                  <td>{formatDateTime(caja.fecha_apertura)}</td>
                  <td>{caja.fecha_cierre ? formatDateTime(caja.fecha_cierre) : '-'}</td>
                  <td>
                    <div className="user-cell">
                      <FiUser />
                      {caja.usuario}
                    </div>
                  </td>
                  <td className="text-right">{formatCurrency(caja.monto_inicial)}</td>
                  <td className="text-right">{formatCurrency(caja.total_ventas)}</td>
                  <td className="text-right">
                    {caja.monto_cierre ? formatCurrency(caja.monto_cierre) : '-'}
                  </td>
                  <td className="text-right">
                    {caja.diferencia !== null ? (
                      <span className={`difference ${parseFloat(caja.diferencia) >= 0 ? 'positive' : 'negative'}`}>
                        {parseFloat(caja.diferencia) >= 0 ? '+' : ''}{formatCurrency(caja.diferencia)}
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    {caja.estado === 'abierta' ? (
                      <span className="status-badge success">
                        <FiUnlock /> Abierta
                      </span>
                    ) : (
                      <span className="status-badge secondary">
                        <FiLock /> Cerrada
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn-icon"
                      onClick={() => handleViewDetail(caja)}
                      title="Ver detalle"
                    >
                      <FiEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {cashHistory.length === 0 && (
            <div className="empty-state">
              <FiAlertCircle />
              <p>No hay registros de cajas</p>
            </div>
          )}
        </div>
      </div>

      {/* Open Cash Modal */}
      <Modal
        isOpen={showOpenModal}
        onClose={() => setShowOpenModal(false)}
        title="Abrir Caja"
        size="small"
      >
        <form onSubmit={handleOpenCash} className="cash-form">
          <div className="form-group">
            <label className="form-label">Monto Inicial (S/) *</label>
            <input
              type="number"
              className="form-input"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={openForm.monto_inicial}
              onChange={(e) => setOpenForm({ ...openForm, monto_inicial: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Observaciones</label>
            <textarea
              className="form-input"
              placeholder="Opcional"
              rows="3"
              value={openForm.observaciones}
              onChange={(e) => setOpenForm({ ...openForm, observaciones: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowOpenModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <FiUnlock />
              Abrir Caja
            </button>
          </div>
        </form>
      </Modal>

      {/* Close Cash Modal */}
      <Modal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="Cerrar Caja"
        size="medium"
      >
        <form onSubmit={handleCloseCash} className="cash-form">
          {cashStatus?.caja && (
            <>
              <div className="close-summary">
                <h3>Resumen de Caja</h3>
                <div className="summary-row">
                  <span>Monto Inicial:</span>
                  <strong>{formatCurrency(cashStatus.caja.monto_inicial)}</strong>
                </div>
                <div className="summary-row">
                  <span>Total Ventas ({cashStatus.caja.ventas_count}):</span>
                  <strong>{formatCurrency(cashStatus.caja.ventas_total)}</strong>
                </div>
                <div className="summary-row">
                  <span>Ventas Efectivo:</span>
                  <strong>{formatCurrency(cashStatus.caja.ventas_efectivo)}</strong>
                </div>
                <div className="summary-row">
                  <span>Ventas Yape/Plin:</span>
                  <strong>{formatCurrency(cashStatus.caja.ventas_yape)}</strong>
                </div>
                <div className="summary-row total">
                  <span>Efectivo Esperado:</span>
                  <strong className="highlight">{formatCurrency(cashStatus.caja.efectivo_esperado)}</strong>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Monto Contado (S/) *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={closeForm.monto_cierre}
                  onChange={(e) => setCloseForm({ ...closeForm, monto_cierre: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              {closeForm.monto_cierre && (
                <div className="difference-preview">
                  <span>Diferencia:</span>
                  <strong className={parseFloat(closeForm.monto_cierre) - cashStatus.caja.efectivo_esperado >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(parseFloat(closeForm.monto_cierre) - cashStatus.caja.efectivo_esperado)}
                  </strong>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Observaciones</label>
                <textarea
                  className="form-input"
                  placeholder="Opcional"
                  rows="3"
                  value={closeForm.observaciones}
                  onChange={(e) => setCloseForm({ ...closeForm, observaciones: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowCloseModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-danger">
              <FiLock />
              Cerrar Caja
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detalle de Caja"
        size="large"
      >
        {selectedCash && (
          <div className="cash-detail">
            <div className="detail-header">
              <div className="detail-info">
                <div className="info-item">
                  <FiUser />
                  <span>{selectedCash.usuario}</span>
                </div>
                <div className="info-item">
                  <FiCalendar />
                  <span>{formatDateTime(selectedCash.fecha_apertura)}</span>
                </div>
                {selectedCash.fecha_cierre && (
                  <div className="info-item">
                    <FiLock />
                    <span>{formatDateTime(selectedCash.fecha_cierre)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="detail-summary">
              <div className="summary-col">
                <h4>Apertura</h4>
                <div className="summary-value">{formatCurrency(selectedCash.monto_inicial)}</div>
              </div>
              <div className="summary-col">
                <h4>Ventas Totales</h4>
                <div className="summary-value">{formatCurrency(selectedCash.total_ventas)}</div>
              </div>
              {selectedCash.monto_cierre && (
                <>
                  <div className="summary-col">
                    <h4>Cierre</h4>
                    <div className="summary-value">{formatCurrency(selectedCash.monto_cierre)}</div>
                  </div>
                  <div className="summary-col">
                    <h4>Diferencia</h4>
                    <div className={`summary-value ${parseFloat(selectedCash.diferencia) >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(selectedCash.diferencia)}
                    </div>
                  </div>
                </>
              )}
            </div>

            {selectedCash.ventas && selectedCash.ventas.length > 0 && (
  <div className="detail-sales">
    <h4>Ventas Registradas ({selectedCash.ventas.length})</h4>
    <div className="sales-table-container">
      <table className="sales-detail-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Fecha/Hora</th>
            <th>Productos</th>
            <th>Método de Pago</th>
            <th>Cliente</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {selectedCash.ventas.map(venta => (
            <tr key={venta.id}>
              <td>
                <span className="sale-code">{venta.numero_venta}</span>
              </td>
              <td>
                <div className="datetime-cell">
                  <span className="date">{new Date(venta.fecha_hora).toLocaleDateString('es-PE')}</span>
                  <span className="time">{new Date(venta.fecha_hora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </td>
              <td>
                <div className="products-cell">
                  {venta.items && venta.items.length > 0 ? (
                    venta.items.length === 1 ? (
                      <div className="product-item">
                        <span className="product-name">{venta.items[0].producto}</span>
                        <span className="product-qty">x{venta.items[0].cantidad}</span>
                      </div>
                    ) : (
                      <div className="multiple-products">
                        <span className="products-count">{venta.items.length} productos</span>
                        <div className="products-tooltip">
                          {venta.items.map((item, idx) => (
                            <div key={idx} className="tooltip-product">
                              {item.producto} x{item.cantidad}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ) : (
                    <span className="no-items">Sin items</span>
                  )}
                </div>
              </td>
              <td>
                <span className={`payment-badge ${venta.metodo_pago.toLowerCase()}`}>
                  {venta.metodo_pago === 'EFECTIVO' ? '💵 Efectivo' : 
                   venta.metodo_pago === 'YAPE_PLIN' ? '📱 Yape/Plin' : 
                   venta.metodo_pago === 'TARJETA' ? '💳 Tarjeta' : 
                   venta.metodo_pago}
                </span>
                {venta.numero_operacion && (
                  <div className="operation-number">Op: {venta.numero_operacion}</div>
                )}
              </td>
              <td>
                <span className="customer-name">
                  {venta.cliente_nombre || '-'}
                </span>
              </td>
              <td className="text-right">
                <span className="sale-amount">{formatCurrency(venta.total)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}


          </div>
        )}
      </Modal>
    </div>
  )
}

export default CashPage