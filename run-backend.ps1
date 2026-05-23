Set-Location "$PSScriptRoot\backend"
if (-not (Test-Path ".deps-installed") -or ((Get-Item "requirements.txt").LastWriteTime -gt (Get-Item ".deps-installed").LastWriteTime)) {
    python -m pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Set-Content ".deps-installed" (Get-Date).ToString("o")
}
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
