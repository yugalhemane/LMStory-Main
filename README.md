# LMStory

## Project Overview

LMStory is a production-grade Multi-Tenant Learning Management System (LMS) SaaS application designed with a Modular Monolith architecture, enabling seamless future migration to microservices.

## Architecture

- **Pattern**: Modular Monolith
- **Approach**: Domain-Driven Design (Feature-based modules)
- **Tenancy**: Multi-Tenant

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, React Router, Tailwind CSS, Shadcn UI, TanStack Query, Zustand, React Hook Form, Zod
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Redis, BullMQ, Socket.io, Zod
- **Infrastructure**: Docker, Docker Compose
- **Tooling**: NPM Workspaces, ESLint (Flat Config), Prettier

## Folder Structure

```text
LMStory - Main/
├── apps/
│   ├── frontend/       # React Vite application
│   └── backend/        # Express Node.js application
├── packages/           # Shared libraries (future use)
├── docs/               # Documentation
├── docker/             # Docker configuration files
├── scripts/            # Utility scripts (e.g., cleanup)
├── docker-compose.yml  # Local development infrastructure
└── package.json        # Root workspace configuration
```

## How to Install

1. Ensure Node.js 22 LTS and Docker Desktop are installed.
2. Clone the repository.
3. Install dependencies natively from the root:
   ```bash
   npm install
   ```
4. Configure environment variables (Copy `.env.example` to `.env` in root, frontend, and backend).

## How to Run

Run the entire application stack from the root concurrently:

```bash
npm run dev
```

To run individual workspaces:

```bash
npm run dev:frontend
npm run dev:backend
```

## Docker Commands

Start development infrastructure (PostgreSQL, Redis):

```bash
npm run docker:up
```

Stop infrastructure:

```bash
npm run docker:down
```

View infrastructure logs:

```bash
npm run docker:logs
```

## Development Workflow

This repository uses standard NPM Workspaces to manage multiple applications natively. All dependencies are hoisted when possible to avoid duplication.

- Code should be written in isolated domains within `apps/backend/src/modules/`.
- Run `npm run lint` and `npm run format` prior to committing.

## Available Scripts

- `npm run dev` - Starts all development servers
- `npm run build` - Builds all workspaces
- `npm run lint` / `npm run lint:fix` - Lints TypeScript files across apps
- `npm run format` / `npm run format:check` - Formats code using Prettier
- `npm run typecheck` - Validates TypeScript types across workspaces
- `npm run clean` - Deep cleans `node_modules`, `dist`, `coverage`, and `.tsbuildinfo`
