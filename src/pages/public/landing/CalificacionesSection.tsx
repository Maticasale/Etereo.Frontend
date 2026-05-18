/**
 * CalificacionesSection
 *
 * Sección 3 de la LandingPage. Fondo oscuro (--color-primary).
 *
 * SubA — Promedio global + reviews (datos mockeados).
 * SubB — "Por qué elegirnos" (bullets estáticos).
 *
 * TODO [BACKEND]: GET /estadisticas/calificaciones requiere rol Admin.
 *   Crear endpoint público GET /estadisticas/calificaciones/publico (anónimo)
 *   que devuelva { promedioGlobal, total, ultimasCalificaciones: CalificacionDto[] }.
 *   Una vez disponible, reemplazar MOCK_DATA con una useQuery real.
 *   staleTime: 5 * 60 * 1000 (estadísticas).
 *   queryKey: ['calificaciones', 'landing'].
 */

import { Award, Sparkles, ShieldCheck } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_DATA = {
  promedioGlobal: 4.8,
  total: 127,
  reviews: [
    {
      id: 1,
      puntuacion: 5,
      comentario: '¡Excelente atención! Me fui encantada con el resultado y el ambiente es hermoso.',
      nombreCliente: 'María G.',
      creadoEn: '2026-05-10T10:00:00Z',
    },
    {
      id: 2,
      puntuacion: 5,
      comentario: 'Muy profesionales y atentas. El lugar es súper cómodo y tranquilo. Volvería siempre.',
      nombreCliente: 'Valentina R.',
      creadoEn: '2026-05-08T15:00:00Z',
    },
    {
      id: 3,
      puntuacion: 5,
      comentario: 'Excelente experiencia desde el primer momento. Los resultados superaron mis expectativas.',
      nombreCliente: 'Ana L.',
      creadoEn: '2026-05-05T11:00:00Z',
    },
  ],
}

// ─── Componente de estrellas SVG ──────────────────────────────────────────────

function StarSVG({
  fillPercent,
  size = 20,
}: {
  fillPercent: number
  size?: number
}) {
  const clipId = `star-clip-fill-${size}-${Math.round(fillPercent * 100)}`
  const fill = Math.max(0, Math.min(1, fillPercent))
  const starPath =
    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={24 * fill} height="24" />
        </clipPath>
      </defs>
      {/* Estrella vacía */}
      <path
        d={starPath}
        fill="rgba(255,255,255,0.12)"
        stroke="rgba(197,160,89,0.3)"
        strokeWidth="1"
      />
      {/* Estrella rellena parcial */}
      <path
        d={starPath}
        fill="#C5A059"
        stroke="none"
        clipPath={`url(#${clipId})`}
      />
    </svg>
  )
}

function StarRating({
  value,
  size = 20,
}: {
  value: number
  size?: number
}) {
  return (
    <div style={{ display: 'flex', gap: 3 }} role="img" aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarSVG key={i} fillPercent={value - (i - 1)} size={size} />
      ))}
    </div>
  )
}

// ─── Decoración botánica ──────────────────────────────────────────────────────

function CalificacionesBotanical() {
  return (
    <svg
      viewBox="0 0 400 600"
      style={{ position: 'absolute', top: 0, right: 0, width: 280, height: '100%', opacity: 0.18, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="calLeafGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(197,160,89,0.8)" />
          <stop offset="100%" stopColor="rgba(197,160,89,0.05)" />
        </linearGradient>
      </defs>
      <g fill="url(#calLeafGrad)" stroke="rgba(197,160,89,0.5)" strokeWidth="0.7">
        <path d="M 380 -10 Q 360 180 340 380 T 310 620" fill="none" />
        {Array.from({ length: 18 }).map((_, i) => {
          const y = 30 + i * 34
          const x = 370 + Math.sin(i * 0.6) * 40
          const rot = -32 + (i % 2 ? 65 : -15)
          return (
            <ellipse key={i} cx={x} cy={y} rx="5" ry={25 + (i % 3) * 6}
              transform={`rotate(${rot} ${x} ${y})`} />
          )
        })}
      </g>
    </svg>
  )
}

// ─── Bullets "Por qué elegirnos" ─────────────────────────────────────────────

const BULLETS = [
  {
    icon: Award,
    titulo: 'Profesionales certificadas',
    descripcion:
      'Nuestras operarias están capacitadas y actualizadas en las últimas técnicas del rubro.',
  },
  {
    icon: Sparkles,
    titulo: 'Ambiente pensado para vos',
    descripcion:
      'Dos salones diseñados para que tu experiencia sea cómoda, relajante y única desde el primer momento.',
  },
  {
    icon: ShieldCheck,
    titulo: 'Resultados que se notan',
    descripcion:
      'Usamos productos de primera calidad y técnicas que garantizan resultados visibles y duraderos.',
  },
]

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CalificacionesSection() {
  const { promedioGlobal, total, reviews } = MOCK_DATA
  const reviewsConComentario = reviews.filter((r) => r.comentario)

  return (
    <section
      style={{
        background: 'var(--color-primary)',
        padding: '80px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <CalificacionesBotanical />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>

        {/* ── Sub A: Promedio y reviews ── */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          {/* Promedio grande */}
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 80,
            fontWeight: 700,
            color: '#C5A059',
            lineHeight: 1,
            marginBottom: 12,
          }}
            className="text-[64px] md:text-[80px]"
          >
            {promedioGlobal.toFixed(1)}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <StarRating value={promedioGlobal} size={28} />
          </div>

          <p style={{
            fontFamily: 'var(--font-body)',
            color: 'rgba(255,255,255,0.65)',
            fontSize: 14,
          }}>
            Basado en {total.toLocaleString('es-AR')} calificaciones
          </p>
        </div>

        {/* Cards de reviews */}
        {reviewsConComentario.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
            {reviewsConComentario.map((review) => {
              let fechaFormateada = ''
              try {
                fechaFormateada = format(parseISO(review.creadoEn), "d 'de' MMMM, yyyy", { locale: es })
              } catch {
                fechaFormateada = ''
              }

              return (
                <div
                  key={review.id}
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div>
                    <StarRating value={review.puntuacion} size={16} />
                  </div>

                  <p style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: 'italic',
                    fontSize: 16,
                    color: 'rgba(255,255,255,0.9)',
                    lineHeight: 1.6,
                    flex: 1,
                  }}>
                    "{review.comentario}"
                  </p>

                  <div>
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#C5A059',
                      marginBottom: 2,
                    }}>
                      {review.nombreCliente}
                    </p>
                    {fechaFormateada && (
                      <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.4)',
                      }}>
                        {fechaFormateada}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Separador dorado ── */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(197,160,89,0.4), transparent)',
          marginBottom: 56,
        }} />

        {/* ── Sub B: Por qué elegirnos ── */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 30,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.92)',
          }}>
            ¿Por qué elegirnos?
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {BULLETS.map((bullet) => {
            const Icon = bullet.icon
            return (
              <div
                key={bullet.titulo}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  flex: 1,
                  gap: 16,
                }}
              >
                {/* Ícono */}
                <div style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  background: 'rgba(197,160,89,0.12)',
                  border: '1px solid rgba(197,160,89,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={30} color="#C5A059" strokeWidth={1.5} />
                </div>

                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.92)',
                    marginBottom: 8,
                  }}>
                    {bullet.titulo}
                  </h3>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.65)',
                    lineHeight: 1.65,
                  }}>
                    {bullet.descripcion}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
