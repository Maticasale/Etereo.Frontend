import { useMemo } from 'react'
import type { CodigoDescuentoDto, CuponDto, ReglaDescuentoSesionPublicaDto } from '@/types/api'
import type { ComboOption, ServiceOption, ZoneOption } from '../types'
import { calculateDiscountValue } from '../utils/reservaFormatters'

interface UseReservaPricingOptions {
  selectedService: ServiceOption | null
  selectedCombo: ComboOption | null
  selectedZones: ZoneOption[]
  selectedCoupon: CuponDto | null
  appliedDiscountCode: CodigoDescuentoDto | null
  reglasDescuento: ReglaDescuentoSesionPublicaDto[]
}

export function useReservaPricing({
  selectedService,
  selectedCombo,
  selectedZones,
  selectedCoupon,
  appliedDiscountCode,
  reglasDescuento,
}: UseReservaPricingOptions) {
  return useMemo(() => {
    const subtotal = selectedCombo ? selectedCombo.precio : selectedZones.reduce((acc, zone) => acc + zone.precio, 0)

    const estimatedDuration = selectedCombo
      ? selectedCombo.duracionMin
      : selectedZones.reduce((acc, zone) => acc + zone.duracionMin, 0)

    const reglaServicio = selectedService
      ? reglasDescuento.find((regla) => regla.servicioId === selectedService.id)
      : null

    const automaticDiscountPct =
      !selectedCombo && reglaServicio && selectedZones.length >= reglaServicio.zonasMinimas ? reglaServicio.porcentajeDescuento : 0

    const automaticDiscountValue = Math.round((subtotal * automaticDiscountPct) / 100)
    const baseAfterAutomaticDiscount = Math.max(subtotal - automaticDiscountValue, 0)
    const couponDiscountValue = calculateDiscountValue(
      selectedCoupon
        ? { tipo: selectedCoupon.tipoDescuento, valor: selectedCoupon.valor }
        : appliedDiscountCode
          ? { tipo: appliedDiscountCode.tipoDescuento, valor: appliedDiscountCode.valor }
          : null,
      baseAfterAutomaticDiscount,
    )
    const total = Math.max(subtotal - automaticDiscountValue - couponDiscountValue, 0)
    const summaryItems = selectedCombo ? selectedCombo.items : selectedZones.map((zone) => zone.nombre)

    return {
      subtotal,
      estimatedDuration,
      automaticDiscountPct,
      automaticDiscountValue,
      couponDiscountValue,
      total,
      summaryItems,
    }
  }, [appliedDiscountCode, reglasDescuento, selectedCombo, selectedCoupon, selectedService, selectedZones])
}
