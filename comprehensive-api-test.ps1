# Comprehensive API Testing Script for NCTU ERP
$baseUrl = "http://localhost:5000/api"
$testResults = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Add('ContentType', 'application/json')
            $params.Add('Body', $Body)
        }
        
        $response = Invoke-RestMethod @params
        $testResults += [PSCustomObject]@{
            Test = $Name
            Status = "✅ PASS"
            Code = 200
            Message = "Success"
        }
        Write-Host "✅ $Name - PASSED" -ForegroundColor Green
        return $response
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $testResults += [PSCustomObject]@{
            Test = $Name
            Status = "❌ FAIL"
            Code = $statusCode
            Message = $_.Exception.Message
        }
        Write-Host "❌ $Name - FAILED ($statusCode)" -ForegroundColor Red
        return $null
    }
}

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     NCTU ERP - Comprehensive API Testing Suite            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ============================================================================
# 1. AUTHENTICATION TESTS
# ============================================================================
Write-Host "`n[1] AUTHENTICATION TESTS" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray

$adminLogin = Test-Endpoint -Name "Admin Login" -Method Post -Url "$baseUrl/auth/login" -Body '{"username":"admin","password":"admin123"}'
$adminToken = $adminLogin.data.token

$profLogin = Test-Endpoint -Name "Professor Login" -Method Post -Url "$baseUrl/auth/login" -Body '{"username":"professor","password":"professor123"}'
$profToken = $profLogin.data.token

$accLogin = Test-Endpoint -Name "Accountant Login" -Method Post -Url "$baseUrl/auth/login" -Body '{"username":"accountant","password":"accountant123"}'
$accToken = $accLogin.data.token

$studentLogin = Test-Endpoint -Name "Student Login" -Method Post -Url "$baseUrl/auth/login" -Body '{"username":"student1","password":"student123"}'
$studentToken = $studentLogin.data.token

# ============================================================================
# 2. SPECIALTIES TESTS
# ============================================================================
Write-Host "`n[2] SPECIALTIES TESTS" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray

$specialties = Test-Endpoint -Name "Get Public Specialties" -Method Get -Url "$baseUrl/specialties" -Headers @{Authorization="Bearer $adminToken"}
$specialtyId = if ($specialties) { $specialties.data[0].id } else { 1 }

$adminSpecialties = Test-Endpoint -Name "Get Admin Specialties" -Method Get -Url "$baseUrl/admin/specialties" -Headers @{Authorization="Bearer $adminToken"}

# ============================================================================
# 3. STUDENTS TESTS
# ============================================================================
Write-Host "`n[3] STUDENTS TESTS" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray

$students = Test-Endpoint -Name "Get All Students" -Method Get -Url "$baseUrl/admin/students" -Headers @{Authorization="Bearer $adminToken"}
$studentId = if ($students -and $students.data.Count -gt 0) { $students.data[0].id } else { 1 }

Test-Endpoint -Name "Search Students" -Method Get -Url "$baseUrl/admin/students?search=student" -Headers @{Authorization="Bearer $adminToken"}

# ============================================================================
# 4. PROFESSORS TESTS
# ============================================================================
Write-Host "`n[4] PROFESSORS TESTS" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray

$professors = Test-Endpoint -Name "Get All Professors" -Method Get -Url "$baseUrl/admin/professors" -Headers @{Authorization="Bearer $adminToken"}

$profCourses = Test-Endpoint -Name "Get Professor Courses" -Method Get -Url "$baseUrl/grades/professor/courses" -Headers @{Authorization="Bearer $profToken"}

# ============================================================================
# 5. COURSES TESTS
# ============================================================================
Write-Host "`n[5] COURSES TESTS" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray

$courses = Test-Endpoint -Name "Get All Courses" -Method Get -Url "$baseUrl/admin/courses" -Headers @{Authorization="Bearer $adminToken"}
$courseId = if ($courses -and $courses.data.Count -gt 0) { $courses.data[0].id } else { 1 }

# ============================================================================
# 6. ACADEMIC YEARS TESTS
# ============================================================================
Write-Host "`n[6] ACADEMIC YEARS TESTS" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray

$academicYears = Test-Endpoint -Name "Get Academic Years" -Method Get -Url "$baseUrl/admin/academic-years" -Headers @{Authorization="Bearer $adminToken"}

# ============================================================================
# 7. ACCOUNTANT TESTS
# ============================================================================
Write-Host "`n[7] ACCOUNTANT TESTS" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray

$accSummary = Test-Endpoint -Name "Get Accountant Summary" -Method Get -Url "$baseUrl/accountant/summary" -Headers @{Authorization="Bearer $accToken"}

Test-Endpoint -Name "Get Student Invoices" -Method Get -Url "$baseUrl/accountant/students/$studentId/invoices" -Headers @{Authorization="Bearer $accToken"}

# ============================================================================
# 8. STUDENT PORTAL TESTS
# ============================================================================
Write-Host "`n[8] STUDENT PORTAL TESTS" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray

$studentDashboard = Test-Endpoint -Name "Get Student Dashboard" -Method Get -Url "$baseUrl/grades/student/dashboard" -Headers @{Authorization="Bearer $studentToken"}

$studentGrades = Test-Endpoint -Name "Get Student Grades" -Method Get -Url "$baseUrl/grades/student/grades" -Headers @{Authorization="Bearer $studentToken"}

$studentInvoices = Test-Endpoint -Name "Get Student Invoices" -Method Get -Url "$baseUrl/grades/student/invoices" -Headers @{Authorization="Bearer $studentToken"}

# ============================================================================
# 9. TIMETABLE TESTS
# ============================================================================
Write-Host "`n[9] TIMETABLE TESTS" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray

Test-Endpoint -Name "Get Student Timetable" -Method Get -Url "$baseUrl/timetables/student" -Headers @{Authorization="Bearer $studentToken"}

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    TEST RESULTS SUMMARY                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Status -eq "✅ PASS" }).Count
$failedTests = ($testResults | Where-Object { $_.Status -eq "❌ FAIL" }).Count
$passRate = [math]::Round(($passedTests / $totalTests) * 100, 2)

Write-Host "Total Tests:   $totalTests" -ForegroundColor White
Write-Host "Passed:        $passedTests" -ForegroundColor Green
Write-Host "Failed:        $failedTests" -ForegroundColor Red
Write-Host "Pass Rate:     $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 60) { "Yellow" } else { "Red" })

Write-Host "`n─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "Detailed Results:" -ForegroundColor White
$testResults | Format-Table -AutoSize

# Save results to file
$testResults | Export-Csv -Path "test-results.csv" -NoTypeInformation
Write-Host "`n✅ Results saved to test-results.csv" -ForegroundColor Green

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    TESTING COMPLETE                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
