# 🚀 أوامر الاختبار السريع - NCTU ERP

## 📌 معلومات الاتصال

```
Base URL: http://localhost:5000
```

---

## 🔐 بيانات تسجيل الدخول

### Admin
```
username: admin
password: admin123
```

### Professor
```
username: professor
password: professor123
```

### Student
```
student_code: (سيتم إنشاؤه)
national_id: (سيتم إنشاؤه)
```

### Accountant
```
username: accountant
password: accountant123
```

---

## 🧪 اختبارات cURL

### 1. تسجيل دخول المدير

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**احفظ التوكن من الاستجابة:**
```bash
export TOKEN="your_token_here"
```

### 2. إنشاء رابط تسجيل

```bash
curl -X POST http://localhost:5000/api/admin/registration-links \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "expires_at": "2026-12-31T23:59:59.000Z",
    "max_uses": 100
  }'
```

**احفظ التوكن من الاستجابة:**
```bash
export REG_TOKEN="registration_token_here"
```

### 3. تسجيل طالب جديد

```bash
curl -X POST http://localhost:5000/api/auth/register-link/$REG_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "أحمد محمد علي",
    "national_id": "30112011234567",
    "email": "ahmed.mohamed@student.nctu.edu",
    "phone": "+20-10-12345678",
    "specialty_id": 3,
    "birth_date": "2001-01-15",
    "gender": "male",
    "address": "القاهرة، مصر",
    "current_year": 1,
    "high_school_certificate": "ثانوية عامة",
    "high_school_grade": 85.5,
    "guardian_name": "محمد علي",
    "guardian_phone": "+20-10-98765432",
    "guardian_relation": "والد"
  }'
```

### 4. عرض طلبات التسجيل

```bash
curl -X GET http://localhost:5000/api/admin/registration-requests \
  -H "Authorization: Bearer $TOKEN"
```

**احفظ request_id من الاستجابة:**
```bash
export REQUEST_ID="request_id_here"
```

### 5. الموافقة على طلب التسجيل

```bash
curl -X POST http://localhost:5000/api/admin/registration-requests/$REQUEST_ID/approve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_code": "NCTU-26-002"
  }'
```

**احفظ student_code و national_id:**
```bash
export STUDENT_CODE="NCTU-26-002"
export STUDENT_NID="30112011234567"
```

### 6. تسجيل دخول الطالب

```bash
curl -X POST http://localhost:5000/api/auth/student-login \
  -H "Content-Type: application/json" \
  -d '{
    "student_code": "'$STUDENT_CODE'",
    "national_id": "'$STUDENT_NID'"
  }'
```

**احفظ التوكن:**
```bash
export STUDENT_TOKEN="student_token_here"
```

### 7. عرض بيانات الطالب

```bash
curl -X GET http://localhost:5000/api/student/data \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

### 8. تسجيل دخول الدكتور

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "professor",
    "password": "professor123"
  }'
```

**احفظ التوكن:**
```bash
export PROF_TOKEN="professor_token_here"
```

### 9. عرض لوحة تحكم الدكتور

```bash
curl -X GET http://localhost:5000/api/grades/professor/dashboard \
  -H "Authorization: Bearer $PROF_TOKEN"
```

### 10. عرض مقررات الدكتور

```bash
curl -X GET http://localhost:5000/api/grades/professor/courses \
  -H "Authorization: Bearer $PROF_TOKEN"
```

**احفظ course_id:**
```bash
export COURSE_ID="course_id_here"
```

### 11. عرض طلاب المقرر

```bash
curl -X GET "http://localhost:5000/api/grades/professor/students-by-course?course_id=$COURSE_ID" \
  -H "Authorization: Bearer $PROF_TOKEN"
```

### 12. تسجيل دخول المحاسب

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "accountant",
    "password": "accountant123"
  }'
```

**احفظ التوكن:**
```bash
export ACC_TOKEN="accountant_token_here"
```

### 13. عرض جميع الطلاب (المحاسب)

```bash
curl -X GET http://localhost:5000/api/accountant/students \
  -H "Authorization: Bearer $ACC_TOKEN"
```

**احفظ student_id:**
```bash
export STUDENT_ID="student_id_here"
```

### 14. إنشاء فاتورة

```bash
curl -X POST http://localhost:5000/api/accountant/invoices \
  -H "Authorization: Bearer $ACC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": '$STUDENT_ID',
    "amount": 12000.00,
    "description": "رسوم السنة الدراسية الأولى",
    "due_date": "2026-09-30"
  }'
```

### 15. تسجيل دفعة مالية

```bash
curl -X POST http://localhost:5000/api/accountant/payments \
  -H "Authorization: Bearer $ACC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": '$STUDENT_ID',
    "amount": 12000.00,
    "payment_method": "cash",
    "reference_number": "PAY-2026-001",
    "notes": "دفع كامل"
  }'
```

### 16. نقل الطلاب للسنة الجديدة

```bash
curl -X POST http://localhost:5000/api/admin/promote-year \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "from_year": 1,
    "to_year": 2,
    "specialty_id": 3,
    "academic_year_id": 2
  }'
```

---

## 🔄 سكريبت اختبار كامل

احفظ هذا في ملف `test_complete.sh`:

```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5000"

echo -e "${BLUE}=== NCTU ERP Complete Test ===${NC}\n"

# 1. Admin Login
echo -e "${GREEN}1. Admin Login...${NC}"
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.data.token')
echo "Token: $TOKEN"
echo ""

# 2. Create Registration Link
echo -e "${GREEN}2. Creating Registration Link...${NC}"
REG_RESPONSE=$(curl -s -X POST $BASE_URL/api/admin/registration-links \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"expires_at":"2026-12-31T23:59:59.000Z","max_uses":100}')
REG_TOKEN=$(echo $REG_RESPONSE | jq -r '.data.token')
echo "Registration Token: $REG_TOKEN"
echo ""

# 3. Register Student
echo -e "${GREEN}3. Registering New Student...${NC}"
STUDENT_REG=$(curl -s -X POST $BASE_URL/api/auth/register-link/$REG_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "full_name":"أحمد محمد علي",
    "national_id":"30112011234567",
    "email":"ahmed.mohamed@student.nctu.edu",
    "phone":"+20-10-12345678",
    "specialty_id":3,
    "birth_date":"2001-01-15",
    "gender":"male",
    "current_year":1
  }')
echo $STUDENT_REG | jq '.'
echo ""

# 4. Get Registration Requests
echo -e "${GREEN}4. Getting Registration Requests...${NC}"
REQUESTS=$(curl -s -X GET $BASE_URL/api/admin/registration-requests \
  -H "Authorization: Bearer $TOKEN")
REQUEST_ID=$(echo $REQUESTS | jq -r '.data[0].id')
echo "Request ID: $REQUEST_ID"
echo ""

# 5. Approve Registration
echo -e "${GREEN}5. Approving Registration...${NC}"
APPROVE_RESPONSE=$(curl -s -X POST $BASE_URL/api/admin/registration-requests/$REQUEST_ID/approve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"student_code":"NCTU-26-TEST"}')
STUDENT_CODE=$(echo $APPROVE_RESPONSE | jq -r '.data.student_code')
echo "Student Code: $STUDENT_CODE"
echo ""

# 6. Student Login
echo -e "${GREEN}6. Student Login...${NC}"
STUDENT_LOGIN=$(curl -s -X POST $BASE_URL/api/auth/student-login \
  -H "Content-Type: application/json" \
  -d "{\"student_code\":\"$STUDENT_CODE\",\"national_id\":\"30112011234567\"}")
STUDENT_TOKEN=$(echo $STUDENT_LOGIN | jq -r '.data.token')
echo "Student Token: $STUDENT_TOKEN"
echo ""

# 7. Get Student Data
echo -e "${GREEN}7. Getting Student Data...${NC}"
STUDENT_DATA=$(curl -s -X GET $BASE_URL/api/student/data \
  -H "Authorization: Bearer $STUDENT_TOKEN")
echo $STUDENT_DATA | jq '.'
echo ""

# 8. Professor Login
echo -e "${GREEN}8. Professor Login...${NC}"
PROF_LOGIN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"professor","password":"professor123"}')
PROF_TOKEN=$(echo $PROF_LOGIN | jq -r '.data.token')
echo "Professor Token: $PROF_TOKEN"
echo ""

# 9. Professor Dashboard
echo -e "${GREEN}9. Getting Professor Dashboard...${NC}"
PROF_DASHBOARD=$(curl -s -X GET $BASE_URL/api/grades/professor/dashboard \
  -H "Authorization: Bearer $PROF_TOKEN")
echo $PROF_DASHBOARD | jq '.'
echo ""

# 10. Accountant Login
echo -e "${GREEN}10. Accountant Login...${NC}"
ACC_LOGIN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"accountant","password":"accountant123"}')
ACC_TOKEN=$(echo $ACC_LOGIN | jq -r '.data.token')
echo "Accountant Token: $ACC_TOKEN"
echo ""

echo -e "${BLUE}=== Test Complete ===${NC}"
echo -e "${GREEN}✓ All tests passed successfully!${NC}"
```

**لتشغيل السكريبت:**

```bash
chmod +x test_complete.sh
./test_complete.sh
```

**ملاحظة:** يحتاج السكريبت إلى `jq` لمعالجة JSON:

```bash
# على Ubuntu/Debian
sudo apt-get install jq

# على macOS
brew install jq

# على Windows (Git Bash)
# قم بتحميل jq من https://stedolan.github.io/jq/download/
```

---

## 📊 اختبار PowerShell (Windows)

احفظ هذا في ملف `test_complete.ps1`:

```powershell
$BaseUrl = "http://localhost:5000"

Write-Host "=== NCTU ERP Complete Test ===" -ForegroundColor Blue
Write-Host ""

# 1. Admin Login
Write-Host "1. Admin Login..." -ForegroundColor Green
$adminBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

$adminResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $adminBody

$token = $adminResponse.data.token
Write-Host "Token: $token"
Write-Host ""

# 2. Create Registration Link
Write-Host "2. Creating Registration Link..." -ForegroundColor Green
$regBody = @{
    expires_at = "2026-12-31T23:59:59.000Z"
    max_uses = 100
} | ConvertTo-Json

$regResponse = Invoke-RestMethod -Uri "$BaseUrl/api/admin/registration-links" `
    -Method Post `
    -Headers @{Authorization = "Bearer $token"} `
    -ContentType "application/json" `
    -Body $regBody

$regToken = $regResponse.data.token
Write-Host "Registration Token: $regToken"
Write-Host ""

# 3. Register Student
Write-Host "3. Registering New Student..." -ForegroundColor Green
$studentBody = @{
    full_name = "أحمد محمد علي"
    national_id = "30112011234567"
    email = "ahmed.mohamed@student.nctu.edu"
    phone = "+20-10-12345678"
    specialty_id = 3
    birth_date = "2001-01-15"
    gender = "male"
    current_year = 1
} | ConvertTo-Json

$studentReg = Invoke-RestMethod -Uri "$BaseUrl/api/auth/register-link/$regToken" `
    -Method Post `
    -ContentType "application/json" `
    -Body $studentBody

Write-Host $studentReg
Write-Host ""

# 4. Get Registration Requests
Write-Host "4. Getting Registration Requests..." -ForegroundColor Green
$requests = Invoke-RestMethod -Uri "$BaseUrl/api/admin/registration-requests" `
    -Method Get `
    -Headers @{Authorization = "Bearer $token"}

$requestId = $requests.data[0].id
Write-Host "Request ID: $requestId"
Write-Host ""

# 5. Approve Registration
Write-Host "5. Approving Registration..." -ForegroundColor Green
$approveBody = @{
    student_code = "NCTU-26-TEST"
} | ConvertTo-Json

$approveResponse = Invoke-RestMethod -Uri "$BaseUrl/api/admin/registration-requests/$requestId/approve" `
    -Method Post `
    -Headers @{Authorization = "Bearer $token"} `
    -ContentType "application/json" `
    -Body $approveBody

$studentCode = $approveResponse.data.student_code
Write-Host "Student Code: $studentCode"
Write-Host ""

# 6. Student Login
Write-Host "6. Student Login..." -ForegroundColor Green
$studentLoginBody = @{
    student_code = $studentCode
    national_id = "30112011234567"
} | ConvertTo-Json

$studentLogin = Invoke-RestMethod -Uri "$BaseUrl/api/auth/student-login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $studentLoginBody

$studentToken = $studentLogin.data.token
Write-Host "Student Token: $studentToken"
Write-Host ""

# 7. Get Student Data
Write-Host "7. Getting Student Data..." -ForegroundColor Green
$studentData = Invoke-RestMethod -Uri "$BaseUrl/api/student/data" `
    -Method Get `
    -Headers @{Authorization = "Bearer $studentToken"}

Write-Host ($studentData | ConvertTo-Json -Depth 10)
Write-Host ""

# 8. Professor Login
Write-Host "8. Professor Login..." -ForegroundColor Green
$profBody = @{
    username = "professor"
    password = "professor123"
} | ConvertTo-Json

$profLogin = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $profBody

$profToken = $profLogin.data.token
Write-Host "Professor Token: $profToken"
Write-Host ""

# 9. Professor Dashboard
Write-Host "9. Getting Professor Dashboard..." -ForegroundColor Green
$profDashboard = Invoke-RestMethod -Uri "$BaseUrl/api/grades/professor/dashboard" `
    -Method Get `
    -Headers @{Authorization = "Bearer $profToken"}

Write-Host ($profDashboard | ConvertTo-Json -Depth 10)
Write-Host ""

# 10. Accountant Login
Write-Host "10. Accountant Login..." -ForegroundColor Green
$accBody = @{
    username = "accountant"
    password = "accountant123"
} | ConvertTo-Json

$accLogin = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $accBody

$accToken = $accLogin.data.token
Write-Host "Accountant Token: $accToken"
Write-Host ""

Write-Host "=== Test Complete ===" -ForegroundColor Blue
Write-Host "✓ All tests passed successfully!" -ForegroundColor Green
```

**لتشغيل السكريبت:**

```powershell
.\test_complete.ps1
```

---

## ✅ قائمة التحقق السريعة

```
□ السيرفر يعمل على http://localhost:5000
□ قاعدة البيانات تحتوي على البيانات الأولية
□ تسجيل دخول المدير يعمل
□ إنشاء رابط تسجيل يعمل
□ تسجيل طالب جديد يعمل
□ الموافقة على الطلب يعمل
□ تسجيل دخول الطالب يعمل
□ تسجيل دخول الدكتور يعمل
□ تسجيل دخول المحاسب يعمل
□ نقل الطلاب للسنة الجديدة يعمل
```

---

**تم إنشاء هذا الملف بواسطة Kiro AI**
