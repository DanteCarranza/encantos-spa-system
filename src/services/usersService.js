// Servicio de gestión de usuarios para admin
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encantos.pe/spa/backend/api';

// Obtener token de autenticación
const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No hay token de autenticación');
      return null;
    }
    return token;
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

export const usersService = {
  /**
   * Obtener todos los usuarios
   */
  async getUsers(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.role && filters.role !== 'all') params.append('role', filters.role);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      
      const queryString = params.toString();
      const url = `${API_BASE_URL}/admin/users.php${queryString ? '?' + queryString : ''}`;
      
      const headers = getAuthHeaders();
      
      // DEBUG: Ver qué se está enviando
      console.log('🔐 Enviando petición a:', url);
      console.log('📦 Headers:', headers);
      console.log('🎫 Token:', localStorage.getItem('authToken')?.substring(0, 20) + '...');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      
      console.log('📨 Response status:', response.status);
      
      const data = await response.json();
      console.log('📋 Response data:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error getting users:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener un usuario por ID
   */
  async getUserById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users.php?id=${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting user:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Crear nuevo usuario
   */
  async createUser(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users.php`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Actualizar usuario
   */
  async updateUser(id, userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users.php`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...userData, id })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Eliminar usuario
   */
  async deleteUser(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users.php?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Cambiar estado de usuario (activar/desactivar)
   */
  async toggleUserStatus(id, currentStatus) {
    try {
      return await this.updateUser(id, {
        activo: !currentStatus
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Exportar usuarios a CSV (lado cliente)
   */
  exportToCSV(users) {
    const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Rol', 'Total Citas', 'Total Gastado', 'Estado', 'Fecha Registro'];
    const rows = users.map(user => [
      user.id,
      user.nombre,
      user.email,
      user.telefono,
      user.rol,
      user.total_citas,
      user.total_gastado.toFixed(2),
      user.activo ? 'Activo' : 'Inactivo',
      user.fecha_registro
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
};

export default usersService;