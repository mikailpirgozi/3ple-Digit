# Use Node.js 18 Alpine
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files for dependency resolution
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code and config files
COPY apps/api ./apps/api
COPY packages/types ./packages/types
COPY tsconfig.json ./

# Set working directory to API
WORKDIR /app/apps/api

# Generate Prisma client and build
RUN pnpm db:generate
RUN pnpm build

# Expose port
EXPOSE 4000

# Start the application
CMD ["pnpm", "start"]
