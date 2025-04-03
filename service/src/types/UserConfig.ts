import { BaseUser } from "../entities/BaseUser";
export interface ColumnOptions {
    name: string;
    isNullable?: boolean;
    default?: any;
}

export interface UserFieldMapping {
    full_name?: ColumnOptions; 
    avatar?: ColumnOptions;
    bio?: ColumnOptions;
}   

export interface UserConfig {
    user_entity: new (...args: any[]) => BaseUser;
    field_mapping: UserFieldMapping;
}

