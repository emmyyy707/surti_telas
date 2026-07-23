import { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { ScrollArea } from '../../components/ui/scroll-area';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  Search,
  Filter,
  ShoppingCart,
  Heart,
  Star,
  Plus,
  Minus,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precioAnterior?: number;
  categoria: string;
  tallas: string[];
  colores: { nombre: string; hex: string }[];
  imagen: string;
  rating: number;
  enOferta?: boolean;
  nuevo?: boolean;
}

export function CatalogoCliente() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('todos');
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTalla, setSelectedTalla] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [cantidad, setCantidad] = useState(1);

  const productos: Producto[] = [
    {
      id: 'PROD-001',
      nombre: 'Camiseta Bósica Premium',
      descripcion: 'Camiseta de algodón 100% de alta calidad, perfecta para el uso diario. Diseáo clósico y cómodo.',
      precio: 45000,
      precioAnterior: 55000,
      categoria: 'Camisetas',
      tallas: ['S', 'M', 'L', 'XL', 'XXL'],
      colores: [
        { nombre: 'Blanco', hex: '#FFFFFF' },
        { nombre: 'Negro', hex: '#000000' },
        { nombre: 'Gris', hex: '#808080' },
      ],
      imagen: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      rating: 4.5,
      enOferta: true,
    },
    {
      id: 'PROD-002',
      nombre: 'Polo Deportivo Pro',
      descripcion: 'Polo deportivo con tecnologá dry-fit para móximo rendimiento. Ideal para actividades fósicas.',
      precio: 85000,
      categoria: 'Polos',
      tallas: ['S', 'M', 'L', 'XL'],
      colores: [
        { nombre: 'Azul', hex: '#0066CC' },
        { nombre: 'Rojo', hex: '#CC0000' },
        { nombre: 'Verde', hex: '#00AA00' },
      ],
      imagen: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400',
      rating: 4.8,
      nuevo: true,
    },
    {
      id: 'PROD-003',
      nombre: 'Sudadera con Capucha',
      descripcion: 'Sudadera con capucha ajustable, bolsillo canguro y tejido suave. Perfecta para climas fréos.',
      precio: 120000,
      categoria: 'Sudaderas',
      tallas: ['M', 'L', 'XL', 'XXL'],
      colores: [
        { nombre: 'Gris Oscuro', hex: '#3D3D3D' },
        { nombre: 'Negro', hex: '#000000' },
        { nombre: 'Azul Marino', hex: '#001F3F' },
      ],
      imagen: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
      rating: 4.7,
    },
    {
      id: 'PROD-004',
      nombre: 'Pantalón Deportivo',
      descripcion: 'Pantalón deportivo con cintura elóstica y bolsillos laterales. Tela transpirable y cómoda.',
      precio: 65000,
      precioAnterior: 80000,
      categoria: 'Pantalones',
      tallas: ['S', 'M', 'L', 'XL'],
      colores: [
        { nombre: 'Negro', hex: '#000000' },
        { nombre: 'Gris', hex: '#808080' },
      ],
      imagen: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      rating: 4.3,
      enOferta: true,
    },
    {
      id: 'PROD-005',
      nombre: 'Camiseta Estampada',
      descripcion: 'Camiseta con diseño exclusivo estampado. Algodón de alta calidad con colores vibrantes.',
      precio: 55000,
      categoria: 'Camisetas',
      tallas: ['S', 'M', 'L', 'XL'],
      colores: [
        { nombre: 'Blanco', hex: '#FFFFFF' },
        { nombre: 'Negro', hex: '#000000' },
      ],
      imagen: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400',
      rating: 4.6,
      nuevo: true,
    },
    {
      id: 'PROD-006',
      nombre: 'Conjunto Deportivo',
      descripcion: 'Conjunto completo deportivo: camiseta + pantalón. Ideal para gimnasio o actividades outdoor.',
      precio: 150000,
      precioAnterior: 180000,
      categoria: 'Conjuntos',
      tallas: ['M', 'L', 'XL'],
      colores: [
        { nombre: 'Negro', hex: '#000000' },
        { nombre: 'Azul', hex: '#0066CC' },
      ],
      imagen: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400',
      rating: 4.9,
      enOferta: true,
    },
  ];

  const productosFiltrados = productos.filter((producto) => {
    const matchSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = filterCategoria === 'todos' || producto.categoria === filterCategoria;
    return matchSearch && matchCategoria;
  });

  const categorias = ['todos', ...Array.from(new Set(productos.map((p) => p.categoria)))];

  const handleVerDetalle = (producto: Producto) => {
    setSelectedProducto(producto);
    setSelectedTalla('');
    setSelectedColor('');
    setCantidad(1);
    setIsDetailModalOpen(true);
  };

  const handleAgregarAlCarrito = () => {
    if (!selectedTalla || !selectedColor) {
      toast.error('Selección incompleta', {
        description: 'Por favor selecciona talla y color',
      });
      return;
    }

    toast.success('Producto agregado', {
      description: `${selectedProducto?.nombre} (${cantidad} unidad${cantidad > 1 ? 'es' : ''})`,
    });
    setIsDetailModalOpen(false);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400 opacity-50" />);
    }
    while (stars.length < 5) {
      stars.push(<Star key={`empty-${stars.length}`} className="h-4 w-4 text-gray-300" />);
    }
    return stars;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Católogo de Productos</h1>
        <p className="text-gray-600 mt-1">Descubre nuestra colección de prendas de alta calidad</p>
      </div>

      {/* Filtros */}
      <Card className="p-4 bg-[var(--bg-elevated)] rounded-xl shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategoria} onValueChange={setFilterCategoria}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Categorá" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'todos' ? 'Todas las categorás' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productosFiltrados.map((producto) => (
          <Card key={producto.id} className="overflow-hidden bg-[var(--bg-elevated)] rounded-xl shadow-sm hover:shadow-lg transition-all group">
            <div className="relative">
              <ImageWithFallback
                src={producto.imagen}
                alt={producto.nombre}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                {producto.nuevo && (
                  <Badge className="bg-green-500 text-white border-0">Nuevo</Badge>
                )}
                {producto.enOferta && (
                  <Badge className="bg-red-500 text-white border-0">Oferta</Badge>
                )}
              </div>
              <button className="absolute top-3 left-3 h-10 w-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                <Heart className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-2">
                <Badge variant="outline" className="text-xs">
                  {producto.categoria}
                </Badge>
              </div>
               <h3 className="font-semibold text-[var(--text-primary)] mb-1">{producto.nombre}</h3>
               <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">{producto.descripcion}</p>

               <div className="flex items-center gap-1 mb-3">
                 {renderStars(producto.rating)}
                 <span className="text-sm text-[var(--text-secondary)] ml-1">({producto.rating})</span>
               </div>

               <div className="flex items-center justify-between mb-3">
                 <div>
                   <p className="text-xl font-bold text-[var(--text-primary)]">${producto.precio.toLocaleString()}</p>
                   {producto.precioAnterior && (
                     <p className="text-sm text-[var(--text-tertiary)] line-through">${producto.precioAnterior.toLocaleString()}</p>
                   )}
                 </div>
               </div>

              <Button
                 className="w-full bg-[var(--text-primary)] hover:bg-[var(--text-tertiary)] text-white"
                onClick={() => handleVerDetalle(producto)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ver Detalle
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {productosFiltrados.length === 0 && (
        <Card className="p-12 bg-white rounded-xl shadow-sm text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No se encontraron productos</p>
          <p className="text-sm text-gray-500 mt-1">Intenta ajustar los filtros de bósqueda</p>
        </Card>
      )}

      {/* Modal Detalle del Producto */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Detalle del Producto</DialogTitle>
            <DialogDescription>
              Selecciona talla, color y cantidad para agregar al carrito
            </DialogDescription>
          </DialogHeader>

          {selectedProducto && (
            <ScrollArea className="max-h-[calc(85vh-120px)] pr-4">
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Imagen del producto */}
                  <div>
                    <ImageWithFallback
                      src={selectedProducto.imagen}
                      alt={selectedProducto.nombre}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                  </div>

                  {/* Información del producto */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{selectedProducto.categoria}</Badge>
                        {selectedProducto.nuevo && (
                          <Badge className="bg-green-500 text-white">Nuevo</Badge>
                        )}
                        {selectedProducto.enOferta && (
                          <Badge className="bg-red-500 text-white">Oferta</Badge>
                        )}
                      </div>
                       <h2 className="text-2xl font-bold text-[var(--text-primary)]">{selectedProducto.nombre}</h2>
                       <div className="flex items-center gap-1 mt-2">
                         {renderStars(selectedProducto.rating)}
                         <span className="text-sm text-[var(--text-secondary)] ml-1">({selectedProducto.rating})</span>
                       </div>
                     </div>

                     <div>
                       <p className="text-[var(--text-secondary)]">{selectedProducto.descripcion}</p>
                     </div>

                     <div>
                       <div className="flex items-center gap-3">
                         <p className="text-3xl font-bold text-[var(--text-primary)]">
                           ${selectedProducto.precio.toLocaleString()}
                         </p>
                         {selectedProducto.precioAnterior && (
                           <p className="text-lg text-[var(--text-tertiary)] line-through">
                             ${selectedProducto.precioAnterior.toLocaleString()}
                           </p>
                         )}
                       </div>
                     </div>

                     {/* Selector de Talla */}
                     <div>
                       <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                        Talla
                      </label>
                      <div className="flex gap-2">
                        {selectedProducto.tallas.map((talla) => (
                          <button
                            key={talla}
                            onClick={() => setSelectedTalla(talla)}
            className={`h-10 w-14 border-2 rounded-lg font-semibold transition-all ${
                                selectedTalla === talla
                                  ? 'border-[var(--text-primary)] bg-[var(--text-primary)] text-white'
                                  : 'border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                            }`}
                          >
                            {talla}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selector de Color */}
                    <div>
                       <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                         Color
                       </label>
                      <div className="flex gap-3">
                        {selectedProducto.colores.map((color) => (
                          <button
                            key={color.nombre}
                            onClick={() => setSelectedColor(color.nombre)}
                            className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                                selectedColor === color.nombre
                                  ? 'border-[var(--text-primary)] bg-[var(--bg-subtle)]'
                                  : 'border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[var(--border-strong)]'
                            }`}
                          >
                            <div
                              className="h-5 w-5 rounded-full border border-[var(--border-default)]"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-sm">{color.nombre}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selector de Cantidad */}
                    <div>
                       <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                         Cantidad
                       </label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                          className="h-10 w-10 border-2 border-[var(--border-default)] rounded-lg flex items-center justify-center hover:border-[var(--border-strong)] transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="text-xl font-semibold w-12 text-center">{cantidad}</span>
                        <button
                          onClick={() => setCantidad(cantidad + 1)}
                          className="h-10 w-10 border-2 border-[var(--border-default)] rounded-lg flex items-center justify-center hover:border-[var(--border-strong)] transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        className="flex-1 bg-[var(--text-primary)] hover:bg-[var(--text-tertiary)] text-white h-12"
                        onClick={handleAgregarAlCarrito}
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Agregar al Carrito
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 w-12"
                        onClick={() => toast.success('Agregado a favoritos')}
                      >
                        <Heart className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}



