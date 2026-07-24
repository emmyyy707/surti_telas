import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Heart, ShoppingBag, X, AlertTriangle, PackageSearch, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { useCart } from '@/core/stores/cartStore';
import type { Producto } from '@/core/types';
import { favoritesApi } from '@/infrastructure/api/favoritesApi';
import s from './Favoritos.module.css';

const _FAVORITES_STORAGE_KEY = 'surtitelas.favorites';

const formatCurrency = (value: number) => `$${value.toLocaleString('es-CO')}`;

const toFavoriteSnapshot = (product: Producto) => ({
  id: product.id || product.ref,
  ref: product.ref,
  nombre: product.nombre,
  precio: product.precio,
  imagenPrincipal: product.imagenPrincipal,
  imagenes: product.imagenes,
  categoria: product.categoria,
  stock: product.stock,
  cantidadStock: product.cantidadStock,
});

export const Favoritos: React.FC = () => {
  const { addToCart } = useCart();
  const [favorites, setFavorites] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productToRemove, setProductToRemove] = useState<ReturnType<typeof toFavoriteSnapshot> | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await favoritesApi.list();
        setFavorites(data);
      } catch {
        setError('No se pudieron cargar tus favoritos. Intenta nuevamente.');
        toast.error('Error al cargar favoritos');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const favoriteProducts = useMemo(() => favorites.map(toFavoriteSnapshot), [favorites]);

  const removeFavorite = () => {
    if (!productToRemove) return;

    favoritesApi.toggle(productToRemove.id);
    setFavorites(current => current.filter(p => p.id !== productToRemove.id));

    toast.success(`${productToRemove.nombre} eliminado de favoritos`);
    setProductToRemove(null);
  };

  const handleAddToCart = (product: ReturnType<typeof toFavoriteSnapshot>) => {
    if (product.stock === 'Agotado' || product.cantidadStock <= 0) {
      toast.error('Este producto no tiene stock disponible');
      return;
    }

    addToCart({
      cartId: product.id,
      nombre: product.nombre,
      precio: product.precio,
      imagen: product.imagenPrincipal || product.imagenes[0] || '',
      categoria: product.categoria || 'Catálogo',
      talla: 'Única',
      color: 'Único',
      stock: product.cantidadStock || 99,
      quantity: 1,
    });

    toast.success(`${product.nombre} agregado al carrito`);
  };

  if (loading) {
    return (
      <div className={s.favoritesPage}>
        <div className={s.loadingState}>
          <Loader2 size={28} className={s.loadingSpinner} />
          <span>Cargando tus favoritos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={s.favoritesPage}>
        <div className={s.errorState}>
          <AlertCircle size={28} />
          <span>{error}</span>
          <Button variant="secondary" onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={s.favoritesPage}>
      <header className={s.pageHeader}>
        <div>
          <p className={s.eyebrow}>Wishlist</p>
          <h1 className={s.pageTitle}>Mis Favoritos</h1>
          <p className={s.pageSubtitle}>Prendas que guardaste con corazón para comprarlas más rápido.</p>
        </div>
        <div className={s.countPill}>{favoriteProducts.length} {favoriteProducts.length === 1 ? 'producto' : 'productos'}</div>
      </header>

      {favoriteProducts.length === 0 ? (
        <div className={s.emptyState}>
          <div className={s.emptyIcon}><PackageSearch size={34} /></div>
          <h2>Aún no tienes favoritos</h2>
          <p>Explora el catálogo y toca el corazón de las prendas que quieras guardar.</p>
        </div>
      ) : (
        <section className={s.favoritesGrid}>
          {favoriteProducts.map(product => (
            <article key={product.id} className={s.favoriteCard}>
              <div className={s.favoriteTopActions}>
                <button
                  className={s.heartButton}
                  type="button"
                  aria-label={`Eliminar ${product.nombre} de favoritos`}
                  onClick={() => setProductToRemove(product)}
                >
                  <Heart size={18} fill="currentColor" />
                </button>
              </div>

              <div className={s.productImageWrapper}>
                {product.imagenPrincipal || product.imagenes[0] ? (
                  <img src={product.imagenPrincipal || product.imagenes[0]} alt={product.nombre} loading="lazy" />
                ) : (
                  <div className={s.placeholderImage}><PackageSearch size={28} /></div>
                )}
              </div>

              <div className={s.productInfo}>
                <span className={s.category}>{product.categoria || 'Producto'}</span>
                <h3>{product.nombre}</h3>
                <p>Ref. {product.ref}</p>
                <strong>{formatCurrency(product.precio)}</strong>
              </div>

              <Button
                variant="primary"
                size="md"
                className={s.addToCartButton}
                disabled={product.stock === 'Agotado' || product.cantidadStock <= 0}
                onClick={() => handleAddToCart(product)}
                leftIcon={<ShoppingBag size={16} />}
              >
                Agregar al Carrito
              </Button>
            </article>
          ))}
        </section>
      )}

      <Modal
        open={!!productToRemove}
        onClose={() => setProductToRemove(null)}
        title="Eliminar de favoritos"
        description="Confirma si quieres quitar esta prenda de tu lista de deseos."
        size="sm"
        footer={(
          <div className={s.modalActions}>
            <Button variant="ghost" onClick={() => setProductToRemove(null)}>Cancelar</Button>
            <Button variant="danger" onClick={removeFavorite} leftIcon={<X size={16} />}>
              Quitar Favorito
            </Button>
          </div>
        )}
      >
        {productToRemove && (
          <div className={s.removePreview}>
            <div className={s.removeIcon}><AlertTriangle size={24} /></div>
            <div>
              <strong>{productToRemove.nombre}</strong>
              <span>Ref. {productToRemove.ref} • {formatCurrency(productToRemove.precio)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
