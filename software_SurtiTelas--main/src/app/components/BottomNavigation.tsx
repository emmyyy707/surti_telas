import { Home, Search, User, ShoppingCart } from 'lucide-react';
import { Badge } from './ui/badge';
import { User as UserType } from '../types';
import cartIcon from 'figma:asset/e6adefa81f54f5f05fa74cd6b896090abf33e391.png';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BottomNavigationProps {
  onNavigate: (page: string) => void;
  currentUser?: UserType | null;
  activePage?: string;
  onCartClick: () => void;
  cartItemCount?: number;
}

export function BottomNavigation({ 
  onNavigate, 
  currentUser, 
  activePage = 'inicio', 
  onCartClick, 
  cartItemCount 
}: BottomNavigationProps) {
  
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

  const navItems = [
    {
      id: 'inicio',
      label: 'Inicio',
      icon: <Home className="h-6 w-6" />,
      onClick: () => onNavigate('inicio'),
    },
    {
      id: 'catalogo',
      label: 'Categorías',
      icon: <Search className="h-6 w-6" />,
      onClick: () => onNavigate('catalogo'),
    },
    {
      id: 'perfil',
      label: 'Tú',
      icon: <User className="h-6 w-6" />,
      onClick: handleUserClick,
    },
    {
      id: 'carrito',
      label: 'Carrito',
      icon: (
        <div className="relative">
          <ImageWithFallback 
            src={cartIcon} 
            alt="Carrito"
            className="h-6 w-6"
          />
          {cartItemCount !== undefined && cartItemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 min-w-[20px] flex items-center justify-center p-0 px-1.5 bg-[#3D3D3D] text-white text-xs">
              {cartItemCount}
            </Badge>
          )}
        </div>
      ),
      onClick: onCartClick,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#E8E3D8] border-t border-[#D4CFC4] shadow-lg z-50 xl:hidden">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = activePage === item.id || 
            (item.id === 'inicio' && activePage === 'inicio') ||
            (item.id === 'catalogo' && activePage === 'catalogo') ||
            (item.id === 'perfil' && (activePage === 'login' || activePage === 'client' || activePage === 'admin' || activePage === 'employee'));

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all relative ${
                isActive
                  ? 'text-[#16a34a] bg-white/60'
                  : 'text-[#6B6B6B] hover:text-[#3D3D3D] hover:bg-white/30'
              }`}
            >
              {item.icon}
              <span className={`text-[10px] ${isActive ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}



