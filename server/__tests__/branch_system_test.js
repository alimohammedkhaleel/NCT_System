/**
 * Comprehensive test for Branch-Aware ICT Management System
 * 
 * This script verifies:
 * 1. Admin Dashboard (Stats by branch)
 * 2. Student Management (Filtering by branch)
 * 3. Results Publishing (Branch-aware counts and publishing)
 * 4. Professor Grading (Student filtering by branch)
 */

const { sequelize, Student, Course, Specialty, AcademicYear, Semester, Grade, User, Professor, ProfessorCourse } = require('../config/models');
require('../config/models').defineAssociations();
const adminController = require('../controllers/adminController');
const gradeController = require('../controllers/gradeController');
const studentController = require('../controllers/studentController');

async function setupTestData() {
  console.log('🏗️ Setting up test data...');
  
  // 1. Get or create Specialty
  let specialty = await Specialty.findOne({ where: { code: 'ICT' } });
  if (!specialty) {
    specialty = await Specialty.create({
      code: 'ICT',
      name: 'Information & Communication Technology',
      arabic_name: 'تكنولوجيا المعلومات والاتصالات',
      duration_years: 4
    });
  }

  // 2. Create Academic Year
  let year = await AcademicYear.create({
    specialty_id: specialty.id,
    year_number: 3,
    is_active: true
  });

  // 3. Create Semester
  let semester = await Semester.create({
    academic_year_id: year.id,
    semester_name: 'Semester 1',
    is_active: true
  });

  const suffix = Date.now();

  // 4. Create Courses
  const softwareCourse = await Course.create({
    specialty_id: specialty.id,
    academic_year_id: year.id,
    semester_id: semester.id,
    course_code: `SOFT${suffix}`,
    course_name: 'Software Engineering',
    branch: 'Software',
    is_active: true
  });

  const bothCourse = await Course.create({
    specialty_id: specialty.id,
    academic_year_id: year.id,
    semester_id: semester.id,
    course_code: `ICT${suffix}`,
    course_name: 'Database Systems',
    branch: 'Both',
    is_active: true
  });

  // 5. Create Users and Students
  const createUser = async (name, email, role = 'student') => {
    return await User.create({
      username: email.split('@')[0] + '_' + Date.now(),
      email,
      full_name: name,
      password_hash: 'dummy',
      role: role,
      is_active: true
    });
  };

  const profUser = await createUser('Test Professor', `prof${suffix}@test.com`, 'professor');
  const adminUser = await createUser('Test Admin', `admin${suffix}@test.com`, 'admin');

  const professor = await Professor.create({
    user_id: profUser.id,
    professor_code: `P${suffix}`,
    department: 'ICT',
    is_active: true
  });

  await ProfessorCourse.create({
    professor_id: professor.id,
    course_id: softwareCourse.id,
    academic_year_id: year.id,
    semester_id: semester.id
  });

  await ProfessorCourse.create({
    professor_id: professor.id,
    course_id: bothCourse.id,
    academic_year_id: year.id,
    semester_id: semester.id
  });

  const userS = await createUser('Software Student', `soft${suffix}@test.com`);
  const studentS = await Student.create({
    user_id: userS.id,
    student_code: `S${suffix}`,
    national_id: `NAT1${suffix}`,
    specialty_id: specialty.id,
    current_year: 3,
    branch: 'Software',
    academic_status: 'active'
  });

  const userN = await createUser('Network Student', `net${suffix}@test.com`);
  const studentN = await Student.create({
    user_id: userN.id,
    student_code: `N${suffix}`,
    national_id: `NAT2${suffix}`,
    specialty_id: specialty.id,
    current_year: 3,
    branch: 'Network',
    academic_status: 'active'
  });

  // 6. Create Grades
  await Grade.create({
    student_id: studentS.id,
    course_id: softwareCourse.id,
    semester_id: semester.id,
    academic_year_id: year.id,
    assignment1_grade: 20,
    status: 'approved',
    is_published: false,
    professor_submitted_by: profUser.id,
    admin_approved_by: adminUser.id
  });

  await Grade.create({
    student_id: studentS.id,
    course_id: bothCourse.id,
    semester_id: semester.id,
    academic_year_id: year.id,
    assignment1_grade: 25,
    status: 'approved',
    is_published: false,
    professor_submitted_by: profUser.id,
    admin_approved_by: adminUser.id
  });

  await Grade.create({
    student_id: studentN.id,
    course_id: bothCourse.id,
    semester_id: semester.id,
    academic_year_id: year.id,
    assignment1_grade: 22,
    status: 'approved',
    is_published: false,
    professor_submitted_by: profUser.id,
    admin_approved_by: adminUser.id
  });

  return { specialty, year, semester, softwareCourse, bothCourse, studentS, studentN, profUser, adminUser };
}

async function runTests(data) {
  const { specialty, year, semester, softwareCourse, bothCourse, studentS, studentN, profUser, adminUser } = data;
  console.log('\n🚀 Running Branch-Aware System Tests...\n');

  // Helper to mock res
  const mockRes = () => {
    const res = {};
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.body = data; return res; };
    return res;
  };

  // --- Test 1: Student Management Filtering ---
  console.log('🧪 Test 1: Student Management Filtering');
  const req1 = { 
    query: { branch: 'Software', specialty_id: specialty.id },
    user: { id: adminUser.id, role: 'admin' }
  };
  const res1 = mockRes();
  await studentController.getAllStudents(req1, res1);
  const softwareStudents = res1.body.data;
  console.log(`   - Software branch filter count: ${softwareStudents.length}`);
  const targetStudent = softwareStudents.find(s => s.id === studentS.id);
  if (targetStudent) {
    console.log('   ✅ PASS: Target student found in filtered list');
  } else {
    console.log('   ❌ FAIL: Target student NOT found in filtered list');
  }

  // --- Test 2: Admin Dashboard Course Stats ---
  console.log('\n🧪 Test 2: Admin Dashboard Course Stats');
  const req2 = { 
    query: { specialty_id: specialty.id, branch: 'Software' },
    user: { id: adminUser.id, role: 'admin' }
  };
  const res2 = mockRes();
  await adminController.getCoursesWithStats(req2, res2);
  const softwareCoursesStats = res2.body.data;
  console.log(`   - Software branch courses count: ${softwareCoursesStats.length}`);
  const softCourseStat = softwareCoursesStats.find(c => c.id === softwareCourse.id);
  const bothCourseStat = softwareCoursesStats.find(c => c.id === bothCourse.id);
  
  if (softCourseStat && bothCourseStat) {
    console.log(`   - Software Course Stats: Total=${softCourseStat.grade_stats.total}, Approved=${softCourseStat.grade_stats.approved}`);
    console.log(`   - Both Course Stats (filtered by Software): Total=${bothCourseStat.grade_stats.total}`);
    if (softCourseStat.grade_stats.total === 1 && bothCourseStat.grade_stats.total === 1) {
      console.log('   ✅ PASS: Stats correctly filtered by branch for "Both" courses');
    } else {
      console.log('   ❌ FAIL: Stats counts incorrect');
    }
  } else {
    console.log('   ❌ FAIL: Courses not found in stats');
  }

  // --- Test 3: Professor Grading Student List ---
  console.log('\n🧪 Test 3: Professor Grading Student List');
  const myStudentIds = [studentS.id, studentN.id];
  console.log(`   - My Test Student IDs: ${JSON.stringify(myStudentIds)}`);

  // For softwareCourse, should only return studentS (from my test set)
  const req3a = { 
    query: { course_id: softwareCourse.id },
    user: { id: profUser.id, role: 'professor' }
  };
  const res3a = mockRes();
  await gradeController.getStudentsByCourse(req3a, res3a);
  const allSoftwareStudents = res3a.body.data || [];
  console.log(`   - Total students returned for Software course: ${allSoftwareStudents.length}`);
  const mySoftwareStudents = allSoftwareStudents.filter(s => myStudentIds.some(id => id == s.id));
  console.log(`   - Software Course (My Test Students): ${mySoftwareStudents.length}`);
  
  // For bothCourse, should return both (from my test set)
  const req3b = { 
    query: { course_id: bothCourse.id },
    user: { id: profUser.id, role: 'professor' }
  };
  const res3b = mockRes();
  await gradeController.getStudentsByCourse(req3b, res3b);
  const allBothStudents = res3b.body.data || [];
  const myBothStudents = allBothStudents.filter(s => myStudentIds.some(id => id == s.id));
  console.log(`   - Both Course (My Test Students): ${myBothStudents.length}`);

  if (mySoftwareStudents.length === 1 && myBothStudents.length === 2) {
    console.log('   ✅ PASS: Student filtering correctly applied for professors');
  } else {
    console.log('   ❌ FAIL: Professor student list filtering failed');
  }

  // --- Test 4: Results Publishing ---
  console.log('\n🧪 Test 4: Results Publishing');
  const req4 = { 
    body: { 
      filters: { 
        specialty_id: specialty.id, 
        academic_year_id: year.id, 
        semester_id: semester.id, 
        branch: 'Software' 
      } 
    },
    user: { id: adminUser.id, role: 'admin' }
  };
  const res4 = mockRes();
  await adminController.publishResults(req4, res4);
  const publishedCount = res4.body.data?.published_count;
  console.log(`   - Published results count for Software branch: ${publishedCount}`);
  
  // Check if studentN's grade in bothCourse is still unpublished
  const nGrade = await Grade.findOne({ where: { student_id: studentN.id, course_id: bothCourse.id } });
  const sGrade = await Grade.findOne({ where: { student_id: studentS.id, course_id: bothCourse.id } });
  
  if (publishedCount >= 2 && sGrade.is_published === true && nGrade.is_published === false) {
    console.log('   ✅ PASS: Results published only for the selected branch');
  } else {
    console.log('   ❌ FAIL: Branch-aware publishing failed');
    console.log(`     Details: publishedCount=${publishedCount}, softPublished=${sGrade.is_published}, netPublished=${nGrade.is_published}`);
  }
}

async function cleanup(data) {
  console.log('\n🧹 Cleaning up test data...');
  const { year, semester, softwareCourse, bothCourse, studentS, studentN, profUser, adminUser, professor } = data;
  
  // 1. Delete associations and dependent records
  if (professor) {
    await ProfessorCourse.destroy({ where: { professor_id: professor.id } });
  }
  if (softwareCourse && bothCourse) {
    await ProfessorCourse.destroy({ where: { course_id: [softwareCourse.id, bothCourse.id] } });
  }
  
  if (semester) {
    await Grade.destroy({ where: { semester_id: semester.id } });
  }
  
  // 2. Delete main entities
  if (professor) {
    await Professor.destroy({ where: { id: professor.id } });
  }
  
  if (studentS && studentN) {
    await Student.destroy({ where: { id: [studentS.id, studentN.id] } });
  }
  
  if (softwareCourse && bothCourse) {
    await Course.destroy({ where: { id: [softwareCourse.id, bothCourse.id] } });
  }
  
  // 3. Delete users (at the end)
  const userIds = [];
  if (studentS) userIds.push(studentS.user_id);
  if (studentN) userIds.push(studentN.user_id);
  if (profUser) userIds.push(profUser.id);
  if (adminUser) userIds.push(adminUser.id);
  
  if (userIds.length > 0) {
    await User.destroy({ where: { id: userIds } });
  }
  
  // 4. Delete academic structure
  if (semester) await Semester.destroy({ where: { id: semester.id } });
  if (year) await AcademicYear.destroy({ where: { id: year.id } });
  
  console.log('✅ Cleanup done.');
}

async function start() {
  let data;
  try {
    data = await setupTestData();
    await runTests(data);
  } catch (error) {
    console.error('❌ Test execution error:', error);
  } finally {
    if (data) await cleanup(data);
    process.exit(0);
  }
}

start();
