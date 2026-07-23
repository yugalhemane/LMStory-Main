# Actionable Evidence-Based Gap List

This is the definitive, evidence-based gap list required before the platform can be confidently demonstrated or deployed. Every claim here is backed by exact file references or runtime verification.

---

## 1. Which pages are 100% complete?

**None.**
_Evidence:_ As verified by a `grep` analysis across `apps/platform/src`, the core Stitch design tokens (`bg-mesh`, `bg-surface-container`) required to match the exact HTML in `stitch_export/` are completely absent, rendering every single page visually non-compliant.

## 2. Which pages are functional but visually incorrect?

- `/login` (Auth works, but uses generic white card). _Evidence: `LoginPage.tsx` uses `bg-card` instead of `bg-mesh` and lacks the SSO elements from `login/code.html`._
- `/super-admin`, `/tenant-admin`, `/dashboard`, `/groups`, `/campaigns`.
  _Evidence: Backend hooks connect and fetch data (e.g., `CampaignWizardPage.tsx` lines 289-301 render lists), but the layout uses generic `shadcn` wrappers instead of the custom Stitch HTML._

## 3. Which pages are missing entirely?

- `/trial` (or `/register`)
  _Evidence: Checked `apps/platform/src/routes` and `App.tsx`; there is no route or page component for registration, meaning the screenshot provided (`demo.innvikta.co.in/trial`) is entirely unimplemented._

## 4. Which backend APIs exist but have no frontend?

- **None critical identified.** The React Router and Query hooks currently attempt to consume all major exposed endpoints (Users, Groups, Courses, Campaigns).

## 5. Which frontend pages exist but have no backend?

- `/library` (Asset Uploads)
  _Evidence: The frontend attempts to upload files, but `apps/backend/src/shared/storage/s3.storage.provider.ts` lines 10, 16, 21, and 26 literally contain `// TODO: Implement S3 PutObjectCommand`, meaning the backend drops the files._

## 6. Which folders/files are empty or abandoned?

- `apps/backend/src/shared/storage/s3.storage.provider.ts` (Abandoned/Empty methods).
- `apps/backend/src/modules/notification/service/notification.service.ts:137` (Abandoned Event Bus integration).

## 7. "Coming Soon" Placeholders: Acceptable vs. Blockers

| Feature                      | File & Line Evidence                  | Acceptable for V1? | Blocks Demo?                                       |
| ---------------------------- | ------------------------------------- | ------------------ | -------------------------------------------------- |
| SCORM/Quiz Content Blocks    | `CourseBuilderPage.tsx:174-194`       | No                 | **YES** (Core LMS feature missing)                 |
| Asset Library Uploads        | `s3.storage.provider.ts:10`           | No                 | **YES** (Cannot create courses without assets)     |
| Report Exports               | `UserReportsPage.tsx:53`              | Yes                | No (Can show generic tables for now)               |
| Verify 3rd Party Credentials | `PublicVerifyCertificatePage.tsx:137` | Yes                | No (Edge case)                                     |
| Bulk User Import             | `UsersPage.tsx:109`                   | No                 | **YES** (Enterprise customers require bulk import) |

## 8. Can the product be installed on a customer's infrastructure via Docker today?

**NO.**
_Evidence:_

1. **Broken Storage:** Customers cannot upload files because MinIO/S3 is not wired in the backend (`s3.storage.provider.ts`).
2. **Missing Routing:** The `docker-compose.yml` runs the backend on port 4000 and requires Vite for the frontend (port 5173). There is no Nginx/Traefik reverse proxy configured to serve this on a unified production port (80/443).

## 9. What is required for Enterprise On-Premises & Licensing features?

To support customer-owned infrastructure and offline deployments, the following architectural additions are mandatory:

- **Customer-owned Infra (SMTP, Postgres, Redis, MinIO):**
  - The architecture currently uses `.env` variables (`DATABASE_URL`, `MINIO_ENDPOINT`), meaning it _can_ support customer infra, but the S3 and Redis code must actually be implemented to work.
- **Offline / On-premises Deployment:**
  - Requires a compiled static frontend build (`npm run build`) served via Nginx in Docker, instead of Vite dev server.
- **30-day Evaluation & Licensing Enforcements:**
  - **Requirement:** A `LicenseGuard.ts` interceptor in NestJS.
  - **Mechanism:** Decrypts an offline RSA-signed JWT license key stored in the DB. If `expiresAt` is past, the Guard intercepts all `POST/PUT/DELETE` requests and returns `402 Payment Required` (Read-only mode).
  - **Forced Logout:** The Guard can emit a WebSocket event or return a specific `403 License Expired` code to force the frontend to clear the JWT.

---

## The Master Action List

### 1. Storage Integration (CRITICAL)

- **Evidence:** `apps/backend/src/shared/storage/s3.storage.provider.ts:10`
- **Blocks:** Client Demo, Production Deployment.
- **Estimated Effort:** 4 hours (Wire up AWS SDK v3 commands).

### 2. Registration Page (CRITICAL)

- **Evidence:** Trial screenshot provided; route missing from `App.tsx`.
- **Blocks:** Client Demo (Nobody can sign up).
- **Estimated Effort:** 3 hours (Build `TrialRegisterPage.tsx` and connect to existing Auth API).

### 3. Global CSS Parity (HIGH)

- **Evidence:** Missing `bg-mesh`, `on-surface` tokens across `apps/platform`.
- **Blocks:** Client Demo (Looks unbranded/unprofessional).
- **Estimated Effort:** 4 hours (Inject Stitch tokens into `packages/theme` and overhaul `LoginPage.tsx`).

### 4. Production Docker Configuration (HIGH)

- **Evidence:** Missing Nginx proxy in `docker-compose.yml`.
- **Blocks:** Production Deployment.
- **Estimated Effort:** 3 hours (Create `nginx.conf`, build production Dockerfile for frontend).

### 5. SCORM & Bulk Import UI (MEDIUM)

- **Evidence:** `CourseBuilderPage.tsx:174`, `UsersPage.tsx:109`.
- **Blocks:** Client Demo.
- **Estimated Effort:** 6 hours (Implement the frontend forms and link to backend APIs).

### 6. Enterprise Licensing (MEDIUM)

- **Evidence:** No licensing architecture exists.
- **Blocks:** Enterprise On-Premises Sales.
- **Estimated Effort:** 8 hours (Build `LicenseGuard` and offline JWT generator).
