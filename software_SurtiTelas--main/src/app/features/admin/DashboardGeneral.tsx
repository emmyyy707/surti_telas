import { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Package,
  Package2,
  DollarSign,
  ShoppingCart,
  Boxes,
  Factory,
  TrendingUp,
  AlertTriangle,
  TrendingDown,
  Clock,
  CheckCircle2,
  Truck,
  Star,
  BarChart3,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DashboardGeneralProps {
  onNavigate: (moduleId: string) => void;
}

export function DashboardGeneral({ onNavigate }: DashboardGeneralProps) {
  // Datos de ejemplo para gráficos
  const ventasMesData = [
    { name: 'Ene', ventas: 45000, meta: 50000 },
    { name: 'Feb', ventas: 52000, meta: 50000 },
    { name: 'Mar', ventas: 48000, meta: 50000 },
    { name: 'Abr', ventas: 61000, meta: 55000 },
    { name: 'May', ventas: 55000, meta: 55000 },
    { name: 'Jun', ventas: 67000, meta: 60000 },
  ];

  const ventasPorCategoriaData = [
    { name: 'Camisetas Básicas', value: 35, color: '#3b82f6' },
    { name: 'Camisetas Premium', value: 25, color: '#8b5cf6' },
    { name: 'Polos', value: 20, color: '#f59e0b' },
    { name: 'Deportivas', value: 15, color: '#10b981' },
    { name: 'Otros', value: 5, color: '#6b7280' },
  ];

  const produccionSemanalData = [
    { dia: 'Lun', corte: 120, confeccion: 95, estampado: 80, finalizado: 70 },
    { dia: 'Mar', corte: 135, confeccion: 110, estampado: 95, finalizado: 85 },
    { dia: 'Mié', corte: 145, confeccion: 125, estampado: 105, finalizado: 90 },
    { dia: 'Jue', corte: 150, confeccion: 135, estampado: 115, finalizado: 100 },
    { dia: 'Vie', corte: 160, confeccion: 145, estampado: 125, finalizado: 110 },
    { dia: 'Sáb', corte: 95, confeccion: 80, estampado: 70, finalizado: 65 },
    { dia: 'Dom', corte: 0, confeccion: 0, estampado: 0, finalizado: 0 },
  ];

  const ingresosVsGastosData = [
    { mes: 'Ene', ingresos: 4500000, gastos: 3200000 },
    { mes: 'Feb', ingresos: 5200000, gastos: 3400000 },
    { mes: 'Mar', ingresos: 4800000, gastos: 3300000 },
    { mes: 'Abr', ingresos: 6100000, gastos: 3800000 },
    { mes: 'May', ingresos: 5500000, gastos: 3600000 },
    { mes: 'Jun', ingresos: 6700000, gastos: 4000000 },
  ];

  const topProductosData = [
    { producto: 'Camiseta Básica Blanca', unidades: 245, ingresos: 3675000 },
    { producto: 'Camiseta Premium Negro', unidades: 180, ingresos: 3600000 },
    { producto: 'Polo Deportivo Azul', unidades: 150, ingresos: 3000000 },
    { producto: 'Camiseta Estampada', unidades: 135, ingresos: 2700000 },
    { producto: 'Camiseta Cuello V', unidades: 120, ingresos: 2400000 },
  ];

  const ultimosPedidos = [
    { id: 'PED-001', cliente: 'Juan Pérez', monto: 15000, estado: 'En proceso', fecha: '2024-12-10' },
    { id: 'PED-002', cliente: 'Mará González', monto: 23000, estado: 'Completado', fecha: '2024-12-10' },
    { id: 'PED-003', cliente: 'Carlos López', monto: 18500, estado: 'Pendiente', fecha: '2024-12-09' },
    { id: 'PED-004', cliente: 'Ana Martónez', monto: 31000, estado: 'En proceso', fecha: '2024-12-09' },
    { id: 'PED-005', cliente: 'Pedro Rodríguez', monto: 12000, estado: 'Completado', fecha: '2024-12-08' },
  ];

  const empleadosActivos = [
    { nombre: 'Luis García', rol: 'Asesor de Ventas', ventas: 15 },
    { nombre: 'Carmen Silva', rol: 'Asesor de Ventas', ventas: 12 },
    { nombre: 'Roberto Díaz', rol: 'Supervisor', ventas: 8 },
    { nombre: 'Lucía Morales', rol: 'Asesor de Ventas', ventas: 18 },
  ];

  const alertas = [
    { tipo: 'stock', mensaje: 'Tela de algodón blanca - Stock bajo (15 unidades)', prioridad: 'alta' },
    { tipo: 'devolucion', mensaje: '3 devoluciones pendientes de revisión', prioridad: 'media' },
    { tipo: 'produccion', mensaje: 'Taller "Confecciones El Roble" - Retraso en entrega', prioridad: 'alta' },
    { tipo: 'pago', mensaje: '5 pagos pendientes por confirmar', prioridad: 'media' },
  ];

  const getEstadoBadge = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'completado':
        return <Badge className="bg-[var(--emerald-dim)] text-green-800 border-green-200">Completado</Badge>;
      case 'en proceso':
        return <Badge className="bg-[var(--blue-dim)] text-blue-800 border-blue-200">En proceso</Badge>;
      case 'pendiente':
        return <Badge className="bg-[var(--amber-dim)] text-[var(--amber)] border-[var(--border-default)]">Pendiente</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return 'border-l-4 border-l-[var(--red)] bg-[var(--red-dim)]';
      case 'media':
        return 'border-l-4 border-l-[var(--amber)] bg-[var(--amber-dim)]';
      default:
        return 'border-l-4 border-l-[var(--blue)] bg-[var(--blue-dim)]';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
         <div>
           <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Panel de Administración de Surti Camisetas</h1>
           <p className="text-[var(--text-secondary)] mt-1">Resumen general del sistema</p>
         </div>
        <div className="flex gap-3">
          <Button variant="outline">
            Nueva acción
          </Button>
          <Button className="bg-[var(--text-primary)] hover:bg-[var(--text-tertiary)]">
            Exportar Datos
          </Button>
        </div>
      </div>

{/* Cards superiores - Métricas clave */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
         <Card className="p-4 sm:p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm hover:shadow-md transition-shadow">
           <div className="flex items-center gap-3 sm:gap-4">
             <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[var(--blue-dim)] flex items-center justify-center">
               <Users className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--blue)]" />
             </div>
             <div>
               <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">248</p>
               <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Total usuarios</p>
             </div>
           </div>
         </Card>

         <Card className="p-4 sm:p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm hover:shadow-md transition-shadow">
           <div className="flex items-center gap-3 sm:gap-4">
             <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-purple-100 flex items-center justify-center">
               <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
             </div>
             <div>
               <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">15</p>
               <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Empleados / asesores</p>
             </div>
           </div>
         </Card>

         <Card className="p-4 sm:p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm hover:shadow-md transition-shadow">
           <div className="flex items-center gap-3 sm:gap-4">
             <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[var(--emerald-dim)] flex items-center justify-center">
               <Boxes className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--emerald)]" />
             </div>
             <div>
               <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">156</p>
               <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Total insumos</p>
             </div>
           </div>
         </Card>

         <Card className="p-4 sm:p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm hover:shadow-md transition-shadow">
           <div className="flex items-center gap-3 sm:gap-4">
             <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[var(--amber-dim)] flex items-center justify-center">
               <Package2 className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--amber)]" />
             </div>
             <div>
               <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">89</p>
               <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Productos terminados</p>
             </div>
           </div>
         </Card>

         <Card className="p-4 sm:p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm hover:shadow-md transition-shadow">
           <div className="flex items-center gap-3 sm:gap-4">
             <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-pink-100 flex items-center justify-center">
               <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600" />
             </div>
             <div>
               <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">$67,000</p>
               <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Ventas del mes</p>
             </div>
           </div>
         </Card>

         <Card className="p-4 sm:p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm hover:shadow-md transition-shadow">
           <div className="flex items-center gap-3 sm:gap-4">
             <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-indigo-100 flex items-center justify-center">
               <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
             </div>
             <div>
               <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">142</p>
               <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Pedidos procesados</p>
             </div>
           </div>
         </Card>
       </div>

      {/* Contenido principal - Gráficos, tablas y alertas */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gráfico de ventas */}
        <Card className="p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Ventas del Mes</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Evolución mensual de ventas</p>
            </div>
            <TrendingUp className="h-5 w-5 text-[var(--emerald)]" />
          </div>
<ResponsiveContainer width="100%" height={200}>
              <LineChart data={ventasMesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={11} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="ventas" stroke="var(--text-primary)" strokeWidth={2} />
                <Line type="monotone" dataKey="meta" stroke="var(--red)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
        </Card>

        {/* Alertas del sistema */}
        <Card className="p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Alertas del Sistema</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Notificaciones importantes</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-[var(--amber)]" />
          </div>
          <div className="space-y-3">
            {alertas.map((alerta, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${getPrioridadColor(alerta.prioridad)}`}
              >
                <p className="text-sm font-medium text-[var(--text-primary)]">{alerta.mensaje}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Últimos pedidos y empleados activos */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Últimos pedidos */}
        <Card className="lg:col-span-2 p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Últimos Pedidos</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Pedidos recientes del sistema</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onNavigate('gestion-pedidos')}>
              Ver todos
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Cliente</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Monto</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {ultimosPedidos.map((pedido) => (
                  <tr key={pedido.id} className="border-b border-[var(--border-subtle)] hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-[var(--text-primary)]">{pedido.id}</td>
                    <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">{pedido.cliente}</td>
                    <td className="py-3 px-4 text-sm text-[var(--text-primary)] font-medium">${pedido.monto.toLocaleString()}</td>
                    <td className="py-3 px-4">{getEstadoBadge(pedido.estado)}</td>
                    <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">{pedido.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Empleados activos */}
        <Card className="p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Empleados Activos</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Top asesores del mes</p>
            </div>
          </div>
          <div className="space-y-4">
            {empleadosActivos.map((empleado, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--bg-muted)] transition-colors">
                <div className="h-10 w-10 rounded-full bg-[var(--text-primary)] flex items-center justify-center text-white font-medium">
                  {empleado.nombre.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[var(--text-primary)] text-sm">{empleado.nombre}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{empleado.rol}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[var(--text-primary)]">{empleado.ventas}</p>
                  <p className="text-xs text-[var(--text-secondary)]">ventas</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Gráficos adicionales */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gráfico de ventas por categoría */}
        <Card className="p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Ventas por Categoría</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Distribución de ventas por tipo de producto</p>
            </div>
            <BarChart3 className="h-5 w-5 text-[var(--blue)]" />
          </div>
<ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={ventasPorCategoriaData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {ventasPorCategoriaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
            </ResponsiveContainer>
        </Card>

        {/* Gráfico de producción semanal */}
        <Card className="p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Producción Semanal</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Avance de producción por día</p>
            </div>
            <Factory className="h-5 w-5 text-[var(--amber)]" />
          </div>
<ResponsiveContainer width="100%" height={200}>
            <BarChart data={produccionSemanalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="dia" stroke="var(--text-tertiary)" fontSize={11} />
              <YAxis stroke="var(--text-tertiary)" fontSize={11} />
              <Tooltip />
              <Legend />
              <Bar dataKey="corte" fill="#8884d8" />
              <Bar dataKey="confeccion" fill="#82ca9d" />
              <Bar dataKey="estampado" fill="#ffc658" />
              <Bar dataKey="finalizado" fill="#ff8c00" />
            </BarChart>
            </ResponsiveContainer>
        </Card>
      </div>

      {/* Gráficos adicionales */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gráfico de ingresos vs gastos */}
        <Card className="p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Ingresos vs Gastos</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Comparación mensual de ingresos y gastos</p>
            </div>
            <DollarSign className="h-5 w-5 text-[var(--emerald)]" />
          </div>
<ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ingresosVsGastosData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="mes" stroke="var(--text-tertiary)" fontSize={11} />
              <YAxis stroke="var(--text-tertiary)" fontSize={11} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="ingresos" stroke="var(--violet)" fill="#8884d8" />
              <Area type="monotone" dataKey="gastos" stroke="#82ca9d" fill="#82ca9d" />
            </AreaChart>
            </ResponsiveContainer>
        </Card>

        {/* Gráfico de top productos */}
        <Card className="p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Top Productos</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Productos más vendidos y sus ingresos</p>
            </div>
            <Star className="h-5 w-5 text-yellow-600" />
          </div>
<ResponsiveContainer width="100%" height={200}>
              <BarChart data={topProductosData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="producto" stroke="var(--text-tertiary)" fontSize={10} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="unidades" fill="#8884d8" />
                <Bar dataKey="ingresos" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}




