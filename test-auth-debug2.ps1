# Debug Authentication Test
$baseUrl = "http://localhost:5000"

Write-Host "=== AUTHENTICATION DEBUG TEST ===" -ForegroundColor Cyan
Write-Host ""

# Test Admin Login
Write-Host "Testing Admin Login..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body '{"username":"admin","password":"admin123"}' `
    -UseBasicParsing

$data = $response.Content | ConvertFrom-Json
Write-Host "Login successful!" -ForegroundColor Green
Write-Host "User: $($data.user.username) | Role: $($data.user.role)" -ForegroundColor Gray
Write-Host ""

# Test with token
Write-Host "Testing Get All Users with token..." -ForegroundColor Yellow
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $($data.token)"
}

$usersResponse = Invoke-WebRequest -Uri "$baseUrl/api/admin/users" -Method GET `
    -Headers $headers -UseBasicParsing

Write-Host "Get Users successful!" -ForegroundColor Green
$users = $usersResponse.Content | ConvertFrom-Json
Write-Host "Found $($users.data.Count) users" -ForegroundColor Gray
