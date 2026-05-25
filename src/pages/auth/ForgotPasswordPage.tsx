import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AuthFrame, { authInputStyle } from './AuthFrame'
import { authApi } from '@/api/auth'
import { getErrorCode } from '@/lib/errors'
import { useAuthBackRedirect } from '@/hooks/useAuthBackRedirect'

const forgotSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
})

type ForgotFormValues = z.infer<typeof forgotSchema>

function mapBackendError(codigo: string | undefined): string {
  switch (codigo) {
    case 'USUARIO_NO_ENCONTRADO':
      return 'No encontramos una cuenta con ese email'
    default:
      return 'No pudimos enviar el enlace de recuperación'
  }
}

export default function ForgotPasswordPage() {
  useAuthBackRedirect({ to: '/login' })

  const [isLoading, setIsLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema) as any,
  })

  const onSubmit = async (values: ForgotFormValues) => {
    setGlobalError(null)
    setIsLoading(true)
    try {
      await authApi.forgotPassword({ email: values.email })
      setSentTo(values.email)
    } catch (err) {
      setGlobalError(mapBackendError(getErrorCode(err)))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthFrame
      eyebrow="Recuperar acceso"
      title={<>Recuperá tu contraseña<span style={{ color: 'var(--color-secondary)' }}>.</span></>}
      subtitle="Te enviamos un enlace para crear una nueva contraseña y volver a ingresar a tu cuenta."
      footer={<>¿Te acordaste?{' '}<Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, borderBottom: '1px solid var(--color-primary)', paddingBottom: 1, textDecoration: 'none' }}>Volver al inicio</Link></>}
    >
      {sentTo ? (
        <div style={{ padding: '18px 20px', background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.22)', borderRadius: 12 }}>
          <p style={{ margin: 0, color: 'var(--color-text-primary)', lineHeight: 1.6, fontSize: 14 }}>
            Te enviamos un enlace de recuperación a <strong>{sentTo}</strong>. Revisá tu correo y seguí las instrucciones.
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
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 10, fontWeight: 500 }}>
                Correo electrónico
              </div>
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${errors.email ? 'var(--color-error)' : 'var(--color-neutral)'}`, paddingBottom: 10 }}>
                <input type="email" placeholder="tu@email.com" style={authInputStyle} {...register('email')} />
              </div>
              {errors.email ? <p style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 5 }}>{errors.email.message}</p> : null}
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
              {isLoading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </form>
        </>
      )}
    </AuthFrame>
  )
}
