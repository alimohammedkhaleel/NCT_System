# تحديث مجموعة Postman - ملخص التغييرات

## 📋 نظرة عامة

تم تحديث مجموعة Postman (`.postman.json`) لتشمل اختبارات شاملة لـ endpoint الجديد `POST /api/auth/retrieve-student-code`.

## ✅ التحديثات المنفذة

### 1. إضافة اختبارات endpoint استرجاع كود الطالب

تمت إضافة 5 اختبارات جديدة في قسم "1. Authentication":

#### 1.1 اختبار رقم قومي صحيح
- **الاسم**: `Retrieve Student Code - Valid National ID`
- **الطريقة**: `POST /api/auth/retrieve-student-code`
- **البيانات**: `{ "national_id": "12345678901234" }`
- **النتيجة المتوقعة**: 
  - Status: 200
  - Response يحتوي على `student_code` و `full_name`
  - رسالة نجاح بالعربية

#### 1.2 اختبار رقم قومي مفقود
- **الاسم**: `Retrieve Student Code - Missing National ID`
- **الطريقة**: `POST /api/auth/retrieve-student-code`
- **البيانات**: `{}`
- **النتيجة المتوقعة**:
  - Status: 400
  - رسالة خطأ: "يرجى إدخال الرقم القومي"

#### 1.3 اختبار تنسيق غير صحيح (أقل من 14 رقم)
- **الاسم**: `Retrieve Student Code - Invalid Format (Not 14 Digits)`
- **الطريقة**: `POST /api/auth/retrieve-student-code`
- **البيانات**: `{ "national_id": "123456" }`
- **النتيجة المتوقعة**:
  - Status: 400
  - رسالة خطأ: "الرقم القومي يجب أن يكون 14 رقماً بالضبط"

#### 1.4 اختبار تنسيق غير صحيح (أحرف)
- **الاسم**: `Retrieve Student Code - Invalid Format (Non-Numeric)`
- **الطريقة**: `POST /api/auth/retrieve-student-code`
- **البيانات**: `{ "national_id": "1234567890ABCD" }`
- **النتيجة المتوقعة**:
  - Status: 400
  - رسالة خطأ: "الرقم القومي يجب أن يكون 14 رقماً بالضبط"

#### 1.5 اختبار رقم قومي غير موجود
- **الاسم**: `Retrieve Student Code - Non-Existent National ID`
- **الطريقة**: `POST /api/auth/retrieve-student-code`
- **البيانات**: `{ "national_id": "99999999999999" }`
- **النتيجة المتوقعة**:
  - Status: 404
  - رسالة خطأ: "الرقم القومي غير مسجل في النظام"

## 📊 إحصائيات المجموعة المحدثة

- **إجمالي الاختبارات**: 46 اختبار (كان 41)
- **اختبارات جديدة**: 5 اختبارات
- **الأقسام**: 7 أقسام
- **Endpoints المختبرة**: 22 endpoint

## 🔧 كيفية تشغيل الاختبارات

### الطريقة 1: استخدام Postman Desktop

```bash
# 1. افتح Postman Desktop
# 2. استورد الملف .postman.json
# 3. أنشئ Environment جديد بالمتغيرات:
#    - base_url: http://localhost:5000
# 4. شغّل المجموعة كاملة أو اختبارات محددة
```

### الطريقة 2: استخدام Newman CLI

```bash
# تثبيت Newman
npm install -g newman

# تشغيل المجموعة
newman run .postman.json \
  --environment .postman-config.json \
  --reporters cli,json \
  --reporter-json-export results.json

# تشغيل قسم Authentication فقط
newman run .postman.json \
  --folder "1. Authentication" \
  --environment .postman-config.json
```

### الطريقة 3: استخدام Postman Power (إذا كان متاحاً)

```bash
# تفعيل Postman Power
kiro powers activate postman

# تشغيل المجموعة
kiro powers use postman run-collection \
  --collection .postman.json \
  --environment .postman-config.json
```

## 🎯 حالات الاختبار المغطاة

### ✅ حالات النجاح
- [x] استرجاع كود طالب برقم قومي صحيح
- [x] عرض اسم الطالب الكامل مع الكود

### ✅ حالات الفشل - Validation
- [x] رقم قومي مفقود
- [x] رقم قومي أقل من 14 رقم
- [x] رقم قومي أكثر من 14 رقم
- [x] رقم قومي يحتوي على أحرف

### ✅ حالات الفشل - Business Logic
- [x] رقم قومي غير مسجل في النظام

## 🔍 التحقق من الاختبارات

### الاختبارات التلقائية المضمنة

كل اختبار يتحقق من:

1. **Status Code**: التأكد من رمز الحالة الصحيح
2. **Response Structure**: التحقق من بنية الاستجابة
3. **Error Messages**: التحقق من رسائل الخطأ بالعربية
4. **Data Validation**: التحقق من البيانات المرجعة

### مثال على اختبار تلقائي

```javascript
pm.test('Status code is 200', function() {
    pm.response.to.have.status(200);
});

pm.test('Response has student_code', function() {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('student_code');
    pm.expect(jsonData.data).to.have.property('full_name');
});

pm.test('Message is in Arabic', function() {
    const jsonData = pm.response.json();
    pm.expect(jsonData.message).to.include('تم');
});
```

## 📝 ملاحظات مهمة

### متطلبات التشغيل

1. **الخادم يجب أن يكون قيد التشغيل**:
   ```bash
   cd server
   npm start
   # أو
   node server.js
   ```

2. **قاعدة البيانات يجب أن تحتوي على بيانات اختبار**:
   - طالب واحد على الأقل برقم قومي `12345678901234`
   - أو تعديل الرقم القومي في الاختبار ليطابق بيانات موجودة

3. **المتغيرات البيئية**:
   - `base_url`: عنوان الخادم (افتراضي: `http://localhost:5000`)

### تعديل بيانات الاختبار

لتعديل الرقم القومي المستخدم في الاختبارات:

1. افتح `.postman.json`
2. ابحث عن `"Retrieve Student Code - Valid National ID"`
3. عدّل قيمة `national_id` في `body.raw`

## 🚀 الخطوات التالية

### 1. تشغيل الاختبارات
```bash
newman run .postman.json --environment .postman-config.json
```

### 2. مراجعة النتائج
- تحقق من نجاح جميع الاختبارات
- راجع أي اختبارات فاشلة

### 3. إصلاح الأخطاء (إن وجدت)
- إذا فشل اختبار "Valid National ID": تأكد من وجود طالب بالرقم القومي المحدد
- إذا فشلت اختبارات Validation: راجع كود الـ controller

### 4. دمج في CI/CD
```yaml
# مثال GitHub Actions
- name: Run API Tests
  run: |
    npm install -g newman
    newman run .postman.json \
      --environment .postman-config.json \
      --reporters cli,junit \
      --reporter-junit-export results.xml
```

## 📚 موارد إضافية

- [Postman Documentation](https://learning.postman.com/docs/)
- [Newman CLI Documentation](https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/)
- [Writing Tests in Postman](https://learning.postman.com/docs/writing-scripts/test-scripts/)

## ✨ التحسينات المستقبلية المقترحة

1. **إضافة اختبارات الأداء**:
   - قياس زمن الاستجابة
   - اختبار الحمل (Load Testing)

2. **إضافة اختبارات الأمان**:
   - SQL Injection
   - XSS
   - Rate Limiting

3. **إضافة اختبارات التكامل**:
   - اختبار تدفق كامل من التسجيل إلى تسجيل الدخول
   - اختبار العلاقات بين الـ endpoints

4. **توثيق API تلقائي**:
   - توليد OpenAPI/Swagger من مجموعة Postman
   - نشر التوثيق على Postman Public Workspace

---

**تاريخ التحديث**: 2026-04-17  
**الإصدار**: 1.1.0  
**المطور**: Kiro AI Assistant
