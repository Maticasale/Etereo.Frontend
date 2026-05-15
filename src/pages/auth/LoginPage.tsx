import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { getErrorCode } from '@/lib/errors'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

// ─── Schema ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type LoginFormValues = z.infer<typeof loginSchema>

// ─── Mapeo de errores del backend ────────────────────────────────────────────

function mapBackendError(codigo: string | undefined): string {
  switch (codigo) {
    case 'CREDENCIALES_INVALIDAS':
      return 'Email o contraseña incorrectos'
    case 'CUENTA_BLOQUEADA':
      return 'Tu cuenta fue bloqueada. Contactá al salón.'
    case 'USAR_GOOGLE_AUTH':
      return 'Esta cuenta usa Google. Ingresá con el botón de Google.'
    default:
      return 'Ocurrió un error al iniciar sesión'
  }
}

// ─── Componente ──────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate()
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

  function redirectAfterLogin(rol: string, debeCambiarPassword: boolean) {
    if (debeCambiarPassword) {
      navigate('/cambiar-password', { replace: true })
    } else if (rol === 'Admin' || rol === 'Operario') {
      navigate('/panel', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }

  const onSubmit = async (values: LoginFormValues) => {
    setGlobalError(null)
    setIsLoading(true)
    try {
      const { accessToken, refreshToken, usuario } = await authApi.login(values)
      setAuth(accessToken, refreshToken, usuario)
      toast.success(`¡Bienvenida, ${usuario.nombre}!`)
      redirectAfterLogin(usuario.rol, usuario.debeCambiarPassword)
    } catch (err) {
      const codigo = getErrorCode(err)
      setGlobalError(mapBackendError(codigo))
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
      redirectAfterLogin(usuario.rol, usuario.debeCambiarPassword)
    } catch (err) {
      const codigo = getErrorCode(err)
      setGlobalError(mapBackendError(codigo))
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--color-tertiary)' }}
    >
      {/* Logo */}
      <span
        className="text-5xl font-bold italic mb-8 block text-[var(--color-primary)]"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        etereo
      </span>

      {/* Card */}
      <Card variant="elevated" className="w-full max-w-[420px] p-8">
        {/* Títulos */}
        <h2
          className="text-2xl font-semibold text-[var(--color-text-primary)] mb-1"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Bienvenida
        </h2>
        <p
          className="text-sm text-[var(--color-text-secondary)] mb-6"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Ingresá a tu cuenta
        </p>

        {/* Error global */}
        {globalError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[var(--radius-md)]">
            <p className="text-sm text-red-700 font-[var(--font-body)]">{globalError}</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            leftIcon={<Mail size={16} />}
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="flex flex-col gap-1">
            <div className="relative">
              <Input
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon={<Lock size={16} />}
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-[var(--color-neutral)] hover:text-[var(--color-text-secondary)] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors font-[var(--font-body)]"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isLoading}
            className="mt-1"
          >
            Ingresar
          </Button>
        </form>

        {/* Separador */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[var(--color-neutral-light)]" />
          <span className="text-xs text-[var(--color-text-muted)] font-[var(--font-body)] whitespace-nowrap">
            o continuá con
          </span>
          <div className="flex-1 h-px bg-[var(--color-neutral-light)]" />
        </div>

        {/* Google OAuth */}
        <div className="flex justify-center">
          {isGoogleLoading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)] font-[var(--font-body)] py-2">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-t-[var(--color-secondary)] border-l-[var(--color-secondary)] border-transparent rounded-full" />
              Conectando con Google...
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setGlobalError('Error al ingresar con Google. Intentá de nuevo.')
              }}
              width="100%"
              text="continue_with"
              locale="es"
            />
          )}
        </div>
      </Card>
    </div>
  )
}
