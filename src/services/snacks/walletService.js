// Servicio de billetera digital - Snacks
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

export const walletService = {
  /**
   * Obtener saldo actual de billetera
   */
  async getBalance() {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/wallet.php?saldo=1`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener historial de movimientos
   */
  async getHistory(fechaDesde = null, fechaHasta = null, limit = 50) {
    try {
      const params = new URLSearchParams({ historial: '1', limit: limit.toString() });
      if (fechaDesde) params.append('fecha_desde', fechaDesde);
      if (fechaHasta) params.append('fecha_hasta', fechaHasta);

      const response = await fetch(`${API_BASE_URL}/snacks/wallet.php?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting wallet history:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener resumen por período
   */
  async getSummary(fechaDesde, fechaHasta) {
    try {
      const params = new URLSearchParams({
        resumen: '1',
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta
      });

      const response = await fetch(`${API_BASE_URL}/snacks/wallet.php?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting wallet summary:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Registrar retiro de billetera
   */
  async withdraw(monto, observaciones = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/wallet.php`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          tipo: 'RETIRO',
          monto: parseFloat(monto),
          observaciones
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error withdrawing from wallet:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Registrar ajuste de saldo
   */
  async adjust(monto, observaciones = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/wallet.php`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          tipo: 'AJUSTE',
          monto_ajuste: parseFloat(monto),
          monto: Math.abs(parseFloat(monto)),
          observaciones
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adjusting wallet:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }
};

export default walletService;