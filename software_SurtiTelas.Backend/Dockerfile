FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm config set registry https://registry.npmjs.org/ && npm config set fetch-timeout 600000 && npm config set fetch-retry-maxtimeout 600000 && npm ci

COPY tsconfig.json ./
COPY prisma ./prisma

RUN npx prisma generate

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package.json ./
COPY src ./src
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh && mkdir -p /app/uploads

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
