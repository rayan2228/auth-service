import type { DataSource } from 'typeorm';

const requiredEnv = (key: string): string => {
    const value = process.env[key];

    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }

    return value;
};

const truncateTables = async (connection: DataSource) => {
    const entities = connection.entityMetadatas;
    for (const entity of entities) {
        const repository = connection.getRepository(entity.name);
        await repository.clear();
    }
};

const isJwt = (token: string | undefined): boolean => {
    if (!token) {
        return false;
    }
    const parts = token.split('.');
    if (parts.length !== 3) {
        return false;
    }
    try {
        parts.forEach((part) => {
            Buffer.from(part, 'base64').toString('utf-8');
        });
        return true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
        return false;
    }
};

export { truncateTables, requiredEnv, isJwt };
