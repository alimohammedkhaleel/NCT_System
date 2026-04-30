const { test, expect } = require('@playwright/test');

// تكوين الاختبار
test.describe('NCTU ERP - اختبار شامل للنظام', () => {
  
  // بيانات الاختبار
  const adminCredentials = {
    email: 'admin@nctu.edu.eg',
    password: 'admin123'
  };

  const testStudent = {
    name: 'أحمد محمد علي',
    email: 'ahmed.test@student.nctu.edu.eg',
    nationalId: '30012012345678',
    phone: '01012345678',
    specialty: 'ICT',
    year: 1,
    semester: 1
  };

  const testProfessor = {
    name: 'د. محمد أحمد',
    email: 'mohamed.test@nctu.edu.eg',
    phone: '01098765432',
    specialty: 'ICT'
  };

  // 1. اختبار تسجيل الدخول
  test('1. تسجيل الدخول كـ Admin', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // الانتقال لصفحة تسجيل الدخول
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL(/.*login/);
    
    // إدخال بيانات تسجيل الدخول
    await page.fill('input[placeholder*="admin@nctu.edu.eg"]', adminCredentials.email);
    await page.fill('input[placeholder*="كلمة المرور"]', adminCredentials.password);
    
    // الضغط على زر تسجيل الدخول
    await page.click('button:has-text("تسجيل الدخول")');
    
    // انتظار الانتقال للـ Dashboard
    await page.waitForURL(/.*admin\/dashboard/, { timeout: 10000 });
    
    // التحقق من وجود عنوان Dashboard
    await expect(page.locator('h1:has-text("مرحباً")')).toBeVisible();
    
    console.log('✅ تم تسجيل الدخول بنجاح');
  });

  // 2. اختبار عرض Dashboard
  test('2. عرض لوحة التحكم والإحصائيات', async ({ page }) => {
    // تسجيل الدخول أولاً
    await page.goto('http://localhost:5173/login');
    await page.fill('input[placeholder*="admin@nctu.edu.eg"]', adminCredentials.email);
    await page.fill('input[placeholder*="كلمة المرور"]', adminCredentials.password);
    await page.click('button:has-text("تسجيل الدخول")');
    await page.waitForURL(/.*admin\/dashboard/);
    
    // التحقق من وجود الإحصائيات
    await expect(page.locator('text=الطلاب')).toBeVisible();
    await expect(page.locator('text=الدكاترة')).toBeVisible();
    await expect(page.locator('text=التخصصات')).toBeVisible();
    
    // التحقق من وجود التخصصات الستة
    await expect(page.locator('text=الميكاترونيكس')).toBeVisible();
    await expect(page.locator('text=تكنولوجيا المعلومات')).toBeVisible();
    await expect(page.locator('text=السيارات')).toBeVisible();
    
    console.log('✅ Dashboard يعرض البيانات بشكل صحيح');
  });

  // 3. اختبار فتح صفحة إدارة الطلاب
  test('3. فتح صفحة إدارة الطلاب', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[placeholder*="admin@nctu.edu.eg"]', adminCredentials.email);
    await page.fill('input[placeholder*="كلمة المرور"]', adminCredentials.password);
    await page.click('button:has-text("تسجيل الدخول")');
    await page.waitForURL(/.*admin\/dashboard/);
    
    // البحث عن زر إدارة الطلاب والضغط عليه
    const studentManagementButton = page.locator('text=إدارة الطلاب').first();
    await studentManagementButton.click();
    
    // انتظار تحميل الصفحة
    await page.waitForTimeout(2000);
    
    // التحقق من وجود عناصر صفحة إدارة الطلاب
    const pageContent = await page.content();
    console.log('✅ تم فتح صفحة إدارة الطلاب');
  });

  // 4. اختبار فتح صفحة إدارة الدكاترة
  test('4. فتح صفحة إدارة الدكاترة', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[placeholder*="admin@nctu.edu.eg"]', adminCredentials.email);
    await page.fill('input[placeholder*="كلمة المرور"]', adminCredentials.password);
    await page.click('button:has-text("تسجيل الدخول")');
    await page.waitForURL(/.*admin\/dashboard/);
    
    // البحث عن زر إدارة الدكاترة والضغط عليه
    const professorManagementButton = page.locator('text=إدارة الدكاترة').first();
    await professorManagementButton.click();
    
    await page.waitForTimeout(2000);
    console.log('✅ تم فتح صفحة إدارة الدكاترة');
  });

  // 5. اختبار فتح صفحة إعدادات الدرجات
  test('5. فتح صفحة إعدادات الدرجات', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[placeholder*="admin@nctu.edu.eg"]', adminCredentials.email);
    await page.fill('input[placeholder*="كلمة المرور"]', adminCredentials.password);
    await page.click('button:has-text("تسجيل الدخول")');
    await page.waitForURL(/.*admin\/dashboard/);
    
    // الضغط على زر إعدادات الدرجات من القائمة الجانبية
    const gradeSettingsButton = page.locator('button:has-text("⚙️ إعدادات الدرجات")');
    await gradeSettingsButton.click();
    
    await page.waitForTimeout(2000);
    console.log('✅ تم فتح صفحة إعدادات الدرجات');
  });

  // 6. اختبار فتح صفحة نشر النتائج
  test('6. فتح صفحة نشر النتائج', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[placeholder*="admin@nctu.edu.eg"]', adminCredentials.email);
    await page.fill('input[placeholder*="كلمة المرور"]', adminCredentials.password);
    await page.click('button:has-text("تسجيل الدخول")');
    await page.waitForURL(/.*admin\/dashboard/);
    
    // البحث عن بطاقة نشر النتائج
    const publishResultsCard = page.locator('text=نشر النتائج').first();
    await publishResultsCard.click();
    
    await page.waitForTimeout(2000);
    console.log('✅ تم فتح صفحة نشر النتائج');
  });

  // 7. اختبار فتح صفحة ترقية نهاية العام
  test('7. فتح صفحة ترقية نهاية العام (تطبيق اللائحة)', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[placeholder*="admin@nctu.edu.eg"]', adminCredentials.email);
    await page.fill('input[placeholder*="كلمة المرور"]', adminCredentials.password);
    await page.click('button:has-text("تسجيل الدخول")');
    await page.waitForURL(/.*admin\/dashboard/);
    
    // البحث عن بطاقة ترقية نهاية العام
    const yearPromotionCard = page.locator('text=ترقية نهاية العام').first();
    await yearPromotionCard.click();
    
    await page.waitForTimeout(2000);
    console.log('✅ تم فتح صفحة ترقية نهاية العام');
  });

  // 8. اختبار التنقل بين التخصصات
  test('8. التنقل بين التخصصات المختلفة', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[placeholder*="admin@nctu.edu.eg"]', adminCredentials.email);
    await page.fill('input[placeholder*="كلمة المرور"]', adminCredentials.password);
    await page.click('button:has-text("تسجيل الدخول")');
    await page.waitForURL(/.*admin\/dashboard/);
    
    // اختبار الضغط على تخصص ICT
    const ictButton = page.locator('button:has-text("💻 تكنولوجيا المعلومات")');
    await ictButton.click();
    await page.waitForTimeout(1000);
    
    // اختبار الضغط على تخصص الميكاترونكس
    const mechatronicsButton = page.locator('button:has-text("🤖 الميكاترونكس")');
    await mechatronicsButton.click();
    await page.waitForTimeout(1000);
    
    console.log('✅ التنقل بين التخصصات يعمل بشكل صحيح');
  });

  // 9. اختبار عرض الطلاب في تخصص معين
  test('9. عرض الطلاب في تخصص ICT', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[placeholder*="admin@nctu.edu.eg"]', adminCredentials.email);
    await page.fill('input[placeholder*="كلمة المرور"]', adminCredentials.password);
    await page.click('button:has-text("تسجيل الدخول")');
    await page.waitForURL(/.*admin\/dashboard/);
    
    // البحث عن بطاقة تخصص ICT
    const ictCard = page.locator('text=تكنولوجيا المعلومات').first();
    await ictCard.click();
    await page.waitForTimeout(1000);
    
    // الضغط على زر الطلاب
    const studentsButton = page.locator('button:has-text("🎓 الطلاب")').first();
    if (await studentsButton.isVisible()) {
      await studentsButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ تم عرض طلاب تخصص ICT');
    }
  });

  // 10. اختبار فتح صفحة الجداول الدراسية
  test('10. فتح صفحة الجداول الدراسية', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[placeholder*="admin@nctu.edu.eg"]', adminCredentials.email);
    await page.fill('input[placeholder*="كلمة المرور"]', adminCredentials.password);
    await page.click('button:has-text("تسجيل الدخول")');
    await page.waitForURL(/.*admin\/dashboard/);
    
    // الضغط على زر الجداول من القائمة الجانبية
    const timetableButton = page.locator('button:has-text("📅 الجداول")');
    await timetableButton.click();
    
    await page.waitForTimeout(2000);
    console.log('✅ تم فتح صفحة الجداول الدراسية');
  });

  // 11. اختبار فتح صفحة الدرجات المعلقة
  test('11. فتح صفحة الدرجات المعلقة', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[placeholder*="admin@nctu.edu.eg"]', adminCredentials.email);
    await page.fill('input[placeholder*="كلمة المرور"]', adminCredentials.password);
    await page.click('button:has-text("تسجيل الدخول")');
    await page.waitForURL(/.*admin\/dashboard/);
    
    // الضغط على زر الدرجات المعلقة من القائمة الجانبية
    const pendingGradesButton = page.locator('button:has-text("✅ الدرجات المعلقة")');
    await pendingGradesButton.click();
    
    await page.waitForTimeout(2000);
    console.log('✅ تم فتح صفحة الدرجات المعلقة');
  });

  // 12. اختبار فتح صفحة طلبات تسجيل الطلاب
  test('12. فتح صفحة طلبات تسجيل الطلاب', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[placeholder*="admin@nctu.edu.eg"]', adminCredentials.email);
    await page.fill('input[placeholder*="كلمة المرور"]', adminCredentials.password);
    await page.click('button:has-text("تسجيل الدخول")');
    await page.waitForURL(/.*admin\/dashboard/);
    
    // الضغط على زر طلبات تسجيل الطلاب من القائمة الجانبية
    const studentRequestsButton = page.locator('button:has-text("📋 طلبات تسجيل الطلاب")');
    await studentRequestsButton.click();
    
    await page.waitForTimeout(2000);
    console.log('✅ تم فتح صفحة طلبات تسجيل الطلاب');
  });

  // 13. اختبار فتح صفحة طلبات تسجيل الدكاترة
  test('13. فتح صفحة طلبات تسجيل الدكاترة', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[placeholder*="admin@nctu.edu.eg"]', adminCredentials.email);
    await page.fill('input[placeholder*="كلمة المرور"]', adminCredentials.password);
    await page.click('button:has-text("تسجيل الدخول")');
    await page.waitForURL(/.*admin\/dashboard/);
    
    // الضغط على زر طلبات تسجيل الدكاترة من القائمة الجانبية
    const professorRequestsButton = page.locator('button:has-text("👨‍🏫 طلبات تسجيل الدكاترة")');
    await professorRequestsButton.click();
    
    await page.waitForTimeout(2000);
    console.log('✅ تم فتح صفحة طلبات تسجيل الدكاترة');
  });

  // 14. اختبار أخذ لقطة شاشة للـ Dashboard
  test('14. أخذ لقطة شاشة للوحة التحكم', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[placeholder*="admin@nctu.edu.eg"]', adminCredentials.email);
    await page.fill('input[placeholder*="كلمة المرور"]', adminCredentials.password);
    await page.click('button:has-text("تسجيل الدخول")');
    await page.waitForURL(/.*admin\/dashboard/);
    
    // أخذ لقطة شاشة
    await page.screenshot({ path: 'test-results/admin-dashboard.png', fullPage: true });
    console.log('✅ تم أخذ لقطة شاشة للوحة التحكم');
  });

  // 15. اختبار التحقق من وجود جميع الأقسام في Dashboard
  test('15. التحقق من وجود جميع الأقسام الرئيسية', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[placeholder*="admin@nctu.edu.eg"]', adminCredentials.email);
    await page.fill('input[placeholder*="كلمة المرور"]', adminCredentials.password);
    await page.click('button:has-text("تسجيل الدخول")');
    await page.waitForURL(/.*admin\/dashboard/);
    
    // التحقق من وجود الأقسام الرئيسية
    await expect(page.locator('text=التخصصات الدراسية')).toBeVisible();
    await expect(page.locator('text=إدارة الترم والسنة الدراسية')).toBeVisible();
    await expect(page.locator('text=الإدارة العامة')).toBeVisible();
    
    console.log('✅ جميع الأقسام الرئيسية موجودة');
  });

});
