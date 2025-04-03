import { io } from "socket.io-client";

let socket;

export const connectSocket = (user) => {
  if (!user) return;
  
  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
  }
  
  socket = io(import.meta.env.VITE_API_URL, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    path: '/socket.io/',
    secure: true,
    rejectUnauthorized: false,
    query: {
      userId: user._id,
      connectionId: Date.now().toString()
    }
  });
  
  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}; 