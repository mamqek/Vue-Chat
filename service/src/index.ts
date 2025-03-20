import 'reflect-metadata'; // Required by TypeORM
import express from 'express';
import http from 'http';
import path from 'path';

import { Server } from 'socket.io';

import { AppDataSource } from './config/dataSource';
import { initializeData } from './config/initializeData';
import router from './router';         // Importing our modularized routes
import { setupSocket } from './socket'; // Importing our Socket.IO event handler
import cookieParser from 'cookie-parser';


import { getConfigVariable } from './config/config';


import cors from 'cors'; // import cors middleware
import { authMiddleware } from './auth/authMiddleware';


// 1. Initialize the TypeORM Data Source
AppDataSource.initialize()
.then(async () => {
    console.log('Data Source has been initialized!');

    // 2. Initialize Data
    initializeData();

    // 3. Set Up Express
    const app = express();


    // 3a. Middleware Setup
    // express.json() parses incoming JSON payloads and makes them available in req.body.
    app.use(express.json());
    // express.urlencoded() parses URL-encoded payloads.
    app.use(express.urlencoded({ extended: true }));
    // CORS middleware. Adjust the origin as needed.
    const corsOptions = {
        origin: 'http://localhost:5173',
        credentials: true,              
    };
    app.use(cors(corsOptions));

    app.use(cookieParser());
    app.use(authMiddleware);
    // 3b. Serve static files from the /uploads directory
    app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
    // authMiddleware is a custom middleware function that checks for a valid JWT in the Authorization header.

    // 4. Mount the Routes Module
    app.use('/', router);

    // 5. Create an HTTP Server
    const server = http.createServer(app);

    // 6. Attach Socket.IO to the server to enable real-time communication and set Up Socket.IO Event Handling
    const io = new Server(server, {cors: corsOptions});
    setupSocket(io);

    // 7. Start the Server
    const PORT = getConfigVariable('PORT');
    server.listen(PORT, () => {
        console.log(`Service running on port ${PORT}`);
    });
})
.catch((error) => {
    // 8. Error Handling
    // If there is an error during the data source initialization, it gets logged here.
    console.error('Error during Data Source initialization:', error);
});
