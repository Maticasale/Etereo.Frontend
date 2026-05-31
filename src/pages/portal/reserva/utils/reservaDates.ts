import { capitalize } from './reservaFormatters'

export const CALENDAR_WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const

export function parseLocalDateIso(fecha: string) {
  const [year, month, day] = fecha.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function toLocalDateIso(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function toMonthIso(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatShortDayLabel(date: Date) {
  const weekday = capitalize(
    new Intl.DateTimeFormat('es-AR', {
      weekday: 'short',
    })
      .format(date)
      .replace('.', ''),
  )

  return `${weekday} ${date.getDate()}`
}

export function formatLongDayLabel(date: Date) {
  const parts = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).formatToParts(date)

  const weekday = capitalize(parts.find((part) => part.type === 'weekday')?.value ?? '')
  const day = parts.find((part) => part.type === 'day')?.value ?? ''
  const month = parts.find((part) => part.type === 'month')?.value ?? ''

  return `${weekday} ${day} de ${month}`
}
