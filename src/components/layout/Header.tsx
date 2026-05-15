import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const ROUTE_TITLES: Record<string, string> = {
  '/panel/dashboard': 'Dashboard',
  '/panel/agenda': 'Agenda',
  '/panel/turnos': 'Turnos',
  '/panel/clientes': 'Clientes',
  '/panel/disponibilidad': 'Disponibilidad',
  '/panel/mis-comisiones': 'Mis Comisiones',
  '/panel/servicios': 'Servicios',
  '/panel/operarios': 'Operarias',
  '/panel/cupones': 'Cupones',
  '/panel/imputaciones': 'Imputaciones',
  '/panel/estadisticas': 'Estadísticas',
  '/panel/comisiones': 'Comisiones',
  '/panel/calificaciones': 'Calificaciones',
  '/panel/config/email': 'Configuración de Email',
  '/panel/catalogos/categorias': 'Categorías',
  '/panel/catalogos/metodos-pago': 'Métodos de Pago',
  '/panel/catalogos/motivos-bloqueo': 'Motivos de Bloqueo',
}

function getTitle(pathname: string): string {
  // Match exacto
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]
  // Match por prefijo (ej: /panel/turnos/123)
  for (const [route, title] of Object.entries(ROUTE_TITLES)) {
    if (pathname.startsWith(route + '/')) return title
  }
  return 'Panel'
}

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation()
  const title = getTitle(location.pathname)

  return (
    <header className="h-14 bg-white shadow-[var(--shadow-sm)] flex items-center px-4 gap-4 flex-shrink-0">
      {/* Hamburguesa (mobile) */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-light)] rounded-[var(--radius-sm)] transition-colors"
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      {/* Título dinámico */}
      <h1
        className="text-base font-semibold text-[var(--color-text-primary)]"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {title}
      </h1>
    </header>
  )
}
