# دليل إصلاح قاعدة البيانات وتشغيل Migration
## NCTU ERP System - Database Repair Guide

---

## 🔴 المشكلة الحالية

```
❌ Error seeding database: Table 'nctu_erp.users' doesn't exist in engine
```

هذا الخطأ يعني أن جدول `users` موجود في schema قاعدة البيانات لكنه تالف في storage engine (InnoDB).

---

## ✅ الحل - خطوات الإصلاح

### الخطوة 1: إصلاح قاعدة البيانات

```bash
cd server
node migrations/repair-database.js
```

هذا السكريبت سيقوم بـ:
- فحص جميع الجداول في قاعدة البيانات
- إصلاح الجداول التالفة
- تحسين أداء الجداول
- حذف الجداول المعطوبة تماماً (إن وجدت)

### الخطوة 2: إنشاء جدول طلبات تسجيل الأساتذة

بعد إصلاح قاعدة البيانات، قم بتشغيل migration لإنشاء الجدول الجديد:

```bash
cd server
node migrations/create-professor-registration-requests.js
```

### الخطوة 3: إعادة تشغيل السيرفر

```bash
cd server
npm run dev
```

---

## 🔧 حل بديل: إعادة إنشاء قاعدة البيانات من الصفر

إذا استمرت المشاكل، يمكنك إعادة إنشاء قاعدة البيانات بالكامل:

### 1. افتح MySQL/MariaDB

```bash
mysql -u root -p
```

### 2. احذف قاعدة البيانات القديمة وأنشئ واحدة جديدة

```sql
DROP DATABASE IF EXISTS nctu_erp;
CREATE DATABASE nctu_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- منح الصلاحيات
GRANT ALL PRIVILEGES ON nctu_erp.* TO 'root'@'localhost';
GRANT ALL PRIVILEGES ON nctu_erp.* TO 'root'@'127.0.0.1';
FLUSH PRIVILEGES;

-- الخروج
EXIT;
```

### 3. شغل السيرفر لإنشاء الجداول تلقائياً

```bash
cd server
npm run dev
```

السيرفر سيقوم بإنشاء جميع الجداول تلقائياً عند أول تشغيل.

### 4. شغل migration لجدول طلبات الأساتذة

```bash
# في terminal جديد (اترك السيرفر يعمل)
cd server
node migrations/create-professor-registration-requests.js
```

---

## 📋 التحقق من نجاح العملية

### 1. تحقق من وجود الجداول

```bash
mysql -u root -p nctu_erp
```

```sql
SHOW TABLES;
```

يجب أن ترى:
- users
- students
- professors
- specialties
- courses
- grades
- professor_registration_requests ← **الجدول الجديد**
- وجداول أخرى...

### 2. تحقق من بنية جدول طلبات الأساتذة

```sql
DESCRIBE professor_registration_requests;
```

يجب أن ترى 17 عمود:
- id
- full_name
- national_id
- email
- phone
- specialty_id
- qualification
- years_of_experience
- password_hash
- status
- rejection_reason
- processed_at
- processed_by
- created_user_id
- created_professor_id
- created_at
- updated_at

### 3. اختبر API من المتصفح

بعد تشغيل السيرفر، افتح:

```
http://localhost:5000/api/health
```

يجب أن ترى:
```json
{
  "status": "OK",
  "timestamp": "2024-04-24T..."
}
```

---

## 🧪 اختبار نظام تسجيل الأساتذة

### 1. اختبار التسجيل (Public Endpoint)

```bash
curl -X POST http://localhost:5000/api/professor-registration/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "د. أحمد محمد",
    "national_id": "12345678901234",
    "email": "ahmed.mohamed@example.com",
    "phone": "01234567890",
    "password": "SecurePass123!",
    "specialty_id": 1,
    "qualification": "دكتوراه في علوم الحاسب",
    "years_of_experience": 10
  }'
```

### 2. اختبار عرض الطلبات (Admin Only)

أولاً، سجل دخول كـ admin واحصل على token:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

ثم استخدم الـ token لعرض الطلبات:

```bash
curl -X GET "http://localhost:5000/api/professor-registration/admin/requests?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. اختبار الموافقة على طلب

```bash
curl -X POST http://localhost:5000/api/professor-registration/admin/requests/1/approve \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 4. اختبار رفض طلب

```bash
curl -X POST http://localhost:5000/api/professor-registration/admin/requests/1/reject \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "rejection_reason": "بيانات غير مكتملة"
  }'
```

---

## 📁 الملفات التي تم إنشاؤها

### Backend Files:
1. ✅ `server/models/ProfessorRegistrationRequest.js` - Model
2. ✅ `server/migrations/create-professor-registration-requests.js` - Migration
3. ✅ `server/migrations/repair-database.js` - Database repair script
4. ✅ `server/controllers/professorRegistrationController.js` - Controller
5. ✅ `server/routes/professorRegistrationRoutes.js` - Routes
6. ✅ `server/controllers/adminController.js` - Updated (3 new functions)
7. ✅ `server/routes/adminRoutes.js` - Updated (3 new routes)
8. ✅ `server/server.js` - Updated (added routes)
9. ✅ `server/config/models.js` - Updated (associations)

### Frontend Files (لم يتم إنشاؤها بعد):
- ⏳ `client/frontend/src/pages/ProfessorRegistration/ProfessorRegistrationForm.jsx`
- ⏳ `client/frontend/src/pages/Admin/ProfessorRequests.jsx`
- ⏳ `client/frontend/src/components/admin/BulkStudentApproval.jsx`
- ⏳ Update: `client/frontend/src/pages/Admin/RegistrationRequests.jsx`
- ⏳ Update: `client/frontend/src/pages/Admin/AdminDashboard.jsx`

---

## 🚀 الخطوات التالية

1. ✅ إصلاح قاعدة البيانات
2. ✅ تشغيل migration لجدول طلبات الأساتذة
3. ⏳ اختبار APIs باستخدام curl أو Postman
4. ⏳ إنشاء صفحات Frontend
5. ⏳ إنشاء نظام إدارة النتائج
6. ⏳ إنشاء Postman collections للاختبار

---

## ❓ استكشاف الأخطاء

### خطأ: "Cannot find module"
```bash
# تأكد أنك في مجلد server
cd server
pwd  # يجب أن يظهر: .../NCT_System/server
```

### خطأ: "Host 'localhost' is not allowed"
```sql
-- في MySQL
GRANT ALL PRIVILEGES ON nctu_erp.* TO 'root'@'localhost' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON nctu_erp.* TO 'root'@'127.0.0.1' IDENTIFIED BY '';
FLUSH PRIVILEGES;
```

### خطأ: "Table doesn't exist in engine"
```bash
# شغل سكريبت الإصلاح
cd server
node migrations/repair-database.js
```

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. تحقق من أن MySQL/MariaDB يعمل
2. تحقق من صلاحيات المستخدم في قاعدة البيانات
3. تحقق من ملف `.env` في مجلد `server`
4. راجع logs السيرفر للحصول على تفاصيل الخطأ

---

**تم التحديث:** 24 أبريل 2026
**الإصدار:** 1.0.0
