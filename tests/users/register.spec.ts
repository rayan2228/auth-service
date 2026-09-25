import request from 'supertest';
import { app } from '../../src/app.js';

describe('POST /auth/register', () => {
    describe('Given all fields', () => {
        it('should return the 201 status code', async () => {
            //AAA
            // Arrange
            const userData = {
                firstName: 'Rayan',
                lastName: ' Hossian',
                email: 'rayan.cit.bd@gmail.com',
                password: 'secret',
            };
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            // Assert
            expect(response.statusCode).toBe(201);
        });

        it('should return a valid JSON', async () => {
            //AAA
            // Arrange
            const userData = {
                firstName: 'Rayan',
                lastName: ' Hossian',
                email: 'rayan.cit.bd@gmail.com',
                password: 'secret',
            };
            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            // Assert
            // application/json
            expect(response.headers['content-type']).toEqual(
                expect.stringContaining('json'),
            );
        });
    });
    describe('Fields are missing', () => {});
});
