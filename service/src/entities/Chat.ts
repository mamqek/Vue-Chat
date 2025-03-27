// src/entities/Chat.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
    OneToOne
} from 'typeorm';
// import { User, BaseUser, getUserEntity } from './User';
// import { User } from './User';
import { BaseUserEntity } from './BasaUser';

import { getMetadataArgsStorage } from 'typeorm';
console.log('Debugging Chat Entity:');
console.log('BaseUserEntity Metadata:', getMetadataArgsStorage().tables.find(table => table.target === BaseUserEntity));
console.log('All Registered Entities:', getMetadataArgsStorage().tables.map(table => table.target));

import { ChatMessage } from './ChatMessage';
import { getConfig } from '../config/config.server';



// console.log("caht class", User);
@Entity({ name: 'chats' })
export class Chat {
    @PrimaryGeneratedColumn()
    id!: number;
        
    @ManyToOne(() => {
        const config = getConfig();
        return config.User.user_entity;
    }, { eager: true, cascade: true })
    @JoinColumn({ name: 'user1_id' })
    user1!: BaseUserEntity;

    @ManyToOne(() => {
        const config = getConfig();
        return config.User.user_entity;
    }, { eager: true, cascade: true })
    @JoinColumn({ name: 'user2_id' })
    user2!: BaseUserEntity;
    
    @Column({ type: 'int', default: 0 })
    user1_unread_count: number = 0;

    @Column({ type: 'int', default: 0 })
    user2_unread_count: number = 0;

    // The last message in the chat (nullable). On deletion of the referenced message, sets to NULL.
    @ManyToOne(() => ChatMessage, { nullable: true, onDelete: 'SET NULL', eager: true })
    @JoinColumn({ name: 'last_message_id' })
    last_message?: ChatMessage;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    // One chat has many messages.
    @OneToMany(() => ChatMessage, (message) => message.chat)
    messages!: ChatMessage[];


    // Getter to support legacy backend code that expects a numeric user1_id field.
    get user1_id(): number {
        return this.user1?.id;
    }

    // Similarly for user2_id.
    get user2_id(): number {
        return this.user2?.id;
    }

    // Add the toJSON method to include getters in the JSON output.
    toJSON() {
        return {
            ...this,
            user1_id: this.user1?.id,
            user2_id: this.user2?.id,
        };
    }
}
