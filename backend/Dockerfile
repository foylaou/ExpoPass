# Backend Dockerfile for ExpoPass
# Multi-stage build for optimized production image

# ============================================
# Stage 1: Build Stage
# ============================================
FROM node:18-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm@10.18.3

# Set working directory
WORKDIR /app

# Copy package manager configuration
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy backend package.json
COPY backend/package.json ./backend/

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy backend source code
COPY backend ./backend

# Build TypeScript to JavaScript
WORKDIR /app/backend
RUN pnpm build

# ============================================
# Stage 2: Production Stage
# ============================================
FROM node:18-alpine AS production

# Install pnpm globally in production image
RUN npm install -g pnpm@10.18.3

# Set working directory
WORKDIR /app

# Copy package manager configuration
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY backend/package.json ./backend/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy compiled JavaScript from builder stage
COPY --from=builder /app/backend/build ./backend/build

# Copy necessary runtime files
COPY backend/package.json ./backend/

# Set working directory to backend
WORKDIR /app/backend

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "build/index.js"]
