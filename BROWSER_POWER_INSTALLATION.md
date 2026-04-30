# 🌐 دليل تثبيت Browser Power - خطوة بخطوة

## ✅ الخطوات المكتملة

تم بالفعل:
1. ✅ تحميل browser-kirospace من GitLab
2. ✅ تثبيت dependencies (`npm install`)
3. ✅ بناء المشروع (`npm run build`)
4. ✅ نسخ Power إلى `~/.kiro/powers/repos/browser/`

## 🔄 الخطوات المتبقية

### الخطوة 1: إعادة تشغيل Kiro

**يجب إعادة تشغيل Kiro لتحميل Browser Power الجديد:**

1. أغلق Kiro تماماً
2. أعد فتح Kiro
3. افتح هذا المشروع مرة أخرى

### الخطوة 2: التحقق من التثبيت

بعد إعادة التشغيل، تحقق من أن Browser Power ظهر:

```bash
# في Kiro Chat
اكتب: "list all powers"
```

يجب أن ترى:
- ✅ browser (جديد!)
- postman
- figma
- design-system-scaffold
- aws-transform

### الخطوة 3: تفعيل Browser Power

```bash
# في Kiro Chat
اكتب: "activate browser power"
```

## 🎯 البديل الفوري: استخدام Playwright مباشرة

إذا كنت تريد الاختبار **الآن** بدون انتظار إعادة التشغيل:

### 1. تثبيت Playwright

\`\`\`bash
npm install -D @playwright/test
npx playwright install chromium
\`\`\`

### 2. تشغيل الاختبار الشامل

\`\`\`bash
npx playwright test tests/e2e/student-year-progression.spec.js --headed
\`\`\`

## 📦 هيكل Browser Power المثبت

\`\`\`
~/.kiro/powers/repos/browser/
├── POWER.md              # التوثيق
├── mcp.json              # تكوين MCP Servers
└── steering/
    └── playwright-paths.md
\`\`\`

## 🔧 استكشاف الأخطاء

### المشكلة: Browser Power لا يظهر بعد إعادة التشغيل

**الحل:**
\`\`\`bash
# تحقق من المسار
ls ~/.kiro/powers/repos/browser/

# يجب أن ترى:
# - POWER.md
# - mcp.json
# - steering/
\`\`\`

### المشكلة: خطأ "Power 'browser' is not installed"

**الحل:**
1. تأكد من إعادة تشغيل Kiro **بالكامل**
2. تحقق من وجود ملف `POWER.md` في المسار الصحيح
3. جرب فتح لوحة Powers: Command Palette → "Powers: Configure"

### المشكلة: MCP Server لا يعمل

**الحل:**
\`\`\`bash
# تثبيت Playwright MCP
npm install -g @playwright/mcp

# تثبيت Browser Alternative
npm install -g @renfeng/kiro-browser-alternative
\`\`\`

## 🚀 الاختبار السريع

بعد تفعيل Browser Power:

\`\`\`javascript
// في Kiro Chat
"افتح http://localhost:5173 في المتصفح"
\`\`\`

يجب أن يفتح المتصفح تلقائياً!

## 📚 الأدوات المتاحة

بعد التفعيل، ستتوفر هذه الأدوات:

### Playwright Tools
- `browser_navigate` - التنقل لصفحة
- `browser_click` - النقر على عنصر
- `browser_fill_form` - ملء نموذج
- `browser_snapshot` - أخذ snapshot للصفحة
- `browser_take_screenshot` - التقاط صورة
- `browser_evaluate` - تنفيذ JavaScript
- `browser_console_messages` - قراءة console
- `browser_network_requests` - مراقبة الشبكة

### CDP Alternative Tools (للمتصفح المفتوح مسبقاً)
- `cdp_list_tabs` - عرض التبويبات المفتوحة
- `cdp_navigate` - التنقل في تبويب موجود
- `cdp_screenshot` - التقاط صورة
- `cdp_evaluate` - تنفيذ JavaScript
- `cdp_reload` - إعادة تحميل الصفحة

## ✨ أمثلة الاستخدام

### مثال 1: فتح الموقع واختباره

\`\`\`
افتح http://localhost:5173 وسجل دخول كـ admin
\`\`\`

### مثال 2: اختبار نموذج

\`\`\`
افتح صفحة إضافة طالب واملأ النموذج
\`\`\`

### مثال 3: التقاط صورة

\`\`\`
خذ screenshot للصفحة الحالية
\`\`\`

## 🎓 الخطوات التالية

بعد تثبيت Browser Power بنجاح:

1. ✅ اختبر فتح الموقع
2. ✅ اختبر تسجيل الدخول
3. ✅ اختبر إضافة طالب
4. ✅ اختبر نظام النقل الجماعي
5. ✅ اختبر عرض الدرجات

---

**ملاحظة مهمة:** Browser Power يعتمد على MCP (Model Context Protocol) ويحتاج إعادة تشغيل Kiro لتحميله. إذا كنت تريد الاختبار الفوري، استخدم Playwright مباشرة كما هو موضح أعلاه.
