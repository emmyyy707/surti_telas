import { NextFunction } from 'express';

export const websocketAuth = async (socket: any, next: NextFunction) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return next(new Error('Authentication required'));
    }
    socket.user = { id: 'user-from-token', role: 'USER' };
    next();
  } catch (error) {
    next(error);
  }
};
