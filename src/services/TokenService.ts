import jwt, { type JwtPayload } from 'jsonwebtoken';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Config } from '../config/index.js';
export class TokenService {
    generateAccessToken(payload: JwtPayload) {
        const privateKey = readFileSync(
            join(import.meta.dirname, '../../certs/private.pem'),
        );
        const accessToken = jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '1h',
            issuer: 'auth-service',
        });
        return accessToken;
    }

    generateRefreshToken(payload: JwtPayload) {
        const refreshToken = jwt.sign(
            payload,
            Config.JWT_REFRESH_TOKEN_SECRET_KEY,
            {
                expiresIn: '1y',
                issuer: 'auth-service',
                jwtid: String(payload.id),
            },
        );
        return refreshToken;
    }
}
