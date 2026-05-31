import type { CodigoDescuentoDto, CuponDto } from '@/types/api'

export function normalizeTextKey(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}

export function sortTimes(times: string[]) {
  return [...times].sort((a, b) => a.localeCompare(b))
}

export function getDiscountMeta(
  selectedCoupon: CuponDto | null,
  appliedDiscountCode: CodigoDescuentoDto | null,
) {
  if (selectedCoupon) {
    return {
      tipo: selectedCoupon.tipoDescuento,
      valor: selectedCoupon.valor,
      label: `Cupón ${selectedCoupon.codigo}`,
      description: `El beneficio de ${selectedCoupon.codigo} se consume recién cuando la reserva sea confirmada.`,
    }
  }

  if (appliedDiscountCode) {
    return {
      tipo: appliedDiscountCode.tipoDescuento,
      valor: appliedDiscountCode.valor,
      label: `Código ${appliedDiscountCode.codigo}`,
      description: `El código ${appliedDiscountCode.codigo} se consume recién cuando la reserva sea confirmada.`,
    }
  }

  return null
}

export function calculateDiscountValue(
  discount:
    | {
        tipo: string
        valor: number
      }
    | null,
  baseAmount: number,
) {
  if (!discount || baseAmount <= 0) return 0
  if (discount.tipo === 'MontoFijo') return Math.min(discount.valor, baseAmount)
  return Math.round((baseAmount * discount.valor) / 100)
}

export function botanicalPattern(opacity: number) {
  return {
    background: `
      radial-gradient(circle at 12% 22%, rgba(197,160,89,${opacity}) 0, transparent 18%),
      radial-gradient(circle at 82% 12%, rgba(249,245,240,${opacity * 0.12}) 0, transparent 20%),
      radial-gradient(circle at 80% 76%, rgba(197,160,89,${opacity * 0.75}) 0, transparent 22%),
      linear-gradient(135deg, rgba(255,255,255,0.03) 0, transparent 50%),
      linear-gradient(180deg, rgba(74,55,40,0.98) 0%, rgba(45,31,22,0.99) 100%)
    `,
  }
}
