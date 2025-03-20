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
import { ChatMessage } from './ChatMessage';
import { User } from './User';

@Entity({ name: 'chats' })
export class Chat {
    @PrimaryGeneratedColumn()
    id!: number;
        
    @ManyToOne(() => User, { eager: true, cascade: true })
    @JoinColumn({ name: 'user1_id' })
    user1!: User;

    @ManyToOne(() => User, { eager: true, cascade: true })
    @JoinColumn({ name: 'user2_id' })
    user2!: User;
    
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
