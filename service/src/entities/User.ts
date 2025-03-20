// src/entities/User.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseUser } from './BaseUser';

@Entity({ name: 'users' })
export class User extends BaseUser {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'text' })
    full_name!: string;

    @Column({ type: 'text' })
    avatar!: string;

    @Column({ type: 'text' })
    bio!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

}
