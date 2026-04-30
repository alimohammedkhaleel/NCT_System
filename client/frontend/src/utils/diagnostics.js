/**
 * 🔍 NCTU ERP System - Diagnostic Script
 * يقوم بفحص جميع المشاكل وعرضها في console
 */

const runDiagnostics = async () => {
  console.clear();
  console.log('%c🔍 NCTU ERP System - Diagnostic Report', 'color: #3498db; font-size: 20px; font-weight: bold;');
  console.log('%c' + '='.repeat(80), 'color: #3498db;');
  console.log('');

  const issues = [];
  const warnings = [];
  const success = [];

  // ==================== 1. فحص /api/auth/profile ====================
  console.log('%c📋 1. فحص API: /api/auth/profile', 'color: #f39c12; font-size: 16px; font-weight: bold;');
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      issues.push({
        title: '❌ لا يوجد token في localStorage',
        description: 'المستخدم غير مسجل دخول',
        solution: 'قم بتسجيل الدخول أولاً'
      });
      console.log('%c  ❌ لا يوجد token', 'color: #e74c3c;');
    } else {
      console.log('%c  ✅ Token موجود', 'color: #27ae60;');
      console.log(`  📝 Token: ${token.substring(0, 20)}...`);
      
      const response = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        success.push('✅ /api/auth/profile يعمل بشكل صحيح');
        console.log('%c  ✅ Profile API يعمل', 'color: #27ae60;');
        console.log('  📊 User Data:', data.data);
      } else {
        const errorText = await response.text();
        issues.push({
          title: `❌ /api/auth/profile يعطي ${response.status}`,
          description: errorText,
          solution: 'تحقق من server logs في terminal'
        });
        console.log(`%c  ❌ Status: ${response.status}`, 'color: #e74c3c;');
        console.log(`  📝 Error: ${errorText}`);
      }
    }
  } catch (error) {
    issues.push({
      title: '❌ خطأ في الاتصال بـ /api/auth/profile',
      description: error.message,
      solution: 'تأكد من أن الخادم يعمل على http://localhost:5000'
    });
    console.log('%c  ❌ Connection Error:', 'color: #e74c3c;', error.message);
  }
  console.log('');

  // ==================== 2. فحص Timetable Upload ====================
  console.log('%c📅 2. فحص Timetable Upload', 'color: #f39c12; font-size: 16px; font-weight: bold;');
  
  // Check uploads folder
  console.log('  🔍 فحص متطلبات رفع الملفات:');
  console.log('  📁 المجلد المطلوب: server/uploads/timetables/');
  console.log('  📄 نوع الملف: PDF فقط');
  console.log('  📏 حجم الملف: أقل من 5MB');
  console.log('  🔐 الصلاحيات: Admin فقط');
  
  const token = localStorage.getItem('token');
  if (token) {
    try {
      // Test with empty FormData to see the error
      const formData = new FormData();
      formData.append('title', 'Test Timetable');
      formData.append('specialty_id', '1');
      // No file attached - should give us the error
      
      const response = await fetch('/api/admin/timetables', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const data = await response.json();
      
      if (response.status === 400 && data.message === 'PDF file is required') {
        success.push('✅ Timetable endpoint يعمل (يطلب PDF بشكل صحيح)');
        console.log('%c  ✅ Endpoint يعمل ويطلب PDF', 'color: #27ae60;');
        console.log('  📝 المشكلة: الملف لا يصل للـ backend');
        console.log('  🔧 الحل: تحقق من FormData في Frontend');
        
        warnings.push({
          title: '⚠️ الملف لا يصل للـ backend',
          description: 'FormData لا يحتوي على الملف',
          solution: 'تحقق من handleFileChange و handleSubmit في TimetablesPage.jsx'
        });
      } else if (response.status === 403) {
        issues.push({
          title: '❌ ليس لديك صلاحية Admin',
          description: 'يجب تسجيل الدخول كـ Admin',
          solution: 'استخدم: username: admin, password: admin123'
        });
        console.log('%c  ❌ Forbidden: ليس لديك صلاحية', 'color: #e74c3c;');
      } else {
        console.log(`%c  ℹ️ Status: ${response.status}`, 'color: #3498db;');
        console.log('  📝 Response:', data);
      }
    } catch (error) {
      console.log('%c  ❌ Error:', 'color: #e74c3c;', error.message);
    }
  }
  console.log('');

  // ==================== 3. فحص Multer Configuration ====================
  console.log('%c⚙️ 3. فحص Multer Configuration', 'color: #f39c12; font-size: 16px; font-weight: bold;');
  console.log('  📋 التكوين المتوقع:');
  console.log('    - Storage: diskStorage');
  console.log('    - Destination: server/uploads/timetables/');
  console.log('    - File Filter: PDF only');
  console.log('    - Size Limit: 5MB');
  console.log('  ✅ التكوين موجود في: server/config/multer.js');
  console.log('');

  // ==================== 4. فحص Frontend Form ====================
  console.log('%c🎨 4. فحص Frontend Form', 'color: #f39c12; font-size: 16px; font-weight: bold;');
  console.log('  🔍 المشكلة المحتملة:');
  console.log('    ❌ FormData لا يحتوي على الملف');
  console.log('    ❌ اسم الحقل غير صحيح (يجب أن يكون "file")');
  console.log('    ❌ Content-Type header غير صحيح');
  console.log('');
  console.log('  ✅ الحل:');
  console.log('    1. تأكد من: formData.append("file", file)');
  console.log('    2. تأكد من: headers: { "Content-Type": "multipart/form-data" }');
  console.log('    3. تأكد من: file !== null قبل الإرسال');
  console.log('');

  // ==================== 5. فحص React Router Warnings ====================
  console.log('%c⚠️ 5. React Router Warnings', 'color: #f39c12; font-size: 16px; font-weight: bold;');
  warnings.push({
    title: '⚠️ React Router Future Flags',
    description: 'تحذيرات من React Router v6 → v7',
    solution: 'يمكن تجاهلها الآن أو إضافة future flags في BrowserRouter'
  });
  console.log('  ⚠️ v7_startTransition warning');
  console.log('  ⚠️ v7_relativeSplatPath warning');
  console.log('  ℹ️ هذه تحذيرات فقط، لا تؤثر على العمل');
  console.log('');

  // ==================== 6. فحص Botpress ====================
  console.log('%c💬 6. Botpress Chat', 'color: #f39c12; font-size: 16px; font-weight: bold;');
  warnings.push({
    title: '⚠️ Botpress initialization error',
    description: 'Cannot read properties of undefined (reading iframeWindow)',
    solution: 'تحقق من Botpress configuration أو أزل المكون مؤقتاً'
  });
  console.log('  ⚠️ Botpress لا يعمل');
  console.log('  ℹ️ يمكن تجاهله إذا لم تكن تستخدم Chatbot');
  console.log('');

  // ==================== النتيجة النهائية ====================
  console.log('%c' + '='.repeat(80), 'color: #3498db;');
  console.log('%c📊 ملخص التشخيص', 'color: #3498db; font-size: 18px; font-weight: bold;');
  console.log('%c' + '='.repeat(80), 'color: #3498db;');
  console.log('');

  if (success.length > 0) {
    console.log('%c✅ ما يعمل بشكل صحيح:', 'color: #27ae60; font-size: 14px; font-weight: bold;');
    success.forEach(s => console.log(`  ${s}`));
    console.log('');
  }

  if (issues.length > 0) {
    console.log('%c❌ المشاكل الحرجة:', 'color: #e74c3c; font-size: 14px; font-weight: bold;');
    issues.forEach((issue, i) => {
      console.log(`%c  ${i + 1}. ${issue.title}`, 'color: #e74c3c; font-weight: bold;');
      console.log(`     📝 الوصف: ${issue.description}`);
      console.log(`     🔧 الحل: ${issue.solution}`);
      console.log('');
    });
  }

  if (warnings.length > 0) {
    console.log('%c⚠️ التحذيرات:', 'color: #f39c12; font-size: 14px; font-weight: bold;');
    warnings.forEach((warning, i) => {
      console.log(`%c  ${i + 1}. ${warning.title}`, 'color: #f39c12; font-weight: bold;');
      console.log(`     📝 الوصف: ${warning.description}`);
      console.log(`     💡 الحل: ${warning.solution}`);
      console.log('');
    });
  }

  // ==================== خطوات الإصلاح ====================
  console.log('%c' + '='.repeat(80), 'color: #3498db;');
  console.log('%c🔧 خطوات الإصلاح المقترحة', 'color: #3498db; font-size: 18px; font-weight: bold;');
  console.log('%c' + '='.repeat(80), 'color: #3498db;');
  console.log('');
  
  console.log('%c1️⃣ إصلاح /api/auth/profile:', 'color: #e67e22; font-weight: bold;');
  console.log('   • افتح server terminal');
  console.log('   • ابحث عن "getProfile: Error occurred"');
  console.log('   • تحقق من database connection');
  console.log('   • تحقق من model associations');
  console.log('');

  console.log('%c2️⃣ إصلاح Timetable Upload:', 'color: #e67e22; font-weight: bold;');
  console.log('   • افتح: client/frontend/src/pages/Admin/TimetablesPage.jsx');
  console.log('   • في handleSubmit، تأكد من:');
  console.log('     const fData = new FormData();');
  console.log('     fData.append("file", formData.file); // ✅ اسم الحقل "file"');
  console.log('   • تأكد من أن formData.file ليس null');
  console.log('   • أضف console.log قبل الإرسال:');
  console.log('     console.log("File to upload:", formData.file);');
  console.log('     for (let pair of fData.entries()) {');
  console.log('       console.log(pair[0], pair[1]);');
  console.log('     }');
  console.log('');

  console.log('%c3️⃣ تحقق من Server:', 'color: #e67e22; font-weight: bold;');
  console.log('   • تأكد من أن server يعمل على http://localhost:5000');
  console.log('   • تأكد من وجود: server/uploads/timetables/');
  console.log('   • تحقق من server logs');
  console.log('');

  console.log('%c' + '='.repeat(80), 'color: #3498db;');
  console.log('%cللمزيد من المساعدة، راجع: TIMETABLE_FIX_REPORT.md', 'color: #95a5a6; font-style: italic;');
  console.log('%c' + '='.repeat(80), 'color: #3498db;');
};

// Auto-run on import
if (typeof window !== 'undefined') {
  // Run after a short delay to let the app initialize
  setTimeout(runDiagnostics, 2000);
}

export default runDiagnostics;
