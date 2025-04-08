import { io } from 'socket.io-client';
import { getCommonConfig } from '../config/config.common.js';

// let socket = createSocketInstance();
let socket = null;

function createSocketInstance() {
    const config = getCommonConfig();
    return io(config.SERVICE_URL, {
        transports: ['websocket'],
    });
}

export function updateSocketInstance() {
    if (socket && socket.connected) {
        // I dont remove listeners to avoid losing the connection
        // socket.removeAllListeners();
        socket.disconnect();
    }
    socket = createSocketInstance();
}

export { socket };