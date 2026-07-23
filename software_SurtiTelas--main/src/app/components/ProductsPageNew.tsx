import { useState, useMemo } from 'react';
import { Search, Filter, User, ShoppingCart, X } from 'lucide-react';
import { Product, CartItem, User as UserType } from '../types';
import { products as initialProducts } from '../data/mockData';
import { ProductCard } from './ProductCard';
import { ProductFilters } from './ProductFilters';
import { CartSidebar } from './CartSidebar';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import logoWhite from 'figma:asset/f514387f1aa60fb986c5bf8e591cbe42bfd2b885.png';
import backgroundImage from 'figma:asset/7e8881494a5c3f18d88c66b07ef72a6d1c95a937.png';
import { toast } from 'sonner';
import { Footer } from './Footer';

interface ProductsPageNewProps {
  onAddToCart: (item: CartItem) => void;
  cartItems: CartItem[];
  onUpdateCartQuantity: (index: number, quantity: number) => void;
  onRemoveFromCart: (index: number) => void;
  currentUser?: UserType | null;
  onNavigate: (page: string) => void;
  onCheckout: () => void;
}

export function ProductsPageNew({
  onAddToCart,
  cartItems,
  onUpdateCartQuantity,
  onRemoveFromCart,
  currentUser,
  onNavigate,
  onCheckout,
}: ProductsPageNewProps) {
  // Estados
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [sortBy, setSortBy] = useState('popularity');
  const [showOnlyOnSale, setShowOnlyOnSale] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const maxPrice = Math.max(...products.map(p => p.price));

  // Toggle favorito
  const handleToggleFavorite = (productId: string) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, isFavorite: !p.isFavorite } : p
      )
    );
    toast.success('Favoritos actualizados');
  };

  // Filtrado y ordenamiento
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Filtro de búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro de categoría
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filtro de precio
    filtered = filtered.filter(p => {
      const price = p.discount ? p.price * (1 - p.discount / 100) : p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Filtro de ofertas
    if (showOnlyOnSale) {
      filtered = filtered.filter(p => p.isOnSale);
    }

    // Ordenamiento
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => {
          const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        filtered.sort((a, b) => {
          const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
          return priceB - priceA;
        });
        break;
      case 'newest':
        filtered.reverse();
        break;
      case 'best-selling':
        // Simular productos más vendidos (aquí podrías usar datos reales)
        filtered.sort((a, b) => (b.stock < a.stock ? -1 : 1));
        break;
      default: // popularity
        filtered.sort((a, b) => (b.isOnSale ? 1 : 0) - (a.isOnSale ? 1 : 0));
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, priceRange, showOnlyOnSale, sortBy]);

  // Agregar al carrito desde el modal
  const handleAddToCart = () => {
    if (!selectedProduct) return;

    if (!selectedSize) {
      toast.error('Por favor selecciona una talla');
      return;
    }
    if (!selectedColor) {
      toast.error('Por favor selecciona un color');
      return;
    }

    onAddToCart({
      product: selectedProduct,
      quantity: 1,
      size: selectedSize,
      color: selectedColor,
    });

    toast.success('Â¡Producto agregado al carrito!');
    setSelectedProduct(null);
    setSelectedSize('');
    setSelectedColor('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Imagen de fondo */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.15
        }}
      />

      {/* Barra Superior */}
      <header className="sticky top-0 z-30 bg-black text-white shadow-md relative">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <button
              onClick={() => onNavigate('inicio')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-28 h-auto flex items-center justify-center">
                <img src={logoWhite} alt="SurtiCamisetas" className="w-full h-auto object-contain" />
              </div>
              <span className="hidden sm:block text-xl font-medium">SurtiCamisetas</span>
            </button>

            {/* Barra de Búsqueda */}
            <div className="flex-1 max-w-xl mx-4 sm:mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#3A3A3A]" />
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 bg-[#F5F5F5] border-0 text-black placeholder:text-[#3A3A3A] rounded-full"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3A3A3A] hover:text-black"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Iconos de Usuario y Carrito */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => currentUser ? null : onNavigate('inicio')}
                className="text-white hover:bg-white/10 rounded-full"
              >
                <User className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(true)}
                className="text-white hover:bg-white/10 rounded-full relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="flex-1 relative z-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-4">
          {/* Header del Catálogo */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl text-black mb-3">
              Catálogo de Productos
            </h1>
            <p className="text-lg text-[#3A3A3A]">
              {filteredAndSortedProducts.length} productos encontrados
            </p>
          </div>

          {/* Botón Filtros Móvil */}
          <div className="lg:hidden mb-6">
            <Button
              onClick={() => setIsFiltersOpen(true)}
              className="w-full bg-black text-white hover:bg-[#1A1A1A]"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros y Ordenar
            </Button>
          </div>

          {/* Layout con Filtros y Productos */}
          <div className="flex gap-8 mb-4">
            {/* Filtros Laterales */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <ProductFilters
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                showOnlyOnSale={showOnlyOnSale}
                onToggleOnSale={setShowOnlyOnSale}
                maxPrice={maxPrice}
              />
            </aside>

            {/* Filtros Móvil */}
            <ProductFilters
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              showOnlyOnSale={showOnlyOnSale}
              onToggleOnSale={setShowOnlyOnSale}
              maxPrice={maxPrice}
              isMobileOpen={isFiltersOpen}
              onMobileClose={() => setIsFiltersOpen(false)}
            />

            {/* Grid de Productos */}
            <div className="flex-1">
              {filteredAndSortedProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-xl text-[#3A3A3A] mb-2">
                    No se encontraron productos
                  </p>
                  <p className="text-sm text-[#3A3A3A]">
                    Intenta ajustar los filtros
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {filteredAndSortedProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={setSelectedProduct}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer onNavigate={onNavigate} />

      {/* Sidebar del Carrito */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={onUpdateCartQuantity}
        onRemoveItem={onRemoveFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          onCheckout();
        }}
      />

      {/* Modal de Detalles del Producto */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto relative"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          {/* Overlay semi-transparente para mejorar legibilidad */}
          <div className="absolute inset-0 bg-white/90 rounded-lg -z-10" />

          <DialogHeader>
            <DialogTitle className="text-2xl text-black">
              {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              {/* Imagen del Producto */}
              <div className="aspect-square bg-[#F5F5F5] rounded-xl overflow-hidden">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Información del Producto */}
              <div className="space-y-6">
                <p className="text-base text-[#3A3A3A]">
                  {selectedProduct.description}
                </p>

                {/* Precio */}
                <div>
                  {selectedProduct.discount ? (
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-medium text-black">
                        $
                        {(
                          selectedProduct.price *
                          (1 - selectedProduct.discount / 100)
                        ).toLocaleString()}
                      </span>
                      <span className="text-lg text-[#3A3A3A] line-through">
                        ${selectedProduct.price.toLocaleString()}
                      </span>
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                        -{selectedProduct.discount}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl font-medium text-black">
                      ${selectedProduct.price.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Stock */}
                <p className="text-sm text-[#3A3A3A]">
                  {selectedProduct.stock > 0 ? (
                    <>
                      <span className="font-medium text-black">
                        {selectedProduct.stock}
                      </span>{' '}
                      unidades disponibles
                    </>
                  ) : (
                    <span className="text-red-500 font-medium">Agotado</span>
                  )}
                </p>

                {/* Selector de Talla */}
                <div>
                  <Label className="text-base text-black mb-3 block">
                    Selecciona una talla
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedProduct.sizes.map(size => (
                      <Button
                        key={size}
                        variant="outline"
                        onClick={() => setSelectedSize(size)}
                        className={`${
                          selectedSize === size
                            ? 'bg-black text-white border-black'
                            : 'bg-[#F5F5F5] border-[#E5E5E5] text-[#3A3A3A] hover:bg-[#E5E5E5]'
                        }`}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Selector de Color */}
                <div>
                  <Label className="text-base text-black mb-3 block">
                    Selecciona un color
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedProduct.colors.map(color => (
                      <Button
                        key={color}
                        variant="outline"
                        onClick={() => setSelectedColor(color)}
                        className={`capitalize ${
                          selectedColor === color
                            ? 'bg-black text-white border-black'
                            : 'bg-[#F5F5F5] border-[#E5E5E5] text-[#3A3A3A] hover:bg-[#E5E5E5]'
                        }`}
                      >
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Botón Agregar al Carrito */}
                <Button
                  onClick={handleAddToCart}
                  disabled={selectedProduct.stock === 0}
                  className="w-full bg-black text-white hover:bg-[#1A1A1A] disabled:bg-[#E5E5E5] disabled:text-[#3A3A3A] py-6 text-lg rounded-lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {selectedProduct.stock === 0
                    ? 'Producto Agotado'
                    : 'Agregar al Carrito'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}



