import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import { logger } from './shared/logger';
import { errorHandler } from './middlewares/errorHandler';
import { requestIdMiddleware } from './middlewares/requestId';
import healthRoutes from './modules/health/health.routes';
import authRoutes from './modules/auth/routes/auth.routes';
import tenantRoutes from './modules/tenant/routes/tenant.routes';
import userRoutes from './modules/user/routes/user.routes';
import groupRoutes from './modules/group/routes/group.routes';
import libraryRoutes from './modules/library/routes/library.routes';
import tenantLibraryRoutes from './modules/tenantLibrary/routes/tenantLibrary.routes';
import courseRoutes from './modules/course/routes/course.routes';
import campaignRoutes from './modules/campaign/routes/campaign.routes';
import enrollmentRoutes from './modules/enrollment/routes/enrollment.routes';
import learnerRoutes from './modules/learner/routes/learner.routes';
import certificateRoutes from './modules/certificate/routes/certificate.routes';
import reportRoutes from './modules/report/routes/report.routes';
import notificationRoutes from './modules/notification/routes/notification.routes';
import tenantBrandingRoutes from './modules/tenantBranding/routes/tenantBranding.routes';
import { tenantResolver } from './shared/middlewares/tenantResolver.middleware';

const app: Express = express();
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.COOKIE_SECRET));
app.use(compression());

// Request ID
app.use(requestIdMiddleware);

// Logging
morgan.token('reqId', (req: any) => req.id);
const customFormat = '[:reqId] :method :url :status :response-time ms';

app.use(
  morgan(customFormat, {
    stream: { write: (message: string) => logger.http(message.trim()) },
  })
);

// Routes
app.use(tenantResolver);
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/tenant-branding', tenantBrandingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/tenant-library', tenantLibraryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/learner', learnerRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Swagger Documentation
const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger.yml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 404 Handler
app.use((_req, res, _next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
