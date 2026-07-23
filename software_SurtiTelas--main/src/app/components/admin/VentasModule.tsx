import { useState } from 'react';
import {
  Users,
  Package,
  ShoppingCart,
  FileText,
  CreditCard,
  Mail,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Download,
  DollarSign,
  Calendar,
  Phone,
  RotateCcw,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { DevolucionesModule } from './DevolucionesModule';
import { TablePagination } from '../ui/table-pagination';

interface VentasModuleProps {
  activeTab: string;
}

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  totalCompras: number;
  ultimaCompra: string;
  estado: 'activo' | 'inactivo';
}

interface Pedido {
  id: string;
  cliente: string;
  productos: number;
  total: number;
  estado: 'pendiente' | 'procesando' | 'completado' | 'cancelado';
  fecha: string;
  metodoPago: string;
}

export function VentasModule({ activeTab }: VentasModuleProps) {
  // Si es el módulo de devoluciones, renderizar directamente el DevolucionesModule
  if (activeTab === 'control-stock-devuelto') {
    return <DevolucionesModule activeTab={activeTab} />;
  }

  // Determinar el tab activo basado en activeTab
  const getCurrentTab = () => {
    if (activeTab === 'catalogo-digital' || activeTab === 'catalogo') return 'catalogo';
    if (activeTab === 'gestion-pedidos' || activeTab === 'pedidos') return 'pedidos';
    if (activeTab === 'facturacion') return 'facturacion';
    if (activeTab === 'pagos-abonos' || activeTab === 'pagos') return 'pagos';
    if (activeTab === 'contacto-empresa' || activeTab === 'contacto') return 'contacto';
    return 'clientes';
  };

  const [clientes, setClientes] = useState<Cliente[]>([
    { id: '1', nombre: 'Juan Pérez', email: 'juan@example.com', telefono: '555-3001', direccion: 'Calle 10 #20-30', totalCompras: 15000, ultimaCompra: '2024-12-10', estado: 'activo' },
    { id: '2', nombre: 'María González', email: 'maria@example.com', telefono: '555-3002', direccion: 'Av. 15 #45-67', totalCompras: 23000, ultimaCompra: '2024-12-09', estado: 'activo' },
    { id: '3', nombre: 'Carlos López', email: 'carlos@example.com', telefono: '555-3003', direccion: 'Carrera 8 #12-34', totalCompras: 18500, ultimaCompra: '2024-12-08', estado: 'activo' },
    { id: '4', nombre: 'Ana Martínez', email: 'ana@example.com', telefono: '555-3004', direccion: 'Calle 5 #78-90', totalCompras: 31000, ultimaCompra: '2024-12-07', estado: 'activo' },
    { id: '5', nombre: 'Pedro Rodríguez', email: 'pedro@example.com', telefono: '555-3005', direccion: 'Av. 20 #34-56', totalCompras: 12000, ultimaCompra: '2024-11-28', estado: 'inactivo' },
    { id: '6', nombre: 'Laura Sánchez', email: 'laura@example.com', telefono: '555-3006', direccion: 'Calle 22 #40-50', totalCompras: 27000, ultimaCompra: '2024-12-11', estado: 'activo' },
    { id: '7', nombre: 'Diego Ramírez', email: 'diego@example.com', telefono: '555-3007', direccion: 'Av. 30 #55-65', totalCompras: 19000, ultimaCompra: '2024-12-06', estado: 'activo' },
    { id: '8', nombre: 'Carolina Morales', email: 'carolina@example.com', telefono: '555-3008', direccion: 'Carrera 12 #25-35', totalCompras: 35000, ultimaCompra: '2024-12-12', estado: 'activo' },
    { id: '9', nombre: 'Roberto Silva', email: 'roberto@example.com', telefono: '555-3009', direccion: 'Calle 18 #30-40', totalCompras: 14000, ultimaCompra: '2024-11-20', estado: 'inactivo' },
    { id: '10', nombre: 'Patricia Gómez', email: 'patricia@example.com', telefono: '555-3010', direccion: 'Av. 25 #60-70', totalCompras: 22000, ultimaCompra: '2024-12-13', estado: 'activo' },
    { id: '11', nombre: 'Fernando Torres', email: 'fernando@example.com', telefono: '555-3011', direccion: 'Carrera 20 #45-55', totalCompras: 16000, ultimaCompra: '2024-12-05', estado: 'activo' },
    { id: '12', nombre: 'Sandra Vargas', email: 'sandra@example.com', telefono: '555-3012', direccion: 'Calle 35 #18-28', totalCompras: 29000, ultimaCompra: '2024-12-14', estado: 'activo' },
    { id: '13', nombre: 'Miguel Ángel Ruiz', email: 'miguel@example.com', telefono: '555-3013', direccion: 'Av. 40 #75-85', totalCompras: 11000, ultimaCompra: '2024-11-15', estado: 'inactivo' },
    { id: '14', nombre: 'Andrea Jiménez', email: 'andrea@example.com', telefono: '555-3014', direccion: 'Carrera 28 #50-60', totalCompras: 33000, ultimaCompra: '2024-12-15', estado: 'activo' },
    { id: '15', nombre: 'Jorge Hernández', email: 'jorge@example.com', telefono: '555-3015', direccion: 'Calle 42 #22-32', totalCompras: 20000, ultimaCompra: '2024-12-16', estado: 'activo' },
  ]);

  const [pedidos, setPedidos] = useState<Pedido[]>([
    { id: 'PED-001', cliente: 'Juan Pérez', productos: 5, total: 15000, estado: 'procesando', fecha: '2024-12-10', metodoPago: 'Tarjeta' },
    { id: 'PED-002', cliente: 'María González', productos: 8, total: 23000, estado: 'completado', fecha: '2024-12-09', metodoPago: 'Efectivo' },
    { id: 'PED-003', cliente: 'Carlos López', productos: 6, total: 18500, estado: 'pendiente', fecha: '2024-12-08', metodoPago: 'Transferencia' },
    { id: 'PED-004', cliente: 'Ana Martínez', productos: 10, total: 31000, estado: 'procesando', fecha: '2024-12-07', metodoPago: 'Tarjeta' },
    { id: 'PED-005', cliente: 'Pedro Rodríguez', productos: 4, total: 12000, estado: 'completado', fecha: '2024-12-06', metodoPago: 'Efectivo' },
    { id: 'PED-006', cliente: 'Laura Sánchez', productos: 7, total: 27000, estado: 'completado', fecha: '2024-12-11', metodoPago: 'Tarjeta' },
    { id: 'PED-007', cliente: 'Diego Ramírez', productos: 5, total: 19000, estado: 'procesando', fecha: '2024-12-06', metodoPago: 'Transferencia' },
    { id: 'PED-008', cliente: 'Carolina Morales', productos: 12, total: 35000, estado: 'pendiente', fecha: '2024-12-12', metodoPago: 'Tarjeta' },
    { id: 'PED-009', cliente: 'Roberto Silva', productos: 3, total: 14000, estado: 'cancelado', fecha: '2024-11-20', metodoPago: 'Efectivo' },
    { id: 'PED-010', cliente: 'Patricia Gómez', productos: 9, total: 22000, estado: 'completado', fecha: '2024-12-13', metodoPago: 'Transferencia' },
    { id: 'PED-011', cliente: 'Fernando Torres', productos: 6, total: 16000, estado: 'procesando', fecha: '2024-12-05', metodoPago: 'Tarjeta' },
    { id: 'PED-012', cliente: 'Sandra Vargas', productos: 11, total: 29000, estado: 'completado', fecha: '2024-12-14', metodoPago: 'Efectivo' },
    { id: 'PED-013', cliente: 'Miguel Ángel Ruiz', productos: 2, total: 11000, estado: 'cancelado', fecha: '2024-11-15', metodoPago: 'Tarjeta' },
    { id: 'PED-014', cliente: 'Andrea Jiménez', productos: 13, total: 33000, estado: 'pendiente', fecha: '2024-12-15', metodoPago: 'Transferencia' },
    { id: 'PED-015', cliente: 'Jorge Hernández', productos: 8, total: 20000, estado: 'completado', fecha: '2024-12-16', metodoPago: 'Efectivo' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPageClientes, setCurrentPageClientes] = useState(1);
  const [itemsPerPageClientes] = useState(10);
  const [currentPagePedidos, setCurrentPagePedidos] = useState(1);
  const [itemsPerPagePedidos] = useState(10);
  const [currentPageContactos, setCurrentPageContactos] = useState(1);
  const [itemsPerPageContactos] = useState(10);

  const clientesRegistrados = clientes.length;
  const ventasMes = pedidos.reduce((sum, p) => sum + p.total, 0);
  const pedidosActivos = pedidos.filter(p => p.estado !== 'completado' && p.estado !== 'cancelado').length;
  const financiamientoPendiente = 5;

  const contactos = [
    { id: '1', cliente: 'Laura Sánchez', email: 'laura@example.com', telefono: '555-4001', asunto: 'Consulta sobre personalización', fecha: '2024-12-11 10:30', estado: 'nuevo' },
    { id: '2', cliente: 'Roberto Díaz', email: 'roberto@example.com', telefono: '555-4002', asunto: 'Cotización para evento corporativo', fecha: '2024-12-11 09:15', estado: 'en_proceso' },
    { id: '3', cliente: 'Carmen Ruiz', email: 'carmen@example.com', telefono: '555-4003', asunto: 'Seguimiento de pedido', fecha: '2024-12-10 18:00', estado: 'resuelto' },
    { id: '4', cliente: 'Andrés López', email: 'andres@example.com', telefono: '555-4004', asunto: 'Información de precios mayoristas', fecha: '2024-12-12 11:45', estado: 'nuevo' },
    { id: '5', cliente: 'Valeria Castro', email: 'valeria@example.com', telefono: '555-4005', asunto: 'Cambio de dirección de envío', fecha: '2024-12-12 14:20', estado: 'resuelto' },
    { id: '6', cliente: 'Sebastián Torres', email: 'sebastian@example.com', telefono: '555-4006', asunto: 'Producto defectuoso', fecha: '2024-12-13 09:30', estado: 'en_proceso' },
    { id: '7', cliente: 'Daniela Morales', email: 'daniela@example.com', telefono: '555-4007', asunto: 'Solicitud de catálogo digital', fecha: '2024-12-13 16:00', estado: 'resuelto' },
    { id: '8', cliente: 'Ricardo Gómez', email: 'ricardo@example.com', telefono: '555-4008', asunto: 'Devolución de pedido', fecha: '2024-12-14 10:15', estado: 'en_proceso' },
    { id: '9', cliente: 'Camila Vargas', email: 'camila@example.com', telefono: '555-4009', asunto: 'Consulta sobre tallas', fecha: '2024-12-14 13:50', estado: 'resuelto' },
    { id: '10', cliente: 'Esteban Ruiz', email: 'esteban@example.com', telefono: '555-4010', asunto: 'Pedido urgente para evento', fecha: '2024-12-15 08:30', estado: 'nuevo' },
    { id: '11', cliente: 'Mariana Jiménez', email: 'mariana@example.com', telefono: '555-4011', asunto: 'Personalización de logo corporativo', fecha: '2024-12-15 12:00', estado: 'en_proceso' },
    { id: '12', cliente: 'Gabriel Hernández', email: 'gabriel@example.com', telefono: '555-4012', asunto: 'Consulta de tiempos de entrega', fecha: '2024-12-16 10:00', estado: 'nuevo' },
    { id: '13', cliente: 'Sofía Ramírez', email: 'sofia@example.com', telefono: '555-4013', asunto: 'Información de garantías', fecha: '2024-12-16 15:30', estado: 'resuelto' },
    { id: '14', cliente: 'Mateo Silva', email: 'mateo@example.com', telefono: '555-4014', asunto: 'Cambio de producto', fecha: '2024-12-17 09:45', estado: 'en_proceso' },
    { id: '15', cliente: 'Isabella López', email: 'isabella@example.com', telefono: '555-4015', asunto: 'Solicitud de factura electrónica', fecha: '2024-12-17 14:00', estado: 'resuelto' },
  ];

  const getEstadoBadge = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activo':
      case 'completado':
      case 'resuelto':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completado</Badge>;
      case 'procesando':
      case 'en_proceso':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">En proceso</Badge>;
      case 'pendiente':
      case 'nuevo':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendiente</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelado</Badge>;
      case 'inactivo':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactivo</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Ventas y Pedidos</h1>
        <p className="text-gray-600 mt-1">Gestión de clientes, catálogo, pedidos y facturación</p>
      </div>

      {/* Cards superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{clientesRegistrados}</p>
              <p className="text-sm text-gray-600">Clientes registrados</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${ventasMes.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Ventas del mes</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pedidosActivos}</p>
              <p className="text-sm text-gray-600">Pedidos activos</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{financiamientoPendiente}</p>
              <p className="text-sm text-gray-600">Financiamiento pendiente</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={getCurrentTab()} className="space-y-6">
        <TabsList className="bg-white p-2 rounded-lg shadow-sm flex flex-col sm:flex-row h-auto gap-2 w-full sm:w-auto">
          <TabsTrigger value="clientes" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <Users className="h-4 w-4 mr-2" />
            <span>Gestión de clientes</span>
          </TabsTrigger>
          <TabsTrigger value="catalogo" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <Package className="h-4 w-4 mr-2" />
            <span>Catálogo digital</span>
          </TabsTrigger>
          <TabsTrigger value="pedidos" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <ShoppingCart className="h-4 w-4 mr-2" />
            <span>Gestión de pedidos</span>
          </TabsTrigger>
          <TabsTrigger value="facturacion" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <FileText className="h-4 w-4 mr-2" />
            <span>Facturación</span>
          </TabsTrigger>
          <TabsTrigger value="pagos" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <CreditCard className="h-4 w-4 mr-2" />
            <span>Pagos y abonos</span>
          </TabsTrigger>
          <TabsTrigger value="contacto" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <Mail className="h-4 w-4 mr-2" />
            <span>Contacto con empresa</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Gestión de clientes */}
        <TabsContent value="clientes" className="space-y-6">
          <Card className="p-4 bg-white rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-none">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button className="bg-gray-900 hover:bg-gray-800 flex-1 sm:flex-none">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Cliente
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Teléfono</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total Compras</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Última Compra</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filtered = clientes.filter(c => c.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
                    const startIndex = (currentPageClientes - 1) * itemsPerPageClientes;
                    const endIndex = startIndex + itemsPerPageClientes;
                    const paginated = filtered.slice(startIndex, endIndex);
                    return paginated.map((cliente) => (
                      <tr key={cliente.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-medium">
                              {cliente.nombre.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{cliente.nombre}</p>
                              <p className="text-xs text-gray-500">{cliente.direccion}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700">{cliente.email}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {cliente.telefono}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">${cliente.totalCompras.toLocaleString()}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {cliente.ultimaCompra}
                          </div>
                        </td>
                        <td className="py-4 px-4">{getEstadoBadge(cliente.estado)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            <TablePagination
              currentPage={currentPageClientes}
              totalItems={clientes.filter(c => c.nombre.toLowerCase().includes(searchTerm.toLowerCase())).length}
              itemsPerPage={itemsPerPageClientes}
              onPageChange={setCurrentPageClientes}
            />
          </Card>
        </TabsContent>

        {/* Tab: Catálogo digital */}
        <TabsContent value="catalogo" className="space-y-6">
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900">Catálogo de Productos</h3>
                <p className="text-sm text-gray-600 mt-1">Gestión de productos disponibles para la venta</p>
              </div>
              <Button className="bg-gray-900 hover:bg-gray-800">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            </div>
            <div className="text-center py-12 text-gray-500">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>El catálogo digital se gestiona desde el módulo de Inventario</p>
              <p className="text-sm mt-2">Aquí podrás ver los productos disponibles para la venta en línea</p>
            </div>
          </Card>
        </TabsContent>

        {/* Tab: Gestión de pedidos */}
        <TabsContent value="pedidos" className="space-y-6">
          <Card className="p-4 bg-white rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar pedidos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button className="bg-gray-900 hover:bg-gray-800 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Pedido
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ID Pedido</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Productos</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Método de Pago</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filtered = pedidos.filter(p => p.id.toLowerCase().includes(searchTerm.toLowerCase()) || p.cliente.toLowerCase().includes(searchTerm.toLowerCase()));
                    const startIndex = (currentPagePedidos - 1) * itemsPerPagePedidos;
                    const endIndex = startIndex + itemsPerPagePedidos;
                    const paginated = filtered.slice(startIndex, endIndex);
                    return paginated.map((pedido) => (
                      <tr key={pedido.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">{pedido.id}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">{pedido.cliente}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">{pedido.productos} items</td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">${pedido.total.toLocaleString()}</td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">{pedido.metodoPago}</Badge>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{pedido.fecha}</td>
                        <td className="py-4 px-4">{getEstadoBadge(pedido.estado)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            <TablePagination
              currentPage={currentPagePedidos}
              totalItems={pedidos.filter(p => p.id.toLowerCase().includes(searchTerm.toLowerCase()) || p.cliente.toLowerCase().includes(searchTerm.toLowerCase())).length}
              itemsPerPage={itemsPerPagePedidos}
              onPageChange={setCurrentPagePedidos}
            />
          </Card>
        </TabsContent>

        {/* Tab: Facturación */}
        <TabsContent value="facturacion" className="space-y-6">
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900">Facturación y Comprobantes</h3>
                <p className="text-sm text-gray-600 mt-1">Gestión de facturas electrónicas y comprobantes de venta</p>
              </div>
              <Button className="bg-gray-900 hover:bg-gray-800">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Factura
              </Button>
            </div>
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>Módulo de facturación electrónica</p>
              <p className="text-sm mt-2">Genera y gestiona facturas para tus ventas</p>
            </div>
          </Card>
        </TabsContent>

        {/* Tab: Pagos y abonos */}
        <TabsContent value="pagos" className="space-y-6">
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900">Pagos, Abonos y Financiación</h3>
                <p className="text-sm text-gray-600 mt-1">Control de pagos parciales y planes de financiamiento</p>
              </div>
              <Button className="bg-gray-900 hover:bg-gray-800">
                Registrar Pago
              </Button>
            </div>
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>Sistema de control de pagos y financiamiento</p>
              <p className="text-sm mt-2">Gestiona abonos y planes de pago flexibles</p>
            </div>
          </Card>
        </TabsContent>

        {/* Tab: Contacto con empresa */}
        <TabsContent value="contacto" className="space-y-6">
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900">Mensajes de Contacto</h3>
                <p className="text-sm text-gray-600 mt-1">Consultas y solicitudes de clientes</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Teléfono</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Asunto</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const startIndex = (currentPageContactos - 1) * itemsPerPageContactos;
                    const endIndex = startIndex + itemsPerPageContactos;
                    const paginated = contactos.slice(startIndex, endIndex);
                    return paginated.map((contacto) => (
                    <tr key={contacto.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{contacto.cliente}</td>
                      <td className="py-4 px-4 text-sm text-gray-700">{contacto.email}</td>
                      <td className="py-4 px-4 text-sm text-gray-700">{contacto.telefono}</td>
                      <td className="py-4 px-4 text-sm text-gray-700">{contacto.asunto}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{contacto.fecha}</td>
                      <td className="py-4 px-4">{getEstadoBadge(contacto.estado)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
                </tbody>
              </table>
            </div>
            <TablePagination
              currentPage={currentPageContactos}
              totalItems={contactos.length}
              itemsPerPage={itemsPerPageContactos}
              onPageChange={setCurrentPageContactos}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



