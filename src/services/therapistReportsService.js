const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encantos.pe/spa/backend/api'

const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

const therapistReportsService = {
  /**
   * Obtener resumen general
   */
  async getOverview() {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')

      const response = await fetch(`${API_BASE_URL}/therapist-reports.php?action=overview`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo resumen:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Obtener detalle de un terapeuta específico
   */
  async getTherapistDetail(terapeutaId, mes = null) {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')

      const mesParam = mes || new Date().toISOString().slice(0, 7) // YYYY-MM
      const response = await fetch(
        `${API_BASE_URL}/therapist-reports.php?action=therapist-detail&terapeuta_id=${terapeutaId}&mes=${mesParam}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo detalle del terapeuta:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Obtener reporte de asistencia
   */
  async getAttendanceReport(mes = null) {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')

      const mesParam = mes || new Date().toISOString().slice(0, 7)
      const response = await fetch(
        `${API_BASE_URL}/therapist-reports.php?action=attendance&mes=${mesParam}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo reporte de asistencia:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Obtener reporte de ganancias
   */
  async getEarningsReport(mes = null) {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')

      const mesParam = mes || new Date().toISOString().slice(0, 7)
      const response = await fetch(
        `${API_BASE_URL}/therapist-reports.php?action=earnings&mes=${mesParam}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo reporte de ganancias:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Obtener top terapeutas del mes
   */
  async getTopTherapists(mes = null, limit = 10) {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')

      const mesParam = mes || new Date().toISOString().slice(0, 7)
      const response = await fetch(
        `${API_BASE_URL}/therapist-reports.php?action=top-therapists&mes=${mesParam}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo top terapeutas:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Obtener estadísticas mensuales (últimos 6 meses)
   */
  async getMonthlyStats() {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')

      const response = await fetch(
        `${API_BASE_URL}/therapist-reports.php?action=monthly-stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo estadísticas mensuales:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Exportar reporte a CSV
   */
  async exportToCSV(reportType, mes = null) {
    try {
      const token = getAuthToken()
      if (!token) throw new Error('No autenticado')

      const mesParam = mes || new Date().toISOString().slice(0, 7)
      
      let data = null
      switch (reportType) {
        case 'attendance':
          data = await this.getAttendanceReport(mesParam)
          break
        case 'earnings':
          data = await this.getEarningsReport(mesParam)
          break
        case 'top':
          data = await this.getTopTherapists(mesParam)
          break
        default:
          throw new Error('Tipo de reporte no válido')
      }

      if (!data.success) {
        throw new Error(data.message)
      }

      return this.downloadCSV(data.data, reportType, mesParam)
    } catch (error) {
      console.error('Error exportando a CSV:', error)
      return { success: false, message: 'Error al exportar' }
    }
  },

  /**
   * Descargar CSV
   */
  downloadCSV(data, reportType, mes) {
    let csv = ''
    let filename = ''

    switch (reportType) {
      case 'attendance':
        csv = this.generateAttendanceCSV(data)
        filename = `reporte-asistencia-${mes}.csv`
        break
      case 'earnings':
        csv = this.generateEarningsCSV(data)
        filename = `reporte-ganancias-${mes}.csv`
        break
      case 'top':
        csv = this.generateTopTherapistsCSV(data)
        filename = `top-terapeutas-${mes}.csv`
        break
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return { success: true, message: 'Reporte descargado' }
  },

  /**
   * Generar CSV de asistencia
   */
  generateAttendanceCSV(data) {
    const headers = ['ID', 'Terapeuta', 'Especialidad', 'Total Citas', 'Completadas', 'Canceladas', 'No Asistió', 'Tasa Asistencia (%)']
    const rows = data.map(t => [
      t.id,
      t.nombre_completo,
      t.especialidad || 'N/A',
      t.total_citas,
      t.completadas,
      t.canceladas,
      t.no_asistio,
      t.tasa_asistencia || '0'
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  },

  /**
   * Generar CSV de ganancias
   */
  generateEarningsCSV(data) {
    const headers = ['ID', 'Terapeuta', 'Citas Completadas', 'Ingresos Generados', 'Comisión (40%)', 'Ganancia SPA']
    const rows = data.terapeutas.map(t => [
      t.id,
      t.nombre_completo,
      t.citas_completadas,
      parseFloat(t.ingresos_generados).toFixed(2),
      parseFloat(t.comision_terapeuta).toFixed(2),
      parseFloat(t.ingresos_generados - t.comision_terapeuta).toFixed(2)
    ])

    // Agregar totales
    rows.push([
      '',
      'TOTALES',
      '',
      parseFloat(data.totales.ingresos_generados).toFixed(2),
      parseFloat(data.totales.comisiones_pagadas).toFixed(2),
      parseFloat(data.totales.ganancia_spa).toFixed(2)
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  },

  /**
   * Generar CSV de top terapeutas
   */
  generateTopTherapistsCSV(data) {
    const headers = ['Posición', 'Terapeuta', 'Especialidad', 'Citas Completadas', 'Ingresos Generados', 'Rating Promedio']
    const rows = data.map((t, index) => [
      index + 1,
      t.nombre_completo,
      t.especialidad || 'N/A',
      t.citas_completadas,
      parseFloat(t.ingresos_generados).toFixed(2),
      t.rating_promedio ? parseFloat(t.rating_promedio).toFixed(2) : 'N/A'
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  },





/**
 * Exportar reporte a Excel
 */
async exportToExcel(reportType, mes = null) {
    try {
      const mesParam = mes || new Date().toISOString().slice(0, 7)
      
      let data = null
      let filename = ''
      let sheetName = ''
      
      switch (reportType) {
        case 'attendance':
          data = await this.getAttendanceReport(mesParam)
          filename = `reporte-asistencia-${mesParam}.xlsx`
          sheetName = 'Asistencia'
          break
        case 'earnings':
          data = await this.getEarningsReport(mesParam)
          filename = `reporte-ganancias-${mesParam}.xlsx`
          sheetName = 'Ganancias'
          break
        case 'top':
          data = await this.getTopTherapists(mesParam)
          filename = `top-terapeutas-${mesParam}.xlsx`
          sheetName = 'Top Terapeutas'
          break
        default:
          throw new Error('Tipo de reporte no válido')
      }
  
      if (!data.success) {
        throw new Error(data.message)
      }
  
      return this.downloadExcel(data.data, reportType, filename, sheetName)
    } catch (error) {
      console.error('Error exportando a Excel:', error)
      return { success: false, message: 'Error al exportar' }
    }
  },
  
  /**
   * Descargar Excel usando SheetJS
   */
  downloadExcel(data, reportType, filename, sheetName) {
    // Importar XLSX dinámicamente
    import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs').then(XLSX => {
      let worksheetData = []
      
      switch (reportType) {
        case 'attendance':
          worksheetData = this.generateAttendanceExcelData(data)
          break
        case 'earnings':
          worksheetData = this.generateEarningsExcelData(data)
          break
        case 'top':
          worksheetData = this.generateTopTherapistsExcelData(data)
          break
      }
  
      const ws = XLSX.utils.aoa_to_sheet(worksheetData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
      
      // Configurar anchos de columna
      ws['!cols'] = worksheetData[0].map(() => ({ wch: 20 }))
      
      XLSX.writeFile(wb, filename)
      
      return { success: true, message: 'Reporte descargado' }
    })
  },
  
  /**
   * Generar datos para Excel - Asistencia
   */
  generateAttendanceExcelData(data) {
    const headers = ['ID', 'Terapeuta', 'Especialidad', 'Total Citas', 'Completadas', 'Canceladas', 'No Asistió', 'Tasa Asistencia (%)']
    const rows = data.map(t => [
      t.id,
      t.nombre_completo,
      t.especialidad || 'N/A',
      t.total_citas,
      t.completadas,
      t.canceladas,
      t.no_asistio,
      t.tasa_asistencia || '0'
    ])
  
    return [headers, ...rows]
  },
  
  /**
   * Generar datos para Excel - Ganancias
   */
  generateEarningsExcelData(data) {
    const headers = ['ID', 'Terapeuta', 'Citas Completadas', 'Ingresos Generados', 'Comisión (40%)', 'Ganancia SPA (60%)']
    const rows = data.terapeutas.map(t => [
      t.id,
      t.nombre_completo,
      t.citas_completadas,
      parseFloat(t.ingresos_generados).toFixed(2),
      parseFloat(t.comision_terapeuta).toFixed(2),
      parseFloat(t.ingresos_generados - t.comision_terapeuta).toFixed(2)
    ])
  
    // Agregar fila de totales
    rows.push([
      '',
      'TOTALES',
      data.terapeutas.reduce((sum, t) => sum + parseInt(t.citas_completadas || 0), 0),
      parseFloat(data.totales.ingresos_generados).toFixed(2),
      parseFloat(data.totales.comisiones_pagadas).toFixed(2),
      parseFloat(data.totales.ganancia_spa).toFixed(2)
    ])
  
    return [headers, ...rows]
  },
  
  /**
   * Generar datos para Excel - Top Terapeutas
   */
  generateTopTherapistsExcelData(data) {
    const headers = ['Posición', 'Terapeuta', 'Especialidad', 'Citas Completadas', 'Ingresos Generados', 'Rating Promedio']
    const rows = data.map((t, index) => [
      index + 1,
      t.nombre_completo,
      t.especialidad || 'N/A',
      t.citas_completadas,
      parseFloat(t.ingresos_generados).toFixed(2),
      t.rating_promedio ? parseFloat(t.rating_promedio).toFixed(2) : 'N/A'
    ])
  
    return [headers, ...rows]
  },
  
  /**
   * Exportar a PDF
   */
  async exportToPDF(reportType, mes = null) {
    try {
      const mesParam = mes || new Date().toISOString().slice(0, 7)
      
      let data = null
      switch (reportType) {
        case 'attendance':
          data = await this.getAttendanceReport(mesParam)
          break
        case 'earnings':
          data = await this.getEarningsReport(mesParam)
          break
        case 'top':
          data = await this.getTopTherapists(mesParam)
          break
      }
  
      if (!data.success) {
        throw new Error(data.message)
      }
  
      return this.downloadPDF(data.data, reportType, mesParam)
    } catch (error) {
      console.error('Error exportando a PDF:', error)
      return { success: false, message: 'Error al exportar' }
    }
  },
  
  /**
   * Descargar PDF usando jsPDF
   */
  async downloadPDF(data, reportType, mes) {
    try {
      // Cargar jsPDF desde CDN
      if (!window.jspdf) {
        await this.loadJsPDF()
      }
      
      const { jsPDF } = window.jspdf
      const doc = new jsPDF()
      
      const monthName = new Date(mes + '-01').toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
      
      // Título
      doc.setFontSize(18)
      doc.setTextColor(217, 70, 239)
      doc.text('Encantos SPA', 105, 20, { align: 'center' })
      
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      const title = reportType === 'attendance' ? 'Reporte de Asistencia' : 
                    reportType === 'earnings' ? 'Reporte de Ganancias' : 
                    'Top Terapeutas del Mes'
      doc.text(title, 105, 30, { align: 'center' })
      
      doc.setFontSize(11)
      doc.setTextColor(100, 100, 100)
      doc.text(`Periodo: ${monthName}`, 105, 38, { align: 'center' })
      
      let yPos = 50
      
      switch (reportType) {
        case 'attendance':
          this.generateAttendancePDF(doc, data, yPos)
          break
        case 'earnings':
          this.generateEarningsPDF(doc, data, yPos)
          break
        case 'top':
          this.generateTopTherapistsPDF(doc, data, yPos)
          break
      }
      
      doc.save(`reporte-${reportType}-${mes}.pdf`)
      return { success: true, message: 'PDF descargado' }
    } catch (error) {
      console.error('Error generando PDF:', error)
      return { success: false, message: 'Error al generar PDF: ' + error.message }
    }
  },
  
  /**
   * Cargar librería jsPDF
   */
  async loadJsPDF() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('No se pudo cargar jsPDF'))
      document.head.appendChild(script)
    })
  },
  
  generateAttendancePDF(doc, data, startY) {
    let y = startY
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    
    // Headers
    doc.setFont(undefined, 'bold')
    doc.text('Terapeuta', 20, y)
    doc.text('Especialidad', 80, y)
    doc.text('Citas', 130, y)
    doc.text('Completadas', 155, y)
    doc.text('Tasa', 185, y)
    
    y += 7
    doc.setFont(undefined, 'normal')
    
    data.forEach((t, index) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      
      doc.text(t.nombre_completo.substring(0, 25), 20, y)
      doc.text(t.especialidad || 'N/A', 80, y)
      doc.text(String(t.total_citas), 130, y)
      doc.text(String(t.completadas), 155, y)
      doc.text((t.tasa_asistencia || 0) + '%', 185, y)
      y += 7
    })
  },
  
  generateEarningsPDF(doc, data, startY) {
    let y = startY
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    
    // Headers
    doc.setFont(undefined, 'bold')
    doc.text('Terapeuta', 20, y)
    doc.text('Citas', 100, y)
    doc.text('Ingresos', 130, y)
    doc.text('Comisión', 165, y)
    
    y += 7
    doc.setFont(undefined, 'normal')
    
    data.terapeutas.forEach((t, index) => {
      if (y > 250) {
        doc.addPage()
        y = 20
      }
      
      doc.text(t.nombre_completo.substring(0, 30), 20, y)
      doc.text(String(t.citas_completadas), 100, y)
      doc.text('S/ ' + parseFloat(t.ingresos_generados).toFixed(2), 130, y)
      doc.text('S/ ' + parseFloat(t.comision_terapeuta).toFixed(2), 165, y)
      y += 7
    })
    
    // Totales
    y += 10
    doc.setFont(undefined, 'bold')
    doc.setFontSize(11)
    doc.text('TOTALES:', 20, y)
    doc.text('Ingresos: S/ ' + parseFloat(data.totales.ingresos_generados).toFixed(2), 20, y + 7)
    doc.text('Comisiones: S/ ' + parseFloat(data.totales.comisiones_pagadas).toFixed(2), 20, y + 14)
    doc.text('Ganancia SPA: S/ ' + parseFloat(data.totales.ganancia_spa).toFixed(2), 20, y + 21)
  },
  
  generateTopTherapistsPDF(doc, data, startY) {
    let y = startY
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    
    data.forEach((t, index) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      
      const position = index + 1
      doc.setFont(undefined, 'bold')
      doc.text(`${position}. ${t.nombre_completo}`, 20, y)
      
      doc.setFont(undefined, 'normal')
      doc.text(`${t.especialidad || 'N/A'}`, 30, y + 5)
      doc.text(`Citas: ${t.citas_completadas} | Ingresos: S/ ${parseFloat(t.ingresos_generados).toFixed(2)} | Rating: ${t.rating_promedio ? parseFloat(t.rating_promedio).toFixed(1) : 'N/A'}`, 30, y + 10)
      
      y += 18
    })
  }






}

export default therapistReportsService