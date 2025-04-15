import { io } from 'socket.io-client';
import { getCommonConfig } from '../config/config.common.js';

let socket = null;

/**
 * Creates a new Socket.IO client instance using the current configuration.
 * Used internally to initialize or update the socket instance.
 * @returns {import('socket.io-client').Socket} A new Socket.IO client instance.
 */
function createSocketInstance() {
    const config = getCommonConfig();
    return io(config.SERVICE_URL, {
        transports: ['websocket'],
    });
}

/**
 * Ensures the socket instance is available for use.
 * Initializes the socket if it has not been created yet.
 * @returns {import('socket.io-client').Socket} The initialized socket instance.
 */
export function ensureSocketInitialized() {
    if (!socket) {
        socket = createSocketInstance();
    }
    return socket;
}

/**
 * Reinitializes the socket instance.
 * Disconnects the current socket (if connected) and creates a new one.
 */
export function updateSocketInstance() {
    if (socket && socket.connected) {
        socket.disconnect();
    }
    socket = createSocketInstance();
}

/**
 * Resets the socket instance to an uninitialized state.
 * Useful for testing or reinitializing the socket.
 */
export function resetSocket() {
    socket = null;
}

/**
 * Exports the current socket instance.
 * This is a live reference to the socket, which may be null if not initialized.
 */
export { socket };