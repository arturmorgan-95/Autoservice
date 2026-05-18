import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth'
import { ROLE_ROUTES } from '../utils/roleConstants'
import type { User, LoginRequest } from '../types'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  roleName: string | null
  login: (credentials: LoginRequest, allowedRoles?: string[]) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const navigate = useNavigate()

  const login = useCallback(async (credentials: LoginRequest, allowedRoles?: string[]) => {
    const response = await authApi.login(credentials)
    const loggedUser = response.data
    const roleName = loggedUser.role?.roleName ?? ''

    if (allowedRoles && !allowedRoles.includes(roleName)) {
      throw new Error('role_mismatch')
    }

    setUser(loggedUser)
    localStorage.setItem('user', JSON.stringify(loggedUser))

    const route = ROLE_ROUTES[roleName] ?? '/login'
    navigate(route)
    toast.success(`Добро пожаловать, ${loggedUser.fullName}!`)
  }, [navigate])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('user')
    navigate('/login')
    toast.success('Вы вышли из системы')
  }, [navigate])

  const roleName = user?.role?.roleName ?? null

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, roleName, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
