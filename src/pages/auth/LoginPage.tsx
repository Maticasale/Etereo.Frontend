import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { getErrorCode, getErrorMessage } from '@/lib/errors'
import { needsProfileCompletion } from '@/lib/authFlow'
import type { LoginRequest, UsuarioDto } from '@/types/api'

// ─── Schema ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type LoginFormValues = z.infer<typeof loginSchema>

// ─── Mapeo de errores del backend ────────────────────────────────────────────

function mapBackendError(codigo: string | undefined, fallback: string): string {
  switch (codigo) {
    case 'CREDENCIALES_INVALIDAS':
      return 'Email o contraseña incorrectos'
    case 'CUENTA_BLOQUEADA':
      return 'Tu cuenta fue bloqueada. Contactá al salón.'
    case 'USAR_GOOGLE_AUTH':
      return 'Esta cuenta usa Google. Ingresá con el botón de Google.'
    default:
      return fallback || 'Ocurrió un error al iniciar sesión'
  }
}

// ─── Estilos de inputs compartidos ───────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: 15,
  color: 'var(--color-text-primary)',
  padding: 0,
  fontFamily: "'Inter', system-ui, sans-serif",
  width: '100%',
}

// ─── SVG Botánico ─────────────────────────────────────────────────────────────

function BotanicalSVG() {
  return (
    <svg
      viewBox="0 0 500 800"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', top: 0, right: -40, width: '85%', height: '100%', opacity: 0.4 }}
    >
      <defs>
        <linearGradient id="leafGradLogin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(197,160,89,0.6)" />
          <stop offset="100%" stopColor="rgba(197,160,89,0.05)" />
        </linearGradient>
      </defs>
      <g fill="url(#leafGradLogin)" stroke="rgba(197,160,89,0.4)" strokeWidth="0.6">
        <path d="M 380 -20 Q 360 200 320 420 T 280 820" fill="none" />
        <path d="M 420 -10 Q 410 220 380 460 T 340 820" fill="none" />
        <path d="M 460 10 Q 470 240 450 480 T 420 820" fill="none" />
        {Array.from({ length: 24 }).map((_, i) => {
          const y = 40 + i * 32
          const x = 360 + Math.sin(i * 0.5) * 50
          const rot = -30 + (i % 2 ? 60 : -20)
          return (
            <ellipse key={i} cx={x} cy={y} rx="6" ry={28 + (i % 3) * 6}
              transform={`rotate(${rot} ${x} ${y})`} />
          )
        })}
        {Array.from({ length: 18 }).map((_, i) => {
          const y = 100 + i * 38
          const x = 440 + Math.cos(i * 0.7) * 30
          const rot = 20 + (i % 2 ? -50 : 70)
          return (
            <ellipse key={'b' + i} cx={x} cy={y} rx="5" ry={24 + (i % 3) * 5}
              transform={`rotate(${rot} ${x} ${y})`} />
          )
        })}
      </g>
    </svg>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as any,
  })

  function redirectAfterLogin(usuario: UsuarioDto) {
    if (usuario.debeCambiarPassword) {
      navigate('/cambiar-password', { replace: true })
      return
    }
    const redirect = searchParams.get('redirect')
    if (needsProfileCompletion(usuario)) {
      navigate(
        redirect === 'reserva' ? '/completar-perfil?redirect=reserva' : '/completar-perfil',
        { replace: true },
      )
      return
    }
    if (redirect === 'reserva') {
      navigate('/?iniciar_reserva=1', { replace: true })
      return
    }
    if (usuario.rol === 'Admin' || usuario.rol === 'Operario') {
      navigate('/panel', { replace: true })
    } else {
      navigate('/mi-cuenta', { replace: true })
    }
  }

  const onSubmit = async (values: LoginFormValues) => {
    setGlobalError(null)
    setIsLoading(true)
    try {
      const payload: LoginRequest = {
        email: values.email!,
        password: values.password!,
      }
      const { accessToken, refreshToken, usuario } = await authApi.login(payload)
      setAuth(accessToken, refreshToken, usuario)
      toast.success(`¡Bienvenida, ${usuario.nombre}!`)
      redirectAfterLogin(usuario)
    } catch (err) {
      setGlobalError(mapBackendError(getErrorCode(err), getErrorMessage(err)))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return
    setGlobalError(null)
    setIsGoogleLoading(true)
    try {
      const { accessToken, refreshToken, usuario } = await authApi.googleLogin(
        credentialResponse.credential,
      )
      setAuth(accessToken, refreshToken, usuario)
      toast.success(`¡Bienvenida, ${usuario.nombre}!`)
      redirectAfterLogin(usuario)
    } catch (err) {
      setGlobalError(mapBackendError(getErrorCode(err), getErrorMessage(err)))
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const redirectParam = searchParams.get('redirect')
    ? `?redirect=${searchParams.get('redirect')}`
    : ''

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'grid', gridTemplateColumns: '1.05fr 1fr',
      background: 'var(--color-tertiary)',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* ── Panel izquierdo: atmósfera botánica ─────────── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Fondo + hojas */}
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden',
          background: `
            radial-gradient(ellipse at 30% 80%, rgba(197,160,89,0.22) 0%, transparent 55%),
            radial-gradient(ellipse at 70% 20%, rgba(249,245,240,0.06) 0%, transparent 60%),
            linear-gradient(180deg, #5a4530 0%, #4A3728 60%, #2a1d12 100%)
          `,
        }}>
          <BotanicalSVG />
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 200,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Wordmark + tagline + cita */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center', width: '100%', padding: '0 40px',
          pointerEvents: 'none',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 168,
            color: 'var(--color-tertiary)', lineHeight: 0.95, fontWeight: 400,
            display: 'inline-block', textShadow: '0 4px 30px rgba(0,0,0,0.5)',
          }}>
            Etéreo
          </span>
          <div style={{
            marginTop: 18, fontSize: 12, letterSpacing: '0.42em',
            textTransform: 'uppercase', color: 'var(--color-secondary)',
            opacity: 0.95, fontWeight: 500,
          }}>
            belleza · cuidado · bienestar
          </div>
          <p style={{
            marginTop: 40, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto',
            fontSize: 18, lineHeight: 1.7, color: 'var(--color-tertiary)',
            opacity: 0.78, fontStyle: 'italic', fontWeight: 300,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
          }}>
            "Un refugio donde el tiempo se detiene y el cuidado se vuelve un acto de amor propio."
          </p>
        </div>

        {/* Footer izquierdo */}
        <div style={{
          position: 'absolute', bottom: 36, left: 44, right: 44,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase',
          color: 'var(--color-tertiary)', opacity: 0.55, fontWeight: 500,
          pointerEvents: 'none',
        }}>
          <span>Moreno 212 · 1° A</span>
          <span>@etereo.salondebelleza</span>
        </div>
      </div>

      {/* ── Panel derecho: formulario ────────────────────── */}
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '0 75px', position: 'relative', alignItems: 'center',
        background: 'var(--color-tertiary)', overflowY: 'auto',
      }}>
        {/* Volver */}
        <Link to="/" style={{
          position: 'absolute', top: 32, right: 36,
          fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--color-text-secondary)', fontWeight: 500, textDecoration: 'none',
        }}>
          ← Volver al inicio
        </Link>

        <div style={{ maxWidth: 400, width: '100%' }}>

          {/* Eyebrow */}
          <div style={{
            fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'var(--color-secondary)', marginBottom: 20, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ display: 'inline-block', width: 18, height: 1, background: 'var(--color-secondary)' }} />
            Iniciar sesión
          </div>

          {/* Título */}
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 52, margin: 0, color: 'var(--color-text-primary)',
            lineHeight: 1.05, fontWeight: 400, letterSpacing: '-0.01em',
          }}>
            Bienvenido<span style={{ color: 'var(--color-secondary)' }}>.</span>
          </h1>
          <p style={{
            fontSize: 14, color: 'var(--color-text-secondary)',
            marginTop: 10, marginBottom: 36, fontWeight: 400, lineHeight: 1.6,
          }}>
            Nos alegra volver a verte. Ingresá para gestionar tus turnos y bonos.
          </p>

          {/* Error global */}
          {globalError && (
            <div style={{
              marginBottom: 20, padding: '11px 14px',
              background: 'rgba(192,57,43,0.07)',
              border: '1px solid rgba(192,57,43,0.2)', borderRadius: 4,
            }}>
              <p style={{ fontSize: 13, color: 'var(--color-error)', margin: 0 }}>{globalError}</p>
            </div>
          )}

          {/* ── Formulario ─────────────────────────────────── */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Campo email */}
            <div style={{ marginBottom: 22 }}>
              <div style={{
                fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
                color: 'var(--color-text-secondary)', marginBottom: 10, fontWeight: 500,
              }}>
                Correo electrónico
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                borderBottom: `1px solid ${errors.email ? 'var(--color-error)' : 'var(--color-neutral)'}`,
                paddingBottom: 10,
              }}>
                <span style={{ color: 'var(--color-text-muted)', display: 'flex', flexShrink: 0 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  style={inputStyle}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 5 }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Campo contraseña */}
            <div style={{ marginBottom: 22 }}>
              <div style={{
                fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
                color: 'var(--color-text-secondary)', marginBottom: 10, fontWeight: 500,
              }}>
                Contraseña
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                borderBottom: `1px solid ${errors.password ? 'var(--color-error)' : 'var(--color-neutral)'}`,
                paddingBottom: 10,
              }}>
                <span style={{ color: 'var(--color-text-muted)', display: 'flex', flexShrink: 0 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  style={inputStyle}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  tabIndex={-1}
                  style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    color: 'var(--color-text-muted)', display: 'flex', flexShrink: 0,
                  }}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 5 }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Recordarme + recuperar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 32,
            }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 9,
                fontSize: 13, color: 'var(--color-text-secondary)', cursor: 'pointer',
              }}>
                <span style={{
                  width: 15, height: 15, border: '1.5px solid var(--color-neutral)',
                  borderRadius: 3, display: 'inline-block', background: 'white', flexShrink: 0,
                }} />
                Recordarme
              </label>
              <Link to="/forgot-password" style={{
                fontSize: 13, color: 'var(--color-primary)', fontWeight: 500,
                borderBottom: '1px solid var(--color-primary)', paddingBottom: 1,
                textDecoration: 'none',
              }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background: isLoading ? 'var(--color-neutral)' : 'var(--color-primary)',
                color: 'var(--color-tertiary)', border: 'none', padding: '17px',
                fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {isLoading ? (
                <>
                  <span style={{
                    display: 'inline-block', width: 13, height: 13,
                    border: '2px solid transparent', borderTopColor: 'var(--color-tertiary)',
                    borderRadius: '50%', animation: 'loginSpin 0.6s linear infinite',
                  }} />
                  Ingresando...
                </>
              ) : 'Ingresar'}
            </button>

          </form>

          {/* Separador */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, margin: '28px 0',
            fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--color-text-muted)', fontWeight: 500,
          }}>
            <span style={{ flex: 1, height: 1, background: 'var(--color-neutral-light)' }} />
            <span>O continuá con</span>
            <span style={{ flex: 1, height: 1, background: 'var(--color-neutral-light)' }} />
          </div>

          {/* Google OAuth */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {isGoogleLoading ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 13, color: 'var(--color-text-muted)', padding: '14px 0',
              }}>
                <span style={{
                  display: 'inline-block', width: 15, height: 15,
                  border: '2px solid transparent', borderTopColor: 'var(--color-secondary)',
                  borderRadius: '50%', animation: 'loginSpin 0.6s linear infinite',
                }} />
                Conectando con Google...
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setGlobalError('Error al ingresar con Google. Intentá de nuevo.')}
                width={400}
                text="continue_with"
                locale="es"
              />
            )}
          </div>

          {/* Link a registro */}
          <div style={{
            textAlign: 'center', marginTop: 36,
            fontSize: 14, color: 'var(--color-text-secondary)',
          }}>
            ¿Es tu primera vez en{' '}
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 19,
              color: 'var(--color-primary)', verticalAlign: 'baseline',
            }}>
              Etéreo
            </span>?{' '}
            <Link to={`/registro${redirectParam}`} style={{
              color: 'var(--color-primary)', fontWeight: 600,
              borderBottom: '1px solid var(--color-primary)', paddingBottom: 1,
              textDecoration: 'none',
            }}>
              Creá tu cuenta
            </Link>
          </div>

        </div>
      </div>

      <style>{`@keyframes loginSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
