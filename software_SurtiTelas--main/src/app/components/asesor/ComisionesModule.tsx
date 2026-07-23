import { useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { TablePagination } from '../ui/table-pagination';
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
        <h1 className="text-2xl font-bold text-gray-900">Mis Comisiones</h1>
        <p className="text-gray-600 mt-1">Seguimiento de tus comisiones y ganancias</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Comisión de Mayo</p>
              <p className="text-2xl font-bold mt-1">$580,000</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600">+12.5%</span>
            <span className="text-gray-500 ml-1">vs mes anterior</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Acumulado</p>
              <p className="text-2xl font-bold mt-1">$2,680,000</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Enero - Mayo 2026</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ventas del Mes</p>
              <p className="text-2xl font-bold mt-1">85</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Total de pedidos</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Próximo Pago</p>
              <p className="text-2xl font-bold mt-1">15 May</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Fecha de liquidación</p>
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
            <Line key="line-comision" type="monotone" dataKey="comision" stroke="#000" strokeWidth={2} />
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
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{item.producto}</p>
                      <p className="text-sm text-gray-600">{item.ventas} ventas</p>
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



