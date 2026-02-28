import api, { handleApiError, createFormData } from './api'

const productService = {
  // Obtener todos los productos
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params })
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  // Obtener productos destacados
  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/products/featured')
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  // Obtener producto por ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  // Obtener producto por slug
  getProductBySlug: async (slug) => {
    try {
      const response = await api.get(`/products/slug/${slug}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  // Crear producto (Admin)
  createProduct: async (productData) => {
    try {
      const formData = createFormData(productData)
      const response = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  // Actualizar producto (Admin)
  updateProduct: async (id, productData) => {
    try {
      const formData = createFormData(productData)
      const response = await api.post(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  // Eliminar producto (Admin)
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`)
      return { success: true, message: response.data.message }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  // Cambiar estado de producto (Admin)
  toggleProductStatus: async (id) => {
    try {
      const response = await api.patch(`/products/${id}/toggle-status`)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  // Obtener categorías
  getCategories: async () => {
    try {
      const response = await api.get('/categories')
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  }
}

export default productService