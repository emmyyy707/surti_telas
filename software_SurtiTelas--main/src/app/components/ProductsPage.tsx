import { useState } from 'react';
import { ShoppingCart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Product, CartItem, User } from '../types';
import { products } from '../data/mockData';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { NavigationBar } from './NavigationBar';
import { Footer } from './Footer';
import { toast } from 'sonner';

interface ProductRating {
  productId: string;
  rating: number;
  comment: string;
  userName: string;
  date: string;
}

interface ProductsPageProps {
  onAddToCart: (item: CartItem) => void;
  currentUser?: User | null;
  purchasedProductIds?: string[];
  onNavigate: (page: string) => void;
  onCartClick: () => void;
  cartItemCount?: number;
}

export function ProductsPage({ onAddToCart, currentUser, purchasedProductIds = [], onNavigate, onCartClick, cartItemCount }: ProductsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  
  // Estado para calificaciones
  const [productRatings, setProductRatings] = useState<ProductRating[]>([]);
  const [currentRating, setCurrentRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  
  // Función para formatear nombres de categorías
  const formatCategoryName = (category: string): string => {
    const categoryNames: Record<string, string> = {
      'todos': 'Todos',
      'pantaloneta-burda-bordada': 'Pantaloneta Burda Bordada',
      'oversize-alta': 'Oversize Alta',
      'burda-bordada': 'Burda Bordada',
      'telas-frias': 'Telas Frías',
      'blusas-cortas': 'Blusas Cortas',
    };
    return categoryNames[category] || category;
  };
  
  // Estado para "Ver Más" - mostrar productos de a 5
  const [visibleCount, setVisibleCount] = useState<Record<string, number>>({
    todos: 6,
    'pantaloneta-burda-bordada': 6,
    'oversize-alta': 6,
    'burda-bordada': 6,
    'telas-frias': 6,
    'blusas-cortas': 6,
  });

  const filteredProducts =
    selectedCategory === 'todos'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  // Obtener productos visibles según la categoría actual
  const visibleProducts = filteredProducts.slice(0, visibleCount[selectedCategory]);
  const hasMoreProducts = visibleProducts.length < filteredProducts.length;

  // Cambiar de categoría
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Cargar más productos
  const loadMoreProducts = () => {
    setVisibleCount(prev => ({
      ...prev,
      [selectedCategory]: prev[selectedCategory] + 5
    }));
  };

  const handleOpenDialog = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize('');
  };

  const handleCloseDialog = () => {
    setSelectedProduct(null);
    setSelectedSize('');
    setCurrentRating(0);
    setHoveredRating(0);
    setRatingComment('');
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    if (!selectedSize) {
      toast.error('Por favor selecciona una talla');
      return;
    }

    onAddToCart({
      product: selectedProduct,
      quantity: 1,
      size: selectedSize,
    });
    toast.success('Â¡Producto agregado al carrito!');
    handleCloseDialog();
  };

  const handleSubmitRating = () => {
    if (!selectedProduct) return;
    
    if (currentRating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    const newRating: ProductRating = {
      productId: selectedProduct.id,
      rating: currentRating,
      comment: ratingComment,
      userName: currentUser?.name || 'Usuario Anónimo',
      date: new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
    };

    setProductRatings(prev => [newRating, ...prev]);
    toast.success('Â¡Gracias por tu calificación!');
    setCurrentRating(0);
    setRatingComment('');
  };

  // Obtener calificaciones del producto actual
  const getCurrentProductRatings = () => {
    if (!selectedProduct) return [];
    return productRatings.filter(r => r.productId === selectedProduct.id);
  };

  // Calcular promedio de calificaciones
  const getAverageRating = (productId: string) => {
    const ratings = productRatings.filter(r => r.productId === productId);
    if (ratings.length === 0) return 4.9; // Default rating
    return ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length;
  };

  return (
    <div className="min-h-screen bg-white">
      <NavigationBar 
        onNavigate={onNavigate} 
        currentUser={currentUser}
        activePage="productos"
        onCartClick={onCartClick}
        cartItemCount={cartItemCount}
      />
      
      <div className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Header - Responsivo */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="flex justify-center mb-4 sm:mb-6">
          
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 px-2">Nuestros Productos</h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">
              Explora nuestra colección de camisetas personalizadas
            </p>
          </div>

          {/* Category Filter - Responsivo */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-10 md:mb-12 px-2">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'pantaloneta-burda-bordada', label: 'Pantaloneta Burda Bordada' },
              { id: 'oversize-alta', label: 'Oversize Alta' },
              { id: 'burda-bordada', label: 'Burda Bordada' },
              { id: 'telas-frias', label: 'Telas Frías' },
              { id: 'blusas-cortas', label: 'Blusas Cortas' },
            ].map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => handleCategoryChange(category.id)}
                className={`text-xs sm:text-sm ${selectedCategory === category.id ? 'bg-black text-white' : ''}`}
                size="sm"
              >
                {formatCategoryName(category.id)}
              </Button>
            ))}
          </div>

          {/* Products Grid - Completamente Responsivo */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {visibleProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full rounded-xl sm:rounded-2xl">
                <div className="relative aspect-square bg-gray-100 flex-shrink-0">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 sm:p-6 flex flex-col flex-1">
                  <h3 className="text-lg sm:text-xl mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl sm:text-2xl">${product.price.toLocaleString()}</span>
                    <Badge className="text-xs text-center">{formatCategoryName(product.category)}</Badge>
                  </div>

                  <div className="mt-auto pt-3 border-t">
                    <div className="flex items-center justify-between mb-3 text-xs text-gray-600">
                      <span>{product.stock} disponibles</span>
                    </div>
                    <Button
                      onClick={() => handleOpenDialog(product)}
                      className="w-full bg-black text-white hover:bg-gray-800"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Agregar al Carrito
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* "Ver Más" Button - Siempre visible si hay más productos */}
          {hasMoreProducts && (
            <div className="flex items-center justify-center mt-10 sm:mt-12 px-4">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMoreProducts}
                className="disabled:opacity-50"
              >
                Ver Más
              </Button>
            </div>
          )}

          {/* Product Selection Dialog - Responsivo */}
          <Dialog open={!!selectedProduct} onOpenChange={handleCloseDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl md:text-2xl">{selectedProduct?.name}</DialogTitle>
              </DialogHeader>
              {selectedProduct && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <p className="text-sm sm:text-base text-gray-600">{selectedProduct.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl sm:text-3xl">${selectedProduct.price.toLocaleString()}</span>
                      <Badge className="text-xs sm:text-sm text-center">{formatCategoryName(selectedProduct.category)}</Badge>
                    </div>

                    {/* Size Selection - Responsivo */}
                    <div>
                      <Label className="text-xs sm:text-sm mb-2 block">Talla</Label>
                      <div className="flex gap-2 flex-wrap">
                        {selectedProduct.sizes.map((size) => (
                          <Button
                            key={size}
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSize(size)}
                            className={`text-sm ${
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

                    <div className="text-sm text-gray-600">
                      {selectedProduct.stock} disponibles
                    </div>

                    <Button
                      onClick={handleAddToCart}
                      className="w-full bg-black text-white hover:bg-gray-800"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Agregar al Carrito
                    </Button>

                    {/* Rating Section - Solo visible si el usuario compró el producto */}
                    {purchasedProductIds.includes(selectedProduct.id) ? (
                      <div className="pt-4 border-t space-y-3">
                        <h4 className="font-medium">Califica este producto</h4>
                        
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setCurrentRating(star)}
                              onMouseEnter={() => setHoveredRating(star)}
                              onMouseLeave={() => setHoveredRating(0)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  star <= (hoveredRating || currentRating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                          {currentRating > 0 && (
                            <span className="text-sm ml-2">
                              {currentRating} {currentRating === 1 ? 'estrella' : 'estrellas'}
                            </span>
                          )}
                        </div>

                        <div>
                          <Label className="text-sm mb-1 block">Comentario (opcional)</Label>
                          <Textarea
                            value={ratingComment}
                            onChange={(e) => setRatingComment(e.target.value)}
                            placeholder="Cuéntanos qué te pareció este producto..."
                            className="resize-none h-20"
                          />
                        </div>

                        <Button
                          onClick={handleSubmitRating}
                          variant="outline"
                          className="w-full"
                          size="sm"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Enviar Calificación
                        </Button>
                      </div>
                    ) : (
                      currentUser && (
                        <div className="pt-4 border-t">
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-600">
                              Debes comprar este producto para poder calificarlo
                            </p>
                          </div>
                        </div>
                      )
                    )}

                    {/* Existing Ratings */}
                    {getCurrentProductRatings().length > 0 && (
                      <div className="pt-4 border-t space-y-3">
                        <h4 className="font-medium">
                          Calificaciones ({getCurrentProductRatings().length})
                        </h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {getCurrentProductRatings().map((rating, index) => (
                            <Card key={index} className="p-3">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-medium text-sm">{rating.userName}</p>
                                  <p className="text-xs text-gray-500">{rating.date}</p>
                                </div>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-3 w-3 ${
                                        star <= rating.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              {rating.comment && (
                                <p className="text-sm text-gray-600">{rating.comment}</p>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

        </div>
      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}



