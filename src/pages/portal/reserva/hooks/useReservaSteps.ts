import { useMemo } from 'react'
import type { ReservaStepId } from '../types'

interface UseReservaStepsOptions {
  includeGuestData: boolean
}

export function useReservaSteps({ includeGuestData }: UseReservaStepsOptions) {
  const steps = useMemo(() => {
    const base: { id: ReservaStepId; label: string }[] = []

    if (includeGuestData) {
      base.push({ id: 'guest-data', label: 'Tus datos' })
    }

    base.push(
      { id: 'service', label: 'Servicio' },
      { id: 'selection', label: 'Selección' },
      { id: 'schedule', label: 'Horario' },
      { id: 'coupon', label: 'Cupón' },
      { id: 'confirmation', label: 'Confirmar' },
      { id: 'success', label: 'Éxito' },
    )

    return base
  }, [includeGuestData])

  const visibleSteps = useMemo(() => steps.filter((step) => step.id !== 'success'), [steps])
  const firstStepId = steps[0]?.id ?? 'service'

  return {
    steps,
    visibleSteps,
    firstStepId,
    isVisibleStep(stepId: ReservaStepId) {
      return visibleSteps.some((step) => step.id === stepId)
    },
    getStepIndex(stepId: ReservaStepId) {
      return steps.findIndex((step) => step.id === stepId)
    },
    getVisibleIndex(stepId: ReservaStepId) {
      return visibleSteps.findIndex((step) => step.id === stepId)
    },
    getNextStep(stepId: ReservaStepId) {
      const index = steps.findIndex((step) => step.id === stepId)
      return index >= 0 ? (steps[index + 1]?.id ?? stepId) : stepId
    },
    getPreviousStep(stepId: ReservaStepId) {
      const index = steps.findIndex((step) => step.id === stepId)
      return index > 0 ? steps[index - 1].id : firstStepId
    },
  }
}
