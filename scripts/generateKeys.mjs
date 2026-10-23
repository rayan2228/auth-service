import { generateKeyPairSync } from 'crypto';
import { writeFileSync } from 'fs';

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
    },
});

writeFileSync('certs/private.pem', privateKey);
writeFileSync('certs/public.pem', publicKey);
