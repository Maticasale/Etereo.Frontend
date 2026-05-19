import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ArrowUpRight, Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react'
import LandingReveal from './LandingReveal'

interface FooterSectionProps {
  onReservar: () => void
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: ReactNode
}) {
  return (
    <a
      className="landing-social-link"
      href={href}
      aria-label={label}
      style={{
        width: 46,
        height: 46,
        borderRadius: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(223,190,122,0.22)',
        color: 'rgba(255,255,255,0.68)',
        textDecoration: 'none',
        background: 'rgba(255,255,255,0.03)',
        transition: 'transform 220ms ease, background 220ms ease, border-color 220ms ease',
      }}
    >
      {children}
    </a>
  )
}

export default function FooterSection({ onReservar }: FooterSectionProps) {
  const navigate = useNavigate()

  const footerButtonStyle: React.CSSProperties = {
    border: 'none',
    background: 'transparent',
    padding: 0,
    cursor: 'pointer',
    textAlign: 'left',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    color: 'rgba(255,255,255,0.68)',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    lineHeight: 1.5,
  }

  return (
    <footer
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: `
          radial-gradient(circle at 14% 10%, rgba(197,160,89,0.08) 0%, transparent 20%),
          linear-gradient(180deg, #211711 0%, #17110d 100%)
        `,
        color: 'var(--color-tertiary)',
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '88px 24px 24px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr_1fr] gap-12">
          <LandingReveal delay={80}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 60,
                lineHeight: 0.9,
                color: '#dfbe7a',
                marginBottom: 12,
              }}
            >
              Etéreo
            </div>

            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 22,
                lineHeight: 1.45,
                color: 'rgba(255,255,255,0.82)',
                maxWidth: 360,
                marginBottom: 20,
              }}
            >
              Belleza y bienestar en Rafaela, Santa Fe.
            </p>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                lineHeight: 1.82,
                color: 'rgba(255,255,255,0.56)',
                maxWidth: 380,
                marginBottom: 28,
              }}
            >
              Una propuesta pensada para sentirse cuidada, acompañada y cómoda desde la primera
              visita, tanto en el salón como en la experiencia digital.
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <SocialLink href="#" label="Instagram de Etereo">
                <Instagram size={18} />
              </SocialLink>
              <SocialLink href="#" label="Facebook de Etereo">
                <Facebook size={18} />
              </SocialLink>
            </div>
          </LandingReveal>

          <LandingReveal delay={160}>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#dfbe7a',
                marginBottom: 18,
              }}
            >
              Accesos
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <button onClick={onReservar} className="landing-footer-link" style={{ ...footerButtonStyle, transition: 'transform 220ms ease, color 220ms ease' }}>
                Reservar turno <ArrowUpRight size={15} />
              </button>
              <button onClick={() => navigate('/login')} className="landing-footer-link" style={{ ...footerButtonStyle, transition: 'transform 220ms ease, color 220ms ease' }}>
                Ingresar <ArrowUpRight size={15} />
              </button>
              <button onClick={() => navigate('/')} className="landing-footer-link" style={{ ...footerButtonStyle, transition: 'transform 220ms ease, color 220ms ease' }}>
                Inicio <ArrowUpRight size={15} />
              </button>
            </div>
          </LandingReveal>

          <LandingReveal delay={240}>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#dfbe7a',
                marginBottom: 18,
              }}
            >
              Contacto
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <MapPin size={17} color="#dfbe7a" style={{ flexShrink: 0, marginTop: 3 }} />
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 14,
                      lineHeight: 1.65,
                      color: 'rgba(255,255,255,0.7)',
                    }}
                    >
                      Moreno 212, 1° A
                    </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 14,
                      lineHeight: 1.65,
                      color: 'rgba(255,255,255,0.7)',
                    }}
                    >
                      Rafaela, Santa Fe, Argentina
                    </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: 'rgba(223,190,122,0.7)',
                      marginTop: 6,
                    }}
                  >
                    Dos salones en el mismo espacio
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Phone size={16} color="#dfbe7a" />
                <a
                  href="tel:+543564000000"
                  className="landing-footer-contact"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.68)',
                    textDecoration: 'none',
                    transition: 'color 220ms ease',
                  }}
                >
                  +54 3564 000-000
                </a>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Mail size={16} color="#dfbe7a" />
                <a
                  href="mailto:contacto@etereo.com.ar"
                  className="landing-footer-contact"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.68)',
                    textDecoration: 'none',
                    transition: 'color 220ms ease',
                  }}
                >
                  contacto@etereo.com.ar
                </a>
              </div>
            </div>
          </LandingReveal>
        </div>

        <div
          style={{
            marginTop: 54,
            borderTop: '1px solid rgba(223,190,122,0.16)',
            paddingTop: 20,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              letterSpacing: '0.05em',
              color: 'rgba(255,255,255,0.34)',
            }}
          >
            © 2026 Etereo. Todos los derechos reservados.
          </p>
        </div>
      </div>

      <style>{`
        .landing-social-link:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.06);
          border-color: rgba(223,190,122,0.34);
        }

        .landing-footer-link:hover {
          transform: translateX(3px);
          color: rgba(255,255,255,0.92);
        }

        .landing-footer-contact:hover {
          color: rgba(255,255,255,0.92);
        }
      `}</style>
    </footer>
  )
}
