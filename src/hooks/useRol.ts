import { useAuthStore } from '@/store/authStore'

export function useRol() {
  const usuario = useAuthStore((s) => s.usuario)
  return {
    rol: usuario?.rol ?? null,
    isAdmin: () => usuario?.rol === 'Admin',
    isOperario: () => usuario?.rol === 'Operario',
    isCliente: () => usuario?.rol === 'Cliente',
    hasRole: (...roles: string[]) => !!usuario && roles.includes(usuario.rol),
  }
}
