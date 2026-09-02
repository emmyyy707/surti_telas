import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { NotificationPopover } from '@/shared/components/notifications/NotificationPopover';

const mockMarkAllAsRead = vi.fn().mockResolvedValue(undefined);
const mockDeleteAll = vi.fn().mockResolvedValue(undefined);
const mockRefresh = vi.fn();

const defaultNotifications = [
  {
    id: 'n-1',
    tipo: 'info',
    titulo: 'Test',
    mensaje: 'Mensaje',
    leida: false,
    createdAt: Date.now(),
  },
  {
    id: 'n-2',
    tipo: 'success',
    titulo: 'Test 2',
    mensaje: 'Mensaje 2',
    leida: true,
    createdAt: Date.now() - 86_400_000,
  },
];

vi.mock('@/shared/context/NotificationContext', () => ({
  useNotifications: () => ({
    notifications: defaultNotifications,
    unreadCount: 1,
    loading: false,
    error: null,
    markAsRead: vi.fn(),
    markAllAsRead: mockMarkAllAsRead,
    deleteAll: mockDeleteAll,
    refresh: mockRefresh,
  }),
}));

const renderPopover = (props = {}) =>
  render(
    <MemoryRouter>
      <NotificationPopover isOpen={true} onClose={vi.fn()} userRole="ADMIN" {...props} />
    </MemoryRouter>
  );

describe('NotificationPopover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows mark all as read button when there are unread notifications', () => {
    renderPopover();
    expect(screen.getByText('Marcar todas como leídas')).toBeInTheDocument();
  });

  it('shows empty tray button when there are notifications', () => {
    renderPopover();
    expect(screen.getByRole('button', { name: 'Vaciar bandeja' })).toBeInTheDocument();
  });

  it('opens confirmation modal when clicking empty tray button', async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole('button', { name: 'Vaciar bandeja' }));

    expect(screen.getByText('Vaciar bandeja', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByText(/¿Estás seguro de que deseas eliminar todas tus notificaciones/i)).toBeInTheDocument();
  });

  it('calls deleteAll when confirming empty tray', async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole('button', { name: 'Vaciar bandeja' }));
    const confirmButtons = screen.getAllByRole('button', { name: 'Vaciar bandeja' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(mockDeleteAll).toHaveBeenCalled();
  });

  it('does not call deleteAll when canceling confirmation', async () => {
    const user = userEvent.setup();
    renderPopover();

    await user.click(screen.getByRole('button', { name: 'Vaciar bandeja' }));
    await user.click(screen.getByText('Cancelar'));

    expect(mockDeleteAll).not.toHaveBeenCalled();
  });
});
