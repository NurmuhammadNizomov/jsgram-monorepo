"use client";

import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const s = connectSocket(token);
    socketRef.current = s;

    return () => {
      // Don't disconnect on component unmount — disconnect only on logout
      // disconnectSocket();
    };
  }, []);

  return socketRef;
}

export function useSocketEvent<T = unknown>(
  event: string,
  handler: (data: T) => void,
  deps: React.DependencyList = [],
) {
  useEffect(() => {
    const s = getSocket();
    s.on(event, handler);
    return () => { s.off(event, handler); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
