# Etereo — Contexto completo del proyecto
*Archivo de migración — Mayo 2026*

---

## 1. Descripción del negocio

**Etereo** es una estética ubicada en **Moreno 212, Oficina A, Rafaela, Santa Fe**.
La oficina está dividida en dos ambientes que funcionan como dos salones independientes:

- **Salón 1:** Depilación Láser, Depilación Descartable, Masajes, Cejas & Pestañas, Facial
- **Salón 2:** Exclusivamente Peluquería

La dueña es **Tamara (Tami)**, quien también trabaja como operaria haciendo
peluquería y depilación láser. El resto del equipo son operarias con servicios
específicos asignados.

---

## 2. Stack tecnológico completo

### Backend — COMPLETO ✅
- ASP.NET Core 10, EF Core 10, PostgreSQL
- Arquitectura N-Tier (5 proyectos: Api, Application, Domain, Infrastructure, Shared)
- JWT HS256 — accessToken 15min, refreshToken 30d con rotación
- Google OAuth via `Google.Apis.Auth`
- Emails via Resend (3.000/mes gratis permanente)
- Rate limiting: `AspNetCoreRateLimit`
- Docker multi-stage, hosting en Railway
- URL producción: `https://etereobackend-production.up.railway.app`
- Repo: `https://github.com/Maticasale/Etereo.Backend`
- Carpeta local: `C:\Dev\Etereo\Etereo.Backend`

### Frontend — EN PROGRESO 🔄
- React 18 + Vite + TypeScript
- TanStack Query v5 (staleTime: 0 default, configurable por hook)
- Zustand (solo authStore y toastStore)
- Axios con interceptores JWT + refresh automático
- React Hook Form + Zod (zodResolver con `as any` — workaround Zod4+RHF7)
- Tailwind CSS v4 (sin tailwind.config.js, plugin `@tailwindcss/vite`)
- Radix UI para Dialog, Tabs, Checkbox, Label
- FullCalendar (agenda), Recharts (estadísticas)
- `@react-oauth/google` para Google OAuth
- Repo: `https://github.com/Maticasale/Etereo.Frontend`
- Carpeta local: `C:\Dev\Etereo\Etereo.Frontend`

---

## 3. Sistema de diseño

### Paleta de colores

| Variable CSS | Hex | Uso |
|---|---|---|
| `--color-primary` | `#4A3728` | Marrón oscuro — sidebar, botones primarios |
| `--color-primary-hover` | `#3a2a1e` | Hover primary |
| `--color-secondary` | `#C5A059` | Dorado — acentos, focus inputs |
| `--color-secondary-hover` | `#b08a42` | Hover secondary |
| `--color-tertiary` | `#F9F5F0` | Crema — fondo general |
| `--color-neutral` | `#8C7E6D` | Iconos, bordes medios |
| `--color-neutral-light` | `#E8E0D8` | Bordes inputs, separadores |
| `--color-text-primary` | `#2C1F14` | Texto principal |
| `--color-text-secondary` | `#6B5B4E` | Labels, texto secundario |
| `--color-text-muted` | `#A89880` | Placeholders, ayuda |
| `--color-error` | `#C0392B` | Errores |
| `--color-success` | `#27AE60` | Éxito |
| `--color-warning` | `#E67E22` | Advertencia |

### Tipografía

| Variable | Fuente | Uso |
|---|---|---|
| `--font-display` | Great Vibes (Google Fonts, 400) | Logo "etereo" — wordmark |
| `--font-heading` | Playfair Display (Google Fonts, 400/600/700, italic) | Títulos del panel |
| `--font-body` | Manrope (Google Fonts, 400/500/600/700) | Todo lo demás |

**Nota especial:** Cormorant Garamond (300/400/500, italic) se usa en LoginPage
(h1 "Bienvenido." y cita) y en ReservaTurnoModal (título y cita). Se aplica con
`fontFamily` inline, no como variable global.

### Estilo general
Mix de secciones claras (fondo crema `#F9F5F0`) y oscuras (fondo `#4A3728`)
con detalles decorativos de hojas/botánicas en SVG en las secciones oscuras.
Border radius generoso (12-20px), sombras cálidas con tono marrón.
Sensación de lujo accesible, spa, bienestar.

---

## 4. Roles y permisos

| Rol | Descripción |
|---|---|
| `Admin` | Tamara. Acceso total. |
| `Operario` | Cada empleada. Ve su agenda, confirma/rechaza turnos, da de alta clientes. |
| `Cliente` | Usuario registrado. Reserva turnos, usa cupones, ve historial. |

**Flujo de roles:**
- Todo usuario nuevo se registra como `Cliente`
- Tamara puede **promover** un Cliente a Operario (asignándole subservicios y comisiones)
- Tamara puede **degradar** un Operario de vuelta a Cliente (libera turnos futuros)
- No se puede degradar al Admin

**Claims JWT (5 claims):**
```
sub   → id del usuario (int como string)
rol   → "Admin" | "Operario" | "Cliente"
sexo  → "Masculino" | "Femenino" | "NoEspecifica" (usado para filtrar subservicios)
email → email del usuario
jti   → GUID único del token (trazabilidad)
```
Nota: `MapInboundClaims = false` — los claims llegan con nombres originales.

---

## 5. Base de datos — 22 tablas

### Módulo Auth + Usuarios (6 tablas)
- `usuarios` — identificador único: email. Campo `sexo` para filtrado de subservicios.
- `refresh_tokens` — SHA-256 hashed, nunca plano
- `password_reset_tokens` — TTL 1 hora, un solo uso
- `disponibilidad_salon` — días que el salón NO trabaja (lista de excepciones)
- `disponibilidad_operario` — qué días trabaja cada operaria
- `operario_vistas` — qué secciones del panel puede ver cada operaria

### Módulo Servicios & Subservicios (2 tablas)
- `servicios` — agrupador (ej: "Masajes"). Tiene `categoria_imputacion_id` para imputaciones automáticas.
- `subservicios` — lo que el cliente reserva. Campos clave:
  - `precio` y `duracion_min`: nullable si tiene variantes
  - `es_pack`: true para combos/packs con renderizado especial
  - `detalle_pack`: texto con las zonas incluidas (solo si es_pack)
  - `sexo`: Masculino | Femenino | Ambos (para filtrado)
  - `requiere_silencio`: true para Masajes y Drenaje (bloquea Salón 2)

### Módulo Variantes (1 tabla)
- `variantes_subservicio` — sub-sub-servicio (ej: Alisados → "A los hombros", "A cintura")
  Aplica a: Alisados, Trenzas, Drenaje linfático

### Módulo Operarios (1 tabla)
- `operario_subservicios` — qué subservicio puede hacer cada operaria y su % comisión

### Módulo Turnos (3 tablas)
- `sesiones` — agrupa múltiples zonas de láser/descartable reservadas juntas
- `reglas_descuento_sesion` — configurable: "Láser: 3+ zonas → 15%"
- `turnos` — el corazón del sistema. `operario_id` es **NULL** cuando hay más de una
  operaria disponible (esperando que Tamara asigne manualmente)

### Módulo Cupones (2 tablas)
- `cupones` — códigos de descuento por porcentaje o monto fijo
- `cupon_usos` — historial de uso por cliente

### Módulo Imputaciones (4 tablas)
- `categorias_imputacion` — CRUD por Tamara (Ingreso/Egreso/Ambos)
- `metodos_pago` — CRUD por Tamara
- `motivos_bloqueo_salon` — CRUD por Tamara
- `imputaciones` — gastos e ingresos. Las de `origen=Automatico` son read-only.

### Módulo Emails (3 tablas)
- `configuracion_email` — fila única: días de recordatorio, horas post-turno, kill switch
- `emails_enviados` — auditoría de emails (para no enviar duplicados)
- `calificaciones` — puntuación 1-5 + comentario por turno

---

## 6. Lógica de negocio crítica

### 6.1 Restricción de silencio (Masajes)

```
Si subservicio.requiere_silencio = true (Masajes, Drenaje linfático):
  → Bloquea TODOS los turnos activos en Salón 2 (Peluquería) en ese horario

Si hay turno en Salón 2 (Peluquería):
  → Bloquea SOLO subservicios con requiere_silencio=true en ese horario
  → NO bloquea otros servicios del Salón 1

La restricción es ASIMÉTRICA:
  Masajes bloquea toda la peluquería
  Peluquería bloquea solo masajes, no el resto del Salón 1
```

### 6.2 Filtrado de subservicios por sexo

El claim `sexo` del JWT se usa en `GET /servicios` para filtrar automáticamente:
```
Cliente Masculino   → subservicios WHERE sexo IN ('Masculino', 'Ambos')
Cliente Femenino    → subservicios WHERE sexo IN ('Femenino', 'Ambos')
NoEspecifica/anónimo → todos los subservicios
  → frontend los agrupa con separadores visuales:
    "── Zonas Mujeres ──" / "── Zonas Hombres ──" / "── General ──"
Admin/Operario      → todos los subservicios activos (sin filtro)
```

### 6.3 Asignación automática de operaria

Al crear un turno (`POST /turnos` o `POST /sesiones`):
```
1. Buscar operarios activos con el subservicio asignado Y sin turno superpuesto
2. Si hay exactamente 1 → operario_id = ese operario (auto-asignado)
3. Si hay más de 1     → operario_id = NULL (Tamara elige al confirmar)
4. Si hay 0            → error OPERARIA_NO_DISPONIBLE (409)
```

**El cliente nunca elige operaria.** Si hay múltiples disponibles, Tamara
debe asignar una antes de poder confirmar el turno:
```
PATCH /api/v1/turnos/{id}/asignar-operaria  [Admin]
body: { operarioId: number }
→ Valida que el turno esté en PendienteConfirmacion
→ Valida que operario_id sea NULL
→ Valida que el operario pueda hacer el subservicio
→ Valida que el operario esté disponible en ese horario
```

Al intentar confirmar sin operaria asignada → error `OPERARIA_NO_ASIGNADA (409)`.

En el resumen final del wizard, el cliente ve:
- Si hay 1 operaria → "👤 Operaria: [Nombre]"
- Si hay múltiples → "👤 Operaria: Te informaremos quién te atenderá al confirmar tu turno 📱"

### 6.4 Estado inicial del turno

```
Creado por cliente propio o anónimo  → PendienteConfirmacion
Creado por Admin o Operario          → Confirmado (directo, sin pasar por pendiente)
```

### 6.5 Transiciones de estado válidas

```
PendienteConfirmacion → Confirmado    (Admin/Operario confirma — requiere operario_id ≠ null)
PendienteConfirmacion → Rechazado     (Admin/Operario rechaza con motivo)
Confirmado            → Cancelado     (cualquiera, sin cargo — idealmente con 24hs+)
Confirmado            → Multa         (cliente avisó con <24hs — se cobra 50%)
Confirmado            → Ausente       (no se presentó sin avisar)
Confirmado            → Realizado     (se atendió — requiere metodoPagoId + precioFinal)
Confirmado            → Impago        (se atendió pero no pagó)
Confirmado            → Publicidad    (turno sin cobro, contenido/prensa)
Multa                 → Confirmado    (reagendó y pagó el 50%)
Cualquier otra        → TRANSICION_INVALIDA (409)
```

### 6.6 Imputaciones automáticas al realizar un turno

Al marcar un turno como `Realizado`:
```
1. INGRESO automático:
   categoria_id = servicio.categoria_imputacion_id
   monto = precio_final
   origen = Automatico

2. EGRESO de comisión (solo si operario ≠ Admin y tiene comisión > 0):
   categoria_id = id de "Comisión Operaria"
   monto = precio_final × porcentaje_comision
   origen = Automatico

Las imputaciones Automatico son READ-ONLY — no se pueden editar ni borrar.
PUT /imputaciones/{id} o DELETE /imputaciones/{id} con origen=Automatico → 403
```

### 6.7 Sesiones y descuento automático por zonas

```
POST /sesiones con N zonas del mismo servicio (Láser o Descartable):
  Si N >= reglas_descuento_sesion.zonas_minimas para ese servicio:
    → sesion.descuento_auto_pct = regla.porcentaje_descuento
    → se aplica a precio_final de TODOS los turnos de la sesión

Valores por defecto (configurables por Tamara desde el panel):
  Depilación Láser:        3+ zonas → 15% descuento
  Depilación Descartable:  3+ zonas → 10% descuento

Los packs (es_pack=true) NO usan sesiones.
Su precio ya tiene el descuento incorporado.
Un pack y zonas sueltas son mutuamente excluyentes.
```

### 6.8 Límites de turnos activos

```
"Activo" = estado IN (PendienteConfirmacion, Confirmado)
Cliente anónimo (por teléfono): máx 2 turnos activos
Cliente registrado:             máx 4 turnos activos
```

### 6.9 Cancelación con multa

```
Si el cliente cancela con menos de 24hs de anticipación:
  → Estado: Multa
  → Se cobra el 50% del precio del servicio
  → El cliente puede reagendar: lo pagado se descuenta del precio final

La multa se aplica manualmente por la operaria/admin.
El sistema no la aplica automáticamente.
```

### 6.10 Cupones

```
Validaciones al usar un cupón:
  - activo = true
  - fecha_desde <= hoy <= fecha_hasta
  - si tiene usos_maximos: usos_actuales < usos_maximos
  - si un_uso_por_cliente=true: cliente no usó este cupón antes

Tipos de descuento:
  Porcentaje: precio_final = precio_base × (1 - valor/100)
  MontoFijo:  precio_final = precio_base - valor (mínimo 0)

Solo clientes REGISTRADOS pueden usar cupones.
Los anónimos no ven el paso de cupones en el wizard.

Cupones disponibles para el cliente: ordenados por fecha_hasta ASC
(los que vencen antes, primero — estilo PedidosYa).
```

### 6.11 Calificaciones

```
- Solo se puede calificar un turno en estado Realizado
- Solo el cliente del turno puede calificarlo (validación server-side)
- Una calificación por turno (UNIQUE turno_id en la tabla)
- Puntuación: 1 a 5 (entero)
- Requiere JWT del cliente → el link de calificación se envía por WhatsApp
  con el token como query param → frontend lo usa como Bearer
- NO se muestran calificaciones individuales de operarias en el portal
  del cliente (para evitar discriminación entre empleadas)
```

### 6.12 Drenaje linfático — advertencia médica

```
El subservicio "Drenaje linfático" requiere indicación médica.
En el wizard de reserva se muestra un banner de advertencia:
⚠️ "Este servicio requiere indicación médica.
    Asegurate de presentar tu receta el día del turno."
```

### 6.13 Disponibilidad — consulta pública

```
GET /api/v1/turnos/disponibilidad
Params: fecha + subservicioId + varianteId? + duracionMin?
→ No recibe operarioId (el sistema lo maneja internamente)
→ Devuelve horarios donde al menos una operaria activa con ese
  subservicio esté disponible (sin turno superpuesto)
→ La selección de operaria la hace el sistema, no el cliente
```

### 6.14 Rate limiting

```
POST /api/v1/turnos              → máx 5 requests / 10min / IP
POST /api/v1/auth/register       → máx 3 requests / hora / IP
POST /api/v1/auth/forgot-password → máx 3 requests / hora / IP
```

### 6.15 Recuperación de historial al registrarse

```
Al registrar un cliente nuevo con teléfono:
  UPDATE turnos
  SET cliente_id = nuevo_usuario.id
  WHERE telefono_anonimo = request.telefono
    AND cliente_id IS NULL
→ Sus turnos anteriores como anónimo quedan vinculados a su cuenta
```

---

## 7. Comunicaciones con el cliente

### WhatsApp (gratis, manual — la operaria hace click y presiona enviar)

| Momento | Quién lo manda |
|---|---|
| Turno confirmado | Operaria/Admin |
| Turno rechazado | Operaria/Admin |
| Recordatorio manual | Operaria/Admin |
| Link de calificación post-turno | Operaria/Admin |

El sistema genera el link `wa.me` pre-armado con el mensaje completo.
La operaria solo presiona enviar. Cero costo, cero infraestructura.

Formato del número: `549{numero}` (prefijo Argentina, sin 0 inicial ni 15).

### Email (automático via Resend)

Solo clientes **registrados** reciben emails (requieren email).
Los anónimos no reciben emails nunca.

| Trigger | Automático | Configurable |
|---|---|---|
| Registro nuevo | ✅ Inmediato | No |
| Confirmación de turno | ✅ Inmediato | No |
| Rechazo de turno | ✅ Inmediato | No |
| Recordatorio de turno | ✅ Background job | Sí (1 o 2 días antes) |
| Post-turno calificación | ✅ Background job | Sí (X horas después) |
| Recuperación de contraseña | ✅ Inmediato | No |
| Cambio de contraseña | ✅ Inmediato | No |
| Campaña/publicidad | Manual (Tamara la dispara) | No aplica |

**Background job:** corre cada 15 minutos. Usa `emails_enviados` para
garantizar idempotencia (no envía el mismo email dos veces).
El post-turno NO se envía al marcar Realizado — el job lo detecta
según `postturno_horas_despues` de la configuración.

---

## 8. Servicios y precios (Marzo 2026)

### Depilación Láser — Salón 1

**Zonas Mujeres** (es_pack=false, sexo=Femenino):
Bozo $5.000 | Mentón $6.100 | Rostro completo $15.400 | Axila $9.300
Cavado bikini $10.800 | Cavado completo $12.400 | Media pierna $13.300
Pierna completa $15.800 | Brazo completo $13.400 | Antebrazo $10.300
Tira de cola $5.100 | Glúteos $11.100 | Línea alba $6.400
Empeine $5.100 | Patilla $6.000

**Packs Mujeres** (es_pack=true, sexo=Femenino):
Pack 1: Ax+CC+MP+(TC opc) $28.500
Pack 3: Ax+CC+TC+PC $29.900
Pack 4: RC+Ax+PC $28.500
Pack 5: Ax+CC+TC $20.100
Completo $36.000

**Zonas Hombres** (es_pack=false, sexo=Masculino):
Piernas completas $16.800 | Media pierna $14.400 | Rostro completo $19.200
Barba $14.400 | Espalda $16.300 | Pecho $11.500 | Abdomen $11.500
Axilas $10.000 | Brazo completo $14.400 | Antebrazo $10.900
Hombros $7.600 | Glúteos $12.500 | Tira de cola $6.000
Pubis (ingle) $10.900 | Pubis (ingle+test.) $14.400 | Cuello $9.400
Manos $6.000 | Patillas-pómulos $7.300 | Empeine $5.100

**Packs Hombres** (es_pack=true, sexo=Masculino):
Pack 9: Ax+Pecho+Pubis+(LA opc) $29.100
Pack 10: Ax+Pecho+Abd+PC $36.500
Pack 11: Abd+Pubis+PC $28.000
Pack Completo (35%-) $52.000

**Regla de descuento:** 3+ zonas sueltas → 15% automático (configurable)

### Depilación Descartable — Salón 1

**Zonas Mujeres** (es_pack=false, sexo=Femenino):
Perfilado de cejas $8.700 | Bozo $5.000 | Rostro completo $12.000
Axilas $5.500 | Brazos completos $12.000 | Abdomen $8.000
Espalda $15.000 | Cavado completo $10.900 | Cavado bikini $6.900
Tira de cola $5.500 | Línea alba $5.500
Piernas completas $16.000 | Media pierna $9.000 | Empeine $3.000

**Zonas Hombres** (es_pack=false, sexo=Masculino):
Perfilado de cejas $8.700 | Bozo $7.000 | Barba (incl. bozo) $10.000
Fosas nasales $4.700 | Axilas $7.000 | Brazos completos $12.000
Abdomen $8.000 | Espalda $15.000 | Pubis $10.000
Glúteos $10.000 | Tira de cola $5.500 | Línea alba $5.500
Piernas completas $16.000 | Media pierna $9.000
Empeine $3.000 | Rostro completo $12.000

**Regla de descuento:** 3+ zonas sueltas → 10% automático (configurable)

### Peluquería — Salón 2 (sexo=Ambos)

**Tratamientos** (es_pack=false):
Nutrición intensa $22.000/60min | Biotínico $24.000/60min
RDF $25.000/60min | Cauterización antifrizz $25.000/60min
Lavado+brushing+planchita $20.500/45min
Hidronutritivo+rep.lípidos $22.500/60min | Matizador $24.000/60min
Corte de puntas $8.000/20min | Botox capilar $25.000/60min
Peinado social $25.000/60min
Maquillaje social $35.000/60min | Maquillaje novia/quinceañera $46.000/90min

**Alisados** (precio=null, tiene variantes):
A los hombros $26.000/90min | A antebrazo $38.000/120min
A cintura $51.000/150min | A la cola $67.000/180min

**Trenzas** (precio=null, tiene variantes):
Superiores parciales $4.400 | Superiores completas $6.600
Vincha trenzada $4.000 | Laterales parciales $4.400
Laterales completas $5.200 | Caribeñas $13.000
Africanas $12.000 | Africanas sup+caribeñas post $11.000
Boxeadoras $7.500 | Trencitas $8.000

**Promos** (es_pack=true):
Biotina x2 (c/15 días + corte) $38.400
Biotina x4 (semanal) $42.000
Hidronutrición x2 (c/15 días + corte) $37.600
Matizador x2 (c/15 días) $36.800

### Cejas & Pestañas — Salón 1 (sexo=Ambos)

**Individuales** (es_pack=false):
Lash lifting $15.500/60min | Laminado de cejas $15.500/60min
Perfilado de cejas $8.700/20min | Tinte de pestañas $8.100/30min
Pestañas PXP $11.000/90min | Retoques pestañas $9.000/60min

**Combos** (es_pack=true, multiselección exclusiva):
Lifting+Laminado cejas $38.300/110min
Lifting+Laminado+Perfilado+Tinte $38.300/150min
Lifting+Tinte $18.900/80min
Perfilado+Laminado $19.300/70min
Lifting+Tinte+Perfilado $25.600/100min

### Cosmetología/Facial — Salón 1 (sexo=Ambos)

Dermaplaing $17.000/60min
Limpieza facial profunda con extracciones $15.000/60min
Renueva y reafirma $19.000/60min
Limpieza profunda espalda $13.000/45min

### Masajes — Salón 1 (sexo=Ambos, requiere_silencio=true)

**Masajes** (es_pack=false):
Relajante cuerpo completo $27.000/60min
Descontracturante espalda $18.000/40min
Piernas cansadas $15.000/40min

**Drenaje linfático** (precio=null, tiene variantes, ⚠️ requiere receta médica):
Cuerpo completo (con rostro) $30.000/60min
Rostro (mascarilla hidratante) $10.000/30min
Cuerpo completo (sin rostro) $22.500/50min
Piernas completas $15.000/40min

**Promos** (es_pack=true):
2 sesiones descontracturantes $28.000

---

## 9. Flujo de autenticación del cliente (portal público)

```
Landing → botón "Ingresar" en header → /login (página dedicada)

Landing → botón "Reservar turno":
  Si logueado (cualquier rol) → /reservar (wizard directo)
  Si NO logueado              → ReservaTurnoModal con beneficios:
    🎟️ Cupones exclusivos
    📋 Historial de turnos
    ⚡ Reserva más rápida
    ⭐ Calificá tus servicios

    Botones del modal:
    [Ingresar con Google]  → Google OAuth directo
    [Ingresar con email]   → /login?redirect=reserva
    [Registrarme gratis]   → /registro?redirect=reserva
    [Continuar sin cuenta] → wizard anónimo (solo nombre + teléfono)

Post login con ?redirect=reserva:
  → navigate('/?iniciar_reserva=1', { replace: true })
  → LandingPage detecta el param → navigate('/reservar', { replace })

Si el cliente autenticado entra con Google y le falta `telefono`
o tiene `sexo = NoEspecifica`:
  → frontend redirige a `/completar-perfil`
  → pide `telefono` + `sexo`
  → guarda vía `PATCH /auth/completar-perfil`
  → después vuelve al flujo de reserva si venía con `?redirect=reserva`
```

**Panel interno** (Admin/Operario): entran directamente a `/panel`
y el ProtectedRoute redirige a `/login` si no hay token.

---

## 10. Wizard de reserva — /reservar (IMPLEMENTADO como prototipo funcional)

Página dedicada (no popup). Completamente responsive (mobile first).

**Pasos actuales (6 + éxito, sin selección de operaria — el sistema la asigna):**
```
Tus datos → Servicio → Selección → Horario → Cupón → Confirmar → Éxito
```

Cambios de negocio ya reflejados en frontend:
- `sexo` se pide al inicio y es obligatorio en UI pública (`Femenino` | `Masculino`)
- si `sexo = Masculino`, el frontend oculta `Salón 2`
- el cliente nunca elige operaria
- al cambiar de fase, el scroll vuelve arriba de todo
- si el usuario vuelve atrás, se limpia el estado de los pasos posteriores para no arrastrar selecciones inválidas

**Sidebar resumen:**
- No aparece en el primer paso de datos
- Desktop: sidebar fijo derecho con lista de items, descuentos y total
- Mobile: barra fija bottom "N zonas · ~Xmin · $XX.XXX [▲]"
  Al tocar → drawer con el resumen completo

**Barra de progreso animada sticky:**
- Nodo completado: círculo dorado con ✓ animado
- Nodo actual: borde dorado grueso con pulso suave
- Nodo pendiente: borde gris, número muted
- Línea conectora se extiende con animación al avanzar

**Bifurcación por tipo de servicio:**

*Depilación Láser/Descartable y Cejas&Pestañas:*
- Dos columnas (desktop) / Tabs (mobile): "Combos" | "Zonas"
- Combos: selección única (radio), precio fijo, excluye zonas sueltas
- Zonas: multi-select (checkboxes), precio acumulado
- 3+ zonas → banner dorado "¡Descuento X% aplicado!"
- Elegir combo → zonas deshabilitadas con overlay explicativo
- Elegir zonas → combos deshabilitados
- Si se elige combo → el frontend limpia automáticamente todas las selecciones individuales

*Masajes/Peluquería/Facial:*
- Selección única (radio)
- Masajes: sección separada para Drenaje con banner ⚠️ de receta médica
- Peluquería: subservicios agrupados, Alisados y Trenzas muestran
  selector de variante al elegirlos

**Horario:**
- Ya no usa la tabla semanal vieja
- Hoy renderiza un calendario mensual visual + panel derecho de horarios
- Los días con disponibilidad se marcan con dot dorado y texto activo
- Los horarios se agrupan por franja (`Mañana`, `Tarde`, `Noche`)
- La demo actual sigue siendo mock y usa bloques de 30 minutos

**Cupón:**
- Si cliente autenticado: muestra cupones simulados + input manual
- Si invitado: solo input manual
- El resumen actualiza en tiempo real

**Confirmar:**
- Resumen completo del turno
- Los datos ya se piden al inicio del wizard, no en este paso
- Aviso política 24hs
- "Confirmar turno →" con loading state
- A nivel visual está resuelto; a nivel integración real con backend sigue pendiente

**Pantalla de éxito:**
- Ya quedó alineada a una maqueta HTML aprobada
- Hero oscuro con botánicas, card principal dividida, timeline vertical y footer de acciones
- Mensaje actual: "Tu solicitud fue enviada"
- Mantiene la lógica de "pendiente de confirmación" / confirmación por WhatsApp

---

## 11. Panel Admin — Dashboard y Estadísticas (PENDIENTE)

### 5 KPIs (comparación semanal/mensual/custom)
1. 💰 Ingresos — suma precio_final turnos Realizados
2. 📅 Turnos — cantidad total
3. 📊 Ocupación — realizados / slots disponibles × 100
4. 👥 Clientes Nuevos — primer turno en el período
5. ⭐ Calificación — promedio del período

Cada KPI: valor actual, valor período anterior, delta % con flecha, sparkline.

### 6 Gráficos
1. Ingresos vs Egresos (área) — serie temporal, tabla resumen
2. Ingresos por servicio (barras apiladas) — leyenda clickeable
3. Turnos por estado (dona) — con métricas de tasa asistencia
4. Ocupación por día de semana (barras horizontales)
5. Ranking de operarias (tabla) — Turnos, Ingresos, Comisión, Asistencia
6. Calificaciones — distribución 1-5 + últimas 10 con comentarios

### Alertas del panel
- Turnos pendientes de confirmación > X horas sin respuesta
- Turnos pendientes SIN operaria asignada (requieren atención urgente)
- Subservicios sin operarias asignadas (no aparecen en el portal)
- Operarias sin disponibilidad cargada esta semana
- Cupones próximos a vencer con usos disponibles

---

## 12. Panel Operaria — vistas habilitadas por Tamara

Tamara configura qué secciones puede ver cada operaria:

| Sección | Default | Ruta |
|---|---|---|
| Mi agenda | ✅ siempre visible | `/panel/agenda` |
| Mis turnos | ✅ default on | `/panel/turnos` |
| Mis comisiones | ✅ default on | `/panel/mis-comisiones` |
| Mi calificación | ❌ default off | `/panel/calificaciones/mis` |
| Mis estadísticas | ❌ default off | `/panel/mis-estadisticas` |

**Vista "Mis Comisiones":** turnos agrupados por día, con precio del turno
y comisión calculada. Selector: Esta semana / Semana pasada / Este mes.
Total: N turnos | Ingresos generados: $X | Mi comisión: $Y

---

## 13. Estado actual del frontend

### Implementado ✅
- Setup completo (Vite, Tailwind v4, sistema de diseño, alias @/)
- Routing completo con ProtectedRoute (roles + debeCambiarPassword)
- Axios interceptores JWT + refresh automático
- authStore y toastStore (Zustand)
- Componentes UI base (Button, Input, Badge, Card, Modal, Select, Toast, Spinner)
- AppLayout (Sidebar + Header) para panel interno
- PublicLayout + PublicHeader (con scroll detection y transparencia)
- LoginPage — diseño split 2 columnas, funcional con Google OAuth
- RegistroPage — registro normal + alta/ingreso con Google
- ForgotPasswordPage — solicitud de recuperación por email
- ResetPasswordPage — nueva contraseña vía token
- CambiarPasswordPage — cambio obligatorio de contraseña en primer ingreso
- CompletarPerfilPage — pantalla post-Google para completar `telefono` y `sexo`
- ReservaTurnoModal — modal de entrada al wizard con beneficios
- useReservaTurno hook — centraliza lógica "¿modal o wizard directo?"
- useAuthBackRedirect — controla el botón atrás del navegador en pantallas auth
- needsProfileCompletion — detecta clientes con perfil incompleto post-Google
- ReservaTurnoPage — wizard público real, interactivo, de alta fidelidad
- LandingPage completa con 4 secciones:
  - HeroSection (100vh, oscuro, botánicas SVG, CTAs)
  - ServiciosSection (consume GET /servicios real, skeletons)
  - CalificacionesSection (DATOS MOCKEADOS — ver pendiente abajo)
  - FooterSection

### Parcial 🔄 (ruta existe, contenido placeholder)
- MisTurnosPage, MisCuponesPage, MiPerfilPage
- DashboardPage, AgendaPage, TurnosPage, TurnoDetallePage
- ServiciosPage, OperariosPage, OperarioDetallePage
- ClientesPage, CuponesPage, ImputacionesPage
- EstadisticasPage, ComisionesPage, MisComisionesPage
- CalificacionesPage, CalificarPage, DisponibilidadPage
- ConfigEmailPage, CategoriasPage, MetodosPagoPage, MotivosBloqueoPage

### Pendiente backend para frontend ⚠️
- `GET /estadisticas/calificaciones/publico` (acceso anónimo)
  → Necesario para CalificacionesSection de la landing
  → Respuesta: { promedioGlobal, total, ultimasCalificaciones[] }

### Pendiente backend (background job) ⚠️
- El `EmailsBackgroundService` está implementado y registrado
- El background job de emails YA ESTÁ ACTIVO (v6 del SOT)

---

## 14. Códigos de error del backend

| Código | Status | Descripción |
|---|---|---|
| `CREDENCIALES_EN_USO` | 409 | Email ya registrado |
| `CREDENCIALES_INVALIDAS` | 401 | Email o password incorrecto |
| `CUENTA_BLOQUEADA` | 403 | Usuario bloqueado |
| `TOKEN_INVALIDO_O_EXPIRADO` | 401 | JWT o refresh inválido |
| `TOKEN_GOOGLE_INVALIDO` | 400 | idToken de Google no válido |
| `USAR_GOOGLE_AUTH` | 400 | Cuenta Google, usar /auth/google |
| `NO_PERMITIDO` | 403 | Sin permiso para la operación |
| `TRANSICION_INVALIDA` | 409 | Cambio de estado no permitido |
| `OPERARIA_NO_DISPONIBLE` | 409 | Sin operarias libres en ese horario |
| `OPERARIA_NO_ASIGNADA` | 409 | Confirmar sin operaria asignada |
| `TURNO_NO_REALIZADO` | 400 | Solo se califican turnos Realizados |
| `YA_CALIFICADO` | 400 | El turno ya tiene calificación |
| `CUPON_YA_USADO` | 409 | Cliente ya usó ese cupón |
| `CUPON_AGOTADO` | 409 | Sin usos disponibles |
| `CUPON_EXPIRADO` | 400 | Cupón vencido |
| `SIN_DESTINATARIOS` | 400 | Campaña sin emails |

---

## 15. Próximos pasos en orden

1. **[FRONTEND + BACKEND]** Conectar `/reservar` con catálogo y disponibilidad reales
2. **[FRONTEND]** Panel interno — módulos en este orden:
   - TurnosPage + TurnoDetallePage (con acción de asignar operaria y confirmar)
   - AgendaPage (FullCalendar)
   - DashboardPage (KPIs + gráficas)
   - ServiciosPage (CRUD)
   - OperariosPage + OperarioDetallePage
   - Resto de módulos admin
3. **[BACKEND]** Endpoint público `GET /estadisticas/calificaciones/publico`

---

*Documento generado en Mayo 2026 para migración de contexto.*
*Adjuntar junto con: ETEREO_BACKEND_SOT.md, ETEREO_FRONTEND_SOT.md, ETEREO_CONTRATO_SOT.md*
