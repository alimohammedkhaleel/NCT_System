import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/apiService';
import styles from './AdminDashboard.module.css';
import PromotionModal from '../../components/admin/PromotionModal';
import { ClickSpark, BounceCards } from '../../components/animations';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ students: 0, professors: 0, specialties: 0, pendingGrades: 0, pendingRequests: 0 });
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showPromoteSemesterModal, setShowPromoteSemesterModal] = useState(false);
  const [showPromoteYearModal, setShowPromoteYearModal] = useState(false);
  const [showBulkPromoteModal, setShowBulkPromoteModal] = useState(false);
  const [showSummerPassedModal, setShowSummerPassedModal] = useState(false);

  // Specialty quick-view modal
  const [specialtyModal, setSpecialtyModal] = useState(null); // { spec, view: 'students'|'courses' }
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalFilters, setModalFilters] = useState({ year: '', branch: '' });

  // Hardcoded 6 specialties as per task requirements
  const SPECIALTIES = [
    { code: 'MCT', nameAr: 'الميكاترونيكس', nameEn: 'Mechatronics', icon: '🤖' },
    { code: 'AUT', nameAr: 'السيارات', nameEn: 'Automotive', icon: '🚗' },
    { code: 'ICT', nameAr: 'تكنولوجيا المعلومات', nameEn: 'ICT', icon: '💻' },
    { code: 'PRO', nameAr: 'الإنتاج', nameEn: 'Production', icon: '🦾' },
    { code: 'OIL', nameAr: 'البترول', nameEn: 'Oil & Gas', icon: '🛢️' },
    { code: 'REN', nameAr: 'الطاقة المتجددة', nameEn: 'Renewable Energy', icon: '⚡' }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStats(), fetchSpecialtyCounts()]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [studRes, profRes, specRes, gradesRes, reqRes, profReqRes] = await Promise.allSettled([
        api.get('/admin/students'),
        api.get('/admin/professors'),
        api.get('/specialties'),
        api.get('/grades/admin/pending'),
        api.get('/admin/registration-requests'),
        api.get('/professor-registration/admin/requests?status=pending')
      ]);
      
      setStats({
        students: studRes.status === 'fulfilled' ? (studRes.value.data.count || studRes.value.data.data?.length || 0) : 0,
        professors: profRes.status === 'fulfilled' ? (profRes.value.data.count || profRes.value.data.data?.length || 0) : 0,
        specialties: specRes.status === 'fulfilled' ? (specRes.value.data.count || specRes.value.data.data?.length || 0) : 0,
        pendingGrades: gradesRes.status === 'fulfilled' ? (gradesRes.value.data.count || gradesRes.value.data.data?.length || 0) : 0,
        pendingRequests: reqRes.status === 'fulfilled' ? (reqRes.value.data.data?.filter(r => r.status === 'pending').length || 0) : 0,
        pendingProfessorRequests: profReqRes.status === 'fulfilled' ? (profReqRes.value.data.data?.length || 0) : 0,
      });
    } catch (_) {}
  };

  const fetchSpecialtyCounts = async () => {
    try {
      // Fetch all specialties from API to get their IDs
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await api.get('/specialties', { headers });
      if (response.data.success) {
        const apiSpecialties = response.data.data || [];
        
        // Map hardcoded specialties with student counts
        const specialtiesWithCounts = await Promise.all(
          SPECIALTIES.map(async (spec) => {
            try {
              const apiSpec = apiSpecialties.find(s => s.code === spec.code);
              if (apiSpec) {
                const studentsRes = await api.get(`/admin/students?specialty_id=${apiSpec.id}`, { headers });
                const count = studentsRes.data.count || studentsRes.data.data?.length || 0;
                
                // For ICT, get branch breakdown
                let branchStats = null;
                if (spec.code === 'ICT') {
                  try {
                    const [swRes, nwRes] = await Promise.all([
                      api.get(`/admin/students?specialty_id=${apiSpec.id}&branch=Software`, { headers }),
                      api.get(`/admin/students?specialty_id=${apiSpec.id}&branch=Network`, { headers })
                    ]);
                    branchStats = {
                      software: swRes.data.count || swRes.data.data?.length || 0,
                      network: nwRes.data.count || nwRes.data.data?.length || 0
                    };
                  } catch (e) {
                    console.warn('Could not fetch branch breakdown:', e);
                  }
                }

                return {
                  ...spec,
                  studentCount: count,
                  branchStats
                };
              }
              return { ...spec, studentCount: 0 };
            } catch {
              return { ...spec, studentCount: 0 };
            }
          })
        );
        setSpecialties(specialtiesWithCounts);
      }
    } catch (error) {
      console.error('Error fetching specialty counts:', error);
      // Fallback: set specialties without counts
      setSpecialties(SPECIALTIES.map(s => ({ ...s, studentCount: 0 })));
    }
  };

  const openSpecialtyModal = async (spec, view) => {
    setSpecialtyModal({ spec, view });
    setModalFilters({ year: '', branch: '' });
    setModalData([]);
    setModalLoading(true);
    try {
      // Find the API specialty by code
      const specRes = await api.get('/specialties');
      const apiSpec = (specRes.data.data || []).find(s => s.code === spec.code);
      if (!apiSpec) { setModalLoading(false); return; }

      if (view === 'students') {
        const params = { specialty_id: apiSpec.id };
        const res = await api.get('/admin/students', { params });
        setModalData(res.data.data || []);
      } else {
        const params = { specialty_id: apiSpec.id };
        const res = await api.get('/admin/courses', { params });
        setModalData(res.data.data || []);
      }
    } catch (e) {
      setModalData([]);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredModalData = modalData.filter(item => {
    if (specialtyModal?.view === 'students') {
      const matchYear = !modalFilters.year || String(item.current_year) === modalFilters.year;
      const matchBranch = !modalFilters.branch || item.branch === modalFilters.branch;
      return matchYear && matchBranch;
    } else {
      const matchYear = !modalFilters.year || String(item.AcademicYear?.year_number) === modalFilters.year;
      return matchYear;
    }
  });

  const statCards = [
    { label: 'الطلاب', value: stats.students, icon: '🎓', color: 'var(--primary-color)' },
    { label: 'الدكاترة', value: stats.professors, icon: '👨‍🏫', color: 'var(--primary-light)' },
    { label: 'التخصصات', value: stats.specialties, icon: '📚', color: 'var(--secondary-color)' },
    { label: 'درجات معلقة', value: stats.pendingGrades, icon: '⏳', color: 'var(--warning-color)' },
    { label: 'طلبات تسجيل', value: stats.pendingRequests, icon: '📋', color: 'var(--success-color)' },
  ];

  const managementCards = [
    { title: 'إدارة المواد', icon: '📚', description: 'إضافة وتعديل وحذف المواد الدراسية', path: '/admin/courses' },
    { title: 'إدارة الدكاترة', icon: '👨‍🏫', description: 'إضافة دكاترة وتعيين مواد لهم', path: '/admin/professors' },
    { title: 'إدارة الطلاب', icon: '🎓', description: 'إدارة بيانات الطلاب والترقية', path: '/admin/students' },
    { title: 'الرسوم الدراسية', icon: '💰', description: 'تحديد رسوم كل تخصص وسنة دراسية', path: '/admin/specialty-fees' },
    { title: 'إعدادات الدرجات', icon: '⚙️', description: 'ضبط معايير التقييم والنجاح', path: '/admin/grade-settings' },
    { title: 'الدرجات المعلقة', icon: '✅', description: 'مراجعة واعتماد درجات الطلاب', path: '/admin/pending-grades', badge: stats.pendingGrades },
    { title: 'نشر النتائج', icon: '📢', description: 'نشر النتائج المعتمدة للمواد والطلاب', path: '/admin/results-publishing' },
    { title: 'الجداول الدراسية', icon: '📅', description: 'رفع وإدارة الجداول لكل تخصص', path: '/admin/timetables' },
    { title: 'روابط التسجيل', icon: '🔗', description: 'إنشاء روابط تسجيل للطلاب الجدد', path: '/admin/registration-links' },
    { title: 'طلبات التسجيل', icon: '📋', description: 'مراجعة طلبات الطلاب الجدد', path: '/admin/registration-requests', badge: stats.pendingRequests },
    { title: 'طلبات تسجيل الدكاترة', icon: '👨‍🏫', description: 'مراجعة طلبات تسجيل الدكاترة الجدد', path: '/admin/professor-requests', badge: stats.pendingProfessorRequests },
  ];

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <ClickSpark />
      
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>مرحباً، {user?.full_name} 👋</h1>
        <p className={styles.subtitle}>لوحة تحكم نظام NCTU ERP</p>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        {statCards.map((s) => (
          <div key={s.label} className={styles.statCard} style={{ borderTop: `4px solid ${s.color}` }}>
            <span className={styles.statIcon}>{s.icon}</span>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Specialties Section */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>التخصصات الدراسية</h2>
        <p className={styles.sectionSubtitle}>اضغط على أي تخصص لإدارة السنوات والمواد والطلاب</p>
      </div>

      <div className={styles.specialtiesGrid}>
        {specialties.map((spec, index) => (
          <BounceCards key={spec.code} delay={index * 0.1}>
            <div className={styles.specialtyCard}>
              <div
                onClick={() => navigate(`/admin/specialty/${spec.code}`)}
                style={{ cursor: 'pointer', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
              >
                <div className={styles.specialtyIcon}>{spec.icon}</div>
                <h3 className={styles.specialtyTitle}>{spec.nameAr}</h3>
                <p className={styles.specialtySubtitle}>{spec.nameEn}</p>
                <div className={styles.specialtyStats}>
                  <div className={styles.specialtyStat}>
                    <span className={styles.specialtyStatValue}>{spec.studentCount}</span>
                    <span className={styles.specialtyStatLabel}>طالب</span>
                  </div>
                  {spec.branchStats && (
                    <div className={styles.branchBreakdown}>
                      <div className={styles.branchStat}>
                        <span className={styles.branchStatDot} style={{ background: '#a855f7' }}></span>
                        <span className={styles.branchStatLabel}>SW: {spec.branchStats.software}</span>
                      </div>
                      <div className={styles.branchStat}>
                        <span className={styles.branchStatDot} style={{ background: '#06b6d4' }}></span>
                        <span className={styles.branchStatLabel}>NW: {spec.branchStats.network}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Quick action buttons */}
              <div className={styles.specialtyQuickBtns}>
                <button
                  className={styles.specialtyQuickBtn}
                  onClick={(e) => { e.stopPropagation(); openSpecialtyModal(spec, 'students'); }}
                >
                  🎓 الطلاب
                </button>
                <button
                  className={styles.specialtyQuickBtn}
                  onClick={(e) => { e.stopPropagation(); openSpecialtyModal(spec, 'courses'); }}
                >
                  📚 المواد
                </button>
              </div>
              <div className={styles.specialtyAction} onClick={() => navigate(`/admin/specialty/${spec.code}`)}>
                عرض التفاصيل ←
              </div>
            </div>
          </BounceCards>
        ))}
      </div>

      {/* Student Promotion Section */}
      <div className={styles.sectionHeader} style={{ marginTop: '48px' }}>
        <h2 className={styles.sectionTitle}>إدارة الترم والسنة الدراسية</h2>
        <p className={styles.sectionSubtitle}>نشر النتائج ونقل الطلاب للترم أو السنة التالية</p>
      </div>

      <div className={styles.promotionGrid}>
        <div className={styles.promotionCard} onClick={() => navigate('/admin/results-publishing')}>
          <div className={styles.promotionIcon}>📢</div>
          <h3 className={styles.promotionTitle}>نشر النتائج</h3>
          <p className={styles.promotionDescription}>نشر الدرجات المعتمدة للطلاب</p>
        </div>
        <div className={styles.promotionCard} onClick={() => setShowPromoteSemesterModal(true)}>
          <div className={styles.promotionIcon}>📚</div>
          <h3 className={styles.promotionTitle}>نقل للترم الثاني</h3>
          <p className={styles.promotionDescription}>نقل الطلاب الناجحين للترم الثاني</p>
        </div>
        <div className={styles.promotionCard} onClick={() => setShowBulkPromoteModal(true)} style={{ borderTopColor: 'var(--primary-color)' }}>
          <div className={styles.promotionIcon}>🎓</div>
          <h3 className={styles.promotionTitle}>ترقية نهاية العام (تطبيق اللائحة)</h3>
          <p className={styles.promotionDescription}>نقل الناجحين وتحديد الرسوب والصيفي تلقائياً</p>
        </div>
        <div className={styles.promotionCard} onClick={() => setShowSummerPassedModal(true)}>
          <div className={styles.promotionIcon}>☀️</div>
          <h3 className={styles.promotionTitle}>نقل دراسة صيفية</h3>
          <p className={styles.promotionDescription}>نقل الطلاب المسددين لرسوم الصيفي للعام التالي</p>
        </div>
      </div>

      <div className={styles.promotionGrid} style={{ marginTop: '20px' }}>
        <div className={styles.promotionCard} onClick={() => setShowPromoteYearModal(true)} style={{ opacity: 0.7 }}>
          <div className={styles.promotionIcon}>⚠️</div>
          <h3 className={styles.promotionTitle}>نقل سنة (نظام قديم)</h3>
          <p className={styles.promotionDescription}>نقل الطلاب يدوياً (غير مستحسن حالياً)</p>
        </div>
      </div>

      {/* Management Cards */}
      <div className={styles.sectionHeader} style={{ marginTop: '48px' }}>
        <h2 className={styles.sectionTitle}>الإدارة العامة</h2>
        <p className={styles.sectionSubtitle}>أدوات إدارة النظام</p>
      </div>

      <div className={styles.cardsGrid}>
        {managementCards.map((card) => (
          <div key={card.path} onClick={() => navigate(card.path)} className={styles.card}>
            <div className={styles.cardIconWrap}>
              <span className={styles.cardIcon}>{card.icon}</span>
              {card.badge > 0 && <span className={styles.badge}>{card.badge}</span>}
            </div>
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <p className={styles.cardDescription}>{card.description}</p>
            <div className={styles.cardAction}>فتح ←</div>
          </div>
        ))}
      </div>

      {/* Promotion Modals */}
      {showPublishModal && (
        <PromotionModal
          type="publish"
          onClose={() => setShowPublishModal(false)}
          onSuccess={fetchData}
        />
      )}
      {showPromoteSemesterModal && (
        <PromotionModal
          type="semester"
          onClose={() => setShowPromoteSemesterModal(false)}
          onSuccess={fetchData}
        />
      )}
      {showPromoteYearModal && (
        <PromotionModal
          type="year"
          onClose={() => setShowPromoteYearModal(false)}
          onSuccess={fetchData}
        />
      )}
      {showBulkPromoteModal && (
        <PromotionModal
          type="bulk_promote"
          onClose={() => setShowBulkPromoteModal(false)}
          onSuccess={fetchData}
        />
      )}
      {showSummerPassedModal && (
        <PromotionModal
          type="summer_passed"
          onClose={() => setShowSummerPassedModal(false)}
          onSuccess={fetchData}
        />
      )}

      {/* Specialty Quick-View Modal */}
      {specialtyModal && (
        <div className={styles.modalOverlay} onClick={() => setSpecialtyModal(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {specialtyModal.spec.icon} {specialtyModal.spec.nameAr} —{' '}
                {specialtyModal.view === 'students' ? 'الطلاب' : 'المواد'}
              </h2>
              <button className={styles.modalClose} onClick={() => setSpecialtyModal(null)}>×</button>
            </div>

            {/* Filters */}
            <div className={styles.modalFilters}>
              <select
                className={styles.modalSelect}
                value={modalFilters.year}
                onChange={e => setModalFilters(f => ({ ...f, year: e.target.value }))}
              >
                <option value="">كل السنوات</option>
                {[1,2,3,4].map(y => <option key={y} value={y}>السنة {y}</option>)}
              </select>
              {specialtyModal.view === 'students' && specialtyModal.spec.code === 'ICT' && (
                <select
                  className={styles.modalSelect}
                  value={modalFilters.branch}
                  onChange={e => setModalFilters(f => ({ ...f, branch: e.target.value }))}
                >
                  <option value="">كل الفروع</option>
                  <option value="Software">برمجيات</option>
                  <option value="Network">شبكات</option>
                </select>
              )}
              <span className={styles.modalCount}>{filteredModalData.length} نتيجة</span>
            </div>

            {/* Content */}
            <div className={styles.modalContent}>
              {modalLoading ? (
                <div className={styles.modalLoading}><div className={styles.spinner} /></div>
              ) : filteredModalData.length === 0 ? (
                <p className={styles.modalEmpty}>لا توجد بيانات</p>
              ) : specialtyModal.view === 'students' ? (
                <table className={styles.modalTable}>
                  <thead>
                    <tr>
                      <th>الاسم</th>
                      <th>الكود</th>
                      <th>السنة</th>
                      <th>الفرع</th>
                      <th>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModalData.map(s => (
                      <tr key={s.id}>
                        <td>{s.User?.full_name || '—'}</td>
                        <td>{s.student_code}</td>
                        <td>السنة {s.current_year}</td>
                        <td>{s.branch === 'Software' ? 'برمجيات' : s.branch === 'Network' ? 'شبكات' : '—'}</td>
                        <td>
                          <span style={{
                            padding: '2px 8px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
                            background: s.academic_status === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                            color: s.academic_status === 'active' ? '#6ee7b7' : '#fca5a5'
                          }}>
                            {s.academic_status === 'active' ? 'نشط' : s.academic_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className={styles.modalTable}>
                  <thead>
                    <tr>
                      <th>كود المادة</th>
                      <th>اسم المادة</th>
                      <th>السنة</th>
                      <th>الفرع</th>
                      <th>الساعات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModalData.map(c => (
                      <tr key={c.id}>
                        <td>{c.course_code}</td>
                        <td>{c.arabic_name || c.course_name}</td>
                        <td>السنة {c.AcademicYear?.year_number || '—'}</td>
                        <td>{c.branch === 'Software' ? 'برمجيات' : c.branch === 'Network' ? 'شبكات' : c.branch === 'Both' ? 'كلاهما' : 'للجميع'}</td>
                        <td>{c.credit_hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
