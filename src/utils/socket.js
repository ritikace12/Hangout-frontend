import { io } from "socket.io-client";

let socket;

export const connectSocket = (user) => {
  if (!user) return;
  
  socket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    path: '/socket.io/',
    secure: true,
    rejectUnauthorized: false
  });
  
  return socket;
};

export const getSocket = () => {
  return socket;
}; 