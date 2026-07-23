import { io, Socket } from 'socket.io-client';
import { tokenStorage } from '@/infrastructure/api/tokenStorage';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1')
  .replace(/\/$/, '')
  .replace(/\/api\/v1$/, '');

let socket: Socket | null = null;

export function getChatSocket() {
  if (!socket) {
    const token = tokenStorage.getAccessToken();
    socket = io(SOCKET_URL, {
      path: '/socket.io/',
      auth: { token },
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function disconnectChatSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
