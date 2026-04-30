# Bugfix Requirements Document

## Introduction

هذا الإصلاح يعالج مجموعة من المشاكل الحرجة في صفحات إدارة الطلاب والدكاترة والكورسات في لوحة التحكم. المشاكل تشمل استخدام API endpoints خاطئة، عدم عرض التخصصات بالعربي، ومشاكل في styling الـ modals التي لا تتناسق مع الثيم الداكن للنظام.

التأثير: هذه المشاكل تمنع المسؤولين من إدارة البيانات بشكل صحيح وتؤدي إلى تجربة مستخدم سيئة بسبب الأخطاء المتكررة والتصميم غير المتناسق.

## Bug Analysis

### Current Behavior (Defect)

#### 1. API Endpoints Issues

1.1 WHEN opening StudentsManagement page THEN the system calls `/admin/specialties` endpoint which returns 404 error instead of the correct `/specialties` endpoint

1.2 WHEN fetching specialties in StudentsManagement THEN the system shows "Failed to fetch specialties" error in console

1.3 WHEN loading approved students THEN the system fails to display them in the students list

1.4 WHEN using CoursesPage THEN the system uses axios directly without importing the `api` instance for some API calls

1.5 WHEN using ProfessorsPage THEN the system uses axios directly instead of the unified `api` instance for some operations

#### 2. Specialty Display Issues

1.6 WHEN displaying specialties in dropdowns and tables THEN the system shows English `name` field instead of Arabic `arabic_name` field

1.7 WHEN filtering by specialty THEN the system displays specialty codes or English names instead of Arabic names

#### 3. Modal Styling Issues

1.8 WHEN opening modals in StudentsManagement, CoursesPage, or ProfessorsPage THEN the system displays modals with white/light backgrounds that clash with the dark theme

1.9 WHEN viewing notifications in ProfessorsPage THEN the system uses inline styles with light colors (#ffebee, #e8f5e9) instead of dark theme colors

1.10 WHEN opening course assignment modal in ProfessorsPage THEN the system uses inline styles instead of CSS modules

1.11 WHEN interacting with modal inputs THEN the system shows light-colored inputs that don't match the dark glass theme

### Expected Behavior (Correct)

#### 1. API Endpoints Fixes

2.1 WHEN opening StudentsManagement page THEN the system SHALL call `/specialties` endpoint (without `/admin` prefix) to fetch specialties successfully

2.2 WHEN fetching specialties THEN the system SHALL load and display them without console errors

2.3 WHEN loading students THEN the system SHALL display all approved students correctly in the list

2.4 WHEN making API calls in CoursesPage THEN the system SHALL use the imported `api` instance consistently for all API operations

2.5 WHEN making API calls in ProfessorsPage THEN the system SHALL use the imported `api` instance consistently instead of axios

#### 2. Specialty Display Fixes

2.6 WHEN displaying specialties in any dropdown or table THEN the system SHALL show `arabic_name` field as the primary display value

2.7 WHEN filtering by specialty THEN the system SHALL display Arabic specialty names (`arabic_name`) to users

#### 3. Modal Styling Fixes

2.8 WHEN opening any modal THEN the system SHALL display it with dark glass theme styling matching the admin dashboard aesthetic (rgba(17, 1, 23, 0.92) background with purple borders)

2.9 WHEN showing notifications THEN the system SHALL use dark theme colors with proper transparency and backdrop blur effects

2.10 WHEN opening course assignment modal THEN the system SHALL use CSS module classes instead of inline styles

2.11 WHEN interacting with modal inputs THEN the system SHALL display dark-themed inputs with purple accent colors matching the overall theme

### Unchanged Behavior (Regression Prevention)

#### 1. Existing Functionality Preservation

3.1 WHEN creating, editing, or deleting students THEN the system SHALL CONTINUE TO perform these operations successfully

3.2 WHEN creating, editing, or deleting courses THEN the system SHALL CONTINUE TO perform these operations successfully

3.3 WHEN creating, editing, or deleting professors THEN the system SHALL CONTINUE TO perform these operations successfully

3.4 WHEN assigning courses to professors THEN the system SHALL CONTINUE TO create assignments with correct academic_year_id and semester_id

3.5 WHEN promoting students (semester, year, graduate) THEN the system SHALL CONTINUE TO execute promotions correctly

#### 2. Data Integrity Preservation

3.6 WHEN filtering students by specialty, year, or status THEN the system SHALL CONTINUE TO apply filters correctly

3.7 WHEN searching for students by code, national_id, or name THEN the system SHALL CONTINUE TO return accurate results

3.8 WHEN displaying course details THEN the system SHALL CONTINUE TO show correct academic year and semester information

#### 3. UI/UX Preservation

3.9 WHEN using the admin dashboard THEN the system SHALL CONTINUE TO maintain the dark purple/gold theme consistently

3.10 WHEN navigating between admin pages THEN the system SHALL CONTINUE TO preserve the layout and navigation structure

3.11 WHEN viewing tables THEN the system SHALL CONTINUE TO display data in the existing table format with proper RTL support

3.12 WHEN closing modals THEN the system SHALL CONTINUE TO properly clean up state and reset forms
