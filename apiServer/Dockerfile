# Stage 1: Builder
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies (including dev dependencies for building)
RUN bun install --frozen-lockfile

# Copy source code and config files
COPY . .

# Build the application
RUN bun run build

# Stage 2: Runner
FROM oven/bun:1-slim AS runner

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install production dependencies only
RUN bun install --frozen-lockfile --production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy migration files for database setup
COPY --from=builder /app/src/database/migrate.ts ./src/database/migrate.ts
COPY --from=builder /app/src/database/migrations ./src/database/migrations

# Copy necessary config files
COPY --from=builder /app/nest-cli.json ./
COPY --from=builder /app/.swcrc ./
COPY --from=builder /app/tsconfig.json ./

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD bun run -e 'fetch("http://localhost:3000/health").then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))'

# Start the application
CMD ["bun", "run", "dist/main.js"]
