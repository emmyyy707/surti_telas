import { describe, it, expect } from 'vitest';
import { Verifier } from '@pact-foundation/pact';
import fs from 'fs';
import path from 'path';

const pactFile = path.resolve('pacts/SurtiTelas-Frontend-SurtiTelas-API.json');

describe('Pact Provider Verification', () => {
  it('should verify all pacts against the API when pact files exist', async () => {
    if (!fs.existsSync(pactFile)) {
      console.warn(`Pact file not found at ${pactFile}, skipping provider verification. Run consumer tests first to generate pacts.`);
      expect(true).toBe(true);
      return;
    }

    await new Verifier({
      provider: 'SurtiTelas API',
      providerBaseUrl: 'http://localhost:3000',
      pactUrls: [pactFile],
      stateHandlers: {
        'an order exists with id 1': () => Promise.resolve(),
        'suppliers exist': () => Promise.resolve(),
        'raw materials exist': () => Promise.resolve(),
        'workshops exist': () => Promise.resolve(),
        'production orders exist': () => Promise.resolve(),
        'a user exists with email admin@surtitelas.com': () => Promise.resolve(),
      },
      requestFilter: (req, res, next) => {
        req.headers['accept'] = 'application/json';
        next();
      },
    }).verifyProvider();
  });
});
