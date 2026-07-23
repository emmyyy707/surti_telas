import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  Calendar,
  Star,
  MessageSquare,
  Settings,
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  PhoneCall,
  Mail,
  Award,
  Target,
  BarChart3,
  AlertCircle,
  RefreshCw,
  Edit2,
  User,
  Percent,
  ShoppingBag,
  Send,
  ChevronRight,
  Search,
  Filter,
  ArrowUpRight,
  Home,
  CreditCard,
  Image as ImageIcon,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Employee, AdvisorRating, ProductRating, QuickMessage } from '../types';
import { toast } from 'sonner';
import { LoadingScreen } from './LoadingScreen';
import { products, customers } from '../data/mockData';
import logoBlack from 'figma:asset/6b1b01bec62a36f96143e42f8161cda0f047b918.png';
import { motion, AnimatePresence } from 'framer-motion';

interface AdvisorPanelSidebarProps {
  employee: Employee;
  onLogout: () => void;
  ratings?: AdvisorRating[];
  onRespondToRating?: (ratingId: string, response: string) => void;
  productRatings?: ProductRating[];
  quickMessages?: QuickMessage[];
  onRespondToMessage?: (messageId: string, response: string) => void;
  onNavigate?: (page: string) => void;
}

export function AdvisorPanel({
  employee,
  onLogout,
  ratings = [],
  onRespondToRating,
  productRatings = [],
  quickMessages = [],
  onRespondToMessage,
  onNavigate
}: AdvisorPanelSidebarProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [newSaleDialog, setNewSaleDialog] = useState(false);
  const [ratingResponseDialog, setRatingResponseDialog] = useState(false);
  const [messageResponseDialog, setMessageResponseDialog] = useState(false);
  const [selectedRating, setSelectedRating] = useState<AdvisorRating | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<QuickMessage | null>(null);
  const [responseText, setResponseText] = useState('');
  const [viewPaymentImageDialog, setViewPaymentImageDialog] = useState(false);
  const [selectedPaymentImage, setSelectedPaymentImage] = useState('');
  const [denialReasonDialog, setDenialReasonDialog] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState('');
  const [denialReason, setDenialReason] = useState('');

  // Estados para editar perfil y cambiar contraseña
  const [editProfileDialog, setEditProfileDialog] = useState(false);
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [deleteProfileDialog, setDeleteProfileDialog] = useState(false);
  const [profileData, setProfileData] = useState({
    name: employee.name,
    email: employee.email,
    phone: employee.phone
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Mock data para pagos pendientes
  const [pendingPayments, setPendingPayments] = useState([
    {
      id: 'PAY-001',
      orderId: 'ORD-2024-001',
      customerName: 'Carlos Gómez',
      customerEmail: 'carlos.gomez@email.com',
      total: 156800,
      paymentProofImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
      uploadDate: '2024-12-19 14:32',
      status: 'en_verificacion' as const,
    },
    {
      id: 'PAY-002',
      orderId: 'ORD-2024-002',
      customerName: 'Ana María López',
      customerEmail: 'ana.lopez@email.com',
      total: 89500,
      paymentProofImage: 'https://images.unsplash.com/photo-1554224311-beee460ae6fb?w=800',
      uploadDate: '2024-12-19 13:15',
      status: 'en_verificacion' as const,
    },
    {
      id: 'PAY-003',
      orderId: 'ORD-2024-003',
      customerName: 'Pedro Martínez',
      customerEmail: 'pedro.martinez@email.com',
      total: 234000,
      paymentProofImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800',
      uploadDate: '2024-12-19 12:45',
      status: 'en_verificacion' as const,
    },
  ]);

  const handleApprovePayment = (paymentId: string) => {
    setPendingPayments(prev =>
      prev.map(p => p.id === paymentId ? { ...p, status: 'aprobado' as const, reviewedBy: employee.name, reviewedDate: new Date().toLocaleString() } : p)
    );
    toast.success('Pago aprobado correctamente - El cliente ha sido notificado y su pedido ha sido confirmado', {
      style: {
        fontWeight: 'bold',
        color: '#000000'
      }
    });
  };

  const handleDenyPayment = () => {
    if (!denialReason.trim()) {
      toast.error('Debes especificar un motivo de denegación');
      return;
    }

    setPendingPayments(prev =>
      prev.map(p => p.id === selectedPaymentId ? {
        ...p,
        status: 'denegado' as const,
        reviewedBy: employee.name,
        reviewedDate: new Date().toLocaleString(),
        denialReason: denialReason
      } : p)
    );

    toast.error('Pago denegado - El cliente ha sido notificado y deberá subir un nuevo comprobante', {
      style: {
        fontWeight: 'bold',
        color: '#000000'
      }
    });

    setDenialReasonDialog(false);
    setDenialReason('');
    setSelectedPaymentId('');
  };

  // Obtener clientes asignados del asesor
  const assignedClients = customers.filter(c =>
    employee.assignedClientIds?.includes(c.id)
  );

  // Datos calculados
  const salesThisMonth = employee.salesThisMonth || 0;
  const totalCommission = employee.commission || 0;
  const completedOrders = employee.ordersCompleted || 0;
  const monthlyGoal = 15000000;
  const goalProgress = (salesThisMonth / monthlyGoal) * 100;

  // Calificaciones pendientes
  const pendingRatings = ratings.filter(r => r.status === 'pendiente');
  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : '5.0';

  // Mensajes rápidos pendientes
  const pendingMessages = quickMessages.filter(m => m.status === 'pendiente');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Cargando panel de asesor..." />;
  }

  const handleRespondRating = () => {
    if (selectedRating && responseText.trim() && onRespondToRating) {
      onRespondToRating(selectedRating.id, responseText);
      toast.success('Respuesta enviada correctamente');
      setRatingResponseDialog(false);
      setResponseText('');
      setSelectedRating(null);
    }
  };

  const handleRespondMessage = () => {
    if (selectedMessage && responseText.trim() && onRespondToMessage) {
      onRespondToMessage(selectedMessage.id, responseText);
      toast.success('Respuesta enviada correctamente');
      setMessageResponseDialog(false);
      setResponseText('');
      setSelectedMessage(null);
    }
  };

  const handleEditProfile = () => {
    if (!profileData.name.trim() || !profileData.email.trim() || !profileData.phone.trim()) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    // Aquí se actualizarían los datos del empleado
    toast.success('Perfil actualizado correctamente', {
      style: { fontWeight: 'bold', color: '#000000' }
    });
    setEditProfileDialog(false);
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Aquí se cambiaría la contraseña
    toast.success('Contraseña cambiada correctamente', {
      style: { fontWeight: 'bold', color: '#000000' }
    });
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setChangePasswordDialog(false);
  };

  const handleDeleteProfile = () => {
    if (deleteConfirmText !== 'ELIMINAR') {
      toast.error('Debes escribir "ELIMINAR" para confirmar');
      return;
    }

    // Aquí se eliminaría el perfil permanentemente
    toast.error('Perfil eliminado permanentemente. Redirigiendo...', {
      style: { fontWeight: 'bold', color: '#000000' }
    });

    setTimeout(() => {
      onLogout();
    }, 2000);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
    { id: 'pending-payments', label: 'Pagos Pendientes', icon: CreditCard },
    { id: 'sales', label: 'Mis Ventas', icon: ShoppingCart },
    { id: 'clients', label: 'Mis Clientes', icon: Users },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'performance', label: 'Mi Desempeño', icon: BarChart3 },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      'completado': { label: 'Completado', color: 'bg-green-50 text-green-600 border-green-200' },
      'pendiente': { label: 'Pendiente', color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
      'en_proceso': { label: 'En Proceso', color: 'bg-blue-50 text-blue-600 border-blue-200' },
      'cancelado': { label: 'Cancelado', color: 'bg-red-50 text-red-600 border-red-200' },
    };
    return statusMap[status] || statusMap['pendiente'];
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-gray-200 fixed h-full z-40 transition-all duration-300`}>
        {/* Logo */}
        <div className="h-20 border-b border-gray-200 flex items-center justify-center px-4">
          {!sidebarCollapsed && (
            <img src={logoBlack} alt="SurtiCamisetas" className="h-10 object-contain" />
          )}
          {sidebarCollapsed && (
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white">
              SC
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-700 rounded-full flex items-center justify-center text-white flex-shrink-0">
              {employee.name.charAt(0).toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate text-gray-900">{employee.name}</p>
                <p className="text-xs text-gray-500 capitalize">{employee.role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-black text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left text-sm">{item.label}</span>
                  </>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-72'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-gray-900">
                {menuItems.find(m => m.id === activeSection)?.label || 'Panel de Asesor'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Bienvenido, {employee.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => onNavigate && onNavigate('inicio')}
                className="text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                <Home className="w-4 h-4 mr-2" />
                Ir al Sitio Web
              </Button>
              <Badge className="bg-green-50 text-green-600 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Activo
              </Badge>
              <Badge className="bg-purple-50 text-purple-600 border-purple-200">
                <Star className="w-3 h-3 mr-1" />
                {averageRating}
              </Badge>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* Dashboard */}
            {activeSection === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Ventas del Mes</p>
                        <p className="text-3xl text-gray-900">${(salesThisMonth / 1000000).toFixed(1)}M</p>
                        <p className="text-xs text-gray-500 mt-1">{goalProgress.toFixed(0)}% de la meta</p>
                      </div>
                      <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-7 h-7 text-blue-600" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Comisiones</p>
                        <p className="text-3xl text-gray-900">${(totalCommission / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3" />
                          +12% vs mes anterior
                        </p>
                      </div>
                      <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                        <Percent className="w-7 h-7 text-green-600" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Pedidos Completados</p>
                        <p className="text-3xl text-gray-900">{completedOrders}</p>
                        <p className="text-xs text-gray-500 mt-1">Este mes</p>
                      </div>
                      <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-7 h-7 text-purple-600" />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Calificación</p>
                        <p className="text-3xl text-gray-900">{averageRating}</p>
                        <p className="text-xs text-gray-500 mt-1">{ratings.length} opiniones</p>
                      </div>
                      <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center">
                        <Star className="w-7 h-7 text-yellow-600" />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Alerta de Pagos Pendientes */}
                {pendingPayments.filter(p => p.status === 'en_verificacion').length > 0 && (
                  <Card className="p-6 bg-blue-50 border-blue-200">
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="text-gray-900 mb-2">Pagos Pendientes de Verificación</h3>
                        <p className="text-sm text-gray-700 mb-3">
                          Tienes {pendingPayments.filter(p => p.status === 'en_verificacion').length} pago(s) esperando tu validación
                        </p>
                        <Button
                          onClick={() => setActiveSection('pending-payments')}
                          size="sm"
                          className="bg-black text-white hover:bg-gray-800"
                        >
                          Ver Pagos Pendientes
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Meta del Mes */}
                <Card className="p-6 bg-gradient-to-br from-black to-gray-800 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl">Meta del Mes</h3>
                        <p className="text-white/70 text-sm">Objetivo: ${(monthlyGoal / 1000000).toFixed(1)}M</p>
                      </div>
                    </div>
                    <Badge className={`${goalProgress >= 100 ? 'bg-green-500' : 'bg-white/20'} text-white border-0`}>
                      {goalProgress.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${goalProgress >= 100 ? 'bg-green-500' : 'bg-white'}`}
                        style={{ width: `${Math.min(goalProgress, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-white/80 mt-2">
                      ${(salesThisMonth / 1000000).toFixed(2)}M de ${(monthlyGoal / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </Card>

                {/* Clientes Asignados */}
                {assignedClients.length > 0 && (
                  <Card className="p-6 bg-white shadow-sm">
                    <h3 className="text-lg text-gray-900 mb-4">Mis Clientes Asignados</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {assignedClients.map((client) => (
                        <div key={client.id} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <Badge className={client.status === 'activo' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}>
                              {client.status}
                            </Badge>
                          </div>
                          <h4 className="text-gray-900 mb-2">{client.name}</h4>
                          <div className="space-y-1 text-xs text-gray-600">
                            <p className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {client.email}
                            </p>
                            <p className="flex items-center gap-1">
                              <PhoneCall className="w-3 h-3" />
                              {client.phone}
                            </p>
                          </div>
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-gray-500">Total gastado</p>
                            <p className="text-lg text-gray-900">${client.totalSpent.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Alertas y Notificaciones */}
                {(pendingRatings.length > 0 || pendingMessages.length > 0) && (
                  <Card className="p-6 bg-orange-50 border-orange-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <h3 className="text-gray-900 mb-2">Atención Requerida</h3>
                        <ul className="space-y-1 text-sm text-gray-700">
                          {pendingRatings.length > 0 && (
                            <li>• Tienes {pendingRatings.length} calificación(es) pendiente(s) de responder</li>
                          )}
                          {pendingMessages.length > 0 && (
                            <li>• Tienes {pendingMessages.length} mensaje(s) rápido(s) sin responder</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </Card>
                )}
              </motion.div>
            )}

            {/* Pagos Pendientes */}
            {activeSection === 'pending-payments' && (
              <motion.div
                key="pending-payments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl text-gray-900">Pagos Pendientes de Verificación</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Valida los comprobantes de pago enviados por los clientes
                    </p>
                  </div>
                  <Badge className="bg-blue-50 text-blue-600 border-blue-200 text-lg px-4 py-2">
                    {pendingPayments.filter(p => p.status === 'en_verificacion').length} pendientes
                  </Badge>
                </div>

                {/* Filtros de Estado */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    En Verificación ({pendingPayments.filter(p => p.status === 'en_verificacion').length})
                  </Button>
                  <Button
                    variant="outline"
                    className="border-green-200 text-green-600 hover:bg-green-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprobados ({pendingPayments.filter(p => p.status === 'aprobado').length})
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Denegados ({pendingPayments.filter(p => p.status === 'denegado').length})
                  </Button>
                </div>

                {/* Lista de Pagos */}
                <div className="space-y-4">
                  {pendingPayments.map((payment) => (
                    <Card
                      key={payment.id}
                      className={`p-6 ${
                        payment.status === 'en_verificacion'
                          ? 'border-blue-200 bg-blue-50'
                          : payment.status === 'aprobado'
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          {/* Cliente Info */}
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl">
                            {payment.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg text-gray-900 mb-1">{payment.customerName}</h3>
                            <p className="text-sm text-gray-600 mb-2">{payment.customerEmail}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <ShoppingCart className="w-4 h-4" />
                                Pedido: {payment.orderId}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {payment.uploadDate}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Total y Estado */}
                        <div className="text-right">
                          <p className="text-2xl text-gray-900 mb-2">${payment.total.toLocaleString()}</p>
                          <Badge
                            className={
                              payment.status === 'en_verificacion'
                                ? 'bg-blue-600 text-white border-0'
                                : payment.status === 'aprobado'
                                ? 'bg-green-600 text-white border-0'
                                : 'bg-red-600 text-white border-0'
                            }
                          >
                            {payment.status === 'en_verificacion' && 'â³ En Verificación'}
                            {payment.status === 'aprobado' && 'âœ… Aprobado'}
                            {payment.status === 'denegado' && 'âŒ Denegado'}
                          </Badge>
                        </div>
                      </div>

                      {/* Comprobante de Pago */}
                      <div className="mb-4">
                        <h4 className="text-sm text-gray-700 mb-2 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Comprobante de Pago
                        </h4>
                        <div
                          className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => {
                            setSelectedPaymentImage(payment.paymentProofImage);
                            setSelectedPaymentId(payment.id);
                            setViewPaymentImageDialog(true);
                          }}
                        >
                          <img
                            src={payment.paymentProofImage}
                            alt="Comprobante"
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                            <Eye className="w-12 h-12 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      {payment.status === 'en_verificacion' && (
                        <div className="flex gap-3 pt-4 border-t">
                          <Button
                            onClick={() => handleApprovePayment(payment.id)}
                            className="flex-1 bg-green-600 text-white hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aceptar Pago
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedPaymentId(payment.id);
                              setDenialReasonDialog(true);
                            }}
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Denegar Pago
                          </Button>
                        </div>
                      )}

                      {/* Info de Revisión */}
                      {(payment.status === 'aprobado' || payment.status === 'denegado') && (
                        <div className="pt-4 border-t">
                          <p className="text-sm text-gray-600">
                            <strong>{payment.status === 'aprobado' ? 'Pago aprobado' : 'Pago denegado'}</strong>
                          </p>
                          <p className="text-xs text-gray-500">
                            Por: {payment.reviewedBy} - {payment.reviewedDate}
                          </p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>

                {pendingPayments.length === 0 && (
                  <Card className="p-12 bg-white shadow-sm text-center">
                    <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg text-gray-900 mb-2">No hay pagos pendientes</h3>
                    <p className="text-sm text-gray-500">
                      Los pagos enviados por clientes aparecerán aquí para su verificación
                    </p>
                  </Card>
                )}
              </motion.div>
            )}

            {/* Mis Ventas */}
            {activeSection === 'sales' && (
              <motion.div
                key="sales"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl text-gray-900">Historial de Ventas</h2>
                    <p className="text-sm text-gray-500 mt-1">Gestiona tus ventas y pedidos</p>
                  </div>
                  <Button onClick={() => setNewSaleDialog(true)} className="bg-black text-white hover:bg-gray-800">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Venta
                  </Button>
                </div>

                <Card className="p-6 bg-white shadow-sm">
                  <p className="text-gray-600 text-center py-12">
                    Las ventas se sincronizarán con el sistema de pedidos del administrador
                  </p>
                </Card>
              </motion.div>
            )}

            {/* Mis Clientes */}
            {activeSection === 'clients' && (
              <motion.div
                key="clients"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl text-gray-900">Mis Clientes</h2>
                  <p className="text-sm text-gray-500 mt-1">Gestiona tus clientes asignados</p>
                </div>

                {assignedClients.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignedClients.map((client) => (
                      <Card key={client.id} className="p-6 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <Badge className={client.status === 'activo' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}>
                            {client.status}
                          </Badge>
                        </div>

                        <h3 className="text-lg text-gray-900 mb-3">{client.name}</h3>

                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{client.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <PhoneCall className="w-4 h-4" />
                            <span>{client.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Cliente desde {client.registrationDate}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                          <div>
                            <p className="text-xs text-gray-500">Pedidos</p>
                            <p className="text-xl text-gray-900">{client.totalOrders}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Total gastado</p>
                            <p className="text-xl text-gray-900">${(client.totalSpent / 1000).toFixed(0)}K</p>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                          </Button>
                          <Button size="sm" className="flex-1 bg-black text-white hover:bg-gray-800">
                            <PhoneCall className="w-4 h-4 mr-2" />
                            Contactar
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 bg-white shadow-sm text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg text-gray-900 mb-2">No tienes clientes asignados</h3>
                    <p className="text-sm text-gray-500">
                      Los clientes se asignarán automáticamente cuando realices ventas
                    </p>
                  </Card>
                )}
              </motion.div>
            )}

            {/* Calificaciones */}
            {activeSection === 'ratings' && (
              <motion.div
                key="ratings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl text-gray-900">Calificaciones de Clientes</h2>
                    <p className="text-sm text-gray-500 mt-1">Promedio: {averageRating} â­ ({ratings.length} opiniones)</p>
                  </div>
                  {pendingRatings.length > 0 && (
                    <Badge className="bg-red-50 text-red-600 border-red-200">
                      {pendingRatings.length} pendiente(s)
                    </Badge>
                  )}
                </div>

                {ratings.length > 0 ? (
                  <div className="space-y-4">
                    {ratings.map((rating) => (
                      <Card key={rating.id} className={`p-6 ${rating.status === 'pendiente' ? 'border-orange-200 bg-orange-50' : 'bg-white'}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                              {rating.clientName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-gray-900">{rating.clientName}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${i < rating.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">{rating.date}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className={rating.status === 'pendiente' ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-green-100 text-green-600 border-green-200'}>
                            {rating.status === 'pendiente' ? 'Pendiente' : 'Respondido'}
                          </Badge>
                        </div>

                        <p className="text-gray-700 mb-4 pl-15">{rating.comment}</p>

                        {rating.response && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200 pl-15">
                            <p className="text-sm text-gray-600 mb-1">Tu respuesta:</p>
                            <p className="text-gray-700">{rating.response}</p>
                            <p className="text-xs text-gray-500 mt-2">{rating.responseDate}</p>
                          </div>
                        )}

                        {rating.status === 'pendiente' && (
                          <div className="mt-4 pl-15">
                            <Button
                              onClick={() => {
                                setSelectedRating(rating);
                                setRatingResponseDialog(true);
                              }}
                              size="sm"
                              className="bg-black text-white hover:bg-gray-800"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Responder
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 bg-white shadow-sm text-center">
                    <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg text-gray-900 mb-2">Sin calificaciones aún</h3>
                    <p className="text-sm text-gray-500">
                      Las calificaciones de tus clientes aparecerán aquí
                    </p>
                  </Card>
                )}
              </motion.div>
            )}

            {/* Mensajes Rápidos */}
            {activeSection === 'messages' && (
              <motion.div
                key="messages"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl text-gray-900">Mensajes Rápidos</h2>
                    <p className="text-sm text-gray-500 mt-1">Consultas de clientes del sitio web</p>
                  </div>
                  {pendingMessages.length > 0 && (
                    <Badge className="bg-red-50 text-red-600 border-red-200">
                      {pendingMessages.length} pendiente(s)
                    </Badge>
                  )}
                </div>

                {quickMessages.length > 0 ? (
                  <div className="space-y-4">
                    {quickMessages.map((message) => (
                      <Card key={message.id} className={`p-6 ${message.status === 'pendiente' ? 'border-orange-200 bg-orange-50' : 'bg-white'}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                              <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="text-gray-900">{message.clientName}</h4>
                              <p className="text-sm text-gray-500">{message.email}</p>
                              <p className="text-xs text-gray-400 mt-1">{message.date}</p>
                            </div>
                          </div>
                          <Badge className={message.status === 'pendiente' ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-green-100 text-green-600 border-green-200'}>
                            {message.status === 'pendiente' ? 'Pendiente' : 'Respondido'}
                          </Badge>
                        </div>

                        <p className="text-gray-700 mb-4 pl-15">{message.message}</p>

                        {message.response && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200 pl-15">
                            <p className="text-sm text-gray-600 mb-1">Tu respuesta:</p>
                            <p className="text-gray-700">{message.response}</p>
                            <p className="text-xs text-gray-500 mt-2">{message.responseDate}</p>
                          </div>
                        )}

                        {message.status === 'pendiente' && (
                          <div className="mt-4 pl-15">
                            <Button
                              onClick={() => {
                                setSelectedMessage(message);
                                setMessageResponseDialog(true);
                              }}
                              size="sm"
                              className="bg-black text-white hover:bg-gray-800"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Responder
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 bg-white shadow-sm text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg text-gray-900 mb-2">Sin mensajes</h3>
                    <p className="text-sm text-gray-500">
                      Los mensajes rápidos de clientes aparecerán aquí
                    </p>
                  </Card>
                )}
              </motion.div>
            )}

            {/* Productos */}
            {activeSection === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl text-gray-900">Catálogo de Productos</h2>
                  <p className="text-sm text-gray-500 mt-1">Explora los productos disponibles</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.slice(0, 8).map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all">
                      <div className="aspect-square bg-gray-100 relative">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        {product.isOnSale && (
                          <Badge className="absolute top-2 right-2 bg-red-500 text-white border-0">
                            {product.discount}% OFF
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="text-gray-900 mb-2 line-clamp-2">{product.name}</h4>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xl text-gray-900">${product.price.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                          </div>
                          <Button size="sm" className="bg-black text-white hover:bg-gray-800">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Mi Desempeño */}
            {activeSection === 'performance' && (
              <motion.div
                key="performance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl text-gray-900">Mi Desempeño</h2>
                  <p className="text-sm text-gray-500 mt-1">Estadísticas y métricas de rendimiento</p>
                </div>

                <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
                      <Award className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl mb-1">Rendimiento del Mes</h3>
                      <p className="text-white/80">Resumen de tu desempeño actual</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                      <p className="text-white/80 text-sm mb-1">Ventas Totales</p>
                      <p className="text-3xl">${(salesThisMonth / 1000000).toFixed(2)}M</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                      <p className="text-white/80 text-sm mb-1">Comisiones</p>
                      <p className="text-3xl">${(totalCommission / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                      <p className="text-white/80 text-sm mb-1">Pedidos</p>
                      <p className="text-3xl">{completedOrders}</p>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-lg text-gray-900 mb-4">Información Laboral</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Departamento</p>
                        <p className="text-gray-900">{employee.department}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Fecha de Ingreso</p>
                        <p className="text-gray-900">{employee.hireDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rol</p>
                        <p className="text-gray-900 capitalize">{employee.role}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Estado</p>
                        <Badge className={employee.status === 'activo' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}>
                          {employee.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg text-gray-900 mb-4">Estadísticas Generales</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Total de Ventas Históricas</p>
                        <p className="text-2xl text-gray-900">${(employee.totalSales / 1000000).toFixed(2)}M</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Pedidos Completados Totales</p>
                        <p className="text-2xl text-gray-900">{completedOrders}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Clientes Asignados</p>
                        <p className="text-2xl text-gray-900">{assignedClients.length}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Configuración */}
            {activeSection === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl text-gray-900">Configuración</h2>
                  <p className="text-sm text-gray-500 mt-1">Gestiona tu información personal</p>
                </div>

                <Card className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-black to-gray-800 rounded-full flex items-center justify-center text-white text-3xl">
                      {employee.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl text-gray-900">{employee.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{employee.role} - {employee.department}</p>
                      <p className="text-xs text-gray-500 mt-1">Miembro desde {employee.hireDate}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Correo Electrónico</Label>
                      <Input value={employee.email} disabled className="mt-2" />
                    </div>
                    <div>
                      <Label>Teléfono</Label>
                      <Input value={employee.phone} disabled className="mt-2" />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button
                      className="bg-black text-white hover:bg-gray-800"
                      onClick={() => setEditProfileDialog(true)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setChangePasswordDialog(true)}
                    >
                      Cambiar Contraseña
                    </Button>
                  </div>
                </Card>

                {/* Navegación y Sesión */}
                <Card className="p-6">
                  <h3 className="text-lg text-gray-900 mb-4">Navegación</h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() => onNavigate && onNavigate('inicio')}
                      className="w-full justify-start text-gray-700 border-gray-300 hover:bg-gray-50"
                    >
                      <Home className="w-5 h-5 mr-3" />
                      Ir al Sitio Web
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onLogout}
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </Card>

                {/* Zona de Peligro */}
                <Card className="p-6 border-red-200 bg-red-50">
                  <h3 className="text-lg text-red-900 mb-2">Zona de Peligro</h3>
                  <p className="text-sm text-red-700 mb-4">Las acciones en esta sección son irreversibles</p>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteProfileDialog(true)}
                    className="w-full justify-start text-red-600 border-red-300 hover:bg-red-100 bg-white"
                  >
                    <AlertCircle className="w-5 h-5 mr-3" />
                    Eliminar Perfil
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Dialog para responder calificaciones */}
      <Dialog open={ratingResponseDialog} onOpenChange={setRatingResponseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Responder Calificación</DialogTitle>
            <DialogDescription>
              Envía una respuesta al cliente {selectedRating?.clientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRating && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < selectedRating.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-700">{selectedRating.comment}</p>
              </div>
            )}
            <div>
              <Label>Tu Respuesta</Label>
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Escribe tu respuesta al cliente..."
                className="mt-2 min-h-[120px]"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleRespondRating} className="flex-1 bg-black text-white hover:bg-gray-800">
                <Send className="w-4 h-4 mr-2" />
                Enviar Respuesta
              </Button>
              <Button variant="outline" onClick={() => {
                setRatingResponseDialog(false);
                setResponseText('');
                setSelectedRating(null);
              }}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para responder mensajes */}
      <Dialog open={messageResponseDialog} onOpenChange={setMessageResponseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Responder Mensaje</DialogTitle>
            <DialogDescription>
              Envía una respuesta a {selectedMessage?.clientName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedMessage && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">{selectedMessage.email}</p>
                <p className="text-sm text-gray-700">{selectedMessage.message}</p>
              </div>
            )}
            <div>
              <Label>Tu Respuesta</Label>
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Escribe tu respuesta..."
                className="mt-2 min-h-[120px]"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleRespondMessage} className="flex-1 bg-black text-white hover:bg-gray-800">
                <Send className="w-4 h-4 mr-2" />
                Enviar Respuesta
              </Button>
              <Button variant="outline" onClick={() => {
                setMessageResponseDialog(false);
                setResponseText('');
                setSelectedMessage(null);
              }}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver imagen de pago */}
      <Dialog open={viewPaymentImageDialog} onOpenChange={setViewPaymentImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comprobante de Pago</DialogTitle>
            <DialogDescription>
              Revisa el comprobante de pago subido por el cliente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPaymentImage && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <img src={selectedPaymentImage} alt="Comprobante de Pago" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex gap-3">
              <Button onClick={() => {
                handleApprovePayment(selectedPaymentId);
                setViewPaymentImageDialog(false);
                setSelectedPaymentImage('');
                setSelectedPaymentId('');
              }} className="flex-1 bg-black text-white hover:bg-gray-800">
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprobar Pago
              </Button>
              <Button variant="outline" onClick={() => {
                setViewPaymentImageDialog(false);
                setSelectedPaymentImage('');
                setSelectedPaymentId('');
                setDenialReasonDialog(true);
              }}>
                Denegar Pago
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para denegar pago */}
      <Dialog open={denialReasonDialog} onOpenChange={setDenialReasonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Denegar Pago</DialogTitle>
            <DialogDescription>
              Especifica el motivo por el cual deseas denegar este pago
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Motivo de Denegación</Label>
              <Textarea
                value={denialReason}
                onChange={(e) => setDenialReason(e.target.value)}
                placeholder="Escribe el motivo de denegación..."
                className="mt-2 min-h-[120px]"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleDenyPayment} className="flex-1 bg-black text-white hover:bg-gray-800">
                <XCircle className="w-4 h-4 mr-2" />
                Denegar Pago
              </Button>
              <Button variant="outline" onClick={() => {
                setDenialReasonDialog(false);
                setDenialReason('');
                setSelectedPaymentId('');
              }}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar perfil */}
      <Dialog open={editProfileDialog} onOpenChange={setEditProfileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Actualiza tu información personal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre Completo</Label>
              <Input
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Nombre completo"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Correo Electrónico</Label>
              <Input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="Teléfono"
                className="mt-2"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleEditProfile} className="flex-1 bg-black text-white hover:bg-gray-800">
                <CheckCircle className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
              <Button variant="outline" onClick={() => {
                setEditProfileDialog(false);
                setProfileData({
                  name: employee.name,
                  email: employee.email,
                  phone: employee.phone
                });
              }}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para cambiar contraseña */}
      <Dialog open={changePasswordDialog} onOpenChange={setChangePasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu contraseña actual y la nueva contraseña
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Contraseña Actual</Label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Contraseña actual"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Nueva Contraseña</Label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Nueva contraseña (mínimo 6 caracteres)"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Confirmar Nueva Contraseña</Label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirma la nueva contraseña"
                className="mt-2"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleChangePassword} className="flex-1 bg-black text-white hover:bg-gray-800">
                <CheckCircle className="w-4 h-4 mr-2" />
                Cambiar Contraseña
              </Button>
              <Button variant="outline" onClick={() => {
                setChangePasswordDialog(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para eliminar perfil */}
      <Dialog open={deleteProfileDialog} onOpenChange={setDeleteProfileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">âš ï¸ Eliminar Perfil Permanentemente</DialogTitle>
            <DialogDescription>
              Esta acción es IRREVERSIBLE. Tu perfil, datos y toda tu información serán eliminados permanentemente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 mb-2">Al eliminar tu perfil:</p>
              <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc">
                <li>Perderás acceso permanentemente</li>
                <li>Todos tus datos serán eliminados</li>
                <li>Tu historial de ventas se perderá</li>
                <li>No podrás recuperar esta cuenta</li>
              </ul>
            </div>
            <div>
              <Label className="text-red-600">Escribe "ELIMINAR" para confirmar</Label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="ELIMINAR"
                className="mt-2 border-red-300"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleDeleteProfile}
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
                disabled={deleteConfirmText !== 'ELIMINAR'}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Eliminar Perfil Permanentemente
              </Button>
              <Button variant="outline" onClick={() => {
                setDeleteProfileDialog(false);
                setDeleteConfirmText('');
              }}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}




