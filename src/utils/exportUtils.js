import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Exportar datos a Excel
 */
export const exportToExcel = (data, headers, filename) => {
  try {
    // Crear worksheet
    const ws = XLSX.utils.json_to_sheet(data, { header: headers })
    
    // Crear workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte')
    
    // Descargar archivo
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
    
    return true
  } catch (error) {
    console.error('Error exportando a Excel:', error)
    return false
  }
}

/**
 * Exportar datos a PDF
 */
export const exportToPDF = (data, columns, title, filename) => {
    try {
      const doc = new jsPDF('l', 'mm', 'a4')
      
      // Título
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(title, 14, 20)
      
      // Fecha
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, 14, 28)
      
      // Tabla usando autoTable directamente
      autoTable(doc, {
        startY: 35,
        head: [columns.map(col => col.header)],
        body: data.map(row => columns.map(col => col.dataKey(row))),
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [245, 158, 11],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        margin: { left: 14, right: 14 }
      })
      
      // Descargar
      doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`)
      
      return true
    } catch (error) {
      console.error('Error exportando a PDF:', error)
      return false
    }
  }

/**
 * Exportar a CSV (mantener funcionalidad existente)
 */
export const exportToCSV = (data, headers, filename) => {
  try {
    let csvContent = headers.join(',') + '\n'
    
    data.forEach(row => {
      csvContent += row.map(cell => {
        const cellStr = String(cell || '')
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`
        }
        return cellStr
      }).join(',') + '\n'
    })
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    return true
  } catch (error) {
    console.error('Error exportando a CSV:', error)
    return false
  }
}