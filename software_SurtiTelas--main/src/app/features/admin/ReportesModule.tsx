import { useState } from 'react';
import {
  BarChart3,
  Package,
  Factory,
  ShoppingCart,
  Users,
  Download,
  FileText,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Mail,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface ReportesModuleProps {
  activeTab?: string;
}

export function ReportesModule({ activeTab }: ReportesModuleProps) {
  const [fechaInicio, setFechaInicio] = useState('2024-01-01');
  const [fechaFin, setFechaFin] = useState('2024-12-31');

  // Determinar el tab activo basado en activeTab
  const getCurrentTab = () => {
    if (activeTab === 'reportes-inventario' || activeTab === 'inventario') return 'inventario';
    if (activeTab === 'reportes-produccion' || activeTab === 'produccion') return 'produccion';
    if (activeTab === 'reportes-usuarios' || activeTab === 'usuarios') return 'usuarios';
    return 'ventas';
  };

  // Datos para gróficos
  const ventasMensuales = [
    { mes: 'Ene', ventas: 45000, pedidos: 28 },
    { mes: 'Feb', ventas: 52000, pedidos: 35 },
    { mes: 'Mar', ventas: 48000, pedidos: 30 },
    { mes: 'Abr', ventas: 61000, pedidos: 42 },
    { mes: 'May', ventas: 55000, pedidos: 38 },
    { mes: 'Jun', ventas: 67000, pedidos: 45 },
    { mes: 'Jul', ventas: 72000, pedidos: 50 },
    { mes: 'Ago', ventas: 68000, pedidos: 47 },
    { mes: 'Sep', ventas: 75000, pedidos: 52 },
    { mes: 'Oct', ventas: 80000, pedidos: 58 },
    { mes: 'Nov', ventas: 85000, pedidos: 62 },
    { mes: 'Dic', ventas: 90000, pedidos: 68 },
  ];

  const productosMasVendidos = [
    { nombre: 'Camiseta Bósica Blanca', ventas: 450, valor: 36000 },
    { nombre: 'Camiseta Bósica Negra', ventas: 380, valor: 30400 },
    { nombre: 'Camiseta Polo Azul', ventas: 280, valor: 42000 },
    { nombre: 'Camiseta Estampada Logo', ventas: 220, valor: 26400 },
    { nombre: 'Camiseta Deportiva', ventas: 180, valor: 32400 },
  ];

  const inventarioPorCategoria = [
    { nombre: 'Telas', value: 35, color: '#3B82F6' },
    { nombre: 'Hilos', value: 20, color: '#10B981' },
    { nombre: 'Accesorios', value: 25, color: '#F59E0B' },
    { nombre: 'Etiquetas', value: 15, color: '#EF4444' },
    { nombre: 'Otros', value: 5, color: '#8B5CF6' },
  ];

  const produccionPorTaller = [
    { taller: 'Confecciones El Roble', produccion: 350 },
    { taller: 'Textil Express', produccion: 280 },
    { taller: 'Confecciones del Valle', produccion: 220 },
    { taller: 'Taller San Josó', produccion: 150 },
  ];

  const estadosPedidos = [
    { estado: 'Completados', cantidad: 145, color: '#10B981' },
    { estado: 'En proceso', cantidad: 42, color: '#3B82F6' },
    { estado: 'Pendientes', cantidad: 28, color: '#F59E0B' },
    { estado: 'Cancelados', cantidad: 8, color: '#EF4444' },
  ];

  const usuariosPorRol = [
    { rol: 'Clientes', cantidad: 215 },
    { rol: 'Asesores', cantidad: 12 },
    { rol: 'Supervisores', cantidad: 5 },
    { rol: 'Producción', cantidad: 8 },
    { rol: 'Administradores', cantidad: 3 },
  ];

  const movimientosInventario = [
    { fecha: '2024-12-11', item: 'Tela de Algodón Blanca', tipo: 'Salida', cantidad: 50, motivo: 'Producción' },
    { fecha: '2024-12-10', item: 'Hilo Negro', tipo: 'Entrada', cantidad: 30, motivo: 'Compra' },
    { fecha: '2024-12-10', item: 'Botones Plósticos', tipo: 'Salida', cantidad: 100, motivo: 'Producción' },
    { fecha: '2024-12-09', item: 'Etiquetas de Marca', tipo: 'Entrada', cantidad: 200, motivo: 'Compra' },
    { fecha: '2024-12-09', item: 'Tela de Algodón Negra', tipo: 'Salida', cantidad: 35, motivo: 'Producción' },
  ];

  const handleExportPDF = () => {
    toast.success('Reporte exportado a PDF');
  };

  const handleExportExcel = () => {
    toast.success('Reporte exportado a Excel');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard de Reportes y Analótica</h1>
        <p className="text-gray-600 mt-1">Informes detallados del sistema</p>
      </div>

      {/* Filtros avanzados */}
      <Card className="p-6 bg-white rounded-xl shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtros Avanzados</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fecha-inicio">Fecha inicio</Label>
            <Input 
              id="fecha-inicio" 
              type="date" 
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fecha-fin">Fecha fin</Label>
            <Input 
              id="fecha-fin" 
              type="date" 
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Todos los clientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="cliente1">Juan Pérez</SelectItem>
                <SelectItem value="cliente2">Mará González</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="producto">Producto</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Todos los productos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="prod1">Camiseta Bósica</SelectItem>
                <SelectItem value="prod2">Camiseta Polo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="taller">Taller</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Todos los talleres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="taller1">Confecciones El Roble</SelectItem>
                <SelectItem value="taller2">Textil Express</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button className="bg-gray-900 hover:bg-gray-800">
            Aplicar Filtros
          </Button>
          <Button variant="outline">
            Limpiar Filtros
          </Button>
        </div>
      </Card>

      {/* Botones de exportación */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleExportPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Descargar PDF
        </Button>
        <Button variant="outline" onClick={handleExportExcel}>
          <Download className="h-4 w-4 mr-2" />
          Descargar Excel
        </Button>
        <Button variant="outline">
          <Mail className="h-4 w-4 mr-2" />
          Enviar reporte
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={getCurrentTab()} className="space-y-6">
        <TabsList className="bg-white p-2 rounded-lg shadow-sm flex flex-col sm:flex-row h-auto gap-2 w-full sm:w-auto">
          <TabsTrigger value="ventas" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <ShoppingCart className="h-4 w-4 mr-2" />
            <span>Reportes de ventas</span>
          </TabsTrigger>
          <TabsTrigger value="inventario" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <Package className="h-4 w-4 mr-2" />
            <span>Reportes de inventario</span>
          </TabsTrigger>
          <TabsTrigger value="produccion" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <Factory className="h-4 w-4 mr-2" />
            <span>Reportes de producción</span>
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <Users className="h-4 w-4 mr-2" />
            <span>Reportes de usuarios</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Reportes de ventas */}
        <TabsContent value="ventas" className="space-y-6">
          {/* Cards de resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Ventas Totales</p>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">$778,000</p>
              <p className="text-xs text-green-600 mt-1">+18% vs mes anterior</p>
            </Card>
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Pedidos</p>
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">555</p>
              <p className="text-xs text-green-600 mt-1">+12% vs mes anterior</p>
            </Card>
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Ticket Promedio</p>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">$1,401</p>
              <p className="text-xs text-green-600 mt-1">+5% vs mes anterior</p>
            </Card>
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Tasa Conversión</p>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">68%</p>
              <p className="text-xs text-red-600 mt-1">-2% vs mes anterior</p>
            </Card>
          </div>

          {/* Grófico de ventas mensuales */}
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Ventas Mensuales</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ventasMensuales}>
                <CartesianGrid key="grid-reportes-ventas" strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis key="xaxis-reportes-ventas" dataKey="mes" stroke="#888" />
                <YAxis key="yaxis-reportes-ventas" stroke="#888" />
                <Tooltip key="tooltip-reportes-ventas" />
                <Legend key="legend-reportes-ventas" />
                <Line key="line-ventas" type="monotone" dataKey="ventas" stroke="#0D0D0D" strokeWidth={2} name="Ventas ($)" />
                <Line key="line-pedidos" type="monotone" dataKey="pedidos" stroke="#3B82F6" strokeWidth={2} name="Pedidos" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Productos mós vendidos */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Productos Mós Vendidos</h3>
              <div className="space-y-3">
                {productosMasVendidos.map((producto, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{producto.nombre}</p>
                        <p className="text-sm text-gray-600">{producto.ventas} unidades</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">${producto.valor.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Estados de Pedidos</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={estadosPedidos}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="cantidad"
                  >
                    {estadosPedidos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Reportes de inventario */}
        <TabsContent value="inventario" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Distribución de Inventario por Categorá</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={inventarioPorCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nombre, value }) => `${nombre} ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {inventarioPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Movimientos Recientes de Inventario</h3>
              <div className="space-y-3">
                {movimientosInventario.map((mov, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{mov.item}</p>
                      <p className="text-sm text-gray-600">{mov.motivo}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={mov.tipo === 'Entrada' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                        {mov.tipo} {mov.cantidad}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{mov.fecha}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Reportes de producción */}
        <TabsContent value="produccion" className="space-y-6">
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Producción por Taller</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={produccionPorTaller}>
                <CartesianGrid key="grid-reportes-produccion" strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis key="xaxis-reportes-produccion" dataKey="taller" stroke="#888" />
                <YAxis key="yaxis-reportes-produccion" stroke="#888" />
                <Tooltip key="tooltip-reportes-produccion" />
                <Bar key="bar-produccion" dataKey="produccion" fill="#0D0D0D" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Resumen de Producción</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total producido</span>
                  <span className="font-semibold text-gray-900">1,000 unidades</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">En producción</span>
                  <span className="font-semibold text-gray-900">250 unidades</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Talleres activos</span>
                  <span className="font-semibold text-gray-900">4 talleres</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Eficiencia promedio</span>
                  <span className="font-semibold text-green-600">92%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Tiempos de Entrega</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Tiempo promedio</span>
                  <span className="font-semibold text-gray-900">7 dás</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Entregas a tiempo</span>
                  <span className="font-semibold text-green-600">85%</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Entregas con retraso</span>
                  <span className="font-semibold text-orange-600">12%</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Prendas defectuosas</span>
                  <span className="font-semibold text-red-600">3%</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Reportes de usuarios */}
        <TabsContent value="usuarios" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Usuarios por Rol</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={usuariosPorRol}>
                  <CartesianGrid key="grid-reportes-usuarios" strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis key="xaxis-reportes-usuarios" dataKey="rol" stroke="#888" />
                  <YAxis key="yaxis-reportes-usuarios" stroke="#888" />
                  <Tooltip key="tooltip-reportes-usuarios" />
                  <Bar key="bar-cantidad" dataKey="cantidad" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Estadósticas de Usuarios</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total usuarios</span>
                  <span className="font-semibold text-gray-900">243</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Usuarios activos</span>
                  <span className="font-semibold text-green-600">220</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Nuevos (este mes)</span>
                  <span className="font-semibold text-blue-600">18</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Tasa de retención</span>
                  <span className="font-semibold text-green-600">88%</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ReportesModule;




