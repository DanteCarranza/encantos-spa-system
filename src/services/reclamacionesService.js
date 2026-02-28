// Servicio de Reclamaciones
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encantos.pe/spa/backend/api';

export const reclamacionesService = {
  /**
   * Crear nueva reclamación (público)
   */
  async crearReclamacion(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/reclamaciones/reclamaciones.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating reclamacion:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Consultar reclamación por código (público)
   */
  async consultarReclamacion(codigo) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reclamaciones/reclamaciones.php?codigo=${encodeURIComponent(codigo)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error consulting reclamacion:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener todas las reclamaciones (admin)
   */
  async getReclamaciones(filters = {}) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No autenticado');
      }

      const params = new URLSearchParams();
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.desde) params.append('desde', filters.desde);
      if (filters.hasta) params.append('hasta', filters.hasta);

      const response = await fetch(
        `${API_BASE_URL}/reclamaciones/reclamaciones.php?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting reclamaciones:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },



/**
 * Actualizar estado y respuesta de reclamación (admin)
 */
async responderReclamacion(id, respuesta, estado) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No autenticado');
      }
  
      const response = await fetch(`${API_BASE_URL}/reclamaciones/reclamaciones.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          id: parseInt(id), 
          respuesta: respuesta, 
          estado: estado 
        })
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error responding reclamacion:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },


  /**
 * Consultar reclamación por código (público)
 */
async consultarReclamacion(codigo) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reclamaciones/reclamaciones.php?codigo=${encodeURIComponent(codigo)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error consulting reclamacion:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }




};

export default reclamacionesService;