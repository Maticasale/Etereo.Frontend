import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GoogleLogin } from '@react-oauth/google'
import AuthFrame, { authInputStyle } from './AuthFrame'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { getErrorCode } from '@/lib/errors'
import type { RegisterRequest } from '@/types/api'

const registerSchema = z.object({
  nombre: z.string().min(2, 'Ingresá tu nombre'),
  apellido: z.string().min(2, 'Ingresá tu apellido'),
  telefono: z.string().min(6, 'Ingresá un teléfono válido'),
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  sexo: z.enum(['Femenino', 'Masculino'], { message: 'Elegí una opción' }),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'Repetí tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type RegisterFormValues = z.infer<typeof registerSchema>

function mapBackendError(codigo: string | undefined): string {
  switch (codigo) {
    case 'EMAIL_YA_REGISTRADO':
      return 'Ya existe una cuenta con este email'
    case 'USAR_GOOGLE_AUTH':
      return 'Esta cuenta ya existe con Google. Ingresá con Google.'
    default:
      return 'No pudimos crear tu cuenta'
  }
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          fontSize: 11,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--color-text-secondary)',
          marginBottom: 10,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      {children}
      {error ? <p style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 5 }}>{error}</p> : null}
    </div>
  )
}

export default function RegistroPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: { sexo: 'Femenino' },
  })

  const selectedSexo = watch('sexo')

  function redirectAfterAuth() {
    if (searchParams.get('redirect') === 'reserva') {
      navigate('/?iniciar_reserva=1', { replace: true })
      return
    }
    navigate('/', { replace: true })
  }

  const onSubmit = async (values: RegisterFormValues) => {
    setGlobalError(null)
    setIsLoading(true)
    try {
      const payload: RegisterRequest = {
        nombre: values.nombre,
        apellido: values.apellido,
        telefono: values.telefono,
        email: values.email,
        sexo: values.sexo,
        password: values.password,
      }
      const { accessToken, refreshToken, usuario } = await authApi.register(payload)
      setAuth(accessToken, refreshToken, usuario)
      toast.success(`¡Tu cuenta ya está lista, ${usuario.nombre}!`)
      redirectAfterAuth()
    } catch (err) {
      setGlobalError(mapBackendError(getErrorCode(err)))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return
    setGlobalError(null)
    setIsGoogleLoading(true)
    try {
      const { accessToken, refreshToken, usuario } = await authApi.googleLogin(credentialResponse.credential)
      setAuth(accessToken, refreshToken, usuario)
      toast.success(`¡Tu cuenta ya está lista, ${usuario.nombre}!`)
      redirectAfterAuth()
    } catch (err) {
      setGlobalError(mapBackendError(getErrorCode(err)))
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const redirectParam = searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''

  return (
    <AuthFrame
      eyebrow="Crear cuenta"
      title={<>Tu primera vez en Etéreo<span style={{ color: 'var(--color-secondary)' }}>.</span></>}
      subtitle="Creá tu cuenta para guardar tus datos, acceder a cupones y gestionar tus turnos con más facilidad."
      footer={<>¿Ya tenés una cuenta?{' '}<Link to={`/login${redirectParam}`} style={{ color: 'var(--color-primary)', fontWeight: 600, borderBottom: '1px solid var(--color-primary)', paddingBottom: 1, textDecoration: 'none' }}>Ingresá acá</Link></>}
    >
      {globalError ? (
        <div style={{ marginBottom: 20, padding: '11px 14px', background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 4 }}>
          <p style={{ fontSize: 13, color: 'var(--color-error)', margin: 0 }}>{globalError}</p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <Field label="Nombre" error={errors.nombre?.message}>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${errors.nombre ? 'var(--color-error)' : 'var(--color-neutral)'}`, paddingBottom: 10 }}>
              <input type="text" placeholder="Sofía" style={authInputStyle} {...register('nombre')} />
            </div>
          </Field>
          <Field label="Apellido" error={errors.apellido?.message}>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${errors.apellido ? 'var(--color-error)' : 'var(--color-neutral)'}`, paddingBottom: 10 }}>
              <input type="text" placeholder="Gómez" style={authInputStyle} {...register('apellido')} />
            </div>
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <Field label="Teléfono" error={errors.telefono?.message}>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${errors.telefono ? 'var(--color-error)' : 'var(--color-neutral)'}`, paddingBottom: 10 }}>
              <input type="text" placeholder="3492 55-4411" style={authInputStyle} {...register('telefono')} />
            </div>
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${errors.email ? 'var(--color-error)' : 'var(--color-neutral)'}`, paddingBottom: 10 }}>
              <input type="email" placeholder="tu@email.com" style={authInputStyle} {...register('email')} />
            </div>
          </Field>
        </div>

        <Field label="Sexo" error={errors.sexo?.message}>
          <div style={{ display: 'flex', gap: 12 }}>
            {(['Femenino', 'Masculino'] as const).map((sexo) => (
              <label
                key={sexo}
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  borderRadius: 14,
                  border: selectedSexo === sexo ? '1px solid rgba(197,160,89,0.72)' : '1px solid rgba(232,224,216,0.95)',
                  background: selectedSexo === sexo ? 'rgba(197,160,89,0.08)' : '#fffdfb',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                <input type="radio" value={sexo} {...register('sexo')} style={{ display: 'none' }} />
                {sexo}
              </label>
            ))}
          </div>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <Field label="Contraseña" error={errors.password?.message}>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${errors.password ? 'var(--color-error)' : 'var(--color-neutral)'}`, paddingBottom: 10 }}>
              <input type="password" placeholder="Mínimo 8 caracteres" style={authInputStyle} {...register('password')} />
            </div>
          </Field>
          <Field label="Repetí contraseña" error={errors.confirmPassword?.message}>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${errors.confirmPassword ? 'var(--color-error)' : 'var(--color-neutral)'}`, paddingBottom: 10 }}>
              <input type="password" placeholder="Confirmá tu contraseña" style={authInputStyle} {...register('confirmPassword')} />
            </div>
          </Field>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            background: isLoading ? 'var(--color-neutral)' : 'var(--color-primary)',
            color: 'var(--color-tertiary)',
            border: 'none',
            padding: '17px',
            fontSize: 11,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '28px 0', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 500 }}>
        <span style={{ flex: 1, height: 1, background: 'var(--color-neutral-light)' }} />
        <span>O continuá con</span>
        <span style={{ flex: 1, height: 1, background: 'var(--color-neutral-light)' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {isGoogleLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-muted)', padding: '14px 0' }}>
            <span style={{ display: 'inline-block', width: 15, height: 15, border: '2px solid transparent', borderTopColor: 'var(--color-secondary)', borderRadius: '50%', animation: 'loginSpin 0.6s linear infinite' }} />
            Conectando con Google...
          </div>
        ) : (
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setGlobalError('Error al crear tu cuenta con Google. Intentá de nuevo.')} width={400} text="signup_with" locale="es" />
        )}
      </div>

      <style>{`@keyframes loginSpin { to { transform: rotate(360deg); } }`}</style>
    </AuthFrame>
  )
}
