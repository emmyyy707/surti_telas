import { eventBus } from '../../../../shared/infrastructure/eventBus';
import { auditUseCases } from '../../infrastructure/container/auditContainer';
import { productionUseCases } from '../../../production/infrastructure/container/productionContainer';
import type { DomainEvent } from '../../../../shared/application/EventBus';

async function tryCreateAudit(input: Parameters<typeof auditUseCases.createAuditLog.execute>[0]): Promise<void> {
  try {
    await auditUseCases.createAuditLog.execute(input);
  } catch {
    // noop
  }
}

const ETAPA_ORDER = ['CORTE', 'CONFECCION', 'ACABADO', 'CONTROL_CALIDAD', 'EMPAQUE'] as const;

async function createNextStageIfNeeded(produccionId: string, etapaActual: string, creadoPorId: string): Promise<void> {
  try {
    const currentIndex = ETAPA_ORDER.indexOf(etapaActual as typeof ETAPA_ORDER[number]);
    console.log('[AUTO_CONTROL] produccionId:', produccionId, 'etapaActual:', etapaActual, 'currentIndex:', currentIndex);
    if (currentIndex < 0 || currentIndex >= ETAPA_ORDER.length - 1) {
      console.log('[AUTO_CONTROL] No hay siguiente etapa');
      return;
    }

    const nextEtapa = ETAPA_ORDER[currentIndex + 1];
    const existentes = await productionUseCases.listControlPrendas.execute({
      produccionId,
      etapa: nextEtapa,
    });
    console.log('[AUTO_CONTROL] Siguiente etapa:', nextEtapa, 'existentes:', existentes.data.length);
    if (existentes.data.length > 0) {
      console.log('[AUTO_CONTROL] Ya existe control para la siguiente etapa');
      return;
    }

    const nuevo = await productionUseCases.createControlPrenda.execute({
      produccionId,
      etapa: nextEtapa,
      cantidadTotal: 0,
      creadoPorId,
    });
    console.log('[AUTO_CONTROL] Creado control automáticamente:', nuevo.id, nextEtapa);
  } catch (err) {
    console.error('[AUTO_CONTROL] Error:', err);
  }
}

export function registerAuditEventHandlers(): void {
  eventBus.subscribe('auth.login', async (event: DomainEvent) => {
    await tryCreateAudit({
      accion: 'Login exitoso',
      modulo: 'auth',
      usuarioId: (event.payload as { userId?: string }).userId,
      ip: (event.payload as { ip?: string }).ip,
      userAgent: (event.payload as { userAgent?: string }).userAgent,
    });
  });

  eventBus.subscribe('auth.login.failed', async (event: DomainEvent) => {
    await tryCreateAudit({
      accion: 'Intento de login fallido',
      modulo: 'auth',
      ip: (event.payload as { ip?: string }).ip,
      userAgent: (event.payload as { userAgent?: string }).userAgent,
    });
  });

  eventBus.subscribe('auth.logout', async (event: DomainEvent) => {
    await tryCreateAudit({
      accion: 'Logout',
      modulo: 'auth',
      usuarioId: (event.payload as { userId?: string }).userId,
    });
  });

  eventBus.subscribe('user.created', async (event: DomainEvent) => {
    await tryCreateAudit({
      accion: `Usuario creado: ${(event.payload as { nombre?: string }).nombre ?? (event.payload as { userId?: string }).userId}`,
      modulo: 'users',
      usuarioId: (event.payload as { userId?: string }).userId,
      metadata: { role: (event.payload as { role?: string }).role },
    });
  });

  eventBus.subscribe('user.updated', async (event: DomainEvent) => {
    await tryCreateAudit({
      accion: `Usuario actualizado: ${(event.payload as { nombre?: string }).nombre ?? (event.payload as { userId?: string }).userId}`,
      modulo: 'users',
      usuarioId: (event.payload as { userId?: string }).userId,
      metadata: (event.payload as { cambios?: Record<string, unknown> }).cambios,
    });
  });

  eventBus.subscribe('user.deleted', async (event: DomainEvent) => {
    await tryCreateAudit({
      accion: `Usuario eliminado: ${(event.payload as { nombre?: string }).nombre ?? (event.payload as { userId?: string }).userId}`,
      modulo: 'users',
      usuarioId: (event.payload as { userId?: string }).userId,
    });
  });

  eventBus.subscribe('order.created', async (event: DomainEvent) => {
    await tryCreateAudit({
      accion: `Pedido creado: ${(event.payload as { orderId?: string }).orderId}`,
      modulo: 'orders',
      usuarioId: (event.payload as { asesorId?: string }).asesorId,
      referenciaId: (event.payload as { orderId?: string }).orderId,
      metadata: {
        clienteId: (event.payload as { clienteId?: string }).clienteId,
        total: (event.payload as { total?: number }).total,
      },
    });
  });

  eventBus.subscribe('order.status.updated', async (event: DomainEvent) => {
    await tryCreateAudit({
      accion: `Estado de pedido actualizado: ${(event.payload as { previousStatus?: string }).previousStatus} → ${(event.payload as { newStatus?: string }).newStatus}`,
      modulo: 'orders',
      referenciaId: (event.payload as { orderId?: string }).orderId,
      metadata: {
        previousStatus: (event.payload as { previousStatus?: string }).previousStatus,
        newStatus: (event.payload as { newStatus?: string }).newStatus,
      },
    });
  });

  eventBus.subscribe('product.created', async (event: DomainEvent) => {
    await tryCreateAudit({
      accion: `Producto creado: ${(event.payload as { nombre?: string }).nombre ?? (event.payload as { productId?: string }).productId}`,
      modulo: 'products',
      referenciaId: (event.payload as { productId?: string }).productId,
    });
  });

  eventBus.subscribe('product.updated', async (event: DomainEvent) => {
    await tryCreateAudit({
      accion: `Producto actualizado: ${(event.payload as { nombre?: string }).nombre ?? (event.payload as { productId?: string }).productId}`,
      modulo: 'products',
      referenciaId: (event.payload as { productId?: string }).productId,
      metadata: (event.payload as { cambios?: Record<string, unknown> }).cambios,
    });
  });

  eventBus.subscribe('product.deleted', async (event: DomainEvent) => {
    await tryCreateAudit({
      accion: `Producto eliminado: ${(event.payload as { nombre?: string }).nombre ?? (event.payload as { productId?: string }).productId}`,
      modulo: 'products',
      referenciaId: (event.payload as { productId?: string }).productId,
    });
  });

  eventBus.subscribe('control.created', async (event: DomainEvent) => {
    await tryCreateAudit({
      accion: `Control de prenda creado: ${(event.payload as { controlId?: string }).controlId}`,
      modulo: 'production',
      referenciaId: (event.payload as { controlId?: string }).controlId,
      metadata: {
        produccionId: (event.payload as { produccionId?: string }).produccionId,
        etapa: (event.payload as { etapa?: string }).etapa,
        estado: (event.payload as { estado?: string }).estado,
      },
    });
  });

  eventBus.subscribe('control.updated', async (event: DomainEvent) => {
    const estado = (event.payload as { estado?: string }).estado;
    const produccionId = (event.payload as { produccionId?: string }).produccionId;
    await tryCreateAudit({
      accion: `Control de prenda actualizado: ${estado ?? 'desconocido'}`,
      modulo: 'production',
      referenciaId: (event.payload as { controlId?: string }).controlId,
      metadata: {
        produccionId,
        estado,
      },
    });

    if (estado === 'APROBADO' && produccionId) {
      const etapa = (event.payload as { etapa?: string }).etapa;
      const creadoPorId = (event.payload as { creadoPorId?: string }).creadoPorId;
      if (etapa && creadoPorId) {
        await createNextStageIfNeeded(produccionId, etapa, creadoPorId);
      }
    }
  });
}
