import { Award, ShieldCheck, Sparkles, Quote } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import LandingReveal from './LandingReveal'

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

function StarSVG({ fillPercent, size = 20 }: { fillPercent: number; size?: number }) {
  const clipId = `landing-star-${size}-${Math.round(fillPercent * 100)}`
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
      <path
        d={starPath}
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(232,206,151,0.24)"
        strokeWidth="1"
      />
      <path d={starPath} fill="#e7cb8c" clipPath={`url(#${clipId})`} />
    </svg>
  )
}

function StarRating({ value, size = 20 }: { value: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 4 }} role="img" aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((index) => (
        <StarSVG key={index} fillPercent={value - (index - 1)} size={size} />
      ))}
    </div>
  )
}

function SectionBotanical() {
  return (
    <svg
      viewBox="0 0 520 720"
      style={{
        position: 'absolute',
        top: -40,
        right: -40,
        width: 340,
        height: '100%',
        opacity: 0.16,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="reviewLeafGradPremium" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(231,203,140,0.82)" />
          <stop offset="100%" stopColor="rgba(231,203,140,0.03)" />
        </linearGradient>
      </defs>
      <g fill="url(#reviewLeafGradPremium)" stroke="rgba(231,203,140,0.34)" strokeWidth="0.8">
        <path d="M 470 -10 Q 440 230 398 454 T 350 760" fill="none" />
        {Array.from({ length: 20 }).map((_, index) => {
          const y = 18 + index * 34
          const x = 450 + Math.sin(index * 0.66) * 42
          const rot = -28 + (index % 2 ? 68 : -18)
          return (
            <ellipse
              key={index}
              cx={x}
              cy={y}
              rx="5"
              ry={24 + (index % 3) * 7}
              transform={`rotate(${rot} ${x} ${y})`}
            />
          )
        })}
      </g>
    </svg>
  )
}

const BULLETS = [
  {
    icon: Award,
    titulo: 'Profesionales certificadas',
    descripcion: 'Nuestras operarias están capacitadas y actualizadas en las últimas técnicas del rubro.',
  },
  {
    icon: Sparkles,
    titulo: 'Ambiente pensado para vos',
    descripcion: 'Dos salones diseñados para que tu experiencia sea cómoda, relajante y única desde el primer momento.',
  },
  {
    icon: ShieldCheck,
    titulo: 'Resultados que se notan',
    descripcion: 'Usamos productos de primera calidad y técnicas que garantizan resultados visibles y duraderos.',
  },
]

export default function CalificacionesSection() {
  const { promedioGlobal, total, reviews } = MOCK_DATA
  const reviewsConComentario = reviews.filter((item) => item.comentario)

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '110px 0',
        background: `
          radial-gradient(circle at 18% 22%, rgba(197,160,89,0.14) 0%, transparent 22%),
          linear-gradient(135deg, #3a2b20 0%, #4A3728 38%, #241913 100%)
        `,
      }}
    >
      <SectionBotanical />

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <div className="grid grid-cols-1 lg:grid-cols-[0.72fr_1.28fr] gap-12 items-start">
          <LandingReveal delay={80}>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#dfbe7a',
                marginBottom: 18,
              }}
            >
              Experiencia real
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 48,
                lineHeight: 0.98,
                color: 'var(--color-tertiary)',
                marginBottom: 22,
                maxWidth: 340,
              }}
            >
              Lo que más valoran quienes nos visitan.
            </h2>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 15,
                lineHeight: 1.86,
                color: 'rgba(255,255,255,0.7)',
                maxWidth: 340,
              }}
            >
              Testimonios, promedio y motivos para elegirnos con transiciones suaves al entrar en pantalla y pequeños gestos de hover para sostener una sensación premium.
            </p>

            <div
              className="landing-rating-summary"
              style={{
                marginTop: 32,
                borderRadius: 30,
                padding: 28,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                maxWidth: 330,
                transition: 'transform 260ms ease, box-shadow 260ms ease, border-color 260ms ease',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 88,
                  lineHeight: 0.9,
                  color: '#e8ca88',
                  marginBottom: 10,
                }}
              >
                {promedioGlobal.toFixed(1)}
              </div>

              <div style={{ marginBottom: 12 }}>
                <StarRating value={promedioGlobal} size={26} />
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.62)',
                }}
              >
                Basado en {total.toLocaleString('es-AR')} calificaciones
              </div>
            </div>
          </LandingReveal>

          <div>
            {reviewsConComentario.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {reviewsConComentario.map((review, index) => {
                  let fechaFormateada = ''
                  try {
                    fechaFormateada = format(parseISO(review.creadoEn), "d 'de' MMMM, yyyy", { locale: es })
                  } catch {
                    fechaFormateada = ''
                  }

                  return (
                    <LandingReveal key={review.id} delay={130 + index * 80}>
                      <article
                        className="landing-review-card"
                        style={{
                          borderRadius: 28,
                          padding: 24,
                          minHeight: 300,
                          display: 'flex',
                          flexDirection: 'column',
                          background:
                            index === 1
                              ? 'linear-gradient(180deg, rgba(249,245,240,0.92) 0%, rgba(241,231,215,0.92) 100%)'
                              : 'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.05) 100%)',
                          border:
                            index === 1
                              ? '1px solid rgba(255,255,255,0.08)'
                              : '1px solid rgba(255,255,255,0.1)',
                          boxShadow:
                            index === 1
                              ? '0 24px 44px rgba(22,14,10,0.18)'
                              : '0 18px 34px rgba(18,12,8,0.14)',
                          color: index === 1 ? 'var(--color-primary)' : 'var(--color-tertiary)',
                          transition: 'transform 260ms ease, box-shadow 260ms ease, border-color 260ms ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                          <StarRating value={review.puntuacion} size={16} />
                          <Quote size={18} color={index === 1 ? 'rgba(44,31,20,0.25)' : 'rgba(231,203,140,0.5)'} />
                        </div>

                        <p
                          style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            fontStyle: 'italic',
                            fontSize: 20,
                            lineHeight: 1.55,
                            color: index === 1 ? 'rgba(44,31,20,0.88)' : 'rgba(255,255,255,0.9)',
                            marginBottom: 20,
                            flex: 1,
                          }}
                        >
                          "{review.comentario}"
                        </p>

                        <div
                          style={{
                            paddingTop: 16,
                            borderTop:
                              index === 1
                                ? '1px solid rgba(44,31,20,0.12)'
                                : '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          <div
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: 13,
                              fontWeight: 700,
                              color: index === 1 ? 'var(--color-primary)' : '#e8ca88',
                              marginBottom: 4,
                            }}
                          >
                            {review.nombreCliente}
                          </div>
                          {fechaFormateada && (
                            <div
                              style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: 11,
                                color:
                                  index === 1 ? 'rgba(44,31,20,0.48)' : 'rgba(255,255,255,0.42)',
                              }}
                            >
                              {fechaFormateada}
                            </div>
                          )}
                        </div>
                      </article>
                    </LandingReveal>
                  )
                })}
              </div>
            )}

            <LandingReveal delay={120}>
              <div
                style={{
                  height: 1,
                  margin: '54px 0 38px',
                  background: 'linear-gradient(90deg, transparent, rgba(231,203,140,0.35), transparent)',
                }}
              />
            </LandingReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {BULLETS.map((bullet, index) => {
                const Icon = bullet.icon
                return (
                  <LandingReveal key={bullet.titulo} delay={180 + index * 80}>
                    <div
                      className="landing-bullet-card"
                      style={{
                        borderRadius: 26,
                        padding: 24,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        transition: 'transform 260ms ease, background 260ms ease, border-color 260ms ease',
                      }}
                    >
                      <div
                        style={{
                          width: 58,
                          height: 58,
                          borderRadius: 18,
                          marginBottom: 18,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(180deg, rgba(231,203,140,0.12) 0%, rgba(231,203,140,0.04) 100%)',
                          border: '1px solid rgba(231,203,140,0.16)',
                        }}
                      >
                        <Icon size={26} color="#e7cb8c" strokeWidth={1.7} />
                      </div>
                      <h3
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: 24,
                          lineHeight: 1.08,
                          color: 'var(--color-tertiary)',
                          marginBottom: 10,
                        }}
                      >
                        {bullet.titulo}
                      </h3>
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 14,
                          lineHeight: 1.75,
                          color: 'rgba(255,255,255,0.66)',
                        }}
                      >
                        {bullet.descripcion}
                      </p>
                    </div>
                  </LandingReveal>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .landing-rating-summary:hover {
          transform: translateY(-4px);
          box-shadow: 0 28px 48px rgba(18,12,8,0.18);
          border-color: rgba(255,255,255,0.16);
        }

        .landing-review-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 28px 48px rgba(18,12,8,0.2);
          border-color: rgba(231,203,140,0.18);
        }

        .landing-bullet-card:hover {
          transform: translateY(-4px);
          background: rgba(255,255,255,0.07);
          border-color: rgba(231,203,140,0.16);
        }
      `}</style>
    </section>
  )
}
