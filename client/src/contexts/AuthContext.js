import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { message } from 'antd'

const AuthContext = createContext()

const API_BASE_URL = 'https://pos-backend.bangachieu2.workers.dev'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

// Response interceptor cho error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message)
    if (error.response?.status === 401) {
      localStorage.removeItem('pos_token')
      localStorage.removeItem('pos_user')
    }
    return Promise.reject(error)
  }
)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('pos_user')
    const savedToken = localStorage.getItem('pos_token')
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem('pos_user')
        localStorage.removeItem('pos_token')
      }
    }
    setInitialLoading(false)
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    
    try {
      console.log('🔐 Login attempt:', email)
      
      const response = await api.post('/api/auth/login', {
        email: email.trim(),
        password
      })
      
      const { success, user: userData, token, message: msg } = response.data
      
      if (success && userData && token) {
        localStorage.setItem('pos_user', JSON.stringify(userData))
        localStorage.setItem('pos_token', token)
        setUser(userData)
        message.success(msg || 'Đăng nhập thành công!')
        return { success: true, user: userData }
      }
      
      throw new Error('Invalid response')
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Đăng nhập thất bại'
      message.error(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await api.post('/api/auth/logout')
      message.success('Đăng xuất thành công!')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('pos_token')
      localStorage.removeItem('pos_user')
      setUser(null)
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, initialLoading, api }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export { api } 