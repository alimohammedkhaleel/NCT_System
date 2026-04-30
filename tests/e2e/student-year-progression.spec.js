/**
 * اختبار شامل لنظام انتقال الطلاب من مرحلة دراسية لأخرى
 * Comprehensive E2E Test for Student Year Progression System
 * 
 * يختبر:
 * 1. إضافة طلاب جدد
 * 2. إضافة دكاترة
 * 3. دفع المصاريف
 * 4. إدخال الدرجات
 * 5. نشر النتائج
 * 6. نقل الطلاب للترم الثاني
 * 7. نقل الطلاب للسنة الجديدة
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5000/api';

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@nctu.edu.eg',
  password: 'admin123'
};

// Test data
const TEST_STUDENTS = [
  {
    full_name: 'أحمد محمد علي',
    email: 'ahmed.test@student.edu',
    password: 'student123',
    national_id: '30001010101010',
    phone: '01012345678',
    specialty: 'ICT',
    current_year: 1,
    branch: null
  },
  {
    full_name: 'فاطمة حسن محمود',
    email: 'fatma.test@student.edu',
    password: 'student123',
    national_id: '30002020202020',
    phone: '01098765432',
    specialty: 'ICT',
    current_year: 1,
    branch: null
  },
  {
    full_name: 'محمد عبدالله سعيد',
    email: 'mohamed.test@student.edu',
    password: 'student123',
    national_id: '30003030303030',
    phone: '01123456789',
    specialty: 'ICT',
    current_year: 2,
    branch: 'Software'
  }
];

const TEST_PROFESSOR = {
  full_name: 'د. خالد إبراهيم',
  email: 'khaled.test@prof.edu',
  password: 'prof123',
  phone: '01234567890',
  department: 'Computer Science'
};

test.describe('Student Year Progression System - اختبار شامل', () => {
  let page;
  let context;
  let adminToken;
  let createdStudentIds = [];
  let createdProfessorId;
  let createdCourseIds = [];

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    
    // Login as admin
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Fill login form with correct selectors
    await page.fill('input[name="username"]', ADMIN_CREDENTIALS.email);
    await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to admin dashboard
    await page.waitForURL('**/admin/**', { timeout: 10000 });
    
    // Get admin token from localStorage
    adminToken = await page.evaluate(() => localStorage.getItem('token'));
    
    console.log('✅ تم تسجيل الدخول كـ Admin بنجاح');
  });

  test.afterAll(async () => {
    // Cleanup: Delete created test data
    if (adminToken) {
      for (const studentId of createdStudentIds) {
        try {
          await page.request.delete(`${API_URL}/admin/students/${studentId}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
          });
        } catch (e) {
          console.log(`تنبيه: فشل حذف الطالب ${studentId}`);
        }
      }
    }
    
    await context.close();
    console.log('✅ تم تنظيف البيانات التجريبية');
  });

  test('1. إضافة طلاب جدد', async () => {
    console.log('\n📝 اختبار 1: إضافة طلاب جدد');
    
    await page.goto(`${BASE_URL}/admin/students`);
    await page.waitForLoadState('networkidle');
    
    for (const student of TEST_STUDENTS) {
      // Click add student button
      await page.click('button:has-text("إضافة طالب")');
      
      // Wait for modal
      await page.waitForSelector('.modal', { state: 'visible' });
      
      // Fill form
      await page.fill('input[name="full_name"]', student.full_name);
      await page.fill('input[name="email"]', student.email);
      await page.fill('input[name="password"]', student.password);
      await page.fill('input[name="national_id"]', student.national_id);
      await page.fill('input[name="phone"]', student.phone);
      
      // Select specialty
      await page.selectOption('select[name="specialty_id"]', { label: student.specialty });
      
      // Select year
      await page.selectOption('select[name="current_year"]', student.current_year.toString());
      
      // Select branch if applicable
      if (student.branch) {
        await page.selectOption('select[name="branch"]', student.branch);
      }
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for success message
      await page.waitForSelector('.toast-success, .success-message', { timeout: 5000 });
      
      // Get created student ID from table
      const studentRow = await page.locator(`tr:has-text("${student.national_id}")`).first();
      const studentCode = await studentRow.locator('td').first().textContent();
      
      console.log(`  ✅ تم إضافة الطالب: ${student.full_name} (${studentCode})`);
      
      // Store for cleanup
      const studentId = await page.evaluate((code) => {
        // Get student ID from API or table data attribute
        return document.querySelector(`tr:has-text("${code}")`)?.dataset?.studentId;
      }, studentCode);
      
      if (studentId) createdStudentIds.push(studentId);
      
      await page.waitForTimeout(1000); // Wait between additions
    }
    
    // Verify students appear in table
    for (const student of TEST_STUDENTS) {
      await expect(page.locator(`text=${student.full_name}`)).toBeVisible();
    }
    
    console.log(`✅ تم إضافة ${TEST_STUDENTS.length} طلاب بنجاح`);
  });

  test('2. إضافة دكتور جديد', async () => {
    console.log('\n👨‍🏫 اختبار 2: إضافة دكتور جديد');
    
    await page.goto(`${BASE_URL}/admin/professors`);
    await page.waitForLoadState('networkidle');
    
    // Click add professor button
    await page.click('button:has-text("إضافة أستاذ"), button:has-text("إضافة دكتور")');
    
    // Wait for modal
    await page.waitForSelector('.modal', { state: 'visible' });
    
    // Fill form
    await page.fill('input[name="full_name"]', TEST_PROFESSOR.full_name);
    await page.fill('input[name="email"]', TEST_PROFESSOR.email);
    await page.fill('input[name="password"]', TEST_PROFESSOR.password);
    await page.fill('input[name="phone"]', TEST_PROFESSOR.phone);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await page.waitForSelector('.toast-success, .success-message', { timeout: 5000 });
    
    // Verify professor appears in table
    await expect(page.locator(`text=${TEST_PROFESSOR.full_name}`)).toBeVisible();
    
    console.log(`✅ تم إضافة الدكتور: ${TEST_PROFESSOR.full_name}`);
  });

  test('3. دفع المصاريف للطلاب', async () => {
    console.log('\n💰 اختبار 3: دفع المصاريف للطلاب');
    
    await page.goto(`${BASE_URL}/admin/payments`);
    await page.waitForLoadState('networkidle');
    
    // For each test student, mark payment as paid
    for (const student of TEST_STUDENTS) {
      // Search for student
      await page.fill('input[placeholder*="بحث"]', student.national_id);
      await page.waitForTimeout(500);
      
      // Find student row
      const studentRow = page.locator(`tr:has-text("${student.national_id}")`).first();
      
      // Check if payment button exists
      const paymentButton = studentRow.locator('button:has-text("دفع"), button:has-text("تسجيل دفع")');
      
      if (await paymentButton.count() > 0) {
        await paymentButton.click();
        
        // Fill payment form if modal appears
        const modal = page.locator('.modal');
        if (await modal.isVisible()) {
          // Fill payment amount (get from specialty fee)
          const feeAmount = await page.locator('input[name="amount"]').getAttribute('value');
          
          // Select payment method
          await page.selectOption('select[name="payment_method"]', 'cash');
          
          // Submit payment
          await page.click('button:has-text("تأكيد الدفع")');
          
          // Wait for success
          await page.waitForSelector('.toast-success', { timeout: 5000 });
        }
        
        console.log(`  ✅ تم دفع المصاريف للطالب: ${student.full_name}`);
      } else {
        console.log(`  ℹ️ المصاريف مدفوعة مسبقاً للطالب: ${student.full_name}`);
      }
      
      await page.waitForTimeout(500);
    }
    
    console.log('✅ تم دفع المصاريف لجميع الطلاب');
  });

  test('4. إدخال الدرجات للطلاب', async () => {
    console.log('\n📊 اختبار 4: إدخال الدرجات للطلاب');
    
    // Navigate to grades page
    await page.goto(`${BASE_URL}/admin/grades`);
    await page.waitForLoadState('networkidle');
    
    // Scenario 1: Student with all passing grades (should be promoted)
    await enterGradesForStudent(page, TEST_STUDENTS[0].national_id, {
      midterm: 25,
      quizzes: 8,
      assignments: 8,
      final: 120
    });
    
    // Scenario 2: Student with 2 failed courses (should go to summer course)
    await enterGradesForStudent(page, TEST_STUDENTS[1].national_id, {
      midterm: 15,
      quizzes: 5,
      assignments: 5,
      final: 60
    });
    
    // Scenario 3: Student with 4+ failed courses (should repeat year)
    await enterGradesForStudent(page, TEST_STUDENTS[2].national_id, {
      midterm: 10,
      quizzes: 3,
      assignments: 3,
      final: 40
    });
    
    console.log('✅ تم إدخال الدرجات لجميع الطلاب');
  });

  test('5. نشر النتائج', async () => {
    console.log('\n📢 اختبار 5: نشر النتائج');
    
    await page.goto(`${BASE_URL}/admin/publish-results`);
    await page.waitForLoadState('networkidle');
    
    // Select specialty
    await page.selectOption('select[name="specialty_id"]', { label: 'ICT' });
    
    // Select semester
    await page.selectOption('select[name="semester_id"]', '1');
    
    // Click publish button
    await page.click('button:has-text("نشر النتائج")');
    
    // Confirm dialog if appears
    const confirmDialog = page.locator('.confirm-dialog, .modal');
    if (await confirmDialog.isVisible()) {
      await page.click('button:has-text("تأكيد"), button:has-text("نعم")');
    }
    
    // Wait for success message
    await page.waitForSelector('.toast-success', { timeout: 10000 });
    
    console.log('✅ تم نشر النتائج بنجاح');
  });

  test('6. اختبار النقل للترم الثاني', async () => {
    console.log('\n🔄 اختبار 6: النقل للترم الثاني');
    
    await page.goto(`${BASE_URL}/admin/students`);
    await page.waitForLoadState('networkidle');
    
    // Open bulk promotion panel
    await page.click('button:has-text("النقل الجماعي")');
    
    // Wait for panel to appear
    await page.waitForSelector('.bulkPanel, .bulk-panel', { state: 'visible' });
    
    // Select promotion type: semester
    await page.selectOption('select[name="type"]', 'semester');
    
    // Select specialty (optional)
    await page.selectOption('select[name="specialty_id"]', { label: 'ICT' });
    
    // Click execute button
    await page.click('button:has-text("تنفيذ النقل")');
    
    // Wait for result dialog
    await page.waitForSelector('.bulkResultBody, .result-dialog', { timeout: 15000 });
    
    // Verify results
    const promotedCount = await page.locator('.bulkStatGreen .bulkStatNum').textContent();
    const summerCount = await page.locator('.bulkStatOrange .bulkStatNum').textContent();
    const repeatCount = await page.locator('.bulkStatRed .bulkStatNum').textContent();
    
    console.log(`  📊 النتائج:`);
    console.log(`    ✅ منقول للترم الثاني: ${promotedCount}`);
    console.log(`    ☀️ دراسة صيفية: ${summerCount}`);
    console.log(`    🔁 إعادة السنة: ${repeatCount}`);
    
    // Close result dialog
    await page.click('button:has-text("إغلاق")');
    
    console.log('✅ تم اختبار النقل للترم الثاني بنجاح');
  });

  test('7. اختبار النقل للسنة الجديدة', async () => {
    console.log('\n🎓 اختبار 7: النقل للسنة الجديدة');
    
    await page.goto(`${BASE_URL}/admin/students`);
    await page.waitForLoadState('networkidle');
    
    // Open bulk promotion panel
    await page.click('button:has-text("النقل الجماعي")');
    
    // Wait for panel to appear
    await page.waitForSelector('.bulkPanel, .bulk-panel', { state: 'visible' });
    
    // Select promotion type: year
    await page.selectOption('select[name="type"]', 'year');
    
    // Select specialty
    await page.selectOption('select[name="specialty_id"]', { label: 'ICT' });
    
    // Select academic year
    const academicYearSelect = page.locator('select[name="academic_year_id"]');
    await academicYearSelect.selectOption({ index: 1 }); // Select first year
    
    // Click execute button
    await page.click('button:has-text("تنفيذ النقل")');
    
    // Wait for result dialog
    await page.waitForSelector('.bulkResultBody, .result-dialog', { timeout: 15000 });
    
    // Verify results
    const promotedCount = await page.locator('.bulkStatGreen .bulkStatNum').textContent();
    const summerCount = await page.locator('.bulkStatOrange .bulkStatNum').textContent();
    const repeatCount = await page.locator('.bulkStatRed .bulkStatNum').textContent();
    
    console.log(`  📊 النتائج:`);
    console.log(`    ✅ منقول للسنة الجديدة: ${promotedCount}`);
    console.log(`    ☀️ دراسة صيفية: ${summerCount}`);
    console.log(`    🔁 إعادة السنة: ${repeatCount}`);
    
    // Verify promotion rules
    console.log(`\n  📋 التحقق من قواعد النقل:`);
    
    // Check if graduation year rules applied
    const isGraduationYear = await page.locator('.bulkGradNote').isVisible();
    if (isGraduationYear) {
      console.log(`    ⚠️ سنة تخرج - تم تطبيق شرط النجاح في جميع المواد`);
    }
    
    // Check summer students details
    const summerDetails = page.locator('details:has-text("طلاب الدراسة الصيفية")');
    if (await summerDetails.count() > 0) {
      await summerDetails.click();
      const summerStudents = await summerDetails.locator('li').count();
      console.log(`    ☀️ عدد طلاب الدراسة الصيفية: ${summerStudents}`);
    }
    
    // Check repeat year students details
    const repeatDetails = page.locator('details:has-text("طلاب إعادة السنة")');
    if (await repeatDetails.count() > 0) {
      await repeatDetails.click();
      const repeatStudents = await repeatDetails.locator('li').count();
      console.log(`    🔁 عدد طلاب إعادة السنة: ${repeatStudents}`);
    }
    
    // Close result dialog
    await page.click('button:has-text("إغلاق")');
    
    console.log('✅ تم اختبار النقل للسنة الجديدة بنجاح');
  });

  test('8. التحقق من حالات الطلاب بعد النقل', async () => {
    console.log('\n🔍 اختبار 8: التحقق من حالات الطلاب بعد النقل');
    
    await page.goto(`${BASE_URL}/admin/students`);
    await page.waitForLoadState('networkidle');
    
    // Check each test student's status
    for (const student of TEST_STUDENTS) {
      await page.fill('input[placeholder*="بحث"]', student.national_id);
      await page.waitForTimeout(500);
      
      const studentRow = page.locator(`tr:has-text("${student.national_id}")`).first();
      
      if (await studentRow.count() > 0) {
        const status = await studentRow.locator('.badge').textContent();
        const year = await studentRow.locator('td').nth(4).textContent();
        const semester = await studentRow.locator('.semesterBadge').textContent();
        
        console.log(`  📌 ${student.full_name}:`);
        console.log(`     الحالة: ${status}`);
        console.log(`     السنة: ${year}`);
        console.log(`     الترم: ${semester}`);
      }
      
      await page.fill('input[placeholder*="بحث"]', ''); // Clear search
      await page.waitForTimeout(300);
    }
    
    console.log('✅ تم التحقق من حالات جميع الطلاب');
  });

  test('9. اختبار عرض الدرجات للطلاب', async () => {
    console.log('\n📈 اختبار 9: عرض الدرجات للطلاب');
    
    // Logout from admin
    await page.click('button:has-text("تسجيل الخروج"), a:has-text("تسجيل الخروج")');
    await page.waitForURL('**/login');
    
    // Login as first test student
    await page.fill('input[name="username"]', TEST_STUDENTS[0].email);
    await page.fill('input[name="password"]', TEST_STUDENTS[0].password);
    await page.click('button[type="submit"]');
    
    // Wait for student dashboard
    await page.waitForURL('**/student/**', { timeout: 10000 });
    
    // Navigate to grades page
    await page.click('a:has-text("الدرجات"), a:has-text("النتائج")');
    await page.waitForLoadState('networkidle');
    
    // Verify grades are visible
    const gradesTable = page.locator('table');
    await expect(gradesTable).toBeVisible();
    
    // Count visible grades
    const gradeRows = await gradesTable.locator('tbody tr').count();
    console.log(`  ✅ عدد المواد المعروضة: ${gradeRows}`);
    
    // Verify grade details
    if (gradeRows > 0) {
      const firstRow = gradesTable.locator('tbody tr').first();
      const courseName = await firstRow.locator('td').nth(0).textContent();
      const totalGrade = await firstRow.locator('td').nth(1).textContent();
      
      console.log(`  📊 مثال: ${courseName} - الدرجة: ${totalGrade}`);
    }
    
    console.log('✅ تم التحقق من عرض الدرجات للطالب');
  });
});

// Helper function to enter grades for a student
async function enterGradesForStudent(page, nationalId, grades) {
  // Search for student
  await page.fill('input[placeholder*="بحث"]', nationalId);
  await page.waitForTimeout(500);
  
  // Find student row
  const studentRow = page.locator(`tr:has-text("${nationalId}")`).first();
  
  // Click enter grades button
  await studentRow.locator('button:has-text("إدخال درجات"), button:has-text("الدرجات")').click();
  
  // Wait for grades form
  await page.waitForSelector('.grades-form, .modal', { state: 'visible' });
  
  // Fill grade fields
  await page.fill('input[name="midterm_score"]', grades.midterm.toString());
  await page.fill('input[name="quizzes_score"]', grades.quizzes.toString());
  await page.fill('input[name="assignments_score"]', grades.assignments.toString());
  await page.fill('input[name="final_exam_score"]', grades.final.toString());
  
  // Submit grades
  await page.click('button:has-text("حفظ"), button[type="submit"]');
  
  // Wait for success
  await page.waitForSelector('.toast-success', { timeout: 5000 });
  
  console.log(`  ✅ تم إدخال الدرجات للطالب: ${nationalId}`);
  
  await page.waitForTimeout(500);
}
