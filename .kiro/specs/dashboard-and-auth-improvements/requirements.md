# Requirements Document

## Introduction

This document specifies requirements for improving the NCTU ERP system's dashboard routing, authentication mechanisms, and user interface. The improvements include creating role-specific dashboards, implementing national ID-based authentication for students, removing English UI elements, and automating student course enrollment.

## Glossary

- **Dashboard_Router**: The routing component that directs authenticated users to their role-specific dashboard
- **Professor_Dashboard**: A dedicated dashboard page displaying professor-specific information including assigned courses, student statistics, and schedule
- **Student_Dashboard**: A dedicated dashboard page for students (currently the StudentPortal component)
- **Authentication_Service**: The backend service handling user login and credential validation
- **National_ID**: The Egyptian national identification number (14 digits)
- **Student_Enrollment_Service**: The service responsible for automatically enrolling students in courses
- **UI_Localization_Service**: The service managing user interface language and directionality
- **Role**: User type in the system (admin, professor, accountant, student)
- **Specialty**: Academic program or major (e.g., ICT, MCT, AUT)
- **Academic_Year**: The year level of a student (1-4)
- **Course**: An academic subject offered by the university
- **StudentEnrollment**: Database record linking a student to a course

## Requirements

### Requirement 1: Professor Dashboard Creation

**User Story:** As a professor, I want to see a dedicated dashboard with my courses and student statistics, so that I can quickly access relevant information for my teaching responsibilities.

#### Acceptance Criteria

1. THE Professor_Dashboard SHALL display the professor's full name and role
2. WHEN a professor views their dashboard, THE Professor_Dashboard SHALL display all courses assigned to the professor
3. FOR EACH assigned course, THE Professor_Dashboard SHALL display the course name, course code, specialty, academic year, and semester
4. FOR EACH assigned course, THE Professor_Dashboard SHALL display the count of enrolled students
5. FOR EACH assigned course, THE Professor_Dashboard SHALL display the count of submitted grades
6. FOR EACH assigned course, THE Professor_Dashboard SHALL display the count of pending grades
7. THE Professor_Dashboard SHALL display the total number of courses assigned to the professor
8. THE Professor_Dashboard SHALL display the total number of students across all assigned courses
9. THE Professor_Dashboard SHALL provide navigation links to grade management for each course
10. WHEN no courses are assigned to a professor, THE Professor_Dashboard SHALL display a message indicating no courses are assigned
11. THE Professor_Dashboard SHALL fetch all data from the database (no mock data)
12. WHEN data is loading, THE Professor_Dashboard SHALL display a loading indicator
13. IF data fetching fails, THEN THE Professor_Dashboard SHALL display an error message with a retry option

### Requirement 2: Role-Based Dashboard Routing

**User Story:** As a user, I want to be automatically directed to my role-specific dashboard after login, so that I can immediately access relevant information for my role.

#### Acceptance Criteria

1. WHEN a user with role "admin" logs in successfully, THE Dashboard_Router SHALL redirect to `/admin/dashboard`
2. WHEN a user with role "professor" logs in successfully, THE Dashboard_Router SHALL redirect to `/professor/dashboard`
3. WHEN a user with role "accountant" logs in successfully, THE Dashboard_Router SHALL redirect to `/accountant/dashboard`
4. WHEN a user with role "student" logs in successfully, THE Dashboard_Router SHALL redirect to `/student/dashboard`
5. WHEN an authenticated user navigates to `/dashboard`, THE Dashboard_Router SHALL detect the user's role and redirect to the appropriate role-specific dashboard
6. WHEN an unauthenticated user attempts to access `/dashboard`, THE Dashboard_Router SHALL redirect to `/login`
7. THE Dashboard_Router SHALL preserve the user's authentication state during redirects
8. WHEN a user accesses a dashboard route for a different role, THE Dashboard_Router SHALL redirect to their correct role-specific dashboard

### Requirement 3: Student Authentication with National ID

**User Story:** As a student, I want to log in using my student code and national ID, so that I can access the system without needing to remember a separate password.

#### Acceptance Criteria

1. THE Authentication_Service SHALL accept student_code and national_id as login credentials for students
2. THE Authentication_Service SHALL validate that national_id is exactly 14 digits
3. THE Authentication_Service SHALL validate that national_id contains only numeric characters
4. WHEN a student provides valid student_code and national_id, THE Authentication_Service SHALL authenticate the student
5. WHEN a student provides invalid credentials, THE Authentication_Service SHALL return an error message in Arabic
6. THE student login form SHALL display "الرقم القومي" as the label for the national_id field
7. THE student login form SHALL display "كود الطالب" as the label for the student_code field
8. THE student login form SHALL use input type "text" with pattern validation for national_id
9. THE student login form SHALL display field-specific error messages for invalid national_id format
10. WHEN national_id is less than 14 digits, THE student login form SHALL display "الرقم القومي يجب أن يكون 14 رقماً"
11. WHEN national_id contains non-numeric characters, THE student login form SHALL display "الرقم القومي يجب أن يحتوي على أرقام فقط"
12. THE Authentication_Service SHALL maintain the existing admin/professor/accountant login mechanism unchanged

### Requirement 4: Arabic-Only User Interface

**User Story:** As an Arabic-speaking user, I want the entire interface to be in Arabic with RTL layout, so that I can navigate the system comfortably in my native language.

#### Acceptance Criteria

1. THE UI_Localization_Service SHALL remove all English sidebar navigation elements
2. THE UI_Localization_Service SHALL ensure all navigation labels are in Arabic
3. THE UI_Localization_Service SHALL apply RTL (right-to-left) directionality to all pages
4. THE UI_Localization_Service SHALL ensure all form labels are in Arabic
5. THE UI_Localization_Service SHALL ensure all button text is in Arabic
6. THE UI_Localization_Service SHALL ensure all error messages are in Arabic
7. THE UI_Localization_Service SHALL ensure all success messages are in Arabic
8. THE UI_Localization_Service SHALL ensure all table headers are in Arabic
9. WHEN a page contains mixed language content, THE UI_Localization_Service SHALL display only Arabic content
10. THE UI_Localization_Service SHALL maintain consistent Arabic terminology across all pages

### Requirement 5: Automatic Student Course Enrollment

**User Story:** As a student, I want to be automatically enrolled in my specialty's courses when I register, so that I don't have to manually select courses for my year.

#### Acceptance Criteria

1. WHEN a student registration is approved, THE Student_Enrollment_Service SHALL automatically enroll the student in all courses for their specialty and current year
2. THE Student_Enrollment_Service SHALL query courses WHERE specialty_id matches the student's specialty_id AND year matches the student's current_year
3. FOR EACH matching course, THE Student_Enrollment_Service SHALL create a StudentEnrollment record
4. THE StudentEnrollment record SHALL link the student_id to the course_id
5. THE StudentEnrollment record SHALL set enrollment_date to the current date
6. THE StudentEnrollment record SHALL set status to "enrolled"
7. WHEN no courses exist for the student's specialty and year, THE Student_Enrollment_Service SHALL log a warning but not fail the registration
8. THE Student_Enrollment_Service SHALL not create duplicate StudentEnrollment records for the same student and course
9. WHEN a student's current_year is updated, THE Student_Enrollment_Service SHALL enroll the student in courses for the new year
10. THE Student_Enrollment_Service SHALL maintain existing enrollments when adding new enrollments
11. IF enrollment creation fails for any course, THEN THE Student_Enrollment_Service SHALL log the error and continue with remaining courses

### Requirement 6: Real Data Integration

**User Story:** As a user, I want all dashboards to display real data from the database, so that I can make decisions based on accurate information.

#### Acceptance Criteria

1. THE Professor_Dashboard SHALL fetch course data from the database using the professor's user_id
2. THE Professor_Dashboard SHALL fetch student enrollment counts from the StudentEnrollment table
3. THE Professor_Dashboard SHALL fetch grade statistics from the Grade table
4. THE Student_Dashboard SHALL fetch student information from the Student table
5. THE Student_Dashboard SHALL fetch enrolled courses from the StudentEnrollment table
6. THE Student_Dashboard SHALL fetch grades from the Grade table
7. THE Student_Dashboard SHALL fetch invoices from the Invoice table
8. THE Student_Dashboard SHALL fetch timetables from the Timetable table
9. WHEN data is not available, THE dashboard SHALL display "—" or "غير متوفر" instead of mock data
10. WHEN a database query fails, THE dashboard SHALL display an error message and provide a retry option
11. THE dashboard SHALL display a loading state while fetching data
12. THE dashboard SHALL cache fetched data to avoid unnecessary database queries

### Requirement 7: Dashboard Route Configuration

**User Story:** As a developer, I want clear route definitions for all role-specific dashboards, so that the routing logic is maintainable and extensible.

#### Acceptance Criteria

1. THE application router SHALL define route `/professor/dashboard` for the Professor_Dashboard component
2. THE application router SHALL define route `/student/dashboard` for the Student_Dashboard component
3. THE application router SHALL define route `/admin/dashboard` for the Admin_Dashboard component
4. THE application router SHALL define route `/accountant/dashboard` for the Accountant_Dashboard component
5. THE application router SHALL protect all dashboard routes with authentication middleware
6. THE application router SHALL protect role-specific routes with role-based authorization middleware
7. WHEN a user accesses a protected route without authentication, THE application router SHALL redirect to `/login`
8. WHEN a user accesses a route requiring a different role, THE application router SHALL redirect to their role-specific dashboard
9. THE application router SHALL maintain backward compatibility with existing routes
10. THE application router SHALL redirect `/portal` to `/student/dashboard` for students

### Requirement 8: Student Portal Migration

**User Story:** As a student, I want to access my portal at a consistent URL, so that I can bookmark and easily return to my dashboard.

#### Acceptance Criteria

1. THE application router SHALL maintain `/portal` as an alias for `/student/dashboard`
2. WHEN a student accesses `/portal`, THE application router SHALL render the Student_Dashboard component
3. THE Student_Dashboard component SHALL be the same component previously rendered at `/portal`
4. THE Student_Dashboard SHALL maintain all existing functionality (grades, invoices, QR code, timetable)
5. THE Student_Dashboard SHALL use the same styling and layout as the previous StudentPortal component
6. THE application router SHALL redirect authenticated students from `/portal` to `/student/dashboard`
7. THE Student_Dashboard SHALL display the student's avatar upload functionality
8. THE Student_Dashboard SHALL display the student's profile information
9. THE Student_Dashboard SHALL display tabbed navigation for grades, invoices, timetable, and QR code
10. THE Student_Dashboard SHALL maintain the existing API endpoints for fetching student data
