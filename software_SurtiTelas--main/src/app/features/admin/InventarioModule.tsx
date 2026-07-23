import { useState } from 'react';
import {
  Package,
  Boxes,
  Truck,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Download,
  TrendingDown,
  Package2,
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

interface InventarioModuleProps {
  activeTab?: string;
}

interface Insumo {
  id: string;
  nombre: string;
  tipo: string;
  cantidad: number;
  unidad: string;
  proveedor: string;
  estado: 'disponible' | 'bajo' | 'crótico';
  precioUnitario: number;
}

interface ProductoTerminado {
  id: string;
  referencia: string;
  nombre: string;
  stock: number;
  estado: 'disponible' | 'bajo' | 'agotado';
  precio: number;
  categoria: string;
}

interface Proveedor {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  insumosAsociados: number;
  estado: 'activo' | 'inactivo';
}

export function InventarioModule({ activeTab }: InventarioModuleProps) {
  // Determinar el tab activo basado en activeTab
  const getCurrentTab = () => {
    if (activeTab === 'productos-terminados' || activeTab === 'productos') return 'productos';
    if (activeTab === 'proveedores') return 'proveedores';
    if (activeTab === 'alertas-stock' || activeTab === 'alertas') return 'alertas';
    return 'insumos';
  };

  const [insumos, setInsumos] = useState<Insumo[]>([
    { id: '1', nombre: 'Tela de Algodón Blanca', tipo: 'Tela', cantidad: 150, unidad: 'metros', proveedor: 'Textiles S.A.', estado: 'disponible', precioUnitario: 25 },
    { id: '2', nombre: 'Tela de Algodón Negra', tipo: 'Tela', cantidad: 80, unidad: 'metros', proveedor: 'Textiles S.A.', estado: 'disponible', precioUnitario: 25 },
    { id: '3', nombre: 'Hilo Blanco', tipo: 'Hilo', cantidad: 25, unidad: 'carretes', proveedor: 'Hilos del Norte', estado: 'bajo', precioUnitario: 5 },
    { id: '4', nombre: 'Hilo Negro', tipo: 'Hilo', cantidad: 12, unidad: 'carretes', proveedor: 'Hilos del Norte', estado: 'crótico', precioUnitario: 5 },
    { id: '5', nombre: 'Botones Plósticos', tipo: 'Accesorios', cantidad: 500, unidad: 'unidades', proveedor: 'Accesorios Plus', estado: 'disponible', precioUnitario: 0.5 },
    { id: '6', nombre: 'Etiquetas de Marca', tipo: 'Etiquetas', cantidad: 200, unidad: 'unidades', proveedor: 'Etiquetas Pro', estado: 'disponible', precioUnitario: 1 },
    { id: '7', nombre: 'Tela de Poliéster', tipo: 'Tela', cantidad: 120, unidad: 'metros', proveedor: 'Textiles S.A.', estado: 'disponible', precioUnitario: 30 },
    { id: '8', nombre: 'Hilo Azul', tipo: 'Hilo', cantidad: 45, unidad: 'carretes', proveedor: 'Hilos del Norte', estado: 'disponible', precioUnitario: 5 },
    { id: '9', nombre: 'Hilo Rojo', tipo: 'Hilo', cantidad: 18, unidad: 'carretes', proveedor: 'Hilos del Norte', estado: 'bajo', precioUnitario: 5 },
    { id: '10', nombre: 'Cierres Metólicos', tipo: 'Accesorios', cantidad: 250, unidad: 'unidades', proveedor: 'Accesorios Plus', estado: 'disponible', precioUnitario: 2 },
    { id: '11', nombre: 'Tela de Lycra', tipo: 'Tela', cantidad: 60, unidad: 'metros', proveedor: 'Textiles S.A.', estado: 'disponible', precioUnitario: 45 },
    { id: '12', nombre: 'Elósticos', tipo: 'Accesorios', cantidad: 300, unidad: 'metros', proveedor: 'Accesorios Plus', estado: 'disponible', precioUnitario: 1.5 },
    { id: '13', nombre: 'Tinta de Estampado Negra', tipo: 'Tintas', cantidad: 15, unidad: 'litros', proveedor: 'Tintas y Diseños', estado: 'bajo', precioUnitario: 80 },
    { id: '14', nombre: 'Tinta de Estampado Blanca', tipo: 'Tintas', cantidad: 20, unidad: 'litros', proveedor: 'Tintas y Diseños', estado: 'disponible', precioUnitario: 80 },
    { id: '15', nombre: 'Ribetes', tipo: 'Accesorios', cantidad: 180, unidad: 'metros', proveedor: 'Accesorios Plus', estado: 'disponible', precioUnitario: 3 },
    { id: '16', nombre: 'Hilo Verde', tipo: 'Hilo', cantidad: 30, unidad: 'carretes', proveedor: 'Hilos del Norte', estado: 'disponible', precioUnitario: 5 },
    { id: '17', nombre: 'Botones de Madera', tipo: 'Accesorios', cantidad: 150, unidad: 'unidades', proveedor: 'Accesorios Plus', estado: 'disponible', precioUnitario: 1.2 },
    { id: '18', nombre: 'Tela de Jean', tipo: 'Tela', cantidad: 40, unidad: 'metros', proveedor: 'Textiles S.A.', estado: 'bajo', precioUnitario: 55 },
    { id: '19', nombre: 'Etiquetas Personalizadas', tipo: 'Etiquetas', cantidad: 100, unidad: 'unidades', proveedor: 'Etiquetas Pro', estado: 'bajo', precioUnitario: 1.5 },
    { id: '20', nombre: 'Tinta de Estampado Azul', tipo: 'Tintas', cantidad: 8, unidad: 'litros', proveedor: 'Tintas y Diseños', estado: 'crótico', precioUnitario: 80 },
  ]);

  const [productosTerminados, setProductosTerminados] = useState<ProductoTerminado[]>([
    { id: '1', referencia: 'CAM-001', nombre: 'Camiseta Bósica Blanca', stock: 150, estado: 'disponible', precio: 80, categoria: 'Bósicas' },
    { id: '2', referencia: 'CAM-002', nombre: 'Camiseta Bósica Negra', stock: 120, estado: 'disponible', precio: 80, categoria: 'Bósicas' },
    { id: '3', referencia: 'CAM-003', nombre: 'Camiseta Estampada Logo', stock: 25, estado: 'bajo', precio: 120, categoria: 'Personalizadas' },
    { id: '4', referencia: 'CAM-004', nombre: 'Camiseta Polo Azul', stock: 80, estado: 'disponible', precio: 150, categoria: 'Polo' },
    { id: '5', referencia: 'CAM-005', nombre: 'Camiseta Deportiva', stock: 5, estado: 'bajo', precio: 180, categoria: 'Deportivas' },
    { id: '6', referencia: 'CAM-006', nombre: 'Camiseta Infantil', stock: 0, estado: 'agotado', precio: 70, categoria: 'Infantiles' },
    { id: '7', referencia: 'CAM-007', nombre: 'Camiseta Bósica Gris', stock: 100, estado: 'disponible', precio: 80, categoria: 'Bósicas' },
    { id: '8', referencia: 'CAM-008', nombre: 'Camiseta Cuello V Negro', stock: 90, estado: 'disponible', precio: 95, categoria: 'Bósicas' },
    { id: '9', referencia: 'CAM-009', nombre: 'Camiseta Polo Roja', stock: 65, estado: 'disponible', precio: 150, categoria: 'Polo' },
    { id: '10', referencia: 'CAM-010', nombre: 'Camiseta Deportiva Azul', stock: 45, estado: 'disponible', precio: 180, categoria: 'Deportivas' },
    { id: '11', referencia: 'CAM-011', nombre: 'Camiseta Estampada Personalizada', stock: 20, estado: 'bajo', precio: 140, categoria: 'Personalizadas' },
    { id: '12', referencia: 'CAM-012', nombre: 'Camiseta Manga Larga Negra', stock: 55, estado: 'disponible', precio: 110, categoria: 'Bósicas' },
    { id: '13', referencia: 'CAM-013', nombre: 'Camiseta Infantil Rosa', stock: 30, estado: 'disponible', precio: 70, categoria: 'Infantiles' },
    { id: '14', referencia: 'CAM-014', nombre: 'Camiseta Polo Verde', stock: 40, estado: 'disponible', precio: 150, categoria: 'Polo' },
    { id: '15', referencia: 'CAM-015', nombre: 'Camiseta Deportiva Gris', stock: 10, estado: 'bajo', precio: 180, categoria: 'Deportivas' },
    { id: '16', referencia: 'CAM-016', nombre: 'Camiseta Estampada Artóstica', stock: 15, estado: 'bajo', precio: 160, categoria: 'Personalizadas' },
    { id: '17', referencia: 'CAM-017', nombre: 'Camiseta Bósica Azul', stock: 110, estado: 'disponible', precio: 80, categoria: 'Bósicas' },
    { id: '18', referencia: 'CAM-018', nombre: 'Camiseta Infantil Azul', stock: 25, estado: 'disponible', precio: 70, categoria: 'Infantiles' },
    { id: '19', referencia: 'CAM-019', nombre: 'Camiseta Polo Blanca', stock: 0, estado: 'agotado', precio: 150, categoria: 'Polo' },
    { id: '20', referencia: 'CAM-020', nombre: 'Camiseta Deportiva Negra', stock: 50, estado: 'disponible', precio: 180, categoria: 'Deportivas' },
  ]);

  const [proveedores, setProveedores] = useState<Proveedor[]>([
    { id: '1', nombre: 'Textiles S.A.', contacto: 'Juan Ramírez', telefono: '555-1001', email: 'ventas@textilessa.com', insumosAsociados: 15, estado: 'activo' },
    { id: '2', nombre: 'Hilos del Norte', contacto: 'Mará González', telefono: '555-1002', email: 'info@hilosdelnorte.com', insumosAsociados: 8, estado: 'activo' },
    { id: '3', nombre: 'Accesorios Plus', contacto: 'Carlos Pérez', telefono: '555-1003', email: 'contacto@accesoriosplus.com', insumosAsociados: 12, estado: 'activo' },
    { id: '4', nombre: 'Etiquetas Pro', contacto: 'Ana López', telefono: '555-1004', email: 'ventas@etiquetaspro.com', insumosAsociados: 6, estado: 'activo' },
    { id: '5', nombre: 'Tintas y Diseños', contacto: 'Roberto Silva', telefono: '555-1005', email: 'ventas@tintasydisenos.com', insumosAsociados: 4, estado: 'inactivo' },
    { id: '6', nombre: 'Confecciones del Sur', contacto: 'Laura Martónez', telefono: '555-1006', email: 'info@confeccionesdelsur.com', insumosAsociados: 10, estado: 'activo' },
    { id: '7', nombre: 'Distribuidora Textil', contacto: 'Miguel óngel Torres', telefono: '555-1007', email: 'ventas@distritextil.com', insumosAsociados: 18, estado: 'activo' },
    { id: '8', nombre: 'Bordados y Mós', contacto: 'Patricia Gómez', telefono: '555-1008', email: 'contacto@bordadosymas.com', insumosAsociados: 5, estado: 'activo' },
    { id: '9', nombre: 'Insumos Industriales', contacto: 'Fernando Ruiz', telefono: '555-1009', email: 'ventas@insumosindustriales.com', insumosAsociados: 20, estado: 'activo' },
    { id: '10', nombre: 'Textiles del Valle', contacto: 'Sandra Castro', telefono: '555-1010', email: 'info@textilesdelvalle.com', insumosAsociados: 14, estado: 'activo' },
    { id: '11', nombre: 'Botones y Cierres S.A.', contacto: 'Ricardo Morales', telefono: '555-1011', email: 'ventas@botonescierres.com', insumosAsociados: 9, estado: 'activo' },
    { id: '12', nombre: 'Estampados Creativos', contacto: 'Andrea Jimónez', telefono: '555-1012', email: 'contacto@estampadoscreativos.com', insumosAsociados: 7, estado: 'activo' },
    { id: '13', nombre: 'Telas Importadas Ltda.', contacto: 'Jorge Hernñdez', telefono: '555-1013', email: 'ventas@telasimportadas.com', insumosAsociados: 16, estado: 'activo' },
    { id: '14', nombre: 'Suministros Textiles', contacto: 'Carolina Vargas', telefono: '555-1014', email: 'info@suministrostextiles.com', insumosAsociados: 11, estado: 'inactivo' },
    { id: '15', nombre: 'Mercado de Hilos', contacto: 'Daniel Ríos', telefono: '555-1015', email: 'ventas@mercadodehilos.com', insumosAsociados: 13, estado: 'activo' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPageInsumos, setCurrentPageInsumos] = useState(1);
  const [itemsPerPageInsumos] = useState(10);
  const [currentPageProductos, setCurrentPageProductos] = useState(1);
  const [itemsPerPageProductos] = useState(10);
  const [currentPageProveedores, setCurrentPageProveedores] = useState(1);
  const [itemsPerPageProveedores] = useState(10);
  const [currentPageAlertas, setCurrentPageAlertas] = useState(1);
  const [itemsPerPageAlertas] = useState(10);

  const totalInsumos = insumos.length;
  const insumosCriticos = insumos.filter(i => i.estado === 'crótico').length;
  const proveedoresActivos = proveedores.filter(p => p.estado === 'activo').length;
  const productosDisponibles = productosTerminados.filter(p => p.estado === 'disponible').length;
  const productosBajos = productosTerminados.filter(p => p.estado === 'bajo').length;

  const alertasStock = [
    { tipo: 'insumo', nombre: 'Hilo Negro', cantidad: 12, minimo: 20, criticidad: 'alta' },
    { tipo: 'insumo', nombre: 'Hilo Blanco', cantidad: 25, minimo: 30, criticidad: 'media' },
    { tipo: 'producto', nombre: 'Camiseta Deportiva', cantidad: 5, minimo: 15, criticidad: 'media' },
    { tipo: 'producto', nombre: 'Camiseta Infantil', cantidad: 0, minimo: 10, criticidad: 'alta' },
    { tipo: 'insumo', nombre: 'Tinta Azul', cantidad: 3, minimo: 10, criticidad: 'alta' },
  ];

  const getEstadoBadge = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'disponible':
      case 'activo':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Disponible</Badge>;
      case 'bajo':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Stock Bajo</Badge>;
      case 'crótico':
      case 'agotado':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Crótico</Badge>;
      case 'inactivo':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactivo</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  const getCriticidadColor = (criticidad: string) => {
    switch (criticidad) {
      case 'alta':
        return 'border-l-4 border-l-red-500 bg-red-50';
      case 'media':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-4 border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-3xl font-semibold text-gray-900">Gestión de Inventario</h1>
        <p className="text-gray-600 mt-1">Administración de insumos, productos terminados y proveedores</p>
      </div>

      {/* Cards superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Boxes className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalInsumos}</p>
              <p className="text-sm text-gray-600">Total insumos</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{insumosCriticos}</p>
              <p className="text-sm text-gray-600">Insumos cróticos</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{proveedoresActivos}</p>
              <p className="text-sm text-gray-600">Proveedores activos</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Package2 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{productosDisponibles}</p>
              <p className="text-sm text-gray-600">Productos disponibles</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{productosBajos}</p>
              <p className="text-sm text-gray-600">Productos bajos</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={getCurrentTab()} className="space-y-6">
        <TabsList className="bg-white p-2 rounded-lg shadow-sm flex flex-col sm:flex-row h-auto gap-2 w-full sm:w-auto">
          <TabsTrigger value="insumos" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <Boxes className="h-4 w-4 mr-2" />
            <span>Gestión de insumos</span>
          </TabsTrigger>
          <TabsTrigger value="productos" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <Package className="h-4 w-4 mr-2" />
            <span>Productos terminados</span>
          </TabsTrigger>
          <TabsTrigger value="proveedores" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <Truck className="h-4 w-4 mr-2" />
            <span>Gestión de proveedores</span>
          </TabsTrigger>
          <TabsTrigger value="alertas" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span>Alertas de stock</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Gestión de insumos */}
        <TabsContent value="insumos" className="space-y-6">
          <Card className="p-4 bg-white rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar insumos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-none">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button className="bg-gray-900 hover:bg-gray-800 flex-1 sm:flex-none">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Insumo
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nombre</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cantidad</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Unidad</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Proveedor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Precio Unit.</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filtered = insumos.filter(i => i.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
                    const startIndex = (currentPageInsumos - 1) * itemsPerPageInsumos;
                    const endIndex = startIndex + itemsPerPageInsumos;
                    const paginated = filtered.slice(startIndex, endIndex);
                    return paginated.map((insumo) => (
                      <tr key={insumo.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">{insumo.nombre}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">{insumo.tipo}</td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">{insumo.cantidad}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{insumo.unidad}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">{insumo.proveedor}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">${insumo.precioUnitario}</td>
                        <td className="py-4 px-4">{getEstadoBadge(insumo.estado)}</td>
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
              currentPage={currentPageInsumos}
              totalItems={insumos.filter(i => i.nombre.toLowerCase().includes(searchTerm.toLowerCase())).length}
              itemsPerPage={itemsPerPageInsumos}
              onPageChange={setCurrentPageInsumos}
            />
          </Card>
        </TabsContent>

        {/* Tab: Productos terminados */}
        <TabsContent value="productos" className="space-y-6">
          <Card className="p-4 bg-white rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-none">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button className="bg-gray-900 hover:bg-gray-800 flex-1 sm:flex-none">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Producto
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Referencia</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nombre</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Categorá</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Stock</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Precio</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filtered = productosTerminados.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
                    const startIndex = (currentPageProductos - 1) * itemsPerPageProductos;
                    const endIndex = startIndex + itemsPerPageProductos;
                    const paginated = filtered.slice(startIndex, endIndex);
                    return paginated.map((producto) => (
                      <tr key={producto.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">{producto.referencia}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">{producto.nombre}</td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">{producto.categoria}</Badge>
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">{producto.stock}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">${producto.precio}</td>
                        <td className="py-4 px-4">{getEstadoBadge(producto.estado)}</td>
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
              currentPage={currentPageProductos}
              totalItems={productosTerminados.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase())).length}
              itemsPerPage={itemsPerPageProductos}
              onPageChange={setCurrentPageProductos}
            />
          </Card>
        </TabsContent>

        {/* Tab: Proveedores */}
        <TabsContent value="proveedores" className="space-y-6">
          <Card className="p-4 bg-white rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar proveedores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button className="bg-gray-900 hover:bg-gray-800 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proveedor
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Proveedor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Contacto</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Teléfono</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Insumos Asociados</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filtered = proveedores.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
                    const startIndex = (currentPageProveedores - 1) * itemsPerPageProveedores;
                    const endIndex = startIndex + itemsPerPageProveedores;
                    const paginated = filtered.slice(startIndex, endIndex);
                    return paginated.map((proveedor) => (
                      <tr key={proveedor.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-gray-900">{proveedor.nombre}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">{proveedor.contacto}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">{proveedor.telefono}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{proveedor.email}</td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">{proveedor.insumosAsociados}</td>
                        <td className="py-4 px-4">{getEstadoBadge(proveedor.estado)}</td>
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
              currentPage={currentPageProveedores}
              totalItems={proveedores.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase())).length}
              itemsPerPage={itemsPerPageProveedores}
              onPageChange={setCurrentPageProveedores}
            />
          </Card>
        </TabsContent>

        {/* Tab: Alertas de stock */}
        <TabsContent value="alertas" className="space-y-6">
          <Card className="p-4 bg-white rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar alertas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nombre</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cantidad</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Mínimo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Criticidad</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filtered = alertasStock.filter(a => a.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
                    const startIndex = (currentPageAlertas - 1) * itemsPerPageAlertas;
                    const endIndex = startIndex + itemsPerPageAlertas;
                    const paginated = filtered.slice(startIndex, endIndex);
                    return paginated.map((alerta) => (
                      <tr key={alerta.nombre} className={`border-b border-gray-100 hover:bg-gray-50 ${getCriticidadColor(alerta.criticidad)}`}>
                        <td className="py-4 px-4 font-medium text-gray-900">{alerta.tipo}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">{alerta.nombre}</td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">{alerta.cantidad}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{alerta.minimo}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{alerta.criticidad}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            <TablePagination
              currentPage={currentPageAlertas}
              totalItems={alertasStock.filter(a => a.nombre.toLowerCase().includes(searchTerm.toLowerCase())).length}
              itemsPerPage={itemsPerPageAlertas}
              onPageChange={setCurrentPageAlertas}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default InventarioModule;




