import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AsesorDashboard } from '@/presentation/pages/asesor/Dashboard';

const mockUser = {
  uid: 'user-123',
  name: 'María García',
  email: 'maria@test.com',
  role: 'asesor',
};

const mockOrders = [
  {
    id: 'ORD-001',
    cliente: 'Cliente Uno',
    fecha: '2026-07-15',
    total: '$120.000',
    items: 3,
    estado: 'Entregado',
    asesor: 'María García',
  },
  {
    id: 'ORD-002',
    cliente: 'Cliente Dos',
    fecha: '2026-07-10',
    total: '$80.000',
    items: 2,
    estado: 'En producción',
    asesor: 'María García',
  },
];

const mockCustomers = [
  { nombre: 'Cliente Uno', asesor: 'María García', ciudad: 'Bogotá', tel: '3001234567' },
  { nombre: 'Cliente Dos', asesor: 'María García', ciudad: 'Medellín', tel: '3009876543' },
];

vi.mock('@/presentation/pages/admin/StatCard', () => ({
  StatCard: ({ label, value }: { label: string; value: string }) => (
    <div>
      <div>{label}</div>
      <div>{value}</div>
    </div>
  ),
}));

vi.mock('@/shared/ui/Badge', () => ({
  Badge: ({ children, variant: _variant }: { children: React.ReactNode; variant?: string }) => <span data-testid="badge">{children}</span>,
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

describe('AsesorDashboard', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const mockedAuthStore = await import('@/core/stores/authStore');
    const mockedOrdersApi = await import('@/infrastructure/api/ordersApi');
    const mockedCustomersApi = await import('@/infrastructure/api/customersApi');

    mockedAuthStore.useAuthStore.mockReturnValue(mockUser);
    mockedOrdersApi.ordersApi.list.mockResolvedValue({ pedidos: mockOrders });
    mockedCustomersApi.customersApi.list.mockResolvedValue(mockCustomers);
  });

  it('renders dashboard stats after loading', async () => {
    render(
      <MemoryRouter>
        <AsesorDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Mis Clientes')).toBeInTheDocument();
      expect(screen.getByText('Pedidos del Mes')).toBeInTheDocument();
      expect(screen.getByText('Comisión Acumulada')).toBeInTheDocument();
      expect(screen.getByText('Ventas Entregadas')).toBeInTheDocument();
    });
  });

  it('displays recent orders', async () => {
    render(
      <MemoryRouter>
        <AsesorDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Pedido ORD-001/)).toBeInTheDocument();
      expect(screen.getAllByText('Cliente Uno').length).toBeGreaterThan(0);
    });
  });

  it('shows empty state when user is not authenticated', async () => {
    const mockedAuthStore = await import('@/core/stores/authStore');
    mockedAuthStore.useAuthStore.mockReturnValue(null);

    render(
      <MemoryRouter>
        <AsesorDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Mis Clientes')).not.toBeInTheDocument();
    });
  });
});
