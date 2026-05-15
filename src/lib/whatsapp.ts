export function buildWhatsAppUrl(telefono: string, mensaje: string): string {
  const numero = telefono.replace(/\D/g, '')
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
}
