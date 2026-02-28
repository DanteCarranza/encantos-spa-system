// Servicio de gestión de caja - Snacks
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

export const cashService = {
  /**
   * Obtener estado de caja actual
   */
  async getCashStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/cash.php?estado=1`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting cash status:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener historial de cajas
   */
  async getCashHistory(fechaDesde = null, fechaHasta = null) {
    try {
      const params = new URLSearchParams({ historial: '1' });
      if (fechaDesde) params.append('fecha_desde', fechaDesde);
      if (fechaHasta) params.append('fecha_hasta', fechaHasta);

      const response = await fetch(`${API_BASE_URL}/snacks/cash.php?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting cash history:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener detalle de una caja específica
   */
  async getCashDetail(cajaId) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/cash.php?id=${cajaId}`, {
        //const response = await fetch(`${API_BASE_URL}/snacks/cash.php?detalle=${cajaId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting cash detail:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener resumen del día
   */
  async getDaySummary(fecha = null) {
    try {
      const params = new URLSearchParams({ resumen_dia: '1' });
      if (fecha) params.append('fecha', fecha);

      const response = await fetch(`${API_BASE_URL}/snacks/cash.php?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting day summary:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Abrir caja
   */
  async openCash(montoInicial, observaciones = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/cash.php`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          accion: 'apertura',
          monto_inicial: parseFloat(montoInicial),
          observaciones
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error opening cash:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Cerrar caja
   */
  async closeCash(montoCierre, observaciones = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/cash.php`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          accion: 'cierre',
          monto_cierre: parseFloat(montoCierre),
          observaciones
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error closing cash:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }
};

export default cashService;