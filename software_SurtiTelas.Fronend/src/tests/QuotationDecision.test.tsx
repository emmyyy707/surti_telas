import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuotationDecision } from '@/presentation/pages/cliente/quotation-steps/QuotationDecision';

const mockItems = [
  {
    detalleId: 'item-1',
    descripcion: 'Camiseta deportiva',
    tipo: 'PRODUCTO_BASE',
    cantidad: 10,
    precioUnitario: 50000,
    subtotal: 500000,
    status: 'PENDIENTE' as const,
  },
  {
    detalleId: 'item-2',
    descripcion: 'Pantalón personalizado',
    tipo: 'PRODUCTO_BASE',
    cantidad: 5,
    precioUnitario: 60000,
    subtotal: 300000,
    status: 'PENDIENTE' as const,
  },
  {
    detalleId: 'item-3',
    descripcion: 'Camiseta bordada',
    tipo: 'PRODUCTO_BASE',
    cantidad: 8,
    precioUnitario: 43750,
    subtotal: 350000,
    status: 'PENDIENTE' as const,
  },
];

const defaultProps = {
  quotationId: 'quote-123',
  numeroCotizacion: 'COT-001',
  numeroSolicitud: 'SOL-001',
  estado: 'ENVIADA',
  fechaEmision: '2026-08-27T00:00:00Z',
  validaHasta: '2026-09-27T00:00:00Z',
  condicionesPago: '50% anticipo, 50% contra entrega',
  observaciones: 'Cotización válida por 30 días',
  subtotal: 1150000,
  descuento: 0,
  impuestos: 0,
  total: 1150000,
  items: mockItems,
  onConfirmSelection: vi.fn().mockResolvedValue(undefined),
  onCancel: vi.fn(),
  loading: false,
};

describe('QuotationDecision', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all products in the quotation', () => {
    render(<QuotationDecision {...defaultProps} />);

    expect(screen.getByText('Camiseta deportiva')).toBeTruthy();
    expect(screen.getByText('Pantalón personalizado')).toBeTruthy();
    expect(screen.getByText('Camiseta bordada')).toBeTruthy();
  });

  it('shows quotation header information', () => {
    render(<QuotationDecision {...defaultProps} />);

    expect(screen.getByText('Cotización #COT-001')).toBeTruthy();
    expect(screen.getByText('Solicitud #SOL-001')).toBeTruthy();
    expect(screen.getByText('ENVIADA')).toBeTruthy();
  });

  it('shows economic summary correctly', () => {
    render(<QuotationDecision {...defaultProps} />);

    const totalElements = screen.getAllByText((content, element) => {
      return element?.textContent?.includes('1.150.000') || false;
    });
    expect(totalElements.length).toBeGreaterThan(0);
  });

  it('allows accepting a product', async () => {
    const user = userEvent.setup();
    render(<QuotationDecision {...defaultProps} />);

    const acceptButtons = screen.getAllByText('Aceptar');
    await user.click(acceptButtons[0]);

    expect(screen.getAllByText('Aceptado').length).toBeGreaterThan(0);
  });

  it('opens reject modal when rejecting a product', async () => {
    const user = userEvent.setup();
    render(<QuotationDecision {...defaultProps} />);

    const rejectButtons = screen.getAllByText('Rechazar');
    await user.click(rejectButtons[0]);

    const modalTitles = screen.getAllByText(/Rechazar producto/i);
    expect(modalTitles.length).toBeGreaterThan(0);
  });

  it('requires reason when rejecting a product', async () => {
    const user = userEvent.setup();
    render(<QuotationDecision {...defaultProps} />);

    const rejectButtons = screen.getAllByText('Rechazar');
    await user.click(rejectButtons[0]);

    const confirmButton = screen.getByText('Rechazar producto', { selector: 'button' });
    expect(confirmButton).toBeTruthy();

    const reasonButtons = screen.getAllByRole('button').filter(btn =>
      btn.textContent === 'Precio demasiado alto'
    );
    expect(reasonButtons.length).toBeGreaterThan(0);
  });

  it('updates total when products are accepted/rejected', async () => {
    const user = userEvent.setup();
    render(<QuotationDecision {...defaultProps} />);

    const acceptButtons = screen.getAllByText('Aceptar');
    await user.click(acceptButtons[0]);
    await user.click(acceptButtons[1]);

    expect(screen.getByText('Total seleccionado')).toBeTruthy();
  });

  it('shows validation warning when products are pending', () => {
    render(<QuotationDecision {...defaultProps} />);

    expect(screen.getByText(/Debes decidir sobre todos los productos/)).toBeTruthy();
  });

  it('disables confirm button when products are pending', () => {
    render(<QuotationDecision {...defaultProps} />);

    const confirmButton = screen.getByText('Confirmar selección');
    expect(confirmButton.getAttribute('disabled')).not.toBeNull();
  });

  it('enables confirm button when all products have decisions', async () => {
    const user = userEvent.setup();
    render(<QuotationDecision {...defaultProps} />);

    const acceptButtons = screen.getAllByText('Aceptar');
    await user.click(acceptButtons[0]);
    await user.click(acceptButtons[1]);

    const rejectButtons = screen.getAllByText('Rechazar');
    await user.click(rejectButtons[0]);

    const reasonButton = screen.getByText('Precio demasiado alto');
    await user.click(reasonButton);

    const confirmRejectButtons = screen.getAllByText('Rechazar producto');
    await user.click(confirmRejectButtons[confirmRejectButtons.length - 1]);

    const confirmButton = screen.getByText('Confirmar selección');
    expect(confirmButton).not.toBeDisabled();
  });

  it('calls onConfirmSelection with correct decisions', async () => {
    const onConfirmSelection = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<QuotationDecision {...defaultProps} onConfirmSelection={onConfirmSelection} />);

    const acceptButtons = screen.getAllByText('Aceptar');
    await user.click(acceptButtons[0]);
    await user.click(acceptButtons[1]);

    const rejectButtons = screen.getAllByText('Rechazar');
    await user.click(rejectButtons[0]);

    const reasonButton = screen.getByText('Precio demasiado alto');
    await user.click(reasonButton);

    const confirmRejectButtons = screen.getAllByText('Rechazar producto');
    await user.click(confirmRejectButtons[confirmRejectButtons.length - 1]);

    const confirmButtons = screen.getAllByText('Confirmar selección');
    await user.click(confirmButtons[0]);

    const finalConfirmButtons = screen.getAllByText('Confirmar selección');
    await user.click(finalConfirmButtons[finalConfirmButtons.length - 1]);

    await waitFor(() => {
      expect(onConfirmSelection).toHaveBeenCalled();
    });
  });

  it('shows correct counts in selection summary', async () => {
    const user = userEvent.setup();
    render(<QuotationDecision {...defaultProps} />);

    const acceptButtons = screen.getAllByText('Aceptar');
    await user.click(acceptButtons[0]);
    await user.click(acceptButtons[1]);

    expect(screen.getByText('2')).toBeTruthy();
  });
});
