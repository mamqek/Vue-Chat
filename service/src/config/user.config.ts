// src/config/user.config.ts
import { BaseUser } from '../entities/BaseUser';

export interface UserFieldMapping {
    full_name?: string; 
    avatar?: string;
    bio?: string;
}   

export interface UserConfig {
    // Now a function returning the entity class dynamically
    user_entity: () => new (...args: any[]) => BaseUser;
    field_mapping: UserFieldMapping;
}

// Default user config now dynamically resolves User
export const defaultUserConfig: UserConfig = {
    user_entity: () => require('../entities/User').User,  // Dynamic import
    field_mapping: {
        full_name: 'full_name',
        avatar: 'avatar',
        bio: 'bio',
    }
};
