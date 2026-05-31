import apiClient from './client'
import type { ReglaDescuentoSesionPublicaDto } from '@/types/api'

const REGLAS_DESCUENTO_BASE = '/reglas-descuento-sesion'

export const reglasDescuentoSesionApi = {
  getPublicas: (): Promise<ReglaDescuentoSesionPublicaDto[]> =>
    apiClient
      .get<{ data: ReglaDescuentoSesionPublicaDto[] }>(`${REGLAS_DESCUENTO_BASE}/publicas`)
      .then((r) => r.data.data),
}
