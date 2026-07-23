import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../presentation/pages/admin/StatCard', () => ({
  StatCard: ({ label, value }: any) => (
    <div>
      <div>{label}</div>
      <div>{value}</div>
    </div>
  ),
}));

vi.mock('../presentation/pages/admin/Chart', () => ({
  BarChart: ({ title }: any) => <div data-testid="bar-chart">{title}</div>,
  LineChart: ({ title }: any) => <div data-testid="line-chart">{title}</div>,
  PieChart: ({ title }: any) => <div data-testid="pie-chart">{title}</div>,
  TopProducts: ({ title }: any) => <div data-testid="top-products">{title}</div>,
}));

vi.mock('../shared/ui/Badge', () => ({
  Badge: ({ children, variant }: any) => <span data-testid="badge">{children}</span>,
}));

vi.mock('../infrastructure/api/httpClient', () => ({
  api: {
    get: vi.fn(),
  },
}));

const mockedApi = (await import('../infrastructure/api/httpClient')).api;
const mockApiGet = mockedApi.get as ReturnType<typeof vi.fn>;

import { AdminDashboard } from '@/presentation/pages/admin/Dashboard';

const mockDashboardData = {
  totalOrders: 150,
  totalCustomers: 45,
  totalSales: 25000000,
  ordersByStatus: [
    { estado: 'ENTREGADO', cantidad: 80 },
    { estado: 'EN_PRODUCCION', cantidad: 40 },
    { estado: 'PENDIENTE', cantidad: 30 },
  ],
  recentOrders: [
    {
      id: 'ORD-001',
      numero: 'ORD-001',
      cliente: 'Juan Pérez',
      asesor: 'María García',
      total: 120000,
      estado: 'ENTREGADO',
      createdAt: '2026-07-15',
    },
  ],
  lowStockProducts: [],
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiGet.mockResolvedValue(mockDashboardData);
  });

  it('renders dashboard stats after loading', async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Clientes')).toBeInTheDocument();
      expect(screen.getByText('Pedidos Totales')).toBeInTheDocument();
      expect(screen.getByText('Ingresos Totales')).toBeInTheDocument();
    });
  });

  it('displays recent orders table', async () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeInTheDocument();
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('María García')).toBeInTheDocument();
    });
  });

  it('shows error state when API fails', async () => {
    mockApiGet.mockRejectedValue(new Error('Error de conexión'));

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no se pudieron cargar las métricas/i)).toBeInTheDocument();
    });
  });
});
