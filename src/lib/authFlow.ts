import type { UsuarioDto } from '@/types/api'

export function needsProfileCompletion(usuario: UsuarioDto | null | undefined): boolean {
  if (!usuario) return false
  if (usuario.rol !== 'Cliente') return false

  const telefonoMissing = !usuario.telefono?.trim()
  const sexoMissing = !usuario.sexo || usuario.sexo === 'NoEspecifica'

  return telefonoMissing || sexoMissing
}
