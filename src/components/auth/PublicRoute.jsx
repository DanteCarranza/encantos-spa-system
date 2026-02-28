import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Loading from '../common/Loading'

const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth()

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <Loading fullScreen message="Verificando sesión..." />
  }

  // Si ya está autenticado, redirigir al inicio
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Si no está autenticado, mostrar la página (login/register)
  return <Outlet />
}

export default PublicRoute