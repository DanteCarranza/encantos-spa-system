import api, { handleApiError } from './api'

const orderService = {
  // Crear pedido
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  // Obtener pedidos del usuario
  getUserOrders: async () => {
    try {
      const response = await api.get('/orders/my-orders')
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  // Obtener pedido por ID
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  // Obtener todos los pedidos (Admin)
  getAllOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders', { params })
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  // Actualizar estado de pedido (Admin)
  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.patch(`/orders/${id}/status`, { status })
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  // Cancelar pedido
  cancelOrder: async (id) => {
    try {
      const response = await api.patch(`/orders/${id}/cancel`)
      return { success: true, message: response.data.message }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  }
}

export default orderService