import { useState } from 'react';
import { Package2, Plus, Search, Filter, Download, Edit, Trash2, AlertTriangle, TrendingDown, Box } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';

interface Insumo {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  cantidadDisponible: number;
  cantidadMinima: number;
  precioUnitario: number;
  proveedor: string;
  estado: 'disponible' | 'bajo-stock' | 'agotado';
  ultimaCompra: string;
  ubicacion: string;
}

export function InsumosModule() {
  const [insumos, setInsumos] = useState<Insumo[]>([
    { id: '1', codigo: 'INS-001', nombre: 'Tela Jersey Blanca', categoria: 'Telas', unidadMedida: 'metros', cantidadDisponible: 250, cantidadMinima: 50, precioUnitario: 12000, proveedor: 'TextilCorp', estado: 'disponible', ultimaCompra: '2024-11-20', ubicacion: 'Bodega A-1' },
    { id: '2', codigo: 'INS-002', nombre: 'Tela Jersey Negra', categoria: 'Telas', unidadMedida: 'metros', cantidadDisponible: 180, cantidadMinima: 50, precioUnitario: 12000, proveedor: 'TextilCorp', estado: 'disponible', ultimaCompra: '2024-11-20', ubicacion: 'Bodega A-1' },
    { id: '3', codigo: 'INS-003', nombre: 'Hilo Poliéster Blanco', categoria: 'Hilos', unidadMedida: 'conos', cantidadDisponible: 25, cantidadMinima: 30, precioUnitario: 8000, proveedor: 'HilosMax', estado: 'bajo-stock', ultimaCompra: '2024-11-15', ubicacion: 'Bodega B-2' },
    { id: '4', codigo: 'INS-004', nombre: 'Hilo Poliéster Negro', categoria: 'Hilos', unidadMedida: 'conos', cantidadDisponible: 45, cantidadMinima: 30, precioUnitario: 8000, proveedor: 'HilosMax', estado: 'disponible', ultimaCompra: '2024-11-15', ubicacion: 'Bodega B-2' },
    { id: '5', codigo: 'INS-005', nombre: 'Etiquetas de marca', categoria: 'Accesorios', unidadMedida: 'unidades', cantidadDisponible: 0, cantidadMinima: 100, precioUnitario: 500, proveedor: 'EtiquetasPlus', estado: 'agotado', ultimaCompra: '2024-10-30', ubicacion: 'Bodega C-3' },
    { id: '6', codigo: 'INS-006', nombre: 'Botones plósticos', categoria: 'Accesorios', unidadMedida: 'unidades', cantidadDisponible: 350, cantidadMinima: 200, precioUnitario: 100, proveedor: 'Insumos Textiles SA', estado: 'disponible', ultimaCompra: '2024-11-25', ubicacion: 'Bodega C-3' },
    { id: '7', codigo: 'INS-007', nombre: 'Tinta para estampado Azul', categoria: 'Tintas', unidadMedida: 'litros', cantidadDisponible: 8, cantidadMinima: 5, precioUnitario: 45000, proveedor: 'ColorPrint', estado: 'disponible', ultimaCompra: '2024-12-01', ubicacion: 'Bodega D-1' },
    { id: '8', codigo: 'INS-008', nombre: 'Tinta para estampado Roja', categoria: 'Tintas', unidadMedida: 'litros', cantidadDisponible: 3, cantidadMinima: 5, precioUnitario: 45000, proveedor: 'ColorPrint', estado: 'bajo-stock', ultimaCompra: '2024-12-01', ubicacion: 'Bodega D-1' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);

  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    categoria: '',
    unidadMedida: '',
    cantidadDisponible: '',
    cantidadMinima: '',
    precioUnitario: '',
    proveedor: '',
    ubicacion: ''
  });

  const categorias = ['Telas', 'Hilos', 'Accesorios', 'Tintas', 'Empaques'];

  const filteredInsumos = insumos.filter(insumo => {
    const matchesSearch = insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insumo.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'todos' || insumo.categoria === categoryFilter;
    const matchesEstado = estadoFilter === 'todos' || insumo.estado === estadoFilter;
    return matchesSearch && matchesCategory && matchesEstado;
  });

  const stockBajo = insumos.filter(i => i.estado === 'bajo-stock' || i.estado === 'agotado').length;
  const valorInventario = insumos.reduce((sum, i) => sum + (i.cantidadDisponible * i.precioUnitario), 0);

  const handleAddInsumo = () => {
    const newInsumo: Insumo = {
      id: String(insumos.length + 1),
      codigo: formData.codigo,
      nombre: formData.nombre,
      categoria: formData.categoria,
      unidadMedida: formData.unidadMedida,
      cantidadDisponible: Number(formData.cantidadDisponible),
      cantidadMinima: Number(formData.cantidadMinima),
      precioUnitario: Number(formData.precioUnitario),
      proveedor: formData.proveedor,
      ultimaCompra: new Date().toISOString().split('T')[0],
      ubicacion: formData.ubicacion,
      estado: Number(formData.cantidadDisponible) === 0 ? 'agotado' : 
              Number(formData.cantidadDisponible) < Number(formData.cantidadMinima) ? 'bajo-stock' : 'disponible'
    };

    setInsumos([...insumos, newInsumo]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success('Insumo agregado exitosamente');
  };

  const handleEditInsumo = (insumo: Insumo) => {
    setEditingInsumo(insumo);
    setFormData({
      codigo: insumo.codigo,
      nombre: insumo.nombre,
      categoria: insumo.categoria,
      unidadMedida: insumo.unidadMedida,
      cantidadDisponible: String(insumo.cantidadDisponible),
      cantidadMinima: String(insumo.cantidadMinima),
      precioUnitario: String(insumo.precioUnitario),
      proveedor: insumo.proveedor,
      ubicacion: insumo.ubicacion
    });
  };

  const handleUpdateInsumo = () => {
    if (!editingInsumo) return;

    setInsumos(insumos.map(i => i.id === editingInsumo.id ? {
      ...i,
      codigo: formData.codigo,
      nombre: formData.nombre,
      categoria: formData.categoria,
      unidadMedida: formData.unidadMedida,
      cantidadDisponible: Number(formData.cantidadDisponible),
      cantidadMinima: Number(formData.cantidadMinima),
      precioUnitario: Number(formData.precioUnitario),
      proveedor: formData.proveedor,
      ubicacion: formData.ubicacion,
      estado: Number(formData.cantidadDisponible) === 0 ? 'agotado' : 
              Number(formData.cantidadDisponible) < Number(formData.cantidadMinima) ? 'bajo-stock' : 'disponible'
    } : i));

    setEditingInsumo(null);
    resetForm();
    toast.success('Insumo actualizado exitosamente');
  };

  const handleDeleteInsumo = (id: string) => {
    setInsumos(insumos.filter(i => i.id !== id));
    toast.success('Insumo eliminado exitosamente');
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre: '',
      categoria: '',
      unidadMedida: '',
      cantidadDisponible: '',
      cantidadMinima: '',
      precioUnitario: '',
      proveedor: '',
      ubicacion: ''
    });
  };

  const exportToCSV = () => {
    const headers = ['Código', 'Nombre', 'Categorá', 'Unidad', 'Cantidad', 'Mínimo', 'Precio', 'Proveedor', 'Estado'];
    const rows = filteredInsumos.map(i => [
      i.codigo,
      i.nombre,
      i.categoria,
      i.unidadMedida,
      i.cantidadDisponible,
      i.cantidadMinima,
      i.precioUnitario,
      i.proveedor,
      i.estado
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insumos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Reporte exportado exitosamente');
  };

  const getEstadoBadge = (estado: string) => {
    const variants = {
      'disponible': 'bg-green-500/10 text-green-700 border-green-200',
      'bajo-stock': 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
      'agotado': 'bg-red-500/10 text-red-700 border-red-200'
    };
    const labels = {
      'disponible': 'Disponible',
      'bajo-stock': 'Stock Bajo',
      'agotado': 'Agotado'
    };
    return <Badge className={`${variants[estado as keyof typeof variants]} border`}>{labels[estado as keyof typeof labels]}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Insumos</h1>
          <p className="text-gray-600 mt-1">Administra materiales, telas, hilos y accesorios</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-black hover:bg-gray-800">
                <Plus className="h-4 w-4" />
                Nuevo Insumo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Insumo</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Código</Label>
                  <Input
                    placeholder="INS-XXX"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nombre del Insumo</Label>
                  <Input
                    placeholder="Nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categorá</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unidad de Medida</Label>
                  <Input
                    placeholder="metros, litros, unidades..."
                    value={formData.unidadMedida}
                    onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cantidad Disponible</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.cantidadDisponible}
                    onChange={(e) => setFormData({ ...formData, cantidadDisponible: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cantidad Mínima</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.cantidadMinima}
                    onChange={(e) => setFormData({ ...formData, cantidadMinima: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Precio Unitario (COP)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.precioUnitario}
                    onChange={(e) => setFormData({ ...formData, precioUnitario: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Proveedor</Label>
                  <Input
                    placeholder="Nombre del proveedor"
                    value={formData.proveedor}
                    onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Ubicación en Bodega</Label>
                  <Input
                    placeholder="Ej: Bodega A-1"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button onClick={handleAddInsumo} className="bg-black hover:bg-gray-800">
                  Agregar Insumo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Insumos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{insumos.length}</p>
            </div>
            <Box className="h-12 w-12 text-blue-500" />
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Bajo/Agotado</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stockBajo}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categorás</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{categorias.length}</p>
            </div>
            <Package2 className="h-12 w-12 text-green-500" />
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor Inventario</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${valorInventario.toLocaleString('es-CO')}
              </p>
            </div>
            <TrendingDown className="h-12 w-12 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Categorá" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las categorás</SelectItem>
              {categorias.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="disponible">Disponible</SelectItem>
              <SelectItem value="bajo-stock">Stock Bajo</SelectItem>
              <SelectItem value="agotado">Agotado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categorá</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Mínimo</TableHead>
              <TableHead>Precio Unit.</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInsumos.map((insumo) => (
              <TableRow key={insumo.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{insumo.codigo}</TableCell>
                <TableCell>{insumo.nombre}</TableCell>
                <TableCell>
                  <Badge variant="outline">{insumo.categoria}</Badge>
                </TableCell>
                <TableCell>
                  <span className={insumo.cantidadDisponible < insumo.cantidadMinima ? 'text-red-600 font-semibold' : ''}>
                    {insumo.cantidadDisponible} {insumo.unidadMedida}
                  </span>
                </TableCell>
                <TableCell className="text-gray-600">{insumo.cantidadMinima}</TableCell>
                <TableCell>${insumo.precioUnitario.toLocaleString('es-CO')}</TableCell>
                <TableCell className="text-gray-600">{insumo.proveedor}</TableCell>
                <TableCell>{getEstadoBadge(insumo.estado)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog open={editingInsumo?.id === insumo.id} onOpenChange={(open) => !open && setEditingInsumo(null)}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditInsumo(insumo)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Editar Insumo</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                          <div className="space-y-2">
                            <Label>Código</Label>
                            <Input
                              value={formData.codigo}
                              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Nombre del Insumo</Label>
                            <Input
                              value={formData.nombre}
                              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Categorá</Label>
                            <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {categorias.map(cat => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Unidad de Medida</Label>
                            <Input
                              value={formData.unidadMedida}
                              onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Cantidad Disponible</Label>
                            <Input
                              type="number"
                              value={formData.cantidadDisponible}
                              onChange={(e) => setFormData({ ...formData, cantidadDisponible: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Cantidad Mínima</Label>
                            <Input
                              type="number"
                              value={formData.cantidadMinima}
                              onChange={(e) => setFormData({ ...formData, cantidadMinima: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Precio Unitario (COP)</Label>
                            <Input
                              type="number"
                              value={formData.precioUnitario}
                              onChange={(e) => setFormData({ ...formData, precioUnitario: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Proveedor</Label>
                            <Input
                              value={formData.proveedor}
                              onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label>Ubicación en Bodega</Label>
                            <Input
                              value={formData.ubicacion}
                              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => { setEditingInsumo(null); resetForm(); }}>
                            Cancelar
                          </Button>
                          <Button onClick={handleUpdateInsumo} className="bg-black hover:bg-gray-800">
                            Actualizar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteInsumo(insumo.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}




