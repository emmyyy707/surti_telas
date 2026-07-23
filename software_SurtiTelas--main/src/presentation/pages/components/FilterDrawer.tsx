import React, { useState } from 'react';
import './FilterDrawer.css';

// --- ICONOS SVG PROPIOS ---
const IconX = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
}

export interface FilterState {
  tallas: string[];
  marcas: string[];
  categoriasEspeciales: string[];
}

// Datos de ejemplo basados en tu imagen de referencia
const TALLAS_OPCIONES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const MARCAS_OPCIONES = ['Nike', 'Puma', 'Adidas', 'Reebok', 'Under Armour'];
const CATEGORIAS_ESPECIALES_OPCIONES = ['Pantaloneta Burda Bordada', 'Oversize Alta', 'Burda Bordada', 'Telas Frás', 'Blusas Cortas'];

export const FilterDrawer: React.FC<FilterDrawerProps> = ({ isOpen, onClose, onApplyFilters }) => {
  // Estado local para los filtros seleccionados
  const [selectedTallas, setSelectedTallas] = useState<string[]>([]);
  const [selectedMarcas, setSelectedMarcas] = useState<string[]>([]);
  const [selectedCategoriasEspeciales, setSelectedCategoriasEspeciales] = useState<string[]>([]);

  // Funciones para manejar la selección múltiple
  const toggleSelection = (option: string, state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>) => {
    setState(prev =>
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    );
  };

  const handleApply = () => {
    onApplyFilters({
      tallas: selectedTallas,
      marcas: selectedMarcas,
      categoriasEspeciales: selectedCategoriasEspeciales,
    });
    onClose(); // Cierra el drawer al aplicar
  };

  const handleReset = () => {
    setSelectedTallas([]);
    setSelectedMarcas([]);
    setSelectedCategoriasEspeciales([]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay de fondo con desenfoque */}
      <div className="filter-drawer-overlay" onClick={onClose}></div>

      {/* Panel del Drawer */}
      <div className={`filter-drawer ${isOpen ? 'open' : ''}`}>
        <div className="filter-drawer-header">
          <div>
            <h3>Filtros</h3>
            <p className="filter-drawer-subtitle">Personaliza tu búsqueda</p>
          </div>
          <button className="close-filter-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className="filter-drawer-content">
          {/* SECCIÓN DE TALLAS */}
          <div className="filter-section">
            <h4>Tallas</h4>
            <div className="filter-options-grid tallas-grid">
              {TALLAS_OPCIONES.map(talla => (
                <button
                  key={talla}
                  className={`filter-option-btn talla-pill ${selectedTallas.includes(talla) ? 'active' : ''}`}
                  onClick={() => toggleSelection(talla, selectedTallas, setSelectedTallas)}
                >
                  {talla}
                </button>
              ))}
            </div>
          </div>

          {/* SECCIÓN DE MARCAS */}
          <div className="filter-section">
            <h4>Marcas</h4>
            <div className="filter-options-grid marcas-grid">
              {MARCAS_OPCIONES.map(marca => (
                <button
                  key={marca}
                  className={`filter-option-btn marca-pill ${selectedMarcas.includes(marca) ? 'active' : ''}`}
                  onClick={() => toggleSelection(marca, selectedMarcas, setSelectedMarcas)}
                >
                  {marca}
                </button>
              ))}
            </div>
          </div>

          {/* SECCIÓN DE CATEGORÍAS ESPECIALES */}
          <div className="filter-section">
            <h4>Categorás Especiales</h4>
            <div className="filter-options-grid categorias-especiales-grid">
              {CATEGORIAS_ESPECIALES_OPCIONES.map(cat => (
                <button
                  key={cat}
                  className={`filter-option-btn categoria-especial-pill ${selectedCategoriasEspeciales.includes(cat) ? 'active' : ''}`}
                  onClick={() => toggleSelection(cat, selectedCategoriasEspeciales, setSelectedCategoriasEspeciales)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER CON BOTONES DE ACCIÓN */}
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


