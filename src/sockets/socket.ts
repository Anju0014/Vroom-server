import { Server } from 'socket.io';
import http from 'http';
import bookingSocket from './bookingSocket';
import chatSocket from './chatSocket';
import notificationSocket from './notificationSocket';

let io: Server;

export const initSockets = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  bookingSocket(io);
  chatSocket(io);
  notificationSocket(io)

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
