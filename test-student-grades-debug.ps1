# Debug Student Grades Endpoint
$baseUrl = "http://localhost:5000"

Write-Host "=== STUDENT GRADES DEBUG TEST ===" -ForegroundColor Cyan
Write-Host ""

# Login as student
Write-Host "Logging in as student..." -ForegroundColor Yellow
$loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body '{"username":"student1","password":"student123"}' `
    -UseBasicParsing

$loginData = ($loginResponse.Content | ConvertFrom-Json).data
Write-Host "Login successful! Student: $($loginData.user.full_name)" -ForegroundColor Green
Write-Host ""

# Try to get grades
Write-Host "Fetching student grades..." -ForegroundColor Yellow
try {
    $gradesResponse = Invoke-WebRequest -Uri "$baseUrl/api/grades/student/grades" -Method GET `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $($loginData.token)"
        } -UseBasicParsing
    
    Write-Host "Success!" -ForegroundColor Green
    $gradesData = $gradesResponse.Content | ConvertFrom-Json
    Write-Host "Grades: $($gradesData.data.Count) found" -ForegroundColor Gray
    Write-Host "GPA: $($gradesData.gpa)" -ForegroundColor Gray
} catch {
    Write-Host "Failed!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to get error response body
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errorBody = $reader.ReadToEnd()
    Write-Host "Response Body: $errorBody" -ForegroundColor Yellow
}
