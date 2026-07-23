import { useState } from 'react';
import { Truck, MapPin, Package, User, Calendar, Clock, CheckCircle2, AlertCircle, XCircle, Phone, Navigation } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { TablePagination } from '../../components/ui/table-pagination';

interface Domicilio {
  id: string;
  pedidoId: string;
  cliente: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  domiciliario: string;
  estado: 'pendiente' | 'asignado' | 'en_ruta' | 'entregado' | 'cancelado';
  fechaPedido: string;
  fechaAsignacion?: string;
  fechaEntrega?: string;
  productos: string;
  valor: number;
  observaciones?: string;
  tracking: {
    fecha: string;
    hora: string;
    estado: string;
    descripcion: string;
  }[];
}

interface Domiciliario {
  id: string;
  nombre: string;
  telefono: string;
  vehiculo: string;
  estado: 'disponible' | 'en_ruta' | 'descanso';
  pedidosHoy: number;
  calificacion: number;
}

export function DomiciliosModule() {
  const [domicilios, setDomicilios] = useState<Domicilio[]>([
    {
      id: '1',
      pedidoId: 'ORD-001',
      cliente: 'Mará González',
      direccion: 'Calle 123 #45-67',
      ciudad: 'Bogotá',
      telefono: '+57 320 456 7890',
      domiciliario: 'Carlos Mendoza',
      estado: 'entregado',
      fechaPedido: '2024-12-10',
      fechaAsignacion: '2024-12-11',
      fechaEntrega: '2024-12-13',
      productos: 'Camiseta Bósica (2), Camiseta Premium (1)',
      valor: 150000,
      tracking: [
        { fecha: '2024-12-11', hora: '09:00', estado: 'asignado', descripcion: 'Pedido asignado a domiciliario' },
        { fecha: '2024-12-12', hora: '10:30', estado: 'en_ruta', descripcion: 'En camino al destino' },
        { fecha: '2024-12-13', hora: '15:45', estado: 'entregado', descripcion: 'Entregado exitosamente' }
      ]
    },
    {
      id: '2',
      pedidoId: 'ORD-002',
      cliente: 'Carlos Ramírez',
      direccion: 'Carrera 45 #78-90',
      ciudad: 'Medellón',
      telefono: '+57 310 123 4567',
      domiciliario: 'Pedro López',
      estado: 'en_ruta',
      fechaPedido: '2024-12-15',
      fechaAsignacion: '2024-12-16',
      productos: 'Camiseta Deportiva (3)',
      valor: 95000,
      tracking: [
        { fecha: '2024-12-16', hora: '08:00', estado: 'asignado', descripcion: 'Pedido asignado a domiciliario' },
        { fecha: '2024-12-17', hora: '14:20', estado: 'en_ruta', descripcion: 'Salió para entrega' }
      ]
    },
    {
      id: '3',
      pedidoId: 'ORD-003',
      cliente: 'Ana López',
      direccion: 'Avenida 80 #12-34',
      ciudad: 'Cali',
      telefono: '+57 300 987 6543',
      domiciliario: '-',
      estado: 'pendiente',
      fechaPedido: '2024-12-18',
      productos: 'Camiseta Polo (2)',
      valor: 220000,
      tracking: []
    },
    {
      id: '4',
      pedidoId: 'ORD-004',
      cliente: 'Juan Martónez',
      direccion: 'Transversal 25 #40-60',
      ciudad: 'Barranquilla',
      telefono: '+57 315 555 1234',
      domiciliario: 'Luis Gómez',
      estado: 'asignado',
      fechaPedido: '2024-12-17',
      fechaAsignacion: '2024-12-18',
      productos: 'Camiseta Bósica (5)',
      valor: 125000,
      tracking: [
        { fecha: '2024-12-18', hora: '07:30', estado: 'asignado', descripcion: 'Pedido asignado, pendiente de despacho' }
      ]
    },
    { id: '5', pedidoId: 'ORD-005', cliente: 'Laura Sónchez', direccion: 'Calle 50 #22-33', ciudad: 'Bogotá', telefono: '+57 320 123 9876', domiciliario: 'Carlos Mendoza', estado: 'entregado', fechaPedido: '2024-12-14', fechaAsignacion: '2024-12-15', fechaEntrega: '2024-12-18', productos: 'Camiseta Premium (3)', valor: 180000, tracking: [] },
    { id: '6', pedidoId: 'ORD-006', cliente: 'Diego Ramírez', direccion: 'Av. 30 #15-25', ciudad: 'Cali', telefono: '+57 310 456 7891', domiciliario: 'Pedro López', estado: 'en_ruta', fechaPedido: '2024-12-19', fechaAsignacion: '2024-12-20', productos: 'Camiseta Deportiva (4)', valor: 160000, tracking: [] },
    { id: '7', pedidoId: 'ORD-007', cliente: 'Carolina Morales', direccion: 'Carrera 60 #40-50', ciudad: 'Medellón', telefono: '+57 300 789 1234', domiciliario: '-', estado: 'pendiente', fechaPedido: '2024-12-20', productos: 'Camiseta Polo (2)', valor: 140000, tracking: [] },
    { id: '8', pedidoId: 'ORD-008', cliente: 'Roberto Silva', direccion: 'Calle 88 #20-30', ciudad: 'Bogotá', telefono: '+57 315 987 6543', domiciliario: 'Luis Gómez', estado: 'asignado', fechaPedido: '2024-12-18', fechaAsignacion: '2024-12-19', productos: 'Camiseta Bósica (6)', valor: 150000, tracking: [] },
    { id: '9', pedidoId: 'ORD-009', cliente: 'Patricia Gómez', direccion: 'Av. 40 #55-65', ciudad: 'Cali', telefono: '+57 320 654 3210', domiciliario: 'Andrós Rojas', estado: 'en_ruta', fechaPedido: '2024-12-17', fechaAsignacion: '2024-12-18', productos: 'Camiseta Premium (5)', valor: 200000, tracking: [] },
    { id: '10', pedidoId: 'ORD-010', cliente: 'Fernando Torres', direccion: 'Transversal 15 #30-40', ciudad: 'Barranquilla', telefono: '+57 310 321 6549', domiciliario: 'Carlos Mendoza', estado: 'entregado', fechaPedido: '2024-12-12', fechaAsignacion: '2024-12-13', fechaEntrega: '2024-12-16', productos: 'Camiseta Deportiva (7)', valor: 280000, tracking: [] },
    { id: '11', pedidoId: 'ORD-011', cliente: 'Sandra Vargas', direccion: 'Calle 70 #18-28', ciudad: 'Medellón', telefono: '+57 300 147 2589', domiciliario: '-', estado: 'pendiente', fechaPedido: '2024-12-21', productos: 'Camiseta Bósica (3)', valor: 90000, tracking: [] },
    { id: '12', pedidoId: 'ORD-012', cliente: 'Miguel óngel Ruiz', direccion: 'Av. 25 #45-55', ciudad: 'Bogotá', telefono: '+57 315 258 3691', domiciliario: 'Pedro López', estado: 'asignado', fechaPedido: '2024-12-19', fechaAsignacion: '2024-12-20', productos: 'Camiseta Polo (4)', valor: 240000, tracking: [] },
    { id: '13', pedidoId: 'ORD-013', cliente: 'Andrea Jimónez', direccion: 'Carrera 50 #60-70', ciudad: 'Cali', telefono: '+57 320 369 1472', domiciliario: 'Luis Gómez', estado: 'entregado', fechaPedido: '2024-12-11', fechaAsignacion: '2024-12-12', fechaEntrega: '2024-12-15', productos: 'Camiseta Premium (8)', valor: 320000, tracking: [] },
    { id: '14', pedidoId: 'ORD-014', cliente: 'Jorge Hernñdez', direccion: 'Calle 95 #35-45', ciudad: 'Medellón', telefono: '+57 310 741 8529', domiciliario: 'Andrós Rojas', estado: 'en_ruta', fechaPedido: '2024-12-20', fechaAsignacion: '2024-12-21', productos: 'Camiseta Deportiva (3)', valor: 135000, tracking: [] },
    { id: '15', pedidoId: 'ORD-015', cliente: 'Valeria Castro', direccion: 'Av. 60 #25-35', ciudad: 'Bogotá', telefono: '+57 320 852 9631', domiciliario: '-', estado: 'pendiente', fechaPedido: '2024-12-22', productos: 'Camiseta Bósica (4)', valor: 120000, tracking: [] },
  ]);

  const [domiciliarios, setDomiciliarios] = useState<Domiciliario[]>([
    { id: '1', nombre: 'Carlos Mendoza', telefono: '+57 300 111 2222', vehiculo: 'Moto Yamaha 125', estado: 'disponible', pedidosHoy: 3, calificacion: 4.8 },
    { id: '2', nombre: 'Pedro López', telefono: '+57 310 222 3333', vehiculo: 'Moto Honda 150', estado: 'en_ruta', pedidosHoy: 5, calificacion: 4.9 },
    { id: '3', nombre: 'Luis Gómez', telefono: '+57 320 333 4444', vehiculo: 'Bicicleta elóctrica', estado: 'disponible', pedidosHoy: 2, calificacion: 4.7 },
    { id: '4', nombre: 'Andrós Rojas', telefono: '+57 315 444 5555', vehiculo: 'Moto Suzuki 125', estado: 'descanso', pedidosHoy: 4, calificacion: 4.6 },
    { id: '5', nombre: 'Diego Martónez', telefono: '+57 300 555 6666', vehiculo: 'Moto Kawasaki 150', estado: 'disponible', pedidosHoy: 3, calificacion: 4.5 },
    { id: '6', nombre: 'Laura Sónchez', telefono: '+57 310 666 7777', vehiculo: 'Moto Honda 125', estado: 'en_ruta', pedidosHoy: 6, calificacion: 4.8 },
    { id: '7', nombre: 'Fernando Torres', telefono: '+57 320 777 8888', vehiculo: 'Bicicleta elóctrica', estado: 'disponible', pedidosHoy: 1, calificacion: 4.9 },
    { id: '8', nombre: 'Sandra Vargas', telefono: '+57 315 888 9999', vehiculo: 'Moto Yamaha 150', estado: 'disponible', pedidosHoy: 2, calificacion: 4.7 },
    { id: '9', nombre: 'Roberto Silva', telefono: '+57 300 999 0000', vehiculo: 'Moto Suzuki 150', estado: 'en_ruta', pedidosHoy: 4, calificacion: 4.6 },
    { id: '10', nombre: 'Patricia Gómez', telefono: '+57 310 000 1111', vehiculo: 'Moto Honda 125', estado: 'descanso', pedidosHoy: 5, calificacion: 4.8 },
    { id: '11', nombre: 'Miguel Hernñdez', telefono: '+57 320 111 2222', vehiculo: 'Bicicleta elóctrica', estado: 'disponible', pedidosHoy: 1, calificacion: 4.5 },
    { id: '12', nombre: 'Andrea Jimónez', telefono: '+57 315 222 3333', vehiculo: 'Moto Yamaha 125', estado: 'en_ruta', pedidosHoy: 3, calificacion: 4.9 },
  ]);

  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [viewingDomicilio, setViewingDomicilio] = useState<Domicilio | null>(null);
  const [assigningDomicilio, setAssigningDomicilio] = useState<Domicilio | null>(null);
  const [selectedDomiciliario, setSelectedDomiciliario] = useState('');
  const [currentPageEntregas, setCurrentPageEntregas] = useState(1);
  const [itemsPerPageEntregas] = useState(10);
  const [currentPageDomiciliarios, setCurrentPageDomiciliarios] = useState(1);
  const [itemsPerPageDomiciliarios] = useState(10);

  const filteredDomicilios = domicilios.filter(d => {
    const matchesEstado = estadoFilter === 'todos' || d.estado === estadoFilter;
    return matchesEstado;
  });

  const pendientes = domicilios.filter(d => d.estado === 'pendiente').length;
  const enRuta = domicilios.filter(d => d.estado === 'en_ruta').length;
  const entregados = domicilios.filter(d => d.estado === 'entregado').length;
  const domiciliariosDisponibles = domiciliarios.filter(d => d.estado === 'disponible').length;

  const handleAssignDomiciliario = () => {
    if (!assigningDomicilio || !selectedDomiciliario) return;

    const domiciliario = domiciliarios.find(d => d.id === selectedDomiciliario);
    if (!domiciliario) return;

    setDomicilios(domicilios.map(d =>
      d.id === assigningDomicilio.id
        ? {
            ...d,
            domiciliario: domiciliario.nombre,
            estado: 'asignado',
            fechaAsignacion: new Date().toISOString().split('T')[0],
            tracking: [
              ...d.tracking,
              {
                fecha: new Date().toISOString().split('T')[0],
                hora: new Date().toTimeString().split(' ')[0].substring(0, 5),
                estado: 'asignado',
                descripcion: `Pedido asignado a ${domiciliario.nombre}`
              }
            ]
          }
        : d
    ));

    setAssigningDomicilio(null);
    setSelectedDomiciliario('');
    toast.success('Domiciliario asignado exitosamente');
  };

  const handleUpdateEstado = (id: string, nuevoEstado: Domicilio['estado']) => {
    const estados = {
      'pendiente': 'Pendiente',
      'asignado': 'Asignado',
      'en_ruta': 'En ruta',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };

    setDomicilios(domicilios.map(d =>
      d.id === id
        ? {
            ...d,
            estado: nuevoEstado,
            ...(nuevoEstado === 'entregado' ? { fechaEntrega: new Date().toISOString().split('T')[0] } : {}),
            tracking: [
              ...d.tracking,
              {
                fecha: new Date().toISOString().split('T')[0],
                hora: new Date().toTimeString().split(' ')[0].substring(0, 5),
                estado: estados[nuevoEstado],
                descripcion: `Estado cambiado a ${estados[nuevoEstado]}`
              }
            ]
          }
        : d
    ));

    toast.success(`Estado actualizado a ${estados[nuevoEstado]}`);
  };

  const getEstadoBadge = (estado: Domicilio['estado']) => {
    const variants = {
      'pendiente': { class: 'bg-yellow-500/10 text-yellow-700 border-yellow-200', label: 'Pendiente' },
      'asignado': { class: 'bg-blue-500/10 text-blue-700 border-blue-200', label: 'Asignado' },
      'en_ruta': { class: 'bg-purple-500/10 text-purple-700 border-purple-200', label: 'En Ruta' },
      'entregado': { class: 'bg-green-500/10 text-green-700 border-green-200', label: 'Entregado' },
      'cancelado': { class: 'bg-red-500/10 text-red-700 border-red-200', label: 'Cancelado' }
    };
    const variant = variants[estado];
    return <Badge className={`${variant.class} border`}>{variant.label}</Badge>;
  };

  const getEstadoDomiciliarioBadge = (estado: Domiciliario['estado']) => {
    const variants = {
      'disponible': { class: 'bg-green-500/10 text-green-700 border-green-200', label: 'Disponible' },
      'en_ruta': { class: 'bg-blue-500/10 text-blue-700 border-blue-200', label: 'En Ruta' },
      'descanso': { class: 'bg-gray-500/10 text-gray-700 border-gray-200', label: 'Descanso' }
    };
    const variant = variants[estado];
    return <Badge className={`${variant.class} border`}>{variant.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Domicilios</h1>
          <p className="text-gray-600 mt-1">Administra entregas y domiciliarios</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{pendientes}</p>
            </div>
            <Clock className="h-12 w-12 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Ruta</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{enRuta}</p>
            </div>
            <Truck className="h-12 w-12 text-purple-500" />
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Entregados Hoy</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{entregados}</p>
            </div>
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Domiciliarios Disponibles</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{domiciliariosDisponibles}</p>
            </div>
            <User className="h-12 w-12 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="entregas" className="space-y-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="entregas">Entregas</TabsTrigger>
          <TabsTrigger value="domiciliarios">Domiciliarios</TabsTrigger>
        </TabsList>

        {/* Tab: Entregas */}
        <TabsContent value="entregas" className="space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="w-full lg:w-64">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="asignado">Asignado</SelectItem>
                  <SelectItem value="en_ruta">En Ruta</SelectItem>
                  <SelectItem value="entregado">Entregado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Domiciliario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const startIndex = (currentPageEntregas - 1) * itemsPerPageEntregas;
                  const endIndex = startIndex + itemsPerPageEntregas;
                  const paginated = filteredDomicilios.slice(startIndex, endIndex);
                  return paginated.map((domicilio) => (
                  <TableRow key={domicilio.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{domicilio.pedidoId}</p>
                        <p className="text-sm text-gray-500">{domicilio.fechaPedido}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{domicilio.cliente}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <Phone className="h-3 w-3" />
                          <span>{domicilio.telefono}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-900">{domicilio.direccion}</p>
                          <p className="text-sm text-gray-500">{domicilio.ciudad}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {domicilio.domiciliario !== '-' ? (
                        <Badge variant="outline">{domicilio.domiciliario}</Badge>
                      ) : (
                        <span className="text-gray-400">Sin asignar</span>
                      )}
                    </TableCell>
                    <TableCell>{getEstadoBadge(domicilio.estado)}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-gray-900">
                        ${domicilio.valor.toLocaleString('es-CO')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Ver detalles */}
                        <Dialog open={viewingDomicilio?.id === domicilio.id} onOpenChange={(open) => !open && setViewingDomicilio(null)}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setViewingDomicilio(domicilio)}
                            >
                              <Navigation className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Seguimiento de Entrega</DialogTitle>
                              <DialogDescription>{domicilio.pedidoId}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                              {/* Info */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-gray-500">Cliente</Label>
                                  <p className="text-gray-900 font-medium">{domicilio.cliente}</p>
                                </div>
                                <div>
                                  <Label className="text-gray-500">Teléfono</Label>
                                  <p className="text-gray-900">{domicilio.telefono}</p>
                                </div>
                                <div className="col-span-2">
                                  <Label className="text-gray-500">Dirección</Label>
                                  <p className="text-gray-900">{domicilio.direccion}, {domicilio.ciudad}</p>
                                </div>
                                <div>
                                  <Label className="text-gray-500">Productos</Label>
                                  <p className="text-gray-900 text-sm">{domicilio.productos}</p>
                                </div>
                                <div>
                                  <Label className="text-gray-500">Valor</Label>
                                  <p className="text-gray-900 font-bold">
                                    ${domicilio.valor.toLocaleString('es-CO')}
                                  </p>
                                </div>
                              </div>

                              {/* Tracking */}
                              <div>
                                <h3 className="font-semibold text-gray-900 mb-4">Historial de Seguimiento</h3>
                                {domicilio.tracking.length > 0 ? (
                                  <div className="space-y-3">
                                    {domicilio.tracking.map((t, idx) => (
                                      <div key={idx} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                          <div className={`w-3 h-3 rounded-full ${
                                            idx === domicilio.tracking.length - 1 ? 'bg-blue-500' : 'bg-gray-300'
                                          }`} />
                                          {idx < domicilio.tracking.length - 1 && (
                                            <div className="w-0.5 h-full bg-gray-300 my-1" />
                                          )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                          <p className="font-medium text-gray-900">{t.descripcion}</p>
                                          <p className="text-sm text-gray-500">{t.fecha} - {t.hora}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-500 text-center py-4">Sin historial de seguimiento</p>
                                )}
                              </div>

                              {/* Acciones rápidas */}
                              {domicilio.estado !== 'entregado' && domicilio.estado !== 'cancelado' && (
                                <div className="flex gap-2">
                                  {domicilio.estado === 'asignado' && (
                                    <Button
                                      onClick={() => {
                                        handleUpdateEstado(domicilio.id, 'en_ruta');
                                        setViewingDomicilio(null);
                                      }}
                                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    >
                                      Marcar En Ruta
                                    </Button>
                                  )}
                                  {domicilio.estado === 'en_ruta' && (
                                    <Button
                                      onClick={() => {
                                        handleUpdateEstado(domicilio.id, 'entregado');
                                        setViewingDomicilio(null);
                                      }}
                                      className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                      Marcar Entregado
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      handleUpdateEstado(domicilio.id, 'cancelado');
                                      setViewingDomicilio(null);
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Asignar domiciliario */}
                        {domicilio.estado === 'pendiente' && (
                          <Dialog open={assigningDomicilio?.id === domicilio.id} onOpenChange={(open) => !open && setAssigningDomicilio(null)}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => setAssigningDomicilio(domicilio)}
                                className="bg-black hover:bg-gray-800"
                              >
                                Asignar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Asignar Domiciliario</DialogTitle>
                                <DialogDescription>Pedido {domicilio.pedidoId}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Seleccionar Domiciliario</Label>
                                  <Select value={selectedDomiciliario} onValueChange={setSelectedDomiciliario}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {domiciliarios
                                        .filter(d => d.estado === 'disponible')
                                        .map(d => (
                                          <SelectItem key={d.id} value={d.id}>
                                            {d.nombre} - {d.vehiculo} (? {d.calificacion})
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <p className="text-sm text-gray-600"><strong>Cliente:</strong> {domicilio.cliente}</p>
                                  <p className="text-sm text-gray-600 mt-1"><strong>Dirección:</strong> {domicilio.direccion}</p>
                                  <p className="text-sm text-gray-600 mt-1"><strong>Ciudad:</strong> {domicilio.ciudad}</p>
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setAssigningDomicilio(null);
                                    setSelectedDomiciliario('');
                                  }}
                                  className="flex-1"
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={handleAssignDomiciliario}
                                  disabled={!selectedDomiciliario}
                                  className="flex-1 bg-black hover:bg-gray-800"
                                >
                                  Asignar
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ));
              })()}
              </TableBody>
            </Table>
            <TablePagination
              currentPage={currentPageEntregas}
              totalItems={filteredDomicilios.length}
              itemsPerPage={itemsPerPageEntregas}
              onPageChange={setCurrentPageEntregas}
            />
          </Card>
        </TabsContent>

        {/* Tab: Domiciliarios */}
        <TabsContent value="domiciliarios" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Vehóculo</TableHead>
                  <TableHead>Pedidos Hoy</TableHead>
                  <TableHead>Calificación</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  const startIndex = (currentPageDomiciliarios - 1) * itemsPerPageDomiciliarios;
                  const endIndex = startIndex + itemsPerPageDomiciliarios;
                  const paginated = domiciliarios.slice(startIndex, endIndex);
                  return paginated.map((d) => (
                  <TableRow key={d.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">{d.nombre}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>{d.telefono}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{d.vehiculo}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-gray-900">{d.pedidosHoy}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">?</span>
                        <span className="font-semibold text-gray-900">{d.calificacion}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getEstadoDomiciliarioBadge(d.estado)}</TableCell>
                  </TableRow>
                ));
              })()}
              </TableBody>
            </Table>
            <TablePagination
              currentPage={currentPageDomiciliarios}
              totalItems={domiciliarios.length}
              itemsPerPage={itemsPerPageDomiciliarios}
              onPageChange={setCurrentPageDomiciliarios}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DomiciliosModule;




