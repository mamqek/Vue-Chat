import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseUserEntity } from './BasaUser';

@Entity({ name: 'users' }) // Ensure the table name matches the database schema
export class CustomUser extends BaseUserEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'text' })
    username!: string;

    @Column({ type: 'text' })
    avatar!: string;

    @Column({ type: 'text' })
    description!: string;

    // Getter to support legacy backend code that expects a numeric user1_id field.
    get full_name(): string {
        return this.username;
    }

    set full_name(value: string) {
        this.username = value;
    }
    
    // Getter to support legacy backend code that expects a numeric user1_id field.
    get bio(): string {
        return this.username;
    }

    set bio(value: string) {
        this.username = value;
    }
}