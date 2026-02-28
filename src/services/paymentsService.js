const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encantos.pe/spa/backend/api'

const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

const paymentsService = {
  // Obtener pagos de una reserva
  async getPaymentsByBooking(reservaId) {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')
      
      const response = await fetch(`${API_BASE_URL}/payments.php?reserva_id=${reservaId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting payments:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // Registrar nuevo pago
  async createPayment(paymentData) {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')
      
      const response = await fetch(`${API_BASE_URL}/payments.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: paymentData // FormData
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating payment:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // Reporte: Ingresos diarios
  async getIngresosDiarios(fechaInicio, fechaFin) {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')
      
      const params = new URLSearchParams({
        reporte: 'ingresos_diarios',
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      })
      
      const response = await fetch(`${API_BASE_URL}/payments.php?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting ingresos diarios:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // Reporte: Pagos pendientes
  async getPendientes() {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')
      
      const response = await fetch(`${API_BASE_URL}/payments.php?reporte=pendientes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting pendientes:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // Reporte: Por terapeuta
  async getIngresosPorTerapeuta(fechaInicio, fechaFin) {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')
      
      const params = new URLSearchParams({
        reporte: 'por_terapeuta',
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      })
      
      const response = await fetch(`${API_BASE_URL}/payments.php?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting ingresos por terapeuta:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // Reporte: Por método de pago
  async getIngresosPorMetodo(fechaInicio, fechaFin) {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')
      
      const params = new URLSearchParams({
        reporte: 'por_metodo',
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      })
      
      const response = await fetch(`${API_BASE_URL}/payments.php?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting ingresos por método:', error)
      return { success: false, message: 'Error de conexión' }
    }
  }
}

export default paymentsService