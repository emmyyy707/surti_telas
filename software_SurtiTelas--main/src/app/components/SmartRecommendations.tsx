import { useState } from 'react';
import { Sparkles, TrendingUp, Users, Star, ArrowRight, Send, Target, Zap } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Product } from '../types';
import { products as allProducts } from '../data/mockData';
import { toast } from 'sonner';

interface SmartRecommendationsProps {
  clientName: string;
  clientPhone: string;
  cartItems: Product[];
  onSendRecommendation: (products: Product[]) => void;
}

interface RecommendationRule {
  id: string;
  title: string;
  description: string;
  icon: typeof Sparkles;
  products: Product[];
  reason: string;
  badge: string;
  color: string;
}

export function SmartRecommendations({ clientName, clientPhone, cartItems, onSendRecommendation }: SmartRecommendationsProps) {
  // Algoritmo de recomendaciones inteligentes
  const getRecommendations = (): RecommendationRule[] => {
    const rules: RecommendationRule[] = [];

    // Regla 1: Complementarios por categoría
    const cartCategories = cartItems.map((item) => item.category);
    const complementaryProducts = allProducts.filter(
      (p) => cartCategories.includes(p.category) && !cartItems.find((c) => c.id === p.id)
    );

    if (complementaryProducts.length > 0) {
      rules.push({
        id: 'complementary',
        title: 'Productos Complementarios',
        description: 'Basado en la misma categoría que sus productos',
        icon: Target,
        products: complementaryProducts.slice(0, 3),
        reason: 'Misma categoría',
        badge: 'Alta relevancia',
        color: 'from-blue-500 to-cyan-500',
      });
    }

    // Regla 2: Más vendidos/populares (productos disponibles)
    const availableProducts = allProducts.filter((p) => p.stock > 0 && !cartItems.find((c) => c.product.id === p.id));

    if (availableProducts.length > 0) {
      rules.push({
        id: 'popular',
        title: 'Más Vendidos',
        description: 'Los favoritos de nuestros clientes',
        icon: TrendingUp,
        products: availableProducts.slice(0, 3),
        reason: 'Disponible',
        badge: 'Popular',
        color: 'from-orange-500 to-red-500',
      });
    }

    // Regla 3: Precio similar
    if (cartItems.length > 0) {
      const avgPrice = cartItems.reduce((sum, item) => sum + item.price, 0) / cartItems.length;
      const similarPriceProducts = allProducts.filter(
        (p) => Math.abs(p.price - avgPrice) <= 5000 && !cartItems.find((c) => c.id === p.id)
      );

      if (similarPriceProducts.length > 0) {
        rules.push({
          id: 'similar-price',
          title: 'Rango de Precio Similar',
          description: 'Productos en el mismo rango de precios',
          icon: Zap,
          products: similarPriceProducts.slice(0, 3),
          reason: 'Precio similar',
          badge: 'Buen precio',
          color: 'from-green-500 to-emerald-500',
        });
      }
    }

    // Regla 4: Cross-selling (diferentes categorías)
    const differentCategories = allProducts.filter(
      (p) => !cartCategories.includes(p.category) && !cartItems.find((c) => c.id === p.id)
    );

    if (differentCategories.length > 0) {
      rules.push({
        id: 'cross-sell',
        title: 'Amplía tu Colección',
        description: 'Productos de otras categorías que te pueden interesar',
        icon: Sparkles,
        products: differentCategories.slice(0, 3),
        reason: 'Variedad',
        badge: 'Descubre más',
        color: 'from-purple-500 to-pink-500',
      });
    }

    return rules;
  };

  const recommendations = getRecommendations();

  const handleSendRecommendation = (rule: RecommendationRule) => {
    const whatsappNumber = clientPhone.replace(/[^0-9]/g, '');
    const productList = rule.products.map((p, idx) => `${idx + 1}. ${p.name} - $${p.price.toLocaleString()}`).join('\\n');

    const message = `Hola ${clientName}! ðŸ‘‹\\n\\nâœ¨ ${rule.title}\\n${rule.description}\\n\\nTe recomiendo estos productos:\\n\\n${productList}\\n\\nÂ¿Te gustaría más información sobre alguno?`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');

    onSendRecommendation(rule.products);
    toast.success('Recomendación enviada', {
      description: `${rule.products.length} productos sugeridos a ${clientName}`,
    });
  };

  const handleSendCustomBundle = () => {
    const selectedProducts = allProducts.filter((p) => !cartItems.find((c) => c.id === p.id)).slice(0, 4);
    const whatsappNumber = clientPhone.replace(/[^0-9]/g, '');
    const productList = selectedProducts.map((p, idx) => `${idx + 1}. ${p.name} - $${p.price.toLocaleString()}`).join('\\n');
    const totalValue = selectedProducts.reduce((sum, p) => sum + p.price, 0);

    const message = `Hola ${clientName}! ðŸ‘‹\\n\\nðŸŽ PAQUETE PERSONALIZADO ESPECIAL\\n\\n${productList}\\n\\nValor total: $${totalValue.toLocaleString()}\\nðŸ’° Con 15% de descuento: $${(totalValue * 0.85).toLocaleString()}\\n\\nÂ¿Te interesa este paquete especial?`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');

    onSendRecommendation(selectedProducts);
    toast.success('Paquete personalizado enviado', {
      description: `Oferta especial enviada a ${clientName}`,
    });
  };

  if (recommendations.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-600">No hay recomendaciones disponibles en este momento</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg">Recomendaciones Inteligentes</h3>
            <p className="text-sm text-white/90">Sistema de sugerencias personalizadas para {clientName}</p>
          </div>
        </div>
      </Card>

      {/* Quick Action */}
      <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg p-2.5">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm">Paquete Personalizado</h4>
              <p className="text-xs text-gray-600">Crea una oferta especial con descuento</p>
            </div>
          </div>
          <Button
            onClick={handleSendCustomBundle}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar Paquete
          </Button>
        </div>
      </Card>

      {/* Recommendation Rules */}
      <div className="space-y-3">
        {recommendations.map((rule) => {
          const IconComponent = rule.icon;
          return (
            <Card key={rule.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`bg-gradient-to-r ${rule.color} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm">{rule.title}</h4>
                      <p className="text-xs text-white/90">{rule.description}</p>
                    </div>
                  </div>
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                    {rule.badge}
                  </Badge>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {rule.products.map((product) => (
                    <div key={product.id} className="group">
                      <div className="relative overflow-hidden rounded-lg mb-2 aspect-square">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant="outline" className="bg-white/90 text-xs">
                            ${(product.price / 1000).toFixed(0)}k
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs line-clamp-2">{product.name}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Target className="h-3.5 w-3.5" />
                    <span>{rule.reason}</span>
                    <span>•</span>
                    <span>{rule.products.length} productos</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSendRecommendation(rule)}
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    Enviar por WhatsApp
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card className="p-4 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl">{recommendations.length}</p>
            <p className="text-xs text-gray-600">Reglas activas</p>
          </div>
          <div>
            <p className="text-2xl">{recommendations.reduce((sum, r) => sum + r.products.length, 0)}</p>
            <p className="text-xs text-gray-600">Productos sugeridos</p>
          </div>
          <div>
            <p className="text-2xl">
              ${(
                recommendations.reduce((sum, r) => sum + r.products.reduce((s, p) => s + p.price, 0), 0) / 1000
              ).toFixed(0)}k
            </p>
            <p className="text-xs text-gray-600">Valor potencial</p>
          </div>
        </div>
      </Card>
    </div>
  );
}



