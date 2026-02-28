// Servicio de reportes - Snacks
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

export const reportsService = {
  /**
   * Obtener reporte de ventas
   */
  async getSalesReport(fechaDesde, fechaHasta) {
    try {
      const params = new URLSearchParams({
        tipo: 'ventas',
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta,
        _t: new Date().getTime() // Evitar cache
      });
  
      const response = await fetch(`${API_BASE_URL}/snacks/reports.php?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        cache: 'no-cache'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting sales report:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener productos más vendidos
   */
  async getTopProducts(fechaDesde, fechaHasta) {
    try {
      const params = new URLSearchParams({
        tipo: 'productos_mas_vendidos',
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta
      });

      const response = await fetch(`${API_BASE_URL}/snacks/reports.php?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting top products:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener reporte de stock
   */
  async getStockReport() {
    try {
      const params = new URLSearchParams({ tipo: 'stock' });

      const response = await fetch(`${API_BASE_URL}/snacks/reports.php?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting stock report:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener reporte por categorías
   */
  async getCategoriesReport(fechaDesde, fechaHasta) {
    try {
      const params = new URLSearchParams({
        tipo: 'categorias',
        fecha_desde: fechaDesde,
        fecha_hasta: fechaHasta
      });

      const response = await fetch(`${API_BASE_URL}/snacks/reports.php?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting categories report:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener dashboard general
   */
  async getDashboard() {
    try {
      const params = new URLSearchParams({ tipo: 'dashboard' });

      const response = await fetch(`${API_BASE_URL}/snacks/reports.php?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting dashboard:', error);
      return { success: false, message: 'Error de conexión' };
    }
  },




  async getDetailedSales(fechaDesde, fechaHasta) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/snacks/reports.php?tipo=detalle_ventas&fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      )
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting detailed sales:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },





/**
 * Obtener reporte de ventas por ubicación
 */
async getSalesLocationReport(fechaDesde, fechaHasta) {
  try {
    const params = new URLSearchParams({
      tipo: 'ventas_ubicacion',
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta
    })

    const response = await fetch(`${API_BASE_URL}/snacks/reports.php?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error getting sales location report:', error)
    return { success: false, message: 'Error de conexión' }
  }
}


};

export default reportsService;