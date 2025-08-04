FROM node:18-alpine AS base
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/db-types/package.json ./packages/db-types/
COPY apps/backend/package.json ./apps/backend/

RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app

COPY packages/db-types ./packages/db-types
COPY apps/backend ./apps/backend

RUN pnpm --filter backend... build

FROM node:18-alpine AS production
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/db-types/package.json ./packages/db-types/
COPY apps/backend/package.json ./apps/backend/

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/packages/db-types/dist ./packages/db-types/dist

EXPOSE 3000

WORKDIR /app/apps/backend

CMD ["pnpm", "run", "start:prod"]