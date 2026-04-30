# 🧪 دليل اختبار الجداول الدراسية

## 🚀 Quick Start

### 1. تشغيل النظام

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client/frontend
npm run dev
```

### 2. الوصول للنظام

- **Admin Panel:** `http://localhost:5173/admin/timetables`
- **Student Portal:** `http://localhost:5173/student/dashboard`

---

## 📋 سيناريوهات الاختبار

### ✅ Scenario 1: رفع جدول جديد (Admin)

**الخطوات:**
1. سجل دخول كـ Admin
2. اذهب إلى `http://localhost:5173/admin/timetables`
3. اضغط على "Upload New Timetable"
4. املأ البيانات:
   - **Title:** "جدول السنة الأولى - الترم الأول"
   - **Specialty:** اختر "تكنولوجيا المعلومات (ICT)"
   - **File:** ارفع ملف PDF
5. اضغط "Upload"

**النتيجة المتوقعة:**
- ✅ رسالة نجاح
- ✅ الجدول يظهر في القائمة
- ✅ يمكن عرض الملف

---

### ✅ Scenario 2: عرض الجداول (Student)

**الخطوات:**
1. سجل دخول كطالب من تخصص ICT
2. اذهب إلى `http://localhost:5173/student/dashboard`
3. اضغط على تاب "جدولي الدراسي"

**النتيجة المتوقعة:**
- ✅ يظهر الجدول المرفوع
- ✅ تظهر جميع المعلومات:
  - العنوان
  - Badge التخصص
  - اسم الملف
  - حجم الملف
  - تاريخ الرفع بالعربي
- ✅ أيقونة التقويم تظهر
- ✅ زر "عرض الجدول" يعمل

---

### ✅ Scenario 3: Hover Effects

**الخطوات:**
1. في صفحة Student Portal
2. مرر الماوس على كارت الجدول

**النتيجة المتوقعة:**
- ✅ الكارت يرتفع قليلاً (translateY)
- ✅ الأيقونة تتكبر
- ✅ الحدود تضيء (glow effect)
- ✅ خط جانبي gradient يظهر على اليمين
- ✅ Shadow يزداد

---

### ✅ Scenario 4: Empty State

**الخطوات:**
1. سجل دخول كطالب من تخصص ليس له جداول
2. اذهب إلى تاب "جدولي الدراسي"

**النتيجة المتوقعة:**
- ✅ أيقونة تقويم كبيرة (📅)
- ✅ عنوان "لا توجد جداول دراسية"
- ✅ رسالة توضيحية
- ✅ Animation (float effect)

---

### ✅ Scenario 5: فتح الملف

**الخطوات:**
1. في صفحة Student Portal
2. اضغط على زر "عرض الجدول"

**النتيجة المتوقعة:**
- ✅ الملف يفتح في نافذة جديدة
- ✅ الرابط صحيح: `http://localhost:5000/uploads/timetables/...`
- ✅ الملف يعرض بشكل صحيح

---

### ✅ Scenario 6: Responsive Design

**الخطوات:**
1. افتح صفحة Student Portal
2. غيّر حجم النافذة

**النتيجة المتوقعة:**

**Desktop (> 768px):**
- ✅ Layout أفقي
- ✅ الأيقونة على اليسار
- ✅ المحتوى في المنتصف
- ✅ الزر على اليمين

**Tablet (≤ 768px):**
- ✅ Layout عمودي
- ✅ الأيقونة في المنتصف
- ✅ المحتوى مكدس
- ✅ الزر بعرض كامل

**Mobile (≤ 480px):**
- ✅ خطوط أصغر
- ✅ Spacing مضغوط
- ✅ كل شيء مكدس عمودياً

---

### ✅ Scenario 7: عدة جداول

**الخطوات:**
1. ارفع 3 جداول مختلفة لنفس التخصص
2. سجل دخول كطالب من هذا التخصص
3. اذهب إلى تاب "جدولي الدراسي"

**النتيجة المتوقعة:**
- ✅ جميع الجداول تظهر
- ✅ مرتبة حسب تاريخ الإنشاء (الأحدث أولاً)
- ✅ كل جدول في كارت منفصل
- ✅ Spacing متساوي بين الكروت

---

### ✅ Scenario 8: تخصصات مختلفة

**الخطوات:**
1. ارفع جدول لـ ICT
2. ارفع جدول لـ MCT
3. سجل دخول كطالب ICT
4. تحقق من الجداول

**النتيجة المتوقعة:**
- ✅ الطالب يرى جدول ICT فقط
- ✅ لا يرى جدول MCT

---

## 🎨 Visual Checklist

### Colors & Styling:
- [ ] Background: Glass morphism effect
- [ ] Border: Purple gradient
- [ ] Shadow: Purple glow
- [ ] Text: White with shadow
- [ ] Badge: Purple with border
- [ ] Button: Gradient (purple → light purple)

### Icons:
- [ ] Calendar icon (SVG) في الكارت
- [ ] File icon (SVG) في اسم الملف
- [ ] Download icon (SVG) في حجم الملف
- [ ] Calendar icon (SVG) في التاريخ
- [ ] Eye icon (SVG) في زر العرض

### Animations:
- [ ] Float animation على الأيقونة الرئيسية
- [ ] Hover transition على الكارت
- [ ] Scale effect على الأيقونة عند hover
- [ ] Opacity transition على الخط الجانبي

---

## 🐛 Common Issues & Solutions

### Issue 1: الجداول لا تظهر
**الحل:**
```javascript
// تحقق من specialty_id في database
SELECT * FROM students WHERE user_id = ?;
SELECT * FROM timetables WHERE specialty_id = ?;
```

### Issue 2: الملف لا يفتح
**الحل:**
```javascript
// تحقق من file_url في database
SELECT file_url FROM timetables WHERE id = ?;

// تحقق من وجود الملف
ls server/uploads/timetables/
```

### Issue 3: الأيقونات لا تظهر
**الحل:**
- تحقق من أن SVG code صحيح
- تحقق من CSS للـ `.sp-timetable-icon`
- افتح Developer Tools → Console

### Issue 4: Hover effects لا تعمل
**الحل:**
- تحقق من CSS transitions
- تحقق من أن الكلاسات صحيحة
- افتح Developer Tools → Elements

---

## 📊 Performance Testing

### Load Time:
```bash
# في Developer Tools → Network
- Initial load: < 2s
- Timetables API: < 500ms
- PDF file: depends on size
```

### Memory Usage:
```bash
# في Developer Tools → Performance
- Heap size: < 50MB
- No memory leaks
```

---

## ✅ Final Checklist

قبل اعتبار الاختبار مكتمل، تأكد من:

### Functionality:
- [ ] رفع الجداول يعمل (Admin)
- [ ] عرض الجداول يعمل (Student)
- [ ] فتح الملفات يعمل
- [ ] الفلترة حسب التخصص تعمل
- [ ] Empty state يظهر عند عدم وجود جداول

### Design:
- [ ] Glass morphism effect يظهر
- [ ] الأيقونات تظهر بشكل صحيح
- [ ] Badge التخصص يظهر
- [ ] الألوان صحيحة
- [ ] Spacing متناسق

### Interactions:
- [ ] Hover effects تعمل
- [ ] Animations smooth
- [ ] Transitions سلسة
- [ ] Buttons responsive

### Responsive:
- [ ] Desktop layout صحيح
- [ ] Tablet layout صحيح
- [ ] Mobile layout صحيح
- [ ] لا يوجد overflow
- [ ] النصوص قابلة للقراءة

### Accessibility:
- [ ] Title attributes موجودة
- [ ] Semantic HTML
- [ ] Keyboard navigation
- [ ] Screen reader friendly

### Performance:
- [ ] Load time < 2s
- [ ] No console errors
- [ ] No memory leaks
- [ ] Smooth scrolling

---

## 🎯 Test Data

### Sample Timetable:
```json
{
  "title": "جدول السنة الأولى - الترم الأول 2024-2025",
  "specialty_id": 3,
  "file": "ICT_Y1_S1_2024.pdf"
}
```

### Sample Student:
```json
{
  "full_name": "أحمد محمد",
  "student_code": "ICT2024001",
  "specialty_id": 3,
  "current_year": 1
}
```

---

## 📸 Screenshots Checklist

التقط screenshots لـ:
- [ ] Desktop view - with timetables
- [ ] Desktop view - empty state
- [ ] Desktop view - hover effect
- [ ] Tablet view
- [ ] Mobile view
- [ ] Admin upload modal
- [ ] PDF viewer

---

## 🚀 Ready for Production?

قبل النشر، تأكد من:
- [ ] جميع الاختبارات نجحت
- [ ] لا توجد console errors
- [ ] Build يعمل بدون warnings
- [ ] Performance مقبول
- [ ] Responsive على جميع الأجهزة
- [ ] Accessibility compliant
- [ ] Documentation كامل

---

**تاريخ الإنشاء:** 2026-04-22  
**الحالة:** ✅ جاهز للاختبار
