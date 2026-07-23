# E2E Testing with Playwright

## Prerequisites
- Backend running on `http://localhost:3000/api/v1`
- Frontend running on `http://localhost:5173`
- Database seeded (`npm run prisma:seed`)

## Setup
```bash
cd SurtiTelas.Backend
npm install
npx playwright install
```

## Run tests
```bash
npm run test:e2e
```

## Run with UI
```bash
npm run test:e2e:ui
```

## Configuration
- Base URL: `http://localhost:3000/api/v1`
- Tests use supertest directly against the Express app (no browser needed for API contract tests)
- Frontend E2E tests require the dev server running

## Known issues
- E2E tests require the backend server to be running
- If using `webServer` config, ensure the server starts within 60s timeout
