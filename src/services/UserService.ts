import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';
import type { Repository } from 'typeorm';
import { saltRound } from '../constants/index.js';
import { User } from '../entities/User.js';
import type { UserData } from '../types/index.js';

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ firstName, lastName, email, password }: UserData) {
        const user = await this.userRepository.findOne({ where: { email } });

        if (user) {
            const err = createHttpError(400, 'Email is already exists ');
            throw err;
        }
        const salt = await bcrypt.genSalt(saltRound);
        const hashPassword = await bcrypt.hash(password, salt);
        const createdUser = await this.userRepository.save({
            firstName,
            lastName,
            email,
            password: hashPassword,
        });
        return createdUser;
    }
    async findByByEmail(email: string) {
        const user = await this.userRepository.findOne({
            where: {
                email,
            },
        });
        return user;
    }
}
