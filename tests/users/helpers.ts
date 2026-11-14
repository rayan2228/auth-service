import request from 'supertest';
import { app } from '../../src/app.js';

export const validUser = {
    firstName: 'Rayan',
    lastName: 'Hossain',
    email: 'rayan.cit.bd@gmail.com',
    password: 'Pa$$w0rd',
};

export type RegisterPayload = typeof validUser;

export const registerUser = (payload: Partial<RegisterPayload> = validUser) =>
    request(app).post('/auth/register').send(payload);
