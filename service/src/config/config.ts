import { defaultUserConfig, UserConfig } from './user.config';

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
    
    UPLOAD_DIR?: string;
    user_filter?: string | Record<string, any>; // f.e '{"active": true, "role": "admin"}' as sting or { active: true, role: 'admin' } as object
    
    // Database configuration
    DB_TYPE: string;                       // E.g., 'sqlite', 'postgres', 'mysql'
    DB_NAME: string;                       // Database name or file name (for SQLite)
    DB_HOST?: string;                      // For non-SQLite DBs
    DB_PORT?: number;                      // For non-SQLite DBs
    DB_USER?: string;                      // For non-SQLite DBs
    DB_PASS?: string;                      // For non-SQLite DBs
    synchronize?: boolean;                 // Automatically create database schema

    TOKEN_NAME: string;
    TOKEN_SECRET: string;
    JWT_ALGORITHM?: string;
    sessionLookup: SessionLookupFn;

    User?: UserConfig;
}

// Define default values.
const defaultConfig: MyEnvConfig = {
    production: process.env.NODE_ENV === 'production',

    PORT: 4000,
    SERVICE_URL: "http://localhost:4000",
    UPLOAD_DIR: "uploads",

    user_filter: {},

    DB_TYPE: "sqlite",
    DB_NAME: "chatdb",
    DB_HOST: "",          // Not used for SQLite; override for Postgres/MySQL
    DB_PORT: undefined,   // Not used for SQLite; override for Postgres/MySQL
    DB_USER: "",          // Not used for SQLite; override for Postgres/MySQL
    DB_PASS: "",          // Not used for SQLite; override for Postgres/MySQL
    synchronize: false,

    HOST: "0.0.0.0",
    TOKEN_NAME: "chat_token",
    TOKEN_SECRET: "chat-secret",
    JWT_ALGORITHM: "HS256",
    sessionLookup: async (sessionId: string) => {
        throw new Error("sessionLookup function not implemented");
    },

    User: defaultUserConfig,
};

let currentConfig: MyEnvConfig = { ...defaultConfig };

export function setConfig(newConfig: Partial<MyEnvConfig>) {
  // Merge the new config into the defaults.
  currentConfig = { ...defaultConfig, ...newConfig };
//   validateConfig(currentConfig);
}

export function getConfig(): MyEnvConfig {
  return currentConfig;
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
