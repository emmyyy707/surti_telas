import { useState } from 'react';
import {
  Factory,
  MapPin,
  ClipboardList,
  TrendingUp,
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Scissors,
  Shirt,
  Palette,
  PackageCheck,
  ArrowRight,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { TablePagination } from '../../components/ui/table-pagination';

interface ProduccionModuleProps {
  activeTab: string;
}

interface Taller {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  direccion: string;
  estado: 'activo' | 'inactivo';
  especialidad: string;
}

interface AsignacionProduccion {
  id: string;
  taller: string;
  pedido: string;
  producto: string;
  cantidad: number;
  fechaAsignacion: string;
  fechaEntregaEstimada: string;
  estado: 'asignado' | 'en_produccion' | 'completado';
  etapaKanban?: 'corte' | 'confeccion' | 'estampado' | 'finalizado';
}

interface ControlPrendas {
  id: string;
  taller: string;
  pedido: string;
  prendasEntregadas: number;
  prendasRecibidas: number;
  prendasDefectuosas: number;
  fechaEntrega: string;
  fechaRecepcion: string;
  estado: 'entregado' | 'en_taller' | 'recibido' | 'con_observaciones';
}

export function ProduccionModule({ activeTab }: ProduccionModuleProps) {
  // Determinar el tab activo basado en activeTab
  const getCurrentTab = () => {
    if (activeTab === 'kanban' || activeTab === 'flujo-kanban') return 'kanban';
    if (activeTab === 'asignacion-produccion' || activeTab === 'asignacion') return 'asignacion';
    if (activeTab === 'seguimiento-produccion' || activeTab === 'seguimiento') return 'seguimiento';
    if (activeTab === 'control-prendas' || activeTab === 'control') return 'control';
    return 'talleres';
  };

  const [talleres, setTalleres] = useState<Taller[]>([
    { id: '1', nombre: 'Confecciones El Roble', contacto: 'Pedro Martónez', telefono: '555-2001', direccion: 'Calle 15 #45-67', estado: 'activo', especialidad: 'Camisetas bósicas' },
    { id: '2', nombre: 'Taller Textil Express', contacto: 'Laura Gómez', telefono: '555-2002', direccion: 'Av. Principal #123', estado: 'activo', especialidad: 'Personalización' },
    { id: '3', nombre: 'Confecciones del Valle', contacto: 'Ricardo Torres', telefono: '555-2003', direccion: 'Calle 8 #34-21', estado: 'activo', especialidad: 'Polos y deportivas' },
    { id: '4', nombre: 'Taller San Josó', contacto: 'Carmen Ruiz', telefono: '555-2004', direccion: 'Carrera 10 #78-90', estado: 'inactivo', especialidad: 'Infantiles' },
    { id: '5', nombre: 'Moda y Estilo', contacto: 'Andrós López', telefono: '555-2005', direccion: 'Calle 25 #10-15', estado: 'activo', especialidad: 'Camisetas premium' },
    { id: '6', nombre: 'Taller La Costura', contacto: 'Mará Sónchez', telefono: '555-2006', direccion: 'Av. Norte #50-30', estado: 'activo', especialidad: 'Bordados' },
    { id: '7', nombre: 'Confecciones Rópidas', contacto: 'Jorge Ramírez', telefono: '555-2007', direccion: 'Carrera 5 #20-40', estado: 'activo', especialidad: 'Producción masiva' },
    { id: '8', nombre: 'Taller Artesanal', contacto: 'Diana Castro', telefono: '555-2008', direccion: 'Calle 40 #15-25', estado: 'activo', especialidad: 'Diseños ónicos' },
    { id: '9', nombre: 'Industrias Textiles', contacto: 'Roberto Díaz', telefono: '555-2009', direccion: 'Zona Industrial #100', estado: 'activo', especialidad: 'Todo tipo' },
    { id: '10', nombre: 'Taller Creativo', contacto: 'Patricia Morales', telefono: '555-2010', direccion: 'Calle 12 #30-50', estado: 'inactivo', especialidad: 'Estampados' },
    { id: '11', nombre: 'Confecciones del Norte', contacto: 'Luis Hernñdez', telefono: '555-2011', direccion: 'Av. Central #80-90', estado: 'activo', especialidad: 'Deportivas' },
    { id: '12', nombre: 'Taller Moderno', contacto: 'Sandra Vargas', telefono: '555-2012', direccion: 'Carrera 20 #45-55', estado: 'activo', especialidad: 'Diseáo moderno' },
    { id: '13', nombre: 'La Aguja de Oro', contacto: 'Fernando Ruiz', telefono: '555-2013', direccion: 'Calle 30 #25-35', estado: 'activo', especialidad: 'Alta costura' },
    { id: '14', nombre: 'Taller Express 24h', contacto: 'Carolina Jimónez', telefono: '555-2014', direccion: 'Av. Sur #60-70', estado: 'activo', especialidad: 'Urgencias' },
    { id: '15', nombre: 'Confecciones Premium', contacto: 'Miguel óngel Ríos', telefono: '555-2015', direccion: 'Calle 50 #18-28', estado: 'activo', especialidad: 'Lujo' },
  ]);

  const [asignaciones, setAsignaciones] = useState<AsignacionProduccion[]>([
    { id: '1', taller: 'Confecciones El Roble', pedido: 'PED-001', producto: 'Camiseta Bósica Blanca', cantidad: 100, fechaAsignacion: '2024-12-08', fechaEntregaEstimada: '2024-12-15', estado: 'en_produccion', etapaKanban: 'confeccion' },
    { id: '2', taller: 'Taller Textil Express', pedido: 'PED-002', producto: 'Camiseta Estampada Logo', cantidad: 50, fechaAsignacion: '2024-12-09', fechaEntregaEstimada: '2024-12-16', estado: 'asignado', etapaKanban: 'estampado' },
    { id: '3', taller: 'Confecciones del Valle', pedido: 'PED-003', producto: 'Camiseta Polo Azul', cantidad: 75, fechaAsignacion: '2024-12-05', fechaEntregaEstimada: '2024-12-12', estado: 'completado', etapaKanban: 'finalizado' },
    { id: '4', taller: 'Confecciones El Roble', pedido: 'PED-004', producto: 'Camiseta Deportiva', cantidad: 60, fechaAsignacion: '2024-12-10', fechaEntregaEstimada: '2024-12-17', estado: 'asignado', etapaKanban: 'corte' },
    { id: '5', taller: 'Taller Textil Express', pedido: 'PED-005', producto: 'Camiseta Cuello V', cantidad: 80, fechaAsignacion: '2024-12-11', fechaEntregaEstimada: '2024-12-18', estado: 'en_produccion', etapaKanban: 'confeccion' },
    { id: '6', taller: 'Confecciones del Valle', pedido: 'PED-006', producto: 'Camiseta Manga Larga', cantidad: 45, fechaAsignacion: '2024-12-12', fechaEntregaEstimada: '2024-12-19', estado: 'asignado', etapaKanban: 'corte' },
    { id: '7', taller: 'Moda y Estilo', pedido: 'PED-007', producto: 'Camiseta Premium Negra', cantidad: 70, fechaAsignacion: '2024-12-13', fechaEntregaEstimada: '2024-12-20', estado: 'en_produccion', etapaKanban: 'confeccion' },
    { id: '8', taller: 'Taller La Costura', pedido: 'PED-008', producto: 'Camiseta Bordada', cantidad: 30, fechaAsignacion: '2024-12-14', fechaEntregaEstimada: '2024-12-21', estado: 'asignado', etapaKanban: 'estampado' },
    { id: '9', taller: 'Confecciones Rópidas', pedido: 'PED-009', producto: 'Camiseta Bósica Azul', cantidad: 150, fechaAsignacion: '2024-12-06', fechaEntregaEstimada: '2024-12-13', estado: 'completado', etapaKanban: 'finalizado' },
    { id: '10', taller: 'Taller Artesanal', pedido: 'PED-010', producto: 'Camiseta Diseáo ónico', cantidad: 20, fechaAsignacion: '2024-12-15', fechaEntregaEstimada: '2024-12-22', estado: 'asignado', etapaKanban: 'corte' },
    { id: '11', taller: 'Industrias Textiles', pedido: 'PED-011', producto: 'Camiseta Industrial', cantidad: 200, fechaAsignacion: '2024-12-07', fechaEntregaEstimada: '2024-12-14', estado: 'completado', etapaKanban: 'finalizado' },
    { id: '12', taller: 'Confecciones del Norte', pedido: 'PED-012', producto: 'Camiseta Deportiva Roja', cantidad: 90, fechaAsignacion: '2024-12-16', fechaEntregaEstimada: '2024-12-23', estado: 'en_produccion', etapaKanban: 'confeccion' },
    { id: '13', taller: 'Taller Moderno', pedido: 'PED-013', producto: 'Camiseta Moderna', cantidad: 55, fechaAsignacion: '2024-12-17', fechaEntregaEstimada: '2024-12-24', estado: 'asignado', etapaKanban: 'corte' },
    { id: '14', taller: 'La Aguja de Oro', pedido: 'PED-014', producto: 'Camiseta Alta Costura', cantidad: 15, fechaAsignacion: '2024-12-18', fechaEntregaEstimada: '2024-12-25', estado: 'asignado', etapaKanban: 'corte' },
    { id: '15', taller: 'Taller Express 24h', pedido: 'PED-015', producto: 'Camiseta Urgente', cantidad: 40, fechaAsignacion: '2024-12-19', fechaEntregaEstimada: '2024-12-20', estado: 'en_produccion', etapaKanban: 'confeccion' },
  ]);

  const [controlPrendas, setControlPrendas] = useState<ControlPrendas[]>([
    { id: '1', taller: 'Confecciones El Roble', pedido: 'PED-001', prendasEntregadas: 100, prendasRecibidas: 98, prendasDefectuosas: 2, fechaEntrega: '2024-12-08', fechaRecepcion: '2024-12-15', estado: 'con_observaciones' },
    { id: '2', taller: 'Confecciones del Valle', pedido: 'PED-003', prendasEntregadas: 75, prendasRecibidas: 75, prendasDefectuosas: 0, fechaEntrega: '2024-12-05', fechaRecepcion: '2024-12-12', estado: 'recibido' },
    { id: '3', taller: 'Taller Textil Express', pedido: 'PED-005', prendasEntregadas: 50, prendasRecibidas: 0, prendasDefectuosas: 0, fechaEntrega: '2024-12-09', fechaRecepcion: '-', estado: 'en_taller' },
    { id: '4', taller: 'Moda y Estilo', pedido: 'PED-007', prendasEntregadas: 70, prendasRecibidas: 70, prendasDefectuosas: 0, fechaEntrega: '2024-12-13', fechaRecepcion: '2024-12-20', estado: 'recibido' },
    { id: '5', taller: 'Confecciones Rópidas', pedido: 'PED-009', prendasEntregadas: 150, prendasRecibidas: 148, prendasDefectuosas: 2, fechaEntrega: '2024-12-06', fechaRecepcion: '2024-12-13', estado: 'con_observaciones' },
    { id: '6', taller: 'Industrias Textiles', pedido: 'PED-011', prendasEntregadas: 200, prendasRecibidas: 200, prendasDefectuosas: 0, fechaEntrega: '2024-12-07', fechaRecepcion: '2024-12-14', estado: 'recibido' },
    { id: '7', taller: 'Confecciones del Norte', pedido: 'PED-012', prendasEntregadas: 90, prendasRecibidas: 0, prendasDefectuosas: 0, fechaEntrega: '2024-12-16', fechaRecepcion: '-', estado: 'en_taller' },
    { id: '8', taller: 'Taller Moderno', pedido: 'PED-013', prendasEntregadas: 55, prendasRecibidas: 0, prendasDefectuosas: 0, fechaEntrega: '2024-12-17', fechaRecepcion: '-', estado: 'en_taller' },
    { id: '9', taller: 'La Aguja de Oro', pedido: 'PED-014', prendasEntregadas: 15, prendasRecibidas: 15, prendasDefectuosas: 0, fechaEntrega: '2024-12-18', fechaRecepcion: '2024-12-25', estado: 'recibido' },
    { id: '10', taller: 'Taller Express 24h', pedido: 'PED-015', prendasEntregadas: 40, prendasRecibidas: 39, prendasDefectuosas: 1, fechaEntrega: '2024-12-19', fechaRecepcion: '2024-12-20', estado: 'con_observaciones' },
    { id: '11', taller: 'Taller Artesanal', pedido: 'PED-010', prendasEntregadas: 20, prendasRecibidas: 0, prendasDefectuosas: 0, fechaEntrega: '2024-12-15', fechaRecepcion: '-', estado: 'en_taller' },
    { id: '12', taller: 'Taller La Costura', pedido: 'PED-008', prendasEntregadas: 30, prendasRecibidas: 30, prendasDefectuosas: 0, fechaEntrega: '2024-12-14', fechaRecepcion: '2024-12-21', estado: 'recibido' },
    { id: '13', taller: 'Confecciones El Roble', pedido: 'PED-004', prendasEntregadas: 60, prendasRecibidas: 0, prendasDefectuosas: 0, fechaEntrega: '2024-12-10', fechaRecepcion: '-', estado: 'entregado' },
    { id: '14', taller: 'Confecciones del Valle', pedido: 'PED-006', prendasEntregadas: 45, prendasRecibidas: 0, prendasDefectuosas: 0, fechaEntrega: '2024-12-12', fechaRecepcion: '-', estado: 'entregado' },
    { id: '15', taller: 'Confecciones Premium', pedido: 'PED-016', prendasEntregadas: 25, prendasRecibidas: 25, prendasDefectuosas: 0, fechaEntrega: '2024-12-20', fechaRecepcion: '2024-12-27', estado: 'recibido' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPageTalleres, setCurrentPageTalleres] = useState(1);
  const [itemsPerPageTalleres] = useState(10);
  const [currentPageAsignacion, setCurrentPageAsignacion] = useState(1);
  const [itemsPerPageAsignacion] = useState(10);
  const [currentPageControl, setCurrentPageControl] = useState(1);
  const [itemsPerPageControl] = useState(10);

  const talleresRegistrados = talleres.length;
  const ordenesActivas = asignaciones.filter(a => a.estado !== 'completado').length;
  const produccionMes = asignaciones.reduce((sum, a) => sum + a.cantidad, 0);
  const prendasEntregadas = controlPrendas.reduce((sum, c) => sum + c.prendasEntregadas, 0);

  const getEstadoBadge = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activo':
      case 'completado':
      case 'recibido':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completado</Badge>;
      case 'en_produccion':
      case 'en_taller':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">En proceso</Badge>;
      case 'asignado':
      case 'entregado':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Asignado</Badge>;
      case 'con_observaciones':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Con observaciones</Badge>;
      case 'inactivo':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactivo</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Producción en Talleres Externos</h1>
        <p className="text-gray-600 mt-1">Gestión de talleres, asignación y control de producción</p>
      </div>

      {/* Cards superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Factory className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{talleresRegistrados}</p>
              <p className="text-sm text-gray-600">Talleres registrados</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{ordenesActivas}</p>
              <p className="text-sm text-gray-600">órdenes activas</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{produccionMes}</p>
              <p className="text-sm text-gray-600">Producción del mes</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{prendasEntregadas}</p>
              <p className="text-sm text-gray-600">Prendas entregadas</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={getCurrentTab()} className="space-y-6">
        <TabsList className="bg-white p-2 rounded-lg shadow-sm flex flex-col sm:flex-row h-auto gap-2 w-full sm:w-auto">
          <TabsTrigger value="talleres" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <Factory className="h-4 w-4 mr-2" />
            <span>Registro de talleres</span>
          </TabsTrigger>
          <TabsTrigger value="asignacion" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <ClipboardList className="h-4 w-4 mr-2" />
            <span>Asignación de producción</span>
          </TabsTrigger>
          <TabsTrigger value="seguimiento" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            <span>Seguimiento de producción</span>
          </TabsTrigger>
          <TabsTrigger value="control" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <Package className="h-4 w-4 mr-2" />
            <span>Control de prendas</span>
          </TabsTrigger>
          <TabsTrigger value="kanban" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <Scissors className="h-4 w-4 mr-2" />
            <span>Flujo Kanban</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Registro de talleres */}
        <TabsContent value="talleres" className="space-y-6">
          <Card className="p-4 bg-white rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar talleres..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button className="bg-gray-900 hover:bg-gray-800 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Taller
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Taller</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Contacto</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Teléfono</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Dirección</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Especialidad</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filtered = talleres.filter(t => t.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
                    const startIndex = (currentPageTalleres - 1) * itemsPerPageTalleres;
                    const endIndex = startIndex + itemsPerPageTalleres;
                    const paginated = filtered.slice(startIndex, endIndex);
                    return paginated.map((taller) => (
                      <tr key={taller.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Factory className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">{taller.nombre}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700">{taller.contacto}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">{taller.telefono}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {taller.direccion}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">{taller.especialidad}</Badge>
                        </td>
                        <td className="py-4 px-4">{getEstadoBadge(taller.estado)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            <TablePagination
              currentPage={currentPageTalleres}
              totalItems={talleres.filter(t => t.nombre.toLowerCase().includes(searchTerm.toLowerCase())).length}
              itemsPerPage={itemsPerPageTalleres}
              onPageChange={setCurrentPageTalleres}
            />
          </Card>
        </TabsContent>

        {/* Tab: Asignación de producción */}
        <TabsContent value="asignacion" className="space-y-6">
          <Card className="p-4 bg-white rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar asignaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button className="bg-gray-900 hover:bg-gray-800 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Asignación
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Pedido</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Taller Asignado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Producto</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cantidad</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha Asignación</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Entrega Estimada</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const startIndex = (currentPageAsignacion - 1) * itemsPerPageAsignacion;
                    const endIndex = startIndex + itemsPerPageAsignacion;
                    const paginated = asignaciones.slice(startIndex, endIndex);
                    return paginated.map((asignacion) => (
                    <tr key={asignacion.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{asignacion.pedido}</td>
                      <td className="py-4 px-4 text-sm text-gray-700">{asignacion.taller}</td>
                      <td className="py-4 px-4 text-sm text-gray-700">{asignacion.producto}</td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">{asignacion.cantidad}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{asignacion.fechaAsignacion}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{asignacion.fechaEntregaEstimada}</td>
                      <td className="py-4 px-4">{getEstadoBadge(asignacion.estado)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
                </tbody>
              </table>
            </div>
            <TablePagination
              currentPage={currentPageAsignacion}
              totalItems={asignaciones.length}
              itemsPerPage={itemsPerPageAsignacion}
              onPageChange={setCurrentPageAsignacion}
            />
          </Card>
        </TabsContent>

        {/* Tab: Seguimiento de producción */}
        <TabsContent value="seguimiento" className="space-y-6">
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Estado de Producción en Tiempo Real</h3>
            <div className="space-y-4">
              {asignaciones.map((asignacion) => (
                <div key={asignacion.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Factory className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{asignacion.pedido} - {asignacion.producto}</p>
                        <p className="text-sm text-gray-600">{asignacion.taller}</p>
                      </div>
                    </div>
                    {getEstadoBadge(asignacion.estado)}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Cantidad</p>
                      <p className="font-medium text-gray-900">{asignacion.cantidad} unidades</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Fecha de asignación</p>
                      <p className="font-medium text-gray-900">{asignacion.fechaAsignacion}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Entrega estimada</p>
                      <p className="font-medium text-gray-900">{asignacion.fechaEntregaEstimada}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Tab: Control de prendas */}
        <TabsContent value="control" className="space-y-6">
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Pedido</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Taller</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Prendas Entregadas</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Prendas Recibidas</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Defectuosas</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha Entrega</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha Recepción</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const startIndex = (currentPageControl - 1) * itemsPerPageControl;
                    const endIndex = startIndex + itemsPerPageControl;
                    const paginated = controlPrendas.slice(startIndex, endIndex);
                    return paginated.map((control) => (
                    <tr key={control.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{control.pedido}</td>
                      <td className="py-4 px-4 text-sm text-gray-700">{control.taller}</td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">{control.prendasEntregadas}</td>
                      <td className="py-4 px-4 text-sm font-medium text-green-600">{control.prendasRecibidas}</td>
                      <td className="py-4 px-4 text-sm font-medium text-red-600">{control.prendasDefectuosas}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{control.fechaEntrega}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{control.fechaRecepcion}</td>
                      <td className="py-4 px-4">{getEstadoBadge(control.estado)}</td>
                    </tr>
                  ));
                })()}
                </tbody>
              </table>
            </div>
            <TablePagination
              currentPage={currentPageControl}
              totalItems={controlPrendas.length}
              itemsPerPage={itemsPerPageControl}
              onPageChange={setCurrentPageControl}
            />
          </Card>
        </TabsContent>

        {/* Tab: Flujo Kanban */}
        <TabsContent value="kanban" className="space-y-6">
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>?? Tip:</strong> Arrastra y suelta las tarjetas entre columnas para actualizar el estado de producción en tiempo real.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Columna: Corte */}
            <Card className="bg-gray-50">
              <div className="p-4 border-b bg-white">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Scissors className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Corte</h3>
                    <p className="text-xs text-gray-600">
                      {asignaciones.filter(a => a.etapaKanban === 'corte').length} pedidos
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3 min-h-[400px]">
                {asignaciones
                  .filter(a => a.etapaKanban === 'corte')
                  .map((asignacion) => (
                    <Card 
                      key={asignacion.id} 
                      className="p-4 bg-white hover:shadow-md transition-all cursor-move border-l-4 border-l-blue-500 group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900 text-sm">{asignacion.pedido}</span>
                          <Badge className="bg-blue-100 text-blue-800 text-xs">Corte</Badge>
                        </div>
                        <p className="text-sm text-gray-700 font-medium">{asignacion.producto}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Factory className="h-3 w-3" />
                          <span>{asignacion.taller}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs font-semibold text-gray-900">{asignacion.cantidad} uds</span>
                          <span className="text-xs text-gray-500">{asignacion.fechaEntregaEstimada}</span>
                        </div>
                        <div className="hidden group-hover:flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-7 text-xs"
                            onClick={() => {
                              setAsignaciones(asignaciones.map(a =>
                                a.id === asignacion.id ? { ...a, etapaKanban: 'confeccion' } : a
                              ));
                              toast.success('Pedido movido a Confección');
                            }}
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            Siguiente
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </Card>

            {/* Columna: Confección */}
            <Card className="bg-gray-50">
              <div className="p-4 border-b bg-white">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Shirt className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Confección</h3>
                    <p className="text-xs text-gray-600">
                      {asignaciones.filter(a => a.etapaKanban === 'confeccion').length} pedidos
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3 min-h-[400px]">
                {asignaciones
                  .filter(a => a.etapaKanban === 'confeccion')
                  .map((asignacion) => (
                    <Card 
                      key={asignacion.id} 
                      className="p-4 bg-white hover:shadow-md transition-all cursor-move border-l-4 border-l-purple-500 group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900 text-sm">{asignacion.pedido}</span>
                          <Badge className="bg-purple-100 text-purple-800 text-xs">Confección</Badge>
                        </div>
                        <p className="text-sm text-gray-700 font-medium">{asignacion.producto}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Factory className="h-3 w-3" />
                          <span>{asignacion.taller}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs font-semibold text-gray-900">{asignacion.cantidad} uds</span>
                          <span className="text-xs text-gray-500">{asignacion.fechaEntregaEstimada}</span>
                        </div>
                        <div className="hidden group-hover:flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-7 text-xs"
                            onClick={() => {
                              setAsignaciones(asignaciones.map(a =>
                                a.id === asignacion.id ? { ...a, etapaKanban: 'estampado' } : a
                              ));
                              toast.success('Pedido movido a Estampado');
                            }}
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            Siguiente
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </Card>

            {/* Columna: Estampado */}
            <Card className="bg-gray-50">
              <div className="p-4 border-b bg-white">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Palette className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Estampado</h3>
                    <p className="text-xs text-gray-600">
                      {asignaciones.filter(a => a.etapaKanban === 'estampado').length} pedidos
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3 min-h-[400px]">
                {asignaciones
                  .filter(a => a.etapaKanban === 'estampado')
                  .map((asignacion) => (
                    <Card 
                      key={asignacion.id} 
                      className="p-4 bg-white hover:shadow-md transition-all cursor-move border-l-4 border-l-orange-500 group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900 text-sm">{asignacion.pedido}</span>
                          <Badge className="bg-orange-100 text-orange-800 text-xs">Estampado</Badge>
                        </div>
                        <p className="text-sm text-gray-700 font-medium">{asignacion.producto}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Factory className="h-3 w-3" />
                          <span>{asignacion.taller}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs font-semibold text-gray-900">{asignacion.cantidad} uds</span>
                          <span className="text-xs text-gray-500">{asignacion.fechaEntregaEstimada}</span>
                        </div>
                        <div className="hidden group-hover:flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-7 text-xs"
                            onClick={() => {
                              setAsignaciones(asignaciones.map(a =>
                                a.id === asignacion.id ? { ...a, etapaKanban: 'finalizado', estado: 'completado' } : a
                              ));
                              toast.success('?? Pedido completado!');
                            }}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Finalizar
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </Card>

            {/* Columna: Finalizado */}
            <Card className="bg-gray-50">
              <div className="p-4 border-b bg-white">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <PackageCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Finalizado</h3>
                    <p className="text-xs text-gray-600">
                      {asignaciones.filter(a => a.etapaKanban === 'finalizado').length} pedidos
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3 min-h-[400px]">
                {asignaciones
                  .filter(a => a.etapaKanban === 'finalizado')
                  .map((asignacion) => (
                    <Card 
                      key={asignacion.id} 
                      className="p-4 bg-white hover:shadow-md transition-all border-l-4 border-l-green-500"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900 text-sm">{asignacion.pedido}</span>
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Listo
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 font-medium">{asignacion.producto}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Factory className="h-3 w-3" />
                          <span>{asignacion.taller}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs font-semibold text-gray-900">{asignacion.cantidad} uds</span>
                          <span className="text-xs text-green-600 font-medium">? Completado</span>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}




