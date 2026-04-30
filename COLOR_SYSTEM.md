# 🎨 نظام الألوان - NCTU ERP System

## نظرة عامة

نظام الألوان البنفسجي الموحد لنظام NCTU ERP. جميع الألوان معرّفة كمتغيرات CSS في `client/frontend/src/index.css`.

---

## 🎨 الألوان الأساسية

### Purple Color System

```css
:root {
  /* الألوان البنفسجية الرئيسية */
  --purple-primary: #b36eff;              /* اللون الرئيسي */
  --purple-dark: #9448b5;                 /* البنفسجي الغامق */
  --purple-light: #b388ff;                /* البنفسجي الفاتح */
  --purple-deep: #7e39b6;                 /* البنفسجي العميق */
  --purple-very-dark: #110117;            /* خلفية داكنة جداً */
  
  /* الألوان المساعدة */
  --white: #ffffff;                        /* النصوص البيضاء */
  --white-dim: rgba(255,255,255,0.8);     /* نص أبيض شفاف */
  --purple-transparent: rgba(179,110,255,0.1); /* خلفية شفافة */
  --glow-purple: rgba(179,110,255,0.6);   /* توهج */
  --border-purple: #b36eff;               /* الحدود */
}
```

### Legacy Mappings (للتوافق مع الكود القديم)

```css
:root {
  --primary-color: var(--purple-primary);
  --primary-dark: var(--purple-dark);
  --primary-light: var(--purple-light);
  --secondary-color: var(--purple-light);
  --secondary-dark: var(--purple-dark);
  --accent-color: var(--purple-deep);
}
```

---

## 🎯 متى تستخدم كل لون

### 1. Purple Primary (`--purple-primary`)

**الاستخدام:**
- الأزرار الرئيسية
- الروابط النشطة
- العناوين المهمة
- الأيقونات الرئيسية

**مثال:**
```css
.primary-button {
  background: var(--purple-primary);
  color: var(--white);
}

.primary-button:hover {
  background: var(--purple-dark);
}
```

---

### 2. Purple Dark (`--purple-dark`)

**الاستخدام:**
- حالة hover للأزرار
- الحدود النشطة
- النصوص المهمة على خلفية فاتحة

**مثال:**
```css
.card {
  border: 2px solid var(--purple-dark);
}

.link:hover {
  color: var(--purple-dark);
}
```

---

### 3. Purple Light (`--purple-light`)

**الاستخدام:**
- الأزرار الثانوية
- الخلفيات الفاتحة
- التدرجات

**مثال:**
```css
.secondary-button {
  background: var(--purple-light);
  color: var(--white);
}

.gradient-bg {
  background: linear-gradient(135deg, var(--purple-primary), var(--purple-light));
}
```

---

### 4. Purple Deep (`--purple-deep`)

**الاستخدام:**
- الظلال الداكنة
- الحدود الثقيلة
- النصوص على خلفيات فاتحة جداً

**مثال:**
```css
.card {
  box-shadow: 0 4px 15px var(--purple-deep);
}
```

---

### 5. Purple Very Dark (`--purple-very-dark`)

**الاستخدام:**
- خلفية الصفحة الرئيسية
- خلفيات الـ modals
- خلفيات الـ cards الداكنة

**مثال:**
```css
body {
  background: var(--purple-very-dark);
}

.modal {
  background: var(--purple-very-dark);
}
```

---

### 6. Purple Transparent (`--purple-transparent`)

**الاستخدام:**
- خلفيات شفافة
- overlays
- hover effects

**مثال:**
```css
.card:hover {
  background: var(--purple-transparent);
}

.overlay {
  background: var(--purple-transparent);
  backdrop-filter: blur(10px);
}
```

---

### 7. Glow Purple (`--glow-purple`)

**الاستخدام:**
- تأثيرات التوهج
- الظلال المضيئة
- الحدود المتوهجة

**مثال:**
```css
.glowing-button {
  box-shadow: 0 0 20px var(--glow-purple);
}

.card:hover {
  border: 2px solid var(--glow-purple);
}
```

---

## 🌈 ألوان الحالة (Status Colors)

```css
:root {
  --success-color: #10b981;        /* أخضر للنجاح */
  --warning-color: #f59e0b;        /* برتقالي للتحذير */
  --error-color: #ef4444;          /* أحمر للخطأ */
  --info-color: #06b6d4;           /* أزرق للمعلومات */
}
```

### متى تستخدمها:

- **Success**: رسائل النجاح، الحالات المكتملة، الأزرار الإيجابية
- **Warning**: التحذيرات، الحالات المعلقة، الإشعارات
- **Error**: رسائل الخطأ، الحالات الفاشلة، التحذيرات الحرجة
- **Info**: المعلومات العامة، الإشعارات المحايدة

---

## 📝 ألوان النصوص

```css
:root {
  --text-primary: var(--white);              /* نص أبيض على خلفية داكنة */
  --text-secondary: var(--white-dim);        /* نص أبيض شفاف */
  --text-tertiary: rgba(255,255,255,0.6);    /* نص أبيض أكثر شفافية */
  --text-inverse: var(--purple-very-dark);   /* نص داكن على خلفية فاتحة */
}
```

---

## 🎭 التدرجات (Gradients)

### التدرج الرئيسي
```css
.gradient-primary {
  background: linear-gradient(135deg, var(--purple-primary), var(--purple-light));
}
```

### تدرج الخلفية
```css
.gradient-background {
  background: linear-gradient(135deg, #0a043c, #1c062e, #2c003e);
}
```

### تدرج التوهج
```css
.gradient-glow {
  background: linear-gradient(135deg, var(--purple-primary), var(--glow-purple));
}
```

---

## 🪟 Glass Morphism Effect

```css
.glass-effect {
  background: rgba(17, 1, 23, 0.4);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(179, 110, 255, 0.2);
  box-shadow: 0 4px 15px rgba(179, 110, 255, 0.4);
}
```

**الاستخدام:**
- البطاقات الحديثة
- الـ modals
- الـ navigation bars
- الـ sidebars

---

## 🌑 الظلال (Shadows)

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgba(122, 90, 248, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(122, 90, 248, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(122, 90, 248, 0.2);
  --shadow-xl: 0 20px 25px -5px rgba(122, 90, 248, 0.3);
  --shadow-glow: 0 0 20px var(--glow-purple);
}
```

### متى تستخدم كل ظل:

- **shadow-sm**: للعناصر الصغيرة (badges, chips)
- **shadow-md**: للبطاقات العادية
- **shadow-lg**: للبطاقات المرتفعة، الـ modals
- **shadow-xl**: للعناصر العائمة، الـ dropdowns
- **shadow-glow**: للعناصر المتوهجة، الأزرار النشطة

---

## 🎨 أمثلة عملية

### مثال 1: بطاقة بسيطة
```css
.card {
  background: var(--purple-very-dark);
  border: 1px solid var(--purple-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.card:hover {
  border-color: var(--purple-light);
  box-shadow: var(--shadow-glow);
  transform: translateY(-4px);
}
```

### مثال 2: زر رئيسي
```css
.primary-btn {
  background: linear-gradient(135deg, var(--purple-primary), var(--purple-light));
  color: var(--white);
  border: none;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
}

.primary-btn:hover {
  box-shadow: var(--shadow-glow);
  transform: translateY(-2px);
}

.primary-btn:active {
  transform: translateY(0);
}
```

### مثال 3: بطاقة Glass Morphism
```css
.glass-card {
  background: rgba(17, 1, 23, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(179, 110, 255, 0.2);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: 0 4px 15px rgba(179, 110, 255, 0.4);
}
```

### مثال 4: نص متدرج
```css
.gradient-text {
  background: linear-gradient(135deg, var(--purple-primary), var(--purple-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  font-size: 2rem;
}
```

---

## ♿ Accessibility Guidelines

### 1. التباين (Contrast)

تأكد من أن التباين بين النص والخلفية يتوافق مع WCAG AA:

```css
/* ✅ جيد - تباين عالي */
.text-on-dark {
  color: var(--white);
  background: var(--purple-very-dark);
}

/* ❌ سيء - تباين منخفض */
.text-on-light-purple {
  color: var(--purple-light);
  background: var(--white);
}
```

### 2. Focus States

دائماً أضف focus states واضحة:

```css
.button:focus {
  outline: 2px solid var(--purple-primary);
  outline-offset: 2px;
}
```

### 3. Color Blindness

لا تعتمد على اللون فقط لنقل المعلومات:

```css
/* ✅ جيد - يستخدم أيقونة + لون */
.success-message {
  color: var(--success-color);
}
.success-message::before {
  content: '✓';
}

/* ❌ سيء - يعتمد على اللون فقط */
.error {
  color: var(--error-color);
}
```

---

## 🎯 Best Practices

### 1. استخدم المتغيرات دائماً

```css
/* ❌ سيء */
.button {
  background: #b36eff;
}

/* ✅ جيد */
.button {
  background: var(--purple-primary);
}
```

### 2. لا تخلط الألوان المباشرة مع المتغيرات

```css
/* ❌ سيء */
.card {
  background: var(--purple-primary);
  border: 1px solid #9448b5;
}

/* ✅ جيد */
.card {
  background: var(--purple-primary);
  border: 1px solid var(--purple-dark);
}
```

### 3. استخدم التدرجات بحذر

```css
/* ✅ جيد - تدرج بسيط */
.button {
  background: linear-gradient(135deg, var(--purple-primary), var(--purple-light));
}

/* ❌ سيء - تدرج معقد جداً */
.button {
  background: linear-gradient(135deg, 
    var(--purple-primary) 0%, 
    var(--purple-light) 25%, 
    var(--purple-dark) 50%, 
    var(--purple-deep) 75%, 
    var(--purple-primary) 100%
  );
}
```

### 4. احترم Dark Mode

جميع الألوان مصممة للـ Dark Mode. إذا أردت إضافة Light Mode:

```css
@media (prefers-color-scheme: light) {
  :root {
    --purple-very-dark: #ffffff;
    --white: #110117;
    /* ... باقي الألوان */
  }
}
```

---

## 🐛 Troubleshooting

### المشكلة: الألوان لا تظهر

**الحل:**
1. تأكد من استيراد `index.css` في `App.jsx`
2. تحقق من أن المتغير مكتوب بشكل صحيح
3. استخدم DevTools للتحقق من القيمة المحسوبة

### المشكلة: التباين ضعيف

**الحل:**
استخدم أداة فحص التباين:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools Accessibility Panel

### المشكلة: الألوان تبدو مختلفة على أجهزة مختلفة

**الحل:**
- استخدم `color-profile: sRGB` في CSS
- اختبر على أجهزة مختلفة
- استخدم hex colors بدلاً من rgb للتوافق

---

## 📱 Responsive Considerations

الألوان تعمل بشكل جيد على جميع الأجهزة، لكن:

- **Mobile**: قد تحتاج لزيادة التباين قليلاً
- **Tablet**: الألوان تعمل بشكل مثالي
- **Desktop**: جميع التأثيرات والتدرجات تعمل

---

## 🎨 Color Palette Reference

### Purple Shades
- `#b36eff` - Purple Primary
- `#9448b5` - Purple Dark
- `#b388ff` - Purple Light
- `#7e39b6` - Purple Deep
- `#110117` - Purple Very Dark

### Status Colors
- `#10b981` - Success (Green)
- `#f59e0b` - Warning (Amber)
- `#ef4444` - Error (Red)
- `#06b6d4` - Info (Cyan)

### Neutral Colors
- `#ffffff` - White
- `rgba(255,255,255,0.8)` - White Dim
- `rgba(179,110,255,0.1)` - Purple Transparent
- `rgba(179,110,255,0.6)` - Glow Purple

---

**آخر تحديث:** 2024
**الإصدار:** 1.0.0
