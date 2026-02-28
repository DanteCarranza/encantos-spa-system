import api, { handleApiError } from './api'

const authService = {
  // Iniciar sesión
  login: async (email, password) => {
    try {
      // DEMO: Usuario admin por defecto (eliminar cuando tengas backend)
      if (email === 'admin@spa.com' && password === 'admin123') {
        const demoUser = {
          id: 1,
          nombre: 'Admin SPA',
          email: 'admin@spa.com',
          rol: 'admin',
          telefono: '999999999'
        }
        const demoToken = 'demo-token-' + Date.now()
        
        localStorage.setItem('token', demoToken)
        localStorage.setItem('user', JSON.stringify(demoUser))
        
        return { 
          success: true, 
          data: { token: demoToken, user: demoUser } 
        }
      }

      // Usuario normal de ejemplo
      if (email === 'cliente@spa.com' && password === 'cliente123') {
        const demoUser = {
          id: 2,
          nombre: 'Cliente Demo',
          email: 'cliente@spa.com',
          rol: 'user',
          telefono: '999999999'
        }
        const demoToken = 'demo-token-user-' + Date.now()
        
        localStorage.setItem('token', demoToken)
        localStorage.setItem('user', JSON.stringify(demoUser))
        
        return { 
          success: true, 
          data: { token: demoToken, user: demoUser } 
        }
      }

      // Llamada al API real
      const response = await api.post('/auth/login', { email, password })
      
      if (response.data.success) {
        const { token, user } = response.data.data
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        return { success: true, data: { token, user } }
      }
      
      return { success: false, message: response.data.message }
    } catch (error) {
      return { success: false, message: 'Credenciales incorrectas' }
    }
  },

  // ... resto del código igual
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      
      if (response.data.success) {
        return { success: true, data: response.data.data }
      }
      
      return { success: false, message: response.data.message }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token')
    return !!token
  },

  getToken: () => {
    return localStorage.getItem('token')
  },

  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify')
      return response.data.success
    } catch (error) {
      // Si no hay backend, verificar token demo
      const token = localStorage.getItem('token')
      return token && token.startsWith('demo-token')
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return { success: true, message: response.data.message }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password })
      return { success: true, message: response.data.message }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData)
      
      if (response.data.success) {
        const currentUser = authService.getCurrentUser()
        const updatedUser = { ...currentUser, ...response.data.data }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        return { success: true, data: updatedUser }
      }
      
      return { success: false, message: response.data.message }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      })
      
      return { success: true, message: response.data.message }
    } catch (error) {
      return { success: false, message: handleApiError(error) }
    }
  }
}

export default authService