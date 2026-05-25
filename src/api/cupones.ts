import apiClient from './client'
import type { CodigoDescuentoDto, CuponDto } from '@/types/api'

const CUPONES_BASE = '/cupones'
const CODIGOS_BASE = '/codigos-descuento'

interface ValidarCodigoQuery {
  servicioId?: number
  subservicioId?: number
  varianteId?: number
}

export const cuponesApi = {
  getDisponibles: (): Promise<CuponDto[]> =>
    apiClient.get<{ data: CuponDto[] }>(`${CUPONES_BASE}/disponibles`).then((r) => r.data.data),

  validar: (codigo: string): Promise<CuponDto> =>
    apiClient.get<{ data: CuponDto }>(`${CUPONES_BASE}/validar/${encodeURIComponent(codigo)}`).then((r) => r.data.data),
}

export const codigosDescuentoApi = {
  validar: (codigo: string, query?: ValidarCodigoQuery): Promise<CodigoDescuentoDto> =>
    apiClient
      .get<{ data: CodigoDescuentoDto }>(`${CODIGOS_BASE}/validar/${encodeURIComponent(codigo)}`, {
        params: query,
      })
      .then((r) => r.data.data),
}
