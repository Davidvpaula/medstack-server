$contact = Invoke-RestMethod -Uri "http://localhost:3000/contact" `
-Method POST `
-ContentType "application/json" `
-Headers @{
    Authorization = "Bearer $($login.data.accessToken)"
} `
-Body "{
    `"companyId`":`"$($login.data.company.id)`",
    `"name`":`"Cliente Teste`",
    `"phone`":`"11999999999`",
    `"email`":`"cliente@teste.com`"
}"