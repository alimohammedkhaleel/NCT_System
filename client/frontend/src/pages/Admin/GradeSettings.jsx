import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import api from '../../services/apiService';
import styles from './GradeSettings.module.css';

const API_URL = '/admin/course-grade-config';

// القيم الافتراضية
const DEFAULT_CONFIG = {
  ass1_percentage: 15.00,
  ass2_percentage: 15.00,
  final_percentage: 70.00,
  ass1_max: 30.00,
  ass2_max: 30.00,
  final_max: 150.00,
  p_value: 30.00,
  m_value: 21.00,
  d_value: 15.00
};

export const GradeSettings = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const response = await api.get(API_URL);
      
      if (response.data.success) {
        setCourses(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching configs:', err);
      toast.error('فشل في تحميل إعدادات الدرجات');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setFormData({
      ass1_percentage: course.ass1_percentage,
      ass2_percentage: course.ass2_percentage,
      final_percentage: course.final_percentage,
      ass1_max: course.ass1_max,
      ass2_max: course.ass2_max,
      final_max: course.final_max,
      p_value: course.p_value,
      m_value: course.m_value,
      d_value: course.d_value
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedCourse(null);
    setFormData(DEFAULT_CONFIG);
  };

  const handleInputChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const validatePercentages = () => {
    const total = formData.ass1_percentage + formData.ass2_percentage + formData.final_percentage;
    return Math.abs(total - 100) < 0.01;
  };

  const handleSave = async () => {
    if (!validatePercentages()) {
      toast.error('مجموع النسب المئوية يجب أن يساوي 100%');
      return;
    }

    setSaving(true);
    try {
      const response = await api.put(
        `${API_URL}/${selectedCourse.course_id}`,
        formData
      );

      if (response.data.success) {
        toast.success('تم تحديث الإعدادات بنجاح');
        await fetchConfigs();
        closeEditModal();
      }
    } catch (err) {
      console.error('Error saving config:', err);
      toast.error(err.response?.data?.message || 'فشل في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async (courseId) => {
    if (!window.confirm('هل أنت متأكد من حذف الإعدادات المخصصة والعودة للقيم الافتراضية؟')) {
      return;
    }

    try {
      const response = await api.delete(`${API_URL}/${courseId}`);

      if (response.data.success) {
        toast.success('تم حذف الإعدادات المخصصة');
        await fetchConfigs();
      }
    } catch (err) {
      console.error('Error deleting config:', err);
      toast.error(err.response?.data?.message || 'فشل في حذف الإعدادات');
    }
  };

  const filteredCourses = courses.filter(course => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      course.course_code?.toLowerCase().includes(search) ||
      course.course_name?.toLowerCase().includes(search) ||
      course.arabic_name?.toLowerCase().includes(search) ||
      course.specialty_name?.toLowerCase().includes(search)
    );
  });

  const calculateTotalPercentage = () => {
    return formData.ass1_percentage + formData.ass2_percentage + formData.final_percentage;
  };

  const isPercentageValid = () => {
    const total = calculateTotalPercentage();
    return Math.abs(total - 100) < 0.01;
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`${API_URL}/export`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `grade-configs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('تم تصدير الإعدادات بنجاح');
    } catch (err) {
      console.error('Error exporting configs:', err);
      toast.error(err.response?.data?.message || 'فشل في تصدير الإعدادات');
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      const response = await api.post(`${API_URL}/import`, jsonData, {
        headers: { 
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        toast.success(`تم استيراد ${response.data.imported} إعدادات بنجاح`);
        await fetchConfigs();
      }
    } catch (err) {
      console.error('Error importing configs:', err);
      if (err.name === 'SyntaxError') {
        toast.error('ملف JSON غير صالح');
      } else {
        toast.error(err.response?.data?.message || 'فشل في استيراد الإعدادات');
      }
    }
    
    // Reset file input
    event.target.value = '';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>إعدادات الدرجات</h1>
          <p className={styles.subtitle}>
            إدارة إعدادات الدرجات لكل مادة على حدة
          </p>
        </div>
        <div className={styles.headerActions}>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
            id="import-file-input"
          />
          <label htmlFor="import-file-input" className={styles.importBtn}>
            استيراد من JSON
          </label>
          <button className={styles.exportBtn} onClick={handleExport}>
            تصدير إلى JSON
          </button>
        </div>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="ابحث عن مادة (الكود، الاسم، التخصص)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>إجمالي المواد:</span>
              <span className={styles.statValue}>{courses.length}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>المواد المعروضة:</span>
              <span className={styles.statValue}>{filteredCourses.length}</span>
            </div>
          </div>

          <div className={styles.coursesGrid}>
            {filteredCourses.map(course => (
              <div key={course.course_id} className={styles.courseCard}>
                <div className={styles.courseHeader}>
                  <div>
                    <h3 className={styles.courseCode}>{course.course_code}</h3>
                    <p className={styles.courseName}>{course.arabic_name || course.course_name}</p>
                    <p className={styles.courseSpecialty}>{course.specialty_name}</p>
                  </div>
                </div>

                <div className={styles.configSummary}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>النسب المئوية:</span>
                    <span className={styles.summaryValue}>
                      {course.ass1_percentage}% / {course.ass2_percentage}% / {course.final_percentage}%
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>الدرجات القصوى:</span>
                    <span className={styles.summaryValue}>
                      {course.ass1_max} / {course.ass2_max} / {course.final_max}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>قيم P/M/D:</span>
                    <span className={styles.summaryValue}>
                      {course.p_value} / {course.m_value} / {course.d_value}
                    </span>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => openEditModal(course)}
                  >
                    تعديل الإعدادات
                  </button>
                  <button
                    className={styles.resetBtn}
                    onClick={() => handleResetToDefault(course.course_id)}
                  >
                    إعادة تعيين
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className={styles.emptyState}>
              <p>لا توجد مواد تطابق البحث</p>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        title={`تعديل إعدادات: ${selectedCourse?.arabic_name || selectedCourse?.course_name}`}
      >
        <div className={styles.modalContent}>
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>النسب المئوية</h4>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>نسبة الواجب الأول (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.ass1_percentage}
                  onChange={(e) => handleInputChange('ass1_percentage', e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>نسبة الواجب الثاني (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.ass2_percentage}
                  onChange={(e) => handleInputChange('ass2_percentage', e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>نسبة الامتحان النهائي (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.final_percentage}
                  onChange={(e) => handleInputChange('final_percentage', e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
            <div className={`${styles.percentageTotal} ${isPercentageValid() ? styles.valid : styles.invalid}`}>
              المجموع: {calculateTotalPercentage().toFixed(2)}%
              {!isPercentageValid() && <span className={styles.error}> (يجب أن يساوي 100%)</span>}
            </div>
          </div>

          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>الدرجات القصوى</h4>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>الدرجة القصوى للواجب الأول</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.ass1_max}
                  onChange={(e) => handleInputChange('ass1_max', e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>الدرجة القصوى للواجب الثاني</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.ass2_max}
                  onChange={(e) => handleInputChange('ass2_max', e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>الدرجة القصوى للامتحان النهائي</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.final_max}
                  onChange={(e) => handleInputChange('final_max', e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>قيم التقديرات (P/M/D)</h4>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>قيمة Pass (P)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.p_value}
                  onChange={(e) => handleInputChange('p_value', e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>قيمة Merit (M)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.m_value}
                  onChange={(e) => handleInputChange('m_value', e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>قيمة Distinction (D)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.d_value}
                  onChange={(e) => handleInputChange('d_value', e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          <div className={styles.previewSection}>
            <h4 className={styles.sectionTitle}>معاينة تحويل P/M/D إلى درجات</h4>
            <div className={styles.previewGrid}>
              <div className={styles.previewItem}>
                <span className={styles.previewGrade}>P (Pass)</span>
                <span className={styles.previewArrow}>→</span>
                <span className={styles.previewScore}>{formData.p_value} نقطة</span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewGrade}>M (Merit)</span>
                <span className={styles.previewArrow}>→</span>
                <span className={styles.previewScore}>{formData.m_value} نقطة</span>
              </div>
              <div className={styles.previewItem}>
                <span className={styles.previewGrade}>D (Distinction)</span>
                <span className={styles.previewArrow}>→</span>
                <span className={styles.previewScore}>{formData.d_value} نقطة</span>
              </div>
            </div>
            <div className={styles.previewExample}>
              <p className={styles.exampleTitle}>مثال على الحساب:</p>
              <p className={styles.exampleText}>
                طالب حصل على: Assignment 1 = P ({formData.p_value}), Assignment 2 = M ({formData.m_value}), Final = 120
              </p>
              <p className={styles.exampleText}>
                المجموع = {formData.p_value} + {formData.m_value} + 120 = {formData.p_value + formData.m_value + 120}
              </p>
              <p className={styles.exampleText}>
                النسبة المئوية = ({formData.p_value + formData.m_value + 120} / {formData.ass1_max + formData.ass2_max + formData.final_max}) × 100 
                = {(((formData.p_value + formData.m_value + 120) / (formData.ass1_max + formData.ass2_max + formData.final_max)) * 100).toFixed(2)}%
              </p>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              className={styles.cancelBtn}
              onClick={closeEditModal}
              disabled={saving}
            >
              إلغاء
            </button>
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={saving || !isPercentageValid()}
            >
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GradeSettings;
