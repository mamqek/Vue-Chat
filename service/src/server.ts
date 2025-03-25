import { setConfig, MyEnvConfig, getConfigVariable } from './config/config.server';

import express from 'express';
import http from 'http';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors'; 
import { authMiddleware } from './auth/authMiddleware';

import { Server } from 'socket.io';
import { setupSocket } from './socket'; 
import router from './router'; 

import { AppDataSource } from './config/dataSource';
import { DataSource } from 'typeorm';
import 'reflect-metadata';



let server: http.Server | null = null;
let dataSource: DataSource | null = null;

export async function startService(userConfig?: Partial<MyEnvConfig>) {
    // 1. Merge new config
    if (userConfig) {
        setConfig(userConfig);
    }

    // 2. Stop any existing service (if you want a “hot restart” pattern)
    if (server) {
        await stopService();
    }

    // 1. Initialize the TypeORM Data Source
    AppDataSource.initialize()
    .then(async () => {
        console.log('Data Source has been initialized!');

        // 3. Set Up Express
        const app = express();

        // 3a. Middleware Setup
        // express.json() parses incoming JSON payloads and makes them available in req.body.
        app.use(express.json());
        // express.urlencoded() parses URL-encoded payloads.
        app.use(express.urlencoded({ extended: true }));
        // CORS middleware. Adjust the origin as needed.
        const corsOptions = {
            origin: getConfigVariable('CORS_ORIGIN'),
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
        server = http.createServer(app);

        // 6. Attach Socket.IO to the server to enable real-time communication and set Up Socket.IO Event Handling
        const io = new Server(server, {cors: corsOptions});
        setupSocket(io);

        // 7. Start the Server
        const PORT = getConfigVariable('PORT');
        const HOST = getConfigVariable('HOST');
        server.listen(PORT, HOST, () => {
            console.log(`Service running on port ${PORT}`);
        });
    })
    .catch((error) => {
        // 8. Error Handling
        // If there is an error during the data source initialization, it gets logged here.
        console.error('Error during Data Source initialization:', error);
    });
}

export async function stopService() {
    console.log('Stopping the service...');
    if (server) {
        await new Promise<void>((resolve, reject) => {
            server!.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        server = null;
    }
    if (dataSource) {
        await dataSource.destroy();
        dataSource = null;
    }
}
