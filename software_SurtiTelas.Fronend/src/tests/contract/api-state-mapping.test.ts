import { describe, it, expect } from 'vitest';
import { toPedido } from '@/infrastructure/api/ordersApi';
import { toProductionOrder } from '@/infrastructure/api/productionApi';
import { ORDER_STATUS_FRONTEND_MAP, ESTADOS_PRODUCCION, PRODUCTION_STATUS_BACKEND_MAP } from '@/shared/constants/options';

describe('ordersApi contract: backend -> frontend estado mapping', () => {
  it('mapea estados de backend OrderStatus a estados de frontend Pedido', () => {
    const backendStates = [
      'PENDIENTE',
      'ACEPTADO',
      'EN_PROCESO',
      'ENVIADO',
      'ENTREGADO',
      'RECHAZADO',
      'NUEVO',
      'EN_PRODUCCION',
      'LISTO',
      'DESPACHADO',
      'EN_CAMINO',
      'CANCELADO',
      'EN_VALIDACION',
      'RECIBO_GENERADO',
      'RECIBO_ENVIADO',
    ] as const;

    for (const estadoBackend of backendStates) {
      const dto = {
        id: '1',
        numero: 'PED-000001',
        cliente: 'Cliente',
        asesor: 'Asesor',
        fecha: new Date().toISOString(),
        items: 1,
        total: 1000,
        estado: estadoBackend,
        clienteId: 'c1',
        asesorId: 'a1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const pedido = toPedido(dto);
      const esperado = ORDER_STATUS_FRONTEND_MAP[estadoBackend] ?? estadoBackend;
      expect(pedido.estado).toBe(esperado);
    }
  });

  it('no pierde estados mapeados al actualizar', () => {
    expect(ORDER_STATUS_FRONTEND_MAP['NUEVO']).toBe('Pendiente');
    expect(ORDER_STATUS_FRONTEND_MAP['EN_PRODUCCION']).toBe('Listo');
    expect(ORDER_STATUS_FRONTEND_MAP['LISTO']).toBe('Listo');
    expect(ORDER_STATUS_FRONTEND_MAP['DESPACHADO']).toBe('Enviado');
    expect(ORDER_STATUS_FRONTEND_MAP['EN_CAMINO']).toBe('Enviado');
    expect(ORDER_STATUS_FRONTEND_MAP['CANCELADO']).toBe('Cancelado');
    expect(ORDER_STATUS_FRONTEND_MAP['EN_VALIDACION']).toBe('En validación');
    expect(ORDER_STATUS_FRONTEND_MAP['RECIBO_GENERADO']).toBe('Recibo generado');
    expect(ORDER_STATUS_FRONTEND_MAP['RECIBO_ENVIADO']).toBe('Recibo enviado');
  });
});

describe('productionApi contract: backend <-> frontend estado mapping', () => {
  it('mapea estados de backend a frontend', () => {
    const dto = {
      id: '1',
      pedidoId: undefined,
      operarioId: undefined,
      tallerId: undefined,
      referencia: 'REF-001',
      cantidad: 10,
      fechaInicio: '2025-01-01',
      fechaEstimada: '2025-01-15',
      avance: 0,
      estado: 'ASIGNADA' as const,
      colores: [],
      notasTecnicas: undefined,
      pedidoNumero: undefined,
      pedidoCliente: undefined,
      pedidoPrioridad: undefined,
      pedidoItemNombre: undefined,
      pedidoTotal: undefined,
    };

    const order = toProductionOrder(dto);
    expect(order.estado).toBe('Asignada');
  });

  it('todos los estados de producción tienen mapeo inverso', () => {
    for (const estadoFrontend of ESTADOS_PRODUCCION) {
      const backend = PRODUCTION_STATUS_BACKEND_MAP[estadoFrontend];
      expect(backend).toBeTruthy();
      expect(typeof backend).toBe('string');
    }
  });
});

describe('shared order status constants', () => {
  it('ORDER_STATUS_BACKEND_MAP cubre todos los estados frontend válidos', () => {
    for (const estado of ESTADOS_PRODUCCION) {
      expect(PRODUCTION_STATUS_BACKEND_MAP[estado]).toBeDefined();
    }
  });
});
