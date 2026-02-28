// Servicio de ventas y caja - Snacks
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

export const salesService = {
  /**
   * Verificar estado de caja
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
   * Abrir caja
   */
  async openCash(montoInicial) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/cash.php`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          accion: 'apertura',
          monto_inicial: parseFloat(montoInicial)
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
  },

  /**
   * Obtener ventas del día
   */
  async getTodaySales() {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/sales.php?ventas_hoy=1`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting sales:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Registrar venta
   */
  async createSale(saleData) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/sales.php`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(saleData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating sale:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }
};

export default salesService;