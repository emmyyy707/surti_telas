import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { X } from 'lucide-react';

interface ProductFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  showOnlyOnSale: boolean;
  onToggleOnSale: (value: boolean) => void;
  maxPrice: number;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function ProductFilters({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortByChange,
  showOnlyOnSale,
  onToggleOnSale,
  maxPrice,
  isMobileOpen = false,
  onMobileClose,
}: ProductFiltersProps) {
  const categories = [
    { id: 'todos', label: 'Todos los Productos' },
    { id: 'adultos', label: 'Adultos' },
    { id: 'adolescentes', label: 'Adolescentes' },
    { id: 'niños', label: 'Niños' },
  ];

  const sortOptions = [
    { id: 'popularity', label: 'Popularidad' },
    { id: 'price-asc', label: 'Precio: Menor a Mayor' },
    { id: 'price-desc', label: 'Precio: Mayor a Menor' },
    { id: 'newest', label: 'Más Recientes' },
    { id: 'best-selling', label: 'Más Vendidos' },
  ];

  const content = (
    <div className="space-y-8">
      {/* Categorías */}
      <div>
        <h3 className="text-lg font-medium text-black mb-4">Categorías</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                onCategoryChange(category.id);
                onMobileClose?.();
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-black text-white'
                  : 'bg-[#F5F5F5] text-[#3A3A3A] hover:bg-[#E5E5E5]'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rango de Precios */}
      <div>
        <h3 className="text-lg font-medium text-black mb-4">Rango de Precio</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => onPriceRangeChange(value as [number, number])}
            min={0}
            max={maxPrice}
            step={1000}
            className="mb-4"
          />
          <div className="flex justify-between text-sm text-[#3A3A3A]">
            <span>${priceRange[0].toLocaleString()}</span>
            <span>${priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Ordenar Por */}
      <div>
        <h3 className="text-lg font-medium text-black mb-4">Ordenar Por</h3>
        <RadioGroup value={sortBy} onValueChange={onSortByChange}>
          <div className="space-y-3">
            {sortOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-3">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="text-sm text-[#3A3A3A] cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Solo Productos en Oferta */}
      <div className="pt-6 border-t border-[#E5E5E5]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-black">Solo Ofertas</h3>
            <p className="text-xs text-[#3A3A3A] mt-1">
              Mostrar solo productos en descuento
            </p>
          </div>
          <Switch checked={showOnlyOnSale} onCheckedChange={onToggleOnSale} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Versión Desktop */}
      <div className="hidden lg:block sticky top-24 h-fit">
        <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
          {content}
        </div>
      </div>

      {/* Versión Mobile - Sidebar */}
      {isMobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={onMobileClose}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 w-80 bg-white z-50 overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-black">Filtros</h2>
              <button
                onClick={onMobileClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            {content}
          </div>
        </>
      )}
    </>
  );
}



