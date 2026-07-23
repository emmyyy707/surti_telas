import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { TablePagination } from '../ui/table-pagination';
import { Package, MapPin, Clock, CheckCircle, Phone, Navigation, QrCode } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function EntregasModule() {
  const [currentPagePendientes, setCurrentPagePendientes] = useState(1);
  const [currentPageEnProceso, setCurrentPageEnProceso] = useState(1);
  const [currentPageCompletadas, setCurrentPageCompletadas] = useState(1);
  const itemsPerPage = 10;

  const entregas = {
    pendientes: [
      {
        id: 'E001',
        cliente: 'Juan Pérez',
        direccion: 'Calle 123 #45-67, Bogotá',
        telefono: '3001234567',
        productos: 3,
        valor: 150000,
        horario: '9:00 AM - 12:00 PM',
        prioridad: 'Alta',
      },
      {
        id: 'E002',
        cliente: 'María González',
        direccion: 'Carrera 45 #12-34, Bogotá',
        telefono: '3007654321',
        productos: 2,
        valor: 95000,
        horario: '2:00 PM - 5:00 PM',
        prioridad: 'Normal',
      },
      {
        id: 'E003',
        cliente: 'Carlos López',
        direccion: 'Avenida 68 #78-90, Bogotá',
        telefono: '3009876543',
        productos: 5,
        valor: 220000,
        horario: '9:00 AM - 12:00 PM',
        prioridad: 'Alta',
      },
      {
        id: 'E009',
        cliente: 'Roberto Díaz',
        direccion: 'Calle 45 #23-45, Bogotá',
        telefono: '3006667788',
        productos: 3,
        valor: 130000,
        horario: '10:00 AM - 1:00 PM',
        prioridad: 'Normal',
      },
      {
        id: 'E010',
        cliente: 'Sofía Gómez',
        direccion: 'Carrera 7 #34-56, Bogotá',
        telefono: '3005556677',
        productos: 4,
        valor: 175000,
        horario: '2:00 PM - 5:00 PM',
        prioridad: 'Alta',
      },
      {
        id: 'E011',
        cliente: 'Andrés Ruiz',
        direccion: 'Avenida 19 #12-34, Bogotá',
        telefono: '3004445566',
        productos: 2,
        valor: 90000,
        horario: '9:00 AM - 12:00 PM',
        prioridad: 'Normal',
      },
      {
        id: 'E012',
        cliente: 'Valentina Cruz',
        direccion: 'Calle 80 #40-50, Bogotá',
        telefono: '3003334455',
        productos: 6,
        valor: 260000,
        horario: '11:00 AM - 2:00 PM',
        prioridad: 'Alta',
      },
      {
        id: 'E013',
        cliente: 'Felipe Morales',
        direccion: 'Carrera 30 #60-70, Bogotá',
        telefono: '3002223344',
        productos: 3,
        valor: 145000,
        horario: '3:00 PM - 6:00 PM',
        prioridad: 'Normal',
      },
      {
        id: 'E014',
        cliente: 'Camila Ortiz',
        direccion: 'Avenida 15 #25-35, Bogotá',
        telefono: '3001112233',
        productos: 5,
        valor: 200000,
        horario: '9:00 AM - 12:00 PM',
        prioridad: 'Alta',
      },
      {
        id: 'E015',
        cliente: 'Diego Vargas',
        direccion: 'Calle 53 #18-28, Bogotá',
        telefono: '3009991122',
        productos: 2,
        valor: 85000,
        horario: '1:00 PM - 4:00 PM',
        prioridad: 'Normal',
      },
      {
        id: 'E016',
        cliente: 'Laura Mendoza',
        direccion: 'Carrera 50 #70-80, Bogotá',
        telefono: '3008880011',
        productos: 4,
        valor: 180000,
        horario: '10:00 AM - 1:00 PM',
        prioridad: 'Normal',
      },
      {
        id: 'E017',
        cliente: 'Miguel Rojas',
        direccion: 'Avenida 24 #45-55, Bogotá',
        telefono: '3007779900',
        productos: 7,
        valor: 295000,
        horario: '2:00 PM - 5:00 PM',
        prioridad: 'Alta',
      },
      {
        id: 'E018',
        cliente: 'Carolina Silva',
        direccion: 'Calle 116 #30-40, Bogotá',
        telefono: '3006668899',
        productos: 3,
        valor: 125000,
        horario: '9:00 AM - 12:00 PM',
        prioridad: 'Normal',
      },
    ],
    enProceso: [
      {
        id: 'E004',
        cliente: 'Ana Martínez',
        direccion: 'Calle 72 #10-20, Bogotá',
        telefono: '3005551234',
        productos: 1,
        valor: 45000,
        horario: '10:00 AM - 1:00 PM',
        iniciada: '10:30 AM',
      },
      {
        id: 'E019',
        cliente: 'Pablo Jiménez',
        direccion: 'Carrera 13 #50-60, Bogotá',
        telefono: '3005554321',
        productos: 2,
        valor: 95000,
        horario: '11:00 AM - 2:00 PM',
        iniciada: '11:15 AM',
      },
      {
        id: 'E020',
        cliente: 'Natalia Sánchez',
        direccion: 'Avenida 9 #20-30, Bogotá',
        telefono: '3004443210',
        productos: 3,
        valor: 140000,
        horario: '12:00 PM - 3:00 PM',
        iniciada: '12:20 PM',
      },
    ],
    completadas: [
      {
        id: 'E005',
        cliente: 'Pedro Ramírez',
        direccion: 'Carrera 15 #30-40, Bogotá',
        telefono: '3004567890',
        productos: 2,
        valor: 85000,
        horaEntrega: '11:45 AM',
        firma: true,
      },
      {
        id: 'E006',
        cliente: 'Laura Castro',
        direccion: 'Calle 100 #20-30, Bogotá',
        telefono: '3003334455',
        productos: 4,
        valor: 180000,
        horaEntrega: '9:15 AM',
        firma: true,
      },
      {
        id: 'E007',
        cliente: 'Javier Pardo',
        direccion: 'Carrera 20 #35-45, Bogotá',
        telefono: '3002221111',
        productos: 3,
        valor: 135000,
        horaEntrega: '8:45 AM',
        firma: true,
      },
      {
        id: 'E008',
        cliente: 'Daniela Ríos',
        direccion: 'Avenida 30 #40-50, Bogotá',
        telefono: '3001110000',
        productos: 5,
        valor: 225000,
        horaEntrega: '10:30 AM',
        firma: true,
      },
      {
        id: 'E021',
        cliente: 'Mateo Cortés',
        direccion: 'Calle 85 #15-25, Bogotá',
        telefono: '3009998888',
        productos: 2,
        valor: 98000,
        horaEntrega: '8:20 AM',
        firma: true,
      },
      {
        id: 'E022',
        cliente: 'Isabella López',
        direccion: 'Carrera 25 #60-70, Bogotá',
        telefono: '3008887777',
        productos: 4,
        valor: 165000,
        horaEntrega: '9:50 AM',
        firma: true,
      },
      {
        id: 'E023',
        cliente: 'Sebastián Torres',
        direccion: 'Avenida 40 #30-40, Bogotá',
        telefono: '3007776666',
        productos: 6,
        valor: 280000,
        horaEntrega: '10:10 AM',
        firma: true,
      },
      {
        id: 'E024',
        cliente: 'Mariana Duque',
        direccion: 'Calle 127 #45-55, Bogotá',
        telefono: '3006665555',
        productos: 3,
        valor: 142000,
        horaEntrega: '8:35 AM',
        firma: true,
      },
      {
        id: 'E025',
        cliente: 'Nicolás Peña',
        direccion: 'Carrera 35 #80-90, Bogotá',
        telefono: '3005554444',
        productos: 2,
        valor: 92000,
        horaEntrega: '11:25 AM',
        firma: true,
      },
      {
        id: 'E026',
        cliente: 'Gabriela Muñoz',
        direccion: 'Avenida 50 #25-35, Bogotá',
        telefono: '3004443333',
        productos: 5,
        valor: 215000,
        horaEntrega: '9:05 AM',
        firma: true,
      },
      {
        id: 'E027',
        cliente: 'Lucas Herrera',
        direccion: 'Calle 60 #18-28, Bogotá',
        telefono: '3003332222',
        productos: 4,
        valor: 178000,
        horaEntrega: '10:45 AM',
        firma: true,
      },
      {
        id: 'E028',
        cliente: 'Valeria Castro',
        direccion: 'Carrera 45 #70-80, Bogotá',
        telefono: '3002221111',
        productos: 3,
        valor: 128000,
        horaEntrega: '8:55 AM',
        firma: true,
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Entregas</h1>
        <p className="text-gray-600 mt-1">Gestiona tus entregas del día</p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-orange-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700">Pendientes</p>
              <p className="text-3xl font-bold mt-1 text-orange-900">{entregas.pendientes.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-200 flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-700" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">En Proceso</p>
              <p className="text-3xl font-bold mt-1 text-blue-900">{entregas.enProceso.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-700" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Completadas</p>
              <p className="text-3xl font-bold mt-1 text-green-900">{entregas.completadas.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-700" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs de entregas */}
      <Tabs defaultValue="pendientes">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
          <TabsTrigger value="en-proceso">En Proceso</TabsTrigger>
          <TabsTrigger value="completadas">Completadas</TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="space-y-4 mt-6">
          {(() => {
            const startIndex = (currentPagePendientes - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedPendientes = entregas.pendientes.slice(startIndex, endIndex);
            const totalPages = Math.ceil(entregas.pendientes.length / itemsPerPage);

            return (
              <>
                {paginatedPendientes.map((entrega) => (
                  <Card key={entrega.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold">
                          {entrega.cliente.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{entrega.cliente}</h3>
                            <Badge variant={entrega.prioridad === 'Alta' ? 'destructive' : 'secondary'}>
                              {entrega.prioridad}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Pedido #{entrega.id}</p>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span>{entrega.direccion}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{entrega.telefono}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{entrega.horario}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-xl font-bold">${entrega.valor.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 mt-1">{entrega.productos} productos</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t">
                      <Button variant="outline" className="flex-1">
                        <Navigation className="h-4 w-4 mr-2" />
                        Ver Ruta
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Phone className="h-4 w-4 mr-2" />
                        Llamar
                      </Button>
                      <Button className="flex-1 bg-black hover:bg-gray-800">
                        Iniciar Entrega
                      </Button>
                    </div>
                  </Card>
                ))}
                <TablePagination
                  currentPage={currentPagePendientes}
                  totalPages={totalPages}
                  onPageChange={setCurrentPagePendientes}
                  itemsPerPage={itemsPerPage}
                  totalItems={entregas.pendientes.length}
                />
              </>
            );
          })()}
        </TabsContent>

        <TabsContent value="en-proceso" className="space-y-4 mt-6">
          {(() => {
            const startIndex = (currentPageEnProceso - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedEnProceso = entregas.enProceso.slice(startIndex, endIndex);
            const totalPages = Math.ceil(entregas.enProceso.length / itemsPerPage);

            return (
              <>
                {paginatedEnProceso.map((entrega) => (
                  <Card key={entrega.id} className="p-6 border-blue-300 bg-blue-50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                          {entrega.cliente.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{entrega.cliente}</h3>
                            <Badge className="bg-blue-600">En Camino</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Pedido #{entrega.id} • Iniciada: {entrega.iniciada}</p>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span>{entrega.direccion}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{entrega.telefono}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-xl font-bold">${entrega.valor.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 mt-1">{entrega.productos} productos</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-blue-200">
                      <Button variant="outline" className="flex-1">
                        <Phone className="h-4 w-4 mr-2" />
                        Llamar
                      </Button>
                      <Button className="flex-1 bg-green-600 hover:bg-green-700">
                        <QrCode className="h-4 w-4 mr-2" />
                        Confirmar Entrega
                      </Button>
                    </div>
                  </Card>
                ))}
                <TablePagination
                  currentPage={currentPageEnProceso}
                  totalPages={totalPages}
                  onPageChange={setCurrentPageEnProceso}
                  itemsPerPage={itemsPerPage}
                  totalItems={entregas.enProceso.length}
                />
              </>
            );
          })()}
        </TabsContent>

        <TabsContent value="completadas" className="space-y-4 mt-6">
          {(() => {
            const startIndex = (currentPageCompletadas - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedCompletadas = entregas.completadas.slice(startIndex, endIndex);
            const totalPages = Math.ceil(entregas.completadas.length / itemsPerPage);

            return (
              <>
                {paginatedCompletadas.map((entrega) => (
                  <Card key={entrega.id} className="p-6 border-green-300 bg-green-50">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-600 text-white flex items-center justify-center">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{entrega.cliente}</h3>
                            <Badge className="bg-green-600">Entregado</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Pedido #{entrega.id} • Entregado: {entrega.horaEntrega}
                          </p>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span>{entrega.direccion}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-700">${entrega.valor.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 mt-1">{entrega.productos} productos</p>
                        {entrega.firma && (
                          <Badge variant="outline" className="mt-2">
                            âœ“ Con firma
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                <TablePagination
                  currentPage={currentPageCompletadas}
                  totalPages={totalPages}
                  onPageChange={setCurrentPageCompletadas}
                  itemsPerPage={itemsPerPage}
                  totalItems={entregas.completadas.length}
                />
              </>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
}



