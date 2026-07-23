import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/infrastructure/api/catalogApi', () => ({
  catalogApi: {
    list: vi.fn(),
  },
}));

vi.mock('@/presentation/components/ProductDetailModal', () => ({
  ProductDetailModal: ({ product, isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="product-modal">
        <p>{product?.nombre}</p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    ) : null,
}));

vi.mock('@/presentation/pages/components/FilterDrawer', () => ({
  FilterDrawer: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="filter-drawer">
        <button onClick={onClose}>Cerrar filtros</button>
      </div>
    ) : null,
}));

const { catalogApi } = await import('@/infrastructure/api/catalogApi');
const mockCatalogList = catalogApi.list as ReturnType<typeof vi.fn>;

import CatalogPage from '@/presentation/pages/features/CatalogPage';

const mockProducts = [
  {
    id: '1',
    ref: '1',
    nombre: 'Camiseta Premium',
    categoria: 'Camisas',
    precio: 45000,
    imagenPrincipal: '',
    imagenes: [],
    marca: 'SurtiTelas',
    tallas: ['M', 'L'],
    colores: ['Azul'],
    stock: 10,
    cantidadStock: 10,
    destacado: true,
    nuevo: true,
    publicado: true,
    estado: 'Activo',
  },
  {
    id: '2',
    ref: '2',
    nombre: 'Pantaloneta Deportiva',
    categoria: 'Pantalones',
    precio: 35000,
    imagenPrincipal: '',
    imagenes: [],
    marca: 'SurtiTelas',
    tallas: ['S', 'M'],
    colores: ['Negro'],
    stock: 0,
    cantidadStock: 0,
    destacado: false,
    nuevo: false,
    publicado: true,
    estado: 'Activo',
  },
];

describe('CatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCatalogList.mockResolvedValue(mockProducts);
    window.localStorage.clear();
  });

  it('renders product grid after loading', async () => {
    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Camiseta Premium')).toBeInTheDocument();
      expect(screen.getByText('Pantaloneta Deportiva')).toBeInTheDocument();
    });
  });

  it('filters products by search term', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Camiseta Premium')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar productos, marcas, categorías...');
    await user.type(searchInput, 'Pantaloneta');

    await waitFor(() => {
      expect(screen.queryByText('Camiseta Premium')).not.toBeInTheDocument();
      expect(screen.getByText('Pantaloneta Deportiva')).toBeInTheDocument();
    });
  });

  it('opens product detail modal on click', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Camiseta Premium')).toBeInTheDocument();
    });

    const productCards = screen.getAllByText('Camiseta Premium');
    await user.click(productCards[0]);

    expect(screen.getByTestId('product-modal')).toBeInTheDocument();
    expect(screen.getByText('Cerrar')).toBeInTheDocument();
  });

  it('toggles favorite and persists to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Camiseta Premium')).toBeInTheDocument();
    });

    const favoriteButtons = screen.getAllByLabelText('Agregar a favoritos');
    await user.click(favoriteButtons[0]);

    const stored = JSON.parse(window.localStorage.getItem('surtitelas.favorites') || '[]');
    expect(stored).toContain('1');
  });

  it('shows empty state when no products match', async () => {
    mockCatalogList.mockResolvedValue([]);
    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No se encontraron productos')).toBeInTheDocument();
    });
  });
});
