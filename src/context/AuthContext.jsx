import React, { createContext, useState, useEffect } from 'react'
import authService from '../services/authService'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = authService.getToken()
      
      if (!token) {
        setLoading(false)
        return
      }

      // Verificar token en el servidor
      const isValid = await authService.verifyToken()
      
      if (isValid) {
        const currentUser = authService.getCurrentUser()
        setUser(currentUser)
        setIsAuthenticated(true)
      } else {
        // Token inválido, limpiar
        authService.logout()
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error)
      authService.logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password)
      
      if (result.success) {
        setUser(result.data.user)
        setIsAuthenticated(true)
        return { success: true }
      }
      
      return { success: false, message: result.message }
    } catch (error) {
      return { success: false, message: 'Error al iniciar sesión' }
    }
  }

  const register = async (userData) => {
    try {
      const result = await authService.register(userData)
      
      if (result.success) {
        return { success: true, message: 'Registro exitoso. Por favor inicia sesión.' }
      }
      
      return { success: false, message: result.message }
    } catch (error) {
      return { success: false, message: 'Error al registrar usuario' }
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateUser = (userData) => {
    setUser({ ...user, ...userData })
    localStorage.setItem('user', JSON.stringify({ ...user, ...userData }))
  }

  const isAdmin = () => {
    return user?.role === 'admin' || user?.rol === 'admin'
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    isAdmin,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}