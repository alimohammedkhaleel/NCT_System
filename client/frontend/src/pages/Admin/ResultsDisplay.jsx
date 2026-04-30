import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import api from '../../services/apiService';
import styles from './ResultsDisplay.module.css';

export const ResultsDisplay = () => {
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState([]);
  const [academicYearsMap, setAcademicYearsMap] = useState({}); // specialty_id -> [academicYears]
  const [semestersMap, setSemestersMap] = useState({}); // academic_year_id -> [semesters]
  const [selectedOption, setSelectedOption] = useState(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [stats, setStats] = useState({
    totalGrades: 0,
    publishedGrades: 0,
    unpublishedGrades: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch specialties
      const specialtiesRes = await api.get('/admin/specialties');
      const specs = specialtiesRes.data.data || [];
      setSpecialties(specs);

      // Fetch academic years for all specialties
      const yearsRes = await api.get('/admin/academic-years');
      const allYears = yearsRes.data.data || [];
      const yearsMap = {};
      allYears.forEach(y => {
        if (!yearsMap[y.specialty_id]) yearsMap[y.specialty_id] = [];
        yearsMap[y.specialty_id].push(y);
      });
      setAcademicYearsMap(yearsMap);

      // Fetch semesters for all academic years
      const semsRes = await api.get('/admin/semesters');
      const allSems = semsRes.data.data || [];
      const semsMap = {};
      allSems.forEach(s => {
        if (!semsMap[s.academic_year_id]) semsMap[s.academic_year_id] = [];
        semsMap[s.academic_year_id].push(s);
      });
      setSemestersMap(semsMap);

      // Fetch grade statistics
      const statsRes = await api.get('/admin/grades/stats');
      if (statsRes.data.success) {
        const raw = statsRes.data.data || {};
        setStats({
          totalGrades: raw.total ?? 0,
          publishedGrades: raw.published ?? 0,
          unpublishedGrades: raw.unpublished ?? 0
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const openPublishModal = (type, data) => {
    setSelectedOption({ type, data });
    setPublishModalOpen(true);
  };

  const closePublishModal = () => {
    setPublishModalOpen(false);
    setSelectedOption(null);
  };

  const handleConfirmPublish = () => {
    setPublishModalOpen(false);
    setConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setConfirmModalOpen(false);
    setSelectedOption(null);
  };

  const handlePublish = async () => {
    if (!selectedOption) return;

    setPublishing(true);
    try {
      const { type, data } = selectedOption;

      // Build payload matching what the backend expects
      let payload = {};
      if (type === 'semester') {
        payload = {
          filters: {
            specialty_id: data.specialtyId,
            academic_year_id: data.academicYearId,
            semester_id: data.semesterId
          }
        };
      } else if (type === 'year') {
        payload = {
          filters: {
            specialty_id: data.specialtyId,
            academic_year_id: data.academicYearId
          }
        };
      }

      const response = await api.post('/admin/publish-results', payload);

      if (response.data.success) {
        const count = response.data.data?.published_count ?? 0;
        toast.success(`تم نشر النتائج بنجاح (${count} درجة)`);
        await fetchData();
        closeConfirmModal();
      }
    } catch (err) {
      console.error('Error publishing results:', err);
      toast.error(err.response?.data?.message || 'فشل في نشر النتائج');
    } finally {
      setPublishing(false);
    }
  };

  const renderPublishOptions = () => {
    if (!selectedOption) return null;

    const { type, data } = selectedOption;

    if (type === 'semester') {
      return (
        <div className={styles.publishDetails}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>التخصص:</span>
            <span className={styles.detailValue}>{data.specialtyName}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>السنة الدراسية:</span>
            <span className={styles.detailValue}>السنة {data.year}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>الفصل الدراسي:</span>
            <span className={styles.detailValue}>{data.semester}</span>
          </div>
        </div>
      );
    }

    if (type === 'year') {
      return (
        <div className={styles.publishDetails}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>التخصص:</span>
            <span className={styles.detailValue}>{data.specialtyName}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>السنة الدراسية:</span>
            <span className={styles.detailValue}>السنة {data.year}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>الفصول:</span>
            <span className={styles.detailValue}>جميع الفصول</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>عرض النتائج للطلاب</h1>
          <p className={styles.subtitle}>
            نشر النتائج حسب الفصل الدراسي أو السنة الدراسية
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Statistics Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.totalGrades}</div>
                <div className={styles.statLabel}>إجمالي الدرجات</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>✅</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.publishedGrades}</div>
                <div className={styles.statLabel}>الدرجات المنشورة</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⏳</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.unpublishedGrades}</div>
                <div className={styles.statLabel}>الدرجات المعلقة</div>
              </div>
            </div>
          </div>

          {/* Specialties Grid */}
          <div className={styles.specialtiesSection}>
            <h2 className={styles.sectionTitle}>اختر التخصص</h2>
            <div className={styles.specialtiesGrid}>
              {specialties.map(specialty => (
                <div key={specialty.id} className={styles.specialtyCard}>
                  <div className={styles.specialtyHeader}>
                    <h3 className={styles.specialtyName}>{specialty.name}</h3>
                    <p className={styles.specialtyCode}>{specialty.code}</p>
                  </div>

                  <div className={styles.yearsSection}>
                    <h4 className={styles.yearsTitle}>السنوات الدراسية</h4>
                    {(academicYearsMap[specialty.id] || []).map(academicYear => {
                      const semesters = semestersMap[academicYear.id] || [];
                      return (
                        <div key={academicYear.id} className={styles.yearCard}>
                          <div className={styles.yearHeader}>
                            <span className={styles.yearLabel}>السنة {academicYear.year_number}</span>
                          </div>
                          <div className={styles.yearActions}>
                            {semesters.map(sem => (
                              <button
                                key={sem.id}
                                className={styles.semesterBtn}
                                onClick={() => openPublishModal('semester', {
                                  specialtyId: specialty.id,
                                  specialtyName: specialty.arabic_name || specialty.name,
                                  academicYearId: academicYear.id,
                                  semesterId: sem.id,
                                  year: academicYear.year_number,
                                  semester: sem.semester_name
                                })}
                              >
                                {sem.semester_name}
                              </button>
                            ))}
                            <button
                              className={styles.yearBtn}
                              onClick={() => openPublishModal('year', {
                                specialtyId: specialty.id,
                                specialtyName: specialty.arabic_name || specialty.name,
                                academicYearId: academicYear.id,
                                year: academicYear.year_number
                              })}
                            >
                              السنة كاملة
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {(academicYearsMap[specialty.id] || []).length === 0 && (
                      <p style={{ color: '#888', fontSize: '13px', padding: '8px 0' }}>
                        لا توجد سنوات دراسية مضافة لهذا التخصص
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Publish Modal */}
      <Modal
        isOpen={publishModalOpen}
        onClose={closePublishModal}
        title="تأكيد نشر النتائج"
      >
        <div className={styles.modalContent}>
          <div className={styles.warningBox}>
            <div className={styles.warningIcon}>⚠️</div>
            <div className={styles.warningText}>
              <p className={styles.warningTitle}>تنبيه هام</p>
              <p className={styles.warningMessage}>
                سيتم نشر النتائج لجميع الطلاب في النطاق المحدد. تأكد من مراجعة جميع الدرجات قبل النشر.
              </p>
            </div>
          </div>

          {renderPublishOptions()}

          <div className={styles.modalActions}>
            <button
              className={styles.cancelBtn}
              onClick={closePublishModal}
            >
              إلغاء
            </button>
            <button
              className={styles.confirmBtn}
              onClick={handleConfirmPublish}
            >
              متابعة
            </button>
          </div>
        </div>
      </Modal>

      {/* Final Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={closeConfirmModal}
        title="تأكيد نهائي"
      >
        <div className={styles.modalContent}>
          <div className={styles.confirmBox}>
            <div className={styles.confirmIcon}>📢</div>
            <p className={styles.confirmText}>
              هل أنت متأكد من نشر النتائج؟ سيتم إرسال إشعارات للطلاب المعنيين.
            </p>
          </div>

          {renderPublishOptions()}

          <div className={styles.modalActions}>
            <button
              className={styles.cancelBtn}
              onClick={closeConfirmModal}
              disabled={publishing}
            >
              إلغاء
            </button>
            <button
              className={styles.publishBtn}
              onClick={handlePublish}
              disabled={publishing}
            >
              {publishing ? 'جاري النشر...' : 'نشر النتائج'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ResultsDisplay;
