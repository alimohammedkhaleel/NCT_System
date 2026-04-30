# API Testing Script
$baseUrl = "http://localhost:5000/api"

Write-Host "=== Testing NCTU ERP API Endpoints ===" -ForegroundColor Cyan

# 1. Test Login
Write-Host "`n1. Testing Admin Login..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}'
$token = $loginResponse.data.token
Write-Host "✅ Login successful" -ForegroundColor Green
Write-Host "Token: $($token.Substring(0,50))..." -ForegroundColor Gray

# 2. Test Get Specialties (Public)
Write-Host "`n2. Testing Get Specialties (Public)..." -ForegroundColor Yellow
try {
    $specialties = Invoke-RestMethod -Uri "$baseUrl/specialties" -Method Get -Headers @{Authorization="Bearer $token"}
    Write-Host "✅ Specialties: $($specialties.data.Count) found" -ForegroundColor Green
    $specialties.data | ForEach-Object { Write-Host "   - $($_.name_ar) ($($_.code))" -ForegroundColor Gray }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test Get Admin Specialties
Write-Host "`n3. Testing Get Admin Specialties..." -ForegroundColor Yellow
try {
    $adminSpecialties = Invoke-RestMethod -Uri "$baseUrl/admin/specialties" -Method Get -Headers @{Authorization="Bearer $token"}
    Write-Host "✅ Admin Specialties: $($adminSpecialties.data.Count) found" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Test Get Students
Write-Host "`n4. Testing Get Students..." -ForegroundColor Yellow
try {
    $students = Invoke-RestMethod -Uri "$baseUrl/admin/students" -Method Get -Headers @{Authorization="Bearer $token"}
    Write-Host "✅ Students: $($students.data.Count) found" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Test Get Academic Years
Write-Host "`n5. Testing Get Academic Years..." -ForegroundColor Yellow
try {
    $academicYears = Invoke-RestMethod -Uri "$baseUrl/admin/academic-years" -Method Get -Headers @{Authorization="Bearer $token"}
    Write-Host "✅ Academic Years: $($academicYears.data.Count) found" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Test Get Professors
Write-Host "`n6. Testing Get Professors..." -ForegroundColor Yellow
try {
    $professors = Invoke-RestMethod -Uri "$baseUrl/admin/professors" -Method Get -Headers @{Authorization="Bearer $token"}
    Write-Host "✅ Professors: $($professors.data.Count) found" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Test Get Courses
Write-Host "`n7. Testing Get Courses..." -ForegroundColor Yellow
try {
    $courses = Invoke-RestMethod -Uri "$baseUrl/admin/courses" -Method Get -Headers @{Authorization="Bearer $token"}
    Write-Host "✅ Courses: $($courses.data.Count) found" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Test Professor Login
Write-Host "`n8. Testing Professor Login..." -ForegroundColor Yellow
try {
    $profLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"professor","password":"professor123"}'
    $profToken = $profLogin.data.token
    Write-Host "✅ Professor login successful" -ForegroundColor Green
    
    # Test Professor Courses
    Write-Host "`n9. Testing Professor Courses..." -ForegroundColor Yellow
    $profCourses = Invoke-RestMethod -Uri "$baseUrl/grades/professor/courses" -Method Get -Headers @{Authorization="Bearer $profToken"}
    Write-Host "✅ Professor Courses: $($profCourses.data.Count) found" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 10. Test Accountant Login
Write-Host "`n10. Testing Accountant Login..." -ForegroundColor Yellow
try {
    $accLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"accountant","password":"accountant123"}'
    $accToken = $accLogin.data.token
    Write-Host "✅ Accountant login successful" -ForegroundColor Green
    
    # Test Accountant Summary
    Write-Host "`n11. Testing Accountant Summary..." -ForegroundColor Yellow
    $accSummary = Invoke-RestMethod -Uri "$baseUrl/accountant/summary" -Method Get -Headers @{Authorization="Bearer $accToken"}
    Write-Host "✅ Accountant Summary retrieved" -ForegroundColor Green
    Write-Host "   Total Invoiced: $($accSummary.data.total_invoiced)" -ForegroundColor Gray
    Write-Host "   Total Paid: $($accSummary.data.total_paid)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== API Testing Complete ===" -ForegroundColor Cyan
