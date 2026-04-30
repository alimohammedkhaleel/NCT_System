# 🚀 ابدأ من هنا - اختبار نظام انتقال الطلاب

## ⚡ التشغيل السريع (3 خطوات فقط!)

### 1️⃣ تثبيت Playwright
\`\`\`bash
npm install -D playwright @playwright/test
npx playwright install chromium
\`\`\`

### 2️⃣ تشغيل الموقع
\`\`\`bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend  
cd client/frontend
npm run dev
\`\`\`

### 3️⃣ تشغيل الاختبار
\`\`\`bash
# الاختبار السريع (5 دقائق)
node test-browser-quick.js

# أو الاختبار الشامل (15 دقيقة)
npx playwright test tests/e2e/student-year-progression.spec.js --headed
\`\`\`

---

## 📚 الملفات المهمة

| الملف | الوصف |
|------|-------|
| `RUN_TESTS_NOW.md` | 🚀 دليل تشغيل الاختبارات |
| `BROWSER_POWER_INSTALLATION.md` | 🌐 دليل تثبيت Browser Power |
| `TESTING_SUMMARY.md` | 📋 ملخص شامل للاختبارات |
| `test-browser-quick.js` | ⚡ اختبار سريع (5 دقائق) |
| `tests/e2e/student-year-progression.spec.js` | 🎓 اختبار شامل (15 دقيقة) |

---

## 🎯 ماذا سيختبر؟

### الاختبار السريع
- ✅ فتح الموقع
- ✅ تسجيل الدخول كـ Admin
- ✅ فتح صفحة إدارة الطلاب
- ✅ فحص لوحة النقل الجماعي
- ✅ التقاط صورة

### الاختبار الشامل
1. ✅ إضافة 3 طلاب (سيناريوهات مختلفة)
2. ✅ إضافة دكتور
3. ✅ دفع المصاريف
4. ✅ إدخال الدرجات
5. ✅ نشر النتائج
6. ✅ النقل للترم الثاني
7. ✅ النقل للسنة الجديدة
8. ✅ التحقق من الحالات
9. ✅ عرض الدرجات

---

## 🔧 استكشاف الأخطاء

### ❌ "Cannot find module 'playwright'"
\`\`\`bash
npm install -D playwright @playwright/test
npx playwright install chromium
\`\`\`

### ❌ "net::ERR_CONNECTION_REFUSED"
تأكد من تشغيل الموقع على `http://localhost:5173`

### ❌ "Timeout waiting for selector"
تحقق من بيانات تسجيل الدخول في الكود

---

## 📞 المساعدة

راجع الملفات التالية للتفاصيل:
- `RUN_TESTS_NOW.md` - دليل التشغيل الكامل
- `TESTING_SUMMARY.md` - ملخص شامل
- `BROWSER_POWER_INSTALLATION.md` - تثبيت Browser Power

---

## 🎉 جاهز للبدء!

\`\`\`bash
node test-browser-quick.js
\`\`\`

**سيفتح المتصفح تلقائياً ويبدأ الاختبار!** 🚀
