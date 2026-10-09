import bcrypt from 'bcryptjs';
import type { Repository } from 'typeorm';
import { User } from '../entities/User.js';
import type { UserData } from '../types/index.js';
import { saltRound } from '../constants/index.js';

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ firstName, lastName, email, password }: UserData) {
        const salt = await bcrypt.genSalt(saltRound);
        const hashPassword = await bcrypt.hash(password, salt);
        await this.userRepository.save({
            firstName,
            lastName,
            email,
            password: hashPassword,
        });
    }
}
