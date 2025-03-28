// src/entities/User.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { BaseUser } from './BaseUser';

@Entity({ name: 'users' })
export class DefaultUser extends BaseUser {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'text' })
    full_name!: string;

    @Column({ type: 'text' })
    avatar!: string;

    @Column({ type: 'text' })
    bio!: string;
}
