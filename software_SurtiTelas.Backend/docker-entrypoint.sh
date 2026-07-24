#!/bin/sh
set -e

echo "[entrypoint] Waiting for PostgreSQL..."
until node -e "const net=require('net');const s=net.createConnection({host:'db',port:5432});s.on('connect',()=>process.exit(0));s.on('error',()=>process.exit(1));s.setTimeout(1000);" >/dev/null 2>&1; do
  echo "[entrypoint] PostgreSQL is unavailable - waiting..."
  sleep 2
done

echo "[entrypoint] Waiting for Redis..."
until node -e "const net=require('net');const s=net.createConnection({host:'redis',port:6379});s.on('connect',()=>process.exit(0));s.on('error',()=>process.exit(1));s.setTimeout(1000);" >/dev/null 2>&1; do
  echo "[entrypoint] Redis is unavailable - waiting..."
  sleep 2
done

echo "[entrypoint] Running Prisma migrations..."
npx prisma migrate deploy

echo "[entrypoint] Starting server..."
npx tsx src/server.ts
