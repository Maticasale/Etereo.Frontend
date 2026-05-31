import { useQuery } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { publicacionesApi } from '@/api/publicaciones'
import { useAuthStore } from '@/store/authStore'
import type { PublicacionDto } from '@/types/api'

interface PublicacionesSalonProps {
  title?: string
  maxItems?: number
  withinContainer?: boolean
}

const TYPE_STYLES: Record<PublicacionDto['tipo'], { background: string; color: string; border: string }> = {
  Novedad: {
    background: 'rgba(215, 232, 255, 0.65)',
    color: '#285a9f',
    border: 'rgba(95, 151, 221, 0.24)',
  },
  Promo: {
    background: 'rgba(197,160,89,0.16)',
    color: '#8d6b2d',
    border: 'rgba(197,160,89,0.26)',
  },
  Aviso: {
    background: 'rgba(230,126,34,0.14)',
    color: '#a55413',
    border: 'rgba(230,126,34,0.22)',
  },
  Evento: {
    background: 'rgba(158, 128, 205, 0.14)',
    color: '#7350a7',
    border: 'rgba(158, 128, 205, 0.22)',
  },
}

function formatPublicationDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export default function PublicacionesSalon({
  title = 'Novedades del salón',
  maxItems = 3,
  withinContainer = false,
}: PublicacionesSalonProps) {
  const usuario = useAuthStore((state) => state.usuario)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['publicaciones', usuario?.rol ?? 'anonimo'],
    queryFn: publicacionesApi.getPublicaciones,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  if (isLoading || isError || !data || data.length === 0) {
    return null
  }

  const publicaciones = data.slice(0, maxItems)

  const content = (
    <section style={{ marginTop: 42 }}>
      <div
        style={{
          fontSize: 12,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: 'var(--color-secondary)',
          fontWeight: 700,
          marginBottom: 14,
        }}
      >
        Publicaciones
      </div>

      <h2
        style={{
          margin: 0,
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(34px, 4.2vw, 48px)',
          color: 'var(--color-text-primary)',
          lineHeight: 1,
        }}
      >
        {title}
      </h2>

      <div
        style={{
          marginTop: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 18,
        }}
      >
        {publicaciones.map((publicacion) => {
          const badgeStyle = TYPE_STYLES[publicacion.tipo]
          return (
            <article
              key={publicacion.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: publicacion.imagenUrl ? 360 : 280,
                overflow: 'hidden',
                borderRadius: 28,
                background: '#fffdfa',
                border: '1px solid rgba(74,55,40,0.08)',
                boxShadow: '0 18px 36px rgba(74,55,40,0.08)',
              }}
            >
              {publicacion.destacado ? (
                <div style={{ height: 3, background: 'var(--color-secondary)' }} />
              ) : null}

              {publicacion.imagenUrl ? (
                <div
                  style={{
                    height: 188,
                    backgroundImage: `linear-gradient(180deg, rgba(28,20,15,0.08), rgba(28,20,15,0.2)), url(${publicacion.imagenUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              ) : null}

              <div style={{ padding: '22px 22px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      background: badgeStyle.background,
                      color: badgeStyle.color,
                      border: `1px solid ${badgeStyle.border}`,
                    }}
                  >
                    {publicacion.tipo}
                  </span>

                  {publicacion.visibilidad === 'SoloRegistrados' && usuario?.rol === 'Cliente' ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 12px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        background: 'rgba(197,160,89,0.12)',
                        color: 'var(--color-secondary)',
                        border: '1px solid rgba(197,160,89,0.18)',
                      }}
                    >
                      <Sparkles size={12} />
                      Exclusivo para miembros
                    </span>
                  ) : null}
                </div>

                <h3
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-heading)',
                    fontSize: 30,
                    lineHeight: 1.05,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {publicacion.titulo}
                </h3>

                {publicacion.contenido ? (
                  <p
                    style={{
                      marginTop: 14,
                      fontSize: 15,
                      lineHeight: 1.78,
                      color: 'var(--color-text-secondary)',
                      marginBottom: 0,
                    }}
                  >
                    {publicacion.contenido}
                  </p>
                ) : null}

                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: 18,
                    fontSize: 12,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    fontWeight: 700,
                  }}
                >
                  Desde {formatPublicationDate(publicacion.fechaDesde)}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )

  if (withinContainer) {
    return content
  }

  return <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>{content}</div>
}
