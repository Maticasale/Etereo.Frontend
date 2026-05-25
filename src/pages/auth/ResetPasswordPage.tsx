import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AuthFrame, { authInputStyle } from './AuthFrame'
import { authApi } from '@/api/auth'
import { getErrorCode } from '@/lib/errors'
import { useAuthBackRedirect } from '@/hooks/useAuthBackRedirect'

const resetSchema = z.object({
  passwordNueva: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'Repetí tu contraseña'),
}).refine((data) => data.passwordNueva === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type ResetFormValues = z.infer<typeof resetSchema>

function mapBackendError(codigo: string | undefined): string {
  switch (codigo) {
    case 'TOKEN_INVALIDO':
    case 'TOKEN_EXPIRADO':
      return 'El enlace ya no es válido. Pedí uno nuevo.'
    default:
      return 'No pudimos actualizar tu contraseña'
  }
}

export default function ResetPasswordPage() {
  useAuthBackRedirect({ to: '/login' })

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [isLoading, setIsLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema) as any,
  })

  const onSubmit = async (values: ResetFormValues) => {
    if (!token) {
      setGlobalError('Falta el token de recuperación.')
      return
    }
    setGlobalError(null)
    setIsLoading(true)
    try {
      await authApi.resetPassword({ token, passwordNueva: values.passwordNueva })
      setDone(true)
      setTimeout(() => navigate('/login', { replace: true }), 1800)
    } catch (err) {
      setGlobalError(mapBackendError(getErrorCode(err)))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthFrame
      eyebrow="Nueva contraseña"
      title={<>Creá una contraseña nueva<span style={{ color: 'var(--color-secondary)' }}>.</span></>}
      subtitle="Elegí una contraseña segura para volver a entrar a tu cuenta sin problemas."
      footer={<>¿Ya resolviste esto?{' '}<Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, borderBottom: '1px solid var(--color-primary)', paddingBottom: 1, textDecoration: 'none' }}>Ir al login</Link></>}
    >
      {!token ? (
        <div style={{ padding: '18px 20px', background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 12 }}>
          <p style={{ margin: 0, color: 'var(--color-error)', lineHeight: 1.6, fontSize: 14 }}>
            Este enlace no es válido porque no encontramos el token de recuperación.
          </p>
        </div>
      ) : done ? (
        <div style={{ padding: '18px 20px', background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.22)', borderRadius: 12 }}>
          <p style={{ margin: 0, color: 'var(--color-text-primary)', lineHeight: 1.6, fontSize: 14 }}>
            Tu contraseña se actualizó correctamente. Te redirigimos al login.
          </p>
        </div>
      ) : (
        <>
          {globalError ? (
            <div style={{ marginBottom: 20, padding: '11px 14px', background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 4 }}>
              <p style={{ fontSize: 13, color: 'var(--color-error)', margin: 0 }}>{globalError}</p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 10, fontWeight: 500 }}>
                Contraseña nueva
              </div>
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${errors.passwordNueva ? 'var(--color-error)' : 'var(--color-neutral)'}`, paddingBottom: 10 }}>
                <input type="password" placeholder="Mínimo 8 caracteres" style={authInputStyle} {...register('passwordNueva')} />
              </div>
              {errors.passwordNueva ? <p style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 5 }}>{errors.passwordNueva.message}</p> : null}
            </div>

            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 10, fontWeight: 500 }}>
                Repetí contraseña
              </div>
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${errors.confirmPassword ? 'var(--color-error)' : 'var(--color-neutral)'}`, paddingBottom: 10 }}>
                <input type="password" placeholder="Confirmá tu contraseña" style={authInputStyle} {...register('confirmPassword')} />
              </div>
              {errors.confirmPassword ? <p style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 5 }}>{errors.confirmPassword.message}</p> : null}
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
              }}
            >
              {isLoading ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>
        </>
      )}
    </AuthFrame>
  )
}
