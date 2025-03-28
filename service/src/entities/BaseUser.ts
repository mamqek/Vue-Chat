import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// BaseUser is an abstract class that defines the common properties of all user entities.
// It includes the id, created_at, and updated_at fields which are added to all user entities.
// It also includes abstract getters and setters for full_name, avatar, and bio, which must be implemented by derived classes by columns or getters/setters.
export abstract class BaseUser {
    @PrimaryGeneratedColumn()
    id!: number;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    // Abstract properties that must be implemented by derived classes
    abstract get full_name(): string;
    abstract get avatar(): string;
    abstract get bio(): string;

    abstract set full_name(value: string);
    abstract set avatar(value: string);
    abstract set bio(value: string);

    // Add the toJSON method to include getters in the JSON output
    // So full_name, avatar, and bio are present on the frontend
    toJSON() {
        return {
            ...this, // Include all existing properties
            full_name: this.full_name, // Explicitly include the getter
            avatar: this.avatar,       // Explicitly include the getter
            bio: this.bio,             // Explicitly include the getter
        };
    }
}