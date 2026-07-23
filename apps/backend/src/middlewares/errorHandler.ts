import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import { Prisma } from '@prisma/client';
import { BaseError } from '../shared/errors';
import { ApiResponse } from '../shared/responses/ApiResponse';
import { logger } from '../shared/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(err.message, { stack: err.stack, requestId: (req as any).id });

  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((e: any) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json(ApiResponse.failure('Validation failed', formattedErrors));
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json(ApiResponse.failure('Resource already exists', { field: (err.meta?.target as string[])?.join(',') }));
    }
    return res.status(400).json(ApiResponse.failure('Database error', env.NODE_ENV === 'development' ? err.message : undefined));
  }

  if (err instanceof BaseError) {
    return res.status(err.statusCode).json(ApiResponse.failure(err.message, err.errors));
  }

  const message = env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  return res.status(500).json(ApiResponse.failure(message));
};
