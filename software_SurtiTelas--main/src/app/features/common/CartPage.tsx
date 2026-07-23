import { ChevronLeft, Trash2, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { NavigationBar } from './NavigationBar';
import { Button } from './ui/button';
import { CartItem, User } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import logoBlack from 'figma:asset/6b1b01bec62a36f96143e42f8161cda0f047b918.png';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload, CreditCard } from 'lucide-react';

interface CartPageProps {
  items: CartItem[];
  onUpdateQuantity: (index: number, newQuantity: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onNavigate: (page: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  cartItemCount: number;
  onCheckout?: (orderData: {
    items: CartItem[];
    total: number;
    paymentProof: string;
    bank: string;
  }) => void;
}

export function CartPage({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigate,
  currentUser,
  onLogout,
  cartItemCount,
  onCheckout,
}: CartPageProps) {
  const [selectedItems, setSelectedItems] = useState<number[]>(
    items.map((_, index) => index)
  );
  const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [paymentProof, setPaymentProof] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((_, index) => index));
    }
  };

  const toggleSelectItem = (index: number) => {
    if (selectedItems.includes(index)) {
      setSelectedItems(selectedItems.filter(i => i !== index));
    } else {
      setSelectedItems([...selectedItems, index]);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Â¿Estás seguro de vaciar el carrito?')) {
      onClearCart();
      setSelectedItems([]);
      toast.success('Carrito vaciado');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simular la carga de archivo y generar URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProof(reader.result as string);
        setUploadedFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmCheckout = () => {
    if (!selectedBank) {
      toast.error('Por favor selecciona un banco');
      return;
    }
    if (!paymentProof) {
      toast.error('Por favor sube un comprobante de pago');
      return;
    }

    const selectedItemsData = items.filter((_, index) => selectedItems.includes(index));
    const total = Math.round(subtotal * 1.19 + (subtotal >= 100000 ? 0 : 15000));

    if (onCheckout) {
      onCheckout({
        items: selectedItemsData,
        total,
        paymentProof,
        bank: selectedBank,
      });
    }

    setCheckoutDialog(false);
    setSelectedBank('');
    setPaymentProof('');
    setUploadedFileName('');
    toast.success('Â¡Pedido confirmado! Un asesor verificará tu pago pronto.');
  };

  // Calcular totales solo de items seleccionados
  const subtotal = items.reduce((sum, item, index) => {
    if (!selectedItems.includes(index)) return sum;
    const price = item.product.discount
      ? item.product.price * (1 - item.product.discount / 100)
      : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <NavigationBar
        currentPage="cart"
        onNavigate={onNavigate}
        currentUser={currentUser}
        onLogout={onLogout}
        cartItemCount={cartItemCount}
        logo={logoBlack}
      />

      {/* Main Content */}
      <div className="w-full px-8 py-8">
        {/* Header */}
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('catalogo')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl text-black">Carrito de Compras</h1>
            </div>

            {items.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.length === items.length}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                />
                <span className="text-sm text-gray-700">
                  Seleccionar todos ({items.length})
                </span>
              </label>
            )}
          </div>

          {/* Info Bar */}
          {items.length > 0 && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600">âœ“</span>
                <span className="text-gray-600">
                  Envío gratis en pedidos superiores a $100.000
                </span>
              </div>
              <button
                onClick={handleClearCart}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Vaciar carrito</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Grid */}
        {items.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-xl text-gray-600 mb-4">Tu carrito está vacío</h2>
            <Button
              onClick={() => onNavigate('catalogo')}
              className="bg-black text-white hover:bg-gray-800"
            >
              Ver Catálogo
            </Button>
          </div>
        ) : (
          <div className="max-w-[1400px] mx-auto">
            {/* Products List */}
            <div className="space-y-4 mb-8">
              {items.map((item, index) => {
                const price = item.product.discount
                  ? item.product.price * (1 - item.product.discount / 100)
                  : item.product.price;

                return (
                  <div
                    key={`${item.product.id}-${item.size}-${item.color}-${index}`}
                    className="flex items-center gap-6 p-6 border-2 border-black rounded-2xl bg-white"
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(index)}
                      onChange={() => toggleSelectItem(index)}
                      className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer flex-shrink-0"
                    />

                    {/* Product Image */}
                    <div className="w-28 h-28 flex-shrink-0 bg-gray-100 rounded-2xl overflow-hidden">
                      <ImageWithFallback
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg text-black mb-3">
                        {item.product.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          Talla: <span className="text-black">{item.size}</span>
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">
                          Color: <span className="text-black">{item.color}</span>
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-xl text-black flex-shrink-0">
                      ${price.toLocaleString('es-CO')}
                      <span className="text-sm text-gray-500"> c/u</span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            onUpdateQuantity(index, item.quantity - 1);
                          }
                        }}
                        disabled={item.quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="w-10 text-center text-lg text-black">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        onRemoveItem(index);
                        setSelectedItems(selectedItems.filter(i => i !== index).map(i => i > index ? i - 1 : i));
                        toast.success('Producto eliminado');
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-6 h-6 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Summary Section - Full Width at Bottom */}
            {selectedItems.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border-2 border-black">
                <div className="flex items-start justify-between gap-12">
                  {/* Left Side - Summary Details */}
                  <div className="flex-1">
                    <h3 className="text-xl text-black mb-6">Resumen del Pedido</h3>

                    <div className="space-y-4">
                      <div className="flex justify-between text-lg">
                        <span className="text-gray-600">Subtotal ({selectedItems.length} productos)</span>
                        <span className="text-black">${subtotal.toLocaleString('es-CO')}</span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span className="text-gray-600">IVA (19%)</span>
                        <span className="text-black">${Math.round(subtotal * 0.19).toLocaleString('es-CO')}</span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span className="text-gray-600">Envío</span>
                        <span className="text-green-600">
                          {subtotal >= 100000 ? 'Gratis' : '$15.000'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Total and Button */}
                  <div className="flex flex-col items-end gap-6 min-w-[300px]">
                    <div className="text-right">
                      <div className="text-gray-600 text-sm mb-2">Total a pagar</div>
                      <div className="text-4xl text-black">
                        ${Math.round(subtotal * 1.19 + (subtotal >= 100000 ? 0 : 15000)).toLocaleString('es-CO')}
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        if (!currentUser || currentUser.role !== 'customer') {
                          toast.error('Debes iniciar sesión como cliente');
                          onNavigate('login');
                          return;
                        }
                        setCheckoutDialog(true);
                      }}
                      className="w-full bg-black text-white hover:bg-gray-800 h-14 text-base"
                    >
                      Proceder al Pago
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Checkout Dialog */}
      <Dialog open={checkoutDialog} onOpenChange={setCheckoutDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Finalizar Compra</DialogTitle>
            <DialogDescription>
              Completa los datos de pago para confirmar tu pedido
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Resumen del pedido */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Resumen del Pedido
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${subtotal.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IVA (19%)</span>
                  <span className="text-gray-900">${Math.round(subtotal * 0.19).toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  <span className="text-green-600">{subtotal >= 100000 ? 'Gratis' : '$15.000'}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900 text-lg">${Math.round(subtotal * 1.19 + (subtotal >= 100000 ? 0 : 15000)).toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>

            {/* Selección de banco */}
            <div className="space-y-2">
              <Label htmlFor="bank">Selecciona el Banco *</Label>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona tu banco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bancolombia">Bancolombia</SelectItem>
                  <SelectItem value="Banco de Bogotá">Banco de Bogotá</SelectItem>
                  <SelectItem value="Davivienda">Davivienda</SelectItem>
                  <SelectItem value="BBVA">BBVA</SelectItem>
                  <SelectItem value="Scotiabank Colpatria">Scotiabank Colpatria</SelectItem>
                  <SelectItem value="Banco Caja Social">Banco Caja Social</SelectItem>
                  <SelectItem value="Banco AV Villas">Banco AV Villas</SelectItem>
                  <SelectItem value="Nequi">Nequi</SelectItem>
                  <SelectItem value="Daviplata">Daviplata</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subir comprobante */}
            <div className="space-y-2">
              <Label htmlFor="paymentProof">Comprobante de Pago *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="paymentProof"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="paymentProof" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  {uploadedFileName ? (
                    <div className="text-sm">
                      <p className="text-green-600 mb-1">âœ“ Archivo cargado</p>
                      <p className="text-gray-600">{uploadedFileName}</p>
                    </div>
                  ) : (
                    <div className="text-sm">
                      <p className="text-gray-600 mb-1">Haz clic para subir tu comprobante</p>
                      <p className="text-gray-400">PNG, JPG o JPEG (máx. 10MB)</p>
                    </div>
                  )}
                </label>
              </div>
              {paymentProof && (
                <div className="mt-3">
                  <p className="text-sm text-gray-700 mb-2">Vista previa:</p>
                  <img
                    src={paymentProof}
                    alt="Comprobante"
                    className="w-full max-h-60 object-contain bg-gray-100 rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Información adicional */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Nota:</strong> Tu pago será verificado por un asesor en las próximas horas.
                Recibirás una notificación cuando sea aprobado.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              onClick={() => {
                setCheckoutDialog(false);
                setSelectedBank('');
                setPaymentProof('');
                setUploadedFileName('');
              }}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmCheckout}
              className="bg-black text-white hover:bg-gray-800"
            >
              Confirmar Pedido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}




