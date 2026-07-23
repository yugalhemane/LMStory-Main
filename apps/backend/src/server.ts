import app from './app';
import { env } from './config/env';
import { logger } from './shared/logger';
import { connectRedis, redisClient } from './config/redis';
import { prisma } from './database/prisma';

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connection initialized successfully');

    await connectRedis();

    const server = app.listen(env.PORT, () => {
      logger.info(`Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} received: closing HTTP server`);
      server.close(async () => {
        logger.info('HTTP server closed');
        try {
          await prisma.$disconnect();
          logger.info('Prisma disconnected');
          
          if (redisClient.isOpen) {
            await redisClient.quit();
            logger.info('Redis disconnected');
          }
          
          logger.info('Graceful shutdown complete');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', error);
          process.exit(1);
        }
      });
      
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
