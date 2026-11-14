import e from 'express';
import { AppDataSource } from '../data-source.js';
import { User } from '../entities/User.js';
import { TokenService } from '../services/TokenService.js';
import { UserService } from '../services/UserService.js';
import { CredentialService } from '../services/credentialService.js';
import { AuthController } from './../controllers/AuthController.js';
import authenticate from '../middlewares/authenticate.js';
import type { AuthRequest } from '../types/index.js';

const router = e.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const tokenService = new TokenService();
const credentialService = new CredentialService();
const authController = new AuthController(
    userService,
    tokenService,
    credentialService,
);

router.post('/register', (req, res, next) =>
    authController.register(req, res, next),
);
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.get('/me', authenticate, (req, res, next) =>
    authController.me(req as AuthRequest, res, next),
);

export default router;
