# Bugfix Requirements Document

## Introduction

When an admin attempts to assign a course to a professor from the admin dashboard, the API request fails with a 404 "endpoint not found" error. This prevents course assignments from being created, blocking a critical administrative function. The root cause is an endpoint path mismatch between the frontend API service (`apiService.js`) and the backend route definition (`extendedAdminRoutes.js`).

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN an admin calls `professorsAPI.assignCourses(professorId, courseIds)` from the frontend THEN the system sends a POST request to `/admin/professors/:id/assign-courses`

1.2 WHEN the backend receives a POST request to `/admin/professors/:id/assign-courses` THEN the system returns a 404 "endpoint not found" error because no route matches this path

1.3 WHEN the 404 error is returned THEN the system fails to create the professor-course assignment and displays an error to the admin

### Expected Behavior (Correct)

2.1 WHEN an admin calls `professorsAPI.assignCourses(professorId, courseIds)` from the frontend THEN the system SHALL send a POST request to `/admin/professors/:id/courses` matching the backend route

2.2 WHEN the backend receives a POST request to `/admin/professors/:id/courses` with valid data THEN the system SHALL successfully process the request and create the professor-course assignment

2.3 WHEN the assignment is created successfully THEN the system SHALL return a success response to the frontend without any 404 errors

### Unchanged Behavior (Regression Prevention)

3.1 WHEN an admin retrieves professor details including assigned courses THEN the system SHALL CONTINUE TO return the correct professor data with course assignments

3.2 WHEN an admin removes a course assignment using `DELETE /admin/professor-courses/:assignmentId` THEN the system SHALL CONTINUE TO successfully delete the assignment

3.3 WHEN an admin performs other professor management operations (create, update, delete, list) THEN the system SHALL CONTINUE TO function correctly without any impact

3.4 WHEN the backend validates course assignment data using `validateCoursAssignment` middleware THEN the system SHALL CONTINUE TO enforce the same validation rules

3.5 WHEN other API endpoints in `apiService.js` are called THEN the system SHALL CONTINUE TO function correctly without any impact
