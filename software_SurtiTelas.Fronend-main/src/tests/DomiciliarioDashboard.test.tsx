import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DomiciliarioDashboard } from '@/presentation/pages/domiciliario/Dashboard';

const mockUser = {
  uid: 'domi-123',
  name: 'Carlos Domiciliario',
  email: 'carlos@test.com',
  role: 'domiciliario',
};

const mockOrders = [
  {
    id: 'ORD-001',
    cliente: 'Cliente Uno',
    fecha: '2026-07-15',
    total: '$120.000',
    items: 3,
    estado: 'En camino',
    asesor: 'María García',
  },
  {
    id: 'ORD-002',
    cliente: 'Cliente Dos',
    fecha: '2026-07-15',
    total: '$80.000',
    items: 2,
    estado: 'Pendiente',
    asesor: 'María García',
  },
];

const mockCustomers = [
  { nombre: 'Cliente Uno', direccion: 'Calle 1', barrio: 'Centro', telefono: '3001234567' },
  { nombre: 'Cliente Dos', direccion: 'Calle 2', barrio: 'Norte', telefono: '3009876543' },
];

vi.mock('@/presentation/pages/admin/StatCard', () => ({
  StatCard: ({ label, value }: any) => (
    <div>
      <div>{label}</div>
      <div>{value}</div>
    </div>
  ),
}));

vi.mock('@/shared/ui/Badge', () => ({
  Badge: ({ children, variant }: any) => <span data-testid="badge">{children}</span>,
}));

vi.mock('@/shared/ui/DetailModal', () => ({
  DetailModal: ({ entrega, isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="detail-modal">
        <p>{entrega?.id}</p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    ) : null,
}));

vi.mock('@/core/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/infrastructure/api/ordersApi', () => ({
  ordersApi: {
    list: vi.fn(),
  },
}));

vi.mock('@/infrastructure/api/customersApi', () => ({
  customersApi: {
    list: vi.fn(),
  },
}));

describe('DomiciliarioDashboard', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const mockedAuthStore = await import('@/core/stores/authStore');
    const mockedOrdersApi = await import('@/infrastructure/api/ordersApi');
    const mockedCustomersApi = await import('@/infrastructure/api/customersApi');

    mockedAuthStore.useAuthStore.mockReturnValue(mockUser);
    mockedOrdersApi.ordersApi.list.mockResolvedValue({ pedidos: mockOrders });
    mockedCustomersApi.customersApi.list.mockResolvedValue(mockCustomers);
  });

  it('renders delivery stats after loading', async () => {
    render(
      <MemoryRouter>
        <DomiciliarioDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Entregas Hoy')).toBeInTheDocument();
      expect(screen.getAllByText('Completadas').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Pendientes').length).toBeGreaterThan(0);
      expect(screen.getByText('Fallidas')).toBeInTheDocument();
    });
  });

  it('displays delivery list', async () => {
    render(
      <MemoryRouter>
        <DomiciliarioDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Cliente Uno').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Cliente Dos').length).toBeGreaterThan(0);
    });
  });

  it('shows empty state when user is not authenticated', async () => {
    const mockedAuthStore = await import('@/core/stores/authStore');
    mockedAuthStore.useAuthStore.mockReturnValue(null);

    render(
      <MemoryRouter>
        <DomiciliarioDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Entregas Hoy')).not.toBeInTheDocument();
    });
  });
});
