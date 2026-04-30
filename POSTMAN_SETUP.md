# إعداد Postman للاختبار - NCTU ERP System

## 📋 المتطلبات

1. **Postman Desktop App** أو **Postman Web**
2. **Server يعمل** على `http://localhost:5000`
3. **Database** مع seed data

---

## 🚀 الإعداد السريع

### الخطوة 1: استيراد Collection

1. افتح Postman
2. اضغط على **Import**
3. اختر ملف `.postman.json` من المشروع
4. اضغط **Import**

### الخطوة 2: إنشاء Environment

1. اضغط على **Environments** في الشريط الجانبي
2. اضغط **Create Environment**
3. اسم Environment: `NCTU Local`
4. أضف المتغيرات التالية:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| base_url | http://localhost:5000 | http://localhost:5000 |
| token | (leave empty) | (leave empty) |
| student_token | (leave empty) | (leave empty) |
| user_id | (leave empty) | (leave empty) |
| student_id | (leave empty) | (leave empty) |
| course_id | (leave empty) | (leave empty) |
| specialty_id | (leave empty) | (leave empty) |
| config_id | (leave empty) | (leave empty) |
| new_config_id | (leave empty) | (leave empty) |
| all_paid | (leave empty) | (leave empty) |
| registration_token | (leave empty) | (leave empty) |
| registration_link_id | (leave empty) | (leave empty) |
| registration_request_id | (leave empty) | (leave empty) |

5. اضغط **Save**

### الخطوة 3: تفعيل Environment

1. في أعلى يمين Postman، اختر `NCTU Local` من القائمة المنسدلة
2. تأكد من أن Environment نشط (يظهر اسمه في الأعلى)

---

## 🧪 تشغيل الاختبارات

### طريقة 1: تشغيل Collection كاملة

1. اضغط بزر الماوس الأيمن على Collection
2. اختر **Run collection**
3. تأكد من اختيار Environment الصحيح
4. اضغط **Run NCTU ERP - Complete API Testing**
5. انتظر حتى تنتهي جميع الاختبارات

### طريقة 2: تشغيل Folder محدد

1. افتح Collection
2. اضغط بزر الماوس الأيمن على Folder (مثل "3. CourseGradeConfig")
3. اختر **Run folder**
4. اضغط **Run**

### طريقة 3: تشغيل Request واحد

1. افتح Collection
2. اختر Request
3. اضغط **Send**
4. راجع Response

---

## 📊 فهم النتائج

### Test Results Panel

بعد تشغيل Collection، ستظهر نافذة النتائج:

#### ✅ Passed Tests (اختبارات ناجحة)
- لون أخضر
- تعني أن الـ endpoint يعمل بشكل صحيح

#### ❌ Failed Tests (اختبارات فاشلة)
- لون أحمر
- تحتاج إلى مراجعة وإصلاح

#### ⚠️ Skipped Tests (اختبارات متخطاة)
- لون أصفر
- قد تكون بسبب شروط معينة

### Response Details

لكل request، يمكنك رؤية:
- **Status Code**: 200, 201, 400, 403, 404, etc.
- **Response Time**: الوقت المستغرق
- **Response Body**: البيانات المرجعة
- **Headers**: معلومات إضافية

---

## 🔍 استكشاف الأخطاء

### خطأ: "Could not get response"

**السبب**: Server غير متصل

**الحل**:
```bash
cd server
npm start
```

### خطأ: "401 Unauthorized"

**السبب**: Token منتهي أو غير موجود

**الحل**:
1. شغل "Login as Admin" أو "Login as Student"
2. تأكد من حفظ Token في Environment

### خطأ: "404 Not Found"

**السبب**: Endpoint غير موجود أو URL خاطئ

**الحل**:
1. تحقق من `base_url` في Environment
2. تأكد من أن Server يعمل على المنفذ الصحيح

### خطأ: "400 Bad Request"

**السبب**: بيانات الطلب غير صحيحة

**الحل**:
1. راجع Body في Request
2. تأكد من صحة JSON format
3. تحقق من Validation rules

### خطأ: "403 Forbidden"

**السبب**: ليس لديك صلاحية

**الحل**:
1. تأكد من استخدام Token الصحيح
2. تحقق من Role المطلوب للـ endpoint

### خطأ: "500 Internal Server Error"

**السبب**: خطأ في Server

**الحل**:
1. راجع console logs في Server
2. تحقق من Database connection
3. راجع الكود في Backend

---

## 📝 نصائح مهمة

### 1. الترتيب مهم
- شغل "Authentication" أولاً
- ثم "Get Specialties & Courses"
- ثم باقي الاختبارات

### 2. Environment Variables
- يتم حفظ IDs تلقائياً في Environment
- لا تحتاج لنسخها يدوياً
- تأكد من تفعيل Environment قبل التشغيل

### 3. Test Scripts
- كل request له test scripts
- تتحقق من صحة Response
- تحفظ البيانات المهمة في Environment

### 4. Pre-request Scripts
- بعض Requests لها pre-request scripts
- تجهز البيانات قبل الإرسال
- لا تحتاج لتعديلها

---

## 🎯 سيناريوهات الاختبار

### سيناريو 1: اختبار نظام الدرجات الكامل

1. Login as Admin
2. Get All Courses
3. Create Grade Config
4. Get Config by Course ID
5. Update Grade Config
6. Test Validation
7. Delete Grade Config

### سيناريو 2: اختبار ربط المدفوعات والدرجات

1. Login as Student
2. Get Payment Status
3. Get Student Grades (سيفشل إذا لم يدفع)
4. Login as Accountant
5. Record Payment
6. Login as Student again
7. Get Student Grades (سينجح بعد الدفع)

### سيناريو 3: اختبار نظام التسجيل

1. Login as Admin
2. Create Registration Link
3. Get All Registration Links
4. (في browser) افتح Registration URL
5. املأ الفورم
6. Get Registration Requests
7. Approve/Reject Request

---

## 🔧 تخصيص Collection

### إضافة Request جديد

1. اضغط بزر الماوس الأيمن على Folder
2. اختر **Add Request**
3. اسم Request
4. اختر Method (GET, POST, etc.)
5. أدخل URL
6. أضف Headers إذا لزم
7. أضف Body إذا لزم
8. أضف Test Scripts

### إضافة Test Script

في tab **Tests**:

```javascript
// تحقق من Status Code
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

// تحقق من Response Body
pm.test("Response has success field", function() {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.be.true;
});

// حفظ في Environment
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set('variable_name', jsonData.data.id);
}
```

### إضافة Pre-request Script

في tab **Pre-request Script**:

```javascript
// تجهيز timestamp
pm.environment.set('timestamp', Date.now());

// تجهيز random data
pm.environment.set('random_email', `test${Math.random()}@example.com`);

// console log
console.log('Running request:', pm.info.requestName);
```

---

## 📤 تصدير النتائج

### تصدير Collection

1. اضغط بزر الماوس الأيمن على Collection
2. اختر **Export**
3. اختر Collection v2.1
4. احفظ الملف

### تصدير Environment

1. اضغط على Environments
2. اضغط على ... بجانب Environment
3. اختر **Export**
4. احفظ الملف

### تصدير Test Results

1. بعد تشغيل Collection
2. في نافذة النتائج، اضغط **Export Results**
3. اختر JSON أو CSV
4. احفظ الملف

---

## 🔄 CI/CD Integration

### استخدام Newman (CLI)

```bash
# تثبيت Newman
npm install -g newman

# تشغيل Collection
newman run .postman.json -e environment.json

# مع تقرير HTML
newman run .postman.json -e environment.json -r html

# مع تقرير JSON
newman run .postman.json -e environment.json -r json
```

### في GitHub Actions

```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Newman
        run: npm install -g newman
      - name: Run Tests
        run: newman run .postman.json -e environment.json
```

---

## 📚 موارد إضافية

### Postman Documentation
- [Postman Learning Center](https://learning.postman.com/)
- [Writing Tests](https://learning.postman.com/docs/writing-scripts/test-scripts/)
- [Variables](https://learning.postman.com/docs/sending-requests/variables/)

### Project Documentation
- [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- [API_ENDPOINTS_SUMMARY.md](./API_ENDPOINTS_SUMMARY.md)
- [CHANGELOG.md](./CHANGELOG.md)

---

## 💡 Best Practices

1. **استخدم Environment Variables** لجميع القيم المتغيرة
2. **أضف Test Scripts** لكل request
3. **نظم Requests في Folders** حسب الوظيفة
4. **استخدم Pre-request Scripts** لتجهيز البيانات
5. **وثق Requests** بإضافة descriptions
6. **شارك Collections** مع الفريق
7. **استخدم Newman** للـ CI/CD
8. **احفظ نسخة احتياطية** من Collections

---

## 🆘 الدعم

للمساعدة:
1. راجع [TESTING_GUIDE.md](./TESTING_GUIDE.md)
2. راجع Server logs
3. راجع Postman Console (View → Show Postman Console)
4. تواصل مع فريق التطوير

---

**آخر تحديث**: 2024
**الإصدار**: 1.0.0
