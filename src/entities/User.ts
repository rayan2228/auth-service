import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Roles } from '../constants/index.js';

@Entity()
export class User {
    @PrimaryGeneratedColumn('increment', { type: 'int' })
    id: number;
    @Column({ type: 'varchar' })
    firstName: string;
    @Column({ type: 'varchar' })
    lastName: string;
    @Column({ type: 'varchar', unique: true })
    email: string;
    @Column({ type: 'varchar' })
    password: string;
    @Column({
        type: 'enum',
        enum: Roles,
        default: Roles.CUSTOMER,
    })
    role: Roles;
    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
        onUpdate: 'CURRENT_TIMESTAMP(6)',
    })
    updatedAt: Date;
}
