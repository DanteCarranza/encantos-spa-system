import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/proyecto-spa/backend'

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
})

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de error
      switch (error.response.status) {
        case 401:
          // Token inválido o expirado
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break
        case 403:
          console.error('No tienes permisos para acceder a este recurso')
          break
        case 404:
          console.error('Recurso no encontrado')
          break
        case 500:
          console.error('Error en el servidor')
          break
        default:
          console.error('Error en la petición:', error.response.data.message)
      }
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      console.error('No se pudo conectar con el servidor')
    } else {
      // Algo pasó al configurar la petición
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default api

// Helper para manejar errores de forma consistente
export const handleApiError = (error) => {
  if (error.response) {
    return error.response.data.message || 'Error en la petición'
  } else if (error.request) {
    return 'No se pudo conectar con el servidor'
  } else {
    return error.message || 'Error desconocido'
  }
}

// Helper para crear FormData (útil para subir archivos)
export const createFormData = (data) => {
  const formData = new FormData()
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      if (data[key] instanceof File) {
        formData.append(key, data[key])
      } else if (Array.isArray(data[key])) {
        data[key].forEach((item, index) => {
          formData.append(`${key}[${index}]`, item)
        })
      } else {
        formData.append(key, data[key])
      }
    }
  })
  return formData
}