import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight, CalendarHeart } from 'lucide-react'

interface PublicHeaderProps {
  onReservar: () => void
}

export default function PublicHeader({ onReservar }: PublicHeaderProps) {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        style={{
          position: 'fixed',
          inset: '0 0 auto 0',
          zIndex: 120,
          padding: scrolled ? '14px 18px 0' : '20px 122px 0',
          transition: 'padding 220ms ease',
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            borderRadius: 9999,
            position: 'relative',
            overflow: 'hidden',
            background: scrolled
              ? 'linear-gradient(180deg, rgba(38,27,20,0.86) 0%, rgba(30,21,16,0.82) 100%)'
              : 'linear-gradient(180deg, rgba(69,50,38,0.74) 0%, rgba(58,42,31,0.68) 100%)',
            border: scrolled
              ? '1px solid rgba(197,160,89,0.18)'
              : '1px solid rgba(255,255,255,0.1)',
            boxShadow: scrolled
              ? '0 18px 38px rgba(20,13,9,0.22)'
              : '0 12px 28px rgba(20,13,9,0.12)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            transform: scrolled ? 'translateY(0)' : 'translateY(0)',
            transition:
              'background 220ms ease, border-color 220ms ease, box-shadow 220ms ease, transform 220ms ease',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 32%, rgba(231,203,140,0.04) 100%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              minHeight: scrolled ? 66 : 74,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 18,
              padding: '0 18px 0 24px',
              position: 'relative',
              zIndex: 1,
              transition: 'min-height 220ms ease',
            }}
          >
            <Link
              to="/"
              className="group"
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minWidth: 0,
                paddingTop: 2,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: scrolled ? 44 : 48,
                  lineHeight: 0.9,
                  color: scrolled ? '#f0dfbc' : 'rgba(255,255,255,0.97)',
                  textShadow: '0 2px 16px rgba(0,0,0,0.14)',
                  transformOrigin: 'left center',
                  transition: 'font-size 220ms ease, color 220ms ease, transform 180ms ease',
                }}
              >
                Etéreo
              </span>

              <span
                style={{
                  marginTop: 2,
                  paddingLeft: 4,
                  fontFamily: 'var(--font-body)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: scrolled ? '0.24em' : '0.28em',
                  textTransform: 'uppercase',
                  color: scrolled ? 'rgba(255,255,255,0.54)' : 'rgba(255,255,255,0.5)',
                  transition: 'color 220ms ease, letter-spacing 220ms ease',
                }}
              >
                Salón & bienestar
              </span>
            </Link>

            <nav className="hidden sm:flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="public-header-login"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.84)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 9999,
                  transition: 'color 180ms ease, background 180ms ease, transform 180ms ease',
                }}
              >
                Ingresar
                <ArrowUpRight size={14} strokeWidth={1.8} />
              </button>

              <button
                onClick={onReservar}
                className="public-header-cta"
                style={{
                  border: '1px solid rgba(197,160,89,0.14)',
                  background: 'linear-gradient(135deg, #f4e1b4 0%, #ddb66f 48%, #c18c45 100%)',
                  color: '#2C1F14',
                  borderRadius: 9999,
                  padding: scrolled ? '14px 22px' : '15px 24px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 10px 24px rgba(126, 88, 28, 0.18)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  transition:
                    'transform 180ms ease, box-shadow 180ms ease, filter 180ms ease, padding 220ms ease',
                }}
              >
                <CalendarHeart size={16} strokeWidth={1.8} />
                Reservar turno
              </button>
            </nav>

            <nav className="flex sm:hidden items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.84)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Ingresar
              </button>

              <button
                onClick={onReservar}
                style={{
                  border: '1px solid rgba(197,160,89,0.16)',
                  background: 'linear-gradient(135deg, #f4e1b4 0%, #ddb66f 48%, #c18c45 100%)',
                  color: '#2C1F14',
                  borderRadius: 9999,
                  padding: '12px 16px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Reservar
              </button>
            </nav>
          </div>
        </div>
      </header>

      <style>{`
        .group:hover span:first-child {
          transform: translateX(1px);
        }

        .public-header-login:hover {
          color: #f3e4c3;
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-1px);
        }

        .public-header-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 30px rgba(126, 88, 28, 0.24);
          filter: saturate(1.03);
        }
      `}</style>
    </>
  )
}
