# 🔧 Troubleshooting Guide

## الأخطاء الشائعة والحلول

---

## 🌐 Server Issues

### Issue 1: "خطأ في الخادم أثناء تسجيل الدخول" (500 Error)

**الأسباب المحتملة:**
1. قاعدة البيانات لم يتم إنشاؤها
2. جداول قاعدة البيانات غير موجودة
3. MySQL server لا يعمل
4. متغيرات البيئة غير معرفة بشكل صحيح

**الحل:**
```bash
# 1. تأكد من تشغيل MySQL
# Windows: تحقق من Services > MySQL80

# 2. احذف قاعدة البيانات القديمة وأنشئ جديدة
cd server
npm run db:reset

# 3. تحقق من .env يحتوي على البيانات الصحيحة:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=
# DB_NAME=nctu_erp

# 4. أعد تشغيل الخادم
npm start
```

---

### Issue 2: "Cannot find module 'bcryptjs'"

**السبب:** البرامج المطلوبة لم يتم تثبيتها

**الحل:**
```bash
cd server
npm install
```

---

### Issue 3: "listen EADDRINUSE :::5000"

**السبب:** بوابة 5000 مستخدمة بالفعل من عملية أخرى

**الحل:**

**Windows:**
```bash
# ابحث عن العملية على port 5000
netstat -ano | findstr :5000

# قتل العملية (استبدل PID برقم العملية)
taskkill /PID <PID> /F

# أو غير الـ PORT في .env
# PORT=5001
```

**Mac/Linux:**
```bash
# قتل العملية على port 5000
lsof -ti:5000 | xargs kill -9
```

---

### Issue 4: "Error: ENOENT: no such file or directory, open '.env'"

**السبب:** ملف .env لم يتم إنشاؤه

**الحل:**
```bash
# ملفات .env موجودة بالفعل:
cd server
cat .env  # تحقق من وجودها

# إذا لم توجد، أعد تشغيل setup:
npm run db:reset
```

---

### Issue 5: "ER_ACCESS_DENIED_ERROR: Access denied for user 'root'@'localhost'"

**السبب:** بيانات اعتماد MySQL غير صحيحة

**الحل:**
```bash
# تحقق من بيانات الاعتماد الخاصة بك
mysql -u root -p

# إذا كانت كلمة المرور مختلفة، حدثها في .env:
# DB_PASSWORD=your_actual_password

# أو أعد تعيين كلمة المرور:
# Windows Command Prompt:
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
mysqld --skip-grant-tables
```

---

## 🎨 Frontend Issues

### Issue 6: "Failed to load resource: 404" (authComponent)

**السبب:** محاولة تحميل ملفات محذوفة

**الحل:**
تم حذف `components/authComponent/` بنجاح. هذا خطأ في HMR (Hot Module Reload)

```bash
# امسح الـ cache وأعد تحميل الصفحة
# CTRL+SHIFT+DEL (مسح الـ cache)
# ثم F5 (تحديث الصفحة)

# أو أعد تشغيل dev server:
cd client/frontend
npm run dev
```

---

### Issue 7: "CORS error: 'Access-Control-Allow-Origin'"

**السبب:** الخادم والـ frontend على ports مختلفة أو CORS غير مفعل

**الحل:**
```bash
# تأكد من:
# 1. Server يعمل على http://localhost:5000
# 2. Frontend يعمل على http://localhost:5173
# 3. في server/.env:
#    CLIENT_URL=http://localhost:5173
#    CORS_ORIGIN=http://localhost:5173

# 4. أعد تشغيل الخادم
```

---

### Issue 8: "Botpress chat not loading" or "process is not defined"

**السبب:** Botpress config غير صحيح (اختياري)

**الحل:**
```bash
# لا تقلق، Botpress Chat اختياري
# يمكن تفعيله لاحقاً بـ valid Bot ID

# أو عطله مؤقتاً في App.jsx:
# export default App;  // بدون <BotpressChat />
```

---

### Issue 9: "Input elements should have autocomplete attributes"

**الحل:** خاصية autocomplete موجودة بالفعل في Login.jsx

```jsx
<input
  type="password"
  autoComplete="current-password"  // ✅ معريّفة
  ...
/>
```

---

### Issue 10: BLANK page or "Module not found"

**السبب:** خطأ في syntax أو import غير صحيح

**الحل:**
```bash
# 1. افتح DevTools (F12) وتحقق من الأخطاء
# 2. افحص:
#    - Client console
#    - Network tab
#    - Application > Errors

# 3. إذا لم تجد شيء، أعد التثبيت:
cd client/frontend
rm -rf node_modules
npm install
npm run dev
```

---

## 🔐 Authentication Issues

### Issue 11: "بيانات المستخدم غير صحيحة"

**الأسباب المحتملة:**
1. اسم المستخدم أو البريد غير موجود
2. كلمة المرور غير صحيحة
3. المستخدم غير مفعل (is_active = 0)

**الحل:**
```bash
# استخدم البيانات الصحيحة:
# Username: admin
# Password: admin123

# أو أنشئ مستخدم جديد من خلال قاعدة البيانات:
mysql -u root nctu_erp

# ثم:
INSERT INTO users (username, email, password_hash, full_name, user_type, is_active, created_at, updated_at)
VALUES ('testuser', 'test@test.com', '$2a$12$...', 'Test User', 'student', 1, NOW(), NOW());
```

---

### Issue 12: "Access token is required" in protected routes

**السبب:** Token غير محفوظ في localStorage

**الحل:**
```jsx
// تأكد من أن Login.jsx يحفظ الـ token:
const apiLogin = async (username, password) => {
  const response = await axios.post('/api/auth/login', { username, password });
  if (response.data.success) {
    localStorage.setItem('token', response.data.data.token);  // ✅ مهم
    return response.data;
  }
};
```

---

## 📊 Database Issues

### Issue 13: "ER_NO_REFERENCED_TABLE"

**السبب:** Foreign key يشير إلى جدول غير موجود

**الحل:**
```bash
# أعد تعيين قاعدة البيانات:
cd server
npm run db:reset

# هذا سيحذف جميع البيانات!
```

---

### Issue 14: "Table 'nctu_erp.users' doesn't exist"

**السبب:** لم يتم تشغيل reset-db.js

**الحل:**
```bash
cd server
npm run db:reset
npm start
```

---

## 🔍 Debugging Tips

### 1. تحقق من server logs
```bash
# شغل الخادم مع logging مفصل:
cd server
npm run dev  # يستخدم nodemon مع logging
```

### 2. تحقق من Network requests
```
1. افتح DevTools (F12)
2. اذهب إلى Network tab
3. ادخل بيانات تسجيل الدخول
4. شاهد الـ request/response
5. ابحث عن الأخطاء في Status code و Response body
```

### 3. تحقق من Database
```bash
mysql -u root nctu_erp

# قائمة الجداول:
SHOW TABLES;

# فحص جدول المستخدمين:
SELECT * FROM users;

# البحث عن مستخدم محدد:
SELECT * FROM users WHERE username='admin';

# تحديث كلمة المرور:
UPDATE users SET password_hash='$2a$12$...' WHERE username='admin';
```

---

## 📞 الخطوات النهائية

إذا لم تحل المشكلة:

1. **احذف كل شيء وابدأ من الصفر:**
   ```bash
   # احذف node_modules والـ .env
   cd server
   rm -rf node_modules
   npm install
   npm run db:reset
   npm start
   
   cd ../client/frontend
   rm -rf node_modules
   npm install
   npm run dev
   ```

2. **افتح Issue على GitHub** مع:
   - رسالة الخطأ الكاملة
   - خطوات إعادة الإنتاج
   - Environment (Windows/Mac/Linux)
   - Node.js + npm versions: `node -v && npm -v`

3. **تحقق من:**
   - جميع الملفات موجودة كما هي
   - الـ paths صحيحة
   - الـ ports آمنة وغير مستخدمة

---

## ✅ التحقق من النظام

للتأكد من أن كل شيء يعمل بشكل صحيح:

```bash
# 1. الخادم يستجيب
curl http://localhost:5000/api/health

# 2. يجب أن ترى:
# {"status":"OK","timestamp":"2024-04-07T..."}

# 3. اختبر تسجيل الدخول
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 4. يجب أن ترى token في الـ response
```

---

**آخر تحديث:** 7 أبريل 2026
