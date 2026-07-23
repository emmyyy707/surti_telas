import { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { TablePagination } from '../../components/ui/table-pagination';
import { Search, UserPlus, Phone, Mail, MapPin, Calendar } from 'lucide-react';

export function MisClientesModule() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const clientes = [
    {
      id: '1',
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      telefono: '3001234567',
      ciudad: 'Bogotá',
      pedidos: 12,
      ultimaCompra: '2026-05-05',
      estado: 'Activo',
    },
    {
      id: '2',
      nombre: 'Mará González',
      email: 'maria@example.com',
      telefono: '3007654321',
      ciudad: 'Medellón',
      pedidos: 8,
      ultimaCompra: '2026-05-08',
      estado: 'Activo',
    },
    {
      id: '3',
      nombre: 'Carlos Rodróguez',
      email: 'carlos@example.com',
      telefono: '3009876543',
      ciudad: 'Cali',
      pedidos: 15,
      ultimaCompra: '2026-05-10',
      estado: 'Activo',
    },
    {
      id: '4',
      nombre: 'Ana Martónez',
      email: 'ana@example.com',
      telefono: '3005551234',
      ciudad: 'Cartagena',
      pedidos: 20,
      ultimaCompra: '2026-05-12',
      estado: 'Activo',
    },
    {
      id: '5',
      nombre: 'Pedro López',
      email: 'pedro@example.com',
      telefono: '3004445566',
      ciudad: 'Barranquilla',
      pedidos: 5,
      ultimaCompra: '2026-05-11',
      estado: 'Activo',
    },
    {
      id: '6',
      nombre: 'Laura Ramírez',
      email: 'laura@example.com',
      telefono: '3003332211',
      ciudad: 'Bucaramanga',
      pedidos: 18,
      ultimaCompra: '2026-05-14',
      estado: 'Activo',
    },
    {
      id: '7',
      nombre: 'Diego Castro',
      email: 'diego@example.com',
      telefono: '3002221100',
      ciudad: 'Pereira',
      pedidos: 10,
      ultimaCompra: '2026-05-09',
      estado: 'Activo',
    },
    {
      id: '8',
      nombre: 'Sofá Herrera',
      email: 'sofia@example.com',
      telefono: '3001110099',
      ciudad: 'Manizales',
      pedidos: 7,
      ultimaCompra: '2026-05-13',
      estado: 'Activo',
    },
    {
      id: '9',
      nombre: 'Miguel Torres',
      email: 'miguel@example.com',
      telefono: '3009998877',
      ciudad: 'Santa Marta',
      pedidos: 14,
      ultimaCompra: '2026-05-07',
      estado: 'Activo',
    },
    {
      id: '10',
      nombre: 'Carolina Díaz',
      email: 'carolina@example.com',
      telefono: '3008887766',
      ciudad: 'Cócuta',
      pedidos: 9,
      ultimaCompra: '2026-05-15',
      estado: 'Activo',
    },
    {
      id: '11',
      nombre: 'Roberto Vargas',
      email: 'roberto@example.com',
      telefono: '3007776655',
      ciudad: 'Ibaguó',
      pedidos: 16,
      ultimaCompra: '2026-05-06',
      estado: 'Activo',
    },
    {
      id: '12',
      nombre: 'Valentina Moreno',
      email: 'valentina@example.com',
      telefono: '3006665544',
      ciudad: 'Pasto',
      pedidos: 11,
      ultimaCompra: '2026-05-16',
      estado: 'Activo',
    },
    {
      id: '13',
      nombre: 'Andrós Suórez',
      email: 'andres@example.com',
      telefono: '3005554433',
      ciudad: 'Villavicencio',
      pedidos: 13,
      ultimaCompra: '2026-05-04',
      estado: 'Activo',
    },
    {
      id: '14',
      nombre: 'Camila Restrepo',
      email: 'camila@example.com',
      telefono: '3004443322',
      ciudad: 'Armenia',
      pedidos: 6,
      ultimaCompra: '2026-05-17',
      estado: 'Activo',
    },
    {
      id: '15',
      nombre: 'Felipe Gómez',
      email: 'felipe@example.com',
      telefono: '3003332211',
      ciudad: 'Popayón',
      pedidos: 19,
      ultimaCompra: '2026-05-03',
      estado: 'Activo',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Mis Clientes</h1>
          <p className="text-[var(--text-secondary)] mt-1">Gestiona tus clientes asignados</p>
        </div>
        <Button className="bg-black hover:bg-gray-800">
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar cliente..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">Filtrar</Button>
        </div>
      </Card>

      {/* Lista de clientes */}
      <div className="grid gap-4">
        {(() => {
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const paginatedClientes = clientes.slice(startIndex, endIndex);
          const totalPages = Math.ceil(clientes.length / itemsPerPage);

          return (
            <>
              {paginatedClientes.map((cliente) => (
                <Card key={cliente.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-full bg-gray-900 text-white flex items-center justify-center text-lg font-semibold">
                        {cliente.nombre.charAt(0)}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold text-lg">{cliente.nombre}</h3>
                          <Badge className="mt-1">{cliente.estado}</Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-[var(--text-secondary)]">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {cliente.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {cliente.telefono}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {cliente.ciudad}
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div>
                            <span className="text-[var(--text-secondary)]">Total pedidos:</span>
                            <span className="font-semibold ml-1">{cliente.pedidos}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-[var(--text-secondary)]">Última compra:</span>
                            <span className="font-semibold ml-1">{cliente.ultimaCompra}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Ver Detalles</Button>
                      <Button variant="outline" size="sm">Contactar</Button>
                    </div>
                  </div>
                </Card>
              ))}
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={clientes.length}
              />
            </>
          );
        })()}
      </div>
    </div>
  );
}



