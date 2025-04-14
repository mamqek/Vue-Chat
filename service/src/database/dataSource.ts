import 'reflect-metadata';

import { DataSource, DataSourceOptions, SimpleConsoleLogger } from 'typeorm';
import { Chat } from '../entities/Chat';
import { ChatMessage } from '../entities/ChatMessage';
import { ChatMessageStatus } from '../entities/ChatMessageStatus';

import path from 'path';
import { getConfig } from '../config/config.server';
import readline from 'readline';

export let AppDataSource: DataSource;

export async function initDatasource(): Promise<DataSource> {
    const config = getConfig();

    const database = config.DB_TYPE === 'sqlite' ? config.DB_PATH : config.DB_NAME;

    const dataSourceOptions: DataSourceOptions = 
    {
        type: config.DB_TYPE,
        database: database,
        entities: [
            Chat, 
            ChatMessage, 
            ChatMessageStatus, 
            config.user_entity
        ],
        ...(config.DB_URL ? { url: config.DB_URL } : {}),
        dropSchema: false,

        migrationsTableName: 'chat_migrations', 
        migrations: [path.resolve(global.__dirname, `../dist/migrations/*.cjs`)],

        // use SimpleConsoleLogger for logging, as even with logging: false, normal one shows logs
        logger: new SimpleConsoleLogger(config.logging as any),
        host: config.DB_HOST,
        port: config.DB_PORT,
        username: config.DB_USER,
        password: config.DB_PASS,
        
    };

    AppDataSource = new DataSource(dataSourceOptions);
    await AppDataSource.initialize();
    console.warn('Data Source has been initialized!', path.resolve(process.cwd(), database));

    // Create the 'users' table if it doesn't exist
    await createUsersTable();

    return AppDataSource;
}

async function createUsersTable() {
    
    const tableExists = await AppDataSource.query(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
    );

    if (tableExists.length === 0) {
        console.log("The 'users' table does not exist. Creating it...");
        await AppDataSource.query(`
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                random_id TEXT NOT NULL,
                description TEXT
            )
        `);
        await AppDataSource.query(`
            INSERT INTO users (username, random_id, description)
            VALUES ('JohnDoe', 'id', 'This is a sample user description.')
        `);
        console.log("The 'users' table has been created.");
    } else {
        console.log("The 'users' table already exists.");
    }
}

// Helper function to prompt the user
export function promptUser(question: string): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stderr,
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });
}