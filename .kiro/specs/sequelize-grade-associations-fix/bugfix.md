# Bugfix Requirements Document

## Introduction

The professor grades functionality is completely broken due to missing Sequelize model associations. Multiple API endpoints are failing with `EagerLoadingError` messages indicating that required associations between models (Grade-Student, ProfessorCourse-Course, ActivityLog entity field) are not properly defined. This prevents professors from viewing courses, submitting grades, or viewing student data, effectively disabling the entire grade management system.

The bug affects three critical areas:
1. Grade queries attempting to include Student data fail because Grade model lacks association to Student
2. ProfessorCourse queries attempting to include Course data fail because ProfessorCourse model lacks association to Course
3. Activity logging fails with validation errors because the `entity` field is defined as non-nullable but the code uses `entity_type` parameter

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the system executes `Grade.findAll()` or `Grade.findByPk()` with `include: [{ model: Student }]` THEN the system throws `EagerLoadingError: Student is not associated to Grade!`

1.2 WHEN the system executes `ProfessorCourse.findAll()` with `include: [{ model: Course }]` THEN the system throws `EagerLoadingError: Course is not associated to ProfessorCourse!`

1.3 WHEN the system calls `logActivity(userId, action, entity_type, entity_id, description)` THEN the system throws `ValidationError: ActivityLog.entity cannot be null` because the function parameter is named `entity_type` but the model field is named `entity`

1.4 WHEN professors access GET /api/grades/professor THEN the system returns 500 error due to missing Grade-Student association

1.5 WHEN professors access GET /api/grades/professor/courses THEN the system returns 500 error due to missing ProfessorCourse-Course association

1.6 WHEN professors submit grades via POST /api/grades THEN the system returns 500 error when attempting to fetch updated grade with Student association

1.7 WHEN any grade-related operation attempts to log activity THEN the system fails to create activity log due to entity field validation error

### Expected Behavior (Correct)

2.1 WHEN the system executes `Grade.findAll()` or `Grade.findByPk()` with `include: [{ model: Student }]` THEN the system SHALL successfully load Grade records with associated Student data

2.2 WHEN the system executes `ProfessorCourse.findAll()` with `include: [{ model: Course }]` THEN the system SHALL successfully load ProfessorCourse records with associated Course data

2.3 WHEN the system calls `logActivity(userId, action, entity_type, entity_id, description)` THEN the system SHALL successfully create an ActivityLog record with the entity field populated from the entity_type parameter

2.4 WHEN professors access GET /api/grades/professor THEN the system SHALL return 200 status with grades including student information (student_code, full_name, email)

2.5 WHEN professors access GET /api/grades/professor/courses THEN the system SHALL return 200 status with professor courses including course details (course_code, course_name, arabic_name, credit_hours)

2.6 WHEN professors submit grades via POST /api/grades THEN the system SHALL return 200 status with the created/updated grade including student and course information

2.7 WHEN any grade-related operation attempts to log activity THEN the system SHALL successfully create an activity log entry without validation errors

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the system queries Grade records without includes THEN the system SHALL CONTINUE TO return grade data successfully

3.2 WHEN the system queries ProfessorCourse records without includes THEN the system SHALL CONTINUE TO return professor course assignments successfully

3.3 WHEN the system creates ActivityLog records with all correct field names THEN the system SHALL CONTINUE TO log activities successfully

3.4 WHEN the system queries other model associations (Course-Specialty, Course-AcademicYear, Course-Semester, Student-User) THEN the system SHALL CONTINUE TO work as expected

3.5 WHEN the system performs grade calculations in the beforeSave hook THEN the system SHALL CONTINUE TO calculate totals, percentages, and grade points correctly

3.6 WHEN the system validates grade data (P/M/D values, score ranges) THEN the system SHALL CONTINUE TO enforce validation rules correctly

3.7 WHEN the system checks professor permissions for course access THEN the system SHALL CONTINUE TO verify authorization correctly
