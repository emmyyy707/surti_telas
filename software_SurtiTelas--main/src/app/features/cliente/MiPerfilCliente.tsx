import { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Save,
  X,
  AlertTriangle,
} from 'lucide-react';

interface MiPerfilClienteProps {
  userName: string;
  onUpdateUserName: (newName: string) => void;
}

export function MiPerfilCliente({ userName, onUpdateUserName }: MiPerfilClienteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: userName,
    email: 'cliente@email.com',
    telefono: '3001234567',
    fechaNacimiento: '1990-05-15',
    direccion: 'Calle 123 #45-67, Bogotá',
  });

  const [tempData, setTempData] = useState(formData);

  const handleEdit = () => {
    setTempData(formData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempData(formData);
    setIsEditing(false);
  };

  const handleSave = () => {
    setFormData(tempData);
    onUpdateUserName(tempData.nombre);
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Mi Perfil</h1>
        <p className="text-[var(--text-secondary)] mt-1">Gestiona tu información personal</p>
      </div>

      {/* Información del Perfil */}
      <Card className="p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Avatar y Nombre */}
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-[var(--text-primary)] text-white flex items-center justify-center text-3xl font-bold">
              {getInitials(isEditing ? tempData.nombre : formData.nombre)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                {isEditing ? tempData.nombre : formData.nombre}
              </h2>
              <p className="text-[var(--text-secondary)]">{formData.email}</p>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">Cliente desde Enero 2025</p>
            </div>
          </div>

          {/* Botón Editar/Guardar */}
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button className="bg-[var(--text-primary)] hover:bg-gray-800" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </>
            ) : (
              <Button className="bg-[var(--text-primary)] hover:bg-gray-800" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Datos Personales */}
      <Card className="p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Datos Personales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nombre Completo
            </Label>
            <Input
              id="nombre"
              value={isEditing ? tempData.nombre : formData.nombre}
              onChange={(e) => setTempData({ ...tempData, nombre: e.target.value })}
              disabled={!isEditing}
              className={!isEditing ? 'bg-[var(--bg-subtle)]' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Correo Electrónico
            </Label>
            <Input
              id="email"
              type="email"
              value={isEditing ? tempData.email : formData.email}
              onChange={(e) => setTempData({ ...tempData, email: e.target.value })}
              disabled={!isEditing}
              className={!isEditing ? 'bg-[var(--bg-subtle)]' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Teléfono
            </Label>
            <Input
              id="telefono"
              value={isEditing ? tempData.telefono : formData.telefono}
              onChange={(e) => setTempData({ ...tempData, telefono: e.target.value })}
              disabled={!isEditing}
              className={!isEditing ? 'bg-[var(--bg-subtle)]' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaNacimiento" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha de Nacimiento
            </Label>
            <Input
              id="fechaNacimiento"
              type="date"
              value={isEditing ? tempData.fechaNacimiento : formData.fechaNacimiento}
              onChange={(e) => setTempData({ ...tempData, fechaNacimiento: e.target.value })}
              disabled={!isEditing}
              className={!isEditing ? 'bg-[var(--bg-subtle)]' : ''}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="direccion" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Dirección
            </Label>
            <Input
              id="direccion"
              value={isEditing ? tempData.direccion : formData.direccion}
              onChange={(e) => setTempData({ ...tempData, direccion: e.target.value })}
              disabled={!isEditing}
              className={!isEditing ? 'bg-[var(--bg-subtle)]' : ''}
            />
          </div>
        </div>
      </Card>

      {/* Seguridad */}
      <Card className="p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Seguridad</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[var(--bg-subtle)] rounded-lg">
            <div>
              <p className="font-medium text-[var(--text-primary)]">Contraseáa</p>
              <p className="text-sm text-[var(--text-secondary)]">Última actualización hace 3 meses</p>
            </div>
            <Button variant="outline" size="sm">
              Cambiar
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-[var(--bg-subtle)] rounded-lg">
            <div>
              <p className="font-medium text-[var(--text-primary)]">Autenticación de dos factores</p>
              <p className="text-sm text-[var(--text-secondary)]">Protege tu cuenta con verificación en dos pasos</p>
            </div>
            <Button variant="outline" size="sm">
              Activar
            </Button>
          </div>
        </div>
      </Card>

      {/* Zona de Peligro */}
      <Card className="p-6 bg-[var(--bg-elevated)] rounded-xl shadow-sm border-2 border-red-200">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-900">Zona de Peligro</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <p className="font-medium text-red-900">Desactivar Cuenta</p>
              <p className="text-sm text-red-700">Tu cuenta seró desactivada temporalmente</p>
            </div>
            <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
              Desactivar
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <p className="font-medium text-red-900">Eliminar Cuenta</p>
              <p className="text-sm text-red-700">Esta acción es irreversible</p>
            </div>
            <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
              Eliminar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}



