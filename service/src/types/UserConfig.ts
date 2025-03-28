// src/config/user.config.ts

import { BaseUser } from "../entities/BaseUser";

export interface UserFieldMapping {
    full_name?: string; 
    avatar?: string;
    bio?: string;
}   

export interface UserConfig {
    user_entity: new (...args: any[]) => BaseUser;
    field_mapping: UserFieldMapping;
}

