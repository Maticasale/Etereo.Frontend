# Etereo Frontend — Source of Truth

> Documento técnico maestro del frontend. Refleja el diseño acordado del sistema de gestión de la estética Etereo.
> Combina estado actual del código + comportamiento objetivo cuando un módulo todavía no fue implementado por completo.
> Última actualización: Mayo 2026 — v10: `/reservar` modularizado y alineado al contrato real (disponibilidad mensual, reglas públicas de descuento, pasos dinámicos para cliente completo) + área cliente `/mi-espacio`.

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
│   │   ├── reglasDescuentoSesion.ts
│   │   ├── publicaciones.ts
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
│   │       ├── ReservaTurnoModal.tsx — Modal de entrada al flujo de reserva [Implementado]
│   │       └── PublicacionesSalon.tsx — Bloque compartido de novedades del salón [Implementado]
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useRol.ts               — isAdmin(), isOperario(), isCliente()
│   │   ├── useToast.ts
│   │   └── useAuthBackRedirect.ts  — controla el "atrás" del navegador en pantallas auth [Implementado]
│   │
│   ├── lib/
│   │   ├── utils.ts                — cn() (twMerge + clsx)
│   │   ├── errors.ts               — getErrorMessage() mapea códigos del backend
│   │   ├── authFlow.ts             — reglas de redirect post-auth / perfil incompleto [Implementado]
│   │   └── whatsapp.ts             — buildWhatsAppUrl(telefono, mensaje)
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx       — Login con Google OAuth + redirect post-auth [Implementado]
│   │   │   ├── RegistroPage.tsx    — Registro normal + alta/ingreso con Google [Implementado]
│   │   │   ├── ForgotPasswordPage.tsx — Solicitud de recuperación por email [Implementado]
│   │   │   ├── ResetPasswordPage.tsx  — Nueva contraseña vía token [Implementado]
│   │   │   ├── CambiarPasswordPage.tsx — Cambio obligatorio de contraseña en primer ingreso [Implementado]
│   │   │   └── CompletarPerfilPage.tsx — Pantalla post-Google para completar teléfono/sexo [Implementado]
│   │   ├── portal/                 — Vistas del cliente (público)
│   │   │   ├── ReservaTurnoPage.tsx  — Wrapper público del wizard de reserva [Implementado]
│   │   │   ├── reserva/              — Submódulo del wizard (/reservar) con hooks, utils y componentes [Implementado]
│   │   │   ├── MiEspacioPage.tsx     — Home privada del cliente con hero, próximo turno, cupones y publicaciones [Implementado]
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

### Flujos auth ya implementados

- **Registro normal**: `RegistroPage` usa RHF + Zod y exige `nombre`, `apellido`, `telefono`, `email`, `sexo` y `password`.
- **Registro / ingreso con Google**: `RegistroPage` y `LoginPage` comparten el flujo de `authApi.googleLogin()`.
- **Recuperación de contraseña**: `ForgotPasswordPage` llama `POST /auth/forgot-password`.
- **Reset por token**: `ResetPasswordPage` lee `?token=...` y llama `POST /auth/reset-password`.
- **Cambio obligatorio de contraseña**: `CambiarPasswordPage` consume `POST /auth/cambiar-password` y limpia `debeCambiarPassword` en `authStore`.
- **Completar perfil post-Google**: si el cliente autenticado no tiene `telefono` o tiene `sexo = NoEspecifica`, el frontend redirige a `/completar-perfil`.

### Completar perfil post-Google

> Estado frontend: **Implementado**
>
> Estado integración backend: **Implementado**

- El frontend detecta perfil incompleto con `needsProfileCompletion(usuario)` en `src/lib/authFlow.ts`.
- Criterio actual:
  - `usuario.rol === 'Cliente'`
  - `telefono` vacío/null, o
  - `sexo` ausente / `NoEspecifica`
- Si se cumple, `PostAuthRedirectHandler` y las pantallas auth redirigen a `/completar-perfil`.
- `CompletarPerfilPage` pide solo:
  - `telefono`
  - `sexo` (`Femenino` | `Masculino`)
- Aclaración UX implementada:
  - “Escribí solo la caracteristica y el numero, sin +54 9.”
- Persistencia actual:
  - usa `PATCH /auth/completar-perfil`
  - no reutiliza `PATCH /usuarios/{id}`, que sigue siendo solo `Admin`
  - el endpoint devuelve `UsuarioDto` actualizado y el frontend refresca `authStore`

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
| `/mi-espacio` | `MiEspacioPage` | Cliente |
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
> Su estado actual es **integración real activa**: ya consume catálogo, disponibilidad simple/mensual, disponibilidad de sesiones, reglas públicas de descuento, cupones, códigos de descuento y creación real de reserva contra backend.

### Flujo actual implementado en `ReservaTurnoPage`

```
Usuario anónimo
  Paso 1 — Tus datos
    → Nombre, apellido, teléfono, email opcional
    → Sexo obligatorio: Femenino | Masculino
    → El sexo se pide al inicio para filtrar correctamente salones/servicios

Usuario registrado con perfil completo
  → El wizard arranca directamente en Servicio
  → Los datos salen de authStore.usuario

Paso Servicio
  → Selector de salón con cards editoriales grandes
  → Si sexo = Masculino, Salón 2 no se muestra
  → El catálogo sale de `GET /servicios`
  → Luego se elige el servicio dentro del salón seleccionado
  → En este paso no se muestra todavía el resumen lateral

Paso Selección
  → Usa subservicios / packs / variantes reales del servicio elegido
  → Columna izquierda: packs o combos activos
  → Columna derecha: opciones individuales relevantes para el sexo ya elegido en Paso 1
  → Si se elige un combo:
      - se limpian las zonas individuales previamente seleccionadas
      - la columna de zonas queda atenuada/bloqueada
      - aparece CTA "Deseleccionar combo"
  → Si se eligen 3 o más zonas individuales:
      - se aplica descuento automático visible según `GET /reglas-descuento-sesion/publicas`
      - aparece banner visual de descuento aplicado

Paso Horario
  → Calendario mensual visual
  → Consulta disponibilidad real por mes con **una sola request por mes**
  → Turno simple → `POST /turnos/disponibilidad-mes`
  → Sesión multi-zona → `POST /sesiones/disponibilidad-mes`
  → Elección de día primero, luego horarios del día
  → El botón siguiente solo se habilita cuando hay día + hora seleccionados

Paso Cupón
  → Si usuario autenticado: `GET /cupones/disponibles`
  → Si usuario invitado: solo ingreso manual de código
  → Código manual: `GET /codigos-descuento/validar/{codigo}`
  → El resumen se recalcula en vivo
  → El frontend aclara que el beneficio se valida ahora, pero se consume recién al confirmar la reserva

Paso Confirmar
  → Resumen final de salón, servicio, selección, fecha/hora, duración y total
  → Turno simple: `POST /turnos`
  → Sesión multi-zona: `POST /sesiones`
  → Éxito visual posterior con estado "Pendiente de confirmación"
  → La pantalla final replica la maqueta HTML aprobada: hero centrado, card principal dividida, timeline vertical segmentada, mini acciones inline y bloque de ayuda
```

### Reglas de estado visibles ya implementadas en UI

- No hay selecciones iniciales prearmadas en el flujo.
- Ya no quedan datos hardcodeados de ejemplo en el paso de datos.
- El botón `Siguiente` se habilita solo cuando el paso actual está completo.
- Si el usuario vuelve un paso atrás, se limpia el estado del paso abandonado para no arrastrar selecciones inválidas.
- El patrón visual `no seleccionado / seleccionado / bloqueado` está unificado progresivamente entre cards de salón, servicios, combos, zonas y slots.
- El resumen lateral aparece a partir de la selección real del turno; no en el primer paso de datos/servicio.
- La pantalla de éxito no usa ya una variante libre: sigue la composición aprobada en HTML como fuente de verdad visual.
- El módulo fue refactorizado internamente a `src/pages/portal/reserva/` con hooks, componentes y utils, manteniendo la misma UI aprobada.

### Alcance actual vs pendiente

**Ya resuelto en React**
- Routing público hacia `/reservar`
- Wizard interactivo de 6 pasos + pantalla de éxito
- Entry anónimo y autenticado
- Filtro inicial por sexo en UI
- Salteo automático del paso “Tus datos” para cliente registrado con perfil completo
- Ocultamiento de Salón 2 para sexo masculino
- Catálogo real desde `GET /servicios`
- Disponibilidad mensual real simple y de sesión
- Reglas automáticas de descuento desde backend
- Aplicación de cupones del cliente y códigos de descuento manuales
- Creación real vía `POST /turnos` y `POST /sesiones`
- Resumen lateral y resumen mobile
- Pantalla de éxito alineada al diseño standalone aprobado (`hero + card principal + timeline + help block + footer`)

**Todavía pendiente de conectar o endurecer**
- endurecer mensajes de error de reserva por caso de negocio
- refrescar “Mis turnos / Mis cupones” con los datos reales creados por el wizard
- revisar optimización de disponibilidad mensual para no depender de múltiples requests por mes

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
- **Sexo en auth/reserva:** en `RegistroPage` y `CompletarPerfilPage` el frontend hoy trabaja con dos opciones: `Femenino` y `Masculino`. En el wizard `/reservar` también es obligatorio antes de mostrar salones y servicios.
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
> El entrypoint desde landing, el bloque auth de cliente, el redirect post-auth y el wizard visual `/reservar` ya están implementados.
> Lo que sigue pendiente es conectar el wizard con datos reales del backend y terminar de endurecer estados/errores de negocio del portal.

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

Si cliente autenticado tiene perfil incompleto:
  → `/completar-perfil`
  → completa `telefono` y `sexo`
  → luego vuelve a `/?iniciar_reserva=1` si venía desde reserva
```

### Componentes involucrados

| Componente | Archivo |
|---|---|
| `ReservaTurnoModal` | `src/components/shared/ReservaTurnoModal.tsx` |
| `useReservaTurno` | `src/hooks/useReservaTurno.ts` |
| `PostAuthRedirectHandler` | `src/App.tsx` (safety-net para /registro?redirect=reserva) |
| `needsProfileCompletion` | `src/lib/authFlow.ts` |
| `useAuthBackRedirect` | `src/hooks/useAuthBackRedirect.ts` |

### Lógica clave

- **`LoginPage.tsx`** — `redirectAfterLogin()` lee `?redirect=reserva` del `useSearchParams` y navega a `/?iniciar_reserva=1` (replace).
- **`PostAuthRedirectHandler`** (App.tsx) — si el usuario autenticado necesita completar perfil, prioriza `/completar-perfil`; si no, y aún existe `?redirect=reserva`, redirige a `/?iniciar_reserva=1`.
- **`useReservaTurno`** — en `useEffect([], [])` detecta `?iniciar_reserva=1`, hace `setSearchParams({}, { replace: true })` para limpiar la URL del historial y pone `wizardOpen = true`.
- El modal **nunca** se muestra si `usuario !== null` — la lógica de apertura vive 100% en `handleReservarTurno()`.
- **`useAuthBackRedirect`** — fuerza que el botón atrás del navegador/trackpad/mouse se comporte como “Volver al login” en `Registro`, `Forgot password` y `Reset password`.

### Estado actual del código

- `LoginPage` está implementada y funcional con Google OAuth, manejo de errores y redirect post-auth.
- `RegistroPage`, `ForgotPasswordPage`, `ResetPasswordPage` y `CambiarPasswordPage` están implementadas con el mismo lenguaje visual del login.
- `CompletarPerfilPage` existe, ya está conectada al flujo post-Google y persiste vía `PATCH /auth/completar-perfil`.
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
  ├── HeroSection.tsx        — 100vh, hero oscuro con variante anónima y variante cliente logueado
  ├── ServiciosSection.tsx   — grid de servicios con datos reales del API
  ├── CalificacionesSection.tsx — promedio + reviews + "Por qué elegirnos"
  └── FooterSection.tsx      — marca, navegación, contacto, copyright

src/api/servicios.ts         — getServicios() implementado (anónimo)
src/api/turnos.ts            — disponibilidad simple, disponibilidad de sesión, crear turno, crear sesión
src/api/cupones.ts           — cupones del cliente + validación de códigos de descuento
src/api/publicaciones.ts     — publicaciones del salón, visibles según sesión
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

- `position: fixed`, full-width, con transición de ocultamiento/aparición según dirección del scroll.
- Cambia entre una variante más translúcida y otra más sólida/blurred según profundidad de scroll.
- Desktop (`≥ sm`): CTA de cuenta dinámico + botón dorado `[Reservar turno]`.
- Mobile (`< sm`): CTA de cuenta dinámico + botón compacto dorado "Reservar".
- Estado de cuenta:
  - anónimo → `Ingresar`
  - cliente → `Mi espacio`
  - admin/operario → `Ir al panel`
- Excepción importante:
  - en la ruta `/reservar` el CTA `Reservar turno` se oculta para no redundar dentro del propio wizard.
  - además puede ocultarse por evento `etereo:public-header-visible` cuando una pantalla pública necesita tomar todo el foco visual.

### Secciones de la Landing

#### HeroSection
- `minHeight: 100vh`, `background: linear-gradient(#5a4530 → #4A3728 → #2a1d12)`.
- SVG botánico inline (dos ramas, izquierda + derecha), mismo patrón que LoginPage, opacidad 0.38.
- Estado anónimo:
  - mantiene el wordmark "Etéreo", tagline editorial y botones `[Reservar mi turno]` + `[Ingresar]`.
- Estado cliente logueado:
  - saludo según hora local (`Buenos días / tardes / noches, {nombre}`)
  - query `GET /turnos/mis-turnos` con `staleTime: 2 min`
  - card compacta del próximo turno si existe:
    - `Confirmado` → badge verde
    - `PendienteConfirmacion` → badge dorado + texto "Te avisamos por WhatsApp"
  - si no hay próximo turno: mensaje muted sin card
  - CTA principal visible: `[Ver mi Espacio →]`
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
  <Route element={<ProtectedRoute roles={['Cliente']} />}>
    <Route path="/mi-espacio" element={<MiEspacioPage />} />
  </Route>
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
4. Si el cliente inicia sesión sin venir desde reserva:
   - Login / Registro / CompletarPerfil / CambiarPassword redirigen a `/mi-espacio`.

## 15. Módulo /mi-espacio

> Estado: **Implementado**

`/mi-espacio` es la home privada del cliente autenticado. Vive dentro del `PublicLayout` para conservar el mismo universo visual del sitio público, pero con contenido personalizado.

### Secciones

- Hero oscuro personal:
  - saludo con el nombre del cliente
  - mensaje cálido según horario
  - CTA `Reservar nuevo turno`
- Próximo turno:
  - usa `GET /turnos/mis-turnos`
  - prioriza el primer turno futuro en estado `PendienteConfirmacion` o `Confirmado`
  - muestra lista compacta de otros turnos próximos si existen
  - fallback elegante si no hay reservas futuras
- Accesos rápidos:
  - `Mis Turnos`
  - `Mis Cupones`
  - `Mi Perfil`
- Cupones destacados:
  - usa `GET /cupones/disponibles`
  - renderiza estilo voucher solo si hay datos
- Último servicio:
  - toma el turno más reciente en estado `Realizado`
  - si no existe, no renderiza
- Publicaciones:
  - integra el componente compartido `PublicacionesSalon`
  - cliente autenticado ve también publicaciones `SoloRegistrados`

## 16. Publicaciones del salón

> Estado: **Implementado**

### API

- `src/api/publicaciones.ts`
- Query: `GET /publicaciones`
- `staleTime: 5 min`
- La visibilidad depende del JWT:
  - anónimo → solo `Todos`
  - cliente → `Todos` + `SoloRegistrados`

### Tipo

- `PublicacionDto` agregado en `src/types/api.ts`

### Componente compartido

- `src/components/shared/PublicacionesSalon.tsx`
- Props:
  - `title?: string`
  - `maxItems?: number`
- Comportamiento:
  - si está cargando, hay error o no hay publicaciones: no renderiza nada
  - badges por tipo (`Novedad`, `Promo`, `Aviso`, `Evento`)
  - badge adicional "Exclusivo para miembros" cuando aplica y el cliente está logueado
  - si `destacado = true`, dibuja borde superior dorado

### Integración

- `LandingPage`
  - aparece entre `ServiciosSection` y `CalificacionesSection`
- `/mi-espacio`
  - aparece al final de la home privada

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
