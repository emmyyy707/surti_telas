import React, { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@presentation/contexts/AuthContext";
import { CartProvider } from "@presentation/contexts/CartContext";
import { CartDrawerProvider } from "@presentation/contexts/CartDrawerContext";
import { ThemeProvider } from "@presentation/contexts/ThemeContext";
import ProtectedRoute from "@presentation/routes/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/footer";
import ScrollToTop from "../components/ScrollToTop";
import { CartDrawer } from "../components/CartDrawer";
import { Spinner } from "@/shared/ui";
import ErrorBoundary from "@/app/components/ErrorBoundary";

// PUBLIC PAGES
import HomePage from "./public/HomePage";
import CatalogPage from "./features/CatalogPage";
import CartPage from "./features/CartPage";
import ContactPage from "./features/ContactPage";
import AboutPage from "./public/AboutPage";

// AUTH
import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";

// ADMIN  —  lazy loaded
const AdminDashboard = lazy(() => import("@/app/components/AdminDashboard"));
const UsersPage = lazy(() => import("@/app/features/admin/UsuariosModule"));
const InventoryPage = lazy(() => import("@/app/features/admin/InventarioModule"));
const OrdersPage = lazy(() => import("@/app/features/admin/HistorialPagosModule"));
const CustomersPage = lazy(() => import("@/app/features/admin/ClientesModule"));
const DeliveryPage = lazy(() => import("@/app/features/admin/DomiciliosModule"));
const AnalyticsPage = lazy(() => import("@/app/features/admin/ReportesModule"));
const SettingsPage = lazy(() => import("@/app/features/admin/ConfiguracionModule"));

const AdminLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#09090B]">
    <Spinner size="lg" />
  </div>
);

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <CartDrawer />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

const ProtectedLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#09090B]">
    <Spinner size="lg" />
  </div>
);

const RoleRoute: React.FC<{ children: React.ReactNode; roles: string[] }> = ({ children, roles }) => (
  <Suspense fallback={<ProtectedLoader />}>
    <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>
  </Suspense>
);

const AppRoutes: React.FC = () => (
  <ErrorBoundary>
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/catalogo" element={<PublicLayout><CatalogPage /></PublicLayout>} />
      <Route path="/carrito" element={<PublicLayout><CartPage /></PublicLayout>} />
      <Route path="/contacto" element={<PublicLayout><ContactPage /></PublicLayout>} />
      <Route path="/nosotros" element={<PublicLayout><AboutPage /></PublicLayout>} />

      {/* AUTH */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/unauthorized" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
            <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
          </div>
        </div>
      } />

       {/* ADMIN - accesible por admin, asesor, domiciliario, cliente */}
        <Route path="/admin/dashboard" element={<RoleRoute roles={["admin", "asesor", "domiciliario", "cliente"]}><AdminDashboard /></RoleRoute>} />
        <Route path="/admin/users" element={<RoleRoute roles={["admin"]}><UsersPage /></RoleRoute>} />
        <Route path="/admin/inventario" element={<RoleRoute roles={["admin", "asesor"]}><InventoryPage /></RoleRoute>} />
        <Route path="/admin/pedidos" element={<RoleRoute roles={["admin", "asesor"]}><OrdersPage /></RoleRoute>} />
        <Route path="/admin/clientes" element={<RoleRoute roles={["admin", "asesor"]}><CustomersPage /></RoleRoute>} />
        <Route path="/admin/domiciliarios" element={<RoleRoute roles={["admin"]}><DeliveryPage /></RoleRoute>} />
        <Route path="/admin/analytics" element={<RoleRoute roles={["admin"]}><AnalyticsPage /></RoleRoute>} />
        <Route path="/admin/configuracion" element={<RoleRoute roles={["admin"]}><SettingsPage /></RoleRoute>} />

       {/* ASESOR DASHBOARD */}
       <Route path="/asesor/dashboard" element={<RoleRoute roles={["asesor"]}><AdminDashboard /></RoleRoute>} />

       {/* DOMICILIARIO DASHBOARD */}
       <Route path="/domiciliario/dashboard" element={<RoleRoute roles={["domiciliario"]}><AdminDashboard /></RoleRoute>} />

       {/* CLIENTE DASHBOARD */}
       <Route path="/cliente/dashboard" element={<RoleRoute roles={["cliente"]}><AdminDashboard /></RoleRoute>} />

       {/* REDIRECT */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </ErrorBoundary>
);

const App: React.FC = () => (
  <AuthProvider>
    <CartProvider>
      <CartDrawerProvider>
        <ThemeProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { borderRadius: '12px', fontSize: '14px' },
              }}
            />
          </BrowserRouter>
        </ThemeProvider>
      </CartDrawerProvider>
    </CartProvider>
  </AuthProvider>
);

export default App;



