# Deployment Runbook - SurtiTelas (PowerShell)
# Ejecutar en C:\Users\usuario\software_SurtiTelas.Backend

$ErrorActionPreference = 'Stop'
$backend = 'C:\Users\usuario\software_SurtiTelas.Backend'
$frontend = 'C:\Users\usuario\software_SurtiTelas.Fronend'

Write-Host "=== SurtiTelas Deploy Readiness (Local/Staging) ===" -ForegroundColor Cyan
Write-Host ""

function Test-Command {
    param([string]$Name)
    Write-Host "→ $Name"
    try {
        if ($Name -match '^cd ') {
            Set-Location $Name.Replace('cd ', '')
            Write-Host "✅ PASS" -ForegroundColor Green
        } else {
            Invoke-Expression $Name
            Write-Host "✅ PASS" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ FAIL" -ForegroundColor Red
        throw
    }
    Write-Host ""
}

Write-Host "## Backend" -ForegroundColor Yellow
Set-Location $backend
Test-Command 'npm run typecheck'
Test-Command 'npm run lint'
Test-Command 'npm test --silent'
Test-Command 'npx playwright test --project=chromium --reporter=line'

Write-Host "## Frontend" -ForegroundColor Yellow
Set-Location $frontend
Test-Command 'npm run typecheck'
Test-Command 'npm run lint'

Write-Host "=== Deployment Checklist ===" -ForegroundColor Cyan
Write-Host "Backend typecheck: revisar errores nuevos"
Write-Host "Backend lint: revisar errores nuevos"
Write-Host "E2E: debe estar verde"
Write-Host "Frontend typecheck: debe estar verde"
Write-Host "Frontend lint: revisar errores nuevos"
Write-Host ""
Write-Host "✅ Checklist completado"
