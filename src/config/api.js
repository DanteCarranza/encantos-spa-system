// Configuración de la API para VITE
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://encantos.pe/spa/backend/api';

export const AUTH_ENDPOINTS = {
  register: `${API_BASE_URL}/auth/register.php`,
  login: `${API_BASE_URL}/auth/login.php`,
  verifyEmail: `${API_BASE_URL}/auth/verify-email.php`,
  forgotPassword: `${API_BASE_URL}/auth/forgot-password.php`,
  resetPassword: `${API_BASE_URL}/auth/reset-password.php`,
  resendVerification: `${API_BASE_URL}/auth/resend-verification.php`
};

// Función helper para hacer peticiones
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      message: 'Error de conexión con el servidor'
    };
  }
};