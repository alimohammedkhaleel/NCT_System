# Requirements Document: ICT Branch Support and Results Publishing System

## Introduction

This document specifies requirements for implementing ICT branch selection (Software/Network) for 3rd and 4th year students and fixing the results publishing system in the NCTU Educational ERP. The system currently lacks branch differentiation for ICT students and has a broken results publishing workflow that prevents administrators from properly publishing grades to students.

The implementation will add branch selection during student registration, filter courses by branch, and establish a working results publishing workflow where administrators can publish approved grades by course, making them visible to students.

## Glossary

- **Student**: A user enrolled in the university system with a student role
- **ICT_Student**: A student whose specialty is Information and Communication Technology (ICT)
- **Branch**: A specialization track within ICT (Software or Network) required for 3rd and 4th year students
- **Course**: An academic subject with a unique code, linked to specialty, academic year, and semester
- **Branch_Specific_Course**: A course that is only available to students in a particular branch
- **Grade**: A record containing assignment scores, final exam score, and calculated results for a student in a course
- **Professor**: A user with professor role who submits grades for courses they teach
- **Administrator**: A user with admin role who approves and publishes grades
- **Grade_Status**: The approval state of a grade (draft, pending_admin_approval, approved)
- **Published_Grade**: A grade with is_published flag set to true, visible to students
- **Registration_Form**: The student registration interface where new students provide their information
- **Results_Publishing_Interface**: The admin interface for publishing approved grades to students
- **Admin_Dashboard**: The administrative interface showing grade statistics and publishing controls
- **Academic_Year**: The year level of a student (1, 2, 3, or 4)
- **Enrollment**: The link between a student and a course they are taking
- **Grade_Workflow**: The process flow: Professor submits → Admin approves → Admin publishes → Student views

## Requirements

### Requirement 1: Branch Selection During Registration

**User Story:** As an ICT student registering for 3rd or 4th year, I want to select my branch (Software or Network), so that I can enroll in branch-specific courses and receive appropriate results.

#### Acceptance Criteria

1. WHEN an ICT_Student registers with current_year equal to 3 or 4, THE Registration_Form SHALL display a branch selection field with options "Software" and "Network"
2. WHEN an ICT_Student with current_year equal to 3 or 4 submits the Registration_Form without selecting a branch, THE Registration_Form SHALL return a validation error "Branch selection is required for ICT 3rd and 4th year students"
3. WHEN an ICT_Student with current_year equal to 1 or 2 registers, THE Registration_Form SHALL NOT display the branch selection field
4. WHEN a student from a non-ICT specialty registers, THE Registration_Form SHALL NOT display the branch selection field regardless of year
5. WHEN an ICT_Student successfully submits the Registration_Form with a branch selection, THE Student record SHALL store the selected branch value

### Requirement 2: Branch Data Persistence

**User Story:** As a system administrator, I want student branch selections stored in the database, so that the system can filter courses and display results by branch.

#### Acceptance Criteria

1. THE Student model SHALL include a branch field that accepts values "Software", "Network", or NULL
2. WHEN a Student record is created for an ICT_Student in year 3 or 4, THE Student record SHALL store the branch value as a non-null string
3. WHEN a Student record is created for a student in year 1 or 2 or non-ICT specialty, THE Student record SHALL store NULL in the branch field
4. THE Student table SHALL create an index on the branch field for query performance
5. FOR ALL Student records with specialty_id matching ICT and current_year equal to 3 or 4, querying by branch SHALL return results within 100 milliseconds for datasets up to 10,000 students

### Requirement 3: Course Branch Association

**User Story:** As a curriculum administrator, I want to mark courses as branch-specific, so that only students in the appropriate branch can see and enroll in those courses.

#### Acceptance Criteria

1. THE Course model SHALL include a branch field that accepts values "Software", "Network", "Both", or NULL
2. WHEN a Course is created with branch value "Software", THE Course SHALL be visible only to ICT_Students with branch equal to "Software"
3. WHEN a Course is created with branch value "Network", THE Course SHALL be visible only to ICT_Students with branch equal to "Network"
4. WHEN a Course is created with branch value "Both" or NULL, THE Course SHALL be visible to all students in the associated specialty
5. WHEN an ICT_Student in year 3 or 4 requests their available courses, THE System SHALL filter courses by matching the student's branch to the course's branch field

### Requirement 4: Branch-Filtered Course Display

**User Story:** As an ICT student in 3rd or 4th year, I want to see only courses relevant to my branch, so that I don't enroll in courses from the wrong specialization track.

#### Acceptance Criteria

1. WHEN an ICT_Student with branch "Software" requests available courses, THE System SHALL return only courses where branch is "Software", "Both", or NULL
2. WHEN an ICT_Student with branch "Network" requests available courses, THE System SHALL return only courses where branch is "Network", "Both", or NULL
3. WHEN an ICT_Student in year 1 or 2 without a branch requests available courses, THE System SHALL return all courses for their specialty regardless of branch field
4. WHEN a Professor views students enrolled in a Branch_Specific_Course, THE System SHALL display only students whose branch matches the course branch
5. FOR ALL course listing queries, the branch filter SHALL be applied before returning results to prevent unauthorized course visibility

### Requirement 5: Results Publishing by Course

**User Story:** As an administrator, I want to publish approved grades by selecting specific courses, so that I can control when students see their results for each course.

#### Acceptance Criteria

1. WHEN an Administrator accesses the Results_Publishing_Interface, THE System SHALL display a list of courses grouped by specialty, year, and semester
2. WHEN an Administrator selects one or more courses, THE System SHALL display the count of approved unpublished grades for those courses
3. WHEN an Administrator confirms publishing for selected courses, THE System SHALL update all approved grades for those courses to set is_published to true
4. WHEN grades are published, THE System SHALL record the published_at timestamp and published_by administrator ID
5. WHEN an Administrator attempts to publish grades for courses with no approved grades, THE System SHALL return an error message "No approved grades available for publishing"

### Requirement 6: Results Publishing API Endpoint Fix

**User Story:** As a system developer, I want the publish-results API endpoint to accept course-based parameters, so that the frontend can successfully publish results without 400 errors.

#### Acceptance Criteria

1. THE publish-results endpoint SHALL accept a request body containing course_ids as an array of integers
2. WHEN the publish-results endpoint receives a request with valid course_ids, THE endpoint SHALL query all grades where course_id is in the provided array, status is "approved", and is_published is false
3. WHEN the publish-results endpoint receives a request without course_ids, THE endpoint SHALL accept optional filters: specialty_id, academic_year_id, and semester_id
4. WHEN the publish-results endpoint receives a request with no course_ids and no filters, THE endpoint SHALL return a 400 error with message "يرجى تحديد المواد أو معايير التصفية"
5. WHEN the publish-results endpoint successfully publishes grades, THE endpoint SHALL return a success response with the count of published grades

### Requirement 7: Branch-Aware Results Display

**User Story:** As an administrator, I want to see results grouped by course and filtered by branch, so that I can verify grades before publishing them to students.

#### Acceptance Criteria

1. WHEN an Administrator views the Admin_Dashboard results section, THE System SHALL display courses grouped by specialty with branch information visible for Branch_Specific_Courses
2. WHEN an Administrator filters results by ICT specialty and year 3 or 4, THE System SHALL show separate groupings for Software branch courses and Network branch courses
3. WHEN an Administrator selects a Branch_Specific_Course, THE System SHALL display only grades for students whose branch matches the course branch
4. WHEN an Administrator views grade statistics, THE System SHALL calculate separate counts for Software branch and Network branch grades
5. FOR ALL results displays, branch information SHALL be clearly labeled to prevent publishing grades to incorrect student groups

### Requirement 8: Student Results Viewing with Branch Context

**User Story:** As an ICT student, I want to view my published grades with branch context, so that I can verify I'm seeing results for my correct specialization track.

#### Acceptance Criteria

1. WHEN a Student requests their grades, THE System SHALL return only Published_Grades where the student_id matches and is_published is true
2. WHEN an ICT_Student in year 3 or 4 views their grades, THE System SHALL display the branch name alongside each Branch_Specific_Course
3. WHEN a Student views a grade for a Branch_Specific_Course, THE System SHALL verify the student's branch matches the course branch before displaying
4. WHEN a Student has no published grades, THE System SHALL display a message "لا توجد نتائج منشورة حالياً"
5. FOR ALL grade queries, the system SHALL enforce that only grades with is_published equal to true are visible to students

### Requirement 9: Data Migration for Existing Students

**User Story:** As a system administrator, I want existing ICT students in years 3 and 4 to have a way to select their branch, so that the system works correctly for all students, not just new registrations.

#### Acceptance Criteria

1. WHEN the branch feature is deployed, THE System SHALL identify all existing ICT_Students with current_year equal to 3 or 4 and branch equal to NULL
2. WHEN an existing ICT_Student with NULL branch logs in, THE System SHALL display a mandatory branch selection prompt before allowing access to other features
3. WHEN an existing ICT_Student selects their branch through the prompt, THE System SHALL update their Student record with the selected branch
4. WHEN an existing ICT_Student attempts to bypass the branch selection prompt, THE System SHALL prevent access to course enrollment and grade viewing features
5. THE System SHALL provide an administrative interface for bulk branch assignment in case manual intervention is needed

### Requirement 10: Grade Workflow Integrity with Branch

**User Story:** As a system architect, I want the grade workflow to maintain referential integrity with branch assignments, so that grades are always linked to the correct student-course-branch combination.

#### Acceptance Criteria

1. WHEN a Professor submits a Grade for a Branch_Specific_Course, THE System SHALL verify the student's branch matches the course branch before creating the grade record
2. WHEN a Grade is created, THE System SHALL store the student's current branch value at the time of grade creation for historical accuracy
3. WHEN a Student changes their branch (if allowed), THE System SHALL NOT modify existing Grade records to preserve historical data
4. WHEN an Administrator publishes grades for a Branch_Specific_Course, THE System SHALL verify all grades belong to students with matching branch values
5. FOR ALL grade operations (create, update, publish), the system SHALL enforce branch consistency to prevent data corruption

### Requirement 11: Results Publishing Workflow Validation

**User Story:** As an administrator, I want the system to validate grade status before publishing, so that only properly approved grades become visible to students.

#### Acceptance Criteria

1. WHEN an Administrator attempts to publish grades, THE System SHALL verify all selected grades have status equal to "approved"
2. WHEN the publish operation encounters a grade with status "draft" or "pending_admin_approval", THE System SHALL exclude that grade from publishing and log a warning
3. WHEN all grades in a publish request are excluded due to invalid status, THE System SHALL return an error "No approved grades found for publishing"
4. WHEN a publish operation completes successfully, THE System SHALL return a detailed response including the count of published grades and any excluded grades
5. THE System SHALL create an audit log entry for each publish operation recording the administrator ID, timestamp, course IDs, and count of published grades

### Requirement 12: Branch Selection UI Components

**User Story:** As a frontend developer, I want reusable branch selection components, so that branch selection is consistent across registration, admin interfaces, and student profiles.

#### Acceptance Criteria

1. THE System SHALL provide a BranchSelector component that displays "Software" and "Network" options in Arabic and English
2. WHEN the BranchSelector is rendered, THE component SHALL display "البرمجيات (Software)" and "الشبكات (Network)" as selectable options
3. WHEN a user selects a branch option, THE BranchSelector SHALL emit the selected value ("Software" or "Network") to the parent component
4. THE BranchSelector SHALL support a required prop that displays a validation error when no selection is made
5. THE BranchSelector SHALL support a disabled prop that prevents interaction when branch cannot be changed

### Requirement 13: Course Management Branch Interface

**User Story:** As a curriculum administrator, I want to assign branches to courses through the admin interface, so that I can configure which courses are available to which branch students.

#### Acceptance Criteria

1. WHEN an Administrator creates or edits a Course for ICT specialty, THE System SHALL display a branch assignment field with options "Software", "Network", "Both", and "None"
2. WHEN an Administrator selects "Software" for a course branch, THE System SHALL save the course with branch value "Software"
3. WHEN an Administrator selects "Network" for a course branch, THE System SHALL save the course with branch value "Network"
4. WHEN an Administrator selects "Both" or "None" for a course branch, THE System SHALL save the course with branch value "Both" or NULL respectively
5. WHEN an Administrator views the course list, THE System SHALL display the branch assignment for each ICT course in a dedicated column

### Requirement 14: Results Publishing Performance

**User Story:** As an administrator publishing results for large course enrollments, I want the publishing operation to complete quickly, so that I can efficiently manage results for multiple courses.

#### Acceptance Criteria

1. WHEN an Administrator publishes grades for a single course with up to 100 students, THE System SHALL complete the operation within 2 seconds
2. WHEN an Administrator publishes grades for multiple courses totaling up to 500 grades, THE System SHALL complete the operation within 5 seconds
3. WHEN a publish operation is in progress, THE System SHALL display a loading indicator with progress information
4. WHEN a publish operation completes, THE System SHALL refresh the grade statistics without requiring a full page reload
5. THE System SHALL use database transactions to ensure all grades in a publish operation are updated atomically

### Requirement 15: Branch Validation and Error Handling

**User Story:** As a system user, I want clear error messages when branch-related operations fail, so that I can understand and correct the issue.

#### Acceptance Criteria

1. WHEN a Student attempts to enroll in a Branch_Specific_Course that doesn't match their branch, THE System SHALL return an error "هذه المادة متاحة فقط لطلاب فرع [Branch Name]"
2. WHEN a Professor attempts to assign a grade to a student for a mismatched branch course, THE System SHALL return an error "الطالب غير مسجل في فرع هذه المادة"
3. WHEN an Administrator attempts to publish grades without selecting any courses or filters, THE System SHALL return an error "يرجى تحديد المواد أو معايير التصفية"
4. WHEN a branch selection validation fails, THE System SHALL display the error message in both Arabic and English
5. FOR ALL branch-related errors, the system SHALL log the error details including user ID, attempted operation, and validation failure reason

## Correctness Properties

### Property 1: Branch Consistency Invariant
FOR ALL ICT_Students with current_year ≥ 3, after registration completion, the student record SHALL have a non-null branch value, AND for all students with current_year < 3 OR non-ICT specialty, the branch value SHALL be NULL.

**Test Strategy:** Property-based test generating random student records with varying specialties and years, verifying branch field matches the invariant after registration.

### Property 2: Course Visibility Metamorphic Property
FOR ALL ICT_Students S1 and S2 where S1.branch = "Software" AND S2.branch = "Network", the intersection of their visible Branch_Specific_Courses SHALL be empty (no course appears in both lists).

**Test Strategy:** Property-based test generating pairs of students with different branches, verifying course lists have no overlap for branch-specific courses.

### Property 3: Grade Publishing Idempotence
FOR ALL publish operations P with the same course_ids, executing P twice SHALL produce the same final state (grades published, same published_at timestamp preserved from first execution).

**Test Strategy:** Property-based test executing publish operations multiple times with same parameters, verifying second execution doesn't modify already-published grades.

### Property 4: Grade Workflow State Machine
FOR ALL Grade records, the status transitions SHALL follow the valid path: draft → pending_admin_approval → approved, AND is_published SHALL only be true when status = "approved".

**Test Strategy:** Property-based test generating random grade state transitions, verifying invalid transitions are rejected and published flag only set when approved.

### Property 5: Branch-Course Enrollment Invariant
FOR ALL Enrollments E where E.course.branch IS NOT NULL AND E.course.branch ≠ "Both", the enrolled student's branch SHALL equal the course branch.

**Test Strategy:** Property-based test generating random enrollments, verifying branch mismatch enrollments are rejected by the system.

### Property 6: Results Publishing Atomicity
FOR ALL publish operations that update N grades, either ALL N grades SHALL be published (is_published = true) OR NONE SHALL be published (transaction rollback).

**Test Strategy:** Property-based test simulating publish operations with injected failures, verifying partial updates never occur.

### Property 7: Student Grade Visibility Boundary
FOR ALL Students S, the set of grades returned by the student grades endpoint SHALL contain ONLY grades where student_id = S.id AND is_published = true AND (course.branch IS NULL OR course.branch = "Both" OR course.branch = S.branch).

**Test Strategy:** Property-based test generating random student-grade combinations, verifying students never see unpublished grades or grades from mismatched branches.

### Property 8: Admin Dashboard Statistics Consistency
FOR ALL specialty-year-semester combinations, the sum of (published_grades + unpublished_approved_grades) displayed in Admin_Dashboard SHALL equal the total count of grades with status = "approved" for that combination.

**Test Strategy:** Property-based test generating random grade datasets, verifying dashboard statistics match direct database queries.

### Property 9: Branch Selection Requirement Enforcement
FOR ALL registration attempts by ICT_Students with current_year ∈ {3, 4}, the registration SHALL fail IF branch field is NULL OR empty, AND SHALL succeed IF branch ∈ {"Software", "Network"}.

**Test Strategy:** Property-based test generating registration payloads with various branch values, verifying validation rules are enforced correctly.

### Property 10: Historical Branch Data Preservation
FOR ALL Grade records G created at time T with student branch B, IF the student's branch changes to B' at time T' > T, THEN G.student.branch SHALL remain B (historical value preserved).

**Test Strategy:** Property-based test creating grades, modifying student branches, verifying grade records maintain original branch context.

## Notes

- All user-facing text should be bilingual (Arabic/English) for consistency with existing system
- Branch field should use ENUM type in database for data integrity
- Consider adding branch field to Grade model for historical tracking if students can change branches
- Results publishing should use database transactions to ensure atomicity
- Admin interface should show clear visual distinction between Software and Network branch courses
- Consider adding branch filter to professor's grade entry interface for clarity
- Migration script needed for existing students to select branch on first login after deployment
- API endpoints should validate branch consistency before allowing grade operations
- Consider adding branch to QR code data for student verification purposes
