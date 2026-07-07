$baseUrl = "http://localhost:3000"

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host " MEDSTACK AI MONITOR - TESTE GERAL" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

$results = @()

function Test-Endpoint {
    param (
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [string]$Body = $null
    )

    Write-Host "Testando: $Name" -ForegroundColor Yellow

    try {
        if ($Method -eq "POST") {
            if ($Body) {
                $response = Invoke-RestMethod `
                    -Uri $Url `
                    -Method POST `
                    -ContentType "application/json" `
                    -Body $Body
            } else {
                $response = Invoke-RestMethod `
                    -Uri $Url `
                    -Method POST
            }
        } else {
            $response = Invoke-RestMethod `
                -Uri $Url `
                -Method GET
        }

        if ($response.success -eq $true) {
            Write-Host "OK: $Name" -ForegroundColor Green

            $script:results += [PSCustomObject]@{
                Name = $Name
                Method = $Method
                Url = $Url
                Status = "OK"
                Message = $response.message
            }
        } else {
            Write-Host "FAIL: $Name" -ForegroundColor Red

            $script:results += [PSCustomObject]@{
                Name = $Name
                Method = $Method
                Url = $Url
                Status = "FAIL"
                Message = "success false"
            }
        }
    } catch {
        Write-Host "ERROR: $Name" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor DarkRed

        $script:results += [PSCustomObject]@{
            Name = $Name
            Method = $Method
            Url = $Url
            Status = "ERROR"
            Message = $_.Exception.Message
        }
    }

    Write-Host ""
}

Test-Endpoint "AI Status" "GET" "$baseUrl/ai-monitor/status"

Test-Endpoint "Runtime Review" "GET" "$baseUrl/ai-monitor/runtime-review"
Test-Endpoint "Queue Review" "GET" "$baseUrl/ai-monitor/queue-review"
Test-Endpoint "Log Review" "GET" "$baseUrl/ai-monitor/log-review"
Test-Endpoint "Full Review" "GET" "$baseUrl/ai-monitor/full-review"

Test-Endpoint "Executive Report" "GET" "$baseUrl/ai-monitor/executive-report"
Test-Endpoint "Code Inventory" "GET" "$baseUrl/ai-monitor/code-inventory"
Test-Endpoint "Architecture Review" "GET" "$baseUrl/ai-monitor/architecture-review"
Test-Endpoint "Dependency Graph" "GET" "$baseUrl/ai-monitor/dependency-graph"
Test-Endpoint "Technical Debt" "GET" "$baseUrl/ai-monitor/technical-debt"
Test-Endpoint "Production Readiness" "GET" "$baseUrl/ai-monitor/production-readiness"
Test-Endpoint "API Map" "GET" "$baseUrl/ai-monitor/api-map"
Test-Endpoint "Lovable API Guide" "GET" "$baseUrl/ai-monitor/lovable-api-guide"

Test-Endpoint "Roadmap" "GET" "$baseUrl/ai-monitor/roadmap"
Test-Endpoint "Architecture Advisor" "GET" "$baseUrl/ai-monitor/architecture-advisor"

Test-Endpoint "Advisor Chat" "POST" "$baseUrl/ai-monitor/advisor-chat" '{
    "question": "Estamos prontos para a próxima fase?"
}'

Test-Endpoint "Advisor Prompt" "POST" "$baseUrl/ai-monitor/advisor-prompt" '{
    "question": "O que falta para produção?"
}'

Test-Endpoint "External AI Status" "GET" "$baseUrl/ai-monitor/external-ai/status"

Test-Endpoint "External AI Advisor" "POST" "$baseUrl/ai-monitor/external-ai/advisor" '{
    "question": "Teste external AI skeleton"
}'

Test-Endpoint "Continuous Snapshot" "POST" "$baseUrl/ai-monitor/continuous/snapshot"
Test-Endpoint "Continuous History" "GET" "$baseUrl/ai-monitor/continuous/history"

Test-Endpoint "Project Memory Seed" "POST" "$baseUrl/ai-monitor/project-memory/seed"
Test-Endpoint "Project Memory" "GET" "$baseUrl/ai-monitor/project-memory"

Test-Endpoint "Scanner Scan SRC" "POST" "$baseUrl/ai-monitor/scanner/scan-src"
Test-Endpoint "Scanner" "GET" "$baseUrl/ai-monitor/scanner"

Test-Endpoint "Module Health" "GET" "$baseUrl/ai-monitor/module-health"

Test-Endpoint "Security Scan" "GET" "$baseUrl/ai-monitor/security-scan"
Test-Endpoint "Security Routes" "GET" "$baseUrl/ai-monitor/security-routes"
Test-Endpoint "Security Config" "GET" "$baseUrl/ai-monitor/security-config"
Test-Endpoint "Security Report" "GET" "$baseUrl/ai-monitor/security-report"

Test-Endpoint "Performance Scan" "GET" "$baseUrl/ai-monitor/performance-scan"
Test-Endpoint "Performance Report" "GET" "$baseUrl/ai-monitor/performance-report"

Test-Endpoint "Refactoring Advisor" "GET" "$baseUrl/ai-monitor/refactoring-advisor"

Test-Endpoint "Release Advisor" "GET" "$baseUrl/ai-monitor/release-advisor"

Test-Endpoint "Final Overview" "GET" "$baseUrl/ai-monitor/final-overview"

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host " RESULTADO FINAL" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
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
    Write-Host "AI MONITOR APROVADO NO TESTE MECANICO GERAL." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "AI MONITOR POSSUI FALHAS. REVISAR ITENS COM ERROR/FAIL." -ForegroundColor Red
}