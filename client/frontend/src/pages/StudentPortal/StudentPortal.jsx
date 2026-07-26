import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/apiService';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { TrueFocus, FadeIn } from '../../components/animations';
import styles from './StudentPortal.module.css';

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

// ─── Main Component ──────────────────────────────────────────────────────────

export default function StudentPortal() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Active view: 'main', 'grades', 'payments'
  const [activeView, setActiveView] = useState('main');

  // Student summary data
  const [studentSummary, setStudentSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  // Payment status
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Grades data
  const [grades, setGrades] = useState([]);
  const [gpa, setGpa] = useState(null);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [gradesError, setGradesError] = useState(null);

  // Invoices data
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState(null);

  // Auth guard
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) navigate('/login', { replace: true });
      else if (user?.role !== 'student') navigate('/', { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate]);

  // Fetch student summary on mount
  useEffect(() => {
    if (isAuthenticated && user?.role === 'student') {
      fetchStudentSummary();
    }
  }, [isAuthenticated, user]);

  const fetchStudentSummary = async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await api.get('/auth/profile');
      setStudentSummary(res.data.data);
    } catch (err) {
      setSummaryError(err.response?.data?.message || 'فشل تحميل بيانات الطالب');
    } finally {
      setSummaryLoading(false);
    }
  };

  // Handle "View Results" button
  const handleViewResults = async () => {
    setPaymentLoading(true);
    setPaymentError(null);
    setGradesError(null);
    try {
      // Check payment status first
      const paymentRes = await api.get('/student/payment-status');
      const paymentData = paymentRes.data.data;
      setPaymentStatus(paymentData);

      if (paymentData.all_paid) {
        // Fetch grades if all paid
        setGradesLoading(true);
        try {
          const gradesRes = await api.get('/grades/student/grades');
          setGrades(gradesRes.data.data || []);
          setGpa(gradesRes.data.gpa || null);
          setActiveView('grades');
        } catch (err) {
          setGradesError(err.response?.data?.message || 'فشل تحميل الدرجات');
        } finally {
          setGradesLoading(false);
        }
      } else {
        // Show payment required message
        toast.error(`يرجى سداد المصاريف الدراسية لعرض النتائج. المبلغ المتبقي: ${fmt(paymentData.total_due)} ج.م`);
        setPaymentError(`يرجى سداد المصاريف الدراسية لعرض النتائج. المبلغ المتبقي: ${fmt(paymentData.total_due)} ج.م`);
      }
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'فشل التحقق من حالة المدفوعات');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle "View Payments" button
  const handleViewPayments = async () => {
    setInvoicesLoading(true);
    setInvoicesError(null);
    try {
      const res = await api.get('/grades/student/invoices');
      setInvoices(res.data.data || []);
      setActiveView('payments');
    } catch (err) {
      setInvoicesError(err.response?.data?.message || 'فشل تحميل الفواتير');
    } finally {
      setInvoicesLoading(false);
    }
  };

  // Group grades by academic year and semester
  const groupGradesByYearAndSemester = () => {
    const grouped = {};
    grades.forEach((grade) => {
      const year = grade.academic_year || 'غير محدد';
      const semester = grade.semester || 'غير محدد';
      const key = `${year} - ${semester}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(grade);
    });
    return grouped;
  };

  // Calculate semester GPA
  const calculateSemesterGPA = (semesterGrades) => {
    let totalPoints = 0;
    let totalHours = 0;
    semesterGrades.forEach((grade) => {
      const creditHours = grade.Course?.credit_hours || 0;
      const gradePoint = grade.grade_point || 0;
      totalPoints += gradePoint * creditHours;
      totalHours += creditHours;
    });
    return totalHours > 0 ? (totalPoints / totalHours).toFixed(2) : '0.00';
  };

  if (loading || summaryLoading) {
    return (
      <>
        <Navbar />
        <div className={styles.center} style={{ minHeight: '100vh' }}>
          <div className={styles.spinner} />
          <span>جاري التحميل...</span>
        </div>
      </>
    );
  }

  if (summaryError) {
    return (
      <div className={styles.center} style={{ minHeight: '100vh' }}>
        <span className={styles.errorMsg}>{summaryError}</span>
        <button className={styles.btnSecondary} onClick={fetchStudentSummary}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
        {/* ── Main View ── */}
        {activeView === 'main' && (
          <>
            {/* Student Summary Card */}
            <FadeIn>
              <div className={styles.summaryCard}>
                <div className={styles.summaryHeader}>
                  <div className={styles.avatar}>
                    <i className="fas fa-user-graduate" />
                  </div>
                  <div className={styles.summaryInfo}>
                    <TrueFocus>
                      <h1>{studentSummary?.full_name || 'الطالب'}</h1>
                    </TrueFocus>
                    <div className={styles.summaryDetails}>
                      <span><strong>كود الطالب:</strong> {studentSummary?.student_code || '—'}</span>
                      <span><strong>التخصص:</strong> {studentSummary?.specialty || '—'}</span>
                      <span><strong>السنة الحالية:</strong> {studentSummary?.current_year ? `السنة ${studentSummary.current_year}` : '—'}</span>
                      <span><strong>المعدل التراكمي:</strong> {gpa || '—'}</span>
                      <span><strong>الحالة الأكاديمية:</strong> {studentSummary?.academic_status || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Action Buttons */}
            <div className={styles.actionsGrid}>
              <button
                className={styles.btnPrimary}
                onClick={handleViewResults}
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <>
                    <div className={styles.btnSpinner} />
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <i className="fas fa-graduation-cap" />
                    عرض النتيجة
                  </>
                )}
              </button>

              <button
                className={styles.btnSecondary}
                onClick={handleViewPayments}
                disabled={invoicesLoading}
              >
                {invoicesLoading ? (
                  <>
                    <div className={styles.btnSpinner} />
                    جاري التحميل...
                  </>
                ) : (
                  <>
                    <i className="fas fa-money-bill-wave" />
                    عرض المدفوعات
                  </>
                )}
              </button>
            </div>

            {/* Payment Error Message */}
            {paymentError && (
              <div className={styles.errorBox}>
                <i className="fas fa-exclamation-circle" />
                <p>{paymentError}</p>
              </div>
            )}
          </>
        )}

        {/* ── Grades View ── */}
        {activeView === 'grades' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>النتائج الأكاديمية</h2>
              <button className={styles.btnBack} onClick={() => setActiveView('main')}>
                <i className="fas fa-arrow-right" />
                العودة
              </button>
            </div>

            {gradesLoading ? (
              <div className={styles.center}>
                <div className={styles.spinner} />
                <span>جاري تحميل الدرجات...</span>
              </div>
            ) : gradesError ? (
              <div className={styles.center}>
                <span className={styles.errorMsg}>{gradesError}</span>
              </div>
            ) : grades.length === 0 ? (
              <p className={styles.emptyMsg}>لا توجد درجات معتمدة حتى الآن</p>
            ) : (
              <>
                {/* GPA Summary */}
                <div className={styles.gpaCard}>
                  <span className={styles.gpaLabel}>المعدل التراكمي الإجمالي</span>
                  <span className={styles.gpaValue}>{gpa || '0.00'}</span>
                </div>

                {/* Grades grouped by year and semester */}
                {Object.entries(groupGradesByYearAndSemester()).map(([key, semesterGrades]) => {
                  const semesterGPA = calculateSemesterGPA(semesterGrades);
                  return (
                    <div key={key} className={styles.semesterBlock}>
                      <div className={styles.semesterHeader}>
                        <h3>{key}</h3>
                        <span className={styles.semesterGPA}>المعدل: {semesterGPA}</span>
                      </div>

                      <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                          <thead>
                            <tr>
                              <th>كود المادة</th>
                              <th>اسم المادة</th>
                              <th>الأعمال 1</th>
                              <th>الأعمال 2</th>
                              <th>النهائي</th>
                              <th>المجموع</th>
                              <th>التقدير</th>
                              <th>النتيجة</th>
                            </tr>
                          </thead>
                          <tbody>
                            {semesterGrades.map((grade) => (
                              <tr key={grade.id}>
                                <td>{grade.Course?.course_code || '—'}</td>
                                <td>{grade.Course?.arabic_name || grade.Course?.course_name || '—'}</td>
                                <td>{grade.assignment1_grade || '—'}</td>
                                <td>{grade.assignment2_grade || '—'}</td>
                                <td>{grade.final_exam_score != null ? grade.final_exam_score : '—'}</td>
                                <td>{grade.total_score != null ? grade.total_score.toFixed(2) : '—'}</td>
                                <td>
                                  <span className={`${styles.gradeBadge} ${styles[`grade${grade.letter_grade}`]}`}>
                                    {grade.letter_grade || '—'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`${styles.resultBadge} ${grade.final_result === 'Pass' || grade.final_result === 'Merit' || grade.final_result === 'Distinction' ? styles.resultPass : styles.resultFail}`}>
                                    {grade.final_result || '—'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ── Payments View ── */}
        {activeView === 'payments' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>المدفوعات والفواتير</h2>
              <button className={styles.btnBack} onClick={() => setActiveView('main')}>
                <i className="fas fa-arrow-right" />
                العودة
              </button>
            </div>

            {invoicesLoading ? (
              <div className={styles.center}>
                <div className={styles.spinner} />
                <span>جاري تحميل الفواتير...</span>
              </div>
            ) : invoicesError ? (
              <div className={styles.center}>
                <span className={styles.errorMsg}>{invoicesError}</span>
              </div>
            ) : invoices.length === 0 ? (
              <p className={styles.emptyMsg}>لا توجد فواتير</p>
            ) : (
              <>
                {/* Payment Summary */}
                <div className={styles.paymentSummary}>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>إجمالي الفواتير</span>
                    <span className={styles.summaryValue}>
                      {fmt(invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0))} ج.م
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>إجمالي المدفوعات</span>
                    <span className={styles.summaryValue}>
                      {fmt(invoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0))} ج.م
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>المبلغ المتبقي</span>
                    <span className={`${styles.summaryValue} ${styles.remaining}`}>
                      {fmt(invoices.reduce((sum, inv) => sum + ((inv.total_amount || 0) - (inv.paid_amount || 0)), 0))} ج.م
                    </span>
                  </div>
                </div>

                {/* Invoices Table */}
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>رقم الفاتورة</th>
                        <th>السنة الدراسية</th>
                        <th>الترم</th>
                        <th>الإجمالي</th>
                        <th>المدفوع</th>
                        <th>المتبقي</th>
                        <th>تاريخ الاستحقاق</th>
                        <th>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr
                          key={inv.id}
                          className={isOverdue(inv) ? styles.rowOverdue : ''}
                        >
                          <td>{inv.invoice_number || '—'}</td>
                          <td>{inv.AcademicYear?.year_label || inv.AcademicYear?.year || '—'}</td>
                          <td>{inv.Semester?.semester_name || '—'}</td>
                          <td>{fmt(inv.total_amount)} ج.م</td>
                          <td>{fmt(inv.paid_amount)} ج.م</td>
                          <td>{fmt((inv.total_amount || 0) - (inv.paid_amount || 0))} ج.م</td>
                          <td>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('ar-EG') : '—'}</td>
                          <td>
                            <span className={`${styles.badge} ${STATUS_BADGE[inv.status] || ''}`}>
                              {STATUS_LABELS[inv.status] || inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
  );
}
