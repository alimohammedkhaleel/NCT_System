const { Op } = require('sequelize');
const { FeeInvoice, Payment, AcademicYear, Semester, Student, Grade, Course, User } = require('../config/models');
const SpecialtyFee = require('../models/SpecialtyFee');
const Specialty = require('../models/Specialty');

// Helper: check accountant role
const checkAccountant = (req, res) => {
  if (req.user.role !== 'accountant') {
    res.status(403).json({ success: false, message: 'Access denied. Accountant role required.' });
    return false;
  }
  return true;
};

// GET /api/accountant/summary
const getSummary = async (req, res) => {
  if (!checkAccountant(req, res)) return;
  try {
    const totalInvoicedResult = await FeeInvoice.sum('total_amount');
    const totalPaidResult = await Payment.sum('amount');

    const total_invoiced = parseFloat(totalInvoicedResult) || 0;
    const total_paid = parseFloat(totalPaidResult) || 0;
    const total_due = total_invoiced - total_paid;

    const overdue_count = await FeeInvoice.count({
      where: {
        due_date: { [Op.lt]: new Date() },
        status: { [Op.ne]: 'paid' }
      }
    });

    res.json({
      success: true,
      data: { total_invoiced, total_paid, total_due, overdue_count }
    });
  } catch (error) {
    console.error('getSummary error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch summary' });
  }
};

// GET /api/accountant/students/:id/invoices
const getStudentInvoices = async (req, res) => {
  if (!checkAccountant(req, res)) return;
  try {
    const studentId = req.params.id;

    const invoices = await FeeInvoice.findAll({
      where: { student_id: studentId },
      include: [
        { model: Payment },
        { model: AcademicYear },
        { model: Semester }
      ],
      order: [['created_at', 'DESC']]
    });

    const invoicesWithCalc = invoices.map(inv => {
      const invData = inv.toJSON();
      const paid = invData.Payments
        ? invData.Payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
        : parseFloat(invData.paid_amount) || 0;
      const remaining = parseFloat(invData.total_amount) - paid;
      return { ...invData, calculated_paid: paid, remaining };
    });

    const total = invoicesWithCalc.reduce((s, i) => s + parseFloat(i.total_amount), 0);
    const paid = invoicesWithCalc.reduce((s, i) => s + i.calculated_paid, 0);
    const due = total - paid;

    res.json({
      success: true,
      data: {
        invoices: invoicesWithCalc,
        summary: { total, paid, due }
      }
    });
  } catch (error) {
    console.error('getStudentInvoices error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student invoices' });
  }
};

// POST /api/accountant/invoices
const createInvoice = async (req, res) => {
  if (!checkAccountant(req, res)) return;
  try {
    const { student_id, academic_year_id, semester_id, total_amount, due_date, notes } = req.body;

    const year = new Date().getFullYear();
    const seq = String(Date.now()).slice(-4).padStart(4, '0');
    const invoice_number = `INV-${year}-${seq}`;

    const invoice = await FeeInvoice.create({
      invoice_number,
      student_id,
      academic_year_id,
      semester_id: semester_id || null,
      total_amount,
      paid_amount: 0,
      status: 'pending',
      due_date,
      issued_by: req.user.id,
      notes: notes || null
    });

    res.status(201).json({
      success: true,
      data: invoice,
      message: 'تم إنشاء الفاتورة بنجاح'
    });
  } catch (error) {
    console.error('createInvoice error:', error);
    res.status(500).json({ success: false, message: 'Failed to create invoice' });
  }
};

// POST /api/accountant/payments
const createPayment = async (req, res) => {
  if (!checkAccountant(req, res)) return;
  try {
    const { invoice_id, amount, payment_method, transaction_id } = req.body;

    const invoice = await FeeInvoice.findByPk(invoice_id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Generate receipt number
    const receipt_number = `RCP-${Date.now()}`;

    const payment = await Payment.create({
      receipt_number,
      student_id: invoice.student_id,
      invoice_id,
      amount,
      payment_method,
      transaction_id: transaction_id || null,
      collected_by: req.user.id
    });

    // Update invoice paid_amount and status
    const newPaid = parseFloat(invoice.paid_amount) + parseFloat(amount);
    const newStatus = newPaid >= parseFloat(invoice.total_amount) ? 'paid' : 'partial';

    await invoice.update({ paid_amount: newPaid, status: newStatus });

    res.status(201).json({
      success: true,
      data: payment,
      message: 'تم تسجيل الدفعة بنجاح'
    });
  } catch (error) {
    console.error('createPayment error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment' });
  }
};

// GET /api/accountant/specialty-fees
const getSpecialtyFees = async (req, res) => {
  if (!checkAccountant(req, res)) return;
  try {
    const specialties = await Specialty.findAll({
      where: { is_active: true },
      include: [{ model: SpecialtyFee, attributes: ['year_number', 'fee_amount', 'summer_fee', 'course_fail_fee'] }],
      order: [['code', 'ASC']]
    });
    const data = specialties.map(sp => {
      const feeMap = {};
      (sp.SpecialtyFees || []).forEach(f => {
        feeMap[`year${f.year_number}_fee`] = parseFloat(f.fee_amount);
        const sf = parseFloat(f.summer_fee || 0);
        const cf = parseFloat(f.course_fail_fee || 0);
        if (sf > 0 || !('summer_fee' in feeMap)) feeMap.summer_fee = sf;
        if (cf > 0 || !('course_fail_fee' in feeMap)) feeMap.course_fail_fee = cf;
      });
      return {
        ...sp.toJSON(),
        _year1_fee: feeMap.year1_fee ?? 0,
        _year2_fee: feeMap.year2_fee ?? 0,
        _year3_fee: feeMap.year3_fee ?? 0,
        _year4_fee: feeMap.year4_fee ?? 0,
        _summer_fee: feeMap.summer_fee ?? 0,
        _course_fail_fee: feeMap.course_fail_fee ?? 0,
      };
    });
    res.json({ success: true, data });
  } catch (error) {
    console.error('getSpecialtyFees error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/accountant/specialty-fees/:specialty_id
const updateSpecialtyFees = async (req, res) => {
  if (!checkAccountant(req, res)) return;
  try {
    const { specialty_id } = req.params;
    const { year1_fee, year2_fee, year3_fee, year4_fee, summer_fee, course_fail_fee } = req.body;
    const fees = [
      { year_number: 1, fee_amount: year1_fee || 0 },
      { year_number: 2, fee_amount: year2_fee || 0 },
      { year_number: 3, fee_amount: year3_fee || 0 },
      { year_number: 4, fee_amount: year4_fee || 0 }
    ];
    for (const fee of fees) {
      await SpecialtyFee.upsert({
        specialty_id: parseInt(specialty_id),
        ...fee,
        summer_fee: summer_fee || 0,
        course_fail_fee: course_fail_fee || 0
      });
    }
    res.json({ success: true, message: 'تم تحديث الرسوم بنجاح' });
  } catch (error) {
    console.error('updateSpecialtyFees error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/accountant/students/search?national_id=X or ?student_code=Y or ?query=Z
const searchStudent = async (req, res) => {
  if (!checkAccountant(req, res)) return;
  try {
    const { national_id, student_code, query } = req.query;

    if (!national_id && !student_code && !query) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال رقم قومي أو كود الطالب' });
    }

    // Build where clause
    const studentWhere = {};
    if (national_id) studentWhere.national_id = national_id.trim();
    if (student_code) studentWhere.student_code = student_code.trim();
    if (query) {
      studentWhere[Op.or] = [
        { national_id: { [Op.like]: `%${query.trim()}%` } },
        { student_code: { [Op.like]: `%${query.trim()}%` } }
      ];
    }

    const student = await Student.findOne({
      where: studentWhere,
      include: [
        { model: User, attributes: ['full_name', 'email', 'phone', 'username'] },
        { model: Specialty, attributes: ['name', 'arabic_name', 'code'] }
      ]
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'لم يتم العثور على الطالب' });
    }

    // Get approved grades
    const grades = await Grade.findAll({
      where: { student_id: student.id, status: 'approved' },
      include: [{ model: Course, attributes: ['course_code', 'course_name', 'arabic_name', 'credit_hours'] }],
      order: [['created_at', 'DESC']]
    });

    // Get invoices
    const invoices = await FeeInvoice.findAll({
      where: { student_id: student.id },
      include: [{ model: Payment }],
      order: [['created_at', 'DESC']]
    });

    const invoicesWithCalc = invoices.map(inv => {
      const invData = inv.toJSON();
      const paid = invData.Payments
        ? invData.Payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
        : parseFloat(invData.paid_amount) || 0;
      return { ...invData, calculated_paid: paid, remaining: parseFloat(invData.total_amount) - paid };
    });

    res.json({
      success: true,
      data: {
        student: {
          id: student.id,
          student_code: student.student_code,
          national_id: student.national_id,
          full_name: student.User?.full_name,
          email: student.User?.email,
          phone: student.User?.phone,
          specialty: student.Specialty?.arabic_name || student.Specialty?.name,
          current_year: student.current_year,
          academic_status: student.academic_status,
          enrollment_date: student.enrollment_date
        },
        grades,
        invoices: invoicesWithCalc
      }
    });
  } catch (error) {
    console.error('searchStudent error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/accountant/students - list all students with payment status
const getAllStudentsWithPayments = async (req, res) => {
  if (!checkAccountant(req, res)) return;
  try {
    const { specialty_id, current_year, status } = req.query;

    // Determine which academic_status values to include
    // summer_course and repeat_year are special filters by academic_status
    // payment statuses (paid/partial/unpaid/no_invoice) filter all active+summer+repeat students
    const ACADEMIC_STATUS_FILTERS = ['summer_course', 'repeat_year'];
    const isAcademicStatusFilter = status && ACADEMIC_STATUS_FILTERS.includes(status);

    const where = {};
    if (isAcademicStatusFilter) {
      where.academic_status = status;
    } else {
      // Default: show active + summer_course + repeat_year students
      where.academic_status = { [Op.in]: ['active', 'summer_course', 'repeat_year'] };
    }
    if (specialty_id) where.specialty_id = specialty_id;
    if (current_year) where.current_year = current_year;

    const students = await Student.findAll({
      where,
      include: [
        { model: User, attributes: ['full_name', 'email', 'phone'] },
        { model: Specialty, attributes: ['name', 'arabic_name', 'code'] },
        {
          model: FeeInvoice,
          required: false,
          include: [{ model: Payment, attributes: ['amount'] }]
        }
      ],
      order: [[User, 'full_name', 'ASC']]
    });

    const result = students.map(s => {
      const sData = s.toJSON();
      const invoices = sData.FeeInvoices || [];
      const totalDue = invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);
      const totalPaid = invoices.reduce((sum, inv) => {
        const paidFromPayments = (inv.Payments || []).reduce((ps, p) => ps + parseFloat(p.amount || 0), 0);
        return sum + (paidFromPayments || parseFloat(inv.paid_amount || 0));
      }, 0);
      const remaining = totalDue - totalPaid;

      let paymentStatus = 'no_invoice';
      if (totalDue > 0) {
        if (totalPaid >= totalDue) paymentStatus = 'paid';
        else if (totalPaid > 0) paymentStatus = 'partial';
        else paymentStatus = 'unpaid';
      }

      return {
        id: sData.id,
        student_code: sData.student_code,
        full_name: sData.User?.full_name,
        email: sData.User?.email,
        phone: sData.User?.phone,
        specialty: sData.Specialty?.arabic_name || sData.Specialty?.name,
        specialty_code: sData.Specialty?.code,
        current_year: sData.current_year,
        branch: sData.branch,
        academic_status: sData.academic_status,
        total_due: totalDue,
        total_paid: totalPaid,
        remaining,
        payment_status: paymentStatus,
        invoices_count: invoices.length
      };
    });

    // Filter by payment status if requested (only for payment-based filters)
    const filtered = !isAcademicStatusFilter && status
      ? result.filter(s => s.payment_status === status)
      : result;

    // Summary
    const summary = {
      total_students: filtered.length,
      total_due: filtered.reduce((s, st) => s + st.total_due, 0),
      total_paid: filtered.reduce((s, st) => s + st.total_paid, 0),
      total_remaining: filtered.reduce((s, st) => s + st.remaining, 0),
      paid_count: filtered.filter(s => s.payment_status === 'paid').length,
      partial_count: filtered.filter(s => s.payment_status === 'partial').length,
      unpaid_count: filtered.filter(s => s.payment_status === 'unpaid').length,
      no_invoice_count: filtered.filter(s => s.payment_status === 'no_invoice').length,
    };

    res.json({ success: true, data: filtered, summary });
  } catch (error) {
    console.error('getAllStudentsWithPayments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/accountant/invoices/auto-generate - create invoices from specialty fees for all students
const autoGenerateInvoices = async (req, res) => {
  if (!checkAccountant(req, res)) return;
  try {
    const { specialty_id, year_number, due_date } = req.body;
    if (!specialty_id || !year_number || !due_date) {
      return res.status(400).json({ success: false, message: 'يرجى تحديد التخصص والسنة الدراسية وتاريخ الاستحقاق' });
    }

    // Get the fee for this specialty/year
    const specialtyFee = await SpecialtyFee.findOne({
      where: { specialty_id, year_number: parseInt(year_number) }
    });

    if (!specialtyFee || parseFloat(specialtyFee.fee_amount) === 0) {
      return res.status(400).json({ success: false, message: `لا توجد رسوم محددة للسنة ${year_number} في هذا التخصص - يرجى إضافة الرسوم من الإدارة أولاً` });
    }

    const feeAmount = parseFloat(specialtyFee.fee_amount);

    // Find the academic_year_id for this specialty/year
    const academicYear = await AcademicYear.findOne({
      where: { specialty_id, year_number: parseInt(year_number) }
    });

    if (!academicYear) {
      return res.status(400).json({ success: false, message: `لا توجد سنة دراسية مضافة للسنة ${year_number} في هذا التخصص` });
    }

    // Get all active students in this specialty and year
    const students = await Student.findAll({
      where: { specialty_id, current_year: parseInt(year_number), academic_status: 'active' }
    });

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: `لا يوجد طلاب نشطون في السنة ${year_number} لهذا التخصص` });
    }

    let created = 0, skipped = 0;
    const year = new Date().getFullYear();

    for (const student of students) {
      // Check if invoice already exists for this student/academic_year
      const existing = await FeeInvoice.findOne({
        where: { student_id: student.id, academic_year_id: academicYear.id }
      });
      if (existing) { skipped++; continue; }

      const seq = String(Date.now() + created).slice(-6);
      await FeeInvoice.create({
        invoice_number: `INV-${year}-${seq}`,
        student_id: student.id,
        academic_year_id: academicYear.id,
        total_amount: feeAmount,
        paid_amount: 0,
        status: 'pending',
        due_date,
        issued_by: req.user.id,
        notes: `رسوم دراسية - السنة ${year_number}`
      });
      created++;
    }

    res.json({
      success: true,
      message: `تم إنشاء ${created} فاتورة بنجاح لطلاب السنة ${year_number} (${feeAmount.toLocaleString('ar-EG')} ج.م لكل طالب)${skipped > 0 ? ` - تم تخطي ${skipped} طالب لوجود فاتورة مسبقة` : ''}`,
      data: { created, skipped, fee_amount: feeAmount, total_students: students.length }
    });
  } catch (error) {
    console.error('autoGenerateInvoices error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/accountant/payments/by-student - record payment directly by student_id
const createPaymentByStudent = async (req, res) => {
  if (!checkAccountant(req, res)) return;
  try {
    const { student_id, amount, payment_method, transaction_id, notes } = req.body;
    if (!student_id || !amount) {
      return res.status(400).json({ success: false, message: 'يرجى تحديد الطالب والمبلغ' });
    }

    // Find the most recent unpaid/partial invoice for this student
    const invoice = await FeeInvoice.findOne({
      where: {
        student_id,
        status: { [Op.in]: ['pending', 'partial', 'overdue'] }
      },
      order: [['created_at', 'DESC']]
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'لا توجد فواتير مستحقة لهذا الطالب' });
    }

    const receipt_number = `RCP-${Date.now()}`;
    const payment = await Payment.create({
      receipt_number,
      student_id,
      invoice_id: invoice.id,
      amount: parseFloat(amount),
      payment_method: payment_method || 'cash',
      transaction_id: transaction_id || null,
      collected_by: req.user.id,
      notes: notes || null
    });

    const newPaid = parseFloat(invoice.paid_amount) + parseFloat(amount);
    const newStatus = newPaid >= parseFloat(invoice.total_amount) ? 'paid' : 'partial';
    await invoice.update({ paid_amount: newPaid, status: newStatus });

    // Also update student total_paid
    const student = await Student.findByPk(student_id);
    if (student) {
      await student.update({ total_paid: parseFloat(student.total_paid || 0) + parseFloat(amount) });
    }

    res.status(201).json({
      success: true,
      data: {
        payment,
        invoice_status: newStatus,
        paid_amount: newPaid,
        total_amount: parseFloat(invoice.total_amount),
        remaining: parseFloat(invoice.total_amount) - newPaid,
        fully_paid: newStatus === 'paid'
      },
      message: newStatus === 'paid' ? '✅ تم دفع المصاريف بالكامل' : `تم تسجيل دفعة ${amount} ج.م - المتبقي: ${(parseFloat(invoice.total_amount) - newPaid).toFixed(2)} ج.م`
    });
  } catch (error) {
    console.error('createPaymentByStudent error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/accountant/invoices/summer - generate summer course invoices for summer_course students
const generateSummerInvoices = async (req, res) => {
  if (!checkAccountant(req, res)) return;
  try {
    const { specialty_id, due_date } = req.body;
    if (!due_date) {
      return res.status(400).json({ success: false, message: 'يرجى تحديد تاريخ الاستحقاق' });
    }

    // Find all students with summer_course status
    const where = { academic_status: 'summer_course' };
    if (specialty_id) where.specialty_id = specialty_id;

    const students = await Student.findAll({
      where,
      include: [
        { model: User, attributes: ['full_name'] },
        { model: Specialty, attributes: ['name', 'arabic_name', 'code'] }
      ]
    });

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'لا يوجد طلاب في الدراسة الصيفية' });
    }

    let created = 0, skipped = 0, errors = [];
    const year = new Date().getFullYear();

    for (const student of students) {
      try {
        // Get summer_fee for this student's specialty and year
        const specialtyFee = await SpecialtyFee.findOne({
          where: { specialty_id: student.specialty_id, year_number: student.current_year }
        });

        const summerFee = parseFloat(specialtyFee?.summer_fee || 0);
        if (summerFee === 0) {
          errors.push(`${student.student_code}: لم يتم تحديد رسوم صيفية للتخصص`);
          skipped++;
          continue;
        }

        // Get academic_year_id
        const academicYear = await AcademicYear.findOne({
          where: { specialty_id: student.specialty_id, year_number: student.current_year }
        });

        if (!academicYear) {
          errors.push(`${student.student_code}: لا توجد سنة دراسية مضافة`);
          skipped++;
          continue;
        }

        // Check if summer invoice already exists
        const existing = await FeeInvoice.findOne({
          where: {
            student_id: student.id,
            academic_year_id: academicYear.id,
            notes: { [Op.like]: '%صيفية%' }
          }
        });

        if (existing) { skipped++; continue; }

        const seq = String(Date.now() + created).slice(-6);
        await FeeInvoice.create({
          invoice_number: `SUM-${year}-${seq}`,
          student_id: student.id,
          academic_year_id: academicYear.id,
          total_amount: summerFee,
          paid_amount: 0,
          status: 'pending',
          due_date,
          issued_by: req.user.id,
          notes: `رسوم الدراسة الصيفية - السنة ${student.current_year}`
        });
        created++;
      } catch (err) {
        errors.push(`${student.student_code}: ${err.message}`);
        skipped++;
      }
    }

    res.json({
      success: true,
      message: `تم إنشاء ${created} فاتورة صيفية${skipped > 0 ? ` - تم تخطي ${skipped}` : ''}`,
      data: { created, skipped, total_summer_students: students.length, errors: errors.slice(0, 10) }
    });
  } catch (error) {
    console.error('generateSummerInvoices error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/accountant/invoices/course-fail - generate course failure invoices per failed course
const generateCourseFailInvoices = async (req, res) => {
  if (!checkAccountant(req, res)) return;
  try {
    const { specialty_id, academic_year_id, due_date } = req.body;
    if (!academic_year_id || !due_date) {
      return res.status(400).json({ success: false, message: 'يرجى تحديد السنة الدراسية وتاريخ الاستحقاق' });
    }

    // Get the academic year to find specialty and year_number
    const academicYear = await AcademicYear.findByPk(academic_year_id, {
      include: [{ model: Specialty, attributes: ['id', 'name', 'arabic_name', 'code'] }]
    });

    if (!academicYear) {
      return res.status(404).json({ success: false, message: 'السنة الدراسية غير موجودة' });
    }

    const specId = specialty_id || academicYear.specialty_id;

    // Get course_fail_fee for this specialty/year
    const specialtyFee = await SpecialtyFee.findOne({
      where: { specialty_id: specId, year_number: academicYear.year_number }
    });

    const courseFailFee = parseFloat(specialtyFee?.course_fail_fee || 0);
    if (courseFailFee === 0) {
      return res.status(400).json({ success: false, message: 'لم يتم تحديد رسوم الرسوب في المادة لهذا التخصص - يرجى إضافتها من صفحة الرسوم الدراسية' });
    }

    // Find all approved failed grades for this academic year
    const failedGrades = await Grade.findAll({
      where: {
        academic_year_id,
        status: 'approved',
        final_result: { [Op.in]: ['Fail', 'Refer'] }
      },
      include: [
        {
          model: Student,
          where: { specialty_id: specId },
          include: [{ model: User, attributes: ['full_name'] }]
        },
        { model: Course, attributes: ['course_code', 'course_name', 'arabic_name'] }
      ]
    });

    if (failedGrades.length === 0) {
      return res.status(404).json({ success: false, message: 'لا توجد مواد راسبة معتمدة لهذه السنة الدراسية' });
    }

    let created = 0, skipped = 0;
    const year = new Date().getFullYear();

    for (const grade of failedGrades) {
      // Check if invoice already exists for this student/course
      const existing = await FeeInvoice.findOne({
        where: {
          student_id: grade.student_id,
          academic_year_id,
          notes: { [Op.like]: `%${grade.course_id}%` }
        }
      });

      if (existing) { skipped++; continue; }

      const courseName = grade.Course?.arabic_name || grade.Course?.course_name || grade.Course?.course_code;
      const seq = String(Date.now() + created).slice(-6);

      await FeeInvoice.create({
        invoice_number: `FAIL-${year}-${seq}`,
        student_id: grade.student_id,
        academic_year_id,
        total_amount: courseFailFee,
        paid_amount: 0,
        status: 'pending',
        due_date,
        issued_by: req.user.id,
        notes: `رسوم رسوب في مادة: ${courseName} [course:${grade.course_id}]`
      });
      created++;
    }

    res.json({
      success: true,
      message: `تم إنشاء ${created} فاتورة رسوب في مادة (${courseFailFee.toLocaleString('ar-EG')} ج.م لكل مادة)${skipped > 0 ? ` - تم تخطي ${skipped} مكرر` : ''}`,
      data: { created, skipped, total_failed_grades: failedGrades.length, fee_per_course: courseFailFee }
    });
  } catch (error) {
    console.error('generateCourseFailInvoices error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/accountant/invoices/discount-by-student - apply scholarship discount to a student's unpaid invoices
const applyDiscountByStudent = async (req, res) => {
  if (!checkAccountant(req, res)) return;
  try {
    const { student_id, discount_amount, reason } = req.body;

    if (!student_id || !discount_amount || parseFloat(discount_amount) <= 0) {
      return res.status(400).json({ success: false, message: 'يرجى تحديد الطالب ومبلغ الخصم' });
    }

    // Find the most recent unpaid/partial invoice for this student
    const invoice = await FeeInvoice.findOne({
      where: {
        student_id,
        status: { [Op.in]: ['pending', 'partial', 'overdue'] }
      },
      order: [['created_at', 'DESC']]
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'لا توجد فواتير مستحقة لهذا الطالب' });
    }

    const originalAmount = parseFloat(invoice.total_amount);
    const discountValue = parseFloat(discount_amount);

    if (discountValue >= originalAmount) {
      return res.status(400).json({
        success: false,
        message: `مبلغ الخصم (${discountValue}) لا يمكن أن يكون أكبر من أو يساوي إجمالي الفاتورة (${originalAmount})`
      });
    }

    const newTotal = originalAmount - discountValue;
    const currentPaid = parseFloat(invoice.paid_amount || 0);
    const newStatus = currentPaid >= newTotal ? 'paid' : currentPaid > 0 ? 'partial' : 'pending';

    const discountNote = `[خصم منحة: ${discountValue} ج.م${reason ? ` — ${reason}` : ''}]`;
    const updatedNotes = invoice.notes
      ? `${invoice.notes}\n${discountNote}`
      : discountNote;

    await invoice.update({
      total_amount: newTotal,
      status: newStatus,
      notes: updatedNotes
    });

    res.json({
      success: true,
      message: `تم تطبيق خصم ${discountValue.toLocaleString('ar-EG')} ج.م — المبلغ الجديد: ${newTotal.toLocaleString('ar-EG')} ج.م`,
      data: {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        original_amount: originalAmount,
        discount_amount: discountValue,
        new_total: newTotal,
        new_status: newStatus
      }
    });
  } catch (error) {
    console.error('applyDiscountByStudent error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getSummary,
  getStudentInvoices,
  createInvoice,
  createPayment,
  createPaymentByStudent,
  getSpecialtyFees,
  updateSpecialtyFees,
  searchStudent,
  getAllStudentsWithPayments,
  autoGenerateInvoices,
  generateSummerInvoices,
  generateCourseFailInvoices,
  applyDiscountByStudent
};