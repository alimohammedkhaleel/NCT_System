# 🎨 دليل الـ Animations - NCTU ERP System

## نظرة عامة

هذا الدليل يشرح جميع مكونات الـ animations المتاحة في نظام NCTU ERP وكيفية استخدامها بشكل صحيح.

---

## 📦 المكونات المتاحة

### 1. ClickSpark ✨

**الوصف:** يضيف تأثير شرر بنفسجي عند النقر في أي مكان على الصفحة.

**الاستخدام:**
```jsx
import { ClickSpark } from '../components/animations';

function MyPage() {
  return (
    <>
      <ClickSpark />
      {/* باقي المحتوى */}
    </>
  );
}
```

**الخصائص:**
- لا يحتاج props
- يعمل تلقائياً على كامل الصفحة
- `z-index: 9999` لضمان الظهور فوق كل العناصر

**متى تستخدمه:**
- في الصفحات التفاعلية (Admin Dashboard, Professor Grades)
- عند الحاجة لتأثير بصري عند النقر

---

### 2. SplashCursor 💧

**الوصف:** تأثير سائل يتبع حركة الماوس مع جسيمات بنفسجية.

**الاستخدام:**
```jsx
import { SplashCursor } from '../components/animations';

function MyPage() {
  return (
    <>
      <SplashCursor />
      {/* باقي المحتوى */}
    </>
  );
}
```

**الخصائص:**
- لا يحتاج props
- `pointer-events: none` لعدم التداخل مع النقر
- يعمل فقط على Desktop (يتم إخفاؤه على Mobile)

**متى تستخدمه:**
- في صفحات الطلاب (Student Portal)
- للصفحات التي تحتاج خلفية تفاعلية

---

### 3. TrueFocus 🎯

**الوصف:** إطار متحرك يظهر حول النص عند التركيز عليه.

**الاستخدام:**
```jsx
import { TrueFocus } from '../components/animations';

function MyComponent() {
  return (
    <TrueFocus>
      <h1>اسم الطالب</h1>
    </TrueFocus>
  );
}
```

**الخصائص:**
- `children`: العنصر الذي سيحيط به الإطار

**متى تستخدمه:**
- للعناوين المهمة (اسم الطالب، عنوان الصفحة)
- لجذب الانتباه لعنصر معين

---

### 4. BounceCards 🎈

**الوصف:** بطاقات بتأثير elastic bounce عند التحميل.

**الاستخدام:**
```jsx
import { BounceCards } from '../components/animations';

function MyComponent() {
  return (
    <BounceCards delay={0.2}>
      <div className="card">
        {/* محتوى البطاقة */}
      </div>
    </BounceCards>
  );
}
```

**الخصائص:**
- `delay` (optional): تأخير قبل بدء الحركة (بالثواني)
- `children`: البطاقة أو العنصر

**متى تستخدمه:**
- للبطاقات في Admin Dashboard
- للعناصر التي تظهر في قائمة (مع تأخير متدرج)

**مثال متقدم:**
```jsx
{items.map((item, index) => (
  <BounceCards key={item.id} delay={index * 0.1}>
    <Card data={item} />
  </BounceCards>
))}
```

---

### 5. FadeIn 🌅

**الوصف:** تأثير fade-in بسيط للعناصر.

**الاستخدام:**
```jsx
import { FadeIn } from '../components/animations';

function MyComponent() {
  return (
    <FadeIn>
      <div className="content">
        {/* المحتوى */}
      </div>
    </FadeIn>
  );
}
```

**الخصائص:**
- `duration` (optional): مدة الحركة (default: 0.6s)
- `delay` (optional): تأخير قبل البدء

**متى تستخدمه:**
- للمحتوى الذي يظهر بعد التحميل
- للعناصر التي تحتاج ظهور سلس

---

### 6. ScrollVelocity 🏃

**الوصف:** نص يتحرك أفقياً بشكل مستمر.

**الاستخدام:**
```jsx
import { ScrollVelocity } from '../components/animations';

function MyComponent() {
  return (
    <ScrollVelocity baseVelocity={-2}>
      نظام NCTU ERP • إدارة متكاملة • 
    </ScrollVelocity>
  );
}
```

**الخصائص:**
- `baseVelocity`: سرعة الحركة (سالب = يسار، موجب = يمين)
- `children`: النص المتحرك

**متى تستخدمه:**
- في الـ footer
- للإعلانات أو الرسائل المتحركة

---

### 7. FallingText 🍂

**الوصف:** كلمات تتساقط بفيزياء واقعية.

**الاستخدام:**
```jsx
import { FallingText } from '../components/animations';

function MyComponent() {
  return (
    <FallingText text="مرحباً بك في نظام NCTU" />
  );
}
```

**الخصائص:**
- `text`: النص الذي سيتساقط

**متى تستخدمه:**
- للعناوين الرئيسية في الصفحة الرئيسية
- للتأثيرات الدرامية

---

### 8. CustomCursor 🖱️

**الوصف:** مؤشر ماوس مخصص بتأثيرات بنفسجية.

**الاستخدام:**
```jsx
import { CustomCursor } from '../components/animations';

function App() {
  return (
    <>
      <CustomCursor />
      {/* باقي التطبيق */}
    </>
  );
}
```

**ملاحظة:** يتم إضافته مرة واحدة في App.jsx

---

### 9. TypewriterEffect ⌨️

**الوصف:** تأثير كتابة تدريجية للنص.

**الاستخدام:**
```jsx
import { TypewriterEffect } from '../components/animations';

function MyComponent() {
  return (
    <TypewriterEffect 
      text="مرحباً بك في نظام NCTU ERP"
      speed={50}
    />
  );
}
```

**الخصائص:**
- `text`: النص المراد كتابته
- `speed`: سرعة الكتابة (ms بين كل حرف)

---

## 🎭 MotionContext

### استخدام المتغيرات المشتركة

```jsx
import { useMotion } from '../context/MotionContext';
import { motion } from 'framer-motion';

function MyComponent() {
  const { fadeInUp, springTransition } = useMotion();
  
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="show"
      transition={springTransition}
    >
      المحتوى
    </motion.div>
  );
}
```

### المتغيرات المتاحة:

- `springTransition`: انتقال بتأثير spring
- `smoothTransition`: انتقال سلس
- `staggerContainer`: حاوية للعناصر المتتابعة
- `fadeInUp`: fade-in من الأسفل
- `fadeInLeft`: fade-in من اليسار
- `fadeInRight`: fade-in من اليمين
- `scaleIn`: تكبير تدريجي
- `slideInFromTop`: انزلاق من الأعلى
- `slideInFromBottom`: انزلاق من الأسفل

---

## 🎨 Best Practices

### 1. لا تفرط في الاستخدام
```jsx
// ❌ سيء - كثير جداً
<ClickSpark />
<SplashCursor />
<FallingText />
<ScrollVelocity />

// ✅ جيد - متوازن
<ClickSpark />
<BounceCards>
  <Card />
</BounceCards>
```

### 2. استخدم التأخير المتدرج
```jsx
// ✅ جيد
{items.map((item, i) => (
  <BounceCards key={item.id} delay={i * 0.1}>
    <Card data={item} />
  </BounceCards>
))}
```

### 3. احترم Reduced Motion
جميع المكونات تدعم `prefers-reduced-motion` تلقائياً عبر MotionConfig.

### 4. الأداء
- استخدم `transform` و `opacity` فقط للحركات
- تجنب `width`, `height`, `top`, `left`
- استخدم `will-change` للعناصر المتحركة

```css
.animated-element {
  will-change: transform, opacity;
}
```

---

## 🐛 Troubleshooting

### المشكلة: الـ animations لا تعمل

**الحل:**
1. تأكد من أن `MotionProvider` موجود في App.jsx
2. تأكد من استيراد المكون بشكل صحيح
3. تحقق من console للأخطاء

### المشكلة: الأداء بطيء

**الحل:**
1. قلل عدد الـ animations في نفس الوقت
2. استخدم `useReducedMotion` للمستخدمين الذين يفضلون تقليل الحركة
3. تأكد من استخدام `transform` بدلاً من `position`

### المشكلة: الـ animations تتداخل مع النقر

**الحل:**
```css
.animation-overlay {
  pointer-events: none;
}
```

---

## 📱 Responsive Design

جميع المكونات responsive بشكل افتراضي:

- **Desktop**: جميع الـ animations تعمل
- **Tablet**: تعمل معظم الـ animations
- **Mobile**: بعض الـ animations يتم تعطيلها (مثل CustomCursor, SplashCursor)

---

## 🎯 أمثلة عملية

### مثال 1: صفحة Admin Dashboard
```jsx
import { ClickSpark, BounceCards } from '../components/animations';

function AdminDashboard() {
  return (
    <>
      <ClickSpark />
      <div className="cards-grid">
        {cards.map((card, i) => (
          <BounceCards key={card.id} delay={i * 0.1}>
            <Card data={card} />
          </BounceCards>
        ))}
      </div>
    </>
  );
}
```

### مثال 2: صفحة Student Portal
```jsx
import { SplashCursor, TrueFocus, FadeIn } from '../components/animations';

function StudentPortal() {
  return (
    <>
      <SplashCursor />
      <FadeIn>
        <div className="profile-card">
          <TrueFocus>
            <h1>{studentName}</h1>
          </TrueFocus>
          <p>معلومات الطالب...</p>
        </div>
      </FadeIn>
    </>
  );
}
```

### مثال 3: صفحة Professor Grades
```jsx
import { ClickSpark } from '../components/animations';
import { motion } from 'framer-motion';

function ProfessorGrades() {
  return (
    <>
      <ClickSpark />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* محتوى الصفحة */}
      </motion.div>
    </>
  );
}
```

---

## 📚 مصادر إضافية

- [Framer Motion Docs](https://www.framer.com/motion/)
- [GSAP Docs](https://greensock.com/docs/)
- [CSS Animations Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)

---

**آخر تحديث:** 2024
**الإصدار:** 1.0.0
