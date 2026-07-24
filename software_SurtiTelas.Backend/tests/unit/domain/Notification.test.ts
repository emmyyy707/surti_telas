import { describe, it, expect } from 'vitest';
import { Notification } from '@/modules/notifications/domain/entities/Notification';

describe('Notification', () => {
  it('should create a valid notification', () => {
    const notification = new Notification({
      tipo: 'SUCCESS',
      titulo: 'Pedido creado',
      mensaje: 'Se creó el pedido PED-000001',
      leida: false,
    });

    expect(notification.titulo).toBe('Pedido creado');
    expect(notification.leida).toBe(false);
    expect(notification.tipo).toBe('SUCCESS');
  });

  it('should throw error if titulo is empty', () => {
    expect(() => {
      new Notification({
        tipo: 'INFO',
        titulo: '',
        mensaje: 'Test',
        leida: false,
      });
    }).toThrow('La notificación debe tener un título');
  });

  it('should throw error if mensaje is empty', () => {
    expect(() => {
      new Notification({
        tipo: 'INFO',
        titulo: 'Test',
        mensaje: '',
        leida: false,
      });
    }).toThrow('La notificación debe tener un mensaje');
  });

  it('should mark notification as read', () => {
    const notification = new Notification({
      tipo: 'INFO',
      titulo: 'Test',
      mensaje: 'Test',
      leida: false,
    });

    const read = notification.markAsRead();
    expect(read.leida).toBe(true);
  });

  it('should not change leida if already read', () => {
    const notification = new Notification({
      tipo: 'INFO',
      titulo: 'Test',
      mensaje: 'Test',
      leida: true,
    });

    const read = notification.markAsRead();
    expect(read.leida).toBe(true);
  });
});
