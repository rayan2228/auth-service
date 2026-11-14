import request from 'supertest';
import type { DataSource } from 'typeorm';
import { app } from '../../src/app.js';
import { AppDataSource } from '../../src/data-source.js';
import { RefreshToken } from '../../src/entities/RefreshToken.js';
import { User } from '../../src/entities/User.js';
import { isJwt } from '../../src/utils/index.js';
import { validationErrorResponseSchema } from '../../src/validators/auth.js';
import { registerUser } from './helpers.js';
const validUser = {
    email: 'rayan.cit.bd@gmail.com',
    password: 'Pa$$w0rd',
};

type loginPayload = typeof validUser;
describe('POST /auth/login', () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
        await registerUser();
    });

    afterAll(async () => {
        if (connection.isInitialized) {
            await connection.destroy();
        }
    });

    const loginUser = (
        payload: loginPayload = {
            email: validUser.email,
            password: validUser.password,
        },
    ) => request(app).post('/auth/login').send(payload);

    interface Headers {
        ['set-cookie']: string[];
    }

    const getCookies = (response: request.Response) =>
        (response.headers as unknown as Headers)['set-cookie'] ?? [];

    describe('Given valid credentials', () => {
        it('should return 200 OK', async () => {
            const response = await loginUser();

            expect(response.statusCode).toBe(200);
        });

        it('should return a JSON response', async () => {
            const response = await loginUser();

            expect(response.headers['content-type']).toContain(
                'application/json',
            );
        });

        it('should return access and refresh token cookies', async () => {
            const response = await loginUser();

            const cookies = getCookies(response);

            const accessToken = cookies
                .find((cookie) => cookie.startsWith('accessToken='))
                ?.split(';')[0]
                ?.split('=')[1];

            const refreshToken = cookies
                .find((cookie) => cookie.startsWith('refreshToken='))
                ?.split(';')[0]
                ?.split('=')[1];

            expect(accessToken).toBeDefined();
            expect(isJwt(accessToken)).toBeTruthy();

            expect(refreshToken).toBeDefined();
            expect(isJwt(refreshToken)).toBeTruthy();
        });

        it('should store the refresh token in the database', async () => {
            const response = await loginUser();

            const userRepository = connection.getRepository(User);
            const refreshTokenRepo = connection.getRepository(RefreshToken);

            const user = await userRepository.findOneBy({
                email: validUser.email,
            });

            const tokens = await refreshTokenRepo
                .createQueryBuilder('refreshToken')
                .where('refreshToken.userId = :userId', {
                    userId: user!.id,
                })
                .getMany();

            // One token from registration + one from login
            expect(tokens).toHaveLength(2);
            expect(response.statusCode).toBe(200);
        });

        it('should not create another user', async () => {
            await loginUser();

            const userRepository = connection.getRepository(User);

            await expect(userRepository.count()).resolves.toBe(1);
        });
    });

    describe('Given an incorrect password', () => {
        it('should return 401 Unauthorized', async () => {
            const response = await loginUser({
                email: validUser.email,
                password: 'WrongPassword123',
            });

            expect(response.statusCode).toBe(401);
        });
    });

    describe('Given an email that does not exist', () => {
        it('should return 401 Unauthorized', async () => {
            const response = await loginUser({
                email: 'unknown@example.com',
                password: validUser.password,
            });

            expect(response.statusCode).toBe(401);
        });
    });

    describe('Given missing or empty fields', () => {
        it.each([
            ['email', { email: '', password: validUser.password }],
            ['password', { email: validUser.email, password: '' }],
        ] as const)(
            'should return a validation error for %s',
            async (_field, payload) => {
                const response = await loginUser(payload);

                expect(response.statusCode).toBe(400);

                const body = validationErrorResponseSchema.parse(response.body);

                expect(body.message).toBe('Validation failed');
            },
        );
    });
});
