import { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { TablePagination } from '../../components/ui/table-pagination';
import { DollarSign, TrendingUp, Calendar, Award } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ComisionesModule() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const comisionesData = [
    { mes: 'Ene', comision: 450000 },
    { mes: 'Feb', comision: 520000 },
    { mes: 'Mar', comision: 480000 },
    { mes: 'Abr', comision: 650000 },
    { mes: 'May', comision: 580000 },
  ];

  const comisionesPorProducto = [
    { producto: 'Camisetas', comision: 320000, ventas: 45 },
    { producto: 'Polos', comision: 180000, ventas: 28 },
    { producto: 'Deportivas', comision: 80000, ventas: 12 },
    { producto: 'Chaquetas', comision: 250000, ventas: 35 },
    { producto: 'Pantalones', comision: 190000, ventas: 30 },
    { producto: 'Shorts', comision: 120000, ventas: 22 },
    { producto: 'Sudaderas', comision: 210000, ventas: 33 },
    { producto: 'Zapatos', comision: 280000, ventas: 40 },
    { producto: 'Gorras', comision: 95000, ventas: 18 },
    { producto: 'Medias', comision: 65000, ventas: 15 },
    { producto: 'Bufandas', comision: 75000, ventas: 14 },
    { producto: 'Guantes', comision: 55000, ventas: 10 },
    { producto: 'Cinturones', comision: 110000, ventas: 20 },
    { producto: 'Billeteras', comision: 88000, ventas: 16 },
    { producto: 'Mochilas', comision: 145000, ventas: 25 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Mis Comisiones</h1>
        <p className="text-[var(--text-secondary)] mt-1">Seguimiento de tus comisiones y ganancias</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Comisión de Mayo</p>
              <p className="text-2xl font-bold mt-1">$580,000</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[var(--emerald-dim)] flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-[var(--emerald)]" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-[var(--emerald)] mr-1" />
            <span className="text-[var(--emerald)]">+12.5%</span>
            <span className="text-[var(--text-tertiary)] ml-1">vs mes anterior</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Total Acumulado</p>
              <p className="text-2xl font-bold mt-1">$2,680,000</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[var(--blue-dim)] flex items-center justify-center">
              <Award className="h-6 w-6 text-[var(--blue)]" />
            </div>
          </div>
          <p className="text-sm text-[var(--text-tertiary)] mt-2">Enero - Mayo 2026</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Ventas del Mes</p>
              <p className="text-2xl font-bold mt-1">85</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[var(--violet-dim)] flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-[var(--violet)]" />
            </div>
          </div>
          <p className="text-sm text-[var(--text-tertiary)] mt-2">Total de pedidos</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Próximo Pago</p>
              <p className="text-2xl font-bold mt-1">15 May</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[var(--amber-dim)] flex items-center justify-center">
              <Calendar className="h-6 w-6 text-[var(--amber)]" />
            </div>
          </div>
          <p className="text-sm text-[var(--text-tertiary)] mt-2">Fecha de liquidación</p>
        </Card>
      </div>

      {/* Gráfico de comisiones */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Evolución de Comisiones</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={comisionesData}>
            <CartesianGrid key="grid-comisiones" strokeDasharray="3 3" />
            <XAxis key="xaxis-comisiones" dataKey="mes" />
            <YAxis key="yaxis-comisiones" />
            <Tooltip key="tooltip-comisiones" />
            <Line key="line-comision" type="monotone" dataKey="comision" stroke="var(--emerald)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Comisiones por producto */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Comisiones por Categoría</h3>
        <div className="space-y-4">
          {(() => {
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedProductos = comisionesPorProducto.slice(startIndex, endIndex);
            const totalPages = Math.ceil(comisionesPorProducto.length / itemsPerPage);
            const totalComisiones = comisionesPorProducto.reduce((sum, item) => sum + item.comision, 0);

            return (
              <>
                {paginatedProductos.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-[var(--bg-subtle)] rounded-lg">
                    <div>
                      <p className="font-semibold">{item.producto}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{item.ventas} ventas</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">${item.comision.toLocaleString()}</p>
                      <Badge>
                        {((item.comision / totalComisiones) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={comisionesPorProducto.length}
                />
              </>
            );
          })()}
        </div>
      </Card>
    </div>
  );
}



