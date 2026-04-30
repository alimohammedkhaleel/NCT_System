# AppCrawl Test Report

**Date:** 2026-04-24T15:12:20.241Z
**Duration:** 309s
**Mode:** steered
**Goal:** قم بتنفيذ سيناريو اختبار شامل لنظام NCTU ERP. اتبع الخطوات التالية بدقة:

**الجزء 1: اختبار تسجيل الدخول والصلاحيات**
1. افتح الصفحة الرئيسية وتحقق من وجود نموذج تسجيل الدخول
2. سجل دخول كـ Admin باستخدام: username=admin, password=admin123
3. تحقق من الوصول إلى لوحة تحكم الـ Admin وعرض جميع الإحصائيات
4. استكشف جميع صفحات الـ Admin: إدارة الطلاب، التخصصات، المواد، الأساتذة، السنوات الدراسية

**الجزء 2: إدارة الطلاب والتسجيل**
5. انتقل إلى صفحة 'إدارة الطلاب' (Students Management)
6. أضف طالب جديد بالبيانات التالية:
   - الاسم: محمد أحمد علي
   - الرقم القومي: 30112233445566
   - التخصص: ICT (تكنولوجيا المعلومات)
   - السنة: 3
   - الفرع: Software (البرمجيات)
7. تحقق من ظهور الطالب في القائمة
8. جرب فلترة الطلاب حسب التخصص والسنة والفرع

**الجزء 3: إدارة المواد والأساتذة**
9. انتقل إلى صفحة 'إدارة المواد' (Courses Management)
10. تحقق من عرض مواد ICT للسنة 3 مع الفروع (Software/Network/Both)
11. اختر مادة من فرع Software وعيّن أستاذ لها
12. انتقل إلى 'إدارة الأساتذة' وتحقق من تعيين المادة للأستاذ

**الجزء 4: نظام الدرجات**
13. سجل خروج من حساب Admin
14. سجل دخول كـ Professor باستخدام: username=professor1, password=prof123
15. انتقل إلى صفحة 'إدارة الدرجات' (Grades Management)
16. اختر مادة وأدخل درجات لطالب:
    - Assignment 1: 25/30
    - Assignment 2: 27/30
    - Final Exam: 135/150
17. احفظ الدرجات وتحقق من حساب المجموع والنسبة المئوية تلقائياً

**الجزء 5: لوحة تحكم الطالب**
18. سجل خروج من حساب Professor
19. سجل دخول كـ Student باستخدام: username=student1, password=student123
20. تحقق من عرض:
    - معلومات الطالب (الاسم، الكود، التخصص، السنة، الفرع إن وجد)
    - الدرجات المعتمدة
    - الجدول الدراسي
    - المصاريف المستحقة والمدفوعة

**الجزء 6: نظام نقل الطلاب (Student Promotion)**
21. سجل خروج وارجع لحساب Admin
22. انتقل إلى صفحة 'نقل الطلاب' (Student Promotion)
23. اختر التخصص والسنة الحالية
24. حدد الطلاب الناجحين ونقلهم للسنة التالية
25. تحقق من تحديث السنة الدراسية للطلاب المنقولين

**الجزء 7: التخصصات الستة**
26. تحقق من وجود التخصصات الستة:
    - MCT (الميكاترونكس)
    - AUT (الأوتوترونكس)
    - ICT (تكنولوجيا المعلومات)
    - PRO (الأطراف الصناعية)
    - OIL (إنتاج البترول)
    - REN (الطاقة المتجددة)
27. تحقق من عرض الأسماء بالعربية بشكل صحيح

**الجزء 8: اختبار الأخطاء والتحقق**
28. جرب إدخال بيانات غير صحيحة وتحقق من رسائل الخطأ
29. جرب الوصول لصفحات غير مصرح بها وتحقق من الحماية
30. اختبر responsive design على أحجام شاشات مختلفة

**ملاحظات مهمة:**
- سجل أي أخطاء أو مشاكل تواجهها
- تحقق من سرعة تحميل الصفحات
- راقب console للأخطاء
- اختبر جميع الأزرار والنماذج
- تأكد من عمل الـ RTL (Right-to-Left) للنصوص العربية
**App:** http://localhost:5173
**Model:** gemini-2.0-flash-exp

## Summary

- Screens visited: 2
- Total actions: 100
- Issues found: 0

## Screens Visited

| Screen | Visits |
|--------|--------|
| Home | 84 |
| NCTU | 16 |

## Action Log

1. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
2. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
3. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
4. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
5. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
6. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
7. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
8. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
9. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
10. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
11. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
12. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
13. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
14. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
15. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
16. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
17. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
18. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
19. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
20. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
21. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
22. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
23. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
24. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
25. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
26. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
27. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
28. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
29. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
30. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
31. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
32. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
33. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
34. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
35. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
36. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
37. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
38. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
39. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
40. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
41. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
42. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
43. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
44. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
45. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
46. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
47. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
48. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
49. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
50. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
51. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
52. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
53. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
54. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
55. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
56. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
57. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
58. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
59. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
60. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
61. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
62. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
63. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
64. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
65. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
66. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
67. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
68. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
69. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
70. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
71. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
72. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
73. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
74. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
75. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
76. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
77. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
78. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
79. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
80. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
81. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
82. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
83. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
84. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
85. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
86. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
87. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
88. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
89. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
90. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
91. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
92. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
93. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
94. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
95. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
96. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
97. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
98. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
99. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
100. **error**() — models/gemini-2.0-flash-exp is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
