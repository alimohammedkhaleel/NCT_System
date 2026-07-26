import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/apiService';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import styles from './AccountantDashboard.module.css';

// ─── helpers ────────────────────────────────────────────────────────────────

const STATUS_LABELS = {
  paid: 'مدفوعة',
  partial: 'جزئي',
  unpaid: 'غير مدفوعة',
  overdue: 'متأخرة',
};

const STATUS_BADGE = {
  paid: styles.badgePaid,
  partial: styles.badgePartial,
  unpaid: styles.badgeUnpaid,
  overdue: styles.badgeOverdue,
};

const isOverdue = (invoice) =>
  invoice.status === 'overdue' ||
  (invoice.status !== 'paid' && new Date(invoice.due_date) < new Date());

const fmt = (n) =>
  Number(n || 0).toLocaleString('ar-EG', { minimumFractionDigits: 2 });

// ─── Payment Modal ───────────────────────────────────────────────────────────

function PaymentModal({ invoices, onClose, onSuccess }) {
  const [form, setForm] = useState({
    invoice_id: invoices[0]?.id || '',
    amount: '',
    payment_method: 'cash',
    transaction_id: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.invoice_id || !form.amount) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/accountant/payments', {
        invoice_id: Number(form.invoice_id),
        amount: Number(form.amount),
        payment_method: form.payment_method,
        transaction_id: form.transaction_id || undefined,
      });
      toast.success('تم تسجيل الدفعة بنجاح');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل تسجيل الدفعة');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>تسجيل دفعة</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>الفاتورة *</label>
            <select name="invoice_id" value={form.invoice_id} onChange={handleChange} required>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_number} — {fmt(inv.total_amount)} ج.م
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>المبلغ *</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              placeholder="0.00"
            />
          </div>
          <div className={styles.formGroup}>
            <label>طريقة الدفع *</label>
            <select name="payment_method" value={form.payment_method} onChange={handleChange}>
              <option value="cash">نقدي</option>
              <option value="bank_transfer">تحويل بنكي</option>
              <option value="card">بطاقة</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>رقم المعاملة (اختياري)</label>
            <input
              type="text"
              name="transaction_id"
              value={form.transaction_id}
              onChange={handleChange}
              placeholder="رقم المعاملة"
            />
          </div>
          <div className={styles.modalActions}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              إلغاء
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={submitting}>
              {submitting ? 'جاري الحفظ...' : 'تسجيل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Invoice Modal ───────────────────────────────────────────────────────────

function InvoiceModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    student_id: '',
    academic_year_id: '',
    semester_id: '',
    total_amount: '',
    due_date: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studRes, yearsRes] = await Promise.all([
          api.get('/admin/students'),
          api.get('/accountant/academic-years'),
        ]);
        setStudents(studRes.data.data || []);
        setAcademicYears(yearsRes.data.data || []);
      } catch (err) {
        toast.error('فشل تحميل البيانات');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!form.academic_year_id) { setSemesters([]); return; }
    api.get('/admin/semesters', { params: { academic_year_id: form.academic_year_id } })
      .then(res => setSemesters(res.data.data || []))
      .catch(() => setSemesters([]));
  }, [form.academic_year_id]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.student_id || !form.academic_year_id || !form.total_amount || !form.due_date) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/accountant/invoices', {
        student_id: Number(form.student_id),
        academic_year_id: Number(form.academic_year_id),
        semester_id: form.semester_id ? Number(form.semester_id) : undefined,
        total_amount: Number(form.total_amount),
        due_date: form.due_date,
        notes: form.notes || undefined,
      });
      toast.success('تم إنشاء الفاتورة بنجاح');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل إنشاء الفاتورة');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>إنشاء فاتورة</h2>
        {loadingData ? (
          <div className={styles.center}><div className={styles.spinner} /><span>جاري التحميل...</span></div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>الطالب *</label>
              <select name="student_id" value={form.student_id} onChange={handleChange} required>
                <option value="">— اختر الطالب —</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.User?.full_name || s.student_code} — {s.student_code}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>العام الدراسي *</label>
              <select name="academic_year_id" value={form.academic_year_id} onChange={handleChange} required>
                <option value="">— اختر العام الدراسي —</option>
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.Specialty?.arabic_name || y.Specialty?.name} — السنة {y.year_number}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>الفصل الدراسي (اختياري)</label>
              <select name="semester_id" value={form.semester_id} onChange={handleChange} disabled={!form.academic_year_id}>
                <option value="">— كل الفصول —</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>{s.semester_name}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>إجمالي المبلغ *</label>
              <input type="number" name="total_amount" value={form.total_amount} onChange={handleChange} min="0.01" step="0.01" required placeholder="0.00" />
            </div>
            <div className={styles.formGroup}>
              <label>تاريخ الاستحقاق *</label>
              <input type="date" name="due_date" value={form.due_date} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label>ملاحظات (اختياري)</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="ملاحظات إضافية" />
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.btnSecondary} onClick={onClose}>إلغاء</button>
              <button type="submit" className={styles.btnPrimary} disabled={submitting}>
                {submitting ? 'جاري الحفظ...' : 'إنشاء'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
// ─── Students Payment Tab ────────────────────────────────────────────────────

function StudentsPaymentTab() {
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState([]);
  const [filters, setFilters] = useState({ specialty_id: '', current_year: '', status: '' });
  const [codeSearch, setCodeSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', payment_method: 'cash', transaction_id: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showAutoGenerate, setShowAutoGenerate] = useState(false);
  const [autoForm, setAutoForm] = useState({ specialty_id: '', year_number: '', due_date: '' });
  const [generating, setGenerating] = useState(false);

  // Discount (scholarship) state
  const [discountStudent, setDiscountStudent] = useState(null);
  const [discountForm, setDiscountForm] = useState({ amount: '', reason: '' });
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  // Summer & Course-Fail invoice modals
  const [showSummerModal, setShowSummerModal] = useState(false);
  const [showCourseFailModal, setShowCourseFailModal] = useState(false);
  const [summerForm, setSummerForm] = useState({ specialty_id: '', due_date: '' });
  const [courseFailForm, setCourseFailForm] = useState({ specialty_id: '', academic_year_id: '', due_date: '' });
  const [academicYears, setAcademicYears] = useState([]);
  const [courseFailYears, setCourseFailYears] = useState([]);
  const [generatingSummer, setGeneratingSummer] = useState(false);
  const [generatingCourseFail, setGeneratingCourseFail] = useState(false);

  useEffect(() => {
    api.get('/specialties').then(r => setSpecialties(r.data.data || [])).catch(() => {});
  }, []);

  // Fetch academic years for course-fail modal
  useEffect(() => {
    api.get('/accountant/academic-years').then(r => setAcademicYears(r.data.data || [])).catch(() => {});
  }, []);

  // Fetch academic years filtered by specialty for course-fail modal
  useEffect(() => {
    if (!courseFailForm.specialty_id) { setCourseFailYears([]); return; }
    api.get('/accountant/academic-years', { params: { specialty_id: courseFailForm.specialty_id } })
      .then(r => setCourseFailYears(r.data.data || []))
      .catch(() => setCourseFailYears([]));
  }, [courseFailForm.specialty_id]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.specialty_id) params.specialty_id = filters.specialty_id;
      if (filters.current_year) params.current_year = filters.current_year;
      if (filters.status) params.status = filters.status;
      const res = await api.get('/accountant/students', { params });
      setStudents(res.data.data || []);
      setSummary(res.data.summary || null);
    } catch (err) {
      toast.error('فشل تحميل بيانات الطلاب');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !paymentForm.amount) return;
    setSubmitting(true);
    try {
      const res = await api.post('/accountant/payments/by-student', {
        student_id: selectedStudent.id,
        amount: parseFloat(paymentForm.amount),
        payment_method: paymentForm.payment_method,
        transaction_id: paymentForm.transaction_id || undefined,
      });
      toast.success(res.data.message);
      setSelectedStudent(null);
      setPaymentForm({ amount: '', payment_method: 'cash', transaction_id: '' });
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل تسجيل الدفعة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await api.post('/accountant/invoices/auto-generate', autoForm);
      toast.success(res.data.message);
      setShowAutoGenerate(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل إنشاء الفواتير');
    } finally {
      setGenerating(false);
    }
  };

  const handleApplyDiscount = async (e) => {
    e.preventDefault();
    if (!discountStudent || !discountForm.amount) return;
    setApplyingDiscount(true);
    try {
      const res = await api.post('/accountant/invoices/discount-by-student', {
        student_id: discountStudent.id,
        discount_amount: parseFloat(discountForm.amount),
        reason: discountForm.reason || undefined,
      });
      toast.success(res.data.message);
      setDiscountStudent(null);
      setDiscountForm({ amount: '', reason: '' });
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل تطبيق الخصم');
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handleSummerInvoices = async (e) => {
    e.preventDefault();
    setGeneratingSummer(true);
    try {
      const res = await api.post('/accountant/invoices/summer', summerForm);
      toast.success(res.data.message);
      setShowSummerModal(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل إنشاء فواتير الصيفي');
    } finally {
      setGeneratingSummer(false);
    }
  };

  const handleCourseFailInvoices = async (e) => {
    e.preventDefault();
    setGeneratingCourseFail(true);
    try {
      const res = await api.post('/accountant/invoices/course-fail', {
        specialty_id: courseFailForm.specialty_id || undefined,
        academic_year_id: courseFailForm.academic_year_id,
        due_date: courseFailForm.due_date,
      });
      toast.success(res.data.message);
      setShowCourseFailModal(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل إنشاء فواتير الرسوب');
    } finally {
      setGeneratingCourseFail(false);
    }
  };
  const PAYMENT_STATUS = {
    paid: { label: 'مدفوع بالكامل', cls: styles.badgePaid },
    partial: { label: 'دفع جزئي', cls: styles.badgePartial },
    unpaid: { label: 'لم يدفع', cls: styles.badgeUnpaid },
    no_invoice: { label: 'بدون فاتورة', cls: styles.badgeOverdue },
  };

  const ACADEMIC_STATUS_BADGE = {
    summer_course: { label: '☀️ صيفي', cls: styles.badgePartial },
    repeat_year: { label: '🔁 إعادة سنة', cls: styles.badgeUnpaid },
    active: { label: 'نشط', cls: styles.badgePaid },
  };

  return (
    <div>
      {/* Summary Cards */}
      {summary && (
        <div className={styles.summaryGrid} style={{ marginBottom: 20 }}>
          <div className={styles.summaryCard}>
            <span className={styles.icon}>👥</span>
            <span className={styles.label}>إجمالي الطلاب</span>
            <span className={styles.value}>{summary.total_students}</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.icon}>💰</span>
            <span className={styles.label}>إجمالي المستحقات</span>
            <span className={styles.value}>{fmt(summary.total_due)} ج.م</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.icon}>✅</span>
            <span className={styles.label}>إجمالي المدفوع</span>
            <span className={styles.value}>{fmt(summary.total_paid)} ج.م</span>
          </div>
          <div className={`${styles.summaryCard} ${styles.overdue}`}>
            <span className={styles.icon}>⏳</span>
            <span className={styles.label}>المتبقي</span>
            <span className={styles.value}>{fmt(summary.total_remaining)} ج.م</span>
          </div>
        </div>
      )}

      {/* Filters + Actions */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>قائمة الطلاب والمدفوعات</span>
          <div className={styles.actionButtons}>
            <button className={styles.btnGold} onClick={() => setShowAutoGenerate(true)}>
              ⚡ إنشاء فواتير تلقائي
            </button>
            <button className={styles.btnSummer} onClick={() => setShowSummerModal(true)}>
              ☀️ فاتورة صيفي
            </button>
            <button className={styles.btnCourseFail} onClick={() => setShowCourseFailModal(true)}>
              📚 فاتورة رسوب مادة
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <input
            className={styles.searchInput}
            style={{ minWidth: 180 }}
            type="text"
            placeholder="🔍 بحث بكود الطالب..."
            value={codeSearch}
            onChange={e => setCodeSearch(e.target.value)}
          />
          <select
            className={styles.searchInput}
            style={{ minWidth: 160 }}
            value={filters.specialty_id}
            onChange={e => setFilters(f => ({ ...f, specialty_id: e.target.value }))}
          >
            <option value="">كل التخصصات</option>
            {specialties.map(s => <option key={s.id} value={s.id}>{s.arabic_name || s.name}</option>)}
          </select>
          <select
            className={styles.searchInput}
            style={{ minWidth: 130 }}
            value={filters.current_year}
            onChange={e => setFilters(f => ({ ...f, current_year: e.target.value }))}
          >
            <option value="">كل السنوات</option>
            {[1,2,3,4].map(y => <option key={y} value={y}>السنة {y}</option>)}
          </select>
          <select
            className={styles.searchInput}
            style={{ minWidth: 150 }}
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          >
            <option value="">كل الحالات</option>
            <option value="paid">مدفوع بالكامل</option>
            <option value="partial">دفع جزئي</option>
            <option value="unpaid">لم يدفع</option>
            <option value="no_invoice">بدون فاتورة</option>
            <option value="summer_course">☀️ دراسة صيفية</option>
            <option value="repeat_year">🔁 إعادة سنة</option>
          </select>
        </div>

        {loading ? (
          <div className={styles.center}><div className={styles.spinner} /><span>جاري التحميل...</span></div>
        ) : students.length === 0 ? (
          <p className={styles.emptyMsg}>لا يوجد طلاب</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>الطالب</th>
                  <th>التخصص / السنة</th>
                  <th>الحالة</th>
                  <th>المستحق</th>
                  <th>المدفوع</th>
                  <th>المتبقي</th>
                  <th>المالية</th>
                  <th>إجراء</th>
                </tr>
              </thead>
              <tbody>
                {students
                  .filter(s =>
                    !codeSearch.trim() ||
                    (s.student_code || '').toLowerCase().includes(codeSearch.trim().toLowerCase())
                  )
                  .map(s => {
                  const ps = PAYMENT_STATUS[s.payment_status] || PAYMENT_STATUS.no_invoice;
                  const as = ACADEMIC_STATUS_BADGE[s.academic_status] || ACADEMIC_STATUS_BADGE.active;
                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--white)' }}>{s.full_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--white-dim)' }}>{s.student_code}</div>
                      </td>
                      <td>
                        <div>{s.specialty}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--white-dim)' }}>السنة {s.current_year}</div>
                      </td>
                      <td><span className={`${styles.badge} ${as.cls}`}>{as.label}</span></td>
                      <td style={{ color: 'var(--white)' }}>{fmt(s.total_due)} ج.م</td>
                      <td style={{ color: '#6ee7b7' }}>{fmt(s.total_paid)} ج.م</td>
                      <td style={{ color: s.remaining > 0 ? '#fca5a5' : '#6ee7b7' }}>{fmt(s.remaining)} ج.م</td>
                      <td><span className={`${styles.badge} ${ps.cls}`}>{ps.label}</span></td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {s.payment_status !== 'paid' && s.payment_status !== 'no_invoice' && (
                            <button
                              className={styles.btnPrimary}
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              onClick={() => setSelectedStudent(s)}
                            >
                              تسجيل دفعة
                            </button>
                          )}
                          {s.payment_status !== 'no_invoice' && (
                            <button
                              className={styles.btnDiscount}
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              onClick={() => { setDiscountStudent(s); setDiscountForm({ amount: '', reason: '' }); }}
                            >
                              🎓 تخفيض منحة
                            </button>
                          )}
                          {s.payment_status === 'no_invoice' && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--white-dim)' }}>لا توجد فاتورة</span>
                          )}
                          {s.payment_status === 'paid' && (
                            <span style={{ color: '#6ee7b7', fontSize: '0.85rem' }}>✅ مكتمل</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {selectedStudent && (
        <div className={styles.overlay} onClick={() => setSelectedStudent(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>تسجيل دفعة</h2>
            <div className={styles.studentInfoCard} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: 'var(--white)', marginBottom: 8 }}>{selectedStudent.full_name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <div className={styles.infoLabel}>المستحق</div>
                  <div className={styles.infoValue}>{fmt(selectedStudent.total_due)} ج.م</div>
                </div>
                <div>
                  <div className={styles.infoLabel}>المدفوع</div>
                  <div className={styles.infoValue} style={{ color: '#6ee7b7' }}>{fmt(selectedStudent.total_paid)} ج.م</div>
                </div>
                <div>
                  <div className={styles.infoLabel}>المتبقي</div>
                  <div className={styles.infoValue} style={{ color: '#fca5a5' }}>{fmt(selectedStudent.remaining)} ج.م</div>
                </div>
              </div>
            </div>
            <form onSubmit={handlePayment}>
              <div className={styles.formGroup}>
                <label>المبلغ المدفوع *</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))}
                  min="0.01"
                  max={selectedStudent.remaining}
                  step="0.01"
                  required
                  placeholder={`الحد الأقصى: ${fmt(selectedStudent.remaining)} ج.م`}
                />
              </div>
              <div className={styles.formGroup}>
                <label>طريقة الدفع</label>
                <select value={paymentForm.payment_method} onChange={e => setPaymentForm(f => ({ ...f, payment_method: e.target.value }))}>
                  <option value="cash">نقدي</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="card">بطاقة</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>رقم المعاملة (اختياري)</label>
                <input
                  type="text"
                  value={paymentForm.transaction_id}
                  onChange={e => setPaymentForm(f => ({ ...f, transaction_id: e.target.value }))}
                  placeholder="رقم الإيصال أو المعاملة"
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setSelectedStudent(null)}>إلغاء</button>
                <button type="submit" className={styles.btnPrimary} disabled={submitting}>
                  {submitting ? 'جاري الحفظ...' : 'تسجيل الدفعة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discount (Scholarship) Modal */}
      {discountStudent && (
        <div className={styles.overlay} onClick={() => setDiscountStudent(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>🎓 تخفيض منحة دراسية</h2>
            <div className={styles.studentInfoCard} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: 'var(--white)', marginBottom: 8 }}>{discountStudent.full_name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <div className={styles.infoLabel}>المستحق الأصلي</div>
                  <div className={styles.infoValue}>{fmt(discountStudent.total_due)} ج.م</div>
                </div>
                <div>
                  <div className={styles.infoLabel}>المدفوع</div>
                  <div className={styles.infoValue} style={{ color: '#6ee7b7' }}>{fmt(discountStudent.total_paid)} ج.م</div>
                </div>
                <div>
                  <div className={styles.infoLabel}>المتبقي</div>
                  <div className={styles.infoValue} style={{ color: '#fca5a5' }}>{fmt(discountStudent.remaining)} ج.م</div>
                </div>
              </div>
            </div>
            <form onSubmit={handleApplyDiscount}>
              <div className={styles.formGroup}>
                <label>مبلغ الخصم (ج.م) *</label>
                <input
                  type="number"
                  value={discountForm.amount}
                  onChange={e => setDiscountForm(f => ({ ...f, amount: e.target.value }))}
                  min="0.01"
                  max={discountStudent.total_due - 0.01}
                  step="0.01"
                  required
                  placeholder={`أقصى خصم: ${fmt(discountStudent.total_due - 0.01)} ج.م`}
                />
                {discountForm.amount && parseFloat(discountForm.amount) > 0 && (
                  <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(251,191,36,0.1)', borderRadius: 6, border: '1px solid rgba(251,191,36,0.3)', fontSize: '0.85rem', color: '#fbbf24' }}>
                    المبلغ بعد الخصم: <strong>{fmt(discountStudent.total_due - parseFloat(discountForm.amount || 0))} ج.م</strong>
                  </div>
                )}
              </div>
              <div className={styles.formGroup}>
                <label>سبب الخصم (اختياري)</label>
                <input
                  type="text"
                  value={discountForm.reason}
                  onChange={e => setDiscountForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="مثال: منحة تفوق، إعفاء جزئي..."
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setDiscountStudent(null)}>إلغاء</button>
                <button type="submit" className={styles.btnDiscount} disabled={applyingDiscount}>
                  {applyingDiscount ? 'جاري التطبيق...' : '🎓 تطبيق الخصم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auto Generate Modal */}
      {showAutoGenerate && (
        <div className={styles.overlay} onClick={() => setShowAutoGenerate(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>إنشاء فواتير تلقائي</h2>
            <p style={{ color: 'var(--white-dim)', marginBottom: 16, fontSize: '0.9rem' }}>
              سيتم إنشاء فاتورة لكل طالب نشط في التخصص والسنة المحددة بناءً على الرسوم المضافة.
            </p>
            <form onSubmit={handleAutoGenerate}>
              <div className={styles.formGroup}>
                <label>التخصص *</label>
                <select value={autoForm.specialty_id} onChange={e => setAutoForm(f => ({ ...f, specialty_id: e.target.value }))} required>
                  <option value="">— اختر التخصص —</option>
                  {specialties.map(s => <option key={s.id} value={s.id}>{s.arabic_name || s.name}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>السنة الدراسية *</label>
                <select value={autoForm.year_number} onChange={e => setAutoForm(f => ({ ...f, year_number: e.target.value }))} required>
                  <option value="">— اختر السنة —</option>
                  <option value="1">السنة الأولى</option>
                  <option value="2">السنة الثانية</option>
                  <option value="3">السنة الثالثة</option>
                  <option value="4">السنة الرابعة</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>تاريخ الاستحقاق *</label>
                <input type="date" value={autoForm.due_date} onChange={e => setAutoForm(f => ({ ...f, due_date: e.target.value }))} required />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowAutoGenerate(false)}>إلغاء</button>
                <button type="submit" className={styles.btnPrimary} disabled={generating}>
                  {generating ? 'جاري الإنشاء...' : 'إنشاء الفواتير'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summer Invoice Modal */}
      {showSummerModal && (
        <div className={styles.overlay} onClick={() => setShowSummerModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>☀️ فاتورة الدراسة الصيفية</h2>
            <p style={{ color: 'var(--white-dim)', marginBottom: 16, fontSize: '0.9rem' }}>
              سيتم إنشاء فاتورة لكل طالب حالته <strong style={{ color: '#fbbf24' }}>دراسة صيفية</strong> بناءً على رسوم الصيفي المحددة في صفحة الرسوم الدراسية.
            </p>
            <form onSubmit={handleSummerInvoices}>
              <div className={styles.formGroup}>
                <label>التخصص (اختياري — اتركه فارغاً لكل التخصصات)</label>
                <select value={summerForm.specialty_id} onChange={e => setSummerForm(f => ({ ...f, specialty_id: e.target.value }))}>
                  <option value="">— كل التخصصات —</option>
                  {specialties.map(s => <option key={s.id} value={s.id}>{s.arabic_name || s.name}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>تاريخ الاستحقاق *</label>
                <input type="date" value={summerForm.due_date} onChange={e => setSummerForm(f => ({ ...f, due_date: e.target.value }))} required />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowSummerModal(false)}>إلغاء</button>
                <button type="submit" className={styles.btnSummer} disabled={generatingSummer}>
                  {generatingSummer ? 'جاري الإنشاء...' : '☀️ إنشاء فواتير الصيفي'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Fail Invoice Modal */}
      {showCourseFailModal && (
        <div className={styles.overlay} onClick={() => setShowCourseFailModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>📚 فاتورة رسوب في مادة</h2>
            <p style={{ color: 'var(--white-dim)', marginBottom: 16, fontSize: '0.9rem' }}>
              سيتم إنشاء فاتورة لكل مادة راسب فيها الطالب (Fail أو Refer) بناءً على رسوم الرسوب المحددة في صفحة الرسوم الدراسية.
            </p>
            <form onSubmit={handleCourseFailInvoices}>
              <div className={styles.formGroup}>
                <label>التخصص *</label>
                <select
                  value={courseFailForm.specialty_id}
                  onChange={e => setCourseFailForm(f => ({ ...f, specialty_id: e.target.value, academic_year_id: '' }))}
                  required
                >
                  <option value="">— اختر التخصص —</option>
                  {specialties.map(s => <option key={s.id} value={s.id}>{s.arabic_name || s.name}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>السنة الدراسية *</label>
                <select
                  value={courseFailForm.academic_year_id}
                  onChange={e => setCourseFailForm(f => ({ ...f, academic_year_id: e.target.value }))}
                  required
                  disabled={!courseFailForm.specialty_id}
                >
                  <option value="">— اختر السنة الدراسية —</option>
                  {courseFailYears.map(y => (
                    <option key={y.id} value={y.id}>السنة {y.year_number}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>تاريخ الاستحقاق *</label>
                <input type="date" value={courseFailForm.due_date} onChange={e => setCourseFailForm(f => ({ ...f, due_date: e.target.value }))} required />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowCourseFailModal(false)}>إلغاء</button>
                <button type="submit" className={styles.btnCourseFail} disabled={generatingCourseFail}>
                  {generatingCourseFail ? 'جاري الإنشاء...' : '📚 إنشاء فواتير الرسوب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AccountantDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Active tab - start with students tab
  const [activeTab, setActiveTab] = useState('students');

  // Summary
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  // Student invoices
  const [studentId, setStudentId] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState(null);
  const [searchedId, setSearchedId] = useState(null);

  // Student search (advanced)
  const [studentSearch, setStudentSearch] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [studentSearchLoading, setStudentSearchLoading] = useState(false);
  const [studentSearchError, setStudentSearchError] = useState(null);

  // Specialty fees
  const [specialtyFees, setSpecialtyFees] = useState([]);
  const [feesLoading, setFeesLoading] = useState(false);
  const [feesError, setFeesError] = useState(null);
  const [savingFeeId, setSavingFeeId] = useState(null);

  // Modals
  const [showPayment, setShowPayment] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  // Auth guard handled by ProtectedRoute wrapper in App.jsx

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await api.get('/accountant/summary');
      setSummary(res.data.data || res.data);
    } catch (err) {
      setSummaryError(err.response?.data?.message || 'فشل تحميل الملخص المالي');
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'accountant') {
      fetchSummary();
    }
  }, [isAuthenticated, user, fetchSummary]);

  // Fetch specialty fees
  const fetchSpecialtyFees = useCallback(async () => {
    setFeesLoading(true);
    setFeesError(null);
    try {
      const res = await api.get('/accountant/specialty-fees');
      const data = res.data.data || [];
      // Normalise: build editable fee fields per specialty
      const normalised = data.map((sp) => {
        const feeMap = {};
        (sp.SpecialtyFees || []).forEach((f) => {
          feeMap[`year${f.year_number}_fee`] = f.fee_amount;
        });
        return {
          ...sp,
          _year1_fee: sp._year1_fee ?? feeMap.year1_fee ?? '',
          _year2_fee: sp._year2_fee ?? feeMap.year2_fee ?? '',
          _year3_fee: sp._year3_fee ?? feeMap.year3_fee ?? '',
          _year4_fee: sp._year4_fee ?? feeMap.year4_fee ?? '',
          _summer_fee: sp._summer_fee ?? '',
          _course_fail_fee: sp._course_fail_fee ?? '',
        };
      });
      setSpecialtyFees(normalised);
    } catch (err) {
      setFeesError(err.response?.data?.message || 'فشل تحميل الرسوم الدراسية');
    } finally {
      setFeesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'accountant' && activeTab === 'fees') {
      fetchSpecialtyFees();
    }
  }, [isAuthenticated, user, activeTab, fetchSpecialtyFees]);

  const handleFeeChange = (specialtyId, field, value) => {
    setSpecialtyFees((prev) =>
      prev.map((sp) => (sp.id === specialtyId ? { ...sp, [field]: value } : sp))
    );
  };

  const handleSaveFees = async (specialty) => {
    setSavingFeeId(specialty.id);
    try {
      await api.put(`/accountant/specialty-fees/${specialty.id}`, {
        year1_fee: specialty._year1_fee || 0,
        year2_fee: specialty._year2_fee || 0,
        year3_fee: specialty._year3_fee || 0,
        year4_fee: specialty._year4_fee || 0,
        summer_fee: specialty._summer_fee || 0,
        course_fail_fee: specialty._course_fail_fee || 0,
      });
      toast.success('تم حفظ الرسوم بنجاح');
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل حفظ الرسوم');
    } finally {
      setSavingFeeId(null);
    }
  };

  // Search student (advanced)
  const searchStudentData = async () => {
    if (!studentSearch.trim()) {
      toast.error('يرجى إدخال رقم قومي أو كود الطالب');
      return;
    }
    setStudentSearchLoading(true);
    setStudentSearchError(null);
    setStudentData(null);
    try {
      const res = await api.get('/accountant/students/search', {
        params: { query: studentSearch.trim() }
      });
      setStudentData(res.data.data);
    } catch (err) {
      setStudentSearchError(err.response?.data?.message || 'لم يتم العثور على الطالب');
    } finally {
      setStudentSearchLoading(false);
    }
  };

  // Fetch student invoices
  const fetchInvoices = async () => {
    if (!studentId.trim()) {
      toast.error('يرجى إدخال رقم الطالب');
      return;
    }
    setInvoicesLoading(true);
    setInvoicesError(null);
    setInvoices([]);
    setSearchedId(studentId.trim());
    try {
      const res = await api.get(`/accountant/students/${studentId.trim()}/invoices`);
      setInvoices(res.data.data || res.data || []);
    } catch (err) {
      setInvoicesError(err.response?.data?.message || 'فشل تحميل الفواتير');
    } finally {
      setInvoicesLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') fetchInvoices();
  };

  if (loading) {
    return (
      <div className={styles.center} style={{ minHeight: '100vh' }}>
        <div className={styles.spinner} />
        <span>جاري التحقق من الصلاحيات...</span>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1>لوحة تحكم المحاسب</h1>
        <p>إدارة الفواتير والمدفوعات</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'students' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('students')}
        >
          الطلاب والمصاريف
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'fees' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('fees')}
        >
          الرسوم الدراسية
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'search' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('search')}
        >
          بحث عن طالب
        </button>
      </div>

      {/* ── Students Payment Tab ── */}
      {activeTab === 'students' && <StudentsPaymentTab />}

      {/* ── Fees Tab (Read-Only View) ── */}
      {activeTab === 'fees' && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>الرسوم الدراسية للتخصصات</span>
            <button className={styles.btnSecondary} onClick={fetchSpecialtyFees} disabled={feesLoading}>
              {feesLoading ? 'جاري التحميل...' : '🔄 تحديث'}
            </button>
          </div>
          <p style={{ color: 'var(--white-dim)', fontSize: '0.85rem', marginBottom: 16 }}>
            يتم تحديد الرسوم من قِبل الإدارة. يمكنك استخدام هذه البيانات لإنشاء الفواتير من تبويب "الطلاب والمصاريف".
          </p>

          {feesLoading && (
            <div className={styles.center}>
              <div className={styles.spinner} />
              <span>جاري تحميل الرسوم...</span>
            </div>
          )}

          {feesError && (
            <div className={styles.center}>
              <span className={styles.errorMsg}>{feesError}</span>
              <button className={styles.btnSecondary} onClick={fetchSpecialtyFees}>إعادة المحاولة</button>
            </div>
          )}

          {!feesLoading && !feesError && specialtyFees.length === 0 && (
            <p className={styles.emptyMsg}>لا توجد رسوم محددة بعد - يرجى مراجعة الإدارة</p>
          )}

          {!feesLoading && specialtyFees.length > 0 && (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>التخصص</th>
                    <th>السنة الأولى</th>
                    <th>السنة الثانية</th>
                    <th>السنة الثالثة</th>
                    <th>السنة الرابعة</th>
                    <th style={{ color: '#fbbf24' }}>☀️ رسوم صيفي</th>
                    <th style={{ color: '#fca5a5' }}>📚 رسوب مادة</th>
                  </tr>
                </thead>
                <tbody>
                  {specialtyFees.map((sp) => (
                    <tr key={sp.id}>
                      <td style={{ fontWeight: 600, color: 'var(--white)' }}>
                        {sp.arabic_name || sp.name}
                        <span style={{ fontSize: '0.75rem', color: 'var(--white-dim)', marginRight: 6 }}>({sp.code})</span>
                      </td>
                      {[1, 2, 3, 4].map((yr) => (
                        <td key={yr} style={{ color: sp[`_year${yr}_fee`] > 0 ? '#6ee7b7' : 'var(--white-dim)' }}>
                          {sp[`_year${yr}_fee`] > 0 ? `${fmt(sp[`_year${yr}_fee`])} ج.م` : '—'}
                        </td>
                      ))}
                      <td style={{ color: sp._summer_fee > 0 ? '#fbbf24' : 'var(--white-dim)' }}>
                        {sp._summer_fee > 0 ? `${fmt(sp._summer_fee)} ج.م` : '—'}
                      </td>
                      <td style={{ color: sp._course_fail_fee > 0 ? '#fca5a5' : 'var(--white-dim)' }}>
                        {sp._course_fail_fee > 0 ? `${fmt(sp._course_fail_fee)} ج.م` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Search Tab ── */}
      {activeTab === 'search' && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>بحث عن طالب</span>
          </div>

          <div className={styles.searchBar} style={{ marginBottom: 'var(--spacing-lg)' }}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="أدخل رقم قومي أو كود الطالب..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') searchStudentData(); }}
            />
            <button
              className={styles.btnPrimary}
              onClick={searchStudentData}
              disabled={studentSearchLoading}
            >
              {studentSearchLoading ? 'جاري البحث...' : 'بحث'}
            </button>
          </div>

          {studentSearchLoading && (
            <div className={styles.center}>
              <div className={styles.spinner} />
              <span>جاري البحث...</span>
            </div>
          )}

          {studentSearchError && (
            <div className={styles.center}>
              <span className={styles.errorMsg}>{studentSearchError}</span>
            </div>
          )}

          {studentData && (
            <>
              {/* Student Info */}
              <div className={styles.studentInfoCard} style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ color: 'var(--purple-light)', marginBottom: 'var(--spacing-md)', fontSize: '1rem' }}>بيانات الطالب</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
                  {[
                    { label: 'الاسم', value: studentData.student.full_name },
                    { label: 'كود الطالب', value: studentData.student.student_code },
                    { label: 'الرقم القومي', value: studentData.student.national_id },
                    { label: 'التخصص', value: studentData.student.specialty },
                    { label: 'السنة الدراسية', value: studentData.student.current_year ? `السنة ${studentData.student.current_year}` : '—' },
                    { label: 'الحالة الأكاديمية', value: studentData.student.academic_status },
                    { label: 'البريد الإلكتروني', value: studentData.student.email },
                    { label: 'الهاتف', value: studentData.student.phone },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className={styles.infoLabel}>{label}</span>
                      <span className={styles.infoValue}>{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grades Table */}
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ color: 'var(--purple-light)', marginBottom: 'var(--spacing-md)', fontSize: '1rem' }}>الدرجات المعتمدة</h3>
                {studentData.grades && studentData.grades.length > 0 ? (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>المادة</th>
                          <th>كود المادة</th>
                          <th>الساعات</th>
                          <th>المجموع</th>
                          <th>التقدير</th>
                          <th>النتيجة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentData.grades.map((g) => (
                          <tr key={g.id}>
                            <td>{g.Course?.arabic_name || g.Course?.course_name || '—'}</td>
                            <td>{g.Course?.course_code || '—'}</td>
                            <td>{g.Course?.credit_hours || '—'}</td>
                            <td>{g.total_score ?? '—'}</td>
                            <td>{g.letter_grade || '—'}</td>
                            <td>
                              <span className={`${styles.badge} ${g.final_result === 'pass' ? styles.badgePaid : styles.badgeUnpaid}`}>
                                {g.final_result === 'pass' ? 'ناجح' : g.final_result === 'fail' ? 'راسب' : g.final_result || '—'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className={styles.emptyMsg}>لا توجد درجات معتمدة</p>
                )}
              </div>

              {/* Invoices Table */}
              <div>
                <h3 style={{ color: 'var(--purple-light)', marginBottom: 'var(--spacing-md)', fontSize: '1rem' }}>الفواتير</h3>
                {studentData.invoices && studentData.invoices.length > 0 ? (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>رقم الفاتورة</th>
                          <th>الإجمالي</th>
                          <th>المدفوع</th>
                          <th>المتبقي</th>
                          <th>الحالة</th>
                          <th>تاريخ الاستحقاق</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentData.invoices.map((inv) => (
                          <tr key={inv.id} className={isOverdue(inv) ? styles.rowOverdue : ''}>
                            <td>{inv.invoice_number}</td>
                            <td>{fmt(inv.total_amount)} ج.م</td>
                            <td>{fmt(inv.calculated_paid)} ج.م</td>
                            <td>{fmt(inv.remaining)} ج.م</td>
                            <td>
                              <span className={`${styles.badge} ${STATUS_BADGE[inv.status] || ''}`}>
                                {STATUS_LABELS[inv.status] || inv.status}
                              </span>
                            </td>
                            <td>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('ar-EG') : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className={styles.emptyMsg}>لا توجد فواتير</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
    </>
  );
}
