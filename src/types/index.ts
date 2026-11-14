import type { Request } from 'express';

interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

interface RegisterUserRequest extends Request {
    body: UserData;
}
interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
    };
}

export type { AuthRequest, RegisterUserRequest, UserData };
