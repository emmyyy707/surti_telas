import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AcceptOrder } from '@/modules/sales-orders/application/use-cases/AcceptOrder';
import { StartValidation } from '@/modules/sales-orders/application/use-cases/StartValidation';
import { RejectOrder } from '@/modules/sales-orders/application/use-cases/RejectOrder';
import { RetryReceiptDelivery } from '@/modules/sales-orders/application/use-cases/RetryReceiptDelivery';
import type { OrderRepository } from '@/modules/orders/domain/repositories/OrderRepository';
import type { OrderHistoryRepository } from '@/modules/sales-orders/domain/repositories/OrderHistoryRepository';
import type { SaleRepository } from '@/modules/sales-orders/domain/repositories/SaleRepository';
import type { ReceiptRepository } from '@/modules/receipts/domain/repositories/ReceiptRepository';
import type { EventBus } from '@/modules/shared/application/EventBus';
import { Order } from '@/modules/orders/domain/entities/Order';

vi.mock('@/config/database', () => ({
  prisma: {
    $transaction: vi.fn(async (cb: any) => {
      const tx = {
        order: {
          update: vi.fn().mockResolvedValue({
            id: 'order-1',
            numero: 'PED-000001',
            clienteId: 'client-1',
            clienteNombre: 'Juan Pérez',
            cliente: { nombre: 'Juan Pérez' },
            asesorId: 'asesor-1',
            asesorNombre: 'Asesor Test',
            asesor: { nombre: 'Asesor Test' },
            tipoFlujo: 'VENTAS',
            fecha: new Date(),
            subtotal: { toNumber: () => 50000 },
            impuestos: { toNumber: () => 0 },
            descuentos: { toNumber: () => 0 },
            total: { toNumber: () => 50000 },
            itemsCount: 2,
            estado: 'RECIBO_GENERADO',
            prioridad: 'ESTANDAR',
            observaciones: null,
            medioPago: 'TRANSFER',
            fechaValidacion: new Date(),
            usuarioValidacionId: 'user-1',
            usuarioValidacion: { nombre: 'Usuario Test' },
            razonRechazo: null,
            observacionesRechazo: null,
            comprobantePagoUrl: 'http://example.com/proof.jpg',
            comprobantePagoNombre: 'proof.jpg',
            comprobantePagoMime: 'image/jpeg',
            comprobantePagoTamaño: 1024,
            comprobantePagoCargadoEn: new Date(),
            comprobantePagoCargadoPorId: 'user-1',
            comprobantePagoCargadoPor: { nombre: 'Usuario Test' },
            comprobantePagoEstado: 'PENDIENTE_VALIDACION',
            comprobantePagoObservaciones: null,
            items: [{ productId: '1', nombre: 'Camiseta', precio: { toNumber: () => 25000 }, cantidad: 2 }],
            itemsList: [{ productId: '1', nombre: 'Camiseta', precio: 25000, cantidad: 2 }],
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        },
        orderHistory: {
          create: vi.fn().mockResolvedValue({ id: 'hist-1' }),
        },
      };
      return cb(tx);
    }),
  },
}));

const createMockOrder = (estado: Order['estado'], overrides = {}): Order =>
  new Order({
    id: 'order-1',
    numero: 'PED-000001',
    cliente: 'Juan Pérez',
    clienteId: 'client-1',
    asesor: 'Asesor Test',
    asesorId: 'asesor-1',
    tipoFlujo: 'VENTAS',
    fecha: new Date().toISOString(),
    total: 50000,
    items: 2,
    estado,
    comprobantePagoUrl: 'http://example.com/proof.jpg',
    comprobantePagoEstado: 'PENDIENTE_VALIDACION',
    itemsList: [
      { productId: '1', nombre: 'Camiseta', precio: 25000, cantidad: 2 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

const mockSale = {
  id: 'sale-1',
  orderId: 'order-1',
  clienteId: 'client-1',
  clienteNombre: 'Juan Pérez',
  asesorId: 'asesor-1',
  asesorNombre: 'Asesor Test',
  fechaVenta: new Date().toISOString(),
  subtotal: 50000,
  impuestos: 0,
  descuentos: 0,
  total: 50000,
  estado: 'COMPLETADA',
  medioPago: 'TRANSFER',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockReceipt = {
  id: 'receipt-1',
  orderId: 'order-1',
  customerId: 'client-1',
  numero: 'REC-000001',
  total: 50000,
  concepto: 'Venta PED-000001 - 2 ítems',
  emitidoPor: 'Asesor Test',
  emitidoAt: new Date().toISOString(),
  estado: 'BORRADOR',
  estadoEnvio: 'PENDIENTE',
  intentosEnvio: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function createMocks() {
  const mockOrderRepo: jest.Mocked<OrderRepository> = {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
    updateFull: vi.fn(),
    assignDomiciliario: vi.fn(),
    softDelete: vi.fn(),
    updatePaymentProof: vi.fn(),
    updateValidationResult: vi.fn(),
    updateToAccepted: vi.fn(),
    updateToRejected: vi.fn(),
    updateReceiptSent: vi.fn(),
    getWithPaymentProof: vi.fn(),
  };

  const mockHistoryRepo: jest.Mocked<OrderHistoryRepository> = {
    create: vi.fn(),
    findByPedidoId: vi.fn(),
  };

  const mockSaleRepo: jest.Mocked<SaleRepository> = {
    create: vi.fn(),
    findByOrderId: vi.fn(),
    list: vi.fn(),
  };

  const mockReceiptRepo: jest.Mocked<ReceiptRepository> = {
    list: vi.fn(),
    getById: vi.fn(),
    findByOrderId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };

  const mockEventBus: jest.Mocked<EventBus> = {
    publish: vi.fn(),
    subscribe: vi.fn(),
  };

  return { mockOrderRepo, mockHistoryRepo, mockSaleRepo, mockReceiptRepo, mockEventBus };
}

describe('AcceptOrder', () => {
  it('should create sale and receipt and return order in Recibo generado state', async () => {
    const { mockOrderRepo, mockHistoryRepo, mockSaleRepo, mockReceiptRepo, mockEventBus } = createMocks();
    const orderPendiente = createMockOrder('Pendiente');
    const orderAceptado = createMockOrder('Aceptado', { usuarioValidacionId: 'user-1', fechaValidacion: new Date().toISOString(), medioPago: 'TRANSFER' });
    const orderReciboGenerado = createMockOrder('Recibo generado', { usuarioValidacionId: 'user-1', fechaValidacion: new Date().toISOString(), medioPago: 'TRANSFER' });

    mockOrderRepo.getById.mockResolvedValueOnce(orderPendiente).mockResolvedValueOnce(orderAceptado).mockResolvedValueOnce(orderReciboGenerado);
    mockOrderRepo.updateToAccepted.mockResolvedValue(orderAceptado);
    mockSaleRepo.create.mockResolvedValue(mockSale as any);
    mockReceiptRepo.create.mockResolvedValue(mockReceipt as any);

    const useCase = new AcceptOrder(mockOrderRepo, mockHistoryRepo, mockSaleRepo, mockReceiptRepo, mockEventBus);
    const result = await useCase.execute('order-1', { usuarioId: 'user-1', medioPago: 'TRANSFER' });

    expect(mockOrderRepo.updateToAccepted).toHaveBeenCalledWith('order-1', {
      usuarioValidacionId: 'user-1',
      fechaValidacion: expect.any(Date),
      medioPago: 'TRANSFER',
    });
    expect(mockSaleRepo.create).toHaveBeenCalled();
    expect(mockReceiptRepo.create).toHaveBeenCalled();
    expect(result.estado).toBe('Recibo generado');
    expect(mockEventBus.publish).toHaveBeenCalledWith({
      type: 'order.accepted',
      occurredAt: expect.any(Date),
      payload: expect.objectContaining({
        orderId: 'order-1',
        saleId: 'sale-1',
        receiptId: 'receipt-1',
      }),
      requestId: undefined,
    });
  });

  it('should throw if order is not found', async () => {
    const { mockOrderRepo, mockHistoryRepo, mockSaleRepo, mockReceiptRepo, mockEventBus } = createMocks();
    mockOrderRepo.getById.mockResolvedValue(null);

    const useCase = new AcceptOrder(mockOrderRepo, mockHistoryRepo, mockSaleRepo, mockReceiptRepo, mockEventBus);

    await expect(useCase.execute('order-1', { usuarioId: 'user-1' })).rejects.toThrow('Pedido no encontrado');
  });

  it('should throw if order has no payment proof', async () => {
    const { mockOrderRepo, mockHistoryRepo, mockSaleRepo, mockReceiptRepo, mockEventBus } = createMocks();
    const orderSinComprobante = createMockOrder('Pendiente', { comprobantePagoUrl: undefined, comprobantePagoEstado: undefined });
    mockOrderRepo.getById.mockResolvedValue(orderSinComprobante);

    const useCase = new AcceptOrder(mockOrderRepo, mockHistoryRepo, mockSaleRepo, mockReceiptRepo, mockEventBus);

    await expect(useCase.execute('order-1', { usuarioId: 'user-1' })).rejects.toThrow('comprobante de pago válido');
  });
});

describe('StartValidation', () => {
  it('should update order status to En validacion and create history', async () => {
    const { mockOrderRepo, mockHistoryRepo, mockEventBus } = createMocks();
    const orderPendiente = createMockOrder('Pendiente');
    const orderEnValidacion = createMockOrder('En validación');

    mockOrderRepo.getById.mockResolvedValue(orderPendiente);
    mockOrderRepo.updateStatus.mockResolvedValue(orderEnValidacion);

    const useCase = new StartValidation(mockOrderRepo, mockHistoryRepo, mockEventBus);
    const result = await useCase.execute('order-1', 'user-1');

    expect(mockOrderRepo.updateStatus).toHaveBeenCalledWith('order-1', 'En validación');
    expect(mockHistoryRepo.create).toHaveBeenCalledWith({
      pedidoId: 'order-1',
      usuarioId: 'user-1',
      accion: 'VALIDACION_INICIADA',
      estadoAnterior: 'Pendiente',
      estadoNuevo: 'En validación',
    });
    expect(result.estado).toBe('En validación');
  });
});

describe('RejectOrder', () => {
  it('should update order to Rechazado and create history with reason', async () => {
    const { mockOrderRepo, mockHistoryRepo, mockEventBus } = createMocks();
    const orderEnValidacion = createMockOrder('En validación');
    const orderRechazado = createMockOrder('Rechazado', { razonRechazo: 'PAGO_INCOMPLETO', observacionesRechazo: 'Falta dinero' });

    mockOrderRepo.getById.mockResolvedValue(orderEnValidacion);
    mockOrderRepo.updateToRejected.mockResolvedValue(orderRechazado);

    const useCase = new RejectOrder(mockOrderRepo, mockHistoryRepo, mockEventBus);
    const result = await useCase.execute('order-1', { usuarioId: 'user-1', razon: 'PAGO_INCOMPLETO', observaciones: 'Falta dinero' });

    expect(mockOrderRepo.updateToRejected).toHaveBeenCalledWith('order-1', {
      usuarioValidacionId: 'user-1',
      fechaValidacion: expect.any(Date),
      razonRechazo: 'PAGO_INCOMPLETO',
      observacionesRechazo: 'Falta dinero',
    });
    expect(mockHistoryRepo.create).toHaveBeenCalledWith({
      pedidoId: 'order-1',
      usuarioId: 'user-1',
      accion: 'PEDIDO_RECHAZADO',
      estadoAnterior: 'En validación',
      estadoNuevo: 'Rechazado',
      razon: 'PAGO_INCOMPLETO',
      informacion: { observaciones: 'Falta dinero' },
    });
    expect(result.estado).toBe('Rechazado');
    expect(result.razonRechazo).toBe('PAGO_INCOMPLETO');
  });
});

describe('RetryReceiptDelivery', () => {
  it('should find receipt by orderId and update retry state', async () => {
    const { mockOrderRepo, mockHistoryRepo, mockReceiptRepo, mockEventBus } = createMocks();
    const orderReciboGenerado = createMockOrder('Recibo generado');
    const orderMismoEstado = createMockOrder('Recibo generado');

    mockOrderRepo.getById.mockResolvedValue(orderReciboGenerado);
    mockReceiptRepo.findByOrderId.mockResolvedValue(mockReceipt as any);
    mockOrderRepo.updateReceiptSent.mockResolvedValue(orderMismoEstado);

    const useCase = new RetryReceiptDelivery(mockOrderRepo, mockHistoryRepo, mockReceiptRepo, mockEventBus);
    const result = await useCase.execute('order-1', 'user-1');

    expect(mockReceiptRepo.findByOrderId).toHaveBeenCalledWith('order-1');
    expect(mockOrderRepo.updateReceiptSent).toHaveBeenCalledWith('order-1', 'PENDIENTE', expect.any(Date), 1);
    expect(mockHistoryRepo.create).toHaveBeenCalledWith({
      pedidoId: 'order-1',
      usuarioId: 'user-1',
      accion: 'REENVIO_RECIBO',
      estadoAnterior: 'Recibo generado',
      estadoNuevo: 'Recibo generado',
      informacion: { receiptId: 'receipt-1', intentosEnvio: 1 },
    });
    expect(mockEventBus.publish).toHaveBeenCalledWith({
      type: 'order.receipt.retry',
      occurredAt: expect.any(Date),
      payload: {
        orderId: 'order-1',
        orderNumero: 'PED-000001',
        clienteId: 'client-1',
        clienteNombre: 'Juan Pérez',
        receiptId: 'receipt-1',
      },
      requestId: undefined,
    });
  });

  it('should throw if order is not in Recibo generado state', async () => {
    const { mockOrderRepo, mockHistoryRepo, mockReceiptRepo, mockEventBus } = createMocks();
    const orderAceptado = createMockOrder('Aceptado');
    mockOrderRepo.getById.mockResolvedValue(orderAceptado);

    const useCase = new RetryReceiptDelivery(mockOrderRepo, mockHistoryRepo, mockReceiptRepo, mockEventBus);

    await expect(useCase.execute('order-1', 'user-1')).rejects.toThrow('RECIBO_GENERADO');
  });

  it('should throw if receipt is not found', async () => {
    const { mockOrderRepo, mockHistoryRepo, mockReceiptRepo, mockEventBus } = createMocks();
    const orderReciboGenerado = createMockOrder('Recibo generado');
    mockOrderRepo.getById.mockResolvedValue(orderReciboGenerado);
    mockReceiptRepo.findByOrderId.mockResolvedValue(null);

    const useCase = new RetryReceiptDelivery(mockOrderRepo, mockHistoryRepo, mockReceiptRepo, mockEventBus);

    await expect(useCase.execute('order-1', 'user-1')).rejects.toThrow('No se encontró el recibo');
  });
});
