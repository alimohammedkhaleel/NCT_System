# إصلاح مشكلة رفع الجداول الدراسية (Timetable Upload Fix)

## المشكلة
عند محاولة رفع ملف PDF للجدول الدراسي، كان النظام يعطي خطأ 400 "PDF file is required" رغم أن الملف موجود.

## السبب الجذري
المشكلة كانت في طريقة إرسال FormData من Frontend:
1. كان يتم استخدام `axios.post` مباشرة بدلاً من استخدام `timetablesAPI` من `apiService.js`
2. كان يتم تمرير `headers: { 'Content-Type': undefined }` مما قد يسبب مشاكل
3. في `apiService.js` كان يتم تمرير `headers: {}` فارغة

## الحل
تم إجراء التعديلات التالية:

### 1. تحديث TimetablesPage.jsx
```javascript
// قبل:
import axios from 'axios';
await axios.post('/admin/timetables', fData, uploadConfig);

// بعد:
import { timetablesAPI, specialtiesAPI } from '../../services/apiService';
await timetablesAPI.create(fData);
```

### 2. تحديث apiService.js
```javascript
// قبل:
create: (formData) => {
  const config = { headers: {} };
  return api.post('/admin/timetables', formData, config);
}

// بعد:
create: (formData) => {
  // Let axios automatically set Content-Type with boundary for FormData
  return api.post('/admin/timetables', formData);
}
```

### 3. التأكد من عدم وجود Content-Type في axios defaults
في `AuthContext.jsx` و `apiService.js`:
```javascript
// ✅ صحيح - لا يوجد Content-Type
axios.defaults.baseURL = '/api';
// Note: Do NOT set Content-Type globally — it breaks FormData uploads

// ❌ خطأ - لا تفعل هذا
axios.defaults.headers.common['Content-Type'] = 'application/json';
```

## كيف يعمل FormData بشكل صحيح

عند إرسال FormData، يجب أن:
1. **لا** تضع `Content-Type` يدوياً
2. دع axios يضع `Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...` تلقائياً
3. الـ boundary يتم توليده تلقائياً ويجب أن يتطابق مع محتوى الـ FormData

## Backend Configuration

الـ Backend يستخدم multer بشكل صحيح:

```javascript
// server/routes/timetableRoutes.js
router.post('/timetables', 
  authenticateToken, 
  authorizeRoles('admin'), 
  upload.single('file'),  // multer middleware
  TimetableController.createTimetable
);

// server/config/multer.js
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
```

## اختبار الإصلاح

لاختبار أن الرفع يعمل:
1. افتح صفحة Timetables Management
2. اضغط "Upload New Timetable"
3. املأ العنوان واختر التخصص
4. اختر ملف PDF (أقل من 5MB)
5. اضغط "Upload"
6. يجب أن يظهر "Timetable uploaded successfully"

## ملاحظات مهمة

### ✅ افعل:
- استخدم `timetablesAPI.create(formData)` من apiService
- دع axios يضع Content-Type تلقائياً
- تأكد من أن الملف من نوع PDF
- تأكد من أن حجم الملف أقل من 5MB

### ❌ لا تفعل:
- لا تستخدم `axios.post` مباشرة
- لا تضع `Content-Type` يدوياً في headers
- لا تضع `headers: {}` فارغة
- لا تضع `Content-Type: application/json` كـ default في axios

## الملفات المعدلة
1. `client/frontend/src/pages/Admin/TimetablesPage.jsx`
2. `client/frontend/src/services/apiService.js`

## التحقق من الإصلاح
```bash
# في المتصفح، افتح Console وشاهد:
📤 Uploading file: timetable.pdf 245678 bytes
📋 FormData contents:
  title: IT Level 1 - Fall 2024
  specialty_id: 3
  file: [object File]

# في Backend logs:
📥 CREATE TIMETABLE REQUEST:
  - File: { fieldname: 'file', originalname: 'timetable.pdf', ... }
✅ Timetable created successfully
```

---
**آخر تحديث:** الآن
**الحالة:** تم الإصلاح ✅
