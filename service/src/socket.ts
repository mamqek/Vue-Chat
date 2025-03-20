// src/socket.ts
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer;

// A simple in-memory store for online users (using a Set to store user IDs)
const onlineUsers = new Set<number | string>();

export function setupSocket(socketInstance: SocketIOServer) {
  io = socketInstance;
  
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle joining a private channel.
    socket.on('joinPrivateChannel', (data) => {
      const { user_id } = data;
      // Join a room named "private-receiver-channel.{user_id}"
      socket.join("private-receiver-channel." + user_id);
      console.log(`Socket ${socket.id} joined private channel for user: ${user_id}`);
    });

    // Optional: Handle leaving a private channel.
    socket.on('leavePrivateChannel', (data) => {
      const { user_id } = data;
      socket.leave("private-receiver-channel." + user_id);
      console.log(`Socket ${socket.id} left private channel for user: ${user_id}`);
    });

    // Handle joining the online (presence) channel.
    socket.on('joinOnlineChannel', (data) => {
      const { user_id } = data;
      // Attach the user_id to the socket for later reference.
      socket.data.user_id = user_id;
      // Join a common online room.
      socket.join("online-channel");
      console.log(`Socket ${socket.id} joined online channel for user: ${user_id}`);
      
      // If this user isn't already tracked as online, add and broadcast.
      if (!onlineUsers.has(user_id)) {
        onlineUsers.add(user_id);
        io.to("online-channel").emit('userJoined', { id: user_id });
      }
      // Send the full list of online users to this socket.
      socket.emit('onlineUsers', Array.from(onlineUsers));
    });
    
    // Handle disconnect events.
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // If this socket was part of the online channel, update the online users list.
      const user_id = socket.data.user_id;
      if (user_id) {
        onlineUsers.delete(user_id);
        io.to("online-channel").emit('userLeft', { id: user_id });
      }
    });
  });
}

/**
 * Broadcasts an event to all connected clients.
 */
export function broadcastToAll(event: string, data: any) {
    if (!io) {
        console.error('Socket.IO instance is not initialized.');
        return;
    }
    io.emit(event, data);
}

/**
 * Broadcasts an event to specific client.
 */
export function broadcastToUser(event: string, data: any, user_id: number | string) {
    if (!io) {
        console.error('Socket.IO instance is not initialized.');
        return;
    }

    if (!user_id) {
        console.error('No user_id provided for broadcastToUser.');
        return;
    }
    
    if (typeof event !== 'string' || !event.trim()) {
        console.error('Invalid event name provided.');
        return;
    }

    io.to("private-receiver-channel." + user_id).emit(event, data);
}
