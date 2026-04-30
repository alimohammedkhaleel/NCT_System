# Bugfix Requirements Document

## Introduction

هذا المستند يحدد المشاكل الموجودة في Student Dashboard لنظام NCTU ERP والسلوك المتوقع بعد الإصلاح. تشمل المشاكل:

1. **403 Forbidden Error on Timetable API** - خطأ في الصلاحيات عند محاولة الطالب الوصول إلى جدوله الدراسي
2. **Avatar Image Loading Failure** - فشل تحميل صورة الطالب بسبب مشاكل CORS
3. **Timetable Display Issues** - مشاكل في عرض الجدول الدراسي للطالب
4. **Payment Records Display Problems** - مشاكل في عرض سجل المدفوعات (عرض معلومات خاطئة أو غير مناسبة)

هذه المشاكل تؤثر على تجربة الطالب في استخدام البوابة الإلكترونية وتمنعه من الوصول إلى معلوماته الأكاديمية والمالية بشكل صحيح.

## Bug Analysis

### Current Behavior (Defect)

#### 1. Timetable API 403 Error

1.1 WHEN الطالب يضغط على تبويب "جدولي الدراسي" في Student Dashboard THEN النظام يرسل طلب GET إلى `/api/admin/timetables/student` ويحصل على خطأ 403 Forbidden (Insufficient permissions)

1.2 WHEN الطالب يحاول الوصول إلى جدوله الدراسي THEN النظام يعرض رسالة خطأ "فشل تحميل الجدول الدراسي" بدلاً من عرض الجدول

#### 2. Avatar Image Loading

2.1 WHEN الطالب يرفع صورة شخصية (avatar) THEN النظام يحفظ الصورة في قاعدة البيانات بمسار مثل `avatar_6_1776823812348.jpg`

2.2 WHEN النظام يحاول عرض صورة الطالب THEN المتصفح يعرض خطأ `net::ERR_BLOCKED_BY_RESPONSE.NotSameOrigin` بسبب مشاكل CORS

2.3 WHEN فشل تحميل الصورة THEN النظام لا يعرض صورة بديلة (fallback) واضحة أو رسالة خطأ مفيدة

2.4 WHEN المسار المحفوظ في قاعدة البيانات غير صحيح أو ناقص THEN النظام يحاول تحميل صورة من مسار خاطئ

#### 3. Timetable Display Format

3.1 WHEN الطالب يشاهد جدوله الدراسي (إذا تم حل مشكلة 403) THEN التنسيق والعرض قد يختلف عن Admin Dashboard

3.2 WHEN يوجد أكثر من جدول دراسي لنفس التخصص THEN النظام لا يوفر فلاتر للسنة الدراسية أو التخصص

#### 4. Payment Records Display

4.1 WHEN الطالب يشاهد تبويب "سجل المدفوعات" THEN النظام يعرض عنوان "فواتيري" بدلاً من "سجل المدفوعات"

4.2 WHEN النظام يعرض السنة الدراسية في سجل المدفوعات THEN يعرض السنة الأكاديمية بصيغة (2024-2025) بدلاً من عرض السنة الدراسية الفعلية للطالب (السنة الأولى، الثانية، إلخ)

4.3 WHEN النظام يعرض جدول المدفوعات THEN لا يوجد عمود لحالة الدفع (تم الدفع ✅ / لم يتم الدفع ❌)

4.4 WHEN الطالب يشاهد سجل المدفوعات THEN قد يرى معلومات تخص دور المحاسب (Accountant) وليست مناسبة لدور الطالب

### Expected Behavior (Correct)

#### 1. Timetable API Access

2.1 WHEN الطالب يضغط على تبويب "جدولي الدراسي" THEN النظام SHALL يرسل طلب GET إلى `/api/admin/timetables/student` بنجاح ويحصل على استجابة 200 OK مع بيانات الجدول

2.2 WHEN الطالب يحاول الوصول إلى جدوله الدراسي THEN النظام SHALL يعرض الجدول الدراسي الخاص بتخصصه بشكل صحيح

2.3 WHEN الطالب لديه صلاحية 'student' THEN النظام SHALL يسمح له بالوصول إلى endpoint `/api/admin/timetables/student` دون خطأ 403

#### 2. Avatar Image Loading

2.4 WHEN الطالب يرفع صورة شخصية THEN النظام SHALL يحفظ الصورة بمسار كامل وصحيح في قاعدة البيانات (مثل `/uploads/avatars/avatar_6_1776823812348.jpg`)

2.5 WHEN النظام يحاول عرض صورة الطالب THEN المتصفح SHALL يحمل الصورة بنجاح دون أخطاء CORS

2.6 WHEN فشل تحميل الصورة لأي سبب THEN النظام SHALL يعرض صورة بديلة (fallback) واضحة مع معالجة الخطأ بشكل صحيح

2.7 WHEN النظام يبني URL للصورة THEN يجب أن يستخدم المسار الصحيح من قاعدة البيانات مع إضافة domain إذا لزم الأمر

#### 3. Timetable Display Format

2.8 WHEN الطالب يشاهد جدوله الدراسي THEN النظام SHALL يستخدم نفس تنسيق العرض المستخدم في Admin Dashboard

2.9 WHEN يوجد أكثر من جدول دراسي THEN النظام SHALL يوفر فلاتر للتخصص والسنة الدراسية لتسهيل البحث

2.10 WHEN الطالب يضغط على زر "عرض الجدول" THEN النظام SHALL يفتح ملف PDF في نافذة جديدة بشكل صحيح

#### 4. Payment Records Display

2.11 WHEN الطالب يشاهد تبويب المدفوعات THEN النظام SHALL يعرض عنوان "سجل المدفوعات" وليس "فواتيري"

2.12 WHEN النظام يعرض السنة الدراسية في سجل المدفوعات THEN يجب أن يعرض السنة الدراسية الفعلية للطالب (السنة الأولى، الثانية، الثالثة، الرابعة) بدلاً من السنة الأكاديمية (2024-2025)

2.13 WHEN النظام يعرض جدول المدفوعات THEN يجب أن يتضمن عمود "حالة الدفع" يعرض (تم الدفع ✅) للمدفوعات المكتملة و (لم يتم الدفع ❌) للمدفوعات المعلقة

2.14 WHEN الطالب يشاهد سجل المدفوعات THEN النظام SHALL يعرض فقط المعلومات المناسبة لدور الطالب دون معلومات خاصة بالمحاسب

### Unchanged Behavior (Regression Prevention)

#### General System Behavior

3.1 WHEN الطالب يستخدم وظائف أخرى في Student Dashboard (مثل عرض الدرجات، الفواتير، QR Code) THEN النظام SHALL CONTINUE TO يعمل بنفس الطريقة الحالية دون تأثر

3.2 WHEN المسؤول (Admin) يستخدم Admin Dashboard لإدارة الجداول الدراسية THEN النظام SHALL CONTINUE TO يعمل بنفس الطريقة الحالية

3.3 WHEN المسؤول يرفع جدول دراسي جديد في Admin Dashboard THEN النظام SHALL CONTINUE TO يحفظ الجدول ويعرضه للمسؤولين بنفس الطريقة

#### Avatar Functionality

3.4 WHEN الطالب يحذف صورته الشخصية THEN النظام SHALL CONTINUE TO يحذف الصورة ويعرض الحرف الأول من الاسم

3.5 WHEN الطالب يرفع صورة جديدة THEN النظام SHALL CONTINUE TO يستبدل الصورة القديمة بالجديدة

#### Other User Roles

3.6 WHEN الأساتذة (Professors) يستخدمون النظام THEN وظائفهم SHALL CONTINUE TO تعمل بشكل طبيعي دون أي تأثير

3.7 WHEN المحاسب (Accountant) يستخدم نظام المدفوعات THEN وظائفه SHALL CONTINUE TO تعمل بشكل طبيعي دون أي تأثير

#### API Endpoints

3.8 WHEN يتم استخدام API endpoints الأخرى غير المتعلقة بهذه الإصلاحات THEN النظام SHALL CONTINUE TO يستجيب بنفس الطريقة الحالية

3.9 WHEN المسؤول يستخدم endpoint `/api/admin/timetables` (بدون /student) THEN النظام SHALL CONTINUE TO يعمل بنفس الطريقة الحالية

