import { setCommonConfig } from '../../../config/config.common';
import { DefaultUser } from '../entities/DefaultUser';
import { LoggerOptions } from 'typeorm';
import { generateCustomUserClass } from './user.config';
import { UserFieldMapping } from '../types/UserConfig';
import { BaseUser } from '../entities/BaseUser';


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
    
    UPLOAD_URL: string;
    UPLOAD_DIR: string;
    user_filter?: string | Record<string, any>; // f.e '{"active": true, "role": "admin"}' as sting or { active: true, role: 'admin' } as object
    
    // Database configuration
    DB_PATH: string;                       // Path to SQLite database file
    DB_URL?: string;                      // URL for non-SQLite databases
    DB_TYPE: 'sqlite' | 'mysql' | 'postgres';
    DB_NAME: string;                       // Database name or file name (for SQLite)
    DB_HOST?: string;                      // For non-SQLite DBs
    DB_PORT?: number;                      // For non-SQLite DBs
    DB_USER?: string;                      // For non-SQLite DBs
    DB_PASS?: string;                      // For non-SQLite DBs
    logging: false | LoggerOptions;          // Enable TypeORM logging

    user_table_name: string;               // Name of the user table in the database
    user_entity: new (...args: any[]) => BaseUser;
    user_mapping: UserFieldMapping;



    // Authentication configuration
    AUTH_MODE: 'direct' | 'auth-endpoint' | 'jwt' | 'custom' | 'proxy';

    // Auth Endpoint Authentication
    AUTH_ENDPOINT_URL: string;
    
    // JWT Authentication
    TOKEN_NAME: string;                     // Cookie/header name for tokens
    TOKEN_SECRET: string;                   // Secret for signing/verifying JWTs
    JWT_ALGORITHM: string;                  // JWT algorithm (default "HS256")
    JWT_USER_ID_FIELD: string;             // Field in JWT payload that contains user ID
    
    // Custom Authentication
    customAuthFunction?: (req: Request) => Promise<{id: string | number, [key: string]: any}>;
    
    // Proxy Authentication
    TRUSTED_PROXIES?: string[];             // List of trusted hostnames
    PROXY_SECRET?: string;                  // Shared secret for proxy authentication
    PROXY_USER_ID_SOURCE?: 'query' | 'body' | 'headers'; // Where to find user ID
    PROXY_USER_ID_FIELD: string;           // Field name for user ID
}

// Define default values.
const defaultConfig: MyEnvConfig = {
    production: global.__dirname.includes('dist'), // Set to true in production environments, based on the directory name

    PORT: 4000,
    SERVICE_URL: "http://localhost:4000",
    HOST: "0.0.0.0",
    
    UPLOAD_DIR: 'uploads',
    UPLOAD_URL: "uploads",

    CORS_ORIGIN: ['http://localhost:5174', 'http://localhost:5173'],

    user_filter: {},

    DB_PATH: '../src/database/chatdb.sqlite',
    DB_TYPE: "sqlite",
    DB_NAME: "chatdb",
    DB_HOST: "",          // Not used for SQLite; override for Postgres/MySQL
    DB_PORT: undefined,   // Not used for SQLite; override for Postgres/MySQL
    DB_USER: "",          // Not used for SQLite; override for Postgres/MySQL
    DB_PASS: "",          // Not used for SQLite; override for Postgres/MySQL
    logging: false,

    user_table_name: "users",
    user_entity: DefaultUser, 
    user_mapping: {
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



    AUTH_MODE: 'direct',

    // Auth Endpoint Authentication
    AUTH_ENDPOINT_URL: '',
    
    // JWT defaults
    TOKEN_NAME: "chat_token",
    TOKEN_SECRET: "chat-secret-change-me-in-production",
    JWT_ALGORITHM: "HS256",
    JWT_USER_ID_FIELD: "id",
    
    // Proxy defaults
    TRUSTED_PROXIES: [],
    PROXY_USER_ID_SOURCE: 'body',
    PROXY_USER_ID_FIELD: 'user_id',

};

let currentConfig: MyEnvConfig = { ...defaultConfig };

export function setConfig(newConfig: Partial<MyEnvConfig>) {
    validateConfig(newConfig);
    console.log("set config")
    setCommonConfig(newConfig);
    mergeConfig(newConfig);
}

export function setConfigVariable(key: string, value: any) {
    const newConfig: Partial<MyEnvConfig> = { [key]: value };
    mergeConfig(newConfig);
    validateConfig(currentConfig);
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

// Merge the new config into the defaults.
function mergeConfig(newConfig: Partial<MyEnvConfig>) {
    currentConfig = { ...currentConfig, ...newConfig };
    // Merge field mapping with default if provided
    if (!isDefault("user_mapping")) {
        mergeFieldMapping(currentConfig.user_mapping);
        console.log("Generating CustomUser entity based on field mapping...");
        // Dynamically generate the CustomUser entity
        const CustomUser = generateCustomUserClass(currentConfig.user_mapping, currentConfig.user_table_name);
        // Update the User entity in the configuration
        currentConfig.user_entity = CustomUser;
    } else {
        // Use DefaultUser if no custom mapping is provided
        currentConfig.user_entity = DefaultUser;
    }
}

function mergeFieldMapping(customMapping: UserFieldMapping): void {
    const defaultMapping = defaultConfig.user_mapping;
    const mergedMapping: Partial<UserFieldMapping> = {};

    // For each key in the default mapping, use the custom mapping if provided,
    // otherwise fallback to the default mapping.
    (Object.keys(defaultMapping) as (keyof UserFieldMapping)[]).forEach(key => {
        mergedMapping[key] = customMapping && customMapping[key] ? customMapping[key] : defaultMapping[key];
    });
    currentConfig.user_mapping = mergedMapping;
}

// Validate required or mutually-exclusive configuration.
function validateConfig(config: Partial<MyEnvConfig>): void {

    // Check if keys in field_mapping are valid
    if (config.user_mapping) {
        const mapping = config.user_mapping;
        const allowedKeys: (keyof UserFieldMapping)[] = ["full_name", "avatar", "bio"];
        Object.keys(mapping).forEach(key => {
            if (!allowedKeys.includes(key as keyof UserFieldMapping)) {
                throw new Error(`Invalid key "${key}" found in field mapping. Allowed keys are: ${allowedKeys.join(", ")}`);
            }
        });
    }

  // Example: For properties propX and propY, require exactly one to be provided.
//   const hasPropX = !!config.propX;
//   const hasPropY = !!config.propY;
//   if ((hasPropX && hasPropY) || (!hasPropX && !hasPropY)) {
//     throw new Error(
//       'Configuration error: exactly one of "propX" or "propY" must be provided.'
//     );
//   }
}
