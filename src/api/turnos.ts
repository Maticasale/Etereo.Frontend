import apiClient from './client'
import type {
  CrearSesionRequest,
  CrearTurnoRequest,
  DisponibilidadDto,
  DisponibilidadMesDto,
  DisponibilidadMesSesionRequest,
  DisponibilidadMesTurnoRequest,
  DisponibilidadSesionRequest,
  SesionDto,
  TurnoDto,
  TurnosDisponibilidadQuery,
} from '@/types/api'

const TURNOS_BASE = '/turnos'
const SESIONES_BASE = '/sesiones'

export const turnosApi = {
  getDisponibilidad: (query: TurnosDisponibilidadQuery): Promise<DisponibilidadDto> =>
    apiClient
      .get<{ data: DisponibilidadDto }>(`${TURNOS_BASE}/disponibilidad`, { params: query })
      .then((r) => r.data.data),

  getDisponibilidadMes: (data: DisponibilidadMesTurnoRequest): Promise<DisponibilidadMesDto> =>
    apiClient
      .post<{ data: DisponibilidadMesDto }>(`${TURNOS_BASE}/disponibilidad-mes`, data)
      .then((r) => r.data.data),

  crearTurno: (data: CrearTurnoRequest): Promise<TurnoDto> =>
    apiClient.post<{ data: TurnoDto }>(TURNOS_BASE, data).then((r) => r.data.data),

  getMisTurnos: (): Promise<TurnoDto[]> =>
    apiClient.get<{ data: TurnoDto[] }>(`${TURNOS_BASE}/mis-turnos`).then((r) => r.data.data),
}

export const sesionesApi = {
  getDisponibilidad: (data: DisponibilidadSesionRequest): Promise<DisponibilidadDto> =>
    apiClient.post<{ data: DisponibilidadDto }>(`${SESIONES_BASE}/disponibilidad`, data).then((r) => r.data.data),

  getDisponibilidadMes: (data: DisponibilidadMesSesionRequest): Promise<DisponibilidadMesDto> =>
    apiClient
      .post<{ data: DisponibilidadMesDto }>(`${SESIONES_BASE}/disponibilidad-mes`, data)
      .then((r) => r.data.data),

  crearSesion: (data: CrearSesionRequest): Promise<SesionDto> =>
    apiClient.post<{ data: SesionDto }>(SESIONES_BASE, data).then((r) => r.data.data),
}
