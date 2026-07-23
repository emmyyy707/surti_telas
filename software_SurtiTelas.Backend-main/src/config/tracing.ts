import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { env } from './env';

const sdk = new NodeSDK({
  serviceName: 'surtitelas-api',
  traceExporter: env.NODE_ENV === 'production'
    ? new OTLPTraceExporter({ url: 'http://jaeger:4318/v1/traces' })
    : undefined,
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
  textMapPropagator: new JaegerPropagator(),
});

export function startTracing() {
  if (env.NODE_ENV === 'production') {
    sdk.start();
  }
}

export function shutdownTracing() {
  return sdk.shutdown();
}
