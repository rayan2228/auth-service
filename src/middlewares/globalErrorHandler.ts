import type { NextFunction, Request, Response } from 'express';
import { type HttpError } from 'http-errors';

export const errorHandler = (
    err: HttpError,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.statusCode || err.status || 500;
    const errors = (
        err as Error & {
            errors?: { field: string; message: string }[];
        }
    ).errors;

    return res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal server error.',
        ...(errors ? { errors } : {}),
    });
};
