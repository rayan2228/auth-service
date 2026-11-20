import e from 'express';
import path from 'node:path';
import createHttpError from 'http-errors';
import 'reflect-metadata';
import { errorHandler } from './middlewares/globalErrorHandler.js';
import authRouter from './routes/auth.js';
import cookieParser from 'cookie-parser';
const app = e();
app.use(e.json());
app.use(
    e.static(path.join(import.meta.dirname, 'public'), { dotfiles: 'allow' }),
);
app.use(cookieParser());
app.get('/', (req, res, next) => {
    const err = createHttpError(401);
    next(err);
});

app.use('/auth', authRouter);

app.use(errorHandler);

export { app };
