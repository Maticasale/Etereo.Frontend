/**
 * useReservaTurno
 *
 * Centraliza la lógica de "¿abro el modal de auth o arranco el wizard directo?".
 *
 * Uso:
 *   const { handleReservarTurno, modalOpen, setModalOpen, wizardOpen, setWizardOpen } = useReservaTurno()
 *
 * handleReservarTurno():
 *   - Si hay usuario logueado (cualquier rol) → wizardOpen = true
 *   - Si no hay usuario → modalOpen = true (ReservaTurnoModal)
 *
 * Auto-inicio post-login:
 *   Si la URL contiene ?iniciar_reserva=1 (viniendo de /login?redirect=reserva
 *   o /registro?redirect=reserva), limpia el param y pone wizardOpen = true.
 */

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export interface UseReservaTurnoReturn {
  /** Controla visibilidad del ReservaTurnoModal (solo cuando no hay usuario) */
  modalOpen: boolean
  setModalOpen: (open: boolean) => void
  /** Controla visibilidad del wizard de reserva */
  wizardOpen: boolean
  setWizardOpen: (open: boolean) => void
  /**
   * Llamar desde cualquier botón "Reservar turno".
   * Decide automáticamente si abrir modal o wizard.
   */
  handleReservarTurno: () => void
}

export function useReservaTurno(): UseReservaTurnoReturn {
  const { usuario } = useAuthStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  // Auto-inicio: detecta ?iniciar_reserva=1 y arranca el wizard
  useEffect(() => {
    if (searchParams.get('iniciar_reserva') === '1') {
      // Limpiar query param para no contaminar el historial del browser
      setSearchParams({}, { replace: true })
      setWizardOpen(true)
    }
    // Solo en mount — no queremos reaccionar a cambios manuales de URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleReservarTurno() {
    if (usuario) {
      setWizardOpen(true)
    } else {
      setModalOpen(true)
    }
  }

  return {
    modalOpen,
    setModalOpen,
    wizardOpen,
    setWizardOpen,
    handleReservarTurno,
  }
}
