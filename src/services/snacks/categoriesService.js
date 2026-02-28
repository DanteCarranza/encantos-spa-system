// Servicio de categorías - Snacks
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

export const categoriesService = {
  /**
   * Obtener todas las categorías
   */
  async getCategories(incluirInactivas = false) {
    try {
      const params = incluirInactivas ? '?incluir_inactivas=1' : '';
      const response = await fetch(`${API_BASE_URL}/snacks/categories.php${params}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting categories:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener una categoría por ID
   */
  async getCategoryById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/categories.php?id=${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting category:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Crear categoría
   */
  async createCategory(categoryData) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/categories.php`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Actualizar categoría
   */
  async updateCategory(id, categoryData) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/categories.php`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, ...categoryData })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Actualizar orden de categoría
   */
  async updateOrder(id, orden) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/categories.php`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, orden })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating order:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Eliminar categoría
   */
  async deleteCategory(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/categories.php?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting category:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }
};

export default categoriesService;