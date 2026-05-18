/**
 * PublicHeader
 *
 * Header fijo en la parte superior para rutas públicas (LandingPage, etc.)
 * - Transparente sobre el Hero, se solidifica con blur al hacer scroll
 * - Wordmark "etereo" en Great Vibes
 * - Desktop: botones [Ingresar] + [Reservar turno]
 * - Mobile: botón [Reservar] + link de texto "Ingresar"
 */

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

interface PublicHeaderProps {
  onReservar: () => void
}

export default function PublicHeader({ onReservar }: PublicHeaderProps) {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const solidBg = 'rgba(74, 55, 40, 0.96)'
  const transparentBg = 'transparent'

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 68,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        background: scrolled ? solidBg : transparentBg,
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(197,160,89,0.15)' : 'none',
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease, border-bottom 0.3s ease',
      }}
    >
      {/* ── Wordmark ── */}
      <Link
        to="/"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          fontWeight: 400,
          lineHeight: 1,
          textDecoration: 'none',
          color: scrolled ? 'var(--color-secondary)' : 'white',
          transition: 'color 0.3s ease',
        }}
      >
        etereo
      </Link>

      {/* ── Desktop CTAs ── */}
      <nav className="hidden sm:flex items-center gap-3">
        <button
          onClick={() => navigate('/login')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.5)',
            color: 'white',
            padding: '8px 20px',
            borderRadius: 'var(--radius-full)',
            fontSize: 13,
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            cursor: 'pointer',
            letterSpacing: '0.02em',
            transition: 'background 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
          }}
        >
          Ingresar
        </button>

        <button
          onClick={onReservar}
          style={{
            background: 'var(--color-secondary)',
            border: 'none',
            color: '#2C1F14',
            padding: '9px 22px',
            borderRadius: 'var(--radius-full)',
            fontSize: 13,
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.02em',
            transition: 'background 0.2s ease, transform 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-secondary-hover)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-secondary)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          Reservar turno
        </button>
      </nav>

      {/* ── Mobile CTAs ── */}
      <nav className="flex sm:hidden items-center gap-3">
        <Link
          to="/login"
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.85)',
            textDecoration: 'none',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
          }}
        >
          Ingresar
        </Link>
        <button
          onClick={onReservar}
          style={{
            background: 'var(--color-secondary)',
            border: 'none',
            color: '#2C1F14',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: 12,
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reservar
        </button>
      </nav>
    </header>
  )
}
