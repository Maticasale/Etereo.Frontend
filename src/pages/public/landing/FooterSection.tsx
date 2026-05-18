/**
 * FooterSection
 *
 * Sección 4 de la LandingPage. Footer oscuro (#2a1d12) con:
 * Col 1 — Marca: wordmark, tagline, redes sociales
 * Col 2 — Navegación: links públicos
 * Col 3 — Contacto: dirección, teléfono, email
 */

import { useNavigate } from 'react-router-dom'
import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react'

interface FooterSectionProps {
  onReservar: () => void
}

// ─── Estilos reutilizables ────────────────────────────────────────────────────

const footerLink: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  fontWeight: 400,
  color: 'rgba(255,255,255,0.65)',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'color 0.2s ease',
  display: 'block',
  padding: '3px 0',
  background: 'none',
  border: 'none',
  textAlign: 'left',
}

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 11,
  fontWeight: 600,
  color: '#C5A059',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  marginBottom: 18,
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function FooterSection({ onReservar }: FooterSectionProps) {
  const navigate = useNavigate()

  return (
    <footer
      style={{
        background: '#2a1d12',
        padding: '64px 0 0',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* ── Grid 3 columnas ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 pb-12">

          {/* Col 1 — Marca */}
          <div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 40,
              fontWeight: 400,
              color: '#C5A059',
              display: 'block',
              lineHeight: 1,
              marginBottom: 14,
            }}>
              etereo
            </span>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.65,
              marginBottom: 22,
            }}>
              Belleza y bienestar en San Francisco, Santa Fe.
            </p>

            {/* Redes sociales */}
            <div style={{ display: 'flex', gap: 12 }}>
              <a
                href="#"
                aria-label="Instagram de Etereo"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  border: '1px solid rgba(197,160,89,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s ease, color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#C5A059'
                  e.currentTarget.style.color = '#C5A059'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(197,160,89,0.3)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                }}
              >
                <Instagram size={16} />
              </a>
              <a
                href="#"
                aria-label="Facebook de Etereo"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  border: '1px solid rgba(197,160,89,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s ease, color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#C5A059'
                  e.currentTarget.style.color = '#C5A059'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(197,160,89,0.3)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                }}
              >
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Col 2 — Navegación */}
          <div>
            <p style={sectionTitle}>Accesos</p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button
                onClick={onReservar}
                style={footerLink}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
              >
                Reservar turno
              </button>
              <button
                onClick={() => navigate('/login')}
                style={footerLink}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
              >
                Ingresar
              </button>
              <button
                onClick={() => navigate('/')}
                style={footerLink}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
              >
                Inicio
              </button>
            </nav>
          </div>

          {/* Col 3 — Contacto */}
          <div>
            <p style={sectionTitle}>Contacto</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <MapPin size={15} color="rgba(197,160,89,0.7)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                    Moreno 212, 1° A
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                    San Francisco, Santa Fe, Argentina
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(197,160,89,0.6)', marginTop: 3 }}>
                    Dos salones en el mismo espacio
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Phone size={15} color="rgba(197,160,89,0.7)" style={{ flexShrink: 0 }} />
                <a
                  href="tel:+543564000000"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.65)',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'white' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
                >
                  +54 3564 000-000
                </a>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={15} color="rgba(197,160,89,0.7)" style={{ flexShrink: 0 }} />
                <a
                  href="mailto:contacto@etereo.com.ar"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.65)',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'white' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
                >
                  contacto@etereo.com.ar
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* ── Línea separadora + copyright ── */}
        <div style={{
          borderTop: '1px solid rgba(197,160,89,0.15)',
          padding: '20px 0',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.03em',
          }}>
            © 2026 Etereo. Todos los derechos reservados.
          </p>
        </div>

      </div>
    </footer>
  )
}
