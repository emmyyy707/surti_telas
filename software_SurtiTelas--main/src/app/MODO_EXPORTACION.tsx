/**
 * ðŸŽ¨ MODO DE EXPORTACIÓN A FIGMA
 * 
 * INSTRUCCIONES RÁPIDAS:
 * 
 * 1. Copia este código completo
 * 2. Reemplaza el contenido de /App.tsx con este código
 * 3. La aplicación mostrará todo el contenido sin cortes
 * 4. Copia a Figma
 * 5. Restaura el App.tsx original
 */

import { useState } from 'react';
import { Toaster } from './components/ui/sonner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { ServicesPage } from './components/ServicesPage';
import { ProductsPage } from './components/ProductsPage';
import { ContactPage } from './components/ContactPage';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { ClientDashboard } from './components/ClientDashboard';
import { AdvisorPanel } from './components/AdvisorPanel';
import { CartItem, User, Order, Employee } from './types';
import { employees, products, advisorRatings } from './data/mockData';

// ============================================
// CONFIGURACIÓN DEL MODO DE EXPORTACIÓN
// ============================================

const EXPORT_CONFIG = {
  // Cambia esto a true para modo exportación, false para modo normal
  EXPORT_MODE: true,
  
  // Qué mostrar en modo exportación
  SHOW_LANDING_PAGES: true,      // Home, Servicios, Productos, Contacto
  SHOW_LOGIN_PAGE: true,          // Página de login
  SHOW_CLIENT_DASHBOARD: true,    // Dashboard de cliente
  SHOW_ADVISOR_PANEL: true,       // Panel de asesor
  SHOW_ADMIN_DASHBOARD: true,     // Dashboard de admin
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('inicio');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [orders] = useState<Order[]>([
    {
      id: 'ORD-001',
      customerName: 'María González',
      email: 'cliente@ejemplo.com',
      items: [],
      total: 150000,
      status: 'completado',
      date: '2025-09-15',
    },
  ]);

  // Mock users para exportación
  const mockCustomer: User = {
    id: 'client-1',
    name: 'María González',
    email: 'cliente@ejemplo.com',
    role: 'customer',
    phone: '+57 320 456 7890',
    address: 'Calle 123 #45-67, Bogotá',
    assignedAdvisorId: employees[0]?.id,
  };

  const mockAdmin: User = {
    id: 'admin-1',
    name: 'Administrador SurtiCamisetas',
    email: 'admin@surticamisetas.com',
    role: 'admin',
    phone: '+57 300 123 4567',
  };

  const mockEmployee: Employee = employees[0] || {
    id: 'emp1',
    name: 'Juan Pérez',
    email: 'empleado@surticamisetas.com',
    phone: '+57 310 987 6543',
    role: 'asesor',
    status: 'activo',
    hireDate: '2024-01-15',
    salesThisMonth: 85000,
    totalSales: 450000,
    ordersCompleted: 23,
    commission: 5,
    department: 'Ventas',
  };

  // ============================================
  // MODO EXPORTACIÓN COMPLETO
  // ============================================
  
  if (EXPORT_CONFIG.EXPORT_MODE) {
    return (
      <div className="w-full bg-white">
        {/* Encabezado de exportación */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-6 text-center sticky top-0 z-50 shadow-lg">
          <h1 className="text-3xl">ðŸŽ¨ SURTICAMISETAS - Vista Completa para Figma</h1>
          <p className="text-sm mt-2">Scroll completo para ver todo el proyecto sin cortes</p>
        </div>

        <div className="space-y-16 pb-20">
          {/* LANDING PAGES */}
          {EXPORT_CONFIG.SHOW_LANDING_PAGES && (
            <>
              {/* Navbar */}
              <div>
                <div className="bg-black text-white py-3 px-6 text-xl">
                  ðŸ“Œ NAVBAR PRINCIPAL
                </div>
                <Navbar
                  cartItemCount={3}
                  onNavigate={() => {}}
                  currentPage="inicio"
                  onCartClick={() => {}}
                  isUserLoggedIn={true}
                />
              </div>

              {/* Home Page */}
              <div>
                <div className="bg-gradient-to-r from-gray-900 to-black text-white py-4 px-6 text-2xl">
                  ðŸ  PÁGINA DE INICIO
                </div>
                <HomePage 
                  onNavigate={() => {}}
                  currentUser={mockCustomer}
                  assignedAdvisor={employees[0]}
                  ratings={advisorRatings}
                  onSubmitRating={() => {}}
                  products={products}
                  advisors={employees}
                  onSubmitProductRating={() => {}}
                  onSubmitQuickMessage={() => {}}
                  onAddToCart={() => {}}
                />
              </div>

              {/* Services Page */}
              <div>
                <div className="bg-gradient-to-r from-gray-900 to-black text-white py-4 px-6 text-2xl">
                  ðŸŽ¨ PÁGINA DE SERVICIOS
                </div>
                <ServicesPage onNavigate={() => {}} />
              </div>

              {/* Products Page */}
              <div>
                <div className="bg-gradient-to-r from-gray-900 to-black text-white py-4 px-6 text-2xl">
                  ðŸ›ï¸ PÁGINA DE PRODUCTOS
                </div>
                <ProductsPage onAddToCart={() => {}} />
              </div>

              {/* Contact Page */}
              <div>
                <div className="bg-gradient-to-r from-gray-900 to-black text-white py-4 px-6 text-2xl">
                  ðŸ“ž PÁGINA DE CONTACTO
                </div>
                <ContactPage />
              </div>

              {/* Footer */}
              <div>
                <div className="bg-black text-white py-3 px-6 text-xl">
                  ðŸ“Œ FOOTER
                </div>
                <Footer />
              </div>
            </>
          )}

          {/* LOGIN PAGE */}
          {EXPORT_CONFIG.SHOW_LOGIN_PAGE && (
            <div>
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-4 px-6 text-2xl">
                ðŸ” PÁGINA DE LOGIN
              </div>
              <LoginPage onLogin={() => {}} currentUser={null} />
            </div>
          )}

          {/* CLIENT DASHBOARD */}
          {EXPORT_CONFIG.SHOW_CLIENT_DASHBOARD && (
            <div>
              <div className="bg-gradient-to-r from-green-900 to-emerald-900 text-white py-4 px-6 text-2xl">
                ðŸ‘¤ DASHBOARD DE CLIENTE
              </div>
              <ClientDashboard
                user={mockCustomer}
                orders={orders}
                onLogout={() => {}}
                onUpdateProfile={() => {}}
                onNavigate={() => {}}
              />
            </div>
          )}

          {/* ADVISOR PANEL */}
          {EXPORT_CONFIG.SHOW_ADVISOR_PANEL && (
            <div>
              <div className="bg-gradient-to-r from-purple-900 to-pink-900 text-white py-4 px-6 text-2xl">
                ðŸ’¼ PANEL DE ASESOR
              </div>
              <AdvisorPanel
                employee={mockEmployee}
                onLogout={() => {}}
                ratings={advisorRatings}
                onRespondToRating={() => {}}
                productRatings={[]}
                quickMessages={[]}
                onRespondToMessage={() => {}}
              />
            </div>
          )}

          {/* ADMIN DASHBOARD */}
          {EXPORT_CONFIG.SHOW_ADMIN_DASHBOARD && (
            <div>
              <div className="bg-gradient-to-r from-red-900 to-orange-900 text-white py-4 px-6 text-2xl">
                âš™ï¸ DASHBOARD DE ADMINISTRADOR
              </div>
              <AdminDashboard
                onLogout={() => {}}
                orders={orders}
                onUpdateOrderStatus={() => {}}
              />
            </div>
          )}
        </div>

        {/* Footer final */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-8 text-center">
          <h2 className="text-2xl mb-2">âœ… Fin de la vista completa</h2>
          <p className="text-sm">Todo el contenido ha sido mostrado sin cortes</p>
          <p className="text-xs mt-4 opacity-75">
            Para volver al modo normal, restaura el archivo App.tsx original
          </p>
        </div>

        <Toaster />
      </div>
    );
  }

  // ============================================
  // MODO NORMAL (No exportación)
  // ============================================
  
  // Aquí iría el código normal de App.tsx
  return (
    <div className="min-h-screen">
      <p className="p-8 text-center text-lg">
        Modo normal - Configura EXPORT_MODE = false en este archivo
      </p>
      <Toaster />
    </div>
  );
}



