Set-Location "$PSScriptRoot\frontend"
if (-not (Test-Path "node_modules") -or -not (Test-Path ".deps-installed") -or ((Get-Item "package-lock.json").LastWriteTime -gt (Get-Item ".deps-installed").LastWriteTime)) {
    npm.cmd install
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Set-Content ".deps-installed" (Get-Date).ToString("o")
}
npm.cmd run dev -- --host 127.0.0.1 --port 5173
