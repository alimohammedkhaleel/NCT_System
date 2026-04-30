# Bugfix Requirements Document

## Introduction

هذا المستند يحدد المشاكل الموجودة في Admin Dashboard لنظام NCTU ERP والسلوك المتوقع بعد الإصلاح. تشمل المشاكل:
1. عدم وجود وظيفة نسخ رابط التسجيل الصالح لمدة 24 ساعة في صفحة Registration Links
2. عدم عمل وظيفة حذف المادة (Course) في صفحة Courses Management
3. عدم ظهور صفحة Grade Settings بشكل كامل
4. مشاكل في عرض جداول Timetables
5. الحاجة لتحسين تنسيق صفحة Students Management

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN المسؤول يقوم بإنشاء رابط تسجيل جديد في صفحة Registration Links THEN النظام لا يوفر خيار لنسخ الرابط الكامل الصالح لمدة 24 ساعة

1.2 WHEN المسؤول يضغط على زر "Delete" لحذف مادة في صفحة Courses Management THEN النظام يعرض رسالة تأكيد ولكن عملية الحذف لا تتم بنجاح

1.3 WHEN المسؤول يحاول الوصول إلى صفحة Grade Settings THEN الصفحة لا تظهر بشكل صحيح أو لا تُحمّل البيانات

1.4 WHEN المسؤول يحاول عرض جداول Timetables THEN الجداول لا تُعرض بشكل صحيح أو يوجد مشاكل في التنسيق

1.5 WHEN المسؤول يستخدم صفحة Students Management THEN التنسيق والأسلوب (styling) غير مناسب ويحتاج لتحسين

### Expected Behavior (Correct)

2.1 WHEN المسؤول يقوم بإنشاء رابط تسجيل جديد THEN النظام SHALL يوفر زر "نسخ الرابط" الذي ينسخ الرابط الكامل (مع domain) إلى الحافظة ويعرض رسالة تأكيد

2.2 WHEN المسؤول يضغط على زر "Delete" لحذف مادة THEN النظام SHALL يحذف المادة من قاعدة البيانات بنجاح ويحدث قائمة المواد

2.3 WHEN المسؤول يحاول الوصول إلى صفحة Grade Settings THEN الصفحة SHALL تُحمّل بشكل كامل وتعرض جميع إعدادات الدرجات للمواد

2.4 WHEN المسؤول يحاول عرض جداول Timetables THEN الجداول SHALL تُعرض بشكل صحيح مع تنسيق مناسب وواضح

2.5 WHEN المسؤول يستخدم صفحة Students Management THEN الصفحة SHALL تكون منسقة بشكل احترافي مع تحسينات في الأسلوب (styling)

### Unchanged Behavior (Regression Prevention)

3.1 WHEN المسؤول يستخدم وظائف أخرى في صفحة Registration Links (مثل عرض الروابط الموجودة) THEN النظام SHALL CONTINUE TO يعمل بنفس الطريقة الحالية

3.2 WHEN المسؤول يستخدم وظائف أخرى في صفحة Courses Management (مثل إضافة أو تعديل المواد) THEN النظام SHALL CONTINUE TO يعمل بنفس الطريقة الحالية

3.3 WHEN المسؤول يستخدم وظائف أخرى في Admin Dashboard THEN النظام SHALL CONTINUE TO يعمل بنفس الطريقة الحالية دون تأثر

3.4 WHEN الطلاب أو الأساتذة يستخدمون النظام THEN وظائفهم SHALL CONTINUE TO تعمل بشكل طبيعي دون أي تأثير من هذه الإصلاحات

3.5 WHEN يتم استخدام API endpoints الأخرى غير المتعلقة بهذه الإصلاحات THEN النظام SHALL CONTINUE TO يستجيب بنفس الطريقة الحالية
