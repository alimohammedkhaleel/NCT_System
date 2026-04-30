# Implementation Plan: ICT Branch Support and Results Publishing System

## Overview

This implementation plan breaks down the ICT branch selection and results publishing system into discrete, actionable coding tasks. The implementation follows a phased approach: database migrations → backend API → frontend components → integration and testing.

**Critical Data Integrity Requirement**: Ensure that grades added by professors are the exact grades displayed by admins and published to students—no data loss or transformation throughout the workflow.

## Tasks

- [-] 1. Database Schema Migrations
  - [x] 1.1 Create migration to add branch field to students table
    - Add ENUM column `branch` with values ('Software', 'Network')
    - Set allowNull to true
    - Add index on `branch` field
    - Add composite index on `(specialty_id, current_year, branch)`
    - _Requirements: 2.1, 2.4_
  
  - [x] 1.2 Create migration to add branch field to courses table
    - Add ENUM column `branch` with values ('Software', 'Network', 'Both')
    - Set allowNull to true
    - Add index on `branch` field
    - Add composite index on `(specialty_id, academic_year_id, branch)`
    - _Requirements: 3.1_
  
  - [x] 1.3 Create migration to add student_branch_at_creation field to grades table
    - Add ENUM column `student_branch_at_creation` with values ('Software', 'Network')
    - Set allowNull to true for historical data
    - Add index on `student_branch_at_creation` field
    - _Requirements: 10.2_

- [x] 2. Update Sequelize Models
  - [x] 2.1 Update Student model with branch field
    - Add `branch` field definition with ENUM type
    - Add index configuration
    - Update model associations if needed
    - _Requirements: 2.1, 2.2_
  
  - [x] 2.2 Update Course model with branch field
    - Add `branch` field definition with ENUM type
    - Add index configuration
    - Update model associations if needed
    - _Requirements: 3.1_
  
  - [x] 2.3 Update Grade model with student_branch_at_creation field
    - Add `student_branch_at_creation` field definition
    - Add beforeSave hook to capture student branch at grade creation
    - Ensure hook queries student record and stores branch value
    - _Requirements: 10.2, 10.3_

- [x] 3. Backend: Registration Endpoint Enhancement
  - [x] 3.1 Add branch validation logic to registration endpoint
    - Query specialty by specialty_id to check if ICT
    - Implement logic: if ICT AND current_year >= 3, require branch
    - Validate branch value is in ['Software', 'Network'] when required
    - Return 400 error with bilingual message if validation fails
    - _Requirements: 1.2, 2.2, 9.3_
  
  - [ ]* 3.2 Write unit tests for registration branch validation
    - Test ICT year 3 student without branch (should fail)
    - Test ICT year 4 student with valid branch (should succeed)
    - Test ICT year 1 student without branch (should succeed)
    - Test non-ICT student without branch (should succeed)
    - Test invalid branch value (should fail)
    - _Requirements: 1.2, 2.2_
  
  - [ ]* 3.3 Write property test for branch validation
    - **Property 1: Branch field visibility rule**
    - **Validates: Requirements 1.1, 1.3, 1.4**
    - Generate random student data with varying specialties and years
    - Verify branch field requirement matches ICT && year >= 3 rule

- [x] 4. Backend: Student Branch Update Endpoint
  - [x] 4.1 Create PUT /api/student/branch endpoint
    - Extract branch from request body
    - Validate branch value is 'Software' or 'Network'
    - Get student record with specialty
    - Verify student is ICT and year >= 3
    - Update student branch field
    - Return success response with updated data
    - _Requirements: 9.2, 9.3_
  
  - [x] 4.2 Add route to studentRoutes.js
    - Add PUT route with authentication middleware
    - Map to updateStudentBranch controller function
    - _Requirements: 9.2_
  
  - [ ]* 4.3 Write unit tests for branch update endpoint
    - Test valid branch update for ICT year 3 student
    - Test invalid branch value rejection
    - Test non-ICT student rejection
    - Test year 1-2 student rejection
    - _Requirements: 9.2, 9.3_

- [x] 5. Backend: Course Filtering by Branch
  - [x] 5.1 Update GET /api/student/courses endpoint with branch filtering
    - Query student with specialty to get student branch
    - Build base where clause for courses
    - After fetching courses, filter by branch logic:
      - If student.branch is null, return all courses
      - If student.branch exists, include courses where branch is null, 'Both', or matches student.branch
    - Add is_branch_specific flag to response
    - _Requirements: 3.5, 4.1, 4.2, 4.3_
  
  - [ ]* 5.2 Write unit tests for course filtering
    - Test Software branch student sees Software and Both courses
    - Test Network branch student sees Network and Both courses
    - Test student without branch sees all courses
    - Test branch-specific courses are flagged correctly
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 5.3 Write property test for course visibility filtering
    - **Property 4: Course visibility filtering by branch**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.5, 7.3, 8.3**
    - Generate random student-course combinations with various branch values
    - Verify visibility rules: matching branch, null, 'Both' are visible

- [x] 6. Backend: Publish Results Endpoint Fix
  - [x] 6.1 Update POST /api/admin/publish-results endpoint
    - Accept request body with `course_ids` array and optional `filters` object
    - Validate that either course_ids or filters are provided (return 400 if both empty)
    - Build where clause: status='approved', is_published=false
    - If course_ids provided, add course_id IN clause
    - If filters provided, query students by specialty_id and add student_id IN clause
    - Query grades to publish with Course and Student includes
    - Update grades in transaction: set is_published=true, published_at=now, published_by=admin_id
    - Calculate unique student count
    - Group results by course for response
    - Commit transaction and return success response
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3_
  
  - [ ]* 6.2 Write unit tests for publish results endpoint
    - Test publishing with valid course_ids
    - Test publishing with filters (specialty, year, semester)
    - Test error when no course_ids or filters provided
    - Test error when no approved grades found
    - Test transaction rollback on error
    - _Requirements: 5.3, 5.4, 5.5, 6.2, 6.4_
  
  - [ ]* 6.3 Write property test for publish operation atomicity
    - **Property 6: Publish operation atomicity**
    - **Validates: Requirements 5.3, 5.4, 6.2**
    - Generate random course_ids arrays
    - Verify all approved grades published OR none published (transaction atomicity)
  
  - [ ]* 6.4 Write property test for grade count accuracy
    - **Property 5: Grade count accuracy**
    - **Validates: Requirements 5.2, 7.4**
    - Generate random course sets and filters
    - Verify displayed count matches database query count

- [x] 7. Backend: Get Courses with Grade Stats Endpoint
  - [x] 7.1 Create GET /api/admin/courses/with-stats endpoint
    - Accept query parameters: specialty_id, academic_year_id, semester_id (all optional)
    - Build where clause for courses with is_active=true
    - Query courses with Specialty, AcademicYear, Semester includes
    - For each course, query grade counts: total, approved, published, unpublished_approved
    - Return courses array with grade_stats object for each course
    - _Requirements: 5.2, 7.1, 7.4_
  
  - [x] 7.2 Add route to adminRoutes.js
    - Add GET route with admin authentication middleware
    - Map to getCoursesWithStats controller function
    - _Requirements: 5.1, 7.1_
  
  - [ ]* 7.3 Write unit tests for courses with stats endpoint
    - Test filtering by specialty
    - Test filtering by academic year and semester
    - Test grade stats calculation accuracy
    - Test response format includes all required fields
    - _Requirements: 5.2, 7.1, 7.4_

- [x] 8. Backend: Branch Consistency Validation
  - [x] 8.1 Add branch validation to grade creation logic
    - In professor grade submission, check if course has branch
    - If course.branch is not null and not 'Both', verify student.branch matches course.branch
    - Return 400 error with bilingual message if mismatch
    - Log validation failure with details
    - _Requirements: 10.1, 10.4, 15.2, 15.5_
  
  - [ ]* 8.2 Write unit tests for grade creation branch validation
    - Test grade creation succeeds when branches match
    - Test grade creation fails when branches mismatch
    - Test grade creation succeeds for 'Both' branch courses
    - Test grade creation succeeds for null branch courses
    - _Requirements: 10.1, 10.4_
  
  - [ ]* 8.3 Write property test for branch consistency validation
    - **Property 9: Branch consistency validation**
    - **Validates: Requirements 10.1, 10.4, 15.1, 15.2**
    - Generate random student-course pairs with various branch combinations
    - Verify operations fail when branches mismatch, succeed when they match

- [x] 9. Backend: Student Grade Visibility Enforcement
  - [x] 9.1 Update GET /api/student/grades endpoint
    - Ensure where clause includes: student_id=current_user.student_id AND is_published=true
    - Add branch verification: if course has branch, verify it matches student branch
    - Return only grades meeting all visibility criteria
    - _Requirements: 8.1, 8.5_
  
  - [ ]* 9.2 Write unit tests for student grade visibility
    - Test student only sees their own grades
    - Test student only sees published grades
    - Test student doesn't see unpublished grades
    - Test student doesn't see other students' grades
    - _Requirements: 8.1, 8.5_
  
  - [ ]* 9.3 Write property test for student grade visibility boundary
    - **Property 8: Student grade visibility boundary**
    - **Validates: Requirements 8.1, 8.5**
    - Generate random student-grade combinations
    - Verify students never see unpublished or other students' grades

- [ ] 10. Backend: Audit Logging and Error Handling
  - [x] 10.1 Add audit logging for publish operations
    - Create log entry after successful publish with admin_id, timestamp, course_ids, count
    - Use existing logActivity function or create new audit log table entry
    - _Requirements: 11.5_
  
  - [x] 10.2 Add error logging for branch validation failures
    - Log branch mismatch errors with user_id, operation, details
    - Log invalid branch value errors
    - Log missing branch errors for ICT year 3-4 students
    - _Requirements: 15.5_
  
  - [ ]* 10.3 Write property test for audit logging
    - **Property 12: Audit logging for publish operations**
    - **Validates: Requirements 11.5**
    - Verify every successful publish creates audit log entry
  
  - [ ]* 10.4 Write property test for publish validation
    - **Property 11: Publish validation**
    - **Validates: Requirements 11.1, 11.2**
    - Verify only approved grades are published, others excluded with warning

- [-] 11. Checkpoint - Backend API Complete
  - Ensure all backend tests pass
  - Test API endpoints manually with Postman or similar tool
  - Verify database migrations applied correctly
  - Ask the user if questions arise

- [ ] 12. Frontend: BranchSelector Component
  - [x] 12.1 Create BranchSelector component
    - Create component file: `client/frontend/src/components/BranchSelector/BranchSelector.jsx`
    - Implement props: value, onChange, required, disabled, error
    - Create two button options: Software (البرمجيات) and Network (الشبكات)
    - Add visual styling for selected state
    - Display error message if provided
    - Display required indicator if required prop is true
    - _Requirements: 12.1, 12.2, 12.3_
  
  - [x] 12.2 Create BranchSelector CSS module
    - Create `BranchSelector.module.css`
    - Style container, label, options, selected state, error message
    - Ensure bilingual text displays correctly (Arabic + English)
    - Add hover and focus states for accessibility
    - _Requirements: 12.1, 12.2_
  
  - [ ]* 12.3 Write unit tests for BranchSelector component
    - Test component renders with both options
    - Test onChange callback fires with correct value
    - Test selected state styling
    - Test disabled state prevents interaction
    - Test error message display
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 13. Frontend: Registration Form Enhancement
  - [x] 13.1 Add branch selection to registration form
    - Import BranchSelector component
    - Add state for branch value
    - Add logic to show BranchSelector only when specialty is ICT and year >= 3
    - Pass branch value to registration API call
    - Handle validation error for missing branch
    - Display error message in bilingual format
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ]* 13.2 Write integration tests for registration with branch
    - Test ICT year 3 registration with branch succeeds
    - Test ICT year 3 registration without branch fails
    - Test non-ICT registration without branch succeeds
    - Test branch field visibility logic
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 14. Frontend: BranchSelectionModal Component
  - [x] 14.1 Create BranchSelectionModal component
    - Create component file: `client/frontend/src/components/BranchSelectionModal/BranchSelectionModal.jsx`
    - Implement props: isOpen, onSubmit, studentInfo
    - Display student name and code
    - Use BranchSelector component for branch selection
    - Add submit button that calls onSubmit with selected branch
    - Make modal non-dismissible (no close button, no backdrop click)
    - Show loading state during submission
    - _Requirements: 9.2, 9.4_
  
  - [x] 14.2 Create BranchSelectionModal CSS module
    - Style modal overlay, container, content
    - Style student info display
    - Style submit button
    - Ensure modal is centered and responsive
    - _Requirements: 9.2_
  
  - [x] 14.3 Add branch selection check to student dashboard/login flow
    - After successful login, check if student is ICT year 3-4 with null branch
    - If true, show BranchSelectionModal
    - On modal submit, call PUT /api/student/branch endpoint
    - On success, close modal and refresh student data
    - On error, display error message
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 14.4 Write integration tests for branch selection modal
    - Test modal appears for ICT year 3 student with null branch
    - Test modal doesn't appear for students with branch already set
    - Test branch update API call on submit
    - Test modal closes after successful update
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 15. Frontend: Course Display with Branch Context
  - [-] 15.1 Update student course listing to show branch information
    - Add branch badge/label to course cards for branch-specific courses
    - Display branch name in Arabic and English
    - Style branch indicator to be visually distinct
    - Filter courses based on student branch (handled by backend, verify in UI)
    - _Requirements: 4.4, 8.2_
  
  - [ ] 15.2 Update student grades display to show branch context
    - Add branch label to grade entries for branch-specific courses
    - Ensure branch information is clear and readable
    - _Requirements: 8.2, 8.3_

- [ ] 16. Frontend: Admin Course Management Enhancement
  - [ ] 16.1 Add branch field to course creation/edit form
    - Add branch selection dropdown with options: None, Software, Network, Both
    - Show branch field only for ICT specialty courses
    - Map "None" to null value for API
    - Include branch value in create/update API calls
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [ ] 16.2 Add branch column to course list table
    - Display branch value for each course
    - Show "Both" or "All" for null/Both values
    - Add filter dropdown to filter courses by branch
    - _Requirements: 13.5_
  
  - [ ]* 16.3 Write integration tests for course management with branch
    - Test creating course with branch
    - Test updating course branch
    - Test branch field visibility for ICT courses
    - Test branch display in course list
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 17. Frontend: Results Publishing Interface
  - [ ] 17.1 Create ResultsPublishing component
    - Create component file: `client/frontend/src/pages/Admin/ResultsPublishing.jsx`
    - Add state for filters (specialty_id, academic_year_id, semester_id)
    - Add state for courses list, selectedCourses, loading
    - Implement fetchCourses function to call GET /api/admin/courses/with-stats
    - Display courses grouped by specialty with branch information
    - Show unpublished_approved count for each course
    - Add checkbox for each course to select for publishing
    - Add "Select All" / "Deselect All" functionality
    - Display total count of grades to be published
    - _Requirements: 5.1, 5.2, 7.1, 7.2_
  
  - [ ] 17.2 Implement publish functionality
    - Add handlePublish function
    - Show confirmation dialog with count of grades to publish
    - Call POST /api/admin/publish-results with selectedCourses
    - Show loading state during publish operation
    - On success, show success message with published count
    - Refresh course list and statistics
    - Clear selected courses
    - On error, display error message
    - _Requirements: 5.3, 5.4, 5.5_
  
  - [ ] 17.3 Create ResultsPublishing CSS module
    - Style filters section
    - Style course list with grouping
    - Style course cards with stats
    - Style checkboxes and selection controls
    - Style publish button and confirmation dialog
    - Ensure responsive layout
    - _Requirements: 5.1, 7.1_
  
  - [ ] 17.4 Add ResultsPublishing route to admin dashboard
    - Add route in admin routing configuration
    - Add navigation link in admin sidebar/menu
    - Ensure route is protected with admin authentication
    - _Requirements: 5.1_
  
  - [ ]* 17.5 Write integration tests for results publishing interface
    - Test course list loads with correct stats
    - Test filtering by specialty, year, semester
    - Test course selection and deselection
    - Test publish operation with selected courses
    - Test success message and stats refresh
    - Test error handling for no approved grades
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 18. Frontend: Admin Dashboard Branch-Aware Display
  - [ ] 18.1 Update admin dashboard results section
    - Group results by specialty with branch sub-grouping for ICT
    - Display separate counts for Software and Network branches
    - Show branch information in course listings
    - Add branch filter to results view
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 18.2 Update grade statistics display
    - Calculate separate statistics for Software and Network branches
    - Display branch-specific published/unpublished counts
    - Ensure branch labels are clear and bilingual
    - _Requirements: 7.4_

- [ ] 19. Data Integrity Verification
  - [ ] 19.1 Add data integrity checks for grade workflow
    - Verify professor-submitted grades are stored exactly as entered
    - Verify admin-approved grades match professor-submitted grades
    - Verify published grades match approved grades (no transformation)
    - Add logging to track grade values through workflow stages
    - _Requirements: Critical user requirement - grade data integrity_
  
  - [ ] 19.2 Create data integrity verification script
    - Query grades at each workflow stage (draft, approved, published)
    - Compare grade values across stages
    - Report any discrepancies
    - Run as part of deployment verification
    - _Requirements: Critical user requirement - grade data integrity_
  
  - [ ]* 19.3 Write property test for grade workflow integrity
    - **Property: Grade values remain unchanged through workflow**
    - Generate random grade values
    - Submit as professor, approve as admin, publish as admin
    - Verify grade values identical at each stage

- [ ] 20. Checkpoint - Frontend Complete
  - Ensure all frontend components render correctly
  - Test user flows manually: registration, branch selection, course viewing, results publishing
  - Verify bilingual text displays correctly
  - Verify responsive design on mobile and desktop
  - Ask the user if questions arise

- [ ] 21. Integration and End-to-End Testing
  - [ ] 21.1 Test complete registration workflow with branch
    - Register ICT year 3 student with Software branch
    - Verify student record has correct branch
    - Login as student and verify no branch selection modal appears
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [ ] 21.2 Test existing student branch selection workflow
    - Create ICT year 3 student with null branch (simulate existing data)
    - Login as student
    - Verify branch selection modal appears
    - Select branch and submit
    - Verify modal closes and student record updated
    - Logout and login again
    - Verify modal doesn't appear
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ] 21.3 Test course visibility by branch
    - Create Software-specific, Network-specific, and Both courses
    - Login as Software branch student
    - Verify only Software and Both courses visible
    - Login as Network branch student
    - Verify only Network and Both courses visible
    - _Requirements: 3.2, 3.3, 3.4, 4.1, 4.2_
  
  - [ ] 21.4 Test complete results publishing workflow
    - Create test students in both branches with enrollments
    - Login as professor and submit grades
    - Login as admin and approve grades
    - Navigate to Results Publishing interface
    - Filter by ICT specialty
    - Verify courses show correct unpublished counts
    - Select courses and publish
    - Verify success message with correct count
    - Login as students and verify published grades visible
    - Verify unpublished grades remain hidden
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 8.1_
  
  - [ ] 21.5 Test branch mismatch validation
    - Attempt to enroll Software student in Network course (should fail)
    - Attempt to create grade for student in mismatched branch course (should fail)
    - Verify error messages are clear and bilingual
    - _Requirements: 10.1, 10.4, 15.1, 15.2_
  
  - [ ] 21.6 Test data integrity through complete workflow
    - Professor submits grade with specific values
    - Admin approves grade
    - Admin publishes grade
    - Student views grade
    - Verify grade values are identical at each stage (no transformation)
    - _Requirements: Critical user requirement - grade data integrity_
  
  - [ ]* 21.7 Write property test for historical branch preservation
    - **Property 10: Historical branch preservation**
    - **Validates: Requirements 10.2, 10.3**
    - Create grade with student having initial branch
    - Change student branch
    - Verify grade preserves original branch value

- [ ] 22. Performance Testing and Optimization
  - [ ] 22.1 Test query performance with large datasets
    - Seed database with 10,000 students and 50,000 grades
    - Test branch-filtered course queries (should complete < 100ms)
    - Test grade statistics queries (should complete < 200ms)
    - Test publish operation with 500 grades (should complete < 5 seconds)
    - Optimize queries if performance targets not met
    - _Requirements: 2.5, 14.1, 14.2_
  
  - [ ] 22.2 Test concurrent operations
    - Simulate 10 admins publishing results simultaneously
    - Simulate 100 students viewing grades simultaneously
    - Verify no race conditions or data corruption
    - Verify transaction isolation works correctly
    - _Requirements: 14.5_

- [ ] 23. Error Handling and Edge Cases
  - [ ] 23.1 Test all error scenarios
    - Test registration without branch for ICT year 3 (should show error)
    - Test publish with no courses selected (should show error)
    - Test publish with no approved grades (should show error)
    - Test branch update for non-ICT student (should show error)
    - Test invalid branch values (should show error)
    - Verify all error messages are bilingual
    - _Requirements: 15.1, 15.2, 15.3, 15.4_
  
  - [ ] 23.2 Test edge cases
    - Test student with branch viewing course with null branch
    - Test student without branch viewing all courses
    - Test course with "Both" branch visible to all students
    - Test grade creation for course with null branch
    - Test publish operation with empty result set
    - _Requirements: 3.4, 4.3, 5.5_

- [ ] 24. Documentation and Deployment Preparation
  - [ ] 24.1 Update API documentation
    - Document new branch field in Student model
    - Document new branch field in Course model
    - Document updated registration endpoint
    - Document new branch update endpoint
    - Document updated publish-results endpoint
    - Document new courses/with-stats endpoint
    - Include request/response examples
    - _Requirements: All_
  
  - [ ] 24.2 Create deployment checklist
    - List database migrations to run
    - List environment variables to set (if any)
    - List data migration steps for existing students
    - List verification steps post-deployment
    - Document rollback procedure
    - _Requirements: All_
  
  - [ ] 24.3 Create user guide for administrators
    - Document how to assign branches to courses
    - Document how to use results publishing interface
    - Document how to handle existing students without branches
    - Include screenshots and step-by-step instructions
    - _Requirements: 5.1, 9.5, 13.1_

- [ ] 25. Final Checkpoint - Complete System Verification
  - Run all unit tests and verify 100% pass rate
  - Run all property-based tests and verify no failures
  - Run all integration tests and verify complete workflows
  - Perform manual UAT with sample users (student, professor, admin)
  - Verify data integrity through complete grade workflow
  - Verify all bilingual text displays correctly
  - Verify responsive design on multiple devices
  - Review error logs for any unexpected issues
  - Confirm deployment checklist is complete
  - Ask the user if questions arise before deployment

## Notes

- **Property-Based Tests**: Tasks marked with `*` are optional and can be skipped for faster MVP. However, they provide strong correctness guarantees and are recommended for production deployment.
- **Data Integrity**: Task 19 specifically addresses the critical user requirement that grades remain unchanged throughout the workflow (professor → admin → student).
- **Bilingual Support**: All user-facing text must be in both Arabic and English for consistency with existing system.
- **Transaction Safety**: All publish operations use database transactions to ensure atomicity (all or nothing).
- **Branch Validation**: Branch consistency is enforced at multiple levels (registration, enrollment, grade creation) to prevent data corruption.
- **Historical Tracking**: The `student_branch_at_creation` field in grades preserves audit trail even if students change branches.
- **Performance**: Indexes on branch fields ensure query performance remains acceptable with large datasets.
- **Testing Strategy**: Combination of unit tests (specific examples), property tests (universal rules), and integration tests (complete workflows) ensures comprehensive coverage.

## Implementation Order Rationale

1. **Database First**: Migrations must run before any code can use new fields
2. **Backend Before Frontend**: API endpoints must exist before UI can call them
3. **Core Features Before Edge Cases**: Registration and course filtering before admin publishing
4. **Integration After Components**: Individual components tested before end-to-end workflows
5. **Performance After Functionality**: Optimize only after correctness is verified

This order minimizes rework and ensures each task builds on completed work.
