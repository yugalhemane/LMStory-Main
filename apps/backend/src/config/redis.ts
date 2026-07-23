import { createClient } from 'redis';
import { env } from './env';
import { logger } from '../shared/logger';

export const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Redis Client Connected successfully'));

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      logger.warn('Skipping Redis connect (mocked for local verification)');
      // await redisClient.connect();
    }
  } catch (error) {
    logger.error('Failed to connect to Redis', error);
  }
};
