import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import ProtectedRoute from '@/presentation/routes/ProtectedRoute';
import Layout from '@/presentation/pages/layouts/Layout';
import ScrollToTop from '@/presentation/components/ScrollToTop';
import { Spinner } from '@/shared/ui';
import ErrorBoundary from '@/shared/components/ErrorBoundary';

const ProtectedLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--bg-canvas)]">
    <Spinner size="lg" />
  </div>
);

const AdminLayout = React.lazy(() => import('@/presentation/pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = React.lazy(() => import('@/presentation/pages/admin/Dashboard').then(m => ({ default: m.AdminDashboard })));
const AdminClientes = React.lazy(() => import('@/presentation/pages/admin/Clientes').then(m => ({ default: m.AdminClientes })));
const AdminCatalogo = React.lazy(() => import('@/presentation/pages/admin/AdminCatalogo').then(m => ({ default: m.AdminCatalogo })));
const AdminPedidos = React.lazy(() => import('@/presentation/pages/admin/Pedidos').then(m => ({ default: m.AdminPedidos })));
const AdminProduccion = React.lazy(() => import('@/presentation/pages/admin/Produccion').then(m => ({ default: m.AdminProduccion })));
const AdminInventario = React.lazy(() => import('@/presentation/pages/admin/Inventario').then(m => ({ default: m.AdminInventario })));
const AdminAsesores = React.lazy(() => import('@/presentation/pages/admin/AdminAsesores').then(m => ({ default: m.AdminAsesores })));
const AdminReportes = React.lazy(() => import('@/presentation/pages/admin/AdminReportes').then(m => ({ default: m.AdminReportes })));
const AdminConfiguracion = React.lazy(() => import('@/presentation/pages/admin/AdminConfiguracion').then(m => ({ default: m.AdminConfiguracion })));
const AdminDomicilios = React.lazy(() => import('@/presentation/pages/admin/AdminDomicilios').then(m => ({ default: m.AdminDomicilios })));
const AdminRoles = React.lazy(() => import('@/presentation/pages/admin/Roles').then(m => ({ default: m.AdminRoles })));
const AdminPermisos = React.lazy(() => import('@/presentation/pages/admin/Permisos').then(m => ({ default: m.AdminPermisos })));
const AdminGestionUsuarios = React.lazy(() => import('@/presentation/pages/admin/GestionUsuarios').then(m => ({ default: m.AdminGestionUsuarios })));
const AdminSeguridadUsuarios = React.lazy(() => import('@/presentation/pages/admin/SeguridadUsuarios').then(m => ({ default: m.AdminSeguridadUsuarios })));
const AdminProductosTerminados = React.lazy(() => import('@/presentation/pages/admin/ProductosTerminados').then(m => ({ default: m.AdminProductosTerminados })));
const AdminInsumos = React.lazy(() => import('@/presentation/pages/admin/Insumos').then(m => ({ default: m.AdminInsumos })));
const AdminProveedores = React.lazy(() => import('@/presentation/pages/admin/Proveedores').then(m => ({ default: m.AdminProveedores })));
const AdminGestionAcceso = React.lazy(() => import('@/presentation/pages/admin/GestionAcceso').then(m => ({ default: m.AdminGestionAcceso })));
const AdminAlertasStock = React.lazy(() => import('@/presentation/pages/admin/AlertasStock').then(m => ({ default: m.AdminAlertasStock })));
const AdminStockDevuelto = React.lazy(() => import('@/presentation/pages/admin/StockDevuelto').then(m => ({ default: m.AdminStockDevuelto })));
const AdminRegistroTalleres = React.lazy(() => import('@/presentation/pages/admin/RegistroTalleres').then(m => ({ default: m.AdminRegistroTalleres })));
const AdminControlPrendas = React.lazy(() => import('@/presentation/pages/admin/ControlPrendas').then(m => ({ default: m.AdminControlPrendas })));
const AdminAsignacionProduccion = React.lazy(() => import('@/presentation/pages/admin/AsignacionProduccion').then(m => ({ default: m.AdminAsignacionProduccion })));
const AdminSeguimientoProduccion = React.lazy(() => import('@/presentation/pages/admin/SeguimientoProduccion').then(m => ({ default: m.AdminSeguimientoProduccion })));
const AdminRecibos = React.lazy(() => import('@/presentation/pages/admin/Recibos').then(m => ({ default: m.AdminRecibos })));
const AdminPagos = React.lazy(() => import('@/presentation/pages/admin/Pagos').then(m => ({ default: m.AdminPagos })));
const AdminReportesVentas = React.lazy(() => import('@/presentation/pages/admin/ReportesVentas').then(m => ({ default: m.AdminReportesVentas })));
const AdminReportesUsuarios = React.lazy(() => import('@/presentation/pages/admin/ReportesUsuarios').then(m => ({ default: m.AdminReportesUsuarios })));
const AdminReportesProduccion = React.lazy(() => import('@/presentation/pages/admin/ReportesProduccion').then(m => ({ default: m.AdminReportesProduccion })));
const AdminReportesInventario = React.lazy(() => import('@/presentation/pages/admin/ReportesInventario').then(m => ({ default: m.AdminReportesInventario })));
const AdminWebhooks = React.lazy(() => import('@/presentation/pages/admin/Webhooks').then(m => ({ default: m.AdminWebhooks })));
const AsesorLayout = React.lazy(() => import('@/presentation/pages/asesor/AsesorLayout').then(m => ({ default: m.AsesorLayout })));
const AsesorDashboard = React.lazy(() => import('@/presentation/pages/asesor/Dashboard').then(m => ({ default: m.AsesorDashboard })));
const AsesorClientes = React.lazy(() => import('@/presentation/pages/asesor/MisClientes').then(m => ({ default: m.AsesorClientes })));
const AtencionCliente = React.lazy(() => import('@/presentation/pages/asesor/Atencion-cliente').then(m => ({ default: m.AtencionCliente })));
const AsesorPedidos = React.lazy(() => import('@/presentation/pages/asesor/Pedidos').then(m => ({ default: m.AsesorPedidos })));
const AsesorCatalogo = React.lazy(() => import('@/presentation/pages/asesor/Catalogo').then(m => ({ default: m.AsesorCatalogo })));
const AsesorComisiones = React.lazy(() => import('@/presentation/pages/asesor/Comisiones').then(m => ({ default: m.AsesorComisiones })));
const AsesorPerfil = React.lazy(() => import('@/presentation/pages/asesor/PerfilAsesor').then(m => ({ default: m.AsesorPerfil })));
const DomiciliarioLayout = React.lazy(() => import('@/presentation/pages/domiciliario/DomiciliarioLayout').then(m => ({ default: m.DomiciliarioLayout })));
const DomiciliarioDashboard = React.lazy(() => import('@/presentation/pages/domiciliario/Dashboard').then(m => ({ default: m.DomiciliarioDashboard })));
const DomiciliarioEntregas = React.lazy(() => import('@/presentation/pages/domiciliario/MisEntregas').then(m => ({ default: m.DomiciliarioEntregas })));
const RutaDelDia = React.lazy(() => import('@/presentation/pages/domiciliario/RutaDelDia').then(m => ({ default: m.RutaDelDia })));
const DomiciliarioHistorial = React.lazy(() => import('@/presentation/pages/domiciliario/Historial').then(m => ({ default: m.DomiciliarioHistorial })));
const DomiciliarioPerfil = React.lazy(() => import('@/presentation/pages/domiciliario/PerfilDomiciliario').then(m => ({ default: m.DomiciliarioPerfil })));
const ClienteLayout = React.lazy(() => import('@/presentation/pages/cliente/ClienteLayout').then(m => ({ default: m.ClienteLayout })));
const InicioCliente = React.lazy(() => import('@/presentation/pages/cliente/InicioCliente').then(m => ({ default: m.InicioCliente })));
const CatalogoCliente = React.lazy(() => import('@/presentation/pages/cliente/Catalogo').then(m => ({ default: m.CatalogoCliente })));
const MisPedidos = React.lazy(() => import('@/presentation/pages/cliente/MisPedidos').then(m => ({ default: m.MisPedidos })));
const PerfilCliente = React.lazy(() => import('@/presentation/pages/cliente/PerfilCliente').then(m => ({ default: m.PerfilCliente })));
const OrderTracking = React.lazy(() => import('@/presentation/pages/cliente/OrderTracking').then(m => ({ default: m.OrderTracking })));
const Recibos = React.lazy(() => import('@/presentation/pages/cliente/Recibos').then(m => ({ default: m.Recibos })));
const Favoritos = React.lazy(() => import('@/presentation/pages/cliente/Favoritos').then(m => ({ default: m.Favoritos })));
const HomePage = React.lazy(() => import('@/presentation/pages/public/HomePage'));
const CatalogPage = React.lazy(() => import('@/presentation/pages/features/CatalogPage'));
const CartPage = React.lazy(() => import('@/presentation/pages/features/CartPage'));
const ContactPage = React.lazy(() => import('@/presentation/pages/features/ContactPage').then(m => ({ default: m.SurtitelaLayout })));
const AboutPage = React.lazy(() => import('@/presentation/pages/public/AboutPage'));
const TooltipsDemo = React.lazy(() => import('@/presentation/pages/public/TooltipsDemo'));
const LoginPage = React.lazy(() => import('@/presentation/pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('@/presentation/pages/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('@/presentation/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('@/presentation/pages/auth/ResetPasswordPage'));

const App: React.FC = () => (
  <BrowserRouter>
    <ScrollToTop />
    <ErrorBoundary>
      <Suspense fallback={<ProtectedLoader />}>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/catalogo" element={<Layout><CatalogPage /></Layout>} />
          <Route path="/carrito" element={<Layout><CartPage /></Layout>} />
          <Route path="/contacto" element={<Layout><ContactPage /></Layout>} />
          <Route path="/nosotros" element={<Layout><AboutPage /></Layout>} />
          <Route path="/tooltips" element={<Layout><TooltipsDemo /></Layout>} />

          {/* AUTH */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/olvide-contrasena" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* ADMIN - Protected routes for admin role */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="clientes" element={<AdminClientes />} />
            <Route path="catalogo" element={<AdminCatalogo />} />
            <Route path="pedidos" element={<AdminPedidos />} />
            <Route path="produccion" element={<AdminProduccion />} />
            <Route path="inventario" element={<AdminInventario />} />
            <Route path="domicilios" element={<AdminDomicilios />} />
            <Route path="asesores" element={<AdminAsesores />} />
            <Route path="reportes" element={<AdminReportes />} />
            <Route path="configuracion" element={<AdminConfiguracion />} />
            <Route path="roles" element={<AdminRoles />} />
            <Route path="permisos" element={<AdminPermisos />} />
            <Route path="gestion-usuarios" element={<AdminGestionUsuarios />} />
            <Route path="seguridad" element={<AdminSeguridadUsuarios />} />
            <Route path="productos" element={<AdminProductosTerminados />} />
            <Route path="insumos" element={<AdminInsumos />} />
            <Route path="proveedores" element={<AdminProveedores />} />
            <Route path="gestion-acceso" element={<AdminGestionAcceso />} />
            <Route path="alertas-stock" element={<AdminAlertasStock />} />
            <Route path="stock-devuelto" element={<AdminStockDevuelto />} />
            <Route path="talleres" element={<AdminRegistroTalleres />} />
            <Route path="prendas" element={<AdminControlPrendas />} />
            <Route path="asignacion" element={<AdminAsignacionProduccion />} />
            <Route path="seguimiento" element={<AdminSeguimientoProduccion />} />
            <Route path="facturacion" element={<AdminRecibos />} />
            <Route path="pagos" element={<AdminPagos />} />
            <Route path="ventas-pedidos" element={<AdminPedidos />} />
            <Route path="reportes-ventas" element={<AdminReportesVentas />} />
            <Route path="reportes-usuarios" element={<AdminReportesUsuarios />} />
            <Route path="reportes-produccion" element={<AdminReportesProduccion />} />
            <Route path="reportes-inventario" element={<AdminReportesInventario />} />
            <Route path="webhooks" element={<AdminWebhooks />} />
          </Route>

          {/* ASESOR - Protected routes for asesor role */}
          <Route path="/asesor" element={
            <ProtectedRoute allowedRoles={['asesor']}>
              <AsesorLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AsesorDashboard />} />
            <Route path="clientes" element={<AsesorClientes />} />
            <Route path="pedidos" element={<AsesorPedidos />} />
            <Route path="AtencionCliente" element={<AtencionCliente />} />
            <Route path="catalogo" element={<AsesorCatalogo />} />
            <Route path="comisiones" element={<AsesorComisiones />} />
            <Route path="perfil" element={<AsesorPerfil />} />
          </Route>

          {/* DOMICILIARIO - Protected routes for domiciliario role */}
          <Route path="/domiciliario" element={
            <ProtectedRoute allowedRoles={['domiciliario']}>
              <DomiciliarioLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DomiciliarioDashboard />} />
            <Route path="entregas" element={<DomiciliarioEntregas />} />
            <Route path="ruta" element={<RutaDelDia />} />
            <Route path="historial" element={<DomiciliarioHistorial />} />
            <Route path="perfil" element={<DomiciliarioPerfil />} />
          </Route>

          {/* CLIENTE - Protected routes for cliente role */}
          <Route path="/cliente" element={
            <ProtectedRoute allowedRoles={['cliente']}>
              <ClienteLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="inicio" replace />} />
            <Route path="inicio" element={<InicioCliente />} />
            <Route path="catalogo" element={<CatalogoCliente />} />
            <Route path="pedidos" element={<MisPedidos />} />
            <Route path="recibos" element={<Recibos />} />
            <Route path="favoritos" element={<Favoritos />} />
            <Route path="seguimiento" element={<OrderTracking />} />
            <Route path="seguimiento/:orderId" element={<OrderTracking />} />
            <Route path="perfil" element={<PerfilCliente />} />
          </Route>

          {/* REDIRECT */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
    <Toaster position="top-right" richColors />
  </BrowserRouter>
);

export default App;
