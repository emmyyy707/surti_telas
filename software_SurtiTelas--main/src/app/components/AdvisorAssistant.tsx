import { useState } from 'react';
import { MessageCircle, Clock, User, Zap, Send, ChevronDown, ChevronUp, Sparkles, Heart, Star } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Employee, CartItem, Product } from '../types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface AdvisorAssistantProps {
  advisor: Employee;
  cartItems: CartItem[];
  recommendedProducts: Product[];
  onAddProduct: (product: Product) => void;
}

export function AdvisorAssistant({ 
  advisor, 
  cartItems, 
  recommendedProducts,
  onAddProduct 
}: AdvisorAssistantProps) {
  const [question, setQuestion] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  // Safety check
  if (!advisor) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo':
        return 'bg-green-500';
      case 'ocupado':
        return 'bg-orange-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'activo':
        return 'En línea';
      case 'ocupado':
        return 'Ocupado';
      default:
        return 'Desconectado';
    }
  };

  const generateCartSummary = () => {
    let message = `Â¡Hola! Estoy interesado en estas camisetas:\n\n`;
    
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}\n`;
      message += `   • Talla: ${item.size}\n`;
      message += `   • Color: ${item.color}\n`;
      message += `   • Cantidad: ${item.quantity}\n`;
      message += `   • Precio: $${(item.product.price * item.quantity).toLocaleString()}\n\n`;
    });

    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const total = subtotal * 1.19;

    message += `ðŸ’° Total (con IVA): $${total.toLocaleString()}\n\n`;
    message += `Â¿Me ayudas con el pago o el envío?`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppContact = () => {
    const whatsappNumber = advisor.phone.replace(/[^0-9]/g, '');
    const message = generateCartSummary();
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const handleQuoteRequest = () => {
    const whatsappNumber = advisor.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hola ${advisor.name}, me gustaría solicitar una cotización antes de comprar. Â¿Podrías ayudarme?`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const handleSendQuestion = () => {
    if (!question.trim()) return;
    
    const whatsappNumber = advisor.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hola ${advisor.name}, tengo una consulta: ${question}`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    setQuestion('');
  };

  return (
    <Card className="overflow-hidden border-2 border-purple-100 bg-gradient-to-br from-purple-50 via-pink-50 to-white shadow-lg">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="relative">
                <MessageCircle className="h-5 w-5 text-purple-600" />
                <Sparkles className="h-3 w-3 text-pink-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h3 className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                âœ¨ Tu Asesor Personal
              </h3>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-purple-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-purple-500" />
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            {/* Perfil del Asesor */}
            <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-white rounded-2xl p-5 shadow-xl overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
              
              <div className="relative flex items-start gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm overflow-hidden flex items-center justify-center ring-4 ring-white/30 shadow-xl">
                    {advisor.avatar ? (
                      <ImageWithFallback
                        src={advisor.avatar}
                        alt={advisor.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-3 border-white ${getStatusColor(
                      advisor.status
                    )} shadow-lg animate-pulse`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base">{advisor.name}</h4>
                    <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                  </div>
                  <p className="text-xs text-purple-100 mb-2">ðŸ’¼ Asesor Especializado en Ventas</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge
                      variant="outline"
                      className="text-xs bg-white/20 backdrop-blur-sm border-white/30 text-white shadow-lg"
                    >
                      {getStatusText(advisor.status)}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs text-purple-100 bg-white/10 backdrop-blur-sm rounded-full px-2.5 py-1">
                      <Clock className="h-3 w-3" />
                      <span>Lun-Vie, 8am-6pm</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats decoration */}
              <div className="flex items-center justify-around mt-4 pt-4 border-t border-white/20">
                <div className="text-center">
                  <p className="text-xs text-purple-100">Ventas</p>
                  <p className="text-sm">{advisor.ordersCompleted}+</p>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="text-center">
                  <p className="text-xs text-purple-100">Calificación</p>
                  <p className="text-sm">â­ 4.9</p>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="text-center">
                  <p className="text-xs text-purple-100">Experiencia</p>
                  <p className="text-sm">
                    {Math.floor(
                      (new Date().getTime() - new Date(advisor.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
                    )} meses
                  </p>
                </div>
              </div>
            </div>

            {/* Resumen del Carrito para el Asesor */}
            {cartItems.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-blue-500 rounded-lg p-1.5">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-sm">Tu Carrito ðŸ›ï¸</p>
                </div>
                <div className="space-y-2 mb-3">
                  {cartItems.slice(0, 3).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-xs bg-white rounded-lg p-2.5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <ImageWithFallback
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 ring-2 ring-blue-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs">{item.product.name}</p>
                          <p className="text-xs text-gray-500">
                            {item.size} • {item.color} • <span className="text-blue-600">x{item.quantity}</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-xs ml-2">
                        ${(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {cartItems.length > 3 && (
                    <p className="text-xs text-gray-600 text-center bg-blue-50 py-2 rounded-lg">
                      +{cartItems.length - 3} producto(s) más ðŸ“¦
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleWhatsAppContact}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xs h-9 shadow-lg hover:shadow-xl transition-all"
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-2" />
                  ðŸ’¬ Enviar por WhatsApp
                </Button>
              </div>
            )}

            {/* Opciones de Contacto */}
            <div className="space-y-3">
              <Button
                onClick={handleQuoteRequest}
                variant="outline"
                className="w-full text-xs h-10 border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all"
              >
                <span className="mr-2">ðŸ’°</span>
                Solicitar Cotización Personalizada
              </Button>

              <div className="space-y-2 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
                <label className="text-xs flex items-center gap-2">
                  <Heart className="h-3.5 w-3.5 text-pink-500" />
                  <span>Â¿Tienes alguna pregunta?</span>
                </label>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ej: Â¿Tienen talla XL disponible en negro?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="text-xs resize-none h-20 border-2 focus:border-purple-300 rounded-lg"
                  />
                </div>
                <Button
                  onClick={handleSendQuestion}
                  disabled={!question.trim()}
                  className="w-full bg-gradient-to-r from-gray-900 to-gray-700 hover:from-black hover:to-gray-800 text-white text-xs h-9 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5 mr-2" />
                  Enviar Pregunta
                </Button>
              </div>
            </div>

            {/* Recomendaciones del Asesor */}
            {recommendedProducts.length > 0 && (
              <div className="border-t-2 border-dashed border-purple-200 pt-4">
                <div className="flex items-center gap-2 mb-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-2">
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg p-1.5">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs">Sugerencias de {advisor.name.split(' ')[0]}</h4>
                    <p className="text-xs text-gray-600">Perfecto para ti ðŸ’«</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {recommendedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 ring-2 ring-amber-200 shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate mb-1">{product.name}</p>
                        <p className="text-sm">${product.price.toLocaleString()}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onAddProduct(product)}
                        className="bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-900 hover:to-black h-8 text-xs px-3 shadow-md hover:shadow-lg transition-all"
                      >
                        + Agregar
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-3 text-center">
                  <p className="text-xs text-amber-900">
                    ðŸ’¡ <span className="font-medium">Tip:</span> Combina estos productos con tu compra
                  </p>
                </div>
              </div>
            )}

            {/* Respuesta Automática */}
            <div className="bg-gradient-to-r from-slate-100 to-gray-100 rounded-xl p-3.5 text-xs border-2 border-slate-200 shadow-sm">
              <div className="flex items-start gap-2">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-full p-1.5 shadow-md">
                  <MessageCircle className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1">
                  <p className="mb-1.5 flex items-center gap-1.5">
                    <span className="text-xs">ðŸ¤– Respuesta automática</span>
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed bg-white rounded-lg p-2 shadow-sm">
                    "Â¡Hola! ðŸ‘‹ Soy <span className="text-purple-600">{advisor.name}</span>. He recibido tu mensaje y te responderé muy pronto. 
                    Nuestro horario es <span className="text-purple-600">Lun-Vie, 8am-6pm</span>. Â¡Estoy aquí para ayudarte! ðŸ’œ"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}



