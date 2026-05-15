// ─── Auth ───────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  nombre: string
  apellido: string
  telefono?: string
  sexo?: string
}

export interface GoogleAuthRequest {
  idToken: string
}

export interface RefreshRequest {
  refreshToken: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  usuario: UsuarioDto
}

export interface UsuarioDto {
  id: number
  email: string
  nombre: string
  apellido: string
  telefono?: string
  sexo: string
  rol: string
  estado: string
  motivoBloqueo?: string
  debeCambiarPassword: boolean
  avatarUrl?: string
  creadoEn: string
}

export interface CambiarPasswordRequest {
  passwordActual: string
  passwordNueva: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  passwordNueva: string
}

export interface BloquearUsuarioRequest {
  motivo: string
}

// ─── Usuarios ───────────────────────────────────────────────────────────────

export interface ActualizarUsuarioRequest {
  nombre?: string
  apellido?: string
  telefono?: string
  sexo?: string
}

export interface CrearClienteRequest {
  nombre: string
  apellido: string
  email?: string
  telefono?: string
  sexo?: string
}

export interface UsuariosListResponse {
  items: UsuarioDto[]
  total: number
}

// ─── Servicios ───────────────────────────────────────────────────────────────

export interface ServicioDto {
  id: number
  nombre: string
  salon: string
  activo: boolean
  esPack: boolean
  ordenDisplay?: number
  categoriaImputacionId?: number
  subservicios: SubservicioDto[]
}

export interface SubservicioDto {
  id: number
  nombre: string
  duracionMinutos: number
  precio: number
  activo: boolean
  sexo?: string
  tieneVariantes: boolean
  variantes: VarianteDto[]
  zonasIncluidas?: string[]
}

export interface VarianteDto {
  id: number
  nombre: string
  duracionMinutos: number
  precio: number
  activo: boolean
}

// ─── Turnos ──────────────────────────────────────────────────────────────────

export type EstadoTurno =
  | 'PendienteConfirmacion'
  | 'Confirmado'
  | 'Realizado'
  | 'Cancelado'
  | 'Rechazado'
  | 'Multa'
  | 'Ausente'
  | 'Impago'
  | 'Publicidad'

export interface TurnoDto {
  id: number
  estado: EstadoTurno
  fecha: string
  horaInicio: string
  horaFin: string
  clienteId: number
  clienteNombre: string
  operarioId?: number
  operarioNombre?: string
  subservicioNombre: string
  varianteNombre?: string
  precio: number
  creadoEn: string
  notas?: string
}

export interface TurnoListResponse {
  items: TurnoDto[]
  total: number
}

// ─── Cupones ─────────────────────────────────────────────────────────────────

export interface CuponDto {
  id: number
  codigo: string
  descuentoPorcentaje: number
  activo: boolean
  usoMaximo?: number
  usoActual: number
  vencimiento?: string
}

// ─── Operarios ───────────────────────────────────────────────────────────────

export interface OperarioDto {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono?: string
  avatarUrl?: string
  activo: boolean
}

// ─── Imputaciones ────────────────────────────────────────────────────────────

export interface ImputacionDto {
  id: number
  concepto: string
  monto: number
  tipo: 'Ingreso' | 'Egreso'
  fecha: string
  categoriaId?: number
  categoriaNombre?: string
  metodoPagoId?: number
  metodoPagoNombre?: string
  operarioId?: number
  operarioNombre?: string
}

// ─── Catálogos ───────────────────────────────────────────────────────────────

export interface CategoriaImputacionDto {
  id: number
  nombre: string
  activo: boolean
}

export interface MetodoPagoDto {
  id: number
  nombre: string
  activo: boolean
}

export interface MotivoBloqueoDto {
  id: number
  nombre: string
  activo: boolean
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface KpisDto {
  turnosHoy: number
  ingresosHoy: number
  egresosHoy: number
  balanceHoy: number
  calificacionPromedio?: number
}

export interface AlertaDto {
  tipo: string
  mensaje: string
  cantidad?: number
}

// ─── Calificaciones ──────────────────────────────────────────────────────────

export interface CalificacionDto {
  id: number
  turnoId: number
  operarioId: number
  operarioNombre: string
  puntaje: number
  comentario?: string
  creadoEn: string
}

// ─── Estadísticas ────────────────────────────────────────────────────────────

export interface EstadisticasResumenDto {
  turnosRealizados: number
  ingresosTotal: number
  egresosTotal: number
  balance: number
  distribucionEstados: Record<string, number>
}

// ─── API Response wrapper ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  error: {
    codigo: string
    mensaje: string
  }
}
