param(
    [string]$BindHost = "0.0.0.0",
    [int]$Port = 8000,
    [switch]$NoReload,
    [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$pythonCandidates = @(
    ".venv\\Scripts\\python.exe",
    "venv\\Scripts\\python.exe",
    "menv\\Scripts\\python.exe",
    "emenv\\Scripts\\python.exe"
)

$pythonExe = $null
foreach ($candidate in $pythonCandidates) {
    if (Test-Path $candidate) {
        $pythonExe = (Resolve-Path $candidate).Path
        break
    }
}

if (-not $pythonExe) {
    $pythonCmd = Get-Command python -ErrorAction SilentlyContinue
    if ($pythonCmd) {
        $pythonExe = $pythonCmd.Source
    }
}

if (-not $pythonExe) {
    throw "Python not found. Please install Python or create a virtual environment in backend/.venv"
}

Write-Host "Using Python: $pythonExe"

if ((-not $SkipInstall) -and (Test-Path "requirements.txt")) {
    Write-Host "Installing dependencies from requirements.txt ..."
    & $pythonExe -m pip install -r requirements.txt
}

$uvicornArgs = @("-m", "uvicorn", "app.main:app", "--host", $BindHost, "--port", $Port)
if (-not $NoReload) {
    $uvicornArgs += "--reload"
}

Write-Host "Starting FastAPI at http://$BindHost`:$Port"
& $pythonExe @uvicornArgs
