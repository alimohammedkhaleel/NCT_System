# وثيقة المتطلبات - نظام الدرجات والمدفوعات المحسّن

## مقدمة

نظام الدرجات والمدفوعات المحسّن هو تطوير لنظام NCTU ERP الحالي لتوفير مرونة أكبر في إدارة الدرجات والربط بين المدفوعات وعرض النتائج. النظام الحالي يستخدم إعدادات درجات عامة لجميع المواد، بينما يهدف هذا التحسين إلى توفير إعدادات مخصصة لكل مادة على حدة، مع إضافة نظام CRUD كامل للدرجات من الأستاذ، وربط عرض النتائج بحالة المدفوعات.

---

## قاموس المصطلحات

- **النظام (System)**: نظام NCTU ERP بمكوناته الكاملة (Frontend + Backend)
- **الأدمن (Admin)**: مستخدم بصلاحية `admin` يدير إعدادات الدرجات والنظام
- **الأستاذ (Professor)**: مستخدم بصلاحية `professor` يدير درجات الطلاب في موادّه
- **الطالب (Student)**: مستخدم بصلاحية `student` يطّلع على نتائجه ومدفوعاته
- **المحاسب (Accountant)**: مستخدم بصلاحية `accountant` يدير الفواتير والمدفوعات
- **GradeSettings**: إعدادات الدرجات المخصصة لكل مادة
- **CourseGradeConfig**: نموذج قاعدة البيانات لتخزين إعدادات الدرجات لكل مادة
- **ass1**: الواجب الأول (Assignment 1)
- **ass2**: الواجب الثاني (Assignment 2)
- **final_exam**: الامتحان النهائي
- **P/M/D**: رموز الدرجات (P=Pass, M=Merit, D=Distinction)
- **ProfessorGrades**: صفحة إدارة الدرجات للأستاذ
- **StudentPortal**: بوابة الطالب لعرض النتائج والمدفوعات
- **AccountantDashboard**: لوحة تحكم المحاسب
- **FeeInvoice**: فاتورة المصاريف الدراسية
- **Payment**: سجل الدفع
- **GPA**: المعدل التراكمي

---

## المتطلبات

---

### المتطلب 1: إعدادات الدرجات المخصصة لكل مادة

**قصة المستخدم:** بوصفي أدمن، أريد تخصيص إعدادات الدرجات لكل مادة على حدة، حتى أتمكن من تحديد النسب المئوية والدرجات القصوى وقيم P/M/D بشكل مرن لكل مادة.

#### معايير القبول

1. THE System SHALL إنشاء نموذج `CourseGradeConfig` في قاعدة البيانات يحتوي على: `course_id`، `ass1_percentage`، `ass2_percentage`، `final_percentage`، `ass1_max`، `ass2_max`، `final_max`، `p_value`، `m_value`، `d_value`.
2. WHEN يفتح الأدمن صفحة Grade Settings، THE System SHALL عرض قائمة بجميع المواد النشطة مع إعداداتها الحالية.
3. WHEN يختار الأدمن مادة معينة، THE System SHALL عرض نموذج تحرير يحتوي على جميع حقول الإعدادات.
4. THE System SHALL التحقق من أن مجموع النسب المئوية (`ass1_percentage + ass2_percentage + final_percentage`) يساوي 100% قبل الحفظ.
5. WHEN يحفظ الأدمن الإعدادات، THE System SHALL إرسال `POST /api/admin/course-grade-config` أو `PUT /api/admin/course-grade-config/:courseId` حسب وجود إعدادات سابقة.
6. IF لم تكن هناك إعدادات مخصصة لمادة معينة، THEN THE System SHALL استخدام القيم الافتراضية: ass1=15%, ass2=15%, final=70%, ass1_max=30, ass2_max=30, final_max=150, P=30, M=21, D=15.
7. THE System SHALL عرض معاينة لكيفية تحويل P/M/D إلى درجات رقمية بناءً على الإعدادات الحالية.
8. THE API SHALL إضافة endpoint `GET /api/admin/course-grade-config` يُعيد جميع إعدادات المواد.
9. THE API SHALL إضافة endpoint `GET /api/admin/course-grade-config/:courseId` يُعيد إعدادات مادة محددة.
10. THE API SHALL إضافة endpoint `POST /api/admin/course-grade-config` لإنشاء إعدادات جديدة.
11. THE API SHALL إضافة endpoint `PUT /api/admin/course-grade-config/:courseId` لتحديث إعدادات موجودة.

---

### المتطلب 2: نظام CRUD كامل للدرجات من الأستاذ

**قصة المستخدم:** بوصفي أستاذًا، أريد إضافة وتعديل وحذف درجات الطلاب بسهولة، حتى أتمكن من إدارة الدرجات بشكل كامل دون الحاجة للأدمن.

#### معايير القبول

1. WHEN يفتح الأستاذ صفحة ProfessorGrades، THE System SHALL عرض قائمة بالمواد المخصصة له مع عدد الطلاب المسجلين في كل مادة.
2. WHEN يختار الأستاذ مادة، THE System SHALL جلب قائمة الطلاب المسجلين من `GET /api/grades/professor/students?course_id=X` مع درجاتهم الحالية.
3. WHEN يضغط الأستاذ على "إضافة درجة"، THE System SHALL عرض نموذج يحتوي على: اختيار الطالب، ass1 (P/M/D)، ass2 (P/M/D)، final (0-150)، ملاحظات.
4. THE System SHALL عرض الدرجات القصوى والنسب المئوية من إعدادات المادة بجانب كل حقل إدخال.
5. WHEN يحفظ الأستاذ درجة جديدة، THE System SHALL إرسال `POST /api/grades` مع ربط الطالب بالتخصص والمادة والسنة الدراسية تلقائيًا.
6. WHEN يضغط الأستاذ على "تعديل" لدرجة موجودة، THE System SHALL عرض نموذج مملوء بالبيانات الحالية وإرسال `PUT /api/grades/:id` عند الحفظ.
7. WHEN يضغط الأستاذ على "حذف" لدرجة، THE System SHALL عرض نافذة تأكيد ثم إرسال `DELETE /api/grades/:id`.
8. THE System SHALL حساب النتيجة النهائية تلقائيًا بناءً على المعادلة: `(ass1_numeric * ass1_percentage + ass2_numeric * ass2_percentage + final * final_percentage) / 100`.
9. THE System SHALL عرض النتيجة النهائية والتقدير (Distinction/Merit/Pass/Refer/Fail) بجانب كل طالب.
10. THE API SHALL إضافة endpoint `GET /api/grades/professor/students?course_id=X` يُعيد الطلاب المسجلين مع درجاتهم.
11. THE API SHALL تعديل endpoint `POST /api/grades` ليقبل `specialty_id` و `academic_year_id` تلقائيًا من بيانات الطالب والمادة.
12. THE API SHALL إضافة endpoint `PUT /api/grades/:id` لتحديث درجة موجودة.
13. THE API SHALL إضافة endpoint `DELETE /api/grades/:id` لحذف درجة (فقط إذا كانت بحالة `draft`).

---

### المتطلب 3: حساب النتيجة النهائية بناءً على إعدادات المادة

**قصة المستخدم:** بوصفي نظامًا، أريد حساب النتيجة النهائية لكل طالب بناءً على إعدادات المادة المخصصة، حتى تكون النتائج دقيقة ومتسقة.

#### معايير القبول

1. WHEN يُحفظ grade جديد أو يُحدّث، THE System SHALL جلب إعدادات المادة من `CourseGradeConfig`.
2. THE System SHALL تحويل P/M/D إلى درجات رقمية بناءً على `p_value`، `m_value`، `d_value` من إعدادات المادة.
3. THE System SHALL حساب النتيجة النهائية بالمعادلة: `total_score = (ass1_numeric * ass1_percentage + ass2_numeric * ass2_percentage + final * final_percentage) / 100`.
4. THE System SHALL حساب النسبة المئوية: `total_percentage = (total_score / (ass1_max + ass2_max + final_max)) * 100`.
5. THE System SHALL تحديد التقدير النهائي بناءً على `total_percentage`: ≥85% = Distinction، ≥70% = Merit، ≥50% = Pass، ≥30% = Refer، <30% = Fail.
6. THE System SHALL حساب `grade_point` بناءً على التقدير: Distinction=4.0، Merit=3.0، Pass=2.0، Refer=1.0، Fail=0.0.
7. THE System SHALL تخزين `total_score`، `total_percentage`، `final_result`، `grade_point`، `letter_grade` في جدول `grades`.
8. IF لم تكن هناك إعدادات مخصصة للمادة، THEN THE System SHALL استخدام القيم الافتراضية المذكورة في المتطلب 1.

---

### المتطلب 4: عرض النتائج المشروط بالمدفوعات

**قصة المستخدم:** بوصفي طالبًا، أريد رؤية نتائجي فقط إذا كنت قد سددت المصاريف الدراسية، حتى يتم تطبيق سياسة الجامعة بشكل صحيح.

#### معايير القبول

1. WHEN يفتح الطالب صفحة StudentPortal، THE System SHALL عرض زر "عرض النتيجة" وزر "عرض المدفوعات".
2. WHEN يضغط الطالب على "عرض النتيجة"، THE System SHALL التحقق من حالة المدفوعات عبر `GET /api/student/payment-status`.
3. IF كانت جميع الفواتير المستحقة مدفوعة (`total_due = 0` أو `all_invoices_paid = true`)، THEN THE System SHALL عرض جميع الدرجات المعتمدة من `GET /api/grades/student/grades`.
4. IF كانت هناك فواتير غير مدفوعة، THEN THE System SHALL عرض رسالة "يرجى سداد المصاريف الدراسية لعرض النتائج" مع رابط لصفحة المدفوعات.
5. WHEN يضغط الطالب على "عرض المدفوعات"، THE System SHALL جلب الفواتير من `GET /api/grades/student/invoices` وعرض ملخص المبالغ المستحقة والمدفوعة.
6. THE System SHALL عرض جميع المواد مع الدرجات والتقدير النهائي لكل مادة في جدول منظم.
7. THE System SHALL حساب وعرض المعدل التراكمي (GPA) بناءً على جميع الدرجات المعتمدة.
8. THE API SHALL إضافة endpoint `GET /api/student/payment-status` يُعيد `{ all_paid: boolean, total_due: number }`.

---

### المتطلب 5: اختبار شامل لوظائف المحاسب

**قصة المستخدم:** بوصفي محاسبًا، أريد التأكد من أن جميع وظائفي تعمل بشكل صحيح، حتى أتمكن من إدارة المدفوعات بكفاءة.

#### معايير القبول

1. WHEN يفتح المحاسب لوحة التحكم، THE System SHALL عرض ملخص مالي من `GET /api/accountant/summary` يشمل: إجمالي الفواتير، إجمالي المدفوعات، إجمالي المتأخرات، عدد الفواتير المتأخرة.
2. WHEN يبحث المحاسب عن طالب بالرقم القومي، THE System SHALL جلب بيانات الطالب من `GET /api/accountant/students/search?national_id=X` وعرض فواتيره.
3. WHEN يبحث المحاسب عن طالب بكود الطالب، THE System SHALL جلب بيانات الطالب من `GET /api/accountant/students/search?student_code=Y` وعرض فواتيره.
4. WHEN يضغط المحاسب على "إنشاء فاتورة"، THE System SHALL عرض نموذج يقبل: الطالب، السنة الدراسية، الترم، المبلغ، تاريخ الاستحقاق، ثم إرسال `POST /api/accountant/invoices`.
5. WHEN يضغط المحاسب على "تسجيل دفعة"، THE System SHALL عرض نموذج يقبل: الفاتورة، المبلغ، طريقة الدفع، رقم المعاملة، ثم إرسال `POST /api/accountant/payments`.
6. THE System SHALL تحديث حالة الفاتورة تلقائيًا بعد تسجيل الدفعة: `partial` إذا كان المبلغ المدفوع أقل من الإجمالي، `paid` إذا كان مساويًا أو أكبر.
7. THE System SHALL تمييز الفواتير المتأخرة (تجاوزت تاريخ الاستحقاق ولم تُسدَّد) بلون أحمر في القائمة.
8. THE System SHALL عرض ملخص لكل طالب يشمل: إجمالي الفواتير، إجمالي المدفوعات، المبلغ المتبقي.
9. THE API SHALL التأكد من أن جميع endpoints المحاسب محمية بدور `accountant`.
10. THE API SHALL إعادة رسائل خطأ واضحة عند فشل أي عملية (مثل: فاتورة غير موجودة، مبلغ غير صحيح).

---

### المتطلب 6: تحسين واجهة ProfessorGrades

**قصة المستخدم:** بوصفي أستاذًا، أريد واجهة سهلة الاستخدام لإدارة الدرجات، حتى أتمكن من إدخال الدرجات بسرعة ودقة.

#### معايير القبول

1. THE System SHALL عرض قائمة المواد في بطاقات (cards) تحتوي على: اسم المادة، التخصص، عدد الطلاب المسجلين، عدد الدرجات المدخلة.
2. WHEN يختار الأستاذ مادة، THE System SHALL عرض جدول الطلاب مع أعمدة: كود الطالب، الاسم، ass1، ass2، final، النتيجة النهائية، التقدير، الحالة، الإجراءات.
3. THE System SHALL عرض نموذج إدخال الدرجات في نافذة منبثقة (modal) بدلًا من صفحة منفصلة.
4. THE System SHALL عرض الدرجات القصوى والنسب المئوية من إعدادات المادة بجانب كل حقل.
5. THE System SHALL حساب وعرض النتيجة النهائية تلقائيًا أثناء الإدخال (live calculation).
6. THE System SHALL عرض مؤشر تحميل (loading spinner) أثناء حفظ الدرجات.
7. THE System SHALL عرض إشعار نجاح (toast notification) عند حفظ الدرجات بنجاح.
8. THE System SHALL عرض رسالة خطأ واضحة إذا فشل الحفظ مع إمكانية إعادة المحاولة.
9. THE System SHALL دعم الفلترة بحالة الدرجة: الكل، draft، pending، approved.
10. THE System SHALL دعم البحث عن طالب بالكود أو الاسم.

---

### المتطلب 7: تحسين واجهة StudentPortal

**قصة المستخدم:** بوصفي طالبًا، أريد واجهة واضحة لعرض نتائجي ومدفوعاتي، حتى أتمكن من متابعة وضعي الأكاديمي والمالي بسهولة.

#### معايير القبول

1. THE System SHALL عرض بطاقة ملخص في أعلى الصفحة تحتوي على: الاسم، كود الطالب، التخصص، السنة الحالية، GPA، الحالة الأكاديمية.
2. THE System SHALL عرض زرين رئيسيين: "عرض النتيجة" و "عرض المدفوعات".
3. WHEN يضغط الطالب على "عرض النتيجة"، THE System SHALL التحقق من حالة المدفوعات أولاً.
4. IF كانت المدفوعات مكتملة، THEN THE System SHALL عرض جدول الدرجات مجمّعًا حسب السنة الدراسية والترم.
5. THE System SHALL عرض لكل مادة: الكود، الاسم، ass1، ass2، final، النتيجة النهائية، التقدير، الساعات المعتمدة.
6. THE System SHALL حساب وعرض GPA لكل ترم وGPA التراكمي الإجمالي.
7. WHEN يضغط الطالب على "عرض المدفوعات"، THE System SHALL عرض جدول الفواتير مع: رقم الفاتورة، السنة الدراسية، الترم، المبلغ الإجمالي، المبلغ المدفوع، المبلغ المتبقي، تاريخ الاستحقاق، الحالة.
8. THE System SHALL تمييز الفواتير المتأخرة بلون أحمر.
9. THE System SHALL عرض ملخص المدفوعات: إجمالي الفواتير، إجمالي المدفوعات، المبلغ المتبقي.
10. IF لم تكن هناك درجات معتمدة، THEN THE System SHALL عرض رسالة "لا توجد درجات معتمدة حتى الآن".

---

### المتطلب 8: Parser وPretty Printer لإعدادات الدرجات

**قصة المستخدم:** بوصفي مطوّرًا، أريد parser وpretty printer لإعدادات الدرجات، حتى أتمكن من استيراد وتصدير الإعدادات بسهولة.

#### معايير القبول

1. THE System SHALL إضافة parser يقرأ ملف JSON يحتوي على إعدادات الدرجات لعدة مواد.
2. WHEN يُستدعى Parser بملف JSON صحيح، THE Parser SHALL تحويله إلى كائنات `CourseGradeConfig` صالحة.
3. WHEN يُستدعى Parser بملف JSON غير صحيح، THE Parser SHALL إعادة رسالة خطأ وصفية تحدد الخطأ بدقة.
4. THE System SHALL إضافة pretty printer يحوّل كائنات `CourseGradeConfig` إلى ملف JSON منسّق.
5. THE Pretty_Printer SHALL تنسيق JSON بمسافات بادئة (indentation) وترتيب الحقول بشكل منطقي.
6. FOR ALL valid `CourseGradeConfig` objects، parsing ثم printing ثم parsing مرة أخرى SHALL ينتج كائنًا مكافئًا للكائن الأصلي (round-trip property).
7. THE System SHALL إضافة endpoint `POST /api/admin/course-grade-config/import` يقبل ملف JSON ويستورد الإعدادات.
8. THE System SHALL إضافة endpoint `GET /api/admin/course-grade-config/export` يُصدّر جميع الإعدادات كملف JSON.

---

### المتطلب 9: Property-Based Testing للحسابات

**قصة المستخدم:** بوصفي مطوّرًا، أريد اختبارات property-based شاملة، حتى أتأكد من صحة الحسابات في جميع الحالات.

#### معايير القبول

1. THE System SHALL إضافة property test يتحقق من أن حساب النتيجة النهائية صحيح لأي مجموعة من الدرجات وإعدادات المادة.
2. THE System SHALL إضافة property test يتحقق من أن مجموع النسب المئوية يساوي 100% دائمًا قبل حفظ الإعدادات.
3. THE System SHALL إضافة property test يتحقق من أن تحويل P/M/D إلى درجات رقمية يتبع إعدادات المادة بشكل صحيح.
4. THE System SHALL إضافة property test يتحقق من أن حساب GPA صحيح لأي مجموعة من الدرجات المعتمدة.
5. THE System SHALL إضافة property test يتحقق من أن round-trip (parse → print → parse) ينتج نفس الكائن الأصلي.
6. THE System SHALL إضافة property test يتحقق من أن حالة الفاتورة تُحدّث بشكل صحيح بعد كل دفعة.
7. THE System SHALL تشغيل كل property test بحد أدنى 100 iteration.

---

### المتطلب 10: Integration Tests للربط بين المدفوعات والنتائج

**قصة المستخدم:** بوصفي مطوّرًا، أريد integration tests تتحقق من الربط الصحيح بين المدفوعات وعرض النتائج، حتى أتأكد من تطبيق السياسة بشكل صحيح.

#### معايير القبول

1. THE System SHALL إضافة integration test يتحقق من أن الطالب الذي لم يدفع لا يمكنه رؤية النتائج.
2. THE System SHALL إضافة integration test يتحقق من أن الطالب الذي دفع جميع الفواتير يمكنه رؤية النتائج.
3. THE System SHALL إضافة integration test يتحقق من أن حالة الفاتورة تُحدّث بشكل صحيح بعد تسجيل دفعة.
4. THE System SHALL إضافة integration test يتحقق من أن المحاسب يمكنه إنشاء فاتورة وتسجيل دفعة بنجاح.
5. THE System SHALL إضافة integration test يتحقق من أن الأستاذ يمكنه إضافة وتعديل وحذف درجات بنجاح.
6. THE System SHALL إضافة integration test يتحقق من أن الأدمن يمكنه تحديث إعدادات الدرجات وتنعكس التغييرات على الحسابات.

---

## ملاحظات إضافية

### القيم الافتراضية

إذا لم تكن هناك إعدادات مخصصة لمادة معينة، يستخدم النظام القيم الافتراضية التالية:
- `ass1_percentage`: 15%
- `ass2_percentage`: 15%
- `final_percentage`: 70%
- `ass1_max`: 30
- `ass2_max`: 30
- `final_max`: 150
- `p_value`: 30 (Pass)
- `m_value`: 21 (Merit)
- `d_value`: 15 (Distinction)

### معادلة حساب النتيجة النهائية

```
ass1_numeric = p_value أو m_value أو d_value حسب الرمز المدخل
ass2_numeric = p_value أو m_value أو d_value حسب الرمز المدخل

total_score = (ass1_numeric * ass1_percentage + ass2_numeric * ass2_percentage + final * final_percentage) / 100

total_percentage = (total_score / (ass1_max + ass2_max + final_max)) * 100

التقدير:
- ≥85% → Distinction (A) → grade_point = 4.0
- ≥70% → Merit (B) → grade_point = 3.0
- ≥50% → Pass (C) → grade_point = 2.0
- ≥30% → Refer (D) → grade_point = 1.0
- <30% → Fail (F) → grade_point = 0.0
```

### معادلة حساب GPA

```
GPA = Σ(grade_point × credit_hours) / Σ(credit_hours)
      لجميع الدرجات حيث status = 'approved'
```

### شرط عرض النتائج

```
all_paid = (total_due == 0) OR (جميع الفواتير المستحقة مدفوعة)

IF all_paid == true:
  عرض النتائج
ELSE:
  عرض رسالة "يرجى سداد المصاريف الدراسية"
```
