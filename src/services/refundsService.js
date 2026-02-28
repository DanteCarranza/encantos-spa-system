const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encantos.pe/spa/backend/api'

const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

const refundsService = {
  /**
   * Obtener devoluciones de una reserva
   */
  async getRefunds(reservaId) {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')

      const response = await fetch(`${API_BASE_URL}/refunds.php?reserva_id=${reservaId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting refunds:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Registrar una devolución
   */
  async createRefund(refundData) {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')

      const response = await fetch(`${API_BASE_URL}/refunds.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: refundData // FormData
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating refund:', error)
      return { success: false, message: 'Error de conexión' }
    }
  }
}

export default refundsService