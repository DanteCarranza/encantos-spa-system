// Servicio de gestión de productos - Snacks
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encantos.pe/spa/backend/api'

// Obtener token de autenticación
const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

// Headers con autenticación
const getAuthHeaders = () => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('No autenticado')
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

export const snacksProductsService = {
  /**
   * Obtener todos los productos
   */
  async getProducts(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.categoria && filters.categoria !== 'all') {
        params.append('categoria', filters.categoria)
      }
      if (filters.search) {
        params.append('search', filters.search)
      }
      if (filters.activo !== undefined) {
        params.append('activo', filters.activo ? '1' : '0')
      }
      // ← AGREGAR UBICACIÓN
      if (filters.ubicacion_id) {
        params.append('ubicacion_id', filters.ubicacion_id)
      }
      
      const queryString = params.toString()
      const url = `${API_BASE_URL}/snacks/products.php${queryString ? '?' + queryString : ''}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      const data = await response.json()
      console.log('Products from API:', data) // Debug
      return data
    } catch (error) {
      console.error('Error getting products:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Obtener categorías
   */
  async getCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/products.php?categorias=1`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting categories:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Obtener productos con stock bajo
   */
  async getLowStockProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/products.php?stock_bajo=1`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting low stock products:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Obtener producto por ID
   */
  async getProductById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/products.php?id=${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting product:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Crear producto
   */
  async createProduct(productData) {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No autenticado')
      }
      
      const response = await fetch(`${API_BASE_URL}/snacks/products.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // NO incluir Content-Type para FormData
        },
        body: productData // FormData se envía directamente
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating product:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Actualizar producto
   */
  async updateProduct(id, productData) {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No autenticado')
      }
      
      // Agregar _method=PUT para simular PUT con POST
      productData.append('_method', 'PUT')
      
      const response = await fetch(`${API_BASE_URL}/snacks/products.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // NO incluir Content-Type para FormData
        },
        body: productData
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error updating product:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Eliminar producto
   */
  async deleteProduct(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/products.php?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error deleting product:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Reponer stock
   */
  async replenishStock(id, cantidad, observaciones = '') {
    try {
      const productResult = await this.getProductById(id)
      if (!productResult.success) {
        return productResult
      }

      const nuevoStock = productResult.data.stock_actual + parseInt(cantidad)

      const response = await fetch(`${API_BASE_URL}/snacks/products.php`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id,
          stock_actual: nuevoStock,
          observaciones_stock: observaciones || `Reposición de ${cantidad} unidades`
        })
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error replenishing stock:', error)
      return { success: false, message: 'Error de conexión' }
    }
  }
}

export default snacksProductsService