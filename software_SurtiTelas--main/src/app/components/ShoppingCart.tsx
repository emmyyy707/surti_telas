import { X, ChevronLeft, Menu, ChevronDown, Trash2, Share2, Settings, Plus, Minus, ShoppingCart as ShoppingCartIcon, Upload, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { CartItem, Product, User } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onCheckout: () => void;
  onAddToCart?: (product: Product, size: string, color: string) => void;
  currentUser?: User | null;
  onNavigateToLogin?: () => void;
  onNavigate?: (page: string) => void;
  onClearCart?: () => void;
}

export function ShoppingCart({
  isOpen,
  onClose,
  items = [],
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  currentUser,
  onNavigateToLogin,
  onNavigate,
  onClearCart,
}: ShoppingCartProps) {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Actualizar selectedItems cuando items cambie
  useEffect(() => {
    setSelectedItems(items.map((_, i) => i));
  }, [items.length]);

  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((_, i) => i));
    }
  };

  const toggleSelectItem = (index: number) => {
    setSelectedItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // Calcular totales solo de los items seleccionados
  const subtotal = items.reduce((sum, item, index) =>
    selectedItems.includes(index) ? sum + item.product.price * item.quantity : sum, 0
  );

  const iva = Math.round(subtotal * 0.19);
  const total = subtotal + iva;

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error('Selecciona al menos un producto para continuar');
      return;
    }

    if (!currentUser || currentUser.role !== 'customer') {
      toast.error('Debes iniciar sesión como cliente para continuar');
      if (onNavigateToLogin) {
        onNavigateToLogin();
      }
      return;
    }

    // Abrir modal de checkout
    setShowCheckoutModal(true);
  };

  const handleConfirmPurchase = () => {
    if (!selectedBank) {
      toast.error('Por favor selecciona una cuenta para transferir');
      return;
    }

    if (!uploadedFile) {
      toast.error('âš ï¸ Debes subir una imagen del comprobante de pago', {
        description: 'Es obligatorio adjuntar una captura de pantalla de tu transferencia'
      });
      return;
    }

    // Procesar pedido - Estado cambia a "En Verificación"
    onCheckout();
    setShowCheckoutModal(false);
    setSelectedBank('');
    setUploadedFile(null);
    toast.success('âœ… Pago enviado correctamente', {
      description: 'Tu pago está en verificación. Un asesor validará tu comprobante en aproximadamente 5 minutos. Te notificaremos cuando sea aprobado.'
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Solo se permiten archivos JPG, PNG o PDF');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo no debe superar 5MB');
        return;
      }

      setUploadedFile(file);
      toast.success('Archivo cargado correctamente');
    }
  };

  const bankAccounts = [
    {
      id: 'bancolombia',
      name: 'Bancolombia',
      accountType: 'Cuenta de Ahorros',
      accountNumber: '023-490198-02',
      holder: 'SurtiCamisetas'
    },
    {
      id: 'bogota',
      name: 'Banco de Bogotá',
      accountType: 'Cuenta Corriente',
      accountNumber: '087-854201-10',
      holder: 'SurtiCamisetas'
    },
    {
      id: 'davivienda',
      name: 'Davivienda',
      accountType: 'Cuenta de Ahorros',
      accountNumber: '456-193042-91',
      holder: 'SurtiCamisetas'
    }
  ];

  const handleClearCart = () => {
    if (items.length === 0) {
      toast.error('El carrito ya está vacío');
      return;
    }
    if (onClearCart) {
      onClearCart();
      setSelectedItems([]);
      toast.success('Carrito vaciado correctamente');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl text-black">Carrito de Compras</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Mensaje informativo */}
        {items.length > 0 && (
          <div className="flex-shrink-0 px-4 sm:px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs sm:text-sm text-gray-700 flex items-center gap-2">
                  <span className="text-green-600">âœ“</span>
                  <span><span className="font-medium text-black">Envío gratis</span> en pedidos superiores a $100.000</span>
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                  onClick={handleClearCart}
                  disabled={items.length === 0}
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Vaciar carrito
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de productos */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4">
              <div className="bg-white rounded-2xl p-12 text-center">
                <ShoppingCartIcon className="h-24 w-24 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl text-gray-900 mb-2">Tu carrito está vacío</h3>
                <p className="text-sm text-gray-500 mb-6">Descubre nuestros productos y comienza a agregar</p>
                <Button
                  onClick={() => {
                    onClose();
                    if (onNavigate) onNavigate('catalogo');
                  }}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Ir al catálogo
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="max-w-7xl mx-auto px-6 py-6 pb-32">
                <div className="grid grid-cols-1 gap-4">
                  {items.map((item, actualIndex) => {
                    const isSelected = selectedItems.includes(actualIndex);

                    return (
                      <div
                        key={actualIndex}
                        className={`bg-white rounded-xl p-5 border-2 transition-all ${
                          isSelected ? 'border-black shadow-lg' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className="flex gap-5">
                          {/* Checkbox */}
                          <div className="flex-shrink-0 pt-1">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelectItem(actualIndex)}
                              className="h-5 w-5 border-gray-300"
                            />
                          </div>

                          {/* Imagen */}
                          <div className="w-32 h-32 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                            <ImageWithFallback
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Información del producto */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <h3 className="text-base text-gray-900 mb-1">
                                    {item.product.name}
                                  </h3>
                                  <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <span>Talla: <span className="text-black">{item.size}</span></span>
                                    <span>•</span>
                                    <span>Color: <span className="text-black">{item.color}</span></span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => onRemoveItem(actualIndex)}
                                  className="text-gray-400 hover:text-red-600 transition-colors p-2"
                                  aria-label="Eliminar"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </div>

                            {/* Precio y cantidad */}
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl text-black">
                                  ${item.product.price.toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-500">
                                  c/u
                                </span>
                              </div>

                              {/* Selector de cantidad */}
                              <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
                                <button
                                  onClick={() => {
                                    if (item.quantity > 1) {
                                      onUpdateQuantity(actualIndex, item.quantity - 1);
                                    }
                                  }}
                                  disabled={item.quantity <= 1}
                                  className="text-gray-600 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                                  aria-label="Disminuir cantidad"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="text-base font-medium text-black min-w-[32px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(actualIndex, item.quantity + 1)}
                                  className="text-gray-600 hover:text-black transition-colors"
                                  aria-label="Aumentar cantidad"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Resumen de compra - Después de los productos */}
                <div className="mt-8 bg-white rounded-xl border-2 border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Productos seleccionados</p>
                      <p className="text-lg text-black">{selectedItems.length} {selectedItems.length === 1 ? 'artículo' : 'artículos'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Subtotal</p>
                      <p className="text-lg text-black">${subtotal.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">IVA (19%)</p>
                      <p className="text-lg text-black">${iva.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t-2 border-gray-200">
                    <div className="flex items-baseline justify-between mb-6">
                      <span className="text-lg text-gray-700">Total a pagar:</span>
                      <span className="text-4xl text-black">
                        ${total.toLocaleString()}
                      </span>
                    </div>

                    {/* Botón de pago */}
                    {!currentUser || currentUser.role !== 'customer' ? (
                      <div>
                        <p className="text-sm text-gray-600 mb-3">Debes iniciar sesión para continuar</p>
                        <Button
                          onClick={() => {
                            if (onNavigateToLogin) {
                              onNavigateToLogin();
                            }
                          }}
                          className="bg-black text-white hover:bg-gray-800 w-full py-6 text-lg rounded-lg shadow-lg transition-all"
                        >
                        Iniciar sesión
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={handleCheckout}
                        disabled={selectedItems.length === 0}
                        className="bg-black text-white hover:bg-gray-800 w-full py-6 text-lg rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Proceder al pago ({selectedItems.length})
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal de Checkout */}
        {showCheckoutModal && (
          <Dialog open={showCheckoutModal} onOpenChange={setShowCheckoutModal}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Finalizar Compra</DialogTitle>
                <DialogDescription className="text-gray-500">
                  Completa tu compra realizando la transferencia bancaria
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Resumen del Pedido */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h3 className="text-base mb-4 text-gray-900">Resumen de tu pedido</h3>
                  <div className="space-y-2.5">
                    {items.filter((_, index) => selectedItems.includes(index)).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.product.name} ({item.size}, {item.color}) x{item.quantity}
                        </span>
                        <span className="text-gray-900">${(item.product.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}

                    <div className="pt-3 border-t border-gray-300 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-700">${subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">IVA (19%)</span>
                        <span className="text-gray-700">${iva.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-gray-300">
                        <span className="text-lg text-gray-900">Total a pagar</span>
                        <span className="text-2xl text-purple-600">${total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seleccionar Cuenta Bancaria */}
                <div>
                  <h3 className="text-base mb-3 text-gray-900 flex items-center gap-2">
                    ðŸ¦ Selecciona la cuenta para transferir
                  </h3>
                  <RadioGroup value={selectedBank} onValueChange={setSelectedBank}>
                    <div className="space-y-3">
                      {bankAccounts.map((account) => (
                        <div
                          key={account.id}
                          className={`flex items-start space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                            selectedBank === account.id
                              ? 'border-purple-600 bg-purple-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                          onClick={() => setSelectedBank(account.id)}
                        >
                          <RadioGroupItem value={account.id} id={account.id} className="mt-1" />
                          <Label htmlFor={account.id} className="flex-1 cursor-pointer">
                            <div className="space-y-1">
                              <p className="text-base text-gray-900">{account.name}</p>
                              <p className="text-sm text-gray-600">{account.accountType}</p>
                              <p className="text-sm text-gray-700">
                                No. {account.accountNumber}
                              </p>
                              <p className="text-sm text-gray-500">Titular: {account.holder}</p>
                            </div>
                          </Label>
                          {selectedBank === account.id && (
                            <CheckCircle2 className="h-6 w-6 text-purple-600 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Subir Comprobante */}
                <div>
                  <h3 className="text-base mb-3 text-gray-900 flex items-center gap-2">
                    ðŸ“¤ Sube tu comprobante de pago
                  </h3>

                  <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center bg-purple-50/30 hover:border-purple-500 transition-all">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      onChange={handleFileUpload}
                    />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      {uploadedFile ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                          </div>
                          <div>
                            <p className="text-green-700">{uploadedFile.name}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {(uploadedFile.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              setUploadedFile(null);
                            }}
                            className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar archivo
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                            <Upload className="h-10 w-10 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-base text-gray-900 mb-1">Click para subir el archivo</p>
                            <p className="text-sm text-gray-500">
                              JPG, PNG, WebP o PDF (máx. 5MB)
                            </p>
                          </div>
                        </div>
                      )}
                    </Label>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-900">
                      <strong>Nota:</strong> Cuando subas el comprobante, nuestro equipo lo revisará. Te notificaremos cuando tu pago sea aprobado.
                    </p>
                  </div>

                  <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-sm text-yellow-900">
                      <strong>Importante:</strong> Realiza la transferencia por el monto total de <strong className="text-purple-600">${total.toLocaleString()}</strong>. Asegúrate de que el comprobante sea legible.
                    </p>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setSelectedBank('');
                      setUploadedFile(null);
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleConfirmPurchase}
                    disabled={!selectedBank || !uploadedFile}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmar Compra
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
}



