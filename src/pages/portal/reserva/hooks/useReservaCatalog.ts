import { useEffect, useMemo, useState } from 'react'
import { serviciosApi } from '@/api/servicios'
import { getErrorMessage } from '@/lib/errors'
import type { ServicioDto } from '@/types/api'
import { buildSalonOptions, buildSelectionOptions, buildServiceOptions } from '../utils/reservaSelection'

export function useReservaCatalog(selectedSex: string, selectedSalon: 'salon1' | 'salon2' | null, selectedServiceId: number | null) {
  const [servicios, setServicios] = useState<ServicioDto[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        setCatalogLoading(true)
        setCatalogError(null)
        const response = await serviciosApi.getServicios()
        if (cancelled) return
        setServicios(response.filter((servicio) => servicio.activo))
      } catch (error) {
        if (cancelled) return
        setCatalogError(getErrorMessage(error))
      } finally {
        if (!cancelled) {
          setCatalogLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const allServices = useMemo(() => buildServiceOptions(servicios, selectedSex), [servicios, selectedSex])
  const filteredSalones = useMemo(() => buildSalonOptions(allServices), [allServices])
  const availableServices = useMemo(
    () => (selectedSalon ? allServices.filter((service) => service.salonId === selectedSalon) : []),
    [allServices, selectedSalon],
  )
  const selectedService = useMemo(
    () => allServices.find((service) => service.id === selectedServiceId) ?? null,
    [allServices, selectedServiceId],
  )
  const selectionOptions = useMemo(
    () => buildSelectionOptions(selectedService, selectedSex),
    [selectedService, selectedSex],
  )

  return {
    servicios,
    catalogLoading,
    catalogError,
    allServices,
    filteredSalones,
    availableServices,
    selectedService,
    selectionOptions,
  }
}
