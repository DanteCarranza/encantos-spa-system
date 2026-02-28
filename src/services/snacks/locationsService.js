const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encantos.pe/spa/backend/api'

const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

const locationsService = {
  /**
   * Obtener todas las ubicaciones activas
   */
  async getLocations() {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')

      const response = await fetch(`${API_BASE_URL}/snacks/locations.php`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting locations:', error)
      return { success: false, message: 'Error de conexión' }
    }
  }
}

export default locationsService