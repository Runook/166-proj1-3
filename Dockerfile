# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built frontend and server code
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

# Expose port (Cloud Run uses PORT env var)
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production

# Start server
CMD ["node", "server/index.js"]

