$baseUrl = "http://localhost:3000"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " MEDSTACK POSTGRES - TESTE MECANICO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$results = @()

function Add-Result {
    param (
        [string]$Name,
        [string]$Status,
        [string]$Message
    )

    $script:results += [PSCustomObject]@{
        Name = $Name
        Status = $Status
        Message = $Message
    }
}

function Test-Command {
    param (
        [string]$Name,
        [scriptblock]$Command
    )

    Write-Host "Testando: $Name" -ForegroundColor Yellow

    try {
        $output = & $Command

        Write-Host "OK: $Name" -ForegroundColor Green

        Add-Result $Name "OK" "Executado com sucesso"

        return $output
    } catch {
        Write-Host "ERRO: $Name" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor DarkRed

        Add-Result $Name "ERROR" $_.Exception.Message
    }

    Write-Host ""
}

function Test-Api {
    param (
        [string]$Name,
        [string]$Url
    )

    Write-Host "Testando API: $Name" -ForegroundColor Yellow

    try {
        $response = Invoke-RestMethod -Uri $Url -Method GET

        if ($response.success -eq $true) {
            Write-Host "OK: $Name" -ForegroundColor Green
            Add-Result $Name "OK" $response.message
        } else {
            Write-Host "FAIL: $Name" -ForegroundColor Red
            Add-Result $Name "FAIL" "success false"
        }
    } catch {
        Write-Host "ERRO: $Name" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor DarkRed
        Add-Result $Name "ERROR" $_.Exception.Message
    }

    Write-Host ""
}

Test-Command "Docker PS" {
    docker ps
}

Test-Command "Database Status" {
    node scripts/db-status.js
}

Test-Command "Database Migrate" {
    node scripts/db-migrate.js
}

Test-Command "Postgres Repositories" {
    node scripts/test-postgres-repositories.js
}

Test-Api "Server Health" "$baseUrl/health"

Test-Api "Database Health" "$baseUrl/health/database"

Test-Api "Database Dashboard" "$baseUrl/database/dashboard"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " RESULTADO FINAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$results | Format-Table -AutoSize

$ok = ($results | Where-Object { $_.Status -eq "OK" }).Count
$fail = ($results | Where-Object { $_.Status -ne "OK" }).Count
$total = $results.Count

Write-Host ""
Write-Host "Total: $total" -ForegroundColor White
Write-Host "OK: $ok" -ForegroundColor Green
Write-Host "Falhas: $fail" -ForegroundColor Red

if ($fail -eq 0) {
    Write-Host ""
    Write-Host "POSTGRES APROVADO NO TESTE MECANICO." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "POSTGRES POSSUI FALHAS. REVISAR ITENS COM ERROR/FAIL." -ForegroundColor Red
}