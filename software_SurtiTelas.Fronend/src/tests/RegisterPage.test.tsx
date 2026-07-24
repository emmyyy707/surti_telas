import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '@/presentation/pages/auth/RegisterPage';

const mockUseAuth = vi.fn();

vi.mock('@/app/providers/AppProviders', () => ({
  useAuth: () => mockUseAuth(),
  TEST_ACCOUNTS: [],
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      loginWithCredentials: vi.fn().mockResolvedValue({ success: false, error: 'Credenciales incorrectas' }),
      clearReturnTo: vi.fn(),
    });
  });

  it('renders register form fields', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/apellido/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear cuenta gratis/i })).toBeInTheDocument();
  });

  it('allows typing in form fields', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    await user.type(screen.getByPlaceholderText(/nombre/i), 'Juan');
    await user.type(screen.getByPlaceholderText(/apellido/i), 'Pérez');
    await user.type(screen.getByPlaceholderText(/email/i), 'juan@test.com');
    await user.type(screen.getByPlaceholderText(/teléfono/i), '3001234567');
    await user.type(screen.getByPlaceholderText(/contraseña/i), 'Abc12345');

    expect(screen.getByPlaceholderText(/nombre/i)).toHaveValue('Juan');
    expect(screen.getByPlaceholderText(/email/i)).toHaveValue('juan@test.com');
  });
});
