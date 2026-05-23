import { create } from 'zustand'
import type { UsuarioDto } from '@/types/api'

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'etereo_access_token',
  REFRESH_TOKEN: 'etereo_refresh_token',
  USUARIO: 'etereo_usuario',
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  usuario: UsuarioDto | null
  setAuth: (accessToken: string, refreshToken: string, usuario: UsuarioDto) => void
  updateUsuario: (patch: Partial<UsuarioDto>) => void
  clearAuth: () => void
  initializeAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  usuario: null,

  setAuth: (accessToken, refreshToken, usuario) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    localStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(usuario))
    set({ accessToken, refreshToken, usuario })
  },

  updateUsuario: (patch) =>
    set((state) => {
      if (!state.usuario) return state
      const usuario = { ...state.usuario, ...patch }
      localStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(usuario))
      return { usuario }
    }),

  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USUARIO)
    set({ accessToken: null, refreshToken: null, usuario: null })
  },

  initializeAuth: () => {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    const usuarioStr = localStorage.getItem(STORAGE_KEYS.USUARIO)

    if (!accessToken || !refreshToken || !usuarioStr) {
      // Limpiar cualquier residuo
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USUARIO)
      return
    }

    // Si el refreshToken está expirado también, limpiamos todo
    if (isTokenExpired(refreshToken)) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USUARIO)
      return
    }

    try {
      const usuario = JSON.parse(usuarioStr) as UsuarioDto
      set({ accessToken, refreshToken, usuario })
    } catch {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USUARIO)
    }
  },
}))
