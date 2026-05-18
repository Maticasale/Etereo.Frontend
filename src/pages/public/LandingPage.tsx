/**
 * LandingPage
 *
 * Página principal pública de Etereo. Ensamble de las 4 secciones:
 *   1. HeroSection    — hero oscuro con botánicos
 *   2. ServiciosSection — grid de servicios reales
 *   3. CalificacionesSection — promedio + reviews + por qué elegirnos
 *   4. FooterSection  — links, redes, contacto
 *
 * Obtiene onReservar del PublicLayout vía useOutletContext.
 * Maneja el redirect ?iniciar_reserva=1 → /reservar.
 */

import { useEffect } from 'react'
import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom'
import HeroSection from './landing/HeroSection'
import ServiciosSection from './landing/ServiciosSection'
import CalificacionesSection from './landing/CalificacionesSection'
import FooterSection from './landing/FooterSection'
import type { PublicOutletContext } from '@/components/layout/PublicLayout'

export default function LandingPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { onReservar } = useOutletContext<PublicOutletContext>()

  // Post-auth redirect: si viene de ?iniciar_reserva=1, llevar al wizard
  useEffect(() => {
    if (searchParams.get('iniciar_reserva') === '1') {
      setSearchParams({}, { replace: true })
      navigate('/reservar', { replace: true })
    }
    // Solo en mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main>
      <HeroSection onReservar={onReservar} />
      <ServiciosSection />
      <CalificacionesSection />
      <FooterSection onReservar={onReservar} />
    </main>
  )
}
