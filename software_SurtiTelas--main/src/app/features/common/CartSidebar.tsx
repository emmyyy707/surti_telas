import { X, Plus, Minus, Trash2, ShoppingCart, ArrowRight, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { CartItem, User } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQuantity: number) => void;
  onRemoveItem: (index: number) => void;
  onCheckout: () => void;
  currentUser?: User | null;
  onNavigateToLogin?: () => void;
}

export function CartSidebar({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  currentUser,
  onNavigateToLogin,
}: CartSidebarProps) {
  // Calcular totales
  const subtotal = items.reduce((sum, item) => {
    const price = item.product.discount
      ? item.product.price * (1 - item.product.discount / 100)
      : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const iva = Math.round(subtotal * 0.19);
  const total = subtotal + iva;

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }

    if (!currentUser || currentUser.role !== 'customer') {
      toast.error('Debes iniciar sesión como cliente para continuar con la compra');
      onClose();
      if (onNavigateToLogin) {
        onNavigateToLogin();
      }
      return;
    }

    onCheckout();
    onClose();
    toast.success('Â¡Pedido confirmado! Te contactaremos pronto.');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-white z-50 flex flex-col shadow-2xl">

        {/* Header Simple */}
        <div className="px-8 py-6 border-b flex items-center justify-between bg-white">
          <h2 className="text-2xl text-black">Carrito ({items.length})</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Products Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {items.length === 0 ? (
            // Empty State
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <ShoppingCart className="w-14 h-14 text-gray-300" />
              </div>
              <h3 className="text-xl text-black mb-3">Tu carrito está vacío</h3>
              <p className="text-gray-500 text-sm mb-8">
                Explora nuestro catálogo y encuentra lo que necesitas
              </p>
              <Button
                onClick={onClose}
                className="bg-black text-white hover:bg-gray-900 px-8"
              >
                Ver Catálogo
              </Button>
            </div>
          ) : (
            // Products List
            <div className="space-y-6">
              {items.map((item, index) => {
                const originalPrice = item.product.price;
                const discountedPrice = item.product.discount
                  ? Math.round(originalPrice * (1 - item.product.discount / 100))
                  : originalPrice;
                const lineTotal = discountedPrice * item.quantity;

                return (
                  <div
                    key={`${item.product.id}-${item.size}-${item.color}-${index}`}
                    className="group relative"
                  >
                    {/* Product Card */}
                    <div className="flex gap-5">
                      {/* Image Container */}
                      <div className="relative flex-shrink-0">
                        <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                          <ImageWithFallback
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {item.product.discount && (
                          <div className="absolute -top-2 -left-2 bg-black text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {item.product.discount}%
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 flex flex-col">
                        {/* Name */}
                        <h3 className="text-base text-black mb-2 line-clamp-2 pr-8">
                          {item.product.name}
                        </h3>

                        {/* Attributes */}
                        <div className="flex gap-2 mb-4">
                          <div className="px-3 py-1 bg-black text-white text-xs rounded-full">
                            {item.size}
                          </div>
                          <div className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                            {item.color}
                          </div>
                        </div>

                        {/* Bottom Row: Quantity + Price */}
                        <div className="mt-auto flex items-end justify-between">
                          {/* Quantity Selector */}
                          <div className="inline-flex items-center border border-gray-300 rounded-full overflow-hidden bg-white">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  onUpdateQuantity(index, item.quantity - 1);
                                }
                              }}
                              disabled={item.quantity <= 1}
                              className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <div className="w-12 h-9 flex items-center justify-center text-sm text-black">
                              {item.quantity}
                            </div>
                            <button
                              onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                              className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-lg text-black">
                              ${lineTotal.toLocaleString('es-CO')}
                            </div>
                            {item.product.discount && (
                              <div className="text-xs text-gray-400 line-through">
                                ${(originalPrice * item.quantity).toLocaleString('es-CO')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Delete Button - Absolute positioned */}
                      <button
                        onClick={() => {
                          onRemoveItem(index);
                          toast.success('Producto eliminado del carrito');
                        }}
                        className="absolute top-0 right-0 w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>

                    {/* Divider */}
                    {index < items.length - 1 && (
                      <div className="mt-6 border-b border-gray-100" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Checkout Section */}
        {items.length > 0 && (
          <div className="border-t bg-white px-8 py-6">
            {/* Totals */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm text-black">${subtotal.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">IVA (19%)</span>
                <span className="text-sm text-black">${iva.toLocaleString('es-CO')}</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-base text-black">Total</span>
                  <span className="text-2xl text-black">${total.toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              className="w-full bg-black text-white hover:bg-gray-900 h-14 text-base rounded-xl group"
            >
              <span>Finalizar Compra</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            {/* Continue Shopping */}
            <button
              onClick={onClose}
              className="w-full mt-4 text-sm text-gray-500 hover:text-black transition-colors"
            >
              â† Seguir comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}




