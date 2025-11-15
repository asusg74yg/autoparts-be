# ---------- Stage 1: Build ----------
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

# # Required for Prisma engine downloads on Alpine
# RUN apk add --no-cache openssl ca-certificates

# Copy package files
COPY package*.json ./

COPY . .
# Install ALL dependencies (including dev dependencies for building)


# RUN npm install -g npx@latest


RUN npm install
# Copy source

# Generate Prisma client
RUN npx prisma generate

# Build NestJS (creates /dist)
RUN npm run build

# Remove dev dependencies to reduce final image size
RUN npm prune --production



# ---------- Stage 2: Production ----------
FROM node:24-alpine

WORKDIR /usr/src/app

# Install CA certs again for safety
RUN apk add --no-cache openssl ca-certificates

# Copy built application and production dependencies from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

# (Optional) copy schema only if needed:
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/postgres-data ./postgres-data
EXPOSE 4001

CMD ["node", "dist/src/main.js"]
