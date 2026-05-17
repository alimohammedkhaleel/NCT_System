# نظام NCT — الدليل الشامل للمشروع

> **نظام ERP أكاديمي ومالي متكامل** للكلية التقنية الجديدة — New Cairo Technology College
>
> يهدف النظام إلى رقمنة دورة حياة الكلية بالكامل بدءاً من التسجيل، مروراً بالعملية الأكاديمية والمالية، وصولاً إلى التخرج.

---

## 📋 فهرس المحتويات

1. [نظرة عامة على المشروع](#1-نظرة-عامة-على-المشروع)
2. [التقنيات الأساسية](#2-التقنيات-الأساسية)
3. [هيكل المشروع (شجرة الملفات الشاملة)](#3-هيكل-المشروع-شجرة-الملفات-الشاملة)
4. [شرح تفصيلي لملفات الخادم (Server)](#4-شرح-تفصيلي-لملفات-الخادم-server)
5. [شرح تفصيلي لملفات الواجهة (Client)](#5-شرح-تفصيلي-لملفات-الواجهة-client)
6. [قاعدة البيانات والعلاقات](#6-قاعدة-البيانات-والعلاقات)
7. [الأدوار والصلاحيات](#7-الأدوار-والصلاحيات)
8. [منطق الأعمال الأساسي (Business Logic)](#8-منطق-الأعمال-الأساسي-business-logic)
9. [دليل الـ API (أهم المسارات)](#9-دليل-الـ-api-أهم-المسارات)
10. [التشغيل والتثبيت](#10-التشغيل-والتثبيت)

---

## 1. نظرة عامة على المشروع

**NCT System** هو نظام تخطيط موارد المؤسسات (ERP) مبني خصيصاً ليناسب احتياجات الكلية التقنية الجديدة. 
يقوم النظام بحل المشكلات التقليدية في إدارة الكليات عبر تحويل جميع المعاملات الورقية إلى بيئة رقمية مترابطة.

**أهم ميزات النظام:**
- **دعم 6 تخصصات دراسية** (MCT, AUT, ICT, PRO, OIL, REN) بمدة دراسة 4 سنوات.
- **إدارة سير عمل الدرجات:** مسودة ← قيد المراجعة ← معتمد ← منشور.
- **ترقية تلقائية للطلاب:** نقل الطلاب للفصل/السنة التالية أو الصيفي تلقائياً.
- **نظام مالي مترابط:** منع ظهور الدرجات للطلاب المتعثرين مالياً.
- **نظام تسجيل ذاتي ذكي:** بروابط تسجيل مؤقتة للطلاب والأساتذة.

---

## 2. التقنيات الأساسية

| الجزء | التقنيات المستخدمة |
|---|---|
| **الواجهة الخلفية (Backend)** | Node.js, Express.js, Sequelize ORM, MySQL, JWT, bcryptjs, Multer |
| **الواجهة الأمامية (Frontend)**| React 18, Vite, React Router v6, GSAP, Framer Motion, Three.js, Axios |
| **البنية التحتية (DevOps)** | Docker, Docker Compose, Nginx |

---

## 3. هيكل المشروع (شجرة الملفات الشاملة)

فيما يلي شجرة تفصيلية لكل ملفات النظام الأساسية داخل `server` و `client` مع وصف دقيق لكل ملف:

```text
NCT_System/
├── server/                                # ================= الواجهة الخلفية =================
│   ├── server.js                          # نقطة الدخول الرئيسية للخادم، وتشغيل Express
│   ├── seed-data.js                       # حقن البيانات الافتراضية للكلية (أدمن، محاسب، تخصصات)
│   ├── .env                               # متغيرات البيئة (قاعدة البيانات، JWT Secret)
│   ├── package.json                       # المكتبات والاعتماديات الخاصة بالخادم
│   ├── Dockerfile                         # إعدادات بناء صورة Docker للخادم
│   │
│   ├── config/                            # المجلد الخاص بإعدادات النظام
│   │   ├── database.js                    # إعداد اتصال Sequelize بـ MySQL
│   │   ├── models.js                      # تجميع النماذج وتعريف جميع العلاقات (Associations)
│   │   ├── multer.js                      # إعدادات رفع ملفات الـ PDF (كالجداول)
│   │   └── avatarMulter.js                # إعدادات رفع صور المستخدمين الشخصية
│   │
│   ├── models/                            # نماذج قاعدة البيانات (جداول MySQL)
│   │   ├── User.js                        # جدول المستخدمين وصلاحياتهم (Role)
│   │   ├── Student.js                     # بيانات الطالب (تخصصه، سنته، الفرع)
│   │   ├── Professor.js                   # بيانات الأستاذ وتخصصه
│   │   ├── Specialty.js                   # التخصصات الستة الخاصة بالكلية ومصروفاتها
│   │   ├── AcademicYear.js                # السنوات الدراسية الأربعة
│   │   ├── Semester.js                    # الفصول الدراسية (أول وثاني)
│   │   ├── Course.js                      # المواد الدراسية وفروعها
│   │   ├── Grade.js                       # درجات الطلاب وارتباطها بالمادة والطالب
│   │   ├── CourseGradeConfig.js           # إعدادات درجات المادة (أوزان الـ P/M/D والنهائي)
│   │   ├── GradeSetting.js                # إعدادات نسبة النجاح العامة للكلية
│   │   ├── StudentEnrollment.js           # جدول وسيط لتسجيل الطلاب في المواد
│   │   ├── ProfessorCourse.js             # جدول وسيط لربط الأستاذ بالمواد التي يدرسها
│   │   ├── FeeInvoice.js                  # فواتير المصروفات الخاصة بالطالب
│   │   ├── Payment.js                     # المدفوعات التي سددها الطالب
│   │   ├── SpecialtyFee.js                # المصروفات الأساسية ورسوم الصيفي والإعادة لكل تخصص
│   │   ├── RegistrationLink.js            # الروابط المؤقتة لتسجيل الطلاب
│   │   ├── RegistrationRequest.js         # طلبات الطلاب بانتظار موافقة الإدارة
│   │   ├── ProfessorRegistrationLink.js   # الروابط المؤقتة لتسجيل الأساتذة
│   │   ├── ProfessorRegistrationRequest.js# طلبات الأساتذة بانتظار الإدارة
│   │   ├── Timetable.js                   # جداول الطلاب الدراسية (ملفات الـ PDF)
│   │   ├── StudentQRCode.js               # الـ QR Code الخاص ببطاقة الطالب
│   │   └── ActivityLog.js                 # سجل نشاطات النظام للإدارة
│   │
│   ├── controllers/                       # منطق التحكم المباشر (الـ Controllers)
│   │   ├── adminController.js             # الإدارة الأكاديمية ونشر الدرجات والترقيات
│   │   ├── extendedAdminController.js     # إضافة وإدارة الأساتذة والمواد والاعتمادات
│   │   ├── accountantController.js        # الإدارة المالية (الرسوم والفواتير)
│   │   ├── authController.js              # المصادقة (دخول، جلب بيانات، تغيير باسورد)
│   │   ├── courseController.js            # إدارة بيانات المواد وتعديلها
│   │   ├── courseGradeConfigController.js # التحكم في إعدادات توزيع درجات المواد
│   │   ├── gradeController.js             # إدخال الدرجات من قبل الأساتذة وعرضها
│   │   ├── professorRegistrationController.js # التحكم في تسجيل الأساتذة واعتمادهم
│   │   ├── studentController.js           # عرض وإدارة بيانات الطلاب الشخصية
│   │   └── timetableController.js         # دوال رفع الجداول للطلاب وعرضها
│   │
│   ├── routes/                            # مسارات الـ API
│   │   ├── adminRoutes.js                 # توجيهات مسارات الإدارة الأساسية
│   │   ├── extendedAdminRoutes.js         # مسارات الإدارة الموسعة
│   │   ├── accountantRoutes.js            # مسارات المحاسبة المالية
│   │   ├── authRoutes.js                  # مسارات تسجيل الدخول
│   │   ├── gradeRoutes.js                 # مسارات الدرجات
│   │   ├── timetableRoutes.js             # مسارات إدارة الجداول
│   │   ├── courseGradeConfigRoutes.js     # مسارات إعدادات الدرجات
│   │   ├── professorRegistrationRoutes.js # مسارات قبول الأساتذة
│   │   └── studentRoutes.js               # مسارات الطلاب
│   │
│   ├── services/                          # الخدمات المعقدة (فصل المنطق لتسهيل الصيانة)
│   │   ├── courseService.js               # خدمات تخصيص وإدارة المواد
│   │   ├── gradeApprovalService.js        # سير عمل الموافقة على الدرجات واعتمادها
│   │   ├── gradeSettingsService.js        # تغيير وتحديث إعدادات النجاح العامة
│   │   ├── professorService.js            # خدمات ربط الأساتذة وتعيينهم
│   │   ├── qrCodeService.js               # توليد الـ QR Codes الآمنة
│   │   ├── studentEnrollmentService.js    # خدمات تسجيل الطلاب بالمواد تلقائياً
│   │   └── timetableService.js            # إدارة رفع وحفظ مسارات الجداول
│   │
│   ├── utils/                             # دوال مساعدة
│   │   ├── gradeConfigParser.js           # تحويل الـ P/M/D لدرجات رقمية وحساب المجموع
│   │   └── studentPromotion.js            # خوارزمية انتقال الطالب للسنة/الفصل التالي
│   │
│   └── middleware/                        # الحماية والتحقق
│       ├── auth.js                        # التحقق من الـ JWT وفحص الصلاحيات (Role)
│       └── validators.js                  # فحص البيانات المدخلة قبل وصولها للخادم
│
└── client/frontend/                       # ================= الواجهة الأمامية =================
    ├── package.json                       # اعتمادات ومكتبات React (Vite, GSAP)
    ├── vite.config.js                     # إعدادات بناء Vite وتوجيه الـ Proxy
    ├── Dockerfile                         # إعداد بناء الواجهة وتشغيلها عبر Nginx
    ├── nginx.conf                         # إعداد Nginx لتوجيه مسارات React بشكل صحيح
    │
    └── src/
        ├── App.jsx                        # الـ Router الرئيسي لجميع مسارات التطبيق
        ├── main.jsx                       # نقطة تركيب React في الـ DOM
        ├── index.css                      # ملف المتغيرات البصرية والتنسيقات الأساسية
        │
        ├── pages/                         # صفحات التطبيق (المرتبطة بالـ Routes)
        │   ├── Home/                      # الصفحة الرئيسية التعريفية للكلية
        │   ├── Login/                     # صفحة تسجيل الدخول لكافة المستخدمين
        │   ├── About/, Contact/, Services/# الصفحات التعريفية والتواصل مع 3D Animations
        │   ├── Dashboard/                 # موجه (Router) ينقل المستخدم حسب دوره (Role)
        │   ├── Admin/                     # مجلد كامل يحوي 25 شاشة لإدارة الكلية بالكامل
        │   ├── ProfessorDashboard/        # لوحة الأستاذ لرؤية مواده وطلابه
        │   ├── ProfessorGrades/           # شاشة إدخال الدرجات للأستاذ (P/M/D)
        │   ├── AccountantDashboard/       # لوحة تحكم المحاسب وإدارة الفواتير
        │   ├── StudentDashboard/          # لوحة تحكم الطالب (المختصرة)
        │   ├── StudentPortal/             # بوابة الطالب الشاملة لعرض الدرجات والفواتير
        │   ├── Student/                   # شاشة الطالب لتعديل بياناته الشخصية
        │   ├── StudentRegistration/       # صفحة التسجيل للطلاب عبر الروابط المخصصة
        │   ├── ProfessorRegistration/     # صفحة التسجيل للأساتذة عبر الروابط المخصصة
        │   └── AdminScheduleUpload/       # شاشة فرعية للأدمن لرفع الجداول بصيغة PDF
        │
        ├── components/                    # مكونات واجهة المستخدم القابلة لإعادة الاستخدام
        │   ├── ProtectedRoute.jsx         # حماية المسارات (فحص الـ Role والـ Token)
        │   ├── admin/                     # مكونات الإدارة (نوافذ التأكيد والترقية)
        │   ├── AdminLayout/               # إطار لوحة التحكم الجانبي (Sidebar)
        │   ├── navComponent/              # شريط التنقل العلوي (Navbar)
        │   ├── authComponent/             # مكونات الدخول المشتركة
        │   ├── BranchSelectionModal/      # نافذة لاختيار الفرع (Network / Software)
        │   ├── common/                    # المكونات العامة (Table, Modal, HeroSection)
        │   └── animations/                # مجلد يضم أكثر من 20 تأثير بصري متقدم:
        │       ├── ScrollTube/            # تأثير النفق السداسي أثناء التمرير (Three.js)
        │       ├── InfiniteMenu/          # دائرة التخصصات الدوارة
        │       ├── TypewriterEffect/      # تأثير الكتابة التلقائية
        │       └── PinScrubDebug/         # تأثيرات GSAP المرتبطة بالتمرير (Scroll)
        │
        ├── context/                       # إدارة الحالة المركزية
        │   ├── AuthContext.jsx            # حالة تسجيل الدخول، تخزين التوكين وبيانات المستخدم
        │   ├── NotificationContext.jsx    # نظام إدارة الإشعارات (Toasts) لجميع الصفحات
        │   └── MotionContext.jsx          # إعدادات التحكم في إيقاف/تشغيل الأنيميشن
        │
        ├── services/                      # التفاعل مع الـ Backend
        │   ├── apiService.js              # إعداد Axios لربط الـ Token تلقائياً ومعالجة الأخطاء
        │   └── adminService.js            # دوال الاتصال الخاصة بصلاحيات الإدارة
        │
        └── api/                           # دوال مخصصة للاتصال
            └── auth.js                    # فصل دوال الـ Login و الـ Registration
```

---

## 4. شرح تفصيلي لملفات الخادم (Server)

تم تصميم الـ Server بنمط يعزل المسؤوليات (Separation of Concerns):
1. **النماذج (Models):** تمثل جداول قاعدة البيانات. يتم تهيئتها وربطها معاً في `config/models.js` لمنع أخطاء التداخل (Circular Dependency).
2. **وحدات التحكم (Controllers):** جميع ملفات المجلد مسؤولة عن استلام الطلبات، تنفيذ الـ CRUD، وإرجاع استجابة JSON للواجهة.
3. **الخدمات المعقدة (Services):** نستخدم هذا المجلد للمنطق المعقد:
   - `studentPromotion.js`: يفحص نجاح الطالب في مواده لتحديد إمكانية الترقية أو النقل للصيفي أو الإعادة الكاملة للعام.
   - `gradeApprovalService.js`: يتولى تمرير الدرجات من مسودة الأستاذ وحتى اعتماد الأدمن.
4. **الوسطاء (Middleware):** 
   - `auth.js`: يحلل الـ JWT Token لضمان أنه صالح، ويتأكد أن الـ `token_version` مطابق للموجود في DB لمنع الجلسات القديمة أو المسروقة من العمل.
   - `validators.js`: يفحص محتوى الطلب (مثل صيغة الإيميل والأرقام) قبل إرهاق السيرفر.

---

## 5. شرح تفصيلي لملفات الواجهة (Client)

بُنيت الواجهة الأمامية بـ React، وتم تقسيمها بعناية:
1. **الصفحات (Pages):** تم تخصيص مجلدات مستقلة لكل شاشة. مثلاً مجلد `Admin` وحده يحتوي على 25 شاشة للتحكم الكامل (شاشات للطلاب، التخصصات، الرسوم، الجداول). مجلد `ProfessorGrades` يحتوي على المنطق الديناميكي لحساب مجموع P/M/D للأستاذ.
2. **المكونات (Components):** 
   - `ProtectedRoute`: مكون مركزي يلف مسارات التطبيق (في `App.jsx`) لمنع الدخول العشوائي لغير أصحاب الصلاحية.
   - `animations`: تم جمع كل التأثيرات الحركية المعقدة (GSAP, Three.js) في مجلد مستقل لعزل الكود الثقيل وجعل الصفحات نظيفة وقابلة للصيانة.
3. **إدارة الحالة (Context):** `AuthContext` يتحكم في حياة المستخدم. إذا انتهت صلاحية التوكين، أو قام المستخدم بتسجيل الخروج، يتم طرده لصفحة الدخول وتتحدث كل مكونات النظام فوراً.
4. **الخدمات (Services):** `apiService.js` هو الجندي المجهول؛ يلتقط جميع الـ Requests المتجهة للـ Backend، ويحشره بداخلها التوكين (`Authorization: Bearer`).

---

## 6. قاعدة البيانات والعلاقات

قاعدة البيانات مبنية بـ MySQL وتعتمد على العلاقات القوية لضمان تناسق البيانات:
- **المستخدمين (Users):** جدول مركزي، يرتبط بـ `Students` أو `Professors` بعلاقة `One-to-One`.
- **الهيكل الأكاديمي:** التخصص (`Specialty`) يملك عدة سنوات (`AcademicYears`)، وكل سنة تملك فصول (`Semesters`).
- **المواد والأساتذة:** علاقة `Many-to-Many` بين الـ `Course` والـ `Professor` عبر جدول `ProfessorCourses`.
- **تسجيل الطلاب:** علاقة `Many-to-Many` بين الـ `Student` والـ `Course` عبر `StudentEnrollments`.
- **الدرجات (Grades):** ترتبط برقم الطالب، رقم المادة، ورقم الفصل الدراسي.
- **الماليات:** الفواتير (`FeeInvoices`) والمدفوعات (`Payments`) ترتبط مباشرة بالطالب.

---

## 7. الأدوار والصلاحيات

النظام يعتمد على صلاحيات صارمة بناءً على نوع الحساب (`Role`):

1. **مدير النظام (Admin):** 
   - التحكم الكامل في الكلية وإصدار روابط التسجيل للطلاب والأساتذة.
   - **اعتماد ونشر الدرجات** وتفعيل ترقية الطلاب للعام التالي.
   - رفع جداول الـ PDF الخاصة بالطلاب.
   
2. **المحاسب (Accountant):**
   - تحديد الرسوم (رسوم تخصص، رسوم إعادة، رسوم صيفي).
   - إصدار الفواتير، إضافة المدفوعات.
   - *النظام يحجب الدرجات تلقائياً عن الطلاب الذين لديهم فواتير غير مسددة.*

3. **الأستاذ الجامعي (Professor):**
   - عرض مواده، وإدخال الدرجات كأحرف (`P/M/D`) أو درجة امتحان نهائي، وإرسالها للإدارة. لا يحق له التعديل بعد الاعتماد.

4. **الطالب (Student):**
   - عرض الملف، الـ QR Code الخاص به، الجداول المرفوعة له.
   - عرض الفواتير ودفعاته المادية.
   - عرض درجاته المعتمدة والمنشورة.

---

## 8. منطق الأعمال الأساسي (Business Logic)

**أ. التقييم والدرجات (Grading Workflow)**
- يتم التقييم وفق المعايير البريطانية: `Pass (P)`, `Merit (M)`, `Distinction (D)`.
- يقوم `gradeConfigParser.js` بتحويل هذه الرموز لدرجات رقمية (مثلاً P=30, M=21, D=15) وحساب المجموع الكلي مع درجة النهائي.
- حالات الدرجة: `Draft` (مسودة) ← `Pending` (بانتظار الإدارة) ← `Approved` (مُعتمدة) ← `Published` (ظاهرة للطالب).

**ب. ترقية الطلاب (Promotion Algorithm)**
- للنجاح: يُشترط الحصول على 60% في المجموع، و 50% كحد أدنى من الدرجة النهائية.
- لسنوات 1 و 3: الرسوب في (1 إلى 3) مواد يدخل الطالب (الصيفي). الرسوب في (4 فأكثر) يُعيد السنة بالكامل.
- لسنوات التخرج 2 و 4: الرسوب في أي عدد من المواد يُدخل الطالب إلى الصيفي لتسهيل عملية تخرجه.

**ج. تسجيل الطلاب الأوتوماتيكي (Registration Workflow)**
- يُصدر الأدمن رابط تسجيل ذي صلاحية مؤقتة. يملأ الطالب بياناته ويُرسل الطلب (Request).
- عند موافقة الأدمن، يتم آلياً إنشاء حساب `User` له، و `Student Record`، و `QR Code` فريد به.

---

## 9. دليل الـ API (أهم المسارات)

- **Auth:** `/api/auth/login`, `/api/auth/student-login`, `/api/auth/me`
- **Admin:** `/api/admin/promote-semester`, `/api/grades/approve`, `/api/admin/publish-results`
- **Professor:** `/api/grades/professor/course/:courseId` (لحفظ الدرجات)
- **Accountant:** `/api/accountant/invoices`, `/api/accountant/payments`
- **Student:** `/api/student/portal-data` (لجلب بيانات الطالب، فواتيره، وجداوله بطلب واحد)

---

## 10. التشغيل والتثبيت

النظام مجهز للعمل عبر حاويات **Docker**، وهي الطريقة الأسهل للتشغيل.

### خطوات التشغيل
افتح الـ Terminal في المسار الرئيسي للمشروع ونفذ الأمر:
```bash
docker-compose up --build -d
```
*هذا الأمر سيقوم آلياً بتشغيل السيرفر، وتجهيز الواجهة الأمامية عبر Nginx، وحقن البيانات الافتراضية للكلية.*

### الوصول للنظام:
- **الواجهة الأمامية (الموقع):** `http://localhost:3000`
- **الواجهة الخلفية (السيرفر):** `http://localhost:5000`

### حسابات الدخول الافتراضية:
- **مدير النظام:** `admin` | `admin123`
- **المحاسب:** `accountant` | `accountant123`
- **الأستاذ:** `professor` | `professor123`
- **طالب للتجربة:** `student1` | `student123`


---

## 🚀 كيفية تشغيل المشروع بعد تحميله من GitHub

### المتطلبات الأساسية

قبل البدء، تأكد من تثبيت هذه الأدوات على جهازك:

| الأداة | الإصدار المطلوب | رابط التحميل |
|--------|----------------|--------------|
| Node.js | v14 أو أحدث | https://nodejs.org |
| MySQL | v8.0 أو أحدث | https://dev.mysql.com/downloads |
| Git | أي إصدار | https://git-scm.com |
| npm | يأتي مع Node.js | — |

> **بديل أسهل:** إذا كان Docker مثبتاً لديك، يمكنك تخطي كل الخطوات والاكتفاء بأمر واحد (انظر قسم Docker أدناه).

---

### الطريقة الأولى — التشغيل اليدوي (بدون Docker)

#### الخطوة 1: تحميل المشروع

```bash
git clone https://github.com/<your-username>/NCT_System.git
cd NCT_System
```

#### الخطوة 2: إعداد قاعدة البيانات

افتح MySQL وأنشئ قاعدة بيانات جديدة:

```sql
CREATE DATABASE nctu_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### الخطوة 3: إعداد متغيرات البيئة للـ Server

انتقل لمجلد `server` وأنشئ ملف `.env`:

```bash
cd server
```

أنشئ ملف `.env` بالمحتوى التالي (عدّل القيم حسب إعداداتك):

```env
PORT=5000
NODE_ENV=development

# قاعدة البيانات
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nctu_erp
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_DIALECT=mysql

# JWT
JWT_SECRET=nctu_erp_super_secret_key_change_this_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=nctu_erp_refresh_secret_key
JWT_REFRESH_EXPIRE=30d

# عنوان الـ Frontend
CLIENT_URL=http://localhost:5173
```

#### الخطوة 4: تثبيت وتشغيل الـ Backend

```bash
# داخل مجلد server
npm install

# تشغيل الخادم (سيقوم تلقائياً بإنشاء الجداول وحقن البيانات الأولية)
npm start
```

عند النجاح ستظهر هذه الرسائل في الـ Terminal:

```
✅ Model associations defined successfully.
✅ Database connection established successfully.
✅ Database tables already exist.
✅ Database seeded successfully!
🚀 Server is running on port 5000
```

#### الخطوة 5: تثبيت وتشغيل الـ Frontend

افتح **Terminal جديد** وانتقل لمجلد الـ Frontend:

```bash
cd client/frontend
npm install
npm run dev
```

سيعمل الـ Frontend على: **http://localhost:5173**

---

### الطريقة الثانية — التشغيل بـ Docker (الأسهل والأسرع)

#### المتطلب الوحيد: Docker Desktop

تأكد من تثبيت [Docker Desktop](https://www.docker.com/products/docker-desktop) وتشغيله.

#### الخطوات:

```bash
# 1. تحميل المشروع
git clone https://github.com/<your-username>/NCT_System.git
cd NCT_System

# 2. تشغيل كل شيء بأمر واحد
docker-compose up --build -d
```

Docker سيقوم تلقائياً بـ:
- تشغيل MySQL وإنشاء قاعدة البيانات
- بناء وتشغيل الـ Backend على port 5000
- بناء الـ Frontend وتقديمه عبر Nginx على port 3000

#### الوصول للنظام بعد Docker:

| الخدمة | الرابط |
|--------|--------|
| الموقع (Frontend) | http://localhost:3000 |
| الـ API (Backend) | http://localhost:5000 |
| Health Check | http://localhost:5000/api/health |

#### إيقاف Docker:

```bash
docker-compose down
```

---

### حسابات الدخول الافتراضية

بعد التشغيل بأي طريقة، ستجد هذه الحسابات جاهزة:

| الدور | اسم المستخدم | كلمة المرور | الصلاحيات |
|-------|-------------|-------------|-----------|
| مدير النظام | `admin` | `admin123` | تحكم كامل في الكلية |
| محاسب | `accountant` | `accountant123` | الفواتير والمدفوعات |
| أستاذ (1) | `professor1` | `prof123` | إدخال الدرجات |
| أستاذ (2) | `professor` | `professor123` | إدخال الدرجات |
| طالب | `student1` | `student123` | عرض الدرجات والجداول |

---

### اختبار الـ API بـ Postman

المشروع يأتي مع ملف `.postman.json` يحتوي على 25+ طلب جاهز:

1. افتح **Postman**
2. اضغط **Import** واختر ملف `.postman.json` من جذر المشروع
3. أنشئ Environment جديد باسم `NCTU Local`
4. أضف متغير `base_url` بالقيمة `http://localhost:5000`
5. شغّل الـ Collection

---

### حل المشكلات الشائعة

| المشكلة | الحل |
|---------|------|
| `Error: connect ECONNREFUSED 127.0.0.1:3306` | MySQL غير مشغّل — شغّله أولاً |
| `Access denied for user 'root'@'localhost'` | كلمة مرور MySQL في `.env` غير صحيحة |
| `Port 5000 already in use` | غيّر `PORT` في `.env` أو أوقف البرنامج الذي يستخدم المنفذ |
| `Module not found` | نسيت تشغيل `npm install` في مجلد `server` أو `client/frontend` |
| الصفحة تظهر فارغة | تأكد أن الـ Backend يعمل على port 5000 وأن `vite.config.js` يوجّه الـ proxy بشكل صحيح |
