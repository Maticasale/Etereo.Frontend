/**
 * PublicLayout
 *
 * Layout contenedor para rutas públicas (LandingPage, ReservaTurnoPage, etc.).
 * Renderiza PublicHeader + <Outlet /> sin Sidebar.
 *
 * Maneja el estado del ReservaTurnoModal y expone el handler via Outlet context,
 * para que LandingPage y sus secciones puedan disparar la reserva sin duplicar modales.
 */

import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import PublicHeader from './PublicHeader'
import { ReservaTurnoModal } from '@/components/shared/ReservaTurnoModal'

export interface PublicOutletContext {
  onReservar: () => void
}

export default function PublicLayout() {
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
  const [modalOpen, setModalOpen] = useState(false)

  function handleReservarTurno() {
    if (usuario) {
      navigate('/reservar')
    } else {
      setModalOpen(true)
    }
  }

  return (
    <div style={{ background: 'var(--color-tertiary)' }}>
      <PublicHeader onReservar={handleReservarTurno} />

      <Outlet context={{ onReservar: handleReservarTurno } satisfies PublicOutletContext} />

      <ReservaTurnoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAnonimo={() => {
          setModalOpen(false)
          navigate('/reservar')
        }}
      />
    </div>
  )
}
