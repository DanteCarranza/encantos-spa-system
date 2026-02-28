// URL base del API
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/proyecto-spa/backend'
export const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || `${API_URL}/uploads`

// Nombre de la aplicación
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Mi Tienda'

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
}

// Estados de pedidos
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
}

export const ORDER_STATUS_LABELS = {
  pending: 'Pendiente',
  processing: 'En Proceso',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado'
}

// Métodos de pago
export const PAYMENT_METHODS = {
  CARD: 'card',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash'
}

export const PAYMENT_METHOD_LABELS = {
  card: 'Tarjeta de Crédito/Débito',
  paypal: 'PayPal',
  bank_transfer: 'Transferencia Bancaria',
  cash: 'Efectivo'
}

// Métodos de envío
export const SHIPPING_METHODS = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  PICKUP: 'pickup'
}

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  ADMIN_LIMIT: 20
}

// Regex para validaciones
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{9}$/,
  DNI: /^[0-9]{8}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
}

// Mensajes de error
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Este campo es obligatorio',
  INVALID_EMAIL: 'Correo electrónico inválido',
  INVALID_PHONE: 'Número de teléfono inválido',
  INVALID_DNI: 'DNI inválido',
  INVALID_PASSWORD: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número',
  PASSWORD_MISMATCH: 'Las contraseñas no coinciden',
  LOGIN_ERROR: 'Credenciales inválidas',
  SERVER_ERROR: 'Error en el servidor. Por favor intenta más tarde.',
  NETWORK_ERROR: 'No se pudo conectar con el servidor'
}

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  LOGIN: 'Inicio de sesión exitoso',
  LOGOUT: 'Sesión cerrada exitosamente',
  REGISTER: 'Registro exitoso',
  UPDATE: 'Actualización exitosa',
  DELETE: 'Eliminación exitosa',
  CREATE: 'Creación exitosa'
}