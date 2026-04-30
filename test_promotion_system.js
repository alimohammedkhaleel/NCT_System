/**
 * اختبار شامل لنظام النقل - NCTU ERP
 * يختبر النقل من ترم لترم ومن سنة لسنة
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let adminToken = '';
let profTokens = [];
let studentIds = [];
let courseIds = [];
let semesterIds = [];

// ألوان للطباعة
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70) + '\n');
}

// 1. تسجيل دخول المدير
async function loginAdmin() {
  logSection('1️⃣  تسجيل دخول المدير');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    adminToken = response.data.data.token;
    log('✅ تسجيل دخول المدير نجح', 'green');
    return true;
  } catch (error) {
    log(`❌ فشل تسجيل دخول المدير: ${error.message}`, 'red');
    return false;
  }
}

// 2. إنشاء 3 دكاترة
async function createProfessors() {
  logSection('2️⃣  إنشاء 3 دكاترة');
  const professors = [
    {
      username: 'prof_test1',
      email: 'prof1@test.nctu.edu',
      password: 'prof123',
      full_name: 'د. أحمد محمد',
      phone: '+20-10-11111111',
      department: 'Computer Science',
      specialization: 'Programming'
    },
    {
      username: 'prof_test2',
      email: 'prof2@test.nctu.edu',
      password: 'prof123',
      full_name: 'د. محمد علي',
      phone: '+20-10-22222222',
      department: 'Computer Science',
      specialization: 'Database'
    },
    {
      username: 'prof_test3',
      email: 'prof3@test.nctu.edu',
      password: 'prof123',
      full_name: 'د. علي حسن',
      phone: '+20-10-33333333',
      department: 'Computer Science',
      specialization: 'Networks'
    }
  ];

  for (const prof of professors) {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/admin/professors`,
        prof,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      log(`✅ تم إنشاء الدكتور: ${prof.full_name}`, 'green');
      
      // تسجيل دخول الدكتور للحصول على التوكن
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        username: prof.username,
        password: prof.password
      });
      profTokens.push({
        id: response.data.data.id,
        token: loginResponse.data.data.token,
        name: prof.full_name
      });
    } catch (error) {
      log(`⚠️  الدكتور ${prof.full_name} موجود مسبقاً أو حدث خطأ`, 'yellow');
    }
  }
  log(`\n📊 إجمالي الدكاترة: ${profTokens.length}`, 'blue');
}

// 3. الحصول على التخصصات والفصول الدراسية
async function getSpecialtiesAndSemesters() {
  logSection('3️⃣  الحصول على التخصصات والفصول الدراسية');
  try {
    // الحصول على التخصصات
    const specialtiesResponse = await axios.get(`${BASE_URL}/api/specialties`);
    const ictSpecialty = specialtiesResponse.data.data.find(s => s.code === 'ICT');
    
    if (!ictSpecialty) {
      log('❌ تخصص ICT غير موجود', 'red');
      return null;
    }
    log(`✅ تم العثور على تخصص: ${ictSpecialty.arabic_name}`, 'green');

    // الحصول على الفصول الدراسية
    const semestersResponse = await axios.get(
      `${BASE_URL}/api/admin/semesters`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    semesterIds = semestersResponse.data.data.map(s => s.id);
    log(`✅ تم العثور على ${semesterIds.length} فصل دراسي`, 'green');

    return ictSpecialty.id;
  } catch (error) {
    log(`❌ خطأ في الحصول على البيانات: ${error.message}`, 'red');
    return null;
  }
}

// 4. إنشاء 6 مقررات
async function createCourses(specialtyId) {
  logSection('4️⃣  إنشاء 6 مقررات دراسية');
  const courses = [
    { code: 'TEST101', name: 'Programming 1', arabic_name: 'برمجة 1', year_level: 1, semester: 1, credits: 3 },
    { code: 'TEST102', name: 'Database 1', arabic_name: 'قواعد بيانات 1', year_level: 1, semester: 1, credits: 3 },
    { code: 'TEST103', name: 'Networks 1', arabic_name: 'شبكات 1', year_level: 1, semester: 2, credits: 3 },
    { code: 'TEST104', name: 'Programming 2', arabic_name: 'برمجة 2', year_level: 1, semester: 2, credits: 3 },
    { code: 'TEST201', name: 'Advanced Programming', arabic_name: 'برمجة متقدمة', year_level: 2, semester: 1, credits: 3 },
    { code: 'TEST202', name: 'Advanced Database', arabic_name: 'قواعد بيانات متقدمة', year_level: 2, semester: 1, credits: 3 }
  ];

  for (const course of courses) {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/admin/courses`,
        {
          ...course,
          specialty_id: specialtyId,
          course_type: 'mandatory',
          is_active: true
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      courseIds.push(response.data.data.id);
      log(`✅ تم إنشاء المقرر: ${course.arabic_name} (${course.code})`, 'green');
    } catch (error) {
      log(`⚠️  المقرر ${course.code} موجود مسبقاً`, 'yellow');
    }
  }
  log(`\n📊 إجمالي المقررات: ${courseIds.length}`, 'blue');
}

// 5. إسناد المقررات للدكاترة (كل دكتور مادتين)
async function assignCoursesToProfessors() {
  logSection('5️⃣  إسناد المقررات للدكاترة');
  
  // الحصول على جميع المقررات
  const coursesResponse = await axios.get(
    `${BASE_URL}/api/admin/courses`,
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  const allCourses = coursesResponse.data.data;
  
  // الحصول على جميع الدكاترة
  const profsResponse = await axios.get(
    `${BASE_URL}/api/admin/professors`,
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  const allProfs = profsResponse.data.data;

  // الحصول على السنة الدراسية النشطة
  const yearsResponse = await axios.get(
    `${BASE_URL}/api/admin/academic-years`,
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  const activeYear = yearsResponse.data.data.find(y => y.is_active);

  // الحصول على الفصل الدراسي النشط
  const semestersResponse = await axios.get(
    `${BASE_URL}/api/admin/semesters`,
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  const activeSemester = semestersResponse.data.data.find(s => s.is_active);

  let courseIndex = 0;
  for (let i = 0; i < Math.min(allProfs.length, 3); i++) {
    const prof = allProfs[i];
    // إسناد مادتين لكل دكتور
    for (let j = 0; j < 2 && courseIndex < allCourses.length; j++) {
      const course = allCourses[courseIndex];
      try {
        await axios.post(
          `${BASE_URL}/api/admin/professors/${prof.id}/courses`,
          {
            course_id: course.id,
            academic_year_id: activeYear.id,
            semester_id: activeSemester.id,
            is_primary: true
          },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        log(`✅ تم إسناد ${course.arabic_name} للدكتور ${prof.User?.full_name || 'غير معروف'}`, 'green');
      } catch (error) {
        log(`⚠️  المقرر ${course.code} مسند مسبقاً`, 'yellow');
      }
      courseIndex++;
    }
  }
}

// 6. إنشاء طلاب للاختبار
async function createStudents(specialtyId) {
  logSection('6️⃣  إنشاء طلاب للاختبار');
  
  // إنشاء رابط تسجيل
  const linkResponse = await axios.post(
    `${BASE_URL}/api/admin/registration-links`,
    {
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      max_uses: 100
    },
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  const regToken = linkResponse.data.data.token;
  log(`✅ تم إنشاء رابط التسجيل`, 'green');

  const students = [
    // طلاب السنة الأولى - الترم الأول
    { name: 'أحمد محمد', nid: '30101011111111', year: 1, scenario: 'ناجح في كل المواد' },
    { name: 'فاطمة أحمد', nid: '30102022222222', year: 1, scenario: 'راسب في مادة واحدة' },
    { name: 'محمد علي', nid: '30103033333333', year: 1, scenario: 'راسب في 3 مواد' },
    { name: 'سارة حسن', nid: '30104044444444', year: 1, scenario: 'راسب في 4 مواد (إعادة)' },
    
    // طلاب السنة الثانية
    { name: 'عمر خالد', nid: '29905055555555', year: 2, scenario: 'ناجح (سنة تخرج)' },
    { name: 'نور محمود', nid: '29906066666666', year: 2, scenario: 'راسب في مادة (صيفي)' },
    
    // طلاب السنة الرابعة
    { name: 'يوسف إبراهيم', nid: '29707077777777', year: 4, scenario: 'ناجح (تخرج)' },
    { name: 'مريم سعيد', nid: '29708088888888', year: 4, scenario: 'راسب (صيفي)' }
  ];

  for (const student of students) {
    try {
      // تسجيل الطالب
      await axios.post(
        `${BASE_URL}/api/auth/register-link/${regToken}`,
        {
          full_name: student.name,
          national_id: student.nid,
          email: `${student.nid}@test.nctu.edu`,
          phone: `+20-10-${student.nid.substring(0, 8)}`,
          specialty_id: specialtyId,
          birth_date: '2000-01-01',
          gender: 'male',
          current_year: student.year
        }
      );

      // الموافقة على الطلب
      const requestsResponse = await axios.get(
        `${BASE_URL}/api/admin/registration-requests`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      const request = requestsResponse.data.data.find(r => r.national_id === student.nid);
      
      if (request) {
        const approveResponse = await axios.post(
          `${BASE_URL}/api/admin/registration-requests/${request.id}/approve`,
          { student_code: `TEST-${student.nid.substring(0, 8)}` },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        studentIds.push(approveResponse.data.data.student_id);
        log(`✅ تم إنشاء الطالب: ${student.name} - ${student.scenario}`, 'green');
      }
    } catch (error) {
      log(`⚠️  الطالب ${student.name} موجود مسبقاً`, 'yellow');
    }
  }
  log(`\n📊 إجمالي الطلاب: ${studentIds.length}`, 'blue');
}

// 7. إدخال الدرجات
async function enterGrades() {
  logSection('7️⃣  إدخال الدرجات للطلاب');
  
  // الحصول على جميع الطلاب
  const studentsResponse = await axios.get(
    `${BASE_URL}/api/admin/students`,
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  const students = studentsResponse.data.data;

  // الحصول على جميع المقررات
  const coursesResponse = await axios.get(
    `${BASE_URL}/api/admin/courses`,
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  const courses = coursesResponse.data.data;

  // الحصول على الفصل النشط
  const semestersResponse = await axios.get(
    `${BASE_URL}/api/admin/semesters`,
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  const activeSemester = semestersResponse.data.data.find(s => s.is_active);

  // سيناريوهات الدرجات
  const gradeScenarios = {
    0: [85, 90, 88, 92], // ناجح في كل المواد
    1: [85, 90, 45, 92], // راسب في مادة واحدة
    2: [45, 40, 48, 92], // راسب في 3 مواد
    3: [45, 40, 35, 30], // راسب في 4 مواد
    4: [85, 90, 88, 92], // ناجح (سنة 2)
    5: [85, 45, 88, 92], // راسب في مادة (سنة 2)
    6: [85, 90, 88, 92], // ناجح (سنة 4)
    7: [85, 45, 88, 92]  // راسب (سنة 4)
  };

  for (let i = 0; i < Math.min(students.length, 8); i++) {
    const student = students[i];
    const grades = gradeScenarios[i] || [85, 90, 88, 92];
    
    // إدخال درجات لأول 4 مقررات
    for (let j = 0; j < Math.min(courses.length, 4); j++) {
      const course = courses[j];
      const totalGrade = grades[j];
      
      try {
        // إدخال الدرجة
        const gradeResponse = await axios.post(
          `${BASE_URL}/api/grades`,
          {
            student_id: student.id,
            course_id: course.id,
            semester_id: activeSemester.id,
            midterm_grade: Math.floor(totalGrade * 0.3),
            final_grade: Math.floor(totalGrade * 0.4),
            coursework_grade: Math.floor(totalGrade * 0.2),
            practical_grade: Math.floor(totalGrade * 0.1),
            total_grade: totalGrade,
            letter_grade: totalGrade >= 85 ? 'A' : totalGrade >= 75 ? 'B' : totalGrade >= 65 ? 'C' : totalGrade >= 50 ? 'D' : 'F',
            status: 'draft'
          },
          { headers: { Authorization: `Bearer ${profTokens[0]?.token || adminToken}` } }
        );

        // إرسال للموافقة
        await axios.post(
          `${BASE_URL}/api/grades/${gradeResponse.data.data.id}/submit-for-approval`,
          {},
          { headers: { Authorization: `Bearer ${profTokens[0]?.token || adminToken}` } }
        );

        // الموافقة من المدير
        await axios.put(
          `${BASE_URL}/api/grades/${gradeResponse.data.data.id}/approve`,
          {},
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        const status = totalGrade >= 50 ? '✅ ناجح' : '❌ راسب';
        log(`${status} - ${student.User?.full_name}: ${course.arabic_name} = ${totalGrade}`, totalGrade >= 50 ? 'green' : 'red');
      } catch (error) {
        log(`⚠️  خطأ في إدخال درجة ${course.code} للطالب ${student.student_code}`, 'yellow');
      }
    }
  }
}

// 8. اختبار النقل من ترم لترم
async function testSemesterPromotion() {
  logSection('8️⃣  اختبار النقل من الترم الأول للترم الثاني');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/admin/promote-semester`,
      {
        from_semester: 1,
        to_semester: 2,
        specialty_id: 3,
        year_level: 1
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    log(`✅ تم النقل بنجاح!`, 'green');
    log(`📊 عدد الطلاب المنقولين: ${response.data.data?.promoted_count || 0}`, 'blue');
    log(`⚠️  عدد الطلاب الذين لم ينقلوا: ${response.data.data?.failed_count || 0}`, 'yellow');
  } catch (error) {
    log(`❌ فشل النقل: ${error.response?.data?.message || error.message}`, 'red');
  }
}

// 9. اختبار النقل من سنة لسنة
async function testYearPromotion() {
  logSection('9️⃣  اختبار النقل من السنة الأولى للسنة الثانية');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/admin/promote-year`,
      {
        from_year: 1,
        to_year: 2,
        specialty_id: 3
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    log(`✅ تم النقل بنجاح!`, 'green');
    log(`📊 عدد الطلاب المنقولين: ${response.data.data?.promoted_count || 0}`, 'blue');
    log(`⚠️  عدد الطلاب الذين لم ينقلوا: ${response.data.data?.failed_count || 0}`, 'yellow');
    
    if (response.data.data?.details) {
      log(`\n📋 التفاصيل:`, 'cyan');
      response.data.data.details.forEach(detail => {
        log(`  - ${detail.student_name}: ${detail.status}`, detail.promoted ? 'green' : 'yellow');
      });
    }
  } catch (error) {
    log(`❌ فشل النقل: ${error.response?.data?.message || error.message}`, 'red');
  }
}

// 10. اختبار النقل للسنة الثانية (سنة تخرج)
async function testYear2Promotion() {
  logSection('🔟 اختبار النقل من السنة الثانية (سنة تخرج)');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/admin/promote-year`,
      {
        from_year: 2,
        to_year: 3,
        specialty_id: 3
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    log(`✅ تم النقل بنجاح!`, 'green');
    log(`📊 عدد الطلاب المنقولين: ${response.data.data?.promoted_count || 0}`, 'blue');
    log(`⚠️  عدد الطلاب في الصيفي: ${response.data.data?.summer_count || 0}`, 'yellow');
  } catch (error) {
    log(`❌ فشل النقل: ${error.response?.data?.message || error.message}`, 'red');
  }
}

// 11. اختبار النقل للسنة الرابعة (تخرج)
async function testYear4Promotion() {
  logSection('1️⃣1️⃣  اختبار النقل من السنة الرابعة (تخرج)');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/api/admin/promote-year`,
      {
        from_year: 4,
        to_year: 5,
        specialty_id: 3
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    log(`✅ تم النقل بنجاح!`, 'green');
    log(`🎓 عدد الخريجين: ${response.data.data?.graduated_count || 0}`, 'blue');
    log(`⚠️  عدد الطلاب في الصيفي: ${response.data.data?.summer_count || 0}`, 'yellow');
  } catch (error) {
    log(`❌ فشل النقل: ${error.response?.data?.message || error.message}`, 'red');
  }
}

// 12. عرض ملخص النتائج
async function showSummary() {
  logSection('📊 ملخص نتائج الاختبار');
  
  try {
    const studentsResponse = await axios.get(
      `${BASE_URL}/api/admin/students`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const students = studentsResponse.data.data;

    log(`إجمالي الطلاب: ${students.length}`, 'blue');
    
    const byYear = students.reduce((acc, s) => {
      acc[s.current_year] = (acc[s.current_year] || 0) + 1;
      return acc;
    }, {});

    log(`\nتوزيع الطلاب حسب السنة:`, 'cyan');
    Object.entries(byYear).forEach(([year, count]) => {
      log(`  السنة ${year}: ${count} طالب`, 'yellow');
    });

    const byStatus = students.reduce((acc, s) => {
      acc[s.academic_status] = (acc[s.academic_status] || 0) + 1;
      return acc;
    }, {});

    log(`\nتوزيع الطلاب حسب الحالة:`, 'cyan');
    Object.entries(byStatus).forEach(([status, count]) => {
      log(`  ${status}: ${count} طالب`, 'yellow');
    });

  } catch (error) {
    log(`❌ خطأ في عرض الملخص: ${error.message}`, 'red');
  }
}

// تشغيل جميع الاختبارات
async function runAllTests() {
  console.log('\n');
  log('🚀 بدء اختبار نظام النقل الشامل', 'magenta');
  log('═'.repeat(70), 'magenta');
  
  try {
    await loginAdmin();
    const specialtyId = await getSpecialtiesAndSemesters();
    
    if (!specialtyId) {
      log('❌ فشل الحصول على التخصص', 'red');
      return;
    }

    await createProfessors();
    await createCourses(specialtyId);
    await assignCoursesToProfessors();
    await createStudents(specialtyId);
    await enterGrades();
    
    // اختبارات النقل
    await testSemesterPromotion();
    await testYearPromotion();
    await testYear2Promotion();
    await testYear4Promotion();
    
    await showSummary();
    
    logSection('✅ اكتمل الاختبار بنجاح!');
    log('تم اختبار جميع سيناريوهات النقل', 'green');
    
  } catch (error) {
    log(`\n❌ خطأ عام: ${error.message}`, 'red');
    console.error(error);
  }
}

// تشغيل الاختبارات
runAllTests();
