# ✅ دليل الاختبار العملي لصفحة الجداول

## 🚀 الخطوات المطلوبة قبل الاختبار

### 1. تأكد من تشغيل الخادم
```bash
# في مجلد server
npm run dev
# أو
npm start
```

### 2. تأكد من تشغيل Frontend
```bash
# في مجلد client/frontend
npm run dev
```

### 3. تحقق من عنوان الخادم
```
Frontend: http://localhost:5173
Backend API: http://localhost:5000
```

---

## 🧪 خطوات الاختبار

### الخطوة 1: تسجيل الدخول كـ Admin ✅

```
1. افتح http://localhost:5173/login
2. أدخل بيانات المسؤول:
   - Username: admin (أو admin username حقيقي)
   - Password: كلمة المرور الآمنة
3. اضغط الزر "Login"
4. يجب أن تنتقل إلى لوحة التحكم
```

**ماذا تتوقع:**
- ✅ إعادة توجيه إلى `/dashboard`
- ✅ ظهور رسالة ترحيب
- ✅ توفر localStorage مع `token` و `user`

---

### الخطوة 2: الوصول إلى صفحة الجداول ✅

```
1. انتقل إلى http://localhost:5173/admin/timetables
   أو
   انقر على "الجداول 📅" في الشريط الجانبي
2. يجب أن تحمل الصفحة بدون تحويل إلى Home
```

**ماذا تتوقع:**
- ✅ ظهور عنوان "Timetables Management" بلون بنفسجي
- ✅ زر "Upload New Timetable" أخضر
- ✅ جدول يعرض الجداول المحملة (قد يكون فارغاً في البداية)
- ✅ خلفية الصفحة بنفسجية/سوداء (حسب index.css)

**إذا حدث تحويل للـ Home:**
```
❌ المشكلة: عدم التحقق من الصلاحيات
📝 تحقق من:
   1. localStorage.getItem('token') - هل التوكن موجود؟
   2. localStorage.getItem('user') - هل المستخدم موجود؟
   3. إعادة تحميل الصفحة بـ Ctrl+Shift+R
```

---

### الخطوة 3: اختبر إضافة جدول جديد ✅

```
1. انقر على زر "Upload New Timetable"
2. ملئ النموذج:
   - Title: "Schedule Fall 2024 - IT"
   - Specialty: "تكنولوجيا المعلومات"
   - PDF File: اختر أي ملف PDF
3. انقر "Upload"
```

**ماذا تتوقع:**
- ✅ رسالة نجاح خضراء: "Timetable uploaded successfully"
- ✅ ظهور الجدول الجديد في الجدول
- ✅ إغلاق النموذج تلقائياً

**المشاكل المحتملة:**
```
❌ خطأ: "File size must be less than 5MB"
   → اختر ملف PDF أصغر

❌ خطأ: "Only PDF files are allowed"
   → تأكد من أنه ملف PDF فعلي

❌ خطأ: "Please fill title and select specialty"
   → تأكد من تعبئة جميع الحقول

❌ خطأ من الخادم (500)
   → تحقق من معدل الخادم في terminal
```

---

### الخطوة 4: اختبر تحرير الجدول ✅

```
1. في الجدول، انقر على زر "Edit" لأي جدول
2. غير العنوان: "Schedule Fall 2024 - IT - Updated"
3. اترك الملف كما هو (اختياري)
4. انقر "Update"
```

**ماذا تتوقع:**
- ✅ رسالة نجاح: "Timetable updated successfully"
- ✅ تحديث الجدول بالبيانات الجديدة

---

### الخطوة 5: اختبر عرض الملف ✅

```
1. في الجدول، انقر على اسم الملف (📄)
2. يجب أن ينفتح ملف PDF في نافذة جديدة
```

**ماذا تتوقع:**
- ✅ فتح PDF في نافذة جديدة

---

### الخطوة 6: اختبر حذف الجدول ✅

```
1. في الجدول، انقر على زر "Delete"
2. تأكيد الحذف في الرسالة المنبثقة
3. اضغط "OK"
```

**ماذا تتوقع:**
- ✅ رسالة نجاح: "Timetable deleted successfully"
- ✅ اختفاء الصف من الجدول

---

## 🎨 التحقق من الألوان والتصميم

### الألوان المتوقعة:

| العنصر | اللون المتوقع | الكود |
|-------|-------------|------|
| العنوان (Title) | بنفسجي مع توهج | #b36eff |
| الخلفية | تدرج أرجواني/أسود | CSS gradients |
| الأزرار | تدرج بنفسجي | gradient |
| الإدخالات | خلفية شفافة + حدود بنفسجية | rgba + border |
| رسائل النجاح | أخضر | #10b981 |
| رسائل الأخطاء | أحمر | #ef4444 |

### التحقق من التصميم:

```
✅ العنوان "Timetables Management" بنفسجي مع توهج
✅ الزر "Upload New Timetable" متدرج بنفسجي
✅ الجدول بخلفية شفافة مع حدود بنفسجية
✅ الإشعارات بالألوان الصحيحة
✅ النموذج بتصميم متناسق
✅ جميع عناصر واجهة المستخدم متطابقة مع About.jsx
```

---

## 🐛 حل المشاكل الشائعة

### المشكلة: "No matching export"
```
❌ خطأ: Cannot find module './CoursesPage.module.css'
✅ الحل: تم حل هذه المشكلة بإنشاء TimetablesPage.module.css
```

### المشكلة: الألوان لا تتطابق
```
✅ الحل:
   - تحديث جميع الألوان لاستخدام متغيرات index.css
   - استخدام var(--purple-primary) بدلاً من #b36eff
   - استخدام var(--text-primary) للنصوص
```

### المشكلة: التحويل إلى Home
```
❌ السبب المحتمل:
   1. عدم تسجيل الدخول
   2. بيانات المستخدم غير صحيحة في localStorage
   3. دور المستخدم ليس "admin"

✅ الحل:
   1. افتح DevTools (F12)
   2. انقر على Application tab
   3. تحقق من localStorage:
      - token: يجب أن يكون موجوداً
      - user: يجب أن يحتوي على "role": "admin"
   4. إذا كانت هناك مشكلة، سجل الخروج وأعد تسجيل الدخول
```

### المشكلة: الخادم لا يستجيب
```
✅ الحل:
   1. توقف عن تشغيل الخادم: Ctrl+C
   2. أعد تشغيله:
      cd server
      npm run dev
   3. تحقق من الأخطاء في terminal
   4. تحقق من اتصال قاعدة البيانات
```

---

## 📊 البيانات المتوقعة

### القائمة الافتراضية للتخصصات:

```javascript
[
  { id: 1, code: 'MCT', name: 'Mechatronics Technology', arabic_name: 'تكنولوجيا الميكاترونكس' },
  { id: 2, code: 'AUT', name: 'Autotronics Technology', arabic_name: 'تكنولوجيا الأوتوترونكس' },
  { id: 3, code: 'ICT', name: 'Information Technology', arabic_name: 'تكنولوجيا المعلومات' },
  { id: 4, code: 'PRO', name: 'Prosthetics Technology', arabic_name: 'تكنولوجيا الأطراف الصناعية' },
  { id: 5, code: 'OIL', name: 'Oil Production Technology', arabic_name: 'تكنولوجيا إنتاج البترول' },
  { id: 6, code: 'REN', name: 'Renewable Energy Technology', arabic_name: 'تكنولوجيا الطاقة المتجددة' },
]
```

### مثال على جدول جديد:

```json
{
  \"id\": 1,
  \"title\": \"Schedule Fall 2024 - IT\",
  \"specialty_id\": 3,
  \"file_name\": \"schedule.pdf\",
  \"file_size\": 245897,
  \"file_path\": \"uploads/timetables/schedule_1.pdf\",
  \"created_at\": \"2024-04-13T10:30:00Z\"
}
```

---

## ✅ قائمة التحقق النهائية

- [ ] الخادم يعمل بدون أخطاء
- [ ] Frontend يعمل بدون أخطاء
- [ ] تسجيل الدخول كـ admin نجح
- [ ] الوصول إلى `/admin/timetables` بدون تحويل
- [ ] الألوان صحيحة وتطابق index.css
- [ ] إضافة جدول جديد تم بنجاح
- [ ] تحرير جدول تم بنجاح
- [ ] عرض ملف PDF يعمل
- [ ] حذف جدول تم بنجاح
- [ ] الجدول يعرض البيانات بشكل صحيح
- [ ] لا توجد أخطاء في Console

---

## 🔗 الروابط المهمة

- تسجيل الدخول: http://localhost:5173/login
- صفحة الجداول: http://localhost:5173/admin/timetables
- لوحة التحكم: http://localhost:5173/admin
- DevTools: F12 أو Ctrl+Shift+I

---

## 📝 ملاحظات

- إذا وجدت مشاكل، تحقق من Console في DevTools
- احفظ سجل الأخطاء (Copy as cURL) لمساعدة أسهل
- تأكد من وجود ملف PDF قبل الاختبار
- استخدم ملفات PDF صغيرة (< 5MB)
