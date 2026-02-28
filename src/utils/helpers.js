import { UPLOAD_URL } from './constants'

/**
 * Formatear precio en soles peruanos
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(price)
}

/**
 * Formatear fecha (mantener la función original para compatibilidad)
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return 'N/A'
  
  // Si es string con formato YYYY-MM-DD y NO incluye tiempo
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/) && !includeTime) {
    return formatDateLong(date)
  }
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' })
  }
  
  return new Date(date).toLocaleDateString('es-PE', options)
}



/**
 * Formatear fecha SIN problemas de zona horaria
 * Para fechas tipo YYYY-MM-DD (solo fecha, sin hora)
 */
export const formatDateOnly = (dateString) => {
  if (!dateString) return 'N/A'
  
  // Si es formato YYYY-MM-DD, parsearlo directamente
  const parts = dateString.split('-')
  if (parts.length === 3) {
    const [year, month, day] = parts
    return `${day}/${month}/${year}`
  }
  
  // Fallback
  return dateString
}


/**
 * Formatear fecha en formato largo (sin zona horaria)
 */
export const formatDateLong = (dateString) => {
  if (!dateString) return 'N/A'
  
  // Agregar 'T00:00:00' para evitar problemas de zona horaria
  return new Date(dateString + 'T00:00:00').toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Obtener URL completa de imagen
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.jpg'
  if (imagePath.startsWith('http')) return imagePath
  return `${UPLOAD_URL}/${imagePath}`
}

/**
 * Truncar texto
 */
export const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Generar slug
 */
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Validar email
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Validar teléfono peruano
 */
export const isValidPhone = (phone) => {
  const regex = /^[0-9]{9}$/
  return regex.test(phone)
}

/**
 * Validar DNI peruano
 */
export const isValidDNI = (dni) => {
  const regex = /^[0-9]{8}$/
  return regex.test(dni)
}

/**
 * Calcular descuento
 */
export const calculateDiscount = (originalPrice, discountedPrice) => {
  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100
  return Math.round(discount)
}

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Scroll to top
 */
export const scrollToTop = (smooth = true) => {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  })
}

/**
 * Guardar en localStorage de forma segura
 */
export const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error('Error guardando en localStorage:', error)
    return false
  }
}

/**
 * Obtener de localStorage de forma segura
 */
export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('Error leyendo de localStorage:', error)
    return defaultValue
  }
}

/**
 * Remover de localStorage
 */
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error('Error removiendo de localStorage:', error)
    return false
  }
}

/**
 * Copiar al portapapeles
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Error copiando al portapapeles:', error)
    return false
  }
}

/**
 * Descargar archivo
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}