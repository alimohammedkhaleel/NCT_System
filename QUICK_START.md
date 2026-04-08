# 🚀 Quick Start Guide

## الخطوات السريعة لتشغيل النظام

### 1️⃣ إعداد قاعدة البيانات (Terminal 1)
```bash
cd server
npm install
npm run db:reset
```

**النتيجة المتوقعة:**
```
✅ Old database dropped
✅ New database created
✅ All tables created successfully
🎉 Database reset completed!
```

### 2️⃣ تشغيل الخادم (Terminal 1 - بعد reset-db)
```bash
npm start
# أو للتطوير مع auto-reload:
npm run dev
```

**النتيجة المتوقعة:**
```
✅ Database connection established successfully
✅ All tables created successfully
🚀 Server is running on port 5000
```

### 3️⃣ تشغيل الـ frontend (Terminal 2)
```bash
cd client/frontend
npm install
npm run dev
```

**النتيجة المتوقعة:**
```
VITE v5.0.0 running at:
➜ Local:   http://localhost:5173/
```

---

## 4️⃣ اختبار تسجيل الدخول

1. **افتح البراوزر:** http://localhost:5173
2. **انقر على زر Log in**
3. **استخدم البيانات التالية:**
   - Username/Email: `admin`
   - Password: `admin123`
4. **يجب أن تدخل إلى Dashboard**

---

## ⚠️ الأخطاء الشائعة وحلولها

### ❌ "Cannot find module 'bcryptjs'" 
```bash
cd server
npm install
npm run db:reset
```

### ❌ "Error: listen EADDRINUSE :::5000"
```bash
# قتل العملية على port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### ❌ "Cannot GET /api/auth/login"
تأكد من أن الخادم يعمل على `http://localhost:5000`

### ❌ "CORS error"
تأكد من أن:
- الخادم يعمل على port 5000
- الـ frontend يعمل على port 5173
- لا تغير الـ ports

---

## 📁 الملفات المهمة

- **Server**: `server/`
  - `server.js` - الملف الرئيسي للخادم
  - `reset-db.js` - إنشاء/إعادة تعيين قاعدة البيانات
  - `.env` - متغيرات البيئة

- **Frontend**: `client/frontend/`
  - `src/App.jsx` - التطبيق الرئيسي
  - `src/pages/Login.jsx` - صفحة تسجيل الدخول
  - `src/api/auth.js` - خدمة المصادقة
  - `.env` - متغيرات البيئة

---

## 🔧 الأوامر الأساسية

```bash
# تشغيل الخادم
cd server && npm start

# تشغيل الخادم مع auto-reload
cd server && npm run dev

# إعادة تعيين قاعدة البيانات
cd server && npm run db:reset

# تشغيل الـ frontend
cd client/frontend && npm run dev

# بناء الـ frontend للإنتاج
cd client/frontend && npm run build
```

---

## 💡 نصائح

✅ **انتظر 3-5 ثوانِ** بعد بدء الخادم قبل محاولة تسجيل الدخول  
✅ **افتح Developer Tools** (F12) لمراجعة الأخطاء  
✅ **استخدم حاسبة منفصلة** للخادم و frontend  
✅ **تأكد من تثبيت MySQL** ويعمل بشكل صحيح  

---

## 📊 الحالة الحالية

| المكون | الحالة | الملاحظات |
|-------|--------|--------|
| Server | ✅ جاهز | Node.js + Express |
| Database | ✅ جاهز | MySQL Sequelize |
| Authentication | ✅ جاهز | JWT + bcryptjs |
| Frontend | ✅ جاهز | React + Vite |
| Login Page | ✅ جاهز | مع Form Validation |
| Protected Routes | ✅ جاهز | Role-based Access |
| Loading Page | ✅ جاهز | مع GSAP animations |
| Botpress Chat | ⚠️ اختياري | يمكن تفعيله لاحقاً |

---

**للمزيد من التفاصيل، اقرأ SETUP.md** 📖
