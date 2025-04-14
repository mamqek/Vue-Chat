import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { BaseUser } from './BaseUser';
import { ChatMessage } from './ChatMessage';
import { getConfig } from '../config/config.server';

@Entity({ name: 'chats' })
export class Chat {
    @PrimaryGeneratedColumn()
    id!: number;
        
    @ManyToOne(() => {
        const config = getConfig();
        return config.user_entity;
    }, { eager: true, cascade: true })
    @JoinColumn({ name: 'user1_id' })
    user1!: BaseUser;

    @ManyToOne(() => {
        const config = getConfig();
        return config.user_entity;
    }, { eager: true, cascade: true })
    @JoinColumn({ name: 'user2_id' })
    user2!: BaseUser;
    
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

    @OneToMany(() => ChatMessage, (message) => message.chat)
    messages!: ChatMessage[];

    // Getter to support legacy backend code that expects a numeric user1_id and user2_id.
    get user1_id(): number {
        return this.user1?.id;
    }
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
