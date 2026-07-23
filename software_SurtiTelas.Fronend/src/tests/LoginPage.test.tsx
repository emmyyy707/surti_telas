import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '@/presentation/pages/auth/LoginPage';

const mockUseAuth = vi.fn();

vi.mock('@/app/providers/AppProviders', () => ({
  useAuth: () => mockUseAuth(),
  TEST_ACCOUNTS: [],
}));

describe('LoginPage', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      loginWithCredentials: vi.fn().mockResolvedValue({ success: false, error: 'Credenciales incorrectas' }),
      clearReturnTo: vi.fn(),
    });
  });

  it('renders login form fields', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getAllByText('Iniciar sesión').length).toBeGreaterThan(0);
  });

  it('allows typing email and password', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/contraseña/i);

    await user.type(emailInput, 'admin@test.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('admin@test.com');
    expect(passwordInput).toHaveValue('password123');
  });
});
