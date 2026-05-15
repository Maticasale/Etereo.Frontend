import { type ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'

interface RolGuardProps {
  roles: string[]
  children: ReactNode
  fallback?: ReactNode
}

export function RolGuard({ roles, children, fallback = null }: RolGuardProps) {
  const usuario = useAuthStore((s) => s.usuario)
  if (!usuario || !roles.includes(usuario.rol)) return <>{fallback}</>
  return <>{children}</>
}
