import e from 'express';
import { AuthController } from './../controllers/AuthController.js';

const router = e.Router();

const authController = new AuthController();

router.post('/register', (req, res) => authController.register(req, res));

export default router;
