import { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  Search,
  Download,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

interface Devolucion {
  id: string;
  codigo: string;
  producto: string;
  cliente: string;
  cantidad: number;
  motivo: string;
  estado: 'en_revision' | 'procesada' | 'reincorporada' | 'segregada' | 'rechazada';
  accionTomada: string;
  fecha: string;
  inspectorNombre: string;
}

export function DevolucionesModule() {
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>([
    { id: '1', codigo: 'DEV-001', producto: 'Camiseta Básica Blanca', cliente: 'Juan Pérez', cantidad: 5, motivo: 'Defecto de fabricación', estado: 'en_revision', accionTomada: 'Pendiente inspección', fecha: '2024-12-11', inspectorNombre: '-' },
    { id: '2', codigo: 'DEV-002', producto: 'Camiseta Polo Azul', cliente: 'María González', cantidad: 3, motivo: 'Talla incorrecta', estado: 'procesada', accionTomada: 'Cambio por talla correcta', fecha: '2024-12-10', inspectorNombre: 'Carlos Díaz' },
    { id: '3', codigo: 'DEV-003', producto: 'Camiseta Estampada Logo', cliente: 'Carlos López', cantidad: 2, motivo: 'Estampado defectuoso', estado: 'reincorporada', accionTomada: 'Reincorporada al inventario', fecha: '2024-12-09', inspectorNombre: 'Ana Martínez' },
    { id: '4', codigo: 'DEV-004', producto: 'Camiseta Deportiva', cliente: 'Ana Martínez', cantidad: 1, motivo: 'Color no coincide', estado: 'segregada', accionTomada: 'Segregada - descarte', fecha: '2024-12-08', inspectorNombre: 'Carlos Díaz' },
    { id: '5', codigo: 'DEV-005', producto: 'Camiseta Básica Negra', cliente: 'Pedro Rodríguez', cantidad: 4, motivo: 'Daño en transporte', estado: 'en_revision', accionTomada: 'En proceso de inspección', fecha: '2024-12-11', inspectorNombre: '-' },
    { id: '6', codigo: 'DEV-006', producto: 'Camiseta Infantil', cliente: 'Laura Sánchez', cantidad: 2, motivo: 'No cumple expectativas', estado: 'rechazada', accionTomada: 'Devolución rechazada', fecha: '2024-12-07', inspectorNombre: 'Ana Martínez' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDevolucion, setSelectedDevolucion] = useState<Devolucion | null>(null);

  const devolucionesProcesadas = devoluciones.filter(d => d.estado === 'procesada').length;
  const enRevision = devoluciones.filter(d => d.estado === 'en_revision').length;
  const reincorporadas = devoluciones.filter(d => d.estado === 'reincorporada').length;
  const segregadas = devoluciones.filter(d => d.estado === 'segregada').length;

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'procesada':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Procesada</Badge>;
      case 'en_revision':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">En revisión</Badge>;
      case 'reincorporada':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Reincorporada</Badge>;
      case 'segregada':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Segregada</Badge>;
      case 'rechazada':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rechazada</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  const handleInspeccionar = (devolucion: Devolucion) => {
    setSelectedDevolucion(devolucion);
    setOpenDialog(true);
  };

  const handleProcesarInspeccion = () => {
    toast.success('Inspección registrada exitosamente');
    setOpenDialog(false);
    setSelectedDevolucion(null);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Gestión de Devoluciones</h1>
        <p className="text-gray-600 mt-1">Control de stock devuelto, inspección y destino</p>
      </div>

      {/* Cards superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{devolucionesProcesadas}</p>
              <p className="text-sm text-gray-600">Procesadas</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{enRevision}</p>
              <p className="text-sm text-gray-600">En revisión</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <RotateCcw className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{reincorporadas}</p>
              <p className="text-sm text-gray-600">Reincorporadas</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{segregadas}</p>
              <p className="text-sm text-gray-600">Segregadas</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Barra de acciones */}
      <Card className="p-4 bg-white rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar devoluciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="en_revision">En revisión</SelectItem>
                <SelectItem value="procesada">Procesadas</SelectItem>
                <SelectItem value="reincorporada">Reincorporadas</SelectItem>
                <SelectItem value="segregada">Segregadas</SelectItem>
                <SelectItem value="rechazada">Rechazadas</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabla de devoluciones */}
      <Card className="p-6 bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-gray-900">Control de Stock Devuelto</h3>
            <p className="text-sm text-gray-600 mt-1">Inspección y destino de productos devueltos</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Código</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Producto</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cantidad</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Motivo</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Acción Tomada</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Inspector</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {devoluciones
                .filter(d => 
                  d.codigo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  d.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  d.cliente.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((devolucion) => (
                  <tr key={devolucion.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-900">{devolucion.codigo}</td>
                    <td className="py-4 px-4 text-sm text-gray-700">{devolucion.producto}</td>
                    <td className="py-4 px-4 text-sm text-gray-700">{devolucion.cliente}</td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">{devolucion.cantidad}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{devolucion.motivo}</td>
                    <td className="py-4 px-4">{getEstadoBadge(devolucion.estado)}</td>
                    <td className="py-4 px-4 text-sm text-gray-700">{devolucion.accionTomada}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{devolucion.inspectorNombre}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{devolucion.fecha}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {devolucion.estado === 'en_revision' && (
                          <Button 
                            size="sm" 
                            className="bg-gray-900 hover:bg-gray-800"
                            onClick={() => handleInspeccionar(devolucion)}
                          >
                            Inspeccionar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dialog de inspección */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inspección de Devolución</DialogTitle>
            <DialogDescription>
              Registre los resultados de la inspección y determine el destino del producto
            </DialogDescription>
          </DialogHeader>
          {selectedDevolucion && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Código</Label>
                  <p className="text-gray-900 font-medium">{selectedDevolucion.codigo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Producto</Label>
                  <p className="text-gray-900">{selectedDevolucion.producto}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Cliente</Label>
                  <p className="text-gray-900">{selectedDevolucion.cliente}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Cantidad</Label>
                  <p className="text-gray-900">{selectedDevolucion.cantidad} unidades</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Motivo de devolución</Label>
                <p className="text-gray-900 mt-1">{selectedDevolucion.motivo}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resultado-inspeccion">Resultado de la inspección</Label>
                <Textarea 
                  id="resultado-inspeccion" 
                  placeholder="Describa el estado del producto y los hallazgos de la inspección..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destino">Destino del producto</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar destino" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reincorporar">Reincorporar al inventario</SelectItem>
                    <SelectItem value="reparar">Enviar a reparación</SelectItem>
                    <SelectItem value="segregar">Segregar (descarte)</SelectItem>
                    <SelectItem value="cambio">Procesar cambio</SelectItem>
                    <SelectItem value="reembolso">Autorizar reembolso</SelectItem>
                    <SelectItem value="rechazar">Rechazar devolución</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones adicionales</Label>
                <Textarea 
                  id="observaciones" 
                  placeholder="Comentarios adicionales..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button className="bg-gray-900 hover:bg-gray-800" onClick={handleProcesarInspeccion}>
              Guardar Inspección
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



