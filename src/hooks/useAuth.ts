import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { accessToken, refreshToken, usuario, setAuth, clearAuth } = useAuthStore()
  return {
    accessToken,
    refreshToken,
    usuario,
    isAuthenticated: !!accessToken && !!usuario,
    setAuth,
    clearAuth,
  }
}
