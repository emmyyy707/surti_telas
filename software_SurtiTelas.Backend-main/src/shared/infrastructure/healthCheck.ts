import { prisma } from '../../config/database';
import { redisClient } from '../../config/redis';
import { logger } from './logger';

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface HealthCheckResult {
  status: HealthStatus;
  checks: {
    database: { status: HealthStatus; latencyMs?: number; error?: string };
    redis: { status: HealthStatus; latencyMs?: number; error?: string };
    memory: { status: HealthStatus; heapUsedMb?: number; error?: string };
    eventLoop: { status: HealthStatus; lagMs?: number; error?: string };
  };
  modules?: Record<string, { status: HealthStatus; error?: string }>;
  timestamp: string;
}

async function checkDatabase(): Promise<HealthCheckResult['checks']['database']> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', latencyMs: Date.now() - start };
  } catch (error) {
    logger.error('Health check: database failed', { error: (error as Error).message });
    return { status: 'unhealthy', error: (error as Error).message };
  }
}

async function checkRedis(): Promise<HealthCheckResult['checks']['redis']> {
  const start = Date.now();
  try {
    if (!redisClient.isReady) {
      return { status: 'unhealthy', error: 'Redis not connected' };
    }
    await redisClient.ping();
    return { status: 'healthy', latencyMs: Date.now() - start };
  } catch (error) {
    logger.error('Health check: redis failed', { error: (error as Error).message });
    return { status: 'unhealthy', error: (error as Error).message };
  }
}

function checkMemory(): HealthCheckResult['checks']['memory'] {
  try {
    const usage = process.memoryUsage();
    const heapUsedMb = Math.round(usage.heapUsed / 1024 / 1024);
    const status: HealthStatus = heapUsedMb > 1024 ? 'degraded' : 'healthy';
    return { status, heapUsedMb };
  } catch (error) {
    return { status: 'unhealthy', error: (error as Error).message };
  }
}

async function checkEventLoop(): Promise<HealthCheckResult['checks']['eventLoop']> {
  return new Promise((resolve) => {
    const start = Date.now();
    setImmediate(() => {
      const lag = Date.now() - start;
      const status: HealthStatus = lag > 100 ? 'degraded' : 'healthy';
      resolve({ status, lagMs: lag });
    });
  });
}

async function checkModule(name: string, query: Promise<unknown>): Promise<{ status: HealthStatus; error?: string }> {
  try {
    await query;
    return { status: 'healthy' };
  } catch (error) {
    logger.error(`Health check: module ${name} failed`, { error: (error as Error).message });
    return { status: 'unhealthy', error: (error as Error).message };
  }
}

export async function getHealthStatus(): Promise<HealthCheckResult> {
  const [database, redis, memory, eventLoop] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    Promise.resolve(checkMemory()),
    checkEventLoop(),
  ]);

  const moduleChecks = await Promise.allSettled([
    checkModule('catalog', prisma.product.count()),
    checkModule('orders', prisma.order.count()),
    checkModule('stock', prisma.supplier.count()),
    checkModule('production', prisma.productionOrder.count()),
    checkModule('customers', prisma.customer.count()),
    checkModule('notifications', prisma.notification.count()),
    checkModule('webhooks', prisma.webhookSubscription.count()),
    checkModule('auth', prisma.user.count()),
  ]);

  const modules: Record<string, { status: HealthStatus; error?: string }> = {};
  const moduleNames = ['catalog', 'orders', 'stock', 'production', 'customers', 'notifications', 'webhooks', 'auth'];

  moduleNames.forEach((name, index) => {
    const result = moduleChecks[index];
    if (result.status === 'fulfilled') {
      modules[name] = result.value;
    } else {
      modules[name] = { status: 'unhealthy', error: 'Health check failed' };
    }
  });

  const checks = { database, redis, memory, eventLoop };
  const allChecks = [...Object.values(checks), ...Object.values(modules)];
  const hasUnhealthy = allChecks.some((c) => c.status === 'unhealthy');
  const hasDegraded = allChecks.some((c) => c.status === 'degraded');

  return {
    status: hasUnhealthy ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy',
    checks,
    modules,
    timestamp: new Date().toISOString(),
  };
}
