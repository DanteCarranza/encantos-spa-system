// Servicio de proveedores - Snacks
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

export const suppliersService = {
  /**
   * Obtener todos los proveedores
   */
  async getSuppliers(incluirInactivos = false) {
    try {
      const params = incluirInactivos ? '?incluir_inactivos=1' : '';
      const response = await fetch(`${API_BASE_URL}/snacks/suppliers.php${params}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting suppliers:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener un proveedor por ID
   */
  async getSupplierById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/suppliers.php?id=${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting supplier:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener historial de compras de un proveedor
   */
  async getSupplierHistory(proveedorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/suppliers.php?historial=1&proveedor_id=${proveedorId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting supplier history:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Crear proveedor
   */
  async createSupplier(supplierData) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/suppliers.php`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(supplierData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating supplier:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Actualizar proveedor
   */
  async updateSupplier(id, supplierData) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/suppliers.php`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, ...supplierData })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating supplier:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Eliminar proveedor
   */
  async deleteSupplier(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/suppliers.php?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting supplier:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }
};

export default suppliersService;