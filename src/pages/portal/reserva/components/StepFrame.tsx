import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

export function StepFrame({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker: string
  title: string
  subtitle: string
  children: ReactNode
}) {
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const [hasOverflow, setHasOverflow] = useState(false)
  const [showTopFade, setShowTopFade] = useState(false)
  const [showBottomFade, setShowBottomFade] = useState(false)

  useEffect(() => {
    const node = bodyRef.current
    if (!node) return

    node.scrollTo({ top: 0, behavior: 'auto' })

    const updateState = () => {
      const overflow = node.scrollHeight - node.clientHeight > 12
      const currentScroll = node.scrollTop
      const maxScroll = node.scrollHeight - node.clientHeight

      setHasOverflow(overflow)
      setShowTopFade(overflow && currentScroll > 8)
      setShowBottomFade(overflow && currentScroll < maxScroll - 8)
    }

    updateState()

    node.addEventListener('scroll', updateState, { passive: true })
    window.addEventListener('resize', updateState)

    const resizeObserver = new ResizeObserver(() => updateState())
    resizeObserver.observe(node)

    return () => {
      node.removeEventListener('scroll', updateState)
      window.removeEventListener('resize', updateState)
      resizeObserver.disconnect()
    }
  }, [children])

  return (
    <section className="wizard-panel wizard-animate">
      <div className="wizard-panel-header">
        <span className="wizard-kicker">{kicker}</span>
        <h1 className="wizard-title">{title}</h1>
        <p className="wizard-subtitle">{subtitle}</p>
      </div>

      <div
        className={`wizard-panel-body-shell ${hasOverflow ? 'has-overflow' : ''} ${showTopFade ? 'show-top-fade' : ''} ${showBottomFade ? 'show-bottom-fade' : ''}`}
      >
        <div ref={bodyRef} className="wizard-panel-body">
          {children}
        </div>

        {showBottomFade ? (
          <button
            type="button"
            className="wizard-scroll-hint"
            onClick={() => bodyRef.current?.scrollBy({ top: 240, behavior: 'smooth' })}
          >
            <span>Deslizá para ver más</span>
            <ChevronDown size={15} />
          </button>
        ) : null}
      </div>
    </section>
  )
}
