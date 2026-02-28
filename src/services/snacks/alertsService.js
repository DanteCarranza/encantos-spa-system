// Servicio de alertas - Snacks
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

export const alertsService = {
  /**
   * Obtener resumen de alertas activas
   */
  async getAlertsSummary() {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/alerts.php?resumen=1`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting alerts summary:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener notificaciones del usuario
   */
  async getNotifications(soloNoLeidas = false) {
    try {
      const params = soloNoLeidas ? '&no_leidas=1' : '';
      const response = await fetch(`${API_BASE_URL}/snacks/alerts.php?notificaciones=1${params}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener configuración de alertas
   */
  async getAlertsConfig() {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/alerts.php?config=1`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting alerts config:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Crear notificación
   */
  async createNotification(notificationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/alerts.php`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(notificationData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Marcar notificación como leída
   */
  async markAsRead(notificationId = null) {
    try {
      const body = { marcar_leida: true };
      if (notificationId) {
        body.id = notificationId;
      }

      const response = await fetch(`${API_BASE_URL}/snacks/alerts.php`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Actualizar configuración de alertas
   */
  async updateAlertsConfig(tipoAlerta, config, activa = true) {
    try {
      const response = await fetch(`${API_BASE_URL}/snacks/alerts.php`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          tipo_alerta: tipoAlerta,
          config: config,
          activa: activa
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating alerts config:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }
};

export default alertsService;