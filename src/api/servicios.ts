import apiClient from './client'
import type { ServicioDto } from '@/types/api'

export const serviciosApi = {
  /** GET /servicios — Anónimo. Devuelve todos los servicios con sus subservicios. */
  getServicios: (): Promise<ServicioDto[]> =>
    apiClient.get<{ data: ServicioDto[] }>('/servicios').then((r) => r.data.data),
}
