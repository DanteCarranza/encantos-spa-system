import React, { useState, useEffect } from 'react'
import {
  FiCreditCard,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiCalendar,
  FiDownload,
  FiUser,
  FiClock,
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiRefreshCw  
} from 'react-icons/fi'
import walletService from '../../../services/snacks/walletService'
import Modal from '../../../components/common/Modal'
import Swal from 'sweetalert2'
import './WalletPage.css'

const WalletPage = () => {
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(null)
  const [history, setHistory] = useState([])
  const [summary, setSummary] = useState(null)
  const [dateRange, setDateRange] = useState({
    desde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0]
  })
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawForm, setWithdrawForm] = useState({
    monto: '',
    observaciones: ''
  })

  useEffect(() => {
    loadWalletData()
  }, [dateRange])

  const loadWalletData = async () => {
    setLoading(true)
    try {
      const [balanceResult, historyResult, summaryResult] = await Promise.all([
        walletService.getBalance(),
        walletService.getHistory(dateRange.desde, dateRange.hasta),
        walletService.getSummary(dateRange.desde, dateRange.hasta)
      ])

      if (balanceResult.success) {
        setBalance(balanceResult.data)
      }

      if (historyResult.success) {
        setHistory(historyResult.data)
      }

      if (summaryResult.success) {
        setSummary(summaryResult.data)
      }
    } catch (error) {
      console.error('Error loading wallet data:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar datos de billetera'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (e) => {
    e.preventDefault()

    if (!withdrawForm.monto || parseFloat(withdrawForm.monto) <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ingresa un monto válido',
        confirmButtonColor: '#f59e0b'
      })
      return
    }

    if (parseFloat(withdrawForm.monto) > balance?.saldo_actual) {
      Swal.fire({
        icon: 'error',
        title: 'Saldo Insuficiente',
        text: `Solo tienes S/ ${balance?.saldo_actual.toFixed(2)} disponible`,
        confirmButtonColor: '#f59e0b'
      })
      return
    }

    // Confirmación
    const confirm = await Swal.fire({
      title: '¿Confirmar Retiro?',
      html: `
        <div style="text-align: left;">
          <p><strong>Monto a retirar:</strong> S/ ${parseFloat(withdrawForm.monto).toFixed(2)}</p>
          <p><strong>Saldo actual:</strong> S/ ${balance?.saldo_actual.toFixed(2)}</p>
          <p><strong>Nuevo saldo:</strong> S/ ${(balance?.saldo_actual - parseFloat(withdrawForm.monto)).toFixed(2)}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, retirar',
      cancelButtonText: 'Cancelar'
    })

    if (!confirm.isConfirmed) return

    try {
      const result = await walletService.withdraw(
        withdrawForm.monto,
        withdrawForm.observaciones
      )

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Retiro Exitoso!',
          html: `
            <div style="text-align: left;">
              <p><strong>Monto retirado:</strong> S/ ${result.data.monto.toFixed(2)}</p>
              <p><strong>Nuevo saldo:</strong> S/ ${result.data.saldo_nuevo.toFixed(2)}</p>
            </div>
          `,
          confirmButtonColor: '#f59e0b'
        })

        setShowWithdrawModal(false)
        setWithdrawForm({ monto: '', observaciones: '' })
        loadWalletData()
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
        text: 'Error al procesar el retiro'
      })
    }
  }

  const formatCurrency = (amount) => {
    return `S/ ${parseFloat(amount || 0).toFixed(2)}`
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

  const getMovementIcon = (tipo) => {
    switch(tipo) {
      case 'INGRESO':
        return <FiArrowUpCircle className="icon-ingreso" />
      case 'RETIRO':
        return <FiArrowDownCircle className="icon-retiro" />
      case 'AJUSTE':
        return <FiRefreshCw className="icon-ajuste" />
      default:
        return <FiDollarSign />
    }
  }

  const getMovementClass = (tipo) => {
    switch(tipo) {
      case 'INGRESO':
        return 'movement-ingreso'
      case 'RETIRO':
        return 'movement-retiro'
      case 'AJUSTE':
        return 'movement-ajuste'
      default:
        return ''
    }
  }

  if (loading && !balance) {
    return (
      <div className="wallet-loading">
        <div className="spinner-large"></div>
        <p>Cargando billetera digital...</p>
      </div>
    )
  }


return (
    <div className="wallet-page">
      {/* Header */}
      <div className="wallet-header">
        <div>
          <h1 className="page-title">
            <FiCreditCard />
            Billetera Digital
          </h1>
          <p className="page-subtitle">Control de pagos digitales (Yape/Plin)</p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setShowWithdrawModal(true)}
          disabled={!balance || balance.saldo_actual <= 0}
        >
          <FiArrowDownCircle />
          Retirar Fondos
        </button>
      </div>

      {/* Balance Card */}
      <div className="balance-card">
        <div className="balance-main">
          <div className="balance-icon">
            <FiCreditCard />
          </div>
          <div className="balance-info">
            <div className="balance-label">Saldo Disponible</div>
            <div className="balance-amount">{formatCurrency(balance?.saldo_actual)}</div>
            {balance?.ultima_actualizacion && (
              <div className="balance-updated">
                <FiClock />
                Última actualización: {formatDateTime(balance.ultima_actualizacion)}
              </div>
            )}
          </div>
        </div>

        <div className="balance-stats">
          <div className="balance-stat success">
            <div className="stat-icon">
              <FiArrowUpCircle />
            </div>
            <div className="stat-content">
              <div className="stat-label">Ingresos Hoy</div>
              <div className="stat-value">{formatCurrency(balance?.ingresos_hoy)}</div>
            </div>
          </div>

          <div className="balance-stat danger">
            <div className="stat-icon">
              <FiArrowDownCircle />
            </div>
            <div className="stat-content">
              <div className="stat-label">Retiros Hoy</div>
              <div className="stat-value">{formatCurrency(balance?.retiros_hoy)}</div>
            </div>
          </div>

          <div className="balance-stat info">
            <div className="stat-icon">
              <FiTrendingUp />
            </div>
            <div className="stat-content">
              <div className="stat-label">Movimientos Hoy</div>
              <div className="stat-value">{balance?.movimientos_hoy || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="summary-cards">
          <div className="summary-card primary">
            <div className="card-icon">
              <FiArrowUpCircle />
            </div>
            <div className="card-content">
              <div className="card-label">Total Ingresos</div>
              <div className="card-value">{formatCurrency(summary.total_ingresos)}</div>
            </div>
          </div>

          <div className="summary-card danger">
            <div className="card-icon">
              <FiArrowDownCircle />
            </div>
            <div className="card-content">
              <div className="card-label">Total Retiros</div>
              <div className="card-value">{formatCurrency(summary.total_retiros)}</div>
            </div>
          </div>

          <div className="summary-card warning">
            <div className="card-icon">
              <FiRefreshCw />
            </div>
            <div className="card-content">
              <div className="card-label">Total Ajustes</div>
              <div className="card-value">{formatCurrency(summary.total_ajustes)}</div>
            </div>
          </div>

          <div className="summary-card success">
            <div className="card-icon">
              <FiTrendingUp />
            </div>
            <div className="card-content">
              <div className="card-label">Total Movimientos</div>
              <div className="card-value">{summary.total_movimientos || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="wallet-filters">
        <div className="date-range-picker">
          <div className="date-input-group">
            <label>
              <FiCalendar />
              Desde
            </label>
            <input
              type="date"
              value={dateRange.desde}
              onChange={(e) => setDateRange(prev => ({ ...prev, desde: e.target.value }))}
              max={dateRange.hasta}
            />
          </div>
          <div className="date-input-group">
            <label>
              <FiCalendar />
              Hasta
            </label>
            <input
              type="date"
              value={dateRange.hasta}
              onChange={(e) => setDateRange(prev => ({ ...prev, hasta: e.target.value }))}
              min={dateRange.desde}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="quick-dates">
          <button
            className="btn-quick-date"
            onClick={() => setDateRange({
              desde: new Date().toISOString().split('T')[0],
              hasta: new Date().toISOString().split('T')[0]
            })}
          >
            Hoy
          </button>
          <button
            className="btn-quick-date"
            onClick={() => setDateRange({
              desde: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              hasta: new Date().toISOString().split('T')[0]
            })}
          >
            Última Semana
          </button>
          <button
            className="btn-quick-date"
            onClick={() => setDateRange({
              desde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              hasta: new Date().toISOString().split('T')[0]
            })}
          >
            Último Mes
          </button>
        </div>
      </div>

      {/* Movements History */}
      <div className="movements-section">
        <div className="section-header">
          <h2 className="section-title">
            <FiClock />
            Historial de Movimientos
          </h2>
        </div>

        <div className="movements-list">
          {history.map(movement => (
            <div key={movement.id} className={`movement-card ${getMovementClass(movement.tipo)}`}>
              <div className="movement-icon-wrapper">
                {getMovementIcon(movement.tipo)}
              </div>

              <div className="movement-content">
                <div className="movement-header">
                  <div className="movement-concept">{movement.concepto}</div>
                  <div className={`movement-amount ${movement.tipo === 'INGRESO' ? 'positive' : 'negative'}`}>
                    {movement.tipo === 'INGRESO' ? '+' : '-'} {formatCurrency(movement.monto)}
                  </div>
                </div>

                <div className="movement-details">
                  <div className="detail-item">
                    <FiUser />
                    <span>{movement.usuario}</span>
                  </div>
                  <div className="detail-item">
                    <FiClock />
                    <span>{formatDateTime(movement.fecha_hora)}</span>
                  </div>
                  {movement.numero_venta && (
                    <div className="detail-item">
                      <FiDollarSign />
                      <span>{movement.numero_venta}</span>
                    </div>
                  )}
                </div>

                {movement.observaciones && (
                  <div className="movement-observations">
                    💬 {movement.observaciones}
                  </div>
                )}

                <div className="movement-balance">
                  <span>Saldo anterior: {formatCurrency(movement.saldo_anterior)}</span>
                  <span className="arrow">→</span>
                  <span className="new-balance">Saldo nuevo: {formatCurrency(movement.saldo_nuevo)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {history.length === 0 && (
          <div className="empty-state">
            <FiCreditCard />
            <p>No hay movimientos en el período seleccionado</p>
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="Retirar Fondos"
        size="small"
      >
        <form onSubmit={handleWithdraw} className="withdraw-form">
          <div className="withdraw-info">
            <div className="info-row">
              <span>Saldo Disponible:</span>
              <strong className="highlight">{formatCurrency(balance?.saldo_actual)}</strong>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Monto a Retirar (S/) *</label>
            <input
              type="number"
              className="form-input"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              max={balance?.saldo_actual}
              value={withdrawForm.monto}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, monto: e.target.value })}
              required
              autoFocus
            />
            <small className="form-hint">
              Ingresa el monto que transferiste a tu banco
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Observaciones</label>
            <textarea
              className="form-input"
              placeholder="Ej: Transferencia a cuenta BCP"
              rows="3"
              value={withdrawForm.observaciones}
              onChange={(e) => setWithdrawForm({ ...withdrawForm, observaciones: e.target.value })}
            />
          </div>

          {withdrawForm.monto && (
            <div className="new-balance-preview">
              <span>Nuevo saldo:</span>
              <strong className={parseFloat(withdrawForm.monto) > balance?.saldo_actual ? 'negative' : 'positive'}>
                {formatCurrency(balance?.saldo_actual - parseFloat(withdrawForm.monto || 0))}
              </strong>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowWithdrawModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-danger">
              <FiArrowDownCircle />
              Confirmar Retiro
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default WalletPage
