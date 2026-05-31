import type { LucideIcon } from 'lucide-react'
import type {
  CodigoDescuentoDto,
  CuponDto,
  ServicioDto,
  SesionDto,
  SubservicioDto,
  TurnoDto,
  VarianteDto,
} from '@/types/api'

export type ReservaStepId =
  | 'guest-data'
  | 'service'
  | 'selection'
  | 'schedule'
  | 'coupon'
  | 'confirmation'
  | 'success'

export interface GuestData {
  nombre: string
  apellido: string
  telefono: string
  email: string
  sexo: string
}

export interface SalonOption {
  id: 'salon1' | 'salon2'
  nombre: string
  titulo: string
  descripcion: string
  servicios: string[]
}

export type SelectedSalonId = SalonOption['id'] | null

export interface ServiceOption {
  id: number
  salonId: SalonOption['id']
  nombre: string
  previewItems: string[]
  previewOverflow: number
  subservicios: SubservicioDto[]
  iconKey: string
}

export interface ComboOption {
  id: number
  nombre: string
  detalle: string
  precio: number
  duracionMin: number
  items: string[]
  subservicioId: number
  varianteId?: number
}

export interface ZoneOption {
  id: string
  nombre: string
  precio: number
  duracionMin: number
  grupo: 'Mujeres' | 'Hombres' | 'General'
  subservicioId: number
  varianteId?: number
}

export interface TimeSlot {
  hora: string
}

export interface DayAvailability {
  id: string
  etiqueta: string
  fechaLarga: string
  fechaIso: string
  slots: TimeSlot[]
}

export interface TimeGroupDefinition {
  label: string
  filter: (hora: string) => boolean
}

export interface ReservaSummaryData {
  subtotal: number
  estimatedDuration: number
  automaticDiscountPct: number
  automaticDiscountValue: number
  couponDiscountValue: number
  total: number
  summaryItems: string[]
  selectedCoupon: CuponDto | null
  appliedDiscountCode: CodigoDescuentoDto | null
  createdTurno: TurnoDto | null
  createdSesion: SesionDto | null
}

export interface ServiceIconRegistry {
  [key: string]: LucideIcon
}

export type ReservaServicioDto = ServicioDto
export type ReservaVarianteDto = VarianteDto
