import { useState } from 'react';
import {
  Shield,
  Lock,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Check,
  X,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

interface ConfiguracionModuleProps {
  activeTab?: string;
}

interface Rol {
  id: string;
  nombre: string;
  permisos: string[];
  estado: 'activo' | 'inactivo';
  descripcion: string;
}

interface Permiso {
  id: string;
  nombre: string;
  descripcion: string;
  estado: 'activo' | 'inactivo';
}

export function ConfiguracionModule({ activeTab }: ConfiguracionModuleProps) {
  const [roles, setRoles] = useState<Rol[]>([
    { id: '1', nombre: 'Administrador', permisos: ['Ver todo', 'Editar todo', 'Eliminar'], estado: 'activo', descripcion: 'Acceso completo al sistema' },
    { id: '2', nombre: 'Asesor de Ventas', permisos: ['Ver pedidos', 'Crear pedidos'], estado: 'activo', descripcion: 'Gestión de ventas y clientes' },
    { id: '3', nombre: 'Supervisor', permisos: ['Ver reportes', 'Ver usuarios'], estado: 'activo', descripcion: 'Supervisión de operaciones' },
    { id: '4', nombre: 'Producción', permisos: ['Ver talleres', 'Asignar producción'], estado: 'activo', descripcion: 'Gestión de producción' },
  ]);

  const [permisos, setPermisos] = useState<Permiso[]>([
    { id: '1', nombre: 'Ver Dashboard', descripcion: 'Acceso al panel principal', estado: 'activo' },
    { id: '2', nombre: 'Gestionar Usuarios', descripcion: 'Crear, editar y eliminar usuarios', estado: 'activo' },
    { id: '3', nombre: 'Gestionar Inventario', descripcion: 'Administrar insumos y productos', estado: 'activo' },
    { id: '4', nombre: 'Gestionar Ventas', descripcion: 'Ver y procesar pedidos', estado: 'activo' },
    { id: '5', nombre: 'Gestionar Producción', descripcion: 'Asignar y supervisar talleres', estado: 'activo' },
    { id: '6', nombre: 'Ver Reportes', descripcion: 'Acceso a reportes y analótica', estado: 'activo' },
    { id: '7', nombre: 'Configuración del Sistema', descripcion: 'Modificar configuraciones generales', estado: 'activo' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [openRolDialog, setOpenRolDialog] = useState(false);
  const [openPermisoDialog, setOpenPermisoDialog] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [editingPermiso, setEditingPermiso] = useState<Permiso | null>(null);

  const handleCreateRol = () => {
    toast.success('Rol creado exitosamente');
    setOpenRolDialog(false);
  };

  const handleEditRol = (rol: Rol) => {
    setEditingRol(rol);
    setOpenRolDialog(true);
  };

  const handleDeleteRol = (id: string) => {
    setRoles(roles.filter(r => r.id !== id));
    toast.success('Rol eliminado exitosamente');
  };

  const handleCreatePermiso = () => {
    toast.success('Permiso creado exitosamente');
    setOpenPermisoDialog(false);
  };

  const handleEditPermiso = (permiso: Permiso) => {
    setEditingPermiso(permiso);
    setOpenPermisoDialog(true);
  };

  const handleDeletePermiso = (id: string) => {
    setPermisos(permisos.filter(p => p.id !== id));
    toast.success('Permiso eliminado exitosamente');
  };

  // Determinar el tab activo basado en activeTab
  const getCurrentTab = () => {
    if (activeTab === 'permisos') return 'permisos';
    return 'roles';
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Configuración del Sistema</h1>
        <p className="text-gray-600 mt-1">Gestión de roles y permisos</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={getCurrentTab()} className="space-y-6">
        <TabsList className="bg-white p-2 rounded-lg shadow-sm flex flex-col sm:flex-row h-auto gap-2 w-full sm:w-auto">
          <TabsTrigger value="roles" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <Shield className="h-4 w-4 mr-2" />
            <span>Roles</span>
          </TabsTrigger>
          <TabsTrigger value="permisos" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <Lock className="h-4 w-4 mr-2" />
            <span>Permisos</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Roles */}
        <TabsContent value="roles" className="space-y-6">
          {/* Cards superiores */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                  <p className="text-sm text-gray-600">Roles creados</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{roles.filter(r => r.estado === 'activo').length}</p>
                  <p className="text-sm text-gray-600">Roles activos</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{permisos.length}</p>
                  <p className="text-sm text-gray-600">Permisos disponibles</p>
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
                  placeholder="Buscar roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={openRolDialog} onOpenChange={setOpenRolDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gray-900 hover:bg-gray-800 w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Rol
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingRol ? 'Editar Rol' : 'Crear Nuevo Rol'}</DialogTitle>
                    <DialogDescription>Configure los permisos y detalles del rol</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre del Rol</Label>
                      <Input id="nombre" placeholder="Ej: Asesor de Ventas" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea id="descripcion" placeholder="Descripción del rol..." rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label>Permisos Asignados</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {permisos.slice(0, 6).map((permiso) => (
                          <div key={permiso.id} className="flex items-center space-x-2">
                            <input type="checkbox" id={`permiso-${permiso.id}`} className="rounded" />
                            <label htmlFor={`permiso-${permiso.id}`} className="text-sm text-gray-700">
                              {permiso.nombre}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="estado-rol" />
                      <Label htmlFor="estado-rol">Rol activo</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpenRolDialog(false)}>
                      Cancelar
                    </Button>
                    <Button className="bg-gray-900 hover:bg-gray-800" onClick={handleCreateRol}>
                      {editingRol ? 'Guardar Cambios' : 'Crear Rol'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </Card>

          {/* Tabla de roles */}
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nombre del Rol</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Descripción</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Permisos Asociados</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {roles
                    .filter(rol => rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((rol) => (
                      <tr key={rol.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center">
                              <Shield className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-medium text-gray-900">{rol.nombre}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{rol.descripcion}</td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {rol.permisos.slice(0, 3).map((permiso, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {permiso}
                              </Badge>
                            ))}
                            {rol.permisos.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{rol.permisos.length - 3}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {rol.estado === 'activo' ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">Activo</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactivo</Badge>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditRol(rol)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteRol(rol.id)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab: Permisos */}
        <TabsContent value="permisos" className="space-y-6">
          {/* Barra de acciones */}
          <Card className="p-4 bg-white rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar permisos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={openPermisoDialog} onOpenChange={setOpenPermisoDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gray-900 hover:bg-gray-800 w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Permiso
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingPermiso ? 'Editar Permiso' : 'Crear Nuevo Permiso'}</DialogTitle>
                    <DialogDescription>Configure los detalles del permiso</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre-permiso">Nombre del Permiso</Label>
                      <Input id="nombre-permiso" placeholder="Ej: Gestionar Usuarios" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descripcion-permiso">Descripción</Label>
                      <Textarea id="descripcion-permiso" placeholder="Descripción del permiso..." rows={3} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="estado-permiso" />
                      <Label htmlFor="estado-permiso">Permiso activo</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpenPermisoDialog(false)}>
                      Cancelar
                    </Button>
                    <Button className="bg-gray-900 hover:bg-gray-800" onClick={handleCreatePermiso}>
                      {editingPermiso ? 'Guardar Cambios' : 'Crear Permiso'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </Card>

          {/* Tabla de permisos */}
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nombre del Permiso</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Descripción</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {permisos
                    .filter(permiso => permiso.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((permiso) => (
                      <tr key={permiso.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <Lock className="h-5 w-5 text-purple-600" />
                            </div>
                            <span className="font-medium text-gray-900">{permiso.nombre}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{permiso.descripcion}</td>
                        <td className="py-4 px-4">
                          {permiso.estado === 'activo' ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">Activo</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactivo</Badge>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditPermiso(permiso)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeletePermiso(permiso.id)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ConfiguracionModule;




