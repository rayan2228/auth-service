import { createJWKSMock } from 'mock-jwks';
import request from 'supertest';
import type { DataSource } from 'typeorm';
import { app } from '../../src/app.js';
import { Config } from '../../src/config/index.js';
import { AppDataSource } from '../../src/data-source.js';
import { User } from '../../src/entities/User.js';
import { registerUser, validUser } from './helpers.js';

describe('User API', () => {
    let connection: DataSource;
    let jwksMock: ReturnType<typeof createJWKSMock>;
    let stopJwks: () => void;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        jwksMock = createJWKSMock(Config.JWKS_URI);
    });

    beforeEach(async () => {
        stopJwks = jwksMock.start();
        await connection.dropDatabase();
        await connection.synchronize();
        await registerUser();
    });

    afterEach(() => {
        stopJwks();
    });

    afterAll(async () => {
        if (connection.isInitialized) {
            await connection.destroy();
        }
    });

    describe('GET /auth/me', () => {
        it('should return the 200 status code', async () => {
            const user = await connection
                .getRepository(User)
                .findOneByOrFail({ email: validUser.email });
            const accessToken = jwksMock.token({
                sub: String(user.id),
                role: user.role,
            });

            const response = await request(app)
                .get('/auth/me')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();

            expect(response.statusCode).toBe(200);
        });

        it('should return the authenticated user without the password', async () => {
            const user = await connection
                .getRepository(User)
                .findOneByOrFail({ email: validUser.email });
            const accessToken = jwksMock.token({
                sub: String(user.id),
                role: user.role,
            });

            const response = await request(app)
                .get('/auth/me')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();

            const body = response.body as Record<string, unknown>;
            expect(body.id).toBe(user.id);
            expect(body.password).not.toBe(user.password);
        });
    });
});
