import { io } from 'socket.io-client';
import { ensureSocketInitialized, updateSocketInstance, socket, resetSocket } from '@/socketClient.js';

jest.mock('socket.io-client', () => ({
    io: jest.fn(() => ({
        disconnect: jest.fn(),
        connected: false,
    })),
}));

describe('socketClient', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetSocket();
    });

    test('ensureSocketInitialized creates a new socket instance if none exists', () => {
        expect(socket).toBeNull(); // Initially, socket should be null
        const instance = ensureSocketInitialized();
        expect(io).toHaveBeenCalledTimes(1); // Ensure `io` was called to create a socket
        expect(instance).toBeDefined();
        expect(instance).toEqual(socket); // The returned instance should match the exported `socket`
    });

    test('ensureSocketInitialized does not create a new instance if one already exists', () => {
        const firstInstance = ensureSocketInitialized();
        const secondInstance = ensureSocketInitialized();
        expect(io).toHaveBeenCalledTimes(1); // `io` should only be called once
        expect(firstInstance).toBe(secondInstance); // Both calls should return the same instance
    });

    test('updateSocketInstance disconnects the existing socket if connected', () => {
        const mockSocket = ensureSocketInitialized();
        mockSocket.connected = true; // Simulate an active connection
        updateSocketInstance();
        expect(mockSocket.disconnect).toHaveBeenCalledTimes(1); // Ensure `disconnect` was called
        expect(io).toHaveBeenCalledTimes(2); // A new socket instance should be created
    });

    test('updateSocketInstance creates a new socket instance even if no socket exists', () => {
        updateSocketInstance(); // Call without initializing the socket
        expect(io).toHaveBeenCalledTimes(1); // Ensure `io` was called to create a socket
        expect(socket).toBeDefined();
    });

    test('socket export reflects the current socket instance', () => {
        const instance = ensureSocketInitialized();
        expect(socket).toBe(instance); // The exported `socket` should match the initialized instance
    });
});