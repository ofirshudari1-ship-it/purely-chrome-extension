# Packages the extension into a single Purely-v<version>.zip in the project root,
# ready for "Load unpacked" or Chrome Web Store upload.

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $root "manifest.json"

if (-not (Test-Path $manifestPath)) {
    throw "manifest.json not found in: $root"
}

$manifest = Get-Content $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$version = $manifest.version
$outFile = Join-Path $root "Purely-v$version.zip"

# Remove any older/stale package(s) in the project root before building the new one.
Get-ChildItem -Path $root -Filter "Purely-v*.zip" -File | Remove-Item -Force

$include = @("manifest.json", "src", "assets")
$stagingDir = Join-Path $env:TEMP "purely-build-$version"
if (Test-Path $stagingDir) { Remove-Item $stagingDir -Recurse -Force }
New-Item -ItemType Directory -Path $stagingDir | Out-Null

foreach ($item in $include) {
    Copy-Item -Path (Join-Path $root $item) -Destination $stagingDir -Recurse
}

Compress-Archive -Path (Join-Path $stagingDir "*") -DestinationPath $outFile -CompressionLevel Optimal
Remove-Item $stagingDir -Recurse -Force

Write-Host "Created: $outFile"
