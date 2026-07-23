import { useState, useEffect, useRef } from 'react';
import { Search, X, Package, Users, ShoppingCart, Factory, TrendingUp, FileText, Tag } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface SearchResult {
  id: string;
  type: 'product' | 'customer' | 'order' | 'workshop' | 'provider' | 'category' | 'employee';
  title: string;
  subtitle?: string;
  description?: string;
  metadata?: string;
  icon: React.ReactNode;
  category: string;
}

interface GlobalSearchProps {
  products?: any[];
  customers?: any[];
  orders?: any[];
  workshops?: any[];
  providers?: any[];
  categories?: any[];
  employees?: any[];
  onResultClick?: (result: SearchResult) => void;
}

export function GlobalSearch({
  products = [],
  customers = [],
  orders = [],
  workshops = [],
  providers = [],
  categories = [],
  employees = [],
  onResultClick,
}: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Abrir búsqueda con Ctrl+K o Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus en el input cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Realizar búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Buscar en productos
    products.forEach(product => {
      if (
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      ) {
        searchResults.push({
          id: product.id,
          type: 'product',
          title: product.name,
          subtitle: `Stock: ${product.stock}`,
          description: product.description,
          metadata: `$${product.price.toLocaleString('es-CO')}`,
          icon: <Package className="h-4 w-4" />,
          category: 'Productos',
        });
      }
    });

    // Buscar en clientes
    customers.forEach(customer => {
      if (
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query)
      ) {
        searchResults.push({
          id: customer.id,
          type: 'customer',
          title: customer.name,
          subtitle: customer.email,
          description: customer.phone,
          metadata: customer.status,
          icon: <Users className="h-4 w-4" />,
          category: 'Clientes',
        });
      }
    });

    // Buscar en pedidos
    orders.forEach(order => {
      if (
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query)
      ) {
        searchResults.push({
          id: order.id,
          type: 'order',
          title: `Pedido ${order.id}`,
          subtitle: order.customerName,
          description: order.date,
          metadata: `$${order.total.toLocaleString('es-CO')}`,
          icon: <ShoppingCart className="h-4 w-4" />,
          category: 'Pedidos',
        });
      }
    });

    // Buscar en talleres
    workshops.forEach(workshop => {
      if (
        workshop.name.toLowerCase().includes(query) ||
        workshop.type.toLowerCase().includes(query)
      ) {
        searchResults.push({
          id: workshop.id,
          type: 'workshop',
          title: workshop.name,
          subtitle: workshop.type,
          description: `Capacidad: ${workshop.capacity}`,
          metadata: workshop.status,
          icon: <Factory className="h-4 w-4" />,
          category: 'Talleres',
        });
      }
    });

    // Buscar en proveedores
    providers.forEach(provider => {
      if (
        provider.name.toLowerCase().includes(query) ||
        provider.contact?.toLowerCase().includes(query) ||
        provider.email?.toLowerCase().includes(query)
      ) {
        searchResults.push({
          id: provider.id,
          type: 'provider',
          title: provider.name,
          subtitle: provider.contact,
          description: provider.email,
          metadata: provider.status,
          icon: <TrendingUp className="h-4 w-4" />,
          category: 'Proveedores',
        });
      }
    });

    // Buscar en categorías
    categories.forEach(category => {
      if (
        category.name.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query)
      ) {
        searchResults.push({
          id: category.id,
          type: 'category',
          title: category.name,
          subtitle: category.description,
          metadata: category.status,
          icon: <Tag className="h-4 w-4" />,
          category: 'Categorías',
        });
      }
    });

    // Buscar en empleados
    employees.forEach(employee => {
      if (
        employee.name.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.role?.toLowerCase().includes(query)
      ) {
        searchResults.push({
          id: employee.id,
          type: 'employee',
          title: employee.name,
          subtitle: employee.role,
          description: employee.email,
          metadata: employee.status,
          icon: <Users className="h-4 w-4" />,
          category: 'Empleados',
        });
      }
    });

    setResults(searchResults);
    setSelectedIndex(0);
  }, [searchQuery, products, customers, orders, workshops, providers, categories, employees]);

  // Navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      handleResultClick(results[selectedIndex]);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  // Agrupar resultados por categoría
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'activo':
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
      case 'en_proceso':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactivo':
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Botón de búsqueda */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="relative w-full md:w-64 justify-start text-left text-gray-500 hover:text-gray-900"
      >
        <Search className="h-4 w-4 mr-2" />
        <span className="flex-1">Buscar...</span>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 text-xs text-gray-600">
          <span className="text-xs">âŒ˜</span>K
        </kbd>
      </Button>

      {/* Modal de búsqueda */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl p-0 gap-0">
          <DialogHeader className="p-4 pb-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                ref={inputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar productos, clientes, pedidos, talleres..."
                className="pl-10 pr-10 h-12 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="border-t">
            {searchQuery.trim() === '' ? (
              <div className="p-12 text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Escribe para buscar en todos los módulos</p>
                <p className="text-sm mt-2 text-gray-400">
                  Productos, clientes, pedidos, talleres, proveedores...
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No se encontraron resultados para "{searchQuery}"</p>
                <p className="text-sm mt-2 text-gray-400">
                  Intenta con otros términos de búsqueda
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="p-2 space-y-4">
                  {Object.entries(groupedResults).map(([category, categoryResults]) => (
                    <div key={category}>
                      <p className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider">
                        {category} ({categoryResults.length})
                      </p>
                      <div className="space-y-1">
                        {categoryResults.map((result, index) => {
                          const globalIndex = results.indexOf(result);
                          const isSelected = globalIndex === selectedIndex;

                          return (
                            <button
                              key={result.id}
                              onClick={() => handleResultClick(result)}
                              className={`w-full text-left p-3 rounded-lg transition-colors ${
                                isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                                  {result.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium truncate">{result.title}</h4>
                                      {result.subtitle && (
                                        <p className="text-sm text-gray-600 truncate">
                                          {result.subtitle}
                                        </p>
                                      )}
                                      {result.description && (
                                        <p className="text-xs text-gray-500 truncate mt-1">
                                          {result.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      {result.metadata && (
                                        <Badge className={getStatusBadgeColor(result.metadata)}>
                                          {result.metadata}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {results.length > 0 && (
            <div className="p-3 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-500">
              <div className="flex gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white border rounded">â†‘â†“</kbd>
                  Navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white border rounded">Enter</kbd>
                  Seleccionar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white border rounded">Esc</kbd>
                  Cerrar
                </span>
              </div>
              <span>{results.length} resultados</span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}



