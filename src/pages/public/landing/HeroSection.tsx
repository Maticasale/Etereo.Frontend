import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ArrowDown, CalendarHeart, Clock3, Leaf, MapPin, Sparkles } from 'lucide-react'
import { turnosApi } from '@/api/turnos'
import { useAuthStore } from '@/store/authStore'
import type { EstadoTurno, TurnoDto } from '@/types/api'
import LandingReveal from './LandingReveal'

interface HeroSectionProps {
  onReservar: () => void
}

const HERO_ACTIVE_TURNOS: EstadoTurno[] = ['PendienteConfirmacion', 'Confirmado']

function getGreetingByHour(name: string) {
  const hour = new Date().getHours()
  if (hour < 12) return `Buenos días, ${name}`
  if (hour < 20) return `Buenas tardes, ${name}`
  return `Buenas noches, ${name}`
}

function formatHeroTurnoDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(value))
}

function formatHeroTurnoTime(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getNextTurno(turnos: TurnoDto[]) {
  const now = Date.now()
  return [...turnos]
    .filter(
      (turno) =>
        HERO_ACTIVE_TURNOS.includes(turno.estado) &&
        new Date(turno.fechaHoraInicio).getTime() > now,
    )
    .sort(
      (a, b) => new Date(a.fechaHoraInicio).getTime() - new Date(b.fechaHoraInicio).getTime(),
    )[0]
}

const MOCK_CLIENT_HERO_TURNO: TurnoDto = {
  id: 0,
  salon: 'Salon1',
  clienteId: 1,
  nombreCliente: 'Matías',
  operarioId: 1,
  nombreOperario: 'A confirmar',
  subservicioId: 1,
  nombreSubservicio: 'Pack 3: Axilas + Cavado + Tira de cola',
  nombreServicio: 'Depilación Láser',
  fechaHoraInicio: new Date(new Date().getFullYear(), 5, 3, 10, 30).toISOString(),
  duracionMin: 75,
  estado: 'Confirmado',
  precioBase: 29800,
  creadoEn: new Date().toISOString(),
  actualizadoEn: new Date().toISOString(),
}

const MOCK_CLIENT_HERO_COUPON = {
  codigo: 'LASER20',
  titulo: '20% de descuento en tu próxima sesión',
  vencimiento: '15/06/2026',
}

function BotanicalBackdrop() {
  return (
    <svg
      viewBox="0 0 1600 960"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="heroLeafPremium" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(233,205,140,0.55)" />
          <stop offset="100%" stopColor="rgba(233,205,140,0.03)" />
        </linearGradient>
        <radialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(249,245,240,0.16)" />
          <stop offset="100%" stopColor="rgba(249,245,240,0)" />
        </radialGradient>
      </defs>

      <ellipse cx="1200" cy="160" rx="420" ry="220" fill="url(#heroGlow)" opacity="0.72" />
      <ellipse cx="260" cy="760" rx="340" ry="180" fill="url(#heroGlow)" opacity="0.28" />

      <g fill="url(#heroLeafPremium)" stroke="rgba(223,195,134,0.22)" strokeWidth="0.85">
        <path d="M 55 -20 Q 20 260 40 520 T 18 1040" fill="none" stroke="rgba(223,195,134,0.24)" />
        <path d="M 1510 -20 Q 1550 220 1530 530 T 1585 1040" fill="none" stroke="rgba(223,195,134,0.22)" />

        {Array.from({ length: 24 }).map((_, index) => {
          const y = 28 + index * 37
          const x = 58 + Math.sin(index * 0.55) * 52
          const rot = -42 + (index % 2 ? 70 : -14)
          return (
            <ellipse
              key={`left-${index}`}
              cx={x}
              cy={y}
              rx="5"
              ry={24 + (index % 3) * 8}
              transform={`rotate(${rot} ${x} ${y})`}
            />
          )
        })}

        {Array.from({ length: 22 }).map((_, index) => {
          const y = 22 + index * 39
          const x = 1535 + Math.cos(index * 0.62) * 46
          const rot = 38 + (index % 2 ? -64 : 44)
          return (
            <ellipse
              key={`right-${index}`}
              cx={x}
              cy={y}
              rx="5"
              ry={24 + (index % 3) * 8}
              transform={`rotate(${rot} ${x} ${y})`}
            />
          )
        })}
      </g>
    </svg>
  )
}

function HeroEditorialCard({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <div
      className="landing-premium-surface"
      style={{
        borderRadius: 26,
        padding: 24,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 18px 36px rgba(15,10,7,0.14)',
        transition: 'transform 260ms ease, box-shadow 260ms ease, border-color 260ms ease',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: 'rgba(197,160,89,0.9)',
          marginBottom: 10,
        }}
      >
        {eyebrow}
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 25,
          lineHeight: 1.08,
          color: 'var(--color-tertiary)',
          marginBottom: 12,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.72)',
        }}
      >
        {body}
      </p>
    </div>
  )
}

function HeroClientPanel({
  turno,
  hasRealTurno,
}: {
  turno: TurnoDto
  hasRealTurno: boolean
}) {
  return (
    <div
      style={{
        borderRadius: 36,
        padding: 20,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 28px 54px rgba(18,10,6,0.22)',
      }}
    >
      <div
        style={{
          borderRadius: 28,
          minHeight: 520,
          padding: 24,
          background: `
            radial-gradient(circle at 70% 18%, rgba(255,255,255,0.18) 0%, transparent 22%),
            linear-gradient(180deg, rgba(248,244,238,0.18) 0%, rgba(255,255,255,0.04) 100%),
            rgba(58,42,31,0.72)
          `,
          display: 'grid',
          gridTemplateRows: 'auto auto 1fr',
          gap: 16,
        }}
      >
        <div
          className="landing-premium-surface"
          style={{
            borderRadius: 28,
            padding: 24,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 18px 36px rgba(15,10,7,0.14)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'rgba(197,160,89,0.9)',
              marginBottom: 10,
            }}
          >
            Próximo turno
          </div>
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 34,
              lineHeight: 1,
              color: 'var(--color-tertiary)',
              marginBottom: 12,
            }}
          >
            {formatHeroTurnoDate(turno.fechaHoraInicio)}
          </h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15, lineHeight: 1.7 }}>
              {formatHeroTurnoTime(turno.fechaHoraInicio)} hs · {turno.nombreServicio}
              <br />
              {turno.nombreSubservicio}
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 999,
                background:
                  turno.estado === 'Confirmado'
                    ? 'rgba(39,174,96,0.16)'
                    : 'rgba(197,160,89,0.16)',
                color: turno.estado === 'Confirmado' ? '#aef0c8' : '#f4d793',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              {turno.estado === 'Confirmado' ? '✓ Confirmado' : '⏳ Pendiente'}
            </span>
          </div>
          {!hasRealTurno ? (
            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                color: 'rgba(255,255,255,0.54)',
              }}
            >
              Preview visual temporal mientras terminamos de poblar esta vista con tus datos reales.
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            style={{
              borderRadius: 24,
              padding: 22,
              background: 'rgba(249,245,240,0.9)',
              color: 'var(--color-primary)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(44,31,20,0.48)',
                marginBottom: 10,
              }}
            >
              Beneficio disponible
            </div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 26,
                lineHeight: 1.08,
                marginBottom: 10,
              }}
            >
              {MOCK_CLIENT_HERO_COUPON.codigo}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                lineHeight: 1.7,
                color: 'rgba(44,31,20,0.72)',
              }}
            >
              {MOCK_CLIENT_HERO_COUPON.titulo}
              <br />
              Vence {MOCK_CLIENT_HERO_COUPON.vencimiento}
            </div>
          </div>

          <div
            style={{
              borderRadius: 24,
              padding: 22,
              background: 'rgba(27,18,13,0.52)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--color-tertiary)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(197,160,89,0.78)',
                marginBottom: 10,
              }}
            >
              Acceso rápido
            </div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 24,
                lineHeight: 1.15,
                marginBottom: 10,
              }}
            >
              Todo tu espacio en un solo lugar.
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              Revisá turnos, beneficios y novedades del salón sin volver a la reserva cada vez.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScrollCue({ visible }: { visible: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 22,
        transform: 'translateX(-50%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.28em',
          color: 'rgba(197,160,89,0.72)',
        }}
      >
        Descubrí
      </div>
      <ArrowDown
        size={18}
        color="#d9bb76"
        style={{ animation: 'heroFloatDown 1.8s ease-in-out infinite' }}
      />
    </div>
  )
}

export default function HeroSection({ onReservar }: HeroSectionProps) {
  const navigate = useNavigate()
  const usuario = useAuthStore((state) => state.usuario)
  const [showCue, setShowCue] = useState(true)
  const isClient = usuario?.rol === 'Cliente'
  const heroName = usuario?.nombre?.trim() || 'Etereo'

  const { data: turnosCliente } = useQuery({
    queryKey: ['turnos', 'proximo', usuario?.id],
    queryFn: turnosApi.getMisTurnos,
    enabled: isClient,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  })

  const proximoTurnoReal = isClient ? getNextTurno(turnosCliente ?? []) : undefined
  const proximoTurno = proximoTurnoReal ?? (isClient ? MOCK_CLIENT_HERO_TURNO : undefined)

  useEffect(() => {
    const handleScroll = () => setShowCue(window.scrollY < 72)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 18% 78%, rgba(197,160,89,0.17) 0%, transparent 32%),
          radial-gradient(circle at 78% 20%, rgba(249,245,240,0.16) 0%, transparent 28%),
          linear-gradient(145deg, #2d2119 0%, #4A3728 42%, #3a2c23 70%, #241913 100%)
        `,
      }}
    >
      <BotanicalBackdrop />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(18,12,8,0.3) 0%, rgba(18,12,8,0) 24%, rgba(18,12,8,0.28) 100%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1240,
          margin: '0 auto',
          padding: '136px 24px 84px',
          minHeight: '100vh',
          display: 'grid',
          alignItems: 'center',
        }}
        className="grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-10"
      >
        <div>
          {!isClient ? (
            <>
              <LandingReveal delay={80}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    borderRadius: 9999,
                    padding: '8px 14px',
                    marginBottom: 26,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.76)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  <Sparkles size={14} color="#d5ae64" />
                  Belleza & bienestar en Rafaela
                </div>
              </LandingReveal>

              <LandingReveal delay={150}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: '#e6cc8f',
                    lineHeight: 0.92,
                    textShadow: '0 10px 42px rgba(0,0,0,0.28)',
                  }}
                  className="text-[76px] sm:text-[96px] lg:text-[138px]"
                >
                  Etéreo
                </div>
              </LandingReveal>

              <LandingReveal delay={230}>
                <p
                  style={{
                    marginTop: 18,
                    maxWidth: 640,
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: 'italic',
                    fontWeight: 400,
                    color: 'rgba(255,255,255,0.86)',
                    lineHeight: 1.45,
                  }}
                  className="text-[24px] sm:text-[28px] lg:text-[34px]"
                >
                  Un refugio de belleza, cuidado y bienestar pensado para que cada visita se sienta íntima, elegante y simple.
                </p>
              </LandingReveal>

              <LandingReveal delay={300}>
                <p
                  style={{
                    marginTop: 20,
                    maxWidth: 620,
                    fontFamily: 'var(--font-body)',
                    fontSize: 15,
                    lineHeight: 1.8,
                    color: 'rgba(255,255,255,0.68)',
                  }}
                >
                  Te esperamos en Moreno 212 · 1A, Rafaela. Reservá online, descubrí nuestros servicios y conocé una experiencia de salón construida con detalle, calidez y resultados visibles desde el primer momento.
                </p>
              </LandingReveal>

              <LandingReveal delay={360}>
                <div className="flex flex-col sm:flex-row gap-4 mt-10">
                  <button
                    onClick={onReservar}
                    className="landing-hero-primary"
                    style={{
                      border: '1px solid rgba(224,191,128,0.18)',
                      background: 'linear-gradient(135deg, #f6e5b8 0%, #dbb46d 42%, #b88237 100%)',
                      color: '#2C1F14',
                      borderRadius: 9999,
                      padding: '17px 28px',
                      fontFamily: 'var(--font-body)',
                      fontSize: 13,
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      boxShadow: '0 18px 34px rgba(99,67,20,0.26)',
                      transition: 'transform 220ms ease, box-shadow 220ms ease, filter 220ms ease',
                    }}
                  >
                    <CalendarHeart size={18} strokeWidth={1.8} />
                    Reservar mi turno
                  </button>

                  <button
                    onClick={() => navigate('/login')}
                    className="landing-hero-secondary"
                    style={{
                      border: '1px solid rgba(255,255,255,0.22)',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'var(--color-tertiary)',
                      borderRadius: 9999,
                      padding: '17px 28px',
                      fontFamily: 'var(--font-body)',
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'transform 220ms ease, background 220ms ease, border-color 220ms ease',
                    }}
                  >
                    Ingresar
                  </button>
                </div>
              </LandingReveal>
            </>
          ) : (
            <>
              <LandingReveal delay={80}>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: 'italic',
                    fontSize: 'clamp(26px, 3vw, 36px)',
                    color: '#e6cc8f',
                    lineHeight: 1.1,
                  }}
                >
                  {getGreetingByHour(heroName)}
                </div>
              </LandingReveal>

              <LandingReveal delay={150}>
                <div
                  style={{
                    marginTop: 18,
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(48px, 6vw, 86px)',
                    lineHeight: 0.94,
                    color: 'var(--color-tertiary)',
                    maxWidth: 720,
                  }}
                >
                  Tu próxima visita empieza acá.
                </div>
              </LandingReveal>

              <LandingReveal delay={240}>
                <p
                  style={{
                    marginTop: 18,
                    maxWidth: 620,
                    fontFamily: 'var(--font-body)',
                    fontSize: 16,
                    lineHeight: 1.82,
                    color: 'rgba(255,255,255,0.72)',
                  }}
                >
                  Gestioná tus turnos, reservá una nueva visita y seguí de cerca las novedades del salón desde tu espacio personal.
                </p>
              </LandingReveal>

              <LandingReveal delay={300}>
                {proximoTurno ? (
                  <div
                    style={{
                      marginTop: 28,
                      maxWidth: 540,
                      borderRadius: 20,
                      padding: 20,
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(197,160,89,0.3)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '8px 12px',
                          borderRadius: 999,
                          background:
                            proximoTurno.estado === 'Confirmado'
                              ? 'rgba(39,174,96,0.16)'
                              : 'rgba(197,160,89,0.16)',
                          color: proximoTurno.estado === 'Confirmado' ? '#aef0c8' : '#f4d793',
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {proximoTurno.estado === 'Confirmado'
                          ? '✓ Confirmado'
                          : '⏳ Pendiente de confirmación'}
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          color: 'rgba(255,255,255,0.72)',
                          fontSize: 12,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                        }}
                      >
                        <MapPin size={14} />
                        {proximoTurno.salon === 'Salon2' ? 'Peluquería & maquillaje' : 'Estética & bienestar'}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 16,
                        fontFamily: 'var(--font-heading)',
                        fontSize: 'clamp(30px, 3.4vw, 40px)',
                        lineHeight: 1.02,
                        color: 'var(--color-tertiary)',
                      }}
                    >
                      {formatHeroTurnoDate(proximoTurno.fechaHoraInicio)}
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 17,
                        color: 'rgba(255,255,255,0.8)',
                        fontWeight: 600,
                      }}
                    >
                      {formatHeroTurnoTime(proximoTurno.fechaHoraInicio)} hs · {proximoTurno.nombreServicio}
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 14,
                        color: 'rgba(255,255,255,0.68)',
                      }}
                    >
                      {proximoTurno.nombreSubservicio}
                    </div>
                    {proximoTurno.estado === 'PendienteConfirmacion' ? (
                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 13,
                          color: 'rgba(255,255,255,0.66)',
                        }}
                      >
                        Te avisamos por WhatsApp
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p
                    style={{
                      marginTop: 28,
                      fontSize: 16,
                      color: 'rgba(255,255,255,0.6)',
                    }}
                  >
                    No tenés turnos próximos.
                  </p>
                )}
              </LandingReveal>

              <LandingReveal delay={380}>
                <div className="flex flex-col sm:flex-row gap-4 mt-10">
                  <button
                    onClick={() => navigate('/mi-espacio')}
                    className="landing-hero-secondary"
                    style={{
                      border: '1px solid rgba(255,255,255,0.22)',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'var(--color-tertiary)',
                      borderRadius: 9999,
                      padding: '17px 28px',
                      fontFamily: 'var(--font-body)',
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'transform 220ms ease, background 220ms ease, border-color 220ms ease',
                    }}
                  >
                    Ver mi Espacio →
                  </button>
                </div>
              </LandingReveal>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            {[
              { icon: MapPin, label: 'Dirección', value: 'Moreno 212 · 1A' },
              { icon: Leaf, label: 'Ciudad', value: 'Rafaela, Santa Fe' },
              { icon: Clock3, label: 'Reservas', value: 'Rápidas, cómodas y online' },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <LandingReveal key={item.label} delay={430 + index * 90}>
                  <div
                    className="landing-inline-detail"
                    style={{
                      borderTop: '1px solid rgba(197,160,89,0.22)',
                      paddingTop: 14,
                      transition: 'transform 220ms ease, border-color 220ms ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <Icon size={16} color="#d5ae64" />
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.48)',
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 14,
                        fontWeight: 500,
                        color: 'rgba(255,255,255,0.82)',
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                </LandingReveal>
              )
            })}
          </div>
        </div>

        <LandingReveal delay={220} className="relative">
          {isClient && proximoTurno ? (
            <HeroClientPanel turno={proximoTurno} hasRealTurno={Boolean(proximoTurnoReal)} />
          ) : (
            <div
              style={{
                borderRadius: 36,
                padding: 20,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 100%)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 28px 54px rgba(18,10,6,0.22)',
              }}
            >
              <div
                style={{
                  borderRadius: 28,
                  minHeight: 520,
                  padding: 22,
                  background: `
                    radial-gradient(circle at 70% 18%, rgba(255,255,255,0.18) 0%, transparent 22%),
                    linear-gradient(180deg, rgba(248,244,238,0.18) 0%, rgba(255,255,255,0.04) 100%),
                    rgba(58,42,31,0.72)
                  `,
                  display: 'grid',
                  alignContent: 'space-between',
                  gap: 18,
                }}
              >
                <HeroEditorialCard
                  eyebrow="Bienvenida"
                  title="Una primera impresión más cálida, sofisticada y memorable."
                  body="Queremos que la experiencia digital transmita la misma calma y atención al detalle que se vive dentro del salón."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    style={{
                      borderRadius: 24,
                      padding: 22,
                      background: 'rgba(249,245,240,0.88)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: 'rgba(44,31,20,0.48)',
                        marginBottom: 10,
                      }}
                    >
                      Estilo Etereo
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 25,
                        lineHeight: 1.12,
                        marginBottom: 10,
                      }}
                    >
                      Belleza que se siente serena.
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 14,
                        lineHeight: 1.7,
                        color: 'rgba(44,31,20,0.72)',
                      }}
                    >
                      Tonos cálidos, curvas suaves y composición más editorial para salir del look genérico.
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: 24,
                      padding: 22,
                      background: 'rgba(27,18,13,0.52)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'var(--color-tertiary)',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: 'rgba(197,160,89,0.78)',
                        marginBottom: 10,
                      }}
                    >
                      Promesa
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 22,
                        lineHeight: 1.15,
                        marginBottom: 10,
                      }}
                    >
                      Cuidar cada detalle, también online.
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 14,
                        lineHeight: 1.7,
                        color: 'rgba(255,255,255,0.7)',
                      }}
                    >
                      La landing no solo informa: marca el tono de la marca antes de la reserva.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </LandingReveal>
      </div>

      <ScrollCue visible={showCue} />

      <style>{`
        @keyframes heroFloatDown {
          0%, 100% { transform: translateY(0); opacity: 0.65; }
          50% { transform: translateY(7px); opacity: 1; }
        }

        .landing-hero-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 24px 40px rgba(99,67,20,0.32);
          filter: saturate(1.04);
        }

        .landing-hero-secondary:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.34);
        }

        .landing-inline-detail:hover {
          transform: translateY(-2px);
          border-color: rgba(197,160,89,0.38);
        }

        .landing-premium-surface:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 44px rgba(15,10,7,0.2);
          border-color: rgba(255,255,255,0.18);
        }
      `}</style>
    </section>
  )
}
