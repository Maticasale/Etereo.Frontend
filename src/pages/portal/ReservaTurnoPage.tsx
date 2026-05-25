import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Flower2,
  HandHeart,
  Leaf,
  MapPin,
  MessageCircle,
  Scissors,
  ShieldCheck,
  Sparkles,
  UserRound,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getErrorMessage } from '@/lib/errors'
import { serviciosApi } from '@/api/servicios'
import { codigosDescuentoApi, cuponesApi } from '@/api/cupones'
import { sesionesApi, turnosApi } from '@/api/turnos'
import type {
  CodigoDescuentoDto,
  CuponDto,
  DisponibilidadDto,
  ServicioDto,
  SesionDto,
  SubservicioDto,
  TurnoDto,
  VarianteDto,
} from '@/types/api'

type WizardStep = 0 | 1 | 2 | 3 | 4 | 5 | 6
type SelectedSalonId = SalonOption['id'] | null

interface SalonOption {
  id: 'salon1' | 'salon2'
  nombre: string
  titulo: string
  descripcion: string
  servicios: string[]
}

interface ServiceOption {
  id: number
  salonId: SalonOption['id']
  nombre: string
  descripcion: string
  subservicios: SubservicioDto[]
  iconKey: string
}

interface ComboOption {
  id: number
  nombre: string
  detalle: string
  precio: number
  duracionMin: number
  items: string[]
  subservicioId: number
  varianteId?: number
}

interface ZoneOption {
  id: string
  nombre: string
  precio: number
  duracionMin: number
  grupo: 'Mujeres' | 'Hombres' | 'General'
  subservicioId: number
  varianteId?: number
}

interface TimeSlot {
  hora: string
}

interface DayAvailability {
  id: string
  etiqueta: string
  fechaLarga: string
  fechaIso: string
  slots: TimeSlot[]
}

interface TimeGroupDefinition {
  label: string
  filter: (hora: string) => boolean
}

interface GuestData {
  nombre: string
  apellido: string
  telefono: string
  email: string
  sexo: string
}

const STEP_LABELS = ['Tus datos', 'Servicio', 'Selección', 'Horario', 'Cupón', 'Confirmar', 'Éxito'] as const

const SERVICE_ICONS: Record<string, LucideIcon> = {
  'depilacion-laser': Zap,
  'depilacion-descartable': Leaf,
  masajes: HandHeart,
  'cejas-pestanas': Eye,
  facial: Flower2,
  peluqueria: Scissors,
}

function getServiceIcon(serviceId: string): LucideIcon {
  return SERVICE_ICONS[serviceId] ?? Sparkles
}
const CALENDAR_WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const
const TIME_GROUPS: TimeGroupDefinition[] = [
  { label: 'Mañana', filter: (hora) => hora < '13:00' },
  { label: 'Tarde', filter: (hora) => hora >= '13:00' && hora < '18:00' },
  { label: 'Noche', filter: (hora) => hora >= '18:00' },
]

const DEFAULT_GUEST: GuestData = {
  nombre: 'Sofía',
  apellido: 'Gómez',
  telefono: '3492 55-4411',
  email: '',
  sexo: '',
}

function normalizeTextKey(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function mapSalonId(salon: string): SelectedSalonId {
  if (salon === 'Salon1') return 'salon1'
  if (salon === 'Salon2') return 'salon2'
  return null
}

function mapGrupoFromSexo(sexo: string): ZoneOption['grupo'] {
  if (sexo === 'Femenino') return 'Mujeres'
  if (sexo === 'Masculino') return 'Hombres'
  return 'General'
}

function matchesSexoOption(sexo: string, selectedSex: string) {
  if (!selectedSex) return true
  if (sexo === 'Ambos') return true
  return sexo === selectedSex
}

function getDisplayPrice(item: Pick<SubservicioDto, 'precio'> | Pick<VarianteDto, 'precio'>) {
  return item.precio ?? 0
}

function getDisplayDuration(item: Pick<SubservicioDto, 'duracionMin'> | Pick<VarianteDto, 'duracionMin'>) {
  return item.duracionMin ?? 0
}

function parsePackItems(detail?: string) {
  if (!detail) return []
  return detail
    .split('+')
    .map((item) => item.replace(/\(.*?\)/g, '').trim())
    .filter(Boolean)
}

function buildServiceDescription(subservicios: SubservicioDto[], selectedSex: string) {
  const labels = subservicios
    .filter((subservicio) => subservicio.activo && matchesSexoOption(subservicio.sexo, selectedSex))
    .flatMap((subservicio) => {
      const variants = subservicio.variantes.filter((variant) => variant.activo && matchesSexoOption(variant.sexo, selectedSex))
      return variants.length > 0 ? variants.map((variant) => variant.nombre) : [subservicio.nombre]
    })
    .slice(0, 5)

  return labels.join(' · ')
}

function toLocalDateIso(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatShortDayLabel(date: Date) {
  const weekday = capitalize(
    new Intl.DateTimeFormat('es-AR', {
      weekday: 'short',
    })
      .format(date)
      .replace('.', ''),
  )

  return `${weekday} ${date.getDate()}`
}

function formatLongDayLabel(date: Date) {
  const parts = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).formatToParts(date)

  const weekday = capitalize(parts.find((part) => part.type === 'weekday')?.value ?? '')
  const day = parts.find((part) => part.type === 'day')?.value ?? ''
  const month = parts.find((part) => part.type === 'month')?.value ?? ''

  return `${weekday} ${day} de ${month}`
}

function sortTimes(times: string[]) {
  return [...times].sort((a, b) => a.localeCompare(b))
}

function calculateDiscountValue(
  discount: { tipo: string; valor: number } | null,
  baseAmount: number,
) {
  if (!discount || baseAmount <= 0) return 0
  if (discount.tipo === 'MontoFijo') return Math.min(discount.valor, baseAmount)
  return Math.round((baseAmount * discount.valor) / 100)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}

function botanicalPattern(opacity: number) {
  return {
    background: `
      radial-gradient(circle at 12% 22%, rgba(197,160,89,${opacity}) 0, transparent 18%),
      radial-gradient(circle at 82% 12%, rgba(249,245,240,${opacity * 0.12}) 0, transparent 20%),
      radial-gradient(circle at 80% 76%, rgba(197,160,89,${opacity * 0.75}) 0, transparent 22%),
      linear-gradient(135deg, rgba(255,255,255,0.03) 0, transparent 50%),
      linear-gradient(180deg, rgba(74,55,40,0.98) 0%, rgba(45,31,22,0.99) 100%)
    `,
  }
}

function SuccessBotanicalBackground() {
  return (
    <svg className="success-botanical-bg" viewBox="0 0 1600 960" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="successLeafBackdrop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(233,205,140,0.55)" />
          <stop offset="100%" stopColor="rgba(233,205,140,0.03)" />
        </linearGradient>
      </defs>

      <g stroke="rgba(223,195,134,0.24)" strokeWidth="0.85" fill="none">
        <path d="M 100 -20 Q 65 260 85 520 T 65 1040" />
        <path d="M 1465 -20 Q 1500 220 1480 530 T 1535 1040" />
      </g>

      <g fill="url(#successLeafBackdrop)" stroke="rgba(223,195,134,0.22)" strokeWidth="0.85">
        <ellipse cx="100.0" cy="28" rx="5" ry="24" transform="rotate(-56 100.0 28)" />
        <ellipse cx="127.1" cy="65" rx="5" ry="32" transform="rotate(28 127.1 65)" />
        <ellipse cx="146.3" cy="102" rx="5" ry="40" transform="rotate(-56 146.3 102)" />
        <ellipse cx="151.8" cy="139" rx="5" ry="24" transform="rotate(28 151.8 139)" />
        <ellipse cx="142.0" cy="176" rx="5" ry="32" transform="rotate(-56 142.0 176)" />
        <ellipse cx="119.8" cy="213" rx="5" ry="40" transform="rotate(28 119.8 213)" />
        <ellipse cx="91.8" cy="250" rx="5" ry="24" transform="rotate(-56 91.8 250)" />
        <ellipse cx="66.2" cy="287" rx="5" ry="32" transform="rotate(28 66.2 287)" />
        <ellipse cx="50.5" cy="324" rx="5" ry="40" transform="rotate(-56 50.5 324)" />
        <ellipse cx="48.9" cy="361" rx="5" ry="24" transform="rotate(28 48.9 361)" />
        <ellipse cx="63.3" cy="398" rx="5" ry="32" transform="rotate(-56 63.3 398)" />
        <ellipse cx="90.5" cy="435" rx="5" ry="40" transform="rotate(28 90.5 435)" />
        <ellipse cx="119.7" cy="472" rx="5" ry="24" transform="rotate(-56 119.7 472)" />
        <ellipse cx="141.7" cy="509" rx="5" ry="32" transform="rotate(28 141.7 509)" />
        <ellipse cx="151.7" cy="546" rx="5" ry="40" transform="rotate(-56 151.7 546)" />
        <ellipse cx="142.6" cy="583" rx="5" ry="24" transform="rotate(28 142.6 583)" />
        <ellipse cx="120.7" cy="620" rx="5" ry="32" transform="rotate(-56 120.7 620)" />
        <ellipse cx="92.6" cy="657" rx="5" ry="40" transform="rotate(28 92.6 657)" />
        <ellipse cx="66.9" cy="694" rx="5" ry="24" transform="rotate(-56 66.9 694)" />
        <ellipse cx="50.8" cy="731" rx="5" ry="32" transform="rotate(28 50.8 731)" />
        <ellipse cx="48.0" cy="768" rx="5" ry="40" transform="rotate(-56 48.0 768)" />
        <ellipse cx="62.6" cy="805" rx="5" ry="24" transform="rotate(28 62.6 805)" />
        <ellipse cx="89.7" cy="842" rx="5" ry="32" transform="rotate(-56 89.7 842)" />
        <ellipse cx="118.8" cy="879" rx="5" ry="40" transform="rotate(28 118.8 879)" />
      </g>

      <g fill="url(#successLeafBackdrop)" stroke="rgba(223,195,134,0.22)" strokeWidth="0.85">
        <ellipse cx="1536.0" cy="22" rx="5" ry="24" transform="rotate(82 1536.0 22)" />
        <ellipse cx="1527.4" cy="61" rx="5" ry="32" transform="rotate(-26 1527.4 61)" />
        <ellipse cx="1505.0" cy="100" rx="5" ry="40" transform="rotate(82 1505.0 100)" />
        <ellipse cx="1477.2" cy="139" rx="5" ry="24" transform="rotate(-26 1477.2 139)" />
        <ellipse cx="1454.1" cy="178" rx="5" ry="32" transform="rotate(82 1454.1 178)" />
        <ellipse cx="1444.0" cy="217" rx="5" ry="40" transform="rotate(-26 1444.0 217)" />
        <ellipse cx="1451.2" cy="256" rx="5" ry="24" transform="rotate(82 1451.2 256)" />
        <ellipse cx="1473.2" cy="295" rx="5" ry="32" transform="rotate(-26 1473.2 295)" />
        <ellipse cx="1501.0" cy="334" rx="5" ry="40" transform="rotate(82 1501.0 334)" />
        <ellipse cx="1524.7" cy="373" rx="5" ry="24" transform="rotate(-26 1524.7 373)" />
        <ellipse cx="1535.8" cy="412" rx="5" ry="32" transform="rotate(82 1535.8 412)" />
        <ellipse cx="1530.0" cy="451" rx="5" ry="40" transform="rotate(-26 1530.0 451)" />
        <ellipse cx="1508.6" cy="490" rx="5" ry="24" transform="rotate(82 1508.6 490)" />
        <ellipse cx="1480.8" cy="529" rx="5" ry="32" transform="rotate(-26 1480.8 529)" />
        <ellipse cx="1456.5" cy="568" rx="5" ry="40" transform="rotate(82 1456.5 568)" />
        <ellipse cx="1444.5" cy="607" rx="5" ry="24" transform="rotate(-26 1444.5 607)" />
        <ellipse cx="1448.9" cy="646" rx="5" ry="32" transform="rotate(82 1448.9 646)" />
        <ellipse cx="1469.5" cy="685" rx="5" ry="40" transform="rotate(-26 1469.5 685)" />
        <ellipse cx="1497.3" cy="724" rx="5" ry="24" transform="rotate(82 1497.3 724)" />
        <ellipse cx="1522.3" cy="763" rx="5" ry="32" transform="rotate(-26 1522.3 763)" />
        <ellipse cx="1535.0" cy="802" rx="5" ry="40" transform="rotate(82 1535.0 802)" />
        <ellipse cx="1532.0" cy="841" rx="5" ry="24" transform="rotate(-26 1532.0 841)" />
      </g>
    </svg>
  )
}

function StepFrame({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker: string
  title: string
  subtitle: string
  children: ReactNode
}) {
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const [hasOverflow, setHasOverflow] = useState(false)
  const [showTopFade, setShowTopFade] = useState(false)
  const [showBottomFade, setShowBottomFade] = useState(false)

  useEffect(() => {
    const node = bodyRef.current
    if (!node) return

    node.scrollTo({ top: 0, behavior: 'auto' })

    const updateState = () => {
      const overflow = node.scrollHeight - node.clientHeight > 12
      const currentScroll = node.scrollTop
      const maxScroll = node.scrollHeight - node.clientHeight

      setHasOverflow(overflow)
      setShowTopFade(overflow && currentScroll > 8)
      setShowBottomFade(overflow && currentScroll < maxScroll - 8)
    }

    updateState()

    node.addEventListener('scroll', updateState, { passive: true })
    window.addEventListener('resize', updateState)

    const resizeObserver = new ResizeObserver(() => updateState())
    resizeObserver.observe(node)

    return () => {
      node.removeEventListener('scroll', updateState)
      window.removeEventListener('resize', updateState)
      resizeObserver.disconnect()
    }
  }, [children])

  return (
    <section className="wizard-panel wizard-animate">
      <div className="wizard-panel-header">
        <span className="wizard-kicker">{kicker}</span>
        <h1 className="wizard-title">{title}</h1>
        <p className="wizard-subtitle">{subtitle}</p>
      </div>

      <div
        className={`wizard-panel-body-shell ${hasOverflow ? 'has-overflow' : ''} ${showTopFade ? 'show-top-fade' : ''} ${showBottomFade ? 'show-bottom-fade' : ''}`}
      >
        <div ref={bodyRef} className="wizard-panel-body">
          {children}
        </div>

        {showBottomFade ? (
          <button
            type="button"
            className="wizard-scroll-hint"
            onClick={() => bodyRef.current?.scrollBy({ top: 240, behavior: 'smooth' })}
          >
            <span>Deslizá para ver más</span>
            <ChevronDown size={15} />
          </button>
        ) : null}
      </div>
    </section>
  )
}

export default function ReservaTurnoPage() {
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)
  const showCouponLibrary = !!usuario
  const serviceSectionRef = useRef<HTMLDivElement | null>(null)
  const today = new Date()
  const [step, setStep] = useState<WizardStep>(0)
  const [selectedSalon, setSelectedSalon] = useState<SelectedSalonId>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)
  const [selectedComboId, setSelectedComboId] = useState<number | null>(null)
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([])
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [selectionMode, setSelectionMode] = useState<'combos' | 'zonas'>('zonas')
  const [guestData, setGuestData] = useState<GuestData>(DEFAULT_GUEST)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [headerHidden, setHeaderHidden] = useState(false)
  const [servicios, setServicios] = useState<ServicioDto[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(today))
  const [availabilityDays, setAvailabilityDays] = useState<DayAvailability[]>([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [availableCoupons, setAvailableCoupons] = useState<CuponDto[]>([])
  const [couponsLoading, setCouponsLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<CodigoDescuentoDto | null>(null)
  const [validatingCode, setValidatingCode] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createdTurno, setCreatedTurno] = useState<TurnoDto | null>(null)
  const [createdSesion, setCreatedSesion] = useState<SesionDto | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        setCatalogLoading(true)
        setCatalogError(null)
        const response = await serviciosApi.getServicios()
        if (cancelled) return
        setServicios(response.filter((servicio) => servicio.activo))
      } catch {
        if (cancelled) return
        setCatalogError('No pudimos cargar el catálogo de servicios. Probá de nuevo en unos instantes.')
      } finally {
        if (!cancelled) {
          setCatalogLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (usuario) {
      setGuestData({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        telefono: usuario.telefono ?? '3492 55-7788',
        email: usuario.email,
        sexo: usuario.sexo === 'NoEspecifica' ? '' : usuario.sexo,
      })
    }
  }, [usuario])

  const selectedSex = guestData.sexo

  const allServices = servicios
    .map((servicio) => {
      const salonId = mapSalonId(servicio.salon)
      if (!salonId) return null

      const visibleSubservicios = servicio.subservicios.filter((subservicio) => {
        if (!subservicio.activo) return false
        if (!matchesSexoOption(subservicio.sexo, selectedSex)) return false

        if (subservicio.variantes.length === 0) return true

        return subservicio.variantes.some((variant) => variant.activo && matchesSexoOption(variant.sexo, selectedSex))
      })

      if (visibleSubservicios.length === 0) return null

      return {
        id: servicio.id,
        salonId,
        nombre: servicio.nombre,
        descripcion: buildServiceDescription(servicio.subservicios, selectedSex),
        subservicios: visibleSubservicios,
        iconKey: normalizeTextKey(servicio.nombre),
      } satisfies ServiceOption
    })
    .filter((servicio): servicio is ServiceOption => servicio !== null)

  const filteredSalones = (['salon1', 'salon2'] as const)
    .map((salonId) => {
      const serviciosEnSalon = allServices.filter((service) => service.salonId === salonId)
      if (serviciosEnSalon.length === 0) return null

      return {
        id: salonId,
        nombre: salonId === 'salon1' ? 'Salón 1' : 'Salón 2',
        titulo: salonId === 'salon1' ? 'Estética & bienestar' : 'Peluquería',
        descripcion: serviciosEnSalon.map((service) => service.nombre).join(' · '),
        servicios: serviciosEnSalon.map((service) => service.nombre),
      } satisfies SalonOption
    })
    .filter((salon): salon is SalonOption => salon !== null)

  const availableServices = selectedSalon ? allServices.filter((service) => service.salonId === selectedSalon) : []
  const selectedService = allServices.find((service) => service.id === selectedServiceId) ?? null

  const selectionOptions = selectedService
    ? selectedService.subservicios.reduce(
        (acc, subservicio) => {
          const activeVariants = subservicio.variantes.filter((variant) => variant.activo && matchesSexoOption(variant.sexo, selectedSex))

          if (activeVariants.length > 0) {
            activeVariants.forEach((variant) => {
              const optionName = `${subservicio.nombre} · ${variant.nombre}`
              const baseOption = {
                nombre: optionName,
                precio: getDisplayPrice(variant),
                duracionMin: getDisplayDuration(variant),
                grupo: mapGrupoFromSexo(variant.sexo),
                subservicioId: subservicio.id,
                varianteId: variant.id,
              }

              if (subservicio.esPack) {
                acc.combos.push({
                  id: variant.id,
                  nombre: optionName,
                  detalle: subservicio.detallePack ?? subservicio.descripcion ?? 'Pack especial',
                  precio: baseOption.precio,
                  duracionMin: baseOption.duracionMin,
                  items: parsePackItems(subservicio.detallePack ?? subservicio.descripcion),
                  subservicioId: subservicio.id,
                  varianteId: variant.id,
                })
              } else {
                acc.zones.push({
                  id: `${subservicio.id}:${variant.id}`,
                  ...baseOption,
                })
              }
            })
          } else {
            const baseOption = {
              nombre: subservicio.nombre,
              precio: getDisplayPrice(subservicio),
              duracionMin: getDisplayDuration(subservicio),
              grupo: mapGrupoFromSexo(subservicio.sexo),
              subservicioId: subservicio.id,
            }

            if (subservicio.esPack) {
              acc.combos.push({
                id: subservicio.id,
                nombre: subservicio.nombre,
                detalle: subservicio.detallePack ?? subservicio.descripcion ?? 'Pack especial',
                precio: baseOption.precio,
                duracionMin: baseOption.duracionMin,
                items: parsePackItems(subservicio.detallePack ?? subservicio.descripcion),
                subservicioId: subservicio.id,
              })
            } else {
              acc.zones.push({
                id: `${subservicio.id}:0`,
                ...baseOption,
              })
            }
          }

          return acc
        },
        { combos: [] as ComboOption[], zones: [] as ZoneOption[] },
      )
    : { combos: [] as ComboOption[], zones: [] as ZoneOption[] }

  useEffect(() => {
    if (selectedSex === 'Masculino' && selectedSalon === 'salon2') {
      setSelectedSalon(null)
      setSelectedServiceId(null)
      setSelectedComboId(null)
      setSelectedZoneIds([])
    }
  }, [selectedSex, selectedSalon])

  useEffect(() => {
    let lastY = window.scrollY

    const handleScroll = () => {
      const currentY = window.scrollY

      if (currentY <= 12) {
        setHeaderHidden(false)
      } else if (currentY > lastY + 6 && currentY > 140) {
        setHeaderHidden(true)
      } else if (currentY < lastY - 12) {
        setHeaderHidden(false)
      }

      lastY = currentY
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('etereo:public-header-visible', {
        detail: { visible: step < 6 },
      }),
    )

    return () => {
      window.dispatchEvent(
        new CustomEvent('etereo:public-header-visible', {
          detail: { visible: true },
        }),
      )
    }
  }, [step])

  useEffect(() => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'auto' })
    })
  }, [step])

  useEffect(() => {
    setSelectedCouponId(null)
    setAppliedDiscountCode(null)
    setCouponCode('')
    setCouponError(null)
  }, [selectedServiceId, selectedComboId, selectedZoneIds])

  useEffect(() => {
    if (step !== 4 || !usuario) return

    let cancelled = false

    ;(async () => {
      try {
        setCouponsLoading(true)
        setCouponError(null)
        const data = await cuponesApi.getDisponibles()
        if (cancelled) return
        setAvailableCoupons(data)
      } catch (error) {
        if (cancelled) return
        setAvailableCoupons([])
        setCouponError(getErrorMessage(error))
      } finally {
        if (!cancelled) {
          setCouponsLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [step, usuario])

  useEffect(() => {
    if (selectedSalon && !filteredSalones.some((salon) => salon.id === selectedSalon)) {
      setSelectedSalon(null)
      setSelectedServiceId(null)
      setSelectedComboId(null)
      setSelectedZoneIds([])
    }
  }, [filteredSalones, selectedSalon])

  useEffect(() => {
    if (selectedServiceId && !allServices.some((service) => service.id === selectedServiceId)) {
      setSelectedServiceId(null)
      setSelectedComboId(null)
      setSelectedZoneIds([])
    }
  }, [allServices, selectedServiceId])

  const selectionComboIdsKey = selectionOptions.combos.map((combo) => combo.id).join('|')
  const selectionZoneIdsKey = selectionOptions.zones.map((zone) => zone.id).join('|')

  useEffect(() => {
    if (selectedComboId && !selectionOptions.combos.some((combo) => combo.id === selectedComboId)) {
      setSelectedComboId(null)
    }

    setSelectedZoneIds((current) => {
      const next = current.filter((zoneId) => selectionOptions.zones.some((zone) => zone.id === zoneId))
      return next.length === current.length ? current : next
    })
  }, [selectedComboId, selectionComboIdsKey, selectionZoneIdsKey])

  const selectedCombo = selectionOptions.combos.find((combo) => combo.id === selectedComboId) ?? null
  const selectedZones = selectionOptions.zones.filter((zone) => selectedZoneIds.includes(zone.id))
  const selectedDay = availabilityDays.find((day) => day.id === selectedDayId) ?? null
  const confirmedDay = selectedDay ?? availabilityDays[0] ?? null
  const selectedCoupon = availableCoupons.find((coupon) => coupon.id === selectedCouponId) ?? null
  const selectedSalonEnum = selectedSalon === 'salon1' ? 'Salon1' : selectedSalon === 'salon2' ? 'Salon2' : null
  const singleSelection = selectedCombo ?? (selectedZones.length === 1 ? selectedZones[0] : null)
  const isSessionSelection = !selectedCombo && selectedZones.length > 1

  const subtotal = selectedCombo
    ? selectedCombo.precio
    : selectedZones.reduce((acc, zone) => acc + zone.precio, 0)

  const estimatedDuration = selectedCombo
    ? selectedCombo.duracionMin
    : selectedZones.reduce((acc, zone) => acc + zone.duracionMin, 0)

  const automaticDiscountPct =
    !selectedCombo && selectedZones.length >= 3
      ? selectedService?.nombre === 'Depilación Descartable'
        ? 10
        : selectedService?.nombre === 'Depilación Láser'
          ? 15
          : 0
      : 0
  const automaticDiscountValue = Math.round((subtotal * automaticDiscountPct) / 100)
  const baseAfterAutomaticDiscount = Math.max(subtotal - automaticDiscountValue, 0)
  const couponDiscountValue = calculateDiscountValue(
    selectedCoupon
      ? { tipo: selectedCoupon.tipoDescuento, valor: selectedCoupon.valor }
      : appliedDiscountCode
        ? { tipo: appliedDiscountCode.tipoDescuento, valor: appliedDiscountCode.valor }
        : null,
    baseAfterAutomaticDiscount,
  )
  const total = Math.max(subtotal - automaticDiscountValue - couponDiscountValue, 0)
  const summaryItems = selectedCombo
    ? selectedCombo.items
    : selectedZones.map((zone) => zone.nombre)
  const createdTotal =
    createdTurno?.precioFinal ??
    createdTurno?.precioBase ??
    (createdSesion
      ? createdSesion.turnos.reduce((acc, turno) => acc + (turno.precioFinal ?? turno.precioBase), 0)
      : total)
  const successWeekday = confirmedDay?.fechaLarga.split(' ')[0] ?? 'Próximamente'
  const successDateRest = confirmedDay?.fechaLarga.split(' ').slice(1).join(' ') ?? ''
  const successChannels = guestData.email.trim().length > 0 ? 'WhatsApp y email' : 'WhatsApp'
  const successTimelineTime = confirmedDay && selectedTime ? `${confirmedDay.etiqueta.toUpperCase()} · ${selectedTime} HS` : 'Horario a confirmar'

  useEffect(() => {
    if (step < 3 || !selectedService || !selectedSalonEnum || (!singleSelection && !isSessionSelection)) {
      return
    }

    let cancelled = false

    const loadAvailability = async () => {
      try {
        setAvailabilityLoading(true)
        setAvailabilityError(null)

        const monthStart = startOfMonth(calendarMonth)
        const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate()
        const requests = Array.from({ length: daysInMonth }, (_, index) => {
          const dayDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), index + 1)
          const fecha = toLocalDateIso(dayDate)

          return (async () => {
            let response: DisponibilidadDto

            if (isSessionSelection) {
              response = await sesionesApi.getDisponibilidad({
                salon: selectedSalonEnum,
                fecha,
                zonas: selectedZones.map((zone) => ({
                  subservicioId: zone.subservicioId,
                  varianteId: zone.varianteId,
                })),
              })
            } else if (singleSelection) {
              response = await turnosApi.getDisponibilidad({
                fecha,
                subservicioId: singleSelection.subservicioId,
                varianteId: singleSelection.varianteId,
                duracionMin: singleSelection.duracionMin,
              })
            } else {
              response = { disponible: false, slotsOcupados: [], horariosDisponibles: [] }
            }

            return {
              id: fecha,
              fechaIso: fecha,
              etiqueta: formatShortDayLabel(dayDate),
              fechaLarga: formatLongDayLabel(dayDate),
              slots: sortTimes(response.horariosDisponibles).map((hora) => ({ hora })),
            } satisfies DayAvailability
          })()
        })

        const monthDays = await Promise.all(requests)
        if (cancelled) return

        setAvailabilityDays(monthDays)
        setSelectedDayId((current) => (current && monthDays.some((day) => day.id === current) ? current : null))
        setSelectedTime(null)
      } catch (error) {
        if (cancelled) return
        setAvailabilityDays([])
        setSelectedDayId(null)
        setSelectedTime(null)
        setAvailabilityError(getErrorMessage(error))
      } finally {
        if (!cancelled) {
          setAvailabilityLoading(false)
        }
      }
    }

    void loadAvailability()

    return () => {
      cancelled = true
    }
  }, [calendarMonth, step, selectedSalonEnum, selectedService, singleSelection, isSessionSelection, selectedZones])

  const progressValue = (Math.min(step, 5) / 5) * 100
  const canProceed =
    step === 0
      ? guestData.nombre.trim().length > 0 &&
        guestData.telefono.trim().length > 0 &&
        (guestData.sexo === 'Femenino' || guestData.sexo === 'Masculino')
      : step === 1
        ? !!selectedSalon && !!selectedServiceId
      : step === 2
        ? !!selectedComboId || selectedZoneIds.length > 0
        : step === 3
          ? !!selectedDayId && !!selectedTime
            : true

  function resetSelectionsFromStep(targetStep: WizardStep) {
    if (targetStep === 1) {
      setSelectedSalon(null)
      setSelectedServiceId(null)
      setSelectedComboId(null)
      setSelectedZoneIds([])
      setSelectedDayId(null)
      setSelectedTime(null)
      return
    }

    if (targetStep === 2) {
      setSelectedComboId(null)
      setSelectedZoneIds([])
      setSelectedDayId(null)
      setSelectedTime(null)
      return
    }

    if (targetStep === 3) {
      setSelectedDayId(null)
      setSelectedTime(null)
      return
    }

    if (targetStep === 4) {
      setSelectedCouponId(null)
      setCouponCode('')
    }
  }

  function goNext() {
    if (!canProceed) return
    if (step === 5) {
      if (!selectedService || !confirmedDay || !selectedTime || !selectedSalonEnum) return

      setSubmitError(null)
      setIsSubmitting(true)

      const fechaHoraInicio = `${confirmedDay.fechaIso}T${selectedTime}:00`
      const bookingBase = usuario
        ? { clienteId: usuario.id }
        : {
            nombreAnonimo: `${guestData.nombre} ${guestData.apellido}`.trim(),
            telefonoAnonimo: guestData.telefono.trim(),
          }

      const discountBase = selectedCouponId
        ? { cuponId: selectedCouponId }
        : appliedDiscountCode
          ? { codigoDescuento: appliedDiscountCode.codigo }
          : {}

      const runSubmit = async () => {
        try {
          if (isSessionSelection) {
            const sesion = await sesionesApi.crearSesion({
              ...bookingBase,
              ...discountBase,
              salon: selectedSalonEnum,
              fechaHoraInicio,
              zonas: selectedZones.map((zone) => ({
                subservicioId: zone.subservicioId,
                varianteId: zone.varianteId,
              })),
            })
            setCreatedSesion(sesion)
            setCreatedTurno(null)
          } else if (singleSelection) {
            const turno = await turnosApi.crearTurno({
              ...bookingBase,
              ...discountBase,
              subservicioId: singleSelection.subservicioId,
              varianteId: singleSelection.varianteId,
              fechaHoraInicio,
            })
            setCreatedTurno(turno)
            setCreatedSesion(null)
          }

          setStep(6)
        } catch (error) {
          setSubmitError(getErrorMessage(error))
        } finally {
          setIsSubmitting(false)
        }
      }

      void runSubmit()
      return
    }

    setStep((current) => Math.min(current + 1, 6) as WizardStep)
  }

  function goBack() {
    if (step === 0) {
      navigate('/', { replace: false })
      return
    }

    if (step === 6) {
      setStep(5)
      return
    }

    resetSelectionsFromStep(step)
    setStep((current) => Math.max(current - 1, 0) as WizardStep)
  }

  function handleServiceSelect(serviceId: number) {
    setSelectedServiceId(serviceId)
    setSelectedComboId(null)
    setSelectedZoneIds([])
    setSelectedDayId(null)
    setSelectedTime(null)
  }

  function handleSalonSelect(salonId: SalonOption['id']) {
    setSelectedSalon(salonId)
    setSelectedServiceId(null)
    setSelectedComboId(null)
    setSelectedZoneIds([])
    setSelectedDayId(null)
    setSelectedTime(null)

    window.setTimeout(() => {
      serviceSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
  }

  function toggleZone(zoneId: string) {
    if (selectedComboId) return
    setSelectedZoneIds((current) =>
      current.includes(zoneId) ? current.filter((id) => id !== zoneId) : [...current, zoneId],
    )
  }

  function selectCombo(comboId: number) {
    setSelectedComboId((current) => {
      const nextValue = current === comboId ? null : comboId
      if (nextValue) {
        setSelectedZoneIds([])
      }
      return nextValue
    })
  }

  async function handleCouponApply(code: string) {
    const normalized = code.trim().toUpperCase()
    if (!normalized) {
      setCouponError('Ingresá un código para validar la promoción.')
      return
    }

    try {
      setValidatingCode(true)
      setCouponError(null)
      const codigo = await codigosDescuentoApi.validar(normalized, {
        servicioId: selectedService?.id,
        subservicioId: singleSelection?.subservicioId,
        varianteId: singleSelection?.varianteId,
      })

      setAppliedDiscountCode(codigo)
      setSelectedCouponId(null)
      setCouponCode(codigo.codigo)
    } catch (error) {
      setAppliedDiscountCode(null)
      setCouponError(getErrorMessage(error))
    } finally {
      setValidatingCode(false)
    }
  }

  function updateGuestField(field: keyof GuestData, value: string) {
    setGuestData((current) => ({ ...current, [field]: value }))
  }

  function restartReservation() {
    setStep(0)
    setSelectedSalon(null)
    setSelectedServiceId(null)
    setSelectedComboId(null)
    setSelectedZoneIds([])
    setSelectedDayId(null)
    setSelectedTime(null)
    setSelectedCouponId(null)
    setAppliedDiscountCode(null)
    setCouponCode('')
    setAvailabilityDays([])
    setAvailableCoupons([])
    setAvailabilityError(null)
    setCouponError(null)
    setSubmitError(null)
    setCreatedTurno(null)
    setCreatedSesion(null)
    setSummaryOpen(false)
    setSelectionMode('zonas')
    setIsSubmitting(false)
    setHeaderHidden(false)
    setGuestData(
      usuario
        ? {
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            telefono: usuario.telefono ?? '3492 55-7788',
            email: usuario.email,
            sexo: usuario.sexo === 'NoEspecifica' ? '' : usuario.sexo,
          }
        : DEFAULT_GUEST,
    )
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function renderStepContent() {
    if (step === 0) {
      return (
        <StepFrame
          kicker="Paso 1"
          title="Contanos sobre vos"
          subtitle="Necesitamos tus datos y tu sexo para mostrarte solo los servicios que realmente se pueden reservar."
        >
          <div className="first-step-flat">
            <div className="guest-form-grid">
              <Input label="Nombre" value={guestData.nombre} onChange={(event) => updateGuestField('nombre', event.target.value)} />
              <Input label="Apellido" value={guestData.apellido} onChange={(event) => updateGuestField('apellido', event.target.value)} />
              <Input label="Teléfono" value={guestData.telefono} onChange={(event) => updateGuestField('telefono', event.target.value)} />
              <Input
                label="Email (opcional)"
                value={guestData.email}
                onChange={(event) => updateGuestField('email', event.target.value)}
                placeholder="tuemail@ejemplo.com"
              />
            </div>

            <div className="sex-row">
              <span className="sex-label">Sexo obligatorio</span>
              <div className="sex-options">
                {['Femenino', 'Masculino'].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={guestData.sexo === value ? 'active' : ''}
                    onClick={() => updateGuestField('sexo', value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="first-step-note">
              <ShieldCheck size={18} />
              <p>Usamos este dato para filtrar correctamente salones, servicios y zonas disponibles.</p>
            </div>
          </div>
        </StepFrame>
      )
    }

    if (step === 1) {
      return (
        <StepFrame
          kicker="Paso 2"
          title="¿Qué servicio buscás?"
          subtitle="Empezá por elegir el salón y después el tipo de experiencia que querés reservar."
        >
          {catalogError ? <div className="wizard-inline-error">{catalogError}</div> : null}

          <div className="salon-grid">
            {filteredSalones.map((salon) => (
              <button
                key={salon.id}
                type="button"
                onClick={() => handleSalonSelect(salon.id)}
                className={`salon-card ${selectedSalon === salon.id ? 'selected' : ''}`}
                style={botanicalPattern(0.12)}
              >
                <div className="salon-card-header">
                  <div className="salon-card-copy">
                    <span className="salon-card-eyebrow">{salon.nombre}</span>
                    <h3>{salon.titulo}</h3>
                    <p>{salon.descripcion}</p>
                  </div>
                  {selectedSalon === salon.id ? (
                    <span className="salon-check-badge">
                      <Check size={18} />
                    </span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>

          {catalogLoading ? <div className="wizard-inline-loading">Cargando catálogo de servicios...</div> : null}

          {selectedSalon && !catalogLoading ? (
            <div ref={serviceSectionRef} className="service-section">
              <div className="section-heading">
                <div>
                  <span className="section-label">Servicios disponibles</span>
                  <h2>{selectedSalon === 'salon1' ? 'Escogé un servicio' : 'Elegí tu cambio de look'}</h2>
                </div>
              </div>

              <div className="service-grid">
                {availableServices.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleServiceSelect(service.id)}
                    className={`service-card ${selectedServiceId === service.id ? 'selected' : ''}`}
                  >
                    {(() => {
                      const ServiceIcon = getServiceIcon(service.iconKey)
                      return (
                        <span className="service-icon-wrap">
                          <span className="service-icon">
                            <ServiceIcon size={28} strokeWidth={1.8} />
                          </span>
                        </span>
                      )
                    })()}
                    {selectedServiceId === service.id ? (
                      <span className="service-selected-badge">
                        <Check size={16} />
                      </span>
                    ) : null}
                    <h3>{service.nombre}</h3>
                    <p>{service.descripcion}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </StepFrame>
      )
    }

    if (step === 2) {
      const visibleCombos = selectionOptions.combos
      const visibleZones = selectionOptions.zones

      return (
        <StepFrame
          kicker="Paso 3"
          title={selectedService ? `Seleccioná en ${selectedService.nombre}` : 'Seleccioná tus zonas'}
          subtitle="Elegí un combo o armá la sesión con las opciones que quieras."
        >
          {visibleCombos.length > 0 ? (
            <div className="mobile-switcher">
              <button
                type="button"
                className={selectionMode === 'combos' ? 'active' : ''}
                onClick={() => setSelectionMode('combos')}
              >
                Combos
              </button>
              <button
                type="button"
                className={selectionMode === 'zonas' ? 'active' : ''}
                onClick={() => setSelectionMode('zonas')}
              >
                Zonas
              </button>
            </div>
          ) : null}

          <div className={`selection-layout ${visibleCombos.length === 0 ? 'one-column' : ''}`}>
            {visibleCombos.length > 0 ? (
              <div className={`selection-column ${selectionMode === 'zonas' ? 'mobile-hidden' : ''}`}>
                <div className="column-header">
                  <div>
                    <span className="section-label">Combos con descuento</span>
                    <h2>Combos destacados</h2>
                  </div>
                  <span className="offer-badge">OFERTA</span>
                </div>

                <div className="combo-stack">
                  {visibleCombos.map((combo) => (
                    <button
                      key={combo.id}
                      type="button"
                      onClick={() => selectCombo(combo.id)}
                      className={`combo-card ${selectedComboId === combo.id ? 'selected' : ''}`}
                  >
                    {selectedComboId === combo.id ? (
                      <span className="combo-selected-badge">
                        <Check size={16} />
                      </span>
                    ) : null}
                    <div className="combo-copy">
                      <div className="combo-title-row">
                        <div className="combo-title-left">
                          <span className="combo-emoji">🌟</span>
                          <div>
                            <h3>{combo.nombre}</h3>
                            <span className="combo-kicker">Selección curada</span>
                          </div>
                        </div>
                      </div>
                      <div className="combo-meta-row">
                        <span className="combo-price">{formatCurrency(combo.precio)}</span>
                        <small className="combo-duration">~{combo.duracionMin} min</small>
                      </div>
                      <p>{combo.detalle}</p>
                    </div>
                  </button>
                ))}
              </div>
              </div>
            ) : null}

            <div className={`selection-column ${selectionMode === 'combos' ? 'mobile-hidden' : ''}`}>
              <div className="column-header">
                <div>
                  <span className="section-label">Opciones individuales</span>
                  <h2>Armá tu selección</h2>
                </div>
              </div>

              <div className={`discount-banner ${automaticDiscountPct > 0 ? 'active' : ''}`}>
                {automaticDiscountPct > 0 ? '✨ ¡Descuento del 15% aplicado!' : 'Seleccioná 3 o más zonas y obtenés 15% automático'}
              </div>

              <div className="zone-stack-wrapper">
                {selectedComboId ? (
                  <div className="zone-overlay">
                    <ShieldCheck size={22} />
                    <p>Ya elegiste un combo. Si querés elegir zonas individuales, primero deseleccionalo.</p>
                    <button type="button" onClick={() => setSelectedComboId(null)} className="zone-overlay-btn">
                      Deseleccionar combo
                    </button>
                  </div>
                ) : null}

                <div className={`zone-stack ${selectedComboId ? 'locked' : ''}`}>
                  {visibleZones.map((zone) => {
                    const selected = selectedZoneIds.includes(zone.id)
                    return (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => toggleZone(zone.id)}
                        className={`zone-card ${selected ? 'selected' : ''}`}
                        disabled={!!selectedComboId}
                      >
                        <div className="zone-left">
                          <span className={`zone-check ${selected ? 'selected' : ''}`}>
                            {selected ? <Check size={14} /> : null}
                          </span>
                          <div>
                            <h3>{zone.nombre}</h3>
                            <p>⏱ ~{zone.duracionMin} min</p>
                          </div>
                        </div>
                        <strong>{formatCurrency(zone.precio)}</strong>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </StepFrame>
      )
    }

    if (step === 3) {
      const availableDays = availabilityDays.filter((day) => day.slots.length > 0)
      const availableDayMap = new Map(availableDays.map((day) => [day.etiqueta.split(' ')[1], day]))
      const firstDayJs = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay()
      const leadingBlanks = firstDayJs === 0 ? 6 : firstDayJs - 1
      const calendarDaysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()
      const monthLabel = capitalize(formatMonthLabel(calendarMonth))
      const monthNameGen = new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(calendarMonth)
      const calendarCells = [
        ...Array.from({ length: leadingBlanks }, (_, index) => ({
          key: `blank-${index}`,
          type: 'blank' as const,
        })),
        ...Array.from({ length: calendarDaysInMonth }, (_, index) => {
          const dayNumber = String(index + 1)
          const linkedDay = availableDayMap.get(dayNumber) ?? null
          const currentCellDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), index + 1)
          const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
          const isPast = currentCellDate < todayAtMidnight

          return {
            key: `day-${dayNumber}`,
            type: 'day' as const,
            dayNumber,
            linkedDay,
            isPast,
          }
        }),
      ]
      const groupedSlots = selectedDay
        ? TIME_GROUPS.map((group) => ({
            label: group.label,
            slots: selectedDay.slots.filter((slot) => group.filter(slot.hora)),
          })).filter((group) => group.slots.length > 0)
        : []

      return (
        <StepFrame
          kicker="Paso 4"
          title="Elegí fecha y horario"
          subtitle="Simulamos disponibilidad en bloques de 30 minutos para que el solapamiento sea más eficiente."
        >
          <div className="schedule-picker">
            <div className="schedule-picker-left">
              <div className="schedule-nav">
                <button
                  type="button"
                  className="schedule-nav-btn"
                  aria-label="Mes anterior"
                  onClick={() => {
                    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
                    setSelectedDayId(null)
                    setSelectedTime(null)
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <strong>{monthLabel}</strong>
                <button
                  type="button"
                  className="schedule-nav-btn"
                  aria-label="Mes siguiente"
                  onClick={() => {
                    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
                    setSelectedDayId(null)
                    setSelectedTime(null)
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="schedule-weekdays">
                {CALENDAR_WEEKDAYS.map((weekday) => (
                  <span key={weekday}>{weekday}</span>
                ))}
              </div>

              <div className="schedule-calendar-grid">
                {calendarCells.map((cell) => {
                  if (cell.type === 'blank') {
                    return <div key={cell.key} className="schedule-calendar-day blank" />
                  }

                  const isSelected = cell.linkedDay ? selectedDayId === cell.linkedDay.id : false
                  const isAvailable = !!cell.linkedDay

                  return (
                    <button
                      key={cell.key}
                      type="button"
                      disabled={!isAvailable}
                      className={`schedule-calendar-day ${isSelected ? 'selected' : ''} ${isAvailable ? 'available' : ''} ${cell.isPast ? 'past' : 'disabled'}`}
                      onClick={() => {
                        if (!cell.linkedDay) return
                        setSelectedDayId(cell.linkedDay.id)
                        setSelectedTime(null)
                      }}
                    >
                      <span className="schedule-calendar-day-num">{cell.dayNumber}</span>
                      {isAvailable ? <span className="schedule-calendar-dot" /> : null}
                    </button>
                  )
                })}
              </div>

              <div className="schedule-legend">
                <span className="schedule-calendar-dot" />
                <small>Días con horarios disponibles</small>
              </div>

              {availabilityLoading ? <p className="wizard-inline-loading">Consultando disponibilidad real del mes...</p> : null}
              {availabilityError ? <p className="wizard-inline-error">{availabilityError}</p> : null}
            </div>

            <div className="schedule-picker-right">
              {availabilityLoading ? (
                <div className="schedule-placeholder">
                  <Clock3 size={42} strokeWidth={1.3} />
                  <p>Consultando horarios disponibles...</p>
                </div>
              ) : !selectedDay ? (
                <div className="schedule-placeholder">
                  <Clock3 size={42} strokeWidth={1.3} />
                  <p>
                    Seleccioná un día
                    <br />
                    para ver los horarios disponibles
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="schedule-day-title">
                    {selectedDay.fechaLarga.split(' ')[0]} {selectedDay.etiqueta.split(' ')[1]} de {monthNameGen}
                  </h2>

                  {groupedSlots.length > 0 ? (
                    groupedSlots.map((group) => (
                      <div key={group.label} className="schedule-time-group">
                        <div className="schedule-time-group-label">{group.label}</div>
                        <div className="schedule-time-chips">
                          {group.slots.map((slot) => (
                            <button
                              key={`${selectedDay.id}-${slot.hora}`}
                              type="button"
                              className={`schedule-time-chip ${selectedTime === slot.hora ? 'selected' : ''}`}
                              onClick={() => setSelectedTime(slot.hora)}
                            >
                              {slot.hora}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="schedule-empty">Sin disponibilidad este día</p>
                  )}
                </>
              )}
            </div>
          </div>
        </StepFrame>
      )
    }

    if (step === 4) {
      return (
        <StepFrame
          kicker="Paso 5"
          title="¿Tenés un cupón?"
          subtitle="Elegí un cupón disponible o ingresá un código manualmente."
        >
          {showCouponLibrary ? (
            <div className="coupon-section compact">
              <div className="section-heading">
                <div>
                  <span className="section-label">Tus cupones disponibles</span>
                  <h2>Elegí el que más te convenga</h2>
                </div>
              </div>

              <div className="coupon-grid">
                {availableCoupons.map((coupon) => {
                  const applied = selectedCouponId === coupon.id
                  return (
                    <article key={coupon.id} className={`coupon-card ${applied ? 'selected' : ''}`}>
                      <div className="coupon-ticket-value">
                        <strong>{coupon.tipoDescuento === 'MontoFijo' ? formatCurrency(coupon.valor) : `${coupon.valor}%`}</strong>
                        <span>{coupon.tipoDescuento === 'MontoFijo' ? 'AHORRO' : 'OFF'}</span>
                      </div>
                      <div className="coupon-ticket-body">
                        <div className="coupon-copy">
                          <div className="coupon-code-row">
                            <h3>{coupon.codigo}</h3>
                          </div>
                          <p>{coupon.descripcion ?? 'Beneficio disponible para tu cuenta.'}</p>
                          <div className="coupon-tags">
                            <small>{coupon.serviciosIds?.length ? 'Aplica a servicios específicos' : 'Válido en servicios habilitados'}</small>
                            <small>Vence {new Date(coupon.fechaHasta).toLocaleDateString('es-AR')}</small>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="coupon-apply-btn"
                          onClick={() => {
                            setSelectedCouponId(coupon.id)
                            setAppliedDiscountCode(null)
                            setCouponCode('')
                          }}
                        >
                          {applied ? 'Aplicado' : 'Aplicar'}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>

              {couponsLoading ? <p className="wizard-inline-loading">Cargando cupones disponibles...</p> : null}
              {usuario && !couponsLoading && availableCoupons.length === 0 ? (
                <p className="wizard-inline-loading">No tenés cupones personales disponibles en este momento.</p>
              ) : null}
            </div>
          ) : null}

          <div className="manual-coupon-card">
            <div className="manual-coupon-divider">
              <span>{showCouponLibrary ? 'O ingresá un código' : 'Código promocional'}</span>
            </div>

            <div className="manual-coupon-row">
              <Input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="CÓDIGO DE CUPÓN" />
              <Button
                variant="secondary"
                onClick={() => void handleCouponApply(couponCode)}
                loading={validatingCode}
              >
                Aplicar
              </Button>
            </div>

            {appliedDiscountCode ? (
              <p className="manual-coupon-help">
                Código aplicado: <strong>{appliedDiscountCode.codigo}</strong> · {appliedDiscountCode.nombre}
              </p>
            ) : (
              <p className="manual-coupon-help">Los códigos no son acumulables con otras promociones activas.</p>
            )}

            {couponError ? <p className="wizard-inline-error">{couponError}</p> : null}
          </div>
        </StepFrame>
      )
    }

    if (step === 5) {
      return (
        <StepFrame
          kicker="Paso 6"
          title="Confirmá tu turno"
          subtitle="Revisá el detalle final antes de dejar la solicitud enviada."
        >
          <div className="confirmation-flow">
            <div className="confirmation-section">
              <div className="confirmation-detail-row">
                <MapPin size={18} />
                <div>
                  <span className="confirmation-label">Salón</span>
                  <strong>{selectedSalon === 'salon1' ? 'Salón 1 - Estética & bienestar' : 'Salón 2 - Peluquería'}</strong>
                </div>
              </div>
            </div>

            <div className="confirmation-section">
              <div className="confirmation-detail-row">
                <Scissors size={18} />
                <div>
                  <span className="confirmation-label">Servicio</span>
                  <strong>{selectedService?.nombre ?? 'Servicio a confirmar'}</strong>
                  <span className="confirmation-secondary">{summaryItems.join(' · ')}</span>
                </div>
              </div>
            </div>

            <div className="confirmation-section">
              <div className="confirmation-detail-row">
                <UserRound size={18} />
                <div>
                  <span className="confirmation-label">Operaria</span>
                  <strong>Te informaremos quién te atenderá al confirmar tu turno</strong>
                </div>
              </div>
            </div>

            <div className="confirmation-section">
              <div className="confirmation-detail-row">
                <CalendarDays size={18} />
                <div>
                  <span className="confirmation-label">Fecha y hora</span>
                  <strong>{confirmedDay.fechaLarga}, {selectedTime} hs</strong>
                </div>
              </div>
            </div>

            <div className="confirmation-section">
              <div className="confirmation-detail-row">
                <Clock3 size={18} />
                <div>
                  <span className="confirmation-label">Duración estimada</span>
                  <strong>~{estimatedDuration} minutos</strong>
                </div>
              </div>
            </div>

            <div className="confirmation-total">
              <div className="confirmation-total-card">
                <div className="confirmation-total-row">
                  <span>Subtotal</span>
                  <strong>{formatCurrency(subtotal)}</strong>
                </div>
                {automaticDiscountValue > 0 || couponDiscountValue > 0 ? (
                  <div className="confirmation-discounts">
                    {automaticDiscountValue > 0 ? (
                      <div className="discount-line">
                        <div className="discount-copy">
                          <span>Descuento {automaticDiscountPct}%</span>
                          <small>Aplicado automáticamente por elegir 3 o más zonas.</small>
                        </div>
                        <strong>-{formatCurrency(automaticDiscountValue)}</strong>
                      </div>
                    ) : null}
                    {couponDiscountValue > 0 ? (
                      <div className="discount-line">
                        <div className="discount-copy">
                          <span>
                            {selectedCoupon
                              ? `Cupón ${selectedCoupon.codigo}`
                              : appliedDiscountCode
                                ? `Código ${appliedDiscountCode.codigo}`
                                : 'Promoción aplicada'}
                          </span>
                          <small>
                            {selectedCoupon
                              ? `Promoción aplicada desde tu cupón ${selectedCoupon.codigo}.`
                              : appliedDiscountCode
                                ? `Promoción aplicada desde el código ${appliedDiscountCode.codigo}.`
                                : 'Promoción aplicada a la reserva.'}
                          </small>
                        </div>
                        <strong>-{formatCurrency(couponDiscountValue)}</strong>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <div className="grand-total"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
              </div>
            </div>

            {submitError ? <div className="wizard-inline-error">{submitError}</div> : null}
          </div>

          <div className="policy-card">
            <BadgePercent size={18} />
            <p>Recordá que las cancelaciones con menos de 24 horas de anticipación tienen un cargo del 50% del servicio.</p>
          </div>
        </StepFrame>
      )
    }

    return (
      <section className="success-screen">
        <SuccessBotanicalBackground />

        <div className="success-hero wizard-animate">
          <div className="success-mark">
            <Check size={36} />
          </div>

          <div className="success-eyebrow-row">
            <span className="ln" />
            <span className="success-eyebrow">Solicitud recibida</span>
            <span className="ln" />
          </div>

          <h1 className="success-title">
            Tu solicitud fue <em>enviada</em>
          </h1>
          <p className="success-subtitle">
            Estamos confirmando con la operaria. Te avisamos por <strong>{successChannels}</strong> en los próximos minutos.
          </p>
        </div>

        <div className="success-card wizard-animate">
          <div className="success-card-left">
            <div className="success-date-big">
              <em>{successWeekday}</em> {successDateRest}
            </div>
            <div className="success-date-sub">
              {selectedTime} hs · duración ~{estimatedDuration} min
            </div>

            <div className="success-detail-row">
              <span className="success-detail-ic"><Scissors size={16} /></span>
              <span className="success-detail-lab">Servicio</span>
              <span className="success-detail-v">{selectedService?.nombre ?? 'Servicio a confirmar'}</span>
            </div>

            <div className="success-detail-row">
              <span className="success-detail-ic"><UserRound size={16} /></span>
              <span className="success-detail-lab">Operaria</span>
              <span className="success-detail-v">A confirmar</span>
            </div>

            <div className="success-detail-row">
              <span className="success-detail-ic"><MapPin size={16} /></span>
              <span className="success-detail-lab">Salón</span>
              <span className="success-detail-v">Etéreo · Moreno 212 · 1A</span>
            </div>

            <div className="success-detail-row">
              <span className="success-detail-ic"><Clock3 size={16} /></span>
              <span className="success-detail-lab">Total</span>
              <span className="success-detail-v">{formatCurrency(createdTotal)}</span>
            </div>

            <div className="success-inline-actions-area">
              <div className="success-mini-actions">
                <button type="button" className="success-mini-action">
                  <span className="ic"><CalendarDays size={18} /></span>
                  <span className="text">
                    <span className="t">Agendar</span>
                    <span className="d">Google / Apple</span>
                  </span>
                </button>
                <button type="button" className="success-mini-action">
                  <span className="ic"><MapPin size={18} /></span>
                  <span className="text">
                    <span className="t">Cómo llegar</span>
                    <span className="d">Ver en Maps</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="success-card-divider" />

          <div className="success-card-right">
            <h4 className="success-tl-title">Qué sigue</h4>

            <div className="success-tl">
              <div className="success-ts">
                <div className="success-ts-left">
                  <div className="success-ts-dot active">1</div>
                </div>
                <div className="success-ts-body">
                  <div className="success-ts-t">Recibimos tu solicitud</div>
                  <div className="success-ts-d">Tu pedido ya está en revisión con la operaria.</div>
                  <span className="success-when">Recién</span>
                </div>
              </div>

              <div className="success-ts pending">
                <div className="success-ts-left">
                  <div className="success-ts-dot pending">2</div>
                </div>
                <div className="success-ts-body">
                  <div className="success-ts-t">Confirmación por {successChannels}</div>
                  <div className="success-ts-d">Te avisamos quién te va a atender y confirmamos el horario.</div>
                  <span className="success-when">En ~30 min</span>
                </div>
              </div>

              <div className="success-ts pending">
                <div className="success-ts-left">
                  <div className="success-ts-dot pending">3</div>
                </div>
                <div className="success-ts-body">
                  <div className="success-ts-t">¡Nos vemos en el salón!</div>
                  <div className="success-ts-d">Llegá 5 minutos antes. Tu operaria ya te va a estar esperando.</div>
                  <span className="success-when">{successTimelineTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="success-help wizard-animate">
          <div className="success-help-text">
            <span className="t">¿Tenés alguna duda?</span>
            <span className="d">Escribinos por WhatsApp y te respondemos al toque.</span>
          </div>
          <button type="button" className="success-help-btn">
            <span className="ic"><MessageCircle size={15} /></span>
            Contactanos
          </button>
        </div>

        <div className="success-foot wizard-animate">
          <button type="button" className="success-btn-ghost" onClick={restartReservation}>
            Reservar otro turno
          </button>
          <button type="button" className="success-btn-primary" onClick={() => navigate(usuario ? '/mis-turnos' : '/')}>
            Ver mis turnos <span className="ar">→</span>
          </button>
        </div>
      </section>
    )
  }

  return (
    <>
      <main className={`reserva-page ${step === 6 ? 'success-mode' : ''}`}>
        <div className="reserva-shell">
          {step < 6 ? (
            <div
              className={`progress-shell ${headerHidden ? 'header-hidden' : ''}`}
            >
              <div className="progress-card">
                <div className="progress-line">
                  <span style={{ width: `${progressValue}%` }} />
                </div>
                <div className="progress-steps">
                  {STEP_LABELS.slice(0, 6).map((label, index) => {
                    const completed = step > index
                    const active = step === index
                    return (
                      <div key={label} className="progress-step">
                        <div className={`progress-node ${completed ? 'completed' : ''} ${active ? 'active' : ''}`}>
                          {completed ? <Check size={15} /> : index + 1}
                        </div>
                        <span className={`progress-text ${completed ? 'completed' : ''} ${active ? 'active' : ''}`}>
                          {label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : null}

          <div
            className={`content-shell ${step <= 1 || step === 5 || step === 6 ? 'no-summary' : ''}`}
          >
            <div className={`content-column ${step === 6 ? 'full-width' : ''}`}>
              {renderStepContent()}
              {step < 6 ? (
                <div className="wizard-footer">
                  <div className="footer-actions">
                    <Button variant="ghost" size="lg" onClick={goBack} leftIcon={<ArrowLeft size={16} />}>
                      {step === 0 ? 'Volver al inicio' : 'Anterior'}
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={goNext}
                      disabled={!canProceed}
                      loading={isSubmitting}
                      rightIcon={<ArrowRight size={16} />}
                    >
                      {step === 5 ? 'Confirmar turno' : 'Siguiente'}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            {step > 1 && step < 5 ? (
              <aside className={`summary-column ${headerHidden ? 'header-hidden' : ''}`}>
                <div className="summary-card">
                  <div className="summary-header">
                    <div>
                      <span className="section-label">Tu reserva</span>
                      <h2>Tu reserva</h2>
                    </div>
                  </div>

                  <div className="summary-items">
                    {summaryItems.map((item) => (
                      <div key={item} className="summary-item">
                        <span>{item}</span>
                        <strong>{selectedCombo ? 'Incluido' : formatCurrency(selectedZones.find((zone) => zone.nombre === item)?.precio ?? 0)}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="summary-divider" />

                  {automaticDiscountValue > 0 || couponDiscountValue > 0 ? (
                    <div className="summary-discounts">
                      {automaticDiscountValue > 0 ? (
                        <div className="summary-line discount">
                          <span>Descuento {automaticDiscountPct}%</span>
                          <strong>-{formatCurrency(automaticDiscountValue)}</strong>
                        </div>
                      ) : null}

                      {couponDiscountValue > 0 ? (
                        <div className="summary-line discount">
                          <span>{selectedCoupon ? `Cupón ${selectedCoupon.codigo}` : appliedDiscountCode ? `Código ${appliedDiscountCode.codigo}` : 'Promoción'}</span>
                          <strong>-{formatCurrency(couponDiscountValue)}</strong>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {(automaticDiscountValue > 0 || couponDiscountValue > 0) ? <div className="summary-divider" /> : null}

                  <div className="summary-total">
                    <span>Total</span>
                    <strong>{formatCurrency(total)}</strong>
                  </div>

                  <div className="summary-meta">
                    <span>⏱ Duración estimada: ~{estimatedDuration} min</span>
                  </div>

                </div>
              </aside>
            ) : null}
          </div>
        </div>

        {step > 1 && step < 5 ? (
          <>
            <button type="button" className="mobile-summary-bar" onClick={() => setSummaryOpen(true)}>
              <span>{summaryItems.length} zonas · ~{estimatedDuration} min · {formatCurrency(total)}</span>
              <span>▲</span>
            </button>

            <div className={`mobile-summary-drawer ${summaryOpen ? 'open' : ''}`}>
              <button type="button" className="mobile-summary-backdrop" onClick={() => setSummaryOpen(false)} />
              <div className="mobile-summary-sheet">
                <div className="drawer-handle" />
                <div className="summary-card mobile">
                  <div className="summary-header">
                    <div>
                      <span className="section-label">Tu reserva</span>
                      <h2>Tu reserva</h2>
                    </div>
                    <button type="button" onClick={() => setSummaryOpen(false)}>Cerrar</button>
                  </div>

                  <div className="summary-items">
                    {summaryItems.map((item) => (
                      <div key={item} className="summary-item">
                        <span>{item}</span>
                        <strong>{selectedCombo ? 'Incluido' : formatCurrency(selectedZones.find((zone) => zone.nombre === item)?.precio ?? 0)}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="summary-total">
                    <span>Total</span>
                    <strong>{formatCurrency(total)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>

      <style>{`
        .reserva-page {
          min-height: 100vh;
          padding: 152px 18px 120px;
          background:
            radial-gradient(circle at top left, rgba(197,160,89,0.08) 0%, transparent 26%),
            linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(249,245,240,1) 28%, rgba(249,245,240,1) 100%);
        }

        .reserva-shell {
          max-width: 1280px;
          margin: 0 auto;
        }

        .progress-shell {
          --progress-top: 118px;
          position: sticky;
          top: var(--progress-top);
          z-index: 20;
          margin-bottom: 26px;
          transition: top 420ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .progress-shell::before {
          content: '';
          position: absolute;
          left: -24px;
          right: -24px;
          top: calc(var(--progress-top) * -1);
          height: var(--progress-top);
          background: var(--color-tertiary);
          border-bottom-left-radius: 28px;
          border-bottom-right-radius: 28px;
          pointer-events: none;
          z-index: 0;
        }

        .progress-shell.header-hidden {
          --progress-top: 16px;
        }

        .progress-card {
          position: relative;
          z-index: 1;
          overflow: hidden;
          padding: 24px 22px 18px;
          border-radius: 24px;
          background: #fff;
          border: 1px solid rgba(232,224,216,0.9);
          box-shadow: 0 12px 36px rgba(74,55,40,0.09);
          transition:
            border-radius 280ms ease,
            box-shadow 280ms ease,
            border-color 280ms ease,
            background 280ms ease;
        }

        .progress-line {
          position: absolute;
          left: 8%;
          right: 8%;
          top: 40px;
          height: 3px;
          background: rgba(232,224,216,0.9);
        }

        .progress-line span {
          display: block;
          height: 100%;
          background: linear-gradient(90deg, #C5A059 0%, #e0be7e 100%);
          transition: width 260ms ease;
        }

        .progress-steps {
          position: relative;
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 12px;
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .progress-node {
          width: 38px;
          height: 38px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 700;
          color: var(--color-text-muted);
          background: white;
          border: 2px solid rgba(168,152,128,0.4);
          transition: all 220ms ease;
        }

        .progress-node.completed {
          background: var(--color-secondary);
          color: white;
          border-color: var(--color-secondary);
        }

        .progress-node.active {
          color: var(--color-secondary);
          border: 3px solid var(--color-secondary);
          box-shadow: 0 0 0 8px rgba(197,160,89,0.08);
          animation: wizardPulse 1.8s ease-in-out infinite;
        }

        .progress-text {
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--color-text-muted);
          text-align: center;
        }

        .progress-text.completed {
          color: var(--color-secondary);
          font-weight: 600;
        }

        .progress-text.active {
          color: var(--color-primary);
          font-weight: 700;
        }

        .content-shell {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 26px;
          align-items: stretch;
        }

        .content-shell.no-summary {
          grid-template-columns: minmax(0, 1fr);
        }

        .content-column.full-width {
          grid-column: 1 / -1;
        }

        .content-column {
          display: flex;
          flex-direction: column;
          gap: 18px;
          min-height: 0;
          height: 100%;
        }

        .wizard-panel,
        .summary-card,
        .confirmation-card,
        .identity-card,
        .guest-form-card,
        .manual-coupon-card {
          border-radius: 24px;
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(232,224,216,0.95);
          box-shadow: 0 16px 38px rgba(74,55,40,0.08);
        }

        .wizard-panel {
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          flex: 1 1 auto;
          min-height: 0;
        }

        .wizard-animate {
          animation: wizardSlideIn 320ms ease;
        }

        .wizard-panel-header {
          padding: 34px 34px 10px;
          background: linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.92) 100%);
        }

        .wizard-panel-body-shell {
          position: relative;
          min-height: 0;
          flex: 1 1 auto;
          overflow: hidden;
        }

        .wizard-panel-body-shell::before,
        .wizard-panel-body-shell::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          height: 42px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 180ms ease;
          z-index: 2;
        }

        .wizard-panel-body-shell::before {
          top: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.985) 0%, rgba(255,255,255,0.82) 44%, rgba(255,255,255,0) 100%);
        }

        .wizard-panel-body-shell::after {
          bottom: 0;
          background: linear-gradient(0deg, rgba(255,255,255,0.985) 0%, rgba(255,255,255,0.82) 44%, rgba(255,255,255,0) 100%);
        }

        .wizard-panel-body-shell.show-top-fade::before,
        .wizard-panel-body-shell.show-bottom-fade::after {
          opacity: 1;
        }

        .wizard-panel-body {
          padding: 10px 34px 34px;
          min-height: 0;
        }

        .first-step-flat {
          display: grid;
          gap: 16px;
        }

        .wizard-scroll-hint {
          position: absolute;
          left: 50%;
          bottom: 16px;
          transform: translateX(-50%);
          border: none;
          border-radius: 9999px;
          padding: 8px 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.94);
          color: var(--color-secondary);
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          box-shadow: 0 10px 24px rgba(74,55,40,0.1);
          cursor: pointer;
          z-index: 3;
          animation: wizardHintFloat 1.8s ease-in-out infinite;
        }

        .wizard-kicker,
        .section-label {
          display: inline-block;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--color-secondary);
        }

        .wizard-title,
        .success-screen h1 {
          margin: 12px 0 10px;
          font-family: var(--font-heading);
          font-size: clamp(2rem, 3vw, 3.1rem);
          line-height: 1.02;
          color: var(--color-text-primary);
        }

        .wizard-subtitle,
        .success-screen p {
          margin: 0;
          max-width: 680px;
          font-family: var(--font-body);
          font-size: 16px;
          line-height: 1.7;
          color: var(--color-text-secondary);
        }

        .salon-grid,
        .service-grid,
        .coupon-grid {
          display: grid;
          gap: 18px;
        }

        .salon-grid {
          margin-top: 18px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .salon-card {
          text-align: left;
          min-height: 250px;
          padding: 34px 34px 30px;
          border-radius: 32px;
          border: 1px solid rgba(197,160,89,0.2);
          color: var(--color-tertiary);
          cursor: pointer;
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, filter 180ms ease;
          box-shadow: 0 20px 38px rgba(44,31,20,0.18);
          position: relative;
          overflow: hidden;
        }

        .salon-card::before {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          right: -48px;
          top: -72px;
          border-radius: 42% 58% 52% 48%;
          background:
            radial-gradient(circle at 30% 32%, rgba(197,160,89,0.22) 0, rgba(197,160,89,0.22) 36%, transparent 37%),
            radial-gradient(circle at 70% 66%, rgba(197,160,89,0.12) 0, rgba(197,160,89,0.12) 28%, transparent 29%);
          opacity: 0.95;
          pointer-events: none;
          transform: rotate(22deg);
        }

        .salon-card::after {
          content: '';
          position: absolute;
          left: 24px;
          bottom: 20px;
          width: 160px;
          height: 46px;
          background: radial-gradient(circle, rgba(212,172,98,0.16) 0%, rgba(212,172,98,0) 72%);
          pointer-events: none;
        }

        .salon-card.selected {
          border-color: rgba(240,211,151,1);
          box-shadow:
            0 24px 44px rgba(44,31,20,0.24),
            0 0 0 6px rgba(240,211,151,0.38);
          transform: translateY(-2px);
        }

        .salon-card-header {
          display: flex;
          align-items: start;
          justify-content: space-between;
          gap: 16px;
          min-height: 100%;
          position: relative;
          z-index: 1;
        }

        .salon-card-copy {
          max-width: 88%;
        }

        .salon-card-eyebrow {
          display: inline-block;
          margin-bottom: 18px;
          font-family: var(--font-heading);
          font-size: 22px;
          font-style: italic;
          letter-spacing: 0.12em;
          color: rgba(197,160,89,0.92);
        }

        .salon-check-badge {
          flex-shrink: 0;
          width: 46px;
          height: 46px;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--color-secondary);
          color: white;
          box-shadow: 0 10px 20px rgba(197,160,89,0.22);
        }

        .salon-card h3,
        .service-card h3,
        .combo-card h3,
        .zone-card h3,
        .coupon-card h3,
        .confirmation-card h2,
        .identity-card h2,
        .manual-coupon-card h2 {
          margin: 0;
          font-family: var(--font-heading);
          color: inherit;
        }

        .salon-card h3 {
          font-size: clamp(2.4rem, 3.3vw, 4.25rem);
          line-height: 0.98;
          color: rgba(255,249,241,0.98);
          text-wrap: balance;
          text-shadow: 0 2px 16px rgba(0,0,0,0.12);
        }

        .salon-card p {
          margin: 28px 0 0;
          font-family: var(--font-body);
          font-size: 17px;
          line-height: 1.75;
          color: rgba(249,245,240,0.88);
          max-width: 680px;
          text-wrap: pretty;
        }

        .service-section,
        .coupon-section {
          margin-top: 24px;
        }

        .coupon-section.compact {
          margin-top: 8px;
        }

        .section-heading,
        .column-header,
        .summary-header,
        .identity-header {
          display: flex;
          align-items: start;
          justify-content: space-between;
          gap: 16px;
        }

        .section-heading h2,
        .column-header h2,
        .summary-header h2,
        .guest-login-invite h3 {
          margin: 8px 0 0;
          font-family: var(--font-heading);
          color: var(--color-text-primary);
          font-size: 28px;
        }

        .service-grid {
          margin-top: 20px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .service-card {
          text-align: left;
          padding: 24px 22px 22px;
          border-radius: 26px;
          background: linear-gradient(180deg, #fffefd 0%, #fffdfa 100%);
          border: 1px solid rgba(232,224,216,0.95);
          cursor: pointer;
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
          min-height: 238px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          position: relative;
          overflow: hidden;
        }

        .service-card:hover,
        .service-card.selected {
          transform: translateY(-2px);
          border-color: rgba(197,160,89,0.7);
          box-shadow: 0 14px 28px rgba(74,55,40,0.1);
        }

        .service-card.selected {
          background: linear-gradient(180deg, rgba(244,235,214,0.96) 0%, rgba(255,250,241,0.98) 100%);
          border-color: rgba(197,160,89,0.82);
          box-shadow: 0 18px 34px rgba(74,55,40,0.12);
        }

        .service-card::before {
          content: '';
          position: absolute;
          inset: auto auto -26px -18px;
          width: 120px;
          height: 120px;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(197,160,89,0.1) 0%, rgba(197,160,89,0) 70%);
          pointer-events: none;
        }

        .service-selected-badge {
          position: absolute;
          top: 18px;
          right: 18px;
          width: 36px;
          height: 36px;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--color-secondary);
          color: white;
          box-shadow: 0 10px 22px rgba(197,160,89,0.22);
        }

        .service-icon-wrap {
          margin-top: 6px;
          margin-bottom: 18px;
        }

        .service-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 86px;
          height: 86px;
          border-radius: 9999px;
          background: rgba(245,239,230,0.92);
          box-shadow: inset 0 0 0 1px rgba(232,224,216,0.9);
          color: rgba(92,70,51,0.92);
        }

        .service-card.selected .service-icon {
          background: linear-gradient(180deg, #d4ac62 0%, #c69b4f 100%);
          color: white;
          box-shadow: 0 16px 28px rgba(197,160,89,0.22);
        }

        .service-card h3 {
          font-size: 28px;
          line-height: 1.06;
          color: var(--color-text-primary);
          text-wrap: balance;
        }

        .service-card p,
        .combo-card p,
        .coupon-card p,
        .zone-card p,
        .policy-card p,
        .success-detail-card span {
          margin: 0;
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.6;
          color: var(--color-text-secondary);
        }

        .service-card p {
          margin-top: 14px;
          max-width: 260px;
          font-size: 15px;
          line-height: 1.7;
        }

        .service-card h3 {
          margin-top: 26px;
          font-family: var(--font-body);
          font-size: 20px;
          font-weight: 700;
          text-align: left;
          color: var(--color-text-primary);
        }

        .service-card p {
          margin-top: 12px;
          max-width: 250px;
          font-size: 15px;
          line-height: 1.7;
          text-align: left;
        }

        .selection-layout {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
          margin-top: 18px;
          align-items: start;
        }

        .selection-layout.one-column {
          grid-template-columns: minmax(0, 1fr);
        }

        .selection-column {
          position: relative;
          padding: 24px;
          border-radius: 22px;
          background: rgba(255,255,255,0.86);
          border: 1px solid rgba(232,224,216,0.95);
          min-height: 100%;
        }

        .offer-badge {
          padding: 7px 12px;
          border-radius: 9999px;
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #fff;
          background: linear-gradient(135deg, #d1ad67 0%, #b98a39 100%);
        }

        .combo-stack,
        .zone-stack,
        .summary-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 18px;
        }

        .combo-card,
        .zone-card,
        .coupon-card {
          display: flex;
          align-items: start;
          justify-content: space-between;
          gap: 16px;
          width: 100%;
          padding: 18px;
          border-radius: 18px;
          background: #fff;
          border: 1px solid rgba(232,224,216,0.95);
          cursor: pointer;
          text-align: left;
          transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease, background 180ms ease;
          position: relative;
          overflow: hidden;
        }

        .combo-card.selected,
        .zone-card.selected,
        .coupon-card.selected {
          border-color: rgba(197,160,89,0.8);
          background: linear-gradient(180deg, rgba(197,160,89,0.12) 0%, rgba(255,255,255,0.98) 100%);
          box-shadow: 0 10px 22px rgba(74,55,40,0.08);
        }

        .combo-card.selected {
          border-width: 2px;
          border-color: rgba(197,160,89,0.88);
          background: linear-gradient(180deg, rgba(244,235,214,0.98) 0%, rgba(255,250,241,0.98) 100%);
          box-shadow: 0 18px 34px rgba(74,55,40,0.12);
        }

        .combo-card::before,
        .zone-card::before {
          content: '';
          position: absolute;
          inset: auto auto -28px -20px;
          width: 118px;
          height: 118px;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(197,160,89,0.08) 0%, rgba(197,160,89,0) 72%);
          pointer-events: none;
        }

        .combo-selected-badge {
          position: absolute;
          top: 22px;
          right: 22px;
          width: 34px;
          height: 34px;
          flex: 0 0 auto;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--color-secondary);
          color: white;
          box-shadow: 0 10px 22px rgba(197,160,89,0.22);
        }

        .combo-title-row,
        .coupon-top {
          display: flex;
          align-items: start;
          gap: 12px;
        }

        .combo-title-row {
          justify-content: space-between;
          align-items: start;
          gap: 18px;
          padding-right: 64px;
        }

        .combo-title-left {
          display: flex;
          align-items: start;
          gap: 12px;
          min-width: 0;
        }

        .combo-emoji,
        .coupon-icon {
          font-size: 22px;
          line-height: 1;
        }

        .combo-card.selected .combo-emoji {
          transform: scale(1.06);
          filter: saturate(1.08);
        }

        .combo-meta-row {
          display: flex;
          align-items: baseline;
          gap: 14px;
          margin-top: 16px;
          flex-wrap: wrap;
        }

        .combo-price,
        .summary-total strong,
        .grand-total strong,
        .confirmation-total strong {
          font-family: var(--font-body);
          font-size: 18px;
          font-weight: 800;
          color: var(--color-text-primary);
        }

        .combo-duration,
        .summary-meta,
        .summary-line,
        .coupon-tags small,
        .mobile-slot small {
          font-family: var(--font-body);
          color: var(--color-text-muted);
        }

        .combo-kicker {
          display: inline-block;
          margin-top: 4px;
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-text-muted);
        }

        .combo-card h3 {
          font-size: 20px;
          line-height: 1.1;
        }

        .combo-card p {
          margin-top: 14px;
          max-width: 420px;
          font-size: 15px;
          line-height: 1.65;
        }

        .discount-banner {
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 16px;
          background: rgba(197,160,89,0.08);
          color: var(--color-text-secondary);
          font-family: var(--font-body);
          font-weight: 600;
          transition: all 200ms ease;
        }

        .discount-banner.active {
          background: linear-gradient(135deg, rgba(197,160,89,0.18) 0%, rgba(255,248,233,0.95) 100%);
          color: var(--color-primary);
        }

        .zone-stack-wrapper {
          position: relative;
          margin-top: 18px;
        }

        .zone-overlay {
          position: absolute;
          inset: 0;
          z-index: 2;
          border-radius: 20px;
          background: rgba(44,31,20,0.52);
          backdrop-filter: blur(2px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 26px;
          text-align: center;
          color: var(--color-tertiary);
        }

        .zone-overlay p {
          margin: 0;
          max-width: 360px;
          font-family: var(--font-body);
          font-size: 15px;
          line-height: 1.7;
          color: rgba(249,245,240,0.9);
        }

        .zone-overlay-btn {
          border: 1px solid rgba(255,255,255,0.26);
          border-radius: 9999px;
          background: rgba(255,255,255,0.12);
          color: white;
          padding: 9px 14px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 180ms ease, transform 180ms ease;
        }

        .zone-overlay-btn:hover {
          background: rgba(255,255,255,0.18);
          transform: translateY(-1px);
        }

        .zone-card {
          align-items: center;
          padding: 22px 20px;
          margin-bottom: 12px;
        }

        .zone-card.selected {
          border-width: 2px;
          border-color: rgba(197,160,89,0.82);
          background: linear-gradient(180deg, rgba(244,235,214,0.96) 0%, rgba(255,250,241,0.98) 100%);
          box-shadow: 0 16px 28px rgba(74,55,40,0.1);
        }

        .zone-card:disabled {
          cursor: not-allowed;
        }

        .zone-stack.locked {
          opacity: 0.18;
          filter: grayscale(0.12);
          pointer-events: none;
        }

        .zone-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .zone-check {
          width: 22px;
          height: 22px;
          border-radius: 9999px;
          border: 1px solid rgba(168,152,128,0.5);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: transparent;
          background: white;
        }

        .zone-check.selected {
          background: var(--color-secondary);
          border-color: var(--color-secondary);
          color: white;
        }

        .zone-card h3 {
          font-size: 18px;
          line-height: 1.2;
        }

        .zone-card p {
          margin-top: 8px;
          font-size: 14px;
        }

        .schedule-picker {
          margin-top: 8px;
          display: grid;
          grid-template-columns: 252px minmax(0, 1fr);
          gap: 28px;
          align-items: start;
        }

        .schedule-picker-left {
          padding: 10px 0 0;
        }

        .schedule-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          gap: 10px;
        }

        .schedule-nav strong {
          font-family: var(--font-heading);
          font-size: 15px;
          font-weight: 500;
          letter-spacing: -0.01em;
          color: var(--color-text-primary);
        }

        .schedule-nav-btn {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: var(--color-tertiary);
          color: var(--color-primary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid var(--color-neutral-light);
          cursor: pointer;
          transition: all 160ms ease;
        }

        .schedule-nav-btn:hover:not(:disabled) {
          background: var(--color-secondary);
          color: #fff;
          border-color: var(--color-secondary);
        }

        .schedule-nav-btn:disabled {
          opacity: 0.28;
          cursor: default;
        }

        .schedule-weekdays {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          margin-bottom: 4px;
        }

        .schedule-weekdays span {
          text-align: center;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-text-muted);
          padding: 2px 0 7px;
        }

        .schedule-calendar-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 2px;
        }

        .schedule-calendar-day {
          aspect-ratio: 1;
          border-radius: 7px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          border: none;
          background: none;
          padding: 2px;
          color: var(--color-text-primary);
          transition: background 160ms ease, color 160ms ease;
        }

        .schedule-calendar-day.blank {
          pointer-events: none;
        }

        .schedule-calendar-day.available:hover {
          background: rgba(197,160,89,0.12);
        }

        .schedule-calendar-day.selected {
          background: var(--color-secondary);
          color: #fff;
        }

        .schedule-calendar-day.past,
        .schedule-calendar-day.disabled {
          color: rgba(140,126,109,0.34);
          cursor: default;
        }

        .schedule-calendar-day.selected .schedule-calendar-dot {
          background: rgba(255,255,255,0.56);
        }

        .schedule-calendar-day-num {
          font-size: 12.5px;
          font-weight: 600;
          line-height: 1;
        }

        .schedule-calendar-dot {
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: var(--color-secondary);
          flex-shrink: 0;
        }

        .schedule-legend {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          width: fit-content;
          padding: 9px 12px;
          border-radius: 999px;
          background: rgba(197,160,89,0.11);
          border: 1px solid rgba(197,160,89,0.22);
          font-size: 11px;
          color: var(--color-text-primary);
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .schedule-picker-right {
          padding: 8px 0 0 28px;
          min-height: 300px;
          display: flex;
          flex-direction: column;
          border-left: 1px solid var(--color-neutral-light);
        }

        .schedule-picker button:not(:disabled),
        .wizard-footer button:not(:disabled),
        .summary-card button:not(:disabled),
        .success-screen button:not(:disabled) {
          cursor: pointer;
        }

        .schedule-placeholder {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          text-align: center;
          color: var(--color-text-muted);
        }

        .schedule-placeholder p {
          margin: 0;
          font-size: 14px;
          line-height: 1.65;
        }

        .schedule-calendar-day.available {
          color: var(--color-text-primary);
        }

        .schedule-calendar-day.available .schedule-calendar-day-num {
          font-weight: 700;
        }

        .schedule-day-title {
          margin: 0 0 20px;
          font-family: var(--font-heading);
          font-size: 20px;
          font-weight: 500;
          letter-spacing: -0.01em;
          color: var(--color-text-primary);
        }

        .schedule-time-group {
          margin-bottom: 18px;
        }

        .schedule-time-group:last-child {
          margin-bottom: 0;
        }

        .schedule-time-group-label {
          margin-bottom: 9px;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--color-text-muted);
        }

        .schedule-time-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .schedule-time-chip,
        .sex-options button,
        .mobile-switcher button {
          border-radius: 9px;
          border: 1.5px solid var(--color-neutral-light);
          background: var(--color-tertiary);
          font-family: var(--font-body);
          transition: all 180ms ease;
        }

        .schedule-time-chip {
          padding: 9px 16px;
          font-size: 13.5px;
          font-weight: 500;
          font-variant-numeric: tabular-nums;
          color: var(--color-primary);
        }

        .schedule-time-chip:hover:not(.selected),
        .sex-options button:hover,
        .mobile-switcher button:hover {
          border-color: var(--color-secondary);
          background: rgba(197,160,89,0.08);
        }

        .schedule-time-chip.selected,
        .sex-options button.active,
        .mobile-switcher button.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: var(--color-tertiary);
          box-shadow: 0 2px 8px -3px rgba(74,55,40,0.35);
        }

        .schedule-empty {
          margin: 2px 0 0;
          font-size: 13px;
          color: var(--color-text-muted);
          font-style: italic;
        }

        .mobile-schedule,
        .mobile-switcher {
          display: none;
        }

        .coupon-grid {
          margin-top: 14px;
          grid-template-columns: minmax(0, 1fr);
          gap: 22px;
        }

        .coupon-card {
          flex-direction: row;
          align-items: stretch;
          gap: 0;
          padding: 0;
          overflow: hidden;
          min-height: 118px;
        }

        .coupon-ticket-value {
          width: 138px;
          flex: 0 0 138px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          background: linear-gradient(180deg, #5d4331 0%, #463123 100%);
          color: #d8b15f;
          position: relative;
          z-index: 1;
        }

        .coupon-ticket-value::after {
          content: '';
          position: absolute;
          top: 0;
          right: -14px;
          bottom: 0;
          width: 28px;
          background:
            linear-gradient(to right, transparent 0 14px, #fff 14px 100%),
            radial-gradient(circle at 14px 12px, #fff 0 7px, transparent 7.4px);
          background-size: 100% 100%, 28px 24px;
          background-repeat: no-repeat, repeat-y;
          background-position: 0 0, 0 0;
          pointer-events: none;
        }

        .coupon-ticket-value strong {
          font-family: var(--font-heading);
          font-size: 38px;
          line-height: 0.9;
          color: #d8b15f;
        }

        .coupon-ticket-value span {
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: rgba(255,245,229,0.9);
        }

        .coupon-ticket-body {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          width: 100%;
          padding: 14px 22px 14px 30px;
          background: #fff;
        }

        .coupon-copy {
          display: grid;
          gap: 6px;
          min-width: 0;
          flex: 1 1 auto;
        }

        .coupon-code-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .coupon-copy h3 {
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .coupon-copy p {
          font-size: 14px;
          line-height: 1.25;
          color: var(--color-text-primary);
          max-width: none;
        }

        .coupon-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .coupon-tags small {
          font-family: var(--font-body);
          font-size: 11px;
          color: var(--color-text-muted);
        }

        .coupon-apply-btn,
        .identity-actions button,
        .summary-header button {
          border: 1.5px solid rgba(74,55,40,0.88);
          background: #fff;
          color: var(--color-primary);
          font-family: var(--font-body);
          font-weight: 700;
          cursor: pointer;
          border-radius: 9999px;
          padding: 14px 30px;
          transition: all 180ms ease;
        }

        .coupon-apply-btn {
          flex: 0 0 auto;
          min-width: 112px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          padding: 9px 22px;
          font-size: 12px;
        }

        .coupon-apply-btn:hover {
          background: rgba(197,160,89,0.08);
          border-color: rgba(197,160,89,0.9);
        }

        .coupon-card.selected .coupon-apply-btn {
          background: linear-gradient(180deg, #d4ac62 0%, #bb8f43 100%);
          border-color: var(--color-secondary);
          color: #fff;
        }

        .coupon-card.selected {
          border-color: rgba(197,160,89,0.9);
          box-shadow: 0 14px 28px rgba(74,55,40,0.1);
          background: linear-gradient(180deg, rgba(255,252,246,1) 0%, rgba(255,255,255,1) 100%);
        }

        .coupon-card.selected .coupon-ticket-value {
          background: linear-gradient(180deg, #cda24f 0%, #b88a3d 100%);
        }

        .coupon-card.selected .coupon-ticket-value strong,
        .coupon-card.selected .coupon-ticket-value span {
          color: #fffdf6;
        }

        .manual-coupon-card {
          margin-top: 18px;
          padding: 10px 0 0;
          border: none;
          background: transparent;
          box-shadow: none;
          border-radius: 0;
        }

        .manual-coupon-divider {
          display: flex;
          align-items: center;
          gap: 18px;
          margin: 8px 0 18px;
        }

        .manual-coupon-divider::before,
        .manual-coupon-divider::after {
          content: '';
          flex: 1 1 auto;
          height: 1px;
          background: rgba(223,206,184,0.92);
        }

        .manual-coupon-divider span {
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--color-secondary);
        }

        .first-step-note {
          display: flex;
          align-items: start;
          gap: 10px;
          margin-top: 10px;
          padding: 16px 18px;
          border-radius: 16px;
          background: rgba(197,160,89,0.08);
          color: var(--color-primary);
        }

        .first-step-note p {
          margin: 0;
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.6;
        }

        .manual-coupon-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 14px;
          align-items: end;
          margin-top: 0;
        }

        .manual-coupon-help {
          margin: 12px 0 0;
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--color-text-muted);
        }


        .identity-card,
        .guest-form-card,
        .confirmation-card {
          margin-top: 16px;
          padding: 28px;
        }

        .confirmation-flow {
          margin-top: 0;
        }

        .identity-badge {
          padding: 8px 12px;
          border-radius: 9999px;
          background: rgba(197,160,89,0.14);
          color: var(--color-secondary);
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .identity-grid,
        .guest-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .identity-grid span,
        .sex-label {
          display: block;
          font-family: var(--font-body);
          font-size: 12px;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .identity-grid strong {
          display: block;
          margin-top: 6px;
          font-family: var(--font-body);
          color: var(--color-text-primary);
        }

        .identity-actions {
          display: flex;
          gap: 18px;
          margin-top: 20px;
        }

        .sex-row {
          margin-top: 8px;
        }

        .sex-options {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 12px;
        }

        .sex-options button {
          padding: 12px 16px;
          color: var(--color-text-secondary);
        }

        .guest-login-invite {
          margin-top: 22px;
          padding: 20px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(197,160,89,0.1) 0%, rgba(255,255,255,0.95) 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .confirmation-list,
        .success-detail-card {
          display: grid;
          gap: 14px;
          margin-top: 20px;
        }

        .confirmation-list div,
        .success-detail-card div {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .confirmation-total {
          margin-top: 18px;
          padding-top: 4px;
        }

        .confirmation-section {
          padding: 18px 0;
          border-bottom: 1px solid rgba(232,224,216,0.95);
        }

        .confirmation-section:first-child {
          padding-top: 4px;
        }

        .confirmation-section:last-of-type {
          padding-bottom: 10px;
          border-bottom: none;
        }

        .confirmation-detail-row {
          display: flex;
          align-items: start;
          gap: 16px;
          color: var(--color-secondary);
        }

        .confirmation-detail-row > div {
          display: grid;
          gap: 6px;
        }

        .confirmation-label {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-text-secondary);
        }

        .confirmation-detail-row strong {
          font-family: var(--font-body);
          font-size: 16px;
          font-weight: 500;
          color: var(--color-text-primary);
        }

        .confirmation-secondary {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--color-text-secondary);
        }

        .confirmation-total > div,
        .summary-line,
        .summary-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          font-family: var(--font-body);
          color: var(--color-text-secondary);
        }

        .confirmation-total-card {
          display: grid;
          gap: 18px;
          padding: 22px 24px;
          border-radius: 22px;
          background: linear-gradient(180deg, rgba(255,253,249,0.98) 0%, rgba(251,247,240,0.94) 100%);
          border: 1px solid rgba(232,224,216,0.95);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
        }

        .confirmation-total-row {
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(232,224,216,0.82);
        }

        .confirmation-discounts {
          display: grid;
          gap: 18px;
        }

        .grand-total span,
        .summary-total span {
          color: var(--color-text-primary);
          font-weight: 700;
        }

        .discount-line,
        .discount-line strong {
          color: var(--color-secondary);
        }

        .discount-line {
          align-items: flex-start !important;
          gap: 20px;
        }

        .discount-copy {
          display: grid !important;
          gap: 3px;
          justify-items: start;
          text-align: left;
        }

        .discount-copy span {
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 600;
          color: var(--color-secondary);
        }

        .discount-copy small {
          font-family: var(--font-body);
          font-size: 12px;
          line-height: 1.4;
          color: var(--color-text-muted);
        }

        .grand-total {
          margin-top: 4px;
          padding-top: 18px;
          border-top: 1px solid rgba(223,206,184,0.56);
        }

        .summary-line.discount,
        .summary-line.discount strong {
          color: var(--color-secondary);
        }

        .summary-discounts {
          display: grid;
          gap: 14px;
        }

        .policy-card {
          margin-top: 16px;
          padding: 18px 20px;
          border-left: 4px solid var(--color-secondary);
          border-radius: 18px;
          background: rgba(255,251,244,0.92);
          display: flex;
          align-items: start;
          gap: 12px;
          color: var(--color-primary);
        }

        .summary-column {
          position: sticky;
          top: 240px;
          transition: top 420ms cubic-bezier(0.22, 1, 0.36, 1);
          min-height: 0;
          align-self: start;
        }

        .summary-column.header-hidden {
          top: 138px;
        }

        .summary-card {
          padding: 28px 28px 24px;
          box-shadow: 0 18px 38px rgba(74,55,40,0.08);
          overflow: hidden;
        }

        .summary-items {
          margin-top: 18px;
          gap: 12px;
        }

        .summary-item {
          display: flex;
          align-items: start;
          justify-content: space-between;
          gap: 14px;
          font-family: var(--font-body);
          color: var(--color-text-primary);
        }

        .summary-item strong,
        .summary-meta {
          font-family: var(--font-body);
        }

        .summary-item span {
          color: var(--color-text-secondary);
          font-size: 14px;
        }

        .summary-item strong {
          font-size: 16px;
          color: var(--color-text-primary);
        }

        .summary-divider {
          height: 1px;
          margin: 20px 0;
          background: rgba(232,224,216,0.95);
        }

        .summary-meta {
          display: grid;
          gap: 6px;
          margin-top: 18px;
          font-size: 13px;
        }

        .summary-total {
          align-items: end;
          margin-top: 4px;
        }

        .summary-total span {
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-size: 13px;
        }

        .summary-total strong {
          font-family: var(--font-heading);
          font-size: 32px;
          line-height: 0.95;
          letter-spacing: -0.03em;
        }

        .summary-header button {
          border: none;
          background: transparent;
          padding: 0;
          border-radius: 0;
        }

        .wizard-footer {
          border-radius: 22px;
          background: rgba(255,255,255,0.88);
          border: 1px solid rgba(232,224,216,0.92);
          box-shadow: 0 14px 30px rgba(74,55,40,0.06);
          padding: 18px 24px;
        }

        .footer-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .mobile-summary-bar,
        .mobile-summary-drawer {
          display: none;
        }

        .reserva-page.success-mode {
          padding: 96px 22px 72px;
          background:
            radial-gradient(ellipse at 50% 0%, rgba(197,160,89,0.18) 0%, transparent 52%),
            radial-gradient(ellipse at 90% 100%, rgba(197,160,89,0.08) 0%, transparent 38%),
            linear-gradient(180deg, #2c1f14 0%, #1a1108 100%);
          position: relative;
          overflow: hidden;
        }

        .reserva-page.success-mode .reserva-shell {
          max-width: 1060px;
          position: relative;
          z-index: 1;
        }

        .reserva-page.success-mode::before,
        .reserva-page.success-mode::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 280px;
          pointer-events: none;
          opacity: 0.95;
          z-index: 0;
        }

        .reserva-page.success-mode::before {
          left: 0;
          background:
            linear-gradient(182deg, transparent 0%, rgba(197,160,89,0.24) 18%, rgba(197,160,89,0.2) 48%, rgba(197,160,89,0.26) 100%),
            radial-gradient(ellipse 22px 102px at 34px 74px, rgba(197,160,89,0.42) 0%, rgba(197,160,89,0.36) 52%, transparent 57%),
            radial-gradient(ellipse 18px 86px at 108px 204px, rgba(197,160,89,0.28) 0%, rgba(197,160,89,0.22) 52%, transparent 57%),
            radial-gradient(ellipse 24px 114px at 38px 388px, rgba(197,160,89,0.4) 0%, rgba(197,160,89,0.34) 52%, transparent 57%),
            radial-gradient(ellipse 18px 90px at 126px 586px, rgba(197,160,89,0.26) 0%, rgba(197,160,89,0.2) 52%, transparent 57%),
            radial-gradient(ellipse 24px 116px at 46px 804px, rgba(197,160,89,0.38) 0%, rgba(197,160,89,0.32) 52%, transparent 57%),
            radial-gradient(ellipse 18px 88px at 116px 1022px, rgba(197,160,89,0.28) 0%, rgba(197,160,89,0.22) 52%, transparent 57%),
            radial-gradient(ellipse 24px 114px at 34px 1238px, rgba(197,160,89,0.4) 0%, rgba(197,160,89,0.34) 52%, transparent 57%);
          background-repeat: no-repeat;
          background-size:
            2px 100%,
            150px 220px,
            144px 194px,
            160px 242px,
            146px 206px,
            164px 246px,
            148px 202px,
            160px 240px;
          background-position:
            76px 0,
            -14px 8px,
            10px 144px,
            -18px 302px,
            16px 518px,
            -8px 720px,
            10px 960px,
            -20px 1164px;
        }

        .reserva-page.success-mode::after {
          right: 0;
          background:
            linear-gradient(178deg, transparent 0%, rgba(197,160,89,0.12) 28%, rgba(197,160,89,0.18) 100%),
            radial-gradient(ellipse 22px 100px at 232px 120px, rgba(197,160,89,0.24) 0%, rgba(197,160,89,0.18) 52%, transparent 57%),
            radial-gradient(ellipse 16px 82px at 168px 318px, rgba(197,160,89,0.16) 0%, rgba(197,160,89,0.12) 52%, transparent 57%),
            radial-gradient(ellipse 22px 104px at 226px 546px, rgba(197,160,89,0.2) 0%, rgba(197,160,89,0.15) 52%, transparent 57%),
            radial-gradient(ellipse 16px 80px at 156px 782px, rgba(197,160,89,0.14) 0%, rgba(197,160,89,0.1) 52%, transparent 57%);
          background-repeat: no-repeat;
          background-size:
            2px 100%,
            150px 216px,
            136px 188px,
            150px 220px,
            134px 186px;
          background-position:
            204px 0,
            118px 48px,
            62px 262px,
            108px 488px,
            54px 724px;
        }

        .success-screen {
          padding: 0;
          border-radius: 0;
          background: transparent;
          color: var(--color-tertiary);
          box-shadow: none;
          position: relative;
          overflow: visible;
          max-width: 1028px;
          margin: 0 auto;
          z-index: 1;
        }

        .success-screen::before {
          content: none;
        }

        .success-screen h1,
        .success-screen p {
          color: var(--color-tertiary);
          margin-left: auto;
          margin-right: auto;
        }

        .success-hero {
          text-align: center;
          margin-bottom: 34px;
        }

        .success-icon-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }

        .success-icon {
          position: relative;
          width: 88px;
          height: 88px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f7e3b5;
          background: radial-gradient(circle, rgba(197,160,89,0.18) 0%, rgba(255,255,255,0.05) 68%, transparent 100%);
          border: 1.5px solid rgba(197,160,89,0.36);
          box-shadow: 0 0 0 14px rgba(255,255,255,0.03);
        }

        .success-icon::before {
          content: '';
          position: absolute;
          inset: 8px;
          border-radius: 9999px;
          border: 1px dashed rgba(197,160,89,0.2);
        }

        .success-icon svg:last-child {
          position: absolute;
          right: 20px;
          bottom: 16px;
          color: white;
        }

        .success-eyebrow-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          margin-bottom: 16px;
        }

        .success-eyebrow-row .line {
          width: 52px;
          height: 1px;
          background: rgba(197,160,89,0.36);
        }

        .success-eyebrow {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--color-secondary);
        }

        .success-screen h1 {
          margin: 0 0 12px;
          font-size: clamp(3.2rem, 5.2vw, 5.4rem);
          line-height: 0.98;
          letter-spacing: -0.03em;
        }

        .success-screen h1 em {
          font-style: italic;
          color: var(--color-secondary);
          font-weight: 500;
        }

        .success-screen p {
          max-width: 540px;
          font-size: 16px;
          line-height: 1.65;
          color: rgba(249,245,240,0.76);
        }

        .success-screen p strong {
          color: rgba(249,245,240,0.95);
          font-weight: 700;
        }

        .success-main-card {
          display: grid;
          grid-template-columns: minmax(0, 1.02fr) 1px minmax(320px, 0.9fr);
          gap: 0;
          margin-bottom: 20px;
          padding: 30px 34px;
          border-radius: 24px;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(197,160,89,0.2);
          backdrop-filter: blur(6px);
          position: relative;
        }

        .success-main-left {
          padding-right: 30px;
        }

        .success-main-divider {
          background: rgba(197,160,89,0.16);
        }

        .success-main-right {
          padding-left: 30px;
        }

        .success-date-big {
          font-family: var(--font-heading);
          font-size: clamp(2rem, 3vw, 3.25rem);
          line-height: 1.02;
          color: #fff;
          margin-bottom: 8px;
        }

        .success-date-big em {
          font-style: italic;
          color: var(--color-secondary);
          font-weight: 500;
        }

        .success-date-sub {
          margin-bottom: 20px;
          font-family: var(--font-body);
          font-size: 14px;
          color: rgba(249,245,240,0.54);
          letter-spacing: 0.04em;
        }

        .success-detail-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-top: 1px solid rgba(255,255,255,0.06);
          font-family: var(--font-body);
        }

        .success-detail-row .ic {
          color: var(--color-secondary);
          display: inline-flex;
          flex-shrink: 0;
        }

        .success-detail-row .lab {
          width: 72px;
          flex-shrink: 0;
          color: rgba(249,245,240,0.42);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 700;
        }

        .success-detail-row .v {
          color: #fff;
          font-size: 14px;
          font-weight: 600;
        }

        .success-timeline-title {
          margin-bottom: 22px;
          font-family: var(--font-heading);
          font-style: italic;
          font-size: 19px;
          color: var(--color-secondary);
        }

        .success-timeline {
          position: relative;
          padding-left: 52px;
        }

        .success-timeline::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 24px;
          bottom: 24px;
          width: 2px;
          background: linear-gradient(180deg, var(--color-secondary) 0%, var(--color-secondary) 32%, rgba(197,160,89,0.24) 32%, rgba(197,160,89,0.24) 100%);
          border-radius: 999px;
        }

        .success-timeline-step {
          position: relative;
          padding-bottom: 30px;
        }

        .success-timeline-step:last-child {
          padding-bottom: 0;
        }

        .success-timeline-step::before {
          content: '';
          position: absolute;
          left: -37px;
          top: 2px;
          width: 24px;
          height: 24px;
          border-radius: 999px;
          background: var(--color-secondary);
          box-shadow: 0 0 0 5px rgba(197,160,89,0.16);
        }

        .success-timeline-step:first-child::after {
          content: '1';
          position: absolute;
          left: -37px;
          top: 2px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 800;
        }

        .success-timeline-step:nth-child(2)::after,
        .success-timeline-step:nth-child(3)::after {
          position: absolute;
          left: -37px;
          top: 2px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 800;
          color: rgba(197,160,89,0.55);
        }

        .success-timeline-step:nth-child(2)::after {
          content: '2';
        }

        .success-timeline-step:nth-child(3)::after {
          content: '3';
        }

        .success-timeline-step.pending::before {
          background: rgba(197,160,89,0.06);
          border: 2px solid rgba(197,160,89,0.4);
          box-shadow: none;
        }

        .success-step-title {
          margin-bottom: 4px;
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 700;
          color: #fff;
        }

        .success-timeline-step.pending .success-step-title {
          color: rgba(249,245,240,0.74);
          font-weight: 600;
        }

        .success-step-copy {
          font-family: var(--font-body);
          font-size: 12.5px;
          line-height: 1.6;
          color: rgba(249,245,240,0.52);
        }

        .success-step-pill {
          display: inline-flex;
          align-items: center;
          margin-top: 9px;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(197,160,89,0.12);
          border: 1px solid rgba(197,160,89,0.28);
          color: var(--color-secondary);
          font-family: var(--font-body);
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .success-timeline-step.pending .success-step-pill {
          background: rgba(197,160,89,0.06);
          border-color: rgba(197,160,89,0.16);
          color: rgba(197,160,89,0.66);
        }

        .success-quick-actions {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 38px;
        }

        .success-quick-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 18px 14px;
          border-radius: 18px;
          text-align: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(197,160,89,0.16);
          color: var(--color-tertiary);
        }

        .success-quick-card svg {
          color: var(--color-secondary);
        }

        .success-quick-card strong {
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 700;
          color: #fff;
        }

        .success-quick-card span {
          font-family: var(--font-body);
          font-size: 12px;
          color: rgba(249,245,240,0.5);
        }

        .success-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding-top: 22px;
          border-top: 1px solid rgba(197,160,89,0.16);
        }

        .success-link-btn {
          border: none;
          background: none;
          padding: 0;
          color: rgba(249,245,240,0.62);
          font-family: var(--font-body);
          font-size: 13px;
          text-decoration: underline;
          text-underline-offset: 4px;
          cursor: pointer;
        }

        .success-primary-btn {
          border: none;
          border-radius: 999px;
          padding: 16px 30px;
          background: linear-gradient(180deg, #d4ac62 0%, #c69b4f 100%);
          color: var(--color-primary);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 32px -8px rgba(197,160,89,0.5);
          cursor: pointer;
        }

        @keyframes wizardPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }

        @keyframes wizardSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes wizardHintFloat {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(4px); }
        }

        @media (max-width: 1280px) {
          .content-shell {
            grid-template-columns: minmax(0, 1fr);
          }

          .summary-column {
            display: none;
          }

          .mobile-summary-bar,
          .mobile-summary-drawer {
            display: block;
          }

          .summary-card {
            height: auto;
            max-height: none;
            overflow: visible;
          }

          .mobile-summary-bar {
            position: fixed;
            left: 14px;
            right: 14px;
            bottom: 14px;
            z-index: 40;
            border: none;
            border-radius: 18px;
            background: var(--color-primary);
            color: var(--color-tertiary);
            padding: 16px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            font-family: var(--font-body);
            font-weight: 700;
            box-shadow: 0 18px 38px rgba(44,31,20,0.25);
          }

          .mobile-summary-drawer {
            position: fixed;
            inset: 0;
            z-index: 60;
            pointer-events: none;
          }

          .mobile-summary-drawer.open {
            pointer-events: auto;
          }

          .mobile-summary-backdrop {
            position: absolute;
            inset: 0;
            border: none;
            background: rgba(44,31,20,0.42);
            opacity: 0;
            transition: opacity 180ms ease;
          }

          .mobile-summary-drawer.open .mobile-summary-backdrop {
            opacity: 1;
          }

          .mobile-summary-sheet {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            padding: 0 14px 14px;
            transform: translateY(100%);
            transition: transform 220ms ease;
          }

          .mobile-summary-drawer.open .mobile-summary-sheet {
            transform: translateY(0);
          }

          .drawer-handle {
            width: 54px;
            height: 5px;
            border-radius: 9999px;
            background: rgba(255,255,255,0.7);
            margin: 0 auto 12px;
          }
        }

        @media (max-width: 900px) {
          .reserva-page {
            padding-top: 140px;
          }

          .reserva-page.success-mode {
            padding: 84px 18px 56px;
          }

          .progress-shell {
            top: 110px;
          }

          .progress-card {
            padding: 18px 16px 14px;
          }

          .wizard-panel-header {
            padding: 28px 24px 10px;
          }

          .wizard-panel-body {
            padding: 10px 24px 28px;
          }

          .progress-line {
            left: 28px;
            right: 28px;
            top: 30px;
          }

          .progress-steps {
            grid-template-columns: repeat(6, minmax(0, 1fr));
          }

          .progress-text {
            font-size: 11px;
          }

          .salon-grid,
          .selection-layout,
          .guest-form-grid,
          .identity-grid {
            grid-template-columns: 1fr;
          }

          .content-column {
            gap: 16px;
          }

          .coupon-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .salon-card {
            min-height: auto;
            padding: 24px;
          }

          .salon-card-copy {
            max-width: 100%;
          }

          .salon-card p {
            font-size: 15px;
          }

          .salon-card h3 {
            font-size: clamp(2rem, 7vw, 3.1rem);
          }

          .service-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .success-screen {
            padding: 0;
          }

          .success-main-card {
            grid-template-columns: 1fr;
            padding: 24px 20px;
          }

          .success-main-left {
            padding-right: 0;
            padding-bottom: 24px;
          }

          .success-main-divider {
            width: 100%;
            height: 1px;
          }

          .success-main-right {
            padding-left: 0;
            padding-top: 24px;
          }

          .success-quick-actions {
            grid-template-columns: 1fr;
          }

          .mobile-switcher {
            display: inline-flex;
            gap: 10px;
            margin-top: 24px;
            padding: 6px;
            border-radius: 18px;
            background: rgba(255,255,255,0.82);
            border: 1px solid rgba(232,224,216,0.95);
          }

          .mobile-switcher button {
            border: none;
            padding: 12px 16px;
            color: var(--color-text-secondary);
          }

          .mobile-hidden {
            display: none;
          }

          .footer-actions,
          .guest-login-invite,
          .success-footer {
            flex-direction: column;
          }

          .footer-actions > button,
          .guest-login-invite > button {
            width: 100%;
          }
        }

        @media (max-width: 767px) {
          .reserva-page {
            padding-top: 128px;
          }

          .reserva-page.success-mode {
            padding: 96px 14px 44px;
          }

          .progress-shell {
            top: 96px;
          }

          .progress-card {
            border-radius: 20px;
          }

          .progress-steps {
            gap: 8px;
          }

          .progress-text {
            display: none;
          }

          .progress-step .progress-text.active {
            display: block;
            position: absolute;
            bottom: -18px;
            font-size: 11px;
          }

          .wizard-panel,
          .success-screen {
            border-radius: 24px;
          }

          .success-screen h1 {
            font-size: clamp(2.6rem, 12vw, 4rem);
          }

          .success-eyebrow-row .line {
            width: 36px;
          }

          .success-date-big {
            font-size: 2rem;
          }

          .success-footer {
            align-items: stretch;
          }

          .success-primary-btn {
            width: 100%;
            justify-content: center;
          }

          .success-link-btn {
            text-align: center;
          }

          .wizard-panel-header {
            padding: 24px 20px 10px;
          }

          .wizard-panel-body {
            padding: 8px 20px 24px;
          }

          .service-grid {
            grid-template-columns: 1fr 1fr;
          }

          .coupon-card {
            min-height: 0;
          }

          .coupon-ticket-body {
            flex-direction: column;
            align-items: flex-start;
            padding: 14px 18px 14px 22px;
          }

          .coupon-apply-btn {
            width: 100%;
          }

          .schedule-picker {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .schedule-picker-left {
            border-bottom: 1px solid var(--color-neutral-light);
            padding: 0 0 18px;
          }

          .schedule-picker-right {
            padding: 0;
            min-height: unset;
            border-left: none;
          }

          .manual-coupon-row {
            grid-template-columns: 1fr;
          }
        }

        @media (min-width: 901px) {
          .wizard-panel-body {
            overflow: visible;
          }

          .summary-card {
            height: auto;
            max-height: none;
            overflow: visible;
          }
        }

        /* Success screen — direct replica baseline from HTML reference */
        .reserva-page.success-mode {
          padding: 0 0 80px;
          background:
            radial-gradient(ellipse at 50% 0%, rgba(197,160,89,0.18) 0%, transparent 55%),
            radial-gradient(ellipse at 90% 100%, rgba(197,160,89,0.08) 0%, transparent 40%),
            linear-gradient(180deg, #2c1f14 0%, #1a1108 100%);
          position: relative;
          overflow-x: hidden;
        }

        .reserva-page.success-mode .reserva-shell {
          max-width: none;
          width: 100%;
        }

        .reserva-page.success-mode::before,
        .reserva-page.success-mode::after {
          content: none;
        }

        .success-screen {
          position: relative;
          z-index: 1;
          max-width: 1060px;
          margin: 0 auto;
          padding: 64px 48px 80px;
          border: none;
          border-radius: 0;
          background: transparent;
          color: var(--color-tertiary);
          box-shadow: none;
          overflow: visible;
        }

        .success-botanical-bg {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .success-hero {
          position: relative;
          z-index: 1;
          text-align: center;
          margin-bottom: 44px;
        }

        .success-mark {
          width: 88px;
          height: 88px;
          margin: 0 auto 22px;
          border-radius: 50%;
          background: radial-gradient(circle at center, rgba(197,160,89,0.22) 0%, rgba(197,160,89,0.04) 65%, transparent 100%);
          border: 1.5px solid rgba(197,160,89,0.38);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          color: var(--color-secondary);
        }

        .success-mark::before {
          content: '';
          position: absolute;
          inset: 7px;
          border-radius: 50%;
          border: 1px dashed rgba(197,160,89,0.26);
        }

        .success-eyebrow-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-bottom: 14px;
        }

        .success-eyebrow-row .ln {
          width: 52px;
          height: 1px;
          background: rgba(197,160,89,0.38);
        }

        .success-eyebrow {
          font-size: 11px;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: var(--color-secondary);
          font-weight: 700;
        }

        .success-screen .success-title {
          margin: 0 0 14px;
          font-family: var(--font-heading);
          font-size: 62px;
          font-weight: 500;
          line-height: 1.02;
          letter-spacing: -0.02em;
          color: var(--color-tertiary);
        }

        .success-screen .success-title em {
          font-style: italic;
          color: var(--color-secondary);
        }

        .success-screen .success-subtitle {
          max-width: 460px;
          margin: 0 auto;
          color: rgba(249,245,240,0.68);
          font-size: 16px;
          line-height: 1.6;
        }

        .success-screen .success-subtitle strong {
          color: rgba(249,245,240,0.9);
          font-weight: 600;
        }

        .success-card {
          position: relative;
          z-index: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(197,160,89,0.2);
          border-radius: 22px;
          padding: 36px 40px;
          backdrop-filter: blur(6px);
          display: grid;
          grid-template-columns: 1.05fr 1px 1fr;
          gap: 0;
          margin-bottom: 22px;
        }

        .success-card-left {
          padding-right: 36px;
          display: flex;
          flex-direction: column;
        }

        .success-card-divider {
          background: rgba(197,160,89,0.16);
        }

        .success-card-right {
          padding-left: 36px;
        }

        .success-date-big {
          font-family: var(--font-heading);
          font-size: 30px;
          font-weight: 500;
          line-height: 1.1;
          color: #fff;
          margin-bottom: 4px;
        }

        .success-date-big em {
          font-style: italic;
          color: var(--color-secondary);
        }

        .success-date-sub {
          font-size: 13px;
          color: rgba(249,245,240,0.55);
          letter-spacing: 0.04em;
          margin-bottom: 24px;
        }

        .success-detail-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 0;
          font-size: 13.5px;
          color: rgba(249,245,240,0.85);
          border-top: 1px solid rgba(255,255,255,0.055);
        }

        .success-detail-ic {
          color: var(--color-secondary);
          display: inline-flex;
          flex-shrink: 0;
        }

        .success-detail-lab {
          color: rgba(249,245,240,0.42);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-weight: 700;
          width: 72px;
          flex-shrink: 0;
        }

        .success-detail-v {
          color: #fff;
          font-weight: 500;
        }

        .success-tl-title {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--color-secondary);
          margin-bottom: 26px;
        }

        .success-tl {
          display: flex;
          flex-direction: column;
        }

        .success-ts {
          display: flex;
          gap: 18px;
          position: relative;
        }

        .success-ts + .success-ts {
          margin-top: 2px;
        }

        .success-ts-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          width: 28px;
        }

        .success-ts:not(:last-child) .success-ts-left::after {
          content: '';
          width: 2px;
          flex: 1;
          min-height: 16px;
          margin-top: 4px;
          border-radius: 1px;
          background: rgba(197,160,89,0.22);
        }

        .success-ts:first-child .success-ts-left::after {
          background: linear-gradient(180deg, var(--color-secondary) 50%, rgba(197,160,89,0.22) 50%);
        }

        .success-ts-body {
          flex: 1;
          min-width: 0;
          padding-bottom: 28px;
        }

        .success-ts:last-child .success-ts-body {
          padding-bottom: 0;
        }

        .success-ts-dot {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--color-secondary);
          color: var(--color-primary);
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 0 5px rgba(197,160,89,0.18), 0 0 16px rgba(197,160,89,0.30);
          position: relative;
        }

        .success-ts-dot.pending {
          background: #1e1409;
          border: 2px solid rgba(197,160,89,0.42);
          color: rgba(197,160,89,0.55);
          box-shadow: none;
        }

        .success-ts-dot.active::after {
          content: '';
          position: absolute;
          inset: -7px;
          border-radius: 50%;
          border: 1.5px solid rgba(197,160,89,0.45);
          animation: ring-pulse 2.2s ease-out infinite;
          pointer-events: none;
        }

        .success-ts-t {
          font-size: 14.5px;
          color: #fff;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .success-ts.pending .success-ts-t {
          color: rgba(249,245,240,0.7);
          font-weight: 600;
        }

        .success-ts-d {
          font-size: 13px;
          color: rgba(249,245,240,0.52);
          line-height: 1.55;
        }

        .success-when {
          display: inline-flex;
          align-items: center;
          background: rgba(197,160,89,0.12);
          border: 1px solid rgba(197,160,89,0.28);
          border-radius: 999px;
          padding: 3px 11px;
          font-size: 10.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--color-secondary);
          font-weight: 700;
          margin-top: 8px;
        }

        .success-ts.pending .success-when {
          background: rgba(197,160,89,0.06);
          border-color: rgba(197,160,89,0.18);
          color: rgba(197,160,89,0.65);
        }

        .success-inline-actions-area {
          margin-top: auto;
          border-top: 1px solid rgba(197,160,89,0.2);
          padding: 30px 0 12px;
        }

        .success-mini-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .success-mini-action {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(197,160,89,0.2);
          border-radius: 12px;
          padding: 12px 14px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--color-tertiary);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .success-mini-action:hover {
          background: rgba(197,160,89,0.1);
          border-color: var(--color-secondary);
          transform: translateY(-1px);
        }

        .success-mini-action .ic {
          color: var(--color-secondary);
          display: inline-flex;
          flex-shrink: 0;
        }

        .success-mini-action .text {
          display: flex;
          flex-direction: column;
          min-width: 0;
          line-height: 1.2;
        }

        .success-mini-action .t {
          font-size: 12.5px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.02em;
        }

        .success-mini-action .d {
          font-size: 10.5px;
          color: rgba(249,245,240,0.5);
          margin-top: 2px;
        }

        .success-help {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(197,160,89,0.18);
          border-radius: 14px;
          padding: 14px 18px 14px 20px;
          margin-bottom: 36px;
          position: relative;
          z-index: 1;
        }

        .success-help-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .success-help-text .t {
          font-family: var(--font-heading);
          font-style: italic;
          font-size: 17px;
          color: #fff;
          line-height: 1.2;
        }

        .success-help-text .d {
          font-size: 12.5px;
          color: rgba(249,245,240,0.55);
          line-height: 1.4;
        }

        .success-help-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(197,160,89,0.1);
          border: 1px solid rgba(197,160,89,0.32);
          color: var(--color-secondary);
          padding: 10px 16px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .success-help-btn:hover {
          background: var(--color-secondary);
          color: var(--color-primary);
          border-color: var(--color-secondary);
        }

        .success-help-btn .ic {
          display: inline-flex;
        }

        .success-foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 28px;
          border-top: 1px solid rgba(197,160,89,0.15);
          position: relative;
          z-index: 1;
        }

        .success-btn-ghost {
          background: none;
          border: none;
          color: rgba(249,245,240,0.55);
          font-size: 13px;
          font-family: var(--font-body);
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 4px;
          padding: 0;
        }

        .success-btn-ghost:hover {
          color: var(--color-secondary);
        }

        .success-btn-primary {
          background: var(--color-secondary);
          color: var(--color-primary);
          padding: 16px 34px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 32px -8px rgba(197,160,89,0.5);
          transition: background 0.2s, transform 0.2s;
        }

        .success-btn-primary:hover {
          background: #d4b06b;
          transform: translateY(-1px);
        }

        .success-btn-primary .ar {
          font-family: var(--font-heading);
          font-size: 18px;
        }

        @keyframes ring-pulse {
          0%   { transform: scale(0.78); opacity: 0.9; }
          100% { transform: scale(1.48); opacity: 0; }
        }

        @media (max-width: 860px) {
          .success-screen {
            padding: 40px 22px 60px;
          }

          .success-screen .success-title {
            font-size: 42px;
          }

          .success-card {
            grid-template-columns: 1fr;
            padding: 28px 24px;
          }

          .success-card-left {
            padding-right: 0;
            padding-bottom: 28px;
          }

          .success-card-divider {
            width: 100%;
            height: 1px;
            margin: 0;
          }

          .success-card-right {
            padding-left: 0;
            padding-top: 28px;
          }

          .success-mini-actions {
            grid-template-columns: 1fr;
          }

          .success-help {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .success-help-btn {
            justify-content: center;
          }

          .success-foot {
            flex-direction: column-reverse;
            gap: 16px;
            align-items: stretch;
          }

          .success-btn-primary {
            width: 100%;
            justify-content: center;
          }

          .success-btn-ghost {
            text-align: center;
          }
        }

        @media (max-width: 860px) {
          .success-botanical-bg {
            display: none;
          }
        }
      `}</style>
    </>
  )
}
