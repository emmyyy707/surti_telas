import { useState } from 'react';
import { Users, Plus, Search, Download, Edit, Trash2, Mail, Phone, MapPin, ShoppingBag, DollarSign, Calendar, Eye } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { TablePagination } from '../../components/ui/table-pagination';

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  tipoCliente: 'minorista' | 'mayorista' | 'corporativo';
  estado: 'activo' | 'inactivo';
  fechaRegistro: string;
  ultimaCompra: string;
  totalCompras: number;
  pedidosRealizados: number;
  historialCompras: {
    fecha: string;
    pedidoId: string;
    total: number;
    productos: string;
  }[];
}

export function ClientesModule() {
  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: '1',
      nombre: 'Mará González',
      email: 'maria@ejemplo.com',
      telefono: '+57 320 456 7890',
      direccion: 'Calle 123 #45-67',
      ciudad: 'Bogotá',
      tipoCliente: 'minorista',
      estado: 'activo',
      fechaRegistro: '2024-01-15',
      ultimaCompra: '2024-12-10',
      totalCompras: 355000,
      pedidosRealizados: 3,
      historialCompras: [
        { fecha: '2024-12-10', pedidoId: 'ORD-001', total: 150000, productos: 'Camiseta Bósica (2), Camiseta Premium (1)' },
        { fecha: '2024-11-20', pedidoId: 'ORD-004', total: 85000, productos: 'Camiseta Bósica (1), Camiseta Deportiva (2)' },
        { fecha: '2024-10-15', pedidoId: 'ORD-005', total: 120000, productos: 'Camiseta Premium (3)' }
      ]
    },
    {
      id: '2',
      nombre: 'Carlos Ramírez',
      email: 'carlos@ejemplo.com',
      telefono: '+57 310 123 4567',
      direccion: 'Carrera 45 #78-90',
      ciudad: 'Medellón',
      tipoCliente: 'mayorista',
      estado: 'activo',
      fechaRegistro: '2024-02-20',
      ultimaCompra: '2024-12-15',
      totalCompras: 850000,
      pedidosRealizados: 5,
      historialCompras: [
        { fecha: '2024-12-15', pedidoId: 'ORD-002', total: 95000, productos: 'Camiseta Deportiva (3)' },
        { fecha: '2024-11-28', pedidoId: 'ORD-008', total: 250000, productos: 'Pedido mayorista - 50 unidades' }
      ]
    },
    {
      id: '3',
      nombre: 'Ana López',
      email: 'ana@ejemplo.com',
      telefono: '+57 300 987 6543',
      direccion: 'Avenida 80 #12-34',
      ciudad: 'Cali',
      tipoCliente: 'minorista',
      estado: 'activo',
      fechaRegistro: '2024-03-10',
      ultimaCompra: '2024-12-18',
      totalCompras: 220000,
      pedidosRealizados: 1,
      historialCompras: [
        { fecha: '2024-12-18', pedidoId: 'ORD-003', total: 220000, productos: 'Camiseta Polo (2)' }
      ]
    },
    {
      id: '4',
      nombre: 'Empresa XYZ S.A.S',
      email: 'contacto@xyz.com',
      telefono: '+57 601 234 5678',
      direccion: 'Calle 100 #15-20',
      ciudad: 'Bogotá',
      tipoCliente: 'corporativo',
      estado: 'activo',
      fechaRegistro: '2024-01-05',
      ultimaCompra: '2024-12-01',
      totalCompras: 3500000,
      pedidosRealizados: 8,
      historialCompras: [
        { fecha: '2024-12-01', pedidoId: 'ORD-010', total: 1200000, productos: 'Uniformes corporativos - 100 unidades' }
      ]
    },
    {
      id: '5',
      nombre: 'Pedro Martónez',
      email: 'pedro@ejemplo.com',
      telefono: '+57 315 555 1234',
      direccion: 'Transversal 25 #40-60',
      ciudad: 'Barranquilla',
      tipoCliente: 'minorista',
      estado: 'inactivo',
      fechaRegistro: '2024-05-20',
      ultimaCompra: '2024-08-15',
      totalCompras: 65000,
      pedidosRealizados: 1,
      historialCompras: [
        { fecha: '2024-08-15', pedidoId: 'ORD-015', total: 65000, productos: 'Camiseta Bósica (2)' }
      ]
    },
    { id: '6', nombre: 'Laura Sónchez', email: 'laura@ejemplo.com', telefono: '+57 320 123 9876', direccion: 'Calle 50 #22-33', ciudad: 'Bogotá', tipoCliente: 'minorista', estado: 'activo', fechaRegistro: '2024-04-10', ultimaCompra: '2024-12-12', totalCompras: 180000, pedidosRealizados: 2, historialCompras: [] },
    { id: '7', nombre: 'Diego Ramírez', email: 'diego@ejemplo.com', telefono: '+57 310 456 7891', direccion: 'Av. 30 #15-25', ciudad: 'Cali', tipoCliente: 'mayorista', estado: 'activo', fechaRegistro: '2024-03-15', ultimaCompra: '2024-12-05', totalCompras: 950000, pedidosRealizados: 6, historialCompras: [] },
    { id: '8', nombre: 'Carolina Morales', email: 'carolina@ejemplo.com', telefono: '+57 300 789 1234', direccion: 'Carrera 60 #40-50', ciudad: 'Medellón', tipoCliente: 'minorista', estado: 'activo', fechaRegistro: '2024-06-20', ultimaCompra: '2024-12-18', totalCompras: 275000, pedidosRealizados: 3, historialCompras: [] },
    { id: '9', nombre: 'Roberto Silva', email: 'roberto@ejemplo.com', telefono: '+57 315 987 6543', direccion: 'Calle 88 #20-30', ciudad: 'Bogotá', tipoCliente: 'minorista', estado: 'inactivo', fechaRegistro: '2024-07-01', ultimaCompra: '2024-09-22', totalCompras: 95000, pedidosRealizados: 1, historialCompras: [] },
    { id: '10', nombre: 'Patricia Gómez', email: 'patricia@ejemplo.com', telefono: '+57 320 654 3210', direccion: 'Av. 40 #55-65', ciudad: 'Cali', tipoCliente: 'minorista', estado: 'activo', fechaRegistro: '2024-08-12', ultimaCompra: '2024-12-20', totalCompras: 310000, pedidosRealizados: 4, historialCompras: [] },
    { id: '11', nombre: 'Fernando Torres', email: 'fernando@ejemplo.com', telefono: '+57 310 321 6549', direccion: 'Transversal 15 #30-40', ciudad: 'Barranquilla', tipoCliente: 'mayorista', estado: 'activo', fechaRegistro: '2024-02-25', ultimaCompra: '2024-12-10', totalCompras: 1200000, pedidosRealizados: 9, historialCompras: [] },
    { id: '12', nombre: 'Sandra Vargas', email: 'sandra@ejemplo.com', telefono: '+57 300 147 2589', direccion: 'Calle 70 #18-28', ciudad: 'Medellón', tipoCliente: 'minorista', estado: 'activo', fechaRegistro: '2024-09-05', ultimaCompra: '2024-12-19', totalCompras: 420000, pedidosRealizados: 5, historialCompras: [] },
    { id: '13', nombre: 'Miguel óngel Ruiz', email: 'miguel@ejemplo.com', telefono: '+57 315 258 3691', direccion: 'Av. 25 #45-55', ciudad: 'Bogotá', tipoCliente: 'minorista', estado: 'inactivo', fechaRegistro: '2024-10-10', ultimaCompra: '2024-11-05', totalCompras: 125000, pedidosRealizados: 1, historialCompras: [] },
    { id: '14', nombre: 'Andrea Jimónez', email: 'andrea@ejemplo.com', telefono: '+57 320 369 1472', direccion: 'Carrera 50 #60-70', ciudad: 'Cali', tipoCliente: 'corporativo', estado: 'activo', fechaRegistro: '2024-01-20', ultimaCompra: '2024-12-15', totalCompras: 4500000, pedidosRealizados: 12, historialCompras: [] },
    { id: '15', nombre: 'Jorge Hernñdez', email: 'jorge@ejemplo.com', telefono: '+57 310 741 8529', direccion: 'Calle 95 #35-45', ciudad: 'Medellón', tipoCliente: 'minorista', estado: 'activo', fechaRegistro: '2024-11-01', ultimaCompra: '2024-12-21', totalCompras: 240000, pedidosRealizados: 2, historialCompras: [] }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [viewingCliente, setViewingCliente] = useState<Cliente | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    tipoCliente: 'minorista',
  });

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.telefono.includes(searchTerm);
    const matchesTipo = tipoFilter === 'todos' || cliente.tipoCliente === tipoFilter;
    const matchesEstado = estadoFilter === 'todos' || cliente.estado === estadoFilter;
    return matchesSearch && matchesTipo && matchesEstado;
  });

  const clientesActivos = clientes.filter(c => c.estado === 'activo').length;
  const totalVentas = clientes.reduce((sum, c) => sum + c.totalCompras, 0);
  const promedioCompra = totalVentas / clientes.length;

  const handleAddCliente = () => {
    const newCliente: Cliente = {
      id: String(clientes.length + 1),
      nombre: formData.nombre,
      email: formData.email,
      telefono: formData.telefono,
      direccion: formData.direccion,
      ciudad: formData.ciudad,
      tipoCliente: formData.tipoCliente as any,
      estado: 'activo',
      fechaRegistro: new Date().toISOString().split('T')[0],
      ultimaCompra: '-',
      totalCompras: 0,
      pedidosRealizados: 0,
      historialCompras: []
    };

    setClientes([...clientes, newCliente]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success('Cliente agregado exitosamente');
  };

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      ciudad: cliente.ciudad,
      tipoCliente: cliente.tipoCliente,
    });
  };

  const handleUpdateCliente = () => {
    if (!editingCliente) return;

    setClientes(clientes.map(c => c.id === editingCliente.id ? {
      ...c,
      nombre: formData.nombre,
      email: formData.email,
      telefono: formData.telefono,
      direccion: formData.direccion,
      ciudad: formData.ciudad,
      tipoCliente: formData.tipoCliente as any,
    } : c));

    setEditingCliente(null);
    resetForm();
    toast.success('Cliente actualizado exitosamente');
  };

  const handleDeleteCliente = (id: string) => {
    setClientes(clientes.filter(c => c.id !== id));
    toast.success('Cliente eliminado exitosamente');
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      tipoCliente: 'minorista',
    });
  };

  const exportToCSV = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Ciudad', 'Tipo', 'Total Compras', 'Pedidos', 'Estado'];
    const rows = filteredClientes.map(c => [
      c.nombre,
      c.email,
      c.telefono,
      c.ciudad,
      c.tipoCliente,
      c.totalCompras,
      c.pedidosRealizados,
      c.estado
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Reporte exportado exitosamente');
  };

  const getTipoBadge = (tipo: string) => {
    const variants = {
      'minorista': 'bg-blue-500/10 text-blue-700 border-blue-200',
      'mayorista': 'bg-purple-500/10 text-purple-700 border-purple-200',
      'corporativo': 'bg-orange-500/10 text-orange-700 border-orange-200'
    };
    const labels = {
      'minorista': 'Minorista',
      'mayorista': 'Mayorista',
      'corporativo': 'Corporativo'
    };
    return <Badge className={`${variants[tipo as keyof typeof variants]} border`}>{labels[tipo as keyof typeof labels]}</Badge>;
  };

  const getEstadoBadge = (estado: string) => {
    return estado === 'activo'
      ? <Badge className="bg-green-500/10 text-green-700 border-green-200 border">Activo</Badge>
      : <Badge className="bg-gray-500/10 text-gray-700 border-gray-200 border">Inactivo</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-1">Administra tu base de clientes y su historial</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-black hover:bg-gray-800">
                <Plus className="h-4 w-4" />
                Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2 col-span-2">
                  <Label>Nombre Completo / Razón Social</Label>
                  <Input
                    placeholder="Nombre del cliente"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    placeholder="+57 300 123 4567"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Dirección</Label>
                  <Input
                    placeholder="Calle, carrera, nómero"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  <Input
                    placeholder="Ciudad"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Cliente</Label>
                  <Select value={formData.tipoCliente} onValueChange={(value) => setFormData({ ...formData, tipoCliente: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minorista">Minorista</SelectItem>
                      <SelectItem value="mayorista">Mayorista</SelectItem>
                      <SelectItem value="corporativo">Corporativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button onClick={handleAddCliente} className="bg-black hover:bg-gray-800">
                  Agregar Cliente
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clientes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{clientes.length}</p>
            </div>
            <Users className="h-12 w-12 text-blue-500" />
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clientes Activos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{clientesActivos}</p>
            </div>
            <Users className="h-12 w-12 text-green-500" />
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ventas Totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${totalVentas.toLocaleString('es-CO')}
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-purple-500" />
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Promedio/Cliente</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${Math.round(promedioCompra).toLocaleString('es-CO')}
              </p>
            </div>
            <ShoppingBag className="h-12 w-12 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email o telófono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              <SelectItem value="minorista">Minorista</SelectItem>
              <SelectItem value="mayorista">Mayorista</SelectItem>
              <SelectItem value="corporativo">Corporativo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="activo">Activos</SelectItem>
              <SelectItem value="inactivo">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Cliente</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Total Compras</TableHead>
              <TableHead>Pedidos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(() => {
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const paginated = filteredClientes.slice(startIndex, endIndex);
              return paginated.map((cliente) => (
              <TableRow key={cliente.id} className="hover:bg-gray-50">
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900">{cliente.nombre}</p>
                    <p className="text-sm text-gray-500">Desde {cliente.fechaRegistro}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">{cliente.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">{cliente.telefono}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span>{cliente.ciudad}</span>
                  </div>
                </TableCell>
                <TableCell>{getTipoBadge(cliente.tipoCliente)}</TableCell>
                <TableCell>
                  <span className="font-semibold text-gray-900">
                    ${cliente.totalCompras.toLocaleString('es-CO')}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{cliente.pedidosRealizados}</Badge>
                </TableCell>
                <TableCell>{getEstadoBadge(cliente.estado)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog open={viewingCliente?.id === cliente.id} onOpenChange={(open) => !open && setViewingCliente(null)}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setViewingCliente(cliente)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Detalles del Cliente</DialogTitle>
                          <DialogDescription>{cliente.nombre}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          {/* Info General */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-gray-500">Email</Label>
                              <p className="text-gray-900">{cliente.email}</p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-gray-500">Teléfono</Label>
                              <p className="text-gray-900">{cliente.telefono}</p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-gray-500">Dirección</Label>
                              <p className="text-gray-900">{cliente.direccion}</p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-gray-500">Ciudad</Label>
                              <p className="text-gray-900">{cliente.ciudad}</p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-gray-500">Tipo Cliente</Label>
                              <div>{getTipoBadge(cliente.tipoCliente)}</div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-gray-500">Fecha Registro</Label>
                              <p className="text-gray-900">{cliente.fechaRegistro}</p>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-4">
                            <Card className="p-4 border-l-4 border-l-blue-500">
                              <p className="text-sm text-gray-600">Total Compras</p>
                              <p className="text-xl font-bold text-gray-900">
                                ${cliente.totalCompras.toLocaleString('es-CO')}
                              </p>
                            </Card>
                            <Card className="p-4 border-l-4 border-l-green-500">
                              <p className="text-sm text-gray-600">Pedidos</p>
                              <p className="text-xl font-bold text-gray-900">{cliente.pedidosRealizados}</p>
                            </Card>
                            <Card className="p-4 border-l-4 border-l-purple-500">
                              <p className="text-sm text-gray-600">Última Compra</p>
                              <p className="text-xl font-bold text-gray-900">
                                {cliente.ultimaCompra !== '-' ? cliente.ultimaCompra : 'N/A'}
                              </p>
                            </Card>
                          </div>

                          {/* Historial */}
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Historial de Compras</h3>
                            {cliente.historialCompras.length > 0 ? (
                              <div className="space-y-2">
                                {cliente.historialCompras.map((compra, idx) => (
                                  <Card key={idx} className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium text-gray-900">{compra.pedidoId}</p>
                                        <p className="text-sm text-gray-600 mt-1">{compra.productos}</p>
                                        <p className="text-xs text-gray-500 mt-1">{compra.fecha}</p>
                                      </div>
                                      <p className="font-bold text-gray-900">
                                        ${compra.total.toLocaleString('es-CO')}
                                      </p>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-4">Sin historial de compras</p>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={editingCliente?.id === cliente.id} onOpenChange={(open) => !open && setEditingCliente(null)}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditCliente(cliente)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Editar Cliente</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                          <div className="space-y-2 col-span-2">
                            <Label>Nombre Completo / Razón Social</Label>
                            <Input
                              value={formData.nombre}
                              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Teléfono</Label>
                            <Input
                              value={formData.telefono}
                              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label>Dirección</Label>
                            <Input
                              value={formData.direccion}
                              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Ciudad</Label>
                            <Input
                              value={formData.ciudad}
                              onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Tipo de Cliente</Label>
                            <Select value={formData.tipoCliente} onValueChange={(value) => setFormData({ ...formData, tipoCliente: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="minorista">Minorista</SelectItem>
                                <SelectItem value="mayorista">Mayorista</SelectItem>
                                <SelectItem value="corporativo">Corporativo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => { setEditingCliente(null); resetForm(); }}>
                            Cancelar
                          </Button>
                          <Button onClick={handleUpdateCliente} className="bg-black hover:bg-gray-800">
                            Actualizar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteCliente(cliente.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ));
          })()}
          </TableBody>
        </Table>
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredClientes.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </Card>
    </div>
  );
}

export default ClientesModule;




