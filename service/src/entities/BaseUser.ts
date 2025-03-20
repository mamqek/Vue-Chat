import { AfterLoad } from 'typeorm';
import { getConfig } from '../config/config'; 
import { defaultUserConfig, UserFieldMapping } from '../config/user.config';



// A base class for a user entity with automatic normalization.
// Developers can extend this if they want the built-in normalization.
export abstract class BaseUser {
    // These properties should be declared (and decorated) in the concrete entity.
    abstract full_name: string;
    abstract avatar: string;
    abstract bio: string;

    // This property will be set after loading.
    normalized?: { full_name: string; avatar: string; bio: string };

    @AfterLoad()
    normalize() {
        // Get the mapping from the global configuration.
        const mapping: UserFieldMapping = getConfig().User!.field_mapping;
        
        // Ensure that the field key is always a defined string.
        const fullNameKey: string = mapping.full_name ?? defaultUserConfig.field_mapping.full_name!;
        const avatarKey: string = mapping.avatar ?? defaultUserConfig.field_mapping.avatar!;
        const bioKey: string = mapping.bio ?? defaultUserConfig.field_mapping.bio!;
        
        // Directly override the main fields with normalized values.
        this.full_name = (this as any)[fullNameKey];
        this.avatar    = (this as any)[avatarKey];
        this.bio       = (this as any)[bioKey];
    }
}
