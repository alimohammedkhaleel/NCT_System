# Implementation Plan: Dashboard and Authentication Improvements

## Overview

This implementation plan covers the creation of role-based dashboard routing, national ID authentication for students, Arabic-only UI, and automatic student course enrollment. The work is divided into backend API changes, frontend component development, integration, and testing.

## Tasks

- [x] 1. Backend: Implement student authentication with national ID
  - [x] 1.1 Add studentLogin method to authController.js
    - Implement POST /api/auth/student-login endpoint
    - Validate student_code and national_id (14 digits, numeric only)
    - Query Student model with credentials
    - Generate JWT token for authenticated student
    - Return user data and token in Arabic response format
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.12_

  - [ ]* 1.2 Write unit tests for studentLogin
    - Test valid credentials authentication
    - Test invalid credentials rejection
    - Test national_id validation (length and format)
    - Test Arabic error messages
    - Test JWT token generation
    - _Requirements: 3.2, 3.3, 3.5, 3.10, 3.11_

  - [x] 1.3 Add route for student login in authRoutes.js
    - Register POST /api/auth/student-login route
    - Apply rate limiting middleware
    - _Requirements: 3.1_

- [ ] 2. Backend: Create student enrollment service
  - [ ] 2.1 Create studentEnrollmentService.js
    - Implement enrollStudentInCourses method
    - Query courses by specialty_id and current_year
    - Create StudentEnrollment records for each course
    - Handle duplicate enrollments gracefully
    - Log warnings for missing courses
    - Return enrollment results with error tracking
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.10, 5.11_

  - [ ] 2.2 Implement updateStudentYear method
    - Update student's current_year field
    - Call enrollStudentInCourses for new year
    - _Requirements: 5.9, 5.10_

  - [ ]* 2.3 Write unit tests for enrollment service
    - Test enrollStudentInCourses with valid student
    - Test handling of no courses available
    - Test duplicate enrollment prevention
    - Test partial failure handling
    - Test updateStudentYear workflow
    - _Requirements: 5.7, 5.8, 5.9, 5.10, 5.11_

- [ ] 3. Backend: Integrate enrollment service with registration approval
  - [ ] 3.1 Modify registration approval endpoint
    - Import studentEnrollmentService
    - Call enrollStudentInCourses after student creation
    - Log enrollment results and errors
    - _Requirements: 5.1_

  - [ ]* 3.2 Write integration test for registration approval flow
    - Test student creation triggers auto-enrollment
    - Test enrollment in correct courses
    - Verify StudentEnrollment records created
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 4. Backend: Implement professor dashboard API
  - [ ] 4.1 Add getProfessorDashboard method to gradeController.js
    - Query Professor model with user_id
    - Query assigned courses with joins to StudentEnrollment and Grade
    - Calculate enrollment counts and grade statistics using aggregations
    - Calculate summary stats (total courses, students, grades)
    - Return structured dashboard data
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.11, 6.1, 6.2, 6.3_

  - [ ] 4.2 Add route for professor dashboard in gradeRoutes.js
    - Register GET /api/grades/professor/dashboard
    - Apply authentication middleware
    - Apply role authorization (professor only)
    - _Requirements: 1.1, 1.2_

  - [ ]* 4.3 Write unit tests for getProfessorDashboard
    - Test correct data structure returned
    - Test stats calculation accuracy
    - Test handling of professor with no courses
    - Test error handling for missing professor
    - _Requirements: 1.10, 1.13_

- [ ] 5. Checkpoint - Ensure backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Frontend: Create professor dashboard component
  - [ ] 6.1 Create ProfessorDashboard.jsx component
    - Create component file in src/pages/
    - Implement useEffect to fetch dashboard data
    - Call GET /api/grades/professor/dashboard
    - Store courses and stats in state
    - Implement loading and error states
    - _Requirements: 1.1, 1.11, 1.12, 1.13_

  - [ ] 6.2 Create dashboard UI layout
    - Display professor name and role header
    - Create stats cards for total courses, students, grades
    - Create courses table with columns: course name, code, specialty, year, semester
    - Display enrollment counts and grade statistics per course
    - Add navigation links to grade management
    - Display empty state when no courses assigned
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_

  - [ ] 6.3 Style professor dashboard with CSS modules
    - Create ProfessorDashboard.module.css
    - Apply RTL layout
    - Style stats cards, table, and empty states
    - Ensure responsive design
    - _Requirements: 4.3_

- [ ] 7. Frontend: Implement role-based dashboard routing
  - [ ] 7.1 Create Dashboard.jsx router component
    - Create component in src/pages/
    - Use useAuth hook to get user and loading state
    - Implement switch statement for role-based redirects
    - Redirect admin to /admin/dashboard
    - Redirect professor to /professor/dashboard
    - Redirect accountant to /accountant/dashboard
    - Redirect student to /student/dashboard
    - Redirect unauthenticated users to /login
    - Display loading spinner while checking auth
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ]* 7.2 Write integration tests for dashboard routing
    - Test admin redirect to /admin/dashboard
    - Test professor redirect to /professor/dashboard
    - Test student redirect to /student/dashboard
    - Test accountant redirect to /accountant/dashboard
    - Test unauthenticated redirect to /login
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_

- [ ] 8. Frontend: Modify login component for student authentication
  - [ ] 8.1 Add student login form to Login.jsx
    - Add tab selector for "staff" vs "student" login
    - Create student login form with student_code and national_id fields
    - Add Arabic labels: "كود الطالب" and "الرقم القومي"
    - Implement handleStudentLogin function
    - Call POST /api/auth/student-login
    - Store token and user data in AuthContext
    - _Requirements: 3.1, 3.4, 3.6, 3.7, 3.8_

  - [ ] 8.2 Add client-side validation for national ID
    - Validate national_id is exactly 14 digits
    - Validate national_id contains only numeric characters
    - Display Arabic error messages for validation failures
    - Show "الرقم القومي يجب أن يكون 14 رقماً" for length errors
    - Show "الرقم القومي يجب أن يحتوي على أرقام فقط" for format errors
    - _Requirements: 3.2, 3.3, 3.9, 3.10, 3.11_

  - [ ] 8.3 Display API error messages in Arabic
    - Handle 400 and 401 responses from student login
    - Display error messages from API response
    - Add fallback error message for network failures
    - _Requirements: 3.5_

- [ ] 9. Frontend: Migrate StudentPortal to StudentDashboard
  - [ ] 9.1 Rename StudentPortal.jsx to StudentDashboard.jsx
    - Rename component file
    - Update component name in exports
    - Maintain all existing functionality (grades, invoices, QR, timetable)
    - _Requirements: 8.3, 8.4, 8.5_

  - [ ] 9.2 Update routes in App.jsx
    - Add route /student/dashboard for StudentDashboard
    - Add route /professor/dashboard for ProfessorDashboard
    - Add route /dashboard for Dashboard router
    - Update /portal to redirect to /student/dashboard
    - Apply ProtectedRoute wrapper to all dashboard routes
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.9, 8.1, 8.2, 8.6, 8.10_

- [ ] 10. Frontend: Localize UI to Arabic
  - [ ] 10.1 Update navigation components to Arabic
    - Replace all English sidebar labels with Arabic
    - Update Navbar.jsx with Arabic text
    - Update AdminLayout.jsx navigation with Arabic
    - _Requirements: 4.1, 4.2_

  - [ ] 10.2 Apply RTL directionality globally
    - Add dir="rtl" to root HTML element
    - Update CSS for RTL layout
    - Test all pages for RTL compatibility
    - _Requirements: 4.3_

  - [ ] 10.3 Translate all form labels and buttons
    - Update all form labels to Arabic
    - Update all button text to Arabic
    - Update all placeholder text to Arabic
    - _Requirements: 4.4, 4.5_

  - [ ] 10.4 Translate all messages and table headers
    - Update all error messages to Arabic
    - Update all success messages to Arabic
    - Update all table headers to Arabic
    - Ensure consistent Arabic terminology
    - _Requirements: 4.6, 4.7, 4.8, 4.9, 4.10_

- [ ] 11. Checkpoint - Ensure all components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Integration: Wire authentication and routing together
  - [ ] 12.1 Update AuthContext to handle student login
    - Add studentLogin method to AuthContext
    - Store student user data in context
    - Ensure role is correctly set for students
    - _Requirements: 2.7, 3.4_

  - [ ] 12.2 Test complete authentication flow
    - Test staff login redirects to correct dashboard
    - Test student login redirects to /student/dashboard
    - Test token persistence across page refreshes
    - Test logout clears authentication state
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.7_

  - [ ]* 12.3 Write end-to-end integration tests
    - Test complete student registration and enrollment flow
    - Test student login and dashboard access
    - Test professor dashboard data display
    - Test role-based access control
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.1, 6.1, 6.2, 6.3_

- [ ] 13. Integration: Verify real data display
  - [ ] 13.1 Test professor dashboard with real database
    - Verify courses display correctly
    - Verify enrollment counts are accurate
    - Verify grade statistics are accurate
    - Test with professor having no courses
    - _Requirements: 1.11, 6.1, 6.2, 6.3_

  - [ ] 13.2 Test student dashboard with real database
    - Verify student information displays correctly
    - Verify enrolled courses display correctly
    - Verify grades display correctly
    - Verify invoices display correctly
    - Verify timetable displays correctly
    - _Requirements: 6.4, 6.5, 6.6, 6.7, 6.8_

  - [ ] 13.3 Test enrollment service with real data
    - Create test student with specialty and year
    - Approve registration and verify auto-enrollment
    - Check StudentEnrollment records created
    - Verify student can see enrolled courses
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 14. Final checkpoint - Complete testing and verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- All UI text must be in Arabic with RTL layout
- Backend changes maintain backward compatibility with existing authentication
- Student enrollment is automatic and happens during registration approval
- Professor dashboard fetches real data from database with proper aggregations
