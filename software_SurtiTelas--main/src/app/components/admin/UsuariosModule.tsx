import { useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Shield,
  Lock,
  Clock,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { TablePagination } from '../ui/table-pagination';
import { toast } from 'sonner';

interface UsuariosModuleProps {
  activeTab: string;
}

interface Usuario {
  id: string;
  avatar: string;
  nombre: string;
  email: string;
  rol: string;
  estado: 'activo' | 'bloqueado' | 'pendiente';
  ultimoAcceso: string;
  telefono: string;
  fechaCreacion: string;
}

export function UsuariosModule({ activeTab }: UsuariosModuleProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    { id: '1', avatar: 'A', nombre: 'Ana García', email: 'ana@surticamisetas.com', rol: 'Administrador', estado: 'activo', ultimoAcceso: '2024-12-11 09:30', telefono: '555-0101', fechaCreacion: '2024-01-15' },
    { id: '2', avatar: 'L', nombre: 'Luis Pérez', email: 'luis@surticamisetas.com', rol: 'Asesor de Ventas', estado: 'activo', ultimoAcceso: '2024-12-11 08:15', telefono: '555-0102', fechaCreacion: '2024-02-20' },
    { id: '3', avatar: 'M', nombre: 'María López', email: 'maria@surticamisetas.com', rol: 'Asesor de Ventas', estado: 'activo', ultimoAcceso: '2024-12-10 18:45', telefono: '555-0103', fechaCreacion: '2024-03-10' },
    { id: '4', avatar: 'C', nombre: 'Carlos Díaz', email: 'carlos@surticamisetas.com', rol: 'Producción', estado: 'activo', ultimoAcceso: '2024-12-11 07:20', telefono: '555-0104', fechaCreacion: '2024-04-05' },
    { id: '5', avatar: 'R', nombre: 'Roberto Silva', email: 'roberto@surticamisetas.com', rol: 'Supervisor', estado: 'bloqueado', ultimoAcceso: '2024-12-05 14:30', telefono: '555-0105', fechaCreacion: '2024-05-12' },
    { id: '6', avatar: 'S', nombre: 'Sandra Morales', email: 'sandra@surticamisetas.com', rol: 'Cliente', estado: 'pendiente', ultimoAcceso: '2024-12-11 10:00', telefono: '555-0106', fechaCreacion: '2024-06-18' },
    { id: '7', avatar: 'J', nombre: 'Jorge Ramírez', email: 'jorge@surticamisetas.com', rol: 'Asesor de Ventas', estado: 'activo', ultimoAcceso: '2024-12-11 11:20', telefono: '555-0107', fechaCreacion: '2024-07-01' },
    { id: '8', avatar: 'P', nombre: 'Patricia Vega', email: 'patricia@surticamisetas.com', rol: 'Producción', estado: 'activo', ultimoAcceso: '2024-12-11 09:45', telefono: '555-0108', fechaCreacion: '2024-07-15' },
    { id: '9', avatar: 'D', nombre: 'Daniel Ortiz', email: 'daniel@surticamisetas.com', rol: 'Supervisor', estado: 'activo', ultimoAcceso: '2024-12-11 08:30', telefono: '555-0109', fechaCreacion: '2024-08-01' },
    { id: '10', avatar: 'E', nombre: 'Elena Torres', email: 'elena@surticamisetas.com', rol: 'Cliente', estado: 'activo', ultimoAcceso: '2024-12-11 10:15', telefono: '555-0110', fechaCreacion: '2024-08-15' },
    { id: '11', avatar: 'F', nombre: 'Fernando Castro', email: 'fernando@surticamisetas.com', rol: 'Asesor de Ventas', estado: 'activo', ultimoAcceso: '2024-12-11 07:50', telefono: '555-0111', fechaCreacion: '2024-09-01' },
    { id: '12', avatar: 'G', nombre: 'Gabriela Núñez', email: 'gabriela@surticamisetas.com', rol: 'Producción', estado: 'activo', ultimoAcceso: '2024-12-10 16:30', telefono: '555-0112', fechaCreacion: '2024-09-15' },
    { id: '13', avatar: 'H', nombre: 'Héctor Rojas', email: 'hector@surticamisetas.com', rol: 'Administrador', estado: 'activo', ultimoAcceso: '2024-12-11 09:00', telefono: '555-0113', fechaCreacion: '2024-10-01' },
    { id: '14', avatar: 'I', nombre: 'Isabel Flores', email: 'isabel@surticamisetas.com', rol: 'Cliente', estado: 'pendiente', ultimoAcceso: '2024-12-10 14:20', telefono: '555-0114', fechaCreacion: '2024-10-15' },
    { id: '15', avatar: 'K', nombre: 'Kevin Mendoza', email: 'kevin@surticamisetas.com', rol: 'Asesor de Ventas', estado: 'activo', ultimoAcceso: '2024-12-11 08:00', telefono: '555-0115', fechaCreacion: '2024-11-01' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Determinar el tab activo basado en activeTab
  const getCurrentTab = () => {
    if (activeTab === 'gestion-acceso' || activeTab === 'acceso') return 'acceso';
    if (activeTab === 'seguridad-usuarios' || activeTab === 'seguridad') return 'seguridad';
    return 'gestion';
  };

  const usuariosRegistrados = usuarios.length;
  const usuariosActivos = usuarios.filter(u => u.estado === 'activo').length;
  const usuariosBloqueados = usuarios.filter(u => u.estado === 'bloqueado').length;

  const intentosLogin = [
    { usuario: 'juan@example.com', intentos: 3, fecha: '2024-12-11 10:30', estado: 'bloqueado' },
    { usuario: 'maria@example.com', intentos: 2, fecha: '2024-12-11 09:15', estado: 'normal' },
    { usuario: 'carlos@example.com', intentos: 1, fecha: '2024-12-10 18:00', estado: 'normal' },
  ];

  const auditoria = [
    { usuario: 'Ana García', accion: 'Login exitoso', fecha: '2024-12-11 09:30', ip: '192.168.1.100' },
    { usuario: 'Luis Pérez', accion: 'Modificó un producto', fecha: '2024-12-11 08:45', ip: '192.168.1.101' },
    { usuario: 'María López', accion: 'Creó un pedido', fecha: '2024-12-11 08:15', ip: '192.168.1.102' },
    { usuario: 'Carlos Díaz', accion: 'Asignó producción', fecha: '2024-12-11 07:30', ip: '192.168.1.103' },
  ];

  const handleCreateUser = () => {
    toast.success('Usuario creado exitosamente');
    setOpenDialog(false);
  };

  const handleEditUser = (user: Usuario) => {
    setEditingUser(user);
    setOpenDialog(true);
  };

  const handleDeleteUser = (id: string) => {
    setUsuarios(usuarios.filter(u => u.id !== id));
    toast.success('Usuario eliminado exitosamente');
  };

  const handleToggleUserStatus = (id: string) => {
    setUsuarios(usuarios.map(u => 
      u.id === id 
        ? { ...u, estado: u.estado === 'activo' ? 'bloqueado' : 'activo' as 'activo' | 'bloqueado' | 'pendiente' }
        : u
    ));
    toast.success('Estado del usuario actualizado');
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activo':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Activo</Badge>;
      case 'bloqueado':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Bloqueado</Badge>;
      case 'pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendiente</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-3xl font-semibold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-1">Administración de usuarios, acceso y seguridad</p>
      </div>

      {/* Cards superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{usuariosRegistrados}</p>
              <p className="text-sm text-gray-600">Usuarios registrados</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{usuariosActivos}</p>
              <p className="text-sm text-gray-600">Usuarios activos</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{usuariosBloqueados}</p>
              <p className="text-sm text-gray-600">Usuarios bloqueados</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={getCurrentTab()} className="space-y-6">
        <TabsList className="bg-white p-2 rounded-lg shadow-sm flex flex-col sm:flex-row h-auto gap-2 w-full sm:w-auto">
          <TabsTrigger value="gestion" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <Users className="h-4 w-4 mr-2" />
            <span>Gestión de usuarios</span>
          </TabsTrigger>
          <TabsTrigger value="acceso" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <Lock className="h-4 w-4 mr-2" />
            <span>Gestión de acceso</span>
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="px-4 py-3 text-sm w-full sm:w-auto justify-start sm:justify-center">
            <Shield className="h-4 w-4 mr-2" />
            <span>Seguridad</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Gestión de usuarios */}
        <TabsContent value="gestion" className="space-y-6">
          {/* Barra de acciones */}
          <Card className="p-4 bg-white rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gray-900 hover:bg-gray-800 w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Usuario
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
                    <DialogDescription>Complete la información del usuario</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre completo</Label>
                      <Input id="nombre" placeholder="Juan Pérez" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="juan@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input id="telefono" placeholder="555-0000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rol">Rol</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="asesor">Asesor de Ventas</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="produccion">Producción</SelectItem>
                          <SelectItem value="cliente">Cliente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input id="password" type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                      <Input id="confirm-password" type="password" placeholder="••••••••" />
                    </div>
                    <div className="col-span-2 flex items-center space-x-2">
                      <Switch id="activo" />
                      <Label htmlFor="activo">Usuario activo</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpenDialog(false)}>
                      Cancelar
                    </Button>
                    <Button className="bg-gray-900 hover:bg-gray-800" onClick={handleCreateUser}>
                      {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </Card>

          {/* Tabla de usuarios */}
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Usuario</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Rol</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Último acceso</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filtered = usuarios.filter(user => user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()));
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedUsers = filtered.slice(startIndex, endIndex);

                    return paginatedUsers.map((usuario) => (
                      <tr key={usuario.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-medium">
                              {usuario.avatar}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{usuario.nombre}</p>
                              <p className="text-xs text-gray-500">{usuario.telefono}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700">{usuario.email}</td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">{usuario.rol}</Badge>
                        </td>
                        <td className="py-4 px-4">{getEstadoBadge(usuario.estado)}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {usuario.ultimoAcceso}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditUser(usuario)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleToggleUserStatus(usuario.id)}
                            >
                              {usuario.estado === 'activo' ? (
                                <UserX className="h-4 w-4 text-red-600" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(usuario.id)}>
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
              currentPage={currentPage}
              totalPages={Math.ceil(usuarios.filter(user => user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())).length / itemsPerPage)}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={usuarios.filter(user => user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())).length}
            />
          </Card>
        </TabsContent>

        {/* Tab: Gestión de acceso */}
        <TabsContent value="acceso" className="space-y-6">
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Control de Intentos de Login</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Usuario</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Intentos fallidos</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {intentosLogin.map((intento, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">{intento.usuario}</td>
                      <td className="py-4 px-4">
                        <Badge className={intento.intentos >= 3 ? 'bg-red-100 text-red-800 border-red-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                          {intento.intentos} intentos
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{intento.fecha}</td>
                      <td className="py-4 px-4">
                        {intento.estado === 'bloqueado' ? (
                          <Badge className="bg-red-100 text-red-800 border-red-200">Bloqueado</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Normal</Badge>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {intento.estado === 'bloqueado' && (
                            <Button size="sm" variant="outline" className="text-green-600">
                              Desbloquear
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            Restablecer
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

        {/* Tab: Seguridad */}
        <TabsContent value="seguridad" className="space-y-6">
          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Auditoría de Actividad</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Usuario</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Acción</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha y hora</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {auditoria.map((registro, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">{registro.usuario}</td>
                      <td className="py-4 px-4 text-sm text-gray-700">{registro.accion}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{registro.fecha}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{registro.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Configuración de Seguridad</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Autenticación de dos factores</p>
                  <p className="text-sm text-gray-600">Requerir verificación adicional al iniciar sesión</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Bloqueo automático</p>
                  <p className="text-sm text-gray-600">Bloquear cuenta después de 3 intentos fallidos</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Caducidad de contraseñas</p>
                  <p className="text-sm text-gray-600">Requerir cambio de contraseña cada 90 días</p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



