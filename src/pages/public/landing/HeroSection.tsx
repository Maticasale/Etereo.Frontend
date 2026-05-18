/**
 * HeroSection
 *
 * Sección 1 de la LandingPage. 100vh, fondo oscuro marrón-dorado con decoración
 * botánica SVG inline (adaptada de LoginPage). Wordmark "etereo" + tagline + CTAs.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Decoración botánica SVG ──────────────────────────────────────────────────

function HeroBotanicalSVG() {
  return (
    <svg
      viewBox="0 0 1400 900"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.38, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="heroLeafGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(197,160,89,0.65)" />
          <stop offset="100%" stopColor="rgba(197,160,89,0.04)" />
        </linearGradient>
      </defs>
      <g fill="url(#heroLeafGrad)" stroke="rgba(197,160,89,0.35)" strokeWidth="0.7">
        {/* Tallo izquierdo */}
        <path d="M 30 -20 Q 15 220 20 450 T 10 930" fill="none" stroke="rgba(197,160,89,0.28)" strokeWidth="1" />
        <path d="M 60 -10 Q 50 240 55 470 T 40 930" fill="none" stroke="rgba(197,160,89,0.2)" strokeWidth="0.8" />
        {/* Hojas izquierda */}
        {Array.from({ length: 22 }).map((_, i) => {
          const y = 10 + i * 42
          const x = 35 + Math.sin(i * 0.55) * 45
          const rot = -38 + (i % 2 ? 72 : -12)
          const ry = 26 + (i % 3) * 7
          return (
            <ellipse key={`hl${i}`} cx={x} cy={y} rx={5} ry={ry}
              transform={`rotate(${rot} ${x} ${y})`} />
          )
        })}
        {/* Segunda rama izquierda (más alejada del borde) */}
        {Array.from({ length: 16 }).map((_, i) => {
          const y = 80 + i * 52
          const x = 80 + Math.cos(i * 0.7) * 30
          const rot = 22 + (i % 2 ? -55 : 48)
          const ry = 22 + (i % 3) * 5
          return (
            <ellipse key={`hl2${i}`} cx={x} cy={y} rx={4} ry={ry}
              transform={`rotate(${rot} ${x} ${y})`} />
          )
        })}
        {/* Tallo derecho */}
        <path d="M 1370 -20 Q 1385 220 1380 450 T 1390 930" fill="none" stroke="rgba(197,160,89,0.28)" strokeWidth="1" />
        <path d="M 1340 -10 Q 1350 240 1345 470 T 1360 930" fill="none" stroke="rgba(197,160,89,0.2)" strokeWidth="0.8" />
        {/* Hojas derecha */}
        {Array.from({ length: 24 }).map((_, i) => {
          const y = 20 + i * 38
          const x = 1368 + Math.cos(i * 0.5) * 38
          const rot = 35 + (i % 2 ? -65 : 55)
          const ry = 24 + (i % 3) * 8
          return (
            <ellipse key={`hr${i}`} cx={x} cy={y} rx={5} ry={ry}
              transform={`rotate(${rot} ${x} ${y})`} />
          )
        })}
        {/* Segunda rama derecha */}
        {Array.from({ length: 14 }).map((_, i) => {
          const y = 60 + i * 58
          const x = 1320 + Math.sin(i * 0.6) * 28
          const rot = -28 + (i % 2 ? 62 : -42)
          const ry = 20 + (i % 3) * 6
          return (
            <ellipse key={`hr2${i}`} cx={x} cy={y} rx={4} ry={ry}
              transform={`rotate(${rot} ${x} ${y})`} />
          )
        })}
      </g>
    </svg>
  )
}

// ─── Indicador de scroll ──────────────────────────────────────────────────────

function ScrollIndicator({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        bottom: 36,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
      }}
    >
      <span style={{
        fontSize: 9,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: 'rgba(197,160,89,0.7)',
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
      }}>
        Scroll
      </span>
      <svg
        width="20"
        height="28"
        viewBox="0 0 20 28"
        fill="none"
        style={{ animation: 'heroScrollBounce 1.6s ease-in-out infinite' }}
      >
        <path d="M10 0 L10 20 M4 14 L10 20 L16 14" stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface HeroSectionProps {
  onReservar: () => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function HeroSection({ onReservar }: HeroSectionProps) {
  const navigate = useNavigate()
  const [showScroll, setShowScroll] = useState(true)

  useEffect(() => {
    const handler = () => setShowScroll(window.scrollY < 80)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: `
          radial-gradient(ellipse at 20% 85%, rgba(197,160,89,0.18) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 15%, rgba(249,245,240,0.05) 0%, transparent 55%),
          linear-gradient(180deg, #5a4530 0%, #4A3728 55%, #2a1d12 100%)
        `,
      }}
    >
      <HeroBotanicalSVG />

      {/* Overlay superior sutil */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 200,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* ── Contenido ── */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: 640,
        padding: '0 24px',
        gap: 0,
      }}>
        {/* Wordmark */}
        <span style={{
          fontFamily: 'var(--font-display)',
          color: '#C5A059',
          fontWeight: 400,
          lineHeight: 1,
          display: 'block',
          textShadow: '0 4px 40px rgba(0,0,0,0.4)',
        }}
          className="text-[64px] md:text-[96px]"
        >
          etereo
        </span>

        {/* Tagline */}
        <p style={{
          marginTop: 20,
          fontFamily: 'var(--font-heading)',
          fontStyle: 'italic',
          color: 'rgba(255,255,255,0.82)',
          lineHeight: 1.5,
          fontWeight: 400,
        }}
          className="text-base md:text-[22px]"
        >
          Belleza, cuidado y bienestar en San Francisco
        </p>

        {/* Separador dorado */}
        <div style={{
          marginTop: 28,
          width: 48,
          height: 1,
          background: 'linear-gradient(90deg, transparent, #C5A059, transparent)',
        }} />

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row gap-3 mt-8 w-full sm:w-auto"
        >
          {/* Reservar */}
          <button
            onClick={onReservar}
            style={{
              background: '#C5A059',
              border: 'none',
              color: '#2C1F14',
              padding: '16px 36px',
              borderRadius: 'var(--radius-full)',
              fontSize: 15,
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition: 'background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease',
              boxShadow: '0 4px 20px rgba(197,160,89,0.35)',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#b08a42'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 28px rgba(197,160,89,0.45)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#C5A059'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(197,160,89,0.35)'
            }}
          >
            Reservar mi turno
          </button>

          {/* Ingresar */}
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.6)',
              color: 'white',
              padding: '16px 36px',
              borderRadius: 'var(--radius-full)',
              fontSize: 15,
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition: 'background 0.2s ease, border-color 0.2s ease, transform 0.15s ease',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.9)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Ingresar
          </button>
        </div>
      </div>

      <ScrollIndicator visible={showScroll} />

      <style>{`
        @keyframes heroScrollBounce {
          0%, 100% { transform: translateY(0); opacity: 0.7; }
          50% { transform: translateY(6px); opacity: 1; }
        }
      `}</style>
    </section>
  )
}
