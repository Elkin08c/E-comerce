FROM node:24-alpine AS builder

# Instalar tzdata para configurar timezone
RUN apk add --no-cache tzdata

# Configurar timezone de Ecuador
ENV TZ=America/Guayaquil
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN npm install -g pnpm
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Production stage
FROM node:24-alpine AS runner

# Instalar tzdata para configurar timezone
RUN apk add --no-cache tzdata

# Configurar timezone de Ecuador
ENV TZ=America/Guayaquil
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN npm install -g pnpm

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
# Install production dependencies plus TypeScript (needed for next.config.ts)
RUN pnpm install --frozen-lockfile --prod && \
    pnpm add --save-exact typescript

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/next.config.* ./
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# Switch to non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Set environment variable for production
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["pnpm", "start"]


