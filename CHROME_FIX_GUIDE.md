# حل مشكلة عدم عمل المشروع على Google Chrome

## المشكلة
المشروع يعمل على Opera ولا يعمل على Google Chrome بسبب الـ cache

## الحلول السريعة

### الحل 1: Hard Refresh (الأسرع)
1. افتح المشروع في Chrome
2. اضغط `Ctrl + Shift + Delete`
3. اختر:
   - Time range: **All time**
   - ✅ Cached images and files
   - ✅ Cookies and other site data
4. اضغط "Clear data"
5. أعد تحميل الصفحة بـ `Ctrl + Shift + R`

### الحل 2: فتح DevTools وتعطيل الـ Cache
1. افتح Chrome DevTools بـ `F12`
2. اذهب لـ **Network** tab
3. ✅ فعّل "Disable cache"
4. أعد تحميل الصفحة بـ `Ctrl + R`
5. اترك DevTools مفتوحة أثناء التطوير

### الحل 3: Incognito Mode (للاختبار)
1. اضغط `Ctrl + Shift + N` لفتح نافذة Incognito
2. افتح المشروع: `http://localhost:5173`
3. إذا عمل، المشكلة في الـ cache

### الحل 4: مسح Site Data لـ localhost
1. في Chrome، اذهب لـ: `chrome://settings/content/all`
2. ابحث عن `localhost`
3. اضغط على أيقونة القمامة 🗑️ لحذف كل البيانات
4. أعد تحميل المشروع

## الحل الدائم: تعديل Vite Config

إذا استمرت المشكلة، سأضيف إعدادات لـ Vite لتعطيل الـ cache في التطوير.
