# Comprehensive Frontend & API Testing Script
# Tests all dashboards, forms, routing, and API endpoints

$baseUrl = "http://localhost:5000"
$frontendUrl = "http://localhost:5173"

Write-Host "=== NCTU ERP COMPREHENSIVE TEST SUITE ===" -ForegroundColor Cyan
Write-Host "Backend: $baseUrl" -ForegroundColor Yellow
Write-Host "Frontend: $frontendUrl" -ForegroundColor Yellow
Write-Host ""

# Test counters
$totalTests = 0
$passedTests = 0
$failedTests = 0
$issues = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Body = $null,
        [hashtable]$Headers = @{"Content-Type" = "application/json"},
        [int]$ExpectedStatus = 200
    )
    
    $script:totalTests++
    Write-Host "Testing: $Name" -NoNewline
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-WebRequest @params -UseBasicParsing
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host " ✓ PASS" -ForegroundColor Green
            $script:passedTests++
            return $response
        } else {
            Write-Host " ✗ FAIL (Status: $($response.StatusCode))" -ForegroundColor Red
            $script:failedTests++
            $script:issues += "$Name - Expected status $ExpectedStatus, got $($response.StatusCode)"
            return $null
        }
    } catch {
        Write-Host " ✗ FAIL" -ForegroundColor Red
        $script:failedTests++
        $script:issues += "$Name - $($_.Exception.Message)"
        return $null
    }
}

Write-Host "=== PHASE 1: AUTHENTICATION TESTS ===" -ForegroundColor Cyan
Write-Host ""

# Test Admin Login
$adminLogin = Test-Endpoint -Name "Admin Login" -Method POST -Url "$baseUrl/api/auth/login" `
    -Body @{username="admin"; password="admin123"}

# Test Professor Login
$profLogin = Test-Endpoint -Name "Professor Login" -Method POST -Url "$baseUrl/api/auth/login" `
    -Body @{username="professor"; password="professor123"}

# Test Accountant Login
$accLogin = Test-Endpoint -Name "Accountant Login" -Method POST -Url "$baseUrl/api/auth/login" `
    -Body @{username="accountant"; password="accountant123"}

# Test Student Login
$studentLogin = Test-Endpoint -Name "Student Login" -Method POST -Url "$baseUrl/api/auth/login" `
    -Body @{username="student1"; password="student123"}

# Test Invalid Login
Test-Endpoint -Name "Invalid Login (Should Fail)" -Method POST -Url "$baseUrl/api/auth/login" `
    -Body @{username="invalid"; password="wrong"} -ExpectedStatus 401

Write-Host ""
Write-Host "=== PHASE 2: ADMIN API TESTS ===" -ForegroundColor Cyan
Write-Host ""

if ($adminLogin) {
    $adminToken = ($adminLogin.Content | ConvertFrom-Json).token
    $adminHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $adminToken"
    }
    
    # Test Get All Users
    Test-Endpoint -Name "Get All Users" -Method GET -Url "$baseUrl/api/admin/users" -Headers $adminHeaders
    
    # Test Get All Professors
    Test-Endpoint -Name "Get All Professors" -Method GET -Url "$baseUrl/api/admin/professors" -Headers $adminHeaders
    
    # Test Get All Students
    Test-Endpoint -Name "Get All Students" -Method GET -Url "$baseUrl/api/admin/students" -Headers $adminHeaders
    
    # Test Get All Courses
    Test-Endpoint -Name "Get All Courses" -Method GET -Url "$baseUrl/api/admin/courses" -Headers $adminHeaders
    
    # Test Get All Departments
    Test-Endpoint -Name "Get All Departments" -Method GET -Url "$baseUrl/api/admin/departments" -Headers $adminHeaders
}

Write-Host ""
Write-Host "=== PHASE 3: PROFESSOR API TESTS ===" -ForegroundColor Cyan
Write-Host ""

if ($profLogin) {
    $profToken = ($profLogin.Content | ConvertFrom-Json).token
    $profHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $profToken"
    }
    
    # Test Get Professor Courses
    Test-Endpoint -Name "Get Professor Courses" -Method GET -Url "$baseUrl/api/professor/courses" -Headers $profHeaders
    
    # Test Get Professor Students
    Test-Endpoint -Name "Get Professor Students" -Method GET -Url "$baseUrl/api/professor/students" -Headers $profHeaders
}

Write-Host ""
Write-Host "=== PHASE 4: STUDENT API TESTS ===" -ForegroundColor Cyan
Write-Host ""

if ($studentLogin) {
    $studentToken = ($studentLogin.Content | ConvertFrom-Json).token
    $studentHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $studentToken"
    }
    
    # Test Get Student Courses
    Test-Endpoint -Name "Get Student Courses" -Method GET -Url "$baseUrl/api/student/courses" -Headers $studentHeaders
    
    # Test Get Student Grades
    Test-Endpoint -Name "Get Student Grades" -Method GET -Url "$baseUrl/api/student/grades" -Headers $studentHeaders
    
    # Test Get Student Payments
    Test-Endpoint -Name "Get Student Payments" -Method GET -Url "$baseUrl/api/student/payments" -Headers $studentHeaders
}

Write-Host ""
Write-Host "=== PHASE 5: ACCOUNTANT API TESTS ===" -ForegroundColor Cyan
Write-Host ""

if ($accLogin) {
    $accToken = ($accLogin.Content | ConvertFrom-Json).token
    $accHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $accToken"
    }
    
    # Test Get All Payments
    Test-Endpoint -Name "Get All Payments" -Method GET -Url "$baseUrl/api/accountant/payments" -Headers $accHeaders
    
    # Test Get Pending Payments
    Test-Endpoint -Name "Get Pending Payments" -Method GET -Url "$baseUrl/api/accountant/payments/pending" -Headers $accHeaders
}

Write-Host ""
Write-Host "=== PHASE 6: FRONTEND ACCESSIBILITY TESTS ===" -ForegroundColor Cyan
Write-Host ""

# Test Frontend Pages
Test-Endpoint -Name "Home Page" -Method GET -Url "$frontendUrl/"
Test-Endpoint -Name "Login Page" -Method GET -Url "$frontendUrl/login"

Write-Host ""
Write-Host "=== TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host "Pass Rate: $([math]::Round(($passedTests/$totalTests)*100, 2))%" -ForegroundColor Yellow

if ($issues.Count -gt 0) {
    Write-Host ""
    Write-Host "=== ISSUES FOUND ===" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "  - $issue" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== MANUAL TESTING REQUIRED ===" -ForegroundColor Yellow
Write-Host "Please manually test the following in browser:" -ForegroundColor White
Write-Host "  1. Admin Dashboard: $frontendUrl/admin" -ForegroundColor Cyan
Write-Host "  2. Professor Dashboard: $frontendUrl/grades" -ForegroundColor Cyan
Write-Host "  3. Accountant Dashboard: $frontendUrl/accountant" -ForegroundColor Cyan
Write-Host "  4. Student Portal: $frontendUrl/student" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check for:" -ForegroundColor White
Write-Host "  - Console errors (F12)" -ForegroundColor Gray
Write-Host "  - Visual issues with colors and layout" -ForegroundColor Gray
Write-Host "  - Form functionality" -ForegroundColor Gray
Write-Host "  - Navigation and routing" -ForegroundColor Gray
Write-Host "  - Data loading" -ForegroundColor Gray
