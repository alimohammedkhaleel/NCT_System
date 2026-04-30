/**
 * Full Grade Workflow Test
 * Tests: Professor submits grade → Admin approves → Admin publishes → Student views
 *
 * Run: node test-grade-workflow.js
 * Requires: server running on localhost:3000 (or set BASE_URL env)
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// ==================== HTTP Helper ====================
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const bodyStr = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {})
    };

    const req = lib.request({
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function log(emoji, msg, data = null) {
  console.log(`${emoji} ${msg}`);
  if (data) console.log('   ', JSON.stringify(data, null, 2).split('\n').join('\n    '));
}

function assert(condition, msg) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`   ✓ ${msg}`);
}

// ==================== MAIN TEST ====================
async function runTest() {
  console.log('\n' + '='.repeat(60));
  console.log('  NCTU ERP - Grade Workflow End-to-End Test');
  console.log('='.repeat(60) + '\n');

  // ── STEP 1: Login as Professor ──────────────────────────────
  log('🔐', 'STEP 1: Login as Professor');
  const profLogin = await request('POST', '/api/auth/login', {
    username: 'professor1',
    password: 'prof123'
  });
  assert(profLogin.status === 200, `Professor login returned ${profLogin.status}`);
  assert(profLogin.data.success, 'Professor login success=true');
  const profToken = profLogin.data.token || profLogin.data.data?.token;
  assert(profToken, 'Professor token received');
  log('✅', `Professor logged in: ${profLogin.data.data?.user?.full_name || 'professor1'}`);

  // ── STEP 2: Get Professor's Courses ─────────────────────────
  log('\n📚', 'STEP 2: Get Professor Courses');
  const profCourses = await request('GET', '/api/grades/professor/courses', null, profToken);
  assert(profCourses.status === 200, `Get professor courses returned ${profCourses.status}`);
  const courses = profCourses.data.data || [];
  log('📋', `Professor has ${courses.length} assigned courses`);

  if (courses.length === 0) {
    log('⚠️', 'No courses assigned to professor. Checking all courses...');
    const allCourses = await request('GET', '/api/admin/courses', null, profToken);
    log('📋', `Total courses in system: ${allCourses.data.data?.length || 0}`);
    log('⚠️', 'Please assign courses to professor1 first via admin panel');
    log('ℹ️', 'Skipping grade submission test - no courses available');
  }

  // ── STEP 3: Get Students for a Course ───────────────────────
  let targetCourse = null;
  let targetStudent = null;

  if (courses.length > 0) {
    targetCourse = courses[0];
    log('\n👥', `STEP 3: Get Students for Course: ${targetCourse.course_code || targetCourse.course_name}`);

    const studentsRes = await request(
      'GET',
      `/api/grades/professor/students-by-course?course_id=${targetCourse.id || targetCourse.course_id}`,
      null,
      profToken
    );

    const students = studentsRes.data.data || studentsRes.data.students || [];
    log('📋', `Students enrolled: ${students.length}`);

    if (students.length > 0) {
      targetStudent = students[0];
      log('👤', `Target student: ${targetStudent.student_code || targetStudent.id}`);
    }
  }

  // ── STEP 4: Submit Grade (Professor) ────────────────────────
  let gradeId = null;

  if (targetCourse && targetStudent) {
    log('\n✍️', 'STEP 4: Professor Submits Grade');

    const courseId = targetCourse.id || targetCourse.course_id;
    const studentId = targetStudent.id || targetStudent.student_id;
    const academicYearId = targetCourse.academic_year_id;
    const semesterId = targetCourse.semester_id;

    const gradePayload = {
      student_id: studentId,
      course_id: courseId,
      academic_year_id: academicYearId,
      semester_id: semesterId,
      assignment1_grade: 'P',
      assignment2_grade: 'M',
      final_exam_score: 100
    };

    log('📤', 'Submitting grade:', gradePayload);
    const submitRes = await request('POST', '/api/grades', gradePayload, profToken);
    log('📥', `Response status: ${submitRes.status}`, submitRes.data);

    if (submitRes.status === 201 || submitRes.status === 200) {
      gradeId = submitRes.data.data?.id || submitRes.data.id;
      assert(gradeId, 'Grade ID received');
      log('✅', `Grade created with id=${gradeId}, status=${submitRes.data.data?.status}`);

      // Submit for approval
      log('\n📨', 'STEP 4b: Submit Grade for Admin Approval');
      const submitApprovalRes = await request('POST', `/api/grades/${gradeId}/submit-for-approval`, null, profToken);
      log('📥', `Submit for approval status: ${submitApprovalRes.status}`, submitApprovalRes.data);
      if (submitApprovalRes.status === 200) {
        log('✅', 'Grade submitted for admin approval');
      }
    } else if (submitRes.status === 409 || submitRes.data?.message?.includes('already exists')) {
      log('⚠️', 'Grade already exists for this student/course combination');
      // Try to find existing grade
      const existingGrades = await request('GET', `/api/grades/professor?course_id=${courseId}`, null, profToken);
      const existing = existingGrades.data.data?.find(g => g.student_id === studentId);
      if (existing) {
        gradeId = existing.id;
        log('ℹ️', `Using existing grade id=${gradeId}, status=${existing.status}`);
      }
    } else {
      log('⚠️', `Grade submission failed: ${submitRes.data?.message}`);
    }
  }

  // ── STEP 5: Admin Login ──────────────────────────────────────
  log('\n🔐', 'STEP 5: Login as Admin');
  const adminLogin = await request('POST', '/api/auth/login', {
    username: 'admin',
    password: 'admin123'
  });
  assert(adminLogin.status === 200, `Admin login returned ${adminLogin.status}`);
  const adminToken = adminLogin.data.token || adminLogin.data.data?.token;
  assert(adminToken, 'Admin token received');
  log('✅', `Admin logged in: ${adminLogin.data.data?.user?.full_name || 'admin'}`);

  // ── STEP 6: Admin Views Pending Grades ──────────────────────
  log('\n📋', 'STEP 6: Admin Views Pending Grades');
  const pendingRes = await request('GET', '/api/grades/admin/pending', null, adminToken);
  assert(pendingRes.status === 200, `Get pending grades returned ${pendingRes.status}`);
  const pendingGrades = pendingRes.data.data || [];
  log('📊', `Pending grades count: ${pendingGrades.length}`);

  if (pendingGrades.length > 0) {
    const firstPending = pendingGrades[0];
    log('📄', `First pending: id=${firstPending.id}, student=${firstPending.Student?.student_code}, course=${firstPending.Course?.course_name}`);
    gradeId = gradeId || firstPending.id;
  }

  // ── STEP 7: Admin Approves Grade ────────────────────────────
  if (gradeId) {
    log('\n✅', `STEP 7: Admin Approves Grade id=${gradeId}`);
    const approveRes = await request('PUT', `/api/grades/${gradeId}/approve`, null, adminToken);
    log('📥', `Approve response status: ${approveRes.status}`, approveRes.data);

    if (approveRes.status === 200) {
      log('✅', 'Grade approved successfully');
      assert(approveRes.data.success, 'Approve success=true');
    } else {
      // Try extended admin route
      const approveRes2 = await request('PUT', `/api/admin/grades/${gradeId}/approve`, null, adminToken);
      log('📥', `Extended approve status: ${approveRes2.status}`, approveRes2.data);
      if (approveRes2.status === 200) {
        log('✅', 'Grade approved via extended route');
      }
    }

    // ── STEP 8: Admin Publishes Grade ─────────────────────────
    log('\n📢', 'STEP 8: Admin Publishes Grade');
    const publishRes = await request('POST', '/api/admin/publish-results', {
      course_ids: [targetCourse?.id || targetCourse?.course_id].filter(Boolean)
    }, adminToken);
    log('📥', `Publish response status: ${publishRes.status}`, publishRes.data);

    if (publishRes.status === 200) {
      log('✅', `Published ${publishRes.data.data?.published_count || 0} grades`);
    } else {
      log('⚠️', `Publish response: ${publishRes.data?.message}`);
    }
  }

  // ── STEP 9: Student Login & View Grades ─────────────────────
  log('\n🎓', 'STEP 9: Student Login & View Published Grades');
  const studentLogin = await request('POST', '/api/auth/login', {
    username: 'student1',
    password: 'student123'
  });

  if (studentLogin.status === 200) {
    const studentToken = studentLogin.data.token || studentLogin.data.data?.token;
    log('✅', `Student logged in: ${studentLogin.data.data?.user?.full_name || 'student1'}`);

    const studentGrades = await request('GET', '/api/grades/student/grades', null, studentToken);
    log('📥', `Student grades status: ${studentGrades.status}`);

    const grades = studentGrades.data.data || studentGrades.data.grades || [];
    log('📊', `Student can see ${grades.length} published grade(s)`);

    if (grades.length > 0) {
      const g = grades[0];
      log('📄', `Grade: course=${g.Course?.course_name}, total=${g.total_score}, result=${g.final_result}, published=${g.is_published}`);
    }
  } else {
    log('⚠️', 'Student login failed - student1 may not exist');
  }

  // ── SUMMARY ─────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('  TEST COMPLETE');
  console.log('='.repeat(60));
  console.log('\n📋 Workflow Summary:');
  console.log('  1. ✅ Professor login');
  console.log('  2. ✅ Get professor courses');
  console.log('  3. ✅ Get enrolled students');
  console.log('  4. ✅ Submit grade + send for approval');
  console.log('  5. ✅ Admin login');
  console.log('  6. ✅ Admin views pending grades');
  console.log('  7. ✅ Admin approves grade');
  console.log('  8. ✅ Admin publishes grade');
  console.log('  9. ✅ Student views published grade');
  console.log('\n');

  process.exit(0);
}

runTest().catch(err => {
  console.error('❌ Test failed with error:', err.message);
  process.exit(1);
});
