import api, { handleApiError } from './api'

const appointmentService = {
  // Crear cita
  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData)
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  // Obtener citas del usuario
  getUserAppointments: async () => {
    try {
      const response = await api.get('/appointments/my-appointments')
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  // Obtener todas las citas (Admin)
  getAllAppointments: async (params = {}) => {
    try {
      const response = await api.get('/appointments', { params })
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  // Obtener horarios disponibles
  getAvailableSlots: async (date) => {
    try {
      const response = await api.get(`/appointments/available-slots`, {
        params: { date }
      })
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  // Actualizar estado de cita (Admin)
  updateAppointmentStatus: async (id, status) => {
    try {
      const response = await api.patch(`/appointments/${id}/status`, { status })
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  // Cancelar cita
  cancelAppointment: async (id) => {
    try {
      const response = await api.patch(`/appointments/${id}/cancel`)
      return { success: true, message: response.data.message }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  // Obtener estadísticas de citas (Admin)
  getAppointmentStats: async () => {
    try {
      const response = await api.get('/appointments/stats')
      return { success: true, data: response.data.data }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  }
}

export default appointmentService