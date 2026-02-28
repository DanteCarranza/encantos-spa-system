const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encantos.pe/spa/backend/api'

const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

const adminBookingsService = {
  // Obtener todas las reservas
  async getBookings() {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')
      
      const response = await fetch(`${API_BASE_URL}/admin-bookings.php`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting bookings:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // Actualizar estado de reserva
  async updateBooking(bookingData) {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')
      
      console.log('Datos a enviar en updateBooking:', bookingData) // Debug
      
      const response = await fetch(`${API_BASE_URL}/admin-bookings.php`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'  // ✅ IMPORTANTE
        },
        body: JSON.stringify(bookingData)  // ✅ Enviar como JSON
      })
      
      const data = await response.json()
      console.log('Respuesta del servidor:', data) // Debug
      return data
    } catch (error) {
      console.error('Error updating booking:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // Eliminar reserva
  async deleteBooking(id) {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')
      
      const response = await fetch(`${API_BASE_URL}/admin-bookings.php?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error deleting booking:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // Obtener terapeutas para asignar
async getTherapists() {
    try {
      const response = await fetch(`${API_BASE_URL}/therapists.php`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting therapists:', error)
      return { success: false, message: 'Error de conexión' }
    }
  }
  
}

export default adminBookingsService