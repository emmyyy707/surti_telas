import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Sparkles, Heart, ShoppingBag, Star } from 'lucide-react';
import { FilterDrawer, type FilterState } from '@presentation/pages/components/FilterDrawer';
import { ProductDetailModal } from '@presentation/components/ProductDetailModal';
import { toast } from 'sonner';
import '../styles/CatalogPage.css';
import { Tooltip } from '@/shared/components/Tooltip';
import { catalogApi } from '@/infrastructure/api/catalogApi';
import { useServerPagination } from '@/hooks/useServerPagination';
import type { Producto as ProductoCore } from '@/core/types';

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  imagen: string;
  marca?: string;
  tallas?: string[];
  color?: string;
  disponible: boolean;
  destacado?: boolean;
  nuevo?: boolean;
  rating?: number;
}

const formatPrice = (price: number) => `$${price.toLocaleString('es-CO')}`;

const FAVORITES_STORAGE_KEY = 'surtitelas.favorites';

const readFavoriteIds = () => {
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) as string[] : [];
    return Array.isArray(parsed) ? parsed.filter(id => typeof id === 'string' && id.trim() !== '') : [];
  } catch {
    return [];
  }
};

const writeFavoriteIds = (favoriteIds: string[]) => {
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
};

const mapProducto = (p: ProductoCore): Producto => ({
  id: p.id || p.ref,
  nombre: p.nombre,
  categoria: p.categoria || 'General',
  precio: p.precio,
  imagen: p.imagenPrincipal || (p.imagenes && p.imagenes[0]) || '',
  marca: p.marca,
  tallas: p.tallas,
  color: (p.colores && p.colores[0]) || undefined,
  disponible: (p.publicado ?? false) && p.stock !== 'Agotado',
  destacado: p.destacado,
  nuevo: p.nuevo,
  rating: undefined,
});

const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtrosAbierto, setFiltrosAbierto] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [marcaActiva, setMarcaActiva] = useState('Todas');
  const [filtrosAvanzados, setFiltrosAvanzados] = useState<FilterState>({ tallas: [], marcas: [], categoriasEspeciales: [] });
  const [allProducts, setAllProducts] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const pagination = useServerPagination(12);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query: Record<string, string | number | boolean | undefined | null> = {
        page: pagination.page,
        limit: pagination.limit,
        sort: 'createdAt',
        order: 'desc',
      };
      if (searchTerm.trim()) query.search = searchTerm.trim();
      if (categoriaActiva !== 'Todas') query.categoria = categoriaActiva;
      if (marcaActiva !== 'Todas') query.marca = marcaActiva;

      const result = await catalogApi.list(query);
      const mapped = result.data.map(mapProducto);
      
      if (pagination.page === 1) {
        setAllProducts(mapped);
      } else {
        setAllProducts(prev => [...prev, ...mapped]);
      }
      
      pagination.setTotalRecords(result.meta.totalRecords);
    } catch {
      setError('No se pudieron cargar los productos');
      toast.error('No se pudieron cargar los productos');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, searchTerm, categoriaActiva, marcaActiva, pagination.setTotalRecords]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  useEffect(() => { setFavoriteIds(readFavoriteIds()); }, []);

  const categoriasUnicas = useMemo(() => { const cats = new Set(allProducts.map(p => p.categoria)); return ['Todas', ...Array.from(cats)]; }, [allProducts]);

  const productosFiltrados = useMemo(() => {
    return allProducts.filter(p => {
      const matchCategoria = categoriaActiva === 'Todas' || p.categoria === categoriaActiva;
      const matchMarca = marcaActiva === 'Todas' || p.marca === marcaActiva;
      const matchTalla = filtrosAvanzados.tallas.length === 0 || (p.tallas && p.tallas.some(t => filtrosAvanzados.tallas.includes(t)));
      const matchCategoriaEspecial = filtrosAvanzados.categoriasEspeciales.length === 0 || p.categoria.toLowerCase().includes(filtrosAvanzados.categoriasEspeciales[0]?.toLowerCase() || '');
      return matchCategoria && matchMarca && matchTalla && matchCategoriaEspecial;
    });
  }, [allProducts, categoriaActiva, marcaActiva, filtrosAvanzados]);

  const handleClearSearch = () => setSearchTerm('');
  const handleAddToCart = (product: Producto) => { setSelectedProduct(product); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedProduct(null); };
  const handleApplyFilters = (filters: FilterState) => setFiltrosAvanzados(filters);
  const handleResetFilters = () => { setCategoriaActiva('Todas'); setMarcaActiva('Todas'); setFiltrosAvanzados({ tallas: [], marcas: [], categoriasEspeciales: [] }); setSearchTerm(''); };
  const handleLoadMore = () => pagination.setPage(pagination.page + 1);
  const toggleFavorite = (producto: Producto) => {
    setFavoriteIds(current => {
      const exists = current.includes(producto.id);
      const next = exists ? current.filter(id => id !== producto.id) : [...current, producto.id];
      writeFavoriteIds(next);
      toast.success(exists ? 'Producto eliminado de favoritos' : 'Producto agregado a favoritos');
      return next;
    });
  };

  const countFiltrosActivos = () => { let count = 0; if (categoriaActiva !== 'Todas') count++; if (marcaActiva !== 'Todas') count++; count += filtrosAvanzados.tallas.length; count += filtrosAvanzados.marcas.length; count += filtrosAvanzados.categoriasEspeciales.length; return count; };
  const totalFiltrosActivos = countFiltrosActivos();

  const hasMore = useMemo(() => {
    if (pagination.page >= pagination.totalPages) return false;
    if (productosFiltrados.length === 0) return false;
    if (filtrosAvanzados.tallas.length > 0 || filtrosAvanzados.marcas.length > 0 || filtrosAvanzados.categoriasEspeciales.length > 0) {
      return false;
    }
    return true;
  }, [pagination.page, pagination.totalPages, productosFiltrados.length, filtrosAvanzados]);

  if (isLoading && pagination.page === 1) {
    return (
      <div className="catalog-page">
        <div className="catalog-hero"><div className="content"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-subtitle" /><div className="skeleton skeleton-search" /></div></div>
        <div className="products-section"><div className="products-grid">{[...Array(8)].map((_, i) => (<div key={i} className="product-card-skeleton"><div className="skeleton skeleton-img" /><div className="skeleton skeleton-text" /><div className="skeleton skeleton-text-short" /></div>))}</div></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="catalog-page">
        <div className="catalog-hero"><div className="content"><h1>Catálogo</h1><p className="text-red-500">{error}</p></div></div>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      {/* HERO SECTION CINEMATOGRÁFICO */}
      <section className="catalog-hero" data-testid="catalog-hero">
        <div className="hero-bg-overlay" />
        <div className="hero-decoration hero-dot-1" />
        <div className="hero-decoration hero-dot-2" />
        <div className="hero-decoration hero-line" />
        <div className="hero-decoration hero-shape-1" />
        <div className="hero-decoration hero-shape-2" />

        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>Colección Premium </span>
          </div>

          <h1 className="hero-title">
            Bienvenido a<br />
            <span className="title-highlight">Surticamisetas</span>
          </h1>

          <p className="hero-subtitle">
            Explora una colección premium diseñada para quienes buscan estilo, calidad y exclusividad.
          </p>

          {/* SEARCH EXPERIENCE PREMIUM */}
          <div className="hero-controls-row">
            <div className="glass-search-wrapper">
              <div className="glass-search-bar">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  className="glass-search-input"
                  placeholder="Buscar productos, marcas, categorías..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="glass-clear-btn" onClick={handleClearSearch}>
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <button
              className="filter-toggle-btn"
              onClick={() => setFiltrosAbierto(true)}
              data-active={totalFiltrosActivos > 0}
            >
              <SlidersHorizontal size={20} />
              <span>Filtros</span>
              {totalFiltrosActivos > 0 && (
                <span className="filter-badge">{totalFiltrosActivos}</span>
              )}
            </button>
          </div>
        </div>
      </section>

      <section className="category-section">
        <div className="category-pills-container">
          <div className="category-pills-scroll">
            {categoriasUnicas.map(cat => (<button key={cat} className={`category-pill ${categoriaActiva === cat ? 'active' : ''}`} onClick={() => setCategoriaActiva(cat)}>{cat}</button>))}
          </div>
        </div>
      </section>

      <section className="controls-section">
        <div className="catalog-controls-bar">
          <div className="controls-left"><span className="results-count">{productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}</span></div>
          <div className="controls-right">
            <button className="mobile-filter-btn" onClick={() => setFiltrosAbierto(true)}><SlidersHorizontal size={18} /><span>Filtros {totalFiltrosActivos > 0 && `(${totalFiltrosActivos})`}</span></button>
            <Tooltip title="Ver carrito"><button className="nav-to-cart-btn" onClick={() => navigate('/carrito')}>
              <ShoppingBag size={18} />
              <span>Ver carrito</span>
            </button></Tooltip>
          </div>
        </div>
      </section>

      <section className="products-section" data-testid="products-grid">
        {productosFiltrados.length === 0 ? (
          <div className="empty-catalog">
            <div className="empty-icon"><Search size={48} /></div>
            <h3>No se encontraron productos</h3>
            <p>Intenta ajustar tus filtros o terminos de búsqueda</p>
            <button className="btn-reset-filters" onClick={handleResetFilters}>Ver todos los productos</button>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {productosFiltrados.map((producto, idx) => (
                <article
                  key={producto.id}
                  className="premium-product-card"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  onClick={() => producto.disponible && handleAddToCart(producto)}
                >
                <div className="card-image-wrapper">
                  <img src={producto.imagen} alt={producto.nombre} className="card-image" loading="lazy" />
                  <div className="card-badges">
                    {producto.destacado && (<span className="badge-destacado"><Sparkles size={10} />Destacado</span>)}
                    {producto.nuevo && (<span className="badge-nuevo">Nuevo</span>)}
                    {!producto.disponible && (<span className="badge-agotado">Agotado</span>)}
                  </div>
                  <div className="card-actions">
                    <button className={`action-btn wishlist-btn ${favoriteIds.includes(producto.id) ? 'active' : ''}`} aria-label={favoriteIds.includes(producto.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'} onClick={(e) => { e.stopPropagation(); toggleFavorite(producto); }}><Heart size={18} fill={favoriteIds.includes(producto.id) ? 'currentColor' : 'none'} /></button>
                    <button className="action-btn cart-btn" aria-label="Agregar al carrito" disabled={!producto.disponible} onClick={(e) => { e.stopPropagation(); handleAddToCart(producto); }}><ShoppingBag size={18} /></button>
                  </div>
                  <div className="card-overlay" />
                </div>
                {/* INFO CARD PREMIUM */}
                <div className="card-info">
                  <div className="card-meta">
                    <span className="card-category">{producto.categoria}</span>
                    {producto.marca && (
                      <span className="card-brand">{producto.marca}</span>
                    )}
                  </div>

                  <h3 className="card-title">{producto.nombre}</h3>

                  {/* RATING STARS */}
                  {producto.rating && (
                    <div className="card-rating">
                      <div className="rating-stars">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < Math.floor(producto.rating!) ? 'currentColor' : 'none'}
                            className={i < Math.floor(producto.rating!) ? 'star-filled' : 'star-empty'}
                          />
                        ))}
                      </div>
                      <span className="rating-value">{producto.rating}</span>
                    </div>
                  )}

                  <div className="card-footer">
                    <span className="card-price">{formatPrice(producto.precio)}</span>
                    {producto.disponible && producto.tallas && (
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
                </div>
              </article>
              ))}
            </div>
            {hasMore && (
              <div className="load-more-container">
                <button className="load-more-btn" onClick={handleLoadMore} disabled={isLoading}>
                  {isLoading ? 'Cargando...' : 'Cargar más productos'}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <FilterDrawer isOpen={filtrosAbierto} onClose={() => setFiltrosAbierto(false)} onApplyFilters={handleApplyFilters} />

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default CatalogPage;
