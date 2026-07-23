import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  ShoppingBag,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  Truck,
  ArrowRight,
  Factory,
  PackageCheck,
  XCircle,
} from 'lucide-react';

interface ResumenClienteProps {
  userName: string;
  onNavigate: (moduleId: string) => void;
}

export function ResumenCliente({ userName, onNavigate }: ResumenClienteProps) {
  // Datos de ejemplo
  const stats = {
    totalPedidos: 12,
    completados: 8,
    enProceso: 3,
    totalGastado: 2450000,
  };

  const pedidosRecientes = [
    {
      id: 'PED-0012',
      fecha: '15 de Mayo, 2026',
      productos: 3,
      total: 245000,
      estado: 'Entregado',
      descripcion: 'Camiseta Básica Blanca (x2), Polo Deportivo',
    },
    {
      id: 'PED-0011',
      fecha: '10 de Mayo, 2026',
      productos: 2,
      total: 180000,
      estado: 'En entrega',
      descripcion: 'Sudadera con capucha, Pantalón deportivo',
    },
    {
      id: 'PED-0010',
      fecha: '5 de Mayo, 2026',
      productos: 5,
      total: 420000,
      estado: 'En producción',
      descripcion: 'Camiseta Básica (x3), Polo Premium (x2)',
    },
  ];

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
      {/* Banner de Bienvenida */}
      <Card className="p-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl">
        <h1 className="text-3xl font-bold">Hola, {userName}</h1>
        <p className="text-gray-300 mt-2">Bienvenido de nuevo a tu cuenta de Surtitelas</p>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalPedidos}</p>
          <p className="text-sm text-gray-600 mt-1">Total Pedidos</p>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.completados}</p>
          <p className="text-sm text-gray-600 mt-1">Completados</p>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.enProceso}</p>
          <p className="text-sm text-gray-600 mt-1">En Proceso</p>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">${(stats.totalGastado / 1000).toFixed(0)}K</p>
          <p className="text-sm text-gray-600 mt-1">Total Gastado</p>
        </Card>
      </div>

      {/* Actividad Reciente */}
      <Card className="p-6 bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Actividad Reciente</h2>
            <p className="text-sm text-gray-600 mt-1">Tus últimos pedidos y movimientos</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('mis-pedidos-cliente')}
          >
            Ver todos
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="space-y-4">
          {pedidosRecientes.map((pedido) => (
            <div
              key={pedido.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="h-12 w-12 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{pedido.id}</p>
                  <p className="text-sm text-gray-600">{pedido.fecha} • {pedido.productos} productos</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{pedido.descripcion}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${pedido.total.toLocaleString()}</p>
                  {getEstadoBadge(pedido.estado)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer group"
          onClick={() => onNavigate('mis-pedidos-cliente')}
        >
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ShoppingBag className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Mis Pedidos</h3>
          <p className="text-sm text-gray-600">Ver historial de compras</p>
        </Card>

        <Card
          className="p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer group"
          onClick={() => onNavigate('direcciones-cliente')}
        >
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Truck className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Direcciones</h3>
          <p className="text-sm text-gray-600">Gestiona tus direcciones de envío</p>
        </Card>

        <Card
          className="p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer group"
          onClick={() => onNavigate('perfil-cliente')}
        >
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Mi Perfil</h3>
          <p className="text-sm text-gray-600">Actualiza tu información personal</p>
        </Card>
      </div>
    </div>
  );
}



