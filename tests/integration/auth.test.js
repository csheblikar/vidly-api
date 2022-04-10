const { User } = require('../../models/user');
const { Genre } = require('../../models/genre');
const request = require('supertest');

let token, server;

describe('auth middleware', () => {
    beforeEach(() => {
        server = require('../../index');
    });
    afterEach(async () => {
        await server.close();
        await Genre.deleteMany({});
    });

    const exec = () => {
        return request(server)
            .post('/api/genres')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'genre1' });
    };

    beforeEach(() => {
        token = new User().generateAuthToken();
    });

    it('should return 401 if no token is provided', async () => {
        token = '';

        const res = await exec();

        expect(res.status).toBe(401);
    });

    it('should return 400 if token is invalid', async () => {
        token = 'a';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 200 if token is valid', async () => {
        const res = await exec();

        expect(res.status).toBe(200);
    });
});
