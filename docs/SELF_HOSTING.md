# LMStory Self-Hosting Guide

Deploying LMStory on your own infrastructure requires setting up the Docker environment, Reverse Proxy, and securing the services.

## 1. Prerequisites

- **Docker** and **Docker Compose** installed.
- A domain name pointing to your server (e.g., `lms.acme.com`).
- A wildcard domain for tenant resolution if supporting multiple tenants (`*.lms.acme.com`).

## 2. Environment Configuration

Copy the `.env.example` to `.env` and configure:

```env
# Change this to your production URL
CORS_ORIGIN=https://lms.acme.com
DEFAULT_DOMAIN=lms.acme.com

# Replace with strong, randomly generated 256-bit keys
JWT_ACCESS_SECRET=your_secure_access_key
JWT_REFRESH_SECRET=your_secure_refresh_key
COOKIE_SECRET=your_secure_cookie_key

# Select Storage Provider (LOCAL or S3)
STORAGE_PROVIDER=LOCAL
STORAGE_LOCAL_DIR=/app/uploads
```

## 3. Reverse Proxy & SSL (Nginx / Caddy)

You must place a Reverse Proxy in front of the `backend` container (Port 4000) to terminate HTTPS and provide a secure transport layer.

**Nginx Example (`nginx.conf`)**:

```nginx
server {
    listen 443 ssl;
    server_name lms.acme.com *.lms.acme.com;

    ssl_certificate /etc/letsencrypt/live/lms.acme.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lms.acme.com/privkey.pem;

    location / {
        proxy_pass http://backend:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_addres_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 4. Persistent Volumes & Storage

In `docker-compose.yml`, ensure the following are mapped to persistent volumes on the host to survive container restarts:

- **Postgres**: `/var/lib/postgresql/data`
- **Redis**: `/data`
- **Uploads** (if using `LOCAL` storage): `/app/uploads`

## 5. Backups

- **Database**: Configure a CRON job to run `pg_dump` daily and upload the SQL dump to an external S3 bucket.
- **Files**: If using Local Storage, ensure the host uploads directory is backed up via `rsync` or AWS CLI.

## 6. Starting the Stack

```bash
docker-compose up -d --build
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run seed
```

## 7. Health Checks & Monitoring

The backend exposes a `/health` endpoint. Point your uptime monitor (e.g., Datadog, BetterUptime) to `https://lms.acme.com/health`.
