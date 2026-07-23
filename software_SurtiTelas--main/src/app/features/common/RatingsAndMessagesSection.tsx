import { useState } from 'react';
import { Star, MessageSquare, Send, ThumbsUp } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { User, Employee, Product, ProductRating, QuickMessage } from '../types';

interface RatingsAndMessagesSectionProps {
  currentUser: User | null;
  products: Product[];
  advisors: Employee[];
  onSubmitProductRating?: (rating: ProductRating) => void;
  onSubmitQuickMessage?: (message: QuickMessage) => void;
}

export function RatingsAndMessagesSection({
  currentUser,
  products,
  advisors,
  onSubmitProductRating,
  onSubmitQuickMessage,
}: RatingsAndMessagesSectionProps) {
  const [productRatingData, setProductRatingData] = useState({
    productId: '',
    rating: 0,
    comment: '',
    guestName: '',
    guestEmail: '',
  });

  const [messageData, setMessageData] = useState({
    message: '',
    advisorId: '',
    guestName: '',
    guestEmail: '',
  });

  const handleProductRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productRatingData.productId || productRatingData.rating === 0) {
      toast.error('Selecciona un producto y una calificación');
      return;
    }

    // Validación para usuarios invitados
    if (!currentUser) {
      if (!productRatingData.guestName.trim()) {
        toast.error('Por favor ingresa tu nombre');
        return;
      }
      if (!productRatingData.guestEmail.trim() || !productRatingData.guestEmail.includes('@')) {
        toast.error('Por favor ingresa un email válido');
        return;
      }
    }

    const product = products.find(p => p.id === productRatingData.productId);
    if (!product) return;

    const newRating: ProductRating = {
      id: `pr${Date.now()}`,
      productId: productRatingData.productId,
      productName: product.name,
      clientId: currentUser?.id || `guest-${Date.now()}`,
      clientName: currentUser?.name || productRatingData.guestName,
      rating: productRatingData.rating,
      comment: productRatingData.comment,
      date: new Date().toISOString().split('T')[0],
      status: 'pendiente',
    };

    if (onSubmitProductRating) {
      onSubmitProductRating(newRating);
    }

    toast.success('Â¡Gracias por tu calificación!', {
      description: 'Todos nuestros asesores recibirán tu feedback',
    });

    setProductRatingData({ productId: '', rating: 0, comment: '', guestName: '', guestEmail: '' });
  };

  const handleQuickMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageData.message.trim()) {
      toast.error('Escribe un mensaje');
      return;
    }

    // Validación para usuarios invitados
    if (!currentUser) {
      if (!messageData.guestName.trim()) {
        toast.error('Por favor ingresa tu nombre');
        return;
      }
      if (!messageData.guestEmail.trim() || !messageData.guestEmail.includes('@')) {
        toast.error('Por favor ingresa un email válido');
        return;
      }
    }

    // Si no se selecciona asesor específico, el mensaje va a todos
    const advisor = messageData.advisorId && messageData.advisorId !== 'any' 
      ? advisors.find(a => a.id === messageData.advisorId)
      : undefined;

    const newMessage: QuickMessage = {
      id: `qm${Date.now()}`,
      clientId: currentUser?.id || `guest-${Date.now()}`,
      clientName: currentUser?.name || messageData.guestName,
      advisorId: advisor?.id,
      advisorName: advisor?.name,
      message: messageData.message,
      date: new Date().toISOString(),
      status: 'pendiente',
    };

    if (onSubmitQuickMessage) {
      onSubmitQuickMessage(newMessage);
    }

    toast.success('Mensaje enviado', {
      description: advisor 
        ? `${advisor.name} te responderá pronto` 
        : 'Todos nuestros asesores recibirán tu mensaje',
    });

    setMessageData({ message: '', advisorId: '', guestName: '', guestEmail: '' });
  };

  return (
    <div className="bg-gray-50 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl mb-3 sm:mb-4">Danos tu Opinión</h2>
          <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Tu feedback nos ayuda a mejorar nuestros productos y servicios
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Calificación de Productos */}
          <Card className="p-6 sm:p-8 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <ThumbsUp className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl truncate">Califica un Producto</h3>
                <p className="text-xs sm:text-sm text-gray-600">Comparte tu experiencia</p>
              </div>
            </div>

            <form onSubmit={handleProductRatingSubmit} className="space-y-4 flex-1 flex flex-col">
              {!currentUser && (
                <>
                  <div>
                    <Label className="text-sm sm:text-base">Tu Nombre *</Label>
                    <Input
                      value={productRatingData.guestName}
                      onChange={(e) =>
                        setProductRatingData({ ...productRatingData, guestName: e.target.value })
                      }
                      placeholder="Ingresa tu nombre"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm sm:text-base">Tu Email *</Label>
                    <Input
                      type="email"
                      value={productRatingData.guestEmail}
                      onChange={(e) =>
                        setProductRatingData({ ...productRatingData, guestEmail: e.target.value })
                      }
                      placeholder="correo@ejemplo.com"
                      className="mt-2"
                    />
                  </div>
                </>
              )}

              <div>
                <Label className="text-sm sm:text-base">Selecciona el Producto</Label>
                <Select
                  value={productRatingData.productId}
                  onValueChange={(value) =>
                    setProductRatingData({ ...productRatingData, productId: value })
                  }
                >
                  <SelectTrigger className="mt-2 w-full">
                    <SelectValue placeholder="Elige un producto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.slice(0, 10).map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm sm:text-base">Calificación</Label>
                <div className="flex gap-2 mt-2 justify-center sm:justify-start">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() =>
                        setProductRatingData({ ...productRatingData, rating })
                      }
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-7 w-7 sm:h-8 sm:w-8 transition-all ${
                          rating <= productRatingData.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <Label className="text-sm sm:text-base">Comentario (Opcional)</Label>
                <Textarea
                  value={productRatingData.comment}
                  onChange={(e) =>
                    setProductRatingData({
                      ...productRatingData,
                      comment: e.target.value,
                    })
                  }
                  placeholder="Cuéntanos qué te pareció el producto..."
                  className="mt-2 resize-none w-full"
                  rows={4}
                />
              </div>

              <div className="space-y-2 mt-auto">
                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-gray-800"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Enviar Calificación
                </Button>

                {!currentUser && (
                  <p className="text-xs sm:text-sm text-center text-gray-500">
                    ðŸ“¬ Tu feedback será enviado a todos nuestros asesores
                  </p>
                )}
              </div>
            </form>
          </Card>

          {/* Mensajes Rápidos */}
          <Card className="p-6 sm:p-8 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl truncate">Mensaje Rápido</h3>
                <p className="text-xs sm:text-sm text-gray-600">Contáctanos fácilmente</p>
              </div>
            </div>

            <form onSubmit={handleQuickMessageSubmit} className="space-y-4 flex-1 flex flex-col">
              {!currentUser && (
                <>
                  <div>
                    <Label className="text-sm sm:text-base">Tu Nombre *</Label>
                    <Input
                      value={messageData.guestName}
                      onChange={(e) =>
                        setMessageData({ ...messageData, guestName: e.target.value })
                      }
                      placeholder="Ingresa tu nombre"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm sm:text-base">Tu Email *</Label>
                    <Input
                      type="email"
                      value={messageData.guestEmail}
                      onChange={(e) =>
                        setMessageData({ ...messageData, guestEmail: e.target.value })
                      }
                      placeholder="correo@ejemplo.com"
                      className="mt-2"
                    />
                  </div>
                </>
              )}

              <div>
                <Label className="text-sm sm:text-base">Asesor (Opcional)</Label>
                <Select
                  value={messageData.advisorId}
                  onValueChange={(value) =>
                    setMessageData({ ...messageData, advisorId: value })
                  }
                >
                  <SelectTrigger className="mt-2 w-full">
                    <SelectValue placeholder="Selecciona un asesor..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Todos los asesores</SelectItem>
                    {advisors
                      .filter((a) => a.status === 'activo')
                      .map((advisor) => (
                        <SelectItem key={advisor.id} value={advisor.id}>
                          {advisor.name} - {advisor.role}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label className="text-sm sm:text-base">Tu Mensaje</Label>
                <Textarea
                  value={messageData.message}
                  onChange={(e) =>
                    setMessageData({ ...messageData, message: e.target.value })
                  }
                  placeholder="Escribe tu mensaje aquí... Preguntas, sugerencias, o solicitudes de información."
                  className="mt-2 resize-none w-full h-full min-h-[120px]"
                  rows={4}
                />
              </div>

              <div className="space-y-2 mt-auto">
                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-gray-800"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensaje
                </Button>

                {!currentUser && (
                  <p className="text-xs sm:text-sm text-center text-gray-500">
                    ðŸ“¬ {messageData.advisorId && messageData.advisorId !== 'any' 
                      ? 'Tu mensaje será enviado al asesor seleccionado' 
                      : 'Tu mensaje será enviado a todos nuestros asesores'}
                  </p>
                )}
              </div>
            </form>
          </Card>
        </div>

        <div className="mt-6 sm:mt-8 text-center px-4">
          <p className="text-xs sm:text-sm text-gray-600">
            ðŸ”’ Tus datos están protegidos y serán usados únicamente para mejorar nuestro servicio
          </p>
        </div>
      </div>
    </div>
  );
}




