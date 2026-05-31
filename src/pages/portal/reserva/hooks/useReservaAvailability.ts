import { useEffect, useState } from 'react'
import { sesionesApi, turnosApi } from '@/api/turnos'
import { getErrorMessage } from '@/lib/errors'
import type { ComboOption, DayAvailability, ZoneOption } from '../types'
import { startOfMonth, toMonthIso } from '../utils/reservaDates'
import { mapSalonEnum, toDayAvailabilityFromMonthResponse } from '../utils/reservaSelection'

interface UseReservaAvailabilityOptions {
  stepId: string
  selectedSalon: 'salon1' | 'salon2' | null
  selectedServiceName: string | null
  selectedCombo: ComboOption | null
  selectedZones: ZoneOption[]
  calendarMonth: Date
}

export function useReservaAvailability({
  stepId,
  selectedSalon,
  selectedServiceName,
  selectedCombo,
  selectedZones,
  calendarMonth,
}: UseReservaAvailabilityOptions) {
  const [availabilityDays, setAvailabilityDays] = useState<DayAvailability[]>([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const selectedSalonEnum = mapSalonEnum(selectedSalon)
  const singleSelection = selectedCombo ?? (selectedZones.length === 1 ? selectedZones[0] : null)
  const isSessionSelection = !selectedCombo && selectedZones.length > 1

  useEffect(() => {
    if (stepId !== 'schedule' || !selectedServiceName || !selectedSalonEnum || (!singleSelection && !isSessionSelection)) {
      return
    }

    let cancelled = false

    const loadAvailability = async () => {
      try {
        setAvailabilityLoading(true)
        setAvailabilityError(null)

        const mes = toMonthIso(startOfMonth(calendarMonth))
        const response = isSessionSelection
          ? await sesionesApi.getDisponibilidadMes({
              mes,
              salon: selectedSalonEnum,
              zonas: selectedZones.map((zone) => ({
                subservicioId: zone.subservicioId,
                varianteId: zone.varianteId,
              })),
            })
          : await turnosApi.getDisponibilidadMes({
              mes,
              subservicioId: singleSelection!.subservicioId,
              varianteId: singleSelection!.varianteId,
              duracionMin: singleSelection!.duracionMin,
            })

        if (cancelled) return

        const monthDays = toDayAvailabilityFromMonthResponse(response.dias)
        setAvailabilityDays(monthDays)
        setSelectedDayId((current) => (current && monthDays.some((day) => day.id === current) ? current : null))
        setSelectedTime(null)
      } catch (error) {
        if (cancelled) return
        setAvailabilityDays([])
        setSelectedDayId(null)
        setSelectedTime(null)
        setAvailabilityError(getErrorMessage(error))
      } finally {
        if (!cancelled) {
          setAvailabilityLoading(false)
        }
      }
    }

    void loadAvailability()

    return () => {
      cancelled = true
    }
  }, [calendarMonth, isSessionSelection, selectedSalonEnum, selectedServiceName, selectedCombo, selectedZones, singleSelection, stepId])

  return {
    availabilityDays,
    availabilityLoading,
    availabilityError,
    selectedDayId,
    setSelectedDayId,
    selectedTime,
    setSelectedTime,
    isSessionSelection,
    singleSelection,
    selectedSalonEnum,
    resetSelectedSchedule() {
      setSelectedDayId(null)
      setSelectedTime(null)
    },
  }
}
