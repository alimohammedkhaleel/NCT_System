import { useState, useEffect } from 'react';
import api from '../../services/apiService';
import styles from './PromotionModal.module.css';

export default function PromotionModal({ type, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form'); // 'form', 'preview', 'result'
  const [specialties, setSpecialties] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  
  const [formData, setFormData] = useState({
    specialty_id: '',
    academic_year_id: '',
    semester_id: ''
  });

  const [previewData, setPreviewData] = useState(null);
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [specRes, yearRes, semRes] = await Promise.all([
        api.get('/admin/specialties'),
        api.get('/admin/academic-years'),
        api.get('/admin/semesters')
      ]);
      
      setSpecialties(specRes.data.data || []);
      setAcademicYears(yearRes.data.data || []);
      setSemesters(semRes.data.data || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'publish': return 'نشر النتائج';
      case 'semester': return 'نقل للترم الثاني';
      case 'year': return 'نقل للسنة الجديدة (نظام قديم)';
      case 'bulk_promote': return 'الترقية الشاملة للطلاب (تطبيق اللائحة)';
      case 'summer_passed': return 'نقل الناجحين من الدراسة الصيفية';
      default: return '';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'publish': return 'سيتم نشر جميع الدرجات المعتمدة للطلاب';
      case 'semester': return 'سيتم نقل الطلاب الناجحين إلى الترم الثاني';
      case 'year': return 'سيتم نقل الطلاب الناجحين إلى السنة التالية (نظام قديم)';
      case 'bulk_promote': return 'تطبيق اللائحة: الناجح كلياً ينتقل للسنة التالية. مواد الرسوب (سنة التخرج: دراسة صيفية | سنوات النقل: حتى 3 صيفي، أكثر من 3 إعادة سنة). سيتم إضافة الفواتير تلقائياً.';
      case 'summer_passed': return 'نقل طلاب الدراسة الصيفية الذين سددوا جميع الفواتير إلى السنة التالية.';
      default: return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreview = async () => {
    // Validate required fields
    if (type !== 'summer_passed' && !formData.academic_year_id) {
      alert('يرجى اختيار السنة الدراسية');
      return;
    }
    
    if (type === 'publish' || type === 'semester') {
      if (!formData.semester_id) {
        alert('يرجى اختيار الترم');
        return;
      }
    }

    setLoading(true);
    try {
      // For preview, we'll just show the form data
      // In a real implementation, you might want to call a preview endpoint
      setPreviewData({
        specialty: specialties.find(s => s.id === parseInt(formData.specialty_id))?.arabic_name || 'جميع التخصصات',
        academic_year: academicYears.find(y => y.id === parseInt(formData.academic_year_id))?.year_label || 'N/A',
        semester: semesters.find(s => s.id === parseInt(formData.semester_id))?.semester_name || 'N/A'
      });
      setStep('preview');
    } catch (error) {
      console.error('Error generating preview:', error);
      alert('حدث خطأ أثناء إنشاء المعاينة');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let payload = {};

      switch (type) {
        case 'publish':
          endpoint = '/admin/publish-results';
          payload = {
            semester_id: parseInt(formData.semester_id),
            academic_year_id: parseInt(formData.academic_year_id),
            specialty_id: formData.specialty_id ? parseInt(formData.specialty_id) : null
          };
          break;
        case 'semester':
          endpoint = '/admin/promote-semester';
          payload = {
            semester_id: parseInt(formData.semester_id),
            academic_year_id: parseInt(formData.academic_year_id),
            specialty_id: formData.specialty_id ? parseInt(formData.specialty_id) : null
          };
          break;
        case 'year':
          endpoint = '/admin/promote-year';
          payload = {
            academic_year_id: parseInt(formData.academic_year_id),
            specialty_id: formData.specialty_id ? parseInt(formData.specialty_id) : null
          };
          break;
        case 'bulk_promote':
          endpoint = '/admin/bulk-promote';
          payload = {
            academic_year_id: parseInt(formData.academic_year_id),
            specialty_id: formData.specialty_id ? parseInt(formData.specialty_id) : null
          };
          break;
        case 'summer_passed':
          endpoint = '/admin/promote-summer-passed';
          payload = {
            specialty_id: formData.specialty_id ? parseInt(formData.specialty_id) : null
          };
          break;
        default:
          throw new Error('Invalid type');
      }

      const response = await api.post(endpoint, payload);
      
      if (response.data.success) {
        setResultData(response.data);
        setStep('result');
      } else {
        alert(response.data.message || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error executing operation:', error);
      alert(error.response?.data?.message || 'حدث خطأ أثناء تنفيذ العملية');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (resultData && resultData.success) {
      onSuccess?.();
    }
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{getTitle()}</h2>
          <button className={styles.closeBtn} onClick={handleClose}>×</button>
        </div>

        {step === 'form' && (
          <div className={styles.body}>
            <p className={styles.description}>{getDescription()}</p>

            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>التخصص (اختياري)</label>
                <select
                  name="specialty_id"
                  value={formData.specialty_id}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="">جميع التخصصات</option>
                  {specialties.map(spec => (
                    <option key={spec.id} value={spec.id}>
                      {spec.arabic_name || spec.name}
                    </option>
                  ))}
                </select>
              </div>

              {type !== 'summer_passed' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>السنة الدراسية *</label>
                  <select
                    name="academic_year_id"
                    value={formData.academic_year_id}
                    onChange={handleInputChange}
                    className={styles.select}
                    required
                  >
                    <option value="">اختر السنة الدراسية</option>
                    {academicYears.map(year => (
                      <option key={year.id} value={year.id}>
                        {year.year_label || `السنة ${year.year_number}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(type === 'publish' || type === 'semester') && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>الترم *</label>
                  <select
                    name="semester_id"
                    value={formData.semester_id}
                    onChange={handleInputChange}
                    className={styles.select}
                    required
                  >
                    <option value="">اختر الترم</option>
                    {semesters.map(sem => (
                      <option key={sem.id} value={sem.id}>
                        {sem.semester_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className={styles.footer}>
              <button
                className={styles.btnSecondary}
                onClick={handleClose}
                disabled={loading}
              >
                إلغاء
              </button>
              <button
                className={styles.btnPrimary}
                onClick={handlePreview}
                disabled={loading}
              >
                {loading ? 'جاري التحميل...' : 'معاينة'}
              </button>
            </div>
          </div>
        )}

        {step === 'preview' && previewData && (
          <div className={styles.body}>
            <div className={styles.previewBox}>
              <h3 className={styles.previewTitle}>معاينة العملية</h3>
              <div className={styles.previewItem}>
                <span className={styles.previewLabel}>التخصص:</span>
                <span className={styles.previewValue}>{previewData.specialty}</span>
              </div>
              {type !== 'summer_passed' && (
                <div className={styles.previewItem}>
                  <span className={styles.previewLabel}>السنة الدراسية:</span>
                  <span className={styles.previewValue}>{previewData.academic_year}</span>
                </div>
              )}
              {(type === 'publish' || type === 'semester') && (
                <div className={styles.previewItem}>
                  <span className={styles.previewLabel}>الترم:</span>
                  <span className={styles.previewValue}>{previewData.semester}</span>
                </div>
              )}
              <div className={styles.warningBox}>
                <span className={styles.warningIcon}>⚠️</span>
                <p className={styles.warningText}>
                  {type === 'publish' && 'سيتم نشر جميع الدرجات المعتمدة. هل أنت متأكد؟'}
                  {type === 'semester' && 'سيتم نقل الطلاب الناجحين فقط. الطلاب الراسبون سيبقون في نفس الترم.'}
                  {type === 'year' && 'سيتم نقل الطلاب الناجحين إلى السنة التالية. لا يمكن التراجع عن هذه العملية.'}
                  {type === 'bulk_promote' && 'سيتم تطبيق قوانين الجامعة تلقائياً ونقل الطلاب وإصدار الفواتير اللازمة.'}
                  {type === 'summer_passed' && 'سيتم نقل الطلاب الذين سددوا جميع الفواتير إلى السنة التالية.'}
                </p>
              </div>
            </div>

            <div className={styles.footer}>
              <button
                className={styles.btnSecondary}
                onClick={() => setStep('form')}
                disabled={loading}
              >
                رجوع
              </button>
              <button
                className={styles.btnPrimary}
                onClick={handleExecute}
                disabled={loading}
              >
                {loading ? 'جاري التنفيذ...' : 'تأكيد وتنفيذ'}
              </button>
            </div>
          </div>
        )}

        {step === 'result' && resultData && (
          <div className={styles.body}>
            <div className={styles.resultBox}>
              <div className={styles.successIcon}>✅</div>
              <h3 className={styles.resultTitle}>تمت العملية بنجاح</h3>
              <p className={styles.resultMessage}>{resultData.message}</p>

              {resultData.data && (
                <div className={styles.resultStats}>
                  {resultData.data.published_count !== undefined && (
                    <div className={styles.resultStat}>
                      <span className={styles.resultStatValue}>{resultData.data.published_count}</span>
                      <span className={styles.resultStatLabel}>درجة منشورة</span>
                    </div>
                  )}
                  {resultData.data.promoted_count !== undefined && (
                    <div className={styles.resultStat}>
                      <span className={styles.resultStatValue}>{resultData.data.promoted_count}</span>
                      <span className={styles.resultStatLabel}>طالب تم نقله</span>
                    </div>
                  )}
                  {resultData.data.failed_count !== undefined && resultData.data.failed_count > 0 && (
                    <div className={styles.resultStat}>
                      <span className={styles.resultStatValue} style={{ color: 'var(--error-color)' }}>
                        {resultData.data.failed_count}
                      </span>
                      <span className={styles.resultStatLabel}>طالب راسب</span>
                    </div>
                  )}
                </div>
              )}

              {resultData.data?.failed_students && resultData.data.failed_students.length > 0 && (
                <div className={styles.failedStudents}>
                  <h4 className={styles.failedTitle}>الطلاب الراسبون:</h4>
                  <div className={styles.failedList}>
                    {resultData.data.failed_students.slice(0, 5).map((student, idx) => (
                      <div key={idx} className={styles.failedItem}>
                        <span className={styles.failedCode}>{student.student_code}</span>
                        <span className={styles.failedReason}>{student.reason}</span>
                      </div>
                    ))}
                    {resultData.data.failed_students.length > 5 && (
                      <p className={styles.failedMore}>
                        و {resultData.data.failed_students.length - 5} طالب آخرين...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.footer}>
              <button
                className={styles.btnPrimary}
                onClick={handleClose}
              >
                إغلاق
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
