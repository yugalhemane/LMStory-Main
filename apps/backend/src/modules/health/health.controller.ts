import { Request, Response } from 'express';
import { ApiResponse } from '../../shared/responses/ApiResponse';

export const checkHealth = (_req: Request, res: Response) => {
  const healthData = {
    status: 'ok',
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  };

  return res.status(200).json(ApiResponse.success('Health check passed', healthData));
};
