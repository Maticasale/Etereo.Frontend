# Etereo Frontend — Source of Truth

> Documento técnico maestro del frontend. Refleja el diseño acordado del sistema de gestión de la estética Etereo.
> Última actualización: Mayo 2026 — v3: setup inicial completo — Vite, Tailwind v4, sistema de diseño, routing, componentes UI base, LoginPage funcional.

---

## 1. Stack tecnológico

| Capa | Herramienta | Notas |
|---|---|---|
| **Framework** | React 18 (TypeScript) | StrictMode activo |
| **Bundler** | Vite | Proxy `/api/*` → backend en dev |
| **Routing** | React Router v6 | Rutas protegidas por rol |
| **Data fetching** | TanStack Query v5 | `staleTime: 0`, `retry: 1`, `refetchOnWindowFocus: false` |
| **HTTP client** | Axios | Interceptores JWT + refresh automático |
| **Estado global** | Zustand | Solo auth (`authStore`) y toasts (`toastStore`) |
| **Formularios** | React Hook Form + Zod | `zodResolver` con `as any` (workaround Zod 4 + RHF 7) |
| **Estilos** | Tailwind CSS v4 | Variables CSS en `src/index.css`. Sin `tailwind.config.js`. Plugin `@tailwindcss/vite`. |
| **UI primitives** | Radix UI + estilo shadcn | Dialog, Tabs, Checkbox, Label son Radix; Card/Input/Button son CSS-only |
| **Calendario** | FullCalendar (React) | Para agenda de turnos |
| **Charts** | Recharts | KPIs, sparklines, gráficas de estadísticas |
| **Iconos** | lucide-react | |
| **Fechas** | date-fns + locale `es` | |
| **Google OAuth** | `@react-oauth/google` | Para el botón "Ingresar con Google" |
| **Build** | `tsc -b && vite build` | |

### Dependencias clave
```
react@18, react-router-dom@6, @tanstack/react-query@5,
zustand@5, axios, zod@4, react-hook-form@7,
@radix-ui/react-{dialog,tabs,checkbox,label,slot},
tailwindcss@4, lucide-react, recharts, date-fns,
@fullcalendar/react, @fullcalendar/daygrid, @fullcalendar/timegrid,
@react-oauth/google
```

### Variables de entorno

| Variable | Valor |
|---|---|
| `VITE_API_URL` | `https://etereobackend-production.up.railway.app` |
| `VITE_GOOGLE_CLIENT_ID` | En `.env.local` (no commitear) |

El proxy de Vite en dev mapea `/api/*` → `https://etereobackend-production.up.railway.app/api/*`.

---

## 1.5 Sistema de diseño

### Paleta de colores (variables CSS en `src/index.css`)

| Variable | Valor | Uso |
|---|---|---|
| `--color-primary` | `#4A3728` | Color principal, fondo sidebar, botones primarios |
| `--color-primary-hover` | `#3a2a1e` | Hover de primary |
| `--color-secondary` | `#C5A059` | Dorado, acentos, focus inputs, botones secondary |
| `--color-secondary-hover` | `#b08a42` | Hover de secondary |
| `--color-tertiary` | `#F9F5F0` | Fondo general de la app, crema |
| `--color-neutral` | `#8C7E6D` | Iconos, bordes medios |
| `--color-neutral-light` | `#E8E0D8` | Bordes inputs, separadores |
| `--color-text-primary` | `#2C1F14` | Texto principal |
| `--color-text-secondary` | `#6B5B4E` | Texto secundario, labels |
| `--color-text-muted` | `#A89880` | Placeholders, ayuda |
| `--color-error` | `#C0392B` | Errores |
| `--color-success` | `#27AE60` | Éxito |
| `--color-warning` | `#E67E22` | Advertencia |

### Tipografía

| Variable | Valor | Uso |
|---|---|---|
| `--font-heading` | `'Playfair Display', serif` | Títulos, logo |
| `--font-body` | `'Manrope', sans-serif` | Todo el resto |

**Logo "etereo"**: Playfair Display **italic bold**, color `--color-tertiary` sobre fondo primary, tamaño 28px en sidebar y 48px en login. **No existe una fuente separada para el logo.**

### Radios y sombras

| Variable | Valor |
|---|---|
| `--radius-sm` | `6px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `20px` |
| `--radius-full` | `9999px` |
| `--shadow-sm` | `0 1px 3px rgba(74,55,40,0.08)` |
| `--shadow-md` | `0 4px 16px rgba(74,55,40,0.12)` |
| `--shadow-lg` | `0 8px 32px rgba(74,55,40,0.16)` |

---

## 2. Estructura de carpetas

```
etereo-frontend/
├── public/
├── src/
│   ├── api/                        — Capa HTTP (1 archivo por módulo)
│   │   ├── client.ts               — Axios instance + interceptores JWT/refresh
│   │   ├── auth.ts
│   │   ├── usuarios.ts
│   │   ├── servicios.ts
│   │   ├── operarios.ts
│   │   ├── turnos.ts
│   │   ├── cupones.ts
│   │   ├── imputaciones.ts
│   │   ├── emails.ts
│   │   ├── calificaciones.ts
│   │   └── estadisticas.ts
│   │
│   ├── components/
│   │   ├── ui/                     — Primitivos shadcn-style (sin lógica de negocio)
│   │   │   ├── button.tsx, input.tsx, label.tsx, card.tsx
│   │   │   ├── badge.tsx, skeleton.tsx, dialog.tsx, tabs.tsx
│   │   │   ├── select.tsx, textarea.tsx, checkbox.tsx
│   │   │   ├── toast-container.tsx
│   │   │   └── sparkline.tsx       — Mini gráfico reutilizable para KPIs
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx       — Sidebar + Header + <Outlet />
│   │   │   ├── Sidebar.tsx         — Nav filtrado por rol y vistas habilitadas
│   │   │   └── Header.tsx          — Saludo + selector de período + avatar + logout
│   │   └── shared/
│   │       ├── RolGuard.tsx        — Renderiza según rol del usuario
│   │       ├── PageHeader.tsx
│   │       ├── DataTable.tsx       — Tabla genérica con loading/empty/paginación
│   │       ├── PeriodSelector.tsx  — Selector semana/mes/custom para KPIs
│   │       └── WhatsAppButton.tsx  — Genera link wa.me pre-armado
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useRol.ts               — isAdmin(), isOperario(), isCliente()
│   │   └── useToast.ts
│   │
│   ├── lib/
│   │   ├── utils.ts                — cn() (twMerge + clsx)
│   │   ├── errors.ts               — getErrorMessage() mapea códigos del backend
│   │   └── whatsapp.ts             — buildWhatsAppUrl(telefono, mensaje)
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.tsx       — Login + Registro + Google OAuth
│   │   ├── portal/                 — Vistas del cliente (público)
│   │   │   ├── ReservaTurnoPage.tsx  — Wizard de reserva
│   │   │   ├── MisTurnosPage.tsx
│   │   │   ├── MisCuponesPage.tsx
│   │   │   └── MiPerfilPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx   — KPIs + gráficas + alertas (Admin)
│   │   ├── agenda/
│   │   │   └── AgendaPage.tsx      — Calendario FullCalendar (Admin + Operario)
│   │   ├── turnos/
│   │   │   ├── TurnosPage.tsx      — Lista con filtros (Admin + Operario)
│   │   │   └── TurnoDetallePage.tsx
│   │   ├── servicios/
│   │   │   └── ServiciosPage.tsx   — CRUD servicios y subservicios (Admin)
│   │   ├── operarios/
│   │   │   ├── OperariosPage.tsx   — CRUD operarios (Admin)
│   │   │   └── OperarioDetallePage.tsx — Subservicios + comisiones + vistas
│   │   ├── clientes/
│   │   │   └── ClientesPage.tsx    — Búsqueda y alta manual (Admin + Operario)
│   │   ├── cupones/
│   │   │   └── CuponesPage.tsx     — CRUD cupones (Admin)
│   │   ├── imputaciones/
│   │   │   ├── ImputacionesPage.tsx
│   │   │   └── catalogos/
│   │   │       ├── CategoriasPage.tsx
│   │   │       ├── MetodosPagoPage.tsx
│   │   │       └── MotivosBloqueoPage.tsx
│   │   ├── estadisticas/
│   │   │   └── EstadisticasPage.tsx — Gráficas detalladas (Admin)
│   │   ├── comisiones/
│   │   │   ├── ComisionesPage.tsx   — Vista Admin: resumen a liquidar
│   │   │   └── MisComisionesPage.tsx — Vista Operario: sus propias comisiones
│   │   ├── calificaciones/
│   │   │   ├── CalificacionesPage.tsx  — Admin
│   │   │   └── CalificarPage.tsx       — Página pública (desde link del email)
│   │   ├── disponibilidad/
│   │   │   └── DisponibilidadPage.tsx  — Salón + operarias (Admin + Operario)
│   │   └── config/
│   │       └── ConfigEmailPage.tsx     — Admin
│   │
│   ├── store/
│   │   └── authStore.ts
│   │
│   ├── types/
│   │   └── api.ts                  — Todos los DTOs tipados
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                   — Tema oklch, fuentes, scrollbars
│
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Autenticación

### Flujo
1. Login → `POST /api/v1/auth/login` → `accessToken` (15min) + `refreshToken` (30d) + `UsuarioDto`
2. `authStore.setAuth()` guarda en **localStorage** y Zustand
3. Axios interceptor inyecta `Authorization: Bearer <accessToken>`
4. Si 401 → interceptor llama refresh → reintenta o redirige a `/login`
5. Al arrancar → `initializeAuth()` rehidrata desde localStorage

### Google OAuth
```typescript
// LoginPage.tsx
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'

<GoogleLogin
  onSuccess={(res) => authApi.googleLogin(res.credential)}
  onError={() => toast.error('Error al ingresar con Google')}
/>
```

### Cambio de contraseña forzado
Si `usuario.debeCambiarPassword = true` en el AuthResponse → el router redirige automáticamente a `/cambiar-password` antes de continuar a cualquier otra ruta.

### Autorización por rol
```typescript
// RolGuard.tsx
<RolGuard roles={['Admin']}>          // solo Admin
<RolGuard roles={['Admin', 'Operario']}> // cualquiera de los dos
```

El Sidebar filtra automáticamente los items del menú según el rol del usuario y, para Operarios, según las vistas habilitadas en `operario_vistas`.

---

## 4. Vistas

### Portal del cliente (público o registrado)

| Ruta | Componente | Acceso |
|---|---|---|
| `/` | `ReservaTurnoPage` | Público |
| `/mis-turnos` | `MisTurnosPage` | Cliente |
| `/mis-cupones` | `MisCuponesPage` | Cliente |
| `/mi-perfil` | `MiPerfilPage` | Cliente |
| `/calificar` | `CalificarPage` | Anónimo con token del email |

### Panel interno (Admin + Operario)

| Ruta | Componente | Acceso | Descripción |
|---|---|---|---|
| `/panel` | `DashboardPage` | Admin | KPIs + gráficas + alertas |
| `/panel/agenda` | `AgendaPage` | Admin\|Operario | Calendario FullCalendar |
| `/panel/turnos` | `TurnosPage` | Admin\|Operario | Lista con filtros |
| `/panel/turnos/:id` | `TurnoDetallePage` | Admin\|Operario | Detalle + acciones |
| `/panel/clientes` | `ClientesPage` | Admin\|Operario | Búsqueda + alta manual |
| `/panel/mis-comisiones` | `MisComisionesPage` | Operario | Sus comisiones |
| `/panel/disponibilidad` | `DisponibilidadPage` | Admin\|Operario | Gestión de disponibilidad |

### Panel Admin exclusivo

| Ruta | Componente | Descripción |
|---|---|---|
| `/panel/servicios` | `ServiciosPage` | CRUD servicios y subservicios |
| `/panel/operarios` | `OperariosPage` | CRUD operarios |
| `/panel/operarios/:id` | `OperarioDetallePage` | Subservicios + vistas habilitadas |
| `/panel/cupones` | `CuponesPage` | CRUD cupones |
| `/panel/imputaciones` | `ImputacionesPage` | Gastos e ingresos |
| `/panel/catalogos/categorias` | `CategoriasPage` | CRUD categorías imputación |
| `/panel/catalogos/metodos-pago` | `MetodosPagoPage` | CRUD métodos de pago |
| `/panel/catalogos/motivos-bloqueo` | `MotivosBloqueoPage` | CRUD motivos bloqueo salón |
| `/panel/estadisticas` | `EstadisticasPage` | Gráficas detalladas |
| `/panel/comisiones` | `ComisionesPage` | Resumen a liquidar |
| `/panel/calificaciones` | `CalificacionesPage` | Listado y promedios |
| `/panel/config/email` | `ConfigEmailPage` | Configuración de emails |

---

## 5. Flujo de reserva de turno (portal cliente)

Wizard de pasos en `ReservaTurnoPage`. El número de pasos varía según el tipo de servicio:

```
Paso 1 — Elegir salón
  → Salon 1 (Todos los servicios excepto peluquería)
  → Salon 2 (Peluquería)

Paso 2 — Elegir servicio
  → GET /api/v1/servicios?salon=X
  → Los servicios se muestran como categorías (Masajes, Depilación Láser, etc.)

Paso 3 — Elegir subservicio
  → Filtrado por sexo del cliente si está registrado:
      Masculino → solo subservicios sexo IN (Masculino, Ambos)
      Femenino  → solo subservicios sexo IN (Femenino, Ambos)
      NoEspecifica / anónimo → todos, agrupados con separador:
        "── Zonas Mujeres ──" / "── Zonas Hombres ──" / "── General ──"
  → Packs (es_pack=true) se muestran en sección destacada separada:
      Card especial con: badge "PACK", detalle_pack (zonas incluidas),
      precio total y ahorro estimado vs. unitarios
  → Subservicios simples se listan normalmente

  → Si el subservicio NO tiene variantes: precio y duración mostrados directo → siguiente paso
  → Si el subservicio SÍ tiene variantes (Alisados, Trenzas, Drenaje): aparece selector de variante

Paso 4 (condicional) — Elegir variante
  → Solo aparece si el subservicio seleccionado tiene variantes
  → Lista de variantes con nombre, precio y duración
  → Ej: "A los hombros — $26.000 — 90 min"

Paso 5 — Elegir operaria, fecha y hora
  → Dropdown de operarias que pueden hacer ese subservicio
  → Calendario con slots disponibles (GET /turnos/disponibilidad?subservicioId=X&varianteId=Y&fecha=Z)
  → Slots bloqueados en gris con tooltip del motivo

Paso 6 — Opciones de descuento (si aplica)
  → Si es zona de Láser o Descartable (no pack):
      Pregunta "¿Querés agregar más zonas para obtener X% de descuento?"
      Si dice SÍ → selector de zonas adicionales del mismo servicio/sexo
      Al llegar a N zonas mínimas → banner "¡Descuento de X% aplicado automáticamente!"
      Si dice NO → continúa con la zona individual sin descuento
  → Si cliente registrado: muestra cupones disponibles
      → puede aplicar uno → precio se actualiza en tiempo real

Paso 7 — Confirmar datos
  → Si registrado: muestra datos del perfil para confirmar
  → Si anónimo: formulario nombre completo + teléfono (obligatorios)
  → Resumen: servicio(s), variante (si aplica), operaria, fecha/hora, precio con/sin descuento
  → Si hay múltiples zonas → se llama POST /sesiones (crea sesión + N turnos)
  → Si es turno individual → se llama POST /turnos
  → Éxito: pantalla de confirmación con estado "Pendiente de confirmación"
```

---

## 6. Dashboard Admin — KPIs y gráficas

### Selector de período
```typescript
// PeriodSelector.tsx — siempre visible en el header del dashboard
type Periodo = 'semana' | 'mes' | 'custom'

// Semana: semana actual vs semana anterior
// Mes: mes actual vs mes anterior
// Custom: [fechaDesde, fechaHasta] vs [fechaDesdeAnterior, fechaHastaAnterior]
```

### Los 5 KPIs
Cada KPI muestra: valor actual, valor período anterior, delta % con flecha (↑ verde / ↓ rojo), sparkline.

```
1. 💰 Ingresos        — suma precio_final de turnos Realizados
2. 📅 Turnos          — cantidad de turnos (todos los estados)
3. 📊 Ocupación       — turnos Realizados / slots disponibles totales * 100
4. 👥 Clientes Nuevos — clientes con primer turno en el período
5. ⭐ Calificación    — promedio de calificaciones del período
```

### Gráfico 1 — Ingresos vs Egresos (área)
- Eje X: semanas o meses según zoom
- Área verde: ingresos | Área roja: egresos | Línea: resultado neto
- Tabla resumen debajo: total ingresos | total egresos | resultado | margen %

### Gráfico 2 — Ingresos por servicio (barras apiladas)
- Eje X: semanas o meses | Eje Y: pesos
- Cada barra apilada con colores por servicio
- Leyenda clickeable para mostrar/ocultar servicios

### Gráfico 3 — Turnos por estado (dona)
- Segmentos: Realizados (verde), Ausentes (rojo), Multas (naranja), Cancelados (gris), Publicidad (azul), Impago (amarillo)
- Centro: total turnos del período
- Métricas: tasa asistencia %, ingresos perdidos por ausencias, recuperado por multas

### Gráfico 4 — Ocupación por día de la semana (barras horizontales)
- Muestra qué días son más demandados históricamente
- Color degradado: más oscuro = más ocupado

### Gráfico 5 — Ranking de operarias (tabla visual)
- Columnas: #, Operaria, Turnos, Ingresos, Comisión, Calificación, Tasa asistencia
- Click en fila → panel lateral con detalle completo

### Gráfico 6 — Calificaciones
- Promedio general + distribución 1-5 (barras)
- Últimas 10 calificaciones recibidas con comentario

---

## 7. Vista de Operaria — según vistas habilitadas

El Sidebar de operaria solo muestra las secciones que Tamara habilitó en `operario_vistas`:

| Sección | Default | Ruta |
|---|---|---|
| Mi agenda | ✅ siempre | `/panel/agenda` |
| Mis turnos | ✅ default on | `/panel/turnos` |
| Mis comisiones | ✅ default on | `/panel/mis-comisiones` |
| Mi calificación | ❌ default off | `/panel/calificaciones/mis` |
| Mis estadísticas | ❌ default off | `/panel/mis-estadisticas` |

### Vista "Mis Comisiones"
```
Selector: Esta semana | Semana pasada | Este mes

Agrupado por día:
  Lunes 06/05
    09:30  Camila C.    Depilación Láser Pack 3   $29.900   Comisión: $13.455  ✅ Realizado
    11:00  Dana V.      Láser cuerpo completo      $52.000   Comisión: $23.400  ✅ Realizado

─────────────────────────────────────────────────────────
Total: 8 turnos | Ingresos generados: $185.400 | Mi comisión: $83.430
```

---

## 8. Componente WhatsApp

```typescript
// lib/whatsapp.ts
export function buildWhatsAppUrl(telefono: string, mensaje: string): string {
  const numeroLimpio = telefono.replace(/\D/g, '')
  const numeroArgentina = `549${numeroLimpio.replace(/^0/, '').replace(/^15/, '')}`
  return `https://wa.me/${numeroArgentina}?text=${encodeURIComponent(mensaje)}`
}

// Templates predefinidos
export const waTemplates = {
  confirmacion: (nombre: string, fecha: string, hora: string, operaria: string) =>
    `Hola ${nombre}! 🌸 Tu turno en Etereo quedó confirmado para el ${fecha} a las ${hora} con ${operaria}. ¡Te esperamos!`,

  rechazo: (nombre: string, fecha: string, motivo: string) =>
    `Hola ${nombre}, lamentablemente no podemos confirmar tu turno para el ${fecha}. Motivo: ${motivo}. Podés reservar otro horario en nuestra web. Disculpá las molestias 🙏`,

  recordatorio: (nombre: string, fecha: string, hora: string) =>
    `Hola ${nombre}! 🌸 Te recordamos tu turno mañana ${fecha} a las ${hora} en Etereo. Recordá que cancelaciones con menos de 24hs tienen un cargo del 50%. Cualquier consulta escribinos 💬`,
}

// WhatsAppButton.tsx — botón que abre WA en nueva pestaña
<WhatsAppButton telefono={turno.clienteTelefono} template="confirmacion" datos={...} />
```

---

## 9. Componentes reutilizables clave

### `<DataTable<T> />`
Tabla genérica con loading, empty state y paginación opcional.
```typescript
<DataTable<TurnoDto>
  isLoading={loading}
  data={turnos}
  rowKey={(r) => r.id}
  emptyMessage="No hay turnos para mostrar"
  columns={[
    { key: 'fecha', header: 'Fecha', render: (r) => formatDate(r.fechaHoraInicio) },
    { key: 'cliente', header: 'Cliente', render: (r) => r.clienteNombre },
    { key: 'estado', header: 'Estado', render: (r) => <EstadoBadge estado={r.estado} /> },
  ]}
/>
```

### `<RolGuard roles={[...]} />`
Renderiza children solo si el usuario tiene uno de los roles indicados.

### `<PeriodSelector />`
Selector de período reutilizable para Dashboard y Estadísticas. Emite `{ desde, hasta, desdeAnterior, hastaAnterior }`.

### `<KpiCard />`
Card de KPI con valor, delta, sparkline y label.
```typescript
<KpiCard
  label="Ingresos"
  valor={485000}
  valorAnterior={412000}
  sparkline={sparklineData}
  formatear={(v) => `$${v.toLocaleString('es-AR')}`}
  icono={<DollarSign />}
/>
```

### `<EstadoBadge estado={...} />`
Badge con color según el estado del turno.
```
PendienteConfirmacion → amarillo
Confirmado           → azul
Realizado            → verde
Cancelado            → gris
Rechazado            → rojo oscuro
Multa                → naranja
Ausente              → rojo
Impago               → amarillo oscuro
Publicidad           → azul claro
```

### Patrón de diálogos de formulario (igual que San Miguel)
```typescript
const schema = z.object({ ... })
type FormValues = z.infer<typeof schema>

export function XxxFormDialog({ open, onOpenChange, onSubmit, isSubmitting }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { ... },
  })
  useEffect(() => { if (open) reset() }, [open, reset])
  // ...
}
```

---

## 10. Convenciones de código

- **Alias:** `@/` apunta a `src/`
- **Idioma:** archivos y componentes en inglés/PascalCase; strings UI en español rioplatense
- **Sexo en registro:** campo opcional en el formulario de registro. Si no lo completa → se envía `NoEspecifica` (default). Las opciones son: "Mujer", "Hombre", "Prefiero no indicar".
- **Query keys:** `['recurso', filtros]` → ej: `['turnos', { desde, hasta, operarioId }]`
- **Errores de mutaciones:** siempre `onError: (err) => toast.error(getErrorMessage(err))`
- **Formularios con números:** `z.coerce.number()` + `as any` en el resolver
- **Fechas:** siempre mostrar en UTC-3 (Argentina). Usar `date-fns` con `es` locale.
- **Precios:** `toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })`

### TanStack Query — staleTime por tipo de dato
```typescript
staleTime: 2 * 60 * 1000   // 2min — datos del día (agenda, KPIs)
staleTime: 5 * 60 * 1000   // 5min — estadísticas, comisiones
staleTime: 10 * 60 * 1000  // 10min — catálogos (servicios, operarios, cupones)
```

---

## 11. Variables de entorno

```
VITE_API_URL=https://etereo-backend.up.railway.app   — solo en build de producción
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com  — para Google OAuth
```

En dev, `vite.config.ts` proxea `/api` al backend local.

---

## 12. Pendientes / Mejoras futuras

| Ítem | Prioridad |
|---|---|
| PWA (instalable en celular) | Media |
| Notificaciones push (Web Push API) | Baja |
| Exportación PDF de comisiones | Media |
| Saldo a favor del cliente | Baja |
| Integración WhatsApp Business API | Baja |
| Tests unitarios (Vitest + RTL) | Media |
| Soporte mobile completo en panel interno | Media |

---

**Fin del SOT Frontend.**
