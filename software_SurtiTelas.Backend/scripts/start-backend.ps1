Set-Location -LiteralPath "C:\Users\usuario\surti_telas\software_SurtiTelas.Backend"
Start-Process -FilePath "npm" -ArgumentList "run","dev" -WindowStyle Hidden
$startTime = Get-Date
while ($true) {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET -UseBasicParsing -TimeoutSec 5
    if ($r.StatusCode -eq 200) {
      Write-Output "BACKEND_READY"
      break
    }
  } catch {
    if (((Get-Date) - $startTime).TotalSeconds -gt 120) {
      Write-Output "BACKEND_TIMEOUT"
      break
    }
  }
  Start-Sleep -Seconds 3
}
