import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AuthFrame, { authInputStyle } from './AuthFrame'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth'
import { toast } from '@/store/toastStore'
import { getErrorCode, getErrorMessage } from '@/lib/errors'

const completeSchema = z.object({
  telefono: z.string().min(6, 'Ingresá un teléfono válido'),
  sexo: z.enum(['Femenino', 'Masculino'], { message: 'Elegí una opción' }),
})

type CompleteFormValues = z.infer<typeof completeSchema>

function mapBackendError(codigo: string | undefined, fallback: string): string {
  switch (codigo) {
    case 'VALIDACION_ERROR':
      return 'Revisá los datos ingresados'
    case 'DATOS_INCOMPLETOS':
      return 'Completá todos los datos que todavía faltan.'
    case 'SEXO_INVALIDO':
      return 'Elegí Femenino o Masculino para continuar.'
    case 'CAMPO_YA_COMPLETO':
      return 'Uno de estos datos ya fue completado y no puede modificarse desde este flujo.'
    case 'PERFIL_YA_COMPLETO':
      return 'Tu perfil ya estaba completo.'
    case 'NO_PERMITIDO':
      return 'No tenés permiso para completar este perfil.'
    default:
      return fallback || 'No pudimos guardar tu perfil'
  }
}

export default function CompletarPerfilPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { usuario, accessToken, refreshToken, setAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CompleteFormValues>({
    resolver: zodResolver(completeSchema) as any,
    defaultValues: {
      telefono: usuario?.telefono ?? '',
      sexo: usuario?.sexo === 'Masculino' || usuario?.sexo === 'Femenino' ? usuario.sexo : 'Femenino',
    },
  })

  const selectedSexo = watch('sexo')

  const onSubmit = async (values: CompleteFormValues) => {
    if (!usuario?.id || !accessToken || !refreshToken) {
      setGlobalError('No encontramos una sesión activa para completar el perfil.')
      return
    }

    setGlobalError(null)
    setIsLoading(true)
    try {
      const usuarioActualizado = await authApi.completarPerfil({
        telefono: values.telefono,
        sexo: values.sexo,
      })
      setAuth(accessToken, refreshToken, usuarioActualizado)
      toast.success('Tu perfil quedó completo')

      if (searchParams.get('redirect') === 'reserva') {
        navigate('/?iniciar_reserva=1', { replace: true })
        return
      }

      navigate('/mi-espacio', { replace: true })
    } catch (err) {
      setGlobalError(mapBackendError(getErrorCode(err), getErrorMessage(err)))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthFrame
      eyebrow="Último paso"
      title={<>Completá tu perfil<span style={{ color: 'var(--color-secondary)' }}>.</span></>}
      subtitle="Google nos ayuda a autenticarte, pero necesitamos tu teléfono y tu sexo para poder usar correctamente la reserva y filtrar los servicios disponibles."
    >
      {globalError ? (
        <div style={{ marginBottom: 20, padding: '11px 14px', background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 4 }}>
          <p style={{ fontSize: 13, color: 'var(--color-error)', margin: 0 }}>{globalError}</p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 10, fontWeight: 500 }}>
            Teléfono
          </div>
          <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${errors.telefono ? 'var(--color-error)' : 'var(--color-neutral)'}`, paddingBottom: 10 }}>
            <input type="text" placeholder="3492 55-4411" style={authInputStyle} {...register('telefono')} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6, lineHeight: 1.45 }}>
            Escribí solo la caracteristica y el numero, sin <strong>+54 9</strong>.
          </p>
          {errors.telefono ? <p style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 5 }}>{errors.telefono.message}</p> : null}
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 10, fontWeight: 500 }}>
            Sexo
          </div>
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
          {errors.sexo ? <p style={{ fontSize: 12, color: 'var(--color-error)', marginTop: 5 }}>{errors.sexo.message}</p> : null}
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
          {isLoading ? 'Guardando...' : 'Guardar y continuar'}
        </button>
      </form>
    </AuthFrame>
  )
}
