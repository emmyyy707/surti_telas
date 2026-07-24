@echo off
chcp 65001 >nul
echo ============================================
echo   SurtiTelas Backend - Setup con Conda
echo ============================================
echo.

REM Check if conda is available
where conda >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Conda no está instalado o no está en el PATH.
    echo       Instala Anaconda/Miniconda desde https://docs.conda.io/en/latest/miniconda.html
    pause
    exit /b 1
)

echo [1/5] Creando entorno de conda "surtitelas-backend"...
call conda env create -f environment.yml
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] No se pudo crear el entorno de conda.
    pause
    exit /b 1
)

echo.
echo [2/5] Activando entorno...
call conda activate surtitelas-backend

echo.
echo [3/5] Instalando dependencias de Node.js...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install falló.
    pause
    exit /b 1
)

echo.
echo [4/5] Generando cliente Prisma...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] prisma generate falló.
    pause
    exit /b 1
)

echo.
echo [5/5] Iniciando PostgreSQL y Redis con conda...
echo       (Esto puede tardar unos segundos...)
start "PostgreSQL" cmd /c "conda run -n surtitelas-backend pg_ctl -D %CONDA_PREFIX%\Library\var\postgresql start"
timeout /t 3 /nobreak >nul
start "Redis" cmd /c "conda run -n surtitelas-backend redis-server --daemonize yes"
timeout /t 2 /nobreak >nul

echo.
echo ============================================
echo   Setup completado!
echo ============================================
echo.
echo   Entorno: surtitelas-backend
echo   PostgreSQL: localhost:5432
echo   Redis: localhost:6379
echo.
echo   Para ejecutar migraciones:
echo     conda activate surtitelas-backend
echo     npx prisma migrate dev
echo.
echo   Para iniciar el servidor:
echo     npm run dev
echo.
pause
