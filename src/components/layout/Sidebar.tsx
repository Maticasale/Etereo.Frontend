import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Users,
  Scissors,
  Tag,
  BarChart2,
  DollarSign,
  Star,
  Clock,
  Mail,
  List,
  CreditCard,
  AlertTriangle,
  LogOut,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth'
import { toast } from '@/store/toastStore'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  roles: string[]
  children?: NavItem[]
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/panel/dashboard',
    icon: <LayoutDashboard size={18} />,
    roles: ['Admin'],
  },
  {
    label: 'Agenda',
    to: '/panel/agenda',
    icon: <Calendar size={18} />,
    roles: ['Admin', 'Operario'],
  },
  {
    label: 'Turnos',
    to: '/panel/turnos',
    icon: <ClipboardList size={18} />,
    roles: ['Admin', 'Operario'],
  },
  {
    label: 'Clientes',
    to: '/panel/clientes',
    icon: <Users size={18} />,
    roles: ['Admin', 'Operario'],
  },
  {
    label: 'Disponibilidad',
    to: '/panel/disponibilidad',
    icon: <Clock size={18} />,
    roles: ['Admin', 'Operario'],
  },
  {
    label: 'Mis Comisiones',
    to: '/panel/mis-comisiones',
    icon: <DollarSign size={18} />,
    roles: ['Operario'],
  },
  // Admin exclusivo
  {
    label: 'Servicios',
    to: '/panel/servicios',
    icon: <Scissors size={18} />,
    roles: ['Admin'],
  },
  {
    label: 'Operarias',
    to: '/panel/operarios',
    icon: <Users size={18} />,
    roles: ['Admin'],
  },
  {
    label: 'Cupones',
    to: '/panel/cupones',
    icon: <Tag size={18} />,
    roles: ['Admin'],
  },
  {
    label: 'Imputaciones',
    to: '/panel/imputaciones',
    icon: <List size={18} />,
    roles: ['Admin'],
  },
  {
    label: 'Estadísticas',
    to: '/panel/estadisticas',
    icon: <BarChart2 size={18} />,
    roles: ['Admin'],
  },
  {
    label: 'Comisiones',
    to: '/panel/comisiones',
    icon: <DollarSign size={18} />,
    roles: ['Admin'],
  },
  {
    label: 'Calificaciones',
    to: '/panel/calificaciones',
    icon: <Star size={18} />,
    roles: ['Admin'],
  },
  {
    label: 'Config. Email',
    to: '/panel/config/email',
    icon: <Mail size={18} />,
    roles: ['Admin'],
  },
  {
    label: 'Catálogos',
    to: '/panel/catalogos',
    icon: <CreditCard size={18} />,
    roles: ['Admin'],
    children: [
      {
        label: 'Categorías',
        to: '/panel/catalogos/categorias',
        icon: <List size={16} />,
        roles: ['Admin'],
      },
      {
        label: 'Métodos de pago',
        to: '/panel/catalogos/metodos-pago',
        icon: <CreditCard size={16} />,
        roles: ['Admin'],
      },
      {
        label: 'Motivos de bloqueo',
        to: '/panel/catalogos/motivos-bloqueo',
        icon: <AlertTriangle size={16} />,
        roles: ['Admin'],
      },
    ],
  },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const [expanded, setExpanded] = useState(false)

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]',
            'text-sm font-medium font-[var(--font-body)]',
            'text-[var(--color-tertiary)]/70 hover:bg-white/10 hover:text-[var(--color-tertiary)]',
            'transition-colors duration-150',
            depth > 0 && 'pl-6',
          )}
        >
          <span className="flex-shrink-0">{item.icon}</span>
          <span className="flex-1 text-left">{item.label}</span>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {expanded && (
          <div className="ml-4 mt-1 flex flex-col gap-0.5">
            {item.children.map((child) => (
              <NavItemComponent key={child.to} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]',
          'text-sm font-medium font-[var(--font-body)]',
          'transition-colors duration-150',
          depth > 0 && 'pl-6',
          isActive
            ? 'bg-white/15 text-[var(--color-tertiary)]'
            : 'text-[var(--color-tertiary)]/70 hover:bg-white/10 hover:text-[var(--color-tertiary)]',
        )
      }
    >
      <span className="flex-shrink-0">{item.icon}</span>
      <span>{item.label}</span>
    </NavLink>
  )
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { usuario, clearAuth, refreshToken } = useAuthStore()
  const navigate = useNavigate()

  const filteredItems = NAV_ITEMS.filter(
    (item) => usuario && item.roles.includes(usuario.rol),
  )

  const handleLogout = async () => {
    try {
      if (refreshToken) await authApi.logout(refreshToken)
    } catch {
      // silencioso
    }
    clearAuth()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  const sidebarContent = (
    <aside
      className={cn(
        'flex flex-col h-full w-[260px] flex-shrink-0',
        'bg-[var(--color-primary)]',
      )}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <span
          className="block text-[28px] font-bold italic text-[var(--color-tertiary)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          etereo
        </span>
        <div className="mt-3 h-px bg-white/10" />
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavItemComponent key={item.to} item={item} />
        ))}
      </nav>

      {/* Footer: usuario */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 rounded-[var(--radius-md)]">
          <div className="w-9 h-9 rounded-full bg-[var(--color-secondary)] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-[var(--color-primary)] font-[var(--font-body)]">
              {usuario?.nombre?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--color-tertiary)] font-[var(--font-body)] truncate">
              {usuario?.nombre} {usuario?.apellido}
            </p>
            <p className="text-xs text-[var(--color-tertiary)]/60 font-[var(--font-body)]">
              {usuario?.rol}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="text-[var(--color-tertiary)]/60 hover:text-[var(--color-tertiary)] transition-colors p-1"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )

  // Mobile: overlay drawer
  if (onClose) {
    return (
      <>
        {/* Overlay */}
        <div
          className={cn(
            'fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity',
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
          onClick={onClose}
        />
        {/* Drawer */}
        <div
          className={cn(
            'fixed left-0 top-0 h-full z-40 md:hidden transition-transform duration-300',
            isOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          {sidebarContent}
        </div>
      </>
    )
  }

  return sidebarContent
}
