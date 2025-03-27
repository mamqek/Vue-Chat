import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseUserEntity {
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
}