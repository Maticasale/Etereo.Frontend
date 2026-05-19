# Etereo Frontend — Source of Truth

> Documento técnico maestro del frontend. Refleja el diseño acordado del sistema de gestión de la estética Etereo.
> Combina estado actual del código + comportamiento objetivo cuando un módulo todavía no fue implementado por completo.
> Última actualización: Mayo 2026 — v7: wizard público `/reservar` implementado como prototipo funcional, entrypoint por datos del cliente y filtrado inicial por sexo.

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

### Convención de estado en este SOT

Este documento puede describir tanto funcionalidades ya presentes en el código como funcionalidades objetivo todavía no implementadas por completo.

| Estado | Significado |
|---|---|
| **Implementado** | Existe en el código actual y forma parte del comportamiento real de la app |
| **Parcial** | Existe una parte del flujo, layout o integración, pero no el módulo completo |
| **Pendiente** | Es comportamiento objetivo acordado, pero todavía no está implementado en React |

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
| `--font-display` | `'Great Vibes', cursive` | Logo "etereo/Etéreo" (wordmark) |
| `--font-heading` | `'Playfair Display', serif` | Títulos del panel interno |
| `--font-body` | `'Manrope', sans-serif` | Todo el resto (body, labels, botones) |

**Logo "etereo"**: usa `var(--font-display)` (Great Vibes), weight 400, `lineHeight: 1`. Tamaño 34px en Sidebar, 168px centrado en panel izquierdo de LoginPage. El wordmark "Etéreo" en la LoginPage usa `var(--font-display)` también para la referencia en el pie del formulario.

**Google Fonts importadas en `index.html`**: Great Vibes (400), Cormorant Garamond (300/400/500, italic), Playfair Display (400/600/700, italic), Manrope (400/500/600/700).

**Cormorant Garamond**: usado localmente en LoginPage (h1 "Bienvenido.", cita del panel izquierdo) y en ReservaTurnoModal (título "Reservá tu turno.", cita). Se aplica con `fontFamily` inline, no como variable global.

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

> Estado general: **Parcial**
>
> La estructura de carpetas principal existe y el routing base está montado, pero varios módulos todavía son placeholders o stubs.

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
│   │   │   ├── AppLayout.tsx       — Sidebar + Header + <Outlet /> [Implementado]
│   │   │   ├── Sidebar.tsx         — Nav filtrado por rol y vistas habilitadas [Implementado]
│   │   │   ├── Header.tsx          — Header panel interno [Implementado]
│   │   │   ├── PublicLayout.tsx    — Layout de rutas públicas [Implementado]
│   │   │   └── PublicHeader.tsx    — Header fijo de landing pública [Implementado]
│   │   └── shared/
│   │       ├── RolGuard.tsx        — Renderiza según rol del usuario [Implementado]
│   │       ├── PageHeader.tsx      — Encabezado simple reutilizable [Implementado]
│   │       └── ReservaTurnoModal.tsx — Modal de entrada al flujo de reserva [Implementado]
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
│   │   │   ├── LoginPage.tsx       — Login con Google OAuth + redirect post-auth [Implementado]
│   │   │   ├── RegistroPage.tsx    — Ruta existente, contenido todavía placeholder [Parcial]
│   │   │   └── CambiarPasswordPage.tsx — Ruta existente, contenido todavía placeholder [Parcial]
│   │   ├── portal/                 — Vistas del cliente (público)
│   │   │   ├── ReservaTurnoPage.tsx  — Wizard público de reserva, interactivo/prototipo de alta fidelidad [Implementado]
│   │   │   ├── MisTurnosPage.tsx     — Ruta existente, contenido placeholder [Parcial]
│   │   │   ├── MisCuponesPage.tsx    — Ruta existente, contenido placeholder [Parcial]
│   │   │   └── MiPerfilPage.tsx      — Ruta existente, contenido placeholder [Parcial]
│   │   ├── public/
│   │   │   ├── LandingPage.tsx       — Página principal pública [Implementado]
│   │   │   └── landing/              — Secciones de la landing [Implementado]
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx   — Ruta existente; módulo de KPIs y gráficas pendiente [Parcial]
│   │   ├── agenda/
│   │   │   └── AgendaPage.tsx      — Ruta existente; FullCalendar pendiente [Parcial]
│   │   ├── turnos/
│   │   │   ├── TurnosPage.tsx      — Ruta existente; lista y acciones pendientes [Parcial]
│   │   │   └── TurnoDetallePage.tsx — Ruta existente; detalle pendiente [Parcial]
│   │   ├── servicios/
│   │   │   └── ServiciosPage.tsx   — CRUD admin pendiente [Parcial]
│   │   ├── operarios/
│   │   │   ├── OperariosPage.tsx   — CRUD operarios pendiente [Parcial]
│   │   │   └── OperarioDetallePage.tsx — Detalle pendiente [Parcial]
│   │   ├── clientes/
│   │   │   └── ClientesPage.tsx    — Búsqueda y alta manual pendiente [Parcial]
│   │   ├── cupones/
│   │   │   └── CuponesPage.tsx     — CRUD pendiente [Parcial]
│   │   ├── imputaciones/
│   │   │   ├── ImputacionesPage.tsx — Módulo pendiente [Parcial]
│   │   │   └── catalogos/
│   │   │       ├── CategoriasPage.tsx      — Pendiente [Parcial]
│   │   │       ├── MetodosPagoPage.tsx     — Pendiente [Parcial]
│   │   │       └── MotivosBloqueoPage.tsx  — Pendiente [Parcial]
│   │   ├── estadisticas/
│   │   │   └── EstadisticasPage.tsx — Gráficas detalladas pendientes [Parcial]
│   │   ├── comisiones/
│   │   │   ├── ComisionesPage.tsx   — Vista admin pendiente [Parcial]
│   │   │   └── MisComisionesPage.tsx — Vista operaria pendiente [Parcial]
│   │   ├── calificaciones/
│   │   │   ├── CalificacionesPage.tsx  — Vista admin pendiente [Parcial]
│   │   │   └── CalificarPage.tsx       — Ruta pública existente; formulario real pendiente [Parcial]
│   │   ├── disponibilidad/
│   │   │   └── DisponibilidadPage.tsx  — Módulo pendiente [Parcial]
│   │   └── config/
│   │       └── ConfigEmailPage.tsx     — Config admin pendiente [Parcial]
│   │
│   ├── store/
│   │   ├── authStore.ts           — Auth Zustand [Implementado]
│   │   └── toastStore.ts          — Toasts Zustand [Implementado]
│   │
│   ├── types/
│   │   └── api.ts                  — DTOs tipados alineados con backend [Implementado]
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

> Estado general: **Parcial**
>
> El routing principal ya existe y separa correctamente rutas públicas, auth, cliente y panel interno.
> Lo que todavía no está completo es el contenido funcional de muchos módulos internos.

### Portal del cliente (público o registrado)

| Ruta | Componente | Acceso |
|---|---|---|
| `/` | `LandingPage` | Público |
| `/reservar` | `ReservaTurnoPage` | Público |
| `/mis-turnos` | `MisTurnosPage` | Cliente |
| `/mis-cupones` | `MisCuponesPage` | Cliente |
| `/mi-perfil` | `MiPerfilPage` | Cliente |
| `/calificar` | `CalificarPage` | Público con token JWT del link; POST final requiere auth backend |

### Panel interno (Admin + Operario)

| Ruta | Componente | Acceso | Descripción |
|---|---|---|---|
| `/panel` | `PanelRedirect` | Admin\|Operario | Redirección por rol |
| `/panel/dashboard` | `DashboardPage` | Admin | KPIs + gráficas + alertas |
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

> Estado: **Implementado**
>
> La ruta `/reservar` ya no es placeholder: hoy existe un wizard público navegable e interactivo en React.
> Su estado actual es **prototipo funcional / alta fidelidad**: resuelve layout, jerarquía visual, comportamiento entre pasos y reglas base de negocio visibles, aunque todavía no consume el backend real de forma completa.

### Flujo actual implementado en `ReservaTurnoPage`

```
Paso 1 — Tus datos
  → Nombre, apellido, teléfono, email opcional
  → Sexo obligatorio: Femenino | Masculino
  → El sexo se pide al inicio para filtrar correctamente salones/servicios

Paso 2 — Servicio
  → Selector de salón con cards editoriales grandes
  → Si sexo = Masculino, Salón 2 no se muestra
  → Luego se elige el servicio dentro del salón seleccionado
  → En este paso no se muestra todavía el resumen lateral

Paso 3 — Selección
  → Caso demo actual: Depilación Láser
  → Columna izquierda: combos destacados
  → Columna derecha: zonas individuales agrupadas por sexo
  → Si se elige un combo:
      - se limpian las zonas individuales previamente seleccionadas
      - la columna de zonas queda atenuada/bloqueada
      - aparece CTA "Deseleccionar combo"
  → Si se eligen 3 o más zonas individuales:
      - se aplica descuento automático del 15%
      - aparece banner visual de descuento aplicado

Paso 4 — Horario
  → Selector visual de semana
  → Elección de día primero, luego horarios del día
  → La demo actual usa bloques de 30 minutos
  → El botón siguiente solo se habilita cuando hay día + hora seleccionados

Paso 5 — Cupón
  → Si usuario autenticado: muestra cupones simulados + ingreso manual
  → Si usuario invitado: solo ingreso manual de código
  → El resumen se recalcula en vivo

Paso 6 — Confirmar
  → Resumen final de salón, servicio, selección, fecha/hora, duración y total
  → Éxito visual posterior con estado "Pendiente de confirmación"
```

### Reglas de estado visibles ya implementadas en UI

- No hay selecciones iniciales prearmadas en el flujo.
- El botón `Siguiente` se habilita solo cuando el paso actual está completo.
- Si el usuario vuelve un paso atrás, se limpia el estado del paso abandonado para no arrastrar selecciones inválidas.
- El patrón visual `no seleccionado / seleccionado / bloqueado` está unificado progresivamente entre cards de salón, servicios, combos, zonas y slots.
- El resumen lateral aparece a partir de la selección real del turno; no en el primer paso de datos/servicio.

### Alcance actual vs pendiente

**Ya resuelto en React**
- Routing público hacia `/reservar`
- Wizard interactivo de 6 pasos + pantalla de éxito
- Entry anónimo y autenticado
- Filtro inicial por sexo en UI
- Ocultamiento de Salón 2 para sexo masculino
- Resumen lateral y resumen mobile
- Cupón simulado y descuentos visuales

**Todavía pendiente de conectar o endurecer**
- Datos reales desde `GET /servicios`
- Disponibilidad real desde backend
- Variantes reales de subservicio
- Creación final con `POST /turnos` / `POST /sesiones`
- Validaciones finales de negocio sincronizadas 100% con contrato

---

## 6. Dashboard Admin — KPIs y gráficas

> Estado: **Pendiente**
>
> La ruta admin existe, pero este módulo todavía no está implementado en el frontend actual.
> Esta sección se mantiene como diseño funcional objetivo sincronizado con el backend disponible.

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

> Estado: **Pendiente**
>
> El filtrado base de navegación por rol/vistas ya existe en Sidebar, pero las vistas específicas de operaria descriptas acá todavía no están desarrolladas por completo.

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

> Estado: **Parcial**
>
> Hoy existe `lib/whatsapp.ts` con utilidades base, pero el componente visual reutilizable `WhatsAppButton` todavía no está creado en el repo.

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

> Estado: **Parcial**
>
> En el código actual existen `RolGuard`, `PageHeader`, primitives UI, `ReservaTurnoModal`, `useReservaTurno` y layouts.
> Los componentes listados abajo como `DataTable`, `PeriodSelector`, `KpiCard` y `EstadoBadge` pertenecen al diseño objetivo y todavía no existen implementados en este repo.

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
- **Sexo en registro/reserva:** en registro puede seguir existiendo `NoEspecifica`, pero en el wizard `/reservar` el sexo es obligatorio antes de mostrar salones y servicios. La UI pública de reserva trabaja con dos opciones: `Femenino` y `Masculino`.
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

## 13. Flujo de autenticación del cliente

> Estado general: **Parcial**
>
> El entrypoint desde landing, `ReservaTurnoModal`, `LoginPage`, el redirect post-auth y el wizard visual `/reservar` ya están implementados.
> Lo que sigue pendiente es terminar registro/cambio de contraseña y conectar el wizard con datos reales del backend.

### Flujo de entrada

```
Landing → botón "Ingresar" en header → /login (página dedicada)

Landing → botón "Reservar turno":
  Si logueado (cualquier rol) → wizard directo  [useReservaTurno → setWizardOpen(true)]
  Si no logueado             → ReservaTurnoModal
    → "Ingresar con Google"   → Google OAuth → post-auth: /?iniciar_reserva=1
    → "Ingresar con email"    → /login?redirect=reserva
    → "Registrarme gratis"    → /registro?redirect=reserva
    → "Continuar sin cuenta"  → cierra modal, wizard anónimo

Post login con ?redirect=reserva   → navigate('/?iniciar_reserva=1', { replace: true })
Post ?iniciar_reserva=1 en URL     → useReservaTurno detecta, limpia URL, setWizardOpen(true)
```

### Componentes involucrados

| Componente | Archivo |
|---|---|
| `ReservaTurnoModal` | `src/components/shared/ReservaTurnoModal.tsx` |
| `useReservaTurno` | `src/hooks/useReservaTurno.ts` |
| `PostAuthRedirectHandler` | `src/App.tsx` (safety-net para /registro?redirect=reserva) |

### Lógica clave

- **`LoginPage.tsx`** — `redirectAfterLogin()` lee `?redirect=reserva` del `useSearchParams` y navega a `/?iniciar_reserva=1` (replace).
- **`PostAuthRedirectHandler`** (App.tsx) — efecto que observa `[usuario, location.search]`; si el usuario se autentica y aún hay `?redirect=reserva` en la URL (ej: RegistroPage), redirige a `/?iniciar_reserva=1`.
- **`useReservaTurno`** — en `useEffect([], [])` detecta `?iniciar_reserva=1`, hace `setSearchParams({}, { replace: true })` para limpiar la URL del historial y pone `wizardOpen = true`.
- El modal **nunca** se muestra si `usuario !== null` — la lógica de apertura vive 100% en `handleReservarTurno()`.

### Estado actual del código

- `LoginPage` está implementada y funcional con Google OAuth, manejo de errores y redirect post-auth.
- `RegistroPage` y `CambiarPasswordPage` existen como rutas, pero todavía están en placeholder.
- `ReservaTurnoModal` y `PublicLayout` ya disparan correctamente el flujo hacia `/login`, `/registro` o `/reservar`.

### LoginPage — diseño visual

Layout split 2 columnas (`1.05fr 1fr`, `100vw × 100vh`):
- **Panel izquierdo** (dark): fondo `linear-gradient(#5a4530 → #4A3728 → #2a1d12)` + SVG botánico inline (24+18 elipses doradas generadas con `.map()`) + logo "Etéreo" en Great Vibes 168px + cita en Cormorant Garamond italic.
- **Panel derecho** (cream `--color-tertiary`): eyebrow dorado + h1 "Bienvenido." en Cormorant Garamond 56px + inputs underline-only (`SplitInput` local, no usa el `<Input>` global) + botón sin border-radius + Google OAuth.
- La lógica funcional (RHF/Zod, API calls, redirect por rol, Google OAuth) es idéntica a la versión anterior.

---

## 14. LandingPage y PublicLayout

> Agregado: Mayo 2026 — v5: Landing pública (HeroSection, ServiciosSection, CalificacionesSection, FooterSection), PublicLayout, PublicHeader, routing público separado del AppLayout.
>
> Estado general: **Implementado**
>
> La landing pública, su layout, el header fijo y el flujo de entrada a reserva ya existen en el código actual.
> La única excepción relevante es que la sección de calificaciones sigue usando datos mockeados hasta exponer el endpoint público necesario.

### Arquitectura de archivos

```
src/components/layout/
  ├── PublicLayout.tsx       — layout para rutas públicas (header + outlet + modal)
  └── PublicHeader.tsx       — header fijo con scroll detection, logo y CTAs

src/pages/public/
  └── LandingPage.tsx        — página principal pública
src/pages/public/landing/
  ├── HeroSection.tsx        — 100vh, hero oscuro, botánicas SVG, wordmark + CTAs
  ├── ServiciosSection.tsx   — grid de servicios con datos reales del API
  ├── CalificacionesSection.tsx — promedio + reviews + "Por qué elegirnos"
  └── FooterSection.tsx      — marca, navegación, contacto, copyright

src/api/servicios.ts         — getServicios() implementado (anónimo)
src/api/estadisticas.ts      — helper admin-only + TODO para endpoint público de calificaciones
```

### PublicLayout

- Renderiza `<PublicHeader />` + `<Outlet />`. Sin Sidebar.
- Contiene el estado del `ReservaTurnoModal` y el handler `handleReservarTurno`.
- Pasa el handler a `<PublicHeader onReservar={...} />` por props.
- Pasa el handler a rutas hijas vía `<Outlet context={{ onReservar }} />` (tipo `PublicOutletContext`).
- Los hijos acceden con `useOutletContext<PublicOutletContext>()`.
- Logueado → `navigate('/reservar')`. No logueado → `ReservaTurnoModal`. `onAnonimo` → `navigate('/reservar')`.

### PublicHeader

- `position: fixed`, `z-index: 100`, `height: 68px`.
- **Transparente** (scrollY < 60px): fondo `transparent`, wordmark blanco.
- **Sólido** (scrollY ≥ 60px): `rgba(74,55,40,0.96)` + `backdrop-blur(12px)` + wordmark `var(--color-secondary)`.
- Desktop (`≥ sm`): botón ghost `[Ingresar]` + botón dorado `[Reservar turno]`.
- Mobile (`< sm`): link texto "Ingresar" + botón compacto dorado "Reservar".

### Secciones de la Landing

#### HeroSection
- `minHeight: 100vh`, `background: linear-gradient(#5a4530 → #4A3728 → #2a1d12)`.
- SVG botánico inline (dos ramas, izquierda + derecha), mismo patrón que LoginPage, opacidad 0.38.
- Wordmark "etereo" Great Vibes 64px mobile / 96px desktop, `color: #C5A059`.
- Tagline Playfair Display italic: "Belleza, cuidado y bienestar en San Francisco".
- Botones pill: `[Reservar mi turno]` (dorado) + `[Ingresar]` (ghost blanco). `flex-col sm:flex-row`.
- Scroll indicator SVG con `@keyframes heroScrollBounce`. Desaparece al scrollear >80px.

#### ServiciosSection
- `background: var(--color-tertiary)`, `padding: 80px 0`.
- **Query:** `useQuery(['servicios', 'landing'], serviciosApi.getServicios, { staleTime: 10min })`.
- Grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`. Loading: 6 skeletons con `@keyframes skeletonPulse`.
- Precio "desde": `Math.min(...subservicios.filter(s => s.activo).map(s => s.precio))`.
- Íconos lucide: Zap (Láser), Leaf (Descartable), HeartHandshake (Masajes), Eye (Cejas & Pestañas), Flower2 (Facial), Scissors (Peluquería), Sparkles (default). Búsqueda parcial por `nombre.includes(key)`.

#### CalificacionesSection
- `background: var(--color-primary)`, fondo oscuro. SVG botánico en esquina derecha, opacidad 0.18.
- Sub A: promedio global (80px dorado) + `StarRating` SVG con relleno parcial via `clipPath`.
- Reviews: grid `grid-cols-1 md:grid-cols-3`. Cards con `rgba(255,255,255,0.07)` + borde sutil.
- Sub B bullets "Por qué elegirnos": íconos Award, Sparkles, ShieldCheck. `flex-col md:flex-row`.
- **⚠️ Datos mockeados.** Ver TODO en el archivo y en la sección de pendientes.

#### FooterSection
- `background: #2a1d12`, `padding: 64px 0 0`.
- Grid `grid-cols-1 md:grid-cols-3`. Col 1: marca + redes. Col 2: navegación. Col 3: contacto.
- Copyright: "© 2026 Etereo. Todos los derechos reservados."

### Routing (App.tsx)

```tsx
// Rutas con PublicLayout (PublicHeader fijo + outlet)
<Route element={<PublicLayout />}>
  <Route path="/" element={<LandingPage />} />
  <Route path="/reservar" element={<ReservaTurnoPage />} />
</Route>

// Auth — layout visual propio, SIN PublicHeader
<Route path="/login" element={<LoginPage />} />
<Route path="/registro" element={<RegistroPage />} />
<Route path="/cambiar-password" element={<CambiarPasswordPage />} />
<Route path="/calificar" element={<CalificarPage />} />
```

LoginPage tiene layout split 2 columnas propio; va fuera del PublicLayout.

### Flujo post-auth redirect

1. `/login?redirect=reserva` → login → `navigate('/?iniciar_reserva=1', { replace })`
2. `LandingPage` detecta `?iniciar_reserva=1` en `useEffect` → `navigate('/reservar', { replace })`
3. `ReservaTurnoPage` carga. Compatible con `PostAuthRedirectHandler` (safety-net en App.tsx).

### TODO pendiente de Backend

```
⚠️  GET /estadisticas/calificaciones requiere rol Admin.
    Crear: GET /estadisticas/calificaciones/publico  (acceso anónimo)
    Response: { promedioGlobal: number, total: number, ultimasCalificaciones: CalificacionDto[] }
    Cuando esté disponible:
      - CalificacionesSection.tsx: reemplazar MOCK_DATA con useQuery(['calificaciones', 'landing'])
      - staleTime: 5 * 60 * 1000
```

### Estado actual resumido

- `LandingPage`, `HeroSection`, `ServiciosSection`, `CalificacionesSection` y `FooterSection` existen y renderizan.
- `ServiciosSection` consume `GET /servicios` real.
- `CalificacionesSection` todavía usa mocks porque no existe endpoint público específico.
- El redirect `/login?redirect=reserva` → `/?iniciar_reserva=1` → `/reservar` ya funciona.
- `/reservar` ya renderiza el wizard público real; no es más una ruta placeholder.

---

**Fin del SOT Frontend.**
