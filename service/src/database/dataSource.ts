import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Chat } from '../entities/Chat';
import { ChatMessage } from '../entities/ChatMessage';
import { ChatMessageStatus } from '../entities/ChatMessageStatus';

import path from 'path';
import { getConfig } from '../config/config.server';

import readline from 'readline';

export let AppDataSource: DataSource;

export async function initDatasource() {
    const config = getConfig();

    const database = config.DB_TYPE === 'sqlite' 
    ? getConfig().production 
        ? path.resolve(__dirname, config.DB_PATH)
        : path.resolve(__dirname,'../../chatdb.sqlite') 
    : config.DB_NAME;

    // Configure connection options.
    // If using SQLite, the database file will be placed in the service directory.
    const dataSourceOptions: DataSourceOptions = 
    {
        type: config.DB_TYPE as 'sqlite' | 'postgres' | 'mysql',
        database: database,
        entities: [
            Chat, 
            ChatMessage, 
            ChatMessageStatus, 
            config.User.user_entity
        ],
        synchronize: config.synchronize,
        dropSchema: false,
        migrations: [path.resolve(__dirname, '../dist/migrations/*.js')], 
        logging: config.logging,

        host: config.DB_HOST,
        port: config.DB_PORT,
        username: config.DB_USER,
        password: config.DB_PASS,
    };

    AppDataSource = new DataSource(dataSourceOptions);

    await AppDataSource.initialize();
    console.log('Data Source has been initialized!', database);

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
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });
}