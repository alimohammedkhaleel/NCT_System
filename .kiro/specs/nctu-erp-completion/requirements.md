# وثيقة المتطلبات - إكمال نظام NCTU ERP

## مقدمة

نظام ERP لجامعة القاهرة الجديدة التكنولوجية (NCTU) هو نظام متكامل لإدارة العمليات الأكاديمية والإدارية. المشروع الحالي يمتلك بنية تحتية جيدة (Express.js + MySQL + Sequelize في الـ Backend، و React 18 + Vite في الـ Frontend) مع نماذج بيانات مكتملة ونظام مصادقة JWT. الهدف من هذه المتطلبات هو إكمال الجزء المتبقي: ربط الـ Frontend بالـ Backend الحقيقي، إضافة الصفحات الناقصة، وتوحيد نظام الألوان.

---

## قاموس المصطلحات

- **النظام (System)**: نظام NCTU ERP بمكوناته الكاملة (Frontend + Backend)
- **الأدمن (Admin)**: مستخدم بصلاحية `admin` يدير النظام بالكامل
- **الأستاذ (Professor)**: مستخدم بصلاحية `professor` يدير درجات الطلاب في موادّه
- **الطالب (Student)**: مستخدم بصلاحية `student` يطّلع على بياناته الأكاديمية
- **المحاسب (Accountant)**: مستخدم بصلاحية `accountant` يدير الفواتير والمدفوعات
- **GPA**: المعدل التراكمي المحسوب من نقاط الدرجات (grade_point) مقسومًا على مجموع الساعات المعتمدة
- **نظام الألوان (Color_System)**: نظام البنفسجي الداكن (`#0A2472`) والذهبي (`#D4AF37`) المعرّف في `index.css`
- **الترقية (Promotion)**: نقل الطالب من ترم إلى ترم أو من سنة إلى سنة أعلى
- **QR Code**: رمز الاستجابة السريعة المستخدم لتسجيل الطالب في النظام
- **Mock Data**: بيانات وهمية مضمّنة في الكود بدلًا من استدعاء الـ API الحقيقي
- **الـ API (API)**: واجهة برمجية على الـ Backend تُعيد بيانات حقيقية من قاعدة البيانات
- **StudentPortal**: صفحة بوابة الطالب في الـ Frontend
- **ProfessorGrades**: صفحة إدارة الدرجات للأستاذ في الـ Frontend
- **StudentsManagement**: صفحة إدارة الطلاب في لوحة الأدمن
- **AccountantDashboard**: لوحة تحكم المحاسب

---

## المتطلبات

---

### المتطلب 1: توحيد نظام الألوان

**قصة المستخدم:** بوصفي مستخدمًا للنظام، أريد أن تكون جميع الصفحات بنفس نظام الألوان البنفسجي/الذهبي، حتى تبدو الواجهة متسقة واحترافية.

#### معايير القبول

1. THE Color_System SHALL تعريف اللون الأساسي بقيمة `#0A2472` (بنفسجي داكن) واللون الثانوي بقيمة `#D4AF37` (ذهبي) في ملف `index.css` كمتغيرات CSS.
2. WHEN يُعرض أي مكوّن في الـ Frontend، THE Color_System SHALL تطبيق متغيرات `--primary-color` و`--secondary-color` بدلًا من أي قيم ألوان مضمّنة مباشرة.
3. THE Color_System SHALL تطبيق نظام الألوان على جميع الصفحات التالية: `AdminDashboard`، `CoursesPage`، `ProfessorsPage`، `GradeSettingsPage`، `PendingGradesPage`، `QRCodePage`، `TimetablesPage`، `ProfessorGrades`، `StudentPortal`.
4. WHEN يُحوّم المستخدم فوق أي زر رئيسي، THE Color_System SHALL إظهار تأثير hover يستخدم `--secondary-color` أو `--primary-dark`.
5. IF كان أي ملف CSS يحتوي على قيمة لون مضمّنة مباشرة تتعارض مع نظام الألوان، THEN THE Color_System SHALL استبدالها بالمتغير المقابل.

---

### المتطلب 2: إدارة الطلاب في لوحة الأدمن

**قصة المستخدم:** بوصفي أدمن، أريد صفحة مخصصة لإدارة الطلاب مع إمكانية البحث والفلترة، حتى أتمكن من إيجاد أي طالب بسرعة وإدارة بياناته.

#### معايير القبول

1. THE System SHALL إضافة مسار `/admin/students` في الـ Frontend يعرض صفحة `StudentsManagement`.
2. WHEN يفتح الأدمن صفحة `StudentsManagement`، THE System SHALL جلب قائمة الطلاب من `GET /api/admin/students` وعرضها في جدول يحتوي على: كود الطالب، الاسم الكامل، الرقم القومي، التخصص، السنة الحالية، الحالة الأكاديمية.
3. WHEN يكتب الأدمن في حقل البحث، THE System SHALL فلترة الطلاب بالكود (`student_code`) أو الرقم القومي (`national_id`) أو الاسم في الوقت الفعلي.
4. WHEN يضغط الأدمن على "إضافة طالب"، THE System SHALL عرض نموذج يقبل: الاسم الكامل، البريد الإلكتروني، كلمة المرور، الرقم القومي، التخصص، السنة الحالية، ثم إرسال `POST /api/admin/students`.
5. WHEN يضغط الأدمن على "تعديل" لطالب معين، THE System SHALL عرض نموذج مملوء ببيانات الطالب الحالية وإرسال `PUT /api/admin/students/:id` عند الحفظ.
6. IF أدخل الأدمن رقمًا قوميًا مكررًا أو كودًا مكررًا، THEN THE System SHALL عرض رسالة خطأ واضحة دون حفظ البيانات.
7. THE API SHALL إضافة endpoint `GET /api/admin/students` يدعم query params: `search` (يبحث في student_code و national_id والاسم)، `specialty_id`، `current_year`، `academic_status`.
8. THE API SHALL إضافة endpoint `POST /api/admin/students` ينشئ User بدور `student` وسجل Student مرتبط به في نفس الـ transaction.
9. THE API SHALL إضافة endpoint `PUT /api/admin/students/:id` لتحديث بيانات الطالب.

---

### المتطلب 3: نظام ترقية الطلاب

**قصة المستخدم:** بوصفي أدمن، أريد نقل الطلاب من ترم إلى ترم أو من سنة إلى سنة، حتى تنعكس التقدم الأكاديمي في النظام تلقائيًا.

#### معايير القبول

1. WHEN يكون الأدمن في صفحة `StudentsManagement`، THE System SHALL عرض زر "نقل للترم الثاني" لكل طالب في الترم الأول من سنته الحالية.
2. WHEN يضغط الأدمن على "نقل للترم الثاني"، THE System SHALL إرسال `POST /api/admin/students/:id/promote` مع `{ promotion_type: "semester" }` وتحديث حالة الطالب في الواجهة فور النجاح.
3. WHEN يكون الأدمن في صفحة `StudentsManagement`، THE System SHALL عرض زر "نقل للسنة الجديدة" لكل طالب أتمّ الترم الثاني من سنته الحالية.
4. WHEN يضغط الأدمن على "نقل للسنة الجديدة"، THE System SHALL عرض نافذة تأكيد تذكر اسم الطالب والسنة الحالية والسنة الجديدة قبل التنفيذ.
5. WHEN يؤكد الأدمن النقل للسنة الجديدة، THE System SHALL إرسال `POST /api/admin/students/:id/promote` مع `{ promotion_type: "year" }` وزيادة `current_year` بمقدار 1.
6. IF كان `current_year` للطالب يساوي 4 (السنة النهائية)، THEN THE System SHALL عرض خيار "تخريج الطالب" بدلًا من "نقل للسنة الجديدة" وتغيير `academic_status` إلى `graduated`.
7. IF حاول الأدمن ترقية طالب حالته `suspended` أو `dropped`، THEN THE System SHALL رفض العملية وعرض رسالة خطأ.
8. THE API SHALL إضافة endpoint `POST /api/admin/students/:id/promote` يقبل `promotion_type` بقيمة `semester` أو `year` أو `graduate` ويُحدّث بيانات الطالب في قاعدة البيانات.

---

### المتطلب 4: ربط صفحة الأستاذ بالـ API الحقيقي

**قصة المستخدم:** بوصفي أستاذًا، أريد رؤية موادّي الحقيقية المخصصة لي وإدخال درجات الطلاب الفعليين، حتى لا أعتمد على بيانات وهمية.

#### معايير القبول

1. WHEN يفتح الأستاذ صفحة `ProfessorGrades`، THE System SHALL جلب قائمة التخصصات من `GET /api/admin/specialties` وعرضها في قائمة منسدلة.
2. WHEN يختار الأستاذ تخصصًا، THE System SHALL جلب المواد المخصصة له في هذا التخصص من `GET /api/grades/professor/courses` وعرضها.
3. WHEN يختار الأستاذ مادة، THE System SHALL جلب قائمة الطلاب المسجلين في هذه المادة مع درجاتهم الحالية (إن وُجدت) من `GET /api/grades/professor?course_id=X`.
4. WHEN يحفظ الأستاذ درجة طالب، THE System SHALL إرسال `POST /api/grades` بالبيانات الحقيقية وعرض رسالة نجاح أو خطأ من الـ API.
5. WHEN يضغط الأستاذ "إرسال الدرجات للمراجعة"، THE System SHALL إرسال `POST /api/grades/:id/submit-for-approval` لكل درجة بحالة `draft` وتحديث الحالة في الواجهة.
6. IF فشل استدعاء الـ API لأي سبب، THEN THE System SHALL عرض رسالة خطأ واضحة للأستاذ مع إمكانية إعادة المحاولة.
7. THE API SHALL إضافة endpoint `GET /api/grades/professor/courses` يُعيد المواد المخصصة للأستاذ المسجّل حاليًا مع بيانات التخصص والسنة الدراسية.

---

### المتطلب 5: ربط بوابة الطالب بالـ API الحقيقي

**قصة المستخدم:** بوصفي طالبًا، أريد رؤية درجاتي الحقيقية ومعدلي التراكمي (GPA) وبياناتي الأكاديمية الفعلية، بدلًا من بيانات وهمية.

#### معايير القبول

1. WHEN يفتح الطالب المسجّل صفحة `StudentPortal`، THE System SHALL جلب بياناته تلقائيًا من `GET /api/grades/student/dashboard` دون الحاجة لإدخال ID يدوي.
2. THE System SHALL عرض: الاسم الكامل، كود الطالب، التخصص، السنة الحالية، الحالة الأكاديمية، المعدل التراكمي (GPA).
3. WHEN يطلب الطالب عرض درجاته، THE System SHALL جلب الدرجات المعتمدة فقط من `GET /api/grades/student/grades` وعرضها مجمّعة حسب السنة الدراسية والترم.
4. THE System SHALL حساب وعرض GPA الطالب بالمعادلة: مجموع (grade_point × credit_hours) لكل مادة مقسومًا على مجموع credit_hours لجميع المواد المعتمدة.
5. WHEN يطلب الطالب عرض فواتيره، THE System SHALL جلب الفواتير من `GET /api/grades/student/invoices` وعرض ملخص المبالغ المستحقة والمدفوعة.
6. IF لم يكن الطالب مسجّلًا (غير مصادق)، THEN THE System SHALL توجيهه لصفحة تسجيل الدخول.
7. IF لم تكن هناك درجات معتمدة بعد، THEN THE System SHALL عرض رسالة "لا توجد درجات معتمدة حتى الآن" بدلًا من جدول فارغ.

---

### المتطلب 6: نظام GPA والتقدير العام

**قصة المستخدم:** بوصفي طالبًا أو أدمن، أريد حساب GPA دقيق ومتسق في جميع أنحاء النظام، حتى تعكس الدرجات المعدل الحقيقي.

#### معايير القبول

1. THE System SHALL حساب GPA بالمعادلة: `Σ(grade_point × credit_hours) / Σ(credit_hours)` لجميع المواد ذات الدرجات المعتمدة (`status = 'approved'`).
2. THE System SHALL تقريب GPA إلى خانتين عشريتين.
3. THE System SHALL تصنيف GPA وفق الجدول التالي: 3.7–4.0 = Distinction، 3.0–3.69 = Merit، 2.0–2.99 = Pass، أقل من 2.0 = Fail.
4. WHEN يُعتمد grade جديد للطالب، THE System SHALL إعادة حساب GPA الإجمالي للطالب وتخزينه أو إعادة حسابه عند الطلب.
5. THE API SHALL إضافة حقل `gpa` في استجابة `GET /api/grades/student/dashboard` محسوبًا من الدرجات المعتمدة.
6. IF لم تكن هناك مواد معتمدة للطالب، THEN THE System SHALL إعادة `gpa: 0.0` بدلًا من خطأ حسابي.

---

### المتطلب 7: تحسين نظام QR Code للتسجيل الذاتي

**قصة المستخدم:** بوصفي طالبًا، أريد استخدام QR Code الخاص بي لإتمام تسجيلي في النظام بسهولة، وبوصفي أدمن أريد إدارة هذه الرموز بكفاءة.

#### معايير القبول

1. WHEN يفتح الطالب المسجّل صفحة `QRCodeRegistration`، THE System SHALL جلب QR Code الخاص به من `GET /api/grades/student/qr-code` وعرضه كصورة قابلة للتنزيل.
2. WHEN يمسح شخص QR Code الطالب، THE System SHALL التحقق من صحة الرمز عبر `POST /api/auth/verify-qr` وتسجيل عملية المسح في قاعدة البيانات.
3. IF كان QR Code منتهي الصلاحية أو غير نشط، THEN THE System SHALL عرض رسالة خطأ واضحة وإتاحة طلب رمز جديد.
4. WHEN يضغط الأدمن على "توليد QR" لطالب في صفحة `QRCodePage`، THE System SHALL استدعاء `POST /api/admin/qr-codes/generate/:studentId` وعرض الرمز الجديد فورًا.
5. WHEN يضغط الأدمن على "إلغاء QR" لطالب، THE System SHALL استدعاء `DELETE /api/admin/qr-codes/:studentId` وتحديث حالة الرمز في الواجهة.
6. THE System SHALL عرض حالة QR Code لكل طالب في صفحة `QRCodePage`: نشط/منتهي/غير موجود، مع تاريخ الإنشاء وتاريخ الانتهاء.

---

### المتطلب 8: لوحة تحكم المحاسب

**قصة المستخدم:** بوصفي محاسبًا، أريد لوحة تحكم مخصصة لإدارة الفواتير والمدفوعات، حتى أتمكن من متابعة الوضع المالي للطلاب.

#### معايير القبول

1. THE System SHALL إضافة دور `accountant` في نظام المصادقة الحالي بجانب الأدوار الموجودة.
2. THE System SHALL إضافة مسار `/accountant` في الـ Frontend يعرض صفحة `AccountantDashboard` محمية بدور `accountant`.
3. WHEN يفتح المحاسب لوحة التحكم، THE System SHALL عرض ملخص مالي يشمل: إجمالي الفواتير، إجمالي المدفوعات، إجمالي المتأخرات، عدد الفواتير المتأخرة.
4. WHEN يبحث المحاسب عن طالب، THE System SHALL جلب فواتيره من `GET /api/accountant/students/:id/invoices` وعرضها مع حالة كل فاتورة.
5. WHEN يضغط المحاسب على "تسجيل دفعة"، THE System SHALL عرض نموذج يقبل: المبلغ، طريقة الدفع، رقم المعاملة، ثم إرسال `POST /api/accountant/payments`.
6. WHEN يضغط المحاسب على "إنشاء فاتورة"، THE System SHALL عرض نموذج يقبل: الطالب، السنة الدراسية، الترم، المبلغ، تاريخ الاستحقاق، ثم إرسال `POST /api/accountant/invoices`.
7. IF كانت فاتورة متأخرة (تجاوزت تاريخ الاستحقاق ولم تُسدَّد)، THEN THE System SHALL تمييزها بلون مختلف في القائمة.
8. THE API SHALL إضافة routes خاصة بالمحاسب تحت `/api/accountant/` محمية بدور `accountant`.

---

### المتطلب 9: إكمال API endpoints الناقصة

**قصة المستخدم:** بوصفي مطوّرًا، أريد أن تكون جميع الـ API endpoints المطلوبة موجودة ومتسقة، حتى يتمكن الـ Frontend من الاتصال بها بشكل صحيح.

#### معايير القبول

1. THE API SHALL إضافة `GET /api/admin/students` مع دعم الفلترة والبحث كما هو محدد في المتطلب 2.
2. THE API SHALL إضافة `POST /api/admin/students` لإنشاء طالب جديد.
3. THE API SHALL إضافة `PUT /api/admin/students/:id` لتحديث بيانات طالب.
4. THE API SHALL إضافة `POST /api/admin/students/:id/promote` لترقية الطالب.
5. THE API SHALL إضافة `GET /api/grades/professor/courses` لجلب مواد الأستاذ الحالي.
6. THE API SHALL إضافة `GET /api/accountant/students/:id/invoices` لجلب فواتير طالب.
7. THE API SHALL إضافة `POST /api/accountant/invoices` لإنشاء فاتورة جديدة.
8. THE API SHALL إضافة `POST /api/accountant/payments` لتسجيل دفعة.
9. WHEN يُستدعى أي endpoint غير موجود، THE API SHALL إعادة استجابة HTTP 404 مع رسالة واضحة.
10. THE API SHALL إعادة جميع الاستجابات بتنسيق JSON موحّد: `{ success: boolean, data: any, message: string }`.

---

### المتطلب 10: تحسين تجربة المستخدم العامة

**قصة المستخدم:** بوصفي مستخدمًا للنظام، أريد تجربة استخدام سلسة مع تغذية راجعة واضحة عند كل إجراء، حتى أعرف دائمًا ما يحدث في النظام.

#### معايير القبول

1. WHILE يجري النظام استدعاء API، THE System SHALL عرض مؤشر تحميل (loading spinner) في المنطقة المعنية.
2. WHEN ينجح أي إجراء (حفظ، تعديل، حذف)، THE System SHALL عرض إشعار نجاح (toast notification) يختفي تلقائيًا بعد 3 ثوانٍ.
3. IF فشل أي استدعاء API بسبب خطأ في الشبكة أو الخادم، THEN THE System SHALL عرض رسالة خطأ واضحة مع زر "إعادة المحاولة".
4. WHEN تنتهي جلسة المستخدم (انتهاء صلاحية JWT)، THE System SHALL توجيهه تلقائيًا لصفحة تسجيل الدخول مع رسالة "انتهت جلستك، يرجى تسجيل الدخول مجددًا".
5. THE System SHALL دعم اللغة العربية بالكامل في جميع الصفحات الجديدة مع ضبط اتجاه النص RTL.
6. WHEN يكون الجدول فارغًا (لا توجد بيانات)، THE System SHALL عرض رسالة "لا توجد بيانات" بدلًا من جدول فارغ.
