import api, { handleApiError } from './api'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encantos.pe/spa/backend/api'

const spaService = {
  // Obtener servicios del spa
  getServices: async () => {
    try {
      const response = await api.get('/spa/services')
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Error getting services:', error)
      // Servicios de ejemplo como fallback
      return { 
        success: true, 
        data: [
          {
            id: 1,
            nombre: 'Masaje Relajante',
            descripcion: 'Masaje de cuerpo completo con aceites esenciales',
            duracion: 60,
            precio: 120.00,
            imagen: '/services/masaje.jpg',
            categoria: 'masajes'
          },
          {
            id: 2,
            nombre: 'Facial Rejuvenecedor',
            descripcion: 'Tratamiento facial anti-edad con productos premium',
            duracion: 90,
            precio: 150.00,
            imagen: '/services/facial.jpg',
            categoria: 'faciales'
          },
          {
            id: 3,
            nombre: 'Manicure & Pedicure',
            descripcion: 'Cuidado completo de manos y pies',
            duracion: 75,
            precio: 80.00,
            imagen: '/services/manicure.jpg',
            categoria: 'uñas'
          },
          {
            id: 4,
            nombre: 'Masaje de Piedras Calientes',
            descripcion: 'Terapia con piedras volcánicas calientes',
            duracion: 90,
            precio: 180.00,
            imagen: '/services/piedras.jpg',
            categoria: 'masajes'
          },
          {
            id: 5,
            nombre: 'Depilación Láser',
            descripcion: 'Depilación definitiva con tecnología láser',
            duracion: 45,
            precio: 200.00,
            imagen: '/services/depilacion.jpg',
            categoria: 'depilacion'
          },
          {
            id: 6,
            nombre: 'Tratamiento Corporal',
            descripcion: 'Exfoliación e hidratación corporal profunda',
            duracion: 120,
            precio: 220.00,
            imagen: '/services/corporal.jpg',
            categoria: 'corporales'
          }
        ]
      }
    }
  },

  // Obtener terapeutas disponibles
  getTherapists: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/therapists.php`)
      const data = await response.json()
      
      if (data.success) {
        return data
      } else {
        throw new Error(data.message || 'Error al obtener terapeutas')
      }
    } catch (error) {
      console.error('Error getting therapists:', error)
      // Terapeutas de ejemplo como fallback
      return {
        success: true,
        data: [
          {
            id: 1,
            nombre: 'Areyka Cristina Flores Díaz',
            especialidad: 'Encargada',
            foto_url: null,
            rating: 5.0
          },
          {
            id: 2,
            nombre: 'Jeremy Mijael Piña Lopez',
            especialidad: 'Asistente/Maquillador',
            foto_url: null,
            rating: 4.9
          },
          {
            id: 3,
            nombre: 'Soc Mang Sofía León Cahuaza',
            especialidad: 'Manicurista',
            foto_url: null,
            rating: 4.85
          },
          {
            id: 4,
            nombre: 'Américo Eduardo Figori Mesía',
            especialidad: 'Estilista',
            foto_url: null,
            rating: 4.95
          },
          {
            id: 5,
            nombre: 'Maryenith Arévalo Rengifo',
            especialidad: 'Manicurista',
            foto_url: null,
            rating: 4.88
          },
          {
            id: 6,
            nombre: 'Lucia Jazmín García Murrieta',
            especialidad: 'Lashista',
            foto_url: null,
            rating: 4.92
          }
        ]
      }
    }
  },

  // Obtener horarios disponibles por fecha y servicio
  getAvailableSlots: async (fecha, servicioId, terapeutaId = null) => {
    try {
      const params = new URLSearchParams({
        fecha,
        servicio_id: servicioId
      })
      
      if (terapeutaId) {
        params.append('terapeuta_id', terapeutaId)
      }
      
      const response = await fetch(`${API_BASE_URL}/available-slots.php?${params}`)
      const data = await response.json()
      
      if (data.success) {
        return data
      } else {
        throw new Error(data.message || 'Error al obtener horarios')
      }
    } catch (error) {
      console.error('Error getting available slots:', error)
      // Horarios de ejemplo como fallback
      const slots = []
      const hours = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
      
      hours.forEach((hora, index) => {
        slots.push({
          hora: hora,
          disponible: Math.random() > 0.3, // 70% disponibles
          terapeuta: terapeutaId || (index % 6) + 1
        })
      })
      
      return { success: true, data: slots }
    }
  },

  // Crear reserva
// Crear reserva
createBooking: async (bookingData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings.php`, {
        method: 'POST',
        // NO incluir Content-Type, FormData lo maneja automáticamente
        body: bookingData
      })
      
      const data = await response.json()
      
      if (data.success) {
        return data
      } else {
        throw new Error(data.message || 'Error al crear reserva')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      return { 
        success: false, 
        message: error.message || 'Error de conexión' 
      }
    }
  },

  // Obtener reservas del usuario
  getUserBookings: async () => {
    try {
      const response = await api.get('/spa/my-bookings')
      return { success: true, data: response.data.data }
    } catch (error) {
      console.error('Error getting user bookings:', error)
      return { success: true, data: [] }
    }
  }
}

export default spaService