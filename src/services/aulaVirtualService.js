const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encantos.pe/spa/backend/api'

const aulaVirtualService = {
  // ========== DASHBOARD ==========
  async getDashboardStats(fechaInicio, fechaFin) {
    try {
      const params = new URLSearchParams()
      if (fechaInicio) params.append('fecha_inicio', fechaInicio)
      if (fechaFin) params.append('fecha_fin', fechaFin)
      
      const response = await fetch(`${API_BASE_URL}/moodle/dashboard.php?${params}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo dashboard:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // ========== PAGOS ==========
  async getPayments(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const response = await fetch(`${API_BASE_URL}/moodle/payments.php?${queryParams}`)
      const result = await response.json()
      
      // Manejar nuevo formato con data y total
      if (result.success && result.data && typeof result.data === 'object' && result.data.data) {
        return {
          success: true,
          data: result.data.data,
          total: result.data.total,
          page: result.data.page,
          limit: result.data.limit
        }
      }
      
      return result
    } catch (error) {
      console.error('Error obteniendo pagos:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  async getPaymentDetail(paymentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/moodle/payments.php?action=detail&id=${paymentId}`)
      return await response.json()
    } catch (error) {
      console.error('Error obteniendo detalle de pago:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  async getPaymentStats(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const response = await fetch(`${API_BASE_URL}/moodle/payments.php?action=stats&${queryParams}`)
      return await response.json()
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  async getPendingPayments() {
    try {
      const response = await fetch(`${API_BASE_URL}/moodle/payments.php?action=pending`)
      return await response.json()
    } catch (error) {
      console.error('Error obteniendo pagos pendientes:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  async createPayment(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/moodle/payments.php?action=create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return await response.json()
    } catch (error) {
      console.error('Error creando pago:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // AGREGAR ESTE MÉTODO AQUÍ
  async addAbono(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/moodle/payments.php?action=add-abono`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return await response.json()
    } catch (error) {
      console.error('Error agregando abono:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // ========== ESTUDIANTES ==========
  async getStudents(params = {}) {
    try {
      const queryParams = new URLSearchParams({ action: 'list', ...params }).toString()
      const response = await fetch(`${API_BASE_URL}/moodle/students.php?${queryParams}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo estudiantes:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  async getStudentDetail(userid) {
    try {
      const response = await fetch(`${API_BASE_URL}/moodle/students.php?action=detail&userid=${userid}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo detalle:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  async searchStudents(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/moodle/students.php?action=search&query=${encodeURIComponent(query)}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error buscando estudiantes:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  async getStudentsWithDebts() {
    try {
      const response = await fetch(`${API_BASE_URL}/moodle/students.php?action=with-debts`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo deudores:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // ========== CURSOS ==========
  async getCourses() {
    try {
      const response = await fetch(`${API_BASE_URL}/moodle/courses.php?action=list`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo cursos:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  async getCourseDetail(courseid) {
    try {
      const response = await fetch(`${API_BASE_URL}/moodle/courses.php?action=detail&courseid=${courseid}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo detalle:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  async getCourseStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/moodle/courses.php?action=stats`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  // ========== UTILIDADES ==========
  formatPrice(price) {
    return `S/ ${parseFloat(price).toFixed(2)}`
  },

  formatDate(timestamp) {
    if (!timestamp) return '-'
    const date = new Date(parseInt(timestamp) * 1000)
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  },

  formatDateTime(timestamp) {
    if (!timestamp) return '-'
    const date = new Date(parseInt(timestamp) * 1000)
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  },


// ========== COMPROBANTES / FACTURACIÓN ==========
async getComprobantes(params = {}) {
    try {
      const queryParams = new URLSearchParams({ action: 'list', ...params }).toString()
      const response = await fetch(`${API_BASE_URL}/moodle/invoices.php?${queryParams}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo comprobantes:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  async getComprobanteDetail(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/moodle/invoices.php?action=detail&id=${id}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo detalle:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  async getPagosSinFacturar() {
    try {
      const response = await fetch(`${API_BASE_URL}/moodle/invoices.php?action=pagos-sin-facturar`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo pagos:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  async getNubefactConfig() {
    try {
      const response = await fetch(`${API_BASE_URL}/moodle/invoices.php?action=config`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo config:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  async generarComprobante(pagoId, tipoComprobante, clienteData = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/moodle/invoices.php?action=generar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pago_id: pagoId,
          tipo_comprobante: tipoComprobante,
          cliente: clienteData
        })
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error generando comprobante:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },


  async getPaymentsCalendar(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const response = await fetch(`${API_BASE_URL}/moodle/payments.php?action=calendar&${queryParams}`)
      return await response.json()
    } catch (error) {
      console.error('Error obteniendo calendario de pagos:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },



// ========== METAS ==========
async getMetaMensual() {
    try {
      const response = await fetch(`${API_BASE_URL}/moodle/metas.php?action=mensual`)
      return await response.json()
    } catch (error) {
      console.error('Error obteniendo meta mensual:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  async getMetasPorCurso() {
    try {
      const response = await fetch(`${API_BASE_URL}/moodle/metas.php?action=cursos`)
      return await response.json()
    } catch (error) {
      console.error('Error obteniendo metas por curso:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  async getHistoricoMetas() {
    try {
      const response = await fetch(`${API_BASE_URL}/moodle/metas.php?action=historico`)
      return await response.json()
    } catch (error) {
      console.error('Error obteniendo histórico:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  async updateMetaMensual(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/moodle/metas.php?action=update-mensual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return await response.json()
    } catch (error) {
      console.error('Error actualizando meta mensual:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  async createMetaCurso(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/moodle/metas.php?action=create-curso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return await response.json()
    } catch (error) {
      console.error('Error creando meta de curso:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  async deleteMetaCurso(metaId) {
    try {
      const response = await fetch(`${API_BASE_URL}/moodle/metas.php?action=curso&id=${metaId}`, {
        method: 'DELETE'
      })
      return await response.json()
    } catch (error) {
      console.error('Error eliminando meta de curso:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },


  async deleteMetaMensual() {
    try {
      const response = await fetch(`${API_BASE_URL}/moodle/metas.php?action=delete-mensual`, {
        method: 'DELETE'
      })
      return await response.json()
    } catch (error) {
      console.error('Error eliminando meta mensual:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },


  // ========== REPORTES PERSONALIZADOS ==========
  async getReporteIngresos(filters) {
    try {
      const queryParams = new URLSearchParams(filters).toString()
      const response = await fetch(`${API_BASE_URL}/moodle/reportes.php?action=ingresos&${queryParams}`)
      return await response.json()
    } catch (error) {
      console.error('Error obteniendo reporte de ingresos:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  async getReporteVencidos(filters) {
    try {
      const queryParams = new URLSearchParams(filters).toString()
      const response = await fetch(`${API_BASE_URL}/moodle/reportes.php?action=vencidos&${queryParams}`)
      return await response.json()
    } catch (error) {
      console.error('Error obteniendo reporte de vencidos:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  async getReporteFlujo(filters) {
    try {
      const queryParams = new URLSearchParams(filters).toString()
      const response = await fetch(`${API_BASE_URL}/moodle/reportes.php?action=flujo&${queryParams}`)
      return await response.json()
    } catch (error) {
      console.error('Error obteniendo reporte de flujo:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  async getReporteComprobantes(filters) {
    try {
      const queryParams = new URLSearchParams(filters).toString()
      const response = await fetch(`${API_BASE_URL}/moodle/reportes.php?action=comprobantes&${queryParams}`)
      return await response.json()
    } catch (error) {
      console.error('Error obteniendo reporte de comprobantes:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },


}

export default aulaVirtualService