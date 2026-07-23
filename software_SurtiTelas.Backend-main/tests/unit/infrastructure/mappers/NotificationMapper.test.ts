import { describe, it, expect } from 'vitest';
import { toNotificationData } from '@/modules/notifications/infrastructure/mappers/NotificationMapper';

const row = {
  id: 'notif-1',
  tipo: 'INFO',
  titulo: 'Bienvenido',
  mensaje: 'Gracias por registrarte',
  leida: false,
  usuarioId: 'user-1',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('NotificationMapper.toNotificationData', () => {
  it('maps a DB row into NotificationData', () => {
    const data = toNotificationData(row);
    expect(data).toMatchObject({
      id: 'notif-1',
      tipo: 'INFO',
      titulo: 'Bienvenido',
      mensaje: 'Gracias por registrarte',
      leida: false,
      usuarioId: 'user-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
  });

  it('returns undefined usuarioId when null', () => {
    const data = toNotificationData({ ...row, usuarioId: null });
    expect(data.usuarioId).toBeUndefined();
  });
});
