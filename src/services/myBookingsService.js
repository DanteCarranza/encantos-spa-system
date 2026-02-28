const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encantos.pe/spa/backend/api'

const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

const myBookingsService = {
  // Buscar reserva por código (sin autenticación)
  async buscarPorCodigo(codigo, email) {
    try {
      const params = new URLSearchParams({ codigo, email })
      const response = await fetch(`${API_BASE_URL}/my-bookings.php?${params}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error buscando reserva:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // Obtener mis reservas (autenticado)
  async getMisReservas(estado = 'all') {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')
      
      const params = new URLSearchParams({ estado })
      const response = await fetch(`${API_BASE_URL}/my-bookings.php?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo reservas:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // Cancelar reserva
  async cancelarReserva(reservaId, motivo) {
    try {
      const token = getAuthToken()
      
      const response = await fetch(`${API_BASE_URL}/my-bookings.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          accion: 'cancelar',
          reserva_id: reservaId,
          motivo
        })
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error cancelando reserva:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // Reprogramar reserva
  async reprogramarReserva(reservaId, nuevaFecha, nuevaHora, motivo) {
    try {
      const token = getAuthToken()
      
      const response = await fetch(`${API_BASE_URL}/my-bookings.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          reserva_id: reservaId,
          nueva_fecha: nuevaFecha,
          nueva_hora: nuevaHora,
          motivo
        })
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error reprogramando reserva:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // Valorar servicio
  async valorarServicio(reservaId, valoracion, comentario) {
    try {
      const token = getAuthToken()
      
      const response = await fetch(`${API_BASE_URL}/my-bookings.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          accion: 'valorar',
          reserva_id: reservaId,
          valoracion,
          comentario
        })
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error valorando servicio:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // Obtener horarios disponibles para reprogramar
  async getHorariosDisponibles(fecha, servicioId) {
    try {
      const params = new URLSearchParams({ fecha, servicio_id: servicioId })
      const response = await fetch(`${API_BASE_URL}/available-slots.php?${params}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo horarios:', error)
      return { success: false, message: 'Error de conexión' }
    }
  }
}

export default myBookingsService