param([switch]$CheckOnly)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$vendor = Join-Path $root 'vendor'
$metaUrl = 'https://dati-ustat.mur.gov.it/api/3/action/package_show?id=bed0c71e-9f86-4a0f-a266-963b6f7bbbd2'
$temp = Join-Path $vendor 'italy-refresh-download.tmp'
try {
  $metadata = Invoke-RestMethod -Uri $metaUrl -TimeoutSec 30
  if (-not $metadata.success) { throw 'The ministry catalogue did not return a successful response.' }
  $resource = @($metadata.result.resources | Where-Object { $_.name -match 'Offerta formativa 2010-2025' -and $_.format -eq 'CSV' })
  if ($resource.Count -ne 1 -or $resource[0].url -notmatch '^https://dati-ustat\.mur\.gov\.it/') { throw 'The expected official dataset could not be identified safely.' }
  Invoke-WebRequest -Uri $resource[0].url -OutFile $temp -TimeoutSec 120
  $all = @(Import-Csv -LiteralPath $temp -Delimiter ';' -Encoding 1252)
  $required = @('ANNO','Ateneo','Area','GruppoDisciplinare','TipoCorso','Corso','SedeCorso_Comune','ACCESSO','LINGUA')
  if ($all.Count -lt 1000) { throw 'The downloaded file is unexpectedly small; the existing catalogue is unchanged.' }
  foreach ($column in $required) { if ($column -notin $all[0].PSObject.Properties.Name) { throw "Missing required column: $column" } }
  $years = @($all | ForEach-Object { if ($_.ANNO -match '^\d{4}$') { [int]$_.ANNO } } | Sort-Object -Unique -Descending)
  if (-not $years.Count) { throw 'No valid academic years were found.' }
  $latest = $years[0]
  if ($latest -ne 2025) { throw "A new cohort ($latest) is available. The importer must be updated and reviewed before it replaces the 2025/26 snapshot." }
  $rows = @($all | Where-Object { $_.ANNO -eq '2025' })
  if ($rows.Count -lt 1000 -or @($rows | Where-Object { -not $_.Corso -or -not $_.Ateneo }).Count -gt 0) { throw 'The latest cohort failed completeness checks.' }
  Write-Output "Official source: $($resource[0].url)"
  Write-Output "Latest cohort: $latest; rows: $($rows.Count)."
  if ($CheckOnly) { Write-Output 'Check completed; existing data was not changed.'; return }
  $converted = $rows | Select-Object @{n='title';e={$_.Corso}},@{n='university';e={$_.Ateneo}},@{n='area';e={$_.Area}},@{n='subject';e={$_.GruppoDisciplinare}},@{n='level';e={$_.TipoCorso}},@{n='city';e={$_.SedeCorso_Comune}},@{n='language';e={$_.LINGUA}},@{n='admissionMode';e={$_.ACCESSO}},@{n='academicYear';e={'2025/26'}}
  $staged = Join-Path $vendor 'italy-2025.next.json'
  $converted | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath $staged -Encoding utf8
  $current = Join-Path $vendor 'italy-2025.json'
  $backup = Join-Path $vendor 'italy-2025.previous.json'
  Copy-Item -LiteralPath $current -Destination $backup -Force
  Copy-Item -LiteralPath $staged -Destination $current -Force
  Push-Location $root
  try {
    & node (Join-Path $vendor 'import-catalogue.cjs')
    if ($LASTEXITCODE -ne 0) { throw 'Database import failed.' }
  } catch {
    Copy-Item -LiteralPath $backup -Destination $current -Force
    throw
  } finally { Pop-Location }
  Write-Output 'Validated snapshot imported. The previous snapshot was retained for recovery.'
  Push-Location $root
  try { & node (Join-Path $vendor 'build-semantic-index.cjs'); if ($LASTEXITCODE -ne 0) { Write-Warning 'Semantic index update failed; keyword search remains available. Run node vendor/build-semantic-index.cjs to retry.' } } finally { Pop-Location }
} finally { if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Force } }

