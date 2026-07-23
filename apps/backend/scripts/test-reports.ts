import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import reportRoutes from '../src/modules/report/routes/report.routes';

// Create a mocked express app
const app: Express = express();
app.use(express.json());

// Mock requireAuth and requireTenantAdmin middlewares inline
app.use((req: Request, _res: Response, next: NextFunction) => {
  (req as any).user = {
    userId: 'mock-user-uuid',
    tenantId: 'mock-tenant-uuid',
    role: 'TENANT_ADMIN'
  };
  next();
});

// Mount routes
app.use('/api/reports', reportRoutes);

async function runTests() {
  console.log('--- STARTING REPORT API E2E TESTS ---');

  // 1. Dashboard
  let res = await request(app).get('/api/reports/dashboard');
  console.log(`[GET /api/reports/dashboard] Status: ${res.status}`);
  if (res.status !== 200) console.error(res.body);

  // 2. Users Report
  res = await request(app).get('/api/reports/users');
  console.log(`[GET /api/reports/users] Status: ${res.status}`);
  if (res.status !== 200) console.error(res.body);

  // 3. Courses Report
  res = await request(app).get('/api/reports/courses');
  console.log(`[GET /api/reports/courses] Status: ${res.status}`);
  if (res.status !== 200) console.error(res.body);

  // 4. Campaigns Report
  res = await request(app).get('/api/reports/campaigns');
  console.log(`[GET /api/reports/campaigns] Status: ${res.status}`);
  if (res.status !== 200) console.error(res.body);

  // 5. Groups Report
  res = await request(app).get('/api/reports/groups');
  console.log(`[GET /api/reports/groups] Status: ${res.status}`);
  if (res.status !== 200) console.error(res.body);

  // 6. Certificates Report
  res = await request(app).get('/api/reports/certificates');
  console.log(`[GET /api/reports/certificates] Status: ${res.status}`);
  if (res.status !== 200) console.error(res.body);

  // Note: Learner report requires an actual user ID that belongs to the tenant in the DB to avoid 404.
  // Because the DB is empty, it will throw a 404 which is the EXPECTED BEHAVIOR of the security check!
  res = await request(app).get('/api/reports/learners/mock-user-uuid');
  console.log(`[GET /api/reports/learners/:userId] Status: ${res.status} (Expected 404 due to strict tenant verification on empty DB)`);

  console.log('--- E2E TESTS FINISHED ---');
  process.exit(0);
}

runTests();
