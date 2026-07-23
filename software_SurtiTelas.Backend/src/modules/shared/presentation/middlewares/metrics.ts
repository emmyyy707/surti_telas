import { Request, Response, NextFunction } from 'express';
import { Counter, Histogram, Registry } from 'prom-client';

export const registry = new Registry();

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total de requests HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duración de requests HTTP',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [registry],
});

const resolveRoute = (req: Request): string => {
  const baseUrl = req.baseUrl || '';
  const routePath = req.route?.path || '';
  const route = `${baseUrl}${routePath}`.replace(/\/+$/, '') || req.originalUrl || req.path;
  return route;
};

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const route = resolveRoute(req);
    const statusCode = res.statusCode.toString();

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: statusCode,
    });

    httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: statusCode,
      },
      (Date.now() - start) / 1000
    );
  });

  next();
};

export const metricsEndpoint = async (_req: Request, res: Response) => {
  res.set('Content-Type', registry.contentType);
  res.send(await registry.metrics());
};
