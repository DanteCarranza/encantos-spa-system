const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encantos.pe/spa/backend/api'

const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

const scheduleService = {
  /**
   * Obtener datos del calendario para un mes
   */
  async getCalendarData(month) {
    try {
      const response = await fetch(`${API_BASE_URL}/schedule.php?action=calendar&month=${month}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo calendario:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Obtener detalles de un día específico
   */
  async getDayDetails(fecha) {
    try {
      const response = await fetch(`${API_BASE_URL}/schedule.php?action=day-details&fecha=${fecha}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo detalles del día:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Obtener días bloqueados
   */
  async getBlockedDays() {
    try {
      const response = await fetch(`${API_BASE_URL}/schedule.php?action=blocked-days`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo días bloqueados:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Bloquear un día
   */
  async blockDay(fecha, motivo, bloqueadoPor = 'admin') {
    try {
      const response = await fetch(`${API_BASE_URL}/schedule.php?action=block-day`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fecha,
          motivo,
          bloqueado_por: bloqueadoPor
        })
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error bloqueando día:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Desbloquear un día
   */
  async unblockDay(fecha) {
    try {
      const response = await fetch(`${API_BASE_URL}/schedule.php?action=unblock-day&fecha=${fecha}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error desbloqueando día:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },





/**
 * Obtener horas bloqueadas de un día
 */
async getBlockedHours(fecha) {
    try {
      const response = await fetch(`${API_BASE_URL}/schedule.php?action=blocked-hours&fecha=${fecha}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo horas bloqueadas:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },
  
  /**
   * Bloquear horas específicas
   */
  async blockHours(fecha, horaInicio, horaFin, motivo, bloqueadoPor = 'admin') {
    try {
      const response = await fetch(`${API_BASE_URL}/schedule.php?action=block-hours`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fecha,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          motivo,
          bloqueado_por: bloqueadoPor
        })
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error bloqueando horas:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },
  
  /**
   * Desbloquear horas
   */
  async unblockHours(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/schedule.php?action=unblock-hours&id=${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error desbloqueando horas:', error)
      return { success: false, message: 'Error de conexión' }
    }
  }
  

}

export default scheduleService