import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  User as UserIcon,
  Package,
  MapPin,
  Settings,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Eye,
  Camera,
  Check,
  ShoppingBag,
  CreditCard,
  Calendar,
  TrendingUp,
  Star,
  Home,
  ChevronRight,
  Lock,
  Mail,
  Phone,
  MapPinned,
} from 'lucide-react';
import { User, Order } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface UserDashboardProps {
  user: User;
  orders: Order[];
  onLogout: () => void;
  onUpdateProfile: (user: User) => void;
  onNavigate: (page: string) => void;
}

interface Address {
  id: string;
  type: 'casa' | 'trabajo' | 'otro';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function UserDashboard({ user, orders, onLogout, onUpdateProfile, onNavigate }: UserDashboardProps) {
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    phone: '+57 300 123 4567',
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'casa',
      street: 'Calle 123 #45-67',
      city: 'Bogotá',
      state: 'Cundinamarca',
      zipCode: '110111',
      isDefault: true,
    },
    {
      id: '2',
      type: 'trabajo',
      street: 'Carrera 7 #32-16',
      city: 'Bogotá',
      state: 'Cundinamarca',
      zipCode: '110211',
      isDefault: false,
    },
  ]);

  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    type: 'casa',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false,
  });
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  const [passwordData, setPasswordData] = useState<PasswordChange>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const userOrders = orders.filter((order) => order.email === user.email);

  const predefinedAvatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
  ];

  const handleSaveProfile = () => {
    if (!profileData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    if (!profileData.email.trim() || !profileData.email.includes('@')) {
      toast.error('Email inválido');
      return;
    }
    onUpdateProfile({
      ...user,
      name: profileData.name,
      email: profileData.email,
    });
    setEditMode(false);
    toast.success('Perfil actualizado correctamente');
  };

  const handleChangeAvatar = (avatarUrl: string) => {
    setProfileImage(avatarUrl);
    setShowImageDialog(false);
    toast.success('Foto de perfil actualizada');
  };

  const handleAddAddress = () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const address: Address = {
      id: Date.now().toString(),
      type: newAddress.type as 'casa' | 'trabajo' | 'otro',
      street: newAddress.street,
      city: newAddress.city,
      state: newAddress.state,
      zipCode: newAddress.zipCode,
      isDefault: newAddress.isDefault || false,
    };

    if (address.isDefault) {
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: false }))
      );
    }

    setAddresses((prev) => [...prev, address]);
    setNewAddress({
      type: 'casa',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      isDefault: false,
    });
    setShowAddressDialog(false);
    toast.success('Dirección agregada correctamente');
  };

  const handleUpdateAddress = () => {
    if (!editingAddress) return;

    if (!editingAddress.street || !editingAddress.city || !editingAddress.state || !editingAddress.zipCode) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (editingAddress.isDefault) {
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === editingAddress.id,
        }))
      );
    } else {
      setAddresses((prev) =>
        prev.map((a) => (a.id === editingAddress.id ? editingAddress : a))
      );
    }

    setEditingAddress(null);
    toast.success('Dirección actualizada correctamente');
  };

  const handleDeleteAddress = (id: string) => {
    const address = addresses.find((a) => a.id === id);
    if (address?.isDefault && addresses.length > 1) {
      toast.error('No puedes eliminar la dirección principal. Primero marca otra como principal.');
      setAddressToDelete(null);
      return;
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    setAddressToDelete(null);
    toast.success('Dirección eliminada');
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
    toast.success('Dirección principal actualizada');
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Por favor completa todos los campos');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowPasswordDialog(false);
    toast.success('Contraseña actualizada correctamente');
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completado':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pendiente':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelado':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'completado':
        return 'Completado';
      case 'en_proceso':
        return 'En Proceso';
      case 'pendiente':
        return 'Pendiente';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const totalSpent = userOrders
    .filter((o) => o.status === 'completado')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-75 blur group-hover:opacity-100 transition duration-300"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center overflow-hidden border-4 border-white/20">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="h-12 w-12 text-white" />
                  )}
                </div>
                <button
                  onClick={() => setShowImageDialog(true)}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all shadow-lg transform hover:scale-110"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>
              <div>
                <h1 className="text-4xl mb-2">Â¡Hola, {user.name}! ðŸ‘‹</h1>
                <p className="text-slate-300">Bienvenido a tu panel de control personal</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => onNavigate('inicio')}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Home className="h-4 w-4 mr-2" />
                Inicio
              </Button>
              <Button
                onClick={onLogout}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        {/* Stats Cards with beautiful gradients */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden border-0 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-100"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <Package className="h-6 w-6" />
                </div>
              </div>
              <p className="text-blue-100 text-sm mb-1">Total Pedidos</p>
              <p className="text-4xl">{userOrders.length}</p>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 opacity-100"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <Check className="h-6 w-6" />
                </div>
              </div>
              <p className="text-emerald-100 text-sm mb-1">Completados</p>
              <p className="text-4xl">
                {userOrders.filter((o) => o.status === 'completado').length}
              </p>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-100"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <p className="text-purple-100 text-sm mb-1">En Proceso</p>
              <p className="text-4xl">
                {userOrders.filter((o) => o.status === 'en_proceso').length}
              </p>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 opacity-100"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <CreditCard className="h-6 w-6" />
                </div>
              </div>
              <p className="text-orange-100 text-sm mb-1">Total Gastado</p>
              <p className="text-4xl">${(totalSpent / 1000).toFixed(1)}k</p>
            </div>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-white p-1 shadow-lg w-full md:w-auto">
            <TabsTrigger 
              value="overview" 
              className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white px-6"
            >
              <Home className="h-4 w-4 mr-2" />
              Resumen
            </TabsTrigger>
            <TabsTrigger 
              value="orders"
              className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white px-6"
            >
              <Package className="h-4 w-4 mr-2" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger 
              value="profile"
              className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white px-6"
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger 
              value="addresses"
              className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white px-6"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Direcciones
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Orders Card */}
              <Card className="shadow-lg border-slate-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      Pedidos Recientes
                    </h2>
                  </div>

                  {userOrders.length > 0 ? (
                    <div className="space-y-3">
                      {userOrders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          className="group p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <Package className="h-6 w-6" />
                              </div>
                              <div>
                                <p className="mb-1">Pedido #{order.id}</p>
                                <p className="text-sm text-slate-600 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {order.date}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="mb-1">${order.total.toLocaleString()}</p>
                              <Badge className={`${getStatusColor(order.status)} border`}>
                                {getStatusText(order.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Package className="h-10 w-10 text-slate-400" />
                      </div>
                      <p className="text-slate-600 mb-4">No tienes pedidos aún</p>
                      <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => onNavigate('productos')}>
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Explorar Productos
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Quick Actions */}
              <div className="space-y-4">
                <Card 
                  className="shadow-lg hover:shadow-xl transition-all cursor-pointer group border-slate-200"
                  onClick={() => onNavigate('productos')}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                          <ShoppingBag className="h-7 w-7" />
                        </div>
                        <div>
                          <h3 className="text-lg mb-1">Explorar Productos</h3>
                          <p className="text-sm text-slate-600">Descubre nuestra colección</p>
                        </div>
                      </div>
                      <ChevronRight className="h-6 w-6 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Card>

                <Card className="shadow-lg hover:shadow-xl transition-all cursor-pointer group border-slate-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                          <UserIcon className="h-7 w-7" />
                        </div>
                        <div>
                          <h3 className="text-lg mb-1">Editar Perfil</h3>
                          <p className="text-sm text-slate-600">Actualiza tu información</p>
                        </div>
                      </div>
                      <ChevronRight className="h-6 w-6 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Card>

                <Card className="shadow-lg hover:shadow-xl transition-all cursor-pointer group border-slate-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                          <MapPin className="h-7 w-7" />
                        </div>
                        <div>
                          <h3 className="text-lg mb-1">Mis Direcciones</h3>
                          <p className="text-sm text-slate-600">Gestiona tus ubicaciones</p>
                        </div>
                      </div>
                      <ChevronRight className="h-6 w-6 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Card>

                <Card className="shadow-lg hover:shadow-xl transition-all cursor-pointer group border-slate-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                          <Settings className="h-7 w-7" />
                        </div>
                        <div>
                          <h3 className="text-lg mb-1">Configuración</h3>
                          <p className="text-sm text-slate-600">Seguridad y privacidad</p>
                        </div>
                      </div>
                      <ChevronRight className="h-6 w-6 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="shadow-lg border-slate-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl">Historial de Pedidos</h2>
                </div>

                {userOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID Pedido</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userOrders.map((order) => (
                          <TableRow key={order.id} className="hover:bg-slate-50">
                            <TableCell>#{order.id}</TableCell>
                            <TableCell>{order.date}</TableCell>
                            <TableCell>${order.total.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(order.status)} border`}>
                                {getStatusText(order.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver Detalles
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Pedido #{order.id}</DialogTitle>
                                    <DialogDescription>
                                      {order.date} • ${order.total.toLocaleString()}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label className="mb-2">Estado</Label>
                                      <div className="mt-2">
                                        <Badge className={`${getStatusColor(order.status)} border`}>
                                          {getStatusText(order.status)}
                                        </Badge>
                                      </div>
                                    </div>
                                    {order.items && order.items.length > 0 && (
                                      <div>
                                        <Label className="mb-2">Productos</Label>
                                        <div className="space-y-2 mt-2">
                                          {order.items.map((item, idx) => (
                                            <div
                                              key={idx}
                                              className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl"
                                            >
                                              <img
                                                src={item.product.image}
                                                alt={item.product.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                              />
                                              <div className="flex-1">
                                                <p className="mb-1">{item.product.name}</p>
                                                <p className="text-sm text-slate-600">
                                                  Talla: {item.size} • Color: {item.color}
                                                </p>
                                              </div>
                                              <div className="text-right">
                                                <p className="text-sm text-slate-600 mb-1">
                                                  x{item.quantity}
                                                </p>
                                                <p className="font-medium">
                                                  ${(item.product.price * item.quantity).toLocaleString()}
                                                </p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Package className="h-12 w-12 text-slate-400" />
                    </div>
                    <h3 className="text-xl mb-2">No tienes pedidos aún</h3>
                    <p className="text-slate-600 mb-6">Explora nuestros productos y realiza tu primera compra</p>
                    <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => onNavigate('productos')}>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Ir a Productos
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card className="shadow-lg border-slate-200">
                <div className="p-6 text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-32 h-32 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center overflow-hidden shadow-xl">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="h-16 w-16 text-white" />
                      )}
                    </div>
                    <button
                      onClick={() => setShowImageDialog(true)}
                      className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                  </div>
                  <h3 className="text-xl mb-1">{user.name}</h3>
                  <p className="text-sm text-slate-600 mb-6">{user.email}</p>
                  
                  <div className="space-y-3 text-left border-t pt-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Package className="h-5 w-5 text-slate-600" />
                      <span className="text-sm">{userOrders.length} pedidos realizados</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-slate-600" />
                      <span className="text-sm">Cliente desde 2025</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Star className="h-5 w-5 text-slate-600" />
                      <span className="text-sm">Cliente verificado</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Info Card */}
              <Card className="lg:col-span-2 shadow-lg border-slate-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl">Información Personal</h3>
                    {!editMode ? (
                      <Button onClick={() => setEditMode(true)} className="bg-slate-900 text-white hover:bg-slate-800">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setEditMode(false);
                            setProfileData({
                              name: user.name,
                              email: user.email,
                              phone: '+57 300 123 4567',
                            });
                          }}
                          variant="outline"
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveProfile} className="bg-slate-900 text-white hover:bg-slate-800">
                          <Check className="h-4 w-4 mr-2" />
                          Guardar
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                        <UserIcon className="h-4 w-4" />
                        Nombre Completo
                      </Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={!editMode}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4" />
                        Correo Electrónico
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!editMode}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                        <Phone className="h-4 w-4" />
                        Teléfono
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!editMode}
                        className="mt-1"
                      />
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="mb-4 flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Seguridad
                      </h4>
                      <Button
                        variant="outline"
                        onClick={() => setShowPasswordDialog(true)}
                        className="w-full border-slate-300 hover:bg-slate-100"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Cambiar Contraseña
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl mb-1">Mis Direcciones</h2>
                  <p className="text-slate-600">Gestiona tus direcciones de envío</p>
                </div>
                <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => setShowAddressDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Dirección
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {addresses.map((address) => (
                  <Card key={address.id} className="shadow-lg hover:shadow-xl transition-all border-slate-200 relative overflow-hidden">
                    {address.isDefault && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-slate-900 text-white px-4 py-1 rounded-bl-lg text-sm">
                          Principal
                        </div>
                      </div>
                    )}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                          <MapPinned className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="capitalize mb-1">{address.type}</p>
                          <p className="text-sm text-slate-600">{address.zipCode}</p>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4 space-y-1">
                        <p className="text-sm">{address.street}</p>
                        <p className="text-sm text-slate-600">
                          {address.city}, {address.state}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setEditingAddress(address)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        {!address.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefaultAddress(address.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => setAddressToDelete(address.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      
      {/* Avatar Selection Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar Foto de Perfil</DialogTitle>
            <DialogDescription>Selecciona un avatar para tu perfil</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4">
            {predefinedAvatars.map((avatar, idx) => (
              <button
                key={idx}
                onClick={() => handleChangeAvatar(avatar)}
                className="aspect-square rounded-2xl border-2 border-slate-200 hover:border-slate-900 transition-all overflow-hidden hover:scale-105 shadow-sm hover:shadow-lg"
              >
                <img src={avatar} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Address Dialog */}
      <Dialog
        open={showAddressDialog || !!editingAddress}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddressDialog(false);
            setEditingAddress(null);
            setNewAddress({
              type: 'casa',
              street: '',
              city: '',
              state: '',
              zipCode: '',
              isDefault: false,
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}</DialogTitle>
            <DialogDescription>
              {editingAddress
                ? 'Actualiza la información de tu dirección'
                : 'Agrega una nueva dirección de envío'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Tipo de Dirección</Label>
              <Select
                value={editingAddress?.type || newAddress.type}
                onValueChange={(value) => {
                  if (editingAddress) {
                    setEditingAddress({ ...editingAddress, type: value as 'casa' | 'trabajo' | 'otro' });
                  } else {
                    setNewAddress({ ...newAddress, type: value as 'casa' | 'trabajo' | 'otro' });
                  }
                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="trabajo">Trabajo</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="street">Dirección</Label>
              <Input
                id="street"
                value={editingAddress?.street || newAddress.street}
                onChange={(e) => {
                  if (editingAddress) {
                    setEditingAddress({ ...editingAddress, street: e.target.value });
                  } else {
                    setNewAddress({ ...newAddress, street: e.target.value });
                  }
                }}
                placeholder="Calle 123 #45-67"
                className="mt-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={editingAddress?.city || newAddress.city}
                  onChange={(e) => {
                    if (editingAddress) {
                      setEditingAddress({ ...editingAddress, city: e.target.value });
                    } else {
                      setNewAddress({ ...newAddress, city: e.target.value });
                    }
                  }}
                  placeholder="Bogotá"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="state">Departamento</Label>
                <Input
                  id="state"
                  value={editingAddress?.state || newAddress.state}
                  onChange={(e) => {
                    if (editingAddress) {
                      setEditingAddress({ ...editingAddress, state: e.target.value });
                    } else {
                      setNewAddress({ ...newAddress, state: e.target.value });
                    }
                  }}
                  placeholder="Cundinamarca"
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="zipCode">Código Postal</Label>
              <Input
                id="zipCode"
                value={editingAddress?.zipCode || newAddress.zipCode}
                onChange={(e) => {
                  if (editingAddress) {
                    setEditingAddress({ ...editingAddress, zipCode: e.target.value });
                  } else {
                    setNewAddress({ ...newAddress, zipCode: e.target.value });
                  }
                }}
                placeholder="110111"
                className="mt-2"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={editingAddress?.isDefault || newAddress.isDefault}
                onChange={(e) => {
                  if (editingAddress) {
                    setEditingAddress({ ...editingAddress, isDefault: e.target.checked });
                  } else {
                    setNewAddress({ ...newAddress, isDefault: e.target.checked });
                  }
                }}
                className="w-4 h-4 rounded"
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Marcar como dirección principal
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddressDialog(false);
                setEditingAddress(null);
                setNewAddress({
                  type: 'casa',
                  street: '',
                  city: '',
                  state: '',
                  zipCode: '',
                  isDefault: false,
                });
              }}
            >
              Cancelar
            </Button>
            <Button
              className="bg-slate-900 text-white hover:bg-slate-800"
              onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
            >
              {editingAddress ? 'Actualizar' : 'Agregar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Address Confirmation */}
      <AlertDialog open={!!addressToDelete} onOpenChange={() => setAddressToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Â¿Eliminar dirección?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La dirección será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => addressToDelete && handleDeleteAddress(addressToDelete)}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>Ingresa tu contraseña actual y tu nueva contraseña</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setPasswordData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                });
              }}
            >
              Cancelar
            </Button>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={handleChangePassword}>
              Cambiar Contraseña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



