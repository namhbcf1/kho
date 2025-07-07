import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { message } from 'antd'

const AuthContext = createContext()

// API Configuration
const API_BASE_URL = 'https://pos-backend.bangachieu2.workers.dev'

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Ensure config and headers exist - SỬA LỖI CHÍNH
    if (!config) {
      config = {}
    }
    if (!config.headers) {
      config.headers = {}
    }
    
    const token = localStorage.getItem('pos_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log request for debugging
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data
    })
    
    return config
  },
  (error) => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor with proper error handling
api.interceptors.response.use(
  (response) => {
    // Ensure response exists - SỬA LỖI CHÍNH  
    if (!response) {
      console.error('❌ Response is undefined')
      return Promise.reject(new Error('Response is undefined'))
    }
    
    console.log(`✅ API Response: ${response.config?.method?.toUpperCase()} ${response.config?.url}`, {
      status: response.status,
      data: response.data
    })
    
    return response
  },
  (error) => {
    // Comprehensive error handling - SỬA LỖI CHÍNH
    let errorInfo = {
      message: 'Lỗi không xác định',
      status: null,
      data: null
    }
    
    if (error?.response) {
      // Server responded with error status
      errorInfo = {
        message: error.response.data?.error || error.response.data?.message || `HTTP ${error.response.status}`,
        status: error.response.status,
        data: error.response.data
      }
    } else if (error?.request) {
      // Request was made but no response received
      errorInfo = {
        message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
        status: 0,
        data: null
      }
    } else if (error?.message) {
      // Something else happened
      errorInfo = {
        message: error.message,
        status: null,
        data: null
      }
    }
    
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, errorInfo)
    
    // Handle 401 Unauthorized
    if (errorInfo.status === 401) {
      localStorage.removeItem('pos_token')
      localStorage.removeItem('pos_user')
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem('pos_user')
        const savedToken = localStorage.getItem('pos_token')
        
        console.log('🔍 Initializing auth...', { 
          hasUser: !!savedUser, 
          hasToken: !!savedToken 
        })
        
        if (savedUser && savedToken) {
          try {
            const userData = JSON.parse(savedUser)
            setUser(userData)
            
            // Verify token with server
            console.log('🔐 Verifying token with server...')
            await api.get('/api/auth/me')
            console.log('✅ Token verified successfully')
            
          } catch (parseError) {
            console.error('❌ JSON parse error or token verification failed:', parseError)
            localStorage.removeItem('pos_token')
            localStorage.removeItem('pos_user')
            setUser(null)
          }
        } else {
          console.log('ℹ️ No saved auth data found')
        }
      } catch (error) {
        console.error('❌ Init auth error:', error)
        localStorage.removeItem('pos_token')
        localStorage.removeItem('pos_user')
        setUser(null)
      } finally {
        setInitialLoading(false)
        console.log('✅ Auth initialization complete')
      }
    }
    
    initAuth()
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    
    try {
      console.log('🔐 Attempting login...', { 
        email, 
        api_url: API_BASE_URL,
        timestamp: new Date().toISOString()
      })
      
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email và mật khẩu là bắt buộc')
      }
      
      if (!email.includes('@')) {
        throw new Error('Email không hợp lệ')
      }
      
      const response = await api.post('/api/auth/login', {
        email: email.trim().toLowerCase(),
        password: password.trim()
      })
      
      console.log('📝 Login response received:', response.data)
      
      // Validate response structure
      if (!response.data) {
        throw new Error('Server không trả về dữ liệu')
      }
      
      const { success, data, message: responseMessage, error } = response.data
      
      if (!success) {
        throw new Error(error || 'Đăng nhập thất bại')
      }
      
      if (!data || !data.user || !data.token) {
        throw new Error('Dữ liệu phản hồi không đầy đủ')
      }
      
      const { user: userData, token } = data
      
      // Validate user data
      if (!userData.id || !userData.email) {
        throw new Error('Dữ liệu người dùng không hợp lệ')
      }
      
      // Save to localStorage
      localStorage.setItem('pos_user', JSON.stringify(userData))
      localStorage.setItem('pos_token', token)
      
      setUser(userData)
      
      console.log('✅ Login successful:', userData)
      message.success(responseMessage || 'Đăng nhập thành công!')
      
      return { 
        success: true, 
        user: userData,
        message: responseMessage || 'Đăng nhập thành công!'
      }
      
    } catch (error) {
      console.error('❌ Login error:', error)
      
      let errorMessage = 'Đăng nhập thất bại'
      
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.code === 'ECONNABORTED') {
        errorMessage = 'Kết nối quá chậm. Vui lòng thử lại.'
      } else if (error?.code === 'ERR_NETWORK') {
        errorMessage = 'Lỗi mạng. Vui lòng kiểm tra kết nối internet.'
      }
      
      message.error(errorMessage)
      
      return { 
        success: false, 
        error: errorMessage 
      }
      
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    
    try {
      console.log('🚪 Attempting logout...')
      
      // Try to notify server
      try {
        await api.post('/api/auth/logout')
        console.log('✅ Server logout successful')
      } catch (error) {
        console.warn('⚠️ Server logout failed, continuing with local logout:', error.message)
      }
      
      // Clear local data regardless of server response
      localStorage.removeItem('pos_token')
      localStorage.removeItem('pos_user')
      setUser(null)
      
      console.log('✅ Local logout successful')
      message.success('Đăng xuất thành công!')
      
    } catch (error) {
      console.error('❌ Logout error:', error)
      
      // Force local logout even if server call fails
      localStorage.removeItem('pos_token')
      localStorage.removeItem('pos_user')
      setUser(null)
      
      message.warning('Đã đăng xuất (có một số lỗi nhỏ)')
    } finally {
      setLoading(false)
    }
  }

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('pos_token')
      if (!token) {
        return false
      }
      
      const response = await api.get('/api/auth/me')
      
      if (response.data?.success && response.data?.data?.user) {
        setUser(response.data.data.user)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('pos_token')
      localStorage.removeItem('pos_user')
      setUser(null)
      return false
    }
  }

  const value = {
    user,
    login,
    logout,
    checkAuth,
    loading,
    initialLoading,
    api, // Export api instance for other components
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isCashier: user?.role === 'cashier' || user?.role === 'admin',
    isManager: user?.role === 'manager' || user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Export api instance for use in other files
export { api } 