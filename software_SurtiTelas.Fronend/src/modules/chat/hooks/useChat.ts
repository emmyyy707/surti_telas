import { useEffect, useRef, useState } from 'react';
import { getChatSocket, disconnectChatSocket } from '../services/chatSocket';
import type { ChatMessage, Conversation } from '../types/chat';

export function useChat(conversationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<ReturnType<typeof getChatSocket> | null>(null);

  useEffect(() => {
    const socket = getChatSocket();
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !conversationId) return;

    socket.emit('join_client', conversationId);

    const handleMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on('chat:message', handleMessage);

    return () => {
      socket.emit('leave_client', conversationId);
      socket.off('chat:message', handleMessage);
    };
  }, [conversationId]);

  const sendMessage = (content: string) => {
    const socket = socketRef.current;
    if (!socket || !conversationId || !content.trim()) return;
    socket.emit('chat:message', { conversationId, content: content.trim() });
  };

  return { messages, connected, sendMessage };
}

export function useDisconnectChat() {
  useEffect(() => {
    return () => {
      disconnectChatSocket();
    };
  }, []);
}
