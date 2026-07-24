import React, { useState, useEffect } from 'react';
import './FilterDrawer.css';

// --- ICONOS SVG PROPIOS ---
const IconX = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

// Tipado estricto para las claves del estado
export interface FilterState {
  tallas: string[];
  marcas: string[];
  categoriasEspeciales: string[];
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  currentFilters?: FilterState; // Opcional: Para no perder los filtros ya aplicados al reabrir
}

// Configuración de secciones para renderizado dinámico e inteligente
const FILTER_SECTIONS = [
  { id: 'tallas', title: 'Tallas', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  { id: 'marcas', title: 'Marcas', options: ['Nike', 'Puma', 'Adidas', 'Reebok', 'Under Armour'] },
  { id: 'categoriasEspeciales', title: 'Categorías Especiales', options: ['Pantaloneta Burda Bordada', 'Oversize Alta', 'Burda Bordada', 'Telas Frás', 'Blusas Cortas'] }
] as const;

const INITIAL_STATE: FilterState = {
  tallas: [],
  marcas: [],
  categoriasEspeciales: []
};

export const FilterDrawer: React.FC<FilterDrawerProps> = ({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  currentFilters 
}) => {
  // 1. Estado unificado (Simplifica el reset y el manejo de datos)
  const [filters, setFilters] = useState<FilterState>(INITIAL_STATE);

  // 2. Efecto para sincronizar el estado si ya había filtros seleccionados previamente en la app
  useEffect(() => {
    if (isOpen) {
      setFilters(currentFilters || INITIAL_STATE);
    }
  }, [isOpen, currentFilters]);

  // 3. Función manejadora única para cualquier sección (Manejo de arrays inmutables optimizado)
  const toggleSelection = (key: keyof FilterState, option: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(option)
        ? prev[key].filter(item => item !== option)
        : [...prev[key], option]
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters(INITIAL_STATE);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay con accesibilidad básica para cerrar */}
      <div className="filter-drawer-overlay" onClick={onClose} role="button" aria-label="Cerrar filtros"></div>

      <div className={`filter-drawer ${isOpen ? 'open' : ''}`} role="dialog" aria-modal="true">
        <div className="filter-drawer-header">
          <div>
            <h3>Filtros</h3>
            <p className="filter-drawer-subtitle">Personaliza tu búsqueda</p>
          </div>
          <button className="close-filter-btn" onClick={onClose} aria-label="Cerrar">
            <IconX />
          </button>
        </div>

        <div className="filter-drawer-content">
          {/* 4. Renderizado Dinámico: Adiós a copiar y pegar bloques HTML repetidos */}
          {FILTER_SECTIONS.map(({ id, title, options }) => (
            <div className="filter-section" key={id}>
              <h4>{title}</h4>
              <div className={`filter-options-grid ${id}-grid`}>
                {options.map(option => {
                  const isActive = filters[id].includes(option);
                  return (
                    <button
                      key={option}
                      className={`filter-option-btn ${id.slice(0, -1)}-pill ${isActive ? 'active' : ''}`}
                      onClick={() => toggleSelection(id, option)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="filter-drawer-footer">
          <button className="btn-reset-filters" onClick={handleReset}>
            Restablecer
          </button>
          <button className="btn-apply-filters-main" onClick={handleApply}>
            Aplicar Filtros
          </button>
        </div>
      </div>
    </>
  );
};