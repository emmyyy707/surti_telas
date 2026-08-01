import type { Server } from 'socket.io';
import { logger } from '../../../../shared/infrastructure/logger';

export class WebsocketService {
  private io: Server | null = null;

  initialize(io: Server): void {
    this.io = io;
    logger.info('[WebSocket] Service initialized');
  }

  emit(event: string, data: unknown): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  emitToUser(userId: string, event: string, data: unknown): void {
    if (this.io) {
      this.io.to(userId).emit(event, data);
    }
  }

  emitToRole(role: string, event: string, data: unknown): void {
    if (this.io) {
      this.io.to(role).emit(event, data);
    }
  }

  getActiveConnections(): number {
    return this.io ? this.io.engine.clientsCount : 0;
  }
}

export const websocketService = new WebsocketService();
