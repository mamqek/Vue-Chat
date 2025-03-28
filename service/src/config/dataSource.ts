import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Chat } from '../entities/Chat';
import { ChatMessage } from '../entities/ChatMessage';
import { ChatMessageStatus } from '../entities/ChatMessageStatus';

import path from 'path';
import { getConfig, isDefault } from './config.server';

import readline from 'readline';

export let AppDataSource: DataSource;

export async function initDatasource() {
    const config = getConfig();
    // Determine the database type from an environment variable,
    // defaulting to 'sqlite' for testing purposes.
    const database = config.DB_TYPE === 'sqlite' 
    ? getConfig().production 
        ? path.resolve(__dirname, config.DB_PATH)
        : path.resolve(__dirname,'../../chatdb.sqlite') 
    : config.DB_NAME;

    // Configure connection options.
    // If using SQLite, the database file will be placed in the service directory.
    const dataSourceOptions = config.DB_TYPE === 'sqlite'
        ? {
            type: 'sqlite',
            database: database,
            entities: [
                Chat, 
                ChatMessage, 
                ChatMessageStatus, 
                config.User.user_entity
            ],
            synchronize: config.synchronize,
            logging: config.logging,
        }
        : {
            type: config.DB_TYPE as 'sqlite' | 'mysql' | 'postgres',
            database: database,
            host: config.DB_HOST,
            port: config.DB_PORT,
            username: config.DB_USER,
            password: config.DB_PASS,
            entities: [
                Chat, 
                ChatMessage, 
                ChatMessageStatus, 
                config.User.user_entity
            ],
            synchronize: config.synchronize,
            logging: config.logging,
        } as DataSourceOptions;


    AppDataSource = new DataSource(dataSourceOptions);

    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    // Create the 'users' table if it doesn't exist
    await createUsersTable();

    // Check for missing tables
    const requiredTables = ['chats', 'chat_messages', 'chat_message_statuses', 'users'];
    const existingTables = await AppDataSource.query(
        "SELECT name FROM sqlite_master WHERE type='table'"
    );
    const existingTableNames = existingTables.map((table: { name: string }) => table.name);

    let userSync = false;
    if (existingTableNames.includes('users') && !isDefault("User")) {
        console.log('User entity mapping detected');
    } else if (existingTableNames.includes('users') && isDefault("User")) {
        console.log('Users table exists, but no User entity mapping detected. Checking for missing columns in the users table...');
        userSync = await checkUserTableColumns();
    } else {
        console.log('No User entity mapping or table detected');
    }

    const missingTables = requiredTables.filter(table => !existingTableNames.includes(table));
    if (missingTables.length > 0) {
        console.error(`Missing required tables: ${missingTables.join(', ')}`);

        // Prompt the user to enable synchronization
        const userWantsSync = await promptUser(
            `The following tables are missing: ${missingTables.join(', ')}. Do you want to enable synchronization to create them? (y/n): `
        );

        if (userWantsSync) {
            console.log('Enabling synchronization...');
            await AppDataSource.synchronize();
            console.log('Missing tables have been created.');
        } else {
            throw new Error('Missing required tables. Synchronization was not enabled. Exiting...');
        }
    } else {
        console.log('All required tables are present.');
    }

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
                description TEXT
            )
        `);
        console.log("The 'users' table has been created.");
    } else {
        console.log("The 'users' table already exists.");
    }
}

// Helper function to prompt the user
function promptUser(question: string): Promise<boolean> {
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

// Function to check for missing columns in the users table
async function checkUserTableColumns() {
    const requiredColumns = ['full_name', 'avatar', 'bio'];
    const existingColumns = await AppDataSource.query(
        "PRAGMA table_info('users')" // SQLite-specific query to get table schema
    );
    const existingColumnNames = existingColumns.map((column: { name: string }) => column.name);

    const missingColumns = requiredColumns.filter(column => !existingColumnNames.includes(column));
    if (missingColumns.length > 0) {
        console.error(`The 'users' table is missing the following columns: ${missingColumns.join(', ')}`);
        console.error('These columns will be added to the users table to match the User entity mapping. If you want to provide a custom User entity, please do so now.');

        const userWantsToAddColumns = await promptUser(
            `Do you want to add these columns? Choose 'n' if you want to provide custom mapping (y/n): `
        );

        if (userWantsToAddColumns) {
            return true;
        } else {
            console.error(
                'Canceled to provide custom User entity. Exiting...'
            );
            throw new Error('Canceled to provide custom User entity. Exiting...');
        }
    } else {
        console.log('The "users" table contains all required columns.');
        return false;
    }
}