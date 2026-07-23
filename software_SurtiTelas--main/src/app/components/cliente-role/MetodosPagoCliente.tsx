import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Star,
} from 'lucide-react';

interface MetodoPago {
  id: string;
  nombreTitular: string;
  numeroTarjeta: string;
  marca: 'Visa' | 'Mastercard' | 'American Express' | 'Otra';
  expiracion: string;
  predeterminado: boolean;
}

export function MetodosPagoCliente() {
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([
    {
      id: '1',
      nombreTitular: 'Juan Pérez González',
      numeroTarjeta: '4532123456789012',
      marca: 'Visa',
      expiracion: '12/28',
      predeterminado: true,
    },
    {
      id: '2',
      nombreTitular: 'Juan Pérez González',
      numeroTarjeta: '5412345678901234',
      marca: 'Mastercard',
      expiracion: '06/27',
      predeterminado: false,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMetodo, setEditingMetodo] = useState<MetodoPago | null>(null);
  const [formData, setFormData] = useState({
    nombreTitular: '',
    numeroTarjeta: '',
    expiracion: '',
    cvv: '',
  });

  const detectarMarca = (numero: string): MetodoPago['marca'] => {
    const num = numero.replace(/\s/g, '');
    if (num.startsWith('4')) return 'Visa';
    if (num.startsWith('5')) return 'Mastercard';
    if (num.startsWith('3')) return 'American Express';
    return 'Otra';
  };

  const formatearNumeroTarjeta = (numero: string): string => {
    const num = numero.replace(/\s/g, '');
    const grupos = num.match(/.{1,4}/g);
    return grupos ? grupos.join(' ') : num;
  };

  const handleNumeroTarjetaChange = (value: string) => {
    const soloNumeros = value.replace(/\D/g, '');
    const limitado = soloNumeros.slice(0, 16);
    const formateado = formatearNumeroTarjeta(limitado);
    setFormData({ ...formData, numeroTarjeta: formateado });
  };

  const handleExpiracionChange = (value: string) => {
    let formateado = value.replace(/\D/g, '');
    if (formateado.length >= 2) {
      formateado = formateado.slice(0, 2) + '/' + formateado.slice(2, 4);
    }
    setFormData({ ...formData, expiracion: formateado });
  };

  const handleOpenModal = (metodo?: MetodoPago) => {
    if (metodo) {
      setEditingMetodo(metodo);
      setFormData({
        nombreTitular: metodo.nombreTitular,
        numeroTarjeta: formatearNumeroTarjeta(metodo.numeroTarjeta),
        expiracion: metodo.expiracion,
        cvv: '',
      });
    } else {
      setEditingMetodo(null);
      setFormData({
        nombreTitular: '',
        numeroTarjeta: '',
        expiracion: '',
        cvv: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveMetodo = () => {
    const numeroLimpio = formData.numeroTarjeta.replace(/\s/g, '');
    const marca = detectarMarca(numeroLimpio);

    if (editingMetodo) {
      setMetodosPago(
        metodosPago.map((m) =>
          m.id === editingMetodo.id
            ? {
                ...m,
                nombreTitular: formData.nombreTitular,
                numeroTarjeta: numeroLimpio,
                marca,
                expiracion: formData.expiracion,
              }
            : m
        )
      );
    } else {
      const newMetodo: MetodoPago = {
        id: String(metodosPago.length + 1),
        nombreTitular: formData.nombreTitular,
        numeroTarjeta: numeroLimpio,
        marca,
        expiracion: formData.expiracion,
        predeterminado: metodosPago.length === 0,
      };
      setMetodosPago([...metodosPago, newMetodo]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteMetodo = (id: string) => {
    if (window.confirm('Â¿Estás seguro de eliminar este método de pago?')) {
      setMetodosPago(metodosPago.filter((m) => m.id !== id));
    }
  };

  const handleSetPredeterminado = (id: string) => {
    setMetodosPago(
      metodosPago.map((m) => ({
        ...m,
        predeterminado: m.id === id,
      }))
    );
  };

  const getMarcaColor = (marca: string) => {
    switch (marca) {
      case 'Visa':
        return 'from-blue-600 to-blue-700';
      case 'Mastercard':
        return 'from-red-600 to-orange-600';
      case 'American Express':
        return 'from-green-600 to-teal-600';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  const ocultarNumeroTarjeta = (numero: string): string => {
    return '**** **** **** ' + numero.slice(-4);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Métodos de Pago</h1>
          <p className="text-gray-600 mt-1">Gestiona tus tarjetas y métodos de pago</p>
        </div>
        <Button className="bg-gray-900 hover:bg-gray-800" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Tarjeta
        </Button>
      </div>

      {/* Lista de Métodos de Pago */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metodosPago.map((metodo) => (
          <Card
            key={metodo.id}
            className={`relative overflow-hidden ${
              metodo.predeterminado ? 'ring-2 ring-gray-900' : ''
            }`}
          >
            <div className={`h-48 bg-gradient-to-br ${getMarcaColor(metodo.marca)} p-6 text-white`}>
              <div className="flex items-start justify-between mb-8">
                <CreditCard className="h-10 w-10" />
                {metodo.predeterminado && (
                  <Badge className="bg-white text-gray-900">
                    <Star className="h-3 w-3 mr-1" />
                    Predeterminada
                  </Badge>
                )}
              </div>
              <div className="space-y-4">
                <p className="text-xl font-mono tracking-wider">
                  {ocultarNumeroTarjeta(metodo.numeroTarjeta)}
                </p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs opacity-80">Titular</p>
                    <p className="font-medium">{metodo.nombreTitular}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-80">Vence</p>
                    <p className="font-medium">{metodo.expiracion}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">{metodo.marca}</p>
              <div className="flex gap-2">
                {!metodo.predeterminado && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetPredeterminado(metodo.id)}
                    title="Marcar como predeterminada"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleOpenModal(metodo)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteMetodo(metodo.id)}
                  disabled={metodo.predeterminado && metodosPago.length > 1}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {metodosPago.length === 0 && (
        <Card className="p-12 bg-white rounded-xl shadow-sm text-center">
          <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No tienes métodos de pago guardados</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">Agrega una tarjeta para agilizar tus compras</p>
          <Button className="bg-gray-900 hover:bg-gray-800" onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Primera Tarjeta
          </Button>
        </Card>
      )}

      {/* Modal Crear/Editar Método de Pago */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMetodo ? 'Editar Tarjeta' : 'Agregar Tarjeta'}</DialogTitle>
            <DialogDescription>
              {editingMetodo
                ? 'Actualiza la información de tu tarjeta'
                : 'Ingresa los datos de tu nueva tarjeta'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombreTitular">Nombre del Titular *</Label>
              <Input
                id="nombreTitular"
                value={formData.nombreTitular}
                onChange={(e) => setFormData({ ...formData, nombreTitular: e.target.value.toUpperCase() })}
                placeholder="JUAN PEREZ GONZALEZ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numeroTarjeta">Número de Tarjeta *</Label>
              <Input
                id="numeroTarjeta"
                value={formData.numeroTarjeta}
                onChange={(e) => handleNumeroTarjetaChange(e.target.value)}
                placeholder="4532 1234 5678 9012"
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiracion">Expiración (MM/AA) *</Label>
                <Input
                  id="expiracion"
                  value={formData.expiracion}
                  onChange={(e) => handleExpiracionChange(e.target.value)}
                  placeholder="12/28"
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  type="password"
                  value={formData.cvv}
                  onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-medium mb-1">ðŸ”’ Información Segura</p>
              <p className="text-xs">Tus datos están encriptados y protegidos</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-gray-900 hover:bg-gray-800" onClick={handleSaveMetodo}>
              {editingMetodo ? 'Guardar Cambios' : 'Agregar Tarjeta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



