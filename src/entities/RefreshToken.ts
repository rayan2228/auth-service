import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './User.js';

@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn('increment', { type: 'int' })
    id: number;
    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @ManyToOne(() => User)
    user: User;

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
