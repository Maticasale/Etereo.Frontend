import apiClient from './client'
import type { ServicioDto } from '@/types/api'

export const serviciosApi = {
  /** GET /servicios — Anónimo. Devuelve todos los servicios con sus subservicios. */
  getServicios: (): Promise<ServicioDto[]> =>
    apiClient
      .get<ServicioDto[] | { data?: ServicioDto[] }>('/servicios')
      .then((r) => (Array.isArray(r.data) ? r.data : (r.data.data ?? []))),
}
