FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public


# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Install OpenSSL and curl for Prisma and Healthcheck
RUN apk add --no-cache openssl curl


# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy prisma schema so we can migrate
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Copy startup script
COPY --from=builder --chown=nextjs:nodejs /app/start.sh ./

# Install prisma CLI for migrations (since it's a devDep and not in standalone)
RUN npm install prisma

USER nextjs

EXPOSE 3000


# Healthcheck to ensure zero-downtime deployment
HEALTHCHECK --interval=10s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://127.0.0.1:3000/ || exit 1

ENV PORT 3000

CMD ["./start.sh"]
