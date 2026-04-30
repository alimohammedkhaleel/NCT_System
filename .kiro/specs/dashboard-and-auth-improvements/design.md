# Design Document: Dashboard and Authentication Improvements

## Overview

This design specifies the implementation of role-based dashboard routing, national ID authentication for students, Arabic-only UI, and automatic student course enrollment for the NCTU ERP system. The solution enhances user experience by providing role-specific dashboards, simplifying student authentication, and automating enrollment workflows.

The system currently has a generic `/dashboard` route that doesn't differentiate between user roles. This design introduces dedicated dashboard routes for each role (admin, professor, accountant, student) with automatic routing based on authentication context. Additionally, students will authenticate using their student code and national ID instead of passwords, and the UI will be fully localized to Arabic with RTL support.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Login      │  │  Dashboard   │  │  Protected   │      │
│  │   Component  │  │   Router     │  │   Route      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                           │                                 │
│                    ┌──────▼──────┐                          │
│                    │ AuthContext │                          │
│                    └──────┬──────┘                          │
└───────────────────────────┼──────────────────────────────────┘
                            │ HTTP/JWT
┌───────────────────────────▼──────────────────────────────────┐
│                     Backend (Express)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Auth      │  │   Professor  │  │   Student    │      │
│  │  Controller  │  │  Controller  │  │  Enrollment  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                           │                                 │
│                    ┌──────▼──────┐                          │
│                    │  Database   │                          │
│                    │  (MySQL)    │                          │
│                    └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

1. **Authentication Flow**:
   - User submits credentials (username/password OR student_code/national_id)
   - AuthController validates credentials against database
   - JWT token generated and returned to client
   - AuthContext stores token and user data
   - Dashboard Router redirects to role-specific dashboard

2. **Dashboard Routing Flow**:
   - User accesses `/dashboard`
   - ProtectedRoute checks authentication
   - Dashboard Router reads user role from AuthContext
   - Router redirects to role-specific route
   - Role-specific dashboard component renders

3. **Student Enrollment Flow**:
   - Admin approves registration request
   - Student record created with specialty_id and current_year
   - Student_Enrollment_Service queries courses for specialty/year
   - StudentEnrollment records created for each course
   - Student can view enrolled courses in dashboard

## Components and Interfaces

### Frontend Components

#### 1. Dashboard Router Component
**Location**: `client/frontend/src/pages/Dashboard.jsx`

**Purpose**: Redirect authenticated users to their role-specific dashboard

**Interface**:
```javascript
const Dashboard = () => {
  const { user, loading } = useAuth();
  
  // Redirect logic based on user.role
  if (loading) return <LoadingSpinner />;
  
  switch(user.role) {
    case 'admin': return <Navigate to="/admin/dashboard" replace />;
    case 'professor': return <Navigate to="/professor/dashboard" replace />;
    case 'accountant': return <Navigate to="/accountant/dashboard" replace />;
    case 'student': return <Navigate to="/student/dashboard" replace />;
    default: return <Navigate to="/login" replace />;
  }
}
```

**State Management**:
- No local state required
- Reads from AuthContext: `user`, `loading`

#### 2. Professor Dashboard Component
**Location**: `client/frontend/src/pages/ProfessorDashboard.jsx` (new file)

**Purpose**: Display professor-specific information including assigned courses, student statistics, and grade management links

**Interface**:
```javascript
const ProfessorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchProfessorData();
  }, []);
  
  const fetchProfessorData = async () => {
    // GET /api/grades/professor/dashboard
  };
  
  return (
    <div className="professor-dashboard">
      <ProfileHeader />
      <StatsCards stats={stats} />
      <CoursesTable courses={courses} />
    </div>
  );
}
```

**Data Structure**:
```javascript
{
  professor: {
    full_name: string,
    professor_code: string,
    role: 'professor'
  },
  stats: {
    total_courses: number,
    total_students: number,
    pending_grades: number,
    approved_grades: number
  },
  courses: [
    {
      id: number,
      course_code: string,
      course_name: string,
      arabic_name: string,
      specialty_name: string,
      year: number,
      semester: string,
      enrolled_students: number,
      submitted_grades: number,
      pending_grades: number
    }
  ]
}
```

#### 3. Student Login Form Component
**Location**: `client/frontend/src/pages/Login.jsx` (modified)

**Purpose**: Provide separate login forms for staff (username/password) and students (student_code/national_id)

**Interface**:
```javascript
const Login = () => {
  const [loginType, setLoginType] = useState('staff'); // 'staff' | 'student'
  const [credentials, setCredentials] = useState({
    // Staff
    username: '',
    password: '',
    // Student
    student_code: '',
    national_id: ''
  });
  
  const handleStaffLogin = async () => {
    // POST /api/auth/login
  };
  
  const handleStudentLogin = async () => {
    // POST /api/auth/student-login
  };
  
  return (
    <div className="login-page">
      <TabSelector onChange={setLoginType} />
      {loginType === 'staff' ? <StaffLoginForm /> : <StudentLoginForm />}
    </div>
  );
}
```

**Validation Rules**:
- Student Code: Required, non-empty string
- National ID: Required, exactly 14 digits, numeric only
- Error messages in Arabic

#### 4. Student Dashboard Component (StudentPortal Migration)
**Location**: `client/frontend/src/pages/StudentDashboard.jsx` (rename from StudentPortal.jsx)

**Purpose**: Maintain existing student portal functionality with new routing

**Changes**:
- Component renamed from `StudentPortal` to `StudentDashboard`
- Route changed from `/portal` to `/student/dashboard`
- `/portal` becomes an alias that redirects to `/student/dashboard`
- All existing functionality preserved (grades, invoices, QR code, timetable)

### Backend Components

#### 1. Authentication Controller
**Location**: `server/controllers/authController.js` (modified)

**New Method**: `studentLogin`

**Interface**:
```javascript
const studentLogin = async (req, res) => {
  const { student_code, national_id } = req.body;
  
  // Validate input
  if (!student_code || !national_id) {
    return res.status(400).json({
      success: false,
      message: 'يرجى إدخال كود الطالب والرقم القومي'
    });
  }
  
  // Validate national_id format
  if (!/^\d{14}$/.test(national_id)) {
    return res.status(400).json({
      success: false,
      message: 'الرقم القومي يجب أن يكون 14 رقماً'
    });
  }
  
  // Find student
  const student = await Student.findOne({
    where: { student_code, national_id },
    include: [{ model: User }]
  });
  
  if (!student) {
    return res.status(401).json({
      success: false,
      message: 'كود الطالب أو الرقم القومي غير صحيح'
    });
  }
  
  // Generate JWT token
  const token = generateToken(student.User);
  
  return res.json({
    success: true,
    data: { user: student.User, token }
  });
};
```

#### 2. Professor Dashboard Controller
**Location**: `server/controllers/gradeController.js` (new method)

**New Method**: `getProfessorDashboard`

**Interface**:
```javascript
const getProfessorDashboard = async (req, res) => {
  const professorUserId = req.user.id;
  
  // Get professor record
  const professor = await Professor.findOne({
    where: { user_id: professorUserId },
    include: [{ model: User }]
  });
  
  // Get assigned courses with enrollment counts
  const courses = await Course.findAll({
    include: [
      {
        model: ProfessorCourse,
        where: { professor_id: professor.id }
      },
      {
        model: StudentEnrollment,
        attributes: [],
        required: false
      },
      {
        model: Grade,
        attributes: [],
        required: false
      },
      { model: Specialty },
      { model: AcademicYear },
      { model: Semester }
    ],
    attributes: {
      include: [
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('StudentEnrollments.student_id'))), 'enrolled_students'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('Grades.id'))), 'total_grades'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN Grades.status = 'approved' THEN 1 ELSE 0 END")), 'approved_grades'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN Grades.status = 'pending' THEN 1 ELSE 0 END")), 'pending_grades']
      ]
    },
    group: ['Course.id']
  });
  
  // Calculate stats
  const stats = {
    total_courses: courses.length,
    total_students: courses.reduce((sum, c) => sum + c.dataValues.enrolled_students, 0),
    pending_grades: courses.reduce((sum, c) => sum + c.dataValues.pending_grades, 0),
    approved_grades: courses.reduce((sum, c) => sum + c.dataValues.approved_grades, 0)
  };
  
  return res.json({
    success: true,
    data: {
      professor: {
        full_name: professor.User.full_name,
        professor_code: professor.professor_code,
        role: 'professor'
      },
      stats,
      courses
    }
  });
};
```

#### 3. Student Enrollment Service
**Location**: `server/services/studentEnrollmentService.js` (new file)

**Purpose**: Automatically enroll students in courses when registration is approved

**Interface**:
```javascript
class StudentEnrollmentService {
  /**
   * Enroll student in all courses for their specialty and year
   * @param {number} studentId - Student database ID
   * @returns {Promise<{success: boolean, enrolled: number, errors: Array}>}
   */
  async enrollStudentInCourses(studentId) {
    const student = await Student.findByPk(studentId);
    
    if (!student) {
      throw new Error('Student not found');
    }
    
    // Find all courses for student's specialty and current year
    const courses = await Course.findAll({
      include: [
        {
          model: AcademicYear,
          where: {
            specialty_id: student.specialty_id,
            year_number: student.current_year
          }
        }
      ],
      where: { is_active: true }
    });
    
    if (courses.length === 0) {
      console.warn(`No courses found for specialty ${student.specialty_id}, year ${student.current_year}`);
      return { success: true, enrolled: 0, errors: [] };
    }
    
    const enrollments = [];
    const errors = [];
    
    for (const course of courses) {
      try {
        // Check for existing enrollment
        const existing = await StudentEnrollment.findOne({
          where: {
            student_id: studentId,
            course_id: course.id
          }
        });
        
        if (existing) {
          console.log(`Student ${studentId} already enrolled in course ${course.id}`);
          continue;
        }
        
        // Create enrollment
        await StudentEnrollment.create({
          student_id: studentId,
          course_id: course.id,
          academic_year_id: course.academic_year_id,
          semester_id: course.semester_id,
          enrollment_date: new Date(),
          status: 'enrolled'
        });
        
        enrollments.push(course.id);
      } catch (error) {
        console.error(`Failed to enroll student ${studentId} in course ${course.id}:`, error);
        errors.push({
          course_id: course.id,
          course_name: course.course_name,
          error: error.message
        });
      }
    }
    
    return {
      success: true,
      enrolled: enrollments.length,
      errors
    };
  }
  
  /**
   * Re-enroll student when year is updated
   * @param {number} studentId - Student database ID
   * @param {number} newYear - New year number (1-4)
   */
  async updateStudentYear(studentId, newYear) {
    const student = await Student.findByPk(studentId);
    await student.update({ current_year: newYear });
    return await this.enrollStudentInCourses(studentId);
  }
}

module.exports = new StudentEnrollmentService();
```

### API Endpoints

#### New Endpoints

1. **POST /api/auth/student-login**
   - Purpose: Authenticate students using student_code and national_id
   - Request Body:
     ```json
     {
       "student_code": "20241234",
       "national_id": "12345678901234"
     }
     ```
   - Response:
     ```json
     {
       "success": true,
       "message": "تم تسجيل الدخول بنجاح",
       "data": {
         "user": {
           "id": 1,
           "username": "student_20241234",
           "email": "student@example.com",
           "full_name": "أحمد محمد",
           "role": "student",
           "student_code": "20241234",
           "specialty_id": 1,
           "current_year": 1
         },
         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
       }
     }
     ```
   - Error Responses:
     - 400: Missing fields or invalid national_id format
     - 401: Invalid credentials

2. **GET /api/grades/professor/dashboard**
   - Purpose: Fetch professor dashboard data
   - Authentication: Required (JWT)
   - Authorization: professor role only
   - Response:
     ```json
     {
       "success": true,
       "data": {
         "professor": {
           "full_name": "د. أحمد محمد",
           "professor_code": "PROF-001",
           "role": "professor"
         },
         "stats": {
           "total_courses": 5,
           "total_students": 120,
           "pending_grades": 15,
           "approved_grades": 105
         },
         "courses": [
           {
             "id": 1,
             "course_code": "ICT101",
             "course_name": "Introduction to Programming",
             "arabic_name": "مقدمة في البرمجة",
             "specialty_name": "تكنولوجيا المعلومات",
             "year": 1,
             "semester": "الفصل الأول",
             "enrolled_students": 30,
             "submitted_grades": 25,
             "pending_grades": 5
           }
         ]
       }
     }
     ```

#### Modified Endpoints

1. **POST /api/admin/registration-requests/:id/approve**
   - Additional behavior: After creating student record, automatically enroll in courses
   - Implementation:
     ```javascript
     // After student creation
     const student = await Student.create({...});
     
     // Auto-enroll in courses
     const enrollmentService = require('../services/studentEnrollmentService');
     const result = await enrollmentService.enrollStudentInCourses(student.id);
     
     console.log(`Enrolled student in ${result.enrolled} courses`);
     if (result.errors.length > 0) {
       console.warn('Enrollment errors:', result.errors);
     }
     ```

## Data Models

### Existing Models (No Changes Required)

The following models already exist and support the required functionality:

- **User**: Stores authentication credentials and basic user info
- **Student**: Links to User, stores student_code and national_id
- **Professor**: Links to User, stores professor-specific data
- **Course**: Stores course information with specialty and year associations
- **StudentEnrollment**: Links students to courses
- **Grade**: Stores student grades with approval status
- **Specialty**: Stores academic programs
- **AcademicYear**: Stores year levels within specialties
- **Semester**: Stores semester information

### Database Queries

#### Query 1: Find Student by Credentials
```sql
SELECT s.*, u.*
FROM students s
INNER JOIN users u ON s.user_id = u.id
WHERE s.student_code = ? AND s.national_id = ?
AND u.is_active = true;
```

#### Query 2: Get Courses for Specialty and Year
```sql
SELECT c.*
FROM courses c
INNER JOIN academic_years ay ON c.academic_year_id = ay.id
WHERE ay.specialty_id = ? 
AND ay.year_number = ?
AND c.is_active = true;
```

#### Query 3: Get Professor Dashboard Data
```sql
SELECT 
  c.id,
  c.course_code,
  c.course_name,
  c.arabic_name,
  s.arabic_name as specialty_name,
  ay.year_number,
  sem.semester_name,
  COUNT(DISTINCT se.student_id) as enrolled_students,
  COUNT(DISTINCT g.id) as total_grades,
  SUM(CASE WHEN g.status = 'approved' THEN 1 ELSE 0 END) as approved_grades,
  SUM(CASE WHEN g.status = 'pending' THEN 1 ELSE 0 END) as pending_grades
FROM courses c
INNER JOIN professor_courses pc ON c.id = pc.course_id
INNER JOIN specialties s ON c.specialty_id = s.id
INNER JOIN academic_years ay ON c.academic_year_id = ay.id
INNER JOIN semesters sem ON c.semester_id = sem.id
LEFT JOIN student_enrollments se ON c.id = se.course_id
LEFT JOIN grades g ON c.id = g.course_id
WHERE pc.professor_id = ?
GROUP BY c.id;
```

## Error Handling

### Frontend Error Handling

1. **Authentication Errors**:
   - Invalid credentials: Display Arabic error message from API
   - Network errors: Display "حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى"
   - Token expiration: Redirect to login with message "انتهت جلستك، يرجى تسجيل الدخول مرة أخرى"

2. **Dashboard Loading Errors**:
   - API failure: Display error message with retry button
   - No data: Display appropriate empty state message
   - Loading state: Show spinner with Arabic text "جاري التحميل..."

3. **Validation Errors**:
   - Empty fields: "يرجى ملء جميع الحقول"
   - Invalid national ID length: "الرقم القومي يجب أن يكون 14 رقماً"
   - Invalid national ID format: "الرقم القومي يجب أن يحتوي على أرقام فقط"

### Backend Error Handling

1. **Authentication Errors**:
   ```javascript
   // Missing credentials
   if (!student_code || !national_id) {
     return res.status(400).json({
       success: false,
       message: 'يرجى إدخال كود الطالب والرقم القومي'
     });
   }
   
   // Invalid format
   if (!/^\d{14}$/.test(national_id)) {
     return res.status(400).json({
       success: false,
       message: 'الرقم القومي يجب أن يكون 14 رقماً'
     });
   }
   
   // Invalid credentials
   if (!student) {
     return res.status(401).json({
       success: false,
       message: 'كود الطالب أو الرقم القومي غير صحيح'
     });
   }
   
   // Inactive account
   if (!student.User.is_active) {
     return res.status(401).json({
       success: false,
       message: 'حسابك غير نشط، يرجى التواصل مع الإدارة'
     });
   }
   ```

2. **Enrollment Errors**:
   ```javascript
   // No courses found
   if (courses.length === 0) {
     console.warn(`No courses found for specialty ${specialty_id}, year ${year}`);
     // Don't fail - log warning and continue
   }
   
   // Duplicate enrollment
   const existing = await StudentEnrollment.findOne({
     where: { student_id, course_id }
   });
   if (existing) {
     console.log(`Student already enrolled in course ${course_id}`);
     continue; // Skip, don't error
   }
   
   // Individual course enrollment failure
   try {
     await StudentEnrollment.create({...});
   } catch (error) {
     console.error(`Failed to enroll in course ${course_id}:`, error);
     errors.push({ course_id, error: error.message });
     // Continue with other courses
   }
   ```

3. **Dashboard Data Errors**:
   ```javascript
   // Professor not found
   if (!professor) {
     return res.status(404).json({
       success: false,
       message: 'لم يتم العثور على بيانات الأستاذ'
     });
   }
   
   // Database query error
   try {
     const courses = await Course.findAll({...});
   } catch (error) {
     console.error('Dashboard query error:', error);
     return res.status(500).json({
       success: false,
       message: 'حدث خطأ أثناء تحميل البيانات'
     });
   }
   ```

## Testing Strategy

This feature involves UI rendering, authentication flows, database queries, and routing logic. Property-based testing is not applicable for these types of components. Instead, we will use:

### Unit Tests

1. **Authentication Logic Tests**:
   - Test `studentLogin` controller with valid credentials
   - Test `studentLogin` controller with invalid credentials
   - Test national ID validation (14 digits, numeric only)
   - Test student_code validation (non-empty)
   - Test JWT token generation for student users

2. **Enrollment Service Tests**:
   - Test `enrollStudentInCourses` with valid student
   - Test `enrollStudentInCourses` with no courses available
   - Test `enrollStudentInCourses` with existing enrollments (no duplicates)
   - Test `enrollStudentInCourses` with partial failures
   - Test `updateStudentYear` updates year and re-enrolls

3. **Dashboard Controller Tests**:
   - Test `getProfessorDashboard` returns correct data structure
   - Test `getProfessorDashboard` calculates stats correctly
   - Test `getProfessorDashboard` handles professor with no courses
   - Test `getProfessorDashboard` handles database errors

### Integration Tests

1. **Authentication Flow**:
   - Test complete student login flow (POST /api/auth/student-login)
   - Test staff login flow remains unchanged
   - Test JWT token validation after student login
   - Test role-based access control for dashboard routes

2. **Dashboard Routing**:
   - Test `/dashboard` redirects admin to `/admin/dashboard`
   - Test `/dashboard` redirects professor to `/professor/dashboard`
   - Test `/dashboard` redirects student to `/student/dashboard`
   - Test `/dashboard` redirects accountant to `/accountant/dashboard`
   - Test unauthenticated access to `/dashboard` redirects to `/login`

3. **Enrollment Workflow**:
   - Test registration approval triggers auto-enrollment
   - Test student can view enrolled courses after approval
   - Test year update triggers re-enrollment

### Manual Testing

1. **UI/UX Testing**:
   - Verify all text is in Arabic
   - Verify RTL layout is applied correctly
   - Verify login form displays correct fields for staff vs student
   - Verify error messages display in Arabic
   - Verify professor dashboard displays all required information
   - Verify student dashboard maintains existing functionality

2. **Browser Testing**:
   - Test on Chrome, Firefox, Safari
   - Test responsive design on mobile devices
   - Test RTL layout on different screen sizes

### Test Data Setup

```javascript
// Test student credentials
const testStudent = {
  student_code: '20241234',
  national_id: '12345678901234',
  specialty_id: 1,
  current_year: 1
};

// Test courses for enrollment
const testCourses = [
  { id: 1, course_code: 'ICT101', specialty_id: 1, year: 1 },
  { id: 2, course_code: 'ICT102', specialty_id: 1, year: 1 },
  { id: 3, course_code: 'ICT103', specialty_id: 1, year: 1 }
];

// Test professor with courses
const testProfessor = {
  professor_code: 'PROF-001',
  user_id: 10,
  courses: [
    { id: 1, enrolled_students: 30, pending_grades: 5 },
    { id: 2, enrolled_students: 25, pending_grades: 3 }
  ]
};
```

## Implementation Notes

### Frontend Implementation Order

1. Create `ProfessorDashboard.jsx` component
2. Modify `Dashboard.jsx` to implement role-based routing
3. Modify `Login.jsx` to add student login form
4. Rename `StudentPortal.jsx` to `StudentDashboard.jsx`
5. Update `App.jsx` routes configuration
6. Update all UI text to Arabic
7. Apply RTL directionality to all pages

### Backend Implementation Order

1. Implement `studentLogin` method in `authController.js`
2. Create `studentEnrollmentService.js`
3. Implement `getProfessorDashboard` method in `gradeController.js`
4. Add route for `/api/grades/professor/dashboard`
5. Modify registration approval to call enrollment service
6. Add error handling and logging

### Database Considerations

- No schema changes required
- Ensure indexes exist on:
  - `students.student_code`
  - `students.national_id`
  - `student_enrollments.student_id`
  - `student_enrollments.course_id`
  - `courses.specialty_id`
  - `courses.academic_year_id`

### Security Considerations

1. **National ID as Authentication**:
   - National IDs are sensitive personal information
   - Ensure HTTPS is enforced in production
   - Consider rate limiting on student login endpoint
   - Log failed authentication attempts

2. **JWT Token Security**:
   - Use strong JWT secret
   - Set appropriate token expiration (7 days)
   - Implement token refresh mechanism
   - Validate token on every protected route

3. **Role-Based Access Control**:
   - Verify user role on backend for all dashboard endpoints
   - Don't rely solely on frontend routing for security
   - Use `authorizeRoles` middleware consistently

### Performance Considerations

1. **Dashboard Queries**:
   - Use database indexes for fast lookups
   - Consider caching professor dashboard data (5-minute TTL)
   - Use `COUNT` and `SUM` aggregations in single query
   - Avoid N+1 queries with proper `include` statements

2. **Enrollment Service**:
   - Batch enrollment operations where possible
   - Use transactions for multiple enrollments
   - Log errors but don't fail entire operation
   - Consider background job for large enrollments

3. **Frontend Performance**:
   - Lazy load dashboard components
   - Cache API responses in AuthContext
   - Use React.memo for expensive components
   - Implement loading states to improve perceived performance

## Deployment Checklist

- [ ] Run database migrations (if any)
- [ ] Update environment variables (JWT secrets)
- [ ] Test student login with real national IDs
- [ ] Verify all routes are protected
- [ ] Test role-based redirects
- [ ] Verify Arabic text displays correctly
- [ ] Test RTL layout on all pages
- [ ] Verify enrollment service works with real data
- [ ] Test professor dashboard with real courses
- [ ] Monitor error logs for authentication failures
- [ ] Set up rate limiting on login endpoints
- [ ] Verify HTTPS is enforced
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
