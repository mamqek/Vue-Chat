import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne, 
    JoinColumn,
    ManyToOne
} from 'typeorm';
import { ChatMessage } from './ChatMessage';

export enum ChatMessageStatusEnum {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

@Entity({ name: 'chat_message_statuses' })
export class ChatMessageStatus {
    // Composite primary key: message_id
    @PrimaryColumn({ type: 'int' })
    message_id!: number;

    // Composite primary key: receiver_id
    @PrimaryColumn({ type: 'int' })
    receiver_id!: number;

    @Column({
        type: 'text',
    })
    status: ChatMessageStatusEnum = ChatMessageStatusEnum.SENT;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    /**
     * Even though each ChatMessageStatus is logically linked to a single ChatMessage,
     * we use @ManyToOne here because TypeORM requires one side of a one-to-one relationship
     * to be defined as the owning side. By using @ManyToOne (with a unique constraint on the foreign key),
     * we can properly manage the 'message_id' and even handle composite keys if needed.
     */
    @ManyToOne(() => ChatMessage, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'message_id' })
    message!: ChatMessage;
}
