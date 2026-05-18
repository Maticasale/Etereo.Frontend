import apiClient from './client'

// ─── Types locales ────────────────────────────────────────────────────────────

export interface CalificacionesEstadisticasDto {
  promedioGlobal: number
  total: number
  porOperario: { operarioId: number; nombre: string; promedio: number; total: number }[]
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const estadisticasApi = {
  /**
   * GET /estadisticas/calificaciones — Acceso: Admin
   * ⚠️ Este endpoint requiere rol Admin. No está disponible para visitantes públicos.
   * TODO [BACKEND]: Crear GET /estadisticas/calificaciones/publico (anónimo) que devuelva
   *   promedioGlobal, total y últimas N calificaciones con comentario.
   *   Mientras tanto, CalificacionesSection usa datos mockeados en el frontend.
   */
  getCalificaciones: (): Promise<CalificacionesEstadisticasDto> =>
    apiClient
      .get<{ data: CalificacionesEstadisticasDto }>('/estadisticas/calificaciones')
      .then((r) => r.data.data),
}
