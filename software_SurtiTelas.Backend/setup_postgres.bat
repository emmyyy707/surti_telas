@echo off
chcp 65001 >nul
setlocal

set BACKEND_DIR=%~dp0
set PGDATA=C:\Users\juand\anaconda3\envs\surtitelas-backend\Library\var\postgresql
set PGBIN=C:\Users\juand\anaconda3\envs\surtitelas-backend\Library\bin

echo ============================================
echo   PostgreSQL Setup - SurtiTelas Backend
echo ============================================
echo.
echo Data directory: %PGDATA%
echo Binaries: %PGBIN%
echo.

REM Check if PostgreSQL is running
tasklist /FI "IMAGENAME eq postgres.exe" 2>NUL | find /I /N "postgres.exe">NUL
if %ERRORLEVEL% EQU 0 (
    echo [INFO] PostgreSQL is already running.
    goto :SETUP_DB
)

REM Initialize database cluster if needed
if not exist "%PGDATA%\PG_VERSION" (
    echo [1/4] Initializing database cluster...
    if not exist "%PGDATA%" mkdir "%PGDATA%"
    "%PGBIN%\initdb.exe" -D "%PGDATA%" -U postgres -E UTF8 --locale=es_CO.UTF-8
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to initialize database cluster.
        pause
        exit /b 1
    )
    echo [OK] Database cluster initialized.
) else (
    echo [1/4] Database cluster already exists.
)

REM Configure pg_hba.conf for local connections
echo [2/4] Configuring pg_hba.conf...
set PGHBA=%PGDATA%\pg_hba.conf
if exist "%PGHBA%" (
    powershell -Command "(Get-Content '%PGHBA%') -replace 'host\s\+all\s\+all\s\+127\.0\.0\.1\/32\s\+md5', 'host all all 127.0.0.1/32 trust' | Set-Content '%PGHBA%'"
    powershell -Command "(Get-Content '%PGHBA%') -replace 'host\s\+all\s\+all\s\+::1/128\s\+md5', 'host all all ::1/128 trust' | Set-Content '%PGHBA%'"
)
echo [OK] pg_hba.conf configured.

REM Start PostgreSQL
echo [3/4] Starting PostgreSQL...
start "PostgreSQL" /B cmd /c ""%PGBIN%\pg_ctl.exe" -D "%PGDATA%" start -l "%PGDATA%\postgresql.log" -w"
timeout /t 3 /nobreak >nul
echo [OK] PostgreSQL started.

:SETUP_DB
REM Create user and database if they don't exist
echo [4/4] Creating database user and database...
"%PGBIN%\psql.exe" -U postgres -tc "SELECT 1 FROM pg_roles WHERE rolname='surtitelas'" | find /I "1" >nul
if %ERRORLEVEL% NEQ 0 (
    "%PGBIN%\psql.exe" -U postgres -c "CREATE USER surtitelas WITH PASSWORD 'surtitelas';"
    "%PGBIN%\psql.exe" -U postgres -c "CREATE DATABASE surtitelas OWNER surtitelas;"
    "%PGBIN%\psql.exe" -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE surtitelas TO surtitelas;"
    echo [OK] User and database created.
) else (
    echo [OK] User and database already exist.
)

echo.
echo ============================================
echo   PostgreSQL is ready!
echo ============================================
echo   Host: localhost:5432
echo   Database: surtitelas
echo   User: surtitelas
echo   Password: surtitelas
echo.
pause
