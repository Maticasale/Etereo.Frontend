import { useQuery } from '@tanstack/react-query'
import {
  Zap,
  Leaf,
  HeartHandshake,
  Eye,
  Flower2,
  Scissors,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { serviciosApi } from '@/api/servicios'
import type { ServicioDto } from '@/types/api'
import LandingReveal from './LandingReveal'

const ICONO_MAP: Record<string, LucideIcon> = {
  'Depilación Láser': Zap,
  'Depilación Descartable': Leaf,
  Masajes: HeartHandshake,
  'Cejas & Pestañas': Eye,
  Facial: Flower2,
  Peluquería: Scissors,
}

function getIcono(nombre: string): LucideIcon {
  if (ICONO_MAP[nombre]) return ICONO_MAP[nombre]
  const key = Object.keys(ICONO_MAP).find((item) => nombre.includes(item))
  return key ? ICONO_MAP[key] : Sparkles
}

function ServicioSkeleton() {
  return (
    <div
      style={{
        borderRadius: 28,
        padding: 28,
        minHeight: 284,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(249,245,240,0.84) 100%)',
        border: '1px solid rgba(74,55,40,0.08)',
        boxShadow: '0 24px 40px rgba(74,55,40,0.08)',
        animation: 'landingSkeletonPulse 1.35s ease-in-out infinite',
      }}
    >
      <div style={{ width: 62, height: 62, borderRadius: '50%', background: '#ebe2d8', marginBottom: 26 }} />
      <div style={{ width: '74%', height: 24, borderRadius: 8, background: '#ebe2d8', marginBottom: 12 }} />
      <div style={{ width: '45%', height: 16, borderRadius: 8, background: '#ebe2d8', marginBottom: 30 }} />
      <div style={{ width: '88%', height: 12, borderRadius: 8, background: '#f1e8df', marginBottom: 12 }} />
      <div style={{ width: '70%', height: 12, borderRadius: 8, background: '#f1e8df', marginBottom: 28 }} />
      <div style={{ width: '42%', height: 14, borderRadius: 8, background: '#ebe2d8' }} />
    </div>
  )
}

function ServicioCard({ servicio, index }: { servicio: ServicioDto; index: number }) {
  const Icono = getIcono(servicio.nombre)
  const subserviciosActivos = servicio.subservicios.filter((item) => item.activo)
  const preciosDisponibles = subserviciosActivos.flatMap((subservicio) => {
    const preciosVariante = subservicio.variantes
      .filter((variante) => variante.activo)
      .map((variante) => variante.precio)

    return subservicio.precio != null ? [subservicio.precio, ...preciosVariante] : preciosVariante
  })

  const precioDesde = preciosDisponibles.length > 0 ? Math.min(...preciosDisponibles) : null
  const precioFormateado =
    precioDesde != null
      ? precioDesde.toLocaleString('es-AR', {
          style: 'currency',
          currency: 'ARS',
          maximumFractionDigits: 0,
        })
      : null

  return (
    <article
      className="landing-service-card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 30,
        minHeight: 294,
        padding: 30,
        display: 'flex',
        flexDirection: 'column',
        background:
          index % 3 === 1
            ? 'linear-gradient(180deg, rgba(74,55,40,0.96) 0%, rgba(53,38,28,1) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,240,233,0.94) 100%)',
        color: index % 3 === 1 ? 'var(--color-tertiary)' : 'var(--color-text-primary)',
        border:
          index % 3 === 1
            ? '1px solid rgba(197,160,89,0.16)'
            : '1px solid rgba(74,55,40,0.08)',
        boxShadow:
          index % 3 === 1
            ? '0 24px 42px rgba(35,24,18,0.18)'
            : '0 24px 40px rgba(74,55,40,0.08)',
        transition: 'transform 260ms ease, box-shadow 260ms ease, border-color 260ms ease',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 'auto -30px -50px auto',
          width: 170,
          height: 170,
          borderRadius: '50%',
          background:
            index % 3 === 1
              ? 'radial-gradient(circle, rgba(197,160,89,0.18) 0%, transparent 68%)'
              : 'radial-gradient(circle, rgba(197,160,89,0.12) 0%, transparent 68%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: 66,
          height: 66,
          borderRadius: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            index % 3 === 1
              ? 'rgba(249,245,240,0.08)'
              : 'linear-gradient(180deg, rgba(197,160,89,0.14) 0%, rgba(197,160,89,0.04) 100%)',
          border:
            index % 3 === 1
              ? '1px solid rgba(249,245,240,0.12)'
              : '1px solid rgba(197,160,89,0.14)',
          marginBottom: 24,
        }}
      >
        <Icono
          size={28}
          color={index % 3 === 1 ? '#e0bc7b' : 'var(--color-secondary)'}
          strokeWidth={1.6}
        />
      </div>

      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.22em',
          color: index % 3 === 1 ? 'rgba(255,255,255,0.45)' : 'rgba(44,31,20,0.42)',
          marginBottom: 14,
        }}
      >
        Ritual destacado
      </div>

      <h3
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 28,
          lineHeight: 1.05,
          color: index % 3 === 1 ? 'var(--color-tertiary)' : 'var(--color-text-primary)',
          marginBottom: 14,
          maxWidth: 220,
        }}
      >
        {servicio.nombre}
      </h3>

      {precioFormateado && (
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 28,
            color: index % 3 === 1 ? '#eccf91' : 'var(--color-secondary)',
            marginBottom: 10,
          }}
        >
          Desde {precioFormateado}
        </div>
      )}

      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          lineHeight: 1.7,
          color: index % 3 === 1 ? 'rgba(255,255,255,0.66)' : 'var(--color-text-secondary)',
          marginBottom: 30,
        }}
      >
        {subserviciosActivos.length}{' '}
        {subserviciosActivos.length === 1 ? 'opción disponible' : 'opciones disponibles'} para
        encontrar el tratamiento ideal según tu necesidad.
      </p>

      <div className="landing-service-link" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, transition: 'transform 220ms ease' }}>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: index % 3 === 1 ? '#eccf91' : 'var(--color-secondary)',
          }}
        >
          Ver opciones
        </span>
        <ArrowUpRight size={15} color={index % 3 === 1 ? '#eccf91' : '#C5A059'} />
      </div>
    </article>
  )
}

export default function ServiciosSection() {
  const { data: servicios, isLoading, isError } = useQuery({
    queryKey: ['servicios', 'landing'],
    queryFn: serviciosApi.getServicios,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })

  const serviciosActivos = servicios?.filter((item) => item.activo) ?? []

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: `
          radial-gradient(circle at 10% 15%, rgba(197,160,89,0.08) 0%, transparent 22%),
          linear-gradient(180deg, #f8f3ee 0%, #f4ede4 100%)
        `,
        padding: '110px 0 120px',
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-12 items-start">
          <LandingReveal className="lg:sticky lg:top-[112px]" delay={80}>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--color-secondary)',
                marginBottom: 16,
              }}
            >
              Servicios destacados
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 48,
                lineHeight: 0.96,
                color: 'var(--color-text-primary)',
                marginBottom: 22,
                maxWidth: 360,
              }}
            >
              Tratamientos pensados para sentirte bien.
            </h2>

            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 15,
                lineHeight: 1.86,
                color: 'var(--color-text-secondary)',
                maxWidth: 360,
              }}
            >
              Cada servicio entra con una aparición suave al hacer scroll y una respuesta sutil al hover, para que la experiencia se sienta más viva sin perder elegancia.
            </p>
          </LandingReveal>

          <div>
            {isError && (
              <LandingReveal delay={120}>
                <div
                  style={{
                    marginBottom: 24,
                    borderRadius: 22,
                    padding: 20,
                    background: 'rgba(255,255,255,0.72)',
                    border: '1px solid rgba(74,55,40,0.08)',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 15,
                  }}
                >
                  Nuestros servicios siguen disponibles. Si no pudimos cargarlos ahora, podés avanzar igualmente con tu reserva.
                </div>
              </LandingReveal>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => <ServicioSkeleton key={index} />)
                : serviciosActivos.map((servicio, index) => (
                    <LandingReveal key={servicio.id} delay={110 + index * 70}>
                      <ServicioCard servicio={servicio} index={index} />
                    </LandingReveal>
                  ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes landingSkeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.58; }
        }

        .landing-service-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 30px 52px rgba(74,55,40,0.14);
          border-color: rgba(197,160,89,0.18);
        }

        .landing-service-card:hover .landing-service-link {
          transform: translateX(4px);
        }
      `}</style>
    </section>
  )
}
