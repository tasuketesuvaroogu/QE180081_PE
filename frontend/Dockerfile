# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the app (env vars will be injected at runtime via config.js)
ENV VITE_API_URL=""
RUN pnpm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add entrypoint script for runtime config injection
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
