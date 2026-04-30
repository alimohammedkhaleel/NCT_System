# مستند المتطلبات: تحسينات لوحات التحكم وواجهة المستخدم لنظام NCTU ERP

## المقدمة

يهدف هذا المشروع إلى تحسين تجربة المستخدم في نظام NCTU ERP من خلال توحيد نظام الألوان عبر جميع الصفحات، إضافة ميزات جديدة لتسهيل الوصول للمعلومات، والتأكد من عمل جميع الوظائف بشكل صحيح. يشمل المشروع تحسينات على لوحة المحاسب، توحيد ألوان الجداول، تحسين صفحة تسجيل الدخول، وإضافة ميزات جديدة للطلاب.

## المصطلحات

- **System**: نظام NCTU ERP الكامل
- **UI_Component**: أي عنصر واجهة مستخدم (جدول، نموذج، بطاقة، إلخ)
- **Dashboard**: لوحة التحكم الخاصة بكل دور (Admin, Accountant, Professor, Student)
- **Color_Theme**: نظام الألوان الموحد للنظام
- **Student_Code**: الكود الفريد المخصص لكل طالب
- **National_ID**: الرقم القومي المكون من 14 رقم
- **Login_Form**: نموذج تسجيل الدخول
- **Navbar**: شريط التنقل العلوي
- **Table_Component**: عنصر الجدول المستخدم لعرض البيانات
- **Specialty_Card**: بطاقة التخصص في لوحة الإدارة
- **Payment_Status**: حالة دفع المصروفات (مدفوع/غير مدفوع)
- **Result_Status**: حالة ظهور النتيجة (ظهرت/لم تظهر)
- **Registration_Link**: رابط تسجيل الطلاب الجدد

## المتطلبات

### المتطلب 1: اختبار وظائف لوحة المحاسب

**قصة المستخدم:** كمحاسب، أريد أن تعمل جميع وظائف لوحتي بشكل صحيح، حتى أتمكن من إدارة المصروفات والفواتير بكفاءة.

#### معايير القبول

1. WHEN المحاسب يفتح صفحة إدارة الطلاب (http://localhost:5173/admin/students), THE System SHALL عرض قائمة الطلاب بشكل صحيح مع جميع البيانات
2. WHEN المحاسب ينقر على أي وظيفة في لوحة التحكم, THE System SHALL تنفيذ الوظيفة بدون أخطاء
3. THE Accountant_Dashboard SHALL عرض جميع الإحصائيات المالية بشكل صحيح
4. WHEN المحاسب يبحث عن طالب, THE System SHALL إرجاع النتائج الصحيحة خلال 2 ثانية
5. THE System SHALL حفظ جميع التغييرات في قاعدة البيانات بشكل فوري

### المتطلب 2: توحيد ألوان الجداول

**قصة المستخدم:** كمستخدم للنظام، أريد أن تكون جميع الجداول بنفس الألوان والتصميم، حتى أحصل على تجربة متسقة عبر النظام.

#### معايير القبول

1. THE System SHALL استخدام نفس نظام الألوان لجميع Table_Components في النظام
2. THE Professor_Dashboard_Table SHALL استخدام نفس ألوان Student_Registration_Table
3. THE Admin_Students_Management_Table SHALL استخدام نفس ألوان Student_Registration_Table
4. THE Table_Component SHALL استخدام Purple Primary (#b36eff) كلون رئيسي
5. THE Table_Component SHALL استخدام Purple Dark (#9448b5) للعناصر المحددة
6. THE Table_Component SHALL استخدام Purple Light (#b388ff) للتأثيرات التفاعلية
7. THE Table_Component SHALL استخدام Background gradient (linear-gradient(135deg, #0a043c, #1c062e, #2c003e)) كخلفية
8. WHEN المستخدم يمرر الماوس على صف في الجدول, THE System SHALL تطبيق تأثير hover بلون Purple Light
9. THE Table_Component SHALL استخدام Glass Effect (backdrop-filter: blur(25px)) للخلفية

### المتطلب 3: توحيد ألوان صفحة تسجيل الدخول ولوحة الإدارة

**قصة المستخدم:** كمسؤول، أريد أن تتطابق ألوان لوحة التحكم مع صفحة تسجيل الدخول، حتى يكون النظام متناسقاً بصرياً.

#### معايير القبول

1. THE Admin_Dashboard SHALL استخدام نفس Background gradient المستخدم في Login_Form
2. THE Admin_Dashboard SHALL استخدام Background gradient: linear-gradient(135deg, #7e39b6, #b36eff)
3. THE Admin_Dashboard_Cards SHALL استخدام Form background: rgba(255, 255, 255, 0.95)
4. WHEN المستخدم ينتقل من Login إلى Dashboard, THE System SHALL الحفاظ على الاتساق البصري
5. THE System SHALL تطبيق نفس نظام الألوان على جميع عناصر Admin_Dashboard

### المتطلب 4: إضافة ميزة معرفة كود الطالب في نموذج تسجيل الدخول

**قصة المستخدم:** كطالب، أريد أن أتمكن من معرفة كود الطالب الخاص بي باستخدام الرقم القومي، حتى أتمكن من تسجيل الدخول حتى لو نسيت الكود.

#### معايير القبول

1. THE Login_Form SHALL عرض رابط "نسيت كود الطالب؟" أسفل حقول تسجيل الدخول
2. WHEN الطالب ينقر على "نسيت كود الطالب؟", THE System SHALL عرض نموذج إدخال الرقم القومي
3. WHEN الطالب يدخل National_ID صحيح, THE System SHALL عرض Student_Code المرتبط به خلال 2 ثانية
4. IF الرقم القومي غير موجود في النظام, THEN THE System SHALL عرض رسالة خطأ واضحة
5. THE System SHALL التحقق من أن National_ID يتكون من 14 رقم بالضبط
6. THE System SHALL تسجيل جميع محاولات استرجاع Student_Code في سجل النظام
7. THE Forgot_Code_Modal SHALL استخدام نفس نظام الألوان الموحد

### المتطلب 5: إضافة صفحة عرض بيانات الطالب في شريط التنقل

**قصة المستخدم:** كطالب مسجل، أريد أن أرى حالة مصروفاتي ونتائجي بسهولة، حتى أتابع وضعي الأكاديمي والمالي.

#### معايير القبول

1. THE Navbar SHALL عرض رابط "بياناتي" للطلاب المسجلين فقط
2. WHEN الطالب ينقر على "بياناتي", THE System SHALL عرض صفحة تحتوي على Payment_Status و Result_Status
3. THE Student_Data_Page SHALL عرض Payment_Status (تم الدفع / لم يتم الدفع) بوضوح
4. THE Student_Data_Page SHALL عرض Result_Status (ظهرت النتيجة / لم تظهر) بوضوح
5. IF الطالب غير مسجل الدخول, THEN THE System SHALL إخفاء رابط "بياناتي"
6. THE Student_Data_Page SHALL تحديث البيانات تلقائياً عند تغيير Payment_Status أو Result_Status
7. THE Student_Data_Page SHALL استخدام نظام الألوان الموحد
8. THE System SHALL عرض تاريخ آخر تحديث للبيانات

### المتطلب 6: التحقق من مسارات بطاقات التخصصات في لوحة الإدارة

**قصة المستخدم:** كمسؤول، أريد أن تعمل جميع روابط التخصصات بشكل صحيح، حتى أتمكن من إدارة كل تخصص بسهولة.

#### معايير القبول

1. THE Admin_Dashboard SHALL عرض 6 Specialty_Cards (MCT, AUT, ICT, PRO, OIL, REN)
2. WHEN المسؤول ينقر على Specialty_Card, THE System SHALL التوجه إلى صفحة إدارة التخصص الصحيحة
3. THE Specialty_Page SHALL عرض 4 سنوات دراسية لكل تخصص
4. THE ICT_Specialty SHALL عرض مسارين في السنة الثالثة: Network و Software
5. THE Specialty_Card SHALL استخدام نظام الألوان الموحد
6. THE System SHALL عرض عدد الطلاب في كل تخصص بشكل صحيح
7. WHEN المسؤول يمرر الماوس على Specialty_Card, THE System SHALL تطبيق تأثير hover بلون Purple Light
8. THE Specialty_Card SHALL استخدام Glass Effect للخلفية

### المتطلب 7: إضافة بطاقة عرض النتائج في لوحة الإدارة

**قصة المستخدم:** كمسؤول، أريد بطاقة مخصصة لعرض النتائج للطلاب، حتى أتمكن من نشر النتائج بسهولة.

#### معايير القبول

1. THE Admin_Dashboard SHALL عرض Results_Display_Card في قسم الإدارة العامة
2. THE Results_Display_Card SHALL استخدام أيقونة مناسبة (📊 أو 📈)
3. WHEN المسؤول ينقر على Results_Display_Card, THE System SHALL عرض صفحة إدارة عرض النتائج
4. THE Results_Display_Page SHALL السماح بنشر النتائج لفصل دراسي محدد
5. THE Results_Display_Page SHALL السماح بنشر النتائج لسنة دراسية محددة
6. THE Results_Display_Card SHALL استخدام نظام الألوان الموحد
7. THE Results_Display_Card SHALL عرض عدد النتائج المعلقة كـ badge
8. THE System SHALL إرسال إشعار للطلاب عند نشر النتائج

## ملاحظات إضافية

### نظام الألوان الموحد

جميع المكونات يجب أن تستخدم:
- Purple Primary: #b36eff
- Purple Dark: #9448b5
- Purple Light: #b388ff
- Purple Deep: #7e39b6
- Background: linear-gradient(135deg, #0a043c, #1c062e, #2c003e)
- Glass Effect: backdrop-filter: blur(25px), rgba(17, 1, 23, 0.5)

### التخصصات الستة

1. MCT - Mechatronics Technology (الميكاترونيكس)
2. AUT - Autotronics Technology (الأوتوترونكس)
3. ICT - Information Technology (تكنولوجيا المعلومات)
4. PRO - Prosthetics Technology (الأطراف الصناعية)
5. OIL - Oil Production Technology (إنتاج البترول)
6. REN - Renewable Energy Technology (الطاقة المتجددة)

### الهيكل الأكاديمي

- 4 سنوات دراسية لكل تخصص
- فصلين دراسيين لكل سنة
- مساران للتخصص IT في السنة الثالثة: Network و Software
