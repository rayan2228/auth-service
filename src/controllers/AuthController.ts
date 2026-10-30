import type { NextFunction, Response } from 'express';
import createHttpError from 'http-errors';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { UserService } from '../services/UserService.js';
import type { RegisterUserRequest } from '../types/index.js';
import { registerSchema } from '../validators/register.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Config } from '../config/index.js';
import { AppDataSource } from '../data-source.js';
import { RefreshToken } from '../entities/RefreshToken.js';

export class AuthController {
    constructor(private userService: UserService) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const validationResult = registerSchema.safeParse(req.body);

        if (!validationResult.success) {
            const errors = validationResult.error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }));

            return next(
                createHttpError(400, 'Validation failed', {
                    errors,
                }),
            );
        }

        const { firstName, lastName, email, password } = validationResult.data;

        const user = await this.userService.create({
            firstName,
            lastName,
            email,
            password,
        });

        const privateKey = readFileSync(
            join(import.meta.dirname, '../../certs/private.pem'),
        );

        const payload: JwtPayload = {
            sub: String(user.id),
            role: user.role,
        };

        const accessToken = jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '1h',
            issuer: 'auth-service',
        });

        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
        const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
        const newRefreshToken = await refreshTokenRepo.save({
            user: user,
            expiresAt: new Date(Date.now() + MS_IN_YEAR),
        });

        const refreshToken = jwt.sign(
            payload,
            Config.JWT_REFRESH_TOKEN_SECRET_KEY,
            {
                expiresIn: '1y',
                issuer: 'auth-service',
                jwtid: String(newRefreshToken.id),
            },
        );

        res.cookie('accessToken', accessToken, {
            domain: 'localhost',
            sameSite: 'strict',
            httpOnly: true,
            maxAge: 1000 * 60 * 60,
        });

        res.cookie('refreshToken', refreshToken, {
            domain: 'localhost',
            sameSite: 'strict',
            httpOnly: true,
            maxAge: MS_IN_YEAR,
        });

        return res.status(201).json({
            message: 'User registered successfully.',
            id: user.id,
        });
    }
}
