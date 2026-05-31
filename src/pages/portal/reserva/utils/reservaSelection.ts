import type { ServicioDto, SubservicioDto, VarianteDto } from '@/types/api'
import type {
  ComboOption,
  DayAvailability,
  GuestData,
  SalonOption,
  SelectedSalonId,
  ServiceOption,
  ZoneOption,
} from '../types'
import { formatLongDayLabel, formatShortDayLabel, parseLocalDateIso } from './reservaDates'
import { normalizeTextKey, sortTimes } from './reservaFormatters'

export const DEFAULT_GUEST: GuestData = {
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  sexo: '',
}

export function isCompleteProfile(
  usuario:
    | {
        nombre?: string
        apellido?: string
        telefono?: string
        sexo?: string
      }
    | null
    | undefined,
) {
  return Boolean(
    usuario &&
      usuario.nombre?.trim() &&
      usuario.apellido?.trim() &&
      usuario.telefono?.trim() &&
      (usuario.sexo === 'Femenino' || usuario.sexo === 'Masculino'),
  )
}

export function mapSalonId(salon: string): SelectedSalonId {
  if (salon === 'Salon1') return 'salon1'
  if (salon === 'Salon2') return 'salon2'
  return null
}

export function mapSalonEnum(salonId: SelectedSalonId): 'Salon1' | 'Salon2' | null {
  if (salonId === 'salon1') return 'Salon1'
  if (salonId === 'salon2') return 'Salon2'
  return null
}

export function mapGrupoFromSexo(sexo: string): ZoneOption['grupo'] {
  if (sexo === 'Femenino') return 'Mujeres'
  if (sexo === 'Masculino') return 'Hombres'
  return 'General'
}

export function matchesSexoOption(sexo: string, selectedSex: string) {
  if (!selectedSex) return true
  if (sexo === 'Ambos') return true
  return sexo === selectedSex
}

export function getDisplayPrice(item: Pick<SubservicioDto, 'precio'> | Pick<VarianteDto, 'precio'>) {
  return item.precio ?? 0
}

export function getDisplayDuration(item: Pick<SubservicioDto, 'duracionMin'> | Pick<VarianteDto, 'duracionMin'>) {
  return item.duracionMin ?? 0
}

export function parsePackItems(detail?: string) {
  if (!detail) return []
  return detail
    .split('+')
    .map((item) => item.replace(/\(.*?\)/g, '').trim())
    .filter(Boolean)
}

export function buildServicePreview(subservicios: SubservicioDto[], selectedSex: string) {
  const labels = subservicios
    .filter((subservicio) => subservicio.activo && matchesSexoOption(subservicio.sexo, selectedSex))
    .flatMap((subservicio) => {
      const variants = subservicio.variantes.filter((variant) => variant.activo && matchesSexoOption(variant.sexo, selectedSex))
      return variants.length > 0 ? variants.map((variant) => variant.nombre) : [subservicio.nombre]
    })

  const previewItems = labels.slice(0, 4)
  const previewOverflow = Math.max(labels.length - previewItems.length, 0)

  return {
    previewItems,
    previewOverflow,
  }
}

export function buildServiceOptions(servicios: ServicioDto[], selectedSex: string) {
  return servicios
    .map((servicio) => {
      const salonId = mapSalonId(servicio.salon)
      if (!salonId) return null

      const visibleSubservicios = servicio.subservicios.filter((subservicio) => {
        if (!subservicio.activo) return false
        if (!matchesSexoOption(subservicio.sexo, selectedSex)) return false

        if (subservicio.variantes.length === 0) return true

        return subservicio.variantes.some((variant) => variant.activo && matchesSexoOption(variant.sexo, selectedSex))
      })

      if (visibleSubservicios.length === 0) return null

      const preview = buildServicePreview(servicio.subservicios, selectedSex)

      return {
        id: servicio.id,
        salonId,
        nombre: servicio.nombre,
        previewItems: preview.previewItems,
        previewOverflow: preview.previewOverflow,
        subservicios: visibleSubservicios,
        iconKey: normalizeTextKey(servicio.nombre),
      } satisfies ServiceOption
    })
    .filter((servicio): servicio is ServiceOption => servicio !== null)
}

export function buildSalonOptions(allServices: ServiceOption[]) {
  return (['salon1', 'salon2'] as const)
    .map((salonId) => {
      const serviciosEnSalon = allServices.filter((service) => service.salonId === salonId)
      if (serviciosEnSalon.length === 0) return null

      return {
        id: salonId,
        nombre: salonId === 'salon1' ? 'Salón 1' : 'Salón 2',
        titulo: salonId === 'salon1' ? 'Estética & bienestar' : 'Peluquería & maquillaje',
        descripcion: serviciosEnSalon.map((service) => service.nombre).join(' · '),
        servicios: serviciosEnSalon.map((service) => service.nombre),
      } satisfies SalonOption
    })
    .filter((salon): salon is SalonOption => salon !== null)
}

export function buildSelectionOptions(selectedService: ServiceOption | null, selectedSex: string) {
  if (!selectedService) {
    return { combos: [] as ComboOption[], zones: [] as ZoneOption[] }
  }

  return selectedService.subservicios.reduce(
    (acc, subservicio) => {
      const activeVariants = subservicio.variantes.filter((variant) => variant.activo && matchesSexoOption(variant.sexo, selectedSex))

      if (activeVariants.length > 0) {
        activeVariants.forEach((variant) => {
          const optionName = `${subservicio.nombre} · ${variant.nombre}`
          const baseOption = {
            nombre: optionName,
            precio: getDisplayPrice(variant),
            duracionMin: getDisplayDuration(variant),
            grupo: mapGrupoFromSexo(variant.sexo),
            subservicioId: subservicio.id,
            varianteId: variant.id,
          }

          if (subservicio.esPack) {
            acc.combos.push({
              id: variant.id,
              nombre: optionName,
              detalle: subservicio.detallePack ?? subservicio.descripcion ?? 'Pack especial',
              precio: baseOption.precio,
              duracionMin: baseOption.duracionMin,
              items: parsePackItems(subservicio.detallePack ?? subservicio.descripcion),
              subservicioId: subservicio.id,
              varianteId: variant.id,
            })
          } else {
            acc.zones.push({
              id: `${subservicio.id}:${variant.id}`,
              ...baseOption,
            })
          }
        })
      } else {
        const baseOption = {
          nombre: subservicio.nombre,
          precio: getDisplayPrice(subservicio),
          duracionMin: getDisplayDuration(subservicio),
          grupo: mapGrupoFromSexo(subservicio.sexo),
          subservicioId: subservicio.id,
        }

        if (subservicio.esPack) {
          acc.combos.push({
            id: subservicio.id,
            nombre: subservicio.nombre,
            detalle: subservicio.detallePack ?? subservicio.descripcion ?? 'Pack especial',
            precio: baseOption.precio,
            duracionMin: baseOption.duracionMin,
            items: parsePackItems(subservicio.detallePack ?? subservicio.descripcion),
            subservicioId: subservicio.id,
          })
        } else {
          acc.zones.push({
            id: `${subservicio.id}:0`,
            ...baseOption,
          })
        }
      }

      return acc
    },
    { combos: [] as ComboOption[], zones: [] as ZoneOption[] },
  )
}

export function toDayAvailabilityFromMonthResponse(
  dias: { fecha: string; horariosDisponibles: string[] }[],
) {
  return dias.map((day) => {
    const date = parseLocalDateIso(day.fecha)

    return {
      id: day.fecha,
      fechaIso: day.fecha,
      etiqueta: formatShortDayLabel(date),
      fechaLarga: formatLongDayLabel(date),
      slots: sortTimes(day.horariosDisponibles).map((hora) => ({ hora })),
    } satisfies DayAvailability
  })
}
