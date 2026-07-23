import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onToggleFavorite?: (productId: string) => void;
}

export function ProductCard({ product, onViewDetails, onToggleFavorite }: ProductCardProps) {
  const [isFavoriteHover, setIsFavoriteHover] = useState(false);
  
  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : null;

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all duration-300">
      {/* Imagen */}
      <div className="relative aspect-square bg-[#F5F5F5] overflow-hidden">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badge de Oferta */}
        {product.isOnSale && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-[#1A1A1A] text-white px-3 py-1 text-xs font-medium">
              OFERTA
            </Badge>
          </div>
        )}

        {/* Ícono de Favorito */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(product.id);
          }}
          onMouseEnter={() => setIsFavoriteHover(true)}
          onMouseLeave={() => setIsFavoriteHover(false)}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-md"
        >
          <Heart
            className={`h-5 w-5 transition-all duration-200 ${
              product.isFavorite
                ? 'fill-red-500 text-red-500'
                : isFavoriteHover
                ? 'fill-gray-300 text-gray-600'
                : 'text-gray-600'
            }`}
          />
        </button>

        {/* Indicador de Stock Bajo */}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-yellow-500 text-white px-3 py-1 text-xs">
              Â¡Últimas {product.stock} unidades!
            </Badge>
          </div>
        )}

        {/* Sin Stock */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge className="bg-white text-black px-4 py-2">
              Agotado
            </Badge>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5">
        {/* Categoría */}
        <Badge variant="outline" className="mb-3 capitalize text-[#3A3A3A] border-[#E5E5E5]">
          {product.category}
        </Badge>

        {/* Nombre del Producto */}
        <h3 className="text-base font-medium text-black mb-2 line-clamp-1">
          {product.name}
        </h3>

        {/* Descripción */}
        <p className="text-sm text-[#3A3A3A] mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Precio */}
        <div className="mb-4">
          {discountedPrice ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-medium text-black">
                ${discountedPrice.toLocaleString()}
              </span>
              <span className="text-sm text-[#3A3A3A] line-through">
                ${product.price.toLocaleString()}
              </span>
              <Badge className="bg-red-500 text-white text-xs px-2 py-0.5">
                -{product.discount}%
              </Badge>
            </div>
          ) : (
            <span className="text-2xl font-medium text-black">
              ${product.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Botón Agregar al Carrito */}
        <Button
          onClick={() => onViewDetails(product)}
          disabled={product.stock === 0}
          className="w-full bg-black text-white hover:bg-[#1A1A1A] disabled:bg-[#E5E5E5] disabled:text-[#3A3A3A] transition-colors duration-200 rounded-lg py-6"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
        </Button>
      </div>
    </div>
  );
}




