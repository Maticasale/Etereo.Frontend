import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  CalendarHeart,
  ChevronRight,
  Clock3,
  MapPin,
  Sparkles,
  Ticket,
  UserRound,
} from 'lucide-react'
import { cuponesApi } from '@/api/cupones'
import { turnosApi } from '@/api/turnos'
import PublicacionesSalon from '@/components/shared/PublicacionesSalon'
import { useAuthStore } from '@/store/authStore'
import type { CuponDto, EstadoTurno, TurnoDto } from '@/types/api'

const UPCOMING_STATES: EstadoTurno[] = ['PendienteConfirmacion', 'Confirmado']
const MI_ESPACIO_MOCK_TURNO: TurnoDto = {
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
  estado: 'PendienteConfirmacion',
  precioBase: 29800,
  creadoEn: new Date().toISOString(),
  actualizadoEn: new Date().toISOString(),
}

const MI_ESPACIO_MOCK_CUPON: CuponDto = {
  id: 0,
  codigo: 'BIENVENIDA10',
  descripcion: '10% de descuento para tu próxima reserva online.',
  tipoDescuento: 'Porcentaje',
  valor: 10,
  fechaDesde: new Date().toISOString(),
  fechaHasta: new Date(new Date().getFullYear(), 5, 15).toISOString(),
  usosActuales: 0,
  unUsoPorCliente: true,
  activo: true,
  creadoEn: new Date().toISOString(),
}

function getHourGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Que tengas un día lleno de bienestar.'
  if (hour < 20) return 'Esperamos que tu día esté yendo hermoso.'
  return 'Gracias por elegirnos para tu cuidado.'
}

function formatTurnoDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(value))
}

function formatTurnoTime(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatCouponDate(value?: string) {
  if (!value) return ''
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function getSalonLabel(value?: string) {
  if (!value) return 'Etéreo'
  if (value === 'Salon1') return 'Moreno 212 · Estética & bienestar'
  if (value === 'Salon2') return 'Moreno 212 · Peluquería & maquillaje'
  return value
}

function sortByDateAsc(items: TurnoDto[]) {
  return [...items].sort(
    (a, b) => new Date(a.fechaHoraInicio).getTime() - new Date(b.fechaHoraInicio).getTime(),
  )
}

function sortByDateDesc(items: TurnoDto[]) {
  return [...items].sort(
    (a, b) => new Date(b.fechaHoraInicio).getTime() - new Date(a.fechaHoraInicio).getTime(),
  )
}

function getNextTurnos(turnos: TurnoDto[]) {
  const now = Date.now()
  return sortByDateAsc(
    turnos.filter(
      (turno) =>
        UPCOMING_STATES.includes(turno.estado) &&
        new Date(turno.fechaHoraInicio).getTime() > now,
    ),
  )
}

function getLastRealizado(turnos: TurnoDto[]) {
  return sortByDateDesc(turnos.filter((turno) => turno.estado === 'Realizado'))[0]
}

function StatusBadge({ estado }: { estado: EstadoTurno }) {
  const isConfirmed = estado === 'Confirmado'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '8px 12px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        background: isConfirmed ? 'rgba(39,174,96,0.12)' : 'rgba(197,160,89,0.14)',
        color: isConfirmed ? '#1b7a46' : '#8d6b2d',
      }}
    >
      {isConfirmed ? '✓ Confirmado' : '⏳ Pendiente'}
    </span>
  )
}

function BotanicalHero() {
  return (
    <svg
      viewBox="0 0 1400 420"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="miEspacioLeaf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(197,160,89,0.46)" />
          <stop offset="100%" stopColor="rgba(197,160,89,0.06)" />
        </linearGradient>
      </defs>
      <g fill="url(#miEspacioLeaf)" stroke="rgba(197,160,89,0.18)" strokeWidth="0.8">
        {Array.from({ length: 14 }).map((_, index) => {
          const x = 1000 + Math.sin(index * 0.48) * 150
          const y = 24 + index * 28
          const rot = index % 2 ? 34 : -18
          return (
            <ellipse key={index} cx={x} cy={y} rx="10" ry={56} transform={`rotate(${rot} ${x} ${y})`} />
          )
        })}
        {Array.from({ length: 10 }).map((_, index) => {
          const x = 124 + Math.cos(index * 0.55) * 86
          const y = 300 + index * 18
          const rot = index % 2 ? -48 : 26
          return (
            <ellipse key={`left-${index}`} cx={x} cy={y} rx="8" ry={44} transform={`rotate(${rot} ${x} ${y})`} />
          )
        })}
      </g>
    </svg>
  )
}

function QuickLinkCard({
  to,
  title,
  description,
  accent,
  dark,
  icon,
  preview,
}: {
  to: string
  title: string
  description: string
  accent: string
  dark?: boolean
  icon: React.ReactNode
  preview?: string
}) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: 'none',
        borderRadius: 28,
        padding: 26,
        minHeight: 240,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: dark
          ? 'linear-gradient(180deg, rgba(74,55,40,0.98) 0%, rgba(49,36,27,1) 100%)'
          : '#fffdfa',
        color: dark ? 'var(--color-tertiary)' : 'var(--color-text-primary)',
        border: dark
          ? '1px solid rgba(197,160,89,0.16)'
          : '1px solid rgba(74,55,40,0.08)',
        boxShadow: dark
          ? '0 24px 42px rgba(49,36,27,0.18)'
          : '0 18px 36px rgba(74,55,40,0.08)',
      }}
    >
      <div>
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: dark ? 'rgba(255,255,255,0.08)' : accent,
            color: dark ? '#e9ca83' : 'var(--color-primary)',
            marginBottom: 24,
          }}
        >
          {icon}
        </div>

        <h3
          style={{
            margin: 0,
            fontFamily: 'var(--font-heading)',
            fontSize: dark ? 40 : 30,
            lineHeight: 1,
            color: dark ? 'var(--color-tertiary)' : 'var(--color-text-primary)',
          }}
        >
          {title}
        </h3>

        <p
          style={{
            marginTop: 14,
            fontSize: 15,
            lineHeight: 1.75,
            color: dark ? 'rgba(255,255,255,0.72)' : 'var(--color-text-secondary)',
            marginBottom: 0,
          }}
        >
          {description}
        </p>

        {preview ? (
          <div
            style={{
              marginTop: 16,
              fontSize: 13,
              lineHeight: 1.65,
              color: dark ? 'rgba(233,202,131,0.92)' : 'var(--color-secondary)',
              fontWeight: 600,
            }}
          >
            {preview}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: dark ? '#e9ca83' : 'var(--color-secondary)',
        }}
      >
        Ir ahora
        <ChevronRight size={15} />
      </div>
    </Link>
  )
}

function VoucherCard({ cupon }: { cupon: CuponDto }) {
  const label =
    cupon.tipoDescuento === 'Porcentaje'
      ? `${cupon.valor}%`
      : cupon.valor.toLocaleString('es-AR', {
          style: 'currency',
          currency: 'ARS',
          maximumFractionDigits: 0,
        })

  return (
    <article
      style={{
        display: 'grid',
        gridTemplateColumns: '140px minmax(0, 1fr)',
        overflow: 'hidden',
        borderRadius: 28,
        background: '#fffdfa',
        border: '1px solid rgba(197,160,89,0.14)',
        boxShadow: '0 18px 34px rgba(74,55,40,0.08)',
      }}
    >
      <div
        style={{
          padding: '24px 16px',
          background: 'linear-gradient(180deg, rgba(74,55,40,0.98) 0%, rgba(57,41,30,1) 100%)',
          color: 'var(--color-tertiary)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 38, color: '#e7c57f', lineHeight: 0.95 }}>
          {label}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          OFF
        </div>
      </div>

      <div style={{ padding: '24px 24px 22px', borderLeft: '1px dashed rgba(197,160,89,0.24)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--color-secondary)',
            }}
          >
            {cupon.codigo}
          </div>
          <span
            style={{
              padding: '8px 11px',
              borderRadius: 999,
              background: 'rgba(39,174,96,0.12)',
              color: '#1f7c49',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Disponible
          </span>
        </div>

        <div
          style={{
            marginTop: 10,
            fontFamily: 'var(--font-heading)',
            fontSize: 30,
            color: 'var(--color-text-primary)',
          }}
        >
          {cupon.descripcion || cupon.codigo}
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 14,
            lineHeight: 1.75,
            color: 'var(--color-text-secondary)',
          }}
        >
          {cupon.fechaHasta ? `Vence: ${formatCouponDate(cupon.fechaHasta)}` : 'Sin vencimiento informado'}
        </div>
      </div>
    </article>
  )
}

export default function MiEspacioPage() {
  const usuario = useAuthStore((state) => state.usuario)
  const nombre = usuario?.nombre?.trim() || 'Etereo'
  const nombreCompleto = [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ')

  const turnosQuery = useQuery({
    queryKey: ['turnos', 'mi-espacio', usuario?.id],
    queryFn: turnosApi.getMisTurnos,
    enabled: usuario?.rol === 'Cliente',
    staleTime: 2 * 60 * 1000,
    retry: 1,
  })

  const cuponesQuery = useQuery({
    queryKey: ['cupones', 'mi-espacio', usuario?.id],
    queryFn: cuponesApi.getDisponibles,
    enabled: usuario?.rol === 'Cliente',
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const turnos = turnosQuery.data ?? []
  const cupones = cuponesQuery.data ?? []
  const proximosTurnos = getNextTurnos(turnos)
  const proximoTurnoReal = proximosTurnos[0]
  const proximoTurno = proximoTurnoReal ?? MI_ESPACIO_MOCK_TURNO
  const otrosTurnos = proximosTurnos.slice(1, 4)
  const ultimoRealizado = getLastRealizado(turnos)
  const cuponesDestacados = cupones.length > 0 ? cupones.slice(0, 3) : [MI_ESPACIO_MOCK_CUPON]

  return (
    <main style={{ background: 'var(--color-tertiary)', padding: '120px 0 96px' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: 300,
            borderRadius: 34,
            padding: '42px 40px',
            background:
              'radial-gradient(circle at 78% 22%, rgba(197,160,89,0.18) 0%, transparent 24%), linear-gradient(135deg, #56402d 0%, #433124 48%, #261b14 100%)',
            boxShadow: '0 28px 56px rgba(49,36,27,0.18)',
            border: '1px solid rgba(197,160,89,0.16)',
            color: 'var(--color-tertiary)',
          }}
        >
          <BotanicalHero />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 760 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                marginBottom: 18,
                fontSize: 12,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(240,223,188,0.9)',
                fontWeight: 700,
              }}
            >
              <Sparkles size={14} />
              Mi espacio
            </div>

            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(52px, 7vw, 68px)',
                lineHeight: 0.98,
                color: 'var(--color-secondary)',
              }}
            >
              Hola, {nombre}
            </div>

            <p
              style={{
                marginTop: 18,
                maxWidth: 640,
                fontSize: 18,
                lineHeight: 1.76,
                color: 'rgba(249,245,240,0.82)',
              }}
            >
              {getHourGreeting()}
            </p>

            <div style={{ marginTop: 24, fontSize: 15, color: 'rgba(249,245,240,0.68)', maxWidth: 540, lineHeight: 1.7 }}>
              Tu espacio reúne próximos turnos, beneficios y accesos rápidos para que no tengas que empezar desde cero cada vez.
            </div>
          </div>
        </section>

        <section style={{ marginTop: 30 }}>
          {proximoTurno ? (
            <div
              style={{
                borderRadius: 30,
                background: '#fffdfa',
                borderLeft: `4px solid ${proximoTurno.estado === 'Confirmado' ? '#27AE60' : '#C5A059'}`,
                boxShadow: '0 18px 42px rgba(74,55,40,0.08)',
                borderTop: '1px solid rgba(74,55,40,0.06)',
                borderRight: '1px solid rgba(74,55,40,0.06)',
                borderBottom: '1px solid rgba(74,55,40,0.06)',
                padding: '28px 28px 26px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <StatusBadge estado={proximoTurno.estado} />
                  <div
                    style={{
                      marginTop: 18,
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(34px, 4.4vw, 54px)',
                      lineHeight: 0.98,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {formatTurnoDate(proximoTurno.fechaHoraInicio)}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 18,
                      color: 'var(--color-text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    {formatTurnoTime(proximoTurno.fechaHoraInicio)} hs
                  </div>
                </div>

                <div style={{ minWidth: 220, textAlign: 'right' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                      fontWeight: 700,
                    }}
                  >
                    <MapPin size={14} />
                    {getSalonLabel(proximoTurno.salon)}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 32,
                    lineHeight: 1.02,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {proximoTurno.nombreServicio}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 16,
                    lineHeight: 1.7,
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {proximoTurno.nombreSubservicio}
                  {proximoTurno.nombreVariante ? ` · ${proximoTurno.nombreVariante}` : ''}
                </div>
                {proximoTurno.estado === 'PendienteConfirmacion' ? (
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 14,
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    Estamos revisando tu solicitud. Te avisamos por WhatsApp.
                  </div>
                ) : null}
                {!proximoTurnoReal ? (
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 12,
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    Preview temporal para revisar mejor la composición visual de esta pantalla.
                  </div>
                ) : null}
              </div>

              {otrosTurnos.length > 0 ? (
                <div
                  style={{
                    marginTop: 26,
                    paddingTop: 18,
                    borderTop: '1px solid rgba(74,55,40,0.08)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'var(--color-secondary)',
                      fontWeight: 700,
                      marginBottom: 14,
                    }}
                  >
                    Otros turnos programados
                  </div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {otrosTurnos.map((turno) => (
                      <div
                        key={turno.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 16,
                          padding: '14px 16px',
                          borderRadius: 18,
                          background: 'rgba(249,245,240,0.8)',
                          border: '1px solid rgba(197,160,89,0.12)',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            {formatTurnoDate(turno.fechaHoraInicio)} · {formatTurnoTime(turno.fechaHoraInicio)} hs
                          </div>
                          <div style={{ marginTop: 4, color: 'var(--color-text-secondary)', fontSize: 14 }}>
                            {turno.nombreServicio}
                          </div>
                        </div>
                        <StatusBadge estado={turno.estado} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        <section
          style={{
            marginTop: 28,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.18fr) minmax(0, 1fr) minmax(0, 1fr)',
            gap: 18,
          }}
          className="mi-espacio-grid"
        >
          <QuickLinkCard
            to="/mis-turnos"
            title="Mis Turnos"
            description="Consultá próximos turnos, estados y detalles de cada reserva."
            accent="rgba(197,160,89,0.16)"
            dark
            icon={<CalendarHeart size={24} />}
            preview={
              ultimoRealizado
                ? `Último: ${ultimoRealizado.nombreServicio} · ${formatTurnoDate(ultimoRealizado.fechaHoraInicio)}`
                : 'Sin historial aún'
            }
          />

          <QuickLinkCard
            to="/mis-cupones"
            title="Mis Cupones"
            description={
              cupones.length > 0
                ? `${cupones.length} beneficios disponibles para tu próxima visita.`
                : 'Próximamente descuentos exclusivos y beneficios especiales.'
            }
            accent="rgba(197,160,89,0.12)"
            icon={<Ticket size={24} />}
            preview={
              cupones[0]?.fechaHasta
                ? `Vence próximo: ${formatCouponDate(cupones[0].fechaHasta)}`
                : 'Sin cupones activos'
            }
          />

          <QuickLinkCard
            to="/mi-perfil"
            title="Mi Perfil"
            description={usuario?.email || 'Completá tus datos personales y de contacto.'}
            accent="rgba(232,224,216,0.72)"
            icon={<UserRound size={24} />}
            preview={nombreCompleto || 'Tu cuenta cliente'}
          />
        </section>

        {cuponesDestacados.length > 0 ? (
          <section style={{ marginTop: 36 }}>
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
              Beneficios
            </div>
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(34px, 4vw, 48px)',
                color: 'var(--color-text-primary)',
                lineHeight: 1,
              }}
            >
              Tus beneficios
            </h2>

            <div style={{ marginTop: 22, display: 'grid', gap: 18 }}>
              {cuponesDestacados.map((cupon) => (
                <VoucherCard key={cupon.id} cupon={cupon} />
              ))}
            </div>

            {cupones.length > 3 ? (
              <Link
                to="/mis-cupones"
                style={{
                  marginTop: 16,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'var(--color-secondary)',
                  textDecoration: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Ver todos mis cupones
                <ChevronRight size={15} />
              </Link>
            ) : null}
          </section>
        ) : null}

        {ultimoRealizado ? (
          <section
            style={{
              marginTop: 36,
              borderRadius: 28,
              background: '#fffdfa',
              border: '1px solid rgba(74,55,40,0.08)',
              boxShadow: '0 18px 36px rgba(74,55,40,0.08)',
              padding: '28px 28px 26px',
            }}
          >
            <div
              style={{
                fontSize: 12,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: 'var(--color-secondary)',
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              Último servicio
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 18,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(32px, 4vw, 42px)',
                    lineHeight: 1.04,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {ultimoRealizado.nombreServicio}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 15,
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <Clock3 size={16} />
                  {formatTurnoDate(ultimoRealizado.fechaHoraInicio)}
                </div>
              </div>

              <Link
                to="/mis-turnos"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'var(--color-secondary)',
                  textDecoration: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Ver historial completo
                <ChevronRight size={15} />
              </Link>
            </div>
          </section>
        ) : null}

        <PublicacionesSalon title="Novedades para vos" maxItems={3} withinContainer />
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .mi-espacio-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 720px) {
          .mi-espacio-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  )
}
