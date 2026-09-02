import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AdminGestionVentas } from '@/presentation/pages/admin/GestionVentas';
import { salesApi } from '@/infrastructure/api/salesApi';

vi.mock('@/infrastructure/api/salesApi', () => ({
  salesApi: {
    list: vi.fn(),
  },
}));

vi.mock('@/infrastructure/api/ordersApi', () => ({
  ordersApi: {
    adminList: vi.fn(),
  },
}));

vi.mock('@/shared/ui/SearchInput', () => ({
  SearchInput: ({ value, onChange, onSearch, placeholder }: unknown) => (
    <input
      data-testid="search-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onSearch) onSearch((e.target as HTMLInputElement).value);
      }}
      placeholder={placeholder}
    />
  ),
}));

vi.mock('@/shared/ui/DataTable', () => ({
  DataTable: ({ data, actions, serverMode, currentPage, onPageChange }: unknown) => {
    React.useEffect(() => {
      if (serverMode && onPageChange && currentPage) {
        onPageChange(currentPage);
      }
    }, [serverMode, onPageChange, currentPage]);
    return (
      <div data-testid="data-table">
        {data.map((item: unknown, idx: number) => (
          <div key={item.id || idx} data-testid={`row-${item.id}`}>
            {actions && actions(item).map((action: unknown, aIdx: number) => (
              <button key={aIdx} data-testid={`action-${item.id}-${action.label}`} onClick={() => action.onClick(item)}>
                {action.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  },
}));

const mockedSalesApi = salesApi as unknown;

const mockVenta = (overrides = {}): unknown => ({
  id: 'sale-1',
  orderId: 'order-1',
  numero: 'VENT-001',
  cliente: 'Cliente Test',
  clienteId: 'cli-1',
  asesor: 'Asesor Test',
  asesorId: 'asesor-1',
  fechaVenta: new Date().toISOString(),
  subtotal: 10000,
  impuestos: 1900,
  descuentos: 0,
  total: 11900,
  estado: 'COMPLETADA',
  motivoAnulacion: undefined,
  medioPago: 'CASH',
  itemsCount: 1,
  items: [{ id: 'item-1', nombre: 'Producto', precio: 10000, cantidad: 1, productId: null }],
  orderEstado: 'ENTREGADO',
  payment: null,
  receipt: null,
  customOrder: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('AdminGestionVentas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not show Anular button when orderEstado is ENTREGADO', async () => {
    mockedSalesApi.list.mockResolvedValue({
      data: [mockVenta({ id: 'sale-1', orderEstado: 'ENTREGADO' })],
      meta: { totalRecords: 1, page: 1, limit: 20, totalPages: 1 },
    });

    render(
      <MemoryRouter>
        <AdminGestionVentas />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByTestId('data-table'));

    expect(screen.queryByTestId('action-sale-1-Anular')).not.toBeInTheDocument();
  });

  it('should show Anular button when orderEstado is RECIBO_GENERADO', async () => {
    mockedSalesApi.list.mockResolvedValue({
      data: [mockVenta({ id: 'sale-2', orderEstado: 'RECIBO_GENERADO' })],
      meta: { totalRecords: 1, page: 1, limit: 20, totalPages: 1 },
    });

    render(
      <MemoryRouter>
        <AdminGestionVentas />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByTestId('data-table'));

    expect(screen.getByTestId('action-sale-2-Anular')).toBeInTheDocument();
  });
});
