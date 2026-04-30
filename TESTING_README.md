# 🧪 دليل الاختبار السريع - NCTU ERP

## 🎯 ابدأ الاختبار في 3 خطوات

### 1️⃣ تشغيل السيرفر

```bash
cd server
npm start
```

### 2️⃣ بيانات تسجيل الدخول

```
Admin:      username: admin         password: admin123
Professor:  username: professor     password: professor123
Student:    username: student1      password: student123
Accountant: username: accountant    password: accountant123
```

### 3️⃣ اختبار سريع

```bash
# تسجيل دخول المدير
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 📚 الملفات المتاحة

| الملف | الوصف | متى تستخدمه |
|------|-------|-------------|
| **POSTMAN_TEST_GUIDE.md** | دليل شامل لاختبار Postman | للاختبار التفصيلي الكامل |
| **QUICK_TEST_COMMANDS.md** | أوامر cURL وسكريبتات | للاختبار السريع من Terminal |
| **TEST_DATA.md** | بيانات جاهزة للاختبار | للحصول على بيانات الطلاب والدرجات |
| **TESTING_SUMMARY.md** | ملخص شامل للاختبار | لفهم عملية الاختبار الكاملة |

---

## 🚀 اختبار سريع (5 دقائق)

### اختبار تسجيل الدخول لجميع الأدوار

```bash
# 1. Admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 2. Professor
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"professor","password":"professor123"}'

# 3. Student
curl -X POST http://localhost:5000/api/auth/student-login \
  -H "Content-Type: application/json" \
  -d '{"student_code":"NCTU-26-001","national_id":"30001011234567"}'

# 4. Accountant
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"accountant","password":"accountant123"}'
```

---

## 🎓 اختبار دورة حياة طالب (10 دقائق)

### الخطوات:

1. **المدير ينشئ رابط تسجيل**
2. **الطالب يسجل**
3. **المدير يوافق**
4. **المحاسب ينشئ فاتورة**
5. **المحاسب يسجل دفعة**
6. **الدكتور يدخل درجات**
7. **المدير ينشر النتائج**
8. **الطالب يرى درجاته**
9. **المدير ينقل الطالب للسنة التالية**

**للتفاصيل:** راجع `POSTMAN_TEST_GUIDE.md` - السيناريو 1

---

## 🔄 اختبار نقل الطلاب للسنة الجديدة

### الخطوة 1: تسجيل دخول المدير

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.data.token')
```

### الخطوة 2: نقل الطلاب

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

## 👨‍🏫 اختبار لوحة تحكم الدكتور

### 1. تسجيل الدخول

```bash
PROF_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"professor","password":"professor123"}' \
  | jq -r '.data.token')
```

### 2. عرض لوحة التحكم

```bash
curl -X GET http://localhost:5000/api/grades/professor/dashboard \
  -H "Authorization: Bearer $PROF_TOKEN"
```

### 3. عرض المقررات

```bash
curl -X GET http://localhost:5000/api/grades/professor/courses \
  -H "Authorization: Bearer $PROF_TOKEN"
```

---

## 💰 اختبار لوحة تحكم المحاسب

### 1. تسجيل الدخول

```bash
ACC_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"accountant","password":"accountant123"}' \
  | jq -r '.data.token')
```

### 2. عرض الطلاب

```bash
curl -X GET http://localhost:5000/api/accountant/students \
  -H "Authorization: Bearer $ACC_TOKEN"
```

### 3. إنشاء فاتورة

```bash
curl -X POST http://localhost:5000/api/accountant/invoices \
  -H "Authorization: Bearer $ACC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "amount": 12000.00,
    "description": "رسوم السنة الدراسية الأولى",
    "due_date": "2026-09-30"
  }'
```

---

## 👨‍🎓 اختبار لوحة تحكم الطالب

### 1. تسجيل الدخول

```bash
STUDENT_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/student-login \
  -H "Content-Type: application/json" \
  -d '{"student_code":"NCTU-26-001","national_id":"30001011234567"}' \
  | jq -r '.data.token')
```

### 2. عرض بيانات الطالب

```bash
curl -X GET http://localhost:5000/api/student/data \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

### 3. عرض الفواتير

```bash
curl -X GET http://localhost:5000/api/grades/student/invoices \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

---

## 🔧 استكشاف الأخطاء

### السيرفر لا يعمل
```bash
# تحقق من المنفذ
netstat -an | grep 5000

# أعد تشغيل السيرفر
cd server
npm start
```

### خطأ 401 Unauthorized
```bash
# تأكد من التوكن
echo $TOKEN

# سجل دخول جديد
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.data.token')
```

### لا توجد بيانات
```bash
# أعد إنشاء البيانات الأولية
cd server
npm run seed
```

---

## 📊 سكريبت اختبار كامل

### Linux/Mac

```bash
# احفظ في test.sh
chmod +x test.sh
./test.sh
```

**راجع:** `QUICK_TEST_COMMANDS.md` للسكريبت الكامل

### Windows PowerShell

```powershell
# احفظ في test.ps1
.\test.ps1
```

**راجع:** `QUICK_TEST_COMMANDS.md` للسكريبت الكامل

---

## 📱 استخدام Postman

### 1. استيراد Collection

1. افتح Postman
2. File → Import
3. اختر `.postman.json`

### 2. إنشاء Environment

```
Name: NCTU ERP - Local
Variables:
  base_url = http://localhost:5000
  token = (سيتم ملؤه تلقائياً)
```

### 3. تشغيل الاختبارات

1. اضغط على Collection
2. اضغط "Run"
3. اختر Environment
4. اضغط "Run NCTU ERP"

---

## ✅ قائمة التحقق

```
□ السيرفر يعمل على http://localhost:5000
□ البيانات الأولية موجودة (npm run seed)
□ تسجيل دخول Admin يعمل
□ تسجيل دخول Professor يعمل
□ تسجيل دخول Student يعمل
□ تسجيل دخول Accountant يعمل
□ إنشاء رابط تسجيل يعمل
□ تسجيل طالب جديد يعمل
□ نقل الطلاب للسنة الجديدة يعمل
```

---

## 📞 المساعدة

### للمزيد من التفاصيل:

- **POSTMAN_TEST_GUIDE.md** - دليل Postman الشامل
- **QUICK_TEST_COMMANDS.md** - أوامر وسكريبتات
- **TEST_DATA.md** - بيانات الاختبار
- **TESTING_SUMMARY.md** - ملخص شامل

### إذا واجهت مشكلة:

1. تحقق من logs السيرفر
2. استخدم Postman Console (Ctrl + Alt + C)
3. راجع ملفات الاختبار أعلاه

---

## 🎯 الخطوات التالية

بعد الانتهاء من الاختبار:

1. ✅ وثق أي مشاكل وجدتها
2. ✅ احفظ Postman Collection
3. ✅ راجع النتائج في قاعدة البيانات
4. ✅ شارك النتائج مع الفريق

---

**🚀 ابدأ الآن!**

اختر أحد الملفات أعلاه وابدأ الاختبار.

**تم إنشاء هذا الدليل بواسطة Kiro AI**
**التاريخ: 24 أبريل 2026**
