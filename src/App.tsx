import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useAuthStore } from '@/store/authStore'
import { Toaster } from '@/components/ui/Toaster'
import AppLayout from '@/components/layout/AppLayout'
import PublicLayout from '@/components/layout/PublicLayout'

// Público
import LandingPage from '@/pages/public/LandingPage'

// Auth — layout propio completo, fuera del PublicLayout
import LoginPage from '@/pages/auth/LoginPage'
import RegistroPage from '@/pages/auth/RegistroPage'
import CambiarPasswordPage from '@/pages/auth/CambiarPasswordPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import CompletarPerfilPage from '@/pages/auth/CompletarPerfilPage'
import { needsProfileCompletion } from '@/lib/authFlow'

// Portal (cliente)
import ReservaTurnoPage from '@/pages/portal/ReservaTurnoPage'
import MiCuentaPage from '@/pages/portal/MiCuentaPage'
import MisTurnosPage from '@/pages/portal/MisTurnosPage'
import MisCuponesPage from '@/pages/portal/MisCuponesPage'
import MiPerfilPage from '@/pages/portal/MiPerfilPage'
import CalificarPage from '@/pages/calificaciones/CalificarPage'

// Panel interno
import DashboardPage from '@/pages/dashboard/DashboardPage'
import AgendaPage from '@/pages/agenda/AgendaPage'
import TurnosPage from '@/pages/turnos/TurnosPage'
import TurnoDetallePage from '@/pages/turnos/TurnoDetallePage'
import ClientesPage from '@/pages/clientes/ClientesPage'
import MisComisionesPage from '@/pages/comisiones/MisComisionesPage'
import DisponibilidadPage from '@/pages/disponibilidad/DisponibilidadPage'

// Admin exclusivo
import ServiciosPage from '@/pages/servicios/ServiciosPage'
import OperariosPage from '@/pages/operarios/OperariosPage'
import OperarioDetallePage from '@/pages/operarios/OperarioDetallePage'
import CuponesPage from '@/pages/cupones/CuponesPage'
import ImputacionesPage from '@/pages/imputaciones/ImputacionesPage'
import EstadisticasPage from '@/pages/estadisticas/EstadisticasPage'
import ComisionesPage from '@/pages/comisiones/ComisionesPage'
import CalificacionesPage from '@/pages/calificaciones/CalificacionesPage'
import ConfigEmailPage from '@/pages/config/ConfigEmailPage'
import CategoriasPage from '@/pages/imputaciones/catalogos/CategoriasPage'
import MetodosPagoPage from '@/pages/imputaciones/catalogos/MetodosPagoPage'
import MotivosBloqueoPage from '@/pages/imputaciones/catalogos/MotivosBloqueoPage'

// ─── PostAuthRedirectHandler ──────────────────────────────────────────────────
// Safety-net para RegistroPage y otras páginas que terminen con ?redirect=reserva.
// LoginPage lo maneja inline; este handler cubre el resto de casos.
// Redirige a / con ?iniciar_reserva=1 → LandingPage lo detecta y navega a /reservar.

function PostAuthRedirectHandler() {
  const { usuario } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (!usuario) return
    if (usuario.debeCambiarPassword) return

    const redirectToReserva = searchParams.get('redirect') === 'reserva'

    if (needsProfileCompletion(usuario)) {
      if (location.pathname !== '/completar-perfil') {
        navigate(
          redirectToReserva ? '/completar-perfil?redirect=reserva' : '/completar-perfil',
          { replace: true },
        )
      }
      return
    }

    if (searchParams.get('redirect') === 'reserva') {
      navigate('/?iniciar_reserva=1', { replace: true })
    }
  }, [usuario, location.pathname, location.search, navigate, searchParams])

  return null
}

// ─── ProtectedRoute ──────────────────────────────────────────────────────────

interface ProtectedRouteProps {
  roles?: string[]
}

function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { accessToken, usuario } = useAuthStore()

  if (!accessToken || !usuario) {
    return <Navigate to="/login" replace />
  }

  if (usuario.debeCambiarPassword) {
    return <Navigate to="/cambiar-password" replace />
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

// ─── PanelRedirect ────────────────────────────────────────────────────────────

function PanelRedirect() {
  const usuario = useAuthStore((s) => s.usuario)
  if (usuario?.rol === 'Operario') return <Navigate to="/panel/agenda" replace />
  return <Navigate to="/panel/dashboard" replace />
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string

  return (
    <GoogleOAuthProvider clientId={googleClientId ?? ''}>
      <BrowserRouter>
        <PostAuthRedirectHandler />
        <Routes>

          {/* ── Rutas públicas con PublicLayout (header + outlet) ── */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/reservar" element={<ReservaTurnoPage />} />
          </Route>

          {/* ── Auth — layout propio completo, sin PublicHeader ── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/cambiar-password" element={<CambiarPasswordPage />} />
          <Route element={<ProtectedRoute roles={['Cliente']} />}>
            <Route path="/completar-perfil" element={<CompletarPerfilPage />} />
          </Route>

          {/* ── Calificar — anónimo con token JWT en query param ── */}
          <Route path="/calificar" element={<CalificarPage />} />

          {/* ── Rutas cliente autenticado ── */}
          <Route element={<ProtectedRoute roles={['Cliente']} />}>
            <Route path="/mi-cuenta" element={<MiCuentaPage />} />
            <Route path="/mis-turnos" element={<MisTurnosPage />} />
            <Route path="/mis-cupones" element={<MisCuponesPage />} />
            <Route path="/mi-perfil" element={<MiPerfilPage />} />
          </Route>

          {/* ── Panel interno (Admin + Operario) ── */}
          <Route element={<ProtectedRoute roles={['Admin', 'Operario']} />}>
            <Route element={<AppLayout />}>
              <Route path="/panel" element={<PanelRedirect />} />
              <Route path="/panel/dashboard" element={<DashboardPage />} />
              <Route path="/panel/agenda" element={<AgendaPage />} />
              <Route path="/panel/turnos" element={<TurnosPage />} />
              <Route path="/panel/turnos/:id" element={<TurnoDetallePage />} />
              <Route path="/panel/clientes" element={<ClientesPage />} />
              <Route path="/panel/mis-comisiones" element={<MisComisionesPage />} />
              <Route path="/panel/disponibilidad" element={<DisponibilidadPage />} />

              {/* ── Admin exclusivo ── */}
              <Route element={<ProtectedRoute roles={['Admin']} />}>
                <Route path="/panel/servicios" element={<ServiciosPage />} />
                <Route path="/panel/operarios" element={<OperariosPage />} />
                <Route path="/panel/operarios/:id" element={<OperarioDetallePage />} />
                <Route path="/panel/cupones" element={<CuponesPage />} />
                <Route path="/panel/imputaciones" element={<ImputacionesPage />} />
                <Route path="/panel/estadisticas" element={<EstadisticasPage />} />
                <Route path="/panel/comisiones" element={<ComisionesPage />} />
                <Route path="/panel/calificaciones" element={<CalificacionesPage />} />
                <Route path="/panel/config/email" element={<ConfigEmailPage />} />
                <Route path="/panel/catalogos/categorias" element={<CategoriasPage />} />
                <Route path="/panel/catalogos/metodos-pago" element={<MetodosPagoPage />} />
                <Route path="/panel/catalogos/motivos-bloqueo" element={<MotivosBloqueoPage />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster />
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}
