# NCT System — دليل المشروع الشامل

## فكرة المشروع

**NCT System** هو نظام ERP أكاديمي متكامل (Enterprise Resource Planning) مصمم لإدارة الكلية التقنية الجديدة (New Cairo Technology College). يغطي النظام دورة حياة الطالب الكاملة من التسجيل حتى التخرج، ويشمل إدارة الدكاترة، الدرجات، المصاريف، والجداول الدراسية.

---

## هيكل المشروع

```
NCT_System/
├── client/                  # الواجهة الأمامية (React + Vite)
├── server/                  # الخادم الخلفي (Node.js + Express + Sequelize)
├── database/                # ملفات قاعدة البيانات
├── docs/                    # التوثيق (هذا المجلد)
├── docker-compose.yml       # إعداد Docker
├── package.json             # إعداد المشروع الجذر
├── start.bat / start.sh     # سكريبتات تشغيل سريع
└── README.md                # نقطة البداية
```

---

## هيكل الـ Client (React)

```
client/frontend/src/
├── App.jsx                  # نقطة دخول التطبيق + React Router
├── main.jsx                 # تهيئة React + ChakraProvider
├── index.css                # المتغيرات العامة (CSS Variables)
│
├── pages/                   # صفحات التطبيق
│   ├── Home/                # الصفحة الرئيسية
│   ├── Login/               # صفحة تسجيل الدخول
│   ├── Admin/               # لوحة تحكم الأدمن
│   ├── AccountantDashboard/ # لوحة المحاسب
│   ├── ProfessorDashboard/  # لوحة الدكتور
│   ├── ProfessorGrades/     # إدخال الدرجات (الدكتور)
│   ├── StudentDashboard/    # لوحة الطالب
│   ├── StudentPortal/       # بوابة الطالب
│   ├── StudentRegistration/ # تسجيل طالب جديد
│   ├── ProfessorRegistration/ # تسجيل دكتور جديد
│   ├── Dashboard/           # لوحة عامة
│   └── About/ Contact/      # صفحات ثانوية
│
├── components/              # مكونات مشتركة
│   ├── common/              # Table, Modal, Button...
│   ├── navComponent/        # Navbar
│   └── animations/          # مكونات الأنيميشن
│
├── context/                 # React Context
│   └── AuthContext.jsx      # حالة المصادقة العامة
│
├── services/                # طبقة API
│   └── apiService.js        # Axios instance مع interceptors
│
├── hooks/                   # Custom React Hooks
├── utils/                   # دوال مساعدة
└── styles/                  # ملفات CSS مشتركة
```

---

## هيكل الـ Server (Node.js)

```
server/
├── server.js                # نقطة دخول الخادم
├── .env                     # متغيرات البيئة (DB, JWT, PORT)
├── package.json             # dependencies الخادم
│
├── config/
│   ├── database.js          # اتصال Sequelize بـ MySQL
│   └── models.js            # تجميع كل الـ models + تعريف العلاقات
│
├── models/                  # نماذج قاعدة البيانات (Sequelize)
│   ├── User.js              # المستخدمون (admin/professor/student/accountant)
│   ├── Student.js           # بيانات الطالب الأكاديمية
│   ├── Professor.js         # بيانات الدكتور
│   ├── Specialty.js         # التخصصات (MCT, AUT, ICT...)
│   ├── AcademicYear.js      # السنوات الدراسية لكل تخصص
│   ├── Semester.js          # الفصول الدراسية
│   ├── Course.js            # المواد الدراسية
│   ├── Grade.js             # درجات الطلاب
│   ├── CourseGradeConfig.js # إعدادات الدرجات لكل مادة
│   ├── GradeSetting.js      # إعدادات الدرجات العامة
│   ├── StudentEnrollment.js # تسجيل الطلاب في المواد
│   ├── ProfessorCourse.js   # تعيين الدكاترة للمواد
│   ├── FeeInvoice.js        # فواتير المصاريف
│   ├── Payment.js           # سجلات الدفع
│   ├── SpecialtyFee.js      # رسوم كل تخصص/سنة
│   ├── RegistrationLink.js  # روابط تسجيل الطلاب
│   ├── RegistrationRequest.js # طلبات تسجيل الطلاب
│   ├── ProfessorRegistrationLink.js  # روابط تسجيل الدكاترة
│   ├── ProfessorRegistrationRequest.js # طلبات تسجيل الدكاترة
│   ├── Timetable.js         # الجداول الدراسية
│   ├── StudentQRCode.js     # QR Codes للطلاب
│   └── ActivityLog.js       # سجل النشاطات
│
├── controllers/             # منطق الأعمال
│   ├── adminController.js   # عمليات الأدمن (طلاب، ترقيات، نشر نتائج)
│   ├── extendedAdminController.js # دكاترة، مواد، درجات، QR
│   ├── accountantController.js    # فواتير، مدفوعات، رسوم
│   ├── studentController.js       # إدارة الطلاب CRUD
│   └── ...
│
├── routes/                  # تعريف الـ API endpoints
│   ├── adminRoutes.js       # /api/admin/*
│   ├── extendedAdminRoutes.js # /api/admin/professors, /courses, /grades
│   ├── accountantRoutes.js  # /api/accountant/*
│   ├── authRoutes.js        # /api/auth/*
│   ├── gradeRoutes.js       # /api/grades/* (professor)
│   ├── timetableRoutes.js   # /api/timetables/*
│   └── courseGradeConfigRoutes.js # /api/admin/course-grade-config/*
│
├── middleware/
│   ├── auth.js              # JWT authentication + role authorization
│   └── validators.js        # Validation middleware
│
├── migrations/              # Sequelize migrations
├── services/                # خدمات مساعدة
└── utils/                   # دوال مساعدة
```

---

## الأدوار في النظام

| الدور | الصلاحيات |
|-------|-----------|
| `admin` | إدارة كاملة: طلاب، دكاترة، مواد، سنوات، ترقيات، نشر نتائج |
| `professor` | إدخال درجات الطلاب في مواده المعينة |
| `accountant` | إدارة الفواتير والمدفوعات والرسوم الدراسية |
| `student` | عرض درجاته، جدوله، فواتيره |
| `registrar` | (محجوز للمستقبل) |

---

## API Endpoints الرئيسية

### Auth
| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/api/auth/login` | تسجيل الدخول |
| POST | `/api/auth/register` | تسجيل طالب جديد |
| GET | `/api/auth/me` | بيانات المستخدم الحالي |

### Admin
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET/POST/PUT/DELETE | `/api/admin/students` | إدارة الطلاب |
| GET/POST/PUT/DELETE | `/api/admin/professors` | إدارة الدكاترة |
| GET/POST/PUT/DELETE | `/api/admin/courses` | إدارة المواد |
| GET/POST/PUT | `/api/admin/specialties` | إدارة التخصصات |
| GET/POST/PUT | `/api/admin/academic-years` | السنوات الدراسية |
| GET/POST/PUT | `/api/admin/semesters` | الفصول الدراسية |
| POST | `/api/admin/promote-semester` | ترقية جماعية للترم |
| POST | `/api/admin/promote-year` | ترقية جماعية للسنة |
| POST | `/api/admin/promote-summer-passed` | إنهاء الصيفي |
| POST | `/api/admin/publish-results` | نشر النتائج |
| GET/PUT | `/api/admin/grade-settings` | إعدادات الدرجات |
| GET/PUT/POST/DELETE | `/api/admin/grades/:id/approve` | اعتماد الدرجات |

### Accountant
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/accountant/students` | قائمة الطلاب مع حالة الدفع |
| POST | `/api/accountant/invoices` | إنشاء فاتورة |
| POST | `/api/accountant/invoices/auto-generate` | إنشاء فواتير تلقائي |
| POST | `/api/accountant/invoices/summer` | فواتير الصيفي |
| POST | `/api/accountant/invoices/course-fail` | فواتير رسوب مادة |
| POST | `/api/accountant/invoices/discount-by-student` | تخفيض منحة |
| POST | `/api/accountant/payments/by-student` | تسجيل دفعة |
| GET/PUT | `/api/accountant/specialty-fees` | رسوم التخصصات |

### Professor (Grades)
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/grades/professor/courses` | مواد الدكتور |
| GET | `/api/grades/professor/courses/:id/students` | طلاب المادة |
| POST/PUT | `/api/grades/professor/grades` | إدخال/تعديل درجات |
| POST | `/api/grades/professor/grades/submit` | رفع الدرجات للاعتماد |

---

## تدفق العمل الرئيسي

```
1. الأدمن ينشئ: تخصص → سنة دراسية → فصل → مواد
2. الأدمن ينشئ رابط تسجيل → الطالب يسجل → الأدمن يقبل
3. الأدمن يعين دكتور لمادة
4. الدكتور يدخل درجات → الأدمن يعتمد → الأدمن ينشر
5. المحاسب ينشئ فواتير → الطالب يدفع → المحاسب يسجل الدفع
6. الأدمن يرقي الطلاب (ترم/سنة) بناءً على الدرجات
```

---

## التقنيات المستخدمة

### Frontend
- **React 18** + **Vite** — بناء الواجهة
- **React Router v6** — التنقل بين الصفحات
- **Axios** — HTTP requests
- **React Hot Toast** — إشعارات
- **CSS Modules** — تنسيق مكوناتي

### Backend
- **Node.js** + **Express** — الخادم
- **Sequelize ORM** — التعامل مع قاعدة البيانات
- **MySQL** — قاعدة البيانات
- **JWT** — المصادقة
- **bcryptjs** — تشفير كلمات المرور
- **Multer** — رفع الملفات

### Infrastructure
- **Docker** + **docker-compose** — containerization
