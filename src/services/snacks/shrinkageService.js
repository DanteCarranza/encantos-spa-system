// Servicio de mermas - Snacks
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encantos.pe/spa/backend/api';

const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

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

export const shrinkageService = {
  /**
   * Obtener tipos de ajuste
   */
  async getAdjustmentTypes() {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/shrinkage.php?tipos=1`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting adjustment types:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener todos los registros de mermas
   */
  async getShrinkage(fechaDesde = null, fechaHasta = null, tipoAjusteId = null, productoId = null) {
    try {
      const params = new URLSearchParams();
      if (fechaDesde) params.append('fecha_desde', fechaDesde);
      if (fechaHasta) params.append('fecha_hasta', fechaHasta);
      if (tipoAjusteId) params.append('tipo_ajuste_id', tipoAjusteId);
      if (productoId) params.append('producto_id', productoId);

      const response = await fetch(`${API_BASE_URL}/snacks/shrinkage.php?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting shrinkage:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener resumen de mermas
   */
  async getSummary(fechaDesde, fechaHasta) {
    try {
      const params = new URLSearchParams();
      params.append('resumen', '1');
      if (fechaDesde) params.append('fecha_desde', fechaDesde);
      if (fechaHasta) params.append('fecha_hasta', fechaHasta);

      const response = await fetch(`${API_BASE_URL}/snacks/shrinkage.php?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting summary:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Registrar merma/ajuste
   */
  async createShrinkage(shrinkageData) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/shrinkage.php`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(shrinkageData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating shrinkage:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Eliminar merma/ajuste
   */
  async deleteShrinkage(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/shrinkage.php?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting shrinkage:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }
};

export default shrinkageService;