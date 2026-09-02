import { describe, it, expect, vi } from 'vitest';
import { ListRutaDelDia } from '@/modules/deliveries/application/use-cases/DeliveryUseCases';
import { PrismaClient } from '@prisma/client';

const mockPrisma = {
  delivery: {
    findMany: vi.fn(),
  },
  order: {
    findMany: vi.fn(),
  },
} as unknown as PrismaClient;

describe('ListRutaDelDia', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return customer address in order.direccion when customer has address', async () => {
    (mockPrisma.delivery.findMany as any).mockResolvedValue([
      {
        id: 'del-1',
        orderId: 'order-1',
        estado: 'ASIGNADO',
        direccion: '',
        ciudad: '',
        telefono: '',
        notas: null,
        asignadoEn: new Date(),
        entregadoEn: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        domiciliarioId: null,
        domiciliario: null,
        order: {
          id: 'order-1',
          numero: 'PED-001',
          estado: 'DESPACHADO',
          tipoFlujo: 'PRODUCCION',
          fecha: new Date(),
          medioPago: null,
          total: { toNumber: () => 50000 },
          cliente: {
            nombre: 'Cliente Test',
            telefono: '3001234567',
            ciudad: 'Bogotá',
            direccion: 'Calle 123 #45-67',
          },
          asesor: { nombre: 'Asesor Test' },
          items: [],
          payments: [],
          receipts: [],
          custom_orders: null,
        },
      },
    ]);
    (mockPrisma.order.findMany as any).mockResolvedValue([]);

    const useCase = new ListRutaDelDia(mockPrisma as any);
    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0].order?.direccion).toBe('Calle 123 #45-67');
    expect(result[0].direccion).toBe('Calle 123 #45-67');
  });

  it('should fallback to delivery.direccion when customer has no address', async () => {
    (mockPrisma.delivery.findMany as any).mockResolvedValue([
      {
        id: 'del-1',
        orderId: 'order-1',
        estado: 'ASIGNADO',
        direccion: 'Delivery snapshot',
        ciudad: '',
        telefono: '',
        notas: null,
        asignadoEn: new Date(),
        entregadoEn: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        domiciliarioId: null,
        domiciliario: null,
        order: {
          id: 'order-1',
          numero: 'PED-001',
          estado: 'DESPACHADO',
          tipoFlujo: 'PRODUCCION',
          fecha: new Date(),
          medioPago: null,
          total: { toNumber: () => 50000 },
          cliente: {
            nombre: 'Cliente Test',
            telefono: '3001234567',
            ciudad: 'Bogotá',
            direccion: null,
          },
          asesor: { nombre: 'Asesor Test' },
          items: [],
          payments: [],
          receipts: [],
          custom_orders: null,
        },
      },
    ]);
    (mockPrisma.order.findMany as any).mockResolvedValue([]);

    const useCase = new ListRutaDelDia(mockPrisma as any);
    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0].order?.direccion).toBe('Delivery snapshot');
    expect(result[0].direccion).toBe('Delivery snapshot');
  });

  it('should return null for direccion when both customer and delivery have no address', async () => {
    (mockPrisma.delivery.findMany as any).mockResolvedValue([
      {
        id: 'del-1',
        orderId: 'order-1',
        estado: 'ASIGNADO',
        direccion: '',
        ciudad: '',
        telefono: '',
        notas: null,
        asignadoEn: new Date(),
        entregadoEn: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        domiciliarioId: null,
        domiciliario: null,
        order: {
          id: 'order-1',
          numero: 'PED-001',
          estado: 'DESPACHADO',
          tipoFlujo: 'PRODUCCION',
          fecha: new Date(),
          medioPago: null,
          total: { toNumber: () => 50000 },
          cliente: {
            nombre: 'Cliente Test',
            telefono: '3001234567',
            ciudad: 'Bogotá',
            direccion: null,
          },
          asesor: { nombre: 'Asesor Test' },
          items: [],
          payments: [],
          receipts: [],
          custom_orders: null,
        },
      },
    ]);
    (mockPrisma.order.findMany as any).mockResolvedValue([]);

    const useCase = new ListRutaDelDia(mockPrisma as any);
    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0].order?.direccion).toBeNull();
    expect(result[0].direccion).toBeNull();
  });
});
