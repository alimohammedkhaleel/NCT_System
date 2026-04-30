# وثيقة التصميم - إكمال نظام NCTU ERP

## Overview

هذه الوثيقة تصف التصميم التقني لإكمال نظام NCTU ERP. الهدف هو ربط الـ Frontend بالـ Backend الحقيقي، إضافة الصفحات والـ API endpoints الناقصة، وتوحيد نظام الألوان عبر جميع الصفحات.

المشروع يعتمد على:
- **Backend**: Express.js + MySQL + Sequelize ORM
- **Frontend**: React 18 + Vite + CSS Modules + Framer Motion + GSAP
- **Auth**: JWT مع أدوار (admin, professor, accountant, registrar, student)

---

## Architecture

### نظرة عامة على البنية

```
Client (React 18 + Vite)
  │
  ├── AuthContext (JWT + axios interceptors)
  │     └── JWT expiry → redirect to /login
  │
  ├── Pages
  │     ├── /admin/*          → AdminLayout (role: admin)
  │     ├── /accountant       → AccountantDashboard (role: accountant)
  │     ├── /grades           → ProfessorGrades (role: professor)
  │     └── /portal           → StudentPortal (role: student)
  │
  └── API Layer (axios)
        └── baseURL: /api

Server (Express.js)
  │
  ├── /api/auth/*             → authController
  ├── /api/admin/*            → adminController + studentController (NEW)
  ├── /api/grades/*           → gradeController + professorController (NEW)
  └── /api/accountant/*       → accountantController (NEW)
```

### تدفق البيانات - Student Portal

```
StudentPortal mounts
  → useEffect → GET /api/grades/student/dashboard
  → Response: { student_info, summary: { enrolled_courses, approved_grades, total_due, gpa } }
  → Render profile + GPA badge

Student clicks "درجاتي"
  → GET /api/grades/student/grades (status=approved only)
  → Group by academic_year → semester
  → Render grades table with GPA per semester

Student clicks "فواتيري"
  → GET /api/grades/student/invoices
  → Render invoices with paid/due summary
```

### تدفق البيانات - Professor Grades

```
ProfessorGrades mounts
  → GET /api/admin/specialties  → populate specialty dropdown

Professor selects specialty
  → GET /api/grades/professor/courses?specialty_id=X
  → Render course cards

Professor selects course
  → GET /api/grades/professor?course_id=X
  → Render students table with existing grades

Professor saves grade
  → POST /api/grades { student_id, course_id, ... }
  → Update local state on success

Professor submits for review
  → For each grade where status='draft':
      POST /api/grades/:id/submit-for-approval
  → Update status badges in UI
```

### تدفق البيانات - Accountant Dashboard

```
AccountantDashboard mounts
  → GET /api/accountant/summary
  → Render: total_invoiced, total_paid, total_due, overdue_count

Accountant searches student
  → GET /api/accountant/students/:id/invoices
  → Render invoices list (overdue highlighted in red)

Accountant registers payment
  → POST /api/accountant/payments { student_id, invoice_id, amount, method, transaction_id }
  → Refresh invoice list

Accountant creates invoice
  → POST /api/accountant/invoices { student_id, academic_year_id, semester_id, total_amount, due_date }
  → Append to invoice list
```

---

## Components and Interfaces

### ملفات جديدة - Backend

| الملف | الوصف |
|-------|-------|
| `server/controllers/studentController.js` | CRUD الطلاب + ترقية |
| `server/controllers/accountantController.js` | الفواتير والمدفوعات |
| `server/routes/studentRoutes.js` | `/api/admin/students/*` |
| `server/routes/accountantRoutes.js` | `/api/accountant/*` |

### ملفات جديدة - Frontend

| الملف | الوصف |
|-------|-------|
| `client/frontend/src/pages/Admin/StudentsManagement.jsx` | صفحة إدارة الطلاب |
| `client/frontend/src/pages/Admin/StudentsManagement.module.css` | تنسيق الصفحة |
| `client/frontend/src/pages/AccountantDashboard.jsx` | لوحة تحكم المحاسب |
| `client/frontend/src/pages/AccountantDashboard.module.css` | تنسيق اللوحة |

### ملفات معدّلة - Backend

| الملف | التعديل |
|-------|---------|
| `server/controllers/gradeController.js` | إضافة `getProfessorCourses` + حقل `gpa` في dashboard |
| `server/routes/gradeRoutes.js` | إضافة `GET /professor/courses` |
| `server/routes/adminRoutes.js` | تضمين studentRoutes |
| `server/server.js` | تسجيل accountantRoutes |
| `server/middleware/auth.js` | إضافة دور `accountant` في authorizeRoles |

### ملفات معدّلة - Frontend

| الملف | التعديل |
|-------|---------|
| `client/frontend/src/App.jsx` | إضافة مسارات `/admin/students` و `/accountant` |
| `client/frontend/src/pages/StudentPortal.jsx` | ربط بالـ API الحقيقي + GPA |
| `client/frontend/src/pages/ProfessorGrades.jsx` | ربط بالـ API الحقيقي |
| `client/frontend/src/pages/Admin/AdminDashboard.jsx` | إضافة بطاقة Students |
| `client/frontend/src/context/AuthContext.jsx` | إضافة axios interceptor لانتهاء JWT |
| `client/frontend/src/index.css` | تأكيد متغيرات الألوان (موجودة بالفعل) |
| جميع ملفات CSS للصفحات | استبدال الألوان المضمّنة بالمتغيرات |

---

## Data Models

### Student (موجود - لا تعديل)

```
students
  id, user_id, student_code, national_id
  specialty_id, current_year (1-4)
  academic_status: ENUM('active','graduated','suspended','transferred','dropped')
  enrollment_date, graduation_date
  qr_secret, qr_data, qr_image
  total_paid, total_due
```

### FeeInvoice (موجود - لا تعديل)

```
fee_invoices
  id, invoice_number, student_id
  academic_year_id, semester_id
  total_amount, paid_amount
  status: ENUM('pending','partial','paid','overdue')
  due_date, issued_by, notes
```

### Payment (موجود - لا تعديل)

```
payments
  id, invoice_id, student_id
  amount, payment_method, transaction_id
  payment_date, received_by
```

### نموذج ترقية الطالب (منطق عمل)

```
promotion_type: 'semester' | 'year' | 'graduate'

semester promotion:
  current_semester: 1 → 2
  (يُخزَّن في StudentEnrollment أو حقل منفصل)

year promotion:
  current_year: N → N+1 (max 4)
  academic_status: يبقى 'active'

graduate:
  current_year: 4 → يبقى 4
  academic_status: 'active' → 'graduated'
  graduation_date: NOW()

رفض الترقية إذا:
  academic_status IN ('suspended', 'dropped')
```

### حساب GPA

```
GPA = Σ(grade_point × credit_hours) / Σ(credit_hours)
      لجميع الدرجات حيث status = 'approved'

التصنيف:
  3.70 - 4.00 → Distinction (امتياز)
  3.00 - 3.69 → Merit (جيد جداً)
  2.00 - 2.99 → Pass (جيد)
  0.00 - 1.99 → Fail (راسب)

إذا لم توجد مواد معتمدة → GPA = 0.0
```

---

## API Design

### Student Management (جديد)

```
GET /api/admin/students
  Query: search, specialty_id, current_year, academic_status
  Auth: admin
  Response: { success, data: [{ id, student_code, national_id, full_name,
              specialty, current_year, academic_status }], count }

POST /api/admin/students
  Body: { full_name, email, password, national_id, specialty_id, current_year }
  Auth: admin
  Action: transaction → create User(role='student') + Student
  Response: { success, data: { user, student }, message }

PUT /api/admin/students/:id
  Body: { full_name?, email?, national_id?, specialty_id?, current_year?, academic_status? }
  Auth: admin
  Response: { success, data: student, message }

POST /api/admin/students/:id/promote
  Body: { promotion_type: 'semester' | 'year' | 'graduate' }
  Auth: admin
  Validation: reject if academic_status IN ('suspended','dropped')
  Response: { success, data: { new_year, new_status }, message }
```

### Professor Courses (جديد)

```
GET /api/grades/professor/courses
  Query: specialty_id? (optional filter)
  Auth: professor
  Action: find ProfessorCourse where professor_id = req.professor.id
          join Course, AcademicYear, Specialty
  Response: { success, data: [{ course_id, course_code, course_name,
              arabic_name, credit_hours, specialty, academic_year, semester }] }
```

### Student Dashboard (تعديل - إضافة GPA)

```
GET /api/grades/student/dashboard
  Auth: student
  Response: { success, data: {
    student_info: { full_name, email, student_code, current_year,
                    specialty_name, academic_status },
    summary: { enrolled_courses, approved_grades, total_due, gpa }
  }}

  GPA calculation:
    grades = Grade.findAll({ student_id, status: 'approved' }, include: Course)
    gpa = grades.length > 0
      ? Σ(g.grade_point × g.Course.credit_hours) / Σ(g.Course.credit_hours)
      : 0.0
    gpa = parseFloat(gpa.toFixed(2))
```

### QR Code Verification (جديد)

```
POST /api/auth/verify-qr
  Body: { qr_secret }
  Auth: public (or any authenticated user)
  Action: find StudentQRCode by qr_secret, verify is_active,
          increment scan_count, update scanned_at
  Response: { success, data: { student_code, full_name, is_active } }
```

### Accountant Routes (جديد)

```
GET /api/accountant/summary
  Auth: accountant
  Response: { success, data: { total_invoiced, total_paid, total_due, overdue_count } }

GET /api/accountant/students/:id/invoices
  Auth: accountant
  Response: { success, data: { invoices: [...], summary: { total, paid, due } } }

POST /api/accountant/invoices
  Body: { student_id, academic_year_id, semester_id, total_amount, due_date, notes? }
  Auth: accountant
  Action: generate invoice_number (INV-YYYY-NNNN), create FeeInvoice
  Response: { success, data: invoice, message }

POST /api/accountant/payments
  Body: { invoice_id, amount, payment_method, transaction_id? }
  Auth: accountant
  Action: create Payment, update FeeInvoice.paid_amount + status
  Response: { success, data: payment, message }
```

---

## CSS Variable System Design

### المتغيرات الموجودة في `index.css` (لا تعديل مطلوب)

```css
:root {
  --primary-color: #0A2472;    /* بنفسجي داكن */
  --primary-dark: #071a5f;
  --primary-light: #1E3A8A;
  --secondary-color: #D4AF37;  /* ذهبي */
  --secondary-dark: #b8942c;
  /* ... باقي المتغيرات موجودة */
}
```

### قواعد التطبيق

كل ملف CSS يجب أن يتبع هذه القواعد:

```css
/* ❌ ممنوع */
background: #0A2472;
color: #D4AF37;
border: 2px solid #3498db;

/* ✅ صحيح */
background: var(--primary-color);
color: var(--secondary-color);
border: 2px solid var(--info-color);
```

### نمط hover للأزرار الرئيسية

```css
.primary-btn {
  background: var(--primary-color);
  color: var(--white);
  transition: all var(--transition-normal);
}

.primary-btn:hover {
  background: var(--secondary-color);
  color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

### الصفحات التي تحتاج مراجعة CSS

- `AdminDashboard.jsx` - ألوان البطاقات مضمّنة مباشرة في JSX style props → تحويل لـ CSS module
- `ProfessorGrades.css` - مراجعة وجود ألوان مضمّنة
- `StudentPortal.css` - مراجعة وجود ألوان مضمّنة
- `CoursesPage.module.css` - مراجعة التوافق مع المتغيرات

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: GPA Formula Correctness

*For any* non-empty list of approved grades, each with a `grade_point` and `credit_hours`, the computed GPA SHALL equal `Σ(grade_point × credit_hours) / Σ(credit_hours)` rounded to 2 decimal places, and the classification SHALL match the defined thresholds (≥3.7=Distinction, ≥3.0=Merit, ≥2.0=Pass, <2.0=Fail).

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 2: Student Search Filter Correctness

*For any* list of students and any search string, every student returned by the filter function SHALL contain the search string in at least one of: `student_code`, `national_id`, or `full_name` (case-insensitive), and no student that matches the criteria SHALL be excluded from the results.

**Validates: Requirements 2.3, 2.7, 9.1**

### Property 3: Student Promotion State Machine

*For any* student with `academic_status = 'active'`, applying a valid `promotion_type` SHALL produce the correct resulting state: `semester` increments the semester counter, `year` increments `current_year` (max 4), and `graduate` sets `academic_status = 'graduated'`. For any student with `academic_status IN ('suspended', 'dropped')`, any promotion attempt SHALL be rejected with an error response.

**Validates: Requirements 3.7, 3.8**

### Property 4: Professor Course Isolation

*For any* two professors A and B with different course assignments, `GET /api/grades/professor/courses` for professor A SHALL return only courses assigned to professor A and SHALL NOT include any course exclusively assigned to professor B.

**Validates: Requirements 4.7, 9.5**

### Property 5: Accountant Role Authorization

*For any* API request to `/api/accountant/*` made with a JWT token whose role is NOT `accountant`, the system SHALL return HTTP 403. For any request with a valid `accountant` role token, the system SHALL return HTTP 200 (assuming valid input).

**Validates: Requirements 8.8, 9.6, 9.7, 9.8**

### Property 6: Student Creation Atomicity

*For any* valid student creation payload, if the operation succeeds, both a `User` record (role='student') and a linked `Student` record SHALL exist in the database with matching `user_id`. If any part of the creation fails, neither record SHALL be persisted (transaction rollback).

**Validates: Requirements 2.8, 9.2**

### Property 7: JWT Expiry Redirect

*For any* API response with HTTP 401 (unauthorized/expired token), the axios interceptor SHALL clear the stored token from localStorage and redirect the user to `/login`, regardless of which endpoint triggered the 401.

**Validates: Requirements 10.4**

### Property 8: Approved Grades Only in Student View

*For any* student with a mix of grades in different statuses (`draft`, `pending_admin_approval`, `approved`), the `GET /api/grades/student/grades` endpoint SHALL return only grades where `status = 'approved'`, and the GPA calculation SHALL use only those approved grades.

**Validates: Requirements 5.3, 5.4, 6.1**

---

## Error Handling

### Backend Error Patterns

جميع الـ endpoints تتبع هذا النمط الموحّد:

```javascript
// Success
res.json({ success: true, data: result, message: 'Operation successful' });

// Validation error
res.status(400).json({ success: false, message: 'Descriptive error message' });

// Auth error
res.status(403).json({ success: false, message: 'Insufficient permissions' });

// Not found
res.status(404).json({ success: false, message: 'Resource not found' });

// Server error
res.status(500).json({ success: false, message: 'Server error' });
```

### Frontend Error Handling

**axios interceptor في `AuthContext.jsx`:**

```javascript
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      // navigate to /login with message
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);
```

**نمط استخدام في المكونات:**

```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    const res = await axios.get('/endpoint');
    setData(res.data.data);
  } catch (err) {
    setError(err.response?.data?.message || 'حدث خطأ، يرجى المحاولة مجدداً');
    toast.error(error);
  } finally {
    setLoading(false);
  }
};
```

**حالات الواجهة:**

| الحالة | المكوّن |
|--------|---------|
| تحميل | `<LoadingSpinner />` في المنطقة المعنية |
| خطأ | رسالة خطأ + زر "إعادة المحاولة" |
| فارغ | رسالة "لا توجد بيانات" |
| نجاح | `toast.success(message)` يختفي بعد 3 ثوانٍ |

### Student Promotion Validation

```javascript
// في studentController.js
const promoteStudent = async (req, res) => {
  const { promotion_type } = req.body;
  const student = await Student.findByPk(req.params.id);

  // رفض الترقية للطلاب الموقوفين أو المنسحبين
  if (['suspended', 'dropped'].includes(student.academic_status)) {
    return res.status(400).json({
      success: false,
      message: 'لا يمكن ترقية طالب موقوف أو منسحب'
    });
  }

  // رفض ترقية السنة إذا كان في السنة الرابعة (يجب التخريج بدلاً من ذلك)
  if (promotion_type === 'year' && student.current_year >= 4) {
    return res.status(400).json({
      success: false,
      message: 'الطالب في السنة النهائية، استخدم خيار التخريج'
    });
  }
  // ...
};
```

---

## Testing Strategy

### نهج الاختبار المزدوج

يُستخدم نوعان من الاختبارات بشكل تكاملي:

1. **Unit/Example Tests**: للسلوكيات المحددة والحالات الحدية
2. **Property-Based Tests**: للخصائص العامة التي يجب أن تصمد عبر جميع المدخلات

### مكتبة الاختبار

- **Backend (Node.js)**: `fast-check` للـ PBT + `jest` للـ unit tests
- **Frontend (React)**: `fast-check` + `@testing-library/react` + `vitest`

### Property-Based Tests (الأولوية العالية)

كل اختبار يُشغَّل بحد أدنى **100 iteration**.

```javascript
// Property 1: GPA Formula
// Feature: nctu-erp-completion, Property 1: GPA formula correctness
test('GPA formula holds for any set of approved grades', () => {
  fc.assert(fc.property(
    fc.array(fc.record({
      grade_point: fc.float({ min: 0, max: 4 }),
      credit_hours: fc.integer({ min: 1, max: 6 })
    }), { minLength: 1 }),
    (grades) => {
      const gpa = calculateGPA(grades);
      const expected = grades.reduce((sum, g) => sum + g.grade_point * g.credit_hours, 0)
                     / grades.reduce((sum, g) => sum + g.credit_hours, 0);
      expect(gpa).toBeCloseTo(parseFloat(expected.toFixed(2)), 2);
    }
  ), { numRuns: 100 });
});

// Property 2: Student Search Filter
// Feature: nctu-erp-completion, Property 2: student search filter correctness
test('search filter returns only matching students', () => {
  fc.assert(fc.property(
    fc.array(fc.record({
      student_code: fc.string(),
      national_id: fc.string(),
      full_name: fc.string()
    })),
    fc.string({ minLength: 1 }),
    (students, query) => {
      const results = filterStudents(students, query);
      const q = query.toLowerCase();
      results.forEach(s => {
        const matches = s.student_code.toLowerCase().includes(q)
          || s.national_id.toLowerCase().includes(q)
          || s.full_name.toLowerCase().includes(q);
        expect(matches).toBe(true);
      });
    }
  ), { numRuns: 100 });
});

// Property 3: Promotion State Machine
// Feature: nctu-erp-completion, Property 3: student promotion state machine
test('promotion produces correct state transitions', () => {
  fc.assert(fc.property(
    fc.record({
      current_year: fc.integer({ min: 1, max: 3 }),
      academic_status: fc.constant('active')
    }),
    fc.constantFrom('semester', 'year', 'graduate'),
    (student, promotionType) => {
      const result = applyPromotion(student, promotionType);
      if (promotionType === 'year') {
        expect(result.current_year).toBe(student.current_year + 1);
      } else if (promotionType === 'graduate') {
        expect(result.academic_status).toBe('graduated');
      }
    }
  ), { numRuns: 100 });
});
```

### Unit Tests (الأمثلة المحددة)

```javascript
// GPA edge cases
test('GPA returns 0.0 when no approved grades', () => {
  expect(calculateGPA([])).toBe(0.0);
});

test('GPA classification: 3.7 → Distinction', () => {
  expect(classifyGPA(3.7)).toBe('Distinction');
  expect(classifyGPA(4.0)).toBe('Distinction');
});

test('GPA classification: 3.0 → Merit', () => {
  expect(classifyGPA(3.0)).toBe('Merit');
  expect(classifyGPA(3.69)).toBe('Merit');
});

// Promotion validation
test('suspended student cannot be promoted', async () => {
  const res = await request(app)
    .post('/api/admin/students/1/promote')
    .send({ promotion_type: 'year' })
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.status).toBe(400);
});

// Student creation atomicity
test('failed student creation rolls back user record', async () => {
  // Mock DB failure on Student.create
  // Verify User record was also rolled back
});
```

### Integration Tests

```javascript
// API response format consistency
test('all /api/accountant/* endpoints return { success, data, message }', async () => {
  const endpoints = [
    { method: 'get', path: '/api/accountant/summary' },
    { method: 'get', path: '/api/accountant/students/1/invoices' }
  ];
  for (const ep of endpoints) {
    const res = await request(app)[ep.method](ep.path)
      .set('Authorization', `Bearer ${accountantToken}`);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
  }
});

// Role protection
test('non-accountant cannot access /api/accountant/*', async () => {
  const res = await request(app)
    .get('/api/accountant/summary')
    .set('Authorization', `Bearer ${studentToken}`);
  expect(res.status).toBe(403);
});
```
