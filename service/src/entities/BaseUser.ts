import { AfterLoad } from 'typeorm';
import { getConfig } from '../config/config.server'; 
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
        
        // Retrieve the values using the resolved keys.
        const fullNameValue = (this as any)[fullNameKey];
        const avatarValue   = (this as any)[avatarKey];
        const bioValue      = (this as any)[bioKey];

        // Check that each value is of the expected type (string).
        if (typeof fullNameValue !== 'string') {
            console.error(
            `Type mismatch for ${fullNameKey}: expected a string, but got ${typeof fullNameValue}.`
            );
        }
        if (typeof avatarValue !== 'string') {
            console.error(
            `Type mismatch for ${avatarKey}: expected a string, but got ${typeof avatarValue}.`
            );
        }
        if (typeof bioValue !== 'string') {
            console.error(
            `Type mismatch for ${bioKey}: expected a string, but got ${typeof bioValue}.`
            );
        }

        // Assign to internal properties if the types are correct (or you could choose to throw errors).
        this.full_name = fullNameValue;
        this.avatar    = avatarValue;
        this.bio       = bioValue;
    }
}
