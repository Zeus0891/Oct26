# GitHub Workflows and Environments

This repository ships with:

- CI workflow: `.github/workflows/ci.yml`
  - Runs on push/PR to `main`
  - Steps: npm ci, Prisma generate, TypeScript typecheck, ESLint, Prettier check

- Environment Deploy workflow: `.github/workflows/environment-deploy.yml`
  - Manual trigger (workflow_dispatch)
  - Select `dev`, `staging`, or `prod`
  - Uses GitHub Environments for secrets/protection rules
  - Contains placeholder deploy step—replace with your platform deploy (e.g., Docker/K8s/Render/Fly/Heroku/Vercel)

## Configure Environments

In GitHub → Settings → Environments, create:

- `dev` (no protection or simple rules)
- `staging` (require approvals)
- `prod` (require approvals and branch protection)

Add environment secrets as needed, for example:

- `DATABASE_URL`
- `JWT_SECRET`
- `REDIS_URL`

These are accessible to jobs that declare `environment: name: <env>`.

## Notes

- Default CI doesn’t start the server or hit a database. It validates code quality quickly.
- If you want to add an integration test job with Postgres, add a service container and run `prisma migrate dev` before tests.
- For smoke tests that hit a deployed URL, add a job step after deploy using `scripts/auth-curl-smoke.sh` with `BASE_URL` set via variables or secrets.
