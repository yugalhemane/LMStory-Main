import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../database/prisma';
import { logger } from '../logger';

export const tenantResolver = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const host = req.hostname; // e.g., acme.lmstory.com
    
    // First, try to resolve by custom domain
    let tenant = await prisma.tenant.findUnique({
      where: { domain: host }
    });

    if (!tenant) {
      // Fallback to checking if it's a subdomain matching a slug
      const defaultDomain = process.env.DEFAULT_DOMAIN || 'lmstory.com';
      if (host.endsWith(defaultDomain)) {
        const slug = host.replace(`.${defaultDomain}`, '');
        tenant = await prisma.tenant.findUnique({
          where: { slug }
        });
      }
    }

    if (tenant) {
      (req as any).tenant = tenant;
    }

    next();
  } catch (error) {
    logger.error('Error in tenant resolver middleware:', error);
    next();
  }
};
