import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/presentation/routes/ProtectedRoute';

const mockUseAuth = vi.fn();

vi.mock('@/app/providers/AppProviders', () => ({
  useAuth: () => mockUseAuth(),
  TEST_ACCOUNTS: [],
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it('renders children when user is authenticated with allowed role', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'admin', email: 'admin@test.com' },
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Admin Content</div>
            </ProtectedRoute>
          } />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/unauthorized" element={<div>Unauthorized</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Admin Content</div>
            </ProtectedRoute>
          } />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/unauthorized" element={<div>Unauthorized</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to unauthorized when role is not allowed', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'cliente', email: 'cliente@test.com' },
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Admin Content</div>
            </ProtectedRoute>
          } />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/unauthorized" element={<div>Unauthorized</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Unauthorized')).toBeInTheDocument();
  });
});
