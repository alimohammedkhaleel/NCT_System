
const { Student, FeeInvoice, User, defineAssociations } = require('./config/models');
const adminController = require('./controllers/adminController');

defineAssociations();

const mockRes = {
  status: function(s) { this.statusCode = s; return this; },
  json: function(j) { this.body = j; return this; }
};

(async () => {
  try {
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    if (!adminUser) { console.error('Admin user not found'); process.exit(1); }

    const mockReq = {
      user: { id: adminUser.id, role: 'admin' },
      body: {}
    };

    console.log('🚀 Starting Bulk Promotion Test...\n');

    // 1. Promote IT Year 1 (Specialty 3, Year 1 ID 1)
    console.log('--- Promoting IT Year 1 ---');
    mockReq.body = { academic_year_id: 1, specialty_id: 3 };
    await adminController.bulkPromoteStudents(mockReq, mockRes);
    console.log('Response:', JSON.stringify(mockRes.body, null, 2));

    // 2. Promote IT Year 2 (Specialty 3, Year 2 ID 2)
    console.log('\n--- Promoting IT Year 2 ---');
    mockReq.body = { academic_year_id: 2, specialty_id: 3 };
    await adminController.bulkPromoteStudents(mockReq, mockRes);
    console.log('Response:', JSON.stringify(mockRes.body, null, 2));

    // 3. Verify Results
    console.log('\n--- Verifying Student Statuses ---');
    const students = await Student.findAll({
      where: { student_code: ['F4Y1-01', 'F3Y1-01', 'F1Y2-01'] },
      include: [{ model: User, attributes: ['username'] }]
    });

    for (const s of students) {
      console.log(`Student: ${s.User.username} | Year: ${s.current_year} | Status: ${s.academic_status}`);
      
      // Check invoices
      const invoices = await FeeInvoice.findAll({ where: { student_id: s.id } });
      if (invoices.length > 0) {
        console.log(`  Invoices: ${invoices.length} found`);
        invoices.forEach(inv => console.log(`    - ${inv.invoice_number}: ${inv.total_amount} EGP (${inv.notes})`));
      } else {
        console.log('  No invoices found');
      }
    }

    console.log('\n✅ Promotion Test Completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during promotion test:', error);
    process.exit(1);
  }
})();
