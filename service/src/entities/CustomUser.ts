import {
  Entity,
  PrimaryGeneratedColumn,
  Column
} from 'typeorm';
import { BaseUser } from './BaseUser';

// Example of a custom user entity that extends the BaseUser class.
// This class is used to demonstrate how to create a custom user entity
// Because this class has columns of username and description instead of full_name and bio
// It is necessary to provide a getter and setter for full_name and bio to support legacy backend code
@Entity({ name: 'users' })
export class CustomUser extends BaseUser {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'text' })
    username!: string;

    @Column({ type: 'text' })
    avatar!: string;

    @Column({ type: 'text' })
    description!: string;

    get full_name(): string {
        return this.username;
    }

    set full_name(value: string) {
        this.username = value;
    }
    
    get bio(): string {
        return this.description;
    }

    set bio(value: string) {
        this.description = value;
    }
}