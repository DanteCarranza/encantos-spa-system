const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encantos.pe/spa/backend/api'

const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

const profileService = {
  // Obtener perfil completo
  async getPerfil() {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')
      
      const response = await fetch(`${API_BASE_URL}/profile.php?seccion=perfil`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo perfil:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // Obtener estadísticas
  async getEstadisticas() {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')
      
      const response = await fetch(`${API_BASE_URL}/profile.php?seccion=estadisticas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // Obtener créditos
  async getCreditos() {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')
      
      const response = await fetch(`${API_BASE_URL}/profile.php?seccion=creditos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo créditos:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // Actualizar información personal
  async actualizarInformacion(datos) {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')
      
      const response = await fetch(`${API_BASE_URL}/profile.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          seccion: 'informacion',
          ...datos
        })
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error actualizando información:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // Actualizar preferencias
  async actualizarPreferencias(preferencias) {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')
      
      const response = await fetch(`${API_BASE_URL}/profile.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          seccion: 'preferencias',
          ...preferencias
        })
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error actualizando preferencias:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // Cambiar contraseña
  async cambiarPassword(passwordActual, passwordNuevo) {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')
      
      const response = await fetch(`${API_BASE_URL}/profile.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          accion: 'cambiar_password',
          password_actual: passwordActual,
          password_nuevo: passwordNuevo
        })
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error cambiando contraseña:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // Subir avatar
  async subirAvatar(file) {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')
      
      const formData = new FormData()
      formData.append('accion', 'subir_avatar')
      formData.append('avatar', file)
      
      const response = await fetch(`${API_BASE_URL}/profile.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error subiendo avatar:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // Eliminar cuenta
  async eliminarCuenta(password, confirmacion) {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')
      
      const response = await fetch(`${API_BASE_URL}/profile.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          accion: 'eliminar_cuenta',
          password,
          confirmacion
        })
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error eliminando cuenta:', error)
      return { success: false, message: 'Error de conexión' }
    }
  }
}

export default profileService