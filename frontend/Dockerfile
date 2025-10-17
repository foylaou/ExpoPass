# Frontend Dockerfile for ExpoPass
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

# Copy frontend package.json
COPY frontend/package.json ./frontend/

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy frontend source code
COPY frontend ./frontend

# Build the application
WORKDIR /app/frontend
RUN pnpm build

# ============================================
# Stage 2: Production Stage with Nginx
# ============================================
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder stage
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Create non-root user for nginx
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
