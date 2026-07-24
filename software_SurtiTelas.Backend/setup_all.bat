@echo off
chcp 65001 >nul
setlocal

set BACKEND_DIR=%~dp0
set PGDATA=%CONDA_PREFIX%\Library\var\postgresql
set PGBIN=%CONDA_PREFIX%\Library\bin

echo ============================================
echo   SurtiTelas Backend - Full Setup
echo ============================================
echo.

REM Check if we're in the backend directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Run this from software_SurtiTelas.Backend/
    pause
    exit /b 1
)

REM Setup PostgreSQL
call setup_postgres.bat

REM Install Node.js dependencies
echo.
echo [5/6] Installing Node.js dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)

REM Generate Prisma client
echo.
echo [6/6] Generating Prisma client...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] prisma generate failed.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Setup completed successfully!
echo ============================================
echo.
echo   Next steps:
echo   1. Run migrations: npx prisma migrate dev
echo   2. Seed database:  npm run prisma:seed
echo   3. Start server:    npm run dev
echo.
pause
