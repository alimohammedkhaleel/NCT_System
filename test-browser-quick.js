/**
 * اختبار سريع للمتصفح - يمكن تشغيله مباشرة
 * Quick Browser Test - Can run immediately
 * 
 * Usage: node test-browser-quick.js
 */

const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:5173';
const ADMIN_EMAIL = 'admin@nctu.edu.eg';
const ADMIN_PASSWORD = 'admin123';

async function runQuickTest() {
  console.log('🚀 بدء الاختبار السريع...\n');
  
  const browser = await chromium.launch({ 
    headless: false,  // Show browser
    slowMo: 500       // Slow down for visibility
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Test 1: Open website
    console.log('📍 الخطوة 1: فتح الموقع...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    console.log('✅ تم فتح الموقع بنجاح\n');
    
    // Test 2: Login as admin
    console.log('🔐 الخطوة 2: تسجيل الدخول كـ Admin...');
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"], input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"], input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('**/admin/**', { timeout: 10000 });
    console.log('✅ تم تسجيل الدخول بنجاح\n');
    
    // Test 3: Navigate to Students Management
    console.log('👥 الخطوة 3: الانتقال لصفحة إدارة الطلاب...');
    await page.goto(`${BASE_URL}/admin/students`);
    await page.waitForLoadState('networkidle');
    console.log('✅ تم فتح صفحة إدارة الطلاب\n');
    
    // Test 4: Check bulk promotion panel
    console.log('🎓 الخطوة 4: فحص لوحة النقل الجماعي...');
    const bulkButton = page.locator('button:has-text("النقل الجماعي")');
    if (await bulkButton.count() > 0) {
      await bulkButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ تم فتح لوحة النقل الجماعي\n');
      
      // Check promotion options
      const semesterOption = page.locator('option:has-text("نقل جميع الطلاب للترم الثاني")');
      const yearOption = page.locator('option:has-text("نقل جميع الطلاب للسنة الجديدة")');
      
      if (await semesterOption.count() > 0) {
        console.log('  ✅ خيار النقل للترم الثاني متوفر');
      }
      if (await yearOption.count() > 0) {
        console.log('  ✅ خيار النقل للسنة الجديدة متوفر');
      }
    } else {
      console.log('⚠️ زر النقل الجماعي غير موجود\n');
    }
    
    // Test 5: Take screenshot
    console.log('\n📸 الخطوة 5: التقاط صورة للصفحة...');
    await page.screenshot({ path: 'test-screenshot-students.png', fullPage: true });
    console.log('✅ تم حفظ الصورة: test-screenshot-students.png\n');
    
    // Test 6: Check students table
    console.log('📊 الخطوة 6: فحص جدول الطلاب...');
    const table = page.locator('table');
    if (await table.count() > 0) {
      const rows = await table.locator('tbody tr').count();
      console.log(`✅ الجدول يحتوي على ${rows} صف\n`);
    } else {
      console.log('⚠️ الجدول غير موجود\n');
    }
    
    console.log('🎉 اكتمل الاختبار السريع بنجاح!\n');
    console.log('📝 الملخص:');
    console.log('  ✅ فتح الموقع');
    console.log('  ✅ تسجيل الدخول');
    console.log('  ✅ الوصول لصفحة إدارة الطلاب');
    console.log('  ✅ فحص لوحة النقل الجماعي');
    console.log('  ✅ التقاط صورة للصفحة');
    console.log('  ✅ فحص جدول الطلاب');
    
  } catch (error) {
    console.error('❌ حدث خطأ:', error.message);
    await page.screenshot({ path: 'test-error-screenshot.png' });
    console.log('📸 تم حفظ صورة الخطأ: test-error-screenshot.png');
  } finally {
    console.log('\n⏳ سيتم إغلاق المتصفح بعد 5 ثوان...');
    await page.waitForTimeout(5000);
    await browser.close();
    console.log('✅ تم إغلاق المتصفح');
  }
}

// Run the test
runQuickTest().catch(console.error);
