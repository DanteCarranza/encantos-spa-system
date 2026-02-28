// Servicio de compras - Snacks
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

export const purchasesService = {
  /**
   * Obtener todas las compras
   */
  async getPurchases(fechaDesde = null, fechaHasta = null, proveedorId = null, estado = null) {
    try {
      const params = new URLSearchParams();
      if (fechaDesde) params.append('fecha_desde', fechaDesde);
      if (fechaHasta) params.append('fecha_hasta', fechaHasta);
      if (proveedorId) params.append('proveedor_id', proveedorId);
      if (estado) params.append('estado', estado);

      const response = await fetch(`${API_BASE_URL}/snacks/purchases.php?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting purchases:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener una compra por ID
   */
  async getPurchaseById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/purchases.php?id=${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting purchase:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Crear compra
   */
  async createPurchase(purchaseData) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/purchases.php`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(purchaseData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating purchase:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Actualizar compra
   */
  async updatePurchase(id, purchaseData) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/purchases.php`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, ...purchaseData })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating purchase:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Eliminar compra
   */
  async deletePurchase(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/purchases.php?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting purchase:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }
};

export default purchasesService;