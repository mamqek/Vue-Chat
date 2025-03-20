// src/socketClient.js
import { io } from 'socket.io-client';

// Replace with your Socket.IO server URL (or leave it empty for same-origin)
const socket = io('http://localhost:4000', {
  // Additional options can go here:
  transports: ['websocket'],
  // e.g., autoConnect: false, reconnection: true, etc.
});

export default socket;
