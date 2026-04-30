# Manual Testing Checklist

## Overview
This checklist helps verify that the professor grades course-student linking fix works correctly in the local environment.

## Prerequisites
- ✅ Backend server running (`npm run dev` in server folder)
- ✅ Frontend server running (`npm run dev` in client/frontend folder)
- ✅ Database populated with test data (specialties, academic years, semesters, courses, students)

---

## Test 1: Admin Courses - Semester Field

### Steps
1. Login as admin user
2. Navigate to `/admin/courses`
3. Click "Add New Course" button

### Verify
- [ ] Semester dropdown appears in the form
- [ ] Semester dropdown is populated with semesters
- [ ] Semester dropdown filters by selected academic year
- [ ] Form validation requires semester selection
- [ ] Course saves successfully with semester

### Expected Result
✅ Semester field is visible, functional, and required

---

## Test 2: Admin Courses - Semester Display

### Steps
1. Stay on `/admin/courses` page
2. Look at the courses table

### Verify
- [ ] "Semester" column appears in the table
- [ ] Each course shows its semester name (Arabic)
- [ ] Semester names are correct (Fall/Spring/Summer)

### Expected Result
✅ Semester information is displayed for all courses

---

## Test 3: Admin Courses - Semester Filter

### Steps
1. Stay on `/admin/courses` page
2. Use the semester filter dropdown
3. Select "Fall" semester
4. Select "Spring" semester
5. Select "All Semesters"

### Verify
- [ ] Filter dropdown works
- [ ] Only Fall courses show when Fall is selected
- [ ] Only Spring courses show when Spring is selected
- [ ] All courses show when "All" is selected

### Expected Result
✅ Semester filtering works correctly

---

## Test 4: Professor Grades - Semester Filter

### Steps
1. Login as professor user
2. Navigate to `/professor/grades`
3. Look for semester filter dropdown

### Verify
- [ ] Semester filter dropdown appears
- [ ] Dropdown is populated with semesters
- [ ] Can select different semesters
- [ ] Course list updates when semester changes

### Expected Result
✅ Semester filter is present and functional

---

## Test 5: Professor Grades - Students Appear

### Setup
Create test data:
- 1 specialty (e.g., "Computer Science")
- 1 academic year (e.g., Year 1)
- 1 semester (e.g., "Fall")
- 1 course (specialty: CS, year: 1, semester: Fall)
- 3 students (specialty: CS, current_year: 1)
- Assign professor to the course

### Steps
1. Login as professor
2. Navigate to `/professor/grades`
3. Select the semester (Fall)
4. Select the course

### Verify
- [ ] All 3 students appear in the table
- [ ] Student names are correct
- [ ] Student codes are correct
- [ ] Specialty is shown correctly
- [ ] Current year is shown correctly

### Expected Result
✅ All students in matching specialty + year appear

---

## Test 6: Professor Grades - Students Don't Cross-Contaminate

### Setup
Create additional test data:
- 2 students in same specialty but Year 2
- 2 students in different specialty but Year 1

### Steps
1. Stay on professor grades page
2. Keep the same course selected (CS, Year 1, Fall)

### Verify
- [ ] Students from Year 2 do NOT appear
- [ ] Students from different specialty do NOT appear
- [ ] Only Year 1 CS students appear

### Expected Result
✅ Only students matching specialty + year appear

---

## Test 7: Professor Grades - Students Without Grades

### Setup
- Ensure some students have no grades yet

### Steps
1. Stay on professor grades page
2. Look at the student list

### Verify
- [ ] Students without grades still appear in the list
- [ ] Grade fields are empty for students without grades
- [ ] Can enter grades for students without existing grades

### Expected Result
✅ Students without grades are included (LEFT JOIN works)

---

## Test 8: Professor Grades - Grade Calculation

### Steps
1. Stay on professor grades page
2. For one student, enter:
   - Assignment 1: P
   - Assignment 2: M
   - Final Exam: 120
3. Save the grade

### Verify
- [ ] Assignment 1 score calculated correctly (30.00)
- [ ] Assignment 2 score calculated correctly (21.00)
- [ ] Total score calculated correctly (171.00)
- [ ] Percentage calculated correctly (~81.43%)
- [ ] Final result/letter grade assigned correctly

### Expected Result
✅ Grade calculations work correctly (Grade Settings preserved)

---

## Test 9: Professor Grades - Design Consistency

### Steps
1. Stay on professor grades page
2. Compare with admin dashboard pages

### Verify
- [ ] Colors match admin dashboard
- [ ] Card styling matches admin dashboard
- [ ] Table styling matches admin dashboard
- [ ] Button styling matches admin dashboard
- [ ] Overall look and feel is consistent

### Expected Result
✅ Design is consistent with admin dashboard

---

## Test 10: Professor Grades - Authorization

### Setup
- Create a second professor
- Do NOT assign second professor to the test course

### Steps
1. Login as second professor
2. Try to access the course (manually or via API)

### Verify
- [ ] Second professor cannot see the course in their list
- [ ] If accessing via API, receives 403 Forbidden error
- [ ] Error message is clear and in Arabic

### Expected Result
✅ Authorization works - professors can only access assigned courses

---

## Test 11: Cross-Semester Isolation

### Setup
- Create a second course in Spring semester (same specialty, same year)
- Create 2 new students for Spring

### Steps
1. Login as professor
2. Select Fall semester
3. Select Fall course
4. Note which students appear
5. Select Spring semester
6. Select Spring course
7. Note which students appear

### Verify
- [ ] Fall course shows Fall students only
- [ ] Spring course shows Spring students only
- [ ] No cross-contamination between semesters

### Expected Result
✅ Semester isolation works correctly

---

## Test 12: Console Errors

### Steps
1. Open browser developer tools (F12)
2. Go to Console tab
3. Navigate through all pages tested above

### Verify
- [ ] No JavaScript errors in console
- [ ] No failed API requests (check Network tab)
- [ ] No React warnings

### Expected Result
✅ No console errors or warnings

---

## Test 13: Responsive Design

### Steps
1. Stay on professor grades page
2. Resize browser window to mobile size
3. Resize to tablet size
4. Resize back to desktop

### Verify
- [ ] Layout adapts to different screen sizes
- [ ] All elements remain accessible
- [ ] No horizontal scrolling issues
- [ ] Buttons and inputs remain usable

### Expected Result
✅ Responsive design works on all screen sizes

---

## Test 14: Data Persistence

### Steps
1. Enter grades for a student
2. Save the grades
3. Refresh the page
4. Select the same course again

### Verify
- [ ] Grades are still there after refresh
- [ ] All calculated values are correct
- [ ] Status is correct (draft/submitted)

### Expected Result
✅ Data persists correctly

---

## Test 15: Filter Combinations

### Steps
1. On admin courses page, try different filter combinations:
   - Specialty + Semester
   - Academic Year + Semester
   - Specialty + Academic Year + Semester

### Verify
- [ ] All filter combinations work
- [ ] Results are correct for each combination
- [ ] Filters can be cleared

### Expected Result
✅ All filter combinations work correctly

---

## Summary

### Critical Tests (Must Pass)
- [ ] Test 5: Students appear correctly
- [ ] Test 6: No cross-contamination
- [ ] Test 8: Grade calculations work
- [ ] Test 10: Authorization works

### Important Tests (Should Pass)
- [ ] Test 1-4: Semester field functionality
- [ ] Test 7: LEFT JOIN works
- [ ] Test 11: Semester isolation
- [ ] Test 12: No console errors

### Nice-to-Have Tests (Good to Pass)
- [ ] Test 9: Design consistency
- [ ] Test 13: Responsive design
- [ ] Test 14: Data persistence
- [ ] Test 15: Filter combinations

---

## Issue Reporting

If any test fails, document:
1. Test number and name
2. Steps to reproduce
3. Expected result
4. Actual result
5. Screenshots (if applicable)
6. Browser and version
7. Console errors (if any)

---

## Sign-Off

**Tester Name:** ___________________________

**Date:** ___________________________

**Overall Result:** ⬜ PASS  ⬜ FAIL  ⬜ PASS WITH ISSUES

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________
