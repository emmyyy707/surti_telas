import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Sparkles, Grid3X3, Heart, ShoppingBag, Star } from 'lucide-react';
import { FilterDrawer, type FilterState } from '@presentation/pages/components/FilterDrawer';
import { ProductDetailModal } from '@presentation/components/ProductDetailModal';
import '../styles/CatalogPage.css';

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

const PRODUCTOS_DEMO: Producto[] = [
  { id: '1', nombre: 'Camiseta Premium Cotton', categoria: 'Camisetas', precio: 45000, imagen: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800', marca: 'Nike', tallas: ['S','M','L','XL'], color: 'Blanco', disponible: true, destacado: true, nuevo: false, rating: 4.8 },
  { id: '2', nombre: 'Polo Tech Dry Fit', categoria: 'Polos', precio: 52000, imagen: 'https://images.unsplash.com/photo-1625910513413-5fc45e77b1b8?q=80&w=800', marca: 'Adidas', tallas: ['M','L','XL'], color: 'Negro', disponible: true, destacado: true, nuevo: true, rating: 4.9 },
  { id: '3', nombre: 'Hoodie Urban Collection', categoria: 'Sudaderas', precio: 85000, imagen: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800', marca: 'Puma', tallas: ['S','M','L','XL','XXL'], color: 'Gris', disponible: true, destacado: false, nuevo: false, rating: 4.7 },
  { id: '4', nombre: 'T-Shirt Classic Fit', categoria: 'Camisetas', precio: 38000, imagen: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=800', marca: 'Reebok', tallas: ['S','M','L'], color: 'Azul', disponible: true, destacado: false, nuevo: true, rating: 4.6 },
  { id: '5', nombre: 'Jacket Windbreaker Pro', categoria: 'Chaquetas', precio: 120000, imagen: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800', marca: 'Under Armour', tallas: ['M','L','XL'], color: 'Verde', disponible: false, destacado: true, nuevo: false, rating: 4.9 },
  { id: '6', nombre: 'Crop Top Athletic', categoria: 'Blusas', precio: 42000, imagen: 'https://images.unsplash.com/photo-1572715252129-61988a807672?q=80&w=800', marca: 'Nike', tallas: ['XS','S','M'], color: 'Rosa', disponible: true, destacado: false, nuevo: true, rating: 4.5 },
  { id: '7', nombre: 'Pantaloneta Training', categoria: 'Pantalonetas', precio: 68000, imagen: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800', marca: 'Adidas', tallas: ['S','M','L','XL'], color: 'Negro', disponible: true, destacado: false, nuevo: false, rating: 4.8 },
  { id: '8', nombre: 'Tee Minimalist Black', categoria: 'Camisetas', precio: 35000, imagen: 'https://images.unsplash.com/photo-1581655353687-56206c7970d5?q=80&w=800', marca: 'Puma', tallas: ['S','M','L'], color: 'Negro', disponible: true, destacado: false, nuevo: false, rating: 4.4 },
  { id: '9', nombre: 'Sports Bra Elite', categoria: 'Deporte', precio: 75000, imagen: 'https://images.unsplash.com/photo-1576678927586-0c1b2e0a1b0a?q=80&w=800', marca: 'Nike', tallas: ['S','M','L'], color: 'Rojo', disponible: true, destacado: true, nuevo: true, rating: 4.7 },
  { id: '10', nombre: 'Leggings Power Stretch', categoria: 'Deporte', precio: 95000, imagen: 'https://images.unsplash.com/photo-1594633312532-aea7c9b2b5c5?q=80&w=800', marca: 'Adidas', tallas: ['XS','S','M','L'], color: 'Negro', disponible: true, destacado: false, nuevo: true, rating: 4.8 },
  { id: '11', nombre: 'Tank Top Summer', categoria: 'Camisetas', precio: 32000, imagen: 'https://images.unsplash.com/photo-1562157873-818bc0725df6?q=80&w=800', marca: 'Reebok', tallas: ['S','M','L','XL'], color: 'Verde', disponible: true, destacado: false, nuevo: false, rating: 4.3 },
  { id: '12', nombre: 'Sweatshirt Oversized', categoria: 'Sudaderas', precio: 78000, imagen: 'https://images.unsplash.com/photo-1608612991346-a6f9cbd2d5c3?q=80&w=800', marca: 'Puma', tallas: ['S','M','L','XL'], color: 'Azul Marino', disponible: true, destacado: true, nuevo: false, rating: 4.6 },
  { id: '13', nombre: 'Vestido Fitness', categoria: 'Vestidos', precio: 110000, imagen: 'https://images.unsplash.com/photo-1595665593695-9bea330b7d9e?q=80&w=800', marca: 'Nike', tallas: ['S','M','L'], color: 'Rosa', disponible: true, destacado: false, nuevo: true, rating: 4.9 },
  { id: '14', nombre: 'Camisa Polo Vintage', categoria: 'Polos', precio: 65000, imagen: 'https://images.unsplash.com/photo-1589310243389-96bedf0eaae1?q=80&w=800', marca: 'Adidas', tallas: ['M','L','XL'], color: 'Amarillo', disponible: true, destacado: false, nuevo: false, rating: 4.5 },
  { id: '15', nombre: 'Bomber Jacket Street', categoria: 'Chaquetas', precio: 150000, imagen: 'https://images.unsplash.com/photo-1551024601-bec79cee3d95?q=80&w=800', marca: 'Under Armour', tallas: ['S','M','L','XL'], color: 'Cafe', disponible: true, destacado: true, nuevo: true, rating: 4.8 },
  { id: '16', nombre: 'Shorts Cargo Men', categoria: 'Shorts', precio: 55000, imagen: 'https://images.unsplash.com/photo-1605348954290-c6f9a9b2e0c3?q=80&w=800', marca: 'Nike', tallas: ['S','M','L','XL'], color: 'Olive', disponible: true, destacado: false, nuevo: false, rating: 4.4 }
];

const formatPrice = (price: number) => `$${price.toLocaleString('es-CO')}`;

const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtrosAbierto, setFiltrosAbierto] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [marcaActiva, setMarcaActiva] = useState('Todas');
  const [filtrosAvanzados, setFiltrosAvanzados] = useState<FilterState>({ tallas: [], marcas: [], categoriasEspeciales: [] });
  const [productos] = useState<Producto[]>(PRODUCTOS_DEMO);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleProducts, setVisibleProducts] = useState(8);

  useEffect(() => { const timer = setTimeout(() => setIsLoading(false), 800); return () => clearTimeout(timer); }, []);
  useEffect(() => { setVisibleProducts(8); }, [searchTerm, categoriaActiva, marcaActiva, filtrosAvanzados]);

  const categoriasUnicas = useMemo(() => { const cats = new Set(productos.map(p => p.categoria)); return ['Todas', ...Array.from(cats)]; }, [productos]);
  const marcasUnicas = useMemo(() => { const marcs = new Set(productos.map(p => p.marca).filter(Boolean)); return ['Todas', ...Array.from(marcs) as string[]]; }, [productos]);

  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      const matchSearch = searchTerm === '' || p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || p.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategoria = categoriaActiva === 'Todas' || p.categoria === categoriaActiva;
      const matchMarca = marcaActiva === 'Todas' || p.marca === marcaActiva;
      const matchTalla = filtrosAvanzados.tallas.length === 0 || (p.tallas && p.tallas.some(t => filtrosAvanzados.tallas.includes(t)));
      const matchCategoriaEspecial = filtrosAvanzados.categoriasEspeciales.length === 0 || p.categoria.toLowerCase().includes(filtrosAvanzados.categoriasEspeciales[0]?.toLowerCase() || '');
      return matchSearch && matchCategoria && matchMarca && matchTalla && matchCategoriaEspecial;
    });
  }, [productos, searchTerm, categoriaActiva, marcaActiva, filtrosAvanzados]);

  const handleClearSearch = () => setSearchTerm('');
  const handleAddToCart = (product: Producto) => { setSelectedProduct(product); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedProduct(null); };
  const handleApplyFilters = (filters: FilterState) => setFiltrosAvanzados(filters);
  const handleResetFilters = () => { setCategoriaActiva('Todas'); setMarcaActiva('Todas'); setFiltrosAvanzados({ tallas: [], marcas: [], categoriasEspeciales: [] }); setSearchTerm(''); };
  const handleLoadMore = () => setVisibleProducts(prev => prev + 8);

  const countFiltrosActivos = () => { let count = 0; if (categoriaActiva !== 'Todas') count++; if (marcaActiva !== 'Todas') count++; count += filtrosAvanzados.tallas.length; count += filtrosAvanzados.marcas.length; count += filtrosAvanzados.categoriasEspeciales.length; return count; };
  const totalFiltrosActivos = countFiltrosActivos();

  if (isLoading) {
    return (
      <div className="catalog-page">
        <div className="catalog-hero"><div className="content"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-subtitle" /><div className="skeleton skeleton-search" /></div></div>
        <div className="products-section"><div className="products-grid">{[...Array(8)].map((_, i) => (<div key={i} className="product-card-skeleton"><div className="skeleton skeleton-img" /><div className="skeleton skeleton-text" /><div className="skeleton skeleton-text-short" /></div>))}</div></div>
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
            <button className="nav-to-cart-btn" onClick={() => navigate('/carrito')} title="Ver carrito">
              <ShoppingBag size={18} />
              <span>Ver carrito</span>
            </button>
            <div className="view-toggle"><button className="view-btn active" title="Cuadrícula"><Grid3X3 size={18} /></button></div>
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
              {productosFiltrados.slice(0, visibleProducts).map((producto, idx) => (
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
                    <button className="action-btn wishlist-btn" aria-label="Agregar a favoritos" onClick={(e) => e.stopPropagation()}><Heart size={18} /></button>
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
            {visibleProducts < productosFiltrados.length && (
              <div className="load-more-container">
                <button className="load-more-btn" onClick={handleLoadMore}>
                  Ver más productos
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


