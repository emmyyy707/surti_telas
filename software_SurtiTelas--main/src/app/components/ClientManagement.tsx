import { useState } from 'react';
import {
  Users,
  MessageSquare,
  ShoppingBag,
  Clock,
  TrendingUp,
  Send,
  Eye,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Package,
  Sparkles,
  Filter,
  Search,
  ArrowRight,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Product, CartItem, Employee } from '../types';
import { products as allProducts } from '../data/mockData';
import { toast } from 'sonner';
import { SmartRecommendations } from './SmartRecommendations';
import { ClientNotes } from './ClientNotes';

interface ActiveClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'navegando' | 'carrito_activo' | 'checkout' | 'abandonado';
  currentPage: string;
  cartItems: CartItem[];
  totalValue: number;
  timeOnSite: number;
  lastActivity: string;
  interactions: number;
  assignedAdvisor?: string;
}

interface ClientInteraction {
  id: string;
  clientId: string;
  type: 'mensaje' | 'llamada' | 'recomendacion' | 'seguimiento';
  message: string;
  date: string;
  response?: string;
}

interface ClientManagementProps {
  employee: Employee;
}

export function ClientManagement({ employee }: ClientManagementProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'abandoned' | 'interactions'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<ActiveClient | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [showRecommendationsDialog, setShowRecommendationsDialog] = useState(false);

  // Mock data - clientes activos (filtrados por asesor asignado)
  const [activeClients, setActiveClients] = useState<ActiveClient[]>([
    {
      id: 'client-1', // Este cliente tiene asignado al empleado emp1 (Andrea Méndez)
      name: 'María González',
      email: 'cliente@ejemplo.com',
      phone: '+57 320 456 7890',
      status: 'carrito_activo',
      currentPage: 'Productos - Camisetas Personalizadas',
      cartItems: [
        {
          product: allProducts[0],
          quantity: 2,
          size: 'M',
          color: 'Negro',
        },
        {
          product: allProducts[1],
          quantity: 1,
          size: 'L',
          color: 'Blanco',
        },
      ],
      totalValue: 72000,
      timeOnSite: 8,
      lastActivity: 'Hace 2 minutos',
      interactions: 0,
      assignedAdvisor: 'emp1', // Este es TU cliente asignado - corresponde al empleado que inicia sesión
    },
    {
      id: 'cl-2',
      name: 'Carlos Gómez',
      email: 'carlos.gomez@empresa.com',
      phone: '+57 321 222 3333',
      status: 'checkout',
      currentPage: 'Carrito de Compras',
      cartItems: [
        {
          product: allProducts[4],
          quantity: 10,
          size: 'L',
          color: 'Azul',
        },
      ],
      totalValue: 280000,
      timeOnSite: 15,
      lastActivity: 'Hace 1 minuto',
      interactions: 2,
      assignedAdvisor: employee.id,
    },
    {
      id: 'cl-3',
      name: 'Diana Rojas',
      email: 'diana.rojas@gmail.com',
      phone: '+57 322 333 4444',
      status: 'navegando',
      currentPage: 'Inicio',
      cartItems: [],
      totalValue: 0,
      timeOnSite: 3,
      lastActivity: 'Hace 30 segundos',
      interactions: 0,
    },
    {
      id: 'cl-4',
      name: 'Roberto Sánchez',
      email: 'roberto@ejemplo.com',
      phone: '+57 323 444 5555',
      status: 'carrito_activo',
      currentPage: 'Servicios',
      cartItems: [
        {
          product: allProducts[2],
          quantity: 3,
          size: 'XL',
          color: 'Blanco',
        },
      ],
      totalValue: 96000,
      timeOnSite: 12,
      lastActivity: 'Hace 5 minutos',
      interactions: 1,
    },
  ]);

  // Mock data - carritos abandonados
  const abandonedCarts: ActiveClient[] = [
    {
      id: 'ab-1',
      name: 'Pedro López',
      email: 'pedro@ejemplo.com',
      phone: '+57 324 555 6666',
      status: 'abandonado',
      currentPage: 'Carrito',
      cartItems: [
        {
          product: allProducts[0],
          quantity: 5,
          size: 'M',
          color: 'Negro',
        },
      ],
      totalValue: 125000,
      timeOnSite: 0,
      lastActivity: 'Hace 2 horas',
      interactions: 0,
    },
    {
      id: 'ab-2',
      name: 'Ana María Torres',
      email: 'anam@ejemplo.com',
      phone: '+57 325 666 7777',
      status: 'abandonado',
      currentPage: 'Checkout',
      cartItems: [
        {
          product: allProducts[1],
          quantity: 2,
          size: 'S',
          color: 'Multicolor',
        },
        {
          product: allProducts[3],
          quantity: 1,
          size: 'M',
          color: 'Rosa',
        },
      ],
      totalValue: 62000,
      timeOnSite: 0,
      lastActivity: 'Hace 1 día',
      interactions: 1,
    },
  ];

  // Mock data - interacciones
  const [interactions, setInteractions] = useState<ClientInteraction[]>([
    {
      id: 'int-1',
      clientId: 'cl-2',
      type: 'mensaje',
      message: 'Hola Carlos, vi que estás interesado en uniformes empresariales. Â¿Necesitas ayuda?',
      date: '2025-11-05 10:30',
      response: 'Sí, necesito 10 unidades para mi equipo',
    },
    {
      id: 'int-2',
      clientId: 'cl-2',
      type: 'recomendacion',
      message: 'Te recomiendo nuestro paquete empresarial con descuento por volumen',
      date: '2025-11-05 10:32',
    },
    {
      id: 'int-3',
      clientId: 'cl-4',
      type: 'seguimiento',
      message: 'Hola Roberto, Â¿te puedo ayudar con la personalización de tu pedido?',
      date: '2025-11-05 09:15',
    },
  ]);

  const getStatusColor = (status: ActiveClient['status']) => {
    switch (status) {
      case 'navegando':
        return 'bg-blue-100 text-blue-800';
      case 'carrito_activo':
        return 'bg-yellow-100 text-yellow-800';
      case 'checkout':
        return 'bg-green-100 text-green-800';
      case 'abandonado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: ActiveClient['status']) => {
    switch (status) {
      case 'navegando':
        return 'ðŸ” Navegando';
      case 'carrito_activo':
        return 'ðŸ›’ Carrito Activo';
      case 'checkout':
        return 'ðŸ’³ En Checkout';
      case 'abandonado':
        return 'â° Abandonado';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: ActiveClient['status']) => {
    switch (status) {
      case 'navegando':
        return Eye;
      case 'carrito_activo':
        return ShoppingBag;
      case 'checkout':
        return CheckCircle2;
      case 'abandonado':
        return AlertCircle;
      default:
        return Users;
    }
  };

  const handleContactClient = (client: ActiveClient, method: 'whatsapp' | 'email' | 'phone') => {
    const whatsappNumber = client.phone.replace(/[^0-9]/g, '');
    const cartSummary = client.cartItems
      .map((item, idx) => `${idx + 1}. ${item.product.name} - ${item.size} - ${item.color} x${item.quantity}`)
      .join('\\n');

    const message = `Hola ${client.name}, soy ${employee.name} de SurtiCamisetas. Vi que estás interesado en:\\n\\n${cartSummary}\\n\\nÂ¿En qué puedo ayudarte?`;

    switch (method) {
      case 'whatsapp':
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
        toast.success('WhatsApp abierto', {
          description: `Conversación iniciada con ${client.name}`,
        });
        break;
      case 'email':
        window.location.href = `mailto:${client.email}?subject=Asistencia SurtiCamisetas&body=${encodeURIComponent(message)}`;
        toast.success('Email abierto');
        break;
      case 'phone':
        window.location.href = `tel:${client.phone}`;
        toast.success('Llamada iniciada');
        break;
    }

    // Actualizar cliente como asignado
    setActiveClients((prev) =>
      prev.map((c) => (c.id === client.id ? { ...c, assignedAdvisor: employee.id, interactions: c.interactions + 1 } : c))
    );
  };

  const handleSendRecommendation = (client: ActiveClient, productIds: string[]) => {
    const recommendedProducts = allProducts.filter((p) => productIds.includes(p.id));
    const productList = recommendedProducts.map((p) => `• ${p.name} - $${p.price.toLocaleString()}`).join('\\n');

    const whatsappNumber = client.phone.replace(/[^0-9]/g, '');
    const message = `Hola ${client.name}, basándome en tus intereses, te recomiendo:\\n\\n${productList}\\n\\nÂ¿Te gustaría más información?`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');

    const newInteraction: ClientInteraction = {
      id: `int-${interactions.length + 1}`,
      clientId: client.id,
      type: 'recomendacion',
      message: `Productos recomendados: ${recommendedProducts.map((p) => p.name).join(', ')}`,
      date: new Date().toLocaleString('es-CO'),
    };

    setInteractions([newInteraction, ...interactions]);
    setActiveClients((prev) =>
      prev.map((c) => (c.id === client.id ? { ...c, interactions: c.interactions + 1 } : c))
    );
    toast.success('Recomendación enviada', {
      description: `${recommendedProducts.length} productos sugeridos a ${client.name}`,
    });
  };

  const handleAssignToMe = (client: ActiveClient) => {
    setActiveClients((prev) =>
      prev.map((c) => (c.id === client.id ? { ...c, assignedAdvisor: employee.id } : c))
    );
    toast.success('Cliente asignado', {
      description: `${client.name} ahora es tu cliente`,
    });
  };

  const filteredClients = activeClients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const myClients = filteredClients.filter((c) => c.assignedAdvisor === employee.id);
  const unassignedClients = filteredClients.filter((c) => !c.assignedAdvisor);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-8 w-8 text-blue-600" />
            <Badge className="bg-blue-600 text-white">{activeClients.length}</Badge>
          </div>
          <p className="text-2xl text-blue-900">{activeClients.length}</p>
          <p className="text-sm text-blue-700">Clientes Activos</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <ShoppingBag className="h-8 w-8 text-green-600" />
            <Badge className="bg-green-600 text-white">{myClients.length}</Badge>
          </div>
          <p className="text-2xl text-green-900">{myClients.length}</p>
          <p className="text-sm text-green-700">Mis Clientes</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
            <Badge className="bg-yellow-600 text-white">{abandonedCarts.length}</Badge>
          </div>
          <p className="text-2xl text-yellow-900">{abandonedCarts.length}</p>
          <p className="text-sm text-yellow-700">Carritos Abandonados</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="h-8 w-8 text-purple-600" />
            <Badge className="bg-purple-600 text-white">{interactions.length}</Badge>
          </div>
          <p className="text-2xl text-purple-900">{interactions.length}</p>
          <p className="text-sm text-purple-700">Interacciones Hoy</p>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="gap-2">
            <Users className="h-4 w-4" />
            Clientes Activos
          </TabsTrigger>
          <TabsTrigger value="abandoned" className="gap-2">
            <Clock className="h-4 w-4" />
            Carritos Abandonados
          </TabsTrigger>
          <TabsTrigger value="interactions" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        {/* Active Clients Tab */}
        <TabsContent value="active" className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <Label className="text-xs">Buscar cliente</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Label className="text-xs">Filtrar por estado</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="navegando">Navegando</SelectItem>
                    <SelectItem value="carrito_activo">Carrito Activo</SelectItem>
                    <SelectItem value="checkout">En Checkout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mis Clientes */}
            {myClients.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <h3 className="text-sm">Mis Clientes Asignados ({myClients.length})</h3>
                </div>
                <div className="space-y-3">
                  {myClients.map((client) => (
                    <ClientCard
                      key={client.id}
                      client={client}
                      onContact={handleContactClient}
                      onRecommend={handleSendRecommendation}
                      onViewDetails={() => {
                        setSelectedClient(client);
                        setShowClientDialog(true);
                      }}
                      isAssigned
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Otros Clientes */}
            {unassignedClients.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-gray-600" />
                  <h3 className="text-sm">Otros Clientes Activos ({unassignedClients.length})</h3>
                </div>
                <div className="space-y-3">
                  {unassignedClients.map((client) => (
                    <ClientCard
                      key={client.id}
                      client={client}
                      onContact={handleContactClient}
                      onRecommend={handleSendRecommendation}
                      onViewDetails={() => {
                        setSelectedClient(client);
                        setShowClientDialog(true);
                      }}
                      onAssign={() => handleAssignToMe(client)}
                      isAssigned={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredClients.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>No hay clientes activos en este momento</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Abandoned Carts Tab */}
        <TabsContent value="abandoned" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="text-sm">Oportunidades de Recuperación</h3>
                <p className="text-xs text-gray-600">
                  Contacta estos clientes para ayudarles a completar su compra
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {abandonedCarts.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onContact={handleContactClient}
                  onRecommend={handleSendRecommendation}
                  onViewDetails={() => {
                    setSelectedClient(client);
                    setShowClientDialog(true);
                  }}
                  isAbandoned
                />
              ))}
            </div>

            {abandonedCarts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Â¡Excelente! No hay carritos abandonados</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Interactions Tab */}
        <TabsContent value="interactions" className="space-y-4">
          <Card className="p-4">
            <h3 className="mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Historial de Interacciones
            </h3>

            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {interactions.map((interaction) => {
                  const client = activeClients.find((c) => c.id === interaction.clientId);
                  const InteractionIcon =
                    interaction.type === 'mensaje'
                      ? MessageSquare
                      : interaction.type === 'llamada'
                      ? Phone
                      : interaction.type === 'recomendacion'
                      ? Sparkles
                      : TrendingUp;

                  return (
                    <Card key={interaction.id} className="p-4 bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-100 rounded-full p-2">
                          <InteractionIcon className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm">{client?.name || 'Cliente'}</p>
                              <p className="text-xs text-gray-500">{interaction.date}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {interaction.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{interaction.message}</p>
                          {interaction.response && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded">
                              <p className="text-xs text-gray-600">
                                <strong>Respuesta:</strong> {interaction.response}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Client Details Dialog */}
      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedClient && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Detalles del Cliente
                </DialogTitle>
                <DialogDescription>
                  Información completa y acciones de asesoría para {selectedClient.name}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Información y Carrito</TabsTrigger>
                  <TabsTrigger value="notes">Notas y Seguimiento</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                {/* Client Info */}
                <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-600">Nombre</Label>
                      <p className="text-sm">{selectedClient.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Email</Label>
                      <p className="text-sm">{selectedClient.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Teléfono</Label>
                      <p className="text-sm">{selectedClient.phone}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Estado</Label>
                      <Badge className={getStatusColor(selectedClient.status)}>
                        {getStatusText(selectedClient.status)}
                      </Badge>
                    </div>
                  </div>
                </Card>

                {/* Activity */}
                <div className="grid md:grid-cols-3 gap-3">
                  <Card className="p-3 text-center">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-xs text-gray-600">Tiempo en sitio</p>
                    <p className="text-sm">{selectedClient.timeOnSite} min</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <Eye className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <p className="text-xs text-gray-600">Última actividad</p>
                    <p className="text-sm">{selectedClient.lastActivity}</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <MessageSquare className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                    <p className="text-xs text-gray-600">Interacciones</p>
                    <p className="text-sm">{selectedClient.interactions}</p>
                  </Card>
                </div>

                {/* Cart Details */}
                {selectedClient.cartItems.length > 0 && (
                  <div>
                    <h4 className="text-sm mb-3 flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Carrito ({selectedClient.cartItems.length} productos)
                    </h4>
                    <div className="space-y-2">
                      {selectedClient.cartItems.map((item, idx) => (
                        <Card key={idx} className="p-3 flex items-center gap-3">
                          <ImageWithFallback
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-sm">{item.product.name}</p>
                            <p className="text-xs text-gray-600">
                              {item.size} • {item.color} • x{item.quantity}
                            </p>
                          </div>
                          <p className="text-sm">${(item.product.price * item.quantity).toLocaleString()}</p>
                        </Card>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm">Total:</span>
                        <span className="text-lg">${selectedClient.totalValue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleContactClient(selectedClient, 'whatsapp')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    WhatsApp
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleContactClient(selectedClient, 'phone')}
                    variant="outline"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Llamar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleContactClient(selectedClient, 'email')}
                    variant="outline"
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Button>
                </div>

                  {/* Recommend Products */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleSendRecommendation(selectedClient, ['3', '5'])}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Envío Rápido
                    </Button>
                    <Button
                      onClick={() => setShowRecommendationsDialog(true)}
                      className="bg-gradient-to-r from-orange-600 to-red-600 text-white"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Recomendaciones IA
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="notes">
                  <ClientNotes
                    clientId={selectedClient.id}
                    clientName={selectedClient.name}
                    advisorName={employee.name}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Smart Recommendations Dialog */}
      <Dialog open={showRecommendationsDialog} onOpenChange={setShowRecommendationsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedClient && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Recomendaciones Inteligentes
                </DialogTitle>
                <DialogDescription>
                  Sistema de sugerencias personalizadas basado en el comportamiento de {selectedClient.name}
                </DialogDescription>
              </DialogHeader>

              <SmartRecommendations
                clientName={selectedClient.name}
                clientPhone={selectedClient.phone}
                cartItems={selectedClient.cartItems.map((item) => item.product)}
                onSendRecommendation={(products) => {
                  setShowRecommendationsDialog(false);
                  setActiveClients((prev) =>
                    prev.map((c) =>
                      c.id === selectedClient.id ? { ...c, interactions: c.interactions + 1 } : c
                    )
                  );
                }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper Component: Client Card
interface ClientCardProps {
  client: ActiveClient;
  onContact: (client: ActiveClient, method: 'whatsapp' | 'email' | 'phone') => void;
  onRecommend: (client: ActiveClient, productIds: string[]) => void;
  onViewDetails: () => void;
  onAssign?: () => void;
  isAssigned?: boolean;
  isAbandoned?: boolean;
}

function ClientCard({ client, onContact, onRecommend, onViewDetails, onAssign, isAssigned, isAbandoned }: ClientCardProps) {
  const StatusIcon = isAbandoned ? AlertCircle : isAssigned ? CheckCircle2 : Users;

  return (
    <Card className={`p-4 hover:shadow-md transition-shadow ${isAbandoned ? 'border-red-200 bg-red-50/30' : isAssigned ? 'border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50' : ''}`}>
      {isAssigned && (
        <div className="mb-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <p className="text-xs">âœ¨ Este es tu cliente que vas a asesorar</p>
        </div>
      )}
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${isAbandoned ? 'bg-red-100' : isAssigned ? 'bg-purple-100' : 'bg-blue-100'}`}>
          <StatusIcon className={`h-6 w-6 ${isAbandoned ? 'text-red-600' : isAssigned ? 'text-purple-600' : 'text-blue-600'}`} />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-sm mb-1">{client.name}</h4>
              <p className="text-xs text-gray-600">{client.email}</p>
              <p className="text-xs text-gray-500">{client.phone}</p>
            </div>
            <Badge className={`${isAbandoned ? 'bg-red-100 text-red-800' : ''}`}>
              {isAbandoned ? 'â° Abandonado' : `${client.status === 'navegando' ? 'ðŸ”' : client.status === 'carrito_activo' ? 'ðŸ›’' : 'ðŸ’³'} ${client.currentPage}`}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
            <div className="bg-gray-100 rounded p-2">
              <p className="text-gray-600">Productos</p>
              <p className="font-medium">{client.cartItems.length}</p>
            </div>
            <div className="bg-gray-100 rounded p-2">
              <p className="text-gray-600">Valor</p>
              <p className="font-medium">${(client.totalValue / 1000).toFixed(0)}k</p>
            </div>
            <div className="bg-gray-100 rounded p-2">
              <p className="text-gray-600">Actividad</p>
              <p className="font-medium">{client.lastActivity.replace('Hace ', '')}</p>
            </div>
          </div>

          {client.cartItems.length > 0 && (
            <div className="mb-3 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">En el carrito:</p>
              <div className="flex gap-2 overflow-x-auto">
                {client.cartItems.slice(0, 3).map((item, idx) => (
                  <ImageWithFallback
                    key={idx}
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                  />
                ))}
                {client.cartItems.length > 3 && (
                  <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-xs">
                    +{client.cartItems.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => onContact(client, 'whatsapp')} className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              WhatsApp
            </Button>
            <Button size="sm" onClick={onViewDetails} variant="outline" className="h-8 text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Ver Detalles
            </Button>
            {!isAssigned && onAssign && (
              <Button size="sm" onClick={onAssign} variant="outline" className="h-8 text-xs">
                <ArrowRight className="h-3 w-3 mr-1" />
                Asignarme
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}



