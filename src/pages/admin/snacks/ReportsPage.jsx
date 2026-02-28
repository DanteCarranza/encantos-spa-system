import React, { useState, useEffect } from 'react'
import {
  FiTrendingUp,
  FiPackage,
  FiDollarSign,
  FiShoppingCart,
  FiCalendar,
  FiDownload,
  FiPieChart,
  FiBarChart2,
  FiMapPin 
} from 'react-icons/fi'
import reportsService from '../../../services/snacks/reportsService'
import Swal from 'sweetalert2'
import './ReportsPage.css'
import { exportToExcel, exportToPDF, exportToCSV } from '../../../utils/exportUtils'

const ReportsPage = () => {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ventas')
  const [dateRange, setDateRange] = useState({
    desde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0]
  })
  
  // Estados para reportes
  const [salesReport, setSalesReport] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [stockReport, setStockReport] = useState(null)
  const [categoriesReport, setCategoriesReport] = useState([])
  const [detailedSales, setDetailedSales] = useState([])

  const [locationReport, setLocationReport] = useState(null) 
  

  useEffect(() => {
    loadReports()
  }, [dateRange, activeTab])

  const loadReports = async () => {
    setLoading(true)
    try {
      if (activeTab === 'ventas') {
        const result = await reportsService.getSalesReport(dateRange.desde, dateRange.hasta)
        if (result.success) {
          setSalesReport(result.data)
        }
      } else if (activeTab === 'productos') {
        const result = await reportsService.getTopProducts(dateRange.desde, dateRange.hasta)
        if (result.success) {
          setTopProducts(result.data)
        }
      } else if (activeTab === 'stock') {
        const result = await reportsService.getStockReport()
        if (result.success) {
          setStockReport(result.data)
        }
      } else if (activeTab === 'categorias') {
        const result = await reportsService.getCategoriesReport(dateRange.desde, dateRange.hasta)
        if (result.success) {
          setCategoriesReport(result.data)
        }
      }
      else if (activeTab === 'detalle') {
        const result = await reportsService.getDetailedSales(dateRange.desde, dateRange.hasta)
        if (result.success) {
          setDetailedSales(result.data)
        }
      }

      else if (activeTab === 'ubicaciones') {
        const result = await reportsService.getSalesLocationReport(dateRange.desde, dateRange.hasta)
        if (result.success) {
          setLocationReport(result.data)
        }
      }


    } catch (error) {
      console.error('Error loading reports:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar reportes'
      })
    } finally {
      setLoading(false)
    }
  }

  const adjustTimezone = (datetime) => {
    // La BD guarda en hora de servidor (que ya está en hora local)
    // Solo necesitamos formatear
    const date = new Date(datetime)
    
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    
    return `${hours}:${minutes}`
  }
  
  const formatFecha = (datetime) => {
    const date = new Date(datetime)
    
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    
    return `${day}/${month}/${year}`
  }

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatCurrency = (amount) => {
    return `S/ ${parseFloat(amount || 0).toFixed(2)}`
  }

  const formatDate = (date) => {
    // date viene como "2026-02-07" desde el API
    const [year, month, day] = date.split('-')
    return `${day}/${month}/${year}`
  }

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin Datos',
        text: 'No hay datos para exportar'
      })
      return
    }
  
    try {
      let csvContent = ''
      let headers = []
      let rows = []
  
      // Determinar headers y rows según el tipo de reporte
      if (filename === 'ventas') {
        headers = ['Fecha', 'Total Ventas', 'Ingresos', 'Efectivo', 'Yape/Plin', 'Ticket Promedio']
        rows = data.map(row => [
          formatDate(row.fecha),
          row.total_ventas,
          row.total_ingresos,
          row.efectivo,
          row.yape_plin,
          row.ticket_promedio
        ])
      } else if (filename === 'productos') {
        headers = ['#', 'Código', 'Producto', 'Categoría', 'Cantidad Vendida', 'Ingresos', 'Nº Ventas']
        rows = data.map((row, index) => [
          index + 1,
          row.codigo,
          row.nombre,
          row.categoria,
          row.cantidad_vendida,
          row.ingresos_generados,
          row.numero_ventas
        ])
      } else if (filename === 'stock') {
        headers = ['Código', 'Producto', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Precio', 'Valor Stock', 'Nivel']
        rows = data.map(row => [
          row.codigo,
          row.nombre,
          row.categoria,
          row.stock_actual,
          row.stock_minimo,
          row.precio_venta,
          row.valor_stock,
          row.nivel_stock
        ])
      }
  
      // Crear CSV
      csvContent = headers.join(',') + '\n'
      rows.forEach(row => {
        csvContent += row.map(cell => {
          // Escapar comas y comillas
          const cellStr = String(cell || '')
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        }).join(',') + '\n'
      })
  
      // Crear y descargar archivo
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `reporte_${filename}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
  
      Swal.fire({
        icon: 'success',
        title: '¡Exportado!',
        text: 'El archivo CSV se descargó correctamente',
        timer: 2000,
        confirmButtonColor: '#f59e0b'
      })
    } catch (error) {
      console.error('Error al exportar:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al exportar el archivo'
      })
    }
  }



  const handleExportSales = (format) => {
    if (!salesReport?.datos || salesReport.datos.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin Datos',
        text: 'No hay datos para exportar'
      })
      return
    }
  
    try {
      if (format === 'excel') {
        const excelData = salesReport.datos.map(row => ({
          'Fecha': formatDate(row.fecha),
          'Total Ventas': row.total_ventas,
          'Ingresos': parseFloat(row.total_ingresos),
          'Efectivo': parseFloat(row.efectivo),
          'Yape/Plin': parseFloat(row.yape_plin),
          'Tarjeta': parseFloat(row.tarjeta),
          'Ticket Promedio': parseFloat(row.ticket_promedio)
        }))
  
        const success = exportToExcel(
          excelData,
          ['Fecha', 'Total Ventas', 'Ingresos', 'Efectivo', 'Yape/Plin', 'Tarjeta', 'Ticket Promedio'],
          'reporte_ventas'
        )
  
        if (success) {
          Swal.fire({
            icon: 'success',
            title: '¡Exportado!',
            text: 'Reporte exportado a Excel',
            timer: 2000,
            confirmButtonColor: '#f59e0b'
          })
        }
      } else if (format === 'pdf') {
        const columns = [
          { header: 'Fecha', dataKey: (row) => formatDate(row.fecha) },
          { header: 'Ventas', dataKey: (row) => row.total_ventas },
          { header: 'Ingresos', dataKey: (row) => formatCurrency(row.total_ingresos) },
          { header: 'Efectivo', dataKey: (row) => formatCurrency(row.efectivo) },
          { header: 'Yape/Plin', dataKey: (row) => formatCurrency(row.yape_plin) },
          { header: 'Tarjeta', dataKey: (row) => formatCurrency(row.tarjeta) },
          { header: 'Ticket Prom.', dataKey: (row) => formatCurrency(row.ticket_promedio) }
        ]
  
        const success = exportToPDF(
          salesReport.datos,
          columns,
          `Reporte de Ventas - ${formatDate(dateRange.desde)} al ${formatDate(dateRange.hasta)}`,
          'reporte_ventas'
        )
  
        if (success) {
          Swal.fire({
            icon: 'success',
            title: '¡Exportado!',
            text: 'Reporte exportado a PDF',
            timer: 2000,
            confirmButtonColor: '#f59e0b'
          })
        }
      }
    } catch (error) {
      console.error('Error al exportar:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al exportar el archivo'
      })
    }
  }
  
  const handleExportProducts = (format) => {
    if (!topProducts || topProducts.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin Datos',
        text: 'No hay datos para exportar'
      })
      return
    }
  
    try {
      if (format === 'excel') {
        const excelData = topProducts.map((row, index) => ({
          '#': index + 1,
          'Código': row.codigo,
          'Producto': row.nombre,
          'Categoría': row.categoria,
          'Cantidad Vendida': parseFloat(row.cantidad_vendida),
          'Ingresos': parseFloat(row.ingresos_generados),
          'Nº Ventas': row.numero_ventas
        }))
  
        const success = exportToExcel(
          excelData,
          ['#', 'Código', 'Producto', 'Categoría', 'Cantidad Vendida', 'Ingresos', 'Nº Ventas'],
          'productos_mas_vendidos'
        )
  
        if (success) {
          Swal.fire({
            icon: 'success',
            title: '¡Exportado!',
            text: 'Reporte exportado a Excel',
            timer: 2000,
            confirmButtonColor: '#f59e0b'
          })
        }
      } else if (format === 'pdf') {
        const columns = [
          { header: '#', dataKey: (row, index) => index + 1 },
          { header: 'Código', dataKey: (row) => row.codigo },
          { header: 'Producto', dataKey: (row) => row.nombre },
          { header: 'Categoría', dataKey: (row) => row.categoria },
          { header: 'Cant. Vendida', dataKey: (row) => row.cantidad_vendida },
          { header: 'Ingresos', dataKey: (row) => formatCurrency(row.ingresos_generados) },
          { header: 'Nº Ventas', dataKey: (row) => row.numero_ventas }
        ]
  
        const dataWithIndex = topProducts.map((row, index) => ({ ...row, index }))
  
        const success = exportToPDF(
          dataWithIndex,
          columns,
          `Productos Más Vendidos - ${formatDate(dateRange.desde)} al ${formatDate(dateRange.hasta)}`,
          'productos_mas_vendidos'
        )
  
        if (success) {
          Swal.fire({
            icon: 'success',
            title: '¡Exportado!',
            text: 'Reporte exportado a PDF',
            timer: 2000,
            confirmButtonColor: '#f59e0b'
          })
        }
      }
    } catch (error) {
      console.error('Error al exportar:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al exportar el archivo'
      })
    }
  }
  
  const handleExportStock = (format) => {
    if (!stockReport?.datos || stockReport.datos.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin Datos',
        text: 'No hay datos para exportar'
      })
      return
    }
  
    try {
      if (format === 'excel') {
        const excelData = stockReport.datos.map(row => ({
          'Código': row.codigo,
          'Producto': row.nombre,
          'Categoría': row.categoria,
          'Stock Actual': row.stock_actual,
          'Stock Mínimo': row.stock_minimo,
          'Precio': parseFloat(row.precio_venta),
          'Valor Stock': parseFloat(row.valor_stock),
          'Nivel': row.nivel_stock
        }))
  
        const success = exportToExcel(
          excelData,
          ['Código', 'Producto', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Precio', 'Valor Stock', 'Nivel'],
          'reporte_stock'
        )
  
        if (success) {
          Swal.fire({
            icon: 'success',
            title: '¡Exportado!',
            text: 'Reporte exportado a Excel',
            timer: 2000,
            confirmButtonColor: '#f59e0b'
          })
        }
      } else if (format === 'pdf') {
        const columns = [
          { header: 'Código', dataKey: (row) => row.codigo },
          { header: 'Producto', dataKey: (row) => row.nombre },
          { header: 'Categoría', dataKey: (row) => row.categoria },
          { header: 'Stock Act.', dataKey: (row) => row.stock_actual },
          { header: 'Stock Mín.', dataKey: (row) => row.stock_minimo },
          { header: 'Precio', dataKey: (row) => formatCurrency(row.precio_venta) },
          { header: 'Valor Stock', dataKey: (row) => formatCurrency(row.valor_stock) },
          { header: 'Nivel', dataKey: (row) => row.nivel_stock }
        ]
  
        const success = exportToPDF(
          stockReport.datos,
          columns,
          'Reporte de Stock',
          'reporte_stock'
        )
  
        if (success) {
          Swal.fire({
            icon: 'success',
            title: '¡Exportado!',
            text: 'Reporte exportado a PDF',
            timer: 2000,
            confirmButtonColor: '#f59e0b'
          })
        }
      }
    } catch (error) {
      console.error('Error al exportar:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al exportar el archivo'
      })
    }
  }



  const handleExportCategories = (format) => {
    if (!categoriesReport || categoriesReport.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin Datos',
        text: 'No hay datos para exportar'
      })
      return
    }
  
    try {
      if (format === 'excel') {
        const excelData = categoriesReport.map(row => ({
          'Categoría': row.categoria,
          'Total Productos': row.total_productos || 0,
          'Cantidad Vendida': parseFloat(row.cantidad_vendida || 0),
          'Ingresos': parseFloat(row.ingresos_generados || 0)
        }))
  
        const success = exportToExcel(
          excelData,
          ['Categoría', 'Total Productos', 'Cantidad Vendida', 'Ingresos'],
          'reporte_categorias'
        )
  
        if (success) {
          Swal.fire({
            icon: 'success',
            title: '¡Exportado!',
            text: 'Reporte exportado a Excel',
            timer: 2000,
            confirmButtonColor: '#f59e0b'
          })
        }
      } else if (format === 'pdf') {
        const columns = [
          { header: 'Categoría', dataKey: (row) => row.categoria },
          { header: 'Total Productos', dataKey: (row) => row.total_productos || 0 },
          { header: 'Cant. Vendida', dataKey: (row) => row.cantidad_vendida || 0 },
          { header: 'Ingresos', dataKey: (row) => formatCurrency(row.ingresos_generados || 0) }
        ]
  
        const success = exportToPDF(
          categoriesReport,
          columns,
          `Reporte por Categorías - ${formatDate(dateRange.desde)} al ${formatDate(dateRange.hasta)}`,
          'reporte_categorias'
        )
  
        if (success) {
          Swal.fire({
            icon: 'success',
            title: '¡Exportado!',
            text: 'Reporte exportado a PDF',
            timer: 2000,
            confirmButtonColor: '#f59e0b'
          })
        }
      }
    } catch (error) {
      console.error('Error al exportar:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al exportar el archivo'
      })
    }
  }
  
  const handleExportDetailed = (format) => {
    if (!detailedSales || detailedSales.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin Datos',
        text: 'No hay datos para exportar'
      })
      return
    }
  
    try {
      if (format === 'excel') {
        const excelData = []
        
        detailedSales.forEach(venta => {
          if (venta.items && venta.items.length > 0) {
            venta.items.forEach(item => {
              excelData.push({
                'Código': venta.numero_venta,
                'Fecha': formatFecha(venta.fecha_hora),
                'Hora': adjustTimezone(venta.fecha_hora),
                'Producto': item.producto,
                'Cantidad': item.cantidad,
                'Método Pago': venta.metodo_pago,
                'Nº Operación': venta.numero_operacion || '',
                'Cliente': venta.cliente_nombre || '',
                'Vendedor': venta.vendedor,
                'Total': parseFloat(venta.total)
              })
            })
          }
        })
  
        const success = exportToExcel(
          excelData,
          ['Código', 'Fecha', 'Hora', 'Producto', 'Cantidad', 'Método Pago', 'Nº Operación', 'Cliente', 'Vendedor', 'Total'],
          'detalle_ventas'
        )
  
        if (success) {
          Swal.fire({
            icon: 'success',
            title: '¡Exportado!',
            text: 'Reporte exportado a Excel',
            timer: 2000,
            confirmButtonColor: '#f59e0b'
          })
        }
      } else if (format === 'pdf') {
        const columns = [
          { header: 'Código', dataKey: (row) => row.numero_venta },
          { header: 'Fecha', dataKey: (row) => formatFecha(row.fecha_hora) },
          { header: 'Hora', dataKey: (row) => adjustTimezone(row.fecha_hora) },
          { header: 'Productos', dataKey: (row) => row.items?.length ? `${row.items.length} item(s)` : '-' },
          { header: 'Método', dataKey: (row) => row.metodo_pago },
          { header: 'Cliente', dataKey: (row) => row.cliente_nombre || '-' },
          { header: 'Total', dataKey: (row) => formatCurrency(row.total) }
        ]
  
        const success = exportToPDF(
          detailedSales,
          columns,
          `Detalle de Ventas - ${formatDate(dateRange.desde)} al ${formatDate(dateRange.hasta)}`,
          'detalle_ventas'
        )
  
        if (success) {
          Swal.fire({
            icon: 'success',
            title: '¡Exportado!',
            text: 'Reporte exportado a PDF',
            timer: 2000,
            confirmButtonColor: '#f59e0b'
          })
        }
      }
    } catch (error) {
      console.error('Error al exportar:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al exportar el archivo'
      })
    }
  }
  



  const exportDetailedSales = () => {
    if (!detailedSales || detailedSales.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin Datos',
        text: 'No hay datos para exportar'
      })
      return
    }
  
    try {
      const headers = ['Código', 'Fecha', 'Hora', 'Productos', 'Cantidad', 'Método Pago', 'Nº Operación', 'Cliente', 'Vendedor', 'Total']
      const rows = []
  
      detailedSales.forEach(venta => {
        if (venta.items && venta.items.length > 0) {
          venta.items.forEach(item => {
            rows.push([
              venta.numero_venta,
              venta.fecha,
              venta.hora,
              item.producto,
              item.cantidad,
              venta.metodo_pago,
              venta.numero_operacion || '',
              venta.cliente_nombre || '',
              venta.vendedor,
              venta.total
            ])
          })
        } else {
          rows.push([
            venta.numero_venta,
            venta.fecha,
            venta.hora,
            'Sin items',
            0,
            venta.metodo_pago,
            venta.numero_operacion || '',
            venta.cliente_nombre || '',
            venta.vendedor,
            venta.total
          ])
        }
      })
  
      let csvContent = headers.join(',') + '\n'
      rows.forEach(row => {
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
      link.setAttribute('download', `detalle_ventas_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
  
      Swal.fire({
        icon: 'success',
        title: '¡Exportado!',
        text: 'El archivo CSV se descargó correctamente',
        timer: 2000,
        confirmButtonColor: '#f59e0b'
      })
    } catch (error) {
      console.error('Error al exportar:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al exportar el archivo'
      })
    }
  }

  if (loading && !salesReport && !topProducts.length && !stockReport && !categoriesReport.length) {
    return (
      <div className="reports-loading">
        <div className="spinner-large"></div>
        <p>Cargando reportes...</p>
      </div>
    )
  }

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h1 className="page-title">
            <FiBarChart2 />
            Reportes y Estadísticas
          </h1>
          <p className="page-subtitle">Análisis de ventas, productos y stock</p>
        </div>
      </div>

      {/* Filters */}
      <div className="reports-filters">
        <div className="date-range-picker">
          <div className="date-input-group">
            <label>
              <FiCalendar />
              Desde
            </label>
            <input
              type="date"
              value={dateRange.desde}
              onChange={(e) => handleDateChange('desde', e.target.value)}
              max={dateRange.hasta}
            />
          </div>
          <div className="date-input-group">
            <label>
              <FiCalendar />
              Hasta
            </label>
            <input
              type="date"
              value={dateRange.hasta}
              onChange={(e) => handleDateChange('hasta', e.target.value)}
              min={dateRange.desde}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="quick-dates">
          <button
            className="btn-quick-date"
            onClick={() => setDateRange({
              desde: new Date().toISOString().split('T')[0],
              hasta: new Date().toISOString().split('T')[0]
            })}
          >
            Hoy
          </button>
          <button
            className="btn-quick-date"
            onClick={() => setDateRange({
              desde: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              hasta: new Date().toISOString().split('T')[0]
            })}
          >
            Última Semana
          </button>
          <button
            className="btn-quick-date"
            onClick={() => setDateRange({
              desde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              hasta: new Date().toISOString().split('T')[0]
            })}
          >
            Último Mes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="reports-tabs">
        <button
          className={`tab-btn ${activeTab === 'ventas' ? 'active' : ''}`}
          onClick={() => setActiveTab('ventas')}
        >
          <FiDollarSign />
          Ventas
        </button>
        <button
          className={`tab-btn ${activeTab === 'productos' ? 'active' : ''}`}
          onClick={() => setActiveTab('productos')}
        >
          <FiPackage />
          Productos
        </button>
        <button
          className={`tab-btn ${activeTab === 'stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('stock')}
        >
          <FiTrendingUp />
          Stock
        </button>
        <button
          className={`tab-btn ${activeTab === 'categorias' ? 'active' : ''}`}
          onClick={() => setActiveTab('categorias')}
        >
          <FiPieChart />
          Categorías
        </button>


        <button
  className={`tab-btn ${activeTab === 'ubicaciones' ? 'active' : ''}`}
  onClick={() => setActiveTab('ubicaciones')}
>
  <FiMapPin />
  Por Ubicación
</button>

        <button
  className={`tab-btn ${activeTab === 'detalle' ? 'active' : ''}`}
  onClick={() => setActiveTab('detalle')}
>
  <FiShoppingCart />
  Detalle Ventas
</button>
      </div>

    
      {/* Tab Content */}
      <div className="reports-content">
        {/* Reporte de Ventas */}
        {activeTab === 'ventas' && salesReport && (
          <div className="report-section">
            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card primary">
                <div className="card-icon">
                  <FiShoppingCart />
                </div>
                <div className="card-content">
                  <div className="card-label">Total Ventas</div>
                  <div className="card-value">{salesReport.totales?.total_ventas || 0}</div>
                </div>
              </div>

              <div className="summary-card success">
                <div className="card-icon">
                  <FiDollarSign />
                </div>
                <div className="card-content">
                  <div className="card-label">Ingresos Totales</div>
                  <div className="card-value">{formatCurrency(salesReport.totales?.total_ingresos)}</div>
                </div>
              </div>

              <div className="summary-card warning">
                <div className="card-icon">
                  <FiDollarSign />
                </div>
                <div className="card-content">
                  <div className="card-label">Efectivo</div>
                  <div className="card-value">{formatCurrency(salesReport.totales?.efectivo)}</div>
                </div>
              </div>

              <div className="summary-card info">
                <div className="card-icon">
                  <FiTrendingUp />
                </div>
                <div className="card-content">
                  <div className="card-label">Ticket Promedio</div>
                  <div className="card-value">{formatCurrency(salesReport.totales?.ticket_promedio)}</div>
                </div>
              </div>
            </div>

            {/* Sales Table */}
            <div className="report-table-container">
              <div className="table-header">
                <h3>Detalle por Día</h3>
                <div className="export-buttons">
    <button className="btn-export excel" onClick={() => handleExportSales('excel')}>
      <FiDownload />
      Excel
    </button>
    <button className="btn-export pdf" onClick={() => handleExportSales('pdf')}>
      <FiDownload />
      PDF
    </button>
  </div>
</div>

              <table className="report-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Total Ventas</th>
                    <th>Ingresos</th>
                    <th>Efectivo</th>
                    <th>Yape/Plin</th>
                    <th>Tarjeta</th>
                    <th>Ticket Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReport.datos?.map((row, index) => (
                    <tr key={index}>
                      <td>{formatDate(row.fecha)}</td>
                      <td className="text-center">{row.total_ventas}</td>
                      <td className="text-right highlight">{formatCurrency(row.total_ingresos)}</td>
                      <td className="text-right">{formatCurrency(row.efectivo)}</td>
                      <td className="text-right">{formatCurrency(row.yape_plin)}</td>
                      <td className="text-right">{formatCurrency(row.tarjeta)}</td>
                      <td className="text-right">{formatCurrency(row.ticket_promedio)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {(!salesReport.datos || salesReport.datos.length === 0) && (
                <div className="empty-report">
                  <FiBarChart2 />
                  <p>No hay datos en el período seleccionado</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reporte de Productos */}
        {activeTab === 'productos' && (
          <div className="report-section">
            <div className="report-table-container">
              <div className="table-header">
                <h3>Productos Más Vendidos</h3>
                <div className="export-buttons">
    <button className="btn-export excel" onClick={() => handleExportProducts('excel')}>
      <FiDownload />
      Excel
    </button>
    <button className="btn-export pdf" onClick={() => handleExportProducts('pdf')}>
      <FiDownload />
      PDF
    </button>
  </div>
</div>

              <table className="report-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Cantidad Vendida</th>
                    <th>Ingresos</th>
                    <th>Nº Ventas</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={product.id}>
                      <td className="rank">
                        {index + 1 <= 3 ? (
                          <span className={`medal medal-${index + 1}`}>
                            {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : '🥉'}
                          </span>
                        ) : (
                          <span className="rank-number">{index + 1}</span>
                        )}
                      </td>
                      <td className="code">{product.codigo}</td>
                      <td className="product-name">{product.nombre}</td>
                      <td>{product.categoria}</td>
                      <td className="text-center highlight">{product.cantidad_vendida}</td>
                      <td className="text-right">{formatCurrency(product.ingresos_generados)}</td>
                      <td className="text-center">{product.numero_ventas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {topProducts.length === 0 && (
                <div className="empty-report">
                  <FiPackage />
                  <p>No hay datos de productos en el período seleccionado</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reporte de Stock */}
        {activeTab === 'stock' && stockReport && (
          <div className="report-section">
            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card primary">
                <div className="card-icon">
                  <FiPackage />
                </div>
                <div className="card-content">
                  <div className="card-label">Total Productos</div>
                  <div className="card-value">{stockReport.resumen?.total_productos || 0}</div>
                </div>
              </div>

              <div className="summary-card success">
                <div className="card-icon">
                  <FiTrendingUp />
                </div>
                <div className="card-content">
                  <div className="card-label">Total Unidades</div>
                  <div className="card-value">{stockReport.resumen?.total_unidades || 0}</div>
                </div>
              </div>

              <div className="summary-card info">
                <div className="card-icon">
                  <FiDollarSign />
                </div>
                <div className="card-content">
                  <div className="card-label">Valor Total</div>
                  <div className="card-value">{formatCurrency(stockReport.resumen?.valor_total)}</div>
                </div>
              </div>

              <div className="summary-card danger">
                <div className="card-icon">
                  <FiTrendingUp />
                </div>
                <div className="card-content">
                  <div className="card-label">Stock Bajo</div>
                  <div className="card-value">{stockReport.resumen?.productos_bajo_stock || 0}</div>
                </div>
              </div>
            </div>

            {/* Stock Table */}
            <div className="report-table-container">
              <div className="table-header">
                <h3>Inventario de Productos</h3>
                <div className="export-buttons">
    <button className="btn-export excel" onClick={() => handleExportStock('excel')}>
      <FiDownload />
      Excel
    </button>
    <button className="btn-export pdf" onClick={() => handleExportStock('pdf')}>
      <FiDownload />
      PDF
    </button>
  </div>
</div>

              <table className="report-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Stock Actual</th>
                    <th>Stock Mínimo</th>
                    <th>Precio</th>
                    <th>Valor Stock</th>
                    <th>Nivel</th>
                  </tr>
                </thead>
                <tbody>
                  {stockReport.datos?.map(product => (
                    <tr key={product.id} className={product.nivel_stock === 'BAJO' ? 'row-warning' : ''}>
                      <td className="code">{product.codigo}</td>
                      <td className="product-name">{product.nombre}</td>
                      <td>{product.categoria}</td>
                      <td className="text-center highlight">{product.stock_actual}</td>
                      <td className="text-center">{product.stock_minimo}</td>
                      <td className="text-right">{formatCurrency(product.precio_venta)}</td>
                      <td className="text-right">{formatCurrency(product.valor_stock)}</td>
                      <td>
                        <span className={`stock-level ${product.nivel_stock.toLowerCase()}`}>
                          {product.nivel_stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {(!stockReport.datos || stockReport.datos.length === 0) && (
                <div className="empty-report">
                  <FiPackage />
                  <p>No hay productos registrados</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reporte de Categorías */}
        {activeTab === 'categorias' && (
          <div className="report-section">

<div className="section-header-with-export">
      <h3>Ventas por Categoría</h3>
      <div className="export-buttons">
        <button className="btn-export excel" onClick={() => handleExportCategories('excel')}>
          <FiDownload />
          Excel
        </button>
        <button className="btn-export pdf" onClick={() => handleExportCategories('pdf')}>
          <FiDownload />
          PDF
        </button>
      </div>
    </div>
            <div className="categories-grid">

              {categoriesReport.map(category => (
                <div key={category.id} className="category-card">
                  <div className="category-icon">{category.icono}</div>
                  <div className="category-info">
                    <h3>{category.categoria}</h3>
                    <div className="category-stats">
                      <div className="stat-item">
                        <span className="stat-label">Productos:</span>
                        <span className="stat-value">{category.total_productos || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Vendidos:</span>
                        <span className="stat-value">{category.cantidad_vendida || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Ingresos:</span>
                        <span className="stat-value highlight">{formatCurrency(category.ingresos_generados)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {categoriesReport.length === 0 && (
              <div className="empty-report">
                <FiPieChart />
                <p>No hay datos de categorías</p>
              </div>
            )}
          </div>
        )}



{/* Reporte de Ubicaciones */}
{activeTab === 'ubicaciones' && locationReport && (
  <div className="report-section">
    {/* Summary Cards */}
    <div className="summary-cards">
      <div className="summary-card primary">
        <div className="card-icon">
          <FiShoppingCart />
        </div>
        <div className="card-content">
          <div className="card-label">Total Ventas</div>
          <div className="card-value">{locationReport.totales?.total_ventas || 0}</div>
        </div>
      </div>

      <div className="summary-card success">
        <div className="card-icon">
          <FiDollarSign />
        </div>
        <div className="card-content">
          <div className="card-label">Ingresos Totales</div>
          <div className="card-value">{formatCurrency(locationReport.totales?.ingresos_totales)}</div>
        </div>
      </div>

      <div className="summary-card info">
        <div className="card-icon">
          <FiTrendingUp />
        </div>
        <div className="card-content">
          <div className="card-label">Ticket Promedio</div>
          <div className="card-value">{formatCurrency(locationReport.totales?.ticket_promedio)}</div>
        </div>
      </div>
    </div>

    {/* Resumen por Ubicación */}
    <div className="locations-summary">
      {locationReport.resumen?.map(ubicacion => (
        <div key={ubicacion.id} className="location-card">
          <div className="location-header" style={{ borderColor: ubicacion.color }}>
            <h3>
              {ubicacion.codigo === 'ACADEMIA' && '🎓'}
              {ubicacion.codigo === 'SPA' && '💆'}
              {ubicacion.codigo === 'CENTRAL' && '📦'}
              {ubicacion.ubicacion}
            </h3>
            <span className="location-badge" style={{ backgroundColor: `${ubicacion.color}20`, color: ubicacion.color }}>
              {ubicacion.codigo}
            </span>
          </div>
          
          <div className="location-stats-grid">
            <div className="stat">
              <span className="stat-label">Ventas</span>
              <span className="stat-value">{ubicacion.total_ventas || 0}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Ingresos</span>
              <span className="stat-value highlight">{formatCurrency(ubicacion.ingresos_totales)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Ticket Prom.</span>
              <span className="stat-value">{formatCurrency(ubicacion.ticket_promedio)}</span>
            </div>
          </div>

          <div className="payment-breakdown">
            <div className="payment-item">
              <span>💵 Efectivo:</span>
              <span>{formatCurrency(ubicacion.efectivo)}</span>
            </div>
            <div className="payment-item">
              <span>📱 Yape/Plin:</span>
              <span>{formatCurrency(ubicacion.yape_plin)}</span>
            </div>
            <div className="payment-item">
              <span>💳 Tarjeta:</span>
              <span>{formatCurrency(ubicacion.tarjeta)}</span>
            </div>
          </div>

          {/* Top 3 Productos */}
          {locationReport.productos_por_ubicacion?.[ubicacion.id] && (
            <div className="top-products">
              <h4>Top 3 Productos:</h4>
              <div className="products-list">
                {locationReport.productos_por_ubicacion[ubicacion.id].slice(0, 3).map((prod, idx) => (
                  <div key={idx} className="product-item-small">
                    <span className="rank">{idx + 1}.</span>
                    <span className="product-name-small">{prod.producto}</span>
                    <span className="product-qty">x{prod.cantidad_vendida}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>

    {locationReport.resumen?.length === 0 && (
      <div className="empty-report">
        <FiMapPin />
        <p>No hay datos de ubicaciones en el período seleccionado</p>
      </div>
    )}
  </div>
)}


{/* Detalle de Ventas */}
{activeTab === 'detalle' && (
  <div className="report-section">
    <div className="report-table-container">
      <div className="table-header">
        <h3>Detalle de Ventas ({detailedSales.length})</h3>
        <div className="export-buttons">
    <button className="btn-export excel" onClick={() => handleExportDetailed('excel')}>
      <FiDownload />
      Excel
    </button>
    <button className="btn-export pdf" onClick={() => handleExportDetailed('pdf')}>
      <FiDownload />
      PDF
    </button>
  </div>
</div>


      <table className="report-table detailed-sales-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Productos</th>
            <th>Método Pago</th>
            <th>Cliente</th>
            <th>Vendedor</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {detailedSales.map(venta => (
            <tr key={venta.id}>
              <td>
                <span className="sale-code">{venta.numero_venta}</span>
              </td>
              <td>{formatFecha(venta.fecha_hora)}</td>
<td className="time-cell">{adjustTimezone(venta.fecha_hora)}</td>
              <td>
                <div className="products-cell">
                  {venta.items && venta.items.length > 0 && (
                    venta.items.length === 1 ? (
                      <div className="product-item">
                        <span className="product-name">{venta.items[0].producto}</span>
                        <span className="product-qty">x{venta.items[0].cantidad}</span>
                      </div>
                    ) : (
                      <div className="multiple-products">
                        <span className="products-count">{venta.items.length} productos</span>
                        <div className="products-tooltip">
                          {venta.items.map((item, idx) => (
                            <div key={idx} className="tooltip-product">
                              <span>{item.producto}</span>
                              <span className="tooltip-qty">x{item.cantidad}</span>
                              <span className="tooltip-price">S/ {parseFloat(item.subtotal).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </td>
              <td>
                <span className={`payment-badge ${venta.metodo_pago.toLowerCase()}`}>
                  {venta.metodo_pago === 'EFECTIVO' ? '💵 Efectivo' :
                   venta.metodo_pago === 'YAPE_PLIN' ? '📱 Yape/Plin' :
                   venta.metodo_pago === 'TARJETA' ? '💳 Tarjeta' :
                   venta.metodo_pago}
                </span>
                {venta.numero_operacion && (
                  <div className="operation-number">Op: {venta.numero_operacion}</div>
                )}
              </td>
              <td>
                <span className="customer-name">{venta.cliente_nombre || '-'}</span>
              </td>
              <td>
                <span className="vendor-name">{venta.vendedor}</span>
              </td>
              <td className="text-right">
                <span className="sale-amount">{formatCurrency(venta.total)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {detailedSales.length === 0 && (
        <div className="empty-report">
          <FiShoppingCart />
          <p>No hay ventas en el período seleccionado</p>
        </div>
      )}
    </div>
  </div>
)}


      </div>
    </div>
  )
}

export default ReportsPage