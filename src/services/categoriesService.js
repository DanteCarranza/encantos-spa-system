const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encantos.pe/spa/backend/api'

const categoriesService = {
  /**
   * Obtener todas las categorías
   */
  async getCategories(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const url = `${API_BASE_URL}/categories.php${queryParams ? '?' + queryParams : ''}`
      
      const response = await fetch(url)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo categorías:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Obtener categorías con estadísticas
   */
  async getCategoriesWithStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/categories.php?action=stats`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo categorías con stats:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Crear categoría
   */
  async createCategory(categoryData) {
    try {
      const response = await fetch(`${API_BASE_URL}/categories.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creando categoría:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Actualizar categoría
   */
  async updateCategory(categoryData) {
    try {
      const response = await fetch(`${API_BASE_URL}/categories.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error actualizando categoría:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Eliminar categoría
   */
  async deleteCategory(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/categories.php?id=${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error eliminando categoría:', error)
      return { success: false, message: 'Error de conexión' }
    }
  }
}

export default categoriesService