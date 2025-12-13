# Backend Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY backend/package.json backend/package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ .
COPY shared/ ./shared/

# Build the application (compile TypeScript)
RUN npm run build

# Production dependencies
FROM base AS prod-deps
WORKDIR /app
COPY backend/package.json backend/package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci --only=production; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 backend
RUN adduser --system --uid 1001 backend

# Copy built application
COPY --from=builder --chown=backend:backend /app/dist ./dist
COPY --from=prod-deps --chown=backend:backend /app/node_modules ./node_modules
COPY --from=builder --chown=backend:backend /app/package.json ./package.json

USER backend

EXPOSE 3001

ENV PORT 3001

CMD ["node", "dist/app.js"]