// src/entities/User.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { getConfig } from '../config/config.server';
import { BaseUserEntity } from './BasaUser';


export interface BaseUser {
    id: number
    full_name: string;
    avatar: string;
    bio: string;
}

@Entity({ name: 'users' })
export class DefaultUser extends BaseUserEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'text' })
    full_name!: string;

    @Column({ type: 'text' })
    avatar!: string;

    @Column({ type: 'text' })
    bio!: string;

    // @CreateDateColumn()
    // created_at!: Date;

    // @UpdateDateColumn()
    // updated_at!: Date;

}



// let User: typeof DefaultUser;

// // Dynamically export the correct User entity
// // const config = getConfig();
// // const User = (config.User.user_entity && config.User.user_entity()) || DefaultUser; // Explicitly type the export
// // console.log(" exported user" , User);
// // export { User };

// export function getUserEntity() : typeof DefaultUser {
//     if (!User) {
//         const config = getConfig();
//         User = (config.User.user_entity && config.User.user_entity()) || DefaultUser;
//     }
//     return User;
// }

// export { getUserEntity as User };


// Dynamically resolve the correct User entity
// let resolvedUser: typeof DefaultUser | typeof CustomUser | null = null;

// export const User = new Proxy({}, {
//     get: () => {
//         if (!resolvedUser) {
//             const config = getConfig();
//             resolvedUser = config.User?.user_entity || DefaultUser;
//         }
//         return resolvedUser;
//     },
// }) as typeof DefaultUser | typeof CustomUser;


// let resolvedUser: BaseUserEntity | null = null;

// export const User = new Proxy({}, {
//     get: () => {
//         if (!resolvedUser) {
//             const config = getConfig();
//             resolvedUser = config.User.user_entity;
//         }
//         return resolvedUser;
//     },
// }) as BaseUserEntity;



// // Dynamically resolve the correct User entity
// let resolvedUser: typeof DefaultUser | null = null;

// export function initializeUserEntity() {
//     const config = getConfig();
//     resolvedUser = (config.User.user_entity && config.User.user_entity()) || DefaultUser;
// }

// export function getUserEntity(): typeof DefaultUser {
//     if (!resolvedUser) {
//         throw new Error("User entity has not been initialized. Call initializeUserEntity() first.");
//     }
//     return resolvedUser;
// }

// // Export the dynamically resolved User entity
// export const User = new Proxy({}, {
//     get: () => getUserEntity(),
// }) as typeof DefaultUser;