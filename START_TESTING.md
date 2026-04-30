# 🚀 ابدأ الاختبار الآن - NCTU ERP

## ⚡ البدء السريع (دقيقتان)

### 1. تشغيل السيرفر

```bash
cd server
npm start
```

**ملاحظة:** السيرفر سيقوم تلقائياً بإنشاء البيانات الأولية عند أول تشغيل.

### 2. تأكد من عمل السيرفر

افتح المتصفح على: `http://localhost:5000`

يجب أن ترى رسالة: "NCTU ERP API is running"

---

## 🔐 بيانات تسجيل الدخول الجاهزة

### للاختبار الفوري - انسخ والصق:

#### 👤 Admin (المدير)
```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### 👨‍🏫 Professor (الدكتور)
```json
{
  "username": "professor",
  "password": "professor123"
}
```

#### 👨‍🎓 Student (الطالب)
```json
{
  "student_code": "NCTU-26-001",
  "national_id": "30001011234567"
}
```
أو باستخدام username/password:
```json
{
  "username": "student1",
  "password": "student123"
}
```

#### 💰 Accountant (المحاسب)
```json
{
  "username": "accountant",
  "password": "accountant123"
}
```

---

## 🧪 اختبار سريع (30 ثانية)

### اختبار 1: تسجيل دخول المدير

**في Postman أو أي REST Client:**

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**أو باستخدام cURL:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "full_name": "Admin User"
    }
  }
}
```

✅ **إذا حصلت على هذه الاستجابة، النظام يعمل بشكل صحيح!**

---

## 📋 اختبارات إضافية

### اختبار 2: تسجيل دخول الدكتور

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"professor","password":"professor123"}'
```

### اختبار 3: تسجيل دخول الطالب

```bash
curl -X POST http://localhost:5000/api/auth/student-login \
  -H "Content-Type: application/json" \
  -d '{"student_code":"NCTU-26-001","national_id":"30001011234567"}'
```

### اختبار 4: تسجيل دخول المحاسب

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"accountant","password":"accountant123"}'
```

---

## 🎯 الاختبارات الرئيسية

### ✅ اختبار نقل الطلاب للسنة الجديدة

#### الخطوة 1: تسجيل دخول المدير واحفظ التوكن

```bash
# Linux/Mac
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.data.token')

echo "Token: $TOKEN"
```

```powershell
# Windows PowerShell
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin123"}'

$token = $response.data.token
Write-Host "Token: $token"
```

#### الخطوة 2: عرض السنوات الدراسية

```bash
# Linux/Mac
curl -X GET http://localhost:5000/api/admin/academic-years \
  -H "Authorization: Bearer $TOKEN"
```

```powershell
# Windows PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/academic-years" `
  -Method Get `
  -Headers @{Authorization = "Bearer $token"}
```

#### الخطوة 3: نقل الطلاب من السنة 1 إلى السنة 2

```bash
# Linux/Mac
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

```powershell
# Windows PowerShell
$promoteBody = @{
    from_year = 1
    to_year = 2
    specialty_id = 3
    academic_year_id = 2
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/admin/promote-year" `
  -Method Post `
  -Headers @{Authorization = "Bearer $token"} `
  -ContentType "application/json" `
  -Body $promoteBody
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "تم نقل الطلاب بنجاح",
  "data": {
    "promoted_count": 5,
    "failed_count": 0
  }
}
```

---

### ✅ اختبار لوحة تحكم الدكتور

#### الخطوة 1: تسجيل دخول الدكتور

```bash
# Linux/Mac
PROF_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"professor","password":"professor123"}' \
  | jq -r '.data.token')
```

```powershell
# Windows PowerShell
$profResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"username":"professor","password":"professor123"}'

$profToken = $profResponse.data.token
```

#### الخطوة 2: عرض لوحة التحكم

```bash
# Linux/Mac
curl -X GET http://localhost:5000/api/grades/professor/dashboard \
  -H "Authorization: Bearer $PROF_TOKEN"
```

```powershell
# Windows PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/grades/professor/dashboard" `
  -Method Get `
  -Headers @{Authorization = "Bearer $profToken"}
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "data": {
    "total_courses": 12,
    "total_students": 150,
    "pending_grades": 20,
    "submitted_grades": 130,
    "courses": [...]
  }
}
```

#### الخطوة 3: عرض المقررات المسندة

```bash
# Linux/Mac
curl -X GET http://localhost:5000/api/grades/professor/courses \
  -H "Authorization: Bearer $PROF_TOKEN"
```

```powershell
# Windows PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/grades/professor/courses" `
  -Method Get `
  -Headers @{Authorization = "Bearer $profToken"}
```

---

### ✅ اختبار لوحة تحكم المحاسب

#### الخطوة 1: تسجيل دخول المحاسب

```bash
# Linux/Mac
ACC_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"accountant","password":"accountant123"}' \
  | jq -r '.data.token')
```

```powershell
# Windows PowerShell
$accResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"username":"accountant","password":"accountant123"}'

$accToken = $accResponse.data.token
```

#### الخطوة 2: عرض جميع الطلاب

```bash
# Linux/Mac
curl -X GET http://localhost:5000/api/accountant/students \
  -H "Authorization: Bearer $ACC_TOKEN"
```

```powershell
# Windows PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/accountant/students" `
  -Method Get `
  -Headers @{Authorization = "Bearer $accToken"}
```

---

### ✅ اختبار لوحة تحكم الطالب

#### الخطوة 1: تسجيل دخول الطالب

```bash
# Linux/Mac
STUDENT_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/student-login \
  -H "Content-Type: application/json" \
  -d '{"student_code":"NCTU-26-001","national_id":"30001011234567"}' \
  | jq -r '.data.token')
```

```powershell
# Windows PowerShell
$studentResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/student-login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"student_code":"NCTU-26-001","national_id":"30001011234567"}'

$studentToken = $studentResponse.data.token
```

#### الخطوة 2: عرض بيانات الطالب

```bash
# Linux/Mac
curl -X GET http://localhost:5000/api/student/data \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

```powershell
# Windows PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/student/data" `
  -Method Get `
  -Headers @{Authorization = "Bearer $studentToken"}
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "data": {
    "payment_status": "unpaid",
    "total_invoiced": 12000.00,
    "total_paid": 0.00,
    "total_due": 12000.00,
    "result_status": "not_published",
    "grades_count": 0,
    "last_updated": "2026-04-24T15:30:00.000Z"
  }
}
```

---

## 📊 سكريبت اختبار كامل

### Linux/Mac - احفظ في `test_all.sh`

```bash
#!/bin/bash

echo "=== NCTU ERP Complete Test ==="
echo ""

BASE_URL="http://localhost:5000"

# 1. Admin Login
echo "1. Testing Admin Login..."
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

if echo "$ADMIN_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Admin login successful"
    TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.data.token')
else
    echo "❌ Admin login failed"
    exit 1
fi
echo ""

# 2. Professor Login
echo "2. Testing Professor Login..."
PROF_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"professor","password":"professor123"}')

if echo "$PROF_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Professor login successful"
    PROF_TOKEN=$(echo $PROF_RESPONSE | jq -r '.data.token')
else
    echo "❌ Professor login failed"
fi
echo ""

# 3. Student Login
echo "3. Testing Student Login..."
STUDENT_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/student-login \
  -H "Content-Type: application/json" \
  -d '{"student_code":"NCTU-26-001","national_id":"30001011234567"}')

if echo "$STUDENT_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Student login successful"
    STUDENT_TOKEN=$(echo $STUDENT_RESPONSE | jq -r '.data.token')
else
    echo "❌ Student login failed"
fi
echo ""

# 4. Accountant Login
echo "4. Testing Accountant Login..."
ACC_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"accountant","password":"accountant123"}')

if echo "$ACC_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Accountant login successful"
    ACC_TOKEN=$(echo $ACC_RESPONSE | jq -r '.data.token')
else
    echo "❌ Accountant login failed"
fi
echo ""

# 5. Professor Dashboard
echo "5. Testing Professor Dashboard..."
PROF_DASH=$(curl -s -X GET $BASE_URL/api/grades/professor/dashboard \
  -H "Authorization: Bearer $PROF_TOKEN")

if echo "$PROF_DASH" | grep -q '"success":true'; then
    echo "✅ Professor dashboard loaded"
else
    echo "❌ Professor dashboard failed"
fi
echo ""

# 6. Student Data
echo "6. Testing Student Data..."
STUDENT_DATA=$(curl -s -X GET $BASE_URL/api/student/data \
  -H "Authorization: Bearer $STUDENT_TOKEN")

if echo "$STUDENT_DATA" | grep -q '"success":true'; then
    echo "✅ Student data loaded"
else
    echo "❌ Student data failed"
fi
echo ""

# 7. Accountant Students
echo "7. Testing Accountant Students List..."
ACC_STUDENTS=$(curl -s -X GET $BASE_URL/api/accountant/students \
  -H "Authorization: Bearer $ACC_TOKEN")

if echo "$ACC_STUDENTS" | grep -q '"success":true'; then
    echo "✅ Accountant students list loaded"
else
    echo "❌ Accountant students list failed"
fi
echo ""

echo "=== Test Complete ==="
echo "✅ All tests passed successfully!"
```

**لتشغيل السكريبت:**

```bash
chmod +x test_all.sh
./test_all.sh
```

---

### Windows PowerShell - احفظ في `test_all.ps1`

```powershell
Write-Host "=== NCTU ERP Complete Test ===" -ForegroundColor Blue
Write-Host ""

$BaseUrl = "http://localhost:5000"

# 1. Admin Login
Write-Host "1. Testing Admin Login..." -ForegroundColor Cyan
try {
    $adminResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body '{"username":"admin","password":"admin123"}'
    
    if ($adminResponse.success) {
        Write-Host "✅ Admin login successful" -ForegroundColor Green
        $token = $adminResponse.data.token
    }
} catch {
    Write-Host "❌ Admin login failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Professor Login
Write-Host "2. Testing Professor Login..." -ForegroundColor Cyan
try {
    $profResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body '{"username":"professor","password":"professor123"}'
    
    if ($profResponse.success) {
        Write-Host "✅ Professor login successful" -ForegroundColor Green
        $profToken = $profResponse.data.token
    }
} catch {
    Write-Host "❌ Professor login failed" -ForegroundColor Red
}
Write-Host ""

# 3. Student Login
Write-Host "3. Testing Student Login..." -ForegroundColor Cyan
try {
    $studentResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/student-login" `
        -Method Post `
        -ContentType "application/json" `
        -Body '{"student_code":"NCTU-26-001","national_id":"30001011234567"}'
    
    if ($studentResponse.success) {
        Write-Host "✅ Student login successful" -ForegroundColor Green
        $studentToken = $studentResponse.data.token
    }
} catch {
    Write-Host "❌ Student login failed" -ForegroundColor Red
}
Write-Host ""

# 4. Accountant Login
Write-Host "4. Testing Accountant Login..." -ForegroundColor Cyan
try {
    $accResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body '{"username":"accountant","password":"accountant123"}'
    
    if ($accResponse.success) {
        Write-Host "✅ Accountant login successful" -ForegroundColor Green
        $accToken = $accResponse.data.token
    }
} catch {
    Write-Host "❌ Accountant login failed" -ForegroundColor Red
}
Write-Host ""

# 5. Professor Dashboard
Write-Host "5. Testing Professor Dashboard..." -ForegroundColor Cyan
try {
    $profDash = Invoke-RestMethod -Uri "$BaseUrl/api/grades/professor/dashboard" `
        -Method Get `
        -Headers @{Authorization = "Bearer $profToken"}
    
    if ($profDash.success) {
        Write-Host "✅ Professor dashboard loaded" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Professor dashboard failed" -ForegroundColor Red
}
Write-Host ""

# 6. Student Data
Write-Host "6. Testing Student Data..." -ForegroundColor Cyan
try {
    $studentData = Invoke-RestMethod -Uri "$BaseUrl/api/student/data" `
        -Method Get `
        -Headers @{Authorization = "Bearer $studentToken"}
    
    if ($studentData.success) {
        Write-Host "✅ Student data loaded" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Student data failed" -ForegroundColor Red
}
Write-Host ""

# 7. Accountant Students
Write-Host "7. Testing Accountant Students List..." -ForegroundColor Cyan
try {
    $accStudents = Invoke-RestMethod -Uri "$BaseUrl/api/accountant/students" `
        -Method Get `
        -Headers @{Authorization = "Bearer $accToken"}
    
    if ($accStudents.success) {
        Write-Host "✅ Accountant students list loaded" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Accountant students list failed" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== Test Complete ===" -ForegroundColor Blue
Write-Host "✅ All tests passed successfully!" -ForegroundColor Green
```

**لتشغيل السكريبت:**

```powershell
.\test_all.ps1
```

---

## ✅ قائمة التحقق النهائية

```
□ السيرفر يعمل على http://localhost:5000
□ تسجيل دخول Admin يعمل ✓
□ تسجيل دخول Professor يعمل ✓
□ تسجيل دخول Student يعمل ✓
□ تسجيل دخول Accountant يعمل ✓
□ لوحة تحكم الدكتور تعمل ✓
□ لوحة تحكم الطالب تعمل ✓
□ لوحة تحكم المحاسب تعمل ✓
□ نقل الطلاب للسنة الجديدة يعمل ✓
```

---

## 📚 الملفات الإضافية

للمزيد من التفاصيل، راجع:

- **TESTING_README.md** - دليل سريع
- **POSTMAN_TEST_GUIDE.md** - دليل Postman الشامل
- **QUICK_TEST_COMMANDS.md** - أوامر وسكريبتات
- **TEST_DATA.md** - بيانات الاختبار الجاهزة
- **TESTING_SUMMARY.md** - ملخص شامل

---

## 🎉 تهانينا!

إذا نجحت جميع الاختبارات أعلاه، فإن نظام NCTU ERP يعمل بشكل صحيح! 🚀

**الخطوات التالية:**
1. جرب السيناريوهات الكاملة في `POSTMAN_TEST_GUIDE.md`
2. اختبر نقل الطلاب للسنة الجديدة
3. اختبر إدخال الدرجات والموافقة عليها
4. اختبر نظام الفواتير والمدفوعات

---

**تم إنشاء هذا الدليل بواسطة Kiro AI**
**التاريخ: 24 أبريل 2026**
