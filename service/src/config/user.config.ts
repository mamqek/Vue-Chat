// src/config/user.config.ts

import { BaseUserEntity } from "../entities/BasaUser";
import { DefaultUser } from "../entities/User";


// import { BaseUser } from '../entities/BaseUser';


export interface UserFieldMapping {
    full_name?: string; 
    avatar?: string;
    bio?: string;
}   

export interface UserConfig {
    // Now a function returning the entity class dynamically
    user_entity: () => new (...args: any[]) => BaseUserEntity;
    field_mapping: UserFieldMapping;
}

// Default user config now dynamically resolves User
export const defaultUserConfig: UserConfig = {
    user_entity: () => require('../entities/User').DefaultUser,  // Dynamic import
    field_mapping: {
        full_name: 'full_name',
        avatar: 'avatar',
        bio: 'bio',
    }
};
