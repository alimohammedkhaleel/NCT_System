import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/apiService';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import BranchSelectionModal from '../../components/BranchSelectionModal/BranchSelectionModal';
import './StudentDashboard.css';

// GPA classification helper
const getGPAClassification = (gpa) => {
  const g = parseFloat(gpa) || 0;
  if (g >= 3.7) return { label: 'امتياز', cls: 'badge-green' };
  if (g >= 3.0) return { label: 'جيد جداً', cls: 'badge-blue' };
  if (g >= 2.0) return { label: 'جيد', cls: 'badge-yellow' };
  if (g >= 1.5) return { label: 'مقبول', cls: 'badge-orange' };
  return { label: 'ضعيف', cls: 'badge-red' };
};

// Loading spinner
const Spinner = () => (
  <div className="sp-spinner-wrap">
    <div className="sp-spinner" />
  </div>
);

// Error block with retry
const ErrorBlock = ({ message, onRetry }) => (
  <div className="sp-error-block">
    <span>{message}</span>
    {onRetry && (
      <button className="sp-retry-btn" onClick={onRetry}>
        إعادة المحاولة
      </button>
    )}
  </div>
);

const StudentDashboard = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Dashboard state
  const [dashboard, setDashboard] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [dashError, setDashError] = useState(null);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState('grades');

  // Grades state
  const [grades, setGrades] = useState([]);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [gradesError, setGradesError] = useState(null);
  const [gradesFetched, setGradesFetched] = useState(false);

  // Invoices state
  const [invoices, setInvoices] = useState(null);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState(null);
  const [invoicesFetched, setInvoicesFetched] = useState(false);

  // Payments state (from accountant)
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState(null);
  const [paymentsFetched, setPaymentsFetched] = useState(false);

  // QR state
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [qrFetched, setQrFetched] = useState(false);

  // Timetable state
  const [timetables, setTimetables] = useState([]);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [timetableError, setTimetableError] = useState(null);
  const [timetableFetched, setTimetableFetched] = useState(false);

  // Branch selection modal state (for ICT year 3-4 students with null branch)
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Avatar handlers
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAvatarUrl(res.data.data.avatar_url);
      toast.success('تم رفع الصورة بنجاح');
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل رفع الصورة');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarDelete = async () => {
    try {
      await api.delete('/auth/avatar');
      setAvatarUrl(null);
      toast.success('تم حذف الصورة');
    } catch (err) {
      toast.error('فشل حذف الصورة');
    }
  };

  // Fetch dashboard on mount
  const fetchDashboard = useCallback(async () => {
    setDashLoading(true);
    setDashError(null);
    try {
      const res = await api.get('/grades/student/dashboard');
      const dashData = res.data.data || res.data;
      setDashboard(dashData);
      
      // Set avatar URL from dashboard data if available
      if (dashData?.student_info?.avatar_url) {
        const url = dashData.student_info.avatar_url;
        // Ensure URL always starts with / for correct construction
        setAvatarUrl(url.startsWith('/') ? url : `/${url}`);
      } else if (dashData?.student_info?.profile_image) {
        const url = dashData.student_info.profile_image;
        setAvatarUrl(url.startsWith('/') ? url : `/${url}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'فشل تحميل بيانات الطالب';
      setDashError(msg);
      toast.error(msg);
    } finally {
      setDashLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchDashboard();
  }, [isAuthenticated, fetchDashboard]);

  // Check if student needs to select branch (ICT year 3-4 with null branch)
  useEffect(() => {
    const checkBranchRequired = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await api.get('/auth/profile');
        const profile = res.data.data;
        setStudentProfile(profile);

        if (profile?.role === 'student' && profile?.student) {
          const student = profile.student;
          const specialty = student.Specialty || student.specialty;
          const isICT = specialty && (
            specialty.code === 'ICT' ||
            specialty.name?.toLowerCase().includes('information')
          );
          const needsBranch = isICT && student.current_year >= 3 && !student.branch;
          if (needsBranch) {
            setShowBranchModal(true);
          }
        }
      } catch (err) {
        console.error('Branch check error:', err);
      }
    };

    checkBranchRequired();
  }, [isAuthenticated]);

  // Handle branch selection submission
  const handleBranchSubmit = async (branch) => {
    try {
      await api.put('/student/branch', { branch });
      setShowBranchModal(false);
      toast.success(`تم تحديد الفرع: ${branch === 'Software' ? 'البرمجيات' : 'الشبكات'}`);
      // Refresh dashboard data
      fetchDashboard();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'فشل في حفظ الفرع');
    }
  };

  // Fetch grades
  const fetchGrades = useCallback(async () => {
    setGradesLoading(true);
    setGradesError(null);
    try {
      const res = await api.get('/grades/student/grades');
      setGrades(res.data.data || res.data.grades || []);
      setGradesFetched(true);
    } catch (err) {
      const errData = err.response?.data;
      // Payment required - store structured error
      if (err.response?.status === 403 && errData?.payment_required) {
        setGradesError({ type: 'payment_required', ...errData });
      } else {
        const msg = errData?.message || 'فشل تحميل الدرجات';
        setGradesError({ type: 'error', message: msg });
        toast.error(msg);
      }
    } finally {
      setGradesLoading(false);
    }
  }, []);

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    setInvoicesLoading(true);
    setInvoicesError(null);
    try {
      const res = await api.get('/grades/student/invoices');
      // Normalize response: API returns { success, data: { invoices, summary } }
      const raw = res.data;
      const data = raw.data || raw;
      const summary = data.summary || {};
      const invoiceList = data.invoices || [];

      // Build a flat object the UI expects
      setInvoices({
        invoices: invoiceList,
        total_invoiced: summary.total_invoiced ?? data.total_invoiced ?? 0,
        total_paid: summary.total_paid ?? data.total_paid ?? 0,
        total_due: summary.total_due ?? data.total_due ?? 0,
      });
      setInvoicesFetched(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'فشل تحميل الفواتير';
      setInvoicesError(msg);
      toast.error(msg);
    } finally {
      setInvoicesLoading(false);
    }
  }, []);

  // Fetch payments (student-accessible endpoint)
  const fetchPayments = useCallback(async () => {
    setPaymentsLoading(true);
    setPaymentsError(null);
    try {
      const res = await api.get('/grades/student/payments');
      setPayments(res.data.data?.payments || []);
      setPaymentsFetched(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'فشل تحميل سجل المدفوعات';
      setPaymentsError(msg);
    } finally {
      setPaymentsLoading(false);
    }
  }, []);

  // Fetch QR code
  const fetchQR = useCallback(async () => {
    setQrLoading(true);
    setQrError(null);
    try {
      const res = await api.get('/grades/student/qr-code');
      setQrData(res.data);
      setQrFetched(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'فشل تحميل QR Code';
      setQrError(msg);
      toast.error(msg);
    } finally {
      setQrLoading(false);
    }
  }, []);

  // Fetch timetable
  const fetchTimetable = useCallback(async () => {
    setTimetableLoading(true);
    setTimetableError(null);
    try {
      const res = await api.get('/student/timetables/student');
      setTimetables(res.data.data || []);
      setTimetableFetched(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'فشل تحميل الجدول الدراسي';
      setTimetableError(msg);
    } finally {
      setTimetableLoading(false);
    }
  }, []);

  // Lazy-load tab data on first visit
  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'grades' && !gradesFetched) fetchGrades();
    if (activeTab === 'invoices' && !invoicesFetched) fetchInvoices();
    if (activeTab === 'payments' && !paymentsFetched) fetchPayments();
    if (activeTab === 'timetable' && !timetableFetched) fetchTimetable();
  }, [activeTab, isAuthenticated, gradesFetched, invoicesFetched, paymentsFetched, timetableFetched, fetchGrades, fetchInvoices, fetchPayments, fetchTimetable]);

  // Group grades by academic_year then semester
  const groupedGrades = grades.reduce((acc, g) => {
    const year = g.academic_year || 'غير محدد';
    const sem = g.semester || 'غير محدد';
    if (!acc[year]) acc[year] = {};
    if (!acc[year][sem]) acc[year][sem] = [];
    acc[year][sem].push(g);
    return acc;
  }, {});

  // Download QR image
  const downloadQR = () => {
    if (!qrData?.qr_image) return;
    const a = document.createElement('a');
    a.href = qrData.qr_image;
    a.download = 'student-qr-code.png';
    a.click();
  };

  if (authLoading) return <Spinner />;
  if (!isAuthenticated) return null;

  const info = dashboard?.student_info || {};
  const summary = dashboard?.summary || {};
  const gpaClass = getGPAClassification(summary.gpa);

  return (
    <>
      {/* Branch Selection Modal - shown for ICT year 3-4 students without branch */}
      <BranchSelectionModal
        isOpen={showBranchModal}
        onSubmit={handleBranchSubmit}
        studentInfo={{
          name: studentProfile?.full_name || studentProfile?.student?.full_name,
          studentCode: studentProfile?.student?.student_code,
          currentYear: studentProfile?.student?.current_year
        }}
      />
      <main className="sp-page" dir="rtl">
        {/* Header */}
        <div className="sp-header">
          <h1>بوابة الطالب</h1>
          <p>اطّلع على درجاتك وفواتيرك وبياناتك الأكاديمية</p>
        </div>

        <div className="sp-container">
          {/* Profile Card */}
          {dashLoading ? (
            <Spinner />
          ) : dashError ? (
            <ErrorBlock message={dashError} onRetry={fetchDashboard} />
          ) : (
            <div className="sp-profile-card">
              <div className="sp-profile-main">
                <div className="avatar-section">
                  <div className="avatar-container">
                    {avatarUrl ? (
                      <img
                        src={`http://localhost:5000${avatarUrl}`}
                        alt="صورة الطالب"
                        className="avatar-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          setAvatarUrl(null);
                        }}
                      />
                    ) : (
                      <div className="sp-avatar">
                        {info.full_name ? info.full_name.charAt(0) : '؟'}
                      </div>
                    )}
                  </div>
                  <div className="avatar-actions">
                    <label className="avatar-upload-btn">
                      {uploadingAvatar ? 'جاري الرفع...' : 'تغيير الصورة'}
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} disabled={uploadingAvatar} />
                    </label>
                    {avatarUrl && (
                      <button className="avatar-delete-btn" onClick={handleAvatarDelete}>حذف الصورة</button>
                    )}
                  </div>
                </div>
                <div className="sp-profile-info">
                  <h2>{info.full_name || '—'}</h2>
                  <span className="sp-student-code">{info.student_code || '—'}</span>
                  <span className="sp-email">{info.email || ''}</span>
                </div>
              </div>
              <div className="sp-profile-stats">
                <div className="sp-stat">
                  <span className="sp-stat-label">التخصص</span>
                  <span className="sp-stat-value">{info.specialty_name || '—'}</span>
                </div>
                <div className="sp-stat">
                  <span className="sp-stat-label">السنة الدراسية</span>
                  <span className="sp-stat-value">{info.current_year ? `السنة ${info.current_year}` : '—'}</span>
                </div>
                <div className="sp-stat">
                  <span className="sp-stat-label">الحالة الأكاديمية</span>
                  <span className="sp-stat-value">{info.academic_status || '—'}</span>
                </div>
                {info.branch && (
                  <div className="sp-stat">
                    <span className="sp-stat-label">الفرع</span>
                    <span className="sp-stat-value sp-branch-badge">
                      {info.branch === 'Software' ? 'برمجيات' : 'شبكات'}
                    </span>
                  </div>
                )}
                <div className="sp-stat">
                  <span className="sp-stat-label">المعدل التراكمي</span>
                  <span className="sp-stat-value sp-gpa">
                    {summary.gpa != null ? Number(summary.gpa).toFixed(2) : '—'}
                    <span className={`sp-badge ${gpaClass.cls}`}>{gpaClass.label}</span>
                  </span>
                </div>
                <div className="sp-stat">
                  <span className="sp-stat-label">المواد المسجّلة</span>
                  <span className="sp-stat-value">{summary.enrolled_courses ?? '—'}</span>
                </div>
                <div className="sp-stat">
                  <span className="sp-stat-label">الدرجات المعتمدة</span>
                  <span className="sp-stat-value">{summary.approved_grades ?? '—'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="sp-tabs">
            <button
              className={`sp-tab ${activeTab === 'grades' ? 'active' : ''}`}
              onClick={() => setActiveTab('grades')}
            >
              درجاتي
            </button>
            <button
              className={`sp-tab ${activeTab === 'invoices' ? 'active' : ''}`}
              onClick={() => setActiveTab('invoices')}
            >
              فواتيري
            </button>
            <button
              className={`sp-tab ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              سجل المدفوعات
            </button>
            <button
              className={`sp-tab ${activeTab === 'timetable' ? 'active' : ''}`}
              onClick={() => setActiveTab('timetable')}
            >
              جدولي الدراسي
            </button>
          </div>

          {/* Tab Content */}
          <div className="sp-tab-content">
            {/* Grades Tab */}
            {activeTab === 'grades' && (
              <div className="sp-grades-tab">
                {gradesLoading ? (
                  <Spinner />
                ) : gradesError ? (
                  gradesError.type === 'payment_required' ? (
                    <div className="sp-payment-required">
                      <div className="sp-payment-icon">🔒</div>
                      <h3 className="sp-payment-title">
                        {gradesError.data?.has_invoices ? 'لم يتم دفع المصاريف' : 'لا توجد فاتورة مصاريف'}
                      </h3>
                      <p className="sp-payment-msg">{gradesError.message}</p>
                      {gradesError.data?.has_invoices && (
                        <div className="sp-payment-details">
                          <div className="sp-payment-row">
                            <span>إجمالي المصاريف:</span>
                            <span>{Number(gradesError.data.total_invoiced || 0).toLocaleString('ar-EG')} ج.م</span>
                          </div>
                          <div className="sp-payment-row">
                            <span>المدفوع:</span>
                            <span style={{ color: '#6ee7b7' }}>{Number(gradesError.data.total_paid || 0).toLocaleString('ar-EG')} ج.م</span>
                          </div>
                          <div className="sp-payment-row" style={{ fontWeight: 700 }}>
                            <span>المتبقي:</span>
                            <span style={{ color: '#fca5a5' }}>{Number(gradesError.data.total_due || 0).toLocaleString('ar-EG')} ج.م</span>
                          </div>
                        </div>
                      )}
                      <p className="sp-payment-hint">يرجى مراجعة قسم المالية لسداد المصاريف</p>
                    </div>
                  ) : (
                    <ErrorBlock message={gradesError.message || gradesError} onRetry={() => { setGradesFetched(false); fetchGrades(); }} />
                  )
                ) : grades.length === 0 ? (
                  <div className="sp-empty">لا توجد درجات معتمدة حتى الآن</div>
                ) : (
                  <>
                    {/* Semester Summary Cards */}
                    {(() => {
                      const sem1Grades = grades.filter(g => g.semester?.includes('الأول') || g.semester === 'Fall');
                      const sem2Grades = grades.filter(g => g.semester?.includes('الثاني') || g.semester === 'Spring');
                      const calcAvg = (arr) => arr.length > 0
                        ? (arr.reduce((s, g) => s + parseFloat(g.total_percentage || 0), 0) / arr.length).toFixed(1)
                        : null;
                      const sem1Avg = calcAvg(sem1Grades);
                      const sem2Avg = calcAvg(sem2Grades);
                      if (!sem1Avg && !sem2Avg) return null;
                      return (
                        <div className="sp-semester-summary">
                          {sem1Avg && (
                            <div className="sp-sem-card">
                              <div className="sp-sem-card-icon">📘</div>
                              <div className="sp-sem-card-label">نتيجة الترم الأول</div>
                              <div className="sp-sem-card-value">{sem1Avg}%</div>
                              <div className="sp-sem-card-count">{sem1Grades.length} مادة</div>
                            </div>
                          )}
                          {sem2Avg && (
                            <div className="sp-sem-card">
                              <div className="sp-sem-card-icon">📗</div>
                              <div className="sp-sem-card-label">نتيجة الترم الثاني</div>
                              <div className="sp-sem-card-value">{sem2Avg}%</div>
                              <div className="sp-sem-card-count">{sem2Grades.length} مادة</div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                  {Object.entries(groupedGrades).map(([year, semesters]) => (
                    <div key={year} className="sp-year-group">
                      <h3 className="sp-year-title">العام الدراسي: {year}</h3>
                      {Object.entries(semesters).map(([sem, semGrades]) => (
                        <div key={sem} className="sp-semester-group">
                          <h4 className="sp-sem-title">الفصل الدراسي: {sem}</h4>
                          <div className="sp-table-wrap">
                            <table className="sp-table">
                              <thead>
                                <tr>
                                  <th>المادة</th>
                                  <th>أعمال 1</th>
                                  <th>أعمال 2</th>
                                  <th>نهائي</th>
                                  <th>المجموع</th>
                                  <th>النسبة %</th>
                                  <th>التقدير</th>
                                  <th>النتيجة</th>
                                </tr>
                              </thead>
                              <tbody>
                                {semGrades.map((g, i) => (
                                  <tr key={i} className={g.final_result === 'fail' || g.final_result === 'Fail' ? 'sp-row-fail' : ''}>
                                    <td>{g.course_name || g.arabic_name || g.course_code || '—'}</td>
                                    <td>{g.assignment1_grade ?? '—'}</td>
                                    <td>{g.assignment2_grade ?? '—'}</td>
                                    <td>{g.final_exam_score ?? '—'}</td>
                                    <td>{g.total_score ?? '—'}</td>
                                    <td>{g.total_percentage != null ? `${g.total_percentage}%` : '—'}</td>
                                    <td>{g.letter_grade || '—'}</td>
                                    <td>
                                      <span className={`sp-result ${g.final_result === 'pass' || g.final_result === 'Pass' || g.final_result === 'Merit' || g.final_result === 'Distinction' ? 'pass' : 'fail'}`}>
                                        {g.final_result === 'pass' || g.final_result === 'Pass' ? 'ناجح' : g.final_result === 'fail' || g.final_result === 'Fail' ? 'راسب' : g.final_result === 'Merit' ? 'جيد جداً' : g.final_result === 'Distinction' ? 'امتياز' : g.final_result || '—'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </>
                )}
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div className="sp-invoices-tab">
                {invoicesLoading ? (
                  <Spinner />
                ) : invoicesError ? (
                  <ErrorBlock message={invoicesError} onRetry={() => { setInvoicesFetched(false); fetchInvoices(); }} />
                ) : !invoices ? null : (
                  <>
                    <div className="sp-inv-summary">
                      <div className="sp-inv-card">
                        <span className="sp-inv-label">إجمالي الفواتير</span>
                        <span className="sp-inv-value">{invoices.total_invoiced ?? '—'} ج.م</span>
                      </div>
                      <div className="sp-inv-card paid">
                        <span className="sp-inv-label">المدفوع</span>
                        <span className="sp-inv-value">{invoices.total_paid ?? '—'} ج.م</span>
                      </div>
                      <div className="sp-inv-card due">
                        <span className="sp-inv-label">المتبقي</span>
                        <span className="sp-inv-value">{invoices.total_due ?? '—'} ج.م</span>
                      </div>
                    </div>
                    {invoices.invoices && invoices.invoices.length > 0 ? (
                      <div className="sp-table-wrap">
                        <table className="sp-table">
                          <thead>
                            <tr>
                              <th>رقم الفاتورة</th>
                              <th>المبلغ الكلي</th>
                              <th>المدفوع</th>
                              <th>الحالة</th>
                              <th>تاريخ الاستحقاق</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoices.invoices.map((inv, i) => (
                              <tr key={i}>
                                <td>{inv.invoice_number || '—'}</td>
                                <td>{inv.total_amount ?? '—'} ج.م</td>
                                <td>{inv.paid_amount ?? '—'} ج.م</td>
                                <td>
                                  <span className={`sp-inv-status ${inv.status}`}>
                                    {inv.status === 'paid' ? 'مدفوع' :
                                     inv.status === 'partial' ? 'جزئي' :
                                     inv.status === 'overdue' ? 'متأخر' : 'غير مدفوع'}
                                  </span>
                                </td>
                                <td>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('ar-EG') : '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="sp-empty">لا توجد فواتير حتى الآن</div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Payments Tab (from accountant) */}
            {activeTab === 'payments' && (
              <div className="sp-payments-tab">
                {paymentsLoading ? (
                  <Spinner />
                ) : paymentsError ? (
                  <ErrorBlock message={paymentsError} onRetry={() => { setPaymentsFetched(false); fetchPayments(); }} />
                ) : payments.length === 0 ? (
                  <div className="sp-empty">لا توجد مدفوعات مسجلة حتى الآن</div>
                ) : (
                  <div className="sp-table-wrap">
                    <table className="sp-table">
                      <thead>
                        <tr>
                          <th>رقم الإيصال</th>
                          <th>رقم الفاتورة</th>
                          <th>السنة الدراسية</th>
                          <th>الترم</th>
                          <th>المبلغ المدفوع</th>
                          <th>طريقة الدفع</th>
                          <th>تاريخ الدفع</th>
                          <th>ملاحظات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment, i) => (
                          <tr key={i}>
                            <td>{payment.receipt_number || '—'}</td>
                            <td>{payment.invoice_number || '—'}</td>
                            <td>{payment.academic_year || '—'}</td>
                            <td>{payment.semester || '—'}</td>
                            <td style={{ color: '#6ee7b7', fontWeight: 600 }}>{Number(payment.amount || 0).toLocaleString('ar-EG')} ج.م</td>
                            <td>
                              <span className="sp-payment-method">
                                {payment.payment_method === 'cash' ? '💵 نقدي' :
                                 payment.payment_method === 'card' ? '💳 بطاقة' :
                                 payment.payment_method === 'bank_transfer' ? '🏦 تحويل بنكي' :
                                 payment.payment_method || '—'}
                              </span>
                            </td>
                            <td>{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('ar-EG') : payment.created_at ? new Date(payment.created_at).toLocaleDateString('ar-EG') : '—'}</td>
                            <td>{payment.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Timetable Tab */}
            {activeTab === 'timetable' && (
              <div className="sp-timetable-tab">
                {timetableLoading ? (
                  <Spinner />
                ) : timetableError ? (
                  <ErrorBlock message={timetableError} onRetry={() => { setTimetableFetched(false); fetchTimetable(); }} />
                ) : timetables.length === 0 ? (
                  <div className="sp-empty-state">
                    <div className="sp-empty-icon">📅</div>
                    <h3 className="sp-empty-title">لا توجد جداول دراسية</h3>
                    <p className="sp-empty-text">لا يوجد جدول دراسي متاح لتخصصك حتى الآن</p>
                  </div>
                ) : (
                  <div className="sp-timetable-list">
                    {timetables.map((t) => (
                      <div key={t.id} className="sp-timetable-card">
                        <div className="sp-timetable-icon">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M15.6947 13.7H15.7037M15.6947 16.7H15.7037M11.9955 13.7H12.0045M11.9955 16.7H12.0045M8.29431 13.7H8.30329M8.29431 16.7H8.30329" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="sp-timetable-content">
                          <div className="sp-timetable-header">
                            <h4 className="sp-timetable-title">{t.title}</h4>
                            <span className="sp-timetable-specialty-badge">
                              {t.Specialty?.arabic_name || t.Specialty?.name || 'غير محدد'}
                            </span>
                          </div>
                          <div className="sp-timetable-meta">
                            <span className="sp-timetable-meta-item">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M15.5 18.5C16.6 18.5 17.5 17.6 17.5 16.5V7.5C17.5 6.4 16.6 5.5 15.5 5.5C14.4 5.5 13.5 6.4 13.5 7.5V16.5C13.5 17.6 14.4 18.5 15.5 18.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M8.5 18.5C9.6 18.5 10.5 17.6 10.5 16.5V12.5C10.5 11.4 9.6 10.5 8.5 10.5C7.4 10.5 6.5 11.4 6.5 12.5V16.5C6.5 17.6 7.4 18.5 8.5 18.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              {t.file_name || 'جدول دراسي'}
                            </span>
                            {t.file_size && (
                              <span className="sp-timetable-meta-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M9 11.51L12 14.51L15 11.51" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M12 14.51V6.51001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M6 16.51C9.89 17.81 14.11 17.81 18 16.51" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                {(t.file_size / 1024).toFixed(1)} KB
                              </span>
                            )}
                            <span className="sp-timetable-meta-item">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              {t.created_at ? new Date(t.created_at).toLocaleDateString('ar-EG', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              }) : 'غير محدد'}
                            </span>
                          </div>
                        </div>
                        {t.file_url && (
                          <a
                            href={`http://localhost:5000${t.file_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sp-timetable-btn"
                            title="فتح الجدول في نافذة جديدة"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M15.58 12C15.58 13.98 13.98 15.58 12 15.58C10.02 15.58 8.42004 13.98 8.42004 12C8.42004 10.02 10.02 8.42004 12 8.42004C13.98 8.42004 15.58 10.02 15.58 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 20.27C15.53 20.27 18.82 18.19 21.11 14.59C22.01 13.18 22.01 10.81 21.11 9.39997C18.82 5.79997 15.53 3.71997 12 3.71997C8.46997 3.71997 5.17997 5.79997 2.88997 9.39997C1.98997 10.81 1.98997 13.18 2.88997 14.59C5.17997 18.19 8.46997 20.27 12 20.27Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            عرض الجدول
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}


          </div>
        </div>
      </main>
    </>
  );
};

export default StudentDashboard;
