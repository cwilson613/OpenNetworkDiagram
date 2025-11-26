# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Install adapter-node for Docker deployment
RUN pnpm add -D @sveltejs/adapter-node

# Copy source code
COPY . .

# Temporarily modify svelte.config.js to use adapter-node
RUN sed -i "s/@sveltejs\/adapter-auto/@sveltejs\/adapter-node/g" svelte.config.js

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Create data directory
RUN mkdir -p /data

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "build"]
