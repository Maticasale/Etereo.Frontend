import { cn } from '@/lib/utils'
import type { EstadoTurno } from '@/types/api'

interface BadgeProps {
  estado: EstadoTurno
  className?: string
}

const estadoConfig: Record<EstadoTurno, { label: string; className: string }> = {
  PendienteConfirmacion: {
    label: 'Pendiente',
    className: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  },
  Confirmado: {
    label: 'Confirmado',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  Realizado: {
    label: 'Realizado',
    className: 'bg-green-50 text-green-700 border border-green-200',
  },
  Cancelado: {
    label: 'Cancelado',
    className: 'bg-gray-100 text-gray-600 border border-gray-200',
  },
  Rechazado: {
    label: 'Rechazado',
    className: 'bg-red-50 text-red-700 border border-red-200',
  },
  Multa: {
    label: 'Multa',
    className: 'bg-orange-50 text-orange-700 border border-orange-200',
  },
  Ausente: {
    label: 'Ausente',
    className: 'bg-red-600 text-white',
  },
  Impago: {
    label: 'Impago',
    className: 'bg-yellow-700 text-white',
  },
  Publicidad: {
    label: 'Publicidad',
    className: 'bg-sky-50 text-sky-700 border border-sky-200',
  },
}

export function Badge({ estado, className }: BadgeProps) {
  const config = estadoConfig[estado]
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-full)]',
        'text-xs font-semibold font-[var(--font-body)]',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
