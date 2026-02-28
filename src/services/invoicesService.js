const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encantos.pe/spa/backend/api'

const invoicesService = {
  /**
   * Obtener lista de comprobantes
   */
  async getInvoices(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const url = `${API_BASE_URL}/invoices.php?action=list${queryParams ? '&' + queryParams : ''}`
      
      const response = await fetch(url)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo comprobantes:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Obtener detalle de comprobante
   */
  async getInvoiceDetail(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices.php?action=detail&id=${id}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo detalle:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Obtener configuración
   */
  async getConfig() {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices.php?action=config`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo configuración:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Obtener reservas sin facturar
   */
  async getReservasSinFacturar() {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices.php?action=reservas-sin-facturar`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo reservas:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Generar comprobante
   */
  async generarComprobante(reservaId, tipoComprobante, clienteData = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices.php?action=generar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reserva_id: reservaId,
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

  /**
   * Actualizar configuración
   */
  async updateConfig(configData) {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices.php?action=actualizar-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(configData)
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error actualizando configuración:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Anular comprobante
   */
  async anularComprobante(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices.php?action=anular&id=${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error anulando comprobante:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Descargar PDF en base64
   */
  downloadPDF(pdfBase64, nombreArchivo) {
    try {
      const byteCharacters = atob(pdfBase64)
      const byteNumbers = new Array(byteCharacters.length)
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      
      link.href = url
      link.download = nombreArchivo
      link.click()
      
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error descargando PDF:', error)
    }
  }
}

export default invoicesService