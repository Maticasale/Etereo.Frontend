// Auth

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

export interface CompletarPerfilRequest {
  telefono?: string
  sexo?: 'Masculino' | 'Femenino'
}

export interface BloquearUsuarioRequest {
  motivo: string
}

// Usuarios

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

// Servicios

export interface VarianteDto {
  id: number
  nombre: string
  precio: number
  duracionMin: number
  sexo: string
  activo: boolean
  ordenDisplay: number
}

export interface SubservicioDto {
  id: number
  servicioId: number
  nombre: string
  descripcion?: string
  precio?: number
  duracionMin?: number
  requiereSilencio: boolean
  esPack: boolean
  detallePack?: string
  sexo: string
  activo: boolean
  ordenDisplay: number
  variantes: VarianteDto[]
}

export interface ServicioDto {
  id: number
  nombre: string
  salon: string
  categoriaImputacionId?: number
  activo: boolean
  ordenDisplay: number
  subservicios: SubservicioDto[]
}

export interface EstadoConfiguracionDto {
  configurado: boolean
  mensaje: string
}

export interface ReglaDescuentoDto {
  id: number
  servicioId: number
  nombreServicio: string
  zonasMinimas: number
  porcentajeDescuento: number
  activo: boolean
}

export interface ReglaDescuentoSesionPublicaDto {
  servicioId: number
  nombreServicio: string
  zonasMinimas: number
  porcentajeDescuento: number
}

// Turnos y sesiones

export type EstadoTurno =
  | 'PendienteConfirmacion'
  | 'Confirmado'
  | 'Rechazado'
  | 'Cancelado'
  | 'Multa'
  | 'Ausente'
  | 'Realizado'
  | 'Impago'
  | 'Publicidad'

export interface CrearTurnoRequest {
  clienteId?: number
  nombreAnonimo?: string
  telefonoAnonimo?: string
  subservicioId: number
  varianteId?: number
  fechaHoraInicio: string
  notas?: string
  cuponId?: number
  codigoDescuento?: string
}

export interface CrearTurnoEnSesionRequest {
  subservicioId: number
  varianteId?: number
}

export interface CrearSesionRequest {
  clienteId?: number
  nombreAnonimo?: string
  telefonoAnonimo?: string
  operarioId?: number
  salon: string
  fechaHoraInicio: string
  zonas: CrearTurnoEnSesionRequest[]
  cuponId?: number
  codigoDescuento?: string
}

export interface DisponibilidadSesionZonaRequest {
  subservicioId: number
  varianteId?: number
}

export interface DisponibilidadSesionRequest {
  salon: 'Salon1' | 'Salon2'
  fecha: string
  zonas: DisponibilidadSesionZonaRequest[]
}

export interface DisponibilidadMesTurnoRequest {
  mes: string
  subservicioId: number
  varianteId?: number
  duracionMin?: number
}

export interface DisponibilidadMesSesionRequest {
  mes: string
  salon: 'Salon1' | 'Salon2'
  zonas: DisponibilidadSesionZonaRequest[]
}

export interface TurnosDisponibilidadQuery {
  fecha: string
  subservicioId: number
  varianteId?: number
  duracionMin?: number
}

export interface AsignarOperariaRequest {
  operarioId: number
}

export interface RechazarTurnoRequest {
  motivoRechazo: string
}

export interface RealizarTurnoRequest {
  metodoPagoId: number
  precioFinal: number
}

export interface TurnoDto {
  id: number
  salon: string
  clienteId?: number
  nombreCliente?: string
  nombreAnonimo?: string
  telefonoAnonimo?: string
  operarioId?: number
  nombreOperario: string
  subservicioId: number
  nombreSubservicio: string
  nombreServicio: string
  varianteId?: number
  nombreVariante?: string
  sesionId?: number
  fechaHoraInicio: string
  duracionMin: number
  estado: EstadoTurno
  motivoRechazo?: string
  precioBase: number
  porcentajeDescuento?: number
  cuponId?: number
  precioFinal?: number
  metodoPagoId?: number
  nombreMetodoPago?: string
  comisionCalculada?: number
  notas?: string
  creadoEn: string
  actualizadoEn: string
}

export interface SesionDto {
  id: number
  clienteId?: number
  nombreCliente?: string
  nombreAnonimo?: string
  telefonoAnonimo?: string
  operarioId: number
  nombreOperario: string
  salon: string
  fechaHoraInicio: string
  estado: string
  descuentoAutoPct?: number
  turnos: TurnoDto[]
  creadoEn: string
}

export interface SlotOcupadoDto {
  inicio: string
  fin: string
  estado: string
}

export interface DisponibilidadDto {
  disponible: boolean
  motivoNoDisponible?: string
  slotsOcupados: SlotOcupadoDto[]
  horariosDisponibles: string[]
}

export interface DisponibilidadDiaDto {
  fecha: string
  disponible: boolean
  horariosDisponibles: string[]
}

export interface DisponibilidadMesDto {
  mes: string
  dias: DisponibilidadDiaDto[]
}

// Cupones

export interface CuponDto {
  id: number
  codigo: string
  descripcion?: string
  tipoDescuento: string
  valor: number
  serviciosIds?: number[]
  fechaDesde: string
  fechaHasta: string
  usosMaximos?: number
  usosActuales: number
  unUsoPorCliente: boolean
  activo: boolean
  creadoEn: string
}

export interface CrearCodigoDescuentoRequest {
  codigo: string
  nombre: string
  descripcionBreve?: string
  serviciosIds?: number[]
  subserviciosIds?: number[]
  variantesIds?: number[]
  tipoDescuento: string
  valor: number
  fechaVencimiento?: string
  usosMaximos?: number
}

export interface ActualizarCodigoDescuentoRequest {
  nombre?: string
  descripcionBreve?: string
  serviciosIds?: number[]
  subserviciosIds?: number[]
  variantesIds?: number[]
  tipoDescuento?: string
  valor?: number
  fechaVencimiento?: string | null
  usosMaximos?: number | null
}

export interface EstadoCodigoDescuentoRequest {
  activo: boolean
}

export interface CodigoDescuentoDto {
  id: number
  codigo: string
  nombre: string
  descripcionBreve?: string
  serviciosIds?: number[]
  subserviciosIds?: number[]
  variantesIds?: number[]
  tipoDescuento: string
  valor: number
  fechaVencimiento?: string
  usosMaximos?: number
  usosActuales: number
  activo: boolean
  creadoEn: string
}

export interface PublicacionDto {
  id: number
  titulo: string
  contenido?: string
  imagenUrl?: string
  tipo: 'Novedad' | 'Promo' | 'Aviso' | 'Evento'
  visibilidad: 'Todos' | 'SoloRegistrados'
  destacado: boolean
  fechaDesde: string
  fechaHasta?: string
  creadoEn: string
}

// Operarios y disponibilidad

export interface OperarioSubservicioDto {
  id: number
  operarioId: number
  subservicioId: number
  nombreSubservicio: string
  nombreServicio: string
  porcentajeComision: number
}

export interface OperarioVistasDto {
  id: number
  operarioId: number
  verMisTurnos: boolean
  verMisComisiones: boolean
  verMiCalificacion: boolean
  verMisEstadisticas: boolean
}

export interface DisponibilidadSalonDto {
  id: number
  fecha: string
  salon: string
  motivoId: number
  nombreMotivo: string
  descripcion?: string
  creadoPorId: number
}

export interface DisponibilidadOperarioDto {
  id: number
  operarioId: number
  fecha: string
  trabaja: boolean
  motivoAusencia?: string
}

// Imputaciones y catálogos

export interface ImputacionDto {
  id: number
  fecha: string
  tipo: string
  categoriaId: number
  nombreCategoria: string
  descripcion?: string
  monto: number
  turnoId?: number
  operarioId?: number
  nombreOperario?: string
  cargadoPorId: number
  origen: string
  creadoEn: string
}

export interface ResumenCategoriaDto {
  nombreCategoria: string
  tipo: string
  total: number
}

export interface ResumenImputacionesDto {
  totalIngresos: number
  totalEgresos: number
  balance: number
  porCategoria: ResumenCategoriaDto[]
}

export interface CategoriaImputacionDto {
  id: number
  nombre: string
  tipo: string
  descripcion?: string
  activo: boolean
  ordenDisplay: number
}

export interface MetodoPagoDto {
  id: number
  nombre: string
  activo: boolean
  ordenDisplay: number
}

export interface MotivoBloqueoSalonDto {
  id: number
  nombre: string
  activo: boolean
  ordenDisplay: number
}

// Emails y calificaciones

export interface ConfiguracionEmailDto {
  id: number
  recordatorioDiasAntes: number
  postturnoHorasDespues: number
  emailsActivos: boolean
  actualizadoEn: string
}

export interface EmailEnviadoDto {
  id: number
  tipo: string
  destinatario: string
  turnoId?: number
  usuarioId?: number
  estado: string
  errorDetalle?: string
  enviadoEn: string
}

export interface CrearCalificacionRequest {
  turnoId: number
  puntuacion: number
  comentario?: string
}

export interface CalificacionDto {
  id: number
  turnoId: number
  clienteId: number
  nombreCliente: string
  operarioId: number
  nombreOperario: string
  puntuacion: number
  comentario?: string
  creadoEn: string
}

export interface PromedioCalificacionDto {
  operarioId: number
  nombreOperario: string
  promedio: number
  totalCalificaciones: number
}

// Estadísticas, dashboard y comisiones

export interface DistribucionEstadoDto {
  estado: string
  cantidad: number
  porcentaje: number
}

export interface ResumenEstadisticasDto {
  turnosHoy: number
  turnosSemana: number
  turnosMes: number
  ingresosHoy: number
  ingresosSemana: number
  ingresosMes: number
  egresosHoy: number
  egresosSemana: number
  egresosMes: number
  balanceHoy: number
  balanceSemana: number
  balanceMes: number
  promedioCalificacionGlobal: number
  totalCalificaciones: number
  turnosPorEstado: DistribucionEstadoDto[]
}

export interface PuntoEvolucionDto {
  periodo: string
  ingresos: number
  egresos: number
  balance: number
}

export interface ServicioRankingDto {
  subservicioId: number
  nombreServicio: string
  nombreCategoria: string
  cantidadTurnos: number
  ingresoTotal: number
}

export interface OperariaEstadisticasDto {
  operarioId: number
  nombre: string
  turnosMes: number
  turnosRealizados: number
  ingresosMes: number
  comisionesMes: number
  promedioCalificacion: number
  totalCalificaciones: number
}

export interface OcupacionDiariaDto {
  fecha: string
  totalTurnos: number
  turnosRealizados: number
  turnosCancelados: number
  turnosPendientes: number
}

export interface TurnosEstadisticasDto {
  total: number
  porEstado: DistribucionEstadoDto[]
}

export interface PromedioOperarioCalDto {
  operarioId: number
  nombre: string
  promedio: number
  total: number
}

export interface CalificacionesEstadisticasDto {
  promedioGlobal: number
  total: number
  porOperario: PromedioOperarioCalDto[]
}

export interface AlertaDashboardDto {
  tipo: string
  mensaje: string
  prioridad: string
  cantidad?: number
}

export interface TurnoPendienteSinOperariaDto {
  turnoId: number
  clienteNombre: string
  subservicioNombre: string
  fechaHoraInicio: string
  horasEnEspera: number
}

export interface DashboardAlertasDto {
  alertas: AlertaDashboardDto[]
  turnosPendientesSinOperaria: TurnoPendienteSinOperariaDto[]
}

export interface AgendaHoyItemDto {
  turnoId: number
  horaInicio: string
  horaFin: string
  cliente: string
  operario: string
  servicio: string
  estado: string
  precioFinal?: number
}

export interface ComisionDto {
  id: number
  operarioId: number
  nombreOperario: string
  turnoId?: number
  monto: number
  fecha: string
  concepto: string
}

export interface ResumenComisionesDto {
  operarioId: number
  nombre: string
  totalComisiones: number
  comisiones: ComisionDto[]
}

// API wrapper

export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  error: {
    codigo: string
    mensaje: string
  }
}
