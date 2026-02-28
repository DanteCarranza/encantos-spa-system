import React from 'react'
import { Routes, Route, BrowserRouter  } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/auth/PrivateRoute'
import PublicRoute from './components/auth/PublicRoute'

// Layout
import MainLayout from './components/layout/MainLayout'
import AdminLayout from './components/layout/AdminLayout'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPassword from './pages/auth/ForgotPage'
import DashboardPage from './pages/admin/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import SpaBookingPage from './pages/SpaBookingPage' // CAMBIO: Nueva página de reservas SPA
import ContactPage from './pages/ContactPage'
import ServicesPage from './pages/ServicesPage'
import AboutPage from './pages/AboutPage' 

// Admin Pages
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import VerifyEmail from './components/auth/Verifyemail';
import ResetPassword from './components/auth/ResetPassword';
import AdminServicesPage from './pages/admin/AdminServicesPage'

import ModuleSelectorPage from './pages/admin/ModuleSelectorPage'
import SnacksDashboard from './pages/admin/snacks/SnacksDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import SnacksProductsPage from './pages/admin/snacks/SnacksProductsPage'
import SnacksLayout from './components/layout/SnacksLayout'
import POSPage from './pages/admin/snacks/POSPage'
import CashPage from './pages/admin/snacks/CashPage'
import ReportsPage from './pages/admin/snacks/ReportsPage'
import WalletPage from './pages/admin/snacks/WalletPage'
import CategoriesPage from './pages/admin/snacks/CategoriesPage'
import SuppliersPage from './pages/admin/snacks/SuppliersPage'
import PurchasesPage from './pages/admin/snacks/PurchasesPage'
import ShrinkagePage from './pages/admin/snacks/ShrinkagePage'
import AdminReportsPage from './pages/admin/AdminReportsPage'
import TrackBookingPage from './pages/TrackBookingPage'

import TherapistReportsPage from './pages/admin/TherapistReportsPage'
import SchedulePage from './pages/admin/SchedulePage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminInvoicesPage from './pages/admin/AdminInvoicesPage'

import AulaVirtualLayout from './components/layout/AulaVirtualLayout'
import AulaVirtualDashboard from './pages/aulavirtual/AulaVirtualDashboard'
import PagosPage from './pages/aulavirtual/PagosPage'
import EstudiantesPage from './pages/aulavirtual/EstudiantesPage'
import CursosPage from './pages/aulavirtual/CursosPage'
import ReportesPage from './pages/aulavirtual/ReportesPage'
import ComprobantesPage from './pages/aulavirtual/ComprobantesPage'

import CalendarioPagosPage from './pages/aulavirtual/CalendarioPagosPage'
import MetasPage from './pages/aulavirtual/MetasPage'
import TherapistsManagementPage from './pages/admin/TherapistsManagementPage'
import RefundsManagementPage from './pages/admin/RefundsManagementPage'
import ReclamacionesPage from './pages/public/ReclamacionesPage'
import AdminReclamacionesPage from './pages/admin/AdminReclamacionesPage'
import SeguimientoReclamacionesPage from './pages/public/SeguimientoReclamacionesPage'



import './App.css'

function App() {
  return (
    <BrowserRouter basename="/spa"> 
    <AuthProvider>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/producto/:id" element={<ProductDetailPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/reservar-cita" element={<SpaBookingPage />} /> {/* CAMBIO */}
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/servicios" element={<ServicesPage />} />
          <Route path="/nosotros" element={<AboutPage />} />
          <Route path="/seguimiento" element={<TrackBookingPage />} />
          <Route path="/mi-perfil" element={<ProfilePage />} />
          <Route path="/libro-reclamaciones" element={<ReclamacionesPage />} />
          <Route path="/seguimiento-reclamaciones" element={<SeguimientoReclamacionesPage />} />


        </Route>

        {/* Rutas de autenticación */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/recuperar" element={<ForgotPassword />} />
          <Route path="/verificar-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} /> 

        </Route>


        {/* Rutas del Aula Virtual */}
        <Route path="/aulavirtual" element={<AulaVirtualLayout />}>
  <Route index element={<AulaVirtualDashboard />} />
  <Route path="dashboard" element={<AulaVirtualDashboard />} />
  <Route path="pagos" element={<PagosPage />} />
  <Route path="estudiantes" element={<EstudiantesPage />} />
  <Route path="cursos" element={<CursosPage />} />
  <Route path="comprobantes" element={<ComprobantesPage />} />
  <Route path="calendario" element={  <CalendarioPagosPage />} />
  <Route path="metas" element={ <MetasPage /> } />
  <Route path="reportes" element={ <ReportesPage /> } />


 
</Route>

        {/* Rutas privadas - Usuario */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>
        </Route>

  {/* Rutas privadas - Admin */}
<Route path="/admin" element={<PrivateRoute requiredRole="admin" />}>
  {/* Página de selección de módulos */}
  <Route index element={<ModuleSelectorPage />} />

   {/* Rutas SPA */}
   <Route path="spa" element={<AdminLayout />}>
    <Route path="dashboard" element={<DashboardPage />} />
    <Route path="productos" element={<AdminServicesPage />} />
    <Route path="pedidos" element={<AdminOrdersPage />} />
    <Route path="citas" element={<AdminAppointmentsPage />} />
    <Route path="usuarios" element={<AdminUsersPage />} />
    <Route path="configuracion" element={<AdminSettingsPage />} />
    <Route path="reportes" element={<AdminReportsPage />} />
    <Route path="terapeutas" element={<TherapistReportsPage />} />
    <Route path="horarios" element={<SchedulePage />} />
    <Route path="categorias" element={<AdminCategoriesPage />} /> 
    <Route path="facturacion" element={<AdminInvoicesPage />} />
    <Route path="terapeutas2" element={<TherapistsManagementPage />} />
    <Route path="devoluciones" element={<RefundsManagementPage />} />
    <Route path="reclamaciones" element={<AdminReclamacionesPage />} />

  </Route>
  
  {/* Rutas Snacks */}
  <Route path="snacks" element={<SnacksLayout />}>
  <Route path="dashboard" element={<SnacksDashboard />} />
  <Route path="productos" element={<SnacksProductsPage />} />
  <Route path="pos" element={<POSPage />} />
  <Route path="caja" element={<CashPage />} />
  <Route path="billetera" element={<WalletPage />} />
  <Route path="categorias" element={<CategoriesPage />} />
  <Route path="proveedores" element={<SuppliersPage />} />
  <Route path="compras" element={<PurchasesPage />} />
  <Route path="mermas" element={<ShrinkagePage />} />
  <Route path="reportes" element={<ReportsPage />} />


</Route>
</Route>

         {/*  <Route element={<AdminLayout />}>
            <Route path="/admin" element={<DashboardPage />} />*/}

              {/* <Route path="/admin/productos" element={<AdminProductsPage />} />*/}
            {/* <Route path="/admin/productos" element={<AdminServicesPage />} />

            <Route path="/admin/pedidos" element={<AdminOrdersPage />} />
            <Route path="/admin/citas" element={<AdminAppointmentsPage />} />
            <Route path="/admin/usuarios" element={<AdminUsersPage />} />
            <Route path="/admin/configuracion" element={<AdminSettingsPage />} />

          </Route>*/}

          


        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
    </BrowserRouter>

  )
}

export default App