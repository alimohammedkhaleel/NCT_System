# 🎯 دليل الاختبار الشامل - NCTU ERP System

## 📋 نظرة عامة

تم إنشاء مجموعة شاملة من ملفات الاختبار لنظام NCTU ERP تغطي جميع الوظائف الرئيسية:

✅ **اختبار انتقال الطلاب للسنة الدراسية الجديدة**
✅ **اختبار لوحة تحكم الدكتور**
✅ **اختبار لوحة تحكم المحاسب**
✅ **اختبار لوحة تحكم الطالب**
✅ **بيانات تسجيل دخول جاهزة لجميع الأدوار**

---

## 🚀 البدء السريع (دقيقة واحدة)

### 1. تشغيل السيرفر

```bash
cd server
npm start
```

### 2. اختبار سريع

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

✅ **إذا حصلت على استجابة بها `"success": true`، النظام يعمل!**

---

## 📚 الملفات المتاحة

| الملف | الوصف | الحجم | الأولوية |
|------|-------|-------|---------|
| **START_TESTING.md** | ابدأ الاختبار فوراً - الأسرع | متوسط | ⭐⭐⭐⭐⭐ |
| **TEST_CREDENTIALS.txt** | بيانات تسجيل الدخول فقط | صغير | ⭐⭐⭐⭐⭐ |
| **TESTING_README.md** | دليل سريع مختصر | صغير | ⭐⭐⭐⭐ |
| **POSTMAN_TEST_GUIDE.md** | دليل Postman الشامل | كبير | ⭐⭐⭐⭐ |
| **QUICK_TEST_COMMANDS.md** | أوامر وسكريبتات جاهزة | متوسط | ⭐⭐⭐ |
| **TEST_DATA.md** | بيانات اختبار تفصيلية | كبير | ⭐⭐⭐ |
| **TESTING_SUMMARY.md** | ملخص شامل للعملية | كبير | ⭐⭐ |

---

## 🔐 بيانات تسجيل الدخول السريعة

### للنسخ واللصق المباشر:

```
Admin:      username: admin         password: admin123
Professor:  username: professor     password: professor123
Student:    student_code: NCTU-26-001   national_id: 30001011234567
Accountant: username: accountant    password: accountant123
```

**للتفاصيل الكاملة:** راجع `TEST_CREDENTIALS.txt`

---

## 🎯 اختيار الملف المناسب

### أريد البدء فوراً (5 دقائق)
👉 **START_TESTING.md**
- سكريبتات جاهزة للتشغيل
- اختبارات سريعة لجميع الأدوار
- نتائج فورية

### أريد استخدام Postman
👉 **POSTMAN_TEST_GUIDE.md**
- دليل خطوة بخطوة
- إعداد Environment
- سيناريوهات كاملة

### أريد أوامر Terminal فقط
👉 **QUICK_TEST_COMMANDS.md**
- أوامر cURL
- سكريبتات Bash
- سكريبتات PowerShell

### أريد بيانات للتسجيل
👉 **TEST_DATA.md**
- 6 طلاب جاهزين
- بيانات فواتير
- بيانات درجات
- 3 سيناريوهات كاملة

### أريد فهم العملية الكاملة
👉 **TESTING_SUMMARY.md**
- شرح تفصيلي
- مؤشرات النجاح
- استكشاف الأخطاء

---

## 🧪 الاختبارات الرئيسية

### ✅ 1. اختبار تسجيل الدخول (30 ثانية)

```bash
# Admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Professor
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"professor","password":"professor123"}'

# Student
curl -X POST http://localhost:5000/api/auth/student-login \
  -H "Content-Type: application/json" \
  -d '{"student_code":"NCTU-26-001","national_id":"30001011234567"}'

# Accountant
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"accountant","password":"accountant123"}'
```

### ✅ 2. اختبار نقل الطلاب (دقيقتان)

```bash
# 1. تسجيل دخول المدير
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.data.token')

# 2. نقل الطلاب من السنة 1 إلى السنة 2
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

### ✅ 3. اختبار لوحة تحكم الدكتور (دقيقة)

```bash
# 1. تسجيل دخول الدكتور
PROF_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"professor","password":"professor123"}' \
  | jq -r '.data.token')

# 2. عرض لوحة التحكم
curl -X GET http://localhost:5000/api/grades/professor/dashboard \
  -H "Authorization: Bearer $PROF_TOKEN"

# 3. عرض المقررات
curl -X GET http://localhost:5000/api/grades/professor/courses \
  -H "Authorization: Bearer $PROF_TOKEN"
```

### ✅ 4. اختبار لوحة تحكم المحاسب (دقيقة)

```bash
# 1. تسجيل دخول المحاسب
ACC_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"accountant","password":"accountant123"}' \
  | jq -r '.data.token')

# 2. عرض الطلاب
curl -X GET http://localhost:5000/api/accountant/students \
  -H "Authorization: Bearer $ACC_TOKEN"
```

### ✅ 5. اختبار لوحة تحكم الطالب (دقيقة)

```bash
# 1. تسجيل دخول الطالب
STUDENT_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/student-login \
  -H "Content-Type: application/json" \
  -d '{"student_code":"NCTU-26-001","national_id":"30001011234567"}' \
  | jq -r '.data.token')

# 2. عرض بيانات الطالب
curl -X GET http://localhost:5000/api/student/data \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

---

## 📊 سكريبت اختبار شامل

### Linux/Mac

احفظ في `test_all.sh` ثم:

```bash
chmod +x test_all.sh
./test_all.sh
```

**السكريبت الكامل موجود في:** `START_TESTING.md`

### Windows PowerShell

احفظ في `test_all.ps1` ثم:

```powershell
.\test_all.ps1
```

**السكريبت الكامل موجود في:** `START_TESTING.md`

---

## 🎓 سيناريوهات الاختبار الكاملة

### السيناريو 1: دورة حياة طالب كاملة (10 دقائق)

1. المدير ينشئ رابط تسجيل
2. الطالب يسجل عبر الرابط
3. المدير يوافق على الطلب
4. المحاسب ينشئ فاتورة
5. المحاسب يسجل دفعة
6. الدكتور يدخل درجات
7. المدير ينشر النتائج
8. الطالب يرى درجاته
9. المدير ينقل الطالب للسنة التالية

**للتفاصيل:** `POSTMAN_TEST_GUIDE.md` - السيناريو 1

### السيناريو 2: طالب لم يدفع (5 دقائق)

1. المحاسب ينشئ فاتورة
2. الطالب يحاول رؤية الدرجات ❌ (يتم الرفض)
3. المحاسب يسجل دفعة جزئية
4. الطالب يحاول رؤية الدرجات ❌ (يتم الرفض)
5. المحاسب يسجل الدفعة المتبقية
6. الطالب يرى درجاته ✅

**للتفاصيل:** `TEST_DATA.md` - السيناريو 2

### السيناريو 3: طالب راسب (5 دقائق)

1. الدكتور يدخل درجة راسبة (F)
2. المدير ينشر النتائج
3. الطالب يرى درجته الراسبة
4. المدير يحاول نقل الطالب ❌ (يتم الرفض)
5. الطالب يعيد المقرر
6. الدكتور يدخل درجة جديدة (D)
7. المدير ينقل الطالب ✅

**للتفاصيل:** `TEST_DATA.md` - السيناريو 3

---

## ✅ قائمة التحقق

```
□ السيرفر يعمل على http://localhost:5000
□ تسجيل دخول Admin يعمل
□ تسجيل دخول Professor يعمل
□ تسجيل دخول Student يعمل
□ تسجيل دخول Accountant يعمل
□ لوحة تحكم الدكتور تعمل
□ لوحة تحكم الطالب تعمل
□ لوحة تحكم المحاسب تعمل
□ نقل الطلاب للسنة الجديدة يعمل
```

---

## 🐛 استكشاف الأخطاء

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

السيرفر يقوم تلقائياً بإنشاء البيانات الأولية عند أول تشغيل.

إذا كنت بحاجة لإعادة إنشاء البيانات، أعد تشغيل السيرفر.

---

## 📞 المساعدة والدعم

### للمزيد من التفاصيل:

1. **START_TESTING.md** - للبدء الفوري
2. **TEST_CREDENTIALS.txt** - لبيانات تسجيل الدخول
3. **POSTMAN_TEST_GUIDE.md** - لدليل Postman
4. **QUICK_TEST_COMMANDS.md** - للأوامر والسكريبتات
5. **TEST_DATA.md** - للبيانات التفصيلية
6. **TESTING_SUMMARY.md** - للملخص الشامل

### إذا واجهت مشكلة:

1. تحقق من logs السيرفر
2. استخدم Postman Console (Ctrl + Alt + C)
3. راجع ملفات الاختبار أعلاه
4. تأكد من تشغيل السيرفر على المنفذ الصحيح

---

## 🎯 الخطوات التالية

بعد الانتهاء من الاختبار:

1. ✅ وثق أي مشاكل وجدتها
2. ✅ احفظ Postman Collection للاستخدام المستقبلي
3. ✅ راجع النتائج في قاعدة البيانات
4. ✅ شارك النتائج مع الفريق

---

## 📊 ملخص الملفات

```
📁 ملفات الاختبار (7 ملفات)
│
├── 🚀 START_TESTING.md          (ابدأ هنا - الأسرع)
├── 🔐 TEST_CREDENTIALS.txt      (بيانات تسجيل الدخول)
├── 📖 TESTING_README.md         (دليل سريع)
├── 📮 POSTMAN_TEST_GUIDE.md     (دليل Postman)
├── ⚡ QUICK_TEST_COMMANDS.md    (أوامر وسكريبتات)
├── 📊 TEST_DATA.md              (بيانات تفصيلية)
└── 📋 TESTING_SUMMARY.md        (ملخص شامل)
```

---

## 🎉 تهانينا!

لديك الآن مجموعة شاملة من ملفات الاختبار التي تغطي:

✅ **7 ملفات توثيق كاملة**
✅ **5 اختبارات رئيسية**
✅ **3 سيناريوهات كاملة**
✅ **4 أدوار مستخدمين**
✅ **سكريبتات تلقائية للينكس وويندوز**

---

**🚀 ابدأ الآن!**

افتح `START_TESTING.md` وابدأ الاختبار في دقيقتين!

---

**تم إنشاء هذا الدليل بواسطة Kiro AI**
**التاريخ: 24 أبريل 2026**

---

## 📝 ملاحظات مهمة

1. **جميع الملفات باللغة العربية** لسهولة الفهم
2. **أوامر جاهزة للنسخ واللصق** - لا حاجة للتعديل
3. **سكريبتات تلقائية** لتوفير الوقت
4. **بيانات جاهزة** لجميع السيناريوهات
5. **دعم Linux, Mac, Windows** - يعمل على جميع الأنظمة

---

## 🔗 روابط سريعة

- **Base URL:** http://localhost:5000
- **API Docs:** (إذا كان متاحاً)
- **Admin Panel:** (إذا كان متاحاً)

---

**نتمنى لك اختباراً موفقاً! 🎯**
