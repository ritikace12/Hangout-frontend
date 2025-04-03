import { io } from "socket.io-client";

let socket;

export const connectSocket = (user) => {
  if (!user) return;
  
  socket = io("http://localhost:5001", {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  
  return socket;
};

export const getSocket = () => {
  return socket;
}; 