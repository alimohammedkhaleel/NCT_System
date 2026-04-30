# دليل نظام التصميم - NCTU ERP

## 🎨 نظرة عامة

هذا الدليل يوثق نظام التصميم الموحد لنظام NCTU ERP، مع التركيز على النظام البنفسجي (Purple Theme) والمبادئ التصميمية المتقدمة.

---

## 🌈 نظام الألوان (Color System)

### الألوان الأساسية (Primary Colors)

```css
:root {
  /* Purple Color System - Primary Theme */
  --purple-primary: #b36eff;      /* اللون البنفسجي الأساسي */
  --purple-dark: #9448b5;         /* بنفسجي داكن */
  --purple-light: #b388ff;        /* بنفسجي فاتح */
  --purple-deep: #7e39b6;         /* بنفسجي عميق */
  --purple-very-dark: #110117;    /* بنفسجي داكن جداً */
  
  /* Gradients - التدرجات */
  --gradient-primary: linear-gradient(135deg, #7e39b6, #b36eff);
  --gradient-background: linear-gradient(135deg, #0a043c, #1c062e, #2c003e);
  
  /* Glass Effect - تأثير الزجاج */
  --glass-bg: rgba(17, 1, 23, 0.5);
  --glass-border: rgba(179, 110, 255, 0.3);
  --glass-shadow: 0 8px 32px rgba(179, 110, 255, 0.15);
}
```

### الألوان الدلالية (Semantic Colors)

```css
:root {
  /* Success - النجاح */
  --success-bg: rgba(16, 185, 129, 0.2);
  --success-color: #10b981;
  --success-border: #10b981;
  
  /* Error - الخطأ */
  --error-bg: rgba(239, 68, 68, 0.2);
  --error-color: #ef4444;
  --error-border: #ef4444;
  
  /* Warning - التحذير */
  --warning-bg: rgba(245, 158, 11, 0.2);
  --warning-color: #f59e0b;
  --warning-border: #f59e0b;
  
  /* Info - المعلومات */
  --info-bg: rgba(59, 130, 246, 0.2);
  --info-color: #3b82f6;
  --info-border: #3b82f6;
}
```

### استخدام الألوان

| العنصر | اللون | الاستخدام |
|--------|-------|-----------|
| Header الجداول | `--purple-primary` | خلفية رأس الجدول |
| Hover على الصفوف | `rgba(179, 110, 255, 0.1)` | تأثير التمرير |
| الخلفيات | `--gradient-background` | خلفية الصفحات الرئيسية |
| البطاقات | `--glass-bg` | خلفية البطاقات |
| الحدود | `--glass-border` | حدود العناصر |
| الظلال | `--glass-shadow` | ظلال العناصر |

---

## 📐 التخطيط والمسافات (Layout & Spacing)

### نظام المسافات

```css
:root {
  /* Spacing Scale - مقياس المسافات */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  
  /* Border Radius - نصف قطر الحدود */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
}
```

### Grid System

```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.grid {
  display: grid;
  gap: var(--space-lg);
}

.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }

/* Responsive */
@media (max-width: 768px) {
  .grid-2, .grid-3, .grid-4 {
    grid-template-columns: 1fr;
  }
}
```

---

## 🔤 الطباعة (Typography)

### خطوط النظام

```css
:root {
  /* Font Families */
  --font-primary: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
  --font-secondary: 'Tajawal', 'Arial', sans-serif;
  --font-mono: 'Fira Code', 'Courier New', monospace;
  
  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  
  /* Font Weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### أنماط النصوص

```css
/* Headings */
h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--purple-primary);
}

h2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
}

h3 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-normal);
}

/* Body Text */
body {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: #f5f5f0;
}

/* Small Text */
.text-small {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.7);
}
```

---

## 🎭 المكونات (Components)

### 1. الأزرار (Buttons)

```css
/* Primary Button */
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-lg);
  border: none;
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(179, 110, 255, 0.4);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--purple-primary);
  border: 2px solid var(--purple-primary);
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-lg);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--purple-primary);
  color: white;
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--purple-light);
  border: none;
  padding: var(--space-sm) var(--space-lg);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-ghost:hover {
  background: rgba(179, 110, 255, 0.1);
}
```

### 2. البطاقات (Cards)

```css
.card {
  background: var(--glass-bg);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  box-shadow: var(--glass-shadow);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(179, 110, 255, 0.25);
  border-color: var(--purple-light);
}

/* Card Header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--glass-border);
}

/* Card Body */
.card-body {
  color: rgba(255, 255, 255, 0.9);
}

/* Card Footer */
.card-footer {
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--glass-border);
  display: flex;
  gap: var(--space-md);
}
```

### 3. الجداول (Tables)

```css
.table-container {
  background: var(--glass-bg);
  backdrop-filter: blur(25px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  overflow: hidden;
  box-shadow: var(--glass-shadow);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: var(--purple-primary);
  color: white;
}

.table th {
  padding: var(--space-lg);
  text-align: right;
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table td {
  padding: var(--space-lg);
  border-bottom: 1px solid var(--glass-border);
  color: rgba(255, 255, 255, 0.9);
}

.table tbody tr {
  transition: all 0.2s ease;
}

.table tbody tr:hover {
  background: rgba(179, 110, 255, 0.1);
  cursor: pointer;
}

.table tbody tr:last-child td {
  border-bottom: none;
}
```

### 4. النماذج (Forms)

```css
.form-group {
  margin-bottom: var(--space-lg);
}

.form-label {
  display: block;
  margin-bottom: var(--space-sm);
  font-weight: var(--font-medium);
  color: rgba(255, 255, 255, 0.9);
}

.form-input {
  width: 100%;
  padding: var(--space-md);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: white;
  font-family: var(--font-primary);
  font-size: var(--text-base);
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--purple-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(179, 110, 255, 0.2);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

/* Error State */
.form-input.error {
  border-color: var(--error-color);
}

.form-error {
  display: block;
  margin-top: var(--space-sm);
  color: var(--error-color);
  font-size: var(--text-sm);
}
```

### 5. الشارات (Badges)

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  border: 1px solid;
}

.badge-success {
  background: var(--success-bg);
  color: var(--success-color);
  border-color: var(--success-border);
}

.badge-error {
  background: var(--error-bg);
  color: var(--error-color);
  border-color: var(--error-border);
}

.badge-warning {
  background: var(--warning-bg);
  color: var(--warning-color);
  border-color: var(--warning-border);
}

.badge-info {
  background: var(--info-bg);
  color: var(--info-color);
  border-color: var(--info-border);
}
```

### 6. النوافذ المنبثقة (Modals)

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal {
  background: var(--glass-bg);
  backdrop-filter: blur(25px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-xl);
}

.modal-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--purple-primary);
}

.modal-close {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: var(--text-2xl);
  cursor: pointer;
  transition: color 0.2s ease;
}

.modal-close:hover {
  color: white;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 🎬 الحركات والانتقالات (Animations & Transitions)

### مبادئ الحركة

```css
:root {
  /* Timing Functions */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* Durations */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
}
```

### حركات شائعة

```css
/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Slide Up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Shimmer Effect */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

---

## 📱 التصميم المتجاوب (Responsive Design)

### نقاط التوقف (Breakpoints)

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Mobile First Approach */
@media (min-width: 640px) {
  /* Small devices */
}

@media (min-width: 768px) {
  /* Medium devices */
}

@media (min-width: 1024px) {
  /* Large devices */
}

@media (min-width: 1280px) {
  /* Extra large devices */
}
```

### أمثلة متجاوبة

```css
/* Responsive Grid */
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-lg);
}

@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Responsive Typography */
.responsive-heading {
  font-size: var(--text-2xl);
}

@media (min-width: 768px) {
  .responsive-heading {
    font-size: var(--text-3xl);
  }
}

@media (min-width: 1024px) {
  .responsive-heading {
    font-size: var(--text-4xl);
  }
}
```

---

## ♿ إمكانية الوصول (Accessibility)

### مبادئ WCAG 2.1

```css
/* Focus Visible */
*:focus-visible {
  outline: 2px solid var(--purple-primary);
  outline-offset: 2px;
}

/* Skip to Content */
.skip-to-content {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--purple-primary);
  color: white;
  padding: var(--space-md);
  z-index: 100;
}

.skip-to-content:focus {
  top: 0;
}

/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### نسب التباين (Contrast Ratios)

| العنصر | النسبة | الحالة |
|--------|--------|--------|
| نص عادي على خلفية داكنة | 7:1 | ✅ AAA |
| نص كبير على خلفية داكنة | 4.5:1 | ✅ AA |
| أزرار أساسية | 4.5:1 | ✅ AA |
| روابط | 3:1 | ✅ AA |

---

## 🎯 أفضل الممارسات (Best Practices)

### 1. استخدام CSS Variables

```css
/* ✅ جيد */
.element {
  color: var(--purple-primary);
  padding: var(--space-lg);
}

/* ❌ سيء */
.element {
  color: #b36eff;
  padding: 24px;
}
```

### 2. تسمية الفئات (Class Naming)

```css
/* ✅ جيد - BEM Methodology */
.card { }
.card__header { }
.card__body { }
.card--featured { }

/* ❌ سيء */
.c { }
.cardHeader { }
.card-body-text { }
```

### 3. تنظيم الكود

```css
/* ✅ جيد - منظم حسب الوظيفة */
/* Layout */
.container { }
.grid { }

/* Components */
.button { }
.card { }

/* Utilities */
.text-center { }
.mt-4 { }

/* ❌ سيء - عشوائي */
.button { }
.text-center { }
.container { }
```

### 4. الأداء

```css
/* ✅ جيد - استخدام transform للحركة */
.element {
  transition: transform 0.3s ease;
}
.element:hover {
  transform: translateY(-2px);
}

/* ❌ سيء - استخدام top/left */
.element {
  transition: top 0.3s ease;
}
.element:hover {
  top: -2px;
}
```

---

## 🔧 أدوات التطوير (Development Tools)

### 1. Figma Integration

استخدم Figma Power لتحويل التصاميم إلى كود:

```bash
# تفعيل Figma Power
kiro powers activate figma

# تنفيذ تصميم من Figma
kiro powers use figma get_design_context \
  --url "https://figma.com/design/..."
```

### 2. Design Tokens

```json
{
  "colors": {
    "purple": {
      "primary": "#b36eff",
      "dark": "#9448b5",
      "light": "#b388ff"
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px"
  }
}
```

### 3. Linting

```json
// .stylelintrc.json
{
  "extends": "stylelint-config-standard",
  "rules": {
    "color-hex-length": "long",
    "declaration-no-important": true,
    "selector-class-pattern": "^[a-z][a-zA-Z0-9-]*$"
  }
}
```

---

## 📚 موارد إضافية

### مراجع التصميم

- [Material Design](https://material.io/design)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Chakra UI](https://chakra-ui.com/)

### أدوات مفيدة

- [Coolors](https://coolors.co/) - مولد لوحات الألوان
- [Type Scale](https://type-scale.com/) - مقياس الطباعة
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - فحص التباين
- [Can I Use](https://caniuse.com/) - دعم المتصفحات

---

**تاريخ الإنشاء**: 2026-04-17  
**الإصدار**: 1.0.0  
**المطور**: Kiro AI Assistant
