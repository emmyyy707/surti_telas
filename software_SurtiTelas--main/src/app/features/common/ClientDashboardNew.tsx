import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  User as UserIcon,
  Package,
  MapPin,
  Settings,
  LogOut,
  Edit2,
  ShoppingBag,
  CreditCard,
  Calendar,
  TrendingUp,
  Home,
  Phone,
  Mail,
  Eye,
  Shirt,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Trash2,
  Award,
  ArrowRight,
  DollarSign,
  Save,
  X,
} from 'lucide-react';
import { User, Order } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { LoadingScreen } from './LoadingScreen';
import logoBlack from 'figma:asset/6b1b01bec62a36f96143e42f8161cda0f047b918.png';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ClientDashboardProps {
  user: User;
  orders: Order[];
  onLogout: () => void;
  onUpdateProfile: (user: User) => void;
  onNavigate: (page: string) => void;
}

interface Address {
  id: string;
  name: string;
  fullAddress: string;
  city: string;
  phone: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card';
  last4: string;
  brand: string;
  expiry: string;
  isDefault: boolean;
}

export function ClientDashboard({
  user,
  orders,
  onLogout,
  onUpdateProfile,
  onNavigate,
}: ClientDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    birthdate: '1990-01-01',
  });

  // Estados para direcciones
  const [addresses, setAddresses] = useState<Address[]>([
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
  ]);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    fullAddress: '',
    city: '',
    phone: '',
  });

  // Estados para métodos de pago
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'credit_card',
      last4: '4242',
      brand: 'Visa',
      expiry: '12/26',
      isDefault: true
    },
    {
      id: '2',
      type: 'credit_card',
      last4: '5555',
      brand: 'Mastercard',
      expiry: '08/25',
      isDefault: false
    }
  ]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    brand: 'Visa',
    expiry: '',
    cvv: '',
  });

  // Estados para desactivar/eliminar cuenta
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAccountActive, setIsAccountActive] = useState(true);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Cargando tu panel de cliente..." />;
  }

  const handleUpdateProfile = () => {
    onUpdateProfile({
      ...user,
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      address: profileData.address,
    });
    toast.success('Perfil actualizado', {
      description: 'Tus datos han sido guardados correctamente'
    });
    setEditingProfile(false);
  };

  // Funciones para direcciones
  const handleOpenAddressDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        name: address.name,
        fullAddress: address.fullAddress,
        city: address.city,
        phone: address.phone,
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        name: '',
        fullAddress: '',
        city: '',
        phone: '',
      });
    }
    setIsAddressDialogOpen(true);
  };

  const handleSaveAddress = () => {
    if (!addressForm.name || !addressForm.fullAddress || !addressForm.city || !addressForm.phone) {
      toast.error('Error', { description: 'Por favor completa todos los campos' });
      return;
    }

    if (editingAddress) {
      // Editar dirección existente
      setAddresses(addresses.map(addr =>
        addr.id === editingAddress.id
          ? { ...addr, ...addressForm }
          : addr
      ));
      toast.success('Dirección actualizada', {
        description: 'La dirección se actualizó correctamente'
      });
    } else {
      // Agregar nueva dirección
      const newAddress: Address = {
        id: Date.now().toString(),
        ...addressForm,
        isDefault: addresses.length === 0,
      };
      setAddresses([...addresses, newAddress]);
      toast.success('Dirección agregada', {
        description: 'La nueva dirección se agregó correctamente'
      });
    }

    setIsAddressDialogOpen(false);
    setEditingAddress(null);
    setAddressForm({ name: '', fullAddress: '', city: '', phone: '' });
  };

  const handleDeleteAddress = (id: string) => {
    const addressToDelete = addresses.find(addr => addr.id === id);
    if (addressToDelete?.isDefault && addresses.length > 1) {
      toast.error('Error', {
        description: 'No puedes eliminar la dirección predeterminada. Establece otra como predeterminada primero.'
      });
      return;
    }

    setAddresses(addresses.filter(addr => addr.id !== id));
    toast.success('Dirección eliminada', {
      description: 'La dirección se eliminó correctamente'
    });
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
    toast.success('Dirección predeterminada', {
      description: 'Se estableció como dirección predeterminada'
    });
  };

  // Funciones para métodos de pago
  const handleOpenPaymentDialog = (payment?: PaymentMethod) => {
    if (payment) {
      setEditingPayment(payment);
      setPaymentForm({
        cardNumber: `**** **** **** ${payment.last4}`,
        brand: payment.brand,
        expiry: payment.expiry,
        cvv: '***',
      });
    } else {
      setEditingPayment(null);
      setPaymentForm({
        cardNumber: '',
        brand: 'Visa',
        expiry: '',
        cvv: '',
      });
    }
    setIsPaymentDialogOpen(true);
  };

  const handleSavePayment = () => {
    if (!paymentForm.cardNumber || !paymentForm.expiry || (!editingPayment && !paymentForm.cvv)) {
      toast.error('Error', { description: 'Por favor completa todos los campos' });
      return;
    }

    // Validar formato de expiración MM/YY
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(paymentForm.expiry)) {
      toast.error('Error', { description: 'Formato de expiración inválido. Use MM/YY' });
      return;
    }

    if (editingPayment) {
      // Editar método existente
      setPaymentMethods(paymentMethods.map(pm =>
        pm.id === editingPayment.id
          ? { ...pm, brand: paymentForm.brand, expiry: paymentForm.expiry }
          : pm
      ));
      toast.success('Método actualizado', {
        description: 'El método de pago se actualizó correctamente'
      });
    } else {
      // Agregar nuevo método
      const last4 = paymentForm.cardNumber.replace(/\s/g, '').slice(-4);
      const newPayment: PaymentMethod = {
        id: Date.now().toString(),
        type: 'credit_card',
        last4,
        brand: paymentForm.brand,
        expiry: paymentForm.expiry,
        isDefault: paymentMethods.length === 0,
      };
      setPaymentMethods([...paymentMethods, newPayment]);
      toast.success('Método agregado', {
        description: 'El nuevo método de pago se agregó correctamente'
      });
    }

    setIsPaymentDialogOpen(false);
    setEditingPayment(null);
    setPaymentForm({ cardNumber: '', brand: 'Visa', expiry: '', cvv: '' });
  };

  const handleDeletePayment = (id: string) => {
    const paymentToDelete = paymentMethods.find(pm => pm.id === id);
    if (paymentToDelete?.isDefault && paymentMethods.length > 1) {
      toast.error('Error', {
        description: 'No puedes eliminar el método predeterminado. Establece otro como predeterminado primero.'
      });
      return;
    }

    setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
    toast.success('Método eliminado', {
      description: 'El método de pago se eliminó correctamente'
    });
  };

  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods(paymentMethods.map(pm => ({
      ...pm,
      isDefault: pm.id === id
    })));
    toast.success('Método predeterminado', {
      description: 'Se estableció como método de pago predeterminado'
    });
  };

  // Funciones para desactivar/eliminar cuenta
  const handleDeactivateAccount = () => {
    setIsAccountActive(!isAccountActive);
    setIsDeactivateDialogOpen(false);
    if (isAccountActive) {
      toast.success('Cuenta desactivada', {
        description: 'Tu cuenta ha sido desactivada temporalmente'
      });
    } else {
      toast.success('Cuenta reactivada', {
        description: 'Tu cuenta ha sido reactivada correctamente'
      });
    }
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText.toLowerCase() === 'eliminar') {
      toast.success('Cuenta eliminada', {
        description: 'Tu cuenta ha sido eliminada permanentemente'
      });
      setTimeout(() => {
        onLogout();
      }, 2000);
    } else {
      toast.error('Error', {
        description: 'Debes escribir "eliminar" para confirmar'
      });
    }
  };

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'completado':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Completado', border: 'border-green-200' };
      case 'en_proceso':
        return { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50', label: 'En Proceso', border: 'border-blue-200' };
      case 'pendiente':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pendiente', border: 'border-yellow-200' };
      case 'cancelado':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelado', border: 'border-red-200' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Pendiente', border: 'border-gray-200' };
    }
  };

  const userOrders = orders.filter((order) => order.email === user.email);
  const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
  const completedOrders = userOrders.filter((order) => order.status === 'completado').length;
  const pendingOrders = userOrders.filter(
    (order) => order.status === 'pendiente' || order.status === 'en_proceso'
  ).length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Menú Lateral Izquierdo */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 shadow-sm z-30">
        {/* Logo */}
        <div className="flex items-center justify-center h-20 px-6 border-b border-gray-200">
          <img src={logoBlack} alt="SurtiCamisetas" className="h-10 w-auto" />
        </div>

        {/* User Info */}
        <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-md">
              <span className="text-lg">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all ${
                activeTab === 'overview'
                  ? 'bg-black text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              <span>Resumen</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all ${
                activeTab === 'orders'
                  ? 'bg-black text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Package className="h-5 w-5" />
              <span>Mis Pedidos</span>
              {pendingOrders > 0 && (
                <Badge className="ml-auto bg-blue-600 text-white">{pendingOrders}</Badge>
              )}
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all ${
                activeTab === 'addresses'
                  ? 'bg-black text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MapPin className="h-5 w-5" />
              <span>Direcciones</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all ${
                activeTab === 'payments'
                  ? 'bg-black text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <CreditCard className="h-5 w-5" />
              <span>Métodos de Pago</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all ${
                activeTab === 'profile'
                  ? 'bg-black text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span>Mi Perfil</span>
            </button>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button
            variant="outline"
            onClick={() => onNavigate('inicio')}
            className="w-full justify-start"
          >
            <Home className="h-4 w-4 mr-2" />
            Volver a la Tienda
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              toast.success('Sesión cerrada');
              onLogout();
            }}
            className="w-full justify-start text-red-600 hover:bg-red-50 border-red-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="px-4 h-16 flex items-center justify-between">
            <img src={logoBlack} alt="SurtiCamisetas" className="h-8 w-auto" />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('inicio')}
              >
                <Home className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-gray-900 text-2xl">Panel de Cliente</h1>
              <p className="text-sm text-gray-600 mt-1">Bienvenido, {user.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {userOrders.length} Pedidos
              </Badge>
              <Badge variant="outline" className="text-sm">
                ${totalSpent.toLocaleString()}
              </Badge>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Mobile Navigation */}
          <div className="lg:hidden mb-6 bg-white rounded-xl shadow-sm p-2">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'overview', icon: TrendingUp, label: 'Resumen' },
                { id: 'orders', icon: Package, label: 'Pedidos' },
                { id: 'addresses', icon: MapPin, label: 'Direcciones' },
                { id: 'payments', icon: CreditCard, label: 'Pagos' },
                { id: 'profile', icon: Settings, label: 'Perfil' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all ${
                    activeTab === tab.id
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="truncate w-full text-center">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Welcome Banner */}
              <Card className="p-6 bg-gradient-to-br from-black to-gray-800 text-white shadow-lg rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl mb-2">Â¡Hola, {user.name}! ðŸ‘‹</h2>
                      <p className="text-white/80">Bienvenido a tu panel de cliente</p>
                    </div>
                    <Button
                      onClick={() => onNavigate('catalogo')}
                      className="bg-white text-black hover:bg-gray-100"
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Ir a Comprar
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-all rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Pedidos</p>
                      <p className="text-3xl text-gray-900">{userOrders.length}</p>
                    </div>
                    <Package className="h-10 w-10 text-blue-600" />
                  </div>
                </Card>

                <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-all rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Completados</p>
                      <p className="text-3xl text-gray-900">{completedOrders}</p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                </Card>

                <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-all rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">En Proceso</p>
                      <p className="text-3xl text-gray-900">{pendingOrders}</p>
                    </div>
                    <Clock className="h-10 w-10 text-yellow-600" />
                  </div>
                </Card>

                <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-all rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Gastado</p>
                      <p className="text-2xl text-gray-900">${totalSpent.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-10 w-10 text-purple-600" />
                  </div>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg text-gray-900">Pedidos Recientes</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>
                    Ver Todos
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {userOrders.slice(0, 3).map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    return (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`p-2 rounded-lg ${statusInfo.bg}`}>
                            <statusInfo.icon className={`h-5 w-5 ${statusInfo.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900">{order.id}</p>
                            <p className="text-sm text-gray-600">{order.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-900">${order.total.toLocaleString()}</p>
                          <Badge className={`mt-1 ${statusInfo.bg} ${statusInfo.color} border-0`}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl text-gray-900">Mis Pedidos</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Tienes {userOrders.length} pedidos en total
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {userOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  return (
                    <Card key={order.id} className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${statusInfo.bg}`}>
                            <statusInfo.icon className={`h-6 w-6 ${statusInfo.color}`} />
                          </div>
                          <div>
                            <p className="text-gray-900">{order.id}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                              <Calendar className="h-4 w-4" />
                              {order.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${statusInfo.bg} ${statusInfo.color} border-0 mb-2`}>
                            {statusInfo.label}
                          </Badge>
                          <p className="text-2xl text-gray-900">${order.total.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Estado de Pago */}
                      {order.paymentProof && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <h4 className="text-sm text-gray-900 mb-3 flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Estado del Pago
                          </h4>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {order.paymentProof.validationStatus === 'revision' && (
                                <>
                                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-900">En Verificación</p>
                                    <p className="text-xs text-gray-500">
                                      Subido el {order.paymentProof.uploadDate}
                                    </p>
                                  </div>
                                </>
                              )}
                              {order.paymentProof.validationStatus === 'aprobado' && (
                                <>
                                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-900">Pago Aprobado</p>
                                    <p className="text-xs text-gray-500">
                                      Aprobado el {order.paymentProof.validatedDate}
                                    </p>
                                  </div>
                                </>
                              )}
                              {order.paymentProof.validationStatus === 'rechazado' && (
                                <>
                                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-900">Pago Denegado</p>
                                    <p className="text-xs text-red-600">
                                      {order.paymentProof.rejectionReason}
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(order.paymentProof?.url, '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Comprobante
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Línea de Tiempo del Pedido */}
                      {order.tracking && order.tracking.length > 0 && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="text-sm text-gray-900 mb-4 flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Seguimiento del Pedido
                          </h4>
                          <div className="space-y-3">
                            {order.tracking.map((track, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className="relative">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      track.status === 'entregado'
                                        ? 'bg-green-500'
                                        : track.status === 'en_transito'
                                        ? 'bg-blue-500'
                                        : track.status === 'empaquetado'
                                        ? 'bg-purple-500'
                                        : 'bg-gray-400'
                                    }`}
                                  >
                                    {track.status === 'entregado' && (
                                      <CheckCircle className="h-4 w-4 text-white" />
                                    )}
                                    {track.status === 'en_transito' && (
                                      <Truck className="h-4 w-4 text-white" />
                                    )}
                                    {track.status === 'empaquetado' && (
                                      <Package className="h-4 w-4 text-white" />
                                    )}
                                    {track.status === 'recibido' && (
                                      <CheckCircle className="h-4 w-4 text-white" />
                                    )}
                                  </div>
                                  {index < order.tracking!.length - 1 && (
                                    <div className="absolute left-1/2 top-8 w-0.5 h-8 bg-gray-300 -translate-x-1/2" />
                                  )}
                                </div>
                                <div className="flex-1 pb-6">
                                  <p className="text-sm text-gray-900 mb-1">
                                    {track.status === 'recibido' && 'ðŸ“¦ Pedido Recibido'}
                                    {track.status === 'empaquetado' && 'ðŸ“¦ Pedido Empaquetado'}
                                    {track.status === 'en_transito' && 'ðŸšš En Camino'}
                                    {track.status === 'entregado' && 'âœ… Entregado'}
                                  </p>
                                  <p className="text-xs text-gray-500">{track.description}</p>
                                  <p className="text-xs text-gray-400 mt-1">{track.date}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Productos del Pedido */}
                      <div className="pt-4 border-t border-gray-200 mt-4">
                        <h4 className="text-sm text-gray-700 mb-3">Productos</h4>
                        <div className="space-y-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Shirt className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-900">{item.product.name}</span>
                                <span className="text-gray-500">
                                  ({item.size}, {item.color}) x{item.quantity}
                                </span>
                              </div>
                              <span className="text-gray-700">
                                ${(item.product.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-xs text-gray-500">
                              +{order.items.length - 3} productos más
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl text-gray-900">Mis Direcciones</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Administra tus direcciones de envío
                  </p>
                </div>
                <Button onClick={() => handleOpenAddressDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Dirección
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((address) => (
                  <Card key={address.id} className="p-6 relative">
                    {address.isDefault && (
                      <Badge className="absolute top-4 right-4 bg-black text-white">
                        Predeterminada
                      </Badge>
                    )}
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 rounded-xl">
                        <MapPin className="h-6 w-6 text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-gray-900 mb-2">{address.name}</h3>
                        <p className="text-sm text-gray-600 mb-1">{address.fullAddress}</p>
                        <p className="text-sm text-gray-600 mb-1">{address.city}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {address.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleOpenAddressDialog(address)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      {!address.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefaultAddress(address.id)}
                        >
                          Predeterminada
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl text-gray-900">Métodos de Pago</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Administra tus tarjetas y métodos de pago
                  </p>
                </div>
                <Button onClick={() => handleOpenPaymentDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Método
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paymentMethods.map((method) => (
                  <Card key={method.id} className="p-6 relative bg-gradient-to-br from-gray-900 to-gray-700 text-white">
                    {method.isDefault && (
                      <Badge className="absolute top-4 right-4 bg-white text-black">
                        Predeterminada
                      </Badge>
                    )}
                    <div className="flex items-center justify-between mb-8">
                      <CreditCard className="h-8 w-8" />
                      <p className="text-sm opacity-80">{method.brand}</p>
                    </div>
                    <p className="text-2xl mb-4">•••• •••• •••• {method.last4}</p>
                    <p className="text-sm opacity-80 mb-6">Expira: {method.expiry}</p>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white/10 text-white border-white/20 hover:bg-white/20"
                        onClick={() => handleOpenPaymentDialog(method)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                          onClick={() => handleSetDefaultPayment(method.id)}
                        >
                          Predeterminada
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-600/20 text-white border-red-400/20 hover:bg-red-600/30"
                        onClick={() => handleDeletePayment(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl text-gray-900">Mi Perfil</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Actualiza tu información personal
                </p>
              </div>

              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-black to-gray-800 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xl text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Nombre Completo</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={!editingProfile}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input
                        id="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!editingProfile}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!editingProfile}
                      />
                    </div>
                    <div>
                      <Label htmlFor="birthdate">Fecha de Nacimiento</Label>
                      <Input
                        id="birthdate"
                        type="date"
                        value={profileData.birthdate}
                        onChange={(e) => setProfileData({ ...profileData, birthdate: e.target.value })}
                        disabled={!editingProfile}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        disabled={!editingProfile}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    {!editingProfile ? (
                      <Button onClick={() => setEditingProfile(true)} className="flex-1">
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar Perfil
                      </Button>
                    ) : (
                      <>
                        <Button onClick={handleUpdateProfile} className="flex-1">
                          Guardar Cambios
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingProfile(false)}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>

              {/* Zona de Peligro */}
              <Card className="p-6 border-red-200">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg text-gray-900 mb-1">Zona de Peligro</h3>
                    <p className="text-sm text-gray-600">
                      Acciones irreversibles que afectan tu cuenta
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                      <div className="flex-1">
                        <p className="text-gray-900">Desactivar Cuenta</p>
                        <p className="text-sm text-gray-600">
                          Desactiva temporalmente tu cuenta. Puedes reactivarla cuando quieras.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setIsDeactivateDialogOpen(true)}
                        className="ml-4 border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                      >
                        {isAccountActive ? 'Desactivar' : 'Reactivar'}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex-1">
                        <p className="text-gray-900">Eliminar Cuenta</p>
                        <p className="text-sm text-gray-600">
                          Elimina permanentemente tu cuenta y todos tus datos. Esta acción no se puede deshacer.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="ml-4 border-red-600 text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </main>
      </div>

      {/* Dialog para Agregar/Editar Dirección */}
      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}
            </DialogTitle>
            <DialogDescription>
              {editingAddress
                ? 'Actualiza los datos de tu dirección'
                : 'Agrega una nueva dirección de envío'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="address-name">Nombre de la Dirección</Label>
              <Input
                id="address-name"
                placeholder="Casa, Oficina, etc."
                value={addressForm.name}
                onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="address-full">Dirección Completa</Label>
              <Input
                id="address-full"
                placeholder="Calle 123 #45-67"
                value={addressForm.fullAddress}
                onChange={(e) => setAddressForm({ ...addressForm, fullAddress: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="address-city">Ciudad</Label>
              <Input
                id="address-city"
                placeholder="Bogotá"
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="address-phone">Teléfono de Contacto</Label>
              <Input
                id="address-phone"
                placeholder="3001234567"
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveAddress} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAddressDialogOpen(false)}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para Agregar/Editar Método de Pago */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingPayment ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
            </DialogTitle>
            <DialogDescription>
              {editingPayment
                ? 'Actualiza los datos de tu tarjeta'
                : 'Agrega una nueva tarjeta de crédito o débito'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="card-number">Número de Tarjeta</Label>
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                value={paymentForm.cardNumber}
                onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                disabled={!!editingPayment}
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="card-brand">Marca</Label>
                <select
                  id="card-brand"
                  value={paymentForm.brand}
                  onChange={(e) => setPaymentForm({ ...paymentForm, brand: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white"
                >
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="American Express">American Express</option>
                </select>
              </div>
              <div>
                <Label htmlFor="card-expiry">Expiración (MM/YY)</Label>
                <Input
                  id="card-expiry"
                  placeholder="12/26"
                  value={paymentForm.expiry}
                  onChange={(e) => setPaymentForm({ ...paymentForm, expiry: e.target.value })}
                  maxLength={5}
                />
              </div>
            </div>
            {!editingPayment && (
              <div>
                <Label htmlFor="card-cvv">CVV</Label>
                <Input
                  id="card-cvv"
                  placeholder="123"
                  value={paymentForm.cvv}
                  onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                  maxLength={4}
                  type="password"
                />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSavePayment} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para Desactivar Cuenta */}
      <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              {isAccountActive ? 'Desactivar Cuenta' : 'Reactivar Cuenta'}
            </DialogTitle>
            <DialogDescription>
              {isAccountActive
                ? 'Tu cuenta será desactivada temporalmente. Podrás reactivarla cuando lo desees.'
                : 'Tu cuenta volverá a estar activa y podrás usar todos los servicios normalmente.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                {isAccountActive
                  ? 'âš ï¸ Al desactivar tu cuenta, no podrás realizar compras hasta que la reactives.'
                  : 'âœ… Al reactivar tu cuenta, podrás volver a comprar y usar todos los servicios.'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleDeactivateAccount}
              className={isAccountActive ? 'flex-1 bg-yellow-600 hover:bg-yellow-700' : 'flex-1'}
            >
              {isAccountActive ? 'Desactivar Cuenta' : 'Reactivar Cuenta'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeactivateDialogOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para Eliminar Cuenta */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) setDeleteConfirmText('');
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Eliminar Cuenta Permanentemente</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos tus datos, pedidos, direcciones y métodos de pago.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 mb-2">
                ðŸš¨ <strong>Advertencia:</strong> Esta es una acción permanente e irreversible.
              </p>
              <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                <li>Se eliminarán todos tus pedidos</li>
                <li>Se eliminarán todas tus direcciones</li>
                <li>Se eliminarán todos tus métodos de pago</li>
                <li>Perderás acceso permanente a tu cuenta</li>
              </ul>
            </div>
            <div>
              <Label htmlFor="delete-confirm">
                Escribe <strong>"eliminar"</strong> para confirmar
              </Label>
              <Input
                id="delete-confirm"
                placeholder="eliminar"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleDeleteAccount}
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={deleteConfirmText.toLowerCase() !== 'eliminar'}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Cuenta Permanentemente
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteConfirmText('');
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}




