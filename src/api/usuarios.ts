import apiClient from './client'
import type { ActualizarUsuarioRequest, UsuarioDto } from '@/types/api'

const BASE = '/usuarios'

export const usuariosApi = {
  actualizar: (id: number, data: ActualizarUsuarioRequest) =>
    apiClient.patch(`${BASE}/${id}`, data),

  obtener: (id: number) =>
    apiClient.get<{ data: UsuarioDto }>(`${BASE}/${id}`).then((r) => r.data.data),
}
