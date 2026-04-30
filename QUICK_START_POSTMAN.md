# دليل البدء السريع - اختبار NCTU ERP بـ Postman

## 🚀 خطوات البدء (5 دقائق)

### الخطوة 1: تشغيل السيرفر
```bash
cd server
npm start
```
✅ تأكد من ظهور: `Server running on port 5000`

---

### الخطوة 2: فتح Postman
1. افتح تطبيق Postman
2. إذا لم يكن مثبتاً، حمّله من: https://www.postman.com/downloads/

---

### الخطوة 3: استيراد المجموعة
1. اضغط **Import** في الزاوية العلوية اليسرى
2. اسحب ملف `NCTU_ERP_Postman_Collection.json` أو اضغط **Choose Files**
3. اضغط **Import**

✅ ستظهر مجموعة "NCTU ERP System API" في الشريط الجانبي

---

### الخطوة 4: إنشاء Environment (اختياري لكن موصى به)
1. اضغط على أيقونة **Environments** (⚙️) في الشريط الجانبي
2. اضغط **Create Environment**
3. اسم Environment: `NCTU Local`
4. أضف المتغيرات:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| baseUrl | http://localhost:5000/api | http://localhost:5000/api |
| token | | |
| studentToken | | |
| professorToken | | |
| accountantToken | | |

5. اضغط **Save**
6. اختر Environment من القائمة المنسدلة في الأعلى

---

### الخطوة 5: أول اختبار - تسجيل دخول Admin

1. افتح المجموعة: **NCTU ERP System API**
2. افتح Folder: **Authentication**
3. اختر Request: **Admin Login**
4. اضغط **Send** 🚀

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

✅ Token سيُحفظ تلقائياً في المتغير `{{token}}`

---

### الخطوة 6: اختبار endpoint محمي

1. افتح Folder: **Admin - Specialties**
2. اختر Request: **Get All Specialties**
3. اضغط **Send**

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "MCT",
      "name": "Mechatronics",
      "arabic_name": "الميكاترونيكس",
      ...
    },
    ...
  ],
  "count": 6
}
```

✅ يجب أن ترى 6 تخصصات

---

## 🎯 اختبارات سريعة (10 دقائق)

### 1. اختبار التخصصات
```
✅ GET /api/admin/specialties
✅ GET /api/specialties (بدون auth)
```

### 2. اختبار السنوات الدراسية
```
✅ GET /api/admin/academic-years
✅ GET /api/admin/academic-years?specialty_id=1
```

### 3. اختبار الطلاب
```
✅ GET /api/admin/students
✅ POST /api/admin/students (إنشاء طالب جديد)
```

### 4. اختبار روابط التسجيل
```
✅ POST /api/admin/registration-links (إنشاء رابط)
✅ GET /api/admin/registration-links (عرض الروابط)
```

### 5. اختبار Student Portal
```
✅ POST /api/auth/student-login
✅ GET /api/grades/student/dashboard
```

---

## 💡 نصائح مهمة

### 1. استخدام Variables
بدلاً من كتابة:
```
http://localhost:5000/api/admin/specialties
```

استخدم:
```
{{baseUrl}}/admin/specialties
```

### 2. حفظ Tokens تلقائياً
Request **Admin Login** يحتوي على script يحفظ Token تلقائياً:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set('token', response.data.token);
}
```

### 3. استخدام Authorization
جميع الـ requests المحمية تستخدم:
```
Authorization: Bearer {{token}}
```

### 4. فحص الاستجابات
- Status Code: يجب أن يكون `200` أو `201`
- Body: يجب أن يحتوي على `success: true`
- Data: يجب أن يحتوي على البيانات المطلوبة

---

## 🔍 استكشاف الأخطاء

### خطأ: "Could not send request"
**السبب:** السيرفر غير مشغّل  
**الحل:** 
```bash
cd server
npm start
```

### خطأ: 401 Unauthorized
**السبب:** Token غير موجود أو منتهي  
**الحل:** سجل دخول مرة أخرى (Admin Login)

### خطأ: 403 Forbidden
**السبب:** المستخدم ليس لديه صلاحية  
**الحل:** تأكد من استخدام Token الصحيح (admin/student/accountant)

### خطأ: 404 Not Found
**السبب:** الـ endpoint غير موجود  
**الحل:** تحقق من الـ URL

### خطأ: 500 Internal Server Error
**السبب:** خطأ في السيرفر  
**الحل:** تحقق من console السيرفر

---

## 📊 Collection Runner (اختبار شامل)

### تشغيل جميع الـ Requests دفعة واحدة:

1. اضغط على المجموعة **NCTU ERP System API**
2. اضغط **Run** في الأعلى
3. اختر الـ Requests التي تريد تشغيلها
4. اضغط **Run NCTU ERP System API**

✅ ستحصل على تقرير شامل بجميع النتائج

---

## 🎨 تنظيم الـ Requests

### Folders في المجموعة:

```
📁 NCTU ERP System API
├── 📁 Authentication (4 requests)
├── 📁 Admin - Specialties (5 requests)
├── 📁 Admin - Academic Years (3 requests)
├── 📁 Admin - Students (4 requests)
├── 📁 Admin - Courses (3 requests)
├── 📁 Admin - Professors (2 requests)
├── 📁 Admin - Registration Links (2 requests)
├── 📁 Admin - Registration Requests (3 requests)
├── 📁 Admin - Timetables (2 requests)
├── 📁 Public - Specialties (1 request)
├── 📁 Student Portal (4 requests)
└── 📁 Accountant (3 requests)
```

---

## 📝 أمثلة على Requests

### مثال 1: إنشاء طالب جديد
```
POST {{baseUrl}}/admin/students
Headers:
  Authorization: Bearer {{token}}
Body (JSON):
{
  "full_name": "أحمد محمد علي",
  "email": "ahmed@test.com",
  "national_id": "30012345678901",
  "phone": "01234567890",
  "specialty_id": 1,
  "current_year": 1,
  "password": "password123"
}
```

### مثال 2: البحث عن طلاب
```
GET {{baseUrl}}/admin/students?search=ahmed
Headers:
  Authorization: Bearer {{token}}
```

### مثال 3: إنشاء رابط تسجيل
```
POST {{baseUrl}}/admin/registration-links
Headers:
  Authorization: Bearer {{token}}
Body (JSON):
{}
```

### مثال 4: تسجيل دخول طالب
```
POST {{baseUrl}}/auth/student-login
Body (JSON):
{
  "student_code": "20241234",
  "national_id": "12345678901234"
}
```

---

## 🎓 تعلم المزيد

### موارد Postman:
- [Postman Learning Center](https://learning.postman.com/)
- [Variables in Postman](https://learning.postman.com/docs/sending-requests/variables/)
- [Writing Tests](https://learning.postman.com/docs/writing-scripts/test-scripts/)

### موارد NCTU ERP:
- `POSTMAN_TESTING_GUIDE.md` - دليل الاختبار الشامل
- `API_TESTING_SUMMARY.md` - ملخص الـ API
- `NCTU_ERP_Postman_Collection.json` - المجموعة الكاملة

---

## ✅ Checklist

قبل البدء، تأكد من:
- [ ] السيرفر يعمل على port 5000
- [ ] قاعدة البيانات تعمل
- [ ] Postman مثبت
- [ ] المجموعة مستوردة
- [ ] Environment تم إنشاؤه (اختياري)

بعد الاختبار الأول:
- [ ] Admin Login نجح
- [ ] Token محفوظ في المتغير
- [ ] Get Specialties نجح
- [ ] Get Academic Years نجح

---

## 🎉 مبروك!

أنت الآن جاهز لاختبار NCTU ERP System باستخدام Postman!

للمزيد من التفاصيل، راجع:
- `POSTMAN_TESTING_GUIDE.md` - دليل شامل
- `API_TESTING_SUMMARY.md` - ملخص المهام

---

**وقت القراءة:** 5 دقائق  
**وقت التطبيق:** 5 دقائق  
**المجموع:** 10 دقائق ⚡
