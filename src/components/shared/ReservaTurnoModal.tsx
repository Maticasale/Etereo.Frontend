/**
 * ReservaTurnoModal
 *
 * Se muestra cuando un cliente NO logueado toca "Reservar turno".
 * Si el usuario ya está logueado (cualquier rol), el modal nunca se monta.
 *
 * Flujo:
 *   "Ingresar con Google"  → Google OAuth flow
 *   "Ingresar con email"   → /login?redirect=reserva
 *   "Registrarme gratis"   → /registro?redirect=reserva
 *   "Continuar sin cuenta" → onAnonimo() (cierra modal e inicia wizard anónimo)
 */

import * as Dialog from '@radix-ui/react-dialog'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useState } from 'react'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { getErrorCode, getErrorMessage } from '@/lib/errors'
import { needsProfileCompletion } from '@/lib/authFlow'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ReservaTurnoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Llamado cuando el usuario elige "Continuar sin cuenta" */
  onAnonimo: () => void
}

// ─── Beneficios ───────────────────────────────────────────────────────────────

const BENEFICIOS = [
  {
    emoji: '🎟️',
    titulo: 'Cupones de descuento exclusivos',
    descripcion: 'Accedé a promociones que no están disponibles para turnos sin cuenta',
  },
  {
    emoji: '📋',
    titulo: 'Historial de tus turnos',
    descripcion: 'Revisá tus turnos anteriores y programá los próximos fácilmente',
  },
  {
    emoji: '⚡',
    titulo: 'Reserva más rápida',
    descripcion: 'Tus datos guardados, sin completar el formulario cada vez',
  },
  {
    emoji: '⭐',
    titulo: 'Calificá tus servicios',
    descripcion: 'Dejá tu opinión y ayudá a otras clientas a elegir',
  },
] as const

// ─── SVG botánico (versión reducida para el panel del modal) ─────────────────

function BotanicalSVGModal() {
  return (
    <svg
      viewBox="0 0 300 600"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', top: 0, right: -20, width: '90%', height: '100%', opacity: 0.35 }}
    >
      <defs>
        <linearGradient id="leafGradModal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(197,160,89,0.7)" />
          <stop offset="100%" stopColor="rgba(197,160,89,0.04)" />
        </linearGradient>
      </defs>
      <g fill="url(#leafGradModal)" stroke="rgba(197,160,89,0.45)" strokeWidth="0.7">
        <path d="M 230 -10 Q 210 130 185 280 T 160 600" fill="none" />
        <path d="M 260 0 Q 255 150 240 310 T 220 600" fill="none" />
        {Array.from({ length: 18 }).map((_, i) => {
          const y = 20 + i * 30
          const x = 220 + Math.sin(i * 0.6) * 35
          const rot = -35 + (i % 2 ? 65 : -15)
          return (
            <ellipse
              key={i}
              cx={x}
              cy={y}
              rx="5"
              ry={22 + (i % 3) * 5}
              transform={`rotate(${rot} ${x} ${y})`}
            />
          )
        })}
        {Array.from({ length: 12 }).map((_, i) => {
          const y = 60 + i * 42
          const x = 265 + Math.cos(i * 0.8) * 20
          const rot = 25 + (i % 2 ? -45 : 65)
          return (
            <ellipse
              key={'b' + i}
              cx={x}
              cy={y}
              rx="4"
              ry={18 + (i % 3) * 4}
              transform={`rotate(${rot} ${x} ${y})`}
            />
          )
        })}
      </g>
    </svg>
  )
}

// ─── Mapeo de errores ─────────────────────────────────────────────────────────

function mapBackendError(codigo: string | undefined, fallback: string): string {
  switch (codigo) {
    case 'CREDENCIALES_INVALIDAS':
      return 'No pudimos autenticarte. Intentá con email o registrate.'
    case 'CUENTA_BLOQUEADA':
      return 'Tu cuenta fue bloqueada. Contactá al salón.'
    case 'USAR_GOOGLE_AUTH':
      return 'Esta cuenta usa Google. Ingresá con el botón de Google.'
    default:
      return fallback || 'Ocurrió un error al ingresar con Google'
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ReservaTurnoModal({ open, onOpenChange, onAnonimo }: ReservaTurnoModalProps) {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return
    setGoogleError(null)
    setIsGoogleLoading(true)
    try {
      const { accessToken, refreshToken, usuario } = await authApi.googleLogin(
        credentialResponse.credential,
      )
      setAuth(accessToken, refreshToken, usuario)
      toast.success(`¡Bienvenida, ${usuario.nombre}!`)
      onOpenChange(false)

      if (needsProfileCompletion(usuario)) {
        navigate('/completar-perfil?redirect=reserva', { replace: true })
        return
      }

      // Post-auth: iniciar wizard directo
      navigate('/?iniciar_reserva=1', { replace: true })
    } catch (err) {
      setGoogleError(mapBackendError(getErrorCode(err), getErrorMessage(err)))
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleEmail = () => {
    onOpenChange(false)
    navigate('/login?redirect=reserva')
  }

  const handleRegistro = () => {
    onOpenChange(false)
    navigate('/registro?redirect=reserva')
  }

  const handleAnonimo = () => {
    onOpenChange(false)
    onAnonimo()
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(44,31,20,0.55)',
            backdropFilter: 'blur(2px)',
            zIndex: 40,
          }}
        />

        {/* Panel */}
        <Dialog.Content
          style={{
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
            width: '90vw',
            maxWidth: 820,
            maxHeight: '92vh',
            overflow: 'hidden',
            borderRadius: 4,
            boxShadow: '0 24px 80px rgba(44,31,20,0.35)',
            display: 'grid',
            gridTemplateColumns: '1fr 1.1fr',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
          aria-describedby={undefined}
        >
          {/* ── Panel izquierdo: marca + decoración ──────── */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: `
                radial-gradient(ellipse at 25% 85%, rgba(197,160,89,0.25) 0%, transparent 55%),
                radial-gradient(ellipse at 75% 15%, rgba(249,245,240,0.07) 0%, transparent 55%),
                linear-gradient(170deg, #5a4530 0%, #4A3728 55%, #2a1d12 100%)
              `,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '48px 32px',
              minHeight: 480,
              color: 'var(--color-tertiary)',
            }}
          >
            <BotanicalSVGModal />

            {/* Vignette superior */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 120,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Contenido central */}
            <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
              {/* Logo */}
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 72,
                  color: 'var(--color-tertiary)',
                  lineHeight: 1,
                  fontWeight: 400,
                  display: 'block',
                  textShadow: '0 4px 24px rgba(0,0,0,0.4)',
                }}
              >
                Etéreo
              </span>

              {/* Tagline */}
              <div
                style={{
                  marginTop: 14,
                  fontSize: 11,
                  letterSpacing: '0.38em',
                  textTransform: 'uppercase',
                  color: 'var(--color-secondary)',
                  opacity: 0.9,
                  fontWeight: 500,
                }}
              >
                belleza · cuidado · bienestar
              </div>

              {/* Separador dorado */}
              <div
                style={{
                  margin: '28px auto',
                  width: 40,
                  height: 1,
                  background: 'rgba(197,160,89,0.5)',
                }}
              />

              {/* Cita */}
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 16,
                  lineHeight: 1.75,
                  color: 'var(--color-tertiary)',
                  opacity: 0.72,
                  fontStyle: 'italic',
                  fontWeight: 300,
                  maxWidth: 220,
                  margin: '0 auto',
                }}
              >
                "Tu espacio de bienestar, siempre a mano."
              </p>
            </div>

            {/* Footer del panel izquierdo */}
            <div
              style={{
                position: 'absolute',
                bottom: 24,
                left: 0,
                right: 0,
                textAlign: 'center',
                fontSize: 10,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--color-tertiary)',
                opacity: 0.4,
                fontWeight: 500,
              }}
            >
              Moreno 212 · 1° A
            </div>
          </div>

          {/* ── Panel derecho: beneficios + CTAs ─────────── */}
          <div
            style={{
              background: 'var(--color-tertiary)',
              padding: '36px 40px 32px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflowY: 'auto',
            }}
          >
            {/* Botón cerrar */}
            <Dialog.Close
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: 6,
                display: 'flex',
                borderRadius: 4,
                transition: 'color 0.15s',
              }}
              aria-label="Cerrar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </Dialog.Close>

            {/* Eyebrow */}
            <div
              style={{
                fontSize: 10,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: 'var(--color-secondary)',
                fontWeight: 600,
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 14,
                  height: 1,
                  background: 'var(--color-secondary)',
                }}
              />
              Tu turno, tu cuenta
            </div>

            {/* Título */}
            <Dialog.Title
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 34,
                fontWeight: 400,
                color: 'var(--color-text-primary)',
                lineHeight: 1.1,
                margin: 0,
                marginBottom: 6,
              }}
            >
              Reservá tu turno
              <span style={{ color: 'var(--color-secondary)' }}>.</span>
            </Dialog.Title>
            <p
              style={{
                fontSize: 13,
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              Registrate y accedé a beneficios exclusivos para clientas de Etéreo.
            </p>

            {/* Lista de beneficios */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
              {BENEFICIOS.map(({ emoji, titulo, descripcion }) => (
                <div
                  key={titulo}
                  style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}
                >
                  <span
                    style={{
                      fontSize: 20,
                      lineHeight: 1,
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {emoji}
                  </span>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        marginBottom: 2,
                      }}
                    >
                      {titulo}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--color-text-muted)',
                        lineHeight: 1.5,
                      }}
                    >
                      {descripcion}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Separador */}
            <div
              style={{
                height: 1,
                background: 'var(--color-neutral-light)',
                marginBottom: 24,
              }}
            />

            {/* Error Google */}
            {googleError && (
              <div
                style={{
                  marginBottom: 16,
                  padding: '10px 14px',
                  background: 'rgba(192,57,43,0.07)',
                  border: '1px solid rgba(192,57,43,0.2)',
                  borderRadius: 4,
                }}
              >
                <p style={{ fontSize: 12, color: 'var(--color-error)', margin: 0 }}>
                  {googleError}
                </p>
              </div>
            )}

            {/* CTA: Google */}
            <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
              {isGoogleLoading ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: 'var(--color-text-muted)',
                    padding: '14px 0',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 16,
                      height: 16,
                      border: '2px solid transparent',
                      borderTopColor: 'var(--color-secondary)',
                      borderRadius: '50%',
                      animation: 'modalSpin 0.6s linear infinite',
                      flexShrink: 0,
                    }}
                  />
                  Conectando con Google...
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    setGoogleError('Error al ingresar con Google. Intentá de nuevo.')
                  }
                  width={360}
                  text="continue_with"
                  locale="es"
                />
              )}
            </div>

            {/* Separador OR */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                margin: '8px 0 16px',
                fontSize: 10,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                fontWeight: 500,
              }}
            >
              <span
                style={{ flex: 1, height: 1, background: 'var(--color-neutral-light)' }}
              />
              <span>O continuá con</span>
              <span
                style={{ flex: 1, height: 1, background: 'var(--color-neutral-light)' }}
              />
            </div>

            {/* CTA: Email */}
            <button
              onClick={handleEmail}
              style={{
                width: '100%',
                background: 'var(--color-primary)',
                color: 'var(--color-tertiary)',
                border: 'none',
                padding: '14px',
                fontSize: 11,
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 600,
                marginBottom: 10,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'var(--color-primary-hover)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'var(--color-primary)')
              }
            >
              Ingresar con email
            </button>

            {/* CTA: Registro */}
            <button
              onClick={handleRegistro}
              style={{
                width: '100%',
                background: 'transparent',
                color: 'var(--color-primary)',
                border: '1.5px solid var(--color-primary)',
                padding: '13px',
                fontSize: 11,
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 600,
                marginBottom: 20,
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-primary)'
                e.currentTarget.style.color = 'var(--color-tertiary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--color-primary)'
              }}
            >
              Registrarme gratis
            </button>

            {/* Link anónimo */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleAnonimo}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: 'var(--color-text-muted)',
                  fontFamily: 'inherit',
                  padding: 0,
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = 'var(--color-text-secondary)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = 'var(--color-text-muted)')
                }
              >
                Continuar sin cuenta →
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      <style>{`
        @keyframes modalSpin { to { transform: rotate(360deg); } }
      `}</style>
    </Dialog.Root>
  )
}
