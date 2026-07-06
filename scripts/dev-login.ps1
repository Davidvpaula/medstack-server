Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "        MEDSTACK DEV LOGIN" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "Registrando empresa + owner..." -ForegroundColor Yellow

    $registerBody = @{
        companyName = "Empresa Dev"
        name = "David Admin"
        email = "david@teste.com"
        password = "12345678"
        plan = "starter"
    } | ConvertTo-Json

    $Global:login = Invoke-RestMethod `
        -Uri "http://localhost:3000/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody

    if (-not $login.data.accessToken) {
        throw "AccessToken não foi gerado."
    }

    Write-Host ""
    Write-Host "LOGIN REALIZADO COM SUCESSO" -ForegroundColor Green
    Write-Host ""

    Write-Host "Company ID:" -ForegroundColor Cyan
    Write-Host $login.data.company.id

    Write-Host ""
    Write-Host "User ID:" -ForegroundColor Cyan
    Write-Host $login.data.user.id

    Write-Host ""
    Write-Host "Token OK." -ForegroundColor Green
}
catch {
    Write-Host ""
    Write-Host "ERRO NO DEV LOGIN:" -ForegroundColor Red
    Write-Host $_ -ForegroundColor Red
}