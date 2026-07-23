import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const reqId = (req.headers['x-request-id'] || crypto.randomUUID()) as string;
  res.setHeader('X-Request-Id', reqId);
  res.setHeader('x-request-id', reqId);
  (req as any).id = reqId;
  next();
};
