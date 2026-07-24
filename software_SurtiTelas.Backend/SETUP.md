# Setup SurtiTelas Backend

## Prerequisites

- Conda (Anaconda or Miniconda) installed and in PATH
- Git

## Quick Start

### Option A: Automated Setup (Windows)

```bash
cd software_SurtiTelas.Backend
setup.bat
```

### Option B: Manual Setup

```bash
# 1. Create conda environment
conda env create -f environment.yml

# 2. Activate environment
conda activate surtitelas-backend

# 3. Install Node.js dependencies
npm install

# 4. Generate Prisma client
npx prisma generate

# 5. Start PostgreSQL (conda)
pg_ctl -D %CONDA_PREFIX%\Library\var\postgresql start

# 6. Start Redis (conda)
redis-server --daemonize yes

# 7. Run migrations
npx prisma migrate dev

# 8. Seed database
npm run prisma:seed

# 9. Start development server
npm run dev
```

## Database Configuration

Default connection string in `.env`:
```
DATABASE_URL=postgresql://surtitelas:surtitelas@localhost:5432/surtitelas
REDIS_URL=redis://localhost:6379
```

Default credentials:
- PostgreSQL user: `surtitelas`
- PostgreSQL password: `surtitelas`
- Database: `surtitelas`

## Troubleshooting

### PostgreSQL won't start
```bash
# Check if port 5432 is in use
netstat -ano | findstr :5432

# Initialize database cluster if needed
initdb -D %CONDA_PREFIX%\Library\var\postgresql
```

### Redis won't start
```bash
# Check if port 6379 is in use
netstat -ano | findstr :6379
```

### Prisma client errors
```bash
npx prisma generate
```

## Alternative: Docker

If conda setup fails, use Docker:
```bash
docker compose up -d
```

This starts PostgreSQL on port 5432 and Redis on port 6379.
