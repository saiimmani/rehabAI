import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (user && token) {
      const SOCKET_URL =
        process.env.REACT_APP_SOCKET_URL ||
        process.env.REACT_APP_API_URL?.replace('/api', '') ||
        'http://localhost:5000';

      const newSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
      });

      newSocket.on('connect_error', (err) => {
        // Log but don't crash — real-time features are non-critical
        console.warn('⚠️ Socket connection error:', err.message);
      });

      newSocket.on('user_online', ({ onlineUsers: users }) => {
        setOnlineUsers(users || []);
      });

      newSocket.on('user_offline', ({ onlineUsers: users }) => {
        setOnlineUsers(users || []);
      });

      newSocket.on('user_typing', ({ userId }) => {
        setTypingUsers((prev) => {
          if (!prev.includes(userId)) return [...prev, userId];
          return prev;
        });
      });

      newSocket.on('user_stop_typing', ({ userId }) => {
        setTypingUsers((prev) => prev.filter((id) => id !== userId));
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        socketRef.current = null;
        setSocket(null);
      };
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  const sendMessage = useCallback((receiverId, message) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', { receiverId, message });
    }
  }, []);

  const emitTyping = useCallback((receiverId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', { receiverId });
    }
  }, []);

  const emitStopTyping = useCallback((receiverId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('stop_typing', { receiverId });
    }
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        typingUsers,
        sendMessage,
        emitTyping,
        emitStopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
