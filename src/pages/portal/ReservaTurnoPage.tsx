import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flower2,
  Gift,
  MapPin,
  Scissors,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserRound,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

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
  id: string
  salonId: SalonOption['id']
  nombre: string
  icono: string
  descripcion: string
}

interface ComboOption {
  id: string
  nombre: string
  detalle: string
  precio: number
  duracionMin: number
  items: string[]
}

interface ZoneOption {
  id: string
  nombre: string
  precio: number
  duracionMin: number
  grupo: 'Mujeres' | 'Hombres' | 'General'
}

interface CouponOption {
  id: string
  codigo: string
  descripcion: string
  vence: string
  tipo: 'Porcentaje' | 'Monto'
  valor: number
}

interface TimeSlot {
  hora: string
  disponible: boolean
}

interface DayAvailability {
  id: string
  etiqueta: string
  fechaLarga: string
  slots: TimeSlot[]
}

interface GuestData {
  nombre: string
  apellido: string
  telefono: string
  email: string
  sexo: string
}

const STEP_LABELS = ['Tus datos', 'Servicio', 'Selección', 'Horario', 'Cupón', 'Confirmar', 'Éxito'] as const

const SALONES: SalonOption[] = [
  {
    id: 'salon1',
    nombre: 'Salón 1',
    titulo: 'Estética & bienestar',
    descripcion: 'Depilación Láser · Depilación Descartable · Masajes · Cejas & Pestañas · Facial',
    servicios: ['Depilación Láser', 'Depilación Descartable', 'Masajes', 'Cejas & Pestañas', 'Facial'],
  },
  {
    id: 'salon2',
    nombre: 'Salón 2',
    titulo: 'Peluquería',
    descripcion: 'Color · Corte · Brushing · Tratamientos · Peinados',
    servicios: ['Peluquería'],
  },
]

const SERVICIOS: ServiceOption[] = [
  { id: 'laser', salonId: 'salon1', nombre: 'Depilación Láser', icono: '✂', descripcion: 'Sesiones por zonas con descuento automático.' },
  { id: 'descartable', salonId: 'salon1', nombre: 'Depilación Descartable', icono: '🌿', descripcion: 'Opciones rápidas para mantenimiento.' },
  { id: 'masajes', salonId: 'salon1', nombre: 'Masajes', icono: '💆', descripcion: 'Rituales corporales y drenaje.' },
  { id: 'cejas', salonId: 'salon1', nombre: 'Cejas & Pestañas', icono: '👁', descripcion: 'Diseño, perfilado y lifting.' },
  { id: 'facial', salonId: 'salon1', nombre: 'Facial', icono: '✨', descripcion: 'Limpiezas y tratamientos glow.' },
  { id: 'peluqueria', salonId: 'salon2', nombre: 'Peluquería', icono: '💇', descripcion: 'Cortes, color y peinados.' },
]

const LASER_COMBOS: ComboOption[] = [
  {
    id: 'pack1',
    nombre: 'Pack 1',
    detalle: 'Axilas + Cavado completo + Media pierna + Tira de cola (opc.)',
    precio: 28500,
    duracionMin: 75,
    items: ['Axila', 'Cavado completo', 'Media pierna'],
  },
  {
    id: 'pack3',
    nombre: 'Pack 3',
    detalle: 'Axilas + Cavado completo + Tira de cola + Pierna completa',
    precio: 29900,
    duracionMin: 80,
    items: ['Axila', 'Cavado completo', 'Tira de cola', 'Pierna completa'],
  },
  {
    id: 'pack4',
    nombre: 'Pack 4',
    detalle: 'Rostro completo + Axilas + Pierna completa',
    precio: 28500,
    duracionMin: 70,
    items: ['Rostro completo', 'Axila', 'Pierna completa'],
  },
  {
    id: 'pack5',
    nombre: 'Pack 5',
    detalle: 'Axilas + Cavado completo + Tira de cola',
    precio: 20100,
    duracionMin: 55,
    items: ['Axila', 'Cavado completo', 'Tira de cola'],
  },
  {
    id: 'completo',
    nombre: 'Completo',
    detalle: 'Pack premium de zonas corporales',
    precio: 36000,
    duracionMin: 95,
    items: ['Axila', 'Cavado completo', 'Media pierna', 'Tira de cola', 'Brazo completo'],
  },
]

const LASER_ZONES: ZoneOption[] = [
  { id: 'axila', nombre: 'Axila', precio: 9300, duracionMin: 20, grupo: 'General' },
  { id: 'cavado-completo', nombre: 'Cavado completo', precio: 12400, duracionMin: 25, grupo: 'Mujeres' },
  { id: 'media-pierna', nombre: 'Media pierna', precio: 13300, duracionMin: 30, grupo: 'Mujeres' },
  { id: 'pierna-completa', nombre: 'Pierna completa', precio: 15800, duracionMin: 40, grupo: 'Mujeres' },
  { id: 'brazo-completo', nombre: 'Brazo completo', precio: 13400, duracionMin: 30, grupo: 'General' },
  { id: 'tira-cola', nombre: 'Tira de cola', precio: 6900, duracionMin: 15, grupo: 'Mujeres' },
  { id: 'rostro-completo', nombre: 'Rostro completo', precio: 10800, duracionMin: 25, grupo: 'General' },
  { id: 'espalda', nombre: 'Espalda', precio: 14900, duracionMin: 35, grupo: 'Hombres' },
  { id: 'abdomen', nombre: 'Abdomen', precio: 9800, duracionMin: 20, grupo: 'Hombres' },
  { id: 'hombros', nombre: 'Hombros', precio: 9200, duracionMin: 20, grupo: 'Hombres' },
]

const COUPONS_AUTH: CouponOption[] = [
  {
    id: 'bienvenida10',
    codigo: 'BIENVENIDA10',
    descripcion: '10% de descuento para todos los servicios',
    vence: '31/05/2026',
    tipo: 'Porcentaje',
    valor: 10,
  },
  {
    id: 'laser20',
    codigo: 'LASER20',
    descripcion: '20% en Depilación Láser',
    vence: '15/06/2026',
    tipo: 'Porcentaje',
    valor: 20,
  },
]

const AVAILABILITY: DayAvailability[] = [
  {
    id: 'lun19',
    etiqueta: 'Lun 19',
    fechaLarga: 'Lunes 19 de mayo',
    slots: [
      { hora: '09:00', disponible: true },
      { hora: '09:30', disponible: true },
      { hora: '10:00', disponible: false },
      { hora: '10:30', disponible: true },
      { hora: '11:00', disponible: true },
      { hora: '11:30', disponible: false },
      { hora: '12:00', disponible: true },
      { hora: '12:30', disponible: true },
    ],
  },
  {
    id: 'mar20',
    etiqueta: 'Mar 20',
    fechaLarga: 'Martes 20 de mayo',
    slots: [
      { hora: '09:00', disponible: true },
      { hora: '09:30', disponible: false },
      { hora: '10:00', disponible: true },
      { hora: '10:30', disponible: true },
      { hora: '11:00', disponible: false },
      { hora: '11:30', disponible: true },
      { hora: '12:00', disponible: true },
      { hora: '12:30', disponible: false },
    ],
  },
  {
    id: 'mie21',
    etiqueta: 'Mié 21',
    fechaLarga: 'Miércoles 21 de mayo',
    slots: [
      { hora: '09:00', disponible: false },
      { hora: '09:30', disponible: false },
      { hora: '10:00', disponible: false },
      { hora: '10:30', disponible: true },
      { hora: '11:00', disponible: true },
      { hora: '11:30', disponible: true },
      { hora: '12:00', disponible: false },
      { hora: '12:30', disponible: true },
    ],
  },
  {
    id: 'jue22',
    etiqueta: 'Jue 22',
    fechaLarga: 'Jueves 22 de mayo',
    slots: [
      { hora: '09:00', disponible: true },
      { hora: '09:30', disponible: true },
      { hora: '10:00', disponible: false },
      { hora: '10:30', disponible: true },
      { hora: '11:00', disponible: true },
      { hora: '11:30', disponible: true },
      { hora: '12:00', disponible: true },
      { hora: '12:30', disponible: false },
    ],
  },
  {
    id: 'vie23',
    etiqueta: 'Vie 23',
    fechaLarga: 'Viernes 23 de mayo',
    slots: [
      { hora: '09:00', disponible: true },
      { hora: '09:30', disponible: true },
      { hora: '10:00', disponible: true },
      { hora: '10:30', disponible: false },
      { hora: '11:00', disponible: true },
      { hora: '11:30', disponible: true },
      { hora: '12:00', disponible: false },
      { hora: '12:30', disponible: true },
    ],
  },
  {
    id: 'sab24',
    etiqueta: 'Sáb 24',
    fechaLarga: 'Sábado 24 de mayo',
    slots: [
      { hora: '09:00', disponible: true },
      { hora: '09:30', disponible: false },
      { hora: '10:00', disponible: false },
      { hora: '10:30', disponible: true },
      { hora: '11:00', disponible: true },
      { hora: '11:30', disponible: true },
      { hora: '12:00', disponible: false },
      { hora: '12:30', disponible: false },
    ],
  },
]

const DEFAULT_GUEST: GuestData = {
  nombre: 'Sofía',
  apellido: 'Gómez',
  telefono: '3492 55-4411',
  email: '',
  sexo: '',
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

export default function ReservaTurnoPage() {
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)
  const [step, setStep] = useState<WizardStep>(0)
  const [selectedSalon, setSelectedSalon] = useState<SelectedSalonId>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [selectedComboId, setSelectedComboId] = useState<string | null>(null)
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([])
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(usuario ? 'laser20' : null)
  const [couponCode, setCouponCode] = useState(usuario ? '' : 'LASER20')
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [selectionMode, setSelectionMode] = useState<'combos' | 'zonas'>('zonas')
  const [guestData, setGuestData] = useState<GuestData>(DEFAULT_GUEST)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  useEffect(() => {
    if (selectedSex === 'Masculino' && selectedSalon === 'salon2') {
      setSelectedSalon(null)
      setSelectedServiceId(null)
      setSelectedComboId(null)
      setSelectedZoneIds([])
    }
  }, [selectedSex, selectedSalon])

  const filteredSalones = SALONES.filter((salon) => !(selectedSex === 'Masculino' && salon.id === 'salon2'))
  const availableServices = selectedSalon
    ? SERVICIOS.filter((service) => service.salonId === selectedSalon)
    : []
  const selectedService = SERVICIOS.find((service) => service.id === selectedServiceId) ?? SERVICIOS[0]
  const selectedCombo = LASER_COMBOS.find((combo) => combo.id === selectedComboId) ?? null
  const selectedZones = LASER_ZONES.filter((zone) => selectedZoneIds.includes(zone.id))
  const selectedDay = AVAILABILITY.find((day) => day.id === selectedDayId) ?? AVAILABILITY[1]
  const selectedCoupon = COUPONS_AUTH.find((coupon) => coupon.id === selectedCouponId) ?? null
  const manualCouponApplied = !selectedCoupon && couponCode.trim().toUpperCase() === 'LASER20'

  const subtotal = selectedCombo
    ? selectedCombo.precio
    : selectedZones.reduce((acc, zone) => acc + zone.precio, 0)

  const estimatedDuration = selectedCombo
    ? selectedCombo.duracionMin
    : selectedZones.reduce((acc, zone) => acc + zone.duracionMin, 0)

  const automaticDiscountPct = !selectedCombo && selectedZones.length >= 3 ? 15 : 0
  const automaticDiscountValue = Math.round((subtotal * automaticDiscountPct) / 100)
  const couponDiscountPct = selectedCoupon?.valor ?? (manualCouponApplied ? 20 : 0)
  const couponDiscountValue = Math.round(((subtotal - automaticDiscountValue) * couponDiscountPct) / 100)
  const total = Math.max(subtotal - automaticDiscountValue - couponDiscountValue, 0)
  const summaryItems = selectedCombo
    ? selectedCombo.items
    : selectedZones.map((zone) => zone.nombre)

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
      setIsSubmitting(true)
      window.setTimeout(() => {
        setIsSubmitting(false)
        setStep(6)
      }, 900)
      return
    }

    setStep((current) => Math.min(current + 1, 6) as WizardStep)
  }

  function goBack() {
    if (step === 6) {
      setStep(5)
      return
    }

    resetSelectionsFromStep(step)
    setStep((current) => Math.max(current - 1, 0) as WizardStep)
  }

  function handleServiceSelect(serviceId: string) {
    setSelectedServiceId(serviceId)
    setSelectedComboId(null)
    setSelectedZoneIds([])
    setSelectedDayId(null)
    setSelectedTime(null)
  }

  function toggleZone(zoneId: string) {
    if (selectedComboId) return
    setSelectedZoneIds((current) =>
      current.includes(zoneId) ? current.filter((id) => id !== zoneId) : [...current, zoneId],
    )
  }

  function selectCombo(comboId: string) {
    setSelectedComboId((current) => {
      const nextValue = current === comboId ? null : comboId
      if (nextValue) {
        setSelectedZoneIds([])
      }
      return nextValue
    })
  }

  function handleCouponApply(code: string) {
    const normalized = code.trim().toUpperCase()
    if (normalized === 'BIENVENIDA10') {
      setSelectedCouponId('bienvenida10')
      return
    }
    if (normalized === 'LASER20') {
      setSelectedCouponId('laser20')
      return
    }
    setSelectedCouponId(null)
  }

  function updateGuestField(field: keyof GuestData, value: string) {
    setGuestData((current) => ({ ...current, [field]: value }))
  }

  function renderStepContent() {
    if (step === 0) {
      return (
        <section className="wizard-panel wizard-animate">
          <span className="wizard-kicker">Paso 1</span>
          <h1 className="wizard-title">Contanos sobre vos</h1>
          <p className="wizard-subtitle">
            Necesitamos tus datos y tu sexo para mostrarte solo los servicios que realmente se pueden reservar.
          </p>

          <div className="guest-form-card first-step-card">
            <div className="identity-header">
              <div>
                <span className="section-label">{usuario ? 'Datos de tu cuenta' : 'Datos para la reserva'}</span>
                <h2>{usuario ? 'Revisá y completá tu información' : 'Primero tus datos, después tu turno'}</h2>
              </div>
              {usuario ? <span className="identity-badge">Cliente registrado</span> : null}
            </div>

            <div className="guest-form-grid">
              <Input label="Nombre" value={guestData.nombre} onChange={(event) => updateGuestField('nombre', event.target.value)} />
              <Input label="Apellido" value={guestData.apellido} onChange={(event) => updateGuestField('apellido', event.target.value)} />
              <Input label="Teléfono" value={guestData.telefono} onChange={(event) => updateGuestField('telefono', event.target.value)} />
              <Input
                label="Email opcional"
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
        </section>
      )
    }

    if (step === 1) {
      return (
        <section className="wizard-panel wizard-animate">
          <span className="wizard-kicker">Paso 2</span>
          <h1 className="wizard-title">¿Qué servicio buscás?</h1>
          <p className="wizard-subtitle">
            Empezá por elegir el salón y después el tipo de experiencia que querés reservar.
          </p>

          <div className="salon-grid">
            {filteredSalones.map((salon) => (
              <button
                key={salon.id}
                type="button"
                onClick={() => {
                  setSelectedSalon(salon.id)
                  setSelectedServiceId(null)
                  setSelectedComboId(null)
                  setSelectedZoneIds([])
                  setSelectedDayId(null)
                  setSelectedTime(null)
                }}
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

          <div className="service-section">
            <div className="section-heading">
              <div>
                <span className="section-label">Servicios disponibles</span>
                <h2>
                  {!selectedSalon
                    ? 'Elegí primero un salón'
                    : selectedSalon === 'salon1'
                      ? 'Elegí tu ritual'
                      : 'Elegí tu cambio de look'}
                </h2>
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
                  {selectedServiceId === service.id ? (
                    <span className="service-selected-badge">
                      <Check size={16} />
                    </span>
                  ) : null}
                  <span className="service-emoji">{service.icono}</span>
                  <h3>{service.nombre}</h3>
                  <p>{service.descripcion}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )
    }

    if (step === 2) {
      const visibleCombos = selectedSex === 'Femenino' ? LASER_COMBOS : []
      const groupedZones = [
        selectedSex === 'Femenino'
          ? { title: 'Zonas Mujeres', items: LASER_ZONES.filter((zone) => zone.grupo === 'Mujeres') }
          : null,
        selectedSex === 'Masculino'
          ? { title: 'Zonas Hombres', items: LASER_ZONES.filter((zone) => zone.grupo === 'Hombres') }
          : null,
        { title: 'General', items: LASER_ZONES.filter((zone) => zone.grupo === 'General') },
      ].filter(Boolean) as Array<{ title: string; items: ZoneOption[] }>

      return (
        <section className="wizard-panel wizard-animate">
          <span className="wizard-kicker">Paso 3</span>
          <h1 className="wizard-title">Seleccioná tus zonas</h1>
          <p className="wizard-subtitle">Elegí un combo o armá la sesión con las zonas que quieras.</p>

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
                        <div className="combo-meta">
                          <span>{formatCurrency(combo.precio)}</span>
                          <small>~{combo.duracionMin} min</small>
                        </div>
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
                  <span className="section-label">Zonas individuales</span>
                  <h2>Armá tu sesión</h2>
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
                  {groupedZones.map((group) => (
                    <div key={group.title}>
                      <div className="zone-group-divider">── {group.title} ──</div>
                      {group.items.map((zone) => {
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
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )
    }

    if (step === 3) {
      const rows = Array.from({ length: 8 }, (_, index) => `${9 + Math.floor(index / 2)}:${index % 2 === 0 ? '00' : '30'}`)

      return (
        <section className="wizard-panel wizard-animate">
          <span className="wizard-kicker">Paso 4</span>
          <h1 className="wizard-title">Elegí fecha y horario</h1>
          <p className="wizard-subtitle">
            Simulamos disponibilidad en bloques de 30 minutos para que el solapamiento sea más eficiente.
          </p>

          <div className="week-nav">
            <button type="button">
              <ChevronLeft size={18} />
              Semana anterior
            </button>
            <strong>19 - 24 de mayo 2026</strong>
            <button type="button">
              Semana siguiente
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="desktop-schedule">
            <div className="day-card-row">
              {AVAILABILITY.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  className={`day-card ${selectedDayId === day.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedDayId(day.id)
                    setSelectedTime(null)
                  }}
                >
                  <span>{day.etiqueta}</span>
                  <strong>{day.fechaLarga.replace(' de mayo', '')}</strong>
                </button>
              ))}
            </div>

            <div className="selected-day-panel">
              <div className="selected-day-copy">
                <span className="section-label">Disponibilidad</span>
                <h2>{selectedDayId ? selectedDay.fechaLarga : 'Elegí un día para ver horarios'}</h2>
              </div>

              <div className="slot-grid">
                {(selectedDayId ? selectedDay.slots : rows.map((hora) => ({ hora, disponible: false }))).map((slot) => (
                  <button
                    key={slot.hora}
                    type="button"
                    className={`slot-chip ${slot.disponible ? 'available' : 'disabled'} ${selectedTime === slot.hora ? 'selected' : ''}`}
                    disabled={!selectedDayId || !slot.disponible}
                    onClick={() => setSelectedTime(slot.hora)}
                  >
                    {slot.disponible ? slot.hora : '—'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mobile-schedule">
            <div className="mobile-day-tabs">
              {AVAILABILITY.slice(0, 3).map((day) => (
                <button
                  key={day.id}
                  type="button"
                  className={selectedDayId === day.id ? 'active' : ''}
                  onClick={() => {
                    setSelectedDayId(day.id)
                    setSelectedTime(null)
                  }}
                >
                  {day.etiqueta}
                </button>
              ))}
            </div>

            <div className="mobile-slot-list">
              {selectedDay.slots.map((slot) => (
                <button
                  key={`${selectedDay.id}-${slot.hora}`}
                  type="button"
                  className={`mobile-slot ${slot.disponible ? '' : 'disabled'} ${selectedTime === slot.hora ? 'selected' : ''}`}
                  disabled={!slot.disponible}
                  onClick={() => setSelectedTime(slot.hora)}
                >
                  <span>{slot.hora}</span>
                  <small>{slot.disponible ? 'Disponible' : 'No disponible'}</small>
                </button>
              ))}
            </div>
          </div>
        </section>
      )
    }

    if (step === 4) {
      return (
        <section className="wizard-panel wizard-animate">
          <span className="wizard-kicker">Paso 5</span>
          <h1 className="wizard-title">¿Tenés un cupón?</h1>
          <p className="wizard-subtitle">
            {usuario
              ? 'Podés aplicar uno de tus cupones guardados o ingresar otro código.'
              : 'Como invitada, podés ingresar un código promocional manualmente.'}
          </p>

          {usuario ? (
            <div className="coupon-section">
              <div className="section-heading">
                <div>
                  <span className="section-label">Tus cupones disponibles</span>
                  <h2>Elegí el que más te convenga</h2>
                </div>
              </div>

              <div className="coupon-grid">
                {COUPONS_AUTH.map((coupon) => {
                  const applied = selectedCouponId === coupon.id
                  return (
                    <article key={coupon.id} className={`coupon-card ${applied ? 'selected' : ''}`}>
                      <div className="coupon-top">
                        <span className="coupon-icon">🎟️</span>
                        <div>
                          <h3>{coupon.codigo}</h3>
                          <p>{coupon.descripcion}</p>
                        </div>
                      </div>
                      <div className="coupon-bottom">
                        <small>Vence: {coupon.vence}</small>
                        <button
                          type="button"
                          onClick={() => {
                            setCouponCode(coupon.codigo)
                            setSelectedCouponId(coupon.id)
                          }}
                        >
                          {applied ? '✓ Aplicado' : 'Aplicar'}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          ) : null}

          <div className="manual-coupon-card">
            <div>
              <span className="section-label">{usuario ? 'O ingresá un código' : 'Código promocional'}</span>
              <h2>{usuario ? '¿Tenés otro cupón?' : 'Si tenés un código, ingresalo acá'}</h2>
            </div>

            <div className="manual-coupon-row">
              <Input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Ej: LASER20" />
              <Button
                variant="secondary"
                onClick={() => handleCouponApply(couponCode)}
                leftIcon={<Ticket size={16} />}
              >
                Aplicar
              </Button>
            </div>

            <button type="button" className="skip-coupon-btn" onClick={() => setSelectedCouponId(null)}>
              Continuar sin cupón
            </button>
          </div>
        </section>
      )
    }

    if (step === 5) {
      return (
        <section className="wizard-panel wizard-animate">
          <span className="wizard-kicker">Paso 6</span>
          <h1 className="wizard-title">Confirmá tu turno</h1>
          <p className="wizard-subtitle">Revisá el detalle final antes de dejar la solicitud enviada.</p>

          <div className="confirmation-card">
            <h2>Resumen de tu reserva</h2>
            <div className="confirmation-list">
              <div><MapPin size={18} /> <span>{selectedSalon === 'salon1' ? 'Salón 1' : 'Salón 2'}</span></div>
              <div><Scissors size={18} /> <span>{selectedService.nombre}</span></div>
              <div><Sparkles size={18} /> <span>{summaryItems.join(' · ')}</span></div>
              <div><UserRound size={18} /> <span>Operaria: Te informaremos quién te atenderá al confirmar tu turno</span></div>
              <div><CalendarDays size={18} /> <span>{selectedDay.fechaLarga}, {selectedTime} hs</span></div>
              <div><Clock3 size={18} /> <span>~{estimatedDuration} minutos</span></div>
            </div>

            <div className="confirmation-total">
              <div><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
              {automaticDiscountValue > 0 ? (
                <div><span>Descuento {automaticDiscountPct}%</span><strong>-{formatCurrency(automaticDiscountValue)}</strong></div>
              ) : null}
              {couponDiscountValue > 0 ? (
                <div><span>Cupón {couponDiscountPct}%</span><strong>-{formatCurrency(couponDiscountValue)}</strong></div>
              ) : null}
              <div className="grand-total"><span>Total</span><strong>{formatCurrency(total)}</strong></div>
            </div>
          </div>

          <div className="policy-card">
            <BadgePercent size={18} />
            <p>Recordá que las cancelaciones con menos de 24 horas de anticipación tienen un cargo del 50% del servicio.</p>
          </div>
        </section>
      )
    }

    return (
      <section className="success-screen wizard-animate" style={botanicalPattern(0.18)}>
        <div className="success-icon-wrap">
          <div className="success-icon">
            <Flower2 size={34} />
            <Check size={24} />
          </div>
        </div>

        <h1>¡Turno solicitado!</h1>
        <p>
          Tu turno está pendiente de confirmación. Te avisaremos por WhatsApp cuando esté listo.
        </p>

        <div className="success-detail-card">
          <div><CalendarDays size={18} /> <span>{selectedDay.fechaLarga} a las {selectedTime} hs</span></div>
          <div><Scissors size={18} /> <span>{selectedService.nombre}</span></div>
          <div><UserRound size={18} /> <span>Operaria a confirmar, te avisamos por WhatsApp</span></div>
          <div><Clock3 size={18} /> <span>~{estimatedDuration} min · {formatCurrency(total)}</span></div>
        </div>

        <div className="success-actions">
          {usuario ? (
            <Button variant="outlined" size="lg" onClick={() => navigate('/mis-turnos')}>
              Ver mis turnos
            </Button>
          ) : (
            <Button variant="outlined" size="lg" onClick={() => navigate('/')}>
              Volver al inicio
            </Button>
          )}
          <Button variant="outlined" size="lg" onClick={() => setStep(0)}>
            Reservar otro turno
          </Button>
        </div>
      </section>
    )
  }

  return (
    <>
      <main className="reserva-page">
        <div className="reserva-shell">
          <div className="progress-shell">
            <div className="progress-card">
              <div className="progress-line">
                <span style={{ width: `${progressValue}%` }} />
              </div>
              <div className="progress-steps">
                {STEP_LABELS.slice(0, 6).map((label, index) => {
                  const completed = step > index
                  const active = step === index || (step === 6 && index === 5)
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

          <div className={`content-shell ${step <= 1 ? 'no-summary' : ''}`}>
            <div className={`content-column ${step === 6 ? 'full-width' : ''}`}>{renderStepContent()}</div>

            {step > 1 && step < 6 ? (
              <aside className="summary-column">
                <div className="summary-card">
                  <div className="summary-header">
                    <div>
                      <span className="section-label">Tu reserva</span>
                      <h2>Resumen vivo</h2>
                    </div>
                    <Gift size={18} />
                  </div>

                  <div className="summary-items">
                    {summaryItems.map((item) => (
                      <div key={item} className="summary-item">
                        <span>{item}</span>
                        <strong>{selectedCombo ? 'Incluido' : formatCurrency(LASER_ZONES.find((zone) => zone.nombre === item)?.precio ?? 0)}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="summary-divider" />

                  {automaticDiscountValue > 0 ? (
                    <div className="summary-line muted">
                      <span>Descuento {automaticDiscountPct}%</span>
                      <strong>-{formatCurrency(automaticDiscountValue)}</strong>
                    </div>
                  ) : null}

                  {couponDiscountValue > 0 ? (
                    <div className="summary-line muted">
                      <span>Cupón {couponDiscountPct}%</span>
                      <strong>-{formatCurrency(couponDiscountValue)}</strong>
                    </div>
                  ) : null}

                  <div className="summary-total">
                    <span>Total</span>
                    <strong>{formatCurrency(total)}</strong>
                  </div>

                  <div className="summary-meta">
                    <span>⏱ Duración estimada: ~{estimatedDuration} min</span>
                    <span>{summaryItems.length} selección{summaryItems.length === 1 ? '' : 'es'}</span>
                  </div>

                  <div className="summary-note">
                    <Sparkles size={15} />
                    <span>
                      {selectedCombo
                        ? 'Pack seleccionado. La sesión queda agrupada en una sola reserva.'
                        : automaticDiscountPct > 0
                          ? 'Descuento automático aplicado por cantidad de zonas.'
                          : 'El resumen se actualiza a medida que elegís.'}
                    </span>
                  </div>
                </div>
              </aside>
            ) : null}
          </div>

          {step < 6 ? (
            <div className="wizard-footer">
              <div className="footer-actions">
                <Button variant="ghost" size="lg" onClick={goBack} disabled={step === 0} leftIcon={<ArrowLeft size={16} />}>
                  Anterior
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

        {step > 1 && step < 6 ? (
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
                      <h2>Resumen</h2>
                    </div>
                    <button type="button" onClick={() => setSummaryOpen(false)}>Cerrar</button>
                  </div>

                  <div className="summary-items">
                    {summaryItems.map((item) => (
                      <div key={item} className="summary-item">
                        <span>{item}</span>
                        <strong>{selectedCombo ? 'Incluido' : formatCurrency(LASER_ZONES.find((zone) => zone.nombre === item)?.precio ?? 0)}</strong>
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
          position: sticky;
          top: 118px;
          z-index: 20;
          margin-bottom: 26px;
        }

        .progress-card {
          position: relative;
          overflow: hidden;
          padding: 24px 22px 18px;
          border-radius: 24px;
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(232,224,216,0.9);
          box-shadow: 0 12px 36px rgba(74,55,40,0.09);
          backdrop-filter: blur(12px);
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
          align-items: start;
        }

        .content-shell.no-summary {
          grid-template-columns: minmax(0, 1fr);
        }

        .content-column.full-width {
          grid-column: 1 / -1;
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
          padding: 34px;
        }

        .wizard-animate {
          animation: wizardSlideIn 320ms ease;
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
          margin-top: 32px;
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
          border-color: rgba(197,160,89,0.95);
          box-shadow: 0 24px 44px rgba(44,31,20,0.24);
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
          margin-top: 34px;
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
          padding: 28px 24px 24px;
          border-radius: 26px;
          background: linear-gradient(180deg, #fffefd 0%, #fffdfa 100%);
          border: 1px solid rgba(232,224,216,0.95);
          cursor: pointer;
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
          min-height: 270px;
          display: flex;
          flex-direction: column;
          align-items: center;
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

        .service-emoji {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 110px;
          height: 110px;
          border-radius: 9999px;
          background: rgba(245,239,230,0.92);
          font-size: 42px;
          box-shadow: inset 0 0 0 1px rgba(232,224,216,0.9);
          margin-top: 8px;
        }

        .service-card.selected .service-emoji {
          background: linear-gradient(180deg, #d4ac62 0%, #c69b4f 100%);
          color: white;
          box-shadow: 0 16px 28px rgba(197,160,89,0.22);
        }

        .service-card p,
        .combo-card p,
        .coupon-card p,
        .zone-card p,
        .summary-note span,
        .policy-card p,
        .success-detail-card span {
          margin: 0;
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.6;
          color: var(--color-text-secondary);
        }

        .service-card h3 {
          margin-top: 26px;
          font-family: var(--font-body);
          font-size: 20px;
          font-weight: 700;
          text-align: center;
          color: var(--color-text-primary);
        }

        .service-card p {
          margin-top: 14px;
          max-width: 240px;
          font-size: 15px;
          line-height: 1.7;
          text-align: center;
        }

        .selection-layout {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
          margin-top: 28px;
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
          top: 16px;
          right: 16px;
          width: 34px;
          height: 34px;
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
          gap: 18px;
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

        .combo-meta {
          text-align: right;
          min-width: fit-content;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          padding-right: 46px;
        }

        .combo-meta span,
        .summary-total strong,
        .grand-total strong,
        .confirmation-total strong {
          font-family: var(--font-body);
          font-size: 18px;
          font-weight: 800;
          color: var(--color-text-primary);
        }

        .combo-meta small,
        .summary-meta,
        .summary-line,
        .coupon-bottom small,
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
          margin-top: 18px;
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

        .zone-group-divider {
          margin: 28px 0 16px;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-text-muted);
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

        .week-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 28px;
          padding: 16px 20px;
          border-radius: 20px;
          background: rgba(255,255,255,0.72);
          border: 1px solid rgba(232,224,216,0.95);
        }

        .week-nav button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          background: transparent;
          color: var(--color-text-secondary);
          font-family: var(--font-body);
          font-weight: 700;
          cursor: pointer;
        }

        .week-nav strong {
          font-family: var(--font-heading);
          font-size: 24px;
          color: var(--color-text-primary);
        }

        .desktop-schedule {
          margin-top: 22px;
        }

        .day-card-row {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 12px;
        }

        .day-card {
          padding: 18px 14px;
          border-radius: 20px;
          background: rgba(255,255,255,0.82);
          border: 1px solid rgba(232,224,216,0.95);
          text-align: left;
          transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease, transform 180ms ease;
        }

        .day-card:hover {
          border-color: rgba(197,160,89,0.48);
          transform: translateY(-1px);
        }

        .day-card.selected {
          border-color: rgba(197,160,89,0.7);
          background: rgba(197,160,89,0.1);
          box-shadow: 0 10px 24px rgba(74,55,40,0.08);
        }

        .day-card span,
        .selected-day-copy h2 {
          font-family: var(--font-body);
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .day-card strong {
          display: block;
          margin-top: 8px;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-secondary);
        }

        .selected-day-panel {
          margin-top: 18px;
          padding: 24px;
          border-radius: 22px;
          background: rgba(255,255,255,0.72);
          border: 1px solid rgba(232,224,216,0.95);
        }

        .selected-day-copy h2 {
          margin: 10px 0 0;
          font-family: var(--font-heading);
          font-size: 30px;
          font-weight: 400;
        }

        .slot-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-top: 22px;
        }

        .slot-chip,
        .mobile-slot,
        .sex-options button,
        .mobile-day-tabs button,
        .mobile-switcher button {
          border-radius: 16px;
          border: 1px solid rgba(232,224,216,0.95);
          background: #fffdfb;
          font-family: var(--font-body);
          transition: all 180ms ease;
        }

        .slot-chip {
          min-height: 58px;
          padding: 0 8px;
          color: var(--color-text-secondary);
        }

        .slot-chip.available:hover,
        .mobile-slot:hover,
        .sex-options button:hover,
        .mobile-day-tabs button:hover,
        .mobile-switcher button:hover {
          border-color: rgba(197,160,89,0.65);
          background: rgba(197,160,89,0.08);
        }

        .slot-chip.disabled,
        .mobile-slot.disabled {
          color: var(--color-text-muted);
          background: rgba(232,224,216,0.52);
          cursor: not-allowed;
        }

        .slot-chip.selected,
        .mobile-slot.selected,
        .sex-options button.active,
        .mobile-day-tabs button.active,
        .mobile-switcher button.active {
          color: white;
          border-color: var(--color-secondary);
          background: linear-gradient(180deg, #d4ac62 0%, #bb8f43 100%);
          box-shadow: 0 10px 22px rgba(74,55,40,0.12);
        }

        .mobile-schedule,
        .mobile-switcher {
          display: none;
        }

        .coupon-grid {
          margin-top: 20px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .coupon-card {
          flex-direction: column;
        }

        .coupon-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          width: 100%;
        }

        .coupon-bottom button,
        .skip-coupon-btn,
        .identity-actions button,
        .summary-header button {
          border: none;
          background: transparent;
          color: var(--color-primary);
          font-family: var(--font-body);
          font-weight: 700;
          cursor: pointer;
        }

        .manual-coupon-card {
          margin-top: 24px;
          padding: 24px;
        }

        .first-step-card {
          margin-top: 28px;
        }

        .first-step-note {
          display: flex;
          align-items: start;
          gap: 10px;
          margin-top: 22px;
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
          margin-top: 18px;
        }

        .skip-coupon-btn {
          margin-top: 14px;
        }

        .identity-card,
        .guest-form-card,
        .confirmation-card {
          margin-top: 24px;
          padding: 28px;
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
          margin-top: 20px;
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
          margin-top: 18px;
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
          margin-top: 22px;
          padding-top: 20px;
          border-top: 1px solid rgba(232,224,216,0.95);
          display: grid;
          gap: 10px;
        }

        .confirmation-total div,
        .summary-line,
        .summary-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          font-family: var(--font-body);
          color: var(--color-text-secondary);
        }

        .grand-total span,
        .summary-total span {
          color: var(--color-text-primary);
          font-weight: 700;
        }

        .policy-card {
          margin-top: 20px;
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
          top: 198px;
        }

        .summary-card {
          padding: 24px;
        }

        .summary-items {
          margin-top: 22px;
        }

        .summary-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          font-family: var(--font-body);
          color: var(--color-text-primary);
        }

        .summary-item strong,
        .summary-meta {
          font-family: var(--font-body);
        }

        .summary-divider {
          height: 1px;
          margin: 18px 0;
          background: rgba(232,224,216,0.95);
        }

        .summary-meta {
          display: grid;
          gap: 8px;
          margin-top: 16px;
          font-size: 13px;
        }

        .summary-note {
          display: flex;
          align-items: start;
          gap: 10px;
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 16px;
          background: rgba(197,160,89,0.08);
          color: var(--color-primary);
        }

        .wizard-footer {
          margin-top: 22px;
        }

        .footer-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 20px 0 0;
        }

        .mobile-summary-bar,
        .mobile-summary-drawer {
          display: none;
        }

        .success-screen {
          padding: 56px 38px;
          border-radius: 32px;
          text-align: center;
          background:
            linear-gradient(180deg, rgba(74,55,40,0.98) 0%, rgba(45,31,22,0.99) 100%);
          color: var(--color-tertiary);
          box-shadow: 0 24px 54px rgba(44,31,20,0.22);
          position: relative;
          overflow: hidden;
        }

        .success-screen h1,
        .success-screen p {
          color: var(--color-tertiary);
          margin-left: auto;
          margin-right: auto;
        }

        .success-screen p {
          max-width: 560px;
          color: rgba(249,245,240,0.8);
        }

        .success-icon-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 26px;
        }

        .success-icon {
          position: relative;
          width: 94px;
          height: 94px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f7e3b5;
          background: radial-gradient(circle, rgba(197,160,89,0.22) 0%, rgba(255,255,255,0.06) 65%, transparent 100%);
          box-shadow: 0 0 0 18px rgba(255,255,255,0.03);
        }

        .success-icon svg:last-child {
          position: absolute;
          right: 20px;
          bottom: 16px;
          color: white;
        }

        .success-detail-card {
          max-width: 560px;
          margin: 30px auto 0;
          padding: 24px;
          border-radius: 24px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(10px);
        }

        .success-detail-card span {
          color: rgba(249,245,240,0.88);
        }

        .success-actions {
          display: flex;
          justify-content: center;
          gap: 14px;
          margin-top: 30px;
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

        @media (max-width: 1100px) {
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

          .progress-shell {
            top: 110px;
          }

          .progress-card {
            padding: 18px 16px 14px;
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
          .coupon-grid,
          .guest-form-grid,
          .identity-grid {
            grid-template-columns: 1fr;
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

          .desktop-schedule {
            display: none;
          }

          .mobile-schedule,
          .mobile-switcher {
            display: block;
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

          .mobile-day-tabs {
            display: flex;
            gap: 10px;
            margin-top: 22px;
          }

          .mobile-day-tabs button {
            flex: 1;
            padding: 12px;
            color: var(--color-text-secondary);
          }

          .mobile-slot-list {
            display: grid;
            gap: 12px;
            margin-top: 18px;
          }

          .mobile-slot {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 18px;
            color: var(--color-text-primary);
          }

          .footer-actions,
          .guest-login-invite,
          .success-actions {
            flex-direction: column;
          }

          .footer-actions > button,
          .success-actions > button,
          .guest-login-invite > button {
            width: 100%;
          }
        }

        @media (max-width: 767px) {
          .reserva-page {
            padding-top: 128px;
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
            padding: 26px 20px;
            border-radius: 24px;
          }

          .service-grid {
            grid-template-columns: 1fr 1fr;
          }

          .week-nav {
            flex-direction: column;
            align-items: stretch;
          }

          .week-nav strong {
            text-align: center;
          }

          .manual-coupon-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}
