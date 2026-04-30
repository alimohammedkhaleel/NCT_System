
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resultsAPI, specialtiesAPI, academicYearsAPI, semestersAPI } from '../../services/apiService';
import { Table, Modal, LoadingSpinner } from '../../components/common';
import styles from './ResultsPublishing.module.css';
import commonStyles from './AdminCommon.module.css';

export default function ResultsPublishing() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [publishType, setPublishType] = useState('selected'); // 'selected' or 'all_matching'

  const [filters, setFilters] = useState({
    specialty_id: '',
    academic_year_id: '',
    semester_id: '',
    branch: ''
  });

  useEffect(() => {
    fetchMetadata();
    
    // Parse URL search params
    const params = new URLSearchParams(location.search);
    const urlFilters = {
      specialty_id: params.get('specialty_id') || '',
      academic_year_id: params.get('academic_year_id') || '',
      semester_id: params.get('semester_id') || '',
      branch: params.get('branch') || ''
    };
    
    if (urlFilters.specialty_id || urlFilters.academic_year_id || urlFilters.semester_id || urlFilters.branch) {
      setFilters(prev => ({ ...prev, ...urlFilters }));
    }
  }, []);

  useEffect(() => {
    if (filters.specialty_id) {
      fetchAcademicYears(filters.specialty_id);
    } else {
      setAcademicYears([]);
      setFilters(prev => ({ ...prev, academic_year_id: '', semester_id: '' }));
    }
  }, [filters.specialty_id]);

  useEffect(() => {
    if (filters.academic_year_id) {
      fetchSemesters(filters.academic_year_id);
    } else {
      setSemesters([]);
      setFilters(prev => ({ ...prev, semester_id: '' }));
    }
  }, [filters.academic_year_id]);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchMetadata = async () => {
    try {
      const specRes = await specialtiesAPI.getAll();
      setSpecialties(specRes.data.data || []);
    } catch (error) {
      toast.error('فشل في تحميل التخصصات');
    }
  };

  const fetchAcademicYears = async (specialtyId) => {
    try {
      const yearsRes = await academicYearsAPI.getAll(specialtyId);
      setAcademicYears(yearsRes.data.data || []);
    } catch (error) {
      toast.error('فشل في تحميل السنوات الدراسية');
    }
  };

  const fetchSemesters = async (academicYearId) => {
    try {
      const semsRes = await semestersAPI.getAll(academicYearId);
      setSemesters(semsRes.data.data || []);
    } catch (error) {
      toast.error('فشل في تحميل الفصول الدراسية');
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await resultsAPI.getCoursesWithStats(filters);
      setCourses(response.data.data || []);
      setSelectedCourses([]);
    } catch (error) {
      toast.error('فشل في تحميل المواد');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const toggleCourseSelection = (courseId) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId) 
        : [...prev, courseId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedCourses.length === courses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(courses.map(c => c.id));
    }
  };

  const handlePublishClick = (type) => {
    if (type === 'selected' && selectedCourses.length === 0) {
      toast.error('يرجى اختيار مادة واحدة على الأقل');
      return;
    }
    setPublishType(type);
    setShowConfirmModal(true);
  };

  const confirmPublish = async () => {
    setPublishing(true);
    try {
      const payload = publishType === 'selected'
        ? { course_ids: selectedCourses }
        : {
            filters: {
              specialty_id: filters.specialty_id || undefined,
              academic_year_id: filters.academic_year_id || undefined,
              semester_id: filters.semester_id || undefined,
              branch: filters.branch || undefined
            }
          };

      const response = await resultsAPI.publishResults(payload);
      const count = response.data.data?.published_count ?? response.data.count ?? 0;
      toast.success(`تم نشر النتائج بنجاح لـ ${count} درجة`);
      setShowConfirmModal(false);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل في نشر النتائج');
    } finally {
      setPublishing(false);
    }
  };

  const columns = [
    {
      key: 'selection',
      label: (
        <input 
          type="checkbox" 
          checked={courses.length > 0 && selectedCourses.length === courses.length}
          onChange={toggleAllSelection}
        />
      ),
      render: (_, course) => (
        <input 
          type="checkbox" 
          checked={selectedCourses.includes(course.id)}
          onChange={() => toggleCourseSelection(course.id)}
        />
      )
    },
    { key: 'course_code', label: 'كود المادة' },
    { key: 'course_name', label: 'اسم المادة' },
    { 
      key: 'branch', 
      label: 'الفرع',
      render: (branch) => {
        if (!branch) return 'للجميع';
        if (branch === 'Software') return 'برمجيات';
        if (branch === 'Network') return 'شبكات';
        if (branch === 'Both') return 'كلاهما';
        return branch;
      }
    },
    { 
      key: 'stats', 
      label: 'حالة الدرجات',
      render: (_, course) => {
        const stats = course.grade_stats || {};
        return (
          <div className={styles.statsWrapper}>
            <div className={styles.statItem} title="إجمالي الدرجات">
              <span className={styles.statIcon}>👥</span>
              <span className={styles.statValue}>{stats.total ?? 0}</span>
            </div>
            <div className={styles.statItem} title="درجات معتمدة">
              <span className={styles.statIcon}>✅</span>
              <span className={styles.statValue}>{stats.approved ?? 0}</span>
            </div>
            <div className={styles.statItem} title="درجات منشورة">
              <span className={styles.statIcon}>📢</span>
              <span className={styles.statValue}>{stats.published ?? 0}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'progress',
      label: 'نسبة النشر',
      render: (_, course) => {
        const stats = course.grade_stats || {};
        const approved = stats.approved ?? 0;
        const published = stats.published ?? 0;
        const percent = approved > 0 
          ? Math.round((published / approved) * 100) 
          : 0;
        return (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${percent}%`, backgroundColor: percent === 100 ? '#10b981' : '#a855f7' }}
              ></div>
            </div>
            <span className={styles.progressText}>{percent}%</span>
          </div>
        );
      }
    }
  ];

  const selectedSpecialty = specialties.find(s => String(s.id) === String(filters.specialty_id));
  const isICT = selectedSpecialty?.code === 'ICT' || selectedSpecialty?.name?.includes('Information');

  return (
    <div className={commonStyles.pageWrapper}>
      <div className={commonStyles.pageHeader}>
        <h1 className={commonStyles.pageTitle}>نشر النتائج</h1>
        <p className={commonStyles.pageSubtitle}>مراجعة ونشر درجات الطلاب المعتمدة</p>
      </div>

      {/* Filters Section */}
      <div className={`${commonStyles.card} ${styles.filterCard}`}>
        <div className={commonStyles.grid4}>
          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>التخصص</label>
            <select 
              name="specialty_id" 
              className={commonStyles.select}
              value={filters.specialty_id}
              onChange={handleFilterChange}
            >
              <option value="">كل التخصصات</option>
              {specialties.map(s => (
                <option key={s.id} value={s.id}>{s.arabic_name || s.name}</option>
              ))}
            </select>
          </div>

          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>السنة الدراسية</label>
            <select 
              name="academic_year_id" 
              className={commonStyles.select}
              value={filters.academic_year_id}
              onChange={handleFilterChange}
              disabled={!filters.specialty_id}
            >
              <option value="">كل السنوات</option>
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>السنة {y.year_number}</option>
              ))}
            </select>
          </div>

          <div className={commonStyles.formGroup}>
            <label className={commonStyles.label}>الفصل الدراسي</label>
            <select 
              name="semester_id" 
              className={commonStyles.select}
              value={filters.semester_id}
              onChange={handleFilterChange}
              disabled={!filters.academic_year_id}
            >
              <option value="">كل الفصول</option>
              {semesters.map(s => (
                <option key={s.id} value={s.id}>{s.semester_name}</option>
              ))}
            </select>
          </div>

          {isICT && (
            <div className={commonStyles.formGroup}>
              <label className={commonStyles.label}>الفرع (ICT فقط)</label>
              <select 
                name="branch" 
                className={commonStyles.select}
                value={filters.branch}
                onChange={handleFilterChange}
              >
                <option value="">كل الفروع</option>
                <option value="Software">برمجيات</option>
                <option value="Network">شبكات</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Actions Row */}
      <div className={styles.actionsRow}>
        <div className={styles.selectionInfo}>
          {selectedCourses.length > 0 && (
            <span className={styles.selectionCount}>
              تم اختيار {selectedCourses.length} مادة
            </span>
          )}
        </div>
        <div className={styles.actionButtons}>
          <button 
            className={`${commonStyles.btn} ${commonStyles.btnPrimary}`}
            onClick={() => handlePublishClick('selected')}
            disabled={selectedCourses.length === 0}
          >
            📢 نشر المختار
          </button>
          <button 
            className={`${commonStyles.btn} ${commonStyles.btnSecondary}`}
            onClick={() => handlePublishClick('all_matching')}
            disabled={!filters.specialty_id || !filters.academic_year_id || !filters.semester_id}
          >
            📢 نشر الكل (حسب الفلتر)
          </button>
        </div>
      </div>

      {/* Courses Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={commonStyles.card}>
          <Table 
            columns={columns} 
            data={courses} 
            emptyMessage="لا توجد مواد تطابق خيارات البحث أو لا توجد درجات معتمدة للنشر"
          />
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="⚠️ تأكيد نشر النتائج"
        footer={
          <div className={styles.modalFooter}>
            <button 
              className={`${commonStyles.btn} ${commonStyles.btnSecondary}`}
              onClick={() => setShowConfirmModal(false)}
              disabled={publishing}
            >
              ✕ إلغاء
            </button>
            <button 
              className={`${commonStyles.btn} ${commonStyles.btnPrimary}`}
              onClick={confirmPublish}
              disabled={publishing}
            >
              {publishing ? '⏳ جاري النشر...' : '📢 تأكيد النشر'}
            </button>
          </div>
        }
      >
        <div className={styles.confirmContent}>
          <div className={styles.warningBox}>
            <span className={styles.warningIcon}>⚠️</span>
            <p>
              {publishType === 'selected' 
                ? `أنت على وشك نشر النتائج لـ ${selectedCourses.length} مادة مختارة.` 
                : 'أنت على وشك نشر النتائج لجميع المواد التي تطابق الفلتر الحالي.'}
            </p>
          </div>
          <p className={styles.confirmText}>
            بمجرد النشر، سيتمكن الطلاب من رؤية درجاتهم عبر البوابة الخاصة بهم. هل تريد الاستمرار؟
          </p>
        </div>
      </Modal>
    </div>
  );
}
