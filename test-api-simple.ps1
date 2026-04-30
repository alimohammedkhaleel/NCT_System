# Simple API Testing Script
$baseUrl = "http://localhost:5000"

Write-Host "=== NCTU ERP API TEST SUITE ===" -ForegroundColor Cyan
Write-Host ""

$totalTests = 0
$passedTests = 0
$failedTests = 0

function Test-API {
    param([string]$Name, [string]$Method, [string]$Url, [hashtable]$Body = $null, [hashtable]$Headers = @{"Content-Type" = "application/json"}, [int]$ExpectedStatus = 200)
    
    $script:totalTests++
    Write-Host "Testing: $Name" -NoNewline
    
    try {
        $params = @{Uri = $Url; Method = $Method; Headers = $Headers; TimeoutSec = 10}
        if ($Body) { $params.Body = ($Body | ConvertTo-Json) }
        
        $response = Invoke-WebRequest @params -UseBasicParsing
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host " [PASS]" -ForegroundColor Green
            $script:passedTests++
            return $response
        } else {
            Write-Host " [FAIL] Status: $($response.StatusCode)" -ForegroundColor Red
            $script:failedTests++
            return $null
        }
    } catch {
        Write-Host " [FAIL] $($_.Exception.Message)" -ForegroundColor Red
        $script:failedTests++
        return $null
    }
}

Write-Host "=== AUTHENTICATION TESTS ===" -ForegroundColor Cyan
$adminLogin = Test-API -Name "Admin Login" -Method POST -Url "$baseUrl/api/auth/login" -Body @{username="admin"; password="admin123"}
$profLogin = Test-API -Name "Professor Login" -Method POST -Url "$baseUrl/api/auth/login" -Body @{username="professor"; password="professor123"}
$accLogin = Test-API -Name "Accountant Login" -Method POST -Url "$baseUrl/api/auth/login" -Body @{username="accountant"; password="accountant123"}
$studentLogin = Test-API -Name "Student Login" -Method POST -Url "$baseUrl/api/auth/login" -Body @{username="student1"; password="student123"}
Test-API -Name "Invalid Login" -Method POST -Url "$baseUrl/api/auth/login" -Body @{username="invalid"; password="wrong"} -ExpectedStatus 401

Write-Host ""
Write-Host "=== ADMIN API TESTS ===" -ForegroundColor Cyan
if ($adminLogin) {
    $adminData = ($adminLogin.Content | ConvertFrom-Json).data
    $adminHeaders = @{"Content-Type" = "application/json"; "Authorization" = "Bearer $($adminData.token)"}
    
    Test-API -Name "Get All Users" -Method GET -Url "$baseUrl/api/admin/users" -Headers $adminHeaders
    Test-API -Name "Get All Professors" -Method GET -Url "$baseUrl/api/admin/professors" -Headers $adminHeaders
    Test-API -Name "Get All Students" -Method GET -Url "$baseUrl/api/admin/students" -Headers $adminHeaders
    Test-API -Name "Get All Courses" -Method GET -Url "$baseUrl/api/admin/courses" -Headers $adminHeaders
    Test-API -Name "Get All Specialties" -Method GET -Url "$baseUrl/api/admin/specialties" -Headers $adminHeaders
}

Write-Host ""
Write-Host "=== PROFESSOR API TESTS ===" -ForegroundColor Cyan
if ($profLogin) {
    $profData = ($profLogin.Content | ConvertFrom-Json).data
    $profHeaders = @{"Content-Type" = "application/json"; "Authorization" = "Bearer $($profData.token)"}
    
    Test-API -Name "Get Professor Dashboard" -Method GET -Url "$baseUrl/api/grades/professor/dashboard" -Headers $profHeaders
    Test-API -Name "Get Professor Courses" -Method GET -Url "$baseUrl/api/grades/professor/courses" -Headers $profHeaders
    Test-API -Name "Get Professor Students" -Method GET -Url "$baseUrl/api/grades/professor/students" -Headers $profHeaders
}

Write-Host ""
Write-Host "=== STUDENT API TESTS ===" -ForegroundColor Cyan
if ($studentLogin) {
    $studentData = ($studentLogin.Content | ConvertFrom-Json).data
    $studentHeaders = @{"Content-Type" = "application/json"; "Authorization" = "Bearer $($studentData.token)"}
    
    Test-API -Name "Get Student Dashboard" -Method GET -Url "$baseUrl/api/grades/student/dashboard" -Headers $studentHeaders
    Test-API -Name "Get Student Grades" -Method GET -Url "$baseUrl/api/grades/student/grades" -Headers $studentHeaders
    Test-API -Name "Get Student Invoices" -Method GET -Url "$baseUrl/api/grades/student/invoices" -Headers $studentHeaders
    Test-API -Name "Get Student Payment Status" -Method GET -Url "$baseUrl/api/grades/student/payment-status" -Headers $studentHeaders
}

Write-Host ""
Write-Host "=== ACCOUNTANT API TESTS ===" -ForegroundColor Cyan
if ($accLogin) {
    $accData = ($accLogin.Content | ConvertFrom-Json).data
    $accHeaders = @{"Content-Type" = "application/json"; "Authorization" = "Bearer $($accData.token)"}
    
    Test-API -Name "Get Accountant Summary" -Method GET -Url "$baseUrl/api/accountant/summary" -Headers $accHeaders
    Test-API -Name "Get Specialty Fees" -Method GET -Url "$baseUrl/api/accountant/specialty-fees" -Headers $accHeaders
}

Write-Host ""
Write-Host "=== TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total: $totalTests | Passed: $passedTests | Failed: $failedTests" -ForegroundColor White
Write-Host "Pass Rate: $([math]::Round(($passedTests/$totalTests)*100, 2))%" -ForegroundColor Yellow
Write-Host ""
