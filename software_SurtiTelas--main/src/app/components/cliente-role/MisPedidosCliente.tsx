import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import {
  Package,
  Search,
  Eye,
  Download,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Factory,
  PackageCheck,
  ShoppingCart,
  MapPin,
  CreditCard,
  Calendar,
  User,
} from 'lucide-react';

interface ProductoPedido {
  nombre: string;
  cantidad: number;
  talla: string;
  color: string;
  precio: number;
}

interface Pedido {
  id: string;
  fecha: string;
  productos: number;
  total: number;
  estado: 'Entregado' | 'En entrega' | 'En producción' | 'Confirmado' | 'Pendiente' | 'Cancelado';
  tracking?: string;
  detalleProductos?: ProductoPedido[];
  direccionEnvio?: string;
  metodoPago?: string;
  fechaEntrega?: string;
  observaciones?: string;
}

export function MisPedidosCliente() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const pedidos: Pedido[] = [
    {
      id: 'PED-0012',
      fecha: '2026-05-15',
      productos: 3,
      total: 245000,
      estado: 'Entregado',
      tracking: 'TK-789456123',
      direccionEnvio: 'Calle 123 #45-67, Apartamento 301, Bogotá, Cundinamarca',
      metodoPago: 'Tarjeta Visa **** 9012',
      fechaEntrega: '2026-05-16',
      detalleProductos: [
        { nombre: 'Camiseta Básica Blanca', cantidad: 2, talla: 'M', color: 'Blanco', precio: 75000 },
        { nombre: 'Polo Deportivo', cantidad: 1, talla: 'L', color: 'Negro', precio: 95000 },
      ],
      observaciones: 'Entrega en horario de 9am a 5pm',
    },
    {
      id: 'PED-0011',
      fecha: '2026-05-10',
      productos: 2,
      total: 180000,
      estado: 'En entrega',
      tracking: 'TK-456789012',
      direccionEnvio: 'Carrera 45 #78-90, Piso 5, Bogotá, Cundinamarca',
      metodoPago: 'Tarjeta Mastercard **** 1234',
      fechaEntrega: '2026-05-17',
      detalleProductos: [
        { nombre: 'Sudadera con capucha', cantidad: 1, talla: 'XL', color: 'Gris', precio: 120000 },
        { nombre: 'Pantalón deportivo', cantidad: 1, talla: 'L', color: 'Negro', precio: 60000 },
      ],
    },
    {
      id: 'PED-0010',
      fecha: '2026-05-05',
      productos: 5,
      total: 420000,
      estado: 'Entregado',
      tracking: 'TK-123456789',
      direccionEnvio: 'Calle 123 #45-67, Apartamento 301, Bogotá, Cundinamarca',
      metodoPago: 'Efectivo',
      fechaEntrega: '2026-05-07',
      detalleProductos: [
        { nombre: 'Camiseta Básica', cantidad: 3, talla: 'M', color: 'Varios', precio: 210000 },
        { nombre: 'Polo Premium', cantidad: 2, talla: 'L', color: 'Azul', precio: 210000 },
      ],
    },
    {
      id: 'PED-0009',
      fecha: '2026-04-28',
      productos: 1,
      total: 85000,
      estado: 'Entregado',
      direccionEnvio: 'Calle 123 #45-67, Apartamento 301, Bogotá, Cundinamarca',
      metodoPago: 'Transferencia',
      fechaEntrega: '2026-04-30',
      detalleProductos: [
        { nombre: 'Camiseta Estampada', cantidad: 1, talla: 'M', color: 'Rojo', precio: 85000 },
      ],
    },
    {
      id: 'PED-0008',
      fecha: '2026-04-20',
      productos: 4,
      total: 320000,
      estado: 'En producción',
      direccionEnvio: 'Calle 123 #45-67, Apartamento 301, Bogotá, Cundinamarca',
      metodoPago: 'Tarjeta Visa **** 9012',
      detalleProductos: [
        { nombre: 'Conjunto deportivo', cantidad: 2, talla: 'M', color: 'Negro', precio: 280000 },
        { nombre: 'Gorra', cantidad: 2, talla: 'Única', color: 'Azul', precio: 40000 },
      ],
      observaciones: 'Personalización con logo empresarial',
    },
    {
      id: 'PED-0007',
      fecha: '2026-04-15',
      productos: 2,
      total: 150000,
      estado: 'Confirmado',
      direccionEnvio: 'Calle 123 #45-67, Apartamento 301, Bogotá, Cundinamarca',
      metodoPago: 'Tarjeta Mastercard **** 1234',
      detalleProductos: [
        { nombre: 'Camiseta Básica', cantidad: 2, talla: 'L', color: 'Blanco', precio: 150000 },
      ],
    },
    {
      id: 'PED-0006',
      fecha: '2026-04-10',
      productos: 3,
      total: 195000,
      estado: 'Pendiente',
      direccionEnvio: 'Calle 123 #45-67, Apartamento 301, Bogotá, Cundinamarca',
      metodoPago: 'Por definir',
      detalleProductos: [
        { nombre: 'Polo clásico', cantidad: 3, talla: 'M', color: 'Azul marino', precio: 195000 },
      ],
    },
    {
      id: 'PED-0005',
      fecha: '2026-04-05',
      productos: 1,
      total: 75000,
      estado: 'Cancelado',
      direccionEnvio: 'Calle 123 #45-67, Apartamento 301, Bogotá, Cundinamarca',
      metodoPago: 'N/A',
      detalleProductos: [
        { nombre: 'Camiseta Premium', cantidad: 1, talla: 'S', color: 'Negro', precio: 75000 },
      ],
      observaciones: 'Cancelado por solicitud del cliente',
    },
  ];

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const matchSearch = pedido.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filterEstado === 'todos' || pedido.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const handleVerDetalle = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setIsDetailModalOpen(true);
  };

  const handleDescargarRecibo = (pedidoId: string) => {
    // Simulación de descarga
    alert(`Descargando recibo del pedido ${pedidoId}`);
    // Aquí iría la lógica real de descarga de PDF
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Entregado':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Entregado
          </Badge>
        );
      case 'En entrega':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Truck className="h-3 w-3 mr-1" />
            En entrega
          </Badge>
        );
      case 'En producción':
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            <Factory className="h-3 w-3 mr-1" />
            En producción
          </Badge>
        );
      case 'Confirmado':
        return (
          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
            <PackageCheck className="h-3 w-3 mr-1" />
            Confirmado
          </Badge>
        );
      case 'Pendiente':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      case 'Cancelado':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Mis Pedidos</h1>
        <p className="text-gray-600 mt-1">Consulta el historial completo de tus compras</p>
      </div>

      {/* Filtros */}
      <Card className="p-4 bg-white rounded-xl shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por número de pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterEstado} onValueChange={setFilterEstado}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="Entregado">Entregado</SelectItem>
              <SelectItem value="En entrega">En entrega</SelectItem>
              <SelectItem value="En producción">En producción</SelectItem>
              <SelectItem value="Confirmado">Confirmado</SelectItem>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Lista de Pedidos */}
      <div className="space-y-4">
        {pedidosFiltrados.map((pedido) => (
          <Card key={pedido.id} className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
                  <Package className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{pedido.id}</h3>
                    {getEstadoBadge(pedido.estado)}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Fecha: {pedido.fecha}</p>
                    <p>{pedido.productos} producto{pedido.productos > 1 ? 's' : ''}</p>
                    {pedido.tracking && <p>Tracking: {pedido.tracking}</p>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                <div className="text-left lg:text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">${pedido.total.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleVerDetalle(pedido)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver detalle
                  </Button>
                  {pedido.estado === 'Entregado' && (
                    <Button variant="outline" size="sm" onClick={() => handleDescargarRecibo(pedido.id)}>
                      <Download className="h-4 w-4 mr-2" />
                      Recibo
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {pedidosFiltrados.length === 0 && (
        <Card className="p-12 bg-white rounded-xl shadow-sm text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No se encontraron pedidos</p>
          <p className="text-sm text-gray-500 mt-1">Intenta ajustar los filtros de búsqueda</p>
        </Card>
      )}

      {/* Modal Detalle del Pedido */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Detalle del Pedido {selectedPedido?.id}</DialogTitle>
            <DialogDescription>
              Información completa de tu pedido
            </DialogDescription>
          </DialogHeader>

          {selectedPedido && (
            <ScrollArea className="max-h-[calc(85vh-120px)] pr-4">
              <div className="space-y-6 py-4">
              {/* Estado y Tracking */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Estado del pedido</p>
                  {getEstadoBadge(selectedPedido.estado)}
                </div>
                {selectedPedido.tracking && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Número de tracking</p>
                    <p className="font-mono font-semibold text-gray-900">{selectedPedido.tracking}</p>
                  </div>
                )}
              </div>

              {/* Información del Pedido */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Fecha de pedido</span>
                  </div>
                  <p className="font-semibold text-gray-900">{selectedPedido.fecha}</p>
                </div>
                {selectedPedido.fechaEntrega && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Truck className="h-4 w-4" />
                      <span className="text-sm">Fecha de entrega</span>
                    </div>
                    <p className="font-semibold text-gray-900">{selectedPedido.fechaEntrega}</p>
                  </div>
                )}
              </div>

              {/* Productos */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Productos
                </h3>
                <div className="space-y-3">
                  {selectedPedido.detalleProductos?.map((producto, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{producto.nombre}</p>
                        <div className="flex gap-4 mt-1 text-sm text-gray-600">
                          <span>Cantidad: {producto.cantidad}</span>
                          <span>Talla: {producto.talla}</span>
                          <span>Color: {producto.color}</span>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">${producto.precio.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dirección de Envío */}
              {selectedPedido.direccionEnvio && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Dirección de envío
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{selectedPedido.direccionEnvio}</p>
                  </div>
                </div>
              )}

              {/* Método de Pago */}
              {selectedPedido.metodoPago && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Método de pago
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{selectedPedido.metodoPago}</p>
                  </div>
                </div>
              )}

              {/* Observaciones */}
              {selectedPedido.observaciones && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Observaciones</h3>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-gray-900">{selectedPedido.observaciones}</p>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-gray-900">Total del pedido</p>
                  <p className="text-2xl font-bold text-gray-900">${selectedPedido.total.toLocaleString()}</p>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-3">
                {selectedPedido.estado === 'Entregado' && (
                  <Button
                    className="flex-1 bg-gray-900 hover:bg-gray-800"
                    onClick={() => handleDescargarRecibo(selectedPedido.id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Recibo
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}



