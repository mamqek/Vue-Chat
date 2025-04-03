import { UserConfig } from '../types/UserConfig';
import { setCommonConfig } from '../../../config/config.common';
import { DefaultUser } from '../entities/DefaultUser';
import { generateCustomUserClass } from './user.config';


export type SessionLookupFn = (sessionId: string) => Promise<any>;


export interface MyEnvConfig {
    production?: boolean;                  // Set to true in production environments

    /**
     * PORT: The port your service listens on (e.g., 4000).
     */
    PORT?: number;
    /**
     * HOST: The network interface to bind to.
     * "127.0.0.1" restricts access to local requests,
     * while "0.0.0.0" accepts external connections.
     */
    HOST: string;
    /**
     * SERVICE_URL: The external URL for your service (e.g., "https://website.com").
     * Used for generating absolute links and configuring CORS.
     */
    SERVICE_URL: string;     
    
    CORS_ORIGIN?: Array<string>;                   // The URL to allow CORS requests from
    
    UPLOAD_DIR?: string;
    user_filter?: string | Record<string, any>; // f.e '{"active": true, "role": "admin"}' as sting or { active: true, role: 'admin' } as object
    
    // Database configuration
    DB_PATH: string;                       // Path to SQLite database file
    DB_TYPE: 'sqlite' | 'mysql' | 'postgres';
    DB_NAME: string;                       // Database name or file name (for SQLite)
    DB_HOST?: string;                      // For non-SQLite DBs
    DB_PORT?: number;                      // For non-SQLite DBs
    DB_USER?: string;                      // For non-SQLite DBs
    DB_PASS?: string;                      // For non-SQLite DBs
    synchronize?: boolean;                 // Automatically create database schema
    logging?: boolean | string[];          // Enable TypeORM logging

    TOKEN_NAME: string;
    TOKEN_SECRET: string;
    JWT_ALGORITHM?: string;
    sessionLookup: SessionLookupFn;

    User: UserConfig;
}

// Define default values.
const defaultConfig: MyEnvConfig = {
    production: __dirname.includes('dist'), // Set to true in production environments, based on the directory name

    PORT: 4000,
    SERVICE_URL: "http://localhost:4000",
    UPLOAD_DIR: "uploads",

    CORS_ORIGIN: ['http://localhost:5174', 'http://localhost:5173'],

    user_filter: {},

    DB_PATH: '../service/chatdb.sqlite',
    DB_TYPE: "sqlite",
    DB_NAME: "chatdb",
    DB_HOST: "",          // Not used for SQLite; override for Postgres/MySQL
    DB_PORT: undefined,   // Not used for SQLite; override for Postgres/MySQL
    DB_USER: "",          // Not used for SQLite; override for Postgres/MySQL
    DB_PASS: "",          // Not used for SQLite; override for Postgres/MySQL
    synchronize: false,
    logging: false,

    HOST: "0.0.0.0",
    TOKEN_NAME: "chat_token",
    TOKEN_SECRET: "chat-secret",
    JWT_ALGORITHM: "HS256",
    sessionLookup: async (sessionId: string) => {
        throw new Error("sessionLookup function not implemented");
    },

    User: {
        user_entity: DefaultUser, 
        field_mapping: {
            full_name: {
                name: "full_name",
                default: "'User'",
            },
            avatar: {
                name: "avatar",
                default: "'https://example.com/default-avatar.png'",
            },
            bio: {
                name: "bio",
                isNullable: true,
            },
        },
    }
};

let currentConfig: MyEnvConfig = { ...defaultConfig };

export function setConfig(newConfig: Partial<MyEnvConfig>) {
    console.log("set config")
    setCommonConfig(newConfig);
    // Merge the new config into the defaults.
    currentConfig = { ...defaultConfig, ...newConfig };
    //   validateConfig(currentConfig);

    // Check if a field mapping is provided
    if (newConfig.User?.field_mapping) {
        console.log("Generating CustomUser entity based on field mapping...");
        const fieldMapping = newConfig.User.field_mapping;

        // Dynamically generate the CustomUser entity
        const CustomUser = generateCustomUserClass(fieldMapping);

        // Update the User entity in the configuration
        currentConfig.User.user_entity = CustomUser;
    } else {
        // Use DefaultUser if no custom mapping is provided
        currentConfig.User.user_entity = DefaultUser;
    }
}

export function setConfigVariable(key: string, value: any) {

    currentConfig = { ...currentConfig, [key]: value };
    //   validateConfig(currentConfig);
}

export function getConfig(): MyEnvConfig {
  return currentConfig;
}

export function getDefaultConfig(): MyEnvConfig {
  return defaultConfig;
}

export function getConfigVariable<K extends keyof MyEnvConfig>(variable: K): MyEnvConfig[K] {
  return currentConfig[variable];
}

export function getParsedConfigVariable<K extends keyof MyEnvConfig>(variable: K): Record<string, any> {
  const value = currentConfig[variable];
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error(`Error parsing config variable "${variable}":`, error);
      return {};
    }
  }
  return (value as Record<string, any>) || {};
}

export function isDefault<K extends keyof MyEnvConfig>(variable: K): boolean {
    return currentConfig[variable] === defaultConfig[variable];
}

// // Validate required or mutually-exclusive configuration.
// function validateConfig(config: MyEnvConfig): void {
//   // Example: For properties propX and propY, require exactly one to be provided.
//   const hasPropX = !!config.propX;
//   const hasPropY = !!config.propY;
//   if ((hasPropX && hasPropY) || (!hasPropX && !hasPropY)) {
//     throw new Error(
//       'Configuration error: exactly one of "propX" or "propY" must be provided.'
//     );
//   }
// }
