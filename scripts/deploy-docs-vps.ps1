# Deploy this documentation repo to a VPS via Docker (build runs on the server).
# Requires: OpenSSH (ssh/scp), Git, SSH key auth to the server (do not put passwords here).
#
# Usage:
#   .\scripts\deploy-docs-vps.ps1 -Remote "root@31.97.165.122" -HostPort 80
#
# Install Docker on the VPS first if needed. For HTTPS in front, use Caddy/nginx + Let's Encrypt.

param(
  [Parameter(Mandatory = $true)]
  [string]$Remote,
  [string]$RemoteDir = "/opt/luxia-docs",
  [string]$ContainerName = "luxia-docs",
  [int]$HostPort = 80
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

Push-Location $repoRoot
$dirty = git status --porcelain
Pop-Location
if ($dirty) {
  Write-Warning "Hay cambios sin commit: git archive solo empaqueta HEAD. Haz commit antes de desplegar."
}

Write-Host "Creating archive from git (tracked files only)..." -ForegroundColor Cyan
$archive = Join-Path $env:TEMP "luxia-docs-deploy.tar"
if (Test-Path $archive) { Remove-Item $archive -Force }
Push-Location $repoRoot
try {
  git archive --format=tar HEAD -o $archive
  if ($LASTEXITCODE -ne 0) { throw "git archive failed" }
} finally {
  Pop-Location
}

Write-Host "Uploading to ${Remote}:${RemoteDir} ..." -ForegroundColor Cyan
ssh $Remote "mkdir -p $RemoteDir"
if ($LASTEXITCODE -ne 0) { throw "ssh failed. Configure SSH keys for $Remote" }

scp $archive "${Remote}:${RemoteDir}/deploy.tar"
if ($LASTEXITCODE -ne 0) { throw "scp failed" }

ssh $Remote "cd $RemoteDir && tar xf deploy.tar && rm -f deploy.tar"
if ($LASTEXITCODE -ne 0) { throw "extract on server failed" }

$bash = @"
set -e
cd $RemoteDir
if ! command -v docker >/dev/null 2>&1; then
  echo 'Docker is not installed. Install Docker on the VPS, then re-run.' >&2
  exit 1
fi
docker build -t luxia-docs:latest .
docker stop $ContainerName 2>/dev/null || true
docker rm $ContainerName 2>/dev/null || true
docker run -d --restart unless-stopped --name $ContainerName -p ${HostPort}:80 luxia-docs:latest
echo Container $ContainerName listening on host port ${HostPort}
"@

Write-Host "Building image and starting container on server..." -ForegroundColor Cyan
$bash | ssh $Remote "bash -s"
if ($LASTEXITCODE -ne 0) { throw "remote docker build/run failed" }

Remove-Item $archive -Force -ErrorAction SilentlyContinue
Write-Host "Done. Point brunomelano.com A record to this VPS; add TLS (Caddy/certbot) as needed." -ForegroundColor Green
