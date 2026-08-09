import React, { memo, useState, useCallback } from 'react';
import { Heart, ShoppingBag, Sparkles, Star } from 'lucide-react';
import type { Producto as ProductoCore } from '@/core/types';
import s from './ProductCard.module.css';
import { resolveColor } from '@/shared/utils/colorUtils';

const formatPrice = (price: number) => `$${price.toLocaleString('es-CO')}`;

const getProductImage = (producto: ProductoCore) =>
  producto.imagenPrincipal && producto.imagenPrincipal.trim() !== ''
    ? producto.imagenPrincipal
    : (producto.imagenes && producto.imagenes[0]) || '';

const isProductAvailable = (producto: ProductoCore) =>
  (producto.publicado ?? false) && producto.stock !== 'Agotado';

interface ProductCardProps {
  producto: ProductoCore;
  isFavorite: boolean;
  onToggleFavorite: (product: ProductoCore) => void;
  onOpenDetail: (product: ProductoCore) => void;
  animationDelay?: number;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ producto, isFavorite, onToggleFavorite, onOpenDetail, animationDelay = 0 }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const disponible = isProductAvailable(producto);
  const imagen = getProductImage(producto);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(producto);
  }, [onToggleFavorite, producto]);

  const handleCartClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (disponible) {
      onOpenDetail(producto);
    }
  }, [onOpenDetail, disponible]);

  const handleCardClick = useCallback(() => {
    if (disponible) {
      onOpenDetail(producto);
    }
  }, [onOpenDetail, disponible]);

  return (
    <article
      className="premium-product-card"
      style={{ animationDelay: `${animationDelay}s` }}
      onClick={handleCardClick}
      tabIndex={disponible ? 0 : -1}
      onKeyDown={(e) => { if (e.key === 'Enter' && disponible) handleCardClick(); }}
    >
      <div className="card-image-wrapper">
        {!imageLoaded && <div className="card-image-skeleton" />}
        <img
          src={imagen}
          alt={producto.nombre}
          className="card-image"
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
        {producto.imagenes && producto.imagenes.length > 1 && (
          <div className="card-image-thumbs">
            {producto.imagenes.slice(1, 5).map((thumb, i) => (
              <img
                key={i}
                src={thumb}
                alt={`${producto.nombre} vista ${i + 2}`}
                className="card-thumb"
                loading="lazy"
              />
            ))}
          </div>
        )}
        <div className="card-badges">
          {producto.destacado && (
            <span className="badge-destacado"><Sparkles size={10} />Destacado</span>
          )}
          {producto.nuevo && (
            <span className="badge-nuevo">Nuevo</span>
          )}
          {!disponible && (
            <span className="badge-agotado">Agotado</span>
          )}
        </div>
        <div className="card-actions">
          <button
            className={`action-btn wishlist-btn ${isFavorite ? 'active' : ''}`}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            onClick={handleFavoriteClick}
            type="button"
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button
            className="action-btn cart-btn"
            aria-label="Agregar al carrito"
            disabled={!disponible}
            onClick={handleCartClick}
            type="button"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
        <div className="card-overlay" />
      </div>
      <div className="card-info">
        <div className="card-meta">
          <span className="card-category">{producto.categoria}</span>
          {producto.marca && (
            <span className="card-brand">{producto.marca}</span>
          )}
        </div>

        <h3 className="card-title">{producto.nombre}</h3>

        <div className="card-footer">
          <span className="card-price">{formatPrice(producto.precio)}</span>
          {disponible && producto.tallas && producto.tallas.length > 0 && (
            <div className="card-tallas">
              {producto.tallas.slice(0, 3).map(t => (
                <span key={t} className="talla-tag">{t}</span>
              ))}
              {producto.tallas.length > 3 && (
                <span className="talla-more">+{producto.tallas.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {producto.colores && producto.colores.length > 0 && (
          <div className="card-colores">
            {producto.colores.map(c => {
              const resolved = resolveColor(c);
              return (
                <span key={c} className="color-tag" style={resolved ? { backgroundColor: resolved.value, color: resolved.value === '#fafafa' || resolved.value === '#ffffff' ? '#000' : '#fff' } : undefined}>
                  {resolved ? resolved.label : c}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
