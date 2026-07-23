import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
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
      descripcion: 'Camiseta Bósica Blanca (x2), Polo Deportivo',
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
      descripcion: 'Camiseta Bósica (x3), Polo Premium (x2)',
    },
  ];

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Entregado':
        return (
          <Badge className="bg-[var(--emerald-dim)] text-[var(--emerald)] border-[var(--emerald-dim)]">
            <CheckCircle className="h-3 w-3 mr-1" />
            Entregado
          </Badge>
        );
      case 'En entrega':
        return (
          <Badge className="bg-[var(--blue-dim)] text-[var(--blue)] border-[var(--blue-dim)]">
            <Truck className="h-3 w-3 mr-1" />
            En entrega
          </Badge>
        );
      case 'En producción':
        return (
          <Badge className="bg-[var(--violet-dim)] text-[var(--violet)] border-[var(--violet-dim)]">
            <Factory className="h-3 w-3 mr-1" />
            En producción
          </Badge>
        );
      case 'Confirmado':
        return (
          <Badge className="bg-[var(--blue-dim)] text-[var(--blue)] border-[var(--blue-dim)]">
            <PackageCheck className="h-3 w-3 mr-1" />
            Confirmado
          </Badge>
        );
      case 'Pendiente':
        return (
          <Badge className="bg-[var(--amber-dim)] text-[var(--amber)] border-[var(--amber-dim)]">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      case 'Cancelado':
        return (
          <Badge className="bg-[var(--red-dim)] text-[var(--red)] border-[var(--red-dim)]">
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
      <Card className="p-8 bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-tertiary)] text-white rounded-xl">
        <h1 className="text-3xl font-bold">Hola, {userName}</h1>
        <p className="text-[var(--text-secondary)] mt-2">Bienvenido de nuevo a tu cuenta de Surtitelas</p>
      </Card>

      {/* Estadósticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-full bg-[var(--blue-dim)] flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-[var(--blue)]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalPedidos}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Total Pedidos</p>
        </Card>

        <Card className="p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-full bg-[var(--emerald-dim)] flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-[var(--emerald)]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.completados}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Completados</p>
        </Card>

        <Card className="p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-full bg-[var(--amber-dim)] flex items-center justify-center">
              <Clock className="h-6 w-6 text-[var(--amber)]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.enProceso}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">En Proceso</p>
        </Card>

        <Card className="p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-full bg-[var(--violet-dim)] flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-[var(--violet)]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">${(stats.totalGastado / 1000).toFixed(0)}K</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Total Gastado</p>
        </Card>
      </div>

      {/* Actividad Reciente */}
      <Card className="p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Actividad Reciente</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Tus Últimos pedidos y movimientos</p>
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
              className="flex items-center justify-between p-4 bg-[var(--bg-subtle)] rounded-lg hover:bg-[var(--bg-muted)] transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="h-12 w-12 rounded-full bg-[var(--text-primary)] text-white flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--text-primary)]">{pedido.id}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{pedido.fecha} ó {pedido.productos} productos</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1 truncate">{pedido.descripcion}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-[var(--text-primary)]">${pedido.total.toLocaleString()}</p>
                  {getEstadoBadge(pedido.estado)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Acciones Rópidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer group"
          onClick={() => onNavigate('mis-pedidos-cliente')}
        >
          <div className="h-12 w-12 rounded-full bg-[var(--blue-dim)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ShoppingBag className="h-6 w-6 text-[var(--blue)]" />
          </div>
          <h3 className="font-semibold text-[var(--text-primary)] mb-2">Mis Pedidos</h3>
          <p className="text-sm text-[var(--text-secondary)]">Ver historial de compras</p>
        </Card>

        <Card
          className="p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer group"
          onClick={() => onNavigate('direcciones-cliente')}
        >
          <div className="h-12 w-12 rounded-full bg-[var(--emerald-dim)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Truck className="h-6 w-6 text-[var(--emerald)]" />
          </div>
          <h3 className="font-semibold text-[var(--text-primary)] mb-2">Direcciones</h3>
          <p className="text-sm text-[var(--text-secondary)]">Gestiona tus direcciones de enváo</p>
        </Card>

        <Card
          className="p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer group"
          onClick={() => onNavigate('perfil-cliente')}
        >
          <div className="h-12 w-12 rounded-full bg-[var(--violet-dim)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <DollarSign className="h-6 w-6 text-[var(--violet)]" />
          </div>
          <h3 className="font-semibold text-[var(--text-primary)] mb-2">Mi Perfil</h3>
          <p className="text-sm text-[var(--text-secondary)]">Actualiza tu información personal</p>
        </Card>
      </div>
    </div>
  );
}



