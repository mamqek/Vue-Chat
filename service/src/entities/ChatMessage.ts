// src/entities/ChatMessage.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Chat } from './Chat';
import { ChatMessageStatus } from './ChatMessageStatus';

@Entity({ name: 'chat_messages' })
export class ChatMessage {
    @PrimaryGeneratedColumn()
    id!: number;

    // Many messages belong to one chat.
    @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'chat_id' })
    chat!: Chat;

    @Column({ type: 'int' })
    sender_id!: number;

    @Column({ type: 'int' })
    receiver_id!: number;

    // Self-referencing relation for replies; nullable.
    @ManyToOne(() => ChatMessage, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'replied_to' })
    replied_to?: ChatMessage;

    @Column({ type: 'text', nullable: true })
    text?: string;

    // Relation to ChatMessageStatus.
    // We're assuming a one-to-one relation where we join on both 'id' and 'receiver_id'.
    // Setting eager to true ensures it's loaded automatically and cascade so the status is automatically saved.
    @OneToOne(() => ChatMessageStatus, status => status.message, { eager: true, nullable: true })
    status?: ChatMessageStatus;

    // Using simple-json to store JSON data (like attachment information)
    @Column({ type: 'simple-json', nullable: true })
    attachment?: any;

    @Column({ type: 'boolean', default: false })
    deleted?: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
