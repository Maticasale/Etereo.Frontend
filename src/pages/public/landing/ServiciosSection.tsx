/**
 * ServiciosSection
 *
 * Sección 2 de la LandingPage. Grid de cards de servicios con datos reales
 * del GET /api/v1/servicios (anónimo). Íconos lucide mapeados por nombre.
 */

import { useQuery } from '@tanstack/react-query'
import {
  Zap,
  Leaf,
  HeartHandshake,
  Eye,
  Flower2,
  Scissors,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { serviciosApi } from '@/api/servicios'
import type { ServicioDto } from '@/types/api'

// ─── Mapeo de íconos por nombre de servicio ──────────────────────────────────

const ICONO_MAP: Record<string, LucideIcon> = {
  'Depilación Láser': Zap,
  'Depilación Descartable': Leaf,
  'Masajes': HeartHandshake,
  'Cejas & Pestañas': Eye,
  'Facial': Flower2,
  'Peluquería': Scissors,
}

function getIcono(nombre: string): LucideIcon {
  // Búsqueda exacta
  if (ICONO_MAP[nombre]) return ICONO_MAP[nombre]
  // Búsqueda parcial (ej: "Depilación Láser Premium" → Zap)
  const key = Object.keys(ICONO_MAP).find((k) => nombre.includes(k))
  return key ? ICONO_MAP[key] : Sparkles
}

// ─── Skeleton de carga ────────────────────────────────────────────────────────

function ServicioSkeleton() {
  return (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius-lg)',
      padding: 32,
      boxShadow: 'var(--shadow-md)',
      animation: 'skeletonPulse 1.5s ease-in-out infinite',
    }}>
      {/* Ícono placeholder */}
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E8E0D8', marginBottom: 20 }} />
      {/* Nombre */}
      <div style={{ height: 22, width: '65%', background: '#E8E0D8', borderRadius: 6, marginBottom: 10 }} />
      {/* Precio */}
      <div style={{ height: 17, width: '45%', background: '#E8E0D8', borderRadius: 6, marginBottom: 8 }} />
      {/* Opciones */}
      <div style={{ height: 14, width: '55%', background: '#E8E0D8', borderRadius: 6, marginBottom: 24 }} />
      {/* CTA */}
      <div style={{ height: 14, width: '35%', background: '#E8E0D8', borderRadius: 6 }} />
    </div>
  )
}

// ─── Card de servicio ─────────────────────────────────────────────────────────

function ServicioCard({ servicio }: { servicio: ServicioDto }) {
  const Icono = getIcono(servicio.nombre)

  const subserviciosActivos = servicio.subservicios.filter((s) => s.activo)
  const preciosDisponibles = subserviciosActivos.flatMap((subservicio) => {
    const preciosVariante = subservicio.variantes
      .filter((variante) => variante.activo)
      .map((variante) => variante.precio)

    return subservicio.precio != null
      ? [subservicio.precio, ...preciosVariante]
      : preciosVariante
  })

  const precioDesde =
    preciosDisponibles.length > 0
      ? Math.min(...preciosDisponibles)
      : null

  const precioFormateado =
    precioDesde != null
      ? precioDesde.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
      : null

  return (
    <article
      style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(74,55,40,0.18)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      }}
    >
      {/* Ícono */}
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'rgba(197,160,89,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        flexShrink: 0,
      }}>
        <Icono size={28} color="var(--color-secondary)" strokeWidth={1.5} />
      </div>

      {/* Nombre */}
      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 20,
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        marginBottom: 8,
        lineHeight: 1.3,
      }}>
        {servicio.nombre}
      </h3>

      {/* Precio desde */}
      {precioFormateado && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          fontWeight: 500,
          color: 'var(--color-secondary)',
          marginBottom: 6,
        }}>
          Desde {precioFormateado}
        </p>
      )}

      {/* Cantidad de opciones */}
      {subserviciosActivos.length > 0 && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          fontWeight: 400,
          color: 'var(--color-text-muted)',
          marginBottom: 24,
        }}>
          {subserviciosActivos.length} {subserviciosActivos.length === 1 ? 'opción disponible' : 'opciones disponibles'}
        </p>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* CTA */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--color-secondary)',
        marginTop: 'auto',
        cursor: 'pointer',
      }}>
        Ver opciones →
      </p>
    </article>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ServiciosSection() {
  const { data: servicios, isLoading, isError } = useQuery({
    queryKey: ['servicios', 'landing'],
    queryFn: serviciosApi.getServicios,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })

  const serviciosActivos = servicios?.filter((s) => s.activo) ?? []

  return (
    <section style={{
      background: 'var(--color-tertiary)',
      padding: '80px 0',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>

        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 36,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: 16,
          }}>
            Nuestros servicios
          </h2>
          <div style={{
            width: 60,
            height: 2,
            background: 'var(--color-secondary)',
            margin: '0 auto',
            borderRadius: 2,
          }} />
        </div>

        {/* Error silencioso */}
        {isError && (
          <p style={{
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            marginBottom: 40,
          }}>
            Nuestros servicios están disponibles en el salón. ¡Te esperamos!
          </p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <ServicioSkeleton key={i} />)
            : serviciosActivos.map((servicio) => (
                <ServicioCard key={servicio.id} servicio={servicio} />
              ))}
        </div>

      </div>

      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
      `}</style>
    </section>
  )
}
