// src/config/user.config.ts
import { User } from '../entities/User';

export interface UserFieldMapping {
    full_name?: string; 
    avatar?: string;
    bio?: string;
}   

export interface UserConfig {
    // The entity class that TypeORM should use.
    // This can be the default or an override provided by the developer.
    user_entity: Function;
    // Field mapping for normalizing data from the user entity.
    field_mapping: UserFieldMapping;
}


export const defaultUserConfig: UserConfig = {
    user_entity: User,
    field_mapping: {
        full_name: 'full_name',
        avatar: 'avatar',
        bio: 'bio',
    }
};
