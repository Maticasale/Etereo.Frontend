import apiClient from './client'
import type {
  LoginRequest,
  RegisterRequest,
  GoogleAuthRequest,
  AuthResponse,
  CambiarPasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  CompletarPerfilRequest,
  UsuarioDto,
} from '@/types/api'

const BASE = '/auth'

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<{ data: AuthResponse }>(`${BASE}/login`, data).then((r) => r.data.data),

  register: (data: RegisterRequest) =>
    apiClient.post<{ data: AuthResponse }>(`${BASE}/register`, data).then((r) => r.data.data),

  googleLogin: (idToken: string) =>
    apiClient
      .post<{ data: AuthResponse }>(`${BASE}/google`, { idToken } as GoogleAuthRequest)
      .then((r) => r.data.data),

  logout: (refreshToken: string) =>
    apiClient.post(`${BASE}/logout`, { refreshToken }),

  me: () =>
    apiClient.get<{ data: UsuarioDto }>(`${BASE}/me`).then((r) => r.data.data),

  cambiarPassword: (data: CambiarPasswordRequest) =>
    apiClient.post(`${BASE}/cambiar-password`, data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post(`${BASE}/forgot-password`, data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post(`${BASE}/reset-password`, data),

  completarPerfil: (data: CompletarPerfilRequest) =>
    apiClient.patch<{ data: UsuarioDto }>(`${BASE}/completar-perfil`, data).then((r) => r.data.data),
}
