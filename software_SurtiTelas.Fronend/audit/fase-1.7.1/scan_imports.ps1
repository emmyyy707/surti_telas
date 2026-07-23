param()
$ErrorActionPreference = 'SilentlyContinue'
$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root 'C:\Users\usuario\OneDrive\Imágenes\Escritorio\software_SurtiTelas--develop\src'
$out = Join-Path $PSScriptRoot 'imports_scan.csv'
$files = Get-ChildItem -Path $src -Recurse -File -Include *.ts,*.tsx
$rows = @()
foreach($f in $files) {
  $rel = $f.FullName.Replace(($src + '\'),'')
  $content = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
  $inMatches = [regex]::Matches($content, "(?:import\s+.*\s+from\s+['""`""\)]+([^'""`""\)]+)(?:['""`""\)]+)") )
  $incoming = @(); $outgoing = @(); $lazy = @()
  foreach($m in $inMatches) {
    $imp = $m.Groups[1].Value
    if($imp -match '^(\./|\.\./)') { $outgoing += $imp } else { $incoming += $imp }
  }
  $lazyMatches = [regex]::Matches($content, "lazy\s*\(\s*\(\s*\)\s*=>\s*import\s*\(\s*['""`""\)]+([^'""`""\)]+)['""`""\)]\s*\)")
  foreach($m in $lazyMatches) { $lazy += $m.Groups[1].Value }
  $rows += [PSCustomObject]@{
    Archivo = $rel
    Existe = 'SI'
    ImportsEntrantes = ($incoming -join ';')
    ImportsSalientes = ($outgoing -join ';')
    ImportDinamico = ($lazy -join ';')
  }
}
$rows | Export-Csv -Path $out -NoTypeInformation -Encoding UTF8
Write-Output "Scanned $($files.Count) files -> $out"
