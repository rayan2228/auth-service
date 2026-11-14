import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import type { JwtPayload } from 'jsonwebtoken';
import { UserService } from '../services/UserService.js';
import type { AuthRequest, RegisterUserRequest } from '../types/index.js';
import { loginSchema, registerSchema } from '../validators/auth.js';

import { AppDataSource } from '../data-source.js';
import { RefreshToken } from '../entities/RefreshToken.js';
import type { TokenService } from '../services/TokenService.js';
import { CredentialService } from './../services/credentialService.js';

export class AuthController {
    constructor(
        private userService: UserService,
        private tokenService: TokenService,
        private credentialService: CredentialService,
    ) {}

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

        const payload: JwtPayload = {
            sub: String(user.id),
            role: user.role,
        };

        const accessToken = this.tokenService.generateAccessToken(payload);

        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
        const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
        const newRefreshToken = await refreshTokenRepo.save({
            user: user,
            expiresAt: new Date(Date.now() + MS_IN_YEAR),
        });

        const refreshToken = this.tokenService.generateRefreshToken({
            ...payload,
            id: newRefreshToken.id,
        });

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
    async login(req: Request, res: Response, next: NextFunction) {
        const validationResult = loginSchema.safeParse(req.body);

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

        const { email, password } = validationResult.data;

        const user = await this.userService.findByEmail(email);
        if (!user) {
            const error = createHttpError(
                401,
                'Email or password does not match',
            );
            next(error);
            return;
        }

        const isPasswordMatch = await this.credentialService.comparePassword(
            password,
            user.password,
        );

        if (!isPasswordMatch) {
            const error = createHttpError(
                401,
                'Email or password does not match',
            );
            next(error);
            return;
        }
        const payload: JwtPayload = {
            sub: String(user.id),
            role: user.role,
        };

        const accessToken = this.tokenService.generateAccessToken(payload);

        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
        const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
        const newRefreshToken = await refreshTokenRepo.save({
            user: user,
            expiresAt: new Date(Date.now() + MS_IN_YEAR),
        });

        const refreshToken = this.tokenService.generateRefreshToken({
            ...payload,
            id: newRefreshToken.id,
        });

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

        return res.status(200).json({
            message: 'User logged successfully.',
            id: user.id,
        });
    }
    async me(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.findById(Number(req.auth.sub));
            return res.json({ ...user, password: undefined });
        } catch (err) {
            return next(err);
        }
    }
}
