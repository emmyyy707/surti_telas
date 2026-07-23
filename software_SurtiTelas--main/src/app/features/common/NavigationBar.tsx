import { Shirt, User, ShoppingCart, Menu, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { User as UserType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import logoBlack from 'figma:asset/6b1b01bec62a36f96143e42f8161cda0f047b918.png';

interface NavigationBarProps {
  onNavigate: (page: string) => void;
  currentUser?: UserType | null;
  activePage?: string;
  onCartClick: () => void;
  cartItemCount?: number;
}

export function NavigationBar({ onNavigate, currentUser, activePage = 'inicio', onCartClick, cartItemCount }: NavigationBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const menuItems = [
    { id: 'inicio', label: 'Inicio', navigateTo: 'inicio' },
    { id: 'catalogo', label: 'Catálogo', navigateTo: 'catalogo' },
    { id: 'nosotros', label: 'Nosotros', navigateTo: 'nosotros' },
    { id: 'contacto', label: 'Contacto', navigateTo: 'contacto' },
  ];

  const handleUserClick = () => {
    if (!currentUser) {
      onNavigate('login');
      return;
    }

    // Navegar según el rol del usuario
    switch (currentUser.role) {
      case 'admin':
        onNavigate('admin');
        break;
      case 'employee':
        onNavigate('employee');
        break;
      case 'customer':
        onNavigate('client');
        break;
      default:
        onNavigate('login');
    }
  };

  const handleMenuItemClick = (item: typeof menuItems[0]) => {
    onNavigate(item.navigateTo);
  };

  return (
    <div className="w-full bg-[#3D3D3D] py-3 sm:py-4 px-3 sm:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-[20px] sm:rounded-[30px] shadow-xl px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-20 sm:w-24 lg:w-28 h-auto flex items-center justify-center">
              <img 
                src={logoBlack} 
                alt="SurtiCamisetas" 
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>

          {/* Menú de navegación - Desktop */}
          <nav className="hidden lg:flex items-center gap-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item)}
                className={`transition-colors ${ 
                  activePage === item.id
                    ? 'text-[#3D3D3D] font-medium'
                    : 'text-gray-700 hover:text-[#3D3D3D]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Iconos de Usuario y Carrito + Menú Móvil */}
          <div className="flex items-center gap-3">
            {/* Botón de Usuario */}
            <button 
              onClick={handleUserClick}
              className="text-gray-700 hover:text-[#3D3D3D] transition-colors relative"
              title={currentUser ? 'Mi cuenta' : 'Iniciar sesión'}
            >
              <User className="h-5 w-5" />
              {currentUser && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-[#8B8173] rounded-full border border-white"></span>
              )}
            </button>

            {/* Botón de Carrito */}
            <button 
              onClick={onCartClick}
              className="text-gray-700 hover:text-[#3D3D3D] transition-colors relative"
              title="Carrito de compras"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount !== undefined && cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#3D3D3D] text-white text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </button>
            
            {/* Menú hamburguesa */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-gray-700 hover:text-[#3D3D3D] transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Menú desplegable móvil */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white rounded-[30px] shadow-xl px-6 py-4 mt-2 animate-in slide-in-from-top-2">
            <nav className="flex flex-col gap-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleMenuItemClick(item);
                    setIsMenuOpen(false);
                  }}
                  className={`py-2 px-4 rounded-xl transition-all ${
                    activePage === item.id
                      ? 'bg-[#3D3D3D] text-white font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}




