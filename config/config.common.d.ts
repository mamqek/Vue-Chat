// config.common.d.ts
export interface CommonConfig {
    SERVICE_URL: string;
    TOKEN_NAME: string;
}

export function setCommonConfig(newConfig: Partial<CommonConfig>): void;
export function getCommonConfig(): CommonConfig;
