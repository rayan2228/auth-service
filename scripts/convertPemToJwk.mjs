// import { log } from "node:console";
import { readFileSync } from 'node:fs';
import { createPublicKey } from 'node:crypto';

const privateKey = readFileSync('./certs/private.pem');

const jwk = createPublicKey(privateKey).export({ format: 'jwk' });

console.log(JSON.stringify({ ...jwk, use: 'sig' }));
