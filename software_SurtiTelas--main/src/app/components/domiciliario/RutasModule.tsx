import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { TablePagination } from '../ui/table-pagination';
import { MapPin, Navigation, Calendar, Clock, Package } from 'lucide-react';

export function RutasModule() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const rutaHoy = {
    fecha: '11 de Mayo, 2026',
    totalParadas: 18,
    completadas: 3,
    distanciaTotal: '48.5 km',
    tiempoEstimado: '8h 30min',
    paradas: [
      {
        orden: 1,
        direccion: 'Calle 123 #45-67, Bogotá',
        cliente: 'Juan Pérez',
        horario: '9:00 AM',
        estado: 'completado',
        pedidoId: 'E001',
      },
      {
        orden: 2,
        direccion: 'Carrera 45 #12-34, Bogotá',
        cliente: 'María González',
        horario: '10:00 AM',
        estado: 'completado',
        pedidoId: 'E002',
      },
      {
        orden: 3,
        direccion: 'Avenida 68 #78-90, Bogotá',
        cliente: 'Carlos López',
        horario: '11:00 AM',
        estado: 'completado',
        pedidoId: 'E003',
      },
      {
        orden: 4,
        direccion: 'Calle 72 #10-20, Bogotá',
        cliente: 'Ana Martínez',
        horario: '12:00 PM',
        estado: 'en-proceso',
        pedidoId: 'E004',
      },
      {
        orden: 5,
        direccion: 'Carrera 15 #30-40, Bogotá',
        cliente: 'Pedro Ramírez',
        horario: '1:00 PM',
        estado: 'pendiente',
        pedidoId: 'E005',
      },
      {
        orden: 6,
        direccion: 'Calle 100 #20-30, Bogotá',
        cliente: 'Laura Castro',
        horario: '2:00 PM',
        estado: 'pendiente',
        pedidoId: 'E006',
      },
      {
        orden: 7,
        direccion: 'Avenida Boyacá #50-60, Bogotá',
        cliente: 'Roberto Díaz',
        horario: '3:00 PM',
        estado: 'pendiente',
        pedidoId: 'E007',
      },
      {
        orden: 8,
        direccion: 'Calle 26 #70-80, Bogotá',
        cliente: 'Sofía Gómez',
        horario: '4:00 PM',
        estado: 'pendiente',
        pedidoId: 'E008',
      },
      {
        orden: 9,
        direccion: 'Carrera 11 #85-95, Bogotá',
        cliente: 'Javier Mendoza',
        horario: '5:00 PM',
        estado: 'pendiente',
        pedidoId: 'E009',
      },
      {
        orden: 10,
        direccion: 'Avenida 82 #40-50, Bogotá',
        cliente: 'Daniela Ríos',
        horario: '5:30 PM',
        estado: 'pendiente',
        pedidoId: 'E010',
      },
      {
        orden: 11,
        direccion: 'Calle 140 #20-30, Bogotá',
        cliente: 'Mateo Cortés',
        horario: '6:00 PM',
        estado: 'pendiente',
        pedidoId: 'E011',
      },
      {
        orden: 12,
        direccion: 'Carrera 28 #65-75, Bogotá',
        cliente: 'Isabella López',
        horario: '6:30 PM',
        estado: 'pendiente',
        pedidoId: 'E012',
      },
      {
        orden: 13,
        direccion: 'Avenida 127 #55-65, Bogotá',
        cliente: 'Sebastián Torres',
        horario: '7:00 PM',
        estado: 'pendiente',
        pedidoId: 'E013',
      },
      {
        orden: 14,
        direccion: 'Calle 94 #18-28, Bogotá',
        cliente: 'Mariana Duque',
        horario: '7:30 PM',
        estado: 'pendiente',
        pedidoId: 'E014',
      },
      {
        orden: 15,
        direccion: 'Carrera 60 #80-90, Bogotá',
        cliente: 'Nicolás Peña',
        horario: '8:00 PM',
        estado: 'pendiente',
        pedidoId: 'E015',
      },
      {
        orden: 16,
        direccion: 'Avenida 170 #30-40, Bogotá',
        cliente: 'Gabriela Muñoz',
        horario: '8:30 PM',
        estado: 'pendiente',
        pedidoId: 'E016',
      },
      {
        orden: 17,
        direccion: 'Calle 63 #25-35, Bogotá',
        cliente: 'Lucas Herrera',
        horario: '9:00 PM',
        estado: 'pendiente',
        pedidoId: 'E017',
      },
      {
        orden: 18,
        direccion: 'Carrera 22 #95-105, Bogotá',
        cliente: 'Valeria Castro',
        horario: '9:30 PM',
        estado: 'pendiente',
        pedidoId: 'E018',
      },
    ],
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <Badge className="bg-green-600">Completado</Badge>;
      case 'en-proceso':
        return <Badge className="bg-blue-600">En Proceso</Badge>;
      case 'pendiente':
        return <Badge variant="outline">Pendiente</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ruta de Hoy</h1>
          <p className="text-gray-600 mt-1">{rutaHoy.fecha}</p>
        </div>
        <Button className="bg-black hover:bg-gray-800">
          <Navigation className="h-4 w-4 mr-2" />
          Abrir en Maps
        </Button>
      </div>

      {/* Resumen de ruta */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Paradas</p>
              <p className="text-2xl font-bold mt-1">{rutaHoy.totalParadas}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completadas</p>
              <p className="text-2xl font-bold mt-1">{rutaHoy.completadas}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Distancia Total</p>
              <p className="text-2xl font-bold mt-1">{rutaHoy.distanciaTotal}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Navigation className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tiempo Estimado</p>
              <p className="text-2xl font-bold mt-1">{rutaHoy.tiempoEstimado}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Barra de progreso */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Progreso de la ruta</p>
          <p className="text-sm text-gray-600">
            {rutaHoy.completadas} de {rutaHoy.totalParadas} completadas
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all"
            style={{ width: `${(rutaHoy.completadas / rutaHoy.totalParadas) * 100}%` }}
          ></div>
        </div>
      </Card>

      {/* Lista de paradas */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Paradas de la Ruta</h2>
        {(() => {
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const paginatedParadas = rutaHoy.paradas.slice(startIndex, endIndex);
          const totalPages = Math.ceil(rutaHoy.paradas.length / itemsPerPage);

          return (
            <>
              {paginatedParadas.map((parada) => (
                <Card
                  key={parada.orden}
                  className={`p-6 ${
                    parada.estado === 'completado'
                      ? 'bg-green-50 border-green-200'
                      : parada.estado === 'en-proceso'
                      ? 'bg-blue-50 border-blue-300'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          parada.estado === 'completado'
                            ? 'bg-green-600 text-white'
                            : parada.estado === 'en-proceso'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {parada.orden}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{parada.cliente}</h3>
                          {getEstadoBadge(parada.estado)}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{parada.direccion}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Horario estimado: {parada.horario}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span>Pedido #{parada.pedidoId}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {parada.estado === 'pendiente' && (
                        <>
                          <Button variant="outline" size="sm">
                            <Navigation className="h-4 w-4 mr-2" />
                            Navegar
                          </Button>
                          <Button size="sm" className="bg-black hover:bg-gray-800">
                            Iniciar
                          </Button>
                        </>
                      )}
                      {parada.estado === 'en-proceso' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Confirmar Entrega
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={rutaHoy.paradas.length}
              />
            </>
          );
        })()}
      </div>
    </div>
  );
}



