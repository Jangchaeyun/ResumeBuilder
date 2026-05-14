import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthResponse } from '../types/models'
import { apiFetch, getStoredToken, parseApiError, setStoredToken } from '../lib/api'

type AuthContextValue = {
  user: AuthResponse | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: {
    email: string
    name: string
    password: string
    profileImageUrl?: string
  }) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null)
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    const t = getStoredToken()
    if (!t) {
      setUser(null)
      setLoading(false)
      return
    }
    const res = await apiFetch('/api/auth/profile')
    if (!res.ok) {
      setStoredToken(null)
      setToken(null)
      setUser(null)
      setLoading(false)
      return
    }
    const data = (await res.json()) as AuthResponse
    setUser({ ...data, token: t })
    setToken(t)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refreshProfile()
  }, [refreshProfile])

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error(await parseApiError(res))
    const data = (await res.json()) as AuthResponse
    if (!data.token) throw new Error('토큰을 받지 못했습니다.')
    setStoredToken(data.token)
    setToken(data.token)
    setUser(data)
  }, [])

  const register = useCallback(
    async (payload: {
      email: string
      name: string
      password: string
      profileImageUrl?: string
    }) => {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        auth: false,
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await parseApiError(res))
    },
    [],
  )

  const logout = useCallback(() => {
    setStoredToken(null)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, token, loading, login, register, logout, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
