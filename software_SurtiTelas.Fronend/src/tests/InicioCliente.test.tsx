import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { InicioCliente } from '@/presentation/pages/cliente/InicioCliente';

const mockUser = {
  uid: 'client-123',
  name: 'Juan Cliente',
  email: 'juan@test.com',
  role: 'cliente',
};

const mockOrders = [
  {
    id: 'ORD-001',
    cliente: 'Juan Cliente',
    fecha: '2026-07-15',
    total: '$120.000',
    items: 3,
    estado: 'En producción',
    asesor: 'María García',
  },
  {
    id: 'ORD-002',
    cliente: 'Juan Cliente',
    fecha: '2026-07-10',
    total: '$80.000',
    items: 2,
    estado: 'Entregado',
    asesor: 'María García',
  },
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

vi.mock('@/shared/ui/DetailModal', () => ({
  DetailModal: ({ pedido, isOpen, onClose }: { pedido?: { id?: string }; isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="detail-modal">
        <p>{pedido?.id}</p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    ) : null,
}));

vi.mock('@/shared/ui/Modal', () => ({
  Modal: ({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) =>
    open ? (
      <div data-testid="modal">
        {children}
        <button onClick={onClose}>Cerrar</button>
      </div>
    ) : null,
}));

vi.mock('@/shared/ui/Button', () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: { children: React.ReactNode; onClick?: () => void; variant?: string; size?: string; className?: string }) => (
    <button onClick={onClick} data-variant={variant} data-size={size} className={className} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/core/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/infrastructure/api/ordersApi', () => ({
  ordersApi: {
    list: vi.fn(),
  },
}));

vi.mock('@/core/stores', () => ({
  useAppStore: vi.fn(),
}));

describe('InicioCliente', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const mockedAuthStore = await import('@/core/stores/authStore');
    const mockedOrdersApi = await import('@/infrastructure/api/ordersApi');
    const mockedAppStore = await import('@/core/stores');

    mockedAuthStore.useAuthStore.mockReturnValue(mockUser);
    mockedOrdersApi.ordersApi.list.mockResolvedValue({ pedidos: mockOrders });
    mockedAppStore.useAppStore.mockReturnValue({ addNotificacion: vi.fn() });
  });

  it('renders client dashboard stats after loading', async () => {
    render(
      <MemoryRouter>
        <InicioCliente />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pedidos Realizados')).toBeInTheDocument();
      expect(screen.getByText('En Proceso')).toBeInTheDocument();
      expect(screen.getByText('Entregados')).toBeInTheDocument();
      expect(screen.getByText('Total Comprado')).toBeInTheDocument();
    });
  });

  it('displays active order card', async () => {
    render(
      <MemoryRouter>
        <InicioCliente />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeInTheDocument();
    });
  });

  it('opens chat modal when clicking chat button', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <InicioCliente />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Chatear con/)).toBeInTheDocument();
    });

    await user.click(screen.getByText(/Chatear con/));

    expect(screen.getByPlaceholderText('Escribe tu consulta...')).toBeInTheDocument();
  });
});
