import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ requiredRole }) => {
  const token = localStorage.getItem('authToken');
  const userDataString = localStorage.getItem('userData');
  
  // Si no hay token, redirigir al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay rol requerido, verificarlo
  if (requiredRole) {
    try {
      const userData = JSON.parse(userDataString);
      
      // Verificar si el usuario tiene el rol requerido
      if (userData.rol !== requiredRole && userData.role !== requiredRole) {
        // No tiene el rol requerido, redirigir al inicio
        return <Navigate to="/" replace />;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default PrivateRoute;