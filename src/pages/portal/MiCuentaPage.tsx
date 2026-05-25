import { Link } from 'react-router-dom'
import {
  CalendarHeart,
  ChevronRight,
  Gift,
  Sparkles,
  Ticket,
  UserRound,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const quickLinks = [
  {
    to: '/mis-turnos',
    title: 'Mis turnos',
    description: 'Consultá próximos turnos, estados y detalles de cada reserva.',
    icon: CalendarHeart,
  },
  {
    to: '/mis-cupones',
    title: 'Mis cupones',
    description: 'Revisá descuentos disponibles y promociones activas para tu próxima visita.',
    icon: Ticket,
  },
  {
    to: '/mi-perfil',
    title: 'Mi perfil',
    description: 'Verificá tus datos personales y la información de contacto guardada.',
    icon: UserRound,
  },
]

const featuredCoupons = [
  {
    code: 'BIENVENIDA10',
    title: '10% de descuento',
    note: 'Ideal para reservar tu próximo turno desde la web.',
  },
  {
    code: 'LASER20',
    title: '20% en Depilación Láser',
    note: 'Promoción especial para sesiones seleccionadas.',
  },
]

export default function MiCuentaPage() {
  const usuario = useAuthStore((state) => state.usuario)
  const firstName = usuario?.nombre?.trim() || 'Bienvenida'

  return (
    <div style={{ padding: '10px 0 28px' }}>
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 30,
          border: '1px solid rgba(197,160,89,0.16)',
          background:
            'radial-gradient(circle at 78% 18%, rgba(197,160,89,0.2), transparent 28%), linear-gradient(135deg, #5a4530 0%, #3e2e22 52%, #261b14 100%)',
          boxShadow: '0 28px 54px rgba(49, 33, 22, 0.18)',
          padding: '38px 42px',
          color: 'var(--color-tertiary)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 'auto -80px -120px auto',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(197,160,89,0.18), transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: '22px 22px auto auto',
            padding: '10px 14px',
            borderRadius: 9999,
            border: '1px solid rgba(197,160,89,0.22)',
            background: 'rgba(255,255,255,0.06)',
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(240,223,188,0.94)',
            fontWeight: 700,
          }}
        >
          Mi espacio
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 14px',
              borderRadius: 9999,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: 18,
              fontSize: 12,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(240,223,188,0.88)',
              fontWeight: 700,
            }}
          >
            <Sparkles size={14} strokeWidth={1.9} />
            Cuenta cliente
          </div>

          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(42px, 5.2vw, 68px)',
              lineHeight: 0.96,
              fontWeight: 600,
              color: 'var(--color-tertiary)',
            }}
          >
            Hola, {firstName}
          </h1>

          <p
            style={{
              marginTop: 18,
              maxWidth: 640,
              fontSize: 19,
              lineHeight: 1.7,
              color: 'rgba(249,245,240,0.8)',
            }}
          >
            Desde acá podés reservar un nuevo turno, revisar tus cupones y tener a mano
            todo lo importante de tu cuenta.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 28 }}>
            <Link
              to="/reservar"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '16px 24px',
                borderRadius: 9999,
                background: 'linear-gradient(135deg, #f4e1b4 0%, #ddb66f 48%, #c18c45 100%)',
                color: '#2C1F14',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                boxShadow: '0 16px 30px rgba(126, 88, 28, 0.24)',
              }}
            >
              <CalendarHeart size={16} strokeWidth={1.9} />
              Reservar nuevo turno
            </Link>

            <Link
              to="/mis-turnos"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '16px 24px',
                borderRadius: 9999,
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--color-tertiary)',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Ver mis turnos
            </Link>
          </div>
        </div>
      </section>

      <section
        style={{
          marginTop: 28,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)',
          gap: 22,
        }}
        className="mi-cuenta-grid"
      >
        <div
          style={{
            background: '#fffdfb',
            border: '1px solid rgba(197,160,89,0.14)',
            borderRadius: 28,
            boxShadow: '0 18px 42px rgba(74,55,40,0.08)',
            padding: 30,
          }}
        >
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
            Próximo paso
          </div>

          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--font-heading)',
              fontSize: 48,
              lineHeight: 1,
              color: 'var(--color-text-primary)',
            }}
          >
            Reservá tu próxima visita
          </h2>

          <p
            style={{
              marginTop: 16,
              maxWidth: 560,
              fontSize: 17,
              lineHeight: 1.75,
              color: 'var(--color-text-secondary)',
            }}
          >
            Elegí salón, servicio, horario y revisá tus descuentos disponibles en un
            flujo simple, pensado para resolver tu reserva en pocos pasos.
          </p>

          <div
            style={{
              marginTop: 28,
              padding: '18px 20px',
              borderRadius: 22,
              background: 'linear-gradient(180deg, rgba(249,245,240,0.98) 0%, rgba(255,250,245,0.9) 100%)',
              border: '1px solid rgba(197,160,89,0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 18,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--color-secondary)',
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                Siguiente recomendación
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 29,
                  color: 'var(--color-text-primary)',
                }}
              >
                Elegí un horario que te quede cómodo
              </div>
            </div>

            <Link
              to="/reservar"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: 'var(--color-primary)',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                fontSize: 12,
              }}
            >
              Ir a reservar
              <ChevronRight size={16} strokeWidth={2} />
            </Link>
          </div>
        </div>

        <div
          style={{
            background: '#fffdfb',
            border: '1px solid rgba(197,160,89,0.14)',
            borderRadius: 28,
            boxShadow: '0 18px 42px rgba(74,55,40,0.08)',
            padding: 30,
          }}
        >
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
            Cupones destacados
          </div>

          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--font-heading)',
              fontSize: 38,
              lineHeight: 1.02,
              color: 'var(--color-text-primary)',
            }}
          >
            Beneficios para tu próxima reserva
          </h2>

          <div style={{ marginTop: 22, display: 'grid', gap: 14 }}>
            {featuredCoupons.map((coupon) => (
              <div
                key={coupon.code}
                style={{
                  borderRadius: 22,
                  border: '1px solid rgba(197,160,89,0.16)',
                  background: 'linear-gradient(180deg, rgba(255,252,246,1) 0%, rgba(250,245,236,0.94) 100%)',
                  padding: '18px 18px 16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 16,
                      background: 'rgba(197,160,89,0.14)',
                      display: 'grid',
                      placeItems: 'center',
                      color: 'var(--color-secondary)',
                    }}
                  >
                    <Gift size={20} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'var(--color-secondary)',
                        fontWeight: 800,
                      }}
                    >
                      {coupon.code}
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 20,
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {coupon.title}
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    margin: '12px 0 0',
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {coupon.note}
                </p>
              </div>
            ))}
          </div>

          <Link
            to="/mis-cupones"
            style={{
              marginTop: 20,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--color-primary)',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              fontSize: 12,
            }}
          >
            Ver todos mis cupones
            <ChevronRight size={16} strokeWidth={2} />
          </Link>
        </div>
      </section>

      <section style={{ marginTop: 22 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 18,
          }}
          className="mi-cuenta-links"
        >
          {quickLinks.map(({ to, title, description, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              style={{
                textDecoration: 'none',
                borderRadius: 26,
                border: '1px solid rgba(197,160,89,0.14)',
                background: '#fffdfb',
                boxShadow: '0 18px 42px rgba(74,55,40,0.08)',
                padding: '24px 24px 22px',
                color: 'inherit',
                display: 'block',
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 18,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(197,160,89,0.12)',
                  color: 'var(--color-secondary)',
                  marginBottom: 18,
                }}
              >
                <Icon size={24} strokeWidth={1.8} />
              </div>

              <h3
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-heading)',
                  fontSize: 32,
                  lineHeight: 1,
                  color: 'var(--color-text-primary)',
                }}
              >
                {title}
              </h3>

              <p
                style={{
                  margin: '14px 0 0',
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: 'var(--color-text-secondary)',
                }}
              >
                {description}
              </p>

              <div
                style={{
                  marginTop: 20,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-primary)',
                  fontWeight: 800,
                }}
              >
                Abrir sección
                <ChevronRight size={16} strokeWidth={2} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <style>{`
        @media (max-width: 1100px) {
          .mi-cuenta-grid,
          .mi-cuenta-links {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
