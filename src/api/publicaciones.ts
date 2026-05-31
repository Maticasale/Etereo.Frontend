import apiClient from './client'
import type { PublicacionDto } from '@/types/api'

export const publicacionesApi = {
  getPublicaciones: (): Promise<PublicacionDto[]> =>
    apiClient.get<{ data: PublicacionDto[] }>('/publicaciones').then((r) => r.data.data),
}
