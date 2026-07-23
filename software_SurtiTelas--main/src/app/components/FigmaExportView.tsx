/**
 * FigmaExportView - Vista optimizada para exportación a Figma
 * 
 * Este componente muestra todo el contenido de la aplicación sin restricciones
 * de altura, ideal para copiar y pegar en Figma sin cortes.
 * 
 * USO: Cambia temporalmente en App.tsx para mostrar este componente
 */

import { useState } from 'react';
import { HomePage } from './HomePage';
import { ServicesPage } from './ServicesPage';
import { ProductsPage } from './ProductsPage';
import { ContactPage } from './ContactPage';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartItem, User } from '../types';
import { employees, products } from '../data/mockData';

export function FigmaExportView() {
  const [cartItems] = useState<CartItem[]>([]);
  const [currentPage] = useState('inicio');
  
  // Usuario mock para mostrar la experiencia completa
  const mockUser: User = {
    id: 'client-demo',
    name: 'María González',
    email: 'cliente@ejemplo.com',
    role: 'customer',
    phone: '+57 320 456 7890',
    address: 'Calle 123 #45-67, Bogotá',
    assignedAdvisorId: employees[0]?.id,
  };

  const handleNavigate = () => {};
  const handleAddToCart = () => {};

  return (
    <div className="w-full bg-white">
      {/* Navbar */}
      <Navbar
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        onCartClick={() => {}}
        isUserLoggedIn={true}
      />

      {/* Todas las páginas una debajo de otra */}
      <div className="w-full space-y-20">
        {/* Separador visual */}
        <div className="bg-gradient-to-r from-gray-900 to-black text-white py-4 text-center">
          <h2 className="text-2xl">ðŸ“± PÁGINA DE INICIO</h2>
        </div>
        
        <HomePage 
          onNavigate={handleNavigate}
          currentUser={mockUser}
          assignedAdvisor={employees.find(emp => emp.id === mockUser.assignedAdvisorId)}
          ratings={[]}
          onSubmitRating={() => {}}
          products={products}
          advisors={employees}
          onSubmitProductRating={() => {}}
          onSubmitQuickMessage={() => {}}
          onAddToCart={handleAddToCart}
        />

        {/* Separador */}
        <div className="bg-gradient-to-r from-gray-900 to-black text-white py-4 text-center">
          <h2 className="text-2xl">ðŸŽ¨ PÁGINA DE SERVICIOS</h2>
        </div>

        <ServicesPage onNavigate={handleNavigate} />

        {/* Separador */}
        <div className="bg-gradient-to-r from-gray-900 to-black text-white py-4 text-center">
          <h2 className="text-2xl">ðŸ›ï¸ PÁGINA DE PRODUCTOS</h2>
        </div>

        <ProductsPage onAddToCart={handleAddToCart} />

        {/* Separador */}
        <div className="bg-gradient-to-r from-gray-900 to-black text-white py-4 text-center">
          <h2 className="text-2xl">ðŸ“ž PÁGINA DE CONTACTO</h2>
        </div>

        <ContactPage />
      </div>

      {/* Footer */}
      <Footer />

      {/* Nota informativa */}
      <div className="bg-blue-50 border-t-4 border-blue-500 p-6 text-center">
        <p className="text-lg text-blue-900">
          âœ… Vista completa para exportación a Figma - Todo el contenido visible sin cortes
        </p>
        <p className="text-sm text-blue-700 mt-2">
          Esta vista muestra todas las páginas principales en un solo scroll continuo
        </p>
      </div>
    </div>
  );
}



