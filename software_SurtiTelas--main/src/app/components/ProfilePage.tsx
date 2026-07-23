import { NavigationBar } from './NavigationBar';
import { Footer } from './Footer';
import { useState } from 'react';
import {
  User,
  Package,
  MapPin,
  CreditCard,
  Heart,
  Bell,
  Settings,
  LogOut,
  Edit2,
  Plus,
  Trash2,
  Star,
  Gift,
  Tag,
  Shirt,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Award,
  ShoppingBag
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { User as UserType } from '../types';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
  currentUser?: UserType | null;
  onCartClick: () => void;
  cartItemCount?: number;
}

// Mock data para demo
const mockOrders = [
  {
    id: 'ORD-001',
    date: '2025-11-28',
    total: 125000,
    status: 'delivered' as const,
    items: [
      { name: 'Camiseta Personalizada Negra', quantity: 2, price: 45000, size: 'M', image: '' },
      { name: 'Camiseta Básica Blanca', quantity: 1, price: 35000, size: 'L', image: '' }
    ]
  },
  {
    id: 'ORD-002',
    date: '2025-11-25',
    total: 89000,
    status: 'in_transit' as const,
    items: [
      { name: 'Camiseta Deportiva', quantity: 1, price: 89000, size: 'M', image: '' }
    ]
  },
  {
    id: 'ORD-003',
    date: '2025-11-20',
    total: 156000,
    status: 'processing' as const,
    items: [
      { name: 'Camiseta Premium', quantity: 3, price: 52000, size: 'S', image: '' }
    ]
  }
];

const mockAddresses = [
  {
    id: '1',
    name: 'Casa',
    fullAddress: 'Calle 123 #45-67',
    city: 'Bogotá',
    phone: '3001234567',
    isDefault: true
  },
  {
    id: '2',
    name: 'Oficina',
    fullAddress: 'Carrera 45 #78-90',
    city: 'Medellín',
    phone: '3009876543',
    isDefault: false
  }
];

const mockPaymentMethods = [
  {
    id: '1',
    type: 'credit_card' as const,
    last4: '4242',
    brand: 'Visa',
    expiry: '12/26',
    isDefault: true
  },
  {
    id: '2',
    type: 'credit_card' as const,
    last4: '5555',
    brand: 'Mastercard',
    expiry: '08/25',
    isDefault: false
  }
];

const mockFavorites = [
  { id: '1', name: 'Camiseta Negra Premium', price: 65000, image: '', inStock: true },
  { id: '2', name: 'Camiseta Blanca Básica', price: 35000, image: '', inStock: true },
  { id: '3', name: 'Camiseta Gris Vintage', price: 45000, image: '', inStock: false },
];

const mockCoupons = [
  { code: 'WELCOME10', discount: '10%', validUntil: '2025-12-31', isActive: true },
  { code: 'SUMMER20', discount: '20%', validUntil: '2025-12-15', isActive: true },
  { code: 'FALL15', discount: '15%', validUntil: '2025-11-30', isActive: false },
];

export function ProfilePage({ onNavigate, currentUser, onCartClick, cartItemCount }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    birthdate: '1990-01-01',
  });

  const handleLoginClick = () => {
    onNavigate('login');
  };

  const handleSaveProfile = () => {
    toast.success('Perfil actualizado', {
      description: 'Tus datos han sido guardados correctamente'
    });
    setEditingProfile(false);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'delivered':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Entregado' };
      case 'in_transit':
        return { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50', label: 'En camino' };
      case 'processing':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Procesando' };
      case 'cancelled':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelado' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Pendiente' };
    }
  };

  // Si no hay usuario, mostrar página de login requerido
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <NavigationBar
          onNavigate={onNavigate}
          currentUser={currentUser}
          activePage="perfil"
          onCartClick={onCartClick}
          cartItemCount={cartItemCount}
        />

        <main className="flex-1 bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 sm:p-12 text-center shadow-lg rounded-2xl bg-white">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                </div>

                <h1 className="text-gray-900 mb-4">Inicia Sesión</h1>

                <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                  Para acceder a tu perfil y gestionar tu cuenta, necesitas iniciar sesión.
                </p>

                <div className="space-y-4 max-w-md mx-auto">
                  <Button
                    onClick={handleLoginClick}
                    className="w-full bg-black text-white hover:bg-gray-800 py-6"
                  >
                    Iniciar Sesión / Registrarse
                  </Button>

                  <Button
                    onClick={() => onNavigate('inicio')}
                    variant="outline"
                    className="w-full py-6"
                  >
                    Volver al Inicio
                  </Button>
                </div>

                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <motion.div
                    className="p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <ShoppingBag className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-gray-900 mb-1">Historial de Pedidos</h3>
                    <p className="text-sm text-gray-500">Rastrea tus compras</p>
                  </motion.div>

                  <motion.div
                    className="p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-6 h-6 text-pink-600" />
                    </div>
                    <h3 className="text-gray-900 mb-1">Lista de Favoritos</h3>
                    <p className="text-sm text-gray-500">Guarda lo que te gusta</p>
                  </motion.div>

                  <motion.div
                    className="p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Gift className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-gray-900 mb-1">Cupones</h3>
                    <p className="text-sm text-gray-500">Accede a descuentos</p>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </div>
        </main>

        <Footer onNavigate={onNavigate} />
      </div>
    );
  }

  // Usuario logueado - Mostrar perfil completo
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavigationBar
        onNavigate={onNavigate}
        currentUser={currentUser}
        activePage="perfil"
        onCartClick={onCartClick}
        cartItemCount={cartItemCount}
      />

      <main className="flex-1 bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-gray-900 mb-1">Mi Perfil</h1>
                  <p className="text-gray-600">Bienvenido de nuevo, {currentUser.name}</p>
                </div>
              </div>
              <Button
                onClick={() => onNavigate('inicio')}
                variant="outline"
                className="border-gray-300"
              >
                Volver al Inicio
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 bg-white p-2 rounded-xl shadow-sm">
              <TabsTrigger value="overview" className="data-[state=active]:bg-black data-[state=active]:text-white">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Resumen</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-black data-[state=active]:text-white">
                <Package className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Pedidos</span>
              </TabsTrigger>
              <TabsTrigger value="addresses" className="data-[state=active]:bg-black data-[state=active]:text-white">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Direcciones</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="data-[state=active]:bg-black data-[state=active]:text-white">
                <CreditCard className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Pagos</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="data-[state=active]:bg-black data-[state=active]:text-white">
                <Heart className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Favoritos</span>
              </TabsTrigger>
              <TabsTrigger value="coupons" className="data-[state=active]:bg-black data-[state=active]:text-white">
                <Gift className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Cupones</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-black data-[state=active]:text-white">
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Ajustes</span>
              </TabsTrigger>
              <button
                onClick={() => {
                  toast.success('Sesión cerrada', {
                    description: 'Has cerrado sesión correctamente'
                  });
                  onNavigate('inicio');
                }}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-red-600 hover:text-white text-red-600 border border-red-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Pedidos Totales</p>
                        <p className="text-2xl text-gray-900">{mockOrders.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Favoritos</p>
                        <p className="text-2xl text-gray-900">{mockFavorites.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center">
                        <Heart className="w-6 h-6 text-pink-600" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Cupones Activos</p>
                        <p className="text-2xl text-gray-900">{mockCoupons.filter(c => c.isActive).length}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                        <Tag className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Puntos de Lealtad</p>
                        <p className="text-2xl text-gray-900">850</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                        <Award className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Recent Orders */}
                <Card className="p-6 bg-white shadow-sm rounded-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-gray-900">Pedidos Recientes</h2>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('orders')}
                      className="text-sm"
                    >
                      Ver Todos
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {mockOrders.slice(0, 3).map((order) => {
                      const statusInfo = getStatusInfo(order.status);
                      const StatusIcon = statusInfo.icon;

                      return (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 ${statusInfo.bg} rounded-lg flex items-center justify-center`}>
                              <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                            </div>
                            <div>
                              <p className="text-gray-900">{order.id}</p>
                              <p className="text-sm text-gray-500">{order.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-900">${order.total.toLocaleString()}</p>
                            <Badge className={`${statusInfo.bg} ${statusInfo.color} border-0 mt-1`}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-6 bg-white shadow-sm rounded-xl">
                  <h2 className="text-gray-900 mb-6">Historial de Pedidos</h2>
                  <div className="space-y-6">
                    {mockOrders.map((order) => {
                      const statusInfo = getStatusInfo(order.status);
                      const StatusIcon = statusInfo.icon;

                      return (
                        <div key={order.id} className="border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-gray-900">{order.id}</h3>
                                <Badge className={`${statusInfo.bg} ${statusInfo.color} border-0`}>
                                  {statusInfo.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {order.date}
                                </span>
                                <span>{order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Total</p>
                                <p className="text-xl text-gray-900">${order.total.toLocaleString()}</p>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Detalles del Pedido {order.id}</DialogTitle>
                                    <DialogDescription>
                                      Fecha: {order.date}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                          <p className="text-gray-900">{item.name}</p>
                                          <p className="text-sm text-gray-500">
                                            Talla: {item.size} | Cantidad: {item.quantity}
                                          </p>
                                        </div>
                                        <p className="text-gray-900">${item.price.toLocaleString()}</p>
                                      </div>
                                    ))}
                                    <div className="pt-4 border-t">
                                      <div className="flex justify-between text-lg">
                                        <span className="text-gray-900">Total</span>
                                        <span className="text-gray-900">${order.total.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 text-sm">
                                <Shirt className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">{item.name}</span>
                                <span className="text-gray-400">Ã—{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-6 bg-white shadow-sm rounded-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-gray-900">Direcciones de Envío</h2>
                    <Button className="bg-black text-white hover:bg-gray-800">
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Dirección
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockAddresses.map((address) => (
                      <div key={address.id} className="border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors relative">
                        {address.isDefault && (
                          <Badge className="absolute top-4 right-4 bg-black text-white border-0">
                            Predeterminada
                          </Badge>
                        )}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <h3 className="text-gray-900">{address.name}</h3>
                          </div>
                          <p className="text-gray-600 mb-1">{address.fullAddress}</p>
                          <p className="text-gray-600 mb-1">{address.city}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                            <Phone className="w-4 h-4" />
                            <span>{address.phone}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit2 className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Payment Methods Tab */}
            <TabsContent value="payments" className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-6 bg-white shadow-sm rounded-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-gray-900">Métodos de Pago</h2>
                    <Button className="bg-black text-white hover:bg-gray-800">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Tarjeta
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockPaymentMethods.map((method) => (
                      <div key={method.id} className="border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors relative bg-gradient-to-br from-gray-900 to-gray-700 text-white">
                        {method.isDefault && (
                          <Badge className="absolute top-4 right-4 bg-white text-black border-0">
                            Predeterminada
                          </Badge>
                        )}
                        <div className="mb-6">
                          <CreditCard className="w-8 h-8 mb-4" />
                          <p className="text-2xl tracking-wider mb-1">
                            •••• •••• •••• {method.last4}
                          </p>
                          <p className="text-sm text-gray-300">{method.brand}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Válida hasta</p>
                            <p className="text-sm">{method.expiry}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-6 bg-white shadow-sm rounded-xl">
                  <h2 className="text-gray-900 mb-6">Lista de Favoritos</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockFavorites.map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                          <Shirt className="w-16 h-16 text-gray-300" />
                        </div>
                        <div className="p-4">
                          <h3 className="text-gray-900 mb-2">{product.name}</h3>
                          <p className="text-lg text-gray-900 mb-3">${product.price.toLocaleString()}</p>
                          {product.inStock ? (
                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1 bg-black text-white hover:bg-gray-800">
                                <ShoppingBag className="w-4 h-4 mr-2" />
                                Agregar
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                                <Heart className="w-4 h-4 fill-current" />
                              </Button>
                            </div>
                          ) : (
                            <Badge className="w-full bg-gray-100 text-gray-600 border-0 justify-center">
                              Agotado
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Coupons Tab */}
            <TabsContent value="coupons" className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-6 bg-white shadow-sm rounded-xl">
                  <h2 className="text-gray-900 mb-6">Cupones y Descuentos</h2>
                  <div className="space-y-4">
                    {mockCoupons.map((coupon, idx) => (
                      <div
                        key={idx}
                        className={`border rounded-xl p-6 ${coupon.isActive ? 'border-black bg-gradient-to-r from-yellow-50 to-orange-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${coupon.isActive ? 'bg-black' : 'bg-gray-300'}`}>
                              <Tag className={`w-6 h-6 ${coupon.isActive ? 'text-white' : 'text-gray-500'}`} />
                            </div>
                            <div>
                              <p className={`text-2xl mb-1 ${coupon.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                {coupon.code}
                              </p>
                              <p className={`text-sm ${coupon.isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                                {coupon.discount} de descuento • Válido hasta {coupon.validUntil}
                              </p>
                            </div>
                          </div>
                          {coupon.isActive ? (
                            <Button className="bg-black text-white hover:bg-gray-800">
                              Usar Cupón
                            </Button>
                          ) : (
                            <Badge className="bg-gray-200 text-gray-600 border-0">
                              Expirado
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-sm rounded-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl mb-1">Programa de Lealtad</h3>
                      <p className="text-white/80">Acumula puntos con cada compra</p>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span>Tus Puntos</span>
                      <span className="text-2xl">850</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-white rounded-full h-2" style={{ width: '85%' }}></div>
                    </div>
                    <p className="text-sm text-white/80 mt-2">150 puntos más para tu próxima recompensa</p>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-6 bg-white shadow-sm rounded-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-gray-900">Información Personal</h2>
                    {!editingProfile && (
                      <Button
                        variant="outline"
                        onClick={() => setEditingProfile(true)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    )}
                  </div>

                  {editingProfile ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nombre Completo</Label>
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Correo Electrónico</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Teléfono</Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="birthdate">Fecha de Nacimiento</Label>
                          <Input
                            id="birthdate"
                            type="date"
                            value={profileData.birthdate}
                            onChange={(e) => setProfileData({ ...profileData, birthdate: e.target.value })}
                            className="mt-2"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleSaveProfile}
                          className="bg-black text-white hover:bg-gray-800"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Guardar Cambios
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingProfile(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Nombre</p>
                          <p className="text-gray-900">{profileData.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-gray-900">{profileData.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Teléfono</p>
                          <p className="text-gray-900">{profileData.phone || 'No especificado'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                          <p className="text-gray-900">{profileData.birthdate}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                <Card className="p-6 bg-white shadow-sm rounded-xl">
                  <h2 className="text-gray-900 mb-6">Preferencias de Tallas</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                      <Button
                        key={size}
                        variant="outline"
                        className="border-2 hover:border-black hover:bg-black hover:text-white"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 bg-white shadow-sm rounded-xl">
                  <h2 className="text-gray-900 mb-6">Notificaciones</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Ofertas y promociones', enabled: true },
                      { label: 'Actualizaciones de pedidos', enabled: true },
                      { label: 'Nuevos productos', enabled: false },
                      { label: 'Newsletter semanal', enabled: true },
                    ].map((notif, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">{notif.label}</span>
                        </div>
                        <div className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${notif.enabled ? 'bg-black' : 'bg-gray-300'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform ${notif.enabled ? 'translate-x-6' : ''}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 bg-white shadow-sm rounded-xl border-2 border-red-200">
                  <h2 className="text-red-600 mb-4">Zona de Peligro</h2>

                  {/* Cerrar Sesión */}
                  <div className="mb-6 pb-6 border-b border-red-200">
                    <h3 className="text-gray-900 mb-2">Cerrar Sesión</h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      Cierra tu sesión actual. Podrás volver a iniciar sesión en cualquier momento.
                    </p>
                    <Button
                      variant="outline"
                      className="border-orange-600 text-orange-600 hover:bg-orange-50"
                      onClick={() => {
                        toast.success('Sesión cerrada', {
                          description: 'Has cerrado sesión correctamente'
                        });
                        onNavigate('inicio');
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </div>

                  {/* Eliminar Cuenta */}
                  <div>
                    <h3 className="text-gray-900 mb-2">Eliminar Cuenta</h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      Esta acción eliminará permanentemente tu cuenta y todos tus datos asociados. Esta acción no se puede deshacer.
                    </p>
                    <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar Cuenta
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}



