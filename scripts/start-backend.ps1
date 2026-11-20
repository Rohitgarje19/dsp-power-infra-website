# Starts the local backend with the settings in backend/.env.local
# (gitignored). Run from anywhere:  powershell -ExecutionPolicy Bypass -File scripts/start-backend.ps1
$ErrorActionPreference = 'Stop'

$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$envFile = Join-Path $repo 'backend\.env.local'

if (Test-Path $envFile) {
    foreach ($line in Get-Content $envFile) {
        $trimmed = $line.Trim()
        if (-not $trimmed -or $trimmed.StartsWith('#')) { continue }
        $eq = $trimmed.IndexOf('=')
        if ($eq -lt 1) { continue }
        $name = $trimmed.Substring(0, $eq).Trim()
        $value = $trimmed.Substring($eq + 1).Trim()
        [Environment]::SetEnvironmentVariable($name, $value, 'Process')
    }
    Write-Host "Loaded backend/.env.local"
} else {
    Write-Warning "backend/.env.local not found - email alerts will stay switched off."
}

Write-Host ("Mail relay: enabled={0} host={1} from={2}" -f $env:NOTIFY_ENABLED, $env:SMTP_HOST, $env:NOTIFY_FROM)

if (-not $env:JAVA_HOME) {
    $jdk = 'C:\Users\ganesh\tools\jdk-21.0.13+9'
    if (Test-Path $jdk) { $env:JAVA_HOME = $jdk }
}

$mvn = (Get-Command mvn.cmd -ErrorAction SilentlyContinue).Source
if (-not $mvn) { $mvn = 'C:\Program Files\apache-maven-3.9.9\bin\mvn.cmd' }

Push-Location (Join-Path $repo 'backend')
try {
    & $mvn spring-boot:run
} finally {
    Pop-Location
}
