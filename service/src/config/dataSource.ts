import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Chat } from '../entities/Chat';
import { ChatMessage } from '../entities/ChatMessage';
import { ChatMessageStatus } from '../entities/ChatMessageStatus';
import { User } from '../entities/User';
import path from 'path';
import { getConfig } from './config.server';

const config = getConfig();
// Determine the database type from an environment variable,
// defaulting to 'sqlite' for testing purposes.
const dbType = config.DB_TYPE;

// Configure connection options.
// If using SQLite, the database file will be placed in the service directory.
const dataSourceOptions = {
    type: dbType as any, // Cast as any to bypass type conflicts when using env variables.
    database: dbType === 'sqlite' ? path.resolve(__dirname,'../../chatdb.sqlite') : config.DB_NAME,
    host: config.DB_HOST,     
    port: config.DB_PORT,
    username: config.DB_USER,
    password: config.DB_PASS,
    entities: [Chat, ChatMessage, ChatMessageStatus, User],
    synchronize: config.synchronize,
    logging: false,
};

export const AppDataSource = new DataSource(dataSourceOptions);