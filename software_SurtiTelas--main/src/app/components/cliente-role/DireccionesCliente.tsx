import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Home,
  Building,
  Star,
} from 'lucide-react';

interface Direccion {
  id: string;
  nombre: string;
  tipo: 'Casa' | 'Oficina' | 'Otro';
  direccion: string;
  ciudad: string;
  departamento: string;
  codigoPostal: string;
  telefono: string;
  predeterminada: boolean;
}

export function DireccionesCliente() {
  const [direcciones, setDirecciones] = useState<Direccion[]>([
    {
      id: '1',
      nombre: 'Casa',
      tipo: 'Casa',
      direccion: 'Calle 123 #45-67, Apartamento 301',
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
      codigoPostal: '110111',
      telefono: '3001234567',
      predeterminada: true,
    },
    {
      id: '2',
      nombre: 'Oficina',
      tipo: 'Oficina',
      direccion: 'Carrera 45 #78-90, Piso 5',
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
      codigoPostal: '110221',
      telefono: '3009876543',
      predeterminada: false,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDireccion, setEditingDireccion] = useState<Direccion | null>(null);
  const [formData, setFormData] = useState<Omit<Direccion, 'id' | 'predeterminada'>>({
    nombre: '',
    tipo: 'Casa',
    direccion: '',
    ciudad: '',
    departamento: '',
    codigoPostal: '',
    telefono: '',
  });

  const handleOpenModal = (direccion?: Direccion) => {
    if (direccion) {
      setEditingDireccion(direccion);
      setFormData({
        nombre: direccion.nombre,
        tipo: direccion.tipo,
        direccion: direccion.direccion,
        ciudad: direccion.ciudad,
        departamento: direccion.departamento,
        codigoPostal: direccion.codigoPostal,
        telefono: direccion.telefono,
      });
    } else {
      setEditingDireccion(null);
      setFormData({
        nombre: '',
        tipo: 'Casa',
        direccion: '',
        ciudad: '',
        departamento: '',
        codigoPostal: '',
        telefono: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveDireccion = () => {
    if (editingDireccion) {
      setDirecciones(
        direcciones.map((d) =>
          d.id === editingDireccion.id
            ? {
                ...d,
                ...formData,
              }
            : d
        )
      );
    } else {
      const newDireccion: Direccion = {
        id: String(direcciones.length + 1),
        ...formData,
        predeterminada: direcciones.length === 0,
      };
      setDirecciones([...direcciones, newDireccion]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteDireccion = (id: string) => {
    if (window.confirm('Â¿Estás seguro de eliminar esta dirección?')) {
      setDirecciones(direcciones.filter((d) => d.id !== id));
    }
  };

  const handleSetPredeterminada = (id: string) => {
    setDirecciones(
      direcciones.map((d) => ({
        ...d,
        predeterminada: d.id === id,
      }))
    );
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Casa':
        return <Home className="h-5 w-5" />;
      case 'Oficina':
        return <Building className="h-5 w-5" />;
      default:
        return <MapPin className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Direcciones</h1>
          <p className="text-gray-600 mt-1">Gestiona tus direcciones de envío</p>
        </div>
        <Button className="bg-gray-900 hover:bg-gray-800" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Dirección
        </Button>
      </div>

      {/* Lista de Direcciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {direcciones.map((direccion) => (
          <Card
            key={direccion.id}
            className={`p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow ${
              direccion.predeterminada ? 'border-2 border-gray-900' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-900 text-white flex items-center justify-center">
                  {getTipoIcon(direccion.tipo)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{direccion.nombre}</h3>
                  {direccion.predeterminada && (
                    <Badge className="bg-gray-900 text-white mt-1">
                      <Star className="h-3 w-3 mr-1" />
                      Predeterminada
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{direccion.direccion}</span>
              </div>
              <p className="pl-6">{direccion.ciudad}, {direccion.departamento}</p>
              <p className="pl-6">CP: {direccion.codigoPostal}</p>
              <p className="pl-6">Tel: {direccion.telefono}</p>
            </div>

            <div className="flex gap-2">
              {!direccion.predeterminada && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSetPredeterminada(direccion.id)}
                  className="flex-1"
                >
                  Marcar predeterminada
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => handleOpenModal(direccion)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteDireccion(direccion.id)}
                disabled={direccion.predeterminada && direcciones.length > 1}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {direcciones.length === 0 && (
        <Card className="p-12 bg-white rounded-xl shadow-sm text-center">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No tienes direcciones guardadas</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">Agrega una dirección para facilitar tus envíos</p>
          <Button className="bg-gray-900 hover:bg-gray-800" onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Primera Dirección
          </Button>
        </Card>
      )}

      {/* Modal Crear/Editar Dirección */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDireccion ? 'Editar Dirección' : 'Nueva Dirección'}</DialogTitle>
            <DialogDescription>
              {editingDireccion
                ? 'Actualiza los datos de tu dirección de envío'
                : 'Completa la información de tu nueva dirección'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la dirección *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Casa, Oficina"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <select
                id="tipo"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                className="w-full h-9 px-3 rounded-md border border-gray-200 bg-white text-sm"
              >
                <option value="Casa">Casa</option>
                <option value="Oficina">Oficina</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="direccion">Dirección Completa *</Label>
              <Textarea
                id="direccion"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Ej: Calle 123 #45-67, Apartamento 301"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad *</Label>
              <Input
                id="ciudad"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                placeholder="Ej: Bogotá"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departamento">Departamento *</Label>
              <Input
                id="departamento"
                value={formData.departamento}
                onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                placeholder="Ej: Cundinamarca"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigoPostal">Código Postal</Label>
              <Input
                id="codigoPostal"
                value={formData.codigoPostal}
                onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                placeholder="Ej: 110111"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono de Contacto *</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Ej: 3001234567"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-gray-900 hover:bg-gray-800" onClick={handleSaveDireccion}>
              {editingDireccion ? 'Guardar Cambios' : 'Agregar Dirección'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



