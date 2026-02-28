const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encantos.pe/spa/backend/api'

const reservaTerapeutasService = {
  /**
   * Obtener terapeutas asignados a una reserva
   */
  async getTerapeutasByReserva(reservaId) {
    try {
      const response = await fetch(`${API_BASE_URL}/reservas_terapeutas.php?reserva_id=${reservaId}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error obteniendo terapeutas de reserva:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Agregar terapeuta a una reserva
   */
  async addTerapeutaToReserva(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/reservas_terapeutas.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return await response.json()
    } catch (error) {
      console.error('Error agregando terapeuta:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Actualizar comisión de un terapeuta
   */
  async updateTerapeutaComision(id, porcentajeComision) {
    try {
      const response = await fetch(`${API_BASE_URL}/reservas_terapeutas.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          porcentaje_comision: porcentajeComision 
        })
      })
      return await response.json()
    } catch (error) {
      console.error('Error actualizando comisión:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Remover terapeuta de una reserva
   */
  async removeTerapeutaFromReserva(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/reservas_terapeutas.php?id=${id}`, {
        method: 'DELETE'
      })
      return await response.json()
    } catch (error) {
      console.error('Error removiendo terapeuta:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Obtener resumen de comisiones por reserva
   */
  async getComisionesByReserva(reservaId) {
    try {
      const result = await this.getTerapeutasByReserva(reservaId)
      
      if (!result.success || !result.data) {
        return {
          success: false,
          message: 'No se pudieron obtener las comisiones'
        }
      }

      const terapeutas = result.data
      const totalComision = terapeutas.reduce((sum, t) => {
        return sum + parseFloat(t.porcentaje_comision || 0)
      }, 0)

      const totalMonto = terapeutas.reduce((sum, t) => {
        return sum + parseFloat(t.monto_comision || 0)
      }, 0)

      return {
        success: true,
        data: {
          terapeutas,
          total_porcentaje: totalComision,
          total_monto: totalMonto,
          porcentaje_restante: 100 - totalComision
        }
      }
    } catch (error) {
      console.error('Error obteniendo resumen de comisiones:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Validar que las comisiones no excedan el 100%
   */
  validateComisiones(comisiones) {
    const total = Object.values(comisiones).reduce((sum, val) => sum + parseFloat(val), 0)
    
    return {
      valid: total <= 100,
      total: total,
      restante: 100 - total,
      exceso: total > 100 ? total - 100 : 0
    }
  },

  /**
   * Calcular monto de comisión
   */
  calcularMontoComision(precioTotal, porcentaje) {
    return (parseFloat(precioTotal) * parseFloat(porcentaje)) / 100
  },

  /**
   * Asignar múltiples terapeutas en una sola operación
   */
  async asignarMultiplesTerapeutas(reservaId, terapeutas) {
    try {
      // terapeutas es un array de { terapeuta_id, porcentaje_comision }
      const promesas = terapeutas.map(t => 
        this.addTerapeutaToReserva({
          reserva_id: reservaId,
          terapeuta_id: t.terapeuta_id,
          porcentaje_comision: t.porcentaje_comision
        })
      )

      const resultados = await Promise.all(promesas)
      
      const todosExitosos = resultados.every(r => r.success)
      
      if (todosExitosos) {
        return {
          success: true,
          message: `${terapeutas.length} terapeuta(s) asignado(s) correctamente`,
          data: resultados
        }
      } else {
        return {
          success: false,
          message: 'Algunos terapeutas no pudieron ser asignados',
          data: resultados
        }
      }
    } catch (error) {
      console.error('Error asignando múltiples terapeutas:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Actualizar múltiples comisiones en una sola operación
   */
  async actualizarMultiplesComisiones(actualizaciones) {
    try {
      // actualizaciones es un array de { id, porcentaje_comision }
      const promesas = actualizaciones.map(a => 
        this.updateTerapeutaComision(a.id, a.porcentaje_comision)
      )

      const resultados = await Promise.all(promesas)
      
      const todosExitosos = resultados.every(r => r.success)
      
      if (todosExitosos) {
        return {
          success: true,
          message: 'Comisiones actualizadas correctamente'
        }
      } else {
        return {
          success: false,
          message: 'Algunas comisiones no pudieron ser actualizadas'
        }
      }
    } catch (error) {
      console.error('Error actualizando múltiples comisiones:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Obtener estadísticas de terapeutas por reserva
   */
  async getEstadisticasTerapeutas(reservaId) {
    try {
      const result = await this.getTerapeutasByReserva(reservaId)
      
      if (!result.success || !result.data) {
        return { success: false, message: 'No se pudieron obtener estadísticas' }
      }

      const terapeutas = result.data
      
      return {
        success: true,
        data: {
          total_terapeutas: terapeutas.length,
          terapeuta_principal: terapeutas.find(t => t.orden === 1),
          terapeutas_secundarios: terapeutas.filter(t => t.orden > 1),
          comision_promedio: terapeutas.reduce((sum, t) => 
            sum + parseFloat(t.porcentaje_comision), 0) / terapeutas.length || 0,
          mayor_comision: Math.max(...terapeutas.map(t => parseFloat(t.porcentaje_comision))),
          menor_comision: Math.min(...terapeutas.map(t => parseFloat(t.porcentaje_comision)))
        }
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      return { success: false, message: 'Error de conexión' }
    }
  },

  /**
   * Reordenar terapeutas (cambiar orden de prioridad)
   */
  async reordenarTerapeutas(reservaId, nuevoOrden) {
    try {
      // nuevoOrden es un array de { id, orden }
      const promesas = nuevoOrden.map(item => 
        fetch(`${API_BASE_URL}/reservas_terapeutas.php`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: item.id, 
            orden: item.orden 
          })
        }).then(res => res.json())
      )

      const resultados = await Promise.all(promesas)
      
      const todosExitosos = resultados.every(r => r.success)
      
      return {
        success: todosExitosos,
        message: todosExitosos 
          ? 'Orden actualizado correctamente' 
          : 'Error al actualizar el orden'
      }
    } catch (error) {
      console.error('Error reordenando terapeutas:', error)
      return { success: false, message: 'Error de conexión' }
    }
  }
}

export default reservaTerapeutasService