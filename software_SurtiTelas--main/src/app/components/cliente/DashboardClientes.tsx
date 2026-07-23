import { useState } from 'react';
import {
  Users,
  UserCheck,
  TrendingUp,
  CreditCard,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  UserX,
  FileText,
  Package,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Cliente {
  id: string;
  nombre: string;
  documento: string;
  telefono: string;
  email: string;
  ciudad: string;
  direccion: string;
  totalCompras: number;
  ultimaCompra: string;
  estado: 'Activo' | 'Inactivo';
  tipo: 'Frecuente' | 'VIP' | 'Nuevo' | 'Regular';
  pedidos: number;
  saldoPendiente: number;
}

export function DashboardClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: 'CLI-001',
      nombre: 'María González Pérez',
      documento: '1023456789',
      telefono: '3001234567',
      email: 'maria.gonzalez@email.com',
      ciudad: 'Bogotá',
      direccion: 'Calle 123 #45-67',
      totalCompras: 4500000,
      ultimaCompra: '2026-05-10',
      estado: 'Activo',
      tipo: 'VIP',
      pedidos: 23,
      saldoPendiente: 0,
    },
    {
      id: 'CLI-002',
      nombre: 'Juan Carlos Rodríguez',
      documento: '1034567890',
      telefono: '3009876543',
      email: 'juan.rodriguez@email.com',
      ciudad: 'Medellín',
      direccion: 'Carrera 45 #12-34',
      totalCompras: 2300000,
      ultimaCompra: '2026-05-12',
      estado: 'Activo',
      tipo: 'Frecuente',
      pedidos: 15,
      saldoPendiente: 150000,
    },
    {
      id: 'CLI-003',
      nombre: 'Ana Sofía Martínez',
      documento: '1045678901',
      telefono: '3007654321',
      email: 'ana.martinez@email.com',
      ciudad: 'Cali',
      direccion: 'Avenida 68 #78-90',
      totalCompras: 1800000,
      ultimaCompra: '2026-05-15',
      estado: 'Activo',
      tipo: 'Regular',
      pedidos: 8,
      saldoPendiente: 0,
    },
    {
      id: 'CLI-004',
      nombre: 'Carlos Andrés López',
      documento: '1056789012',
      telefono: '3005551234',
      email: 'carlos.lopez@email.com',
      ciudad: 'Barranquilla',
      direccion: 'Calle 72 #10-20',
      totalCompras: 850000,
      ultimaCompra: '2026-05-01',
      estado: 'Activo',
      tipo: 'Nuevo',
      pedidos: 3,
      saldoPendiente: 85000,
    },
    {
      id: 'CLI-005',
      nombre: 'Laura Patricia Díaz',
      documento: '1067890123',
      telefono: '3004567890',
      email: 'laura.diaz@email.com',
      ciudad: 'Cartagena',
      direccion: 'Carrera 15 #30-40',
      totalCompras: 3200000,
      ultimaCompra: '2026-04-20',
      estado: 'Inactivo',
      tipo: 'Frecuente',
      pedidos: 18,
      saldoPendiente: 320000,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    documento: '',
    telefono: '',
    email: '',
    ciudad: '',
    direccion: '',
    tipo: 'Regular' as Cliente['tipo'],
    estado: 'Activo' as Cliente['estado'],
  });

  // Filtrar clientes
  const clientesFiltrados = clientes.filter((cliente) => {
    const matchSearch =
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.documento.includes(searchTerm) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchEstado = filterEstado === 'todos' || cliente.estado === filterEstado;
    const matchTipo = filterTipo === 'todos' || cliente.tipo === filterTipo;

    return matchSearch && matchEstado && matchTipo;
  });

  // KPIs
  const totalClientes = clientes.length;
  const clientesActivos = clientes.filter((c) => c.estado === 'Activo').length;
  const clientesFrecuentes = clientes.filter((c) => c.tipo === 'Frecuente' || c.tipo === 'VIP').length;
  const clientesConSaldo = clientes.filter((c) => c.saldoPendiente > 0).length;
  const nuevosClientesMes = clientes.filter((c) => c.tipo === 'Nuevo').length;
  const tasaRecompra = ((clientesFrecuentes / totalClientes) * 100).toFixed(1);

  // Datos para gráficos
  const comprasMensuales = [
    { mes: 'Ene', compras: 45 },
    { mes: 'Feb', compras: 52 },
    { mes: 'Mar', compras: 48 },
    { mes: 'Abr', compras: 61 },
    { mes: 'May', compras: 58 },
  ];

  const tiposCliente = [
    { name: 'VIP', value: clientes.filter((c) => c.tipo === 'VIP').length, color: '#8b5cf6' },
    { name: 'Frecuente', value: clientes.filter((c) => c.tipo === 'Frecuente').length, color: '#3b82f6' },
    { name: 'Regular', value: clientes.filter((c) => c.tipo === 'Regular').length, color: '#10b981' },
    { name: 'Nuevo', value: clientes.filter((c) => c.tipo === 'Nuevo').length, color: '#f59e0b' },
  ];

  const handleOpenModal = (cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nombre: cliente.nombre,
        documento: cliente.documento,
        telefono: cliente.telefono,
        email: cliente.email,
        ciudad: cliente.ciudad,
        direccion: cliente.direccion,
        tipo: cliente.tipo,
        estado: cliente.estado,
      });
    } else {
      setEditingCliente(null);
      setFormData({
        nombre: '',
        documento: '',
        telefono: '',
        email: '',
        ciudad: '',
        direccion: '',
        tipo: 'Regular',
        estado: 'Activo',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveCliente = () => {
    if (editingCliente) {
      setClientes(
        clientes.map((c) =>
          c.id === editingCliente.id
            ? {
                ...c,
                ...formData,
              }
            : c
        )
      );
    } else {
      const newCliente: Cliente = {
        id: `CLI-${String(clientes.length + 1).padStart(3, '0')}`,
        ...formData,
        totalCompras: 0,
        ultimaCompra: new Date().toISOString().split('T')[0],
        pedidos: 0,
        saldoPendiente: 0,
      };
      setClientes([...clientes, newCliente]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteCliente = (id: string) => {
    if (window.confirm('Â¿Estás seguro de eliminar este cliente?')) {
      setClientes(clientes.filter((c) => c.id !== id));
    }
  };

  const getEstadoBadge = (estado: string) => {
    return estado === 'Activo' ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">Activo</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactivo</Badge>
    );
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'VIP':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">VIP</Badge>;
      case 'Frecuente':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Frecuente</Badge>;
      case 'Nuevo':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Nuevo</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Regular</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-1">Administra tu cartera de clientes y relaciones comerciales</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button className="bg-gray-900 hover:bg-gray-800" onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalClientes}</p>
          <p className="text-sm text-gray-600 mt-1">Total Clientes</p>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{clientesActivos}</p>
          <p className="text-sm text-gray-600 mt-1">Clientes Activos</p>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>+8.2%</span>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{clientesFrecuentes}</p>
          <p className="text-sm text-gray-600 mt-1">Clientes Frecuentes</p>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{clientesConSaldo}</p>
          <p className="text-sm text-gray-600 mt-1">Con Saldo Pendiente</p>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{nuevosClientesMes}</p>
          <p className="text-sm text-gray-600 mt-1">Nuevos Este Mes</p>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>+12%</span>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-pink-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{tasaRecompra}%</p>
          <p className="text-sm text-gray-600 mt-1">Tasa de Recompra</p>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Compras Mensuales</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={comprasMensuales}>
              <CartesianGrid key="grid-compras" strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis key="xaxis-compras" dataKey="mes" stroke="#888" />
              <YAxis key="yaxis-compras" stroke="#888" />
              <Tooltip key="tooltip-compras" />
              <Line key="line-compras" type="monotone" dataKey="compras" stroke="#2563EB" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Distribución por Tipo</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                key="pie-tipos"
                data={tiposCliente}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {tiposCliente.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip key="tooltip-pie" />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="p-4 bg-white rounded-xl shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, documento o email..."
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
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterTipo} onValueChange={setFilterTipo}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
              <SelectItem value="Frecuente">Frecuente</SelectItem>
              <SelectItem value="Regular">Regular</SelectItem>
              <SelectItem value="Nuevo">Nuevo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Tabla de clientes */}
      <Card className="p-0 bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">ID</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Cliente</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Documento</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Contacto</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Ciudad</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Total Compras</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Pedidos</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Última Compra</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Estado</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Tipo</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">{cliente.id}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold">
                        {cliente.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{cliente.nombre}</p>
                        <p className="text-xs text-gray-500">{cliente.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-700">{cliente.documento}</td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <Phone className="h-3 w-3" />
                        {cliente.telefono}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-700">{cliente.ciudad}</td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                    ${cliente.totalCompras.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-700">{cliente.pedidos}</td>
                  <td className="py-4 px-6 text-sm text-gray-700">{cliente.ultimaCompra}</td>
                  <td className="py-4 px-6">{getEstadoBadge(cliente.estado)}</td>
                  <td className="py-4 px-6">{getTipoBadge(cliente.tipo)}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" title="Ver detalle">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal(cliente)} title="Editar">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCliente(cliente.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {clientesFiltrados.length === 0 && (
          <div className="py-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No se encontraron clientes</p>
            <p className="text-sm text-gray-500 mt-1">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </Card>

      {/* Modal Crear/Editar Cliente */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
            <DialogDescription>
              {editingCliente
                ? 'Actualiza la información del cliente'
                : 'Completa los datos para registrar un nuevo cliente'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: María González Pérez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documento">Documento *</Label>
              <Input
                id="documento"
                value={formData.documento}
                onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                placeholder="Ej: 1023456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Ej: 3001234567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ej: cliente@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad *</Label>
              <Input
                id="ciudad"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                placeholder="Ej: Bogotá"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Cliente</Label>
              <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nuevo">Nuevo</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Frecuente">Frecuente</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="direccion">Dirección Completa</Label>
              <Textarea
                id="direccion"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Ej: Calle 123 #45-67, Barrio Centro"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value: any) => setFormData({ ...formData, estado: value })}
              >
                <SelectTrigger id="estado">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-gray-900 hover:bg-gray-800" onClick={handleSaveCliente}>
              {editingCliente ? 'Guardar Cambios' : 'Crear Cliente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



