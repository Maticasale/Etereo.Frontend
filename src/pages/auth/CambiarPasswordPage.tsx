import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AuthFrame, { authInputStyle } from './AuthFrame'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { getErrorCode } from '@/lib/errors'

const changeSchema = z.object({
  passwordActual: z.string().min(1, 'Ingresá tu contraseña actual'),
  passwordNueva: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'Repetí tu nueva contraseña'),
}).refine((data) => data.passwordNueva === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type ChangeFormValues = z.infer<typeof changeSchema>

function mapBackendError(codigo: string | undefined): string {
  switch (codigo) {
    case 'PASSWORD_INVALIDA':
    case 'CREDENCIALES_INVALIDAS':
      return 'La contraseña actual no coincide'
    default:
      return 'No pudimos actualizar tu contraseña'
  }
}

export default function CambiarPasswordPage() {
  const navigate = useNavigate()
  const { usuario, updateUsuario } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<ChangeFormValues>({
    resolver: zodResolver(changeSchema) as any,
  })

  const onSubmit = async (values: ChangeFormValues) => {
    setGlobalError(null)
    setIsLoading(true)
    try {
      await authApi.cambiarPassword({
        passwordActual: values.passwordActual,
        passwordNueva: values.passwordNueva,
      })
      updateUsuario({ debeCambiarPassword: false })
      toast.success('Tu contraseña fue actualizada correctamente')

      if (usuario?.rol === 'Admin' || usuario?.rol === 'Operario') {
        navigate('/panel', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      setGlobalError(mapBackendError(getErrorCode(err)))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthFrame
      eyebrow="Primer ingreso"
      title={<>Actualizá tu contraseña<span style={{ color: 'var(--color-secondary)' }}>.</span></>}
      subtitle="Tu cuenta fue creada por el salón y, por seguridad, necesitamos que definas una contraseña nueva antes de continuar."
    >
      {globalError ? (
        <div style={{ marginBottom: 20, padding: '11px 14px', background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 4 }}>
          <p style={{ fontSize: 13, color: 'var(--color-error)', margin: 0 }}>{globalError}</p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 10, fontWeight: 500 }}>
            Contraseña actual
          </div>
          <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${errors.passwordActual ? 'var(--color-error)' : 'var(--color-neutral)'}`, paddingBottom: 10 }}>
            <input type="password" placeholder="La que te compartió el salón" style={authInputStyle} {...register('passwordActual')} />
          </div>
          {errors.passwordActual ? <p style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 5 }}>{errors.passwordActual.message}</p> : null}
        </div>

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
            Repetí contraseña nueva
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
          {isLoading ? 'Guardando...' : 'Actualizar contraseña'}
        </button>
      </form>
    </AuthFrame>
  )
}
