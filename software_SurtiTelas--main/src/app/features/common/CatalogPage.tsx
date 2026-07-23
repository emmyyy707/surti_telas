import { useState, useEffect } from 'react';
import { Search, ChevronDown, Filter, ShoppingCart, Check, X, Clock, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, CartItem, User as UserType } from '../types';
import { products as initialProducts } from '../data/mockData';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { NavigationBar } from './NavigationBar';
import { Footer } from './Footer';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

interface CatalogPageProps {
  onAddToCart: (item: CartItem) => void;
  currentUser?: UserType | null;
  purchasedProductIds?: string[];
  onNavigate: (page: string) => void;
  onCartClick: () => void;
  cartItemCount?: number;
}

const allCategories = [
  { id: 'todos', name: 'Todos los productos' },
  { id: 'adultos', name: 'Adultos' },
  { id: 'adolescentes', name: 'Adolescentes' },
  { id: 'niños', name: 'Niños' },
];

// Categorías especializadas para filtros
const specializedCategories = [
  { id: 'pantaloneta-burda-bordada', label: 'Pantaloneta Burda Bordada' },
  { id: 'oversize-alta', label: 'Oversize Alta' },
  { id: 'burda-bordada', label: 'Burda Bordada' },
  { id: 'telas-frias', label: 'Telas Frías' },
  { id: 'blusas-cortas', label: 'Blusas Cortas' },
];

const searchSuggestions = [
  'Camisetas blancas',
  'Bordado',
  'Estampados',
  'Uniformes',
  'Deportivas',
  'Personalizadas',
  'Manga larga',
  'Cuello redondo',
];

const PRODUCTS_PER_PAGE = 10;

// Tallas disponibles para filtrar
const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Obtener todas las marcas únicas de los productos
const allBrands = Array.from(new Set(initialProducts.map(p => p.brand).filter(Boolean))) as string[];

// Colores disponibles con sus valores HEX
const availableColors = [
  { name: 'Blanco', hex: '#FFFFFF', border: true },
  { name: 'Negro', hex: '#000000' },
  { name: 'Gris', hex: '#808080' },
  { name: 'Rojo', hex: '#FF0000' },
  { name: 'Azul', hex: '#0000FF' },
  { name: 'Verde', hex: '#008000' },
  { name: 'Amarillo', hex: '#FFFF00' },
  { name: 'Rosa', hex: '#FFB6C1' },
  { name: 'Morado', hex: '#800080' },
  { name: 'Naranja', hex: '#FFA500' },
  { name: 'Beige', hex: '#F5F5DC', border: true },
  { name: 'Marrón', hex: '#8B4513' },
];

// Opciones de ordenamiento
const sortOptions = [
  { id: 'default', name: 'Predeterminado' },
  { id: 'price-asc', name: 'Precio: Menor a Mayor' },
  { id: 'price-desc', name: 'Precio: Mayor a Menor' },
  { id: 'name-asc', name: 'Nombre: A-Z' },
  { id: 'name-desc', name: 'Nombre: Z-A' },
];

export function CatalogPage({
  onAddToCart,
  currentUser,
  purchasedProductIds = [],
  onNavigate,
  onCartClick,
  cartItemCount,
}: CatalogPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [displayCount, setDisplayCount] = useState(PRODUCTS_PER_PAGE);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string[]>([]);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string[]>([]);
  const [selectedColorFilter, setSelectedColorFilter] = useState<string[]>([]);
  const [selectedSpecializedCategory, setSelectedSpecializedCategory] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('default');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Cargar historial de búsqueda desde localStorage al montar el componente
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, []);

  // Guardar búsqueda en el historial
  const saveToHistory = (query: string) => {
    if (!query.trim() || query.length < 2) return;

    setSearchHistory((prev) => {
      // Eliminar duplicados y agregar al inicio
      const filtered = prev.filter(item => item.toLowerCase() !== query.toLowerCase());
      const newHistory = [query, ...filtered].slice(0, 10); // Máximo 10 items

      // Guardar en localStorage
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));

      return newHistory;
    });
  };

  // Eliminar un item del historial
  const removeFromHistory = (query: string) => {
    setSearchHistory((prev) => {
      const newHistory = prev.filter(item => item !== query);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // Limpiar todo el historial
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    toast.success('Historial limpiado');
  };

  // Manejar el evento de presionar Enter en la búsqueda
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      saveToHistory(searchQuery);
      setShowSearchSuggestions(false);
    }
  };

  // Filtrar por categoría, búsqueda, talla, marca y color
  const filteredProducts = initialProducts.filter((product) => {
    // Filtro de categoría
    const matchesCategory = selectedCategory === 'todos' || product.category === selectedCategory;

    // Filtro de búsqueda
    const matchesSearch = searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filtro de talla
    const matchesSize = selectedSizeFilter.length === 0 ||
      product.sizes.some(size => selectedSizeFilter.includes(size));

    // Filtro de marca
    const matchesBrand = selectedBrandFilter.length === 0 ||
      (product.brand && selectedBrandFilter.includes(product.brand));

    // Filtro de color
    const matchesColor = selectedColorFilter.length === 0 ||
      product.colors.some(color => selectedColorFilter.includes(color));

    return matchesCategory && matchesSearch && matchesSize && matchesBrand && matchesColor;
  });

  // Ordenar productos
  const sortedProducts = filteredProducts.sort((a, b) => {
    switch (sortOption) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  const displayedProducts = sortedProducts.slice(0, displayCount);
  const hasMoreProducts = displayCount < sortedProducts.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 5);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setDisplayCount(PRODUCTS_PER_PAGE);
  };

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

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSizeFilter = (size: string) => {
    setSelectedSizeFilter((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size]
    );
    setDisplayCount(PRODUCTS_PER_PAGE);
  };

  const toggleBrandFilter = (brand: string) => {
    setSelectedBrandFilter((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
    setDisplayCount(PRODUCTS_PER_PAGE);
  };

  const toggleColorFilter = (color: string) => {
    setSelectedColorFilter((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color]
    );
    setDisplayCount(PRODUCTS_PER_PAGE);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('todos');
    setSelectedSizeFilter([]);
    setSelectedBrandFilter([]);
    setSelectedColorFilter([]);
    setDisplayCount(PRODUCTS_PER_PAGE);
  };

  const currentCategoryName =
    allCategories.find((cat) => cat.id === selectedCategory)?.name || 'Todos';

  return (
    <div className="min-h-screen bg-white">
      <NavigationBar
        onNavigate={onNavigate}
        currentUser={currentUser}
        activePage="productos"
        onCartClick={onCartClick}
        cartItemCount={cartItemCount}
      />

      {/* Contenido Principal - Ancho Completo */}
      <main className="w-full">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Barra de Búsqueda y Filtros */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Búsqueda */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                onKeyDown={handleSearchKeyDown}
                className="pl-12 pr-4 py-5 text-base border-2 border-gray-200 rounded-full focus:border-black transition-colors w-full"
              />

              {/* Sugerencias de Búsqueda */}
              {showSearchSuggestions && searchQuery === '' && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6 z-50">
                  {/* Historial de búsqueda */}
                  {searchHistory.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Historial de búsqueda
                        </h4>
                        <button
                          onClick={clearHistory}
                          className="text-xs text-gray-500 hover:text-black transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Limpiar
                        </button>
                      </div>
                      <div className="space-y-2">
                        {searchHistory.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between group hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                          >
                            <button
                              onMouseDown={() => {
                                setSearchQuery(item);
                                setShowSearchSuggestions(false);
                              }}
                              className="flex-1 text-left text-sm text-gray-700 hover:text-black flex items-center gap-2"
                            >
                              <Clock className="h-3 w-3 text-gray-400" />
                              {item}
                            </button>
                            <button
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                removeFromHistory(item);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                            >
                              <X className="h-3 w-3 text-gray-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Búsquedas populares */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">
                      Búsquedas Populares
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {searchSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onMouseDown={() => {
                            setSearchQuery(suggestion);
                            saveToHistory(suggestion);
                          }}
                          className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-sm text-gray-700 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Barra de Filtros Horizontal */}
          <div className="mb-6 flex flex-wrap gap-3 items-center">
            {/* Botón Filtros con Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="border border-gray-300 hover:border-black px-4 py-2 rounded-lg gap-2 bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                  <SheetDescription>
                    Personaliza tu búsqueda de productos
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Filtro de Tallas */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Tallas</h4>
                    <div className="flex flex-wrap gap-2">
                      {allSizes.map((size) => (
                        <Badge
                          key={size}
                          onClick={() => toggleSizeFilter(size)}
                          className={`cursor-pointer px-3 py-1.5 transition-all font-medium ${
                            selectedSizeFilter.includes(size)
                              ? 'bg-black text-white hover:bg-gray-800 border-black'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                          }`}
                          variant="outline"
                        >
                          {size}
                          {selectedSizeFilter.includes(size) && (
                            <Check className="ml-1 h-3 w-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Filtro de Marcas */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Marcas</h4>
                    <div className="flex flex-wrap gap-2">
                      {allBrands.map((brand) => (
                        <Badge
                          key={brand}
                          onClick={() => toggleBrandFilter(brand)}
                          className={`cursor-pointer px-3 py-1.5 transition-all font-medium ${
                            selectedBrandFilter.includes(brand)
                              ? 'bg-black text-white hover:bg-gray-800 border-black'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                          }`}
                          variant="outline"
                        >
                          {brand}
                          {selectedBrandFilter.includes(brand) && (
                            <Check className="ml-1 h-3 w-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Filtro de Categorías Especializadas */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Categorías Especializadas</h4>
                    <div className="flex flex-col gap-2">
                      {specializedCategories.map((category) => (
                        <Badge
                          key={category.id}
                          onClick={() => handleCategoryChange(category.id)}
                          className={`cursor-pointer px-3 py-2 transition-all font-medium text-left justify-start ${
                            selectedCategory === category.id
                              ? 'bg-black text-white hover:bg-gray-800 border-black'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                          }`}
                          variant="outline"
                        >
                          {category.label}
                          {selectedCategory === category.id && (
                            <Check className="ml-auto h-3 w-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="flex-1"
                    >
                      Restablecer
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Dropdown Ordenar por */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border border-gray-300 hover:border-black px-4 py-2 rounded-lg gap-2 bg-white"
                >
                  Ordenar por
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    onClick={() => setSortOption(option.id)}
                    className={`cursor-pointer ${
                      sortOption === option.id ? 'bg-gray-100 font-medium' : ''
                    }`}
                  >
                    {option.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dropdown Categoría */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border border-gray-300 hover:border-black px-4 py-2 rounded-lg gap-2 bg-white"
                >
                  Categoría
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {allCategories.map((cat) => (
                  <DropdownMenuItem
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`cursor-pointer ${
                      selectedCategory === cat.id ? 'bg-gray-100 font-medium' : ''
                    }`}
                  >
                    {cat.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dropdown Color */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border border-gray-300 hover:border-black px-4 py-2 rounded-lg gap-2 bg-white"
                >
                  Color
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72 p-4">
                <div className="grid grid-cols-4 gap-3">
                  {availableColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => toggleColorFilter(color.name)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                        selectedColorFilter.includes(color.name) ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full ${color.border ? 'border-2 border-gray-300' : ''} ${
                          selectedColorFilter.includes(color.name) ? 'ring-2 ring-black ring-offset-2' : ''
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[10px] text-gray-600 text-center leading-tight">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Grid de Productos - Ancho Completo */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
            {displayedProducts.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col border border-gray-100"
                onClick={() => {
                  setSelectedProduct(product);
                  setSelectedImageIndex(0);
                }}
              >
                {/* Contenedor de Imagen con altura fija */}
                <div className="relative w-full aspect-square bg-gray-50 overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Contenedor de Información con altura mínima consistente */}
                <div className="p-2 sm:p-3 flex flex-col flex-grow">
                  <h3 className="text-xs sm:text-sm text-gray-900 mb-1 sm:mb-2 line-clamp-2 group-hover:text-black min-h-[2rem] sm:min-h-[2.5rem]">
                    {product.name}
                  </h3>

                  <div className="mt-auto">
                    <div className="flex items-baseline gap-2 mb-1">
                      {product.discount ? (
                        <>
                          <span className="text-base font-medium text-black">
                            ${(product.price * (1 - product.discount / 100)).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500 line-through">
                            ${product.price.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-base font-medium text-black">
                          ${product.price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {product.stock <= 5 && product.stock > 0 && (
                      <p className="text-xs text-orange-600">
                        Â¡Solo quedan {product.stock}!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botón Ver Más */}
          {hasMoreProducts && (
            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                className="px-12 py-6 text-base border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-colors rounded-full group"
              >
                Ver más productos
              </Button>
            </div>
          )}

          {/* Mensaje cuando no hay más productos */}
          {!hasMoreProducts && filteredProducts.length > PRODUCTS_PER_PAGE && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 text-gray-500 text-sm bg-gray-50 px-6 py-3 rounded-full">
                <Check className="h-4 w-4" />
                <span>Has visto todos los productos de esta categoría</span>
              </div>
            </div>
          )}

          {/* Mensaje cuando no hay productos */}
          {filteredProducts.length === 0 && (
            <div className="mt-12 text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl text-gray-700 mb-2">No se encontraron productos</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery
                  ? `No hay resultados para "${searchQuery}"`
                  : 'No hay productos en esta categoría'}
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('todos');
                  setDisplayCount(PRODUCTS_PER_PAGE);
                }}
                variant="outline"
                className="border-2 border-gray-900 hover:bg-gray-900 hover:text-white"
              >
                Ver todos los productos
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer onNavigate={onNavigate} />

      {/* Modal de Detalles del Producto */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => {
        if (!open) {
          setSelectedProduct(null);
          setSelectedSize('');
          setSelectedColor('');
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Galería de Imágenes */}
              <div className="space-y-3">
                {/* Imagen Principal */}
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={(selectedProduct.images && selectedProduct.images.length > 0)
                      ? selectedProduct.images[selectedImageIndex]
                      : selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Thumbnails de Imágenes */}
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {selectedProduct.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square bg-gray-50 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index
                            ? 'border-black'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <ImageWithFallback
                          src={img}
                          alt={`${selectedProduct.name} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">{selectedProduct.description}</p>

                <div className="flex items-baseline gap-3">
                  {selectedProduct.discount ? (
                    <>
                      <span className="text-3xl font-medium text-black">
                        ${(selectedProduct.price * (1 - selectedProduct.discount / 100)).toLocaleString()}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        ${selectedProduct.price.toLocaleString()}
                      </span>
                      <Badge className="bg-red-500 text-white">
                        -{selectedProduct.discount}%
                      </Badge>
                    </>
                  ) : (
                    <span className="text-3xl font-medium text-black">
                      ${selectedProduct.price.toLocaleString()}
                    </span>
                  )}
                </div>

                <Badge className="capitalize">{selectedProduct.category}</Badge>

                <div>
                  <Label className="text-sm mb-2 block">Talla</Label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedProduct.sizes.map((size) => (
                      <Button
                        key={size}
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSize(size)}
                        className={`${
                          selectedSize === size
                            ? 'bg-black text-white border-black'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm mb-2 block">Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedProduct.colors.map((color) => (
                      <Button
                        key={color}
                        variant="outline"
                        onClick={() => setSelectedColor(color)}
                        className={`capitalize ${
                          selectedColor === color
                            ? 'bg-black text-white border-black'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  {selectedProduct.stock > 0 ? (
                    <span>{selectedProduct.stock} disponibles</span>
                  ) : (
                    <span className="text-red-500">Agotado</span>
                  )}
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={selectedProduct.stock === 0}
                  className="w-full bg-black text-white hover:bg-gray-800 py-6 text-base"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Agregar al Carrito
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}




