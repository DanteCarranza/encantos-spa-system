// Servicio de gestión de servicios del SPA
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encantos.pe/spa/backend/api';

// Obtener token de autenticación
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Headers con autenticación
const getAuthHeaders = () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No autenticado');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const servicesService = {
  /**
   * Obtener todos los servicios (público)
   */
  async getServices(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.categoria && filters.categoria !== 'all') {
        params.append('categoria', filters.categoria);
      }
      if (filters.popular) params.append('popular', '1');
      
      const queryString = params.toString();
      const url = `${API_BASE_URL}/services.php${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting services:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener categorías
   */
  async getCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/services.php?categorias=1`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting categories:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener servicio por ID
   */
  async getServiceById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/services.php?id=${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting service:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  // ========== ADMIN METHODS ==========

  /**
   * Crear servicio (admin)
   */
  async createService(serviceData) {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')
      
      const response = await fetch(`${API_BASE_URL}/services.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: serviceData
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating service:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Actualizar servicio (admin)
   */
  async updateService(id, serviceData) {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')
      
      const response = await fetch(`${API_BASE_URL}/services.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: serviceData
      })
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error updating service:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },
  /**
   * Eliminar servicio (admin)
   */
  async deleteService(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/services.php?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting service:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }
};

export default servicesService;